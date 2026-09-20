import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Activity,
  Flame,
  Radio,
  ShieldCheck,
  Globe,
  Compass,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Maximize2,
  X,
  Zap,
  Layers,
  Sparkles
} from "lucide-react";

import controlRoomOps from "../../assets/images/control_room_ops.jpg";
import seismographDrum from "../../assets/images/seismograph_drum.jpg";
import volcanoFieldTeam from "../../assets/images/Volcanic_field_team.jpg";
import gnssFieldStation from "../../assets/images/gnss_field.jpg";

interface ServiceItem {
  id: string;
  badge: string;
  title: string;
  amharicTitle: string;
  subtitle: string;
  image: string;
  description: string;
  capabilities: string[];
}

export function Mission() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const services: ServiceItem[] = [
    {
      id: "service-seismic",
      badge: "SERVICES ONE",
      title: "Seismic Tremor & Waveform Logging",
      amharicTitle: "የመሬት መንቀጥቀጥ ሞገድ ምዝገባ",
      subtitle: "High-frequency broadband seismometer array logging",
      image: seismographDrum,
      description: "Continuous 24/7 digital and analog waveform acquisition across FURI (Addis Ababa), Semera, Desse, and Dire Dawa broadband stations. Provides automated P-wave and S-wave arrival time picking, hypocenter triangulation, and Richter magnitude calculations within 90 seconds of tectonic rupture.",
      capabilities: [
        "Automated hypocenter depth and epicenter locating (< 1.5 km error)",
        "Real-time Richter and Moment Magnitude (Mw) computation",
        "Direct synchronization with USGS, EMSC, and Addis Ababa University Geophysical Observatory"
      ]
    },
    {
      id: "service-volcano",
      badge: "SERVICES TWO",
      title: "Volcanic Gas & Caldera Expeditions",
      amharicTitle: "የእሳተ ጎመራ ጋዝ እና ጉድጓድ ቅኝት",
      subtitle: "Thermal drone imaging and SO2 plume spectrometry",
      image: volcanoFieldTeam,
      description: "Direct on-site volcanology research at high-risk Afar depression volcanic complexes (Erta Ale, Dallol, Dabbahu, Fentale). Combines autonomous thermal drone photogrammetry, miniature differential optical absorption spectrometers (DOAS) for SO2 flux, and volcanic gas temperature logging.",
      capabilities: [
        "Autonomous high-temperature thermal drone mapping of active lava lakes",
        "Real-time multi-gas (SO2, CO2, H2S) emission rate quantification",
        "Caldera structural stability modeling and magma chamber inflation tracking"
      ]
    },
    {
      id: "service-gnss",
      badge: "SERVICES THREE",
      title: "Space Geodesy & Solar GNSS Stations",
      amharicTitle: "የጠፈር ጂኦዴሲ እና ጂ.ኤን.ኤስ.ኤስ ጣቢያዎች",
      subtitle: "Millimeter-scale tectonic plate divergence tracking",
      image: gnssFieldStation,
      description: "High-precision continuous Global Navigation Satellite System (cGNSS) array powered by solar telemetry masts installed across the Great East African Rift corridor. Measures sub-millimeter annual continental spreading (+2.4 cm/year) between the Nubian and Somali tectonic plates.",
      capabilities: [
        "Sub-millimeter 3D crustal displacement vector computation",
        "Integration with Sentinel-1 Synthetic Aperture Radar (InSAR) LiCSBAS interferograms",
        "Long-term lithospheric strain rate tensors and seismic hazard forecasting"
      ]
    }
  ];

  return (
    <div className="space-y-16 font-sans py-6">
      
      {/* ========================================================================= */}
      {/* SECTION 1: "WHO WE ARE" (MATCHING REFERENCE SCREENSHOT) */}
      {/* ========================================================================= */}
      <section id="who-we-are" className="relative scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: EDITORIAL NARRATIVE & INSTITUTIONAL MANDATE (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Clean tracked section header matching reference */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-[#0E4A72] dark:text-cyan-400 block">
                WHO WE ARE
              </span>
              <div className="w-12 h-1 bg-[#0E4A72] dark:bg-cyan-400 rounded-full" />
            </div>

            {/* Primary Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0B2545] dark:text-white tracking-tight leading-snug font-display">
              National Real-Time Geohazard &amp; Continental Rifting Observatory
            </h2>

            {/* Scientific Editorial Paragraphs */}
            <div className="space-y-3.5 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <p>
                The <strong>Real-time Geospatial Volcanic &amp; Earthquake Monitoring System (R-GEVAMS)</strong> is a collaborative national initiative established under the <strong>Ethiopian Space Science and Geospatial Institute (ESSGI)</strong> in joint operational alignment with the <strong>Disaster Risk Management Commission (DRMC)</strong>.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                Our mission is to deploy space geodesy, broadband seismology, and satellite radar interferometry (InSAR) across the Main Ethiopian Rift and Afar Depression—one of the only places on Earth where a tectonic plate is actively pulling apart to form a new ocean basin.
              </p>
            </div>

            {/* 3 Key Pillar Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="bg-[#FAF9F5] dark:bg-[#061524] p-3 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                <div className="text-[10px] font-bold text-[#0E4A72] dark:text-cyan-300 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D48F29]" />
                  24/7 EARLY WARNING
                </div>
                <div className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">
                  Automated Threat Alerts
                </div>
              </div>

              <div className="bg-[#FAF9F5] dark:bg-[#061524] p-3 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                <div className="text-[10px] font-bold text-[#0E4A72] dark:text-cyan-300 uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                  SPACE GEODESY
                </div>
                <div className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">
                  Sentinel-1 &amp; GNSS Array
                </div>
              </div>

              <div className="bg-[#FAF9F5] dark:bg-[#061524] p-3 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
                <div className="text-[10px] font-bold text-[#0E4A72] dark:text-cyan-300 uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  SEISMIC FEEDS
                </div>
                <div className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">
                  USGS &amp; FURI Waveforms
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: OPERATIONS CONTROL CENTER PHOTO CARD WITH VIDEO PLAY BADGE (5 COLS) */}
          <div className="lg:col-span-5 relative">
            
            {/* Soft decorative background circles matching reference screenshot */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-sky-200/50 dark:bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-300/40 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* The Control Room Card */}
            <div className="relative z-10 bg-slate-900 rounded-3xl overflow-hidden border-2 border-[#0E4A72]/30 shadow-2xl group cursor-pointer"
                 onClick={() => setIsVideoModalOpen(true)}>
              
              {/* Photo */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src={controlRoomOps}
                  alt="ESSGI Geospatial Operations Center and Seismic Control Room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Central Video Play Trigger */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#0E4A72]/90 border-2 border-white/80 text-white flex items-center justify-center shadow-2xl group-hover:scale-115 transition-transform backdrop-blur-md">
                    <Play className="w-7 h-7 text-[#F7D08A] ml-1 fill-[#F7D08A]" />
                  </div>
                </div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-cyan-300 font-bold">
                  ● LIVE OPERATIONS CENTER
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-4 bg-slate-950 text-white space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#F7D08A] font-bold">ADDIS ABABA HEADQUARTERS</span>
                  <span className="text-emerald-400 font-bold">24/7 ACTIVE WATCH</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Click to explore the multi-screen national geodynamic surveillance stream.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: "WHAT WE DO" (3 SERVICE PHOTOGRAPHY CARDS MATCHING REFERENCE) */}
      {/* ========================================================================= */}
      <section id="what-we-do" className="relative pt-6 border-t border-slate-200/80 dark:border-white/10">
        
        {/* Section Title & Description */}
        <div className="space-y-3 max-w-3xl mb-8">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-black uppercase tracking-widest text-[#0E4A72] dark:text-cyan-400 block">
              WHAT WE DO
            </span>
            <div className="w-12 h-1 bg-[#0E4A72] dark:bg-cyan-400 rounded-full" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#0B2545] dark:text-white tracking-tight font-display">
            Core Geospatial &amp; Field Telemetry Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            Our multidisciplinary teams of geophysicists, remote sensing scientists, and disaster mitigation engineers conduct continuous real-time terrestrial and space-geodetic surveillance across three core scientific pillars:
          </p>
        </div>

        {/* 3 PHOTOGRAPHY CARDS MATCHING THE REFERENCE SCREENSHOT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((srv) => (
            <motion.div
              key={srv.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedService(srv)}
              className="bg-white dark:bg-[#07192B] rounded-3xl border-2 border-slate-200/80 dark:border-white/10 shadow-md hover:shadow-xl hover:border-[#0E4A72] dark:hover:border-cyan-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Service Badge (e.g. SERVICES ONE) matching reference */}
                  <div className="absolute bottom-3 left-3 bg-[#0E4A72] text-[#F7D08A] px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border border-[#D48F29]/50 shadow-md">
                    {srv.badge}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2.5">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#0E4A72] dark:text-white font-display group-hover:text-[#D48F29] dark:group-hover:text-cyan-300 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                      {srv.amharicTitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans line-clamp-3">
                    {srv.description}
                  </p>
                </div>
              </div>

              {/* Card Action Link */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between font-mono text-xs font-black text-[#0E4A72] dark:text-cyan-400 group-hover:text-[#D48F29]">
                <span className="uppercase tracking-wider">VIEW SCIENTIFIC SPECS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SERVICE DETAIL MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedService && (
          <div
            onClick={() => setSelectedService(null)}
            className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white dark:bg-[#07192B] rounded-3xl overflow-hidden border-2 border-[#0E4A72]/30 shadow-2xl text-slate-900 dark:text-white cursor-default space-y-0"
            >
              {/* Header Image */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-5 right-5 text-white space-y-0.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#D48F29] text-[#092B4C] text-[10px] font-mono font-black uppercase">
                    {selectedService.badge}
                  </span>
                  <h3 className="text-xl font-black">{selectedService.title}</h3>
                  <p className="text-xs text-slate-300 font-mono">{selectedService.amharicTitle}</p>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {selectedService.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#0E4A72] dark:text-cyan-400 block">
                    Core Technical Specifications &amp; Methodology:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {selectedService.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="bg-[#0E4A72] hover:bg-[#093554] text-[#F7D08A] font-mono font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer transition-all"
                  >
                    Close Specifications
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* OPERATIONS CENTER BRIEFING MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div
            onClick={() => setIsVideoModalOpen(false)}
            className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl text-white cursor-default"
            >
              <div className="relative h-72 w-full overflow-hidden">
                <img
                  src={controlRoomOps}
                  alt="ESSGI Geospatial Operations Center"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-3 bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40">
                    ESSGI 24/7 GEODYNAMICS DIRECTIVE
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">STATUS: OPERATIONAL</span>
                </div>

                <h3 className="text-xl font-black text-white font-display">
                  National Tectonic &amp; Volcanological Operations Center
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  The central monitoring hall in Addis Ababa operates continuous surveillance over the Afar Depression, Central Ethiopian Rift, and southern border segments. Data streams combine real-time broadband seismographs, satellite SAR interferograms, and continuous GNSS displacements.
                </p>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setIsVideoModalOpen(false)}
                    className="bg-[#0085C8] hover:bg-[#0073AD] text-white font-mono font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer transition-all"
                  >
                    Return to Portal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

