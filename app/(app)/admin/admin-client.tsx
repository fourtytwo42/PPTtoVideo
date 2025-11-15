'use client';

import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { formatRelativeTime } from '@/lib/format';

const Page = styled.section`
  display: grid;
  gap: 2.2rem;
`;

const Section = styled.section`
  background: rgba(21, 18, 42, 0.72);
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: clamp(1.6rem, 2.4vw, 2.2rem);
  display: grid;
  gap: 1.4rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.4rem;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(213, 210, 255, 0.76);
`;

const Input = styled.input`
  padding: 0.6rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  padding: 0.6rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  padding: 0.6rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: ${({ theme }) => theme.colors.text};
  min-height: 120px;
`;

const Button = styled.button`
  padding: 0.65rem 1.2rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: none;
  background: linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95));
  color: #0b0416;
  cursor: pointer;
  font-weight: 600;
  width: fit-content;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const OutlineButton = styled(Button)`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: ${({ theme }) => theme.colors.text};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: rgba(213, 210, 255, 0.85);
`;

const Th = styled.th`
  text-align: left;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding-bottom: 0.6rem;
  color: rgba(213, 210, 255, 0.7);
`;

const Td = styled.td`
  padding: 0.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const VoiceList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.4rem;
`;

const VoiceItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 10, 28, 0.6);
  font-size: 0.85rem;
`;

const VoiceMeta = styled.span`
  color: rgba(213, 210, 255, 0.7);
  font-size: 0.75rem;
`;

const AudioPreview = styled.audio`
  width: 140px;
  height: 32px;
`;

const HealthList = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const HealthItem = styled.div<{ $status: 'ok' | 'warning' | 'error' }>`
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid
    ${({ $status }) =>
      $status === 'ok'
        ? 'rgba(36, 228, 206, 0.45)'
        : $status === 'warning'
        ? 'rgba(255, 196, 88, 0.45)'
        : 'rgba(255, 111, 145, 0.45)'};
  background: rgba(15, 12, 32, 0.75);
  padding: 0.85rem 1rem;
  display: grid;
  gap: 0.35rem;
`;

const HealthLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 600;
`;

const StatusDot = styled.span<{ $status: 'ok' | 'warning' | 'error' }>`
  display: inline-block;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: ${({ $status }) =>
    $status === 'ok' ? '#24E4CE' : $status === 'warning' ? '#FFC458' : '#FF6F91'};
`;

const HealthDetail = styled.span`
  font-size: 0.85rem;
  color: rgba(213, 210, 255, 0.75);
`;

const ActionList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.45rem;
  color: rgba(213, 210, 255, 0.8);
`;

const ActionLink = styled.button`
  background: none;
  border: none;
  color: #8c5cff;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 0;
`;

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

const actionHints: Record<
  string,
  { title: string; instruction: string; targetId?: string }
> = {
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

  return (
    <Page>
      <header style={{ display: 'grid', gap: '0.6rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', margin: 0 }}>Admin console</h1>
        <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.75)', maxWidth: '48rem' }}>
          Configure default models, voice catalogs, access controls, and inspect audit history for DeckForge Studio.
        </p>
      </header>

      <Section>
        <SectionTitle>Platform health</SectionTitle>
        <HealthList>
          {healthChecks.length === 0 && !healthLoading && (
            <HealthDetail>Diagnostics will appear once checks complete.</HealthDetail>
          )}
          {healthChecks.map((check) => (
            <HealthItem key={check.id} $status={check.status}>
              <HealthLabel>
                <StatusDot $status={check.status} />
                {check.label}
              </HealthLabel>
              <HealthDetail>
                {check.detail ??
                  (check.status === 'ok'
                    ? 'All good'
                    : check.status === 'warning'
                    ? 'Warning detected'
                    : 'Requires attention')}
              </HealthDetail>
            </HealthItem>
          ))}
        </HealthList>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          <OutlineButton type="button" onClick={refreshHealth} disabled={healthLoading}>
            {healthLoading ? 'Checking…' : 'Run diagnostics'}
          </OutlineButton>
          <span style={{ fontSize: '0.8rem', color: 'rgba(213,210,255,0.65)' }}>
            {healthError
              ? healthError
              : healthCheckedAt
              ? `Last checked ${new Date(healthCheckedAt).toLocaleTimeString()}`
              : 'Awaiting first check'}
          </span>
        </div>
        {healthChecks.some((check) => check.status !== 'ok') && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.4rem' }}>Setup checklist</h4>
            <ActionList>
              {healthChecks
                .filter((check) => check.status !== 'ok')
                .map((check) => {
                  const hint = actionHints[check.id];
                  return (
                    <li key={`action-${check.id}`}>
                      <div style={{ fontWeight: 600 }}>{hint?.title ?? check.label}</div>
                      <div>{hint?.instruction ?? check.detail ?? 'Review diagnostics above.'}</div>
                      {hint?.targetId && (
                        <ActionLink
                          type="button"
                          onClick={() => {
                            if (!hint?.targetId) return;
                            document.getElementById(hint.targetId)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Jump to configuration
                        </ActionLink>
                      )}
                    </li>
                  );
                })}
            </ActionList>
          </div>
        )}
      </Section>

      <Section id="openai-config">
        <SectionTitle>OpenAI configuration</SectionTitle>
        <FieldGrid>
          <Field>
            API key
            <Input
              type="password"
              value={settings.openaiApiKey}
              onChange={(event) => setSettings((prev) => ({ ...prev, openaiApiKey: event.target.value }))}
            />
          </Field>
          <Field>
            Default model
            <Input
              value={settings.defaultOpenAIModel}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultOpenAIModel: event.target.value }))}
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
          </Field>
        </FieldGrid>
        <Field>
          Allowed models (one per line)
          <TextArea value={openAiAllowlistText} onChange={(event) => setOpenAiAllowlistText(event.target.value)} />
        </Field>
        <Field>
          System prompt
          <TextArea
            value={settings.openaiSystemPrompt}
            onChange={(event) => setSettings((prev) => ({ ...prev, openaiSystemPrompt: event.target.value }))}
          />
        </Field>
      </Section>

      <Section id="elevenlabs-config">
        <SectionTitle>ElevenLabs configuration</SectionTitle>
        <FieldGrid>
          <Field>
            API key
            <Input
              type="password"
              value={settings.elevenlabsApiKey}
              onChange={(event) => setSettings((prev) => ({ ...prev, elevenlabsApiKey: event.target.value }))}
            />
          </Field>
          <Field>
            Default TTS model
            <Input
              value={settings.defaultTTSModel}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultTTSModel: event.target.value }))}
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
          </Field>
        </FieldGrid>
        <Field>
          Allowed TTS models (one per line)
          <TextArea value={ttsAllowlistText} onChange={(event) => setTtsAllowlistText(event.target.value)} />
        </Field>
        <Field>
          Default voice
          <Select
            value={settings.defaultVoiceId}
            onChange={(event) => {
              const selected = voices.find((voice) => voice.id === event.target.value);
              setSettings((prev) => ({
                ...prev,
                defaultVoiceId: event.target.value,
                defaultVoiceLabel: selected?.name ?? prev.defaultVoiceLabel,
              }));
            }}
          >
            {voices.length === 0 && <option value="">No voices synced</option>}
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </Select>
        </Field>
        <OutlineButton type="button" onClick={syncVoices} disabled={syncingVoices || !settings.elevenlabsApiKey}>
          {syncingVoices ? 'Syncing voices…' : 'Sync voices from ElevenLabs'}
        </OutlineButton>
        {voices.length > 0 && (
          <VoiceList>
            {voices.map((voice) => (
              <VoiceItem key={voice.id}>
                <div>
                  <strong>{voice.name}</strong>
                  {voice.category && <VoiceMeta> • {voice.category}</VoiceMeta>}
                </div>
                {voice.previewUrl ? (
                  <AudioPreview controls preload="none" src={voice.previewUrl}>
                    Your browser does not support the audio element.
                  </AudioPreview>
                ) : (
                  <VoiceMeta>No preview available</VoiceMeta>
                )}
              </VoiceItem>
            ))}
          </VoiceList>
        )}
      </Section>

      <Section>
        <SectionTitle>Pipeline defaults & limits</SectionTitle>
        <FieldGrid>
          <Field>
            Soft limit: file size (MB)
            <Input
              type="number"
              min={1}
              value={settings.maxFileSizeMB}
              onChange={(event) => setSettings((prev) => ({ ...prev, maxFileSizeMB: Number(event.target.value) }))}
            />
          </Field>
          <Field>
            Soft limit: slides per deck
            <Input
              type="number"
              min={1}
              value={settings.maxSlides}
              onChange={(event) => setSettings((prev) => ({ ...prev, maxSlides: Number(event.target.value) }))}
            />
          </Field>
          <Field>
            Concurrent jobs per user
            <Input
              type="number"
              min={1}
              value={settings.concurrencyLimitPerUser}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, concurrencyLimitPerUser: Number(event.target.value) }))
              }
            />
          </Field>
          <Field>
            Default processing mode
            <Select
              value={settings.defaultMode}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultMode: event.target.value as 'REVIEW' | 'ONE_SHOT' }))}
            >
              <option value="REVIEW">Review first</option>
              <option value="ONE_SHOT">One-shot automation</option>
            </Select>
          </Field>
        </FieldGrid>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </Section>

      <Section>
        <SectionTitle>User directory</SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td>{formatRelativeTime(new Date(user.createdAt).getTime())}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section>
        <SectionTitle>Audit log</SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((entry) => (
              <tr key={entry.id}>
                <Td>{formatRelativeTime(new Date(entry.createdAt).getTime())}</Td>
                <Td>{entry.actor ? `${entry.actor.name} (${entry.actor.email})` : 'System'}</Td>
                <Td>{entry.action}</Td>
                <Td>
                  {entry.entityType} – {entry.entityId}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
    </Page>
  );
}
