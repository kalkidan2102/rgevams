import { Activity, Flame, Radio, Zap, ChevronRight, ShieldAlert } from "lucide-react";

interface TelemetryTickerProps {
  onNavigateTab?: (tab: string) => void;
}

export function TelemetryTicker({ onNavigateTab }: TelemetryTickerProps) {
  const tickerItems = [
    {
      id: "t1",
      type: "seismic",
      icon: Activity,
      color: "text-rose-500",
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      badge: "SEISMIC M 4.6",
      text: "Southern Afar Rift • Awash-Metehara Corridor M 4.6 recorded at 10km depth (Semera corridor calm)",
      actionTab: "analytics"
    },
    {
      id: "t2",
      type: "volcanic",
      icon: Flame,
      color: "text-amber-500",
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      badge: "CRITICAL HAZARD",
      text: "Erta Ale Lava Lake Overturning • Thermal infrared peak exceeds 1,180°C",
      actionTab: "map"
    },
    {
      id: "t3",
      type: "gnss",
      icon: Radio,
      color: "text-cyan-500",
      bg: "bg-cyan-50 border-cyan-200 text-cyan-800",
      badge: "GEODESY ARRAY",
      text: "FURI & BHRD GNSS Nodes active • Crustal widening drift +2.4 cm/yr (Main Ethiopian Rift)",
      actionTab: "analytics"
    },
    {
      id: "t4",
      type: "spaceweather",
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      badge: "IONOSPHERE NORMAL",
      text: "Entoto Space Weather Telemetry • Geomagnetic Kp index stable at 2+",
      actionTab: "dashboard"
    }
  ];

  return (
    <div className="w-full bg-[#041B2D] text-slate-100 border-b border-[#00D4FF]/20 py-2 px-4 select-none overflow-hidden relative shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Fixed Title Badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-[#0085C8] text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <ShieldAlert className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="hidden sm:inline">REAL-TIME TELEMETRY</span>
          <span className="sm:hidden">TELEMETRY</span>
        </div>

        {/* Ticker Items Container with Smooth Motion or Horizontal Scroll */}
        <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center gap-3 py-0.5 text-xs font-mono">
          {tickerItems.map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateTab?.(item.actionTab)}
                className="shrink-0 flex items-center gap-2 bg-slate-900/90 hover:bg-[#0085C8]/30 border border-slate-700/80 hover:border-[#00D4FF]/60 px-3 py-1 rounded-xl transition-all cursor-pointer group hover:scale-[1.02] shadow-2xs"
                title={`Click to open ${item.actionTab}`}
              >
                <IconComp className={`w-3.5 h-3.5 ${item.color} shrink-0 animate-pulse`} />
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${item.bg}`}>
                  {item.badge}
                </span>
                <span className="text-[11px] text-slate-200 group-hover:text-white transition-colors truncate max-w-[280px] sm:max-w-[420px]">
                  {item.text}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00D4FF] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
