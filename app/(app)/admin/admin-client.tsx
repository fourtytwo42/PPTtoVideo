'use client';

import { useEffect, useState } from 'react';
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

interface AdminConsoleClientProps {
  users: UserSummary[];
  auditLogs: AuditEntry[];
}

export default function AdminConsoleClient({ users, auditLogs }: AdminConsoleClientProps) {
  const [settings, setSettings] = useState({
    defaultOpenAIModel: 'gpt-4o-mini',
    defaultTTSModel: 'eleven_flash_v2_5',
    defaultVoice: 'Rachel',
    maxFileSizeMB: 200,
    maxSlides: 200,
    concurrencyLimitPerUser: 3,
    defaultMode: 'REVIEW',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/admin/settings', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setSettings((prev) => ({ ...prev, ...data }));
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
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
        <SectionTitle>Platform defaults</SectionTitle>
        <FieldGrid>
          <Field>
            Default OpenAI model
            <Input
              value={settings.defaultOpenAIModel}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultOpenAIModel: event.target.value }))}
            />
          </Field>
          <Field>
            Default TTS model
            <Input
              value={settings.defaultTTSModel}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultTTSModel: event.target.value }))}
            />
          </Field>
          <Field>
            Default voice
            <Input
              value={settings.defaultVoice}
              onChange={(event) => setSettings((prev) => ({ ...prev, defaultVoice: event.target.value }))}
            />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field>
            Max file size (MB)
            <Input
              type="number"
              value={settings.maxFileSizeMB}
              onChange={(event) => setSettings((prev) => ({ ...prev, maxFileSizeMB: Number(event.target.value) }))}
            />
          </Field>
          <Field>
            Max slides per deck
            <Input
              type="number"
              value={settings.maxSlides}
              onChange={(event) => setSettings((prev) => ({ ...prev, maxSlides: Number(event.target.value) }))}
            />
          </Field>
          <Field>
            Concurrent jobs per user
            <Input
              type="number"
              value={settings.concurrencyLimitPerUser}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, concurrencyLimitPerUser: Number(event.target.value) }))
              }
            />
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
