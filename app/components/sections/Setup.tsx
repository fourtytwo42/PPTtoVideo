'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Wrapper = styled(Section)`
  background: linear-gradient(160deg, rgba(19, 16, 38, 0.95), rgba(8, 6, 18, 0.85));
`;

const Header = styled.div`
  display: grid;
  gap: 1.25rem;
  margin-bottom: clamp(3rem, 6vw, 4rem);
  max-width: 820px;
`;

const Eyebrow = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.secondary};
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2rem, 4.8vw, 3.2rem);
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.05rem;
`;

const StepsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const StepCard = styled(GlowCard)`
  min-height: 260px;
  display: grid;
  gap: 1rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  font-weight: 600;
  background: rgba(36, 228, 206, 0.18);
  border: 1px solid rgba(36, 228, 206, 0.45);
`;

const StepTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
`;

const StepDetail = styled.p`
  margin: 0;
  color: rgba(232, 229, 255, 0.8);
  font-size: 0.98rem;
`;

const Callouts = styled.div`
  margin-top: clamp(2.5rem, 5vw, 3.5rem);
  display: grid;
  gap: 1.2rem;
`;

const CalloutCard = styled.div`
  padding: 1.4rem 1.6rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 0.5rem;
`;

const callouts = [
  {
    title: 'Guided the very first admin',
    detail:
      'Detect a fresh install and escort operators through API keys, admin credentials, and seed configuration before anyone else signs in.'
  },
  {
    title: 'Safe defaults from day zero',
    detail:
      'Enforce secure password rules, choose default voices/models, and opt into review mode with a single toggle so new tenants launch responsibly.'
  }
];

const steps = [
  {
    title: 'Initialize the platform',
    description:
      'Visit the root URL and DeckForge Studio spots a clean slate. Spin up the database, seed baseline settings, and unlock the guided setup canvas.'
  },
  {
    title: 'Authorize AI providers',
    description:
      'Input OpenAI + ElevenLabs keys, pick default models, and preview available voices. Secrets store encrypted while workers inherit only runtime tokens.'
  },
  {
    title: 'Create the founding admin',
    description:
      'Define username, email, and password—or skip for later—so governance can begin instantly with audit-ready credentials.'
  }
];

export function SetupSection() {
  return (
    <Wrapper id="setup">
      <SectionInner>
        <Header>
          <Eyebrow>First-time experience</Eyebrow>
          <Title>Launch-ready within minutes, without compromising control.</Title>
          <Description>
            DeckForge Studio recognises fresh deployments and choreographs a beautiful onboarding that primes admins for immediate, compliant operation.
          </Description>
        </Header>
        <StepsGrid>
          {steps.map((step, index) => (
            <StepCard key={step.title} $accent={index === 1 ? 'secondary' : undefined}>
              <Badge>{String(index + 1).padStart(2, '0')}</Badge>
              <StepTitle>{step.title}</StepTitle>
              <StepDetail>{step.description}</StepDetail>
            </StepCard>
          ))}
        </StepsGrid>
        <Callouts>
          {callouts.map((item) => (
            <CalloutCard key={item.title}>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h4>
              <p style={{ margin: 0, color: 'rgba(224, 220, 255, 0.72)' }}>{item.detail}</p>
            </CalloutCard>
          ))}
        </Callouts>
      </SectionInner>
    </Wrapper>
  );
}
