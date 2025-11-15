'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Header = styled.div`
  display: grid;
  gap: 1.3rem;
  margin-bottom: clamp(2.8rem, 5vw, 4rem);
  max-width: 860px;
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.04rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const Card = styled(GlowCard)`
  display: grid;
  gap: 1rem;
  min-height: 220px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const CardBody = styled.p`
  margin: 0;
  color: rgba(228, 225, 255, 0.8);
  font-size: 0.97rem;
`;

const Checklist = styled.ul`
  display: grid;
  gap: 0.7rem;
`;

const CheckItem = styled.li`
  color: rgba(223, 220, 255, 0.78);
  font-size: 0.95rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.7rem;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary};
  margin-top: 0.35rem;
`;

const Banner = styled.div`
  margin-top: clamp(3rem, 5vw, 4rem);
  padding: 1.4rem 1.6rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  gap: 0.6rem;
`;

const cards = [
  {
    title: 'Authentication & Authorization',
    accent: 'primary',
    body: 'Enforce strong password policies, optional email verification, and role-based access so admins hold the keys.',
    bullets: ['Role checks on every protected route', 'Audit log of admin actions and deck activity', 'LDAP/SSO support without exposing provider secrets']
  },
  {
    title: 'Data in Transit & At Rest',
    accent: 'secondary',
    body: 'HTTPS everywhere keeps uploads and downloads safe. Stored secrets, deck assets, and credentials live in encrypted vaults.',
    bullets: ['API keys encrypted in storage', 'Pluggable disk encryption via infrastructure', 'Deterministic storage layout for easy scrubbing']
  },
  {
    title: 'External Service Hardening',
    accent: 'accent',
    body: 'OpenAI and ElevenLabs calls use timeouts + retries with exponential backoff to distinguish blips from permanent issues.',
    bullets: ['Graceful degradation via out-of-order mode', 'Failure notifications to admins with timestamps', 'Per-slide retry controls to isolate issues']
  }
];

export function SecuritySection() {
  return (
    <Section id="security">
      <SectionInner>
        <Header>
          <Title>Security and privacy woven through every interaction.</Title>
          <Description>
            From identity to data lifecycle, DeckForge Studio respects enterprise guardrails so narrated decks stay confidential and compliant.
          </Description>
        </Header>
        <Grid>
          {cards.map((card) => (
            <Card key={card.title} $accent={card.accent as 'primary' | 'secondary' | 'accent'}>
              <CardTitle>{card.title}</CardTitle>
              <CardBody>{card.body}</CardBody>
              <Checklist>
                {card.bullets.map((item) => (
                  <CheckItem key={item}>
                    <Dot />
                    <span>{item}</span>
                  </CheckItem>
                ))}
              </Checklist>
            </Card>
          ))}
        </Grid>
        <Banner>
          <strong style={{ fontSize: '1.05rem' }}>Out-of-order awareness.</strong>
          <p style={{ margin: 0, color: 'rgba(225, 223, 255, 0.75)' }}>
            Health checks keep an eye on OpenAI and ElevenLabs. If either service wobbles, the UI dims generation controls, broadcasts a banner, and emails admins so users never wonder what happened.
          </p>
        </Banner>
      </SectionInner>
    </Section>
  );
}
