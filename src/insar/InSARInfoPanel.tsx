import React from "react";
import {
  MapPin,
  Calendar,
  Layers,
  Activity,
  Maximize2,
  Download,
  Sliders,
  ShieldAlert,
  Info,
  Terminal,
  TrendingUp,
  Compass,
  Flame,
  ExternalLink,
  ChevronRight,
  Palette
} from "lucide-react";
import {
  VolcanoTarget,
  InSARFilterMode,
  InSARViewLayer,
  InSARColormap
} from "../types/insar";

interface InSARInfoPanelProps {
  volcano: VolcanoTarget;
  selectedLat: number;
  selectedLon: number;
  currentDisplacement: number | null;
  currentVelocity: number | null;
  filterMode: InSARFilterMode;
  viewLayer: InSARViewLayer;
  colormap: InSARColormap;
  coherenceThreshold: number;
  selectedTrackFrameId: string;
  onFilterModeChange: (mode: InSARFilterMode) => void;
  onViewLayerChange: (layer: InSARViewLayer) => void;
  onColormapChange: (colormap: InSARColormap) => void;
  onCoherenceThresholdChange: (thresh: number) => void;
  onTrackFrameChange: (frameId: string) => void;
  onVolcanoChange: (volcanoId: string) => void;
  volcanoTargets: VolcanoTarget[];
  onExportCsv?: () => void;
  onOpenTransectModal?: () => void;
  onOpenScriptModal?: () => void;
}

export const InSARInfoPanel: React.FC<InSARInfoPanelProps> = ({
  volcano,
  selectedLat,
  selectedLon,
  currentDisplacement,
  currentVelocity,
  filterMode,
  viewLayer,
  colormap,
  coherenceThreshold,
  selectedTrackFrameId,
  onFilterModeChange,
  onViewLayerChange,
  onColormapChange,
  onCoherenceThresholdChange,
  onTrackFrameChange,
  onVolcanoChange,
  volcanoTargets,
  onExportCsv,
  onOpenTransectModal,
  onOpenScriptModal
}) => {
  // Group volcanoes by category
  const categories = [
    "Active Caldera",
    "Rifting Segment / Dike",
    "Stratovolcano",
    "Hydrothermal Field",
    "Pumice Complex",
    "Stable Reference"
  ];

  return (
    <div className="w-full bg-[#0B0F19] text-slate-100 border border-slate-800 rounded-xl p-4 shadow-xl font-sans space-y-3.5">
      
      {/* 1. COMET BREADCRUMB & SATELLITE S1 ANALYSIS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-cyan-400 font-bold">COMET Volcano Portal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span>Africa and Red Sea</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-300 font-semibold">Ethiopia</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {volcano.name}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-300 font-semibold">S1_analysis</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenScriptModal && (
            <button
              onClick={onOpenScriptModal}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-800/60 rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
              title="Inspect reproducible Python / LiCSBAS command scripts"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>LiCSBAS Script</span>
            </button>
          )}

          {onOpenTransectModal && (
            <button
              onClick={onOpenTransectModal}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
              title="Open 1D Caldera Transect Profile"
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transect (A-A')</span>
            </button>
          )}

          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-[11px] cursor-pointer transition-all flex items-center gap-1 shadow-sm"
              title="Export complete point time series as CSV table"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN TARGET SELECTION & SATELLITE TRACK BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        
        {/* TARGET DROPDOWN & CLASSIFICATION */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">Target Event:</span>
            <select
              value={volcano.id}
              onChange={(e) => onVolcanoChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={`─── ${cat.toUpperCase()} ───`}>
                  {volcanoTargets
                    .filter((v) => v.category === cat)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.region})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* HAZARD STATUS BADGE */}
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
              volcano.status === "CRITICAL ALERT"
                ? "bg-rose-950/80 text-rose-300 border-rose-800"
                : volcano.status === "ELEVATED ANOMALY"
                ? "bg-amber-950/80 text-amber-300 border-amber-800"
                : volcano.status === "MODERATE RISK"
                ? "bg-blue-950/80 text-blue-300 border-blue-800"
                : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
            }`}
          >
            {volcano.status}
          </span>

          <span className="text-xs text-slate-400 font-mono">
            Elev: {volcano.elevation}m | Peak Rate:{" "}
            <strong className="text-amber-400 font-bold">
              {volcano.peakVelocity > 0 ? `+${volcano.peakVelocity}` : volcano.peakVelocity} mm/yr
            </strong>
          </span>
        </div>

        {/* TRACK / FRAME SELECTOR & FILTER MODE */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* TRACK / FRAME SWITCHER */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 pl-1.5">Track:</span>
            {volcano.tracks.map((t) => (
              <button
                key={t.frameId}
                onClick={() => onTrackFrameChange(t.frameId)}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                  selectedTrackFrameId === t.frameId
                    ? "bg-cyan-700 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.orbitDirection} ({t.trackNumber})
              </button>
            ))}
          </div>

          {/* UNFILTERED / FILTERED TOGGLE */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => onFilterModeChange("unfiltered")}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${
                filterMode === "unfiltered"
                  ? "bg-slate-700 text-cyan-300 border border-slate-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Unfiltered (Raw)
            </button>
            <button
              onClick={() => onFilterModeChange("filtered")}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${
                filterMode === "filtered"
                  ? "bg-slate-700 text-cyan-300 border border-slate-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Filtered (LiCSBAS)
            </button>
          </div>
        </div>

      </div>

      {/* 3. LAYER SELECTION, COLORMAP & COHERENCE MASK SLIDER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
        
        {/* VIEW LAYER SWITCHER */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Map Layer:</span>
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => onViewLayerChange("velocity")}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                viewLayer === "velocity"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Velocity (mm/yr)
            </button>
            <button
              onClick={() => onViewLayerChange("cumulative")}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                viewLayer === "cumulative"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Cumulative Disp (mm)
            </button>
            <button
              onClick={() => onViewLayerChange("coherence")}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                viewLayer === "coherence"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Temporal Coherence (γ)
            </button>
            <button
              onClick={() => onViewLayerChange("dem")}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                viewLayer === "dem"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              SRTM DEM (m)
            </button>
          </div>
        </div>

        {/* COLORMAP SELECTOR */}
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Palette:</span>
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10.5px] font-mono">
            <button
              onClick={() => onColormapChange("comet_jet")}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                colormap === "comet_jet"
                  ? "bg-cyan-900 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              COMET Jet
            </button>
            <button
              onClick={() => onColormapChange("turbo")}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                colormap === "turbo"
                  ? "bg-cyan-900 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Turbo
            </button>
            <button
              onClick={() => onColormapChange("diverging")}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                colormap === "diverging"
                  ? "bg-cyan-900 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Blue-Red
            </button>
            <button
              onClick={() => onColormapChange("spectral")}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                colormap === "spectral"
                  ? "bg-cyan-900 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Wrapped Interferometric Fringes (2.8cm cycle)"
            >
              Phase Fringes
            </button>
          </div>
        </div>

        {/* COHERENCE THRESHOLD MASK SLIDER */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            Coherence Mask (γ ≥ {coherenceThreshold.toFixed(2)}):
          </span>
          <input
            type="range"
            min="0.10"
            max="0.75"
            step="0.05"
            value={coherenceThreshold}
            onChange={(e) => onCoherenceThresholdChange(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400 cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
};
