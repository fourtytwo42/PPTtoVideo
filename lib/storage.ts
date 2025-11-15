import fs from "node:fs";
import path from "node:path";
import { config } from "./config";

const STORAGE_SEGMENTS = ["source", "slides", "audio", "video", "final"] as const;
type StorageSegment = (typeof STORAGE_SEGMENTS)[number];

export function ensureStorageDirs() {
  fs.mkdirSync(config.storageRoot, { recursive: true });
}

export function ensureDeckStorage(deckId: string) {
  ensureStorageDirs();
  for (const segment of STORAGE_SEGMENTS) {
    fs.mkdirSync(deckSegmentPath(deckId, segment), { recursive: true });
  }
}

export async function clearDeckSegment(deckId: string, segment: StorageSegment) {
  const dir = deckSegmentPath(deckId, segment);
  const entries = await fs.promises.readdir(dir).catch(() => []);
  await Promise.all(
    entries.map((entry) => fs.promises.rm(path.join(dir, entry), { force: true }).catch(() => undefined)),
  );
}

export function deckSourcePath(deckId: string, filename: string) {
  return path.join(deckSegmentPath(deckId, "source"), sanitizeFilename(filename));
}

export function slideImagePath(deckId: string, slideIndex: number) {
  return path.join(deckSegmentPath(deckId, "slides"), `${padIndex(slideIndex)}.png`);
}

export function slideAudioPath(deckId: string, slideIndex: number) {
  return path.join(deckSegmentPath(deckId, "audio"), `${padIndex(slideIndex)}.mp3`);
}

export function slideVideoPath(deckId: string, slideIndex: number) {
  return path.join(deckSegmentPath(deckId, "video"), `${padIndex(slideIndex)}.mp4`);
}

export function finalVideoPath(deckId: string) {
  return path.join(deckSegmentPath(deckId, "final"), `final-${deckId}.mp4`);
}

function deckRoot(deckId: string) {
  return path.join(config.storageRoot, deckId);
}

function deckSegmentPath(deckId: string, segment: StorageSegment) {
  return path.join(deckRoot(deckId), segment);
}

function sanitizeFilename(filename: string) {
  const cleaned = filename.replace(/[^a-z0-9.\-_]/gi, "_");
  return cleaned.length > 0 ? cleaned : "source";
}

function padIndex(index: number) {
  return String(Math.max(0, index)).padStart(4, "0");
}
