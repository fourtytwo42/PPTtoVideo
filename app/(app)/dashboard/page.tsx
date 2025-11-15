import { DeckUploadPanel } from '@/app/components/app/DeckUploadPanel';
import { DashboardStats } from '@/app/components/app/DashboardStats';
import { DeckGrid } from '@/app/components/app/DeckGrid';
import { NotificationCenter } from '@/app/components/app/NotificationCenter';
import styled from 'styled-components';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DeckStatus, JobStatus } from '@prisma/client';
import { redirect } from 'next/navigation';
import { buildDeckSummary } from '@/lib/decks';

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Headline = styled.h1`
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 2.6rem);
  margin: 0;
`;

const Lead = styled.p`
  margin: 0;
  color: rgba(213, 210, 255, 0.76);
  max-width: 48rem;
`;

const SplitGrid = styled.div`
  display: grid;
  gap: 1.6rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
`;

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
    }),
  ]);

  const decks = deckRecords.map(buildDeckSummary);
  const deckCount = decks.length;
  const completedCount = decks.filter((deck) => deck.status === DeckStatus.COMPLETE).length;
  const inFlightCount = deckCount - completedCount;
  const slideCount = decks.reduce((acc, deck) => acc + deck.slideCount, 0);
  const deliveredSeconds = decks.reduce((acc, deck) => acc + deck.runtimeSeconds, 0);

  const queued = jobs.filter((job) => job.status === JobStatus.QUEUED).length;
  const running = jobs.filter((job) => job.status === JobStatus.RUNNING).length;
  const succeededToday = jobs.filter((job) => job.status === JobStatus.SUCCEEDED).length;
  const failedToday = jobs.filter((job) => job.status === JobStatus.FAILED).length;
  const throughputPerHour = jobs.length / 24;
  const avgPipelineSeconds = decks.length ? Math.round(deliveredSeconds / decks.length) : 0;

  const systemSettings = await prisma.systemSetting.findMany({
    where: { key: { in: ['admin:maxSlides', 'admin:maxFileSizeMB', 'admin:defaultMode', 'system:out_of_order'] } },
  });
  const toValue = (key: string, fallback: unknown) =>
    systemSettings.find((setting) => setting.key === key)?.value ?? fallback;
  const limits = {
    maxSlides: Number(toValue('admin:maxSlides', 200)),
    maxFileSizeMB: Number(toValue('admin:maxFileSizeMB', 200)),
    defaultMode: (toValue('admin:defaultMode', 'REVIEW') as 'REVIEW' | 'ONE_SHOT'),
  };
  const healthSetting = toValue('system:out_of_order', { active: false }) as { active?: boolean; message?: string };
  const health = { outOfOrder: Boolean(healthSetting?.active) };

  return (
    <section style={{ display: 'grid', gap: '2.4rem' }}>
      <PageHeader>
        <Headline>Operations dashboard</Headline>
        <Lead>
          Monitor deck ingestion, tune AI narration, and orchestrate high-fidelity video renders without babysitting progress
          bars.
        </Lead>
      </PageHeader>
      <DashboardStats
        deckCount={deckCount}
        completedCount={completedCount}
        inFlightCount={inFlightCount}
        slideCount={slideCount}
        deliveredSeconds={deliveredSeconds}
        jobSnapshot={{
          queued,
          running,
          succeededToday,
          failedToday,
          throughputPerHour,
          avgPipelineSeconds,
        }}
        health={health}
      />
      <SplitGrid>
        <NotificationCenter
          notifications={notifications.map((notification) => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt.toISOString(),
            read: notification.read,
          }))}
        />
      </SplitGrid>
      <DeckUploadPanel limits={limits} disabled={health.outOfOrder} />
      <DeckGrid decks={decks} disabled={health.outOfOrder} />
    </section>
  );
}
