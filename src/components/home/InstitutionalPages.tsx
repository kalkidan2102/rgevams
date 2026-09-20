import React, { useState } from "react";
import {
  Building2,
  Target,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Send,
  Globe,
  Award,
  Shield,
  Compass,
  ChevronRight,
  ArrowRight,
  FileText,
  Radio,
  Calendar,
  Users,
  Cpu,
  BookOpen,
  Bell,
  Sparkles,
  Search,
  Check,
  Zap,
  Map,
  Info,
  Activity,
  Flame,
  Layers,
  Server,
  HardDrive,
  Gauge,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";
import { SECTORS_DATA, SectorData } from "../../data/sectors";
import { ANNOUNCEMENTS_DATA } from "../../data/announcements";

export interface PageProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenSectorModal?: (sector: any) => void;
  onOpenAnnouncementModal?: (announcement: any) => void;
  selectedAnnouncement?: any;
  onSelectAnnouncement?: (announcement: any) => void;
}

/* ==========================================
   INSTITUTIONAL IN-PAGE SUB-NAVIGATION BAR
   Allows switching between all dropdown-listed sections right on the page
   ========================================== */
export function InstitutionalSubNav({
  activeTab,
  onNavigateToTab,
}: {
  activeTab: string;
  onNavigateToTab?: (tab: string) => void;
}) {
  const tabs = [
    { id: "about", label: "About SSGI & Geodesy", icon: Building2 },
    { id: "mission", label: "Mission & Mandate", icon: Compass },
    { id: "focus", label: "Focus Areas", icon: Target },
    { id: "sectors", label: "Scientific Directorates", icon: Layers },
    { id: "announcements", label: "Announcements & Gazettes", icon: Bell },
    { id: "contact", label: "Contact & Stations", icon: MapPin },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs mb-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigateToTab?.(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#0E4A72] text-[#F7D08A] shadow-xs ring-1 ring-[#D48F29]/30"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0E4A72]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D48F29]" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D48F29]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================
   1. ABOUT GEODESY & DEPARTMENT FULL PAGE VIEW
   ========================================== */
export function AboutSSGIPage({ onNavigateToTab }: PageProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      <InstitutionalSubNav activeTab="about" onNavigateToTab={onNavigateToTab} />

      {/* Page Header / Institutional Breadcrumb Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#EBF3FA] dark:bg-slate-850 text-slate-900 dark:text-white p-5 sm:p-6 shadow-xs border border-[#B9D5EB] dark:border-slate-800 border-b-2 border-b-[#0E4A72]">
        <div className="relative z-10 max-w-4xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0E4A72] text-white font-mono text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider">
              Federal Democratic Republic of Ethiopia
            </span>
            <span className="bg-white/90 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[9.5px] font-medium uppercase px-2.5 py-0.5 rounded border border-[#B9D5EB] dark:border-slate-700">
              Department of Geodesy &amp; Geodynamics
            </span>
            <span className="bg-sky-100 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[9.5px] font-medium uppercase px-2.5 py-0.5 rounded border border-sky-200 dark:border-slate-700">
              SSGI Directorate
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0E4A72] dark:text-white font-sans tracking-tight leading-tight">
            About Geodesy &amp; The Department of Geodesy and Geodynamics
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
            Geodesy is the foundational science of measuring Earth’s geometry, gravitational variations, and tectonic motions. The Department of Geodesy and Geodynamics operates Ethiopia’s continuous GNSS geodetic network, InSAR radar deformation analysis, and real-time seismic monitoring systems.
          </p>
          <div className="pt-1 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("mission")}
              className="px-3.5 py-1.5 bg-[#0E4A72] hover:bg-[#0A3856] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Department Mandate &amp; Mission</span>
            </button>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("dashboard")}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#0085C8]" />
              <span>Launch Monitoring Cockpit</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: WHAT IS GEODESY? */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0085C8]/10 text-[#0085C8] flex items-center justify-center font-bold shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#D48F29] uppercase tracking-widest block">
              FUNDAMENTAL EARTH SCIENCE
            </span>
            <h2 className="text-xl font-black text-[#0E4A72] font-display">
              What is Geodesy?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3.5 text-sm text-slate-700 leading-relaxed font-sans">
            <p>
              <strong className="text-[#0E4A72] font-semibold">Geodesy</strong> is the scientific discipline that deals with the precise measurement and representation of the Earth in three-dimensional, time-varying space. It encompasses the determination of the Earth&apos;s geometric shape, orientation in space, gravitational field, and temporal variations such as crustal deformation and tectonic plate motions.
            </p>
            <p>
              In the context of the Horn of Africa, Geodesy is vital because Ethiopia is situated at the center of the <strong>East African Rift System (EARS)</strong>—a dynamic continental break-up zone where the Nubian, Somalian, and Arabian tectonic plates diverge. Through millimeter-accurate Global Navigation Satellite System (GNSS) arrays and satellite radar interferometry (InSAR), Geodesy allows scientists to measure continental rifting velocities (2 to 6 mm per year) and detect subterranean magma inflation before catastrophic ruptures occur.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-[#0E4A72] block mb-1">Geometric Geodesy</span>
                <p className="text-[11px] text-slate-600">Establishes national reference frames, 3D coordinate systems, and tracks millimeter crustal displacements.</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-[#0E4A72] block mb-1">Physical &amp; Dynamic Geodesy</span>
                <p className="text-[11px] text-slate-600">Measures the Earth&apos;s gravity field (geoid), crustal stress buildup, and volcanic magma dynamics.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-[#0A2540] text-white p-5 rounded-2xl border border-slate-800 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#F7D08A] uppercase font-bold tracking-widest">
                GEODETIC IMPORTANCE
              </span>
              <h3 className="text-base font-bold text-white font-display">
                Why Geodesy Matters for Ethiopia
              </h3>
              <ul className="text-xs text-slate-300 space-y-2 pt-1 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Monitors tectonic spreading in Afar Triangle and Main Ethiopian Rift.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Provides precise datum for major national infrastructure &amp; dams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Detects volcanic swelling and fault slip preceding earthquakes.</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <span>National CORS Network</span>
              <span className="font-bold text-emerald-400">20+ Stations</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE DEPARTMENT OF GEODESY AND GEODYNAMICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D48F29]/15 text-[#D48F29] flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#D48F29] uppercase tracking-widest block">
                  INSTITUTIONAL DIVISION MANDATE
                </span>
                <h2 className="text-xl font-black text-[#0E4A72] font-display">
                  The Department of Geodesy and Geodynamics
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-sans">
              The <strong>Department of Geodesy and Geodynamics</strong> is the specialized scientific division under the Ethiopian Space Science and Geospatial Institute (SSGI) responsible for national geodetic infrastructure, crustal geodynamics research, and geohazard monitoring.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed font-sans">
              The Department operates the national Continuously Operating Reference Stations (CORS), processes satellite radar interferometry (InSAR) over active volcanic calderas such as Erta Ale, Fentale, and Dabbahu, and manages real-time seismic feeds in coordination with the FURI seismological observatory and international research consortia like COMET and USGS.
            </p>
          </div>

          {/* 4 Core Operational Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0E4A72]/10 text-[#0E4A72] flex items-center justify-center font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">1. GNSS / CORS Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maintains the Ethiopian Continuously Operating Reference Stations, delivering high-rate multi-constellation geodetic data for national mapping and crustal drift tracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">2. Seismology &amp; Waveforms</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Processes continuous 3-component seismic waveforms from Mount Furi (IU.FURI) and regional seismic nodes for instantaneous hypocenter and magnitude determination.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">3. InSAR &amp; Space Geodesy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applies Sentinel-1 and LiCSBAS radar interferometry to generate line-of-sight ground displacement maps across active rift volcanoes and tectonic faults.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">4. Early Warning &amp; Advisories</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates automated alert dispatches (SMS/Email) for severe seismic ruptures (M &ge; 5.0) and volcanic thermal anomalies to protect communities.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0E4A72] to-[#08283e] text-white p-6 rounded-3xl shadow-md space-y-4">
            <h3 className="text-base font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F7D08A]" />
              Department Leadership
            </h3>
            <div className="space-y-3 text-xs">
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <span className="font-bold text-white block text-sm">Department of Geodesy &amp; Geodynamics</span>
                <span className="text-[#F7D08A] font-mono text-[11px] block">Directorate of Geosciences</span>
                <p className="text-slate-300 text-[11px]">Ethiopian Space Science and Geospatial Institute (SSGI)</p>
              </div>
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <span className="font-bold text-white block text-sm">Geodynamics &amp; Seismology Division</span>
                <span className="text-[#F7D08A] font-mono text-[11px] block">Lead: Dr. Fekadu Abaye</span>
                <p className="text-slate-300 text-[11px]">Email: furi.seismo@essgi.gov.et</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/80 border-2 border-[#D48F29]/30 p-6 rounded-3xl space-y-3">
            <h3 className="text-sm font-black text-[#0E4A72] uppercase tracking-wider">
              Access Monitoring Cockpit
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Explore live GNSS crustal drift velocities, FURI seismograms, and interactive volcanic peak monitoring right in our digital cockpit.
            </p>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("dashboard")}
              className="w-full py-3 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#F7D08A]" />
              <span>Open Geohazard Cockpit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   2. FOCUS AREAS FULL PAGE VIEW
   ========================================== */
export function FocusAreasPage({ onNavigateToTab }: PageProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      <InstitutionalSubNav activeTab="focus" onNavigateToTab={onNavigateToTab} />

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#EBF3FA] dark:bg-slate-850 text-slate-900 dark:text-white p-5 sm:p-6 shadow-xs border border-[#B9D5EB] dark:border-slate-800 border-b-2 border-b-[#0E4A72]">
        <div className="relative z-10 max-w-4xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0E4A72] text-white font-mono text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider">
              Research &amp; Operations
            </span>
            <span className="bg-white/90 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[9.5px] font-medium uppercase px-2.5 py-0.5 rounded border border-[#B9D5EB] dark:border-slate-700">
              Technical Pillars
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0E4A72] dark:text-white font-sans tracking-tight leading-tight">
            Institutional Focus Areas &amp; Thrusts
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl font-sans">
            SSGI integrates space technology, satellite remote sensing, and ground geodetic arrays to safeguard national security, protect lives, and foster sustainable infrastructure development across Ethiopia.
          </p>
        </div>
      </div>

      {/* Focus Area Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-[#0085C8] transition-all space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-[#0085C8]/10 text-[#0085C8] font-mono text-xs font-black rounded-lg uppercase">
                Pillar 01
              </span>
              <Compass className="w-6 h-6 text-[#0085C8]" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Geodynamics &amp; Tectonics Monitoring
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Continuous broadband seismic telemetry monitoring along the Main Ethiopian Rift, hypocenter localization, and East African Rift extension rate calculations utilizing 18 permanent GNSS continuous station networks.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 font-bold">18 Broadband GNSS Receivers</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("analytics")}
              className="text-[#0085C8] font-bold text-xs uppercase flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Explore Geodesy Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-rose-600 transition-all space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-rose-50 text-rose-600 font-mono text-xs font-black rounded-lg uppercase">
                Pillar 02
              </span>
              <Zap className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Volcanology &amp; Hydrothermal Risk Mitigation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Orbital MODIS/VIIRS thermal radiance tracking over 115 Ethiopian volcanic vents, continuous gas emission sampling at Erta Ale boiling lava lake, and aviation volcanic ash advisory reports (VAAC).
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 font-bold">115 Monitored Volcanic Vents</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("analytics")}
              className="text-rose-600 font-bold text-xs uppercase flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Volcanic Vent Data</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-emerald-600 transition-all space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-mono text-xs font-black rounded-lg uppercase">
                Pillar 03
              </span>
              <Globe className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Space Science &amp; InSAR Radar Remote Sensing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Entoto Astronomical Observatory optical telescope operation, space weather ionospheric Total Electron Content (TEC) modeling, and European Space Agency Sentinel-1 Synthetic Aperture Radar interferometry processing.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 font-bold">Sentinel-1 InSAR Pipelines</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("gallery")}
              className="text-emerald-600 font-bold text-xs uppercase flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Space &amp; SAR Gallery</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-amber-600 transition-all space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 font-mono text-xs font-black rounded-lg uppercase">
                Pillar 04
              </span>
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Disaster Risk Management &amp; Early Warning SMS
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Deploying automated AI decision-support reports and broadcasting real-time bilingual SMS emergency alerts in Afar, Amharic, and Oromiffa to pastoralist communities during volcanic degassing or tremor swarms.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 font-bold">Bilingual Pastoralist Gateway</span>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("report")}
              className="text-amber-700 font-bold text-xs uppercase flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>AI Advisory Briefing</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   3. CONTACT US FULL PAGE VIEW
   ========================================== */
export function ContactUsPage({ onNavigateToTab }: PageProps): React.ReactElement {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Geological Inquiry / Telemetry Request",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      <InstitutionalSubNav activeTab="contact" onNavigateToTab={onNavigateToTab} />

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#EBF3FA] dark:bg-slate-850 text-slate-900 dark:text-white p-5 sm:p-6 shadow-xs border border-[#B9D5EB] dark:border-slate-800 border-b-2 border-b-[#0E4A72]">
        <div className="relative z-10 max-w-4xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0E4A72] text-white font-mono text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider">
              Institutional Communications
            </span>
            <span className="bg-white/90 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[9.5px] font-medium uppercase px-2.5 py-0.5 rounded border border-[#B9D5EB] dark:border-slate-700">
              Command Office
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0E4A72] dark:text-white font-sans tracking-tight leading-tight">
            Contact SSGI Headquarters &amp; Directorate
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl font-sans">
            Reach out to our Directorate General, Geodynamics Division, or satellite telemetry desk for research inquiries, data access requests, or emergency geohazard reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0085C8]/10 text-[#0085C8] flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Direct Phone Lines</span>
            <p className="text-base font-black text-[#0E4A72]">+251 11 878 7311</p>
            <p className="text-xs text-slate-500">+251 11 878 7312 (Fax Line)</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Official Email Dispatch</span>
            <p className="text-base font-black text-slate-900">info@essgi.gov.et</p>
            <p className="text-xs text-slate-500">contact@ssgi.gov.et</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Physical Address</span>
            <p className="text-base font-black text-slate-900">Arat Kilo (4 Kilo)</p>
            <p className="text-xs text-slate-500">Addis Ababa, FDRE Ethiopia</p>
          </div>

          {/* Social Channels Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#0085C8] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Official Social Channels</span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="https://twitter.com/ssgi2022"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
              >
                <Twitter className="w-4 h-4 text-[#0085C8]" />
                <span>@ssgi2022</span>
              </a>
              <a
                href="https://t.me/spacegeospatial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
              >
                <Send className="w-4 h-4 text-sky-500" />
                <span>Telegram</span>
              </a>
              <a
                href="https://www.linkedin.com/in/space-science-and-geospatial-institute-ssgi-37b48623a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://www.youtube.com/@ssgi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
              >
                <Youtube className="w-4 h-4 text-rose-600" />
                <span>@ssgi</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-[#0E4A72] font-display flex items-center gap-2">
              <Send className="w-5 h-5 text-[#D48F29]" />
              Submit Official Dispatch or Telemetry Inquiry
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Your inquiry will be logged directly into our directorate communications registry.
            </p>
          </div>

          {sent ? (
            <div className="p-8 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-2xl text-center space-y-3 animate-fade-in font-mono">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black uppercase">Dispatch Recorded</h3>
              <p className="text-xs text-emerald-800 font-sans max-w-md mx-auto">
                Thank you. Your message reference has been securely delivered to SSGI Directorate General Command.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Send Another Dispatch
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dr. Abebe Bekele"
                    className="w-full px-4 py-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72] focus:ring-2 focus:ring-[#0E4A72]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. abebe@aau.edu.et"
                    className="w-full px-4 py-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72] focus:ring-2 focus:ring-[#0E4A72]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72] focus:ring-2 focus:ring-[#0E4A72]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Detailed Dispatch Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Detail your request for GNSS RINEX data, volcanic thermal alerts, or research cooperation..."
                  className="w-full px-4 py-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72] focus:ring-2 focus:ring-[#0E4A72]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#F7D08A]" />
                <span>Submit Official Dispatch Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   4. MISSION & MANDATE FULL PAGE VIEW
   ========================================== */
export function MissionMandatePage({ onNavigateToTab }: PageProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      <InstitutionalSubNav activeTab="mission" onNavigateToTab={onNavigateToTab} />

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#EBF3FA] dark:bg-slate-850 text-slate-900 dark:text-white p-5 sm:p-6 shadow-xs border border-[#B9D5EB] dark:border-slate-800 border-b-2 border-b-[#0E4A72]">
        <div className="relative z-10 max-w-4xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0E4A72] text-white font-mono text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider">
              Statutory Authority
            </span>
            <span className="bg-white/90 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[9.5px] font-medium uppercase px-2.5 py-0.5 rounded border border-[#B9D5EB] dark:border-slate-700">
              Parliamentary Proclamation
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0E4A72] dark:text-white font-sans tracking-tight leading-tight">
            Official Mission, Vision &amp; Statutory Directives
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl font-sans">
            Decreed by the House of Peoples' Representatives, SSGI leads Ethiopia's space exploration, satellite infrastructure, and geodynamic hazard early warnings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#0E4A72]/10 text-[#0E4A72] flex items-center justify-center font-bold">
            <Target className="w-5 h-5 text-[#0E4A72]" />
          </div>
          <span className="text-xs font-mono font-bold text-[#D48F29] uppercase tracking-wider block">Our Core Mission</span>
          <h2 className="text-lg font-black text-slate-900 font-display">Empowering National Security &amp; Space Research</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To build national space capabilities, operate satellite constellations, provide high-precision geospatial services, and mitigate tectonic geohazards through scientific excellence and regional leadership.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#D48F29]/10 text-[#D48F29] flex items-center justify-center font-bold">
            <Globe className="w-5 h-5 text-[#D48F29]" />
          </div>
          <span className="text-xs font-mono font-bold text-[#D48F29] uppercase tracking-wider block">Vision 2030</span>
          <h2 className="text-lg font-black text-slate-900 font-display">Africa's Premier Space &amp; Geospatial Center</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To become Africa’s leading space science institute by 2030, driving innovation in Earth observation, astronomy, deep-space communication, and real-time hazard monitoring.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="text-xs font-mono font-bold text-[#D48F29] uppercase tracking-wider block">Core Values</span>
          <h2 className="text-lg font-black text-slate-900 font-display">Precision, Integrity &amp; Public Safety</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Uncompromising scientific rigor, sub-second telemetry accuracy, transparent data sharing, and unwavering commitment to safeguarding human lives and civil infrastructure.
          </p>
        </div>
      </div>

      {/* Directives List */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-[#0E4A72] font-display flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          Key Statutory Directives &amp; Operational Objectives
        </h2>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-[#0E4A72] text-white font-mono font-black flex items-center justify-center shrink-0">
              01
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Sub-Second Tectonic Risk Detection</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                Maintain continuous broadband seismic telemetry linked with USGS global feeds and local Furi Observatory arrays to detect micro-tremor swarms and ground rupture triggers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-[#0E4A72] text-white font-mono font-black flex items-center justify-center shrink-0">
              02
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Volcanic &amp; Magmatic Vent Protection</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                Catalog and continuously profile 115 volcanic vents across the Danakil Graben and Main Ethiopian Rift, enforcing aviation safety perimeters and degassing advisories.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-[#0E4A72] text-white font-mono font-black flex items-center justify-center shrink-0">
              03
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">National Space Science &amp; Satellite Operations</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                Operate Entoto Astronomical Observatory, process Sentinel InSAR ground deformation radar data, model space weather, and manage national satellite ground receiving stations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   5. SECTORS FULL PAGE VIEW
   ========================================== */
export function SectorsPage({ onNavigateToTab, onOpenSectorModal }: PageProps) {
  const [selectedSectorId, setSelectedSectorId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSectors = SECTORS_DATA.filter((sector) => {
    if (selectedSectorId !== "all" && sector.id !== selectedSectorId) {
      return false;
    }
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return (
      sector.title.toLowerCase().includes(q) ||
      sector.directorate.toLowerCase().includes(q) ||
      sector.description.toLowerCase().includes(q) ||
      sector.keyFunctions.some((f) => f.toLowerCase().includes(q)) ||
      sector.activeProjects.some((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  });

  const activeSectorObj = SECTORS_DATA.find((s) => s.id === selectedSectorId);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-16">
      <InstitutionalSubNav activeTab="sectors" onNavigateToTab={onNavigateToTab} />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-[#EBF3FA] dark:bg-slate-850 text-slate-900 dark:text-white p-5 sm:p-6 shadow-xs border border-[#B9D5EB] dark:border-slate-800 border-b-2 border-b-[#0E4A72]">
        <div className="relative z-10 max-w-4xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0E4A72] text-white font-mono text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider">
              Statutory Research Wings
            </span>
            <span className="bg-white/90 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[9.5px] font-medium uppercase px-2.5 py-0.5 rounded border border-[#B9D5EB] dark:border-slate-700">
              Department of Geodesy &amp; Geodynamics
            </span>
            <span className="bg-sky-100 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[9.5px] font-medium uppercase px-2.5 py-0.5 rounded border border-sky-200 dark:border-slate-700">
              4 Operational Directorates
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0E4A72] dark:text-white font-sans tracking-tight leading-tight">
            Key Institutional Sectors &amp; Research Directorates
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl font-sans">
            The Ethiopian Space Science and Geospatial Institute (SSGI) executes its statutory mandate through four specialized technical sectors and directorates. Explore their definitions, observational infrastructure, operational divisions, and live telemetry networks.
          </p>

          <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("dashboard")}
              className="px-4 py-2 bg-[#D48F29] hover:bg-[#b8781d] text-slate-900 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Launch Live Telemetry Cockpit</span>
            </button>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab("mission")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F7D08A]" />
              <span>View Statutory Mission Mandate</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTOR SELECTOR TABS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 select-none">
          <button
            onClick={() => setSelectedSectorId("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedSectorId === "all"
                ? "bg-[#0E4A72] text-[#F7D08A] shadow-md border border-[#0E4A72]"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Sectors ({SECTORS_DATA.length})</span>
          </button>

          {SECTORS_DATA.map((sector) => {
            const isSelected = selectedSectorId === sector.id;
            let Icon = Activity;
            if (sector.id === "volcanology") Icon = Flame;
            if (sector.id === "space-science") Icon = Compass;
            if (sector.id === "disaster-risk") Icon = Shield;

            return (
              <button
                key={sector.id}
                onClick={() => setSelectedSectorId(sector.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0E4A72] text-[#F7D08A] shadow-md border border-[#0E4A72]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#F7D08A]" : "text-slate-500"}`} />
                <span>{sector.title.split("&")[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sectors, sensors, divisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0E4A72] focus:ring-2 focus:ring-[#0E4A72]/20 font-sans"
          />
        </div>
      </div>

      {/* SECTOR DETAILED CARDS & BREAKDOWNS */}
      <div className="space-y-8">
        {filteredSectors.map((sector, index) => {
          const isSeismic = sector.id === "seismology";
          const isVolcano = sector.id === "volcanology";
          const isSpace = sector.id === "space-science";
          const isDRM = sector.id === "disaster-risk";

          let accentColor = "text-[#0E4A72]";
          let badgeBg = "bg-[#0E4A72]/10 text-[#0E4A72] border-[#0E4A72]/20";
          let iconBg = "bg-[#0E4A72]/10 text-[#0E4A72]";
          let SectorIcon = Activity;

          if (isVolcano) {
            accentColor = "text-rose-700";
            badgeBg = "bg-rose-50 text-rose-800 border-rose-200";
            iconBg = "bg-rose-100 text-rose-700";
            SectorIcon = Flame;
          } else if (isSpace) {
            accentColor = "text-cyan-800";
            badgeBg = "bg-cyan-50 text-cyan-800 border-cyan-200";
            iconBg = "bg-cyan-100 text-cyan-700";
            SectorIcon = Compass;
          } else if (isDRM) {
            accentColor = "text-amber-800";
            badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
            iconBg = "bg-amber-100 text-amber-700";
            SectorIcon = Shield;
          }

          return (
            <div
              key={sector.id}
              id={`sector-card-${sector.id}`}
              className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 transition-all hover:border-[#0E4A72]/40"
            >
              {/* 1. SECTOR HEADER SECTION */}
              <div className="p-6 sm:p-8 space-y-4 bg-gradient-to-b from-slate-50/70 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs ${iconBg}`}>
                      <SectorIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                          SECTOR {index + 1} &bull; {sector.code}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase border ${badgeBg}`}>
                          {sector.status}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                        {sector.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => onNavigateToTab && onNavigateToTab(sector.targetTab)}
                      className="px-4 py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-[#F7D08A] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Live Cockpit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Directorate & Leadership Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Directorate</span>
                    <span className="font-bold text-[#0E4A72]">{sector.directorate}</span>
                  </div>
                  <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Sector Leadership</span>
                    <span className="font-bold text-slate-800">{sector.head}</span>
                  </div>
                  <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Primary Observatory Base</span>
                    <span className="font-bold text-slate-800">{sector.location}</span>
                  </div>
                </div>

                {/* Detailed Overview & Scope */}
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-slate-700 leading-relaxed font-sans">
                    {sector.description}
                  </p>

                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 space-y-1.5">
                    <span className="text-[11px] font-mono font-black text-[#0E4A72] uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#D48F29]" />
                      Statutory Scope &amp; Mission Mandate
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">
                      {sector.scopeAndMandate}
                    </p>
                  </div>
                </div>

                {/* 4 Key Real-time Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {sector.metrics.map((m, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block truncate">
                        {m.label}
                      </span>
                      <div className="text-base font-black text-[#0E4A72] font-mono mt-0.5">
                        {m.value}
                      </div>
                      {m.trend && (
                        <span className="text-[10px] font-sans text-emerald-700 font-semibold mt-0.5 block">
                          &bull; {m.trend}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. OPERATIONAL DIVISIONS & KEY FUNCTIONS */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white">
                {/* Left: Core Functions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#0E4A72] font-display uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Statutory Functions &amp; Telemetry Duties
                  </h3>
                  <div className="space-y-2">
                    {sector.keyFunctions.map((fn, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-700 font-sans">
                        <span className="w-4 h-4 rounded-full bg-[#0E4A72]/10 text-[#0E4A72] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {fIdx + 1}
                        </span>
                        <span className="leading-relaxed">{fn}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Operational Divisions & Tech Stack */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#0E4A72] font-display uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#0085C8]" />
                    Operational Scientific Divisions
                  </h3>
                  <div className="space-y-3">
                    {sector.operationalDivisions.map((div, dIdx) => (
                      <div key={dIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 font-sans">
                            {div.name}
                          </h4>
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase">Division 0{dIdx + 1}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          {div.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {div.technologies.map((tech, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200 font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. ACTIVE RESEARCH PROJECTS & OBSERVATORY ASSETS */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50">
                {/* Active Strategic Projects */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#0E4A72] font-display uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D48F29]" />
                    Active National &amp; International Projects
                  </h3>
                  <div className="space-y-3">
                    {sector.activeProjects.map((proj, pIdx) => (
                      <div key={pIdx} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 font-sans">
                            {proj.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 uppercase">
                            {proj.status}
                          </span>
                        </div>
                        <div className="text-[10.5px] font-mono text-[#0085C8] font-semibold">
                          Lead: {proj.leadAgency}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hardware & Infrastructure Assets */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-[#0E4A72] font-display uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-600" />
                    Key Infrastructure &amp; Observational Assets
                  </h3>
                  <div className="space-y-3">
                    {sector.infrastructureAssets.map((asset, aIdx) => (
                      <div key={aIdx} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 font-sans">
                            {asset.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {asset.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          {asset.specification}
                        </p>
                        {asset.coordinates && (
                          <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                            GPS Coordinates: {asset.coordinates}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Stakeholders list */}
                    <div className="pt-2">
                      <span className="text-[10.5px] font-mono font-bold text-slate-500 uppercase block mb-1.5">
                        Key Strategic Stakeholders &amp; Inter-Agency Partners:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sector.stakeholders.map((sh, sIdx) => (
                          <span key={sIdx} className="text-[10.5px] bg-slate-200/70 text-slate-800 px-2.5 py-1 rounded-lg font-sans font-medium">
                            {sh}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. FOOTER ACTION BAR */}
              <div className="p-4 sm:p-5 bg-slate-100/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Continuous 24/7 Sub-Second Telemetry Synchronization</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onOpenSectorModal && onOpenSectorModal(sector)}
                    className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer text-xs"
                  >
                    Quick Brief Card
                  </button>
                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab(sector.targetTab)}
                    className="px-5 py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-[#F7D08A] font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 text-xs"
                  >
                    <span>Launch {sector.title.split("&")[0].trim()} Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================
   6. ANNOUNCEMENTS FULL PAGE VIEW
   ========================================== */
export function AnnouncementsPage({
  onNavigateToTab,
  selectedAnnouncement: propSelectedAnnouncement,
  onSelectAnnouncement,
}: PageProps) {
  const [localSelected, setLocalSelected] = useState<any>(propSelectedAnnouncement || null);

  const activeAnnouncement = propSelectedAnnouncement !== undefined ? propSelectedAnnouncement : localSelected;

  const handleSelect = (item: any) => {
    setLocalSelected(item);
    if (onSelectAnnouncement) {
      onSelectAnnouncement(item);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      <InstitutionalSubNav activeTab="announcements" onNavigateToTab={onNavigateToTab} />

      {/* Announcements Header - Distinct Amber / Bulletin Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-slate-900 dark:text-white p-6 sm:p-7 shadow-xs border-2 border-amber-200 dark:border-amber-900/60 border-l-6 border-l-[#D48F29]">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#D48F29] text-slate-950 font-mono text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 shadow-xs">
              <Bell className="w-3.5 h-3.5 text-slate-950" />
              OFFICIAL ANNOUNCEMENTS &amp; PUBLIC NOTICES
            </span>
            <span className="bg-white/90 dark:bg-slate-800 text-[#0E4A72] dark:text-sky-300 font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border border-amber-200 dark:border-slate-700">
              {ANNOUNCEMENTS_DATA.length} Active Circulars &amp; Calls
            </span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-800">
              Department of Geodesy &amp; Geodynamics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0E4A72] dark:text-amber-400 font-display tracking-tight leading-tight">
            Official Announcements, Research Grants &amp; Public Gazettes
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl font-sans">
            Official scientific circulars, S-ARC 2026 academic symposium calls, Presidential Research Grants, GNSS geodetic reference frame releases, and technical procurement bulletins published by the Ethiopian Space Science and Geospatial Institute.
          </p>
        </div>
      </div>

      {/* IN-PAGE ANNOUNCEMENTS SELECTOR BAR */}
      <div className="bg-amber-50/90 border-2 border-[#D48F29]/40 p-4 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#0E4A72] uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#D48F29]" />
            Quick Select Listed Announcement / Call
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {ANNOUNCEMENTS_DATA.length} Releases Active
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          <button
            onClick={() => handleSelect(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              !activeAnnouncement
                ? "bg-[#0E4A72] text-white shadow-md border border-[#0E4A72]"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Announcements Grid
          </button>
          {ANNOUNCEMENTS_DATA.map((item) => {
            const isSelected = activeAnnouncement?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? "bg-[#D48F29] text-slate-950 font-black shadow-md border border-[#D48F29]"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-slate-950" : "bg-amber-500"}`}></span>
                <span>{item.category}: {item.title.split(":")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED READER PANEL (If active item selected) */}
      {activeAnnouncement && (
        <div id="announcement-detail-reader" className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#D48F29] shadow-lg space-y-6 animate-fade-in relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-mono text-xs font-black rounded-lg uppercase border border-amber-300">
                {activeAnnouncement.category}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-mono text-xs font-extrabold rounded-lg uppercase border border-emerald-300">
                Status: {activeAnnouncement.status}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Code: {activeAnnouncement.code}
              </span>
            </div>
            <button
              onClick={() => handleSelect(null)}
              className="text-xs font-mono font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
            >
              &times; Close Reader &amp; View All
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display leading-snug">
              {activeAnnouncement.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs text-slate-600 pt-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Published</span>
                <span className="font-bold text-slate-800">{activeAnnouncement.date}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-rose-500 uppercase font-bold block">Deadline</span>
                <span className="font-bold text-rose-700">{activeAnnouncement.deadline}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Organizer</span>
                <span className="font-bold text-slate-800 truncate block">{activeAnnouncement.organizer}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                <span className="font-bold text-slate-800 truncate block">{activeAnnouncement.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-xs font-mono font-black text-[#0E4A72] uppercase tracking-wider mb-2">
                Executive Overview
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                {activeAnnouncement.summary}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-mono font-black text-[#0E4A72] uppercase tracking-wider mb-2">
                Official Release Details & Scope
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                {activeAnnouncement.fullDetails}
              </p>
            </div>

            {activeAnnouncement.requirements && activeAnnouncement.requirements.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-mono font-black text-slate-900 uppercase tracking-wider">
                  Submission Terms &amp; Participation Guidelines
                </h3>
                <ul className="space-y-2">
                  {activeAnnouncement.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 font-bold">Contact Email:</span>
              <a
                href={`mailto:${activeAnnouncement.contactEmail}`}
                className="text-xs font-mono font-bold text-[#0085C8] hover:underline"
              >
                {activeAnnouncement.contactEmail}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${activeAnnouncement.contactEmail}?subject=Inquiry: ${encodeURIComponent(activeAnnouncement.title)}`}
                className="px-5 py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#F7D08A]" />
                <span>Submit Direct Official Inquiry</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ALL ANNOUNCEMENTS GRID */}
      <div>
        <h2 className="text-lg font-black text-[#0E4A72] font-display mb-4">
          All Published Bulletins &amp; Calls ({ANNOUNCEMENTS_DATA.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ANNOUNCEMENTS_DATA.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-6 rounded-3xl border-2 transition-all space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md ${
                activeAnnouncement?.id === item.id ? "border-[#D48F29] ring-2 ring-[#D48F29]/20" : "border-slate-200 hover:border-[#D48F29]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 font-mono text-[10px] font-black rounded-lg uppercase border border-amber-200">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">{item.date}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 font-display leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-bold">Official Release</span>
                <button
                  onClick={() => {
                    handleSelect(item);
                    const el = document.getElementById("announcement-detail-reader");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-[#D48F29] hover:bg-[#b8781d] text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Read Full Announcement</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

