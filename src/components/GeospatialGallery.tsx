import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  MapPin, 
  Orbit, 
  Sparkles, 
  Eye, 
  Maximize2, 
  Download, 
  Layers, 
  Compass, 
  Info, 
  Sliders, 
  Check, 
  X,
  RotateCcw,
  Activity,
  ChevronRight,
  Sparkle,
  EyeOff,
  Database
} from "lucide-react";

import entotoObservatory from "../assets/images/entoto.jpg";
import ertaAleLava from "../assets/images/Erta-ale-lava.jpg";
import dallolSprings from "../assets/images/dallol.jpg";
import earthObservation from "../assets/images/earthobservation.jpg";

// Robust high-fidelity geological and astronomical imagery of Ethiopia
const IMAGES = {
  entoto: entotoObservatory,
  ertaAle: ertaAleLava,
  dallol: dallolSprings,
  satellite: earthObservation
};

interface GalleryItem {
  id: string;
  title: string;
  location: string;
  coordinates: string;
  elevation: string;
  sensor: string;
  date: string;
  description: string;
  longDescription: string;
  scientificValue: string;
  src: string;
  category: "Space" | "Volcanology" | "Geothermal" | "Remote Sensing";
  hotspots?: { x: number; y: number; label: string; desc: string }[];
  vectors?: string; // SVG path for geological contours
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "entoto",
    title: "Entoto Astronomical Observatory & Ground Station",
    location: "Mount Entoto, Addis Ababa, Ethiopia",
    coordinates: "9°04'48.0\"N 38°43'12.0\"E",
    elevation: "3,200m ASL",
    sensor: "ET-SMART-1 & Twin 1m Optical Telescopes",
    date: "October 12, 2025",
    description: "ESSGI's flagship deep-space monitoring facility and satellite tracking array situated at high altitude.",
    longDescription: "Positioned on the crest of Mount Entoto, the Entoto Observatory serves as the East African hub for astronomical research and real-time remote-sensing satellite downlinks. Featuring twin 1.0-meter class telescopes and a modern ground-receiver station, the observatory tracks orbits and records pristine deep-space telemetry on cloud-free Addis Ababa nights.",
    scientificValue: "Serves as the main reception node for Ethiopian satellite telemetry (ET-RSS1 & ET-SMART-1), enabling early hazard modeling, astronomical tracking, and space geodesy alignment.",
    src: IMAGES.entoto,
    category: "Space",
    hotspots: [
      { x: 35, y: 40, label: "Dome 01", desc: "1.0m primary optical reflector telescope" },
      { x: 65, y: 55, label: "Telemetry Mast", desc: "X-band ground tracking reception node" }
    ],
    vectors: "M 20,40 Q 35,15 50,40 T 80,45"
  },
  {
    id: "erta-ale",
    title: "Erta Ale Boiling Basaltic Lava Lake",
    location: "Afar Triangle, Danakil Depression, Ethiopia",
    coordinates: "13°36'11.0\"N 40°39'48.0\"E",
    elevation: "613m ASL",
    sensor: "Sentinel-2B SWIR Payload",
    date: "December 04, 2025",
    description: "An active basaltic shield volcano containing one of the world's rare, persistent boiling lava lakes.",
    longDescription: "Erta Ale ('Smoking Mountain' in the Afar language) is a continuous rift volcano in the Afar Region. Its active basaltic lava lake represents an exposed magma chamber, providing an invaluable window into the forces tearing the African continent apart along the Great Rift Valley.",
    scientificValue: "Continuous thermal infrared monitoring of Erta Ale's active lake level and gas plume compositions offers predictive datasets for wider tectonic rift failure forecasts.",
    src: IMAGES.ertaAle,
    category: "Volcanology",
    hotspots: [
      { x: 48, y: 52, label: "Lava Lake Center", desc: "Active bubbling basaltic fluid conduit" },
      { x: 78, y: 30, label: "Fumarole Ridge", desc: "High temperature sulfur gas vents" }
    ],
    vectors: "M 30,50 Q 50,20 70,50 T 110,60"
  },
  {
    id: "dallol",
    title: "Dallol Hydrothermal Acid Springs & Salt Domes",
    location: "Danakil Depression, Ethiopia",
    coordinates: "14°14'30.0\"N 40°18'00.0\"E",
    elevation: "130m Below Sea Level",
    sensor: "Landsat-9 OLI Multispectral Spectral Array",
    date: "January 18, 2026",
    description: "A surreal, toxic hydrothermal field with glowing neon yellow acid pools and salt chimneys.",
    longDescription: "One of the hottest and lowest subaerial places on Earth, Dallol is a volcanic explosion crater formed by phreatic eruptions in giant salt deposits. Boiling water rich in iron, sulfur, and potash salts discharges continuously, precipitating brilliant green, copper, and golden crystalline pillars.",
    scientificValue: "A terrestrial analog for Martian extreme environments. Monitoring Dallol's brine chemical fluxes enables research into subterranean halophilic life-forms and extreme microbial resilience.",
    src: IMAGES.dallol,
    category: "Geothermal",
    hotspots: [
      { x: 25, y: 45, label: "Neon Pool", desc: "Superheated hyper-acidic brine deposit" },
      { x: 55, y: 70, label: "Salt Chimney", desc: "Precipitated halite crystal column" }
    ],
    vectors: "M 10,70 C 40,50 60,80 90,65"
  },
  {
    id: "satellite-rift",
    title: "Satellite Geodetic Rift Valley Radar Scan",
    location: "Great East African Rift Segment",
    coordinates: "8°15'00.0\"N 39°10'00.0\"E",
    elevation: "Various (Rift Valley Escarpment)",
    sensor: "Sentinel-1A SAR (Synthetic Aperture Radar)",
    date: "March 22, 2026",
    description: "Advanced orbital radar scanning active continental rifting zones and subterranean faults.",
    longDescription: "Using Synthetic Aperture Radar (SAR) interferometry, orbital satellites observe micro-millimeter displacements in the continental crust. This high-altitude perspective allows ESSGI scientists to see underground tectonic strain build-ups through solid clouds and desert sand.",
    scientificValue: "Delineates deep crustal faults, monitors active rift widening, and maps localized subsidence zones around lakes Langano, Abijatta, and Ziway with high precision.",
    src: IMAGES.satellite,
    category: "Remote Sensing",
    hotspots: [
      { x: 40, y: 35, label: "Main Rift Axis", desc: "Maximum extensional fault displacement" },
      { x: 70, y: 60, label: "Plateau Escarpment", desc: "Stable Nubian plate fault boundary" }
    ],
    vectors: "M 15,15 L 85,85 M 85,15 L 15,85"
  }
];

export default function GeospatialGallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | "Space" | "Volcanology" | "Geothermal" | "Remote Sensing">("All");

  // Lightbox Image Adjustments
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showMetadata, setShowMetadata] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<any>(null);

  // Download Simulation Toast
  const [downloadState, setDownloadState] = useState<"idle" | "connecting" | "fetching" | "success">("idle");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadFilename, setDownloadFilename] = useState<string>("");

  // Filtered gallery items
  const filteredItems = GALLERY_ITEMS.filter(
    item => activeFilter === "All" || item.category === activeFilter
  );

  const handleSimulateDownload = (title: string) => {
    setDownloadFilename(title.replace(/\s+/g, "_").toLowerCase() + "_raw_radar_v2.hdf5");
    setDownloadState("connecting");
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setDownloadState("success");
          setTimeout(() => setDownloadState("idle"), 3000);
          return 100;
        }
        if (p === 20) setDownloadState("fetching");
        return p + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-8" id="geospatial-gallery-panel">
      
      {/* 1. INTRO HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-50 to-white dark:from-[#041B2D]/90 dark:to-[#041B2D]/70 text-slate-850 dark:text-white border border-[#0085C8]/15 shadow-sm p-6 sm:p-10">
        {/* Absolute Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,133,200,0.1),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#00d4ff12_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0085C8]/5 border border-[#0085C8]/15 text-[#0085C8] dark:text-[#00D4FF] text-xs font-semibold tracking-wider uppercase">
            <Orbit className="w-3.5 h-3.5 animate-pulse text-[#00D4FF]" />
            ESSGI High-Resolution Optical & Radar Catalog
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-[#041B2D] via-[#0085C8] to-[#00D4FF] dark:from-white dark:via-slate-200 dark:to-[#00D4FF] bg-clip-text text-transparent">
            Geospatial & Planetary Imagery
          </h1>
          <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
            <strong>Purpose of the Geospatial Gallery:</strong> This specialized intelligence portal catalogs critical observation imagery of Ethiopia's dynamic tectonic zones, astronomical telemetry, and environmental anomalies. By capturing multi-spectral feeds (SWIR Thermal, Synthetic Aperture Radar, and elevation models), the Ethiopian Space Science and Geospatial Institute monitors tectonic stress buildup, volcanic rifting pathways, and geothermal changes to forecast seismic activity, map land displacement, and safeguard critical infrastructure.
          </p>
        </div>
      </div>

      {/* 2. TAB CONTROLS & FILTER */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#0085C8] dark:text-[#00D4FF]" />
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest font-display">
            Photo Showcase Archive
          </h2>
        </div>
        
        {/* Interactive filter buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          {(["All", "Space", "Volcanology", "Geothermal", "Remote Sensing"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-0 ${
                activeFilter === filter
                  ? "bg-[#0085C8] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-450 hover:text-[#0085C8] dark:hover:text-[#00D4FF]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID OF IMAGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className="group relative bg-white dark:bg-[#041B2D]/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-lg hover:border-[#0085C8]/30 transition-all duration-300 flex flex-col"
            >
              {/* Image Container with Hover overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={item.src}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Category tag */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold text-[#00D4FF] uppercase tracking-widest">
                  {item.category}
                </span>

                {/* Satellite tracking detail */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {item.sensor.split(" ")[0]} Active
                </div>

                {/* Bottom Overlay Title & Coordinates */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1 text-[10px] text-slate-300 font-mono font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-left">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#0085C8] dark:group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                    {item.description}
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-white/5 pt-4 text-[9.5px] font-mono text-slate-550 dark:text-slate-450 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate" title={item.coordinates}>{item.coordinates}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.elevation}</span>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setZoomLevel(1);
                    setBrightness(100);
                    setContrast(100);
                    setShowVectors(true);
                    setActiveHotspot(null);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#0085C8] dark:bg-slate-900/60 dark:hover:bg-[#0085C8] hover:text-white dark:hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-[#0085C8] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0085C8] dark:text-[#00D4FF] group-hover:text-white" />
                  <span>Inspect Geospatial Layers</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* LIGHTBOX MODAL DETAILED ANALYSIS */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 text-white rounded-3xl border border-white/10 shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col md:flex-row z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 text-white/80 hover:text-white border border-white/10 hover:bg-black/80 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image Side with interactive image filters & Vector Overlays */}
              <div className="md:w-1/2 bg-black relative flex items-center justify-center p-4 min-h-[300px] md:min-h-[480px]">
                <div className="relative overflow-hidden w-full h-full flex items-center justify-center rounded-lg">
                  <img
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    referrerPolicy="no-referrer"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      transition: "transform 0.2s ease"
                    }}
                    className="max-h-[420px] w-full object-contain rounded-lg shadow-lg select-none pointer-events-none"
                  />

                  {/* SVG Vector Contour Overlay (Fault highlights, Crater boundaries) */}
                  {showVectors && selectedItem.vectors && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <motion.path
                        d={selectedItem.vectors}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                        strokeDasharray="4,4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                      />
                    </svg>
                  )}

                  {/* Dynamic Geological Hotspot Nodes */}
                  {showMetadata && selectedItem.hotspots && selectedItem.hotspots.map((hs, i) => (
                    <div 
                      key={i}
                      className="absolute z-30 group"
                      style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                    >
                      <button 
                        onClick={() => setActiveHotspot(hs)}
                        className="w-5 h-5 rounded-full bg-red-500/30 border border-red-500 flex items-center justify-center animate-pulse cursor-pointer shadow-lg hover:scale-125 hover:bg-red-500/50 transition-all"
                      >
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                      </button>

                      {/* Hover Info Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-7 hidden group-hover:block bg-slate-950 text-white rounded-lg p-2.5 border border-white/10 w-44 text-[10px] shadow-2xl pointer-events-none z-40">
                        <span className="font-black text-amber-400 block uppercase">{hs.label}</span>
                        <span className="text-slate-350 block mt-0.5 leading-snug">{hs.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* HUD Metadata Overlay Panel */}
                {showMetadata && (
                  <div className="absolute inset-x-4 bottom-4 flex justify-between gap-4 pointer-events-none">
                    <div className="bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-lg p-2.5 text-[9px] font-mono text-slate-350 text-left space-y-0.5 shadow-xl">
                      <div className="text-amber-400 font-bold uppercase text-[8px] tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Observation Telemetry
                      </div>
                      <div>LAT/LON: {selectedItem.coordinates}</div>
                      <div>ALTITUDE: {selectedItem.elevation}</div>
                      <div>CAPTURE BAND: SWIR 1.6µm / Near-IR</div>
                    </div>
                  </div>
                )}

                {/* Active Hotspot Panel */}
                {activeHotspot && (
                  <div className="absolute top-4 left-4 right-4 bg-slate-950/95 backdrop-blur-md border border-white/10 rounded-xl p-3 text-[10px] text-left z-40 shadow-2xl space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span className="font-black text-red-400 flex items-center gap-1 uppercase tracking-wider">
                        <Activity className="w-3.5 h-3.5" /> Sector Node Detail: {activeHotspot.label}
                      </span>
                      <button 
                        onClick={() => setActiveHotspot(null)}
                        className="text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-300 italic font-medium">"{activeHotspot.desc}"</p>
                  </div>
                )}
              </div>

              {/* Content Side with information tabs */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6 text-left border-l border-white/5 overflow-y-auto max-h-[500px] md:max-h-[550px]">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9.5px] font-mono font-bold tracking-widest uppercase">
                      {selectedItem.category}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">{selectedItem.date}</span>
                  </div>

                  <h3 className="text-lg font-black font-display leading-snug tracking-tight text-white uppercase">
                    {selectedItem.title}
                  </h3>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 text-amber-500" />
                      Geological Background
                    </h4>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans font-medium">
                      {selectedItem.longDescription}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5 space-y-2">
                    <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      Planetary & Academic Value
                    </h4>
                    <p className="text-xs text-slate-350 leading-relaxed font-medium">
                      {selectedItem.scientificValue}
                    </p>
                  </div>
                </div>

                {/* Footer and Controls Slider panel */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-450 font-bold">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        Analysis Adjustment Controls
                      </span>
                      <button 
                        onClick={() => {
                          setZoomLevel(1);
                          setBrightness(100);
                          setContrast(100);
                        }}
                        className="text-[9.5px] text-amber-500 hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        Reset Controls
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] font-mono text-slate-450 font-bold block mb-1">Zoom ({zoomLevel}x)</label>
                        <input
                          type="range"
                          min="1"
                          max="2.5"
                          step="0.1"
                          value={zoomLevel}
                          onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-450 font-bold block mb-1">Contrast ({contrast}%)</label>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={contrast}
                          onChange={(e) => setContrast(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-450 font-bold block mb-1">Brightness ({brightness}%)</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) => setBrightness(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action buttons with custom download spinner states */}
                  <div className="flex flex-col sm:flex-row gap-2 relative">
                    <button
                      onClick={() => setShowMetadata(!showMetadata)}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0 ${
                        showMetadata
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-slate-950 text-slate-300 hover:bg-slate-850"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span>{showMetadata ? "Hide HUD Overlays" : "Show HUD Overlays"}</span>
                    </button>

                    <button
                      onClick={() => setShowVectors(!showVectors)}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0 ${
                        showVectors
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : "bg-slate-950 text-slate-300 hover:bg-slate-850"
                      }`}
                    >
                      {showVectors ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
                      <span>{showVectors ? "Hide Volcanic faulting" : "Show Volcanic faulting"}</span>
                    </button>

                    <button
                      onClick={() => handleSimulateDownload(selectedItem.title)}
                      disabled={downloadState !== "idle"}
                      className={`flex-grow py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md ${
                        downloadState === "idle" ? "bg-white hover:bg-slate-100 text-slate-950" : "bg-slate-950 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {downloadState === "idle" && (
                        <>
                          <Download className="w-3.5 h-3.5 text-slate-950" />
                          <span>Export RAW Data</span>
                        </>
                      )}
                      {downloadState === "connecting" && (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          <span>Establishing Handshake...</span>
                        </>
                      )}
                      {downloadState === "fetching" && (
                        <>
                          <Database className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
                          <span>Downlinking HDF5 {downloadProgress}%...</span>
                        </>
                      )}
                      {downloadState === "success" && (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-400 font-extrabold">RAW Downloaded!</span>
                        </>
                      )}
                    </button>

                    {/* Download simulation floating overlay progress toast inside modal */}
                    <AnimatePresence>
                      {downloadState !== "idle" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute -top-14 left-0 right-0 p-2 rounded-xl bg-slate-950 border border-white/10 text-[10px] font-mono text-left z-50 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full ${downloadState === "success" ? "bg-emerald-500" : "bg-cyan-500 animate-ping"}`} />
                            <span className="truncate max-w-[180px]" title={downloadFilename}>{downloadFilename}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {downloadState === "success" ? (
                              <span className="text-emerald-400 font-bold">DOWNLINK RECOVERY SECURE</span>
                            ) : (
                              <>
                                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-cyan-500 h-full" style={{ width: `${downloadProgress}%` }} />
                                </div>
                                <span>{downloadProgress}%</span>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
