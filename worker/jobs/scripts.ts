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
import { ScriptStatus, DeckStatus, ProcessingMode, JobType, JobStatus } from "@prisma/client";
import { clearOutOfOrder, setOutOfOrder } from "../../lib/system";
import { getDefaultOpenAIModel, getOpenAIApiKey, getOpenAIModelAllowlist, getOpenAISystemPrompt } from "../../lib/settings";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
export async function registerScriptProcessor(job: Job<BaseJobPayload>) {
  const { jobId, deckId, userId } = job.data;
  await markJobRunning(jobId);

  const jobRecord = await prisma.job.findUnique({ where: { id: jobId } });
  const payload = (jobRecord?.payload as { slideIds?: string[] } | null) ?? null;
  const requestedSlideIds = job.data.slideIds ?? payload?.slideIds ?? undefined;
  const normalizedSlideIds = requestedSlideIds?.filter((value, index, self) => self.indexOf(value) === index);

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      slides: {
        include: { script: true },
        orderBy: { index: "asc" },
      },
    },
  });

  if (!deck) {
    await markJobFailed(jobId, `Deck ${deckId} not found`);
    throw new Error(`Deck ${deckId} not found`);
  }

  const allSlides = deck.slides;
  const targetSlideIds = normalizedSlideIds?.length ? new Set(normalizedSlideIds) : null;
  const slidesToUpdate = targetSlideIds ? allSlides.filter((slide) => targetSlideIds.has(slide.id)) : allSlides;

  if (!slidesToUpdate.length) {
    await markJobFailed(jobId, "No slides matched the requested selection");
    throw new Error("No slides matched the requested selection");
  }

  const apiKey = await getOpenAIApiKey();
  if (!apiKey) {
    await setOutOfOrder("openai", "OpenAI API key is not configured");
    await markJobFailed(jobId, "OPENAI_API_KEY is not configured");
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const systemPrompt = await getOpenAISystemPrompt();
  const modelAllowlist = await getOpenAIModelAllowlist();
  const deckModel = deck.scriptModel ?? (await getDefaultOpenAIModel());
  const model = modelAllowlist.includes(deckModel) ? deckModel : modelAllowlist[0] ?? (await getDefaultOpenAIModel());

  try {
    await prisma.deck.update({
      where: { id: deck.id },
      data: { status: DeckStatus.GENERATING },
    });

    const slideContexts = await Promise.all(allSlides.map((slide) => buildSlideContext(slide)));
    const requestBody = buildOpenAIRequest({
      model,
      systemPrompt,
      contexts: slideContexts,
      rewriteAllSlides: !targetSlideIds,
      deckTitle: deck.title,
      targetIndexes: slidesToUpdate.map((slide) => slide.index),
    });

    const totalSlides = slidesToUpdate.length || 1;
    for (const slide of slidesToUpdate) {
      if (slide.script) {
        await prisma.script.update({
          where: { id: slide.script.id },
          data: { status: ScriptStatus.REGENERATING },
        });
      }
    }

    let response: Awaited<ReturnType<typeof fetch>>;
    try {
      response = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (networkError) {
      await revertScriptsToFailed(slidesToUpdate);
      await setOutOfOrder("openai", formatError(networkError));
      throw networkError;
    }

    if (!response.ok) {
      const message = await response.text();
      await revertScriptsToFailed(slidesToUpdate);
      await setOutOfOrder("openai", `OpenAI responded with ${response.status}: ${truncate(message)}`);
      throw new Error(`OpenAI request failed: ${message}`);
    }

    const scriptMap = await parseResponse(await response.json(), slidesToUpdate.map((slide) => slide.index));

    let processed = 0;
    for (const slide of slidesToUpdate) {
      if (!slide.script) {
        throw new Error(`Slide ${slide.id} is missing a script record`);
      }
      const scriptText = scriptMap.get(slide.index);
      if (!scriptText) {
        await revertScriptsToFailed([slide]);
        throw new Error(`Model response missing script for slide ${slide.index}`);
      }

      await prisma.script.update({
        where: { id: slide.script.id },
        data: { content: scriptText.trim(), status: ScriptStatus.READY },
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
      `${slidesToUpdate.length} slide${slidesToUpdate.length === 1 ? "" : "s"} processed for ${deck.title}.`,
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

async function buildSlideContext(
  slide: {
    index: number;
    title: string | null;
    body: string | null;
    speakerNotes: string | null;
    ocrText?: string | null;
    needsImageContext: boolean;
    imagePath: string | null;
  },
) {
  const segments = [slide.body, slide.speakerNotes, slide.ocrText]
    .filter((segment): segment is string => Boolean(segment && segment.trim().length))
    .map((segment) => segment.trim());

  const combinedText =
    segments.join("\n\n").trim() ||
    "No readable text was extracted from this slide. Use the accompanying image and the neighboring slides for additional context.";

  let imageBase64: string | null = null;
  if (slide.needsImageContext && slide.imagePath) {
    try {
      const buffer = await fs.promises.readFile(slide.imagePath);
      imageBase64 = buffer.toString("base64");
    } catch (error) {
      console.warn(`[scripts] Unable to attach slide image ${slide.imagePath}`, error);
    }
  }

  return {
    index: slide.index,
    title: slide.title,
    text: combinedText,
    imageBase64,
  };
}

function buildOpenAIRequest({
  model,
  systemPrompt,
  contexts,
  rewriteAllSlides,
  deckTitle,
  targetIndexes,
}: {
  model: string;
  systemPrompt: string;
  contexts: Awaited<ReturnType<typeof buildSlideContext>>[];
  rewriteAllSlides: boolean;
  deckTitle: string;
  targetIndexes: number[];
}) {
  const userContent: { type: string; [key: string]: string }[] = [
    {
      type: "input_text",
      text: `You are rewriting narration for the slide deck "${deckTitle}". ${
        rewriteAllSlides
          ? "Provide narration for every slide listed below."
          : "Return narration only for the slides listed below while using the remaining slides strictly as context."
      } Keep a professional, conversational tone and do not reference slide numbers explicitly.`,
    },
  ];

  for (const context of contexts) {
    const heading = `Slide ${context.index}${context.title ? ` (${context.title})` : ""}`;
    userContent.push({
      type: "input_text",
      text: `${heading}\n${context.text}`,
    });
    if (context.imageBase64) {
      userContent.push({
        type: "input_image",
        image_url: `data:image/png;base64,${context.imageBase64}`,
      });
    }
  }

  userContent.push({
    type: "input_text",
    text: "Respond strictly in JSON according to the required schema.",
  });

  if (!rewriteAllSlides && targetIndexes.length) {
    userContent.push({
      type: "input_text",
      text: `Only include scripts for these slide numbers: ${targetIndexes.join(", ")}.`,
    });
  }

  const maxOutputTokens = Math.max(800, contexts.length * 320);

  return {
    model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: userContent,
      },
    ],
    max_output_tokens: maxOutputTokens,
  };
}

async function parseResponse(data: any, fallbackIndexes: number[]) {
  const textBlock = data?.output
    ?.flatMap((entry: any) => entry.content || [])
    .find((block: any) => block.type === "output_text")?.text;

  if (!textBlock) {
    throw new Error("Model response did not include JSON output");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock);
  } catch (error) {
    console.warn("[scripts] Unable to parse model response text:", textBlock);
    throw new Error(`Unable to parse model response: ${String(error)}`);
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as { slides?: unknown }).slides)
  ) {
    throw new Error("Model response JSON schema invalid");
  }

  const slides = (parsed as { slides: { index?: number | string; slide?: number | string; script?: string; narration?: string; text?: string }[] }).slides;
  const fallbackQueue = [...fallbackIndexes];
  const map = new Map<number, string>();
  for (const entry of slides) {
    const rawScript = entry.script ?? entry.narration ?? entry.text;
    if (typeof rawScript !== "string") {
      continue;
    }
    const rawIndex = entry.index ?? entry.slide;
    let idx =
      typeof rawIndex === "number"
        ? rawIndex
        : typeof rawIndex === "string"
        ? Number(rawIndex.replace(/[^0-9.-]/g, ""))
        : NaN;
    if (!Number.isFinite(idx)) {
      idx = fallbackQueue.shift() ?? NaN;
    }
    if (!Number.isFinite(idx)) {
      continue;
    }
    map.set(idx, rawScript);
  }
  if (!map.size) {
    console.warn("[scripts] Model returned empty slides payload:", textBlock);
  }
  return map;
}

async function revertScriptsToFailed(
  slides: {
    script: { id: string } | null;
  }[],
) {
  await Promise.all(
    slides
      .filter((slide) => slide.script)
      .map((slide) =>
        prisma.script.update({
          where: { id: slide.script!.id },
          data: { status: ScriptStatus.FAILED },
        }),
      ),
  );
}
