'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Wrapper = styled(Section)`
  background: linear-gradient(200deg, rgba(9, 7, 22, 0.9), rgba(22, 18, 44, 0.85));
`;

const Header = styled.div`
  display: grid;
  gap: 1.2rem;
  margin-bottom: clamp(2.8rem, 5vw, 4rem);
  max-width: 860px;
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

const FlowGrid = styled.div`
  display: grid;
  gap: clamp(1.5rem, 2.5vw, 2.2rem);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
`;

const FlowCard = styled(GlowCard)`
  display: grid;
  gap: 1.4rem;
  padding: clamp(2rem, 3vw, 2.6rem);
`;

const FlowTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
`;

const FlowLead = styled.p`
  margin: 0;
  color: rgba(224, 221, 255, 0.78);
`;

const StepList = styled.ol`
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.85rem;
  list-style: none;
  counter-reset: flow;
`;

const StepItem = styled.li`
  position: relative;
  padding-left: 2.4rem;
  color: rgba(225, 223, 255, 0.78);
  font-size: 0.98rem;
  counter-increment: flow;

  &::before {
    content: counter(flow, decimal-leading-zero);
    position: absolute;
    left: 0;
    top: 0.15rem;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 12px;
    background: rgba(140, 92, 255, 0.2);
    border: 1px solid rgba(140, 92, 255, 0.45);
    display: grid;
    place-items: center;
    font-weight: 600;
  }
`;

const FlowFooter = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.1rem 1.3rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`;

const flows = [
  {
    title: 'Upload & Review (default)',
    lead:
      'Perfect for narratives that need human polish. Users collaborate on scripts before production kicks off.',
    accent: 'primary',
    steps: [
      'Drag-and-drop decks to queue ingestion while a dashboard surfaces slide parsing progress.',
      'OpenAI drafts scripts per slide; editors tweak copy inline, regenerate selections, and lock versions.',
      'With approval secured, trigger audio + video creation knowing every voice parameter and job is tracked.'
    ],
    footer: 'Ideal when compliance, legal, or brand guardians need to sign off before audio leaves the building.'
  },
  {
    title: 'One-shot (automation)',
    lead:
      'For unstoppable throughput. Upload decks, walk away, and return to finished MP4 libraries.',
    accent: 'secondary',
    steps: [
      'Users toggle “Skip review” to inform the orchestrator they trust the full automation path.',
      'Pipeline streams from ingestion to narration to rendering with retries, alerts, and download unlocks as assets finish.',
      'Teams can still revisit slides later to edit scripts, regenerate audio, and rebuild the final composite on demand.'
    ],
    footer: 'Great for marketing sprints, onboarding refreshes, and high-volume training programs that run overnight.'
  }
];

export function FlowsSection() {
  return (
    <Wrapper id="flows">
      <SectionInner>
        <Header>
          <Title>Two cinematic journeys, each mapped step by step.</Title>
          <Description>
            Whether the team huddles around edits or lets the robots fly solo, DeckForge Studio narrates the entire voyage with confidence and clarity.
          </Description>
        </Header>
        <FlowGrid>
          {flows.map((flow) => (
            <FlowCard key={flow.title} $accent={flow.accent as 'primary' | 'secondary' | 'accent'}>
              <div>
                <FlowTitle>{flow.title}</FlowTitle>
                <FlowLead>{flow.lead}</FlowLead>
              </div>
              <StepList>
                {flow.steps.map((step) => (
                  <StepItem key={step}>{step}</StepItem>
                ))}
              </StepList>
              <FlowFooter>{flow.footer}</FlowFooter>
            </FlowCard>
          ))}
        </FlowGrid>
      </SectionInner>
    </Wrapper>
  );
}
