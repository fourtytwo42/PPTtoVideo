'use client';

import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

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
  font-size: clamp(2.1rem, 5vw, 3.4rem);
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

const JobCard = styled(GlowCard)`
  display: grid;
  gap: 1rem;
`;

const JobTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
`;

const JobMeta = styled.p`
  margin: 0;
  color: rgba(225, 223, 255, 0.78);
`;

const Badge = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.secondary};
`;

const StateBoard = styled(GlowCard)`
  margin-top: clamp(3rem, 6vw, 4.2rem);
  display: grid;
  gap: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const StateGrid = styled.div`
  display: grid;
  gap: 1.1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const State = styled.div`
  padding: 1rem 1.2rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const states = [
  {
    title: 'Queued → Running',
    detail: 'Workers lock jobs transactionally to avoid double processing while exposing live ETA based on historical durations.'
  },
  {
    title: 'Succeeded',
    detail: 'Slide statuses roll up into deck progress, unlocking downloads and enabling downstream orchestration.'
  },
  {
    title: 'Failed',
    detail: 'Retries apply exponential backoff; persistent issues surface to users and admins with actionable messages.'
  },
  {
    title: 'Cancelled',
    detail: 'Admins can stop runaway work; workers unwind partial progress and leave assets marked for regeneration.'
  }
];

const jobs = [
  {
    title: 'Ingestion',
    meta: 'Parse PPTX/PDF, extract slide copy + notes, render PNGs, and catalogue embedded media references.',
    accent: 'primary'
  },
  {
    title: 'Script Generation',
    meta: 'Bundle structured slide data into OpenAI prompts with admin-defined tone + guardrails.',
    accent: 'secondary'
  },
  {
    title: 'Audio & Video Production',
    meta: 'Generate ElevenLabs narration, render slide MP4s with FFmpeg, and stitch the 1080p finale.',
    accent: 'accent'
  }
];

export function WorkersSection() {
  return (
    <Section id="workers">
      <SectionInner>
        <Header>
          <Title>Background workers that hum like a modern studio lot.</Title>
          <Description>
            DeckForge Studio orchestrates discrete job types with resilient retries, locking, and telemetry so teams feel the calm of a broadcast control room.
          </Description>
        </Header>
        <Grid>
          {jobs.map((job) => (
            <JobCard key={job.title} $accent={job.accent as 'primary' | 'secondary' | 'accent'}>
              <Badge>Job type</Badge>
              <JobTitle>{job.title}</JobTitle>
              <JobMeta>{job.meta}</JobMeta>
            </JobCard>
          ))}
        </Grid>
        <StateBoard $accent="secondary">
          <Title style={{ fontSize: '2rem', margin: 0 }}>Job lifecycle transparency.</Title>
          <Description style={{ maxWidth: '720px' }}>
            Progress and ETA data stays fresh via polling or SSE/WebSockets, while states broadcast to dashboards, logs, and notification hooks.
          </Description>
          <StateGrid>
            {states.map((state) => (
              <State key={state.title}>
                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{state.title}</h4>
                <p style={{ margin: '0.6rem 0 0', color: 'rgba(230, 227, 255, 0.75)' }}>{state.detail}</p>
              </State>
            ))}
          </StateGrid>
        </StateBoard>
      </SectionInner>
    </Section>
  );
}
