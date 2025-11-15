'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Layout = styled(SectionInner)`
  display: grid;
  gap: clamp(2.5rem, 4vw, 3.5rem);
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2rem, 4.5vw, 3rem);
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 780px;
`;

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const AssuranceCard = styled(GlowCard)`
  display: grid;
  gap: 0.9rem;
  min-height: 220px;
`;

const AssuranceTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const AssuranceList = styled.ul`
  display: grid;
  gap: 0.55rem;
`;

const AssuranceItem = styled.li`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`;

const assurances = [
  {
    title: 'Security & Privacy',
    points: [
      'Role-based access ensures only deck owners and admins can view assets.',
      'Credentials for OpenAI and ElevenLabs stay encrypted on the server.',
      'Support for HTTPS-only deployments with optional directory-based auth.'
    ]
  },
  {
    title: 'Data Lifecycle',
    points: [
      'Retention policies per artifact type keep storage lean and compliant.',
      'Scheduled cleanup jobs prune expired uploads and generated media.',
      'Users can delete decks to remove associated assets instantly.'
    ]
  },
  {
    title: 'Scalability & Resilience',
    points: [
      'Horizontal worker scaling tackles large jobs without throttling the UI.',
      'Database-backed queue with locking prevents duplicate processing.',
      'Health-aware “out of order” mode protects from upstream outages.'
    ]
  }
];

export function AssurancesSection() {
  return (
    <Section id="assurances">
      <Layout>
        <div>
          <Title>Confidence built into every layer.</Title>
          <Description>
            From security posture to cleanup automation and graceful degradation, DeckForge Studio is engineered for organizations
            that demand reliability alongside creativity.
          </Description>
        </div>
        <Grid>
          {assurances.map((item) => (
            <AssuranceCard key={item.title}>
              <AssuranceTitle>{item.title}</AssuranceTitle>
              <AssuranceList>
                {item.points.map((point) => (
                  <AssuranceItem key={point}>{point}</AssuranceItem>
                ))}
              </AssuranceList>
            </AssuranceCard>
          ))}
        </Grid>
      </Layout>
    </Section>
  );
}
