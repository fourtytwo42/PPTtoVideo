import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "../../../../../../lib/auth";
import { ScriptStatus } from "@prisma/client";

export async function PATCH(request: NextRequest, { params }: { params: { deckId: string; slideId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  const slide = await prisma.slide.findFirst({
    where: { id: params.slideId, deckId: params.deckId, deck: { ownerId: user.id } },
    include: { script: true },
  });

  if (!slide) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  await prisma.script.update({
    where: { id: slide.script!.id },
    data: { content: body.content, status: ScriptStatus.READY },
  });

  return NextResponse.json({ ok: true });
}
