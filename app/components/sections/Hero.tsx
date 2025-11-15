'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';
import { GlowCard } from '../ui/GlowCard';

const HeroWrapper = styled(Section)`
  padding-top: clamp(6rem, 12vw, 10rem);
`;

const HeroContent = styled(SectionInner)`
  display: grid;
  gap: clamp(2.5rem, 4vw, 4rem);
  position: relative;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(2.5rem, 4vw, 4rem);
  align-items: center;
`;

const Title = styled.h1`
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(3rem, 7vw, 4.8rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0;
  color: #ffffff;
`;

const Subtitle = styled.p`
  margin: 1.5rem 0 clamp(2.5rem, 3vw, 3.2rem);
  font-size: clamp(1.1rem, 1.5vw, 1.25rem);
  color: ${({ theme }) => theme.colors.muted};
  max-width: 44rem;
`;

const CTAGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CTAButton = styled(Link)<{ $variant?: 'solid' | 'ghost' }>`
  padding: 0.85rem 1.6rem;
  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: 600;
  letter-spacing: 0.01em;
  backdrop-filter: blur(10px);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid
    ${({ theme, $variant }) => ($variant === 'ghost' ? 'rgba(255, 255, 255, 0.18)' : 'transparent')};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost'
      ? 'rgba(255, 255, 255, 0.05)'
      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  color: ${({ theme, $variant }) => ($variant === 'ghost' ? theme.colors.text : '#0a051a')};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.shadows.soft : theme.shadows.glow};
  }
`;

const MetricsPanel = styled.div`
  display: grid;
  gap: 1rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const MetricCard = styled(GlowCard)`
  padding: 1.75rem;
`;

const MetricValue = styled.span`
  display: block;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const MetricLabel = styled.span`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const FloatingOrbs = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    filter: blur(120px);
    opacity: 0.45;
  }

  &::before {
    width: clamp(14rem, 35vw, 22rem);
    height: clamp(14rem, 35vw, 22rem);
    top: -10%;
    right: -5%;
    background: ${({ theme }) => theme.colors.primary};
  }

  &::after {
    width: clamp(12rem, 30vw, 18rem);
    height: clamp(12rem, 30vw, 18rem);
    bottom: -15%;
    left: -8%;
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  background: rgba(140, 92, 255, 0.14);
  border: 1px solid rgba(140, 92, 255, 0.3);
  width: fit-content;
`;

export function HeroSection() {
  return (
    <HeroWrapper id="hero">
      <FloatingOrbs />
      <HeroContent>
        <HeroGrid>
          <div>
            <Pill>Next-gen automation for enterprise storytellers</Pill>
            <Title>
              From static slides to cinematic stories in minutes.
            </Title>
            <Subtitle>
              DeckForge Studio ingests decks, writes human-ready scripts, produces lifelike ElevenLabs narration, and assembles
              breathtaking 1080p videos—without endless editing sessions.
            </Subtitle>
            <CTAGroup>
              <CTAButton href="#pipeline">Explore the Pipeline</CTAButton>
              <CTAButton href="#experience" $variant="ghost">
                View the Experience
              </CTAButton>
            </CTAGroup>
          </div>
          <MetricsPanel>
            <GlowCard $accent="secondary">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Trusted automation for teams
              </h3>
              <p style={{ marginTop: '0.9rem', color: 'rgba(230, 227, 255, 0.7)', fontSize: '0.95rem' }}>
                Purpose-built for marketing, enablement, and training teams that need fast, polished narration-ready videos
                without sacrificing control.
              </p>
            </GlowCard>
            <MetricsGrid>
              {[{ value: '200+', label: 'Slides processed per deck without breaking a sweat.' },
                { value: '4 min', label: 'Average time to go from upload to shareable video.' },
                { value: '99.9%', label: 'Job reliability with self-healing background workers.' }].map((metric) => (
                <MetricCard key={metric.label}>
                  <MetricValue>{metric.value}</MetricValue>
                  <MetricLabel>{metric.label}</MetricLabel>
                </MetricCard>
              ))}
            </MetricsGrid>
          </MetricsPanel>
        </HeroGrid>
      </HeroContent>
    </HeroWrapper>
  );
}
