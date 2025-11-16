'use client';

import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { formatDuration } from '@/lib/format';
import { Card } from '@/app/components/ui/Card';

interface JobSnapshot {
  queued: number;
  running: number;
  succeededToday: number;
  failedToday: number;
  throughputPerHour: number;
  avgPipelineSeconds: number;
}

interface DashboardStatsProps {
  deckCount: number;
  completedCount: number;
  inFlightCount: number;
  slideCount: number;
  deliveredSeconds: number;
  jobSnapshot: JobSnapshot;
  health: { outOfOrder: boolean };
}

export function DashboardStats({
  deckCount,
  completedCount,
  inFlightCount,
  slideCount,
  deliveredSeconds,
  jobSnapshot,
  health,
}: DashboardStatsProps) {
  const successRate = useMemo(() => {
    const totalAttempts = jobSnapshot.succeededToday + jobSnapshot.failedToday;
    if (!totalAttempts) return '100%';
    return `${Math.round((jobSnapshot.succeededToday / totalAttempts) * 100)}%`;
  }, [jobSnapshot.failedToday, jobSnapshot.succeededToday]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: 'repeat(5, 1fr)' },
        gap: 1.5,
      }}
    >
      <Box>
        <Card sx={{ padding: { xs: 1.5, sm: 1.75, md: 2 }, display: 'grid', gap: 0.5 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Decks managed
          </Typography>
          <Typography variant="h5" component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {deckCount}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            {completedCount} complete • {inFlightCount} in-flight
          </Typography>
        </Card>
      </Box>
      <Box>
        <Card sx={{ padding: { xs: 1.5, sm: 1.75, md: 2 }, display: 'grid', gap: 0.5 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Total slides processed
          </Typography>
          <Typography variant="h5" component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {slideCount}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            Across {deckCount} decks
          </Typography>
        </Card>
      </Box>
      <Box>
        <Card sx={{ padding: { xs: 1.5, sm: 1.75, md: 2 }, display: 'grid', gap: 0.5 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Runtime delivered
          </Typography>
          <Typography variant="h5" component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {formatDuration(deliveredSeconds)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            Final MP4 outputs
          </Typography>
        </Card>
      </Box>
      <Box>
        <Card sx={{ padding: { xs: 1.5, sm: 1.75, md: 2 }, display: 'grid', gap: 0.5 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Pipeline health
          </Typography>
          <Typography variant="h5" component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {successRate}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            {jobSnapshot.running} running • {jobSnapshot.queued} queued • {jobSnapshot.failedToday} failed today
          </Typography>
        </Card>
      </Box>
      <Box>
        <Card sx={{ padding: { xs: 1.5, sm: 1.75, md: 2 }, display: 'grid', gap: 0.5 }}>
          <Typography variant="caption" sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Throughput / hr
          </Typography>
          <Typography variant="h5" component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {jobSnapshot.throughputPerHour.toFixed(1)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            Avg pipeline {formatDuration(jobSnapshot.avgPipelineSeconds)} •{' '}
            {health.outOfOrder ? 'attention required' : 'systems nominal'}
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}
