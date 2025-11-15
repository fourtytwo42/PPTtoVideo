'use client';

import styled from 'styled-components';

export const GlowCard = styled.div<{ $accent?: 'primary' | 'secondary' | 'accent' }>`
  position: relative;
  padding: clamp(1.8rem, 2.5vw, 2.6rem);
  border-radius: ${({ theme }) => theme.radius.lg};
  background: linear-gradient(135deg, rgba(26, 22, 47, 0.9), rgba(14, 12, 28, 0.82));
  box-shadow: ${({ theme }) => theme.shadows.soft};
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: -30% 10% auto;
    height: 60%;
    background: ${({ theme, $accent = 'primary' }) =>
      $accent === 'primary'
        ? `radial-gradient(circle, ${theme.colors.primary}33, transparent 60%)`
        : $accent === 'secondary'
        ? `radial-gradient(circle, ${theme.colors.secondary}33, transparent 60%)`
        : `radial-gradient(circle, ${theme.colors.accent}33, transparent 60%)`};
    filter: blur(60px);
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;
