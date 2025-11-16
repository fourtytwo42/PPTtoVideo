'use client';

import { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyle, theme } from '@/theme';
import { muiTheme } from '@/theme/mui-theme';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <StyledThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default AppProviders;


