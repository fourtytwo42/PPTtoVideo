import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Plus_Jakarta_Sans, DM_Serif_Display } from 'next/font/google';
import AppProviders from '@/app/providers';

const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });
const serif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'DeckForge Studio | Automated Slide-to-Video Platform',
  description:
    'DeckForge Studio transforms PPT, PDF, and Google Slides into cinematic, narrated videos using AI-driven scripts, ElevenLabs audio, and intelligent automation.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
