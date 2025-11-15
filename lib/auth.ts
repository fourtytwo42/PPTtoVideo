import { getServerSession } from "next-auth/next";
import { prisma } from "./prisma";
import { authOptions } from "./auth-options";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return prisma.user.findUnique({ where: { id: session.user.id } });
}
