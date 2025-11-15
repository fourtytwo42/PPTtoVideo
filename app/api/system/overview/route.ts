import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const jobs = await prisma.job.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const outOfOrderSetting = await prisma.systemSetting.findUnique({ where: { key: "system:out_of_order" } });
  const health = outOfOrderSetting?.value as { active: boolean; message?: string } | undefined;

  return NextResponse.json({
    health: {
      outOfOrder: health?.active ?? false,
      message: health?.message ?? null,
    },
    notifications,
    jobs,
  });
}
