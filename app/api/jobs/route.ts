import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

function parseIds(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const ids = value.filter((candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0);
    return ids.length ? Array.from(new Set(ids)) : undefined;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return undefined;
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  if (request.body !== null) {
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }
  }

  const jobIds = parseIds(payload.jobIds);
  const deckId = typeof payload.deckId === "string" && payload.deckId.trim().length ? payload.deckId.trim() : undefined;
  const deleteAll = payload.all === true;

  if (!jobIds?.length && !deckId && !deleteAll) {
    return NextResponse.json(
      { error: "Provide jobIds, deckId, or set all: true to delete job activity." },
      { status: 400 },
    );
  }

  const where: Prisma.JobWhereInput = { ownerId: user.id };
  if (jobIds?.length) {
    where.id = { in: jobIds };
  } else if (deckId) {
    where.deckId = deckId;
  }

  const result = await prisma.job.deleteMany({ where });
  return NextResponse.json({ ok: true, deleted: result.count });
}


