import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(_: Request, { params }: { params: { deckId: string; slideId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slide = await prisma.slide.findFirst({
    where: { id: params.slideId, deckId: params.deckId, deck: { ownerId: user.id } },
    include: { deck: true },
  });

  if (!slide?.imagePath) {
    return NextResponse.json({ error: "Slide image not available" }, { status: 404 });
  }

  let file: Buffer;
  try {
    file = await fs.promises.readFile(slide.imagePath);
  } catch {
    return NextResponse.json({ error: "Slide image missing on disk" }, { status: 404 });
  }

  const ext = path.extname(slide.imagePath).toLowerCase();
  const contentType = MIME_MAP[ext] ?? "image/png";

  return new NextResponse(file as unknown as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${slide.deck.title
        .replace(/[^a-z0-9-_]+/gi, "_")
        .slice(0, 80)}-slide-${slide.index}${ext || ".png"}"`,
    },
  });
}

