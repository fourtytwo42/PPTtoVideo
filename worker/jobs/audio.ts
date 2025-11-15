import fs from "node:fs";
import { Job } from "bullmq";
import fetch from "node-fetch";
import { prisma } from "../../lib/prisma";
import type { BaseJobPayload } from "../../lib/jobs/queue";
import { enqueueJob } from "../../lib/jobs/queue";
import {
  createNotification,
  markJobFailed,
  markJobProgress,
  markJobRunning,
  markJobSucceeded,
} from "../../lib/jobs/lifecycle";
import { AssetStatus, DeckStatus, ProcessingMode, JobType, JobStatus } from "@prisma/client";
import { slideAudioPath } from "../../lib/storage";
import { probeDuration } from "../../lib/media";
import { clearOutOfOrder, setOutOfOrder } from "../../lib/system";
import { getDefaultTTSModel, getDefaultVoice } from "../../lib/settings";

export async function registerAudioProcessor(job: Job<BaseJobPayload>) {
  if (!process.env.ELEVENLABS_API_KEY) {
    await setOutOfOrder("elevenlabs", "ElevenLabs API key is not configured");
    await markJobFailed(job.data.jobId, "ELEVENLABS_API_KEY is not configured");
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const { jobId, deckId, userId } = job.data;
  await markJobRunning(jobId);

  const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });
  const payload = (jobRecord?.payload as { slideIds?: string[] } | null) ?? null;
  const requestedSlideIds = job.data.slideIds ?? payload?.slideIds ?? undefined;
  const normalizedSlideIds = requestedSlideIds?.filter((value, index, self) => self.indexOf(value) === index);

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { slides: { include: { script: true, audioAsset: true } } },
  });

  if (!deck) {
    await markJobFailed(jobId, "Deck not found");
    throw new Error("Deck not found");
  }

  const slidesToProcess = normalizedSlideIds?.length
    ? deck.slides.filter((slide) => normalizedSlideIds.includes(slide.id))
    : deck.slides;

  if (!slidesToProcess.length) {
    await markJobFailed(jobId, "No slides matched the requested selection");
    throw new Error("No slides matched the requested selection");
  }

  const voiceId = (await getSetting("tts:voiceId")) ?? (await getDefaultVoice());
  const modelId = (await getSetting("tts:modelId")) ?? (await getDefaultTTSModel());

  try {
    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.GENERATING } });

    const totalSlides = Math.max(slidesToProcess.filter((slide) => Boolean(slide.script)).length, 1);
    let processed = 0;
    for (const slide of slidesToProcess) {
      if (!slide.script) continue;
      const filePath = slideAudioPath(deck.id, slide.index);
      await upsertAudioAsset(slide.id, deck.id, filePath, AssetStatus.PROCESSING);

      const payload = {
        text: slide.script.content,
        voice_settings: { stability: 0.4, similarity_boost: 0.7 },
      };

      let response: Response;
      try {
        response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
            "X-Voice-Id": voiceId,
            "X-Model-Id": modelId,
          },
          body: JSON.stringify(payload),
        });
      } catch (networkError) {
        await upsertAudioAsset(slide.id, deck.id, filePath, AssetStatus.FAILED);
        await setOutOfOrder("elevenlabs", formatError(networkError));
        throw networkError;
      }

      if (!response.ok) {
        const message = await response.text();
        await upsertAudioAsset(slide.id, deck.id, filePath, AssetStatus.FAILED);
        await setOutOfOrder(
          "elevenlabs",
          `ElevenLabs responded with ${response.status}: ${truncate(message)}`,
        );
        throw new Error(`ElevenLabs request failed: ${message}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.promises.writeFile(filePath, buffer);

      const duration = await probeDuration(filePath);

      await upsertAudioAsset(slide.id, deck.id, filePath, AssetStatus.READY, duration ?? undefined);

      processed += 1;
      await markJobProgress(jobId, processed, totalSlides);
    }

    await markJobSucceeded(jobId);
    await clearOutOfOrder("elevenlabs");
    await createNotification(
      userId,
      "Audio generated",
      `${processed} voice track${processed === 1 ? "" : "s"} ready for ${deck.title}.`,
    );

    if (deck.mode === ProcessingMode.ONE_SHOT) {
      const videoJob = await prisma.job.create({
        data: {
          deckId: deck.id,
          ownerId: userId,
          type: JobType.GENERATE_VIDEO,
          status: JobStatus.QUEUED,
          payload: { trigger: "auto", ...(normalizedSlideIds?.length ? { slideIds: normalizedSlideIds } : {}) },
        },
      });
      await enqueueJob("generate-video", {
        deckId: deck.id,
        userId,
        jobId: videoJob.id,
        slideIds: normalizedSlideIds,
      });
    }
  } catch (error) {
    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.FAILED } });
    await markJobFailed(jobId, error);
    await createNotification(userId, "Audio generation failed", formatError(error));
    throw error;
  }
}

async function upsertAudioAsset(
  slideId: string,
  deckId: string,
  filePath: string,
  status: AssetStatus,
  duration?: number,
) {
  await prisma.audioAsset.upsert({
    where: { slideId },
    update: { filePath, status, ...(duration !== undefined ? { duration } : {}) },
    create: { slideId, deckId, filePath, status, ...(duration !== undefined ? { duration } : {}) },
  });
}

async function getSetting(key: string) {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value as string | undefined;
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

function truncate(text: string, max = 200) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
