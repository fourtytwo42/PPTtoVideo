import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";
import { buildWorkspaceDeck } from "../../../../../lib/decks";

export async function GET(_: Request, { params }: { params: { deckId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await prisma.deck.findFirst({
    where: { id: params.deckId, ownerId: user.id },
    include: {
      slides: {
        include: { script: true, audioAsset: true, videoAsset: true },
        orderBy: { index: "asc" },
      },
      audioAssets: true,
      videoAssets: true,
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const payload = buildWorkspaceDeck(deck);
  const jobs = await prisma.job.findMany({
    where: { deckId: deck.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    deck: payload,
    jobs: jobs.map((job) => ({
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    })),
  });
}
