import { useState, useMemo } from "react";
import {
  ShieldAlert,
  Building2,
  FileText,
  Radio,
  Download,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Flame,
  Activity,
  Users,
  Send,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Maximize2,
  Share2,
  BarChart3,
  ExternalLink,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Volcano, Earthquake, UserRoleType } from "../../types";
import { generateRiskSummaryPdf } from "../../utils/pdfGenerator";

interface OfficialDashboardProps {
  currentUser: {
    name: string;
    email: string;
    role: UserRoleType;
    institution?: string;
  };
  volcanoes?: Volcano[];
  earthquakes?: Earthquake[];
  onNavigateToTab?: (tab: string) => void;
  onSignOut?: () => void;
}

interface RegionalVulnerability {
  region: string;
  zone: string;
  threatLevel: "High" | "Elevated" | "Guarded" | "Normal";
  populationExposed: string;
  criticalAssets: string[];
  activeVolcanoes: string[];
  recentSeismicEvents: number;
  evacuationReadiness: number; // percentage
  statusMessage: string;
}

export function OfficialDashboard({
  currentUser,
  volcanoes = [],
  earthquakes = [],
  onNavigateToTab,
  onSignOut
}: OfficialDashboardProps) {
  const [activeTab, setActiveTab] = useState<"briefing" | "regions" | "broadcast" | "infrastructure">("briefing");
  const [selectedRegion, setSelectedRegion] = useState<string>("Afar Triangle");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastDraft, setBroadcastDraft] = useState({
    scope: "Public & Multi-Agency",
    urgency: "Immediate",
    severity: "Severe",
    certainty: "Observed",
    category: "Geo",
    headline: "ESSGI Tectonic Directive: Seismic Swarm Precaution in Central Afar",
    instruction: "Regional Emergency Operations Centers (EOC) in Semera and Mille must maintain 24/7 readiness. Field patrols advised to avoid steep fault scarps."
  });

  // Calculate composite statistics
  const highRiskVolcanoes = useMemo(() => {
    return volcanoes.filter(v => v.severity === "Red" || v.severity === "Orange");
  }, [volcanoes]);

  const recentSignificantQuakes = useMemo(() => {
    return earthquakes.filter(e => e.magnitude >= 4.0);
  }, [earthquakes]);

  const regionalData: RegionalVulnerability[] = [
    {
      region: "Afar Triangle & Danakil",
      zone: "Zone 1 & 2 (Semera, Mille, Erta Ale)",
      threatLevel: "High",
      populationExposed: "420,000",
      criticalAssets: ["Tendaho Dam", "Ethio-Djibouti Corridor", "Semera Airport"],
      activeVolcanoes: ["Erta Ale (Lava Lake Active)", "Dallol (Thermal Acid)"],
      recentSeismicEvents: 18,
      evacuationReadiness: 88,
      statusMessage: "Active crustal spreading. High gas flux at Erta Ale South Rim."
    },
    {
      region: "Main Ethiopian Rift (MER)",
      zone: "Central Rift (Hawassa, Ziway, Alutu)",
      threatLevel: "Elevated",
      populationExposed: "1,250,000",
      criticalAssets: ["Alutu Geothermal Plant", "Addis-Mojo Expressway", "Koka Dam"],
      activeVolcanoes: ["Alutu Caldera", "Fentale", "Corbetti"],
      recentSeismicEvents: 9,
      evacuationReadiness: 94,
      statusMessage: "Hydrothermal ground inflation monitored via Sentinel-1 InSAR."
    },
    {
      region: "Southern Rift & Lakes",
      zone: "Gedeo, Bilate Basin, Chamo",
      threatLevel: "Guarded",
      populationExposed: "680,000",
      criticalAssets: ["Bilate River Irrigation", "Arba Minch Regional Grid"],
      activeVolcanoes: ["Chamo Volcanic Field"],
      recentSeismicEvents: 4,
      evacuationReadiness: 91,
      statusMessage: "Baseline micro-seismicity within expected quarterly parameters."
    },
    {
      region: "Northwestern Escarpment",
      zone: "Ankober, Debre Berhan, Dessie",
      threatLevel: "Guarded",
      populationExposed: "890,000",
      criticalAssets: ["A2 National Highway", "Kombolcha Industrial Hub"],
      activeVolcanoes: ["None active"],
      recentSeismicEvents: 6,
      evacuationReadiness: 96,
      statusMessage: "Deep-seated tectonic stress release along western rift margin."
    }
  ];

  const criticalInfrastructure = [
    {
      name: "Tendaho Multi-Purpose Dam",
      type: "Hydraulic Asset",
      location: "Afar Region",
      proximityHazard: "34 km from Dobi Graben Fault",
      status: "SECURE - CONTINUOUS SENSOR LINK",
      riskScore: "Moderate",
      safetyStatus: "Normal Operation"
    },
    {
      name: "Ethio-Djibouti Trans-National Railway",
      type: "Logistics Corridor",
      location: "Mille to Dewele Segment",
      proximityHazard: "18 km from Active Rift Swarms",
      status: "MONITORED - AUTOMATED SPEED SLOWDOWN",
      riskScore: "Guarded",
      safetyStatus: "Active Watch"
    },
    {
      name: "Alutu-Langano Geothermal Power Field",
      type: "Energy Infrastructure",
      location: "Central Ethiopian Rift",
      proximityHazard: "Inside Alutu Caldera Boundary",
      status: "MONITORED - STEAM FLUX CALIBRATED",
      riskScore: "Elevated",
      safetyStatus: "Under Sensor Review"
    },
    {
      name: "Grand Ethiopian Renaissance Dam (GERD)",
      type: "Strategic National Asset",
      location: "Benishangul-Gumuz",
      proximityHazard: "> 350 km from Active Rift Core",
      status: "PRISTINE - ZERO DETECTED SEISMIC RISK",
      riskScore: "Negligible",
      safetyStatus: "Optimal Security"
    },
    {
      name: "Addis Ababa - Adama Expressway",
      type: "Transportation Spine",
      location: "Shewa / Oromia",
      proximityHazard: "62 km from Fentale Volcanic Complex",
      status: "SECURE - STRUCTURAL SENSORS NOMINAL",
      riskScore: "Low",
      safetyStatus: "Unrestricted"
    }
  ];

  const handleExportBriefing = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      generateRiskSummaryPdf(volcanoes, earthquakes);
      setIsExportingPdf(false);
    }, 600);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E4A72] via-[#0A3856] to-[#041B2D] text-white p-5 sm:p-6 md:p-8 shadow-xl border border-slate-700/60 border-b-4 border-b-[#D48F29]">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#D48F29]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-[#D48F29] text-slate-950 font-mono text-[10.5px] font-black uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
                MINISTERIAL COMMAND PORTAL
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-white font-mono text-[10px] font-semibold uppercase rounded-md border border-white/15">
                Clearance: Official / Decision Maker
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DRMC Defense Link Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              National Geohazard Executive Command
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              High-level strategic situational awareness, regional vulnerability indices, and multi-agency crisis communication protocols for the Ethiopian Rift System. Prepared for <strong className="text-[#F7D08A]">{currentUser.name}</strong> ({currentUser.institution || "Disaster Risk Management Commission"}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportBriefing}
              disabled={isExportingPdf}
              className="px-4 py-2.5 bg-[#D48F29] hover:bg-[#b87c22] active:scale-98 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Clock className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Download className="w-4 h-4 text-slate-950" />
              )}
              <span>Export Cabinet Brief (PDF)</span>
            </button>

            <button
              onClick={() => onNavigateToTab?.("map")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border border-white/20 shadow-xs"
            >
              <Compass className="w-4 h-4 text-[#F7D08A]" />
              <span>GIS Operations Room</span>
            </button>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border border-rose-500/30"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. FIGMA-GRADE BENTO KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: National Composite Hazard Index */}
        <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              National Threat Level
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight flex items-baseline gap-2">
              LEVEL 3
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                ELEVATED
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Active magmatic and seismic unrest in Afar Depression
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>24h Trend: Constant</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">DRMC Code: YELLOW</span>
          </div>
        </div>

        {/* Metric 2: Exposed Population in Threat Zones */}
        <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Corridor Population
            </span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              1.42M
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Residents in high-strain rift zones within 30km of active centers
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Shelter Capacity: 84%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Readiness: High</span>
          </div>
        </div>

        {/* Metric 3: Active Volcanic Vent Centers */}
        <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              High-Risk Volcanic Centers
            </span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {highRiskVolcanoes.length} Peaks
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Erta Ale, Dabbahu & Alutu under continuous InSAR radar surveillance
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Thermal Output: 420 MW</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">Red Alert: 1 Active</span>
          </div>
        </div>

        {/* Metric 4: Critical Infrastructure Protection */}
        <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Strategic Assets Guarded
            </span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              100% Operational
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              GERD, Tendaho Dam, Ethio-Djibouti Rail under zero imminent rupture risk
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Sensors Live: 18/18</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Status: Nominal</span>
          </div>
        </div>
      </div>

      {/* 3. FIGMA-STYLE SEGMENTED NAVIGATION CONTROLLER */}
      <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-1.5 shadow-xs flex flex-wrap gap-1.5 font-bold text-xs uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("briefing")}
          className={`flex-1 min-w-[150px] py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "briefing"
              ? "bg-[#0E4A72] text-[#F7D08A] shadow-sm font-black"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Strategic Briefing</span>
        </button>

        <button
          onClick={() => setActiveTab("regions")}
          className={`flex-1 min-w-[150px] py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "regions"
              ? "bg-[#0E4A72] text-[#F7D08A] shadow-sm font-black"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Regional Vulnerability</span>
        </button>

        <button
          onClick={() => setActiveTab("broadcast")}
          className={`flex-1 min-w-[150px] py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "broadcast"
              ? "bg-[#0E4A72] text-[#F7D08A] shadow-sm font-black"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>CAP Multi-Agency Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab("infrastructure")}
          className={`flex-1 min-w-[150px] py-2.5 px-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "infrastructure"
              ? "bg-[#0E4A72] text-[#F7D08A] shadow-sm font-black"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Critical Infrastructure</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {/* TAB 1: STRATEGIC BRIEFING & CABINET ADVISORY */}
      {activeTab === "briefing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Strategic Directive Report */}
            <div className="lg:col-span-2 bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                    EXECUTIVE SITUATION REPORT &bull; 2026-Q3
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 font-display">
                    National Tectonic Tension &amp; Magmatic Expansion Analysis
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10.5px] font-mono text-slate-400 block">Report Authored: Today, 08:00 EAT</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Status: Formally Signed</span>
                </div>
              </div>

              {/* Key Executive Findings */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>1. Erta Ale Caldera Magma Expansion:</strong> Continuous satellite Sentinel-1 InSAR measurements and thermal infrared radiometry indicate sustained basaltic convection in the southern lava lake. While contained within the caldera rim, elevated sulfur dioxide (SO₂) gas venting poses localized respiratory hazards for nomadic settlements within a 15 km perimeter.
                </p>
                <p>
                  <strong>2. Dobi Graben Seismic Swarm Activity:</strong> Over the preceding 72 hours, a swarm of 18 micro-earthquakes (magnitudes M 2.8 to M 4.3) was recorded by the Semera seismic station array. Focal depth analysis indicates shallow normal faulting along the Afar rift margin (depth: 8–12 km). No surface rupture detected across the Ethio-Djibouti transportation spine.
                </p>
                <p>
                  <strong>3. Alutu-Langano Geothermal Ground Displacement:</strong> Geodetic GNSS nodes register 12 mm/year uplift across the Alutu caldera dome. Reservoir pressure sensors operate nominally with zero detected structural fissure threat to power generation turbines.
                </p>
              </div>

              {/* Cabinet Recommendations Checklist */}
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0E4A72] dark:text-[#F7D08A] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Mandated Ministerial Action Plan
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Pre-position Emergency Relief Supplies:</strong> Ensure Semera Logistics Hub maintains 5,000 emergency kits and clean water bladders.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Aviation NOTAM Advisory:</strong> Civil Aviation Authority informed of possible Erta Ale plume altitude spikes during southerly wind shifts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Ethio-Djibouti Rail Speed Limits:</strong> Automatic seismic trip switches in Mille maintain yellow condition; trains advised at 60 km/h across active scarp.</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleExportBriefing}
                  className="text-xs font-mono font-bold text-[#0E4A72] dark:text-[#F7D08A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Document with Ethiopian Government Crest
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                  Document ID: ETH-DRMC-GEO-2026-088
                </span>
              </div>
            </div>

            {/* Right Col: High-Threat Peaks & Immediate Radar Insights */}
            <div className="space-y-6">
              {/* Alert Peak Card */}
              <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600" />
                    Active Threat Volcanic Peaks
                  </h4>
                  <span className="text-[9px] font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
                    URGENT
                  </span>
                </div>

                <div className="space-y-3">
                  {highRiskVolcanoes.slice(0, 3).map((v) => (
                    <div key={v.id} className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{v.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{v.region} &bull; {v.elevation}m</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        v.severity === "Red"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {v.severity} ALERT
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateToTab?.("insar")}
                  className="w-full py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open COMET InSAR Radar Lab</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Multi-Agency Readiness Gauge */}
              <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Regional Response Mobilization
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-sans">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Semera Quick Response Force</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-sans">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Hawassa Emergency Center</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">96%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "96%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-sans">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Dire Dawa Logistics Hub</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">84%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "84%" }} />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 font-sans leading-normal">
                  All 3 regional emergency garrisons are connected to the central ESSGI high-speed satellite telemetry stream.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGIONAL VULNERABILITY MATRIX */}
      {activeTab === "regions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionalData.map((reg) => {
              const isSelected = selectedRegion === reg.region;
              return (
                <div
                  key={reg.region}
                  onClick={() => setSelectedRegion(reg.region)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#0E4A72]/5 dark:bg-[#0E4A72]/20 border-[#0E4A72] dark:border-[#F7D08A] shadow-md ring-2 ring-[#0E4A72]/20"
                      : "bg-white dark:bg-[#07131F] border-slate-200/80 dark:border-white/10 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        reg.threatLevel === "High"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : reg.threatLevel === "Elevated"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}>
                        {reg.threatLevel} THREAT
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {reg.recentSeismicEvents} Events
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                      {reg.region}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {reg.zone}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Exposed Population:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{reg.populationExposed}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Readiness:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{reg.evacuationReadiness}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Region Detailed Panel */}
          {(() => {
            const current = regionalData.find(r => r.region === selectedRegion) || regionalData[0];
            return (
              <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E4A72] dark:text-[#F7D08A]">
                      SECTOR VULNERABILITY DOSSIER
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {current.region} &bull; {current.zone}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToTab?.("map")}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Inspect On Map</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Critical Infrastructure in Sector</span>
                    <ul className="space-y-1.5 font-medium text-slate-800 dark:text-slate-200">
                      {current.criticalAssets.map((asset, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0E4A72] dark:bg-[#F7D08A]" />
                          <span>{asset}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Active Volcanic Edifices</span>
                    <ul className="space-y-1.5 font-medium text-slate-800 dark:text-slate-200">
                      {current.activeVolcanoes.map((volc, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{volc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Executive Assessment</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {current.statusMessage}
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                        Direct Evacuation Corridor: Clear (92% Logistics Readied)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: COMMON ALERTING PROTOCOL (CAP) MULTI-AGENCY DISPATCH */}
      {activeTab === "broadcast" && (
        <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/40">
                OASIS COMMON ALERTING PROTOCOL (CAP v1.2)
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                Inter-Agency Emergency Directive &amp; Public Warning Broadcast
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-channel broadcast terminal synchronized with Ethiopian Broadcasting Corporation (EBC), Ethio Telecom Cellular SMS, and DRMC Field Posts.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CAP Gateway Ready
            </span>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                  Urgency
                </label>
                <select
                  value={broadcastDraft.urgency}
                  onChange={(e) => setBroadcastDraft({ ...broadcastDraft, urgency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="Immediate">Immediate (Responsive in &lt; 1 hr)</option>
                  <option value="Expected">Expected (Responsive in &lt; 6 hrs)</option>
                  <option value="Future">Future (Preparatory)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                  Severity
                </label>
                <select
                  value={broadcastDraft.severity}
                  onChange={(e) => setBroadcastDraft({ ...broadcastDraft, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="Extreme">Extreme (Extraordinary threat to life)</option>
                  <option value="Severe">Severe (Significant threat to life/property)</option>
                  <option value="Moderate">Moderate (Possible threat)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                  Target Scope
                </label>
                <select
                  value={broadcastDraft.scope}
                  onChange={(e) => setBroadcastDraft({ ...broadcastDraft, scope: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="Public & Multi-Agency">Public & Multi-Agency (All Channels)</option>
                  <option value="Internal EOC Only">Internal EOC & DRMC Command Only</option>
                  <option value="Civil Aviation Only">Civil Aviation (NOTAM Feed)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                  Certainty
                </label>
                <select
                  value={broadcastDraft.certainty}
                  onChange={(e) => setBroadcastDraft({ ...broadcastDraft, certainty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="Observed">Observed (Determined by sensors)</option>
                  <option value="Likely">Likely (&gt; 50% probability)</option>
                  <option value="Possible">Possible (Active monitoring)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                Directive Headline
              </label>
              <input
                type="text"
                value={broadcastDraft.headline}
                onChange={(e) => setBroadcastDraft({ ...broadcastDraft, headline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 font-sans"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 block mb-1">
                Executive Instructions &amp; Precautionary Measures
              </label>
              <textarea
                rows={3}
                value={broadcastDraft.instruction}
                onChange={(e) => setBroadcastDraft({ ...broadcastDraft, instruction: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-500 font-mono">
                Authenticated Authorized Officer: <strong className="text-slate-800 dark:text-white">{currentUser.name}</strong> ({currentUser.email})
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Radio className="w-4 h-4" />
                <span>Simulate / Transmit Emergency CAP Alert</span>
              </button>
            </div>
          </form>

          {broadcastSent && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs">Emergency Directive Dispatched via CAP Protocol</h5>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Message ingested into ESSGI National Alert Stream. Distributed to DRMC Command, EBC Emergency Crawl, and Ethio Telecom test dispatch gateway.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 4: CRITICAL INFRASTRUCTURE ASSET SENTINEL */}
      {activeTab === "infrastructure" && (
        <div className="bg-white dark:bg-[#07131F] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                STRATEGIC ASSET DEFENSE MONITOR
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                Ethiopian Critical Infrastructure Proximity &amp; Integrity Sentinel
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              5 Key Asset Categories Tracked
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Nearest Hazard Proximity</th>
                  <th className="py-3 px-4">Operational Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {criticalInfrastructure.map((asset, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {asset.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {asset.type}
                    </td>
                    <td className="py-3 px-4">
                      {asset.location}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-amber-700 dark:text-amber-400">
                      {asset.proximityHazard}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {asset.safetyStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigateToTab?.("map")}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-[#0E4A72] hover:text-white text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                        title="Locate Asset on Interactive Map"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default OfficialDashboard;
