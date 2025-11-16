'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Box, Button, Container, Stack } from '@mui/material';

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
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: { xs: '1rem', sm: '1.5rem', md: '2.25rem' },
        left: '50%',
        transform: 'translateX(-50%)',
        width: { xs: '92vw', sm: 'min(92vw, 1200px)' },
        maxWidth: 1200,
        zIndex: 10,
      }}
    >
      <Container maxWidth={false}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 1.5 },
            padding: { xs: '0.75rem 1rem', sm: '0.8rem 1.25rem' },
            borderRadius: 3, // lg radius (24px)
            background: 'rgba(10, 6, 26, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 18px 40px rgba(6, 3, 20, 0.55)',
          }}
        >
          <Button
            component={Link}
            href="#hero"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              order: { xs: 1, md: 0 },
              '&:hover': {
                background: 'transparent',
              },
            }}
          >
            <Box
              sx={{
                width: '0.65rem',
                height: '0.65rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8C5CFF, #24E4CE)',
                boxShadow: '0 0 18px rgba(140, 92, 255, 0.65)',
              }}
            />
            DeckForge Studio
          </Button>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              justifyContent: 'center',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {navLinks.map(({ href, label }) => {
              const isActive = activeHref === href;
              return (
                <Button
                  key={href}
                  component={Link}
                  href={href}
                  sx={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: 1.5, // sm radius (12px)
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                    border: `1px solid ${isActive ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: isActive ? '#050313' : 'rgba(213, 210, 255, 0.7)',
                    background: isActive
                      ? 'linear-gradient(135deg, #8C5CFF, #24E4CE)'
                      : 'rgba(255, 255, 255, 0.04)',
                    textTransform: 'none',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
                      background: isActive
                        ? 'linear-gradient(135deg, #8C5CFF, #24E4CE)'
                        : 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Stack>

          <Button
            component={Link}
            href="/dashboard"
            variant="outlined"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 600,
              letterSpacing: '0.01em',
              padding: '0.6rem 1.1rem',
              borderRadius: 2, // md radius (16px)
              background: 'rgba(36, 228, 206, 0.12)',
              borderColor: 'rgba(36, 228, 206, 0.35)',
              color: '#24E4CE',
              backdropFilter: 'blur(14px)',
              textTransform: 'none',
              order: { xs: 2, md: 0 },
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: '#24E4CE',
                boxShadow: '0 16px 38px rgba(36, 228, 206, 0.25)',
                background: 'rgba(36, 228, 206, 0.18)',
              },
            }}
          >
            Launch console
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
