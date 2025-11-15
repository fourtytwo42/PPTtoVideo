import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildDeckSummary } from "@/lib/decks";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deckRecords = await prisma.deck.findMany({
    where: { ownerId: user.id },
    include: {
      slides: { include: { script: true, audioAsset: true, videoAsset: true } },
      audioAssets: true,
      videoAssets: true,
      jobs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const jobs = await prisma.job.findMany({
    where: {
      ownerId: user.id,
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    include: { deck: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const decks = deckRecords.map(buildDeckSummary);

  const outOfOrderSetting = await prisma.systemSetting.findUnique({ where: { key: "system:out_of_order" } });
  const healthValue = outOfOrderSetting?.value as { active?: boolean; message?: string } | undefined;

  return NextResponse.json({
    decks,
    jobs: jobs.map((job) => ({
      id: job.id,
      deckId: job.deckId,
      deckTitle: job.deck?.title ?? "Deck",
      type: job.type,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    })),
    health: {
      outOfOrder: Boolean(healthValue?.active),
      message: healthValue?.message ?? null,
    },
  });
}

