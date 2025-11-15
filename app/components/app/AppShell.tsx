'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { useSystemOverview } from '@/app/hooks/useSystemOverview';
import { signOut } from 'next-auth/react';
import type { Role } from '@prisma/client';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const NavBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
  background: linear-gradient(135deg, rgba(18, 14, 36, 0.92), rgba(9, 7, 22, 0.88));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const NavInner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 2rem;
  gap: 1.5rem;
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    font-family: var(--font-serif);
    font-size: clamp(1.1rem, 2vw, 1.35rem);
    letter-spacing: 0.04em;
  }

  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.muted};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 0.9rem;
  align-items: center;
`;

const NotificationBubble = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(140, 92, 255, 0.9), rgba(36, 228, 206, 0.9));
  color: #0b0416;
  font-weight: 600;
  letter-spacing: 0.05em;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 0.55rem 0.95rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.92rem;
  letter-spacing: 0.01em;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.muted)};
  background: ${({ $active }) => ($active ? 'rgba(140, 92, 255, 0.18)' : 'transparent')};
  box-shadow: ${({ theme, $active }) => ($active ? theme.shadows.glow : 'none')};

  &:hover {
    background: rgba(140, 92, 255, 0.15);
    color: ${({ theme }) => theme.colors.text};
  }
`;

const HealthTag = styled.span<{ $status: 'online' | 'offline' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === 'online' ? 'rgba(36, 228, 206, 0.14)' : 'rgba(255, 111, 145, 0.18)'};
  color: ${({ $status }) => ($status === 'online' ? '#8AFFE2' : '#FF8BA3')};
`;

const Banner = styled.div`
  background: linear-gradient(135deg, rgba(255, 111, 145, 0.2), rgba(255, 90, 90, 0.16));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.9rem 2rem;
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 0.95rem;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 2.4rem 2rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const navItems: { href: string; label: string; requireAdmin?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin', label: 'Admin Console', requireAdmin: true },
  { href: '/', label: 'Product Tour' }
];

const UserBadge = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  text-align: right;

  strong {
    font-size: 0.85rem;
    letter-spacing: 0.04em;
  }

  span {
    font-size: 0.75rem;
    color: rgba(213, 210, 255, 0.65);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const ExitButton = styled.button`
  padding: 0.4rem 0.85rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.25);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: rgba(140, 92, 255, 0.2);
    border-color: rgba(140, 92, 255, 0.4);
  }
`;

interface AppShellProps {
  children: ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const { health, notifications } = useSystemOverview();
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const handleSignOut = useCallback(() => {
    void signOut({ callbackUrl: '/login' });
  }, []);

  return (
    <Wrapper>
      <NavBar>
        <NavInner>
          <Brand>
            <strong>DeckForge Studio</strong>
            <span>Automation cockpit</span>
          </Brand>
          <NavLinks>
            {navItems
              .filter((item) => !item.requireAdmin || user.role === 'ADMIN')
              .map((item) => {
                const isDashboardRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/deck');
                const isActive =
                  item.href === '/dashboard'
                    ? isDashboardRoute
                    : item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href);
              return (
                <NavLink key={item.href} href={item.href} $active={isActive} prefetch>
                  {item.label}
                </NavLink>
              );
            })}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <NotificationBubble>{unreadNotifications}</NotificationBubble>
              <span style={{ fontSize: '0.8rem', color: 'rgba(213, 210, 255, 0.7)', letterSpacing: '0.08em' }}>
                alerts
              </span>
            </span>
          </NavLinks>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <UserBadge>
              <strong>{user.name}</strong>
              <span>{user.role === 'ADMIN' ? 'Admin' : 'User'}</span>
            </UserBadge>
            <ExitButton type="button" onClick={handleSignOut}>
              Sign out
            </ExitButton>
          </div>
          <HealthTag $status={health.outOfOrder ? 'offline' : 'online'}>
            <span
              style={{
                display: 'inline-block',
                width: '0.55rem',
                height: '0.55rem',
                borderRadius: '50%',
                background: health.outOfOrder ? '#FF6F91' : '#24E4CE'
              }}
            />
            {health.outOfOrder ? 'Service interruption' : 'All systems operational'}
          </HealthTag>
        </NavInner>
        {health.outOfOrder && (
          <Banner>
            {health.message ?? 'A dependent service is unavailable. Generation actions are temporarily paused.'}
          </Banner>
        )}
      </NavBar>
      <Main>{children}</Main>
    </Wrapper>
  );
}
