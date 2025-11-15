'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { Section, SectionInner } from '../ui/Section';

const FooterWrapper = styled(Section)`
  padding: clamp(3rem, 5vw, 4rem) 0;
  background: rgba(10, 8, 20, 0.85);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const FooterGrid = styled(SectionInner)`
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  align-items: start;
`;

const Brand = styled.div`
  display: grid;
  gap: 1rem;
`;

const BrandName = styled.span`
  font-family: var(--font-serif);
  font-size: 1.8rem;
`;

const BrandDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  max-width: 320px;
`;

const FooterLinks = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const FooterLink = styled(Link)`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.muted};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const FinePrint = styled.p`
  margin: clamp(2rem, 4vw, 3rem) auto 0;
  text-align: center;
  color: rgba(230, 227, 255, 0.4);
  font-size: 0.8rem;
`;

export function FooterSection() {
  return (
    <FooterWrapper as="footer">
      <FooterGrid>
        <Brand>
          <BrandName>DeckForge Studio</BrandName>
          <BrandDescription>
            Automate narration-ready video production for your entire organization with human-grade control and dazzling polish.
          </BrandDescription>
        </Brand>
        <FooterLinks>
          <h4 style={{ margin: 0, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Explore</h4>
          <FooterLink href="#pipeline">Pipeline</FooterLink>
          <FooterLink href="#experience">Experience</FooterLink>
          <FooterLink href="#admin">Admin</FooterLink>
          <FooterLink href="#architecture">Architecture</FooterLink>
        </FooterLinks>
        <FooterLinks>
          <h4 style={{ margin: 0, fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Get in touch</h4>
          <FooterLink href="mailto:hello@deckforgestudio.com">hello@deckforgestudio.com</FooterLink>
          <FooterLink href="https://openai.com" target="_blank">OpenAI Integration</FooterLink>
          <FooterLink href="https://elevenlabs.io" target="_blank">ElevenLabs Voices</FooterLink>
        </FooterLinks>
      </FooterGrid>
      <FinePrint>© {new Date().getFullYear()} DeckForge Studio. Crafted for enterprise-grade storytellers.</FinePrint>
    </FooterWrapper>
  );
}
