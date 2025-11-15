import fs from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { deckId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await prisma.deck.findFirst({
    where: { id: params.deckId, ownerId: user.id },
  });

  if (!deck || !deck.finalVideoPath) {
    return NextResponse.json({ error: "Final video not available" }, { status: 404 });
  }

  try {
    await fs.promises.access(deck.finalVideoPath, fs.constants.R_OK);
  } catch {
    return NextResponse.json({ error: "Final video missing on disk" }, { status: 404 });
  }

  const stream = Readable.toWeb(fs.createReadStream(deck.finalVideoPath)) as unknown as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${deck.title.replace(/[^a-z0-9-_]+/gi, "_")}.mp4"`,
    },
  });
}
