'use client';

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface HealthState {
  outOfOrder: boolean;
  message: string | null;
}

interface SystemOverview {
  health: HealthState;
  notifications: Notification[];
}

export function useSystemOverview(): SystemOverview {
  const [state, setState] = useState<SystemOverview>({
    health: { outOfOrder: false, message: null },
    notifications: [],
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const response = await fetch('/api/system/overview', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (isMounted) {
        setState({ health: data.health, notifications: data.notifications });
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return state;
}
