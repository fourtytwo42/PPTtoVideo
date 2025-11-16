'use client';

import { Box, Typography, Stack, Button, CardContent } from '@mui/material';
import Link from 'next/link';
import type { DeckSummary } from '@/lib/decks';
import { formatDuration, formatRelativeTime } from '@/lib/format';
import { Card } from '@/app/components/ui/Card';

interface DownloadCenterProps {
  decks: DeckSummary[];
}

export function DownloadCenter({ decks }: DownloadCenterProps) {
  const readyDecks = decks
    .filter((deck) => deck.finalVideoPath)
    .sort(
      (a, b) =>
        new Date(b.lastJobAt ?? b.createdAt).getTime() - new Date(a.lastJobAt ?? a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <Card>
      <CardContent sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.25 }}>
        <Box>
          <Typography variant="h5" component="h3" sx={{ fontFamily: 'var(--font-serif)', margin: 0, mb: 0.5 }}>
            Downloads
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(213, 210, 255, 0.7)' }}>
            Grab final renders without leaving the dashboard. Recent MP4 builds appear here as soon as assembly
            completes.
          </Typography>
        </Box>
        <Stack spacing={1}>
        {readyDecks.length === 0 && (
          <Typography variant="body2" sx={{ color: 'rgba(213,210,255,0.6)' }}>
            No final renders yet. Finish assembling to see downloads.
          </Typography>
        )}
        {readyDecks.map((deck) => (
          <Box
            key={deck.id}
            sx={{
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(21, 18, 42, 0.7)',
              padding: '0.9rem 1rem',
              display: 'grid',
              gap: 0.5,
            }}
          >
            <Typography variant="body2" component="strong" sx={{ fontWeight: 600 }}>
              {deck.title}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'rgba(213,210,255,0.8)' }}>
              {formatDuration(deck.runtimeSeconds)} • {formatRelativeTime(new Date(deck.createdAt).getTime())}
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Button
                component="a"
                href={`/api/decks/${deck.id}/final`}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
                size="small"
                sx={{
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  borderColor: 'rgba(140, 92, 255, 0.45)',
                  color: '#cbb3ff',
                }}
              >
                Download MP4
              </Button>
              <Button
                component={Link}
                href={`/deck/${deck.id}`}
                variant="outlined"
                size="small"
                sx={{
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  borderColor: 'rgba(140, 92, 255, 0.45)',
                  color: '#cbb3ff',
                }}
              >
                Open workspace
              </Button>
            </Stack>
          </Box>
        ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
