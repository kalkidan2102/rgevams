import PageContainer from "../common/PageContainer";
import Hero from "./Hero";
import { LatestNews } from "./LatestNews";
import { EthiopiaPreview } from "./EthiopiaPreview";
import { Mission } from "./Mission";
import { Gallery } from "./Gallery";
import Statistics from "./Statistics";
import LiveStatus from "./LiveStatus";

import { Footer } from "../layout/Footer";
import ReportPanel from "../ReportPanel";
import { FALLBACK_VOLCANOES } from "../../data/volcanoes";
import { FALLBACK_EARTHQUAKES } from "../../data/earthquakes";
import { SelectedItem } from "../../types";

interface HomePageProps {
  alerts?: any[];
  secondsToSync?: number;
  manualRefreshSpin?: boolean;
  onRefresh?: () => void;
  onLaunchDashboard: () => void;
  onNavigateToTab: (tab: any) => void;
  onSelectAlert?: (alert: any) => void;
  onOpenContact?: () => void;
  onOpenLogin?: () => void;
  earthquakes?: any[];
  volcanoes?: any[];
  selectedItem?: SelectedItem | null;
  onSelectItem?: (item: SelectedItem | null) => void;
  onOpenCometPortal?: (item: SelectedItem) => void;
}

export default function HomePage({
  onLaunchDashboard,
  onNavigateToTab,
  onOpenContact,
  onOpenLogin,
  earthquakes = FALLBACK_EARTHQUAKES,
  volcanoes = FALLBACK_VOLCANOES,
  selectedItem = null,
  onSelectItem,
  onOpenCometPortal,
  secondsToSync,
  manualRefreshSpin,
  onRefresh,
}: HomePageProps) {
  return (
    <PageContainer className="bg-white dark:bg-[#020b14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <main className="space-y-8 md:space-y-12 py-2">
        {/* 1. Hero Section (Matching Reference Screenshot) */}
        <Hero
          onLaunchDashboard={onLaunchDashboard}
          onNavigateToTab={onNavigateToTab}
          onOpenLogin={onOpenLogin}
        />

        {/* 2. "WHO WE ARE" & "WHAT WE DO" (Core Scientific Services & Control Room) */}
        <div className="px-4 md:px-8 max-w-[1440px] mx-auto">
          <Mission />
        </div>

        {/* 3. Live Monitoring Summary & Telemetry Stream */}
        <LiveStatus
          onLaunchDashboard={onLaunchDashboard}
          earthquakes={earthquakes}
          volcanoes={volcanoes}
          secondsToSync={secondsToSync}
          manualRefreshSpin={manualRefreshSpin}
          onRefresh={onRefresh}
        />

        {/* 4. Rifting Corridor Map Preview */}
        <div className="px-4 md:px-8 max-w-[1440px] mx-auto">
          <EthiopiaPreview onExploreMap={() => onNavigateToTab("map")} />
        </div>

        {/* 5. Latest News & Monitoring Bulletins */}
        <div className="px-4 md:px-8 max-w-[1440px] mx-auto">
          <LatestNews />
        </div>

        {/* 6. National Stats Overview */}
        <Statistics />

        {/* 7. Geospatial Media Gallery */}
        <div className="px-4 md:px-8 max-w-[1440px] mx-auto">
          <Gallery />
        </div>

        {/* 8. CTA Banner with Contact Headquarters */}
        
      </main>

      <Footer onOpenContact={onOpenContact} />
    </PageContainer>
  );
}
