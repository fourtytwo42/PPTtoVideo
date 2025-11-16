'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { theme as styledTheme } from './index';

// Material UI theme that matches the existing purple/teal design
export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8C5CFF', // Purple from existing theme
      light: '#B085FF',
      dark: '#6B3FD9',
      contrastText: '#0b0416',
    },
    secondary: {
      main: '#24E4CE', // Teal from existing theme
      light: '#5BFFE8',
      dark: '#1AB8A6',
      contrastText: '#0b0416',
    },
    error: {
      main: '#FF6F91', // Accent/pink from existing theme
      light: '#FF9BB4',
      dark: '#D94A6F',
    },
    warning: {
      main: '#FFC458', // Yellow/warning from existing theme
      light: '#FFD18A',
      dark: '#FFB626',
    },
    background: {
      default: '#04010A', // Background from existing theme
      paper: 'rgba(21, 18, 42, 0.72)', // SurfaceStrong-like
    },
    text: {
      primary: '#F5F4FF', // Text from existing theme
      secondary: 'rgba(213, 210, 255, 0.7)', // Muted from existing theme
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontFamily: 'var(--font-serif)',
      fontSize: 'clamp(2rem, 4vw, 2.6rem)',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: 'var(--font-serif)',
      fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: 'var(--font-serif)',
      fontSize: 'clamp(1.5rem, 2.5vw, 1.8rem)',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.35rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.2rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.05rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
      color: 'rgba(213, 210, 255, 0.76)',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.8rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'rgba(213, 210, 255, 0.7)',
    },
  },
  shape: {
    borderRadius: 12, // Matching sm radius
  },
  spacing: 8, // Material UI uses 8px base unit
  shadows: [
    'none',
    '0 2px 8px rgba(0, 0, 0, 0.1)',
    '0 4px 12px rgba(0, 0, 0, 0.15)',
    '0 8px 16px rgba(0, 0, 0, 0.2)',
    '0 12px 24px rgba(0, 0, 0, 0.25)',
    '0 12px 40px rgba(0, 0, 0, 0.35)', // soft shadow
    '0 16px 48px rgba(0, 0, 0, 0.4)',
    '0 20px 60px rgba(118, 82, 255, 0.35)', // glow shadow
    '0 24px 72px rgba(0, 0, 0, 0.5)',
    '0 28px 84px rgba(0, 0, 0, 0.55)',
    '0 32px 96px rgba(0, 0, 0, 0.6)',
    '0 36px 108px rgba(0, 0, 0, 0.65)',
    '0 40px 120px rgba(0, 0, 0, 0.7)',
    '0 44px 132px rgba(0, 0, 0, 0.75)',
    '0 48px 144px rgba(0, 0, 0, 0.8)',
    '0 52px 156px rgba(0, 0, 0, 0.85)',
    '0 56px 168px rgba(0, 0, 0, 0.9)',
    '0 60px 180px rgba(0, 0, 0, 0.95)',
    '0 64px 192px rgba(0, 0, 0, 1)',
    '0 68px 204px rgba(0, 0, 0, 1)',
    '0 72px 216px rgba(0, 0, 0, 1)',
    '0 76px 228px rgba(0, 0, 0, 1)',
    '0 80px 240px rgba(0, 0, 0, 1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // sm radius
          padding: '0.55rem 1.1rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95))',
          color: '#0b0416',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(140, 92, 255, 1), rgba(36, 228, 206, 1))',
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            background: 'rgba(140, 92, 255, 0.5)',
            color: 'rgba(11, 4, 22, 0.5)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.18)',
          color: 'rgba(213, 210, 255, 0.85)',
          '&:hover': {
            borderColor: 'rgba(140, 92, 255, 0.4)',
            background: 'rgba(140, 92, 255, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12, // sm radius
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.18)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.28)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8C5CFF',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(213, 210, 255, 0.7)',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            '&.Mui-focused': {
              color: '#8C5CFF',
            },
          },
          '& .MuiInputBase-input': {
            color: '#F5F4FF',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.28)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8C5CFF',
          },
        },
        select: {
          color: '#F5F4FF',
          padding: '0.6rem 0.75rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(21, 18, 42, 0.72)',
          borderRadius: 24, // lg radius
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(21, 18, 42, 0.72)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.05em',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(18, 14, 36, 0.92), rgba(9, 7, 22, 0.88))',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: 'none',
        },
      },
    },
  },
} as ThemeOptions);

export default muiTheme;

