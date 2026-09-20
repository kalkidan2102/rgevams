import React, { useState, useMemo } from "react";
import { Volcano, Earthquake, SelectedItem } from "../../types";
import DashboardMap from "./GeologyMap";
import { ETHIOPIA_ACTIVE_ZONES } from "../../data/volcanoes";
import { ETHIOPIA_GNSS_STATIONS } from "../../data/earthquakes";
import {
  Globe,
  Layers,
  MapPin,
  Flame,
  Radio,
  Compass,
  Maximize2,
  Minimize2,
  Sliders,
  Download,
  Search,
  Activity,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Wifi,
  Navigation,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import earthObservation from "../../assets/images/earth_observation_1783339846091.jpg";
import { PostgisSpatialModal } from "./PostgisSpatialModal";

export type MapLayerStyle = "street" | "satellite" | "geological" | "googleEarth" | "googleEarthHybrid";

interface GisOperationsRoomProps {
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
  onOpenCometPortal: (item: SelectedItem) => void;
  currentUser?: any;
  mapStyle: MapLayerStyle;
  onMapStyleChange: (style: MapLayerStyle) => void;
  googleEarthActive: boolean;
  onToggleGoogleEarth: (active: boolean) => void;
  is3DActive: boolean;
  onToggle3D: () => void;
  onTriggerSmartAlert?: (earthquake: Earthquake) => void;
}

export const GisOperationsRoom: React.FC<GisOperationsRoomProps> = ({
  volcanoes,
  earthquakes,
  selectedItem,
  onSelectItem,
  onOpenCometPortal,
  currentUser,
  mapStyle,
  onMapStyleChange,
  googleEarthActive,
  onToggleGoogleEarth,
  is3DActive,
  onToggle3D,
  onTriggerSmartAlert,
}) => {
  const [activeDockTab, setActiveDockTab] = useState<"pointers" | "zones" | "sensors">("pointers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "volcanoes" | "earthquakes">("all");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPostgisModalOpen, setIsPostgisModalOpen] = useState(false);

  // Filtered pointers
  const filteredVolcanoes = useMemo(() => {
    return volcanoes.filter(
      (v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [volcanoes, searchQuery]);

  const filteredEarthquakes = useMemo(() => {
    return earthquakes.filter(
      (eq) =>
        eq.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [earthquakes, searchQuery]);

  // Export GeoJSON function for GIS experts
  const exportGeoJson = () => {
    const geojsonData = {
      type: "FeatureCollection",
      metadata: {
        title: "ESSGI Ethiopian Geospatial & Geohazard Catalog",
        timestamp: new Date().toISOString(),
        institution: "Ethiopian Space Science and Geospatial Institute (ESSGI)",
        projection: "EPSG:4326 (WGS84)"
      },
      features: [
        ...volcanoes.map((v) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [v.coordinates[1], v.coordinates[0]]
          },
          properties: {
            id: v.id,
            name: v.name,
            type: v.type,
            elevation: v.elevation,
            severity: v.severity,
            region: v.region,
            hazardLevel: v.severity === "Red" ? 9 : v.severity === "Orange" ? 7 : 4,
            category: "Volcano"
          }
        })),
        ...earthquakes.map((eq) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [eq.coordinates[1], eq.coordinates[0]]
          },
          properties: {
            id: eq.id,
            magnitude: eq.magnitude,
            location: eq.location,
            depthKm: eq.depth,
            severity: eq.severity,
            dateTime: eq.dateTime,
            category: "Earthquake"
          }
        }))
      ]
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], {
      type: "application/geo+json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ESSGI_GIS_Export_${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-sans select-none animate-fade-in">
      {/* 1. INSTITUTIONAL GIS OPERATIONS HEADER BAR */}
      <div className="bg-[#FAF9F5] dark:bg-[#071728] border-2 border-[#0E4A72]/20 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-sm text-slate-900 dark:text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Left Title & Institution Identifiers */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0E4A72] text-[#F7D08A] text-[9.5px] font-mono uppercase font-black tracking-wider shadow-xs">
                <Globe className="w-3 h-3 text-[#D48F29]" />
                FDRE ESSGI GIS ROOM
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                WGS-84 / UTM ZONE 37N
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                LAT 9.15°N, LNG 40.49°E &bull; AFAR RIFT TRANSECT
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-display text-[#0E4A72] dark:text-white tracking-tight uppercase">
              Geospatial Operations &amp; GIS Map Room
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed">
              Real-time geospatial intelligence terminal displaying the Main Ethiopian Rift, Danakil Depression, active magma centers, and live USGS tectonic telemetry.
            </p>
          </div>

          {/* Right Action Tools & Map Layer Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start xl:self-center">
            {/* Google Earth Satellite Switch */}
            <button
              onClick={() => {
                const nextState = !googleEarthActive;
                onToggleGoogleEarth(nextState);
                if (nextState) {
                  onMapStyleChange("googleEarthHybrid");
                } else {
                  onMapStyleChange("geological");
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                googleEarthActive
                  ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white border-blue-600 shadow-md scale-102"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-[#0E4A72]/20 dark:border-white/10 hover:bg-slate-100"
              }`}
              title="Toggle Google Earth Satellite Imagery"
            >
              <Globe className={`w-3.5 h-3.5 ${googleEarthActive ? "animate-[spin_6s_linear_infinite]" : ""}`} />
              <span>Google Earth</span>
              <span
                className={`text-[8.5px] px-1.5 py-0.2 rounded font-mono ${
                  googleEarthActive ? "bg-white/20 text-white font-bold" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {googleEarthActive ? "ON" : "OFF"}
              </span>
            </button>

            {/* Layer Selector */}
            <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-[#0E4A72]/20 dark:border-white/10 p-1 rounded-xl shadow-xs">
              {([
                { id: "geological", label: "Faults" },
                { id: "satellite", label: "Esri Sat" },
                { id: "street", label: "Street" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onMapStyleChange(opt.id);
                    onToggleGoogleEarth(false);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    mapStyle === opt.id && !googleEarthActive
                      ? "bg-[#0E4A72] text-[#F7D08A] shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* PostGIS Spatial Analytics Engine */}
            <button
              onClick={() => setIsPostgisModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-black font-mono text-[10.5px] uppercase tracking-wider px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 border border-emerald-500/40 active:scale-95"
              title="Launch PostGIS 3.6 Spatial Query & Swarm Clustering Hub"
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>PostGIS Spatial Hub</span>
            </button>

            {/* Export GeoJSON */}
            <button
              onClick={exportGeoJson}
              className="bg-[#0E4A72] hover:bg-[#093554] text-[#F7D08A] font-extrabold font-mono text-[10.5px] uppercase tracking-wider px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 border border-[#D48F29]/40 active:scale-95"
              title="Export Full GIS Layer as GeoJSON for QGIS / ArcGIS"
            >
              <Download className="w-3.5 h-3.5 text-[#F7D08A]" />
              <span>Export GeoJSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN COMPACT GIS WORKSPACE: ZERO-WASTE HIGH DENSITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT / CENTER VIEWPORT (8 of 12 columns on desktop) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col space-y-3">
          {/* Main Leaflet Map Engine Viewport */}
          <div className="rounded-3xl border-2 border-[#0E4A72]/20 dark:border-white/10 overflow-hidden shadow-md bg-white dark:bg-slate-950 relative">
            <DashboardMap
              volcanoes={volcanoes}
              earthquakes={earthquakes}
              selectedItem={selectedItem}
              onSelectItem={onSelectItem}
              onOpenCometPortal={onOpenCometPortal}
              externalMapStyle={mapStyle}
              onMapStyleChange={onMapStyleChange}
              is3DActive={is3DActive}
              onTriggerSmartAlert={onTriggerSmartAlert}
            />
          </div>

          {/* Quick Telemetry Status Ribbon below Map */}
          <div className="bg-[#FAF9F5] dark:bg-[#071728] border border-[#0E4A72]/15 dark:border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-2xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[#0E4A72] dark:text-sky-300 font-extrabold">VOLCANIC CENTERS:</span>
                <span>{volcanoes.length} Monitored</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[#0E4A72] dark:text-sky-300 font-extrabold">SEISMIC NODES:</span>
                <span>{earthquakes.length} Events</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">RADAR: SENTINEL-1A SAR</span>
              <span className="border-l border-slate-300 dark:border-slate-700 pl-3 font-extrabold text-emerald-700 dark:text-emerald-400">
                AFAR GNSS ARRAY: SYNCED
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT DOCK: MULTI-TAB FEDERAL OPERATIONS CONSOLE (4 of 12 columns on desktop) */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col bg-[#FAF9F5] dark:bg-[#071728] border-2 border-[#0E4A72]/20 dark:border-white/10 rounded-3xl p-4 shadow-md h-[680px] space-y-3">
          {/* Dock Header & Tab Navigation */}
          <div className="space-y-2 border-b border-[#0E4A72]/15 dark:border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#0E4A72] dark:text-sky-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D48F29]" />
                GIS OPERATIONS DOCK
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">
                {filteredVolcanoes.length + filteredEarthquakes.length} NODES
              </span>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 border border-[#0E4A72]/15 dark:border-white/10 p-1 rounded-2xl">
              <button
                onClick={() => setActiveDockTab("pointers")}
                className={`py-1.5 px-2 text-[10px] font-mono font-black uppercase rounded-xl transition-all cursor-pointer text-center ${
                  activeDockTab === "pointers"
                    ? "bg-[#0E4A72] text-[#F7D08A] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Pointers
              </button>
              <button
                onClick={() => setActiveDockTab("zones")}
                className={`py-1.5 px-2 text-[10px] font-mono font-black uppercase rounded-xl transition-all cursor-pointer text-center ${
                  activeDockTab === "zones"
                    ? "bg-[#0E4A72] text-[#F7D08A] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Rift Zones
              </button>
              <button
                onClick={() => setActiveDockTab("sensors")}
                className={`py-1.5 px-2 text-[10px] font-mono font-black uppercase rounded-xl transition-all cursor-pointer text-center ${
                  activeDockTab === "sensors"
                    ? "bg-[#0E4A72] text-[#F7D08A] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                GNSS Array
              </button>
            </div>

            {/* Quick Search bar within dock */}
            {activeDockTab === "pointers" && (
              <div className="relative pt-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter nodes (e.g. 'Erta', 'Afar', '5.8')..."
                  className="w-full bg-white dark:bg-slate-900 border border-[#0E4A72]/20 dark:border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-[11px] text-[#0E4A72] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0E4A72]"
                />
              </div>
            )}
          </div>

          {/* TAB 1: MONITORED POINTERS LIST */}
          {activeDockTab === "pointers" && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {/* Monitored Volcanoes Segment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9.5px] font-mono font-black uppercase text-rose-700 dark:text-rose-400 px-1">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-600" />
                    Volcanic Centers ({filteredVolcanoes.length})
                  </span>
                  <span>ALERT STATUS</span>
                </div>

                {filteredVolcanoes.map((v) => {
                  const isSelected = selectedItem?.id === v.id;
                  const isCrit = v.severity === "Red";
                  const isWarn = v.severity === "Orange";

                  return (
                    <div
                      key={v.id}
                      onClick={() => onSelectItem({ type: "volcano", id: v.id })}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? "bg-[#0E4A72] text-white border-[#D48F29] shadow-md ring-2 ring-[#D48F29]/40"
                          : isCrit
                          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100/70"
                          : isWarn
                          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100/70"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs tracking-tight">
                          {v.name}
                        </span>
                        <span
                          className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded uppercase ${
                            isSelected
                              ? "bg-[#D48F29] text-slate-950"
                              : isCrit
                              ? "bg-rose-600 text-white"
                              : isWarn
                              ? "bg-amber-600 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {v.severity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                        <span>{v.region}</span>
                        <span>{v.coordinates[0].toFixed(2)}°N, {v.coordinates[1].toFixed(2)}°E</span>
                      </div>

                      {isSelected && (
                        <div className="pt-1 border-t border-white/20 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-[#F7D08A] font-bold">📍 CAMERA LOCKED</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCometPortal({ type: "volcano", id: v.id });
                            }}
                            className="text-[#F7D08A] hover:underline font-black flex items-center gap-1"
                          >
                            COMET SAR Portal ↗
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Seismic Epicenters Segment */}
              <div className="space-y-1.5 pt-2 border-t border-[#0E4A72]/15 dark:border-white/10">
                <div className="flex items-center justify-between text-[9.5px] font-mono font-black uppercase text-amber-700 dark:text-amber-400 px-1">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-amber-600" />
                    USGS Epicenters ({filteredEarthquakes.length})
                  </span>
                  <span>MAGNITUDE</span>
                </div>

                {filteredEarthquakes.slice(0, 10).map((eq) => {
                  const isSelected = selectedItem?.id === eq.id;
                  const isStrong = eq.magnitude >= 4.5;

                  return (
                    <div
                      key={eq.id}
                      onClick={() => onSelectItem({ type: "earthquake", id: eq.id })}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? "bg-[#0E4A72] text-white border-[#D48F29] shadow-md ring-2 ring-[#D48F29]/40"
                          : isStrong
                          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100/70"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs tracking-tight truncate pr-2">
                          {eq.location}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                            isSelected
                              ? "bg-[#D48F29] text-slate-950"
                              : "bg-[#0E4A72]/10 dark:bg-white/10 text-[#0E4A72] dark:text-amber-300 font-extrabold"
                          }`}
                        >
                          M {eq.magnitude.toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[9.5px] font-mono opacity-80">
                        <span>Depth: {eq.depth} km</span>
                        <span>{eq.coordinates[0].toFixed(2)}°N, {eq.coordinates[1].toFixed(2)}°E</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE RIFT ZONES */}
          {activeDockTab === "zones" && (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans px-1">
                Major geological rift segments of the East African Rift System (EARS) monitored by ESSGI:
              </p>

              {ETHIOPIA_ACTIVE_ZONES.map((zone) => {
                const isSelected = selectedItem?.id === zone.id;

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectItem({ type: "volcano", id: zone.id })}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-[#0E4A72] text-white border-[#D48F29] shadow-md"
                        : "bg-white dark:bg-slate-900 border-[#0E4A72]/15 dark:border-white/10 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs font-display tracking-tight">
                        {zone.name}
                      </h4>
                      <span className="text-[8.5px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 rounded-md border border-rose-500/20">
                        Risk {zone.riskScore}/10
                      </span>
                    </div>

                    <p className={`text-[10px] leading-relaxed line-clamp-2 ${isSelected ? "text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
                      {zone.description}
                    </p>

                    <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-amber-700 dark:text-amber-300 font-bold">
                        Vulnerability: {zone.volcanicVulnerability}
                      </span>
                      <span className="text-[#0085C8] dark:text-cyan-400 font-bold">
                        Inspect Zone ↗
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: GNSS CONTINUOUS STATIONS */}
          {activeDockTab === "sensors" && (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans px-1">
                Continuous Geodetic GNSS Tracking Array for real-time tectonic plate deformation:
              </p>

              {ETHIOPIA_GNSS_STATIONS.map((station) => (
                <div
                  key={station.id}
                  className="bg-white dark:bg-slate-900 border border-[#0E4A72]/15 dark:border-white/10 p-3 rounded-2xl space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono font-black text-xs text-[#0E4A72] dark:text-white">
                        {station.id}
                      </span>
                    </div>
                    <span className="text-[8.5px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">
                      STREAMING
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {station.name}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[9.5px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                    <span>Lat: {station.coordinates[0].toFixed(2)}°N</span>
                    <span>Lng: {station.coordinates[1].toFixed(2)}°E</span>
                    <span>Vel-N: {station.velocityNorth} mm/yr</span>
                    <span>Agency: {station.monitoredBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PostGIS Spatial Analysis Hub Modal */}
      <PostgisSpatialModal
        isOpen={isPostgisModalOpen}
        onClose={() => setIsPostgisModalOpen(false)}
        volcanoes={volcanoes}
        earthquakes={earthquakes}
      />
    </div>
  );
};
