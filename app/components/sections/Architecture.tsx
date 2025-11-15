'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Layout = styled(SectionInner)`
  display: grid;
  gap: clamp(2.8rem, 5vw, 4rem);
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2rem, 4.6vw, 3.1rem);
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 760px;
`;

const ArchitectureGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const ArchCard = styled(GlowCard)`
  min-height: 240px;
  display: grid;
  gap: 0.85rem;
`;

const ArchTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
`;

const ArchList = styled.ul`
  display: grid;
  gap: 0.6rem;
`;

const ArchItem = styled.li`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`;

const Flow = styled.div`
  display: grid;
  gap: 1.2rem;
`;

const FlowRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.2rem;
`;

const FlowCard = styled.div`
  padding: 1.2rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const architecture = [
  {
    title: 'Next.js Experience Layer',
    items: [
      'App Router UI with auth, dashboards, editors, and admin views.',
      'Uploads, job controls, and settings handled via route handlers.',
      'Real-time progress via server actions, SSE, or websockets.'
    ]
  },
  {
    title: 'Resilient Job Workers',
    items: [
      'Queue-driven processes for ingestion, scripts, audio, video, and final assembly.',
      'Automatic retries with backoff and slide-level failure isolation.',
      'FFmpeg pipelines optimized for 1080p / 30 FPS outputs.'
    ]
  },
  {
    title: 'State & Storage',
    items: [
      'Postgres for users, decks, jobs, prompts, and audit logs.',
      'Deterministic filesystem layout per deck for simple retention.',
      'Optional object storage or CDN distribution for generated assets.'
    ]
  }
];

const flow = [
  {
    title: 'Deck Lifecycle',
    steps: ['Upload deck → ingestion job kicks off', 'Scripts generated + editable', 'Audio + video rendering queued', 'Final MP4 exported & downloadable']
  },
  {
    title: 'Regeneration loops',
    steps: ['Edit script for slide', 'Regenerate audio instantly', 'Update slide video', 'Re-assemble final deck video on demand']
  },
  {
    title: 'Health & Alerting',
    steps: ['Scheduled checks for OpenAI + ElevenLabs', 'Auto “out of order” state when dependencies fail', 'In-app & email alerts keep admins informed']
  }
];

export function ArchitectureSection() {
  return (
    <Section id="architecture" $variant="alt">
      <Layout>
        <div>
          <Title>Architecture that balances velocity, scale, and trust.</Title>
          <Description>
            DeckForge Studio separates interactive experiences from heavy workers, allowing you to scale each independently. With
            deterministic storage, auditability, and health awareness, the system is ready for enterprise adoption.
          </Description>
        </div>
        <ArchitectureGrid>
          {architecture.map((block) => (
            <ArchCard key={block.title}>
              <ArchTitle>{block.title}</ArchTitle>
              <ArchList>
                {block.items.map((item) => (
                  <ArchItem key={item}>{item}</ArchItem>
                ))}
              </ArchList>
            </ArchCard>
          ))}
        </ArchitectureGrid>
        <Flow>
          <Title style={{ fontSize: '2rem' }}>Key service flows.</Title>
          <FlowRow>
            {flow.map((item) => (
              <FlowCard key={item.title}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{item.title}</h4>
                <ArchList style={{ marginTop: '0.8rem' }}>
                  {item.steps.map((step) => (
                    <ArchItem key={step}>{step}</ArchItem>
                  ))}
                </ArchList>
              </FlowCard>
            ))}
          </FlowRow>
        </Flow>
      </Layout>
    </Section>
  );
}
