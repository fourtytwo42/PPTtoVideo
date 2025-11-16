import { DashboardRealtime } from '@/app/components/app/DashboardRealtime';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { buildDeckSummary } from '@/lib/decks';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Box } from '@mui/material';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  const [deckRecords, notifications, jobs] = await Promise.all([
    prisma.deck.findMany({
      where: { ownerId: user.id },
      include: {
        slides: { include: { script: true, audioAsset: true, videoAsset: true } },
        audioAssets: true,
        videoAssets: true,
        jobs: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.job.findMany({
      where: { ownerId: user.id, createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } },
      include: { deck: { select: { title: true } } },
    }),
  ]);

  const decks = deckRecords.map(buildDeckSummary);
  const jobSnapshots = jobs.map((job) => ({
    id: job.id,
    deckId: job.deckId,
    deckTitle: job.deck?.title ?? 'Deck',
    type: job.type,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }));

  const systemSettings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          'admin:maxSlides',
          'admin:maxFileSizeMB',
          'admin:defaultMode',
          'admin:openaiModelAllowlist',
          'admin:defaultOpenAIModel',
          'admin:elevenlabsModelAllowlist',
          'admin:defaultTTSModel',
          'admin:elevenlabsVoices',
          'admin:defaultVoiceId',
          'admin:defaultVoiceLabel',
          'system:out_of_order',
        ],
      },
    },
  });
  const toValue = (key: string, fallback: unknown) =>
    systemSettings.find((setting) => setting.key === key)?.value ?? fallback;
  const defaultScriptModel = (toValue('admin:defaultOpenAIModel', 'gpt-4o-mini') as string) ?? 'gpt-4o-mini';

  const parseStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map((entry) => String(entry)).filter((entry) => entry.trim().length > 0);
    }
    if (typeof value === 'string') {
      return value
        .split(/\r?\n|,/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    }
    return [];
  };

  const scriptModels = (() => {
    const list = parseStringArray(toValue('admin:openaiModelAllowlist', []));
    if (!list.includes(defaultScriptModel)) list.unshift(defaultScriptModel);
    return Array.from(new Set(list));
  })();

  const defaultTTSModel = (toValue('admin:defaultTTSModel', 'eleven_flash_v2_5') as string) ?? 'eleven_flash_v2_5';
  const ttsModels = (() => {
    const list = parseStringArray(toValue('admin:elevenlabsModelAllowlist', []));
    if (!list.includes(defaultTTSModel)) list.unshift(defaultTTSModel);
    return Array.from(new Set(list));
  })();

  const rawVoices = toValue('admin:elevenlabsVoices', []) as unknown;
  const voices =
    Array.isArray(rawVoices)
      ? rawVoices
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
            return { id, name };
          })
          .filter((voice): voice is { id: string; name: string } => Boolean(voice))
      : [];
  const defaultVoiceId = (toValue('admin:defaultVoiceId', '') as string) ?? '';
  const defaultVoice =
    voices.find((voice) => voice.id === defaultVoiceId) ?? voices[0] ?? { id: '', name: 'Default voice' };

  const limits = {
    maxSlides: Number(toValue('admin:maxSlides', 200)),
    maxFileSizeMB: Number(toValue('admin:maxFileSizeMB', 200)),
    defaultMode: (toValue('admin:defaultMode', 'REVIEW') as 'REVIEW' | 'ONE_SHOT'),
    scriptModels,
    defaultScriptModel,
    ttsModels,
    defaultTTSModel,
    voices,
    defaultVoice,
  };
  const healthSetting = toValue('system:out_of_order', { active: false }) as { active?: boolean; message?: string };
  const health = {
    outOfOrder: Boolean(healthSetting?.active),
    message: typeof healthSetting?.message === 'string' ? healthSetting.message : null,
  };
  const notificationPayload = notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt.toISOString(),
    read: notification.read,
  }));

  return (
    <Box component="section" sx={{ display: 'grid', gap: 3 }}>
      <PageHeader
        title="Operations dashboard"
        subtitle="Monitor deck ingestion, tune AI narration, and orchestrate high-fidelity video renders without babysitting progress bars."
      />
      <DashboardRealtime
        limits={limits}
        notifications={notificationPayload}
        initialDecks={decks}
        initialJobs={jobSnapshots}
        initialHealth={health}
      />
    </Box>
  );
}
