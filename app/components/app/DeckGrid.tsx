'use client';

import Link from 'next/link';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Button,
  ButtonGroup,
  Alert,
  AlertTitle,
} from '@mui/material';
import { formatDuration, formatRelativeTime } from '@/lib/format';
import type { DeckSummary } from '@/lib/decks';
import { Card } from '@/app/components/ui/Card';

interface DeckGridProps {
  decks: DeckSummary[];
  disabled: boolean;
  syncing?: boolean;
  error?: string | null;
}

export function DeckGrid({ decks, disabled, syncing = false, error }: DeckGridProps) {
  const sortedDecks = [...decks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusVariant = (status: DeckSummary['status']): 'success' | 'info' | 'warning' | 'error' => {
    if (status === 'COMPLETE') return 'success';
    if (status === 'GENERATING') return 'info';
    if (status === 'FAILED') return 'error';
    return 'warning';
  };

  const statusLabel = (status: DeckSummary['status']): string => {
    if (status === 'READY_FOR_REVIEW') return 'Awaiting review';
    if (status === 'GENERATING') return 'Generating media';
    if (status === 'COMPLETE') return 'Complete';
    if (status === 'FAILED') return 'Attention required';
    return 'Ingesting';
  };

  const progressForDeck = (deck: DeckSummary) => deck.overallProgress;

  const stageVariant = (progress: number): 'default' | 'primary' | 'success' => {
    if (progress >= 0.999) return 'success';
    if (progress > 0) return 'primary';
    return 'default';
  };

  const stageColor = (progress: number): string => {
    if (progress >= 0.999) return '#8AFFEA';
    if (progress > 0) return '#CBB3FF';
    return '#FFD18A';
  };

  const stageBgColor = (progress: number): string => {
    if (progress >= 0.999) return 'rgba(36, 228, 206, 0.16)';
    if (progress > 0) return 'rgba(140, 92, 255, 0.16)';
    return 'rgba(255, 196, 88, 0.12)';
  };

  const stageBorderColor = (progress: number): string => {
    if (progress >= 0.999) return 'rgba(36, 228, 206, 0.45)';
    if (progress > 0) return 'rgba(140, 92, 255, 0.45)';
    return 'rgba(255, 196, 88, 0.45)';
  };

  const triggerJob = async (deckId: string, target: 'scripts' | 'audio' | 'video' | 'final') => {
    const response = await fetch(`/api/decks/${deckId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', target }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to queue job.');
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Chip
          label={syncing ? 'Syncing progress…' : 'Live data'}
          size="small"
          sx={{
            fontSize: '0.77rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            backgroundColor: syncing ? 'rgba(140, 92, 255, 0.18)' : 'transparent',
            color: syncing ? '#CBB3FF' : 'rgba(213, 210, 255, 0.7)',
          }}
        />
        {error && (
          <Typography variant="caption" sx={{ fontSize: '0.77rem', color: '#ff9bb4' }}>
            {error}
          </Typography>
        )}
      </Stack>
      {sortedDecks.map((deck) => (
        <Card key={deck.id} sx={{ padding: { xs: 2, sm: 2.5, md: 3 }, display: 'grid', gap: 1.75 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="h5" component="h3" sx={{ fontSize: '1.35rem', margin: 0 }}>
                {deck.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                {deck.sourceType} • {deck.slideCount} slides • Uploaded{' '}
                {formatRelativeTime(new Date(deck.createdAt).getTime())}
              </Typography>
            </Box>
            <Chip
              label={statusLabel(deck.status)}
              color={statusVariant(deck.status)}
              size="small"
              sx={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressForDeck(deck) * 100}
            sx={{
              height: 10,
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95))',
                borderRadius: '999px',
              },
            }}
          />

          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Chip
              label={`Scripts ${deck.stageProgress.scripts.ready}/${deck.stageProgress.scripts.total}`}
              size="small"
              sx={{
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                backgroundColor: stageBgColor(deck.stageProgress.scripts.progress),
                color: stageColor(deck.stageProgress.scripts.progress),
                border: `1px solid ${stageBorderColor(deck.stageProgress.scripts.progress)}`,
              }}
            />
            <Chip
              label={`Audio ${deck.stageProgress.audio.ready}/${deck.stageProgress.audio.total}`}
              size="small"
              sx={{
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                backgroundColor: stageBgColor(deck.stageProgress.audio.progress),
                color: stageColor(deck.stageProgress.audio.progress),
                border: `1px solid ${stageBorderColor(deck.stageProgress.audio.progress)}`,
              }}
            />
            <Chip
              label={`Video ${deck.stageProgress.video.ready}/${deck.stageProgress.video.total}`}
              size="small"
              sx={{
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                backgroundColor: stageBgColor(deck.stageProgress.video.progress),
                color: stageColor(deck.stageProgress.video.progress),
                border: `1px solid ${stageBorderColor(deck.stageProgress.video.progress)}`,
              }}
            />
            <Chip
              label={`Final ${deck.stageProgress.final.ready}/${deck.stageProgress.final.total}`}
              size="small"
              sx={{
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                backgroundColor: stageBgColor(deck.stageProgress.final.progress),
                color: stageColor(deck.stageProgress.final.progress),
                border: `1px solid ${stageBorderColor(deck.stageProgress.final.progress)}`,
              }}
            />
          </Stack>

          {deck.warnings.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <AlertTitle>Warnings</AlertTitle>
              <Box component="ul" sx={{ margin: 0, paddingLeft: 2.5, display: 'grid', gap: 0.5 }}>
                {deck.warnings.map((warning, index) => (
                  <Typography key={`${deck.id}-warning-${index}`} component="li" variant="body2">
                    {warning}
                  </Typography>
                ))}
              </Box>
            </Alert>
          )}

          <Stack direction="row" spacing={1.2} flexWrap="wrap" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            <Typography variant="body2" component="span">
              Mode: {deck.mode === 'REVIEW' ? 'Review workflow' : 'One-shot automation'}
            </Typography>
            <Typography variant="body2" component="span">Script model: {deck.scriptModel ?? 'Default'}</Typography>
            <Typography variant="body2" component="span">TTS model: {deck.ttsModel ?? 'Default'}</Typography>
            <Typography variant="body2" component="span">Voice: {deck.voiceLabel ?? 'Default voice'}</Typography>
            <Typography variant="body2" component="span">
              Runtime {formatDuration(deck.runtimeSeconds)}
              {deck.finalVideoPath ? '' : ` • Est. ${formatDuration(deck.estimatedSeconds)}`}
            </Typography>
            {deck.lastJobAt && (
              <Typography variant="body2" component="span">
                Last job {formatRelativeTime(new Date(deck.lastJobAt).getTime())}
              </Typography>
            )}
            {deck.finalVideoPath && (
              <Typography variant="body2" component="span">
                Final MP4 ready
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Button component={Link} href={`/deck/${deck.id}`} variant="outlined" size="small">
              Open workspace
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => triggerJob(deck.id, 'scripts')}
              disabled={disabled}
            >
              Regenerate scripts
            </Button>
            <Button variant="contained" size="small" onClick={() => triggerJob(deck.id, 'audio')} disabled={disabled}>
              Generate audio
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => triggerJob(deck.id, 'video')}
              disabled={disabled}
            >
              Render slides
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => triggerJob(deck.id, 'final')}
              disabled={disabled || !deck.readyVideo}
            >
              Build final video
            </Button>
            {deck.finalVideoPath && (
              <Button
                component="a"
                href={`/api/decks/${deck.id}/final`}
                variant="outlined"
                size="small"
                target="_blank"
              >
                Download final MP4
              </Button>
            )}
          </Stack>
        </Card>
      ))}
    </Box>
  );
}
