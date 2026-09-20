import React, { useState } from "react";
import {
  Activity,
  Flame,
  Radio,
  Compass,
  LineChart,
  Globe,
  Download,
  Filter,
  Layers,
  ChevronRight,
  ChevronDown,
  Wifi,
  ShieldCheck,
  Shield,
  Building2,
  FileText,
  LayoutDashboard,
  Cpu,
  Map,
  Rss,
  Archive,
  Users,
  Settings,
  Bell,
  Fingerprint,
  PanelLeftClose,
  PanelLeftOpen,
  Waves,
  Lock,
  LogIn,
  AlertTriangle
} from "lucide-react";
import { Volcano, Earthquake, UserRole } from "../../types";

export type DashboardSubTab =
  | "overview"
  | "volcanoes"
  | "earthquakes"
  | "seismicwave"
  | "gnss"
  | "insar"
  | "observatory"
  | "analytics"
  | "advisor"
  | "reports"
  | "catalog"
  | "feeds"
  | "archive"
  | "users"
  | "settings"
  | "audit";

interface CockpitSidebarProps {
  activeSubTab: string;
  onSelectSubTab: (tab: any) => void;
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
  dashboardZoneFilter?: "all" | "high-risk" | "volcanic" | "seismic";
  onSelectZoneFilter?: (filter: "all" | "high-risk" | "volcanic" | "seismic") => void;
  currentUser?: UserRole;
  onNavigateTab?: (tab: string) => void;
  onSelectReportType?: (type: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAuthModal?: () => void;
}

export default function CockpitSidebar({
  activeSubTab,
  onSelectSubTab,
  volcanoes,
  earthquakes,
  currentUser,
  onNavigateTab,
  onSelectReportType,
  isCollapsed = false,
  onToggleCollapse,
  onOpenAuthModal,
}: CockpitSidebarProps) {
  const [restrictedModalSection, setRestrictedModalSection] = useState<string | null>(null);

  const activeVolcanoAlerts = volcanoes.filter((v) => v.severity === "Red" || v.severity === "Orange").length;
  const criticalEarthquakes = earthquakes.filter((e) => e.magnitude >= 4.5 || e.severity === "Red").length;

  const currentTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isStaffOrAdmin = currentUser?.role === "admin" || currentUser?.role === "official" || currentUser?.role === "superadmin";

  const handleNavClick = (tabId: string) => {
    if (tabId === "reports") {
      if (onNavigateTab) onNavigateTab("report");
      else onSelectSubTab("reports");
    } else if (tabId === "catalog") {
      onSelectSubTab("overview");
      const searchInput = document.getElementById("cockpit-catalog-search-input");
      if (searchInput) searchInput.focus();
    } else if (tabId === "insar") {
      onSelectSubTab("observatory");
    } else {
      onSelectSubTab(tabId);
    }
  };

  const handleAdminNavClick = (subTab: "users" | "settings" | "audit", label: string) => {
    if (isStaffOrAdmin) {
      onSelectSubTab(subTab);
    } else {
      setRestrictedModalSection(label);
    }
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col space-y-4 select-none transition-all duration-300">
      {/* 1. INSTITUTIONAL BRAND HEADER WITH COLLAPSE TOGGLE */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#0085C8]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold font-sans tracking-tight text-slate-900 dark:text-white uppercase leading-snug truncate">
              GEOHAZARD PORTAL
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate leading-tight">
              National Earth Observation &amp; Geodynamics Division
            </p>
          </div>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer border-0 shrink-0 ml-1"
            title="Hide Sidebar to widen monitoring workspace"
            aria-label="Hide Sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-[#0085C8]" />
          </button>
        )}
      </div>

      {/* 2. PRIMARY NAVIGATION ACCORDION / TREE */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Active Cockpit Overview Highlight Card */}
        <button
          onClick={() => onSelectSubTab("overview")}
          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
            activeSubTab === "overview"
              ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-[#0085C8] dark:text-sky-300 font-bold shadow-2xs"
              : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeSubTab === "overview"
                  ? "bg-[#0085C8] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block text-slate-900 dark:text-white">Cockpit Overview</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Monitoring cockpit</span>
            </div>
          </div>
          {activeSubTab === "overview" ? (
            <span className="w-2 h-2 rounded-full bg-[#0085C8] shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>

        {/* SECTION 1: MONITORING */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            MONITORING
          </div>

          {/* Earthquake Monitoring */}
          <button
            onClick={() => handleNavClick("earthquakes")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "earthquakes"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-[#0085C8] font-bold"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-500 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Earthquake Monitoring</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">Real-time seismic data</span>
              </div>
            </div>
            {criticalEarthquakes > 0 ? (
              <span className="bg-rose-500 text-white text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0">
                {criticalEarthquakes}
              </span>
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
            )}
          </button>

          {/* Volcanic Monitoring */}
          <button
            onClick={() => handleNavClick("volcanoes")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "volcanoes"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-[#0085C8] font-bold"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-orange-500 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Volcanic Monitoring</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">Alerts &amp; thermal activity</span>
              </div>
            </div>
            {activeVolcanoAlerts > 0 ? (
              <span className="bg-orange-500 text-white text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0">
                {activeVolcanoAlerts}
              </span>
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
            )}
          </button>

          {/* Seismic Waveforms & FURI Seismograph */}
          <button
            onClick={() => handleNavClick("seismicwave")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "seismicwave"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-[#0085C8] font-bold shadow-2xs"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                <Waves className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Seismic Waveforms</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-slate-400 block font-normal truncate">FURI live broadband stream</span>
              </div>
            </div>
            <span className="bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0">
              FURI
            </span>
          </button>

          {/* GNSS Monitoring */}
          <button
            onClick={() => handleNavClick("gnss")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "gnss"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-[#0085C8] font-bold"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sky-500 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">GNSS Geodesy Network</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">48 tracking stations &amp; drift</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* InSAR Monitoring */}
          <button
            onClick={() => handleNavClick("insar")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "insar" || activeSubTab === "observatory"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-[#0085C8] font-bold"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-500 shrink-0">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">InSAR Monitoring</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">Surface deformation maps</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* SECTION 2: INTELLIGENCE & ANALYTICS */}
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pt-2">
            INTELLIGENCE &amp; ANALYTICS
          </div>

          {/* Analytics Dashboard */}
          <button
            onClick={() => handleNavClick("analytics")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "analytics"
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-[#0085C8] font-bold"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-500 shrink-0">
                <LineChart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Analytics Dashboard</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">KPIs &amp; visual insights</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* AI Situation Advisor */}
          <button
            onClick={() => {
              onSelectSubTab("overview");
              const aiCard = document.getElementById("drmc-ai-advisor-card");
              if (aiCard) aiCard.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-purple-500 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">AI Situation Advisor</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">Smart geohazard insights</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Reports & Export */}
          <button
            onClick={() => handleNavClick("reports")}
            className="w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-500 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Reports &amp; Export</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">PDF, CSV &amp; data export</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* SECTION 3: DATA & RESOURCES */}
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pt-2">
            DATA &amp; RESOURCES
          </div>

          {/* Spatial Catalog */}
          <button
            onClick={() => handleNavClick("catalog")}
            className="w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-500 shrink-0">
                <Map className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Spatial Catalog</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">Search map &amp; datasets</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Data Feeds */}
          <button
            onClick={() => {
              onSelectSubTab("overview");
              const usgsCard = document.getElementById("usgs-live-stream-card");
              if (usgsCard) usgsCard.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-500 shrink-0">
                <Rss className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Data Feeds</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">External data sources</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Event Archive */}
          <button
            onClick={() => handleNavClick("earthquakes")}
            className="w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                <Archive className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200 truncate">Event Archive</span>
                <span className="text-[10px] text-slate-400 block font-normal truncate">Historical event records</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* SECTION 4: ADMINISTRATION */}
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pt-2 flex items-center justify-between">
            <span>ADMINISTRATION</span>
            {isStaffOrAdmin ? (
              <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                STAFF / ADMIN
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                STAFF ONLY
              </span>
            )}
          </div>

          {/* User & Roles */}
          <button
            onClick={() => handleAdminNavClick("users", "User & Role Management")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "users"
                ? "bg-[#0085C8] text-white border-[#0085C8] shadow-xs"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeSubTab === "users"
                  ? "bg-white/20 text-white"
                  : isStaffOrAdmin
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block truncate">User &amp; Roles</span>
                <span className={`text-[10px] block font-normal truncate ${activeSubTab === "users" ? "text-white/80" : "text-slate-400"}`}>
                  Access management
                </span>
              </div>
            </div>
            {isStaffOrAdmin ? (
              <ChevronRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ${activeSubTab === "users" ? "text-white" : "text-slate-300"}`} />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>

          {/* System Settings */}
          <button
            onClick={() => handleAdminNavClick("settings", "System Settings & Alert Configuration")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "settings"
                ? "bg-[#0085C8] text-white border-[#0085C8] shadow-xs"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeSubTab === "settings"
                  ? "bg-white/20 text-white"
                  : isStaffOrAdmin
                  ? "bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>
                <Settings className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block truncate">System Settings</span>
                <span className={`text-[10px] block font-normal truncate ${activeSubTab === "settings" ? "text-white/80" : "text-slate-400"}`}>
                  Configurations &amp; alerts
                </span>
              </div>
            </div>
            {isStaffOrAdmin ? (
              <ChevronRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ${activeSubTab === "settings" ? "text-white" : "text-slate-300"}`} />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Audit Logs */}
          <button
            onClick={() => handleAdminNavClick("audit", "Security Audit & Transaction Ledger")}
            className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
              activeSubTab === "audit"
                ? "bg-[#0085C8] text-white border-[#0085C8] shadow-xs"
                : "bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeSubTab === "audit"
                  ? "bg-white/20 text-white"
                  : isStaffOrAdmin
                  ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold block truncate">Audit Logs</span>
                <span className={`text-[10px] block font-normal truncate ${activeSubTab === "audit" ? "text-white/80" : "text-slate-400"}`}>
                  Activity &amp; security logs
                </span>
              </div>
            </div>
            {isStaffOrAdmin ? (
              <ChevronRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ${activeSubTab === "audit" ? "text-white" : "text-slate-300"}`} />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* ACCESS RESTRICTED MODAL (For Guests) */}
      {restrictedModalSection && (
        <div
          onClick={() => setRestrictedModalSection(null)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500/50 shadow-2xl max-w-md w-full p-6 space-y-4 cursor-default text-slate-900 dark:text-slate-100 animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  RESTRICTED ADMINISTRATIVE AREA
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase font-display">
                  Staff &amp; Admin Authorization Required
                </h3>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p>
                <strong>{restrictedModalSection}</strong> contains sensitive institutional tools reserved for authorized <strong>Staff Geophysicists</strong> and <strong>System Administrators</strong> of the Department of Geodesy and Geodynamics.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Current Role: <span className="font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">{currentUser?.role || "GUEST"}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRestrictedModalSection(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    setRestrictedModalSection(null);
                    onOpenAuthModal();
                  }}
                  className="px-5 py-2 text-xs font-black bg-[#0E4A72] hover:bg-[#0085C8] text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In as Staff / Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SYSTEM STATUS CARD */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
          SYSTEM STATUS
        </span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              All Systems Operational
            </span>
          </div>
          {/* Mini ECG Heartbeat Icon */}
          <Activity className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-1.5 flex items-center justify-between">
          <span>Last checked: {currentTimeStr}</span>
          <span className="font-mono font-bold text-emerald-600">99.9%</span>
        </div>
      </div>

      {/* 4. USER PROFILE CARD */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#0085C8] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
              {currentUser?.name || "Admin User"}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate capitalize">
              {currentUser?.role === "admin"
                ? "Super Administrator"
                : currentUser?.role === "official"
                ? "Senior Geophysicist"
                : "Observatory Staff"}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </div>
    </aside>
  );
}
