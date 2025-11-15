import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";

type CallbackHandlers = NonNullable<NextAuthOptions["callbacks"]>;
type JWTCallbackParams = Parameters<NonNullable<CallbackHandlers["jwt"]>>[0];
type SessionCallbackParams = Parameters<NonNullable<CallbackHandlers["session"]>>[0];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const email = credentials.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
          return null;
        }
        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) {
          return null;
        }
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: JWTCallbackParams) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }: SessionCallbackParams) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.role) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
};
