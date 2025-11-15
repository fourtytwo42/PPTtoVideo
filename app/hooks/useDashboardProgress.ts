'use client';

import { useEffect, useRef, useState } from 'react';
import type { DeckSummary } from '@/lib/decks';

export interface DashboardJob {
  id: string;
  deckId: string;
  deckTitle: string;
  type: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardHealth {
  outOfOrder: boolean;
  message: string | null;
}

interface DashboardProgressState {
  decks: DeckSummary[];
  jobs: DashboardJob[];
  health: DashboardHealth;
}

type UseDashboardProgressOptions = DashboardProgressState;

export function useDashboardProgress(initial: UseDashboardProgressOptions) {
  const [decks, setDecks] = useState(initial.decks);
  const [jobs, setJobs] = useState(initial.jobs);
  const [health, setHealth] = useState(initial.health);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(6000);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      setSyncing(true);
      try {
        const response = await fetch('/api/dashboard/progress', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load dashboard progress');
        }
        const payload = (await response.json()) as DashboardProgressState;
        if (cancelled) return;
        setDecks(payload.decks);
        setJobs(payload.jobs);
        setHealth(payload.health);
        setError(null);
        backoffRef.current = 6000;
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError('Live dashboard data is temporarily unavailable. Retrying…');
          backoffRef.current = Math.min(backoffRef.current * 1.5, 30000);
        }
      } finally {
        if (!cancelled) {
          setSyncing(false);
          timeoutRef.current = setTimeout(poll, backoffRef.current);
        }
      }
    }

    timeoutRef.current = setTimeout(poll, backoffRef.current);
    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { decks, jobs, health, syncing, error };
}

