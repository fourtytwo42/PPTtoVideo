import { Queue, Worker, QueueEvents, JobsOptions, type Processor } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config";

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

const events = new QueueEvents("deckforge", { connection });

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

export const jobQueue = new Queue<BaseJobPayload, void, JobName>("deckforge", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

type ProcessorMap = Partial<Record<JobName, Processor<BaseJobPayload, void, JobName>>>;

export function createWorker(processors: ProcessorMap) {
  const worker = new Worker<BaseJobPayload, void, JobName>(
    "deckforge",
    async (job) => {
      const handler = processors[job.name];
      if (!handler) {
        throw new Error(`No processor registered for job ${job.name}`);
      }
      return handler(job);
    },
    {
      connection,
      concurrency: 5,
      autorun: true,
    },
  );

  events.on("failed", ({ jobId, failedReason }) => {
    console.error(`[worker] job ${jobId} failed`, failedReason);
  });

  return worker;
}

export async function enqueueJob(name: JobName, payload: BaseJobPayload, options?: JobsOptions) {
  await jobQueue.add(name, payload, options);
}
