import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { deckSourcePath, ensureDeckStorage, ensureStorageDirs } from "../../../lib/storage";
import { enqueueJob } from "../../../lib/jobs/queue";
import { SourceType, DeckStatus, ProcessingMode, JobType } from "@prisma/client";
import { assertWithinConcurrencyLimit } from "../../../lib/jobs/concurrency";
import {
  getDefaultProcessingMode,
  getDefaultOpenAIModel,
  getDefaultTTSModel,
  getDefaultVoiceSelection,
  getElevenLabsModelAllowlist,
  getElevenLabsVoices,
  getOpenAIModelAllowlist,
  getSoftLimits,
} from "../../../lib/settings";
import { createNotification } from "../../../lib/jobs/lifecycle";
import { buildDeckSummary } from "../../../lib/decks";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decks = await prisma.deck.findMany({
    where: { ownerId: user.id },
    include: {
      slides: {
        include: {
          script: true,
          audioAsset: true,
          videoAsset: true,
        },
        orderBy: { index: "asc" },
      },
      audioAssets: true,
      videoAssets: true,
      jobs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ decks: decks.map(buildDeckSummary) });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get("file");
  const requestedMode = (formData.get("mode") as string) ?? undefined;
  const requestedModel = (formData.get("model") as string) ?? undefined;
  const title = (formData.get("title") as string) ?? undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File missing" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "pptx";
  const sourceType = ext === "pdf" ? SourceType.PDF : SourceType.PPTX;
  const { maxFileSizeMB } = await getSoftLimits();
  const defaultMode = await getDefaultProcessingMode();
  const defaultScriptModel = await getDefaultOpenAIModel();
  const defaultTTSModel = await getDefaultTTSModel();

  const chosenMode = (() => {
    if (requestedMode && requestedMode in ProcessingMode) {
      return ProcessingMode[requestedMode as keyof typeof ProcessingMode];
    }
    return defaultMode;
  })();

  const warnings: string[] = [];
  const allowedModels = await getOpenAIModelAllowlist();
  const scriptModel =
    requestedModel && allowedModels.includes(requestedModel) ? requestedModel : defaultScriptModel;
  const allowedTtsModels = await getElevenLabsModelAllowlist();
  const requestedTtsModel = (formData.get("ttsModel") as string) ?? undefined;
  const ttsModel =
    requestedTtsModel && allowedTtsModels.includes(requestedTtsModel) ? requestedTtsModel : defaultTTSModel;
  const requestedVoiceId = (formData.get("voiceId") as string) ?? undefined;
  const voices = await getElevenLabsVoices();
  const defaultVoice = await getDefaultVoiceSelection();
  const selectedVoice =
    (requestedVoiceId ? voices.find((voice) => voice.id === requestedVoiceId) : undefined) ?? defaultVoice;

  if (maxFileSizeMB && maxFileSizeMB > 0) {
    const sizeMB = buffer.length / (1024 * 1024);
    if (sizeMB > maxFileSizeMB) {
      warnings.push(
        `Uploaded file is ${sizeMB.toFixed(1)} MB which exceeds the soft limit of ${maxFileSizeMB} MB. Processing may take longer.`,
      );
    }
  }

  ensureStorageDirs();

  try {
    await assertWithinConcurrencyLimit(user.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Concurrency limit reached" },
      { status: 429 },
    );
  }

  const deck = await prisma.deck.create({
    data: {
      title: title ?? file.name,
      ownerId: user.id,
      sourcePath: "", // placeholder update after write
      sourceType,
      scriptModel,
      ttsModel,
      voiceId: selectedVoice?.id ?? null,
      voiceLabel: selectedVoice?.name ?? null,
      voiceSettings: (selectedVoice?.settings as Prisma.JsonValue) ?? undefined,
      mode: chosenMode,
      status: DeckStatus.INGESTING,
      warnings,
    },
  });

  ensureDeckStorage(deck.id);

  const sourcePath = deckSourcePath(deck.id, file.name);
  await fs.promises.writeFile(sourcePath, buffer);

  await prisma.deck.update({
    where: { id: deck.id },
    data: { sourcePath },
  });

  if (warnings.length) {
    await prisma.deck.update({
      where: { id: deck.id },
      data: { warnings },
    });
    await createNotification(
      user.id,
      "Large upload queued",
      warnings[0],
    );
  }

  const jobRecord = await prisma.job.create({
    data: {
      deckId: deck.id,
      ownerId: user.id,
      type: JobType.INGEST_DECK,
      status: "QUEUED",
      payload: {},
    },
  });

  await enqueueJob("ingest-deck", { deckId: deck.id, userId: user.id, jobId: jobRecord.id });

  return NextResponse.json({ deckId: deck.id, warnings }, { status: 201 });
}
