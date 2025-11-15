'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const Wrapper = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 3rem 1.5rem;
  background: radial-gradient(circle at top, rgba(140, 92, 255, 0.45), rgba(12, 10, 25, 0.92));
`;

const Card = styled.div`
  width: min(420px, 100%);
  background: rgba(15, 12, 28, 0.82);
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: clamp(2rem, 4vw, 2.8rem);
  display: grid;
  gap: 1.6rem;
  box-shadow: ${({ theme }) => theme.shadows.glow};
`;

const Heading = styled.h1`
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 4vw, 2.2rem);
`;

const Lead = styled.p`
  margin: 0;
  color: rgba(213, 210, 255, 0.75);
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(213, 210, 255, 0.65);
`;

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <Card>
        <header>
          <Heading>DeckForge Studio Access</Heading>
          <Lead>Sign in to orchestrate your automated slide-to-video workflows.</Lead>
        </header>
        {children}
        <Footer>
          <span>
            Need help?{' '}
            <Link href="/" style={{ color: '#8C5CFF', fontWeight: 600 }}>
              View product tour
            </Link>
          </span>
          <span>&copy; {new Date().getFullYear()} DeckForge</span>
        </Footer>
      </Card>
    </Wrapper>
  );
}

export default AuthShell;

