import { AuroraBackground } from '../components/common/AuroraBackground';
import { Navigation } from '../components/common/Navigation';
import { HeroSection } from '../components/sections/Hero';
import { GoalsSection } from '../components/sections/Goals';
import { SetupSection } from '../components/sections/Setup';
import { AuthSection } from '../components/sections/Auth';
import { PipelineSection } from '../components/sections/Pipeline';
import { FlowsSection } from '../components/sections/Flows';
import { ExperienceSection } from '../components/sections/Experience';
import { AdminSection } from '../components/sections/Admin';
import { WorkersSection } from '../components/sections/Workers';
import { ArchitectureSection } from '../components/sections/Architecture';
import { LifecycleSection } from '../components/sections/Lifecycle';
import { SecuritySection } from '../components/sections/Security';
import { ScalabilitySection } from '../components/sections/Scalability';
import { AssurancesSection } from '../components/sections/Assurances';
import { FutureSection } from '../components/sections/Future';
import { FooterSection } from '../components/sections/Footer';

export default function MarketingPage() {
  return (
    <>
      <Navigation />
      <AuroraBackground />
      <main>
        <HeroSection />
        <GoalsSection />
        <SetupSection />
        <AuthSection />
        <PipelineSection />
        <FlowsSection />
        <ExperienceSection />
        <AdminSection />
        <WorkersSection />
        <ArchitectureSection />
        <LifecycleSection />
        <SecuritySection />
        <ScalabilitySection />
        <AssurancesSection />
        <FutureSection />
        <FooterSection />
      </main>
    </>
  );
}
