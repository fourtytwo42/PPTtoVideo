'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchLatest = useCallback(async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/dashboard/progress', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load dashboard progress');
      }
      const payload = (await response.json()) as DashboardProgressState;
      if (!mountedRef.current) {
        return false;
      }
      setDecks(payload.decks);
      setJobs(payload.jobs);
      setHealth(payload.health);
      setError(null);
      backoffRef.current = 6000;
      return true;
    } catch (err) {
      if (mountedRef.current) {
        console.error(err);
        setError('Live dashboard data is temporarily unavailable. Retrying…');
        backoffRef.current = Math.min(backoffRef.current * 1.5, 30000);
      }
      return false;
    } finally {
      if (mountedRef.current) {
        setSyncing(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      await fetchLatest();
      if (!cancelled) {
        timeoutRef.current = setTimeout(poll, backoffRef.current);
      }
    }

    timeoutRef.current = setTimeout(poll, backoffRef.current);
    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchLatest]);

  const refresh = useCallback(async () => {
    await fetchLatest();
  }, [fetchLatest]);

  return { decks, jobs, health, syncing, error, refresh };
}

