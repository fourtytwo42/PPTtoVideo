'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Layout = styled(SectionInner)`
  display: grid;
  gap: clamp(2.5rem, 4vw, 3.5rem);
`;

const Header = styled.div`
  max-width: 780px;
`;

const Title = styled.h2`
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  margin: 0 0 1.2rem;
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.05rem;
`;

const Timeline = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const StepRow = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 1.5fr;
  gap: 1.8rem;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StepTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
`;

const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-weight: 600;
  margin-bottom: 1rem;
  background: rgba(140, 92, 255, 0.2);
  border: 1px solid rgba(140, 92, 255, 0.35);
`;

const StepDescription = styled.p`
  margin: 1rem 0 1.5rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const Item = styled.div`
  padding: 1rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const steps = [
  {
    title: 'Ingest & Parse',
    description:
      'Accept PPTX, PDF, and Slides exports with drag-and-drop uploads. Background workers extract slide text, notes, metadata, and crystal-clear PNGs.',
    highlights: ['200MB+ files supported with soft warnings', 'Speaker notes, transitions, and embedded media captured', 'Deterministic storage per deck for effortless retention']
  },
  {
    title: 'Generate Narration Scripts',
    description:
      'Feed structured slide content into OpenAI with admin-tuned prompts. Receive natural, on-tone scripts mapped precisely back to each slide.',
    highlights: ['Deck-wide or per-slide regeneration', 'Review-ready drafts saved automatically', 'One-shot mode flows directly into audio generation']
  },
  {
    title: 'Produce ElevenLabs Audio',
    description:
      'Batch-generate lifelike narration with guardrails. Voices, stability, and boosts are admin-governed while retries heal transient failures.',
    highlights: ['Per-slide status + duration tracking', 'Self-service regenerations after edits', 'Automatic failure notifications in UI']
  },
  {
    title: 'Render Slide & Final Videos',
    description:
      'FFmpeg-powered rendering synchronizes slide imagery, audio padding, transitions, and embedded clips into per-slide MP4s and a 1080p finale.',
    highlights: ['Letterboxing that respects your design', 'Transition-aware concatenation', 'Final assets ready for download or review']
  }
];

export function PipelineSection() {
  return (
    <Section id="pipeline">
      <Layout>
        <Header>
          <Title>Orchestrated like an elite post-production team.</Title>
          <Description>
            Every phase runs asynchronously with real-time progress. Users get the delight of cinematic outputs while your infra
            stays calm, observable, and resilient.
          </Description>
        </Header>
        <Timeline>
          {steps.map((step, index) => (
            <GlowCard key={step.title}>
              <StepRow>
                <div>
                  <StepBadge>{String(index + 1).padStart(2, '0')}</StepBadge>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </div>
                <ItemsGrid>
                  {step.highlights.map((item) => (
                    <Item key={item}>{item}</Item>
                  ))}
                </ItemsGrid>
              </StepRow>
            </GlowCard>
          ))}
        </Timeline>
      </Layout>
    </Section>
  );
}
