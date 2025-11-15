import { AssetStatus, DeckStatus, ProcessingMode, Prisma, ScriptStatus } from "@prisma/client";

export type DeckSummary = {
  id: string;
  title: string;
  sourceType: string;
  createdAt: string;
  slideCount: number;
  mode: ProcessingMode;
  status: DeckStatus;
  readyScripts: number;
  readyAudio: number;
  readyVideo: number;
  finalVideoPath?: string | null;
  lastJobAt?: string | null;
  estimatedSeconds: number;
  runtimeSeconds: number;
  warnings: string[];
  stageProgress: {
    scripts: StageProgress;
    audio: StageProgress;
    video: StageProgress;
    final: StageProgress;
  };
  overallProgress: number;
};

export type StageProgress = {
  ready: number;
  total: number;
  progress: number;
};

export type WorkspaceDeck = {
  id: string;
  title: string;
  sourceType: string;
  createdAt: string;
  status: DeckStatus;
  mode: ProcessingMode;
  slideCount: number;
  scriptsReady: number;
  audioReady: number;
  videoReady: number;
  finalVideoPath: string | null;
  warnings: string[];
  progress: {
    scripts: StageProgress;
    audio: StageProgress;
    video: StageProgress;
    final: StageProgress;
    overall: number;
  };
  slides: {
    id: string;
    index: number;
    title: string | null;
    body: string | null;
    speakerNotes: string | null;
    imagePath: string | null;
    script: string;
    scriptStatus: ScriptStatus;
    audioStatus: AssetStatus;
    videoStatus: AssetStatus;
  }[];
};

function normalizeWarnings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((entry) => String(entry))));
  }
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  return [];
}

function computeStage(ready: number, total: number): StageProgress {
  if (total <= 0) {
    return { ready, total, progress: ready > 0 ? 1 : 0 };
  }
  const progress = Math.min(1, Math.max(0, ready / total));
  return { ready, total, progress };
}

function computeOverall(stageValues: StageProgress[]): number {
  if (!stageValues.length) return 0;
  const total = stageValues.reduce((acc, stage) => acc + stage.progress, 0);
  return Math.min(1, Math.max(0, total / stageValues.length));
}

type DeckSummarySource = Prisma.DeckGetPayload<{
  include: {
    slides: { include: { script: true; audioAsset: true; videoAsset: true } };
    audioAssets: true;
    videoAssets: true;
    jobs: { orderBy: { createdAt: "desc" }; take: number };
  };
}>;

type WorkspaceDeckSource = Prisma.DeckGetPayload<{
  include: {
    slides: { include: { script: true; audioAsset: true; videoAsset: true }; orderBy: { index: "asc" } };
    audioAssets: true;
    videoAssets: true;
  };
}>;

export function buildDeckSummary(deck: DeckSummarySource): DeckSummary {
  const totalSlides = deck.slideCount || deck.slides.length;
  const readyScripts = deck.slides.filter((slide) => slide.script?.status === ScriptStatus.READY).length;
  const readyAudio = deck.slides.filter((slide) => slide.audioAsset?.status === AssetStatus.READY).length;
  const readyVideo = deck.slides.filter((slide) => slide.videoAsset?.status === AssetStatus.READY).length;
  const scriptStage = computeStage(readyScripts, totalSlides);
  const audioStage = computeStage(readyAudio, totalSlides);
  const videoStage = computeStage(readyVideo, totalSlides);
  const finalStage = computeStage(deck.finalVideoPath ? 1 : 0, 1);
  const overallProgress = computeOverall([scriptStage, audioStage, videoStage, finalStage]);

  const estimatedSeconds = deck.slides.reduce((total, slide) => total + (slide.audioAsset?.duration ?? 0), 0);
  const runtimeSeconds = deck.finalVideoDuration ?? estimatedSeconds;
  const lastJobAt = deck.jobs[0]?.updatedAt ?? null;
  const warnings = normalizeWarnings(deck.warnings);

  return {
    id: deck.id,
    title: deck.title,
    sourceType: deck.sourceType,
    createdAt: deck.createdAt.toISOString(),
    slideCount: totalSlides,
    mode: deck.mode,
    status: deck.status,
    readyScripts,
    readyAudio,
    readyVideo,
    finalVideoPath: deck.finalVideoPath,
    lastJobAt: lastJobAt ? lastJobAt.toISOString() : null,
    estimatedSeconds,
    runtimeSeconds,
    warnings,
    stageProgress: {
      scripts: scriptStage,
      audio: audioStage,
      video: videoStage,
      final: finalStage,
    },
    overallProgress,
  };
}

export function buildWorkspaceDeck(deck: WorkspaceDeckSource): WorkspaceDeck {
  const totalSlides = deck.slideCount || deck.slides.length;
  const warnings = normalizeWarnings(deck.warnings);
  const scriptsReady = deck.slides.filter((slide) => slide.script?.status === ScriptStatus.READY).length;
  const audioReady = deck.slides.filter((slide) => slide.audioAsset?.status === AssetStatus.READY).length;
  const videoReady = deck.slides.filter((slide) => slide.videoAsset?.status === AssetStatus.READY).length;

  const scriptStage = computeStage(scriptsReady, totalSlides);
  const audioStage = computeStage(audioReady, totalSlides);
  const videoStage = computeStage(videoReady, totalSlides);
  const finalStage = computeStage(deck.finalVideoPath ? 1 : 0, 1);
  const overall = computeOverall([scriptStage, audioStage, videoStage, finalStage]);

  return {
    id: deck.id,
    title: deck.title,
    sourceType: deck.sourceType,
    createdAt: deck.createdAt.toISOString(),
    status: deck.status,
    mode: deck.mode,
    slideCount: totalSlides,
    scriptsReady,
    audioReady,
    videoReady,
    finalVideoPath: deck.finalVideoPath ?? null,
    warnings,
    progress: {
      scripts: scriptStage,
      audio: audioStage,
      video: videoStage,
      final: finalStage,
      overall,
    },
    slides: deck.slides.map((slide) => ({
      id: slide.id,
      index: slide.index,
      title: slide.title,
      body: slide.body,
      speakerNotes: slide.speakerNotes,
      imagePath: slide.imagePath,
      script: slide.script?.content ?? "",
      scriptStatus: slide.script?.status ?? ScriptStatus.READY,
      audioStatus: slide.audioAsset?.status ?? AssetStatus.PENDING,
      videoStatus: slide.videoAsset?.status ?? AssetStatus.PENDING,
    })),
  };
}
