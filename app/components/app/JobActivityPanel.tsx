'use client';

import { Box, Typography, Stack, Chip, LinearProgress } from '@mui/material';
import { formatRelativeTime } from '@/lib/format';
import type { DashboardJob } from '@/app/hooks/useDashboardProgress';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

interface JobActivityPanelProps {
  jobs: DashboardJob[];
  syncing: boolean;
  onClear?: () => void | Promise<void>;
  clearing?: boolean;
}

const statusColor = (status: string): string => {
  if (status === 'SUCCEEDED') return '#8AFFEA';
  if (status === 'FAILED') return '#FF9BB4';
  if (status === 'RUNNING') return '#CBB3FF';
  return '#FFD18A';
};

const statusBgColor = (status: string): string => {
  if (status === 'SUCCEEDED') return 'rgba(36, 228, 206, 0.18)';
  if (status === 'FAILED') return 'rgba(255, 111, 145, 0.18)';
  if (status === 'RUNNING') return 'rgba(140, 92, 255, 0.18)';
  return 'rgba(255, 196, 88, 0.16)';
};

const progressForStatus = (job: DashboardJob) => {
  if (job.status === 'SUCCEEDED') return 1;
  if (job.status === 'FAILED') return job.progress || 0;
  return Math.max(0, Math.min(1, job.progress ?? 0));
};

export function JobActivityPanel({ jobs, syncing, onClear, clearing }: JobActivityPanelProps) {
  return (
    <Card sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" component="h3" sx={{ fontFamily: 'var(--font-serif)', margin: 0, mb: 0.5 }}>
            Job activity
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(213, 210, 255, 0.7)' }}>
            Track queued, running, and recently completed jobs across your decks.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Chip
            label={syncing ? 'Syncing…' : 'Live'}
            size="small"
            sx={{
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backgroundColor: syncing ? 'rgba(140, 92, 255, 0.18)' : 'transparent',
              color: syncing ? '#CBB3FF' : 'rgba(213, 210, 255, 0.68)',
            }}
          />
          {onClear && (
            <Button variant="outlined" size="small" onClick={onClear} disabled={clearing}>
              {clearing ? 'Clearing…' : 'Clear history'}
            </Button>
          )}
        </Box>
      </Box>
      <Stack spacing={1}>
        {jobs.length === 0 && (
          <Typography variant="body2" sx={{ color: 'rgba(213,210,255,0.6)' }}>
            No jobs scheduled in the last 24 hours.
          </Typography>
        )}
        {jobs.map((job) => (
          <Box
            key={job.id}
            sx={{
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '0.9rem 1rem',
              display: 'grid',
              gap: 0.5,
              background: 'rgba(25, 20, 48, 0.75)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                {job.deckTitle}
              </Typography>
              <Chip
                label={job.status.toLowerCase()}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  backgroundColor: statusBgColor(job.status),
                  color: statusColor(job.status),
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'rgba(213,210,255,0.8)' }}>
              {job.type.split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressForStatus(job) * 100}
              sx={{
                height: 6,
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95))',
                  borderRadius: '999px',
                },
              }}
            />
            <Box
              sx={{
                fontSize: '0.8rem',
                color: 'text.secondary',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 0.75,
              }}
            >
              <Typography variant="caption">{formatRelativeTime(new Date(job.updatedAt).getTime())}</Typography>
              <Typography variant="caption">{Math.round(progressForStatus(job) * 100)}%</Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
