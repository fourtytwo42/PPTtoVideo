'use client';

import styled from 'styled-components';
import type { DeckSummary } from '@/lib/decks';
import { formatDuration, formatRelativeTime } from '@/lib/format';

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surfaceStrong};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: clamp(1.6rem, 3vw, 2.2rem);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 1rem;
`;

const List = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const Row = styled.div`
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(21, 18, 42, 0.7);
  padding: 0.9rem 1rem;
  display: grid;
  gap: 0.35rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const DownloadButton = styled.a`
  padding: 0.4rem 0.85rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid rgba(140, 92, 255, 0.45);
  color: #cbb3ff;
`;

interface DownloadCenterProps {
  decks: DeckSummary[];
}

export function DownloadCenter({ decks }: DownloadCenterProps) {
  const readyDecks = decks
    .filter((deck) => deck.finalVideoPath)
    .sort(
      (a, b) =>
        new Date(b.lastJobAt ?? b.createdAt).getTime() - new Date(a.lastJobAt ?? a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <Panel>
      <div>
        <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>Downloads</h3>
        <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.7)', fontSize: '0.9rem' }}>
          Grab final renders without leaving the dashboard. Recent MP4 builds appear here as soon as assembly completes.
        </p>
      </div>
      <List>
        {readyDecks.length === 0 && (
          <p style={{ margin: 0, color: 'rgba(213,210,255,0.6)' }}>No final renders yet. Finish assembling to see downloads.</p>
        )}
        {readyDecks.map((deck) => (
          <Row key={deck.id}>
            <strong>{deck.title}</strong>
            <span style={{ fontSize: '0.85rem', color: 'rgba(213,210,255,0.8)' }}>
              {formatDuration(deck.runtimeSeconds)} • {formatRelativeTime(new Date(deck.createdAt).getTime())}
            </span>
            <Actions>
              <DownloadButton href={`/api/decks/${deck.id}/final`} target="_blank" rel="noreferrer">
                Download MP4
              </DownloadButton>
              <DownloadButton href={`/deck/${deck.id}`}>
                Open workspace
              </DownloadButton>
            </Actions>
          </Row>
        ))}
      </List>
    </Panel>
  );
}

