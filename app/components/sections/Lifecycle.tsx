'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Wrapper = styled(Section)`
  background: radial-gradient(circle at top right, rgba(140, 92, 255, 0.18), transparent 55%),
    linear-gradient(210deg, rgba(10, 8, 24, 0.9), rgba(12, 10, 28, 0.85));
`;

const Header = styled.div`
  display: grid;
  gap: 1.3rem;
  margin-bottom: clamp(2.6rem, 5vw, 3.8rem);
  max-width: 840px;
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2.1rem, 5vw, 3.3rem);
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.05rem;
`;

const DeckGrid = styled.div`
  display: grid;
  gap: 1.4rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const DeckCard = styled(GlowCard)`
  display: grid;
  gap: 1.1rem;
`;

const DeckTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const DeckBody = styled.p`
  margin: 0;
  color: rgba(224, 221, 255, 0.78);
`;

const RegenerationBoard = styled(GlowCard)`
  margin-top: clamp(3rem, 5vw, 4rem);
  display: grid;
  gap: 1.3rem;
`;

const Actions = styled.div`
  display: grid;
  gap: 1.1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const Action = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.1rem 1.3rem;
`;

const decks = [
  {
    title: 'Always revisit past productions',
    body: 'View scripts, audio, per-slide and final videos any time (until retention rules kick in) to audit, download, or regenerate.'
  },
  {
    title: 'Per-slide regeneration',
    body: 'Edit a single script, regenerate narration, rerender its video segment, and rebuild the final deck without reprocessing everything.'
  },
  {
    title: 'Version awareness',
    body: 'Track the latest successful generation while keeping audit trails so teams know when content changed and why.'
  }
];

const actions = [
  {
    title: 'Final video rebuild',
    detail: 'Only re-encode impacted slides to speed up delivery while keeping transitions and timing pristine.'
  },
  {
    title: 'Targeted retries',
    detail: 'Stuck audio or video? Retry the slide alone with updated prompts, voice settings, or service credentials.'
  },
  {
    title: 'Retention orchestration',
    detail: 'Schedule cleanup jobs per artifact type—source files, slide images, audio, per-slide, or final videos—with compliance-grade logging.'
  }
];

export function LifecycleSection() {
  return (
    <Wrapper id="lifecycle">
      <SectionInner>
        <Header>
          <Title>The deck lifecycle, curated for iteration and governance.</Title>
          <Description>
            DeckForge Studio remembers every asset, allows surgical regeneration, and respects retention policies so teams can evolve content responsibly.
          </Description>
        </Header>
        <DeckGrid>
          {decks.map((deck) => (
            <DeckCard key={deck.title}>
              <DeckTitle>{deck.title}</DeckTitle>
              <DeckBody>{deck.body}</DeckBody>
            </DeckCard>
          ))}
        </DeckGrid>
        <RegenerationBoard $accent="primary">
          <Title style={{ fontSize: '2rem', margin: 0 }}>Regeneration without chaos.</Title>
          <Description style={{ maxWidth: '700px' }}>
            Users orchestrate slide-by-slide fixes while admins maintain full visibility into what changed, when, and by whom.
          </Description>
          <Actions>
            {actions.map((action) => (
              <Action key={action.title}>
                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{action.title}</h4>
                <p style={{ margin: '0.6rem 0 0', color: 'rgba(230, 227, 255, 0.75)' }}>{action.detail}</p>
              </Action>
            ))}
          </Actions>
        </RegenerationBoard>
      </SectionInner>
    </Wrapper>
  );
}
