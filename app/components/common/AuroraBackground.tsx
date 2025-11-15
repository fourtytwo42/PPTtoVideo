'use client';

import styled, { keyframes } from 'styled-components';

const drift = keyframes`
  0% {
    transform: translate3d(-10%, -12%, 0) scale(1);
  }
  50% {
    transform: translate3d(8%, 10%, 0) scale(1.1);
  }
  100% {
    transform: translate3d(-10%, -12%, 0) scale(1);
  }
`;

const driftAlt = keyframes`
  0% {
    transform: translate3d(12%, 14%, 0) scale(1.05);
  }
  50% {
    transform: translate3d(-8%, -18%, 0) scale(1.15);
  }
  100% {
    transform: translate3d(12%, 14%, 0) scale(1.05);
  }
`;

const twinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
`;

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`;

const Glow = styled.span<{ $variant: 'primary' | 'secondary' | 'accent' }>`
  position: absolute;
  width: 55vw;
  height: 55vw;
  filter: blur(160px);
  opacity: 0.55;
  mix-blend-mode: screen;
  border-radius: 50%;
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'secondary':
        return `radial-gradient(circle, ${theme.colors.secondary} 0%, transparent 65%)`;
      case 'accent':
        return `radial-gradient(circle, ${theme.colors.accent} 0%, transparent 65%)`;
      default:
        return `radial-gradient(circle, ${theme.colors.primary} 0%, transparent 65%)`;
    }
  }};

  &:nth-of-type(1) {
    top: -20vw;
    right: -10vw;
    animation: ${drift} 28s ease-in-out infinite;
  }

  &:nth-of-type(2) {
    bottom: -25vw;
    left: -10vw;
    animation: ${driftAlt} 32s ease-in-out infinite;
    opacity: 0.45;
  }

  &:nth-of-type(3) {
    top: 30vh;
    left: 30vw;
    width: 45vw;
    height: 45vw;
    animation: ${drift} 36s ease-in-out infinite reverse;
    opacity: 0.35;
  }
`;

const Starfield = styled.div`
  position: absolute;
  inset: -50%;
  background-image: radial-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 0),
    radial-gradient(rgba(140, 92, 255, 0.28) 1px, transparent 0);
  background-size: 260px 260px, 200px 200px;
  animation: ${twinkle} 18s ease-in-out infinite;
  opacity: 0.28;
`;

export function AuroraBackground() {
  return (
    <Wrapper aria-hidden>
      <Glow $variant="primary" />
      <Glow $variant="secondary" />
      <Glow $variant="accent" />
      <Starfield />
    </Wrapper>
  );
}
