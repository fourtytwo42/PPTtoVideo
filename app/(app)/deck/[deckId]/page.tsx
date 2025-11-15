import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import DeckWorkspaceClient from './workspace-client';
import { redirect } from 'next/navigation';
import { buildWorkspaceDeck } from '@/lib/decks';
import { getElevenLabsModelAllowlist, getElevenLabsVoices, getOpenAIModelAllowlist } from '@/lib/settings';

type PageProps = {
  params: { deckId: string };
};

export default async function DeckWorkspacePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  const deck = await prisma.deck.findFirst({
    where: { id: params.deckId, ownerId: user.id },
    include: {
      slides: {
        include: {
          script: true,
          audioAsset: true,
          videoAsset: true,
        },
        orderBy: { index: 'asc' },
      },
      audioAssets: true,
      videoAssets: true,
    },
  });

  if (!deck) {
    return (
      <div
        style={{
          background: 'rgba(21, 18, 42, 0.72)',
          borderRadius: '1.25rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gap: '1rem',
          justifyItems: 'start',
        }}
      >
        <h1 style={{ margin: 0 }}>Deck not found</h1>
        <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.75)' }}>
          The requested deck is no longer available. Return to the dashboard to select another workspace.
        </p>
        <Link href="/dashboard" style={{ color: '#8C5CFF', fontWeight: 600 }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  const serializedDeck = buildWorkspaceDeck(deck);

  const [scriptModels, ttsModels, voices] = await Promise.all([
    getOpenAIModelAllowlist(),
    getElevenLabsModelAllowlist(),
    getElevenLabsVoices(),
  ]);

  return (
    <DeckWorkspaceClient
      deck={serializedDeck}
      scriptModels={scriptModels}
      ttsModels={ttsModels}
      voices={voices.map((voice) => ({ id: voice.id, name: voice.name }))}
    />
  );
}
