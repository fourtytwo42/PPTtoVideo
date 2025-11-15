import fs from "node:fs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { deckId: string; slideId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slide = await prisma.slide.findFirst({
    where: { id: params.slideId, deckId: params.deckId, deck: { ownerId: user.id } },
    include: { audioAsset: true, deck: true },
  });

  if (!slide?.audioAsset?.filePath) {
    return NextResponse.json({ error: "Audio not available" }, { status: 404 });
  }

  let file: Buffer;
  try {
    file = await fs.promises.readFile(slide.audioAsset.filePath);
  } catch {
    return NextResponse.json({ error: "Audio file missing" }, { status: 404 });
  }

  return new NextResponse(file as unknown as BodyInit, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${slide.deck.title.replace(/[^a-z0-9-_]+/gi, "_")}-slide-${slide.index}.mp3"`,
    },
  });
}
