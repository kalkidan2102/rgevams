import { useState } from "react";
import { GeologicalAlert } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, 
  Activity, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  CheckCheck,
  Radio,
  Lock
} from "lucide-react";

interface AdvisoryCardProps {
  alert: GeologicalAlert;
  onInspectMap: (id: string, type: "volcano" | "earthquake") => void;
  onDismiss?: (alert: GeologicalAlert) => void;
  currentUserRole?: string;
}

export default function AdvisoryCard({ alert, onInspectMap, onDismiss, currentUserRole }: AdvisoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isGuest = currentUserRole === "guest";

  const isVolcanic = alert.type === "volcanic";
  const isRed = alert.severity === "Red";
  const isOrange = alert.severity === "Orange";

  // Accent styling based on severity
  let severityBorder = "border-l-4 border-l-[#0085C8] border-slate-200/60 dark:border-white/10";
  let severityBadge = "bg-[#0085C8]/15 text-[#0085C8] border border-[#0085C8]/30";
  let iconBg = "bg-[#0085C8]/15 text-[#0085C8] ring-1 ring-[#0085C8]/30";
  
  if (isRed) {
    severityBorder = "border-l-4 border-l-rose-500 border-rose-500/30";
    severityBadge = "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]";
    iconBg = "bg-rose-500/20 text-rose-500 ring-1 ring-rose-500/40";
  } else if (isOrange) {
    severityBorder = "border-l-4 border-l-amber-500 border-amber-500/30";
    severityBadge = "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]";
    iconBg = "bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/40";
  }

  // Mandated disaster protocols
  const protocols = isVolcanic
    ? isRed
      ? [
          "Enforce 10km immediate exclusion perimeter around crater rim",
          "Issue civil aviation ash dispersal warning for Red Sea corridor",
          "Evacuate rift valley settlements prone to pyroclastic flow"
        ]
      : [
          "Restrict crater rim observation access to authorized volcanologists",
          "Monitor sulfur dioxide gas outgassing emissions twice daily",
          "Ready local disaster management units in Semera & Afar region"
        ]
    : isRed
    ? [
        "Initiate structural integrity assessments for critical infrastructure",
        "Enforce highway speed caps on vulnerable bridges across Awash river",
        "Deploy rescue personnel & satellite ground units to epicentral zone"
      ]
    : [
        "Verify public water reservoir pressure feeds & pipeline valves",
        "Broadcast public tremor awareness guidelines over regional radio",
        "Audit local seismic broadband array & FURI telemetry feeds"
      ];

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id={`advisory-card-${alert.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white/70 dark:bg-[#041B2D]/70 backdrop-blur-xl ${severityBorder} rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer select-none h-full transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 group relative`}
    >
      <div className="p-4.5 space-y-3.5 flex-grow">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl ${iconBg} shrink-0`}>
              {isVolcanic ? (
                <Flame className="w-4 h-4 animate-pulse" />
              ) : (
                <Activity className="w-4 h-4 animate-pulse" />
              )}
            </span>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase font-extrabold text-slate-500 dark:text-slate-400 block">
                {isVolcanic ? "VOLCANIC ALERT" : "SEISMIC ADVISORY"}
              </span>
              <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                Live Network Feed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className={`text-[9.5px] font-mono font-black uppercase px-2.5 py-1 rounded-full ${severityBadge}`}>
              {alert.severity} SEVERITY
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-[#0085C8] dark:group-hover:text-[#00D4FF] transition-colors">
            {alert.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
            {alert.description}
          </p>
        </div>

        {/* Expandable Emergency Protocols */}
        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-200/80 dark:border-white/10 pt-3 mt-2 space-y-2.5"
            >
              <div className="space-y-1.5">
                <div className="text-[9.5px] font-mono font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Mandated Civil Defense Actions:</span>
                </div>
                <ul className="space-y-1 pl-1">
                  {protocols.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[10.5px] text-slate-700 dark:text-slate-200 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  <span>Issued: {formatDateTime(alert.dateTime)}</span>
                </span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300 font-bold">
                  AFAR RIFT DISPATCH
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Footer */}
      <div className="px-4.5 py-3 bg-slate-100/70 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10.5px] font-mono shrink-0 gap-2">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold truncate">
          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate max-w-[130px]">{alert.location}</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(alert);
              }}
              title={isGuest ? "Guest Mode: Official or Admin authorization required to dismiss" : "Dismiss alert and move to Recent Alerts History"}
              className={`font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                isGuest 
                  ? "bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-300/80 dark:border-white/10 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30" 
                  : "bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10"
              }`}
            >
              {isGuest ? (
                <>
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Dismiss</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Dismiss</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              const rawId = alert.id.replace("alert_vol_", "").replace("alert_eq_", "");
              onInspectMap(rawId, alert.type === "volcanic" ? "volcano" : "earthquake");
            }}
            className="bg-gradient-to-r from-[#0085C8] to-blue-600 hover:from-blue-600 hover:to-[#00D4FF] text-white font-black text-[9.5px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-105 cursor-pointer flex items-center gap-1 border-0"
          >
            <span>Inspect Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
