import { useEffect } from "react";
import { X, Building2, User, MapPin, Activity, CheckCircle2, ArrowRight, ShieldAlert, Cpu, Compass, Layers } from "lucide-react";
import { SectorData } from "../../data/Sectors";

interface SectorDetailModalProps {
  sector: SectorData | null;
  isOpen?: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export function SectorDetailModal({ sector, isOpen = true, onClose, onNavigateToTab }: SectorDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (sector && isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sector, isOpen, onClose]);

  if (!sector || !isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans cursor-pointer overflow-y-auto"
    >
      <div 
        className="bg-white border-2 border-[#0E4A72] rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative cursor-default transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon - Compact & Sleek */}
        <div className="bg-gradient-to-r from-[#0E4A72] via-[#0A3452] to-[#0E4A72] text-white p-4 sm:p-5 relative border-b-2 border-[#D48F29]/40 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-90"
            title="Close Sector Details"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1.5 pr-10">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-[#F7D08A] font-mono text-[9px] uppercase font-bold tracking-widest">
                <Building2 className="w-3 h-3 text-[#F7D08A]" />
                {sector.code}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D48F29]/20 border border-[#D48F29]/50 text-[#F7D08A] font-mono text-[9px] uppercase font-bold tracking-wider">
                <Layers className="w-3 h-3 text-[#F7D08A]" />
                Geodesy & Geodynamics Department
              </span>
            </div>

            {/* Project / Sector Main Title */}
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug font-display">
              {sector.title}
            </h3>

            {/* Geodesy and Geodynamics Department Label under Project Title */}
            <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium pt-0.5">
              <Compass className="w-3.5 h-3.5 text-[#F7D08A] shrink-0" />
              <span className="font-bold text-[#F7D08A]">Geodesy & Geodynamics Department</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-200 truncate">{sector.directorate}</span>
            </div>
          </div>
        </div>

        {/* Modal Body - Scrollable content */}
        <div className="p-4 sm:p-5 space-y-4 text-slate-800 overflow-y-auto text-xs leading-relaxed">
          
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/80 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#B8860B] uppercase tracking-wider block flex items-center gap-1">
                <User className="w-3 h-3" /> Division Officer
              </span>
              <p className="font-extrabold text-xs text-[#0E4A72]">
                {sector.head}
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/80 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#B8860B] uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Station Base Location
              </span>
              <p className="font-extrabold text-xs text-slate-800">
                {sector.location}
              </p>
            </div>
          </div>

          {/* Operational Status Banner */}
          <div className="bg-[#0E4A72]/5 border border-[#0E4A72]/20 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0E4A72] text-[#F7D08A] flex items-center justify-center font-bold shrink-0">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block leading-none">
                  Operational Telemetry
                </span>
                <span className="text-xs font-black text-[#0E4A72] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {sector.status} ({sector.stationCount})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {sector.metrics.slice(0, 2).map((m, idx) => (
                <div key={idx} className="text-right border-l border-slate-200 pl-2">
                  <span className="text-[8.5px] font-mono text-slate-500 block uppercase">{m.label}</span>
                  <span className="text-xs font-black text-slate-900">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-mono font-black text-[#0E4A72] uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#B8860B]" /> Technical Scope & Mission
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-200/90">
              {sector.description}
            </p>
          </div>

          {/* Key Functions */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-mono font-black text-[#0E4A72] uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Directorate Functions
            </h4>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {sector.keyFunctions.map((func, i) => (
                <div key={i} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200 text-slate-700 font-medium">
                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>{func}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Active Projects */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-mono font-black text-[#0E4A72] uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#0085C8]" /> Active Strategic Projects
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {sector.activeProjects.map((proj, i) => (
                <span key={i} className="bg-slate-100 text-slate-800 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-200 font-semibold">
                  • {typeof proj === "string" ? proj : `${proj.title} (${proj.leadAgency})`}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 px-4 sm:px-5 bg-[#FAF9F5] border-t border-slate-200 rounded-b-xl flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer active:scale-95"
          >
            Close
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              if (onNavigateToTab) {
                onNavigateToTab(sector.targetTab);
              }
            }}
            className="px-4 py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white text-xs font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-[#0E4A72] active:scale-95"
          >
            <span>Open Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F7D08A]" />
          </button>
        </div>

      </div>
    </div>
  );
}
