'use client';

import styled from 'styled-components';

export const Section = styled.section<{ $variant?: 'default' | 'alt'; }>`
  position: relative;
  padding: clamp(4rem, 8vw, 7rem) 0;
  background: ${({ $variant, theme }) =>
    $variant === 'alt' ? 'rgba(11, 9, 26, 0.65)' : 'transparent'};
  overflow: hidden;
  scroll-margin-top: clamp(6rem, 12vw, 8rem);
`;

export const SectionInner = styled.div`
  width: min(90vw, ${({ theme }) => theme.layout.maxWidth});
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;
