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
import { ScriptStatus, DeckStatus, ProcessingMode, JobType, JobStatus } from "@prisma/client";
import { clearOutOfOrder, setOutOfOrder } from "../../lib/system";
import { getDefaultOpenAIModel } from "../../lib/settings";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";

export async function registerScriptProcessor(job: Job<BaseJobPayload>) {
  if (!process.env.OPENAI_API_KEY) {
    await setOutOfOrder("openai", "OpenAI API key is not configured");
    await markJobFailed(job.data.jobId, "OPENAI_API_KEY is not configured");
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const { jobId, deckId, userId } = job.data;
  await markJobRunning(jobId);

  const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });
  const payload = (jobRecord?.payload as { slideIds?: string[] } | null) ?? null;
  const requestedSlideIds = job.data.slideIds ?? payload?.slideIds ?? undefined;
  const normalizedSlideIds = requestedSlideIds?.filter((value, index, self) => self.indexOf(value) === index);

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { slides: { include: { script: true } } },
  });

  if (!deck) {
    await markJobFailed(jobId, `Deck ${deckId} not found`);
    throw new Error(`Deck ${deckId} not found`);
  }

  const slidesToProcess = normalizedSlideIds?.length
    ? deck.slides.filter((slide) => normalizedSlideIds.includes(slide.id))
    : deck.slides;

  if (!slidesToProcess.length) {
    await markJobFailed(jobId, "No slides matched the requested selection");
    throw new Error("No slides matched the requested selection");
  }

  const model = (await getSetting("openai:model")) ?? (await getDefaultOpenAIModel());
  const systemPrompt = (await getSetting("openai:systemPrompt")) ??
    "You are a helpful narration writer that rewrites slide content into a natural script.";

  try {
    await prisma.deck.update({
      where: { id: deck.id },
      data: { status: DeckStatus.GENERATING },
    });

    const totalSlides = Math.max(slidesToProcess.filter((slide) => Boolean(slide.script)).length, 1);
    let processed = 0;
    for (const slide of slidesToProcess) {
      if (!slide.script) continue;
      await prisma.script.update({
        where: { id: slide.script.id },
        data: { status: ScriptStatus.REGENERATING },
      });

      const prompt = buildPrompt(deck, slide);
      let response: Response;
      try {
        response = await fetch(OPENAI_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            input: prompt,
            system: systemPrompt,
            max_output_tokens: 600,
          }),
        });
      } catch (networkError) {
        await prisma.script.update({
          where: { id: slide.script.id },
          data: { status: ScriptStatus.FAILED },
        });
        await setOutOfOrder("openai", formatError(networkError));
        throw networkError;
      }

      if (!response.ok) {
        const message = await response.text();
        await prisma.script.update({
          where: { id: slide.script.id },
          data: { status: ScriptStatus.FAILED },
        });
        await setOutOfOrder(
          "openai",
          `OpenAI responded with ${response.status}: ${truncate(message)}`,
        );
        throw new Error(`OpenAI request failed: ${message}`);
      }

      const data = (await response.json()) as { output: { content: { text: string }[] }[] };
      const text = data.output?.[0]?.content?.map((block) => block.text).join("\n") ?? "";

      await prisma.script.update({
        where: { id: slide.script.id },
        data: { content: text, status: ScriptStatus.READY },
      });

      processed += 1;
      await markJobProgress(jobId, processed, totalSlides);
    }

    const nextStatus = deck.mode === ProcessingMode.REVIEW ? DeckStatus.READY_FOR_REVIEW : DeckStatus.GENERATING;
    await prisma.deck.update({ where: { id: deck.id }, data: { status: nextStatus } });

    await markJobSucceeded(jobId);
    await clearOutOfOrder("openai");
    await createNotification(
      userId,
      "Scripts generated",
      `${slidesToProcess.length} slide${slidesToProcess.length === 1 ? "" : "s"} processed for ${deck.title}.`,
    );

    if (deck.mode === ProcessingMode.ONE_SHOT) {
      const audioJob = await prisma.job.create({
        data: {
          deckId: deck.id,
          ownerId: userId,
          type: JobType.GENERATE_AUDIO,
          status: JobStatus.QUEUED,
          payload: { trigger: "auto", ...(normalizedSlideIds?.length ? { slideIds: normalizedSlideIds } : {}) },
        },
      });
      await enqueueJob("generate-audio", {
        deckId: deck.id,
        userId,
        jobId: audioJob.id,
        slideIds: normalizedSlideIds,
      });
    }
  } catch (error) {
    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.FAILED } });
    await markJobFailed(jobId, error);
    await createNotification(userId, "Script generation failed", formatError(error));
    throw error;
  }
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

function truncate(text: string, max = 200) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function getSetting(key: string) {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value as string | undefined;
}

function buildPrompt(deck: any, slide: any) {
  return `Deck: ${deck.title}\nSlide ${slide.index}:\nVisible text: ${slide.body ?? ""}\nNotes: ${slide.speakerNotes ?? ""}\nWrite a narration paragraph that preserves the facts but reads naturally.`;
}
