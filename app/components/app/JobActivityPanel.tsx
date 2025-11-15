'use client';

import styled from 'styled-components';
import { formatRelativeTime } from '@/lib/format';
import type { DashboardJob } from '@/app/hooks/useDashboardProgress';

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surfaceStrong};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: clamp(1.6rem, 3vw, 2.2rem);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
`;

const SyncBadge = styled.span<{ $state: 'syncing' | 'idle' }>`
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $state }) => ($state === 'syncing' ? '#CBB3FF' : 'rgba(213, 210, 255, 0.68)')};
`;

const List = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const JobCard = styled.div`
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.9rem 1rem;
  display: grid;
  gap: 0.4rem;
  background: rgba(25, 20, 48, 0.75);
`;

const JobTitle = styled.div`
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  font-size: 0.92rem;
`;

const ProgressBar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => Math.round($progress * 100)}%;
  background: linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95));
  transition: width 0.4s ease;
`;

const Meta = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const StatusPill = styled.span<{ $variant: 'queued' | 'running' | 'failed' | 'succeeded' }>`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: ${({ $variant }) =>
    $variant === 'succeeded'
      ? 'rgba(36, 228, 206, 0.18)'
      : $variant === 'failed'
      ? 'rgba(255, 111, 145, 0.18)'
      : $variant === 'running'
      ? 'rgba(140, 92, 255, 0.18)'
      : 'rgba(255, 196, 88, 0.16)'};
  color: ${({ $variant }) =>
    $variant === 'succeeded'
      ? '#8AFFEA'
      : $variant === 'failed'
      ? '#FF9BB4'
      : $variant === 'running'
      ? '#CBB3FF'
      : '#FFD18A'};
`;

interface JobActivityPanelProps {
  jobs: DashboardJob[];
  syncing: boolean;
}

const statusVariant = (status: string): 'queued' | 'running' | 'failed' | 'succeeded' => {
  if (status === 'RUNNING') return 'running';
  if (status === 'FAILED') return 'failed';
  if (status === 'SUCCEEDED') return 'succeeded';
  return 'queued';
};

const progressForStatus = (job: DashboardJob) => {
  if (job.status === 'SUCCEEDED') return 1;
  if (job.status === 'FAILED') return job.progress || 0;
  return Math.max(0, Math.min(1, job.progress ?? 0));
};

export function JobActivityPanel({ jobs, syncing }: JobActivityPanelProps) {
  return (
    <Panel>
      <Header>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>Job activity</h3>
          <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.7)', fontSize: '0.9rem' }}>
            Track queued, running, and recently completed jobs across your decks.
          </p>
        </div>
        <SyncBadge $state={syncing ? 'syncing' : 'idle'}>{syncing ? 'Syncing…' : 'Live'}</SyncBadge>
      </Header>
      <List>
        {jobs.length === 0 && (
          <p style={{ margin: 0, color: 'rgba(213,210,255,0.6)' }}>No jobs scheduled in the last 24 hours.</p>
        )}
        {jobs.map((job) => (
          <JobCard key={job.id}>
            <JobTitle>
              <span>{job.deckTitle}</span>
              <StatusPill $variant={statusVariant(job.status)}>{job.status.toLowerCase()}</StatusPill>
            </JobTitle>
            <span style={{ fontSize: '0.85rem', color: 'rgba(213,210,255,0.8)' }}>
              {job.type.split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
            </span>
            <ProgressBar>
              <ProgressFill $progress={progressForStatus(job)} />
            </ProgressBar>
            <Meta>
              <span>{formatRelativeTime(new Date(job.updatedAt).getTime())}</span>
              <span>{Math.round(progressForStatus(job) * 100)}%</span>
            </Meta>
          </JobCard>
        ))}
      </List>
    </Panel>
  );
}

