import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "../../../../lib/prisma";
import { enqueueJob } from "../../../../lib/jobs/queue";
import { getCurrentUser } from "../../../../lib/auth";
import { JobType } from "@prisma/client";
import { assertWithinConcurrencyLimit } from "../../../../lib/jobs/concurrency";
import { buildWorkspaceDeck } from "../../../../lib/decks";
import { getElevenLabsModelAllowlist, getOpenAIModelAllowlist, findVoiceById } from "../../../../lib/settings";

function parseSlideIds(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const ids = value.filter((candidate): candidate is string => typeof candidate === "string" && candidate.length > 0);
    return ids.length ? Array.from(new Set(ids)) : undefined;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }
  return undefined;
}

export async function GET(_: NextRequest, { params }: { params: { deckId: string } }) {
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

  return NextResponse.json({ deck: buildWorkspaceDeck(deck) });
}

export async function POST(request: NextRequest, { params }: { params: { deckId: string } }) {
  const body = await request.json();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deck = await prisma.deck.findFirst({ where: { id: params.deckId, ownerId: user.id } });
  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const requestedSlideIds = parseSlideIds(body.slideIds);
  let slideIds: string[] | undefined = undefined;
  if (requestedSlideIds?.length) {
    const matches = await prisma.slide.findMany({
      where: { deckId: params.deckId, id: { in: requestedSlideIds } },
      select: { id: true },
    });
    if (matches.length !== requestedSlideIds.length) {
      return NextResponse.json({ error: "One or more slides could not be found" }, { status: 400 });
    }
    slideIds = matches.map((match) => match.id);
  }

  if (body.action === "generate" && body.target === "audio") {
    try {
      await assertWithinConcurrencyLimit(user.id);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Concurrency limit reached" },
        { status: 429 },
      );
    }
    const jobRecord = await prisma.job.create({
      data: {
        deckId: params.deckId,
        ownerId: user.id,
        type: JobType.GENERATE_AUDIO,
        status: "QUEUED",
        payload: slideIds?.length ? { slideIds } : {},
      },
    });
    await enqueueJob("generate-audio", {
      deckId: params.deckId,
      userId: user.id,
      jobId: jobRecord.id,
      slideIds,
    });
  }

  if (body.action === "generate" && body.target === "video") {
    try {
      await assertWithinConcurrencyLimit(user.id);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Concurrency limit reached" },
        { status: 429 },
      );
    }
    const jobRecord = await prisma.job.create({
      data: {
        deckId: params.deckId,
        ownerId: user.id,
        type: JobType.GENERATE_VIDEO,
        status: "QUEUED",
        payload: slideIds?.length ? { slideIds } : {},
      },
    });
    await enqueueJob("generate-video", {
      deckId: params.deckId,
      userId: user.id,
      jobId: jobRecord.id,
      slideIds,
    });
  }

  if (body.action === "generate" && body.target === "final") {
    try {
      await assertWithinConcurrencyLimit(user.id);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Concurrency limit reached" },
        { status: 429 },
      );
    }
    const jobRecord = await prisma.job.create({
      data: { deckId: params.deckId, ownerId: user.id, type: JobType.ASSEMBLE_FINAL, status: "QUEUED", payload: {} },
    });
    await enqueueJob("assemble-final", { deckId: params.deckId, userId: user.id, jobId: jobRecord.id });
  }

  if (body.action === "generate" && body.target === "scripts") {
    try {
      await assertWithinConcurrencyLimit(user.id);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Concurrency limit reached" },
        { status: 429 },
      );
    }
    const jobRecord = await prisma.job.create({
      data: {
        deckId: params.deckId,
        ownerId: user.id,
        type: JobType.GENERATE_SCRIPTS,
        status: "QUEUED",
        payload: slideIds?.length ? { slideIds } : {},
      },
    });
    await enqueueJob("generate-scripts", {
      deckId: params.deckId,
      userId: user.id,
      jobId: jobRecord.id,
      slideIds,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { deckId: string } }) {
  const body = await request.json();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deck = await prisma.deck.findFirst({ where: { id: params.deckId, ownerId: user.id } });
  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const updates: Prisma.DeckUpdateInput = {};

  if (typeof body.scriptModel === "string") {
    const allowlist = await getOpenAIModelAllowlist();
    if (!allowlist.includes(body.scriptModel)) {
      return NextResponse.json({ error: "Script model not allowed" }, { status: 400 });
    }
    updates.scriptModel = body.scriptModel;
  }

  if (typeof body.ttsModel === "string") {
    const allowlist = await getElevenLabsModelAllowlist();
    if (!allowlist.includes(body.ttsModel)) {
      return NextResponse.json({ error: "TTS model not allowed" }, { status: 400 });
    }
    updates.ttsModel = body.ttsModel;
  }

  if (typeof body.voiceId === "string") {
    const voice = await findVoiceById(body.voiceId);
    if (!voice) {
      return NextResponse.json({ error: "Voice not found" }, { status: 400 });
    }
    updates.voiceId = voice.id;
    updates.voiceLabel = voice.name;
    if (voice.settings) {
      updates.voiceSettings = voice.settings as Prisma.InputJsonValue;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  await prisma.deck.update({ where: { id: deck.id }, data: updates });
  return NextResponse.json({ ok: true });
}

