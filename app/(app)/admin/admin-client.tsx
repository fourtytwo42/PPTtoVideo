'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  AlertTitle,
  Stack,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { formatRelativeTime } from '@/lib/format';
import { Card } from '@/app/components/ui/Card';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { LoadingButton } from '@/app/components/ui/LoadingButton';

interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
}

interface VoiceSummary {
  id: string;
  name: string;
  category?: string;
  previewUrl?: string;
}

interface HealthCheck {
  id: string;
  label: string;
  status: 'ok' | 'warning' | 'error';
  detail?: string;
}

const actionHints: Record<string, { title: string; instruction: string; targetId?: string }> = {
  openai: {
    title: 'Configure OpenAI',
    instruction: 'Add your OpenAI API key and default model in the OpenAI configuration section.',
    targetId: 'openai-config',
  },
  elevenlabs: {
    title: 'Configure ElevenLabs',
    instruction: 'Add the ElevenLabs API key, set model defaults, and sync voices.',
    targetId: 'elevenlabs-config',
  },
  redis: {
    title: 'Connect Redis',
    instruction: 'Ensure the REDIS_URL points to a reachable Redis instance. Restart workers after updating.',
  },
  database: {
    title: 'Database connectivity',
    instruction: 'Verify DATABASE_URL is correct and Prisma migrations have been applied.',
  },
  storage: {
    title: 'File storage permissions',
    instruction: 'Grant write access to FILE_STORAGE_ROOT so uploads and renders can be saved.',
  },
  ffmpeg: {
    title: 'Install FFmpeg',
    instruction: 'Install ffmpeg or set FFMPEG_PATH so slide videos can render.',
  },
  ffprobe: {
    title: 'Install FFprobe',
    instruction: 'Install ffprobe or set FFPROBE_PATH for duration probing.',
  },
  libreoffice: {
    title: 'Install LibreOffice',
    instruction: 'LibreOffice is required to rasterize PPTX slides on ingestion.',
  },
  pdftoppm: {
    title: 'Install pdftoppm',
    instruction: 'Install poppler-utils (pdftoppm) so PDFs can render slide images.',
  },
};

interface AdminConsoleClientProps {
  users: UserSummary[];
  auditLogs: AuditEntry[];
}

export default function AdminConsoleClient({ users, auditLogs }: AdminConsoleClientProps) {
  const [settings, setSettings] = useState({
    defaultOpenAIModel: 'gpt-4o-mini',
    openaiApiKey: '',
    openaiSystemPrompt:
      'You are a narration specialist. Rewrite the slide content into a concise, engaging spoken script that preserves every important detail.',
    defaultTTSModel: 'eleven_flash_v2_5',
    elevenlabsApiKey: '',
    defaultVoiceId: '',
    defaultVoiceLabel: '',
    maxFileSizeMB: 200,
    maxSlides: 200,
    concurrencyLimitPerUser: 3,
    defaultMode: 'REVIEW',
  });
  const [saving, setSaving] = useState(false);
  const [openAiAllowlistText, setOpenAiAllowlistText] = useState('');
  const [ttsAllowlistText, setTtsAllowlistText] = useState('');
  const [voices, setVoices] = useState<VoiceSummary[]>([]);
  const [syncingVoices, setSyncingVoices] = useState(false);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthCheckedAt, setHealthCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const openAiAllowlist = Array.isArray(data.openaiModelAllowlist)
        ? data.openaiModelAllowlist.map((entry: unknown) => String(entry))
        : [];
      const ttsAllowlist = Array.isArray(data.elevenlabsModelAllowlist)
        ? data.elevenlabsModelAllowlist.map((entry: unknown) => String(entry))
        : [];
      const voiceList: VoiceSummary[] = Array.isArray(data.elevenlabsVoices)
        ? data.elevenlabsVoices
            .map((voice: unknown) => {
              if (!voice || typeof voice !== 'object') return null;
              const record = voice as Record<string, unknown>;
              const id =
                typeof record.id === 'string'
                  ? record.id
                  : typeof record.voice_id === 'string'
                  ? (record.voice_id as string)
                  : undefined;
              const name = typeof record.name === 'string' ? record.name : undefined;
              if (!id || !name) return null;
              return {
                id,
                name,
                category: typeof record.category === 'string' ? record.category : undefined,
                previewUrl:
                  typeof record.previewUrl === 'string'
                    ? record.previewUrl
                    : typeof record.preview_url === 'string'
                    ? (record.preview_url as string)
                    : undefined,
              };
            })
            .filter((voice: VoiceSummary | null): voice is VoiceSummary => Boolean(voice))
        : [];

      setSettings((prev) => ({
        ...prev,
        defaultOpenAIModel: data.defaultOpenAIModel ?? prev.defaultOpenAIModel,
        openaiApiKey: data.openaiApiKey ?? prev.openaiApiKey,
        openaiSystemPrompt: data.openaiSystemPrompt ?? prev.openaiSystemPrompt,
        defaultTTSModel: data.defaultTTSModel ?? prev.defaultTTSModel,
        elevenlabsApiKey: data.elevenlabsApiKey ?? prev.elevenlabsApiKey,
        defaultVoiceId: data.defaultVoiceId ?? prev.defaultVoiceId,
        defaultVoiceLabel: data.defaultVoiceLabel ?? prev.defaultVoiceLabel,
        maxFileSizeMB: Number(data.maxFileSizeMB ?? prev.maxFileSizeMB),
        maxSlides: Number(data.maxSlides ?? prev.maxSlides),
        concurrencyLimitPerUser: Number(data.concurrencyLimitPerUser ?? prev.concurrencyLimitPerUser),
        defaultMode: (data.defaultMode as 'REVIEW' | 'ONE_SHOT') ?? prev.defaultMode,
      }));
      setOpenAiAllowlistText(openAiAllowlist.join('\n'));
      setTtsAllowlistText(ttsAllowlist.join('\n'));
      setVoices(voiceList);
    }
    load();
  }, []);

  const refreshHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const response = await fetch('/api/admin/health', { cache: 'no-store' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Unable to load platform health.');
      }
      const data = await response.json();
      const checks = Array.isArray(data.checks) ? (data.checks as HealthCheck[]) : [];
      const ordered = [...checks].sort((a, b) => {
        const rank = (status: HealthCheck['status']) => (status === 'error' ? 0 : status === 'warning' ? 1 : 2);
        return rank(a.status) - rank(b.status);
      });
      setHealthChecks(ordered);
      setHealthCheckedAt(new Date().toISOString());
    } catch (error) {
      console.error(error);
      setHealthError(error instanceof Error ? error.message : 'Unable to load platform health.');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const handleSave = async () => {
    setSaving(true);
    const openAiAllowlist = openAiAllowlistText
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    const ttsAllowlist = ttsAllowlistText
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    const selectedVoice =
      voices.find((voice) => voice.id === settings.defaultVoiceId) ?? voices[0] ?? { id: '', name: '' };

    const ensureDefault = (list: string[], value: string) =>
      value && !list.includes(value) ? [value, ...list] : list;

    const payload = {
      ...settings,
      openaiModelAllowlist: ensureDefault(openAiAllowlist, settings.defaultOpenAIModel),
      elevenlabsModelAllowlist: ensureDefault(ttsAllowlist, settings.defaultTTSModel),
      defaultVoiceId: selectedVoice.id,
      defaultVoiceLabel: selectedVoice.name,
    };

    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
  };

  const syncVoices = async () => {
    setSyncingVoices(true);
    const response = await fetch('/api/admin/voices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync' }),
    });
    if (response.ok) {
      const payload = await response.json();
      const voiceList: VoiceSummary[] = Array.isArray(payload.voices)
        ? payload.voices
            .map((voice: unknown) => {
              if (!voice || typeof voice !== 'object') return null;
              const record = voice as Record<string, unknown>;
              const id =
                typeof record.id === 'string'
                  ? record.id
                  : typeof record.voice_id === 'string'
                  ? (record.voice_id as string)
                  : undefined;
              const name = typeof record.name === 'string' ? record.name : undefined;
              if (!id || !name) return null;
              return {
                id,
                name,
                category: typeof record.category === 'string' ? record.category : undefined,
                previewUrl: typeof record.previewUrl === 'string' ? record.previewUrl : undefined,
              };
            })
            .filter((voice: VoiceSummary | null): voice is VoiceSummary => Boolean(voice))
        : [];
      setVoices(voiceList);
      if (voiceList.length && !voiceList.some((voice) => voice.id === settings.defaultVoiceId)) {
        setSettings((prev) => ({ ...prev, defaultVoiceId: voiceList[0].id, defaultVoiceLabel: voiceList[0].name }));
      }
    } else {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to sync voices.');
    }
    setSyncingVoices(false);
  };

  const getHealthSeverity = (status: HealthCheck['status']): 'success' | 'warning' | 'error' => {
    if (status === 'ok') return 'success';
    if (status === 'warning') return 'warning';
    return 'error';
  };

  return (
    <Box component="section" sx={{ display: 'grid', gap: 2.75 }}>
      <PageHeader
        title="Admin console"
        subtitle="Configure default models, voice catalogs, access controls, and inspect audit history for DeckForge Studio."
      />

      <Card id="platform-health" sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.75 }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.4rem', margin: 0 }}>
          Platform health
        </Typography>
        <Stack spacing={1}>
          {healthChecks.length === 0 && !healthLoading && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Diagnostics will appear once checks complete.
            </Typography>
          )}
          {healthChecks.map((check) => (
            <Alert
              key={check.id}
              severity={getHealthSeverity(check.status)}
              icon={
                <Box
                  sx={{
                    width: '0.65rem',
                    height: '0.65rem',
                    borderRadius: '50%',
                    background:
                      check.status === 'ok' ? '#24E4CE' : check.status === 'warning' ? '#FFC458' : '#FF6F91',
                  }}
                />
              }
              sx={{
                backgroundColor:
                  check.status === 'ok'
                    ? 'rgba(36, 228, 206, 0.14)'
                    : check.status === 'warning'
                    ? 'rgba(255, 196, 88, 0.14)'
                    : 'rgba(255, 111, 145, 0.14)',
                borderColor:
                  check.status === 'ok'
                    ? 'rgba(36, 228, 206, 0.45)'
                    : check.status === 'warning'
                    ? 'rgba(255, 196, 88, 0.45)'
                    : 'rgba(255, 111, 145, 0.45)',
              }}
            >
              <AlertTitle>{check.label}</AlertTitle>
              {check.detail ??
                (check.status === 'ok'
                  ? 'All good'
                  : check.status === 'warning'
                  ? 'Warning detected'
                  : 'Requires attention')}
            </Alert>
          ))}
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <LoadingButton variant="outlined" onClick={refreshHealth} loading={healthLoading}>
            Run diagnostics
          </LoadingButton>
          <Typography variant="caption" sx={{ fontSize: '0.8rem', color: 'rgba(213,210,255,0.65)' }}>
            {healthError
              ? healthError
              : healthCheckedAt
              ? `Last checked ${new Date(healthCheckedAt).toLocaleTimeString()}`
              : 'Awaiting first check'}
          </Typography>
        </Box>
        {healthChecks.some((check) => check.status !== 'ok') && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="h6" component="h4" sx={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>
              Setup checklist
            </Typography>
            <Box component="ul" sx={{ margin: 0, paddingLeft: 2.5, display: 'grid', gap: 0.5 }}>
              {healthChecks
                .filter((check) => check.status !== 'ok')
                .map((check) => {
                  const hint = actionHints[check.id];
                  return (
                    <Box key={`action-${check.id}`} component="li">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {hint?.title ?? check.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {hint?.instruction ?? check.detail ?? 'Review diagnostics above.'}
                      </Typography>
                      {hint?.targetId && (
                        <MuiLink
                          component="button"
                          type="button"
                          onClick={() => {
                            if (!hint?.targetId) return;
                            document.getElementById(hint.targetId)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          sx={{
                            fontSize: '0.85rem',
                            textDecoration: 'underline',
                            color: 'primary.main',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            padding: 0,
                          }}
                        >
                          Jump to configuration
                        </MuiLink>
                      )}
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}
      </Card>

      <Card id="openai-config" sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.75 }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.4rem', margin: 0 }}>
          OpenAI configuration
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="API key"
              type="password"
              fullWidth
              value={settings.openaiApiKey}
              onChange={(event) => setSettings((prev) => ({ ...prev, openaiApiKey: event.target.value }))}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Default model"
              fullWidth
              value={settings.defaultOpenAIModel}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultOpenAIModel: event.target.value }))}
              size="small"
              list="openai-models"
            />
            <datalist id="openai-models">
              {openAiAllowlistText
                .split(/\r?\n|,/)
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0)
                .map((model) => (
                  <option key={model} value={model} />
                ))}
            </datalist>
          </Grid>
        </Grid>
        <TextField
          label="Allowed models (one per line)"
          multiline
          rows={4}
          fullWidth
          value={openAiAllowlistText}
          onChange={(event) => setOpenAiAllowlistText(event.target.value)}
          size="small"
        />
        <TextField
          label="System prompt"
          multiline
          rows={4}
          fullWidth
          value={settings.openaiSystemPrompt}
          onChange={(event) => setSettings((prev) => ({ ...prev, openaiSystemPrompt: event.target.value }))}
          size="small"
        />
      </Card>

      <Card id="elevenlabs-config" sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.75 }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.4rem', margin: 0 }}>
          ElevenLabs configuration
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="API key"
              type="password"
              fullWidth
              value={settings.elevenlabsApiKey}
              onChange={(event) => setSettings((prev) => ({ ...prev, elevenlabsApiKey: event.target.value }))}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Default TTS model"
              fullWidth
              value={settings.defaultTTSModel}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultTTSModel: event.target.value }))}
              size="small"
              list="tts-models"
            />
            <datalist id="tts-models">
              {ttsAllowlistText
                .split(/\r?\n|,/)
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0)
                .map((model) => (
                  <option key={model} value={model} />
                ))}
            </datalist>
          </Grid>
        </Grid>
        <TextField
          label="Allowed TTS models (one per line)"
          multiline
          rows={4}
          fullWidth
          value={ttsAllowlistText}
          onChange={(event) => setTtsAllowlistText(event.target.value)}
          size="small"
        />
        <TextField
          label="Default voice"
          select
          fullWidth
          value={settings.defaultVoiceId}
          onChange={(event) => {
            const selected = voices.find((voice) => voice.id === event.target.value);
            setSettings((prev) => ({
              ...prev,
              defaultVoiceId: event.target.value,
              defaultVoiceLabel: selected?.name ?? prev.defaultVoiceLabel,
            }));
          }}
          size="small"
          SelectProps={{
            native: true,
          }}
        >
          {voices.length === 0 && <option value="">No voices synced</option>}
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </TextField>
        <LoadingButton
          variant="outlined"
          onClick={syncVoices}
          loading={syncingVoices}
          disabled={!settings.elevenlabsApiKey}
        >
          Sync voices from ElevenLabs
        </LoadingButton>
        {voices.length > 0 && (
          <Stack spacing={0.5}>
            {voices.map((voice) => (
              <Box
                key={voice.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 1.5,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(12, 10, 28, 0.6)',
                }}
              >
                <Box>
                  <Typography variant="body2" component="strong" sx={{ fontWeight: 600 }}>
                    {voice.name}
                  </Typography>
                  {voice.category && (
                    <Typography variant="caption" component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                      • {voice.category}
                    </Typography>
                  )}
                </Box>
                {voice.previewUrl ? (
                  <audio controls preload="none" src={voice.previewUrl} style={{ width: 140, height: 32 }}>
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    No preview available
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      <Card sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.75 }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.4rem', margin: 0 }}>
          Pipeline defaults & limits
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Soft limit: file size (MB)"
              type="number"
              fullWidth
              value={settings.maxFileSizeMB}
              onChange={(event) => setSettings((prev) => ({ ...prev, maxFileSizeMB: Number(event.target.value) }))}
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Soft limit: slides per deck"
              type="number"
              fullWidth
              value={settings.maxSlides}
              onChange={(event) => setSettings((prev) => ({ ...prev, maxSlides: Number(event.target.value) }))}
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Concurrent jobs per user"
              type="number"
              fullWidth
              value={settings.concurrencyLimitPerUser}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, concurrencyLimitPerUser: Number(event.target.value) }))
              }
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Default processing mode"
              select
              fullWidth
              value={settings.defaultMode}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, defaultMode: event.target.value as 'REVIEW' | 'ONE_SHOT' }))
              }
              size="small"
              SelectProps={{
                native: true,
              }}
            >
              <option value="REVIEW">Review first</option>
              <option value="ONE_SHOT">One-shot automation</option>
            </TextField>
          </Grid>
        </Grid>
        <LoadingButton variant="contained" onClick={handleSave} loading={saving}>
          Save changes
        </LoadingButton>
      </Card>

      <Card sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.75 }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.4rem', margin: 0 }}>
          User directory
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Joined
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{formatRelativeTime(new Date(user.createdAt).getTime())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card sx={{ padding: { xs: 2, sm: 2.5, md: 2.75 }, display: 'grid', gap: 1.75 }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.4rem', margin: 0 }}>
          Audit log
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Time
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Actor
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Action
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Entity
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatRelativeTime(new Date(entry.createdAt).getTime())}</TableCell>
                  <TableCell>{entry.actor ? `${entry.actor.name} (${entry.actor.email})` : 'System'}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell>
                    {entry.entityType} – {entry.entityId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
