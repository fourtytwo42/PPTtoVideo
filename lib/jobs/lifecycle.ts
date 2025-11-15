import { prisma } from '../prisma';
import { JobStatus } from '@prisma/client';

export async function markJobRunning(jobId: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: { status: JobStatus.RUNNING, startedAt: new Date(), completedAt: null, progress: 0, error: null },
  });
}

export async function markJobProgress(jobId: string, completed: number, total?: number) {
  const progress = total && total > 0 ? Math.min(1, completed / total) : completed;
  await prisma.job.update({
    where: { id: jobId },
    data: { progress },
  });
}

export async function markJobSucceeded(jobId: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: { status: JobStatus.SUCCEEDED, progress: 1, completedAt: new Date(), error: null },
  });
}

export async function markJobFailed(jobId: string, error: unknown) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.FAILED,
      error: error instanceof Error ? error.message : String(error),
      completedAt: new Date(),
    },
  });
}

export async function createNotification(userId: string, title: string, message: string) {
  await prisma.notification.create({
    data: { userId, title, message },
  });
}
