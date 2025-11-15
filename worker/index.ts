import "dotenv/config";
import { createWorker } from "../lib/jobs/queue";
import { registerIngestionProcessor } from "./jobs/ingest";
import { registerScriptProcessor } from "./jobs/scripts";
import { registerAudioProcessor } from "./jobs/audio";
import { registerVideoProcessor } from "./jobs/video";
import { registerAssemblerProcessor } from "./jobs/assemble";
import { ensureStorageDirs } from "../lib/storage";

ensureStorageDirs();

const worker = createWorker({
  "ingest-deck": registerIngestionProcessor,
  "generate-scripts": registerScriptProcessor,
  "generate-audio": registerAudioProcessor,
  "generate-video": registerVideoProcessor,
  "assemble-final": registerAssemblerProcessor,
});

worker.on("ready", () => {
  console.log("deckforge worker ready");
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
