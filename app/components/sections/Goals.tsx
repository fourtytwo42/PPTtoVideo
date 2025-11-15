'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Header = styled.div`
  text-align: center;
  margin-bottom: clamp(3rem, 5vw, 4rem);
`;

const Eyebrow = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.4em;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.secondary};
  display: inline-block;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  margin: 0 auto;
  max-width: 800px;
`;

const Description = styled.p`
  margin: 1.2rem auto 0;
  max-width: 720px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.05rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(1.5rem, 2.5vw, 2.5rem);
`;

const GoalCard = styled(GlowCard)`
  min-height: 240px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GoalTitle = styled.h3`
  font-size: 1.35rem;
  margin: 0;
`;

const GoalDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
`;

const Accent = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
`;

const goals = [
  {
    title: 'Automate slide-to-video workflows',
    description:
      'Upload PPT, PDF, or Slides exports and let AI craft scripts, narration, and HD outputs while background workers handle the heavy lifting.',
    accent: 'Automation'
  },
  {
    title: 'Keep humans in the loop',
    description:
      'Switch between a cinematic one-shot run or a detailed review flow where every script can be edited, regenerated, and approved.',
    accent: 'Control'
  },
  {
    title: 'Support rich, multimedia decks',
    description:
      'Handle embedded media, speaker notes, and slide metadata so your final videos feel complete, contextual, and on-brand.',
    accent: 'Rich content'
  },
  {
    title: 'Deliver enterprise-grade governance',
    description:
      'Admins manage prompts, voices, limits, retention, and integrations with full audit trails and health monitoring.',
    accent: 'Enterprise'
  }
];

export function GoalsSection() {
  return (
    <Section id="goals" $variant="alt">
      <SectionInner>
        <Header>
          <Eyebrow>Product pillars</Eyebrow>
          <Title>Every moment of the pipeline is tuned for clarity, control, and magic.</Title>
          <Description>
            DeckForge Studio fuses automation with human oversight. Whether you are batch-processing pitch decks or crafting
            training narratives, the experience feels cinematic, reliable, and deeply customizable.
          </Description>
        </Header>
        <Grid>
          {goals.map((goal) => (
            <GoalCard key={goal.title}>
              <Accent>{goal.accent}</Accent>
              <GoalTitle>{goal.title}</GoalTitle>
              <GoalDescription>{goal.description}</GoalDescription>
            </GoalCard>
          ))}
        </Grid>
      </SectionInner>
    </Section>
  );
}
