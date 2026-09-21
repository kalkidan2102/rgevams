import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  VolcanoTarget,
  InSARPointTimeSeries,
  InSARRasterMap,
  InSARFilterMode,
  InSARViewLayer,
  InSARColormap
} from "../types/insar";
import { insarService, VOLCANO_TARGETS } from "../services/insarService";
import { DisplacementMap } from "../insar/DisplacementMap";
import { DisplacementLegend } from "../insar/DisplacementLegend";
import { TimeSeriesChart } from "../insar/TimeSeriesChart";
import { TransectProfileModal } from "../insar/TransectProfileModal";
import { CometScriptModal } from "../insar/CometScriptModal";
import { PythonLicsbasStudioModal } from "../insar/PythonLicsbasStudioModal";
import {
  ChevronRight,
  Download,
  Terminal,
  TrendingUp,
  MapPin,
  Flame,
  Info,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Palette
} from "lucide-react";

export const InSARAnalysis: React.FC = () => {
  // Default to Erta Ale Caldera matching the exact COMET reference screenshot
  const [selectedVolcanoId, setSelectedVolcanoId] = useState<string>("erta_ale");
  const volcano = insarService.getVolcanoById(selectedVolcanoId) || VOLCANO_TARGETS[0];

  // Active track frame ID
  const [selectedTrackFrameId, setSelectedTrackFrameId] = useState<string>(
    volcano?.tracks?.[0]?.frameId || volcano?.frameId || ""
  );

  // Active filter mode: "unfiltered" vs "filtered" (Default: "filtered")
  const [filterMode, setFilterMode] = useState<InSARFilterMode>("filtered");

  // Active view layer
  const [viewLayer, setViewLayer] = useState<InSARViewLayer>("cumulative");

  // Active colormap: COMET default
  const [colormap, setColormap] = useState<InSARColormap>("comet_jet");

  // Coherence masking threshold
  const [coherenceThreshold, setCoherenceThreshold] = useState<number>(0.20);

  // Active selected target coordinates (Default: 13.287, 40.726 as in screenshot)
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number }>({
    lat: volcano?.hotspotPoint?.latitude ?? 13.287,
    lon: volcano?.hotspotPoint?.longitude ?? 40.726
  });

  // Custom reference datum point
  const [customRefCoords, setCustomRefCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Basemap style & InSAR raster opacity
  const [basemapStyle, setBasemapStyle] = useState<"satellite" | "relief" | "topo">("satellite");
  const [rasterOpacity, setRasterOpacity] = useState<number>(0.65);

  // Data states
  const [rasterMap, setRasterMap] = useState<InSARRasterMap | null>(null);
  const [timeSeries, setTimeSeries] = useState<InSARPointTimeSeries | null>(null);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [loadingTimeSeries, setLoadingTimeSeries] = useState<boolean>(true);

  // Modals
  const [isTransectModalOpen, setIsTransectModalOpen] = useState<boolean>(false);
  const [isPythonStudioOpen, setIsPythonStudioOpen] = useState<boolean>(false);

  // Timeline scrubber & animation player
  const [selectedDateIdx, setSelectedDateIdx] = useState<number | null>(null);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const timelineIntervalRef = useRef<any>(null);

  // When volcano changes
  const handleVolcanoChange = (newVolcanoId: string) => {
    setSelectedVolcanoId(newVolcanoId);
    const newVolcano = insarService.getVolcanoById(newVolcanoId) || VOLCANO_TARGETS[0];
    if (newVolcano) {
      setSelectedTrackFrameId(newVolcano.tracks?.[0]?.frameId || newVolcano.frameId || "");
      if (newVolcano.hotspotPoint) {
        setSelectedCoords({
          lat: newVolcano.hotspotPoint.latitude,
          lon: newVolcano.hotspotPoint.longitude
        });
      }
    }
    setCustomRefCoords(null);
    setSelectedDateIdx(null);
    setIsPlayingTimeline(false);
  };

  // Fetch raster map
  const fetchRasterMap = useCallback(async () => {
    setLoadingMap(true);
    try {
      const data = await insarService.getDisplacementMap(
        selectedVolcanoId,
        filterMode,
        selectedTrackFrameId
      );
      setRasterMap(data);
    } catch {
      // Fallback handled silently
    } finally {
      setLoadingMap(false);
    }
  }, [selectedVolcanoId, filterMode, selectedTrackFrameId]);

  // Fetch time-series
  const fetchTimeSeries = useCallback(async () => {
    setLoadingTimeSeries(true);
    try {
      const data = await insarService.getTimeSeries(
        selectedVolcanoId,
        selectedCoords.lat,
        selectedCoords.lon,
        filterMode,
        selectedTrackFrameId
      );
      setTimeSeries(data);
    } catch {
      // Fallback handled silently
    } finally {
      setLoadingTimeSeries(false);
    }
  }, [selectedVolcanoId, selectedCoords, filterMode, selectedTrackFrameId]);

  useEffect(() => {
    fetchRasterMap();
  }, [fetchRasterMap]);

  useEffect(() => {
    fetchTimeSeries();
  }, [fetchTimeSeries]);

  // Timeline playback effect
  useEffect(() => {
    if (isPlayingTimeline && timeSeries?.dates) {
      timelineIntervalRef.current = setInterval(() => {
        setSelectedDateIdx((prev) => {
          const next = prev === null ? 0 : prev + 1;
          if (next >= timeSeries.dates.length) {
            setIsPlayingTimeline(false);
            return prev;
          }
          return next;
        });
      }, 500);
    } else {
      if (timelineIntervalRef.current) {
        clearInterval(timelineIntervalRef.current);
        timelineIntervalRef.current = null;
      }
    }
    return () => {
      if (timelineIntervalRef.current) {
        clearInterval(timelineIntervalRef.current);
      }
    };
  }, [isPlayingTimeline, timeSeries]);

  const activeDateStr =
    timeSeries && selectedDateIdx !== null && timeSeries.dates[selectedDateIdx]
      ? timeSeries.dates[selectedDateIdx]
      : null;

  const activeEpochDisp =
    timeSeries && selectedDateIdx !== null && timeSeries.displacementTimeSeries[selectedDateIdx] !== undefined
      ? timeSeries.displacementTimeSeries[selectedDateIdx]
      : timeSeries?.displacement ?? null;

  const handleSetCustomRef = (coords: { lat: number; lon: number }) => {
    setCustomRefCoords(coords);
  };

  const handlePointSelect = (coords: { lat: number; lon: number }) => {
    setSelectedCoords(coords);
  };

  // Export CSV with multi-track and 2.5D geodetic decomposition
  const handleExportCsv = () => {
    if (!timeSeries || !timeSeries.dates) return;

    const headers = [
      "# COMET / LiCSBAS Sentinel-1 InSAR Multi-Track Time-Series Export",
      `# Volcano: ${volcano.name} (${volcano.region})`,
      `# Target: Latitude ${timeSeries.latitude}°N, Longitude ${timeSeries.longitude}°E`,
      `# Reference: Latitude ${volcano.referencePoint.latitude}°N, Longitude ${volcano.referencePoint.longitude}°E`,
      `# Ascending Track: ${timeSeries.ascendingTrackNumber || '087'} | Descending Track: ${timeSeries.descendingTrackNumber || '131'}`,
      "Date,DecimalYear,Ascending_LOS_mm,Descending_LOS_mm,Vertical_Uplift_mm,EastWest_Horizontal_mm,Active_Displacement_mm,Satellite"
    ];

    const rows = timeSeries.dates.map((d, i) => {
      const yr = timeSeries.decimalYears[i];
      const asc = timeSeries.ascendingTimeSeries?.[i] !== null && timeSeries.ascendingTimeSeries?.[i] !== undefined ? timeSeries.ascendingTimeSeries[i] : "NaN";
      const desc = timeSeries.descendingTimeSeries?.[i] !== null && timeSeries.descendingTimeSeries?.[i] !== undefined ? timeSeries.descendingTimeSeries[i] : "NaN";
      const vert = timeSeries.verticalTimeSeries?.[i] !== null && timeSeries.verticalTimeSeries?.[i] !== undefined ? timeSeries.verticalTimeSeries[i] : "NaN";
      const ew = timeSeries.eastWestTimeSeries?.[i] !== null && timeSeries.eastWestTimeSeries?.[i] !== undefined ? timeSeries.eastWestTimeSeries[i] : "NaN";
      const disp = timeSeries.displacementTimeSeries[i] !== null ? timeSeries.displacementTimeSeries[i] : "NaN";
      const sat = timeSeries.satellites ? timeSeries.satellites[i] : "Sentinel-1A";
      return `${d},${yr},${asc},${desc},${vert},${ew},${disp},${sat}`;
    });

    const csvContent = headers.join("\n") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `COMET_${volcano?.id || "target"}_multi_track_lat${timeSeries.latitude}_lon${timeSeries.longitude}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#222222] p-4 sm:p-8 font-sans select-none">
      
      {/* 1. TOP SYSTEM CONTROL BAR (Clean COMET Portal Header) */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3 text-xs font-sans">
        
        {/* EXACT TOP-LEFT FILTER TOGGLE BUTTONS MATCHING SCREENSHOT */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md p-0.5 bg-[#EAEAEA]">
            <button
              onClick={() => setFilterMode("unfiltered")}
              className={`px-3.5 py-1.5 rounded text-[12.5px] font-medium transition-all cursor-pointer ${
                filterMode === "unfiltered"
                  ? "bg-[#333333] text-white shadow-xs"
                  : "bg-transparent text-[#666666] hover:text-[#222222]"
              }`}
            >
              unfiltered
            </button>
            <button
              onClick={() => setFilterMode("filtered")}
              className={`px-3.5 py-1.5 rounded text-[12.5px] font-medium transition-all cursor-pointer ${
                filterMode === "filtered"
                  ? "bg-[#333333] text-white shadow-xs"
                  : "bg-transparent text-[#666666] hover:text-[#222222]"
              }`}
            >
              filtered
            </button>
          </div>

          {/* VIEW LAYER SELECTOR (Cumulative, Velocity, Wrapped Phase) */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#EAEAEA]">
            <span className="text-[#666666] text-xs font-medium">Layer:</span>
            <div className="inline-flex rounded-md p-0.5 bg-[#EAEAEA]">
              <button
                onClick={() => setViewLayer("cumulative")}
                className={`px-2.5 py-1 rounded text-[11.5px] font-medium transition-all cursor-pointer ${
                  viewLayer === "cumulative"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "bg-transparent text-[#666666] hover:text-[#222222]"
                }`}
              >
                Cumulative (mm)
              </button>
              <button
                onClick={() => setViewLayer("velocity")}
                className={`px-2.5 py-1 rounded text-[11.5px] font-medium transition-all cursor-pointer ${
                  viewLayer === "velocity"
                    ? "bg-white text-emerald-700 shadow-xs font-semibold"
                    : "bg-transparent text-[#666666] hover:text-[#222222]"
                }`}
              >
                Velocity (mm/yr)
              </button>
              <button
                onClick={() => setViewLayer("wrapped_fringes")}
                className={`px-2.5 py-1 rounded text-[11.5px] font-medium transition-all cursor-pointer ${
                  viewLayer === "wrapped_fringes"
                    ? "bg-white text-purple-700 shadow-xs font-semibold"
                    : "bg-transparent text-[#666666] hover:text-[#222222]"
                }`}
              >
                Phase Fringes
              </button>
            </div>
          </div>

          {/* VOLCANO TARGET SELECTOR */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#EAEAEA]">
            <span className="text-[#666666] text-xs font-medium">Volcano:</span>
            <select
              value={selectedVolcanoId}
              onChange={(e) => handleVolcanoChange(e.target.value)}
              className="bg-white border border-[#CCCCCC] rounded px-2.5 py-1 text-xs font-medium text-[#222222] focus:outline-none cursor-pointer"
            >
              {VOLCANO_TARGETS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.region})
                </option>
              ))}
            </select>
          </div>

          {/* ORBIT TRACK SELECTOR (ASCENDING VS DESCENDING) */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#EAEAEA]">
            <span className="text-[#666666] text-xs font-medium">Radar Orbit:</span>
            <div className="inline-flex rounded-md p-0.5 bg-[#EAEAEA]">
              {(volcano?.tracks || []).map((track) => (
                <button
                  key={track.frameId}
                  onClick={() => setSelectedTrackFrameId(track.frameId)}
                  className={`px-2.5 py-1 rounded text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    selectedTrackFrameId === track.frameId
                      ? track.orbitDirection === "Ascending"
                        ? "bg-blue-600 text-white shadow-2xs font-semibold"
                        : "bg-orange-600 text-white shadow-2xs font-semibold"
                      : "bg-transparent text-[#666666] hover:text-[#222222]"
                  }`}
                >
                  <span>{track.orbitDirection === "Ascending" ? "Asc" : "Desc"} (T{track.trackNumber})</span>
                </button>
              ))}
            </div>
          </div>

          {/* SATELLITE / TOPO BASEMAP SELECTOR */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#EAEAEA]">
            <span className="text-[#666666] text-xs font-medium">Basemap:</span>
            <div className="inline-flex rounded-md p-0.5 bg-[#EAEAEA]">
              <button
                onClick={() => setBasemapStyle("satellite")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  basemapStyle === "satellite"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "bg-transparent text-[#666666] hover:text-[#222222]"
                }`}
                title="Optical Satellite Imagery (Esri World Imagery / USGS)"
              >
                Satellite
              </button>
              <button
                onClick={() => setBasemapStyle("topo")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  basemapStyle === "topo"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "bg-transparent text-[#666666] hover:text-[#222222]"
                }`}
                title="Topographic Shaded Relief DEM"
              >
                Topographic
              </button>
            </div>
          </div>

          {/* RASTER OPACITY CONTROL */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#EAEAEA]">
            <span className="text-[#666666] text-xs font-medium">InSAR Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={rasterOpacity}
              onChange={(e) => setRasterOpacity(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              title={`Raster Opacity: ${Math.round(rasterOpacity * 100)}%`}
            />
            <span className="text-[10.5px] font-mono text-[#666666] w-7">
              {Math.round(rasterOpacity * 100)}%
            </span>
          </div>
        </div>

        {/* UTILITIES: PYTHON LiCSBAS STUDIO, TRANSECT, CSV */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPythonStudioOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-xs font-mono font-bold cursor-pointer flex items-center gap-1.5 shadow transition-all active:scale-95"
            title="Open Interactive COMET Python LiCSBAS Studio (Advisor Mode, Mogi Modeling, Inversion & Notebook)"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-300" />
            <span>Python LiCSBAS Studio</span>
            <span className="text-[10px] bg-purple-900/80 text-cyan-200 border border-purple-500/40 px-1.5 py-0.2 rounded font-sans uppercase">
              Advisor Mode
            </span>
          </button>

          <button
            onClick={() => setIsTransectModalOpen(true)}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-[#333333] border border-[#CCCCCC] rounded text-xs font-medium cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Transect Profile (A-A')</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium rounded text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

      </div>

      {/* 2. MAIN 2-PANEL LAYOUT (EXACT SCREENSHOT REPLICA) */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        
        {/* LEFT PANEL: DISPLACEMENT MAP & SUBTITLE */}
        <div className="lg:col-span-6 flex flex-col">
          
          {/* SUBTITLE: EXACT TEXT FROM SCREENSHOT + QUICK POINT PRESETS */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-[17px] font-normal text-[#222222]">
              {viewLayer === "velocity"
                ? `mean velocity (mm/yr), pixel size ${volcano.pixelSizeStr}`
                : `displacement (mm), pixel size ${volcano.pixelSizeStr}`}
            </div>

            {/* QUICK COORDINATE PRESETS */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[#777777]">Inspect:</span>
              <button
                onClick={() => setSelectedCoords({ lat: volcano.hotspotPoint.latitude, lon: volcano.hotspotPoint.longitude })}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-medium hover:bg-emerald-100 cursor-pointer"
                title="Caldera Summit / Active Magmatic Hotspot"
              >
                Summit Hotspot
              </button>
              <button
                onClick={() => {
                  const b = volcano.bounds;
                  const flankLat = (volcano.hotspotPoint.latitude + b.south) / 2;
                  const flankLon = (volcano.hotspotPoint.longitude + b.east) / 2;
                  setSelectedCoords({ lat: parseFloat(flankLat.toFixed(3)), lon: parseFloat(flankLon.toFixed(3)) });
                }}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium hover:bg-blue-100 cursor-pointer"
                title="Volcano Flank"
              >
                Flank
              </button>
              <button
                onClick={() => setSelectedCoords({ lat: volcano.referencePoint.latitude, lon: volcano.referencePoint.longitude })}
                className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium hover:bg-rose-100 cursor-pointer"
                title="Far-field Stable Bedrock Reference Point"
              >
                Ref Bedrock
              </button>
            </div>
          </div>

          {/* MAP & EMBEDDED COLORBAR */}
          <div className="flex items-stretch min-h-[480px]">
            
            {/* LEAFLET PIXELATED MAP (WITH TOP KM, LEFT LAT, BOTTOM LON, RIGHT KM) */}
            <div className="flex-1 min-h-[480px] h-[480px]">
              {rasterMap ? (
                <DisplacementMap
                  rasterMap={rasterMap}
                  volcano={volcano}
                  selectedLat={selectedCoords.lat}
                  selectedLon={selectedCoords.lon}
                  filterMode={filterMode}
                  viewLayer={viewLayer}
                  colormap={colormap}
                  coherenceThreshold={coherenceThreshold}
                  showPixelGrid={false}
                  onPointSelect={handlePointSelect}
                  onSetCustomRef={handleSetCustomRef}
                  customRefCoords={customRefCoords}
                  activeDateStr={activeDateStr}
                  basemapStyle={basemapStyle}
                  rasterOpacity={rasterOpacity}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-sans text-xs">
                  Loading Displacement Pixels...
                </div>
              )}
            </div>

            {/* VERTICAL COLORBAR (570, 0, -570, displacement (mm)) */}
            <div className="w-24 h-[480px] flex items-center justify-center">
              <DisplacementLegend
                viewLayer={viewLayer}
                colormap={colormap}
                dispMin={viewLayer === "velocity" ? (volcano?.velMin ?? -25) : (volcano?.dispMin ?? -150)}
                dispMax={viewLayer === "velocity" ? (volcano?.velMax ?? 35) : (volcano?.dispMax ?? 350)}
                height={350}
              />
            </div>

          </div>

          {/* INTERACTIVE SENTINEL-1 TIMELINE SCRUBBER & ANIMATION PLAYER */}
          {timeSeries && timeSeries.dates && timeSeries.dates.length > 0 && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 font-sans">
              <div className="flex flex-wrap items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isPlayingTimeline
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                    }`}
                  >
                    {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingTimeline ? "Pause Animation" : "Play Timeline Animation"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDateIdx(null);
                      setIsPlayingTimeline(false);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded text-xs font-medium cursor-pointer"
                  >
                    Latest Epoch
                  </button>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700">
                  <span>Epoch: <strong className="text-blue-700">{activeDateStr || timeSeries.dates[timeSeries.dates.length - 1]}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Disp: <strong className="text-blue-700">
                    {activeEpochDisp !== null ? `${activeEpochDisp > 0 ? "+" : ""}${activeEpochDisp} mm` : "NaN"}
                  </strong></span>
                </div>
              </div>

              {/* Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-500">{timeSeries.dates[0]}</span>
                <input
                  type="range"
                  min="0"
                  max={timeSeries.dates.length - 1}
                  value={selectedDateIdx !== null ? selectedDateIdx : timeSeries.dates.length - 1}
                  onChange={(e) => {
                    setSelectedDateIdx(parseInt(e.target.value, 10));
                    setIsPlayingTimeline(false);
                  }}
                  className="flex-1 accent-blue-600 cursor-pointer h-1.5"
                />
                <span className="text-[10px] font-mono text-slate-500">{timeSeries.dates[timeSeries.dates.length - 1]}</span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANEL: TIME SERIES CHART */}
        <div className="lg:col-span-6 flex flex-col h-full min-h-[520px]">
          {timeSeries ? (
            <TimeSeriesChart
              timeSeries={timeSeries}
              volcano={volcano}
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              onExportCsv={handleExportCsv}
            />
          ) : (
            <div className="w-full h-[480px] flex items-center justify-center bg-slate-100 text-slate-500 font-sans text-xs">
              Loading Sentinel-1 Time Series...
            </div>
          )}
        </div>

      </div>

      {/* 3. MODALS */}
      {isTransectModalOpen && (
        <TransectProfileModal
          volcano={volcano}
          filterMode={filterMode}
          onClose={() => setIsTransectModalOpen(false)}
        />
      )}

      {isPythonStudioOpen && (
        <PythonLicsbasStudioModal
          volcano={volcano}
          onClose={() => setIsPythonStudioOpen(false)}
        />
      )}

    </div>
  );
};

export default InSARAnalysis;
