import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Job } from "bullmq";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import pdf from "pdf-parse";
import { prisma } from "../../lib/prisma";
import { slideImagePath, ensureDeckStorage, clearDeckSegment } from "../../lib/storage";
import { runCommand } from "../../lib/cli";
import type { BaseJobPayload } from "../../lib/jobs/queue";
import { enqueueJob } from "../../lib/jobs/queue";
import {
  createNotification,
  markJobFailed,
  markJobProgress,
  markJobRunning,
  markJobSucceeded,
} from "../../lib/jobs/lifecycle";
import { DeckStatus, SourceType, ProcessingMode, JobType, JobStatus } from "@prisma/client";
import { getSoftLimits } from "../../lib/settings";

const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });

export async function registerIngestionProcessor(job: Job<BaseJobPayload>) {
  const { jobId, deckId, userId } = job.data;
  await markJobRunning(jobId);

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { slides: true },
  });

  if (!deck) {
    await markJobFailed(jobId, `Deck ${deckId} not found`);
    throw new Error(`Deck ${deckId} not found`);
  }

  try {
    ensureDeckStorage(deck.id);
    await Promise.all([
      clearDeckSegment(deck.id, "slides"),
      clearDeckSegment(deck.id, "audio"),
      clearDeckSegment(deck.id, "video"),
      clearDeckSegment(deck.id, "final"),
    ]);

    const sourceFile = deck.sourcePath;
    const buffer = await fs.promises.readFile(sourceFile);

    await prisma.slide.deleteMany({ where: { deckId: deck.id } });

    let slides: { index: number; title?: string; body?: string; notes?: string }[] = [];

    const limits = await getSoftLimits();
    const warnings = Array.isArray(deck.warnings) ? [...(deck.warnings as string[])] : [];

    if (deck.sourceType === SourceType.PPTX) {
      slides = await extractSlidesFromPptx(buffer);
      await renderPptxSlides(deck.id, sourceFile);
    } else {
      slides = await extractSlidesFromPdf(buffer);
      await renderPdfSlides(deck.id, sourceFile);
    }

    if (limits.maxSlides && limits.maxSlides > 0 && slides.length > limits.maxSlides) {
      const warning = `Deck contains ${slides.length} slides which exceeds the soft limit of ${limits.maxSlides}. Processing may take longer.`;
      if (!warnings.includes(warning)) {
        warnings.push(warning);
        await createNotification(userId, "Large deck detected", warning);
      }
    }

    await prisma.deck.update({
      where: { id: deck.id },
      data: {
        slideCount: slides.length,
        warnings,
      },
    });

    let processed = 0;
    for (const slide of slides) {
      const created = await prisma.slide.create({
        data: {
          deckId: deck.id,
          index: slide.index,
          title: slide.title ?? null,
          body: slide.body ?? null,
          speakerNotes: slide.notes ?? null,
          imagePath: slideImagePath(deck.id, slide.index),
        },
      });

      await prisma.script.create({
        data: {
          slideId: created.id,
          content: buildInitialScript(slide),
        },
      });

      processed += 1;
      await markJobProgress(jobId, processed, slides.length);
    }

    const nextStatus = deck.mode === ProcessingMode.ONE_SHOT ? DeckStatus.GENERATING : DeckStatus.READY_FOR_REVIEW;
    await prisma.deck.update({
      where: { id: deck.id },
      data: {
        status: nextStatus,
      },
    });

    await markJobSucceeded(jobId);

    const message = slides.length
      ? `${slides.length} slide${slides.length === 1 ? '' : 's'} ingested from ${deck.title}.`
      : `No slides detected in ${deck.title}.`;
    await createNotification(
      userId,
      deck.mode === ProcessingMode.ONE_SHOT ? "Deck ingestion complete" : "Deck ready for review",
      message,
    );

    if (deck.mode === ProcessingMode.ONE_SHOT && slides.length > 0) {
      const scriptsJob = await prisma.job.create({
        data: {
          deckId: deck.id,
          ownerId: userId,
          type: JobType.GENERATE_SCRIPTS,
          status: JobStatus.QUEUED,
          payload: { trigger: "auto" },
        },
      });
      await enqueueJob("generate-scripts", { deckId: deck.id, userId, jobId: scriptsJob.id });
    }
  } catch (error) {
    await prisma.deck.update({ where: { id: deck.id }, data: { status: DeckStatus.FAILED } });
    await markJobFailed(jobId, error);
    await createNotification(userId, "Deck ingestion failed", formatError(error));
    throw error;
  }
}

function formatError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}

function buildInitialScript(slide: { title?: string; body?: string; notes?: string }) {
  const parts = [slide.title, slide.body, slide.notes].filter(Boolean);
  return parts.join("\n\n");
}

async function extractSlidesFromPptx(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideEntries = Object.keys(zip.files)
    .filter((key) => key.startsWith("ppt/slides/slide"))
    .sort((a, b) => extractIndex(a) - extractIndex(b));

  const result: { index: number; title?: string; body?: string; notes?: string }[] = [];

  for (const entry of slideEntries) {
    const content = await zip.file(entry)?.async("string");
    if (!content) continue;
    const parsed = parser.parse(content);
    const texts = extractTextFromSlide(parsed);
    result.push({ index: extractIndex(entry), ...texts });
  }

  const notesEntries = Object.keys(zip.files).filter((key) => key.startsWith("ppt/notesSlides/notesSlide"));
  for (const entry of notesEntries) {
    const content = await zip.file(entry)?.async("string");
    if (!content) continue;
    const parsed = parser.parse(content);
    const text = collectRuns(parsed);
    const slideIndex = extractIndex(entry);
    const target = result.find((slide) => slide.index === slideIndex);
    if (target) {
      target.notes = text;
    }
  }

  return result;
}

async function extractSlidesFromPdf(buffer: Buffer) {
  const data = await pdf(buffer, { pagerender: renderPage });
  return data.text
    .split("\f")
    .map((page, index) => ({
      index: index + 1,
      body: page.trim(),
    }))
    .filter((slide) => slide.body && slide.body.length > 0);
}

function renderPage(pageData: any) {
  let render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: false,
  };
  return pageData.getTextContent(render_options).then(function (textContent: any) {
    let lastY: number | null = null;
    let text = "";
    for (const item of textContent.items) {
      if (lastY === item.transform[5] || lastY === null) {
        text += item.str + " ";
      } else {
        text += "\n" + item.str + " ";
      }
      lastY = item.transform[5];
    }
    return text + "\f";
  });
}

async function renderPptxSlides(deckId: string, sourceFile: string) {
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "deckforge-pptx-"));
  const libreoffice = process.env.LIBREOFFICE_PATH ?? "soffice";
  await runCommand(libreoffice, ["--headless", "--convert-to", "png", "--outdir", tmpDir, sourceFile]);
  const files = await fs.promises.readdir(tmpDir);
  let index = 1;
  for (const file of files.sort()) {
    const target = slideImagePath(deckId, index);
    await fs.promises.copyFile(path.join(tmpDir, file), target);
    index += 1;
  }
}

async function renderPdfSlides(deckId: string, sourceFile: string) {
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "deckforge-pdf-"));
  const pdftoppng = process.env.PDFTOPNG_PATH ?? "pdftoppm";
  await runCommand(pdftoppng, ["-png", sourceFile, path.join(tmpDir, "page")]);
  const files = (await fs.promises.readdir(tmpDir)).filter((file) => file.endsWith(".png"));
  let index = 1;
  for (const file of files.sort()) {
    await fs.promises.copyFile(path.join(tmpDir, file), slideImagePath(deckId, index));
    index += 1;
  }
}

function extractIndex(entry: string) {
  const match = entry.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function extractTextFromSlide(parsed: any) {
  const bodies: string[] = [];
  const body = parsed?.sld?.cSld?.spTree;
  if (!body) return {};
  const nodes = Array.isArray(body.sp) ? body.sp : [body.sp];
  for (const node of nodes) {
    const text = collectRuns(node?.txBody);
    if (text) {
      bodies.push(text);
    }
  }
  const [title, ...rest] = bodies;
  return { title, body: rest.join("\n") };
}

function collectRuns(node: any): string | undefined {
  if (!node) return undefined;
  const paragraphs = Array.isArray(node.p) ? node.p : [node.p];
  const lines = [] as string[];
  for (const paragraph of paragraphs) {
    if (!paragraph) continue;
    const runs = Array.isArray(paragraph.r) ? paragraph.r : paragraph.r ? [paragraph.r] : [];
    const text = runs.map((run: any) => run.t ?? "").join("");
    if (paragraph?.fld) {
      lines.push(paragraph.fld.t ?? "");
    }
    if (text) lines.push(text);
  }
  return lines.join("\n");
}
