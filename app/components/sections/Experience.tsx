'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: clamp(2.5rem, 4vw, 3.5rem);
`;

const Heading = styled.h2`
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  max-width: 720px;
`;

const Lead = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 720px;
`;

const ModesGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const ModeCard = styled(GlowCard)`
  display: grid;
  gap: 1.25rem;
`;

const ModeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const ModeTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
`;

const Tag = styled.span`
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.05);
`;

const ModeDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
`;

const Checklist = styled.ul`
  display: grid;
  gap: 0.85rem;
`;

const CheckItem = styled.li`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  align-items: start;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`;

const Dot = styled.span`
  display: inline-flex;
  width: 10px;
  height: 10px;
  margin-top: 0.4rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.secondary};
`;

const ProgressBoard = styled(GlowCard)`
  margin-top: clamp(3rem, 5vw, 4rem);
`;

const ProgressGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const ProgressCard = styled.div`
  padding: 1.3rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const progress = [
  {
    title: 'Live pipeline telemetry',
    detail: 'Deck-level completion %, per-step ETAs, and slide-by-slide status updates streamed via SSE or websockets.'
  },
  {
    title: 'Actionable errors',
    detail: 'Failure messages surface next to each slide with retry options and admin visibility in monitoring dashboards.'
  },
  {
    title: 'Downloads on demand',
    detail: 'Grab final MP4s, slide-level videos, or raw narration audio the moment they complete—no waiting for the full deck.'
  }
];

const modes = [
  {
    title: 'Review Mode',
    tag: 'Default flow',
    description:
      'Create the perfect narration before production. Ideal when compliance, legal, or brand teams need a say in the story.',
    bullets: [
      'Scripts arrive polished but editable, with instant save + version tracking.',
      'Regenerate individual slides or full decks using tuned prompts.',
      'Once approved, trigger audio + video rendering in a single click.'
    ]
  },
  {
    title: 'One-shot Mode',
    tag: 'Lightning automation',
    description:
      'Enable “fire and forget” runs for marketing blitzes or mass onboarding. Upload decks and come back to production-ready videos.',
    bullets: [
      'Pipeline automatically flows from parsing to final assembly.',
      'Users can still revisit slides, edit scripts, and regenerate assets later.',
      'Perfect for overnight batches or recurring training refreshes.'
    ]
  }
];

export function ExperienceSection() {
  return (
    <Section id="experience">
      <SectionInner>
        <TitleRow>
          <Heading>Tailored flows for storytellers who crave both speed and finesse.</Heading>
          <Lead>
            Whether you are iterating slide scripts in real time or generating entire video libraries unattended, DeckForge Studio
            keeps your team in control with lush progress tracking and self-service regeneration.
          </Lead>
        </TitleRow>
        <ModesGrid>
          {modes.map((mode) => (
            <ModeCard key={mode.title}>
              <ModeHeader>
                <ModeTitle>{mode.title}</ModeTitle>
                <Tag>{mode.tag}</Tag>
              </ModeHeader>
              <ModeDescription>{mode.description}</ModeDescription>
              <Checklist>
                {mode.bullets.map((item) => (
                  <CheckItem key={item}>
                    <Dot />
                    <span>{item}</span>
                  </CheckItem>
                ))}
              </Checklist>
            </ModeCard>
          ))}
        </ModesGrid>
        <ProgressBoard $accent="secondary">
          <Heading style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            An experience dashboard that calms every stakeholder.
          </Heading>
          <ProgressGrid>
            {progress.map((card) => (
              <ProgressCard key={card.title}>
                <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{card.title}</h4>
                <p style={{ margin: '0.65rem 0 0', color: 'rgba(230, 227, 255, 0.75)' }}>{card.detail}</p>
              </ProgressCard>
            ))}
          </ProgressGrid>
        </ProgressBoard>
      </SectionInner>
    </Section>
  );
}
