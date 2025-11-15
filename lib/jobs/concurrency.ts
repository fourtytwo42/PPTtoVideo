import { JobStatus } from "@prisma/client";
import { prisma } from "../prisma";

async function getLimit() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: "admin:concurrencyLimitPerUser" } });
  const value = setting?.value as unknown;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return Math.floor(numeric);
}

export async function assertWithinConcurrencyLimit(userId: string) {
  const limit = await getLimit();
  if (!limit) {
    return;
  }

  const activeJobs = await prisma.job.count({
    where: {
      ownerId: userId,
      status: { in: [JobStatus.QUEUED, JobStatus.RUNNING] },
    },
  });

  if (activeJobs >= limit) {
    throw new Error(
      `You have ${activeJobs} active job${activeJobs === 1 ? "" : "s"}. The current concurrency limit is ${limit}.`
    );
  }
}
