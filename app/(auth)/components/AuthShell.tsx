'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Card } from '@/app/components/ui/Card';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 3,
        background: 'radial-gradient(circle at top, rgba(140, 92, 255, 0.45), rgba(12, 10, 25, 0.92))',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            padding: { xs: 3, sm: 3.5 },
            display: 'grid',
            gap: 2,
          }}
        >
          <Box component="header" sx={{ display: 'grid', gap: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontFamily: 'var(--font-serif)',
                fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
                margin: 0,
              }}
            >
              DeckForge Studio Access
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(213, 210, 255, 0.75)' }}>
              Sign in to orchestrate your automated slide-to-video workflows.
            </Typography>
          </Box>
          {children}
          <Box
            component="footer"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: 'rgba(213, 210, 255, 0.65)',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="caption" component="span">
              Need help?{' '}
              <Link href="/" style={{ color: '#8C5CFF', fontWeight: 600, textDecoration: 'none' }}>
                View product tour
              </Link>
            </Typography>
            <Typography variant="caption" component="span">
              &copy; {new Date().getFullYear()} DeckForge
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default AuthShell;


