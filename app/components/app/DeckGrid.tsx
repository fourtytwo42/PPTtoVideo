'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { formatDuration, formatRelativeTime } from '@/lib/format';
import type { DeckSummary } from '@/lib/decks';

const Grid = styled.div`
  display: grid;
  gap: 1.6rem;
`;

const SyncRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const SyncBadge = styled.span<{ $state: 'syncing' | 'idle' }>`
  font-size: 0.77rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $state }) => ($state === 'syncing' ? '#CBB3FF' : 'rgba(213, 210, 255, 0.7)')};
`;

const SyncError = styled.span`
  font-size: 0.77rem;
  letter-spacing: 0.05em;
  color: #ff9bb4;
`;

const Card = styled.article`
  background: ${({ theme }) => theme.colors.surfaceStrong};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: clamp(1.8rem, 2.5vw, 2.4rem);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 1.4rem;
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  h3 {
    margin: 0;
    font-size: 1.35rem;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 0.9rem;
  }
`;

const StatusBadge = styled.span<{ $variant: 'ready' | 'running' | 'complete' | 'failed' }>`
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: ${({ $variant }) =>
    $variant === 'complete'
      ? 'rgba(36, 228, 206, 0.18)'
      : $variant === 'running'
      ? 'rgba(140, 92, 255, 0.18)'
      : $variant === 'ready'
      ? 'rgba(255, 196, 88, 0.16)'
      : 'rgba(255, 111, 145, 0.2)'};
  color: ${({ $variant }) =>
    $variant === 'complete'
      ? '#8AFFEA'
      : $variant === 'running'
      ? '#CBB3FF'
      : $variant === 'ready'
      ? '#FFD18A'
      : '#FF9BB4'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => Math.round($progress * 100)}%;
  background: linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95));
  transition: width 0.6s ease;
`;

const StageBadges = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const StageBadge = styled.li<{ $variant: 'pending' | 'working' | 'ready' }>`
  padding: 0.35rem 0.7rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${({ $variant }) =>
    $variant === 'ready'
      ? 'rgba(36, 228, 206, 0.16)'
      : $variant === 'working'
      ? 'rgba(140, 92, 255, 0.16)'
      : 'rgba(255, 196, 88, 0.12)'};
  color: ${({ $variant }) =>
    $variant === 'ready'
      ? '#8AFFEA'
      : $variant === 'working'
      ? '#CBB3FF'
      : '#FFD18A'};
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'ready'
        ? 'rgba(36, 228, 206, 0.45)'
        : $variant === 'working'
        ? 'rgba(140, 92, 255, 0.45)'
        : 'rgba(255, 196, 88, 0.45)'};
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const WarningList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.4rem;
`;

const WarningItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ffd18a;

  &::before {
    content: '⚠️';
    font-size: 0.9rem;
  }
`;

const ActionButton = styled.button<{ $accent?: 'primary' | 'outline'; disabled?: boolean }>`
  padding: 0.55rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  border: ${({ $accent }) => ($accent === 'outline' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none')};
  background: ${({ $accent }) =>
    $accent === 'outline' ? 'transparent' : 'linear-gradient(135deg, rgba(140, 92, 255, 0.9), rgba(36, 228, 206, 0.9))'};
  color: ${({ $accent }) => ($accent === 'outline' ? 'rgba(213, 210, 255, 0.85)' : '#0b0416')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const OpenLink = styled(Link)`
  padding: 0.55rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

interface DeckGridProps {
  decks: DeckSummary[];
  disabled: boolean;
  syncing?: boolean;
  error?: string | null;
}

export function DeckGrid({ decks, disabled, syncing = false, error }: DeckGridProps) {
  const sortedDecks = [...decks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusVariant = (status: DeckSummary['status']): 'ready' | 'running' | 'complete' | 'failed' => {
    if (status === 'COMPLETE') return 'complete';
    if (status === 'GENERATING') return 'running';
    if (status === 'FAILED') return 'failed';
    return 'ready';
  };

  const progressForDeck = (deck: DeckSummary) => deck.overallProgress;

  const stageVariant = (progress: number): 'pending' | 'working' | 'ready' => {
    if (progress >= 0.999) return 'ready';
    if (progress > 0) return 'working';
    return 'pending';
  };

  const triggerJob = async (deckId: string, target: 'scripts' | 'audio' | 'video' | 'final') => {
    const response = await fetch(`/api/decks/${deckId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', target }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to queue job.');
    }
  };

  return (
    <Grid>
      <SyncRow>
        <SyncBadge $state={syncing ? 'syncing' : 'idle'}>{syncing ? 'Syncing progress…' : 'Live data'}</SyncBadge>
        {error && <SyncError>{error}</SyncError>}
      </SyncRow>
      {sortedDecks.map((deck) => {
        const mediaLocked = deck.mode === 'REVIEW';
        return (
        <Card key={deck.id}>
          <Header>
            <Title>
              <h3>{deck.title}</h3>
              <span>
                {deck.sourceType} • {deck.slideCount} slides • Uploaded {formatRelativeTime(new Date(deck.createdAt).getTime())}
              </span>
            </Title>
            <StatusBadge $variant={statusVariant(deck.status)}>
              {deck.status === 'READY_FOR_REVIEW'
                ? 'Awaiting review'
                : deck.status === 'GENERATING'
                ? 'Generating media'
                : deck.status === 'COMPLETE'
                ? 'Complete'
                : deck.status === 'FAILED'
                ? 'Attention required'
                : 'Ingesting'}
            </StatusBadge>
          </Header>
          <ProgressBar>
            <ProgressFill $progress={progressForDeck(deck)} />
          </ProgressBar>
          <StageBadges>
            <StageBadge
              $variant={stageVariant(deck.stageProgress.scripts.progress)}
              title={`Scripts ready ${deck.stageProgress.scripts.ready} of ${deck.stageProgress.scripts.total}`}
            >
              Scripts {deck.stageProgress.scripts.ready}/{deck.stageProgress.scripts.total}
            </StageBadge>
            <StageBadge
              $variant={stageVariant(deck.stageProgress.audio.progress)}
              title={`Audio ready ${deck.stageProgress.audio.ready} of ${deck.stageProgress.audio.total}`}
            >
              Audio {deck.stageProgress.audio.ready}/{deck.stageProgress.audio.total}
            </StageBadge>
            <StageBadge
              $variant={stageVariant(deck.stageProgress.video.progress)}
              title={`Video ready ${deck.stageProgress.video.ready} of ${deck.stageProgress.video.total}`}
            >
              Video {deck.stageProgress.video.ready}/{deck.stageProgress.video.total}
            </StageBadge>
            <StageBadge
              $variant={stageVariant(deck.stageProgress.final.progress)}
              title={
                deck.stageProgress.final.total === 0
                  ? 'Final render pending'
                  : `Final renders ${deck.stageProgress.final.ready} of ${deck.stageProgress.final.total}`
              }
            >
              Final {deck.stageProgress.final.ready}/{deck.stageProgress.final.total}
            </StageBadge>
          </StageBadges>
          {deck.warnings.length > 0 && (
            <WarningList>
              {deck.warnings.map((warning, index) => (
                <WarningItem key={`${deck.id}-warning-${index}`}>{warning}</WarningItem>
              ))}
            </WarningList>
          )}
          <MetaRow>
            <span>Mode: {deck.mode === 'REVIEW' ? 'Review workflow' : 'One-shot automation'}</span>
            <span>Script model: {deck.scriptModel ?? 'Default'}</span>
            <span>TTS model: {deck.ttsModel ?? 'Default'}</span>
            <span>Voice: {deck.voiceLabel ?? 'Default voice'}</span>
            <span>
              Runtime {formatDuration(deck.runtimeSeconds)}
              {deck.finalVideoPath ? '' : ` • Est. ${formatDuration(deck.estimatedSeconds)}`}
            </span>
            {deck.lastJobAt && <span>Last job {formatRelativeTime(new Date(deck.lastJobAt).getTime())}</span>}
            {deck.finalVideoPath && <span>Final MP4 ready</span>}
          </MetaRow>
          <Actions>
            <OpenLink href={`/deck/${deck.id}`}>Open workspace</OpenLink>
            <ActionButton
              onClick={() => triggerJob(deck.id, 'scripts')}
              disabled={disabled}
              $accent="outline"
            >
              Regenerate scripts
            </ActionButton>
            <ActionButton
              onClick={() => triggerJob(deck.id, 'audio')}
              disabled={disabled || mediaLocked}
            >
              Generate audio
            </ActionButton>
            <ActionButton
              onClick={() => triggerJob(deck.id, 'video')}
              disabled={disabled || mediaLocked}
              $accent="outline"
            >
              Render slides
            </ActionButton>
            <ActionButton
              onClick={() => triggerJob(deck.id, 'final')}
              disabled={disabled || mediaLocked || !deck.readyVideo}
            >
              Build final video
            </ActionButton>
            {deck.finalVideoPath && (
              <ActionButton as="a" href={`/api/decks/${deck.id}/final`} $accent="outline">
                Download final MP4
              </ActionButton>
            )}
          </Actions>
        </Card>
      );
      })}
    </Grid>
  );
}
