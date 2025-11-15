import { Job } from "bullmq";
import path from "node:path";
import fs from "node:fs";
import { prisma } from "../../lib/prisma";
import type { BaseJobPayload } from "../../lib/jobs/queue";
import {
  createNotification,
  markJobFailed,
  markJobRunning,
  markJobSucceeded,
} from "../../lib/jobs/lifecycle";
import { finalVideoPath, ensureDeckStorage } from "../../lib/storage";
import { runCommand } from "../../lib/cli";
import { AssetStatus, DeckStatus } from "@prisma/client";
import { probeDuration } from "../../lib/media";

export async function registerAssemblerProcessor(job: Job<BaseJobPayload>) {
  const { jobId, deckId, userId } = job.data;
  await markJobRunning(jobId);

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { slides: { orderBy: { index: "asc" }, select: { videoAsset: true, index: true } } },
  });

  if (!deck) {
    await markJobFailed(jobId, "Deck not found");
    throw new Error("Deck not found");
  }

  ensureDeckStorage(deck.id);

  let tmpFile: string | null = null;
  try {
    const readyClips = deck.slides.filter(
      (slide) => slide.videoAsset?.status === AssetStatus.READY && slide.videoAsset?.filePath,
    );

    if (!readyClips.length) {
      throw new Error("No rendered slide videos available to assemble");
    }

    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.GENERATING } });

    const concatFile = readyClips.map((slide) => `file '${slide.videoAsset?.filePath}'`).join("\n");

    if (!concatFile.trim()) {
      throw new Error("Rendered video list is empty");
    }

    tmpFile = path.join(process.cwd(), `.concat-${deck.id}.txt`);
    await fs.promises.writeFile(tmpFile, concatFile, "utf8");

    const finalPath = finalVideoPath(deck.id);
    await fs.promises.rm(finalPath, { force: true }).catch(() => undefined);
    await runCommand(process.env.FFMPEG_PATH ?? "ffmpeg", ["-f", "concat", "-safe", "0", "-i", tmpFile, "-c", "copy", finalPath]);

    const duration = await probeDuration(finalPath);

    await prisma.deck.update({
      where: { id: deck.id },
      data: { finalVideoPath: finalPath, finalVideoDuration: duration ?? undefined, status: DeckStatus.COMPLETE },
    });

    await markJobSucceeded(jobId);
    await createNotification(userId, "Final video ready", `${deck.title} has been assembled.`);
  } catch (error) {
    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.FAILED } });
    await markJobFailed(jobId, error);
    await createNotification(userId, "Final assembly failed", formatError(error));
    throw error;
  } finally {
    if (tmpFile) {
      await fs.promises.unlink(tmpFile).catch(() => undefined);
    }
  }
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}
