import { motion } from "motion/react";
import {
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import SectionContainer from "../common/SectionContainer";
import volcanoHeroSummit from "../../assets/images/Volcano_hero_summit.jpg";

interface HeroProps {
  onLaunchDashboard?: () => void;
  onNavigateToTab?: (tab: any) => void;
  onOpenLogin?: () => void;
}

export default function Hero({ onLaunchDashboard, onNavigateToTab, onOpenLogin }: HeroProps) {
  return (
    <section className="relative w-full bg-[#FAFAFA] dark:bg-[#030d17] text-slate-900 dark:text-slate-100 pt-0 pb-6 overflow-hidden font-sans">
      {/* Flag Bar Accent Line - Full Width */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600" />

      {/* HERO BANNER: FULL-WIDTH CINEMATIC VOLCANO PICTURE WITH OVERLAID TITLE & LEARN MORE LINK */}
      <div className="relative w-full min-h-[540px] sm:min-h-[620px] lg:min-h-[680px] flex flex-col justify-between bg-slate-950 shadow-2xl overflow-hidden border-b border-slate-200/80 dark:border-white/10">
        
        {/* Panoramic Volcanic Mountain Landscape Picture Background (Full Screen Width) */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <img
            src={volcanoHeroSummit}
            alt="Ethiopian Rift Volcano Landscape"
            className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          {/* Cinematic Gradient Overlays for Optimal Text Readability & Natural Photo Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#092B4C]/85 via-[#092B4C]/45 to-transparent" />
        </div>

        {/* INNER RESPONSIVE CONTENT WRAPPER */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-14 flex flex-col justify-between flex-1">
          
          {/* TOP OVERLAY: INSTITUTIONAL BADGE & LIVE STATUS */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/25 text-cyan-300 text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>ETHIOPIAN SPACE SCIENCE &amp; GEOSPATIAL INSTITUTE (ESSGI)</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/15 text-xs font-mono font-bold text-slate-200 backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400">GSN / USGS TELEMETRY ACTIVE</span>
            </div>
          </div>

          {/* BOTTOM OVERLAY: HEADLINE, SUBTITLE & LEARN MORE LINK */}
          <div className="max-w-4xl space-y-4 pt-16">
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl sm:text-4xl md:text-3xl lg:text-5xl font-black tracking-tight leading-[1.06] text-white font-display uppercase drop-shadow-md"
              >
                National VOLCANO &amp; EARTHQUAKE PORTAL.
              </motion.h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-mono font-bold text-cyan-200 tracking-wider uppercase drop-shadow-sm">
                REAL-TIME MONITORING, DATA, AND ALERTS.
              </p>
            </div>

            {/* Amharic Translation Subtitle */}
            <div className="inline-block bg-black/40 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-md max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug font-sans">
                የኢትዮጵያ እሳተ-ገሞራ፣ የመሬት መንቀጥቀጥ እና የጂኦሎጂካል አደጋዎች ብሔራዊ መከታተያ ማዕከል
              </p>
            </div>

            {/* Mission-Critical Action Buttons for Government & Public Users */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onLaunchDashboard}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0085C8] hover:bg-[#0070ab] text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer border border-cyan-400"
              >
                <span>Launch Operations Cockpit</span>
                <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToTab?.("map")}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white border border-slate-700 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Tactical GIS Map</span>
              </button>

              <a
                href="#who-we-are"
                className="group inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 hover:text-[#F7D08A] border border-white/10 font-mono font-bold text-xs tracking-wider uppercase backdrop-blur-md transition-all cursor-pointer"
              >
                <span>Institutional Mandate</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
