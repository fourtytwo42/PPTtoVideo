import Link from 'next/link';
import styled from 'styled-components';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import DeckWorkspaceClient from './workspace-client';
import { redirect } from 'next/navigation';
import { buildWorkspaceDeck } from '@/lib/decks';

type PageProps = {
  params: { deckId: string };
};

const Missing = styled.div`
  background: rgba(21, 18, 42, 0.72);
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 1rem;
  justify-items: start;
`;

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
      <Missing>
        <h1 style={{ margin: 0 }}>Deck not found</h1>
        <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.75)' }}>
          The requested deck is no longer available. Return to the dashboard to select another workspace.
        </p>
        <Link href="/dashboard" style={{ color: '#8C5CFF', fontWeight: 600 }}>
          Back to dashboard
        </Link>
      </Missing>
    );
  }

  const serializedDeck = buildWorkspaceDeck(deck);

  return <DeckWorkspaceClient deck={serializedDeck} />;
}
