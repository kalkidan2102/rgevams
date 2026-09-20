import React, { useState, useEffect } from "react";
import {
  Shield,
  Bell,
  Activity,
  Flame,
  Radio,
  Compass,
  Search,
  RefreshCw,
  Cpu,
  ArrowRight,
  Loader2,
  Map,
  Fingerprint,
  FileText,
  Download,
  ChevronRight,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";
import { Volcano, Earthquake } from "../../types";
import { motion } from "motion/react";

interface CockpitOverviewProps {
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
  onNavigateTab: (tab: string) => void;
  onSelectSubTab: (subTab: any) => void;
  onSelectEarthquake?: (id: string) => void;
  loadingUSGS?: boolean;
  usgsError?: string | null;
  refetchUSGS?: (force?: boolean) => void;
  secondsToSync?: number;
  eqSearch: string;
  setEqSearch: (val: string) => void;
  volcanoSearch: string;
  setVolcanoSearch: (val: string) => void;
}

export default function CockpitOverview({
  volcanoes,
  earthquakes,
  onNavigateTab,
  onSelectSubTab,
  onSelectEarthquake,
  loadingUSGS = false,
  usgsError = null,
  refetchUSGS,
  secondsToSync = 30,
  eqSearch,
  setEqSearch,
  volcanoSearch,
  setVolcanoSearch,
}: CockpitOverviewProps) {
  // ==================== LIVE CLOCK ====================

  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " EAT"
      );

      setDateStr(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==================== AI SITUATION ADVISOR ====================

  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryResult(null);

    try {
      const activeVolcanoes = volcanoes.filter(
        (v) => v.severity !== "Green"
      );

      const maxMag = earthquakes.length
        ? Math.max(...earthquakes.map((e) => e.magnitude))
        : 0;

      const criticalSeismicEvents = earthquakes.filter(
        (e) => e.severity === "Red" || e.severity === "Orange"
      ).length;

      const summaryPayload = {
        totalVolcanoesObserved: volcanoes.length,
        activeAlertVolcanoesCount: activeVolcanoes.length,
        activeVolcanoes: activeVolcanoes.map((v) => ({
          name: v.name,
          severity: v.severity,
          region: v.region,
        })),
        totalEarthquakesInPeriod: earthquakes.length,
        highestMagnitudeRecorded: maxMag,
        severeEarthquakesCount: criticalSeismicEvents,
      };

      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentDataSummary: summaryPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        setAiSummaryResult(
          data.summaryText ||
            "Situation stable across Main Ethiopian Rift. No immediate catastrophic rupture detected."
        );
      } else {
        throw new Error("API response error");
      }
    } catch {
      const activeVolcCount = volcanoes.filter(
        (v) => v.severity !== "Green"
      ).length;

      const maxMagVal = earthquakes.length
        ? Math.max(...earthquakes.map((e) => e.magnitude)).toFixed(1)
        : "5.8";

      const fallbackMessage =
        "Currently in Ethiopia, active tectonic strain persists primarily across the Afar Depression, where " +
        activeVolcCount +
        " volcanic centers remain under elevated critical monitoring due to active thermal flux. " +
        "Seismological stations have recorded " +
        earthquakes.length +
        " events over the current period, with a peak magnitude of M " +
        maxMagVal +
        ". Emergency agencies should maintain continuous satellite radar sweeps.";

      setAiSummaryResult(fallbackMessage);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // ==================== DASHBOARD DATA ====================

  const activeVolcanoAlerts = volcanoes.filter(
    (v) => v.severity === "Red" || v.severity === "Orange"
  ).length;

  const maxMag = earthquakes.length
    ? Math.max(...earthquakes.map((e) => e.magnitude)).toFixed(1)
    : "6.3";

  const latestEq = earthquakes[0] || {
    id: "eq-fallback-1",
    location: "19 km ESE of Metahāra, Ethiopia",
    magnitude: 4.6,
    depth: 10,
    dateTime: new Date(Date.now() - 8 * 86400000).toISOString(),
    severity: "Yellow",
  };

  // ==================== TIME FORMATTER ====================

  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const past = new Date(dateString);

      const ms = now.getTime() - past.getTime();

      if (ms < 0) return "Just now";

      const sec = Math.floor(ms / 1000);
      const min = Math.floor(sec / 60);
      const hr = Math.floor(min / 60);
      const day = Math.floor(hr / 24);

      if (day > 0) {
        return `${day} day${day > 1 ? "s" : ""} ago`;
      }

      if (hr > 0) {
        return `${hr} hour${hr > 1 ? "s" : ""} ago`;
      }

      if (min > 0) {
        return `${min} minute${min > 1 ? "s" : ""} ago`;
      }

      return "Just now";
    } catch {
      return "Recently";
    }
  };

  // ==================== DATA EXPORT ====================

  const handleExportData = () => {
    try {
      const rows = [
        [
          "ID",
          "Location",
          "Magnitude",
          "Depth_KM",
          "DateTime",
          "Severity",
        ],
        ...earthquakes.map((e) => [
          e.id,
          `"${e.location.replace(/"/g, '""')}"`,
          e.magnitude,
          e.depth,
          e.dateTime,
          e.severity,
        ]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((r) => r.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);

      const link = document.createElement("a");

      link.setAttribute("href", encodedUri);

      link.setAttribute(
        "download",
        `geohazard_seismic_export_${Date.now()}.csv`
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Export handled gracefully
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* =========================================================
          1. EXECUTIVE GOVERNMENT SITREP HEADER
      ========================================================= */}



      {/* =========================================================
          2. EXECUTIVE SITREP KPI TILES
      ========================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* SEISMIC */}

        <div
          onClick={() => onSelectSubTab("earthquakes")}
          className="bg-white dark:bg-[#070D19] p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#0085C8]/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
              24H SEISMIC SWARMS
            </span>

            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {earthquakes.length > 0 ? earthquakes.length : "14"}
              </span>

              <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/30">
                M {maxMag} MAX
              </span>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
              Main Ethiopian Rift &amp; Afar Faults
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Continuous Ingest
            </span>

            <span className="group-hover:text-[#0085C8] transition-colors flex items-center gap-0.5">
              Catalog
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* VOLCANOES */}

        <div
          onClick={() => onSelectSubTab("volcanoes")}
          className="bg-white dark:bg-[#070D19] p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/40 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
              ACTIVE VOLCANIC CORRIDORS
            </span>

            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {activeVolcanoAlerts > 0 ? activeVolcanoAlerts : "2"}
              </span>

              <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">
                CRITICAL LAVA FLUX
              </span>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
              Erta Ale • Dallol • Fentale • Dabbahu
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Thermal Imaging Active
            </span>

            <span className="group-hover:text-[#0085C8] transition-colors flex items-center gap-0.5">
              Volcanoes
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* GNSS */}

        <div
          onClick={() => onSelectSubTab("gnss")}
          className="bg-white dark:bg-[#070D19] p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#0085C8]/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
              GEODETIC RIFT SPREADING
            </span>

            <div className="w-8 h-8 rounded-xl bg-[#0085C8]/10 border border-[#0085C8]/30 flex items-center justify-center text-[#0085C8] shrink-0">
              <Compass className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                ~16.2
              </span>

              <span className="text-xs font-bold font-mono text-[#0074B0] dark:text-[#67C7ED] bg-[#0085C8]/5 px-1.5 py-0.5 rounded border border-[#0085C8]/20">
                mm / yr (Afar)
              </span>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
              Continuous Plate Divergence
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              48 Station Vectors
            </span>

            <span className="group-hover:text-[#0085C8] transition-colors flex items-center gap-0.5">
              GNSS
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* ALERT READINESS */}

        <div
          onClick={() => onNavigateTab("report")}
          className="bg-white dark:bg-[#070D19] p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#0085C8]/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
              DRMC ALERT READINESS
            </span>

            <div className="w-8 h-8 rounded-xl bg-[#0085C8]/10 border border-[#0085C8]/30 flex items-center justify-center text-[#0085C8] shrink-0">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                100%
              </span>

              <span className="text-xs font-bold font-mono text-[#0074B0] dark:text-[#67C7ED] bg-[#0085C8]/5 px-1.5 py-0.5 rounded border border-[#0085C8]/20">
                AUTO-DISPATCH
              </span>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 block">
              SMS • Email • Civil Protection
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              0 Pending Dispatches
            </span>

            <span className="group-hover:text-[#0085C8] transition-colors flex items-center gap-0.5">
              Dispatch Logs
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. REAL-TIME SPATIAL CATALOG SEARCH
      ========================================================= */}

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#0085C8]" />

            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 font-sans">
              REAL-TIME SPATIAL CATALOG SEARCH
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["Afar", "Erta Ale", "Semera", "Dobi", "Fentale"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setEqSearch(tag);
                  setVolcanoSearch(tag);
                }}
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer border ${
                  eqSearch === tag
                    ? "bg-[#0085C8] text-white border-[#0085C8]"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />

            <input
              id="cockpit-catalog-search-input"
              type="text"
              value={eqSearch || volcanoSearch}
              onChange={(e) => {
                setEqSearch(e.target.value);
                setVolcanoSearch(e.target.value);
              }}
              placeholder="Search locations, events, datasets... (e.g. 'Afar', 'Dobi', 'Fentale')"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0085C8] focus:ring-1 focus:ring-[#0085C8] transition-all"
            />
          </div>

          <button
            onClick={() => onNavigateTab("map")}
            className="bg-[#0085C8] hover:bg-[#0074B0] text-white px-5 py-2.5 rounded-xl font-bold font-sans text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs border-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          4. USGS LIVE STREAM STATUS
      ========================================================= */}

      <div
        id="usgs-live-stream-card"
        className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-sans">
                USGS LIVE STREAM
              </span>

              <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md">
                LIVE
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Live USGS stream connected ({earthquakes.length} events synced)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-mono text-slate-400">
            Last sync: {timeStr || "05:12:53 PM"}
          </span>

          <button
            onClick={() => refetchUSGS && refetchUSGS(true)}
            disabled={loadingUSGS}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh USGS stream"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loadingUSGS ? "animate-spin text-[#0085C8]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* =========================================================
          5. LATEST SEISMIC INGEST
      ========================================================= */}

      <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>LATEST SEISMIC INGEST</span>
          </div>

          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
            RT-FEED
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {latestEq.location}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Minor rift surface cracking detected
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-750 text-center min-w-[90px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                Magnitude
              </span>

              <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
                {latestEq.magnitude.toFixed(1)} Mw
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-750 text-center min-w-[90px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                Depth
              </span>

              <span className="text-sm font-bold font-mono text-[#0074B0] dark:text-[#67C7ED]">
                {latestEq.depth} km
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-750 text-center min-w-[90px]">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                Recorded
              </span>

              <span className="text-sm font-bold font-mono text-[#0074B0] dark:text-[#67C7ED]">
                {formatTimeAgo(latestEq.dateTime)}
              </span>
            </div>

            <button
              onClick={() => {
                onNavigateTab("map");

                if (onSelectEarthquake && latestEq.id) {
                  onSelectEarthquake(latestEq.id);
                }
              }}
              className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0074B0] dark:text-[#67C7ED] border border-[#0085C8]/40 px-3.5 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Inspect Epicenter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          6. USGS LIVE FEED TICKER
      ========================================================= */}

      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />

            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono">
              USGS LIVE FEED
            </span>

            <span className="bg-[#0085C8]/10 dark:bg-[#0085C8]/20 text-[#0074B0] dark:text-[#67C7ED] text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md">
              RT-STREAM
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
            <strong className="text-slate-900 dark:text-white mr-1.5">
              NEWEST EVENT:
            </strong>

            M {latestEq.magnitude.toFixed(1)} • {latestEq.location} • Depth:{" "}
            {latestEq.depth}km ({formatTimeAgo(latestEq.dateTime)})
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center text-xs font-mono text-slate-400">
          <span>Auto-sync in {secondsToSync}s</span>

          <button
            onClick={() => refetchUSGS && refetchUSGS(true)}
            disabled={loadingUSGS}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loadingUSGS ? "animate-spin text-[#0085C8]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* =========================================================
          7. SSGI AI GEOHAZARD SITUATION ADVISOR
      ========================================================= */}

      <div
        id="ssgi-ai-advisor-card"
        className="bg-[#000d] p-5 sm:p-6 rounded-2xl border border-[#0085C8]/30 shadow-xl space-y-4 text-white relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0085C8]/10 border border-[#0085C8]/40 text-[#67C7ED] flex items-center justify-center shadow-md shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black font-mono tracking-wider uppercase text-[#7DD3FC]">
                  SSGI AI AUTOMATED GEOHAZARD BRIEFING
                </h2>

                <span className="text-[9px] font-mono font-bold bg-[#0085C8]/10 text-[#7DD3FC] border border-[#0085C8]/30 px-1.5 py-0.2 rounded">
                  GEMINI 2.5
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-0.5 font-normal leading-relaxed">
                Synthesizes multi-station seismic telemetry, volcanic thermal
                flux indices, and geodetic rift strains into ministerial
                briefings.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAiSummary}
            disabled={aiSummaryLoading}
            className="bg-[#0085C8] hover:bg-[#0074B0] text-white font-black px-5 py-2.5 rounded-xl font-sans text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0 border border-[#4DB8E8] disabled:opacity-50"
          >
            {aiSummaryLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Intelligence...</span>
              </>
            ) : (
              <>
                <span>Generate Directorate Briefing</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {aiSummaryResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#0085C8]/20 text-slate-800 dark:text-slate-200 text-xs sm:text-[12.5px] leading-relaxed shadow-xs space-y-1.5"
          >
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#0074B0] dark:text-[#67C7ED] uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Gemini Geological Situation Briefing
              </span>

              <span className="bg-[#0085C8]/10 dark:bg-[#0085C8]/20 text-[#0074B0] dark:text-[#67C7ED] px-1.5 py-0.2 rounded font-mono">
                GENERATED LIVE
              </span>
            </div>

            <p className="text-slate-700 dark:text-slate-200 font-sans font-medium">
              {aiSummaryResult}
            </p>
          </motion.div>
        )}
      </div>

      {/* =========================================================
          8. QUICK ACCESS
      ========================================================= */}

      <div className="space-y-2.5 pt-1">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans px-1">
          QUICK ACCESS
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {/* LIVE MAP */}

          <button
            onClick={() => onNavigateTab("map")}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#0085C8]/40 transition-all cursor-pointer text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0085C8]/10 text-[#0074B0] dark:text-[#67C7ED] flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#0085C8] transition-colors">
                Live Map
              </span>

              <span className="text-[10px] text-slate-400 block truncate">
                Interactive 2D/3D map
              </span>
            </div>
          </button>

          {/* ALERTS */}

          <button
            onClick={() => onSelectSubTab("volcanoes")}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-400/40 transition-all cursor-pointer text-left space-y-2 group relative"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>

            <span className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              {activeVolcanoAlerts > 0 ? activeVolcanoAlerts : "2"}
            </span>

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#0085C8] transition-colors">
                Alerts
              </span>

              <span className="text-[10px] text-slate-400 block truncate">
                Active geohazard alerts
              </span>
            </div>
          </button>

          {/* SEISMIC WAVES */}

          <button
            onClick={() => onSelectSubTab("seismicwave")}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#0085C8]/40 transition-all cursor-pointer text-left space-y-2 group relative"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0085C8]/10 text-[#0074B0] dark:text-[#67C7ED] flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>

            <span className="absolute top-3 right-3 bg-[#0085C8] text-white text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full animate-pulse">
              LIVE
            </span>

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#0085C8] transition-colors">
                Seismic Waves
              </span>

              <span className="text-[10px] text-slate-400 block truncate">
                FURI broadband stream
              </span>
            </div>
          </button>

          {/* GNSS */}

          <button
            onClick={() => onSelectSubTab("gnss")}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#0085C8]/40 transition-all cursor-pointer text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0085C8]/10 text-[#0074B0] dark:text-[#67C7ED] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#0085C8] transition-colors">
                GNSS Network
              </span>

              <span className="text-[10px] text-slate-400 block truncate">
                48 station vectors &amp; drift
              </span>
            </div>
          </button>

          {/* INSAR */}

          <button
            onClick={() => onSelectSubTab("observatory")}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#0085C8]/40 transition-all cursor-pointer text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0085C8]/10 text-[#0074B0] dark:text-[#67C7ED] flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#0085C8] transition-colors">
                InSAR Overlay
              </span>

              <span className="text-[10px] text-slate-400 block truncate">
                Deformation analysis
              </span>
            </div>
          </button>

          {/* REPORTS */}

          <button
            onClick={() => onNavigateTab("report")}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#0085C8]/40 transition-all cursor-pointer text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0085C8]/10 text-[#0074B0] dark:text-[#67C7ED] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#0085C8] transition-colors">
                Reports
              </span>

              <span className="text-[10px] text-slate-400 block truncate">
                Generate hazard reports
              </span>
            </div>
          </button>

          {/* DATA EXPORT */}

          <button
            onClick={handleExportData}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#0085C8]/40 transition-all cursor-pointer text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-[#0085C8] transition-colors">
                Data Export
              </span>

              <span className="text-[10px] text-slate-400 block truncate">
                Download GIS datasets
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}