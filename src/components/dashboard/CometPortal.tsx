import { useState, useMemo } from "react";
import { Volcano, Earthquake, SelectedItem, SeverityLevel, GnssStation } from "../../types";
import { ETHIOPIA_GNSS_STATIONS, FALLBACK_EARTHQUAKES } from "../../data/earthquakes";

const REGIONAL_NODES = [
  { code: "ET.TURM", name: "Turmi Station (South Omo Rift)", coords: [4.972, 36.486], region: "South Omo / Lower Rift Block" },
  { code: "DJ.ARTA", name: "Arta Geophysical Observatory", coords: [11.524, 42.845], region: "Gulf of Aden / Tadjoura Extension" },
  { code: "ET.AWAS", name: "Awash Rift Station (Fentale Zone)", coords: [8.989, 40.165], region: "Central Main Ethiopian Rift" },
  { code: "ET.SEME", name: "Semera Rift Station (Afar)", coords: [11.792, 41.005], region: "Afar Triple Junction" },
  { code: "IU.FURI", name: "Entoto Observatory (Addis)", coords: [9.035, 38.767], region: "Intra-Continental Plateau Margin" },
  { code: "ET.ANTE", name: "Arba Minch Station (Chamo Graben)", coords: [6.028, 37.562], region: "Southern Lakes Rift Segment" },
  { code: "ET.HAWA", name: "Hawassa Basin Station", coords: [7.049, 38.485], region: "Central Lakes Caldera Sector" },
  { code: "ET.DIRE", name: "Dire Dawa Escarpment Node", coords: [9.593, 41.862], region: "Somalian Plate Escarpment" },
  { code: "ET.MEKE", name: "Mekelle Plateau Station (Tigray)", coords: [13.496, 39.471], region: "Northern Plateau Graben Block" },
  { code: "ET.BARD", name: "Bahir Dar Station (Lake Tana)", coords: [11.595, 37.388], region: "Northwestern Tana Shield" },
  { code: "ER.ASMA", name: "Asmara Seismic Station (Eritrea)", coords: [15.322, 38.925], region: "Red Sea Escarpment System" },
  { code: "SO.BOSA", name: "Bosaso Station (Gulf of Aden)", coords: [11.284, 49.181], region: "Northern Somali Escarpment" }
];
import { 
  ArrowLeft, 
  Flame, 
  Activity, 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Calendar, 
  MapPin, 
  Cpu, 
  Gauge, 
  Zap,
  Globe,
  Bell,
  RefreshCw,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  ChevronRight,
  ExternalLink,
  Layers,
  Radio,
  Terminal,
  FileCode,
  CheckCircle2,
  Database,
  Sparkles,
  Download,
  BookOpen
} from "lucide-react";
import { LicsbasGuideModal } from "../Modals/LicsbasGuideModal";
import { InteractiveLicsbasViewer } from "./InteractiveLicsbasViewer";

interface CometPortalProps {
  item: SelectedItem;
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
  onBack: () => void;
}

type TimeSpan = "7d" | "30d" | "90d";

// Generates high-fidelity deterministic GNSS position time-series datasets based on station velocities
function generateGnssData(station: GnssStation, span: TimeSpan) {
  const pointsCount = span === "7d" ? 7 : span === "30d" ? 15 : 30;
  const days = span === "7d" ? 7 : span === "30d" ? 30 : 90;
  
  const dates: string[] = [];
  const now = new Date();
  const stepDays = days / pointsCount;
  for (let i = pointsCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * stepDays * 24 * 60 * 60 * 1000);
    dates.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }

  const northData: { date: string; value: number }[] = [];
  const eastData: { date: string; value: number }[] = [];
  const verticalData: { date: string; value: number }[] = [];

  const timeScale = days / 365.25; // fraction of a year

  for (let i = 0; i < pointsCount; i++) {
    const date = dates[i];
    const progress = i / (pointsCount - 1);
    const fractionOfPeriod = progress * timeScale;

    // Displacement = velocity * time + seasonal wave (1 yr period) + random colored geodetic noise
    const seasonalWave = Math.sin(progress * 2 * Math.PI + i * 0.15);
    
    const nVal = (station.velocityNorth * fractionOfPeriod) + (seasonalWave * 0.3) + Math.sin(i * 0.9) * 0.08;
    const eVal = (station.velocityEast * fractionOfPeriod) + (Math.cos(progress * 2 * Math.PI) * 0.25) + Math.cos(i * 0.7) * 0.06;
    const vVal = (station.velocityUp * fractionOfPeriod) + (seasonalWave * 0.8) + Math.sin(i * 1.4) * 0.22;

    northData.push({ date, value: parseFloat(nVal.toFixed(2)) });
    eastData.push({ date, value: parseFloat(eVal.toFixed(2)) });
    verticalData.push({ date, value: parseFloat(vVal.toFixed(2)) });
  }

  // Calculate Net stats
  const netNorth = northData[pointsCount - 1].value - northData[0].value;
  const netEast = eastData[pointsCount - 1].value - eastData[0].value;
  const netVertical = verticalData[pointsCount - 1].value - verticalData[0].value;

  return {
    northData,
    eastData,
    verticalData,
    netNorth,
    netEast,
    netVertical
  };
}

// Generates high-fidelity deterministic time-series datasets based on station ID and timeSpan
function generateCometData(id: string, type: "volcano" | "earthquake", severity: SeverityLevel, span: TimeSpan) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const pointsCount = span === "7d" ? 7 : span === "30d" ? 15 : 30;
  
  // Decide if the trend is globally increasing or decreasing
  // Red/Orange volcanoes and major earthquakes (mag >= 5.5) show increasing trend of activity
  const isIncreasing = severity === "Red" || severity === "Orange";

  const dates: string[] = [];
  const now = new Date();
  const stepDays = span === "7d" ? 1 : span === "30d" ? 2 : 3;

  for (let i = pointsCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * stepDays * 24 * 60 * 60 * 1000);
    dates.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }

  // Base values depending on severity
  const baseValues: Record<SeverityLevel, { deformation: number; gas: number; tremor: number }> = {
    Red: { deformation: 12.0, gas: 750, tremor: 45 },
    Orange: { deformation: 7.5, gas: 480, tremor: 28 },
    Yellow: { deformation: 3.2, gas: 180, tremor: 12 },
    Green: { deformation: 0.8, gas: 45, tremor: 2 }
  };

  const bv = baseValues[severity] || baseValues.Green;

  const deformationData: { date: string; value: number }[] = [];
  const gasData: { date: string; value: number }[] = [];
  const tremorData: { date: string; value: number }[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const date = dates[i];
    const progress = i / (pointsCount - 1);
    
    // Trend multiplier: if increasing, value rises. If decreasing, value falls slightly or oscillates
    const trendMultiplier = isIncreasing 
      ? 1.0 + progress * 0.45 + Math.sin(hash + i * 1.1) * 0.1 
      : 1.0 - progress * 0.25 + Math.sin(hash + i * 0.8) * 0.12;

    // Deformation (InSAR ground displacement in cm)
    let defVal = bv.deformation * trendMultiplier;
    if (severity === "Green") defVal = Math.max(0.1, defVal);
    deformationData.push({ date, value: parseFloat(defVal.toFixed(2)) });

    // Gas emissions (SO2 tons/day) or Seismic energy amplitude
    let gasVal = bv.gas * (trendMultiplier * (1 + Math.sin(hash + i * 1.8) * 0.08));
    gasVal = Math.max(type === "volcano" ? 10 : 1, gasVal);
    gasData.push({ date, value: Math.round(gasVal) });

    // Tremors / daily counts
    let tremorVal = bv.tremor * (trendMultiplier * (1 + Math.cos(hash + i * 0.9) * 0.15));
    tremorVal = Math.max(0, tremorVal);
    tremorData.push({ date, value: Math.round(tremorVal) });
  }

  // Calculate Net Changes
  const firstDef = deformationData[0].value;
  const lastDef = deformationData[deformationData.length - 1].value;
  const defDiff = lastDef - firstDef;
  const defPercent = ((lastDef - firstDef) / (firstDef || 1)) * 100;

  const firstGas = gasData[0].value;
  const lastGas = gasData[gasData.length - 1].value;
  const gasPercent = ((lastGas - firstGas) / (firstGas || 1)) * 100;

  return {
    deformationData,
    gasData,
    tremorData,
    isIncreasing,
    defDiff,
    defPercent,
    gasPercent,
    lastDef,
    lastGas,
    lastTremor: tremorData[tremorData.length - 1].value
  };
}

const GoogleEarth3DControlPanel = ({
  lat,
  lng,
  name,
  type,
  details,
  horizVelocity,
  velocityUp,
  headingAngle,
  headingDir,
  timesrate
}: {
  lat: number;
  lng: number;
  name: string;
  type: string;
  details: any;
  horizVelocity?: string;
  velocityUp?: number;
  headingAngle?: number;
  headingDir?: string;
  timesrate: string;
}) => {
  const [zoom, setZoom] = useState(15);
  const [tilt, setTilt] = useState(60); // oblique tilt 0-80
  const [range, setRange] = useState(2500); // meters distance from eye 500-15000
  const [heading, setHeading] = useState(45); // bearing rotation 0-360
  const [viewMode, setViewMode] = useState<"optical" | "insar" | "thermal">("optical");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // High-tech terminal telemetry feed
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SYS_READY // ESSGI COGNITIVE INTERFACE LOADED.",
    "SAT_LINK: ONLINE // COPERNICUS COHERENT STREAM SECURED.",
    "COORDINATE LOCK: GEOCENTRIC STATE-VECTOR ACTIVE."
  ]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => {
      const updated = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
      return updated.slice(-4); // Keep last 4
    });
  };

  // Trigger Seismic Laser Pulse Sweep
  const handlePulseScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    addLog("INITIATING ACTIVE SUB-LITHOSPHERIC RADAR SOUNDING...");
    
    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      setScanProgress(current);
      
      if (current === 20) {
        addLog("TRANSMITTING COHERENT LASER INTERFEROMETRY SWATH...");
      } else if (current === 50) {
        addLog("MEASURING INDUCED SEISMIC PHASE DELAY WAVEFORM...");
      } else if (current === 80) {
        addLog("RECONSTRUCTING TECTONIC COHERENCE COEFFICIENTS...");
      }
      
      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        addLog(`PULSE LOCK OK. STRAIN ANOMALY DECAY RATIO: 0.88 // READY.`);
      }
    }, 100);
  };

  // Handle slider updates
  const handleTiltChange = (val: number) => {
    setTilt(val);
    addLog(`CAM_TILT UPDATED TO ${val}° (OBLIQUE PERSPECTIVE)`);
  };

  const handleRangeChange = (val: number) => {
    setRange(val);
    const zoomVal = Math.max(10, Math.min(19, Math.round(19 - (val / 1700))));
    setZoom(zoomVal);
    addLog(`CAM_RANGE ADJUSTED TO ${val}m (ALTITUDE LOCK: ${(val / 1000).toFixed(1)} km)`);
  };

  const handleHeadingChange = (val: number) => {
    setHeading(val);
    addLog(`ORBIT_BEARING ROTATED TO ${val}° AZIMUTH`);
  };

  // Google Maps Satellite Output Embed
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=${zoom}&output=embed`;

  // Dynamic Google Earth 3D Link
  // Structure: https://earth.google.com/web/@{lat},{lng},{elevation}a,{range}d,35y,{heading}h,{tilt}t,0r
  const elevationVal = details.elevation || (details.depth ? -details.depth * 1000 : 1500);
  const googleEarthUrl = `https://earth.google.com/web/@${lat},${lng},${elevationVal}a,${range}d,35y,${heading}h,${tilt}t,0r`;

  // Apply high-tech camera filters to simulated satellite feed
  const getFilterStyle = () => {
    switch (viewMode) {
      case "insar":
        return "hue-rotate(120deg) saturate(1.8) contrast(1.3) brightness(0.95)";
      case "thermal":
        return "hue-rotate(290deg) saturate(2.5) contrast(1.5) brightness(0.9)";
      default:
        return "none";
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-[#00D4FF]/25 shadow-2xl overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[520px]">
      
      {/* 3D Google Earth Frame Container */}
      <div className="flex-grow relative h-[320px] lg:h-full lg:w-3/5 bg-slate-900 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
        
        {/* The Map Iframe with interactive Geologist Filter overlays */}
        <div className="w-full h-full relative" style={{ filter: getFilterStyle() }}>
          <iframe
            src={embedUrl}
            className="w-full h-full border-0 select-none transition-all duration-300"
            title="Interactive Google Earth Satellite Portal"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Dynamic Horizontal Laser Scanning Sweep Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div 
              className="w-full h-1 bg-[#00D4FF] shadow-[0_0_15px_#00D4FF] animate-[pulse_0.1s_infinite] absolute left-0"
              style={{ 
                top: `${scanProgress}%`, 
                transition: "top 0.1s linear",
                boxShadow: "0 0 10px 3px rgba(0, 212, 255, 0.8)"
              }}
            />
            <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[0.5px] transition-all" />
          </div>
        )}

        {/* High-Tech Geologist HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-[9px] text-cyan-400">
          {/* Top Corners HUD */}
          <div className="flex justify-between items-start">
            <div className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 p-2 rounded-lg pointer-events-auto flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScanning ? "bg-cyan-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isScanning ? "bg-cyan-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className="font-bold uppercase text-slate-300">
                {isScanning ? `SCANNING TECTONIC FIELD: ${scanProgress}%` : "SAT_STREAM LOCKED"}
              </span>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 p-2 rounded-lg text-right">
              <div>LAT: {lat.toFixed(6)}°N</div>
              <div>LNG: {lng.toFixed(6)}°E</div>
            </div>
          </div>

          {/* Center Target Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-65">
            <div className="w-16 h-16 rounded-full border border-dashed border-cyan-500 animate-spin-slow flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border border-cyan-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>
            {/* Crosshairs */}
            <div className="absolute h-20 w-0.5 bg-cyan-500/40" />
            <div className="absolute w-20 h-0.5 bg-cyan-500/40" />
          </div>

          {/* Bottom HUD - Realtime Parameter Status readout */}
          <div className="flex justify-between items-end">
            <div className="bg-slate-950/80 backdrop-blur-sm border border-white/10 p-2 rounded-lg">
              <div>MODE: <span className="text-amber-400 uppercase font-bold">{viewMode}</span></div>
              <div>SCAN SWATH: <span className="text-white">12.8 KM²</span></div>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-sm border border-white/10 p-2 rounded-lg text-right">
              <div>TILT: <span className="text-white font-bold">{tilt}°</span></div>
              <div>ALT: <span className="text-white font-bold">{range}m</span></div>
              <div>AZI: <span className="text-white font-bold">{heading}°</span></div>
            </div>
          </div>
        </div>

        {/* Floating Header Tag */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-black text-[#00D4FF] flex items-center gap-2 z-10 pointer-events-none shadow-2xl whitespace-nowrap">
          <Globe className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
          <span>GEOLOGIST GOOGLE EARTH COGNITIVE TERMINAL</span>
        </div>
      </div>

      {/* Tectonic Google Earth Geologist Control Panel */}
      <div className="p-6 lg:w-2/5 flex flex-col justify-between bg-gradient-to-b from-[#020D1A] to-[#041629] relative overflow-hidden">
        {/* Subtle dynamic background gradient mesh */}
        <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />

        <div className="relative z-10 space-y-4.5">
          {/* Console Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest font-black text-[#00D4FF] uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 animate-pulse text-cyan-400" />
              Earth Observation Cockpit
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
              ORBIT ACTIVE
            </span>
          </div>

          {/* Node Identifier */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">
              TARGET FIELD STATION
            </span>
            <h3 className="text-base font-black tracking-tight font-display text-white">
              {name}
            </h3>
            <p className="text-[10.5px] text-slate-400 font-mono">
              Geodetic Coordinates: {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
            </p>
          </div>

          {/* Interactive Geologist Control Sliders to manipulate Google Earth view state */}
          <div className="space-y-3 bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300 uppercase border-b border-white/5 pb-1">
              <Sliders className="w-3.5 h-3.5 text-[#00D4FF]" />
              Orbital Camera Vectors
            </div>

            {/* Slider 1: Camera Altitude Range */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Eye Altitude (Range)</span>
                <span className="text-[#00D4FF] font-bold">{range} meters</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="15000" 
                step="250"
                value={range} 
                onChange={(e) => handleRangeChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
              />
            </div>

            {/* Slider 2: Oblique Tilt Angle */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Oblique View Angle (Tilt)</span>
                <span className="text-amber-400 font-bold">{tilt}° Angle</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="80" 
                step="5"
                value={tilt} 
                onChange={(e) => handleTiltChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 3: Orbital Bearing Angle */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Orbit Bearing (Heading)</span>
                <span className="text-emerald-400 font-bold">{heading}° Azimuth</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="360" 
                step="10"
                value={heading} 
                onChange={(e) => handleHeadingChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Geological Spectrum Layers Selector */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold leading-none">
              SPECTRAL IMAGERY CHANNELS
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => { setViewMode("optical"); addLog("VIEW MODE: RGB 3D OPTICAL EARTH CHANNEL LOCKED."); }}
                className={`py-1.5 px-2 text-[9.5px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${viewMode === "optical" ? "bg-cyan-950/60 text-[#00D4FF] border-[#00D4FF]/40 shadow-md" : "bg-slate-900/40 text-slate-400 border-white/5 hover:bg-slate-900/80"}`}
              >
                <Layers className="w-3 h-3 inline mr-1 text-cyan-400" />
                3D RGB
              </button>
              <button 
                onClick={() => { setViewMode("insar"); addLog("VIEW MODE: COHERENCE InSAR RADAR STRIP LOCKED."); }}
                className={`py-1.5 px-2 text-[9.5px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${viewMode === "insar" ? "bg-cyan-950/60 text-[#00D4FF] border-[#00D4FF]/40 shadow-md" : "bg-slate-900/40 text-slate-400 border-white/5 hover:bg-slate-900/80"}`}
              >
                <Radio className="w-3 h-3 inline mr-1 text-purple-400" />
                InSAR Phase
              </button>
              <button 
                onClick={() => { setViewMode("thermal"); addLog("VIEW MODE: DEEP HOTSPOT INFRA-RED ACCUMULATOR LOCKED."); }}
                className={`py-1.5 px-2 text-[9.5px] font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${viewMode === "thermal" ? "bg-cyan-950/60 text-[#00D4FF] border-[#00D4FF]/40 shadow-md" : "bg-slate-900/40 text-slate-400 border-white/5 hover:bg-slate-900/80"}`}
              >
                <Flame className="w-3 h-3 inline mr-1 text-red-500" />
                SWIR Thermal
              </button>
            </div>
          </div>

          {/* High-Tech Seismologist Pulse Control Button */}
          <button
            onClick={handlePulseScan}
            disabled={isScanning}
            className={`w-full py-2.5 rounded-xl border font-mono font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-lg select-none active:scale-95 ${
              isScanning 
                ? "bg-cyan-950/30 text-cyan-400 border-cyan-500/20 cursor-wait" 
                : "bg-slate-900 hover:bg-slate-800 border-white/10 hover:border-cyan-500/40 text-white"
            }`}
          >
            <Cpu className={`w-4 h-4 text-cyan-400 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "PULSE SOUNDING SYSTEM DEPLOYED..." : "SIMULATE TECTONIC PULSE SCAN"}
          </button>

          {/* Interactive Live Log Terminal Feed */}
          <div className="bg-slate-950 border border-white/15 p-3 rounded-xl font-mono text-[8.5px] text-cyan-400 space-y-1 min-h-[72px] relative overflow-hidden shadow-inner">
            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-cyan-950 text-cyan-500 rounded border border-cyan-800/40 text-[7px] font-black uppercase">
              CONSOLE FEED
            </div>
            {terminalLogs.map((log, i) => (
              <div key={i} className="truncate border-l-2 border-cyan-500/30 pl-1.5">
                {log}
              </div>
            ))}
          </div>

          {/* THE LAUNCH ANCHOR DECK (INTEGRATE DIRECTLY WITH GOOGLE EARTH 3D WEB PORTAL) */}
          <a
            href={googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-[#0085C8] to-[#00D4FF] hover:opacity-95 active:scale-[0.98] text-white font-black rounded-xl text-[11px] font-sans shadow-2xl flex items-center justify-center gap-2 cursor-pointer border-0 text-center transition-all animate-pulse"
            style={{ animationDuration: "3s" }}
            title="Launch dynamic Google Earth coordinate stream in new browser tab"
          >
            <Globe className="w-4 h-4 animate-spin-slow text-white shrink-0" />
            CONTROL EVENT IN 3D GOOGLE EARTH PRO ↗
          </a>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/5 text-[9px] text-slate-400 leading-normal font-sans">
          This system couples real-time InSAR deformation vectors with the <strong>Google Earth 3D Engine</strong> to enable deep lithospheric fault analysis and sub-rift modeling.
        </div>
      </div>
    </div>
  );
};

const LicsbasInSARPanel = ({ stationName, location }: { stationName: string; location: string }) => {
  const [selectedPipeline, setSelectedPipeline] = useState<"timeseries_ERA5_demErr" | "timeseries_ERA5" | "timeseries">("timeseries_ERA5_demErr");
  const [showCliCode, setShowCliCode] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const pipelineStats = {
    timeseries: {
      name: "timeseries (Raw InSAR)",
      rmsNoise: "14.8 mm",
      snr: "12.4 dB",
      troposphericCorrection: "None (0%)",
      demErrorCorrection: "Uncorrected",
      quality: "Low (Heavy Weather Phase Delay)",
      color: "text-amber-500 border-amber-500/30 bg-amber-500/10",
      description: "Raw unwrapped InSAR interferogram time series. Contains significant tropospheric water vapor delay artifacts and SRTM/Copernicus topographic height residual errors."
    },
    timeseries_ERA5: {
      name: "timeseries_ERA5 (+ ERA5 Atmospheric)",
      rmsNoise: "4.6 mm",
      snr: "28.1 dB",
      troposphericCorrection: "ECMWF ERA5 (GACOS model)",
      demErrorCorrection: "Uncorrected",
      quality: "Medium-High (Weather Delay Removed)",
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      description: "InSAR phase time series corrected for dynamic tropospheric delay using ECMWF ERA5 3D atmospheric weather reanalysis models."
    },
    timeseries_ERA5_demErr: {
      name: "timeseries_ERA5_demErr (Golden Standard)",
      rmsNoise: "0.7 mm",
      snr: "44.2 dB",
      troposphericCorrection: "ECMWF ERA5 (GACOS model)",
      demErrorCorrection: "Topographic DEM Residual Removed",
      quality: "Sub-millimeter Sub-crustal Precision",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      description: "Gold-standard research dataset. Corrected for both tropospheric weather delays (ERA5) AND residual Digital Elevation Model errors (demErr) via LiCSBAS SBAS inversion."
    }
  };

  const current = pipelineStats[selectedPipeline];

  const cliSnippet = `# LiCSBAS InSAR Time-Series Processing Pipeline (WSL / Linux Environment)
# Target Frame: Sentinel-1 IW (Frame 079A_08920_131313 - ${stationName})

# 1. Download & Prepare LiCSAR Frame Products
licsbas_01_prep.py -i 079A_08920_131313 -d ./licsar_frame

# 2. Calculate ECMWF ERA5 Tropospheric Phase Delays
licsbas_02_prep_era5.py -i ./licsar_frame --gacos_dir ./ERA5_weather

# 3. Small Baseline Subset (SBAS) Inversion
licsbas_03_sbas.py -i ./licsar_frame --loop_closure 0.5

# 4. Correct DEM Height Residual Error -> Output timeseries_ERA5_demErr.h5
licsbas_04_dem_error.py -i ./licsar_frame --out_filename timeseries_ERA5_demErr.h5

# 5. Export GeoTIFF & NetCDF time series
licsbas_05_export.py -i timeseries_ERA5_demErr.h5 --fmt netcdf --out ${stationName.replace(/\s+/g, "_")}_timeseries_ERA5_demErr.nc`;

  return (
    <div className="bg-white border-2 border-slate-200/90 shadow-lg rounded-2xl p-6 space-y-6 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-50/80 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0085C8]/10 border border-[#0085C8]/30 text-[#0085C8] shrink-0 shadow-xs">
            <Layers className="w-6 h-6 animate-pulse text-[#0085C8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-[#0085C8] uppercase tracking-widest">
                COMET LiCSBAS InSAR Engine
              </span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                WSL / Linux Pipeline Active
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              LiCSBAS InSAR Time-Series Processing & Atmospheric Correction (<code className="font-mono text-[#0085C8] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">timeseries_ERA5_demErr</code>)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowGuideModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0085C8] hover:bg-[#0070ab] border border-[#0085C8] text-xs font-mono font-bold text-white flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-white" />
            <span>LiCSBAS Guide & WSL2 Manual</span>
          </button>

          <button
            onClick={() => setShowCliCode(!showCliCode)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-mono font-bold text-slate-800 flex items-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <Terminal className="w-4 h-4 text-[#0085C8]" />
            {showCliCode ? "Hide WSL Commands" : "View LiCSBAS CLI Script"}
          </button>
        </div>
      </div>

      {showGuideModal && (
        <LicsbasGuideModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          targetStationName={stationName}
        />
      )}

      {showCliCode && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-cyan-300 relative space-y-2 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              WSL / LiCSBAS Bash Processing Pipeline
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(cliSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-[10px] font-bold text-cyan-200 border border-cyan-500/40 cursor-pointer flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {copied ? "Copied to Clipboard!" : "Copy Bash Command"}
            </button>
          </div>
          <pre className="overflow-x-auto text-slate-300 leading-relaxed font-mono p-1">
            {cliSnippet}
          </pre>
        </div>
      )}

      {/* Dataset Version Selector */}
      <div className="space-y-3 relative z-10">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
          Select InSAR Time-Series Pipeline Output:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["timeseries_ERA5_demErr", "timeseries_ERA5", "timeseries"] as const).map((key) => {
            const itemStats = pipelineStats[key];
            const isSelected = selectedPipeline === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedPipeline(key)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-[#0085C8]/10 border-2 border-[#0085C8] shadow-md ring-1 ring-[#0085C8] text-slate-900"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9.5px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border shadow-xs ${itemStats.color}`}>
                    {key === "timeseries_ERA5_demErr" ? "★ Golden Standard" : key === "timeseries_ERA5" ? "ERA5 Corrected" : "Raw Input"}
                  </span>
                  {isSelected && <Sparkles className="w-4 h-4 text-[#0085C8] animate-spin-slow" />}
                </div>
                <div className="font-mono font-black text-xs text-slate-900 tracking-wide">
                  {key}
                </div>
                <div className="text-[10.5px] text-slate-600 font-mono">
                  Precision: <strong className="text-[#0085C8] font-extrabold">{itemStats.rmsNoise} RMS</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Pipeline Stage Breakdown */}
      <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-4 font-mono relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Active Dataset Pipeline File</span>
            <span className="text-base font-black text-slate-900 tracking-tight">{current.name}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Quality Rating: {current.quality}
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
          {current.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[9.5px] block font-bold uppercase">RMS Noise Level</span>
            <span className="font-black text-[#0085C8] text-sm">{current.rmsNoise}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[9.5px] block font-bold uppercase">Signal-to-Noise Ratio</span>
            <span className="font-black text-emerald-700 text-sm">{current.snr}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[9.5px] block font-bold uppercase">Tropospheric Delay</span>
            <span className="font-black text-amber-700 text-sm">{current.troposphericCorrection}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-[9.5px] block font-bold uppercase">DEM Height Residual</span>
            <span className="font-black text-[#0085C8] text-sm">{current.demErrorCorrection}</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MOUSE INSPECTION CANVAS */}
      <InteractiveLicsbasViewer stationName={stationName} location={location} />
    </div>
  );
};

export default function CometPortal({ item, volcanoes, earthquakes, onBack }: CometPortalProps) {
  const [timeSpan, setTimeSpan] = useState<TimeSpan>("30d");

  // Lookup selected item details
  const details = useMemo(() => {
    if (!item) return null;

    if (item.type === "volcano") {
      return volcanoes.find((v) => v.id === item.id) || null;
    } else if (item.type === "gnss") {
      return ETHIOPIA_GNSS_STATIONS.find((st) => st.id === item.id) || null;
    } else if (item.type === "earthquake") {
      // 1. Direct earthquake list lookup
      const direct = earthquakes.find((eq) => eq.id === item.id);
      if (direct) return direct;

      // 2. Fallback earthquake list lookup
      const fallback = FALLBACK_EARTHQUAKES.find((eq) => eq.id === item.id);
      if (fallback) return fallback;

      // 3. Node code lookup (e.g. ET.TURM, DJ.ARTA, ET.AWAS, ET.SEME, etc.)
      const matchedNode = REGIONAL_NODES.find(
        (n) => n.code === item.id || n.code.toLowerCase().includes(item.id.toLowerCase())
      );
      if (matchedNode) {
        return {
          id: matchedNode.code,
          magnitude: 4.8,
          location: `${matchedNode.name} (${matchedNode.region})`,
          coordinates: matchedNode.coords,
          depth: 12,
          dateTime: new Date().toISOString(),
          severity: "Yellow",
          description: `Active Seismic Monitoring Node record for station ${matchedNode.code}. Continuous tri-axial ground acceleration and broadband wave stream.`,
          isHistorical: false
        } as Earthquake;
      }

      // 4. GNSS station match
      const matchedGnss = ETHIOPIA_GNSS_STATIONS.find((st) => st.id === item.id);
      if (matchedGnss) {
        return {
          id: matchedGnss.id,
          magnitude: 5.0,
          location: matchedGnss.name,
          coordinates: matchedGnss.coordinates,
          depth: 10,
          dateTime: new Date().toISOString(),
          severity: "Yellow",
          description: matchedGnss.description,
          isHistorical: false
        } as Earthquake;
      }

      // 5. Fail-safe dynamic earthquake constructor for any unlisted USGS or custom ID
      return {
        id: item.id,
        magnitude: 4.5,
        location: `Seismic Epicenter Node [${item.id}]`,
        coordinates: [9.035, 38.767],
        depth: 10,
        dateTime: new Date().toISOString(),
        severity: "Yellow",
        description: `Active seismic event telemetry stream for record ${item.id}. Monitored via regional station network.`,
        isHistorical: false
      } as Earthquake;
    }
    return null;
  }, [item, volcanoes, earthquakes]);

  // Compute nearest seismic monitoring node and telemetry vectors for earthquakes
  const nodeTelemetry = useMemo(() => {
    if (item.type !== "earthquake" || !details) return null;
    const coords = (details as Earthquake).coordinates || [9.035, 38.767];
    const [lat, lng] = coords;
    let closest = REGIONAL_NODES[0];
    let minDistance = Infinity;

    for (const node of REGIONAL_NODES) {
      const dLat = (node.coords[0] - lat) * (Math.PI / 180);
      const dLon = (node.coords[1] - lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * (Math.PI / 180)) *
          Math.cos(node.coords[0] * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = 6371 * c;

      if (dist < minDistance) {
        minDistance = dist;
        closest = node;
      }
    }

    const distKm = Math.round(minDistance * 10) / 10;
    const mag = (details as Earthquake).magnitude || 4.5;
    const pWaveTravelSec = (distKm / 6.2).toFixed(1);
    const sWaveTravelSec = (distKm / 3.6).toFixed(1);
    const pga = Math.min(0.85, (0.015 * Math.pow(10, 0.45 * mag) / Math.max(5, distKm * 0.75))).toFixed(3);
    const mmi = mag >= 6.0 ? "VII (Very Strong)" : mag >= 5.0 ? "VI (Strong)" : mag >= 4.0 ? "IV (Light)" : "III (Weak)";

    return {
      nodeCode: closest.code,
      nodeName: closest.name,
      nodeRegion: closest.region,
      distanceKm: distKm,
      pWaveTravelSec,
      sWaveTravelSec,
      pga,
      mmi,
      status: "Telemetry Stream Active"
    };
  }, [item.type, details]);

  if (!details) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-850 dark:text-white">Station Record Missing</h3>
        <p className="text-xs text-slate-500 mt-2">The selected geostation coordinates are not indexed in the ESSGI database.</p>
        <button onClick={onBack} className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white rounded-md text-xs font-semibold cursor-pointer transition-all shadow-xs border border-slate-800">
          Return to Map Room
        </button>
      </div>
    );
  }

  const severity: SeverityLevel = item.type === "gnss"
    ? (Math.abs((details as GnssStation).velocityUp) > 5.0 ? "Orange" : "Green")
    : (details as Volcano | Earthquake).severity;

  const name = item.type === "volcano"
    ? (details as Volcano).name
    : item.type === "earthquake"
      ? `M ${(details as Earthquake).magnitude.toFixed(1)} Epicenter`
      : `${(details as GnssStation).name}`;

  const subName = item.type === "volcano"
    ? (details as Volcano).region
    : item.type === "earthquake"
      ? (details as Earthquake).location
      : (details as GnssStation).location;

  // Generate COMET time series
  const data = useMemo(() => {
    if (item.type === "gnss") {
      return generateCometData(details.id, "earthquake", severity, timeSpan);
    }
    return generateCometData(details.id, item.type, severity, timeSpan);
  }, [details.id, item.type, severity, timeSpan]);

  // Generate GNSS geodetic data
  const gnssData = useMemo(() => {
    if (item.type === "gnss") {
      return generateGnssData(details as GnssStation, timeSpan);
    }
    return null;
  }, [item.type, details, timeSpan]);

  // Color mappings
  const colors: Record<SeverityLevel, string> = {
    Red: "from-rose-500 to-red-600 text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900",
    Orange: "from-orange-500 to-amber-600 text-orange-600 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
    Yellow: "from-amber-500 to-yellow-600 text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
    Green: "from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
  };

  const activeColor = colors[severity] || colors.Green;

  // Custom Inline SVG Area Chart renderer
  const renderSvgAreaChart = (chartData: { date: string; value: number }[], label: string, unit: string, strokeColor: string, fillColor: string) => {
    const width = 500;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const values = chartData.map(d => d.value);
    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values) * 1.05 || 1;
    const valRange = maxVal - minVal;

    const getX = (index: number) => {
      return paddingLeft + (index / (chartData.length - 1)) * (width - paddingLeft - paddingRight);
    };

    const getY = (val: number) => {
      const scale = (val - minVal) / valRange;
      return height - paddingBottom - scale * (height - paddingTop - paddingBottom);
    };

    // Build SVG Path
    let pathD = `M ${getX(0)} ${getY(chartData[0].value)}`;
    for (let i = 1; i < chartData.length; i++) {
      pathD += ` L ${getX(i)} ${getY(chartData[i].value)}`;
    }

    const fillD = `${pathD} L ${getX(chartData.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;

    return (
      <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider font-sans">
            <span className="w-1.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: strokeColor }}></span>
            {label}
          </span>
          <span className="text-[10px] font-mono font-bold bg-slate-50 dark:bg-[#111215] text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-800 px-2 py-0.5 rounded">
            Unit: {unit}
          </span>
        </div>

        <div className="relative w-full h-[180px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const y = paddingTop + p * (height - paddingTop - paddingBottom);
              const gridVal = maxVal - p * valRange;
              return (
                <g key={i}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="rgba(148, 163, 184, 0.08)" 
                    strokeWidth={1} 
                    strokeDasharray="4,4"
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3} 
                    fill="rgba(148, 163, 184, 0.6)" 
                    fontSize={8} 
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {gridVal.toFixed(gridVal > 100 ? 0 : 1)}
                  </text>
                </g>
              );
            })}

            {/* Time ticks */}
            {chartData.map((d, i) => {
              if (chartData.length > 10 && i % (chartData.length === 30 ? 6 : 3) !== 0) return null;
              const x = getX(i);
              return (
                <g key={i}>
                  <line 
                    x1={x} 
                    y1={height - paddingBottom} 
                    x2={x} 
                    y2={height - paddingBottom + 4} 
                    stroke="rgba(148, 163, 184, 0.2)" 
                    strokeWidth={1}
                  />
                  <text 
                    x={x} 
                    y={height - paddingBottom + 14} 
                    fill="rgba(148, 163, 184, 0.6)" 
                    fontSize={8} 
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={fillD} fill={`url(#grad-${label.replace(/\s+/g, '')})`} />

            {/* Line Stroke */}
            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {/* Joint dots on hover representation */}
            {chartData.map((d, i) => {
              const x = getX(i);
              const y = getY(d.value);
              return (
                <g key={i} className="group cursor-pointer">
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={3} 
                    fill={strokeColor} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={6} 
                    fill="transparent" 
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  if (item.type === "gnss" && gnssData) {
    const gnssStation = details as GnssStation;
    // Calculate 2D velocity vector magnitude
    const horizVelocity = Math.sqrt(gnssStation.velocityNorth ** 2 + gnssStation.velocityEast ** 2).toFixed(2);
    const headingAngle = (Math.atan2(gnssStation.velocityEast, gnssStation.velocityNorth) * 180 / Math.PI);
    const headingDir = headingAngle >= -22.5 && headingAngle < 22.5 ? "North"
                     : headingAngle >= 22.5 && headingAngle < 67.5 ? "North-East"
                     : headingAngle >= 67.5 && headingAngle < 112.5 ? "East"
                     : headingAngle >= 112.5 && headingAngle < 157.5 ? "South-East"
                     : headingAngle >= 157.5 || headingAngle < -157.5 ? "South"
                     : headingAngle >= -157.5 && headingAngle < -112.5 ? "South-West"
                     : headingAngle >= -112.5 && headingAngle < -67.5 ? "West"
                     : "North-West";

    return (
      <div id="comet_station_portal_view" className="space-y-6 animate-fade-in font-sans">
        
        {/* SECTION A: HEADER & BACK ACTUATOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 rounded-2xl shadow-xs transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-md border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all shrink-0 bg-white dark:bg-slate-900 shadow-xs"
              title="Return to Mapping Control Room"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-cyan-600 uppercase flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
                  ESSGI Space Geodesy Network
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">IGS CODE: {gnssStation.id.replace("gnss_", "").toUpperCase()}</span>
              </div>
              
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
                <Cpu className="w-5 h-5 text-cyan-600 shrink-0" />
                {name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <span className="text-[9px] font-mono font-bold uppercase block text-slate-400">Regional Authority</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Geodesy and Geodynamics Division</span>
            </div>
            
            <div className={`px-3 py-1.5 rounded-md border flex items-center gap-2 font-display bg-cyan-50/20 border-cyan-200/50 text-cyan-800 dark:text-cyan-400 shadow-xs`}>
              <span className={`inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse`} />
              <div className="text-left font-sans">
                <div className="text-[9px] font-mono uppercase font-black leading-none text-slate-550 dark:text-slate-450">Receiver Status</div>
                <div className="text-xs font-black uppercase tracking-wide mt-0.5 text-cyan-600">Active Telemetry</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: TIME-SPAN NAVIGATOR & VECTOR DIRECTION INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          <div className="lg:col-span-2 bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-cyan-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-600" />
                  Continuous GNSS Drift Vectors
                </span>
                <div className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Active Span: Last {timeSpan === "7d" ? "7 Days" : timeSpan === "30d" ? "30 Days" : "90 Days"}
                </div>
              </div>

              <div className="p-4 rounded-xl border flex items-start gap-4 bg-cyan-50/20 border-cyan-150 text-slate-800 dark:text-slate-100">
                <div className="p-2.5 rounded-xl shrink-0 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-450">
                  <TrendingUp className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-cyan-850 dark:text-cyan-400">
                    GEODETIC CRUSTAL DISPLACEMENT DYNAMICS
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black font-mono bg-cyan-600 text-white">
                      CRUSTAL DRIFT INITIATED
                    </span>
                  </h3>
                  
                  <p className="text-[12px] leading-relaxed opacity-90 font-sans">
                    Station <strong className="text-slate-900 dark:text-white">{gnssStation.name}</strong> is continuously monitoring active tectonic plates of the East African Rift System. 
                    Current data indicates a horizontal velocities magnitude of <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{horizVelocity} mm/year</strong> drifting toward the <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{headingDir}</strong> ({headingAngle.toFixed(1)}° Azimuth).
                    Vertical monitoring reveals a constant {gnssStation.velocityUp >= 0 ? "uplift (inflation)" : "subsidence (deflation)"} motion of <strong className="text-slate-950 dark:text-white font-bold font-mono">{gnssStation.velocityUp >= 0 ? "+" : ""}{gnssStation.velocityUp} mm/year</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-left">
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 block">Horiz Velocity</span>
                <span className="text-sm font-black font-mono text-cyan-600">
                  {horizVelocity} mm/yr
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 block">Azimuth Heading</span>
                <span className="text-sm font-black font-mono text-slate-700 dark:text-slate-300">
                  {headingAngle.toFixed(1)}° ({headingDir})
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 block">Vertical Motion</span>
                <span className={`text-sm font-black font-mono ${gnssStation.velocityUp < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {gnssStation.velocityUp >= 0 ? "+" : ""}{gnssStation.velocityUp} mm/yr
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 block">Monument Stability</span>
                <span className="text-sm font-black font-mono text-emerald-600">
                  99.98% (Exquisite)
                </span>
              </div>
            </div>
          </div>

          {/* Time Span selection */}
          <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 block">
                Geodetic Span Controls
              </span>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-350 block font-sans">
                  Select Observations window:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "7d", label: "7 Days" },
                    { id: "30d", label: "30 Days" },
                    { id: "90d", label: "90 Days" }
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTimeSpan(opt.id)}
                      className={`text-xs font-bold py-2 px-2.5 rounded-md border transition-all cursor-pointer ${
                        timeSpan === opt.id
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-xs font-semibold"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-white/5 pt-3.5 space-y-2">
                <span className="text-[9px] font-mono font-bold uppercase block text-slate-400">Benchmark Coordinates</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md">
                    <span className="text-[9px] font-mono text-slate-500 block">Latitude</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono">{gnssStation.coordinates[0].toFixed(5)}°N</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md">
                    <span className="text-[9px] font-mono text-slate-500 block">Longitude</span>
                    <span className="font-bold text-slate-800 dark:text-white font-mono">{gnssStation.coordinates[1].toFixed(5)}°E</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono">GNSS Constellation</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                GPS + GLONASS + GALILEO
              </span>
            </div>
          </div>
        </div>

        {/* GOOGLE EARTH 3D SATELLITE INTEGRATION */}
        <GoogleEarth3DControlPanel
          lat={gnssStation.coordinates[0]}
          lng={gnssStation.coordinates[1]}
          name={gnssStation.name}
          type="gnss"
          details={gnssStation}
          horizVelocity={horizVelocity}
          velocityUp={gnssStation.velocityUp}
          headingAngle={headingAngle}
          headingDir={headingDir}
          timesrate={`N: ${gnssData.netNorth >= 0 ? "+" : ""}${gnssData.netNorth.toFixed(1)}mm, E: ${gnssData.netEast >= 0 ? "+" : ""}${gnssData.netEast.toFixed(1)}mm`}
        />

        {/* SECTION C: GNSS DISPLACEMENT TIME-SERIES GRAPHS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSvgAreaChart(
            gnssData.northData, 
            "North Plate Displacement", 
            "Displacement (mm)", 
            "#0ea5e9", 
            "#0ea5e9"
          )}

          {renderSvgAreaChart(
            gnssData.eastData, 
            "East Plate Displacement", 
            "Displacement (mm)", 
            "#6366f1", 
            "#6366f1"
          )}

          {renderSvgAreaChart(
            gnssData.verticalData, 
            "Vertical Ground Deformation (Up/Down)", 
            "Displacement (mm)", 
            "#d946ef", 
            "#d946ef"
          )}
        </div>

        {/* LICSBAS INSAR ERA5 + DEM ERROR CORRECTION MODULE */}
        <LicsbasInSARPanel stationName={gnssStation.name} location={gnssStation.location} />

        {/* SECTION D: EVERY DESCRIPTION & EXTENDED STATION ANALYSIS */}
        <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-6 shadow-xs space-y-6 transition-all">
          <div className="border-b border-slate-200 dark:border-white/5 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-600 shrink-0" />
              Complete Station nature & Benchmark Geodetic metadata
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            
            {/* Column 1: Station Identification */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">
                &mdash; Benchmark Specifications
              </span>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block">Receiver ID Name</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{gnssStation.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block">Geodetic Monument Type</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Deep-Drilled Braced Invar monument</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block">Observation Region</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{gnssStation.location}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 block">Constellation Capabilities</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                    Multi-frequency GPS/GLONASS/Galileo/BeiDou
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Velocities Log */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">
                &mdash; Annual Velocities Log (IGS-14)
              </span>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">
                <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-1">
                  <span>Velocity North:</span>
                  <span className="font-bold text-slate-850 dark:text-white">+{gnssStation.velocityNorth} mm/yr</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-1">
                  <span>Velocity East:</span>
                  <span className="font-bold text-slate-850 dark:text-white">+{gnssStation.velocityEast} mm/yr</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-1">
                  <span>Velocity Vertical:</span>
                  <span className={`font-bold ${gnssStation.velocityUp >= 0 ? "text-emerald-600" : "text-red-500"}`}>{gnssStation.velocityUp >= 0 ? "+" : ""}{gnssStation.velocityUp} mm/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Manager:</span>
                  <span className="font-bold text-cyan-600 uppercase text-[9.5px]">{gnssStation.monitoredBy}</span>
                </div>
              </div>
            </div>

            {/* Column 3: Full Narrative Description */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">
                &mdash; Tectonic geodynamic context
              </span>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-300 dark:border-slate-800 italic leading-relaxed text-slate-600 dark:text-slate-350">
                "{gnssStation.description}"
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 not-italic text-[10.5px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified by Geodesy and Geodynamics Division. Station linked to IGS network.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  return (
    <div id="comet_station_portal_view" className="space-y-6 animate-fade-in font-sans">
      
      {/* SECTION A: HEADER & BACK ACTUATOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 rounded-2xl shadow-xs transition-all">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-md border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all shrink-0 bg-white dark:bg-slate-900 shadow-xs"
            title="Return to Mapping Control Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-wider font-extrabold text-blue-600 uppercase flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                COMET Space-Geodesy Portal
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-[10px] font-mono text-slate-550 dark:text-slate-450 uppercase font-bold">STATION PROFILE: {details.id.toUpperCase()}</span>
            </div>
            
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
              {item.type === "volcano" ? (
                <Flame className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <Activity className="w-5 h-5 text-teal-500 shrink-0" />
              )}
              {name}
            </h1>
          </div>
        </div>

        {/* Dynamic Severity indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[9px] font-mono font-bold uppercase block text-slate-400">Regional Authority</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ESSGI Tectonic Division</span>
          </div>
          
          <div className={`px-3 py-1.5 rounded-md border flex items-center gap-2 font-display bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-750 dark:text-slate-200 shadow-xs`}>
            <span className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse`} style={{ backgroundColor: severity === "Red" ? "#dc2626" : severity === "Orange" ? "#ea580c" : severity === "Yellow" ? "#ca8a04" : "#16a34a" }} />
            <div className="text-left font-sans">
              <div className="text-[9px] font-mono uppercase font-black leading-none text-slate-500">Alert Status</div>
              <div className="text-xs font-black uppercase tracking-wide mt-0.5" style={{ color: severity === "Red" ? "#dc2626" : severity === "Orange" ? "#ea580c" : severity === "Yellow" ? "#ca8a04" : "#16a34a" }}>{severity} Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* ASSIGNED SEISMIC MONITORING NODE TELEMETRY BANNER */}
      {nodeTelemetry && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-925 to-blue-950 border border-cyan-500/30 p-4 rounded-2xl shadow-md space-y-3 font-sans text-white">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-black text-cyan-300 uppercase tracking-wider">
                RETRIEVED SEISMIC NODE TELEMETRY: {nodeTelemetry.nodeCode}
              </span>
            </div>
            <span className="text-[9.5px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono px-2 py-0.5 rounded font-extrabold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              100Hz BROADBAND STREAM ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[9px] block uppercase font-bold">Station Node Name</span>
              <span className="font-bold text-white text-xs truncate block">{nodeTelemetry.nodeName}</span>
              <span className="text-[8.5px] text-cyan-400 block font-normal">{nodeTelemetry.nodeRegion}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[9px] block uppercase font-bold">Epicenter Distance</span>
              <span className="font-extrabold text-cyan-400 text-xs">{nodeTelemetry.distanceKm} km</span>
              <span className="text-[8.5px] text-slate-400 block font-normal">Direct Ray path</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[9px] block uppercase font-bold">Wave Arrivals</span>
              <span className="font-bold text-amber-400 text-xs">P: +{nodeTelemetry.pWaveTravelSec}s | S: +{nodeTelemetry.sWaveTravelSec}s</span>
              <span className="text-[8.5px] text-slate-400 block font-normal">S-P delay: {(parseFloat(nodeTelemetry.sWaveTravelSec) - parseFloat(nodeTelemetry.pWaveTravelSec)).toFixed(1)}s</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[9px] block uppercase font-bold">Peak Acceleration (PGA)</span>
              <span className="font-bold text-rose-400 text-xs">{nodeTelemetry.pga} g</span>
              <span className="text-[8.5px] text-amber-300 block font-normal">Intensity: {nodeTelemetry.mmi}</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: TIME-SPAN NAVIGATOR & INCREASING/DECREASING TREND WARNING BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Trend Indicator Panel (Takes 2 Columns on large screen for prominence) */}
        <div className="lg:col-span-2 bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600 animate-[spin_5s_linear_infinite]" />
                COMET Real-Time Trend Analyzer
              </span>
              <div className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Active Span: Last {timeSpan === "7d" ? "7 Days" : timeSpan === "30d" ? "30 Days" : "90 Days"}
              </div>
            </div>

            {/* Large Trend Banner: Increasing vs Decreasing */}
            <div className={`p-4 rounded-xl border flex items-start gap-4 ${
              data.isIncreasing 
                ? "bg-red-50 dark:bg-red-950/20 border-red-200/60 text-red-900 dark:text-red-300" 
                : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60 text-emerald-900 dark:text-emerald-300"
            }`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${
                data.isIncreasing ? "bg-red-100 dark:bg-red-950/40 text-red-600" : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
              }`}>
                {data.isIncreasing ? (
                  <TrendingUp className="w-6 h-6 animate-[bounce_1.5s_infinite]" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  {data.isIncreasing ? "CRITICAL RIFT INTRUSION ACTIVE" : "CRUSTAL EQUILIBRIUM MONITORING"}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black font-mono ${
                    data.isIncreasing ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                  }`}>
                    {data.isIncreasing ? "INCREASING TREND" : "DECREASING TREND"}
                  </span>
                </h3>
                
                <p className="text-[12px] leading-relaxed opacity-90 font-sans">
                  {item.type === "volcano" ? (
                    data.isIncreasing ? (
                      `Satellite geodetic radar confirms active ground inflation at ${name} Caldera, with deformation tilting up by +${data.defPercent.toFixed(1)}% over the selected time window. Plume degassing rates have surged, indicating shallow magma emplacement.`
                    ) : (
                      `Thermal cameras and ground sensors record safe fumarolic venting at ${name}. Magmatic inflation remains low, with a reassuring deflection rate of ${data.defDiff.toFixed(2)} cm (${data.defPercent.toFixed(1)}% deformation variance), signifying a cooling, dormant magmatic chamber.`
                    )
                  ) : (
                    data.isIncreasing ? (
                      `Seismographic array counts show significant stress-release cascades near ${name}, with cumulative secondary shock events up by +${Math.abs(data.gasPercent).toFixed(1)}%. Stress along local rift faults continues to accumulate.`
                    ) : (
                      `Seismic stress release at ${name} has decelerated by ${Math.abs(data.gasPercent).toFixed(1)}% following the primary seismic event. Energy transfer across local fault lines is safely decaying into tectonic stabilization.`
                    )
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-left">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 block">Ground Deflection</span>
              <span className={`text-sm font-black font-mono ${data.isIncreasing ? 'text-red-600' : 'text-emerald-600'}`}>
                {data.lastDef.toFixed(2)} cm
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 block">Deformation Rate</span>
              <span className={`text-sm font-black font-mono flex items-center gap-0.5 ${data.isIncreasing ? 'text-red-600' : 'text-emerald-600'}`}>
                {data.isIncreasing ? "+" : ""}{data.defPercent.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 block">{item.type === "volcano" ? "Gas Plume SO2" : "Seismic Energy"}</span>
              <span className="text-sm font-black font-mono text-slate-700 dark:text-slate-300">
                {data.lastGas} {item.type === "volcano" ? "t/d" : "kJ"}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 block">Daily Swarms</span>
              <span className="text-sm font-black font-mono text-slate-700 dark:text-slate-300">
                {data.lastTremor} events
              </span>
            </div>
          </div>
        </div>

        {/* Time Span selection & Physical Coordinates Card */}
        <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all">
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400 block">
              Tectonic Span Controls
            </span>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-350 block font-sans">
                Select COMET Observations window:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "7d", label: "7 Days" },
                  { id: "30d", label: "30 Days" },
                  { id: "90d", label: "90 Days" }
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTimeSpan(opt.id)}
                    className={`text-xs font-bold py-2 px-2.5 rounded-md border transition-all cursor-pointer ${
                      timeSpan === opt.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-3.5 space-y-2">
              <span className="text-[9px] font-mono font-bold uppercase block text-slate-400">Geodetic Location Coordinates</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md">
                  <span className="text-[9px] font-mono text-slate-500 block">Latitude</span>
                  <span className="font-bold text-slate-800 dark:text-white font-mono">{(details as any).coordinates[0].toFixed(5)}°N</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md">
                  <span className="text-[9px] font-mono text-slate-500 block">Longitude</span>
                  <span className="font-bold text-slate-800 dark:text-white font-mono">{(details as any).coordinates[1].toFixed(5)}°E</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/5 pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono">Sensor Link Status</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              TELEMETRY LIVE
            </span>
          </div>
        </div>
      </div>

      {/* GOOGLE EARTH 3D SATELLITE INTEGRATION */}
      <GoogleEarth3DControlPanel
        lat={(details as any).coordinates[0]}
        lng={(details as any).coordinates[1]}
        name={name}
        type={item.type}
        details={details}
        timesrate={`Net: ${(data.lastDef - (data.deformationData[0]?.value || 0)).toFixed(1)} cm`}
      />

      {/* SECTION C: COMET OBSERVATIONS TIME-SERIES GRAPHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderSvgAreaChart(
          data.deformationData, 
          "InSAR Ground Deformation", 
          "Displacement (cm)", 
          "#3b82f6", 
          "#3b82f6"
        )}

        {renderSvgAreaChart(
          data.gasData, 
          item.type === "volcano" ? "Plume Sulfur Dioxide Flux" : "Seismic Amplitude Peak", 
          item.type === "volcano" ? "SO2 tons/day" : "Amplitude (mm/s)", 
          severity === "Red" ? "#ef4444" : "#f97316", 
          severity === "Red" ? "#ef4444" : "#f97316"
        )}

        {renderSvgAreaChart(
          data.tremorData, 
          item.type === "volcano" ? "Volcanic Tremor Counts" : "Aftershocks Occurrence", 
          "Daily Events count", 
          "#ca8a04", 
          "#ca8a04"
        )}
      </div>

      {/* LICSBAS INSAR ERA5 + DEM ERROR CORRECTION MODULE */}
      <LicsbasInSARPanel stationName={name} location={subName} />

      {/* SECTION D: EVERY DESCRIPTION & EXTENDED STATION ANALYSIS */}
      <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-6 shadow-xs space-y-6 transition-all">
        <div className="border-b border-slate-200 dark:border-white/5 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            Complete Geological nature & Station advisory metadata
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-600 dark:text-slate-350">
          
          {/* Column 1: Station Identification */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">
              &mdash; Station Identification
            </span>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800">
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">Tectonic Feature</span>
                <span className="font-extrabold text-slate-800 dark:text-white">{name}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">Tectonic Classification</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{item.type === "volcano" ? (details as Volcano).type : "Seismographic Array Epicenter"}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">Observation Region</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{subName}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">{item.type === "volcano" ? "Peak Caldera Elevation" : "Focal Point Depth"}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {item.type === "volcano" ? `${(details as Volcano).elevation} meters above sea level` : `${(details as Earthquake).depth} km below surface`}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Activity Log & Operational Network */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">
              &mdash; Activity & Monitor Log
            </span>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800">
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">Activity Regime / Signature</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{item.type === "volcano" ? (details as Volcano).activityType : "Transpressional Rift Fault Slip"}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">{item.type === "volcano" ? "Last Eruptive Period" : "UTC Alert Timestamp"}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {item.type === "volcano" ? (details as Volcano).lastErupted : new Date((details as Earthquake).dateTime).toUTCString()}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">ESSGI Operational Center</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{item.type === "volcano" ? (details as Volcano).monitoredBy : "Addis Ababa Seismic Monitoring Center"}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block">Advisory Level</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{severity === "Red" ? "Critical Warning Level Red" : severity === "Orange" ? "Advisory Level Orange" : "Monitoring Level Green/Yellow"}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Full Narrative Description */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block">
              &mdash; Geological Narrative
            </span>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-300 dark:border-slate-800 italic leading-relaxed text-slate-600 dark:text-slate-350">
              "{details.description}"
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 not-italic text-[10.5px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified by ESSGI Geodesy Command. Data parsed via COMET network.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
