'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from '@/theme';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}

export default AppProviders;


