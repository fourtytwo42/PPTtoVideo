import "dotenv/config";
import { createWorker } from "../lib/jobs/queue";
import { registerIngestionProcessor } from "./jobs/ingest";
import { registerScriptProcessor } from "./jobs/scripts";
import { registerAudioProcessor } from "./jobs/audio";
import { registerVideoProcessor } from "./jobs/video";
import { registerAssemblerProcessor } from "./jobs/assemble";
import { ensureStorageDirs } from "../lib/storage";

ensureStorageDirs();

const ingestionWorker = createWorker("ingestion", registerIngestionProcessor);
const scriptWorker = createWorker("scripts", registerScriptProcessor);
const audioWorker = createWorker("audio", registerAudioProcessor);
const videoWorker = createWorker("video", registerVideoProcessor);
const assembleWorker = createWorker("assembler", registerAssemblerProcessor);

for (const worker of [ingestionWorker, scriptWorker, audioWorker, videoWorker, assembleWorker]) {
  worker.on("ready", () => {
    console.log(`${worker.name} worker ready`);
  });
}

process.on("SIGINT", async () => {
  await Promise.all([ingestionWorker.close(), scriptWorker.close(), audioWorker.close(), videoWorker.close(), assembleWorker.close()]);
  process.exit(0);
});
