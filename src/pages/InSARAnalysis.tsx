import React, { useState, useEffect, useCallback } from "react";
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
import {
  ChevronRight,
  Download,
  Terminal,
  TrendingUp,
  MapPin,
  Flame,
  Info,
  Sliders
} from "lucide-react";

export const InSARAnalysis: React.FC = () => {
  // Default to Erta Ale Caldera matching the exact COMET reference screenshot
  const [selectedVolcanoId, setSelectedVolcanoId] = useState<string>("erta_ale");
  const volcano = insarService.getVolcanoById(selectedVolcanoId);

  // Active track frame ID
  const [selectedTrackFrameId, setSelectedTrackFrameId] = useState<string>(
    volcano.tracks[0]?.frameId || volcano.frameId
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
    lat: volcano.hotspotPoint.latitude,
    lon: volcano.hotspotPoint.longitude
  });

  // Data states
  const [rasterMap, setRasterMap] = useState<InSARRasterMap | null>(null);
  const [timeSeries, setTimeSeries] = useState<InSARPointTimeSeries | null>(null);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [loadingTimeSeries, setLoadingTimeSeries] = useState<boolean>(true);

  // Modals
  const [isTransectModalOpen, setIsTransectModalOpen] = useState<boolean>(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);

  // When volcano changes
  const handleVolcanoChange = (newVolcanoId: string) => {
    setSelectedVolcanoId(newVolcanoId);
    const newVolcano = insarService.getVolcanoById(newVolcanoId);
    setSelectedTrackFrameId(newVolcano.tracks[0]?.frameId || newVolcano.frameId);
    setSelectedCoords({
      lat: newVolcano.hotspotPoint.latitude,
      lon: newVolcano.hotspotPoint.longitude
    });
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
        filterMode
      );
      setTimeSeries(data);
    } catch {
      // Fallback handled silently
    } finally {
      setLoadingTimeSeries(false);
    }
  }, [selectedVolcanoId, selectedCoords, filterMode]);

  useEffect(() => {
    fetchRasterMap();
  }, [fetchRasterMap]);

  useEffect(() => {
    fetchTimeSeries();
  }, [fetchTimeSeries]);

  const handlePointSelect = (coords: { lat: number; lon: number }) => {
    setSelectedCoords(coords);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!timeSeries || !timeSeries.dates) return;

    const headers = [
      "# COMET / LiCSBAS Sentinel-1 InSAR Time-Series Export",
      `# Volcano: ${volcano.name}`,
      `# Latitude: ${timeSeries.latitude}°N, Longitude: ${timeSeries.longitude}°E`,
      "Date,DecimalYear,Displacement_mm,Satellite"
    ];

    const rows = timeSeries.dates.map((d, i) => {
      const yr = timeSeries.decimalYears[i];
      const disp = timeSeries.displacementTimeSeries[i] !== null ? timeSeries.displacementTimeSeries[i] : "NaN";
      const sat = timeSeries.satellites ? timeSeries.satellites[i] : "Sentinel-1A";
      return `${d},${yr},${disp},${sat}`;
    });

    const csvContent = headers.join("\n") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `COMET_${volcano.id}_lat${timeSeries.latitude}_lon${timeSeries.longitude}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#222222] p-4 sm:p-8 font-sans select-none">
      
      {/* 1. TOP SYSTEM CONTROL BAR (Clean COMET Portal Header) */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3 text-xs font-sans">
        
        {/* EXACT TOP-LEFT FILTER TOGGLE BUTTONS MATCHING SCREENSHOT */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-md p-0.5 bg-[#EAEAEA]">
            <button
              onClick={() => setFilterMode("unfiltered")}
              className={`px-4 py-1.5 rounded text-[13px] font-medium transition-all cursor-pointer ${
                filterMode === "unfiltered"
                  ? "bg-[#333333] text-white shadow-xs"
                  : "bg-transparent text-[#666666] hover:text-[#222222]"
              }`}
            >
              unfiltered
            </button>
            <button
              onClick={() => setFilterMode("filtered")}
              className={`px-4 py-1.5 rounded text-[13px] font-medium transition-all cursor-pointer ${
                filterMode === "filtered"
                  ? "bg-[#333333] text-white shadow-xs"
                  : "bg-transparent text-[#666666] hover:text-[#222222]"
              }`}
            >
              filtered
            </button>
          </div>

          {/* VOLCANO TARGET SELECTOR */}
          <div className="flex items-center gap-2 ml-4">
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
        </div>

        {/* UTILITIES: TRANSECT, SCRIPT, CSV */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransectModalOpen(true)}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-[#333333] border border-[#CCCCCC] rounded text-xs font-medium cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Transect Profile (A-A')</span>
          </button>

          <button
            onClick={() => setIsScriptModalOpen(true)}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-[#333333] border border-[#CCCCCC] rounded text-xs font-medium cursor-pointer flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span>LiCSBAS Script</span>
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
          
          {/* SUBTITLE: EXACT TEXT FROM SCREENSHOT */}
          <div className="text-[17px] font-normal text-[#222222] mb-3">
            displacement (mm), pixel size {volcano.pixelSizeStr}
          </div>

          {/* MAP & EMBEDDED COLORBAR */}
          <div className="flex items-center min-h-[500px]">
            
            {/* LEAFLET PIXELATED MAP (WITH TOP KM, LEFT LAT, BOTTOM LON, RIGHT KM) */}
            <div className="flex-1 h-[480px]">
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
                dispMin={volcano.dispMin}
                dispMax={volcano.dispMax}
                height={350}
              />
            </div>

          </div>

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

      {isScriptModalOpen && (
        <CometScriptModal
          volcano={volcano}
          onClose={() => setIsScriptModalOpen(false)}
        />
      )}

    </div>
  );
};

export default InSARAnalysis;
