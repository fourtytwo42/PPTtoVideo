'use client';

import styled from 'styled-components';

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surfaceStrong};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: clamp(1.6rem, 3vw, 2.2rem);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 1.2rem;
  height: 100%;
`;

const List = styled.div`
  display: grid;
  gap: 0.9rem;
`;

const Item = styled.div`
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: rgba(36, 30, 64, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Title = styled.span`
  font-weight: 600;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.muted};
  text-transform: uppercase;
`;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  return (
    <Panel>
      <div>
        <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>Operations feed</h3>
        <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.7)', fontSize: '0.9rem' }}>
          Track health alerts, job completions, and admin interventions in real time.
        </p>
      </div>
      <List>
        {notifications.length === 0 && <p style={{ margin: 0, color: 'rgba(213,210,255,0.6)' }}>No alerts yet.</p>}
        {notifications.map((notification) => (
          <Item key={notification.id}>
            <Title>{notification.title}</Title>
            <span style={{ color: 'rgba(213, 210, 255, 0.75)', fontSize: '0.9rem' }}>{notification.message}</span>
            <Timestamp>{new Date(notification.createdAt).toLocaleString()}</Timestamp>
          </Item>
        ))}
      </List>
    </Panel>
  );
}
