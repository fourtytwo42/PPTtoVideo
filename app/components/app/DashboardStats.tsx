'use client';

import styled from 'styled-components';
import { useMemo } from 'react';
import { formatDuration } from '@/lib/format';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
`;

const Tile = styled.div`
  background: ${({ theme }) => theme.colors.surfaceStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 1.4rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: grid;
  gap: 0.45rem;
`;

const Label = styled.span`
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(213, 210, 255, 0.75);
`;

const Value = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
`;

const Subtle = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.muted};
`;

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
    <Grid>
      <Tile>
        <Label>Decks managed</Label>
        <Value>{deckCount}</Value>
        <Subtle>{completedCount} complete • {inFlightCount} in-flight</Subtle>
      </Tile>
      <Tile>
        <Label>Total slides processed</Label>
        <Value>{slideCount}</Value>
        <Subtle>Across {deckCount} decks</Subtle>
      </Tile>
      <Tile>
        <Label>Runtime delivered</Label>
        <Value>{formatDuration(deliveredSeconds)}</Value>
        <Subtle>Final MP4 outputs</Subtle>
      </Tile>
      <Tile>
        <Label>Pipeline health</Label>
        <Value>{successRate}</Value>
        <Subtle>
          {jobSnapshot.running} running • {jobSnapshot.queued} queued • {jobSnapshot.failedToday} failed today
        </Subtle>
      </Tile>
      <Tile>
        <Label>Throughput / hr</Label>
        <Value>{jobSnapshot.throughputPerHour.toFixed(1)}</Value>
        <Subtle>
          Avg pipeline {formatDuration(jobSnapshot.avgPipelineSeconds)} •{' '}
          {health.outOfOrder ? 'attention required' : 'systems nominal'}
        </Subtle>
      </Tile>
    </Grid>
  );
}
