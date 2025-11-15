'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Header = styled.div`
  display: grid;
  gap: 1.25rem;
  margin-bottom: clamp(2.6rem, 4.8vw, 3.5rem);
  max-width: 840px;
`;

const Eyebrow = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
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

const Grid = styled.div`
  display: grid;
  gap: 1.4rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const Card = styled(GlowCard)`
  min-height: 250px;
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

const Checklist = styled.ul`
  display: grid;
  gap: 0.75rem;
`;

const CheckItem = styled.li`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  color: rgba(223, 220, 255, 0.78);
  font-size: 0.95rem;
`;

const Bullet = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  margin-top: 0.35rem;
`;

const cards = [
  {
    title: 'Login built for choice',
    description:
      'Support classic email/password journeys or let enterprises plug in LDAP and modern SSO providers without code changes.',
    accent: 'primary',
    bullets: ['Composable auth providers via NextAuth or custom adapters', 'Admin-controlled toggles for SSO enforcement', 'Session hardening with short-lived tokens + refresh']
  },
  {
    title: 'Registration aligned with policy',
    description:
      'Allow self-serve signups or restrict creation to admins. Email verification flows depend on SMTP readiness.',
    accent: 'secondary',
    bullets: ['Verification emails with expiring magic links', 'Admin invite workflow with role assignment', 'Optional manual approval gates before first login']
  },
  {
    title: 'Recovery without friction',
    description:
      'When SMTP is enabled, password resets land in inboxes instantly and respect configurable expiry + complexity rules.',
    accent: 'accent',
    bullets: ['Secure tokenized reset pages', 'Audited password changes for compliance', 'Fallback admin reset actions for locked-out teammates']
  }
];

export function AuthSection() {
  return (
    <Section id="auth">
      <SectionInner>
        <Header>
          <Eyebrow>Access & identity</Eyebrow>
          <Title>Authentication experiences that flex to every deployment.</Title>
          <Description>
            DeckForge Studio gives admins the levers to open the doors wide or keep things invitation-only, while users enjoy silky, modern flows from login to recovery.
          </Description>
        </Header>
        <Grid>
          {cards.map((card) => (
            <Card key={card.title} $accent={card.accent as 'primary' | 'secondary' | 'accent'}>
              <CardTitle>{card.title}</CardTitle>
              <CardBody>{card.description}</CardBody>
              <Checklist>
                {card.bullets.map((item) => (
                  <CheckItem key={item}>
                    <Bullet />
                    <span>{item}</span>
                  </CheckItem>
                ))}
              </Checklist>
            </Card>
          ))}
        </Grid>
      </SectionInner>
    </Section>
  );
}
