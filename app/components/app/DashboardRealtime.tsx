'use client';

import { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { DeckUploadPanel } from '@/app/components/app/DeckUploadPanel';
import { DeckGrid } from '@/app/components/app/DeckGrid';
import { DashboardStats } from '@/app/components/app/DashboardStats';
import { NotificationCenter } from '@/app/components/app/NotificationCenter';
import { JobActivityPanel } from '@/app/components/app/JobActivityPanel';
import { DownloadCenter } from '@/app/components/app/DownloadCenter';
import { useDashboardProgress, type DashboardJob, type DashboardHealth } from '@/app/hooks/useDashboardProgress';
import type { DeckSummary } from '@/lib/decks';
import type { JobStatus } from '@prisma/client';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

type Limits = Parameters<typeof DeckUploadPanel>[0]['limits'];

interface DashboardRealtimeProps {
  limits: Limits;
  notifications: NotificationItem[];
  initialDecks: DeckSummary[];
  initialJobs: DashboardJob[];
  initialHealth: DashboardHealth;
}

const jobStatusOrder: JobStatus[] = ['RUNNING', 'QUEUED', 'SUCCEEDED', 'FAILED'];

export function DashboardRealtime({
  limits,
  notifications,
  initialDecks,
  initialJobs,
  initialHealth,
}: DashboardRealtimeProps) {
  const { decks, jobs, health, syncing, error, refresh } = useDashboardProgress({
    decks: initialDecks,
    jobs: initialJobs,
    health: initialHealth,
  });
  const [clearingJobs, setClearingJobs] = useState(false);

  const stats = useMemo(() => {
    const deckCount = decks.length;
    const completedCount = decks.filter((deck) => deck.status === 'COMPLETE').length;
    const inFlightCount = Math.max(deckCount - completedCount, 0);
    const slideCount = decks.reduce((total, deck) => total + deck.slideCount, 0);
    const deliveredSeconds = decks.reduce((total, deck) => total + deck.runtimeSeconds, 0);

    const windowedJobs = jobs.filter(
      (job) => Date.now() - new Date(job.createdAt).getTime() <= 1000 * 60 * 60 * 24,
    );

    const queued = windowedJobs.filter((job) => job.status === 'QUEUED').length;
    const running = windowedJobs.filter((job) => job.status === 'RUNNING').length;
    const succeededToday = windowedJobs.filter((job) => job.status === 'SUCCEEDED').length;
    const failedToday = windowedJobs.filter((job) => job.status === 'FAILED').length;
    const throughputPerHour = windowedJobs.length / 24;
    const avgPipelineSeconds = deckCount ? deliveredSeconds / deckCount : 0;

    return {
      deckCount,
      completedCount,
      inFlightCount,
      slideCount,
      deliveredSeconds,
      jobSnapshot: {
        queued,
        running,
        succeededToday,
        failedToday,
        throughputPerHour,
        avgPipelineSeconds,
      },
    };
  }, [decks, jobs]);

  const orderedJobs = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const statusRank = jobStatusOrder.indexOf(a.status as JobStatus) - jobStatusOrder.indexOf(b.status as JobStatus);
        if (statusRank !== 0) return statusRank;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [jobs],
  );

  const handleClearJobs = async () => {
    if (jobs.length === 0) {
      return;
    }
    if (!window.confirm('Clear all job history for this workspace?')) {
      return;
    }
    setClearingJobs(true);
    const response = await fetch('/api/jobs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setClearingJobs(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to clear job history.');
      return;
    }
    await refresh();
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <DashboardStats
        deckCount={stats.deckCount}
        completedCount={stats.completedCount}
        inFlightCount={stats.inFlightCount}
        slideCount={stats.slideCount}
        deliveredSeconds={stats.deliveredSeconds}
        jobSnapshot={stats.jobSnapshot}
        health={health}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: 'grid', gap: 2 }}>
          <NotificationCenter notifications={notifications} />
          <JobActivityPanel jobs={orderedJobs} syncing={syncing} onClear={handleClearJobs} clearing={clearingJobs} />
        </Box>
        <DownloadCenter decks={decks} />
      </Box>
      <DeckUploadPanel limits={limits} disabled={health.outOfOrder} />
      <DeckGrid decks={decks} disabled={health.outOfOrder} syncing={syncing} error={error} />
    </Box>
  );
}

