'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const Wrapper = styled(Section)`
  background: linear-gradient(180deg, rgba(18, 15, 35, 0.8), rgba(8, 6, 18, 0.9));
`;

const Header = styled.div`
  display: grid;
  gap: 1.2rem;
  margin-bottom: clamp(2.8rem, 5vw, 4rem);
  max-width: 880px;
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(2rem, 4.5vw, 3.1rem);
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1.03rem;
`;

const AdminGrid = styled.div`
  display: grid;
  gap: 1.4rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const AdminCard = styled(GlowCard)`
  display: grid;
  gap: 0.75rem;
  min-height: 220px;
`;

const AdminTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const AdminList = styled.ul`
  display: grid;
  gap: 0.65rem;
`;

const AdminItem = styled.li`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`;

const GovernancePanel = styled(GlowCard)`
  margin-top: clamp(3rem, 5vw, 4rem);
  display: grid;
  gap: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

const PanelGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const PanelItem = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const adminAreas = [
  {
    title: 'AI & Voice Governance',
    items: [
      'Configure OpenAI prompts, default models, and voice catalogs.',
      'Sync ElevenLabs voices with preview gating.',
      'Set per-org defaults for stability, style, and speaker boosts.'
    ]
  },
  {
    title: 'User & Access Management',
    items: [
      'Invite, promote, suspend, or delete users with audit history.',
      'Toggle self-registration, email verification, or SSO requirements.',
      'Define deck-level retention with scheduled cleanup jobs.'
    ]
  },
  {
    title: 'Observability & Alerts',
    items: [
      'Run targeted health checks for OpenAI and ElevenLabs.',
      'Surface job failures, SLA breaches, and system alerts via email.',
      'Flip the platform into “out of order” mode when external services degrade.'
    ]
  }
];

const governance = [
  {
    title: 'Brand-first theming',
    detail: 'Upload logos, pick color palettes, and ship a dashboard that feels native to your organization.'
  },
  {
    title: 'Retention by artifact',
    detail: 'Independently expire source files, slide images, audio, or videos according to compliance policies.'
  },
  {
    title: 'Job concurrency controls',
    detail: 'Limit simultaneous jobs per user or globally to maintain predictable load and cost envelopes.'
  }
];

export function AdminSection() {
  return (
    <Wrapper id="admin">
      <SectionInner>
        <Header>
          <Title>Enterprise-grade administration with elegance and power.</Title>
          <Description>
            DeckForge Studio gives operators a cockpit to configure AI, voices, auth, and retention—while observing every job in
            real time. Governance never felt this refined.
          </Description>
        </Header>
        <AdminGrid>
          {adminAreas.map((area) => (
            <AdminCard key={area.title}>
              <AdminTitle>{area.title}</AdminTitle>
              <AdminList>
                {area.items.map((item) => (
                  <AdminItem key={item}>{item}</AdminItem>
                ))}
              </AdminList>
            </AdminCard>
          ))}
        </AdminGrid>
        <GovernancePanel $accent="accent">
          <Title style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Administrative finesse, captured.</Title>
          <PanelGrid>
            {governance.map((item) => (
              <PanelItem key={item.title}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h4>
                <p style={{ margin: '0.6rem 0 0', color: 'rgba(230, 227, 255, 0.75)' }}>{item.detail}</p>
              </PanelItem>
            ))}
          </PanelGrid>
        </GovernancePanel>
      </SectionInner>
    </Wrapper>
  );
}
