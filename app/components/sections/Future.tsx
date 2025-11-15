'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Header = styled.div`
  display: grid;
  gap: 1.2rem;
  margin-bottom: clamp(2.6rem, 5vw, 3.8rem);
  max-width: 820px;
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
  font-size: 1.04rem;
`;

const IdeasGrid = styled.div`
  display: grid;
  gap: 1.1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const IdeaCard = styled(GlowCard)`
  min-height: 200px;
  display: grid;
  gap: 0.8rem;
`;

const IdeaTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const IdeaBody = styled.p`
  margin: 0;
  color: rgba(225, 223, 255, 0.78);
  font-size: 0.95rem;
`;

const ideas = [
  {
    title: 'Animated reveal timelines',
    accent: 'primary',
    body: 'Parse bullet-level animations to recreate staggered reveals and transitions in final videos.'
  },
  {
    title: 'Branded overlay themes',
    accent: 'secondary',
    body: 'Offer template packs with lower-thirds, animated backgrounds, and watermarking for enterprise storytelling.'
  },
  {
    title: 'Multilingual narration',
    accent: 'accent',
    body: 'Translate slide copy and generate localized voiceovers so global teams receive native-language experiences.'
  },
  {
    title: 'Team collaboration suite',
    accent: 'primary',
    body: 'Enable shared decks, commenting, approvals, and analytics to track adoption across departments.'
  }
];

export function FutureSection() {
  return (
    <Section id="future">
      <SectionInner>
        <Header>
          <Title>The roadmap already shimmers with possibilities.</Title>
          <Description>
            DeckForge Studio is architected for enhancements—animation fidelity, collaborative review, multilingual output, and more await their spotlight.
          </Description>
        </Header>
        <IdeasGrid>
          {ideas.map((idea) => (
            <IdeaCard key={idea.title} $accent={idea.accent as 'primary' | 'secondary' | 'accent'}>
              <IdeaTitle>{idea.title}</IdeaTitle>
              <IdeaBody>{idea.body}</IdeaBody>
            </IdeaCard>
          ))}
        </IdeasGrid>
      </SectionInner>
    </Section>
  );
}
