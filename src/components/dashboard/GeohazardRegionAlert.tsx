import React from "react";
import { ETHIOPIA_ACTIVE_ZONES, ActiveGeologicalZone } from "../../data/index";
import { AlertTriangle, MapPin, Activity, Flame, ShieldAlert, Navigation } from "lucide-react";
import { motion } from "motion/react";

interface GeohazardRegionAlertProps {
  selectedId: string | null;
  onSelectZone: (zoneId: string) => void;
  className?: string;
}

export const GeohazardRegionAlert: React.FC<GeohazardRegionAlertProps> = ({
  selectedId,
  onSelectZone,
  className = "",
}) => {
  // Sort regions by riskScore descending to highlight the most critical threats first
  const sortedZones = [...ETHIOPIA_ACTIVE_ZONES].sort((a, b) => b.riskScore - a.riskScore);

  const getRiskBadgeStyles = (score: number) => {
    if (score >= 9) {
      return "bg-rose-500/10 text-rose-500 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400";
    } else if (score >= 7) {
      return "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400";
    }
    return "bg-sky-500/10 text-sky-500 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-400";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 9) return "CRITICAL DISRUPTION ZONE";
    if (score >= 7) return "HIGH ACTIVITY CORRIDOR";
    return "MONITORED FAULT VECTOR";
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900/40 dark:bg-slate-950/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xl ${className}`}>
      {/* Component Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xs tracking-wider text-slate-800 dark:text-slate-100 uppercase">
              Geohazard Region Alerts
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mt-0.5">
              ESSGI Seismic & Magmatic Division
            </p>
          </div>
        </div>
        <ShieldAlert className="w-5 h-5 text-[#D48F29] dark:text-amber-400" />
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-normal">
        Real-time continental rifting hazard assessments for active tectonic margins. Select any hotspot below to focus the GIS radar tracking system on the specific fault envelope.
      </p>

      {/* Grid of Alert Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar max-h-[460px] lg:max-h-none">
        {sortedZones.map((zone) => {
          const isSelected = selectedId === zone.id;
          return (
            <motion.div
              key={zone.id}
              whileHover={{ scale: 1.01, translateY: -1 }}
              onClick={() => onSelectZone(zone.id)}
              className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                isSelected
                  ? "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/60 dark:border-rose-400/50 shadow-lg shadow-rose-500/5"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#D48F29]/50 dark:hover:border-amber-400/50"
              }`}
            >
              {/* Subtle background glow for selected card */}
              {isSelected && (
                <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full pointer-events-none" />
              )}

              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider border uppercase ${getRiskBadgeStyles(zone.riskScore)}`}>
                    {getRiskLabel(zone.riskScore)} &middot; Risk {zone.riskScore}/10
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                    {zone.name}
                  </h4>
                </div>
                
                {/* Visual Radar Pulse indicator for selected card */}
                {isSelected ? (
                  <span className="flex h-2 w-2 relative shrink-0 mt-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0 mt-1" />
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans line-clamp-2">
                {zone.description}
              </p>

              {/* Threat Matrix Stats */}
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <div className="flex flex-col leading-none">
                    <span className="text-[7.5px] font-mono uppercase text-slate-400">Volcanic Threat</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{zone.volcanicVulnerability}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div className="flex flex-col leading-none">
                    <span className="text-[7.5px] font-mono uppercase text-slate-400">Seismic Threat</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{zone.seismicVulnerability}</span>
                  </div>
                </div>
              </div>

              {/* Footer / Interaction Row */}
              <div className="flex items-center justify-between text-[9.5px] text-slate-400 dark:text-slate-500 mt-1.5 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1 font-mono font-bold">
                  <MapPin className="w-3 h-3 text-[#D48F29]" />
                  <span>{zone.coordinates[0].toFixed(2)}°N, {zone.coordinates[1].toFixed(2)}°E</span>
                </div>
                
                <span className={`flex items-center gap-1 font-extrabold text-[9px] uppercase tracking-wider transition-colors duration-200 ${
                  isSelected ? "text-rose-500" : "text-[#0E4A72] dark:text-sky-400 group-hover:text-[#D48F29]"
                }`}>
                  <Navigation className={`w-3.5 h-3.5 ${isSelected ? "animate-bounce" : ""}`} />
                  {isSelected ? "Radar Tracking Active" : "Track Region"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
