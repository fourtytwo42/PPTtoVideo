'use client';

import { createGlobalStyle, DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    background: '#04010A',
    surface: 'rgba(12, 10, 24, 0.7)',
    surfaceStrong: 'rgba(31, 28, 53, 0.85)',
    primary: '#8C5CFF',
    secondary: '#24E4CE',
    accent: '#FF6F91',
    text: '#F5F4FF',
    muted: 'rgba(213, 210, 255, 0.7)'
  },
  layout: {
    maxWidth: '1200px'
  },
  radius: {
    xl: '32px',
    lg: '24px',
    md: '16px',
    sm: '12px'
  },
  shadows: {
    glow: '0 20px 60px rgba(118, 82, 255, 0.35)',
    soft: '0 12px 40px rgba(0, 0, 0, 0.35)'
  }
};

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: dark;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  html, body {
    padding: 0;
    margin: 0;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: radial-gradient(circle at top left, rgba(140, 92, 255, 0.25), transparent 45%),
      radial-gradient(circle at bottom right, rgba(36, 228, 206, 0.2), transparent 40%),
      #04010A;
    color: ${theme.colors.text};
    min-height: 100%;
  }

  body {
    line-height: 1.6;
  }

  main {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
`;

