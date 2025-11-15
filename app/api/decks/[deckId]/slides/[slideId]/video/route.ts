import fs from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../../lib/auth";

export async function GET(_: Request, { params }: { params: { deckId: string; slideId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slide = await prisma.slide.findFirst({
    where: { id: params.slideId, deckId: params.deckId, deck: { ownerId: user.id } },
    include: { videoAsset: true, deck: true },
  });

  if (!slide?.videoAsset?.filePath) {
    return NextResponse.json({ error: "Video not available" }, { status: 404 });
  }

  try {
    await fs.promises.access(slide.videoAsset.filePath, fs.constants.R_OK);
  } catch {
    return NextResponse.json({ error: "Video file missing" }, { status: 404 });
  }

  const stream = Readable.toWeb(fs.createReadStream(slide.videoAsset.filePath));
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${slide.deck.title.replace(/[^a-z0-9-_]+/gi, "_")}-slide-${slide.index}.mp4"`,
    },
  });
}
