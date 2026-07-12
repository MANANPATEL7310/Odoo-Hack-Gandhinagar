import { useEffect, useState } from "react";
import { LandingNav } from "@/features/marketing/components/landing-nav";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { ProblemSection } from "@/features/marketing/components/problem-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { HowItWorksSection } from "@/features/marketing/components/how-it-works-section";
import { RolesSection } from "@/features/marketing/components/roles-section";
import { StatsSection } from "@/features/marketing/components/stats-section";
import { CtaSection } from "@/features/marketing/components/cta-section";
import { LandingFooter } from "@/features/marketing/components/landing-footer";
import { apiClient } from "@/services/http/api-client";
import type { ApiSuccess } from "@/services/http/api-response";

export interface PublicMetrics {
  totalAssets: number;
  allocatedAssets: number;
  assetsUnderMaintenance: number;
  activeDepartments: number;
  activeEmployees: number;
  activeBookings: number;
  activeMaintenanceRequests: number;
  openAuditCycles: number;
  activityLogCount: number;
  assetHealthPercent: number;
}

export function HomePage() {
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response =
          await apiClient.get<ApiSuccess<PublicMetrics>>("/public-metrics");
        setMetrics(response.data.data);
      } catch (error) {
        console.error("Failed to load public metrics", error);
      }
    }

    loadMetrics();
  }, []);

  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection metrics={metrics} />
        <StatsSection metrics={metrics} />
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
