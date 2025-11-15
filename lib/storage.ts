import fs from "node:fs";
import path from "node:path";
import { config } from "./config";

export function ensureStorageDirs() {
  const segments = ["decks", "slides", "audio", "video", "final"];
  for (const segment of segments) {
    fs.mkdirSync(path.join(config.storageRoot, segment), { recursive: true });
  }
}

export function deckSourcePath(deckId: string, filename: string) {
  return path.join(config.storageRoot, "decks", `${deckId}-${filename}`);
}

export function slideImagePath(deckId: string, slideIndex: number) {
  return path.join(config.storageRoot, "slides", `${deckId}-${slideIndex}.png`);
}

export function slideAudioPath(deckId: string, slideIndex: number) {
  return path.join(config.storageRoot, "audio", `${deckId}-${slideIndex}.mp3`);
}

export function slideVideoPath(deckId: string, slideIndex: number) {
  return path.join(config.storageRoot, "video", `${deckId}-${slideIndex}.mp4`);
}

export function finalVideoPath(deckId: string) {
  return path.join(config.storageRoot, "final", `${deckId}.mp4`);
}
