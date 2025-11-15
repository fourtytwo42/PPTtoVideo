import { Job } from "bullmq";
import { prisma } from "../../lib/prisma";
import type { BaseJobPayload } from "../../lib/jobs/queue";
import { enqueueJob } from "../../lib/jobs/queue";
import { slideVideoPath, slideImagePath, slideAudioPath } from "../../lib/storage";
import {
  createNotification,
  markJobFailed,
  markJobProgress,
  markJobRunning,
  markJobSucceeded,
} from "../../lib/jobs/lifecycle";
import { AssetStatus, DeckStatus, ProcessingMode, JobType, JobStatus } from "@prisma/client";
import { runCommand } from "../../lib/cli";
import { probeDuration } from "../../lib/media";

export async function registerVideoProcessor(job: Job<BaseJobPayload>) {
  const { jobId, deckId, userId } = job.data;
  await markJobRunning(jobId);

  const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });
  const payload = (jobRecord?.payload as { slideIds?: string[] } | null) ?? null;
  const requestedSlideIds = job.data.slideIds ?? payload?.slideIds ?? undefined;
  const normalizedSlideIds = requestedSlideIds?.filter((value, index, self) => self.indexOf(value) === index);

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { slides: true },
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

  try {
    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.GENERATING } });

    const totalSlides = Math.max(slidesToProcess.length, 1);
    let processed = 0;
    for (const slide of slidesToProcess) {
      const image = slideImagePath(deck.id, slide.index);
      const audio = slideAudioPath(deck.id, slide.index);
      const video = slideVideoPath(deck.id, slide.index);

      await prisma.videoAsset.upsert({
        where: { slideId: slide.id },
        update: { filePath: video, status: AssetStatus.PROCESSING },
        create: { slideId: slide.id, deckId: deck.id, filePath: video, status: AssetStatus.PROCESSING },
      });

      const args = [
        "-loop",
        "1",
        "-i",
        image,
        "-i",
        audio,
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        video,
      ];

      await runCommand(process.env.FFMPEG_PATH ?? "ffmpeg", args);

      const duration = await probeDuration(video);

      await prisma.videoAsset.update({
        where: { slideId: slide.id },
        data: { status: AssetStatus.READY, duration: duration ?? undefined },
      });

      processed += 1;
      await markJobProgress(jobId, processed, totalSlides);
    }

    await markJobSucceeded(jobId);
    await createNotification(
      userId,
      "Slide videos rendered",
      `${processed} clip${processed === 1 ? "" : "s"} generated for ${deck.title}.`,
    );

    if (deck.mode === ProcessingMode.ONE_SHOT) {
      const assembleJob = await prisma.job.create({
        data: {
          deckId: deck.id,
          ownerId: userId,
          type: JobType.ASSEMBLE_FINAL,
          status: JobStatus.QUEUED,
          payload: { trigger: "auto" },
        },
      });
      await enqueueJob("assemble-final", { deckId: deck.id, userId, jobId: assembleJob.id });
    }
  } catch (error) {
    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.FAILED } });
    await markJobFailed(jobId, error);
    await createNotification(userId, "Slide rendering failed", formatError(error));
    throw error;
  }
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}
