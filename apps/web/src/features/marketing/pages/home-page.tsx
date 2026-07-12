import { LandingNav } from "@/features/marketing/components/landing-nav";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { ProblemSection } from "@/features/marketing/components/problem-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { HowItWorksSection } from "@/features/marketing/components/how-it-works-section";
import { RolesSection } from "@/features/marketing/components/roles-section";
import { StatsSection } from "@/features/marketing/components/stats-section";
import { CtaSection } from "@/features/marketing/components/cta-section";
import { LandingFooter } from "@/features/marketing/components/landing-footer";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RolesSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
