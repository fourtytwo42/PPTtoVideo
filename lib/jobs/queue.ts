import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config";

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

export type JobName =
  | "ingest-deck"
  | "generate-scripts"
  | "generate-audio"
  | "generate-video"
  | "assemble-final";

export interface BaseJobPayload {
  deckId: string;
  userId: string;
  jobId: string;
  slideIds?: string[];
}

export const jobQueue = new Queue<JobName, void, JobName>("deckforge", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

export function createWorker(
  name: string,
  processor: Parameters<typeof Worker<JobName, void, JobName>>[1],
) {
  const worker = new Worker<JobName, void, JobName>("deckforge", processor, {
    connection,
    concurrency: 2,
    autorun: true,
  });

  const events = new QueueEvents("deckforge", { connection });
  events.on("failed", ({ jobId, failedReason }) => {
    console.error(`[${name}] job ${jobId} failed`, failedReason);
  });

  return worker;
}

export async function enqueueJob(name: JobName, payload: BaseJobPayload, options?: JobsOptions) {
  await jobQueue.add(name, payload, options);
}
