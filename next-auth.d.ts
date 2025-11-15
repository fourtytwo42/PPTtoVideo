import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }

  type NextAuthOptions = import("next-auth/core/types").AuthOptions;
  type AuthOptions = import("next-auth/core/types").AuthOptions;
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
