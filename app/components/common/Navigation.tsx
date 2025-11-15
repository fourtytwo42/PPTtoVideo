'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const navLinks = [
  { href: '#hero', label: 'Overview' },
  { href: '#pipeline', label: 'Pipeline' },
  { href: '#flows', label: 'Modes' },
  { href: '#experience', label: 'Experience' },
  { href: '#admin', label: 'Admin' },
  { href: '#workers', label: 'Operations' },
  { href: '#security', label: 'Security' },
  { href: '#future', label: 'Roadmap' }
] as const;

const Wrapper = styled.nav`
  position: fixed;
  top: clamp(1rem, 3vw, 2.25rem);
  left: 50%;
  transform: translateX(-50%);
  width: min(92vw, ${({ theme }) => theme.layout.maxWidth});
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0.8rem 1.25rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: rgba(10, 6, 26, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 40px rgba(6, 3, 20, 0.55);
  z-index: 10;

  @media (max-width: 960px) {
    gap: 1rem;
    padding: 0.75rem 1rem;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  color: #ffffff;
  white-space: nowrap;

  @media (max-width: 960px) {
    order: 1;
  }
`;

const BrandAccent = styled.span`
  display: inline-block;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 999px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) =>
    theme.colors.secondary});
  box-shadow: 0 0 18px rgba(140, 92, 255, 0.65);
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0;
  margin: 0;
  list-style: none;
  flex: 1 1 auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 960px) {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  border: 1px solid;
  border-color: ${({ $active }) => ($active ? 'transparent' : 'rgba(255, 255, 255, 0.1)')};
  color: ${({ $active, theme }) => ($active ? '#050313' : theme.colors.muted)};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
      : 'rgba(255, 255, 255, 0.04)'};
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.soft};
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.6rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: rgba(36, 228, 206, 0.12);
  border: 1px solid rgba(36, 228, 206, 0.35);
  color: ${({ theme }) => theme.colors.secondary};
  backdrop-filter: blur(14px);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  @media (max-width: 960px) {
    order: 2;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 16px 38px rgba(36, 228, 206, 0.25);
  }
`;

export function Navigation() {
  const [activeHref, setActiveHref] = useState<string>(navLinks[0].href);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0.15
      }
    );

    navLinks.forEach(({ href }) => {
      const section = document.querySelector<HTMLElement>(href);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Wrapper>
      <Brand href="#hero">
        <BrandAccent /> DeckForge Studio
      </Brand>
      <NavList>
        {navLinks.map(({ href, label }) => (
          <li key={href}>
            <NavLink href={href} $active={activeHref === href}>
              {label}
            </NavLink>
          </li>
        ))}
      </NavList>
      <CTAButton href="/dashboard">Launch console</CTAButton>
    </Wrapper>
  );
}
