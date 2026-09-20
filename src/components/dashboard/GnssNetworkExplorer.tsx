import { useState, useMemo } from "react";
import { ETHIOPIA_GNSS_STATIONS } from "../../data/earthquakes";
import { GnssStation } from "../../types";
import { 
  Compass, 
  MapPin, 
  Activity, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  Info, 
  Globe,
  Anchor,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface GnssNetworkExplorerProps {
  onFocusOnMap?: (coords: [number, number], id: string) => void;
}

export default function GnssNetworkExplorer({ onFocusOnMap }: GnssNetworkExplorerProps) {
  const [stations, setStations] = useState<GnssStation[]>(ETHIOPIA_GNSS_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>("gnss_adis");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeSpan, setTimeSpan] = useState<"5y" | "10y">("5y");
  const [chartViewMode, setChartViewMode] = useState<"stacked" | "overlay">("stacked");
  const [gnssSearch, setGnssSearch] = useState("");
  const [plateFilter, setPlateFilter] = useState<"All" | "Nubian" | "Somalian" | "Afar">("All");

  const selectedStation = useMemo(() => {
    return stations.find(s => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // Handle fake refresh / live telemetry fetch
  const handleTelemetrySync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Add a tiny random jitter to simulate millisecond live GPS adjustments
      setStations(prev => 
        prev.map(st => ({
          ...st,
          velocityNorth: Number((st.velocityNorth + (Math.random() - 0.5) * 0.1).toFixed(2)),
          velocityEast: Number((st.velocityEast + (Math.random() - 0.5) * 0.1).toFixed(2)),
          velocityUp: Number((st.velocityUp + (Math.random() - 0.5) * 0.05).toFixed(2))
        }))
      );
      setIsRefreshing(false);
    }, 850);
  };

  // Calculate dynamic vectors
  const stationVectors = useMemo(() => {
    return stations.map(st => {
      const vN = st.velocityNorth;
      const vE = st.velocityEast;
      const magnitude = Math.sqrt(vN * vN + vE * vE);
      // Azimuth in degrees (East of North)
      let azimuth = Math.atan2(vE, vN) * (180 / Math.PI);
      if (azimuth < 0) azimuth += 360;

      return {
         ...st,
        magnitude: magnitude.toFixed(1),
        azimuth: azimuth.toFixed(1)
      };
    });
  }, [stations]);

  // Filter GNSS Stations based on Search Term & Tectonic Plate filters
  const filteredStationVectors = useMemo(() => {
    return stationVectors.filter(st => {
      const matchesSearch = 
        st.name.toLowerCase().includes(gnssSearch.toLowerCase()) ||
        st.location.toLowerCase().includes(gnssSearch.toLowerCase()) ||
        st.id.toLowerCase().includes(gnssSearch.toLowerCase());
      
      const matchesPlate = 
        plateFilter === "All" ||
        st.description.toLowerCase().includes(plateFilter.toLowerCase()) ||
        st.location.toLowerCase().includes(plateFilter.toLowerCase());

      return matchesSearch && matchesPlate;
    });
  }, [stationVectors, gnssSearch, plateFilter]);

  // Generate 5-year or 10-year simulated coordinates retrieval trends (cumulative movement in mm)
  const driftData = useMemo(() => {
    if (!selectedStation) return [];
    const years = timeSpan === "5y" ? 5 : 10;
    const data = [];
    const baseYear = 2026 - years;
    
    let cumNorth = 0;
    let cumEast = 0;
    let cumUp = 0;

    for (let i = 0; i <= years * 4; i++) {
      const yearFraction = baseYear + (i / 4);
      // seasonal micro-fluctuations (atmosphere + thermal expansion)
      const seasonJitter = Math.sin(i * Math.PI / 2) * 2.2;
      
      cumNorth = (i / 4) * selectedStation.velocityNorth + seasonJitter;
      cumEast = (i / 4) * selectedStation.velocityEast + (Math.cos(i * Math.PI / 2) * 1.8);
      cumUp = (i / 4) * selectedStation.velocityUp + (Math.sin(i * Math.PI / 4) * 0.9);

      data.push({
        label: yearFraction.toFixed(2),
        North: Number(cumNorth.toFixed(2)),
        East: Number(cumEast.toFixed(2)),
        Vertical: Number(cumUp.toFixed(2)),
      });
    }
    return data;
  }, [selectedStation, timeSpan]);

  // Vector Plotter view parameters (Canvas style scaling)
  const maxVelocity = useMemo(() => {
    let max = 0;
    stations.forEach(st => {
      max = Math.max(max, Math.abs(st.velocityNorth), Math.abs(st.velocityEast));
    });
    return max * 1.25; // 25% padding
  }, [stations]);

  // Export current geodetic state
  const handleExportCSV = () => {
    const headers = "ID,Name,Location,Latitude,Longitude,Velocity_North_mm_yr,Velocity_East_mm_yr,Velocity_Up_mm_yr,Source\n";
    const rows = stations.map(s => 
      `"${s.id}","${s.name}","${s.location}",${s.coordinates[0]},${s.coordinates[1]},${s.velocityNorth},${s.velocityEast},${s.velocityUp},"ESSGI Space Geodesy"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ESSGI_GNSS_Geodetic_Surveillance_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/40 dark:bg-[#0B0C10]/45 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-md space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-5">
        <div>
          <span className="text-[#00D4FF] font-mono text-[9px] uppercase tracking-widest font-extrabold flex items-center gap-1.5 mb-1">
            <Globe className="w-3.5 h-3.5 text-[#00D4FF]" />
            IGS Joint Reference Frame
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            GNSS Geodetic Monitoring & Space Geodesy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time geodetic plate velocity vectors tracking tectonic strain and rift divergence in millimeter resolution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTelemetrySync}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-900/60 hover:dark:bg-slate-900/90 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all text-slate-700 dark:text-slate-200 cursor-pointer disabled:opacity-50"
            title="Fetch continuous geodetic stream packets"
            id="sync-gnss-telemetry-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : "text-slate-500"}`} />
            {isRefreshing ? "Syncing GNSS..." : "Sync Geodetic Stream"}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all shadow-xs cursor-pointer border-0"
            title="Download database records as CSV"
            id="export-gnss-csv-btn"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Side: Dynamic Modern Station Directory with Filters (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          
          {/* List Status Header with Active stream indicator */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Receiver Directory ({filteredStationVectors.length})
            </span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-black animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full inline-block animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>

          {/* Directory Filtering Controls Card */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-200/50 dark:border-white/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={gnssSearch}
                  onChange={(e) => setGnssSearch(e.target.value)}
                  placeholder="Search station ID or city..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 py-2 pl-8.5 pr-3 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              {/* Tectonic Plate Filter */}
              <div className="relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <select
                  value={plateFilter}
                  onChange={(e) => setPlateFilter(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 py-2 pl-8.5 pr-3 rounded-xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-cyan-500 font-sans font-bold cursor-pointer"
                >
                  <option value="All">All Plates</option>
                  <option value="Nubian">Nubian Plate</option>
                  <option value="Somalian">Somalian Plate</option>
                  <option value="Afar">Afar Depression</option>
                </select>
              </div>

            </div>
          </div>

          {/* Scrollable list with scrollbars */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-350 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <AnimatePresence mode="popLayout">
              {filteredStationVectors.length > 0 ? (
                filteredStationVectors.map((st) => {
                  const isSelected = st.id === selectedStationId;
                  return (
                    <motion.div
                      layout
                      key={st.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedStationId(st.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-3 relative overflow-hidden group ${
                        isSelected
                          ? "bg-gradient-to-br from-cyan-500/10 to-transparent dark:from-cyan-500/5 dark:to-transparent border-cyan-400/50 shadow-sm ring-1 ring-cyan-400/20"
                          : "bg-white/30 dark:bg-slate-900/10 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/50 dark:hover:bg-slate-900/20"
                      }`}
                      id={`gnss-card-${st.id}`}
                    >
                      {/* Interactive glowing effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      {/* Header line */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs tracking-tight flex items-center gap-1.5 leading-snug">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-cyan-400 animate-ping" : "bg-slate-350 dark:bg-slate-700"} shrink-0`}></span>
                            {st.name}
                          </h4>
                          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 block font-medium mt-0.5">
                            {st.location}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-250/50 dark:border-white/5 shrink-0">
                          {st.id.replace("gnss_", "").toUpperCase()}
                        </span>
                      </div>

                      {/* Dynamic Speed meters */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-100/40 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-200/40 dark:border-white/3 text-[10px]">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[8.5px] block font-semibold uppercase">North</span>
                          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            {st.velocityNorth >= 0 ? "+" : ""}{st.velocityNorth} mm/y
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[8.5px] block font-semibold uppercase">East</span>
                          <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                            {st.velocityEast >= 0 ? "+" : ""}{st.velocityEast} mm/y
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[8.5px] block font-semibold uppercase">Upward</span>
                          <span className={`font-mono font-extrabold block mt-0.5 ${st.velocityUp >= 0 ? "text-cyan-600 dark:text-cyan-400" : "text-rose-500"}`}>
                            {st.velocityUp >= 0 ? "+" : ""}{st.velocityUp} mm/y
                          </span>
                        </div>
                      </div>

                      {/* Magnitude and azimuth bar */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-450 pt-1 border-t border-slate-150/40 dark:border-white/3">
                        <span className="flex items-center gap-1 font-bold">
                          <Compass className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Plate Drift: <strong className="text-slate-800 dark:text-white font-mono">{st.magnitude} mm/y</strong></span>
                        </span>
                        <span className="font-mono text-[9.5px]">
                          Azimuth: <strong className="text-slate-700 dark:text-slate-350">{st.azimuth}°</strong>
                        </span>
                      </div>

                      {/* Map Location Actions */}
                      {isSelected && onFocusOnMap && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFocusOnMap(st.coordinates, st.id);
                            }}
                            className="text-[9.5px] font-black text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-350 uppercase tracking-widest flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-white/5 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span>Locate on GIS Map</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-450 dark:text-slate-550 text-xs italic border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl font-sans">
                  No receivers fit search bounds. Re-tweak keyword filters.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Geodetic Time Series Graphs (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Geodetic Time Series Graphs Container */}
          <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200 dark:border-white/5 p-5 rounded-2xl space-y-5">
            
            {/* Station Geodetic Metadata & Vector Metrics Bar (No 2D picture) */}
            <div className="bg-white/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Anchor className="w-3.5 h-3.5" />
                    Continuous GNSS Beacon
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                    {selectedStation.id.replace("gnss_", "").toUpperCase()}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                  {selectedStation.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedStation.description} • {selectedStation.coordinates[0].toFixed(4)}°N, {selectedStation.coordinates[1].toFixed(4)}°E ({selectedStation.monitoredBy})
                </p>
              </div>

              {/* Live Metric Rate Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-center">
                <div className="px-3 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 rounded-xl">
                  <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold block">East Drift</span>
                  <span className="text-xs font-black font-mono text-indigo-700 dark:text-indigo-300">
                    {selectedStation.velocityEast >= 0 ? "+" : ""}{selectedStation.velocityEast} mm/y
                  </span>
                </div>
                <div className="px-3 py-2 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 rounded-xl">
                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold block">North Drift</span>
                  <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-300">
                    {selectedStation.velocityNorth >= 0 ? "+" : ""}{selectedStation.velocityNorth} mm/y
                  </span>
                </div>
                <div className="px-3 py-2 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60 rounded-xl">
                  <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 uppercase font-bold block">Vertical</span>
                  <span className={`text-xs font-black font-mono ${selectedStation.velocityUp >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {selectedStation.velocityUp >= 0 ? "+" : ""}{selectedStation.velocityUp} mm/y
                  </span>
                </div>
                <div className="px-3 py-2 bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-900/60 rounded-xl">
                  <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold block">Net Rate</span>
                  <span className="text-xs font-black font-mono text-cyan-700 dark:text-cyan-300">
                    {Math.sqrt(selectedStation.velocityNorth ** 2 + selectedStation.velocityEast ** 2).toFixed(1)} mm/y
                  </span>
                </div>
              </div>
            </div>

            {/* Time-Series Graph */}
            <div className="space-y-3.5 border-t border-slate-200/60 dark:border-white/5 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-500" />
                    Multi-Year Cumulative Crustal Drift Trends
                  </h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    COMET portal 3-axis GNSS displacement decomposition (East, North, Vertical).
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {/* View Mode Toggle: Stacked COMET vs Overlay */}
                  <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
                    <button
                      onClick={() => setChartViewMode("stacked")}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border-0 ${
                        chartViewMode === "stacked" 
                          ? "bg-cyan-600 text-white shadow-xs" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                      title="Separate COMET portal 3-subplot view"
                    >
                      3 Subplots (COMET)
                    </button>
                    <button
                      onClick={() => setChartViewMode("overlay")}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border-0 ${
                        chartViewMode === "overlay" 
                          ? "bg-cyan-600 text-white shadow-xs" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                      title="Single combined overlay chart"
                    >
                      Single Overlay
                    </button>
                  </div>

                  {/* Timespan Selector */}
                  <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
                    <button
                      onClick={() => setTimeSpan("5y")}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border-0 ${
                        timeSpan === "5y" 
                          ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-950 shadow-xs" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      5 Years
                    </button>
                    <button
                      onClick={() => setTimeSpan("10y")}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border-0 ${
                        timeSpan === "10y" 
                          ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-950 shadow-xs" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      10 Years
                    </button>
                  </div>
                </div>
              </div>

              {chartViewMode === "stacked" ? (
                /* COMET Portal 3 Stacked Subplots: East, North, Vertical */
                <div className="space-y-3">

                  {/* Subplot 1: East Displacement */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-white/5 p-3 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        1. East-West Displacement (East Drift)
                      </span>
                      <span className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                        dE/dt = {selectedStation.velocityEast >= 0 ? "+" : ""}{selectedStation.velocityEast} mm/yr
                      </span>
                    </div>

                    <div className="h-32 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={driftData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="label" tick={{ fontSize: 8.5, fill: "#64748b" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 8.5, fill: "#64748b" }} unit=" mm" axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#0f172a", 
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              color: "#fff",
                              fontSize: "10.5px",
                              fontFamily: "monospace"
                            }}
                            formatter={(value: any) => [`${value} mm`, "East Drift"]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="East" 
                            stroke="#6366f1" 
                            strokeWidth={2} 
                            dot={false}
                            name="East Drift"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subplot 2: North Displacement */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-white/5 p-3 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        2. North-South Displacement (North Drift)
                      </span>
                      <span className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                        dN/dt = {selectedStation.velocityNorth >= 0 ? "+" : ""}{selectedStation.velocityNorth} mm/yr
                      </span>
                    </div>

                    <div className="h-32 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={driftData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="label" tick={{ fontSize: 8.5, fill: "#64748b" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 8.5, fill: "#64748b" }} unit=" mm" axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#0f172a", 
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              color: "#fff",
                              fontSize: "10.5px",
                              fontFamily: "monospace"
                            }}
                            formatter={(value: any) => [`${value} mm`, "North Drift"]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="North" 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            dot={false}
                            name="North Drift"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Subplot 3: Vertical Displacement / Uplift */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-white/5 p-3 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        3. Vertical Displacement (Uplift / Subsidence)
                      </span>
                      <span className="bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded font-bold">
                        dU/dt = {selectedStation.velocityUp >= 0 ? "+" : ""}{selectedStation.velocityUp} mm/yr
                      </span>
                    </div>

                    <div className="h-32 w-full pt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={driftData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="label" tick={{ fontSize: 8.5, fill: "#64748b" }} axisLine={false} />
                          <YAxis tick={{ fontSize: 8.5, fill: "#64748b" }} unit=" mm" axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#0f172a", 
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              color: "#fff",
                              fontSize: "10.5px",
                              fontFamily: "monospace"
                            }}
                            formatter={(value: any) => [`${value} mm`, "Vertical Motion"]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Vertical" 
                            stroke="#06b6d4" 
                            strokeWidth={2} 
                            strokeDasharray="3 3"
                            dot={false}
                            name="Vertical Motion"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              ) : (
                /* Overlay Single Combined Chart */
                <div className="h-56 w-full bg-slate-50/20 dark:bg-slate-950/10 border border-slate-200/50 dark:border-white/5 p-2 rounded-2xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={driftData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 9, fill: "#64748b" }}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 9, fill: "#64748b" }}
                        unit=" mm"
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#0f172a", 
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace"
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line 
                        type="monotone" 
                        dataKey="North" 
                        stroke="#10b981" 
                        strokeWidth={2.5} 
                        dot={false}
                        name="Cumulative North Drift"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="East" 
                        stroke="#6366f1" 
                        strokeWidth={2.5} 
                        dot={false}
                        name="Cumulative East Drift"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Vertical" 
                        stroke="#06b6d4" 
                        strokeWidth={1.5} 
                        strokeDasharray="4 4"
                        dot={false}
                        name="Vertical Uplift/Subsidence"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-3 flex gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>COMET Portal Interpretation:</strong> Decomposed East (dE), North (dN), and Vertical (dU) displacement components resolve full 3D crustal movement vectors across the Ethiopian Rift system in accordance with NERC COMET geodesy standards.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
