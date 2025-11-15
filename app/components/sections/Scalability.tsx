'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Header = styled.div`
  display: grid;
  gap: 1.3rem;
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

const Grid = styled.div`
  display: grid;
  gap: 1.3rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const Card = styled(GlowCard)`
  display: grid;
  gap: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const CardBody = styled.p`
  margin: 0;
  color: rgba(225, 223, 255, 0.78);
`;

const Footer = styled.div`
  margin-top: clamp(3rem, 5vw, 4.2rem);
  display: grid;
  gap: 1rem;
  max-width: 820px;
`;

const Footnote = styled.p`
  margin: 0;
  color: rgba(218, 216, 255, 0.76);
`;

const cards = [
  {
    title: 'Separation of concerns',
    accent: 'primary',
    body: 'Scale web front-ends independently from FFmpeg-heavy workers. Queue coordination happens in Postgres for transactional safety.'
  },
  {
    title: 'Elastic workers',
    accent: 'secondary',
    body: 'Spin up more worker nodes when overnight batches loom. Each respects concurrency caps per user and globally.'
  },
  {
    title: 'Storage choreography',
    accent: 'accent',
    body: 'Deterministic folder structures keep local disks tidy and make cloud migrations or CDN publishing straightforward.'
  }
];

export function ScalabilitySection() {
  return (
    <Section id="scalability">
      <SectionInner>
        <Header>
          <Title>Performance tuned for growing production lines.</Title>
          <Description>
            DeckForge Studio scales horizontally, keeps queues fair, and ensures video rendering never starves the UX.
          </Description>
        </Header>
        <Grid>
          {cards.map((card) => (
            <Card key={card.title} $accent={card.accent as 'primary' | 'secondary' | 'accent'}>
              <CardTitle>{card.title}</CardTitle>
              <CardBody>{card.body}</CardBody>
            </Card>
          ))}
        </Grid>
        <Footer>
          <Footnote>
            Future evolutions can introduce dedicated brokers, analytics, and multilingual voice packs—today’s architecture already plants the seeds.
          </Footnote>
        </Footer>
      </SectionInner>
    </Section>
  );
}
