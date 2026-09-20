import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { Volcano, Earthquake, SeverityLevel, SelectedItem, GnssStation } from "../../types";
import { ETHIOPIA_ACTIVE_ZONES } from "../../data/volcanoes";
import { ETHIOPIA_GNSS_STATIONS } from "../../data/earthquakes";
import { EarthquakeDetailPanel } from "./EarthquakeDetailPanel";
import GnssChartPanel from "./GnssChartPanel";
import { InteractiveLicsbasViewer } from "./InteractiveLicsbasViewer";
import { AnimatePresence } from "motion/react";
import {
  Layers,
  Map as MapIcon,
  Compass,
  Flame,
  Globe,
  Maximize2,
  Minimize2,
  Sliders,
  Navigation,
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  ChevronLeft,
  Activity,
  MapPin,
  Info,
  Radio,
  X
} from "lucide-react";

import ertaAleLava from "../../assets/images/Erta-ale-lava.jpg";
import dallolSprings from "../../assets/images/dallol.jpg";
import volcanicRiskBg from "../../assets/images/Volcanic-sesmic-risk.jpg";
import earthquakeHazardBg from "../../assets/images/earthquake-hazard.jpg";
import entotoObservatory from "../../assets/images/entoto.jpg";
import volcanicHazardBg from "../../assets/images/Volcanic-hazard.jpg";
import earthObservation from "../../assets/images/earthobservation.jpg";

// Dynamic geophysics image lookup
function getGeoImage(item: any, type: "volcano" | "earthquake" | "gnss"): string {
  if (type === "volcano") {
    const name = (item.name || "").toLowerCase();
    if (name.includes("erta")) return ertaAleLava;
    if (name.includes("dallol")) return dallolSprings;
    if (name.includes("fentale")) return volcanicRiskBg;
    if (name.includes("dabbahu")) return volcanicHazardBg;
    return entotoObservatory;
  } else if (type === "earthquake") {
    return earthquakeHazardBg;
  } else {
    return earthObservation;
  }
}

export type MapLayerStyle = "street" | "satellite" | "geological" | "googleEarth" | "googleEarthHybrid";

interface GeologyMapProps {
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
  selectedItem: SelectedItem | null;
  onSelectItem: (item: SelectedItem | null) => void;
  onOpenCometPortal?: (item: SelectedItem) => void;
  externalMapStyle?: MapLayerStyle;
  onMapStyleChange?: (style: MapLayerStyle) => void;
  is3DActive?: boolean;
  onTriggerSmartAlert?: (earthquake: Earthquake) => void;
}

// Deterministic activity trend generation representing the last 24 hours based on actual data
function getDeterministicTrend24h(item: any, type: "volcano" | "earthquake"): number[] {
  const id = item.id;
  const severity = item.severity;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const values: number[] = [];
  const pointsCount = 24;

  if (type === "earthquake") {
    const mag = item.magnitude || 4.0;
    const peakHour = 16;
    const peakVal = (mag / 9.5) * 85 + 15;

    for (let i = 0; i < pointsCount; i++) {
      if (i < peakHour) {
        const noise = Math.abs(Math.sin(hash + i * 2.3) * Math.cos(hash * 0.5 - i * 1.1)) * 12 + 4;
        values.push(noise);
      } else if (i === peakHour) {
        values.push(peakVal);
      } else {
        const hoursSincePeak = i - peakHour;
        const decayBase = peakVal * Math.exp(-hoursSincePeak * 0.35);
        const aftershockPulse = Math.abs(Math.sin(hash + i * 1.7) * Math.cos(hash * 0.3 - i * 1.9)) * (15 / hoursSincePeak);
        values.push(Math.max(4, decayBase + aftershockPulse));
      }
    }
  } else {
    const baseValues: Record<SeverityLevel, number> = {
      Red: 75,
      Orange: 50,
      Yellow: 25,
      Green: 10,
    };
    const base = baseValues[severity as SeverityLevel] || 15;

    for (let i = 0; i < pointsCount; i++) {
      const slowWave = Math.sin(hash + i * 0.4) * 15;
      const fastTremor = Math.cos(hash * 1.3 - i * 1.8) * (severity === "Red" ? 18 : severity === "Orange" ? 12 : severity === "Yellow" ? 6 : 2);
      
      let val = base + slowWave + fastTremor;

      if (severity === "Green") {
        val = Math.max(3, Math.min(15, val));
      } else if (severity === "Red") {
        val = Math.max(20, val + (i * 0.6));
      }

      values.push(Math.max(2, Math.min(98, val)));
    }
  }
  return values;
}

// Generate an elegant, highly polished SVG sparkline for the last 24 hours as an HTML string
function generateSparklineSvg(item: any, type: "volcano" | "earthquake"): string {
  const points = getDeterministicTrend24h(item, type);
  const severity = item.severity as SeverityLevel;
  const width = 185;
  const height = 40;
  const padding = 3;
  
  const colors: Record<SeverityLevel, { stroke: string; stop: string }> = {
    Red: { stroke: "#f43f5e", stop: "rgba(244,63,94,0.3)" },
    Orange: { stroke: "#fb923c", stop: "rgba(251,146,60,0.3)" },
    Yellow: { stroke: "#facc15", stop: "rgba(250,204,21,0.3)" },
    Green: { stroke: "#4ade80", stop: "rgba(74,222,128,0.3)" },
  };
  
  const color = colors[severity as SeverityLevel] || colors.Green;
  
  const coords = points.map((val, i) => {
    const x = (i / (points.length - 1)) * (width - 2 * padding) + padding;
    const y = height - (val / 100) * (height - 2 * padding) - padding;
    return { x, y };
  });
  
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    pathD += ` L ${coords[i].x} ${coords[i].y}`;
  }
  
  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;
  const lastCoord = coords[coords.length - 1];
  const lastVal = points[points.length - 1];
  
  let metricLabel = "";
  let sparkTitle = "";
  if (type === "volcano") {
    const tilt = (lastVal * 0.15 + 1.2).toFixed(1);
    metricLabel = `${tilt} µrad`;
    sparkTitle = "24h Volcanic Tilt";
  } else {
    const pga = (lastVal * 0.004 + 0.02).toFixed(3);
    metricLabel = `${pga}g PGA`;
    sparkTitle = "24h Seismic Accel";
  }

  return `
    <div class="flex flex-col gap-1 mt-2.5 pt-2 border-t border-dashed border-slate-150 dark:border-slate-800/40">
      <div class="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        <span>${sparkTitle}</span>
        <span class="text-slate-700 dark:text-slate-300 font-extrabold font-mono flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          ${metricLabel}
        </span>
      </div>
      <div class="relative h-10 flex items-center justify-center">
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="overflow-visible">
          <defs>
            <linearGradient id="grad-${item.id}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${color.stroke}" stop-opacity="0.3" />
              <stop offset="100%" stop-color="${color.stroke}" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="${height/2}" x2="${width}" y2="${height/2}" stroke="rgba(148,163,184,0.12)" stroke-width="0.75" stroke-dasharray="2,2" />
          <line x1="0" y1="${height - 2}" x2="${width}" y2="${height - 2}" stroke="rgba(148,163,184,0.15)" stroke-width="0.75" />
          
          <path d="${fillD}" fill="url(#grad-${item.id})" />
          <path d="${pathD}" fill="none" stroke="${color.stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          
          <circle cx="${lastCoord.x}" cy="${lastCoord.y}" r="2.5" fill="${color.stroke}" />
          <circle cx="${lastCoord.x}" cy="${lastCoord.y}" r="4.5" fill="none" stroke="${color.stroke}" stroke-width="1" class="animate-pulse" style="opacity: 0.75" />
        </svg>
      </div>
      <div class="flex justify-between text-[7px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
        <span>-24 hours</span>
        <span>Now (0h)</span>
      </div>
    </div>
  `;
}

const REGIONAL_NODES_MAP = [
  { code: "ET.TURM", name: "Turmi Seismic Station (South Omo Rift)", coords: [4.972, 36.486] as [number, number], region: "South Omo" },
  { code: "DJ.ARTA", name: "Arta Geophysical Observatory", coords: [11.524, 42.845] as [number, number], region: "Gulf of Aden" },
  { code: "ET.AWAS", name: "Awash Rift Station (Fentale Zone)", coords: [8.989, 40.165] as [number, number], region: "Fentale / Metehara" },
  { code: "ET.SEME", name: "Semera Rift Station (Afar)", coords: [11.792, 41.005] as [number, number], region: "Afar Triple Junction" },
  { code: "IU.FURI", name: "Entoto Geophysical Observatory (Addis)", coords: [9.035, 38.767] as [number, number], region: "Central Plateau" },
  { code: "ET.ANTE", name: "Arba Minch Station (Chamo Graben)", coords: [6.028, 37.562] as [number, number], region: "Southern Rift" },
  { code: "ET.HAWA", name: "Hawassa Basin Station (Awassa Sector)", coords: [7.049, 38.485] as [number, number], region: "Hawassa Basin" },
  { code: "ET.DIRE", name: "Dire Dawa Escarpment Station", coords: [9.593, 41.862] as [number, number], region: "Eastern Escarpment" },
  { code: "ET.MEKE", name: "Mekelle Plateau Station (Tigray)", coords: [13.496, 39.471] as [number, number], region: "Northern Plateau" },
  { code: "ET.BARD", name: "Bahir Dar Station (Lake Tana)", coords: [11.595, 37.388] as [number, number], region: "Tana Shield" },
  { code: "ET.DANA", name: "Danakil Hydrothermal Station (Dallol Salt Graben)", coords: [14.242, 40.298] as [number, number], region: "Danakil Depression" },
  { code: "ER.ASMA", name: "Asmara Seismic Station (Eritrea)", coords: [15.322, 38.925] as [number, number], region: "Red Sea Escarpment" },
  { code: "SO.BOSA", name: "Bosaso Station (Gulf of Aden)", coords: [11.284, 49.181] as [number, number], region: "Somali Coast" }
];

function getNearestNodeForCoords(lat: number, lng: number) {
  let closest = REGIONAL_NODES_MAP[0];
  let minDistance = Infinity;

  for (const node of REGIONAL_NODES_MAP) {
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

  return {
    code: closest.code,
    name: closest.name,
    distKm: Math.round(minDistance * 10) / 10
  };
}

// Generate a beautifully structured, premium summary panel matching the dashboard metric cards
function generateStationTooltipHtml(item: any, type: "volcano" | "earthquake"): string {
  const isVolcanic = type === "volcano";
  const severity = item.severity as SeverityLevel;
  
  const severityConfig: Record<SeverityLevel, { border: string; bg: string; text: string; dot: string }> = {
    Red: {
      border: "border-rose-500",
      bg: "bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      dot: "bg-rose-500"
    },
    Orange: {
      border: "border-orange-500",
      bg: "bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
      dot: "bg-orange-500"
    },
    Yellow: {
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500"
    },
    Green: {
      border: "border-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500"
    }
  };

  const colors = severityConfig[severity] || severityConfig.Green;
  const name = isVolcanic ? `${item.name} Caldera` : item.location.split(",")[0];
  const stationId = isVolcanic ? `VOL-${item.id.replace("vol_", "")}` : `EQ-${item.id.replace("eq_", "")}`;

  const iconSvg = isVolcanic
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;

  const watermarkSvg = isVolcanic
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-100 dark:text-slate-900/60 opacity-20 absolute -right-3 -top-3 pointer-events-none transform rotate-12"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-100 dark:text-slate-900/60 opacity-20 absolute -right-3 -top-3 pointer-events-none transform rotate-12"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;

  const gridHtml = isVolcanic
    ? `
      <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-sans border-t border-b border-slate-100 dark:border-slate-800/60 py-1.5 my-1.5">
        <div>
          <span class="text-slate-400 dark:text-slate-500 block font-mono text-[8px] uppercase">ELEVATION</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">${item.elevation} m</span>
        </div>
        <div>
          <span class="text-slate-400 dark:text-slate-500 block font-mono text-[8px] uppercase">TYPE</span>
          <span class="font-bold text-slate-700 dark:text-slate-300 truncate block max-w-[90px]" title="${item.type}">${item.type}</span>
        </div>
        <div class="col-span-2 pt-0.5">
          <span class="text-slate-400 dark:text-slate-500 block font-mono text-[8px] uppercase">CURRENT STATUS</span>
          <span class="font-bold text-slate-700 dark:text-slate-300 truncate block">${item.activityType}</span>
        </div>
      </div>
    `
    : `
      <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-sans border-t border-b border-slate-100 dark:border-slate-800/60 py-1.5 my-1.5">
        <div>
          <span class="text-slate-400 dark:text-slate-500 block font-mono text-[8px] uppercase">MAGNITUDE</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">M ${item.magnitude.toFixed(1)}</span>
        </div>
        <div>
          <span class="text-slate-400 dark:text-slate-500 block font-mono text-[8px] uppercase">FOCAL DEPTH</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">${item.depth} km</span>
        </div>
        <div class="col-span-2 pt-0.5">
          <span class="text-slate-400 dark:text-slate-500 block font-mono text-[8px] uppercase">LOCATION STATION</span>
          <span class="font-bold text-slate-700 dark:text-slate-300 truncate block text-[9.5px]" title="${item.location}">${item.location}</span>
        </div>
        <div class="col-span-2 pt-0.5 border-t border-slate-100 dark:border-slate-800/60 mt-1">
          <span class="text-slate-400 dark:text-slate-500 block font-mono text-[8px] uppercase">GEOLOGICAL DESCRIPTION</span>
          <p class="text-slate-500 dark:text-slate-400 italic text-[9px] leading-snug m-0">${item.description}</p>
        </div>
      </div>
    `;

  return `
    <div class="relative w-[215px] text-slate-800 dark:text-slate-100 font-sans flex flex-col justify-between overflow-hidden pointer-events-none select-none">
      ${watermarkSvg}

      <div class="flex items-center justify-between gap-1 mb-1.5">
        <div class="flex items-center gap-1.5">
          <span class="p-1 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
            ${iconSvg}
          </span>
          <span class="text-[8px] font-mono tracking-wider uppercase font-extrabold text-slate-500 dark:text-slate-400">
            ${isVolcanic ? "Volcanic Station" : "Seismic Recorder"}
          </span>
        </div>
        <span class="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500">${stationId}</span>
      </div>

      <div class="space-y-0.5">
        <div class="flex items-center justify-between gap-1">
          <h4 class="font-extrabold text-[12.5px] text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-[130px]" title="${name}">
            ${name}
          </h4>
          <span class="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} uppercase shrink-0">
            ${severity}
          </span>
        </div>
        
        <div class="flex items-center gap-1 text-[8px] font-mono text-emerald-500 mt-1">
          <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block shrink-0"></span>
          <span>TELEMETRY ONLINE &bull; LIVE FEED</span>
        </div>
      </div>

      ${gridHtml}

      ${generateSparklineSvg(item, type)}

      <div class="flex items-center justify-between text-[8px] font-mono text-slate-400 dark:text-slate-500 pt-1 mt-1 border-t border-dashed border-slate-150 dark:border-slate-800/40">
        <span>Region: ${isVolcanic ? item.region.split(",")[0] : "Ethiopia Rift"}</span>
        <span>ESSGI GIS Core</span>
      </div>
    </div>
  `;
}

const getGnssElevation = (st: GnssStation): number => {
  if (st.id === "gnss_adis") return 2442;
  if (st.id === "gnss_seme") return 412;
  if (st.id === "gnss_ante") return 1285;
  if (st.id === "gnss_bard") return 1801;
  if (st.id === "gnss_gond") return 2133;
  if (st.id === "gnss_hara") return 1885;
  if (st.id === "gnss_meke") return 2084;
  if (st.id === "gnss_hawa") return 1708;
  if (st.id === "gnss_jimm") return 1780;
  if (st.id === "gnss_dess") return 2470;
  if (st.id === "gnss_dire") return 1276;
  if (st.id === "gnss_awas") return 1004;
  if (st.id === "gnss_jigj") return 1609;
  if (st.id === "gnss_shas") return 1935;
  if (st.id === "gnss_lali") return 2500;
  if (st.id === "gnss_adam") return 1620;
  if (st.id === "gnss_sodo") return 1890;
  if (st.id === "gnss_neke") return 2080;
  return 1200; // default
};

const renderSidebarGnssChart = (st: GnssStation) => {
  const years = 10;
  const pointsN: { x: number; y: number; val: number }[] = [];
  const pointsE: { x: number; y: number; val: number }[] = [];
  
  const vN = st.velocityNorth;
  const vE = st.velocityEast;
  const maxDisplacement = Math.max(Math.abs(vN) * years, Math.abs(vE) * years, 1) * 1.1;
  
  const width = 400;
  const height = 120;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 12;
  const paddingBottom = 22;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  for (let i = 0; i <= years; i++) {
    const x = paddingLeft + (i / years) * chartWidth;
    const nVal = i * vN + Math.sin(i * 1.5) * 1.5;
    const eVal = i * vE + Math.cos(i * 1.5) * 1.5;
    
    const yN = paddingTop + chartHeight - (nVal / maxDisplacement) * chartHeight;
    const yE = paddingTop + chartHeight - (eVal / maxDisplacement) * chartHeight;
    
    pointsN.push({ x, y: yN, val: nVal });
    pointsE.push({ x, y: yE, val: eVal });
  }
  
  const nPoly = pointsN.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const ePoly = pointsE.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 font-sans w-full">
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
        <span className="font-bold">📊 10-Year Cumulative Geodetic Drift</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span>
            North
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-indigo-400 inline-block"></span>
            East
          </span>
        </span>
      </div>
      
      <div className="relative h-[120px] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const y = paddingTop + chartHeight * (1 - frac);
            const valLabel = (frac * maxDisplacement).toFixed(0);
            return (
              <g key={idx}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#1e293b" 
                  strokeDasharray="2,2" 
                  strokeWidth="0.8" 
                />
                <text 
                  x={paddingLeft - 5} 
                  y={y + 2.5} 
                  fill="#475569" 
                  fontSize="7.5" 
                  fontFamily="monospace" 
                  textAnchor="end"
                >
                  {valLabel}mm
                </text>
              </g>
            );
          })}
          
          {/* Vertical Grid lines */}
          {[0, 2, 4, 6, 8, 10].map((yr, idx) => {
            const x = paddingLeft + (yr / years) * chartWidth;
            return (
              <g key={idx}>
                <line 
                  x1={x} 
                  y1={paddingTop} 
                  x2={x} 
                  y2={paddingTop + chartHeight} 
                  stroke="#1e293b" 
                  strokeDasharray="2,2" 
                  strokeWidth="0.8" 
                />
                <text 
                  x={x} 
                  y={height - 5} 
                  fill="#475569" 
                  fontSize="7.5" 
                  fontFamily="monospace" 
                  textAnchor="middle"
                >
                  Yr{yr}
                </text>
              </g>
            );
          })}
          
          {/* Polyline Paths */}
          <polyline fill="none" stroke="#10b981" strokeWidth="2" points={nPoly} strokeLinecap="round" />
          <polyline fill="none" stroke="#6366f1" strokeWidth="2" points={ePoly} strokeLinecap="round" />
          
          {/* Node dots */}
          {pointsN.filter((_, idx) => idx % 2 === 0).map((p, idx) => (
            <circle key={`n-${idx}`} cx={p.x} cy={p.y} r="2.5" fill="#10b981" />
          ))}
          {pointsE.filter((_, idx) => idx % 2 === 0).map((p, idx) => (
            <circle key={`e-${idx}`} cx={p.x} cy={p.y} r="2.5" fill="#6366f1" />
          ))}
        </svg>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
        <div className="bg-slate-950/40 border border-slate-800/50 p-2 rounded-xl text-center">
          <span className="text-slate-500 block">Total 10Y North Drift</span>
          <span className="font-extrabold text-emerald-400 text-xs">
            +{(st.velocityNorth * 10).toFixed(1)} mm
          </span>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/50 p-2 rounded-xl text-center">
          <span className="text-slate-500 block">Total 10Y East Drift</span>
          <span className="font-extrabold text-indigo-400 text-xs">
            +{(st.velocityEast * 10).toFixed(1)} mm
          </span>
        </div>
      </div>
    </div>
  );
};

export default function GeologyMap({
  volcanoes,
  earthquakes,
  selectedItem,
  onSelectItem,
  onOpenCometPortal,
  externalMapStyle,
  onMapStyleChange,
  is3DActive,
  onTriggerSmartAlert,
}: GeologyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const riftLineRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const pulseMarkerRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapLayerStyle>("googleEarthHybrid");
  const [is3DActiveState, setIs3DActiveState] = useState<boolean>(false);

  useEffect(() => {
    if (is3DActive !== undefined) {
      setIs3DActiveState(is3DActive);
    }
  }, [is3DActive]);

  useEffect(() => {
    if (externalMapStyle) {
      setMapStyle(externalMapStyle);
    }
  }, [externalMapStyle]);

  const handleMapStyleChange = (style: MapLayerStyle) => {
    setMapStyle(style);
    if (onMapStyleChange) {
      onMapStyleChange(style);
    }
  };
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const [showVolcanoes, setShowVolcanoes] = useState(true);
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [showBuffers, setShowBuffers] = useState(true);
  const [showRiftAxis, setShowRiftAxis] = useState(true);
  const [showGnss, setShowGnss] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showInsarOverlay, setShowInsarOverlay] = useState(false);
  const [showAdminRegions, setShowAdminRegions] = useState(false);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(100);

  // LiCSBAS InSAR Modal State
  const [showLicsbasModal, setShowLicsbasModal] = useState<boolean>(false);
  const [licsbasStationName, setLicsbasStationName] = useState<string>("Erta Ale Caldera");

  useEffect(() => {
    let intervalId: any = null;
    if (isTimelinePlaying) {
      intervalId = setInterval(() => {
        setTimelineProgress((prev) => {
          if (prev >= 100) {
            setIsTimelinePlaying(false);
            return 100;
          }
          return Math.min(100, prev + 2);
        });
      }, 200);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimelinePlaying]);

  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => {
      const next = !prev;
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 200);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"volcano" | "earthquake">("volcano");

  const filteredVolcanoes = useMemo(() => {
    return volcanoes.filter(v => 
      v.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
      v.region.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      v.type.toLowerCase().includes(sidebarSearch.toLowerCase())
    );
  }, [volcanoes, sidebarSearch]);

  const filteredEarthquakes = useMemo(() => {
    return earthquakes.filter(eq => 
      eq.location.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
      eq.description.toLowerCase().includes(sidebarSearch.toLowerCase())
    );
  }, [earthquakes, sidebarSearch]);

  const animatedEarthquakes = useMemo(() => {
    const baseEqs = filteredEarthquakes;
    if (timelineProgress === 100) return baseEqs;
    const startDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const cutoffTime = startDate + (timelineProgress / 100) * (Date.now() - startDate);
    return baseEqs.filter((eq) => new Date(eq.dateTime).getTime() <= cutoffTime);
  }, [filteredEarthquakes, timelineProgress]);

  const [inspectNode, setInspectNode] = useState<{
    type: "volcano" | "earthquake" | "gnss";
    item: any;
  } | null>(null);

  const presets = [
    { name: "Ethiopia Overview", coords: [9.145, 40.4896], zoom: 6 },
    { name: "Afar Triple Junction", coords: [11.75, 41.50], zoom: 8 },
    { name: "Danakil Depression (Dallol)", coords: [14.24, 40.30], zoom: 9 },
    { name: "Erta Ale Lava Lake", coords: [13.60, 40.67], zoom: 10 },
    { name: "Fentale Mount (Awash)", coords: [8.97, 39.90], zoom: 10 },
    { name: "Hawassa Basin (Awassa)", coords: [7.05, 38.48], zoom: 10 },
    { name: "Turmi Rift (South Omo)", coords: [4.97, 36.48], zoom: 10 },
    { name: "Main Ethiopian Rift (MER)", coords: [8.2, 38.9], zoom: 7.5 },
  ];

  const riftPoints: [number, number][] = [
    [4.8, 36.1],
    [5.6, 37.4],
    [6.2, 37.8],
    [6.9, 38.2],
    [7.7, 38.7],
    [8.3, 39.0],
    [8.97, 39.9],
    [9.7, 40.4],
    [10.5, 40.8],
    [11.6, 41.2],
    [12.6, 40.5],
    [13.6, 40.67],
    [14.3, 40.3]
  ];

  const mapStyles: Record<MapLayerStyle, { url: string; attribution: string }> = {
    geological: {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, and the GIS User Community'
    },
    googleEarth: {
      url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      attribution: 'Map data &copy;2026 Google Earth Satellite Imagery'
    },
    googleEarthHybrid: {
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      attribution: 'Map data &copy;2026 Google Earth Hybrid Imagery'
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const leafletLib = L || (typeof window !== "undefined" && (window as any).L);
    if (!leafletLib) {
      return;
    }

    const ethiopiaCenter: [number, number] = [9.145, 40.4896];
    const initialZoom = 6;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    try {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
        minZoom: 5.5,
        maxZoom: 14,
        maxBounds: [[3.0, 32.5], [15.2, 48.5]],
        maxBoundsViscosity: 1.0,
      }).setView(ethiopiaCenter, initialZoom);

      mapRef.current = map;
      setMapLoaded(true);

      // Add 'Reset View' custom control button to Leaflet's zoom control group
      setTimeout(() => {
        if (!containerRef.current) return;
        const zoomContainer = containerRef.current.querySelector('.leaflet-control-zoom');
        if (zoomContainer && !zoomContainer.querySelector('.leaflet-control-zoom-reset')) {
          const resetBtn = document.createElement('a');
          resetBtn.className = 'leaflet-control-zoom-reset';
          resetBtn.href = '#';
          resetBtn.title = 'Reset View to Ethiopia';
          resetBtn.role = 'button';
          resetBtn.ariaLabel = 'Reset View';
          
          resetBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw" style="display: block; margin: auto;">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          `;
          
          resetBtn.style.display = 'flex';
          resetBtn.style.alignItems = 'center';
          resetBtn.style.justifyContent = 'center';
          resetBtn.style.cursor = 'pointer';
          resetBtn.style.width = '30px';
          resetBtn.style.height = '30px';
          resetBtn.style.lineHeight = '30px';
          resetBtn.style.backgroundColor = '#ffffff';
          resetBtn.style.borderTop = '1px solid #ccc';
          resetBtn.style.color = '#333333';
          resetBtn.style.transition = 'background-color 0.15s ease, color 0.15s ease';

          if (document.documentElement.classList.contains('dark')) {
            resetBtn.style.backgroundColor = '#1e293b';
            resetBtn.style.color = '#f1f5f9';
            resetBtn.style.borderTop = '1px solid #334155';
          }

          const zoomOut = zoomContainer.querySelector('.leaflet-control-zoom-out') as HTMLElement;
          if (zoomOut) {
            zoomOut.style.borderBottomLeftRadius = '0px';
            zoomOut.style.borderBottomRightRadius = '0px';
          }
          resetBtn.style.borderBottomLeftRadius = '4px';
          resetBtn.style.borderBottomRightRadius = '4px';

          L.DomEvent.disableClickPropagation(resetBtn);

          resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            map.setView(ethiopiaCenter, initialZoom);
          });

          resetBtn.addEventListener('mouseenter', () => {
            if (document.documentElement.classList.contains('dark')) {
              resetBtn.style.backgroundColor = '#334155';
            } else {
              resetBtn.style.backgroundColor = '#f4f4f5';
            }
          });
          resetBtn.addEventListener('mouseleave', () => {
            if (document.documentElement.classList.contains('dark')) {
              resetBtn.style.backgroundColor = '#1e293b';
            } else {
              resetBtn.style.backgroundColor = '#ffffff';
            }
          });

          zoomContainer.appendChild(resetBtn);
        }
      }, 150);
    } catch {
      // Map creation handled gracefully
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapRef.current;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const activeStyle = mapStyle === "geological"
      ? {
          url: isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution: mapStyles.geological.attribution
        }
      : mapStyles[mapStyle];

    tileLayerRef.current = L.tileLayer(activeStyle.url, {
      maxZoom: 18,
    }).addTo(map);

  }, [mapStyle, mapLoaded, isDark]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const handleMouseMove = (e: any) => {
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on("mousemove", handleMouseMove);
    return () => {
      map.off("mousemove", handleMouseMove);
    };
  }, [mapLoaded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePopupClick = (e: any) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const licsBtn = target.closest(".licsbas-portal-trigger-btn");
      if (licsBtn) {
        const name = licsBtn.getAttribute("data-name") || licsBtn.getAttribute("data-id") || "Erta Ale Caldera";
        setLicsbasStationName(name);
        setShowLicsbasModal(true);
        return;
      }

      const btn = target.closest(".comet-portal-trigger-btn");
      if (btn && onOpenCometPortal) {
        const type = btn.getAttribute("data-type") as "volcano" | "earthquake" | "gnss";
        const id = btn.getAttribute("data-id") || "";
        if (type && id) {
          onOpenCometPortal({ type: type as any, id });
        }
      }

      const imgInspect = target.closest(".popup-image-inspect-trigger");
      if (imgInspect) {
        const type = imgInspect.getAttribute("data-type") as "volcano" | "earthquake" | "gnss";
        const id = imgInspect.getAttribute("data-id") || "";
        if (type && id) {
          let foundItem: any = null;
          if (type === "volcano") {
            foundItem = volcanoes.find(v => v.id === id);
          } else if (type === "earthquake") {
            foundItem = earthquakes.find(eq => eq.id === id);
          } else if (type === "gnss") {
            foundItem = ETHIOPIA_GNSS_STATIONS.find(st => st.id === id);
          }
          if (foundItem) {
            setInspectNode({ type, item: foundItem });
          }
        }
      }
    };

    container.addEventListener("click", handlePopupClick);

    // Bind click/touch listeners directly on the popup DOM when Leaflet opens it
    // to prevent propagation block issues on mobile/touch screens
    const map = mapRef.current;
    const onPopupOpen = (e: any) => {
      const popupEl = e.popup.getElement();
      if (popupEl) {
        popupEl.addEventListener("click", handlePopupClick);
        popupEl.addEventListener("touchend", handlePopupClick);
      }
    };

    if (mapLoaded && map) {
      map.on("popupopen", onPopupOpen);
    }

    return () => {
      container.removeEventListener("click", handlePopupClick);
      if (map) {
        map.off("popupopen", onPopupOpen);
      }
    };
  }, [mapLoaded, onOpenCometPortal, volcanoes, earthquakes]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const map = mapRef.current;

    markersRef.current.forEach((marker: any) => marker.remove());
    markersRef.current = [];

    if (riftLineRef.current) {
      riftLineRef.current.remove();
      riftLineRef.current = null;
    }

    const severityColors: Record<SeverityLevel, string> = {
      Red: "#dc2626",
      Orange: "#ea580c",
      Yellow: "#ca8a04",
      Green: "#16a34a",
    };

    if (showRiftAxis || mapStyle === "geological") {
      riftLineRef.current = L.polyline(riftPoints, {
        color: "#b91c1c",
        weight: mapStyle === "geological" ? 4 : 3,
        opacity: mapStyle === "geological" ? 0.85 : 0.65,
        dashArray: "6, 10",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);

      riftLineRef.current.bindTooltip(
        `<div class="px-1.5 py-0.5 font-sans font-bold text-red-700 text-[10.5px]">
          EAST AFRICAN RIFT FAULT AXIS (ACTIVE CONTINENTAL RIFT ZONE)
         </div>`,
        { sticky: true }
      );

      const westernEscarpment: [number, number][] = riftPoints.map(([lat, lng]) => [lat + 0.05, lng - 0.32]);
      const westLine = L.polyline(westernEscarpment, {
        color: "#ea580c",
        weight: 1.5,
        opacity: mapStyle === "geological" ? 0.75 : 0.45,
        dashArray: "2, 6",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);

      westLine.bindTooltip(
        `<div class="px-1.5 py-0.5 font-sans font-bold text-orange-700 text-[10px]">
          WESTERN MER ESCARPMENT FAULT CORRIDOR
         </div>`,
        { sticky: true }
      );
      markersRef.current.push(westLine);

      const easternEscarpment: [number, number][] = riftPoints.map(([lat, lng]) => [lat - 0.05, lng + 0.32]);
      const eastLine = L.polyline(easternEscarpment, {
        color: "#ea580c",
        weight: 1.5,
        opacity: mapStyle === "geological" ? 0.75 : 0.45,
        dashArray: "2, 6",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);

      eastLine.bindTooltip(
        `<div class="px-1.5 py-0.5 font-sans font-bold text-orange-700 text-[10px]">
          EASTERN BORDER FAULT SYSTEM
         </div>`,
        { sticky: true }
      );
      markersRef.current.push(eastLine);
    }

    if (showVolcanoes) {
      filteredVolcanoes.forEach((v) => {
        const color = severityColors[v.severity] || severityColors.Green;

        let bufferCircle: any = null;
        if (showBuffers) {
          bufferCircle = L.circle(v.coordinates, {
            color: color,
            fillColor: color,
            fillOpacity: 0.04,
            radius: 35000,
            weight: 1,
            dashArray: v.severity === "Red" ? "4 4" : "2 2",
          }).addTo(map);
          markersRef.current.push(bufferCircle);
        }

        const pinMarker = L.circleMarker(v.coordinates, {
          color: "#ffffff",
          fillColor: color,
          fillOpacity: 0.95,
          radius: v.severity === "Red" ? 11 : v.severity === "Orange" ? 9 : 7,
          weight: v.severity === "Red" ? 3 : 1.5,
        }).addTo(map);

        const tooltipHtml = generateStationTooltipHtml(v, "volcano");

        pinMarker.bindTooltip(tooltipHtml, {
          direction: "top",
          sticky: true,
          className: `custom-station-tooltip custom-station-tooltip-${v.severity.toLowerCase()}`
        });

        const imgSrc = getGeoImage(v, "volcano");
        const popupHtml = `
          <div class="p-3.5 text-slate-800 font-sans min-w-[260px] space-y-2">
            <div class="popup-image-inspect-trigger relative rounded-lg overflow-hidden h-28 w-full cursor-pointer group mb-1.5" data-type="volcano" data-id="${v.id}">
              <img src="${imgSrc}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" alt="${v.name}" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-2">
                <span class="text-[9px] font-mono text-amber-400 font-extrabold flex items-center gap-1">
                  🔍 Touch Picture for Altitude & Telemetry
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2">
              <span class="text-[9px] font-mono tracking-wider font-bold px-2 py-0.5 rounded text-white uppercase" style="background-color: ${color}">
                VOLCANO: ${v.severity.toUpperCase()}
              </span>
              <span class="text-[10px] text-slate-500 font-semibold font-mono">${v.elevation}m elevation</span>
            </div>
            
            <h3 class="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-1">
              ${v.name} Caldera
            </h3>
            
            <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
              <div><span class="text-slate-400 font-bold font-mono">Type:</span> ${v.type}</div>
              <div><span class="text-slate-400 font-bold font-mono">Region:</span> ${v.region}</div>
              <div class="col-span-2"><span class="text-slate-400 font-bold font-mono">Status:</span> ${v.activityType}</div>
              <div class="col-span-2 pb-1 border-b border-slate-50"><span class="text-slate-400 font-bold font-mono">Last Erupt:</span> ${v.lastErupted}</div>
            </div>

            <p class="text-[11px] text-slate-600 p-2 bg-slate-50 rounded border border-slate-100/90 italic leading-relaxed">
              "${v.description}"
            </p>

            <button class="comet-portal-trigger-btn px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10.5px] cursor-pointer flex items-center justify-center gap-1.5 w-full shadow-xs border-0" data-type="volcano" data-id="${v.id}">
              Explore COMET Geostation Portal ↗
            </button>

            <button class="licsbas-portal-trigger-btn px-2.5 py-1.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-cyan-700 hover:from-purple-600 hover:to-cyan-600 text-white font-bold rounded-lg text-[10.5px] cursor-pointer flex items-center justify-center gap-1.5 w-full shadow-xs border-0 mt-1" data-name="${v.name}" data-id="${v.id}">
              📡 Fetch LiCSBAS InSAR Map & Time-Series ↗
            </button>
            
            <div class="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1">
              <span>Geo Pt: ${v.coordinates[0].toFixed(4)}°N, ${v.coordinates[1].toFixed(4)}°E</span>
              <span>ESSGI Advisory Network</span>
            </div>
          </div>
        `;

        pinMarker.bindPopup(popupHtml);

        pinMarker.on("click", () => {
          onSelectItem({ type: "volcano", id: v.id });
        });

        markersRef.current.push(pinMarker);
      });
    }

    if (showEarthquakes) {
      animatedEarthquakes.forEach((eq) => {
        const color = severityColors[eq.severity] || severityColors.Yellow;
        const magRadius = Math.max(15000, eq.magnitude * 25000);

        let bufferCircle: any = null;
        if (showBuffers) {
          bufferCircle = L.circle(eq.coordinates, {
            color: color,
            fillColor: color,
            fillOpacity: 0.04,
            radius: magRadius,
            weight: 1,
            dashArray: "3 6",
          }).addTo(map);
          markersRef.current.push(bufferCircle);
        }

        const corePin = L.circleMarker(eq.coordinates, {
          color: color,
          fillColor: "#ffffff",
          fillOpacity: 0.95,
          radius: eq.magnitude >= 5.5 ? 9 : 6.5,
          weight: 2.5,
        }).addTo(map);

        const tooltipHtml = generateStationTooltipHtml(eq, "earthquake");

        corePin.bindTooltip(tooltipHtml, {
          direction: "top",
          sticky: true,
          className: `custom-station-tooltip custom-station-tooltip-${eq.severity.toLowerCase()}`
        });

        const formattedDate = new Date(eq.dateTime).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        const assignedNode = getNearestNodeForCoords(eq.coordinates[0], eq.coordinates[1]);
        const imgSrc = getGeoImage(eq, "earthquake");
        const popupHtml = `
          <div class="p-3.5 text-slate-800 font-sans min-w-[270px] space-y-2">
            <div class="popup-image-inspect-trigger relative rounded-lg overflow-hidden h-28 w-full cursor-pointer group mb-1.5" data-type="earthquake" data-id="${eq.id}">
              <img src="${imgSrc}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" alt="${eq.location}" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-2">
                <span class="text-[9px] font-mono text-amber-400 font-extrabold flex items-center gap-1">
                  🔍 Touch Picture for Altitude & Telemetry
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded text-white" style="background-color: ${color}">
                M ${eq.magnitude.toFixed(1)} MAGNITUDE
              </span>
              <span class="text-[10px] text-slate-500 font-semibold font-mono">${eq.isHistorical ? "HISTORIC PLOT" : "USGS CORE"}</span>
            </div>

            <h3 class="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-1">
              ${eq.location}
            </h3>

            <div class="grid grid-cols-2 gap-y-1 text-[11px] text-slate-600">
              <div><span class="text-slate-400 font-bold font-mono">Focal Depth:</span> ${eq.depth} km</div>
              <div><span class="text-slate-400 font-bold font-mono">Timestamp:</span> ${formattedDate}</div>
              <div class="col-span-2 text-slate-600 p-1.5 bg-slate-50 border border-slate-100 font-sans rounded italic leading-normal mt-1 text-[10.5px]">
                ${eq.description}
              </div>
            </div>

            <div class="bg-blue-50/90 dark:bg-blue-950/40 p-2 rounded-lg border border-blue-200 dark:border-blue-800 text-[10.5px] font-mono flex items-center justify-between text-blue-900 dark:text-blue-200">
              <span>📡 Node: <strong class="text-blue-600 dark:text-cyan-400">${assignedNode.code}</strong></span>
              <span class="text-[9.5px] text-blue-600 dark:text-blue-300 font-bold">${assignedNode.distKm} km away</span>
            </div>

            <button class="comet-portal-trigger-btn px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10.5px] cursor-pointer flex items-center justify-center gap-1.5 w-full shadow-xs border-0" data-type="earthquake" data-id="${eq.id}">
              Retrieve COMET Seismic Node Data ↗
            </button>

            <div class="flex items-center justify-between text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-1.5">
              <span>GPS: ${eq.coordinates[0].toFixed(4)}N, ${eq.coordinates[1].toFixed(4)}E</span>
              <span>ESSGI Monitor Feed</span>
            </div>
          </div>
        `;

        corePin.bindPopup(popupHtml);

        corePin.on("click", () => {
          onSelectItem({ type: "earthquake", id: eq.id });
        });

        markersRef.current.push(corePin);
      });
    }

    ETHIOPIA_ACTIVE_ZONES.forEach((zone) => {
      const isSelected = selectedItem?.type === "volcano" && selectedItem?.id === zone.id;
      const dangerZoneCircle = L.circle(zone.coordinates, {
        color: isSelected ? "#ef4444" : "#b91c1c",
        fillColor: isSelected ? "#f43f5e" : "#f43f5e",
        fillOpacity: isSelected ? 0.22 : 0.05,
        radius: zone.riskScore === 10 ? 60000 : zone.riskScore === 9 ? 50000 : 40000,
        weight: isSelected ? 3.5 : 1.5,
        dashArray: isSelected ? undefined : "3 5",
      }).addTo(map);

      dangerZoneCircle.bindTooltip(
        `<div class="px-2 py-0.5 font-sans font-bold text-red-700 text-[10px] uppercase">
          ZONE ASSESSMENT: ${zone.name}
         </div>`,
        { sticky: true }
      );

      const zonePopupHtml = `
        <div class="p-3.5 text-slate-800 font-sans min-w-[280px] space-y-2">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[9px] font-mono tracking-wider font-bold px-2 py-0.5 rounded text-white bg-slate-900 uppercase">
              ACTIVE FAULT CORRIDOR
            </span>
            <span class="text-[10px] text-red-600 font-extrabold font-mono">RISK ENVELOPE: ${zone.riskScore}/10</span>
          </div>
          
          <h3 class="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-150 pb-1">
            ${zone.name}
          </h3>
          
          <p class="text-[11px] text-slate-600 p-2 bg-rose-50/25 rounded border border-rose-100/50 italic leading-relaxed font-sans">
            "${zone.description}"
          </p>

          <div class="grid grid-cols-2 gap-2 text-[10px] font-sans">
            <div class="p-1 px-1.5 bg-slate-50 border border-slate-100 rounded">
              <span class="font-bold text-slate-400 font-mono block uppercase text-[8px] leading-tight">Volcanic Risk</span>
              <span class="font-bold text-rose-600 uppercase text-[10px]">${zone.volcanicVulnerability}</span>
            </div>
            <div class="p-1 px-1.5 bg-slate-50 border border-slate-100 rounded">
              <span class="font-bold text-slate-400 font-mono block uppercase text-[8px] leading-tight">Seismic Risk</span>
              <span class="font-bold text-orange-500 uppercase text-[10px]">${zone.seismicVulnerability}</span>
            </div>
          </div>

          <div class="text-[10px] text-slate-500 font-sans leading-tight">
            <strong>Historical Swarms:</strong> ${zone.historicalEvents}
          </div>

          <button class="comet-portal-trigger-btn px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10.5px] cursor-pointer flex items-center justify-center gap-1.5 w-full shadow-xs border-0 mt-2" data-type="volcano" data-id="${zone.id}">
            Retrieve COMET Zone Telemetry ↗
          </button>

          <div class="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1.5 border-t border-slate-100/70">
            <span>Lat/Lng: ${zone.coordinates[0].toFixed(2)}N, ${zone.coordinates[1].toFixed(2)}E</span>
            <span>ESSGI Geo-Hazard Audit</span>
          </div>
        </div>
      `;

      dangerZoneCircle.bindPopup(zonePopupHtml);

      dangerZoneCircle.on("click", () => {
        onSelectItem({ type: "volcano", id: zone.id });
      });

      markersRef.current.push(dangerZoneCircle);
    });

    if (showHeatmap) {
      const heatmapHotspots = [
        { name: "Afar Triple Junction Density Zone", coordinates: [11.75, 41.50] as [number, number], radius: 95000, color: "#ef4444" },
        { name: "Gewane Graben Seismic Focus", coordinates: [10.15, 40.65] as [number, number], radius: 65000, color: "#f97316" },
        { name: "Ankober Escarpment Fault Segment", coordinates: [9.58, 39.73] as [number, number], radius: 55000, color: "#f59e0b" },
        { name: "Adama-Nazret Rift Fracture Zone", coordinates: [8.55, 39.27] as [number, number], radius: 75000, color: "#ef4444" },
        { name: "Hawassa Basin Hydro-Tectonic Swarm Center", coordinates: [7.05, 38.48] as [number, number], radius: 60000, color: "#f59e0b" }
      ];

      heatmapHotspots.forEach((hs) => {
        [1.0, 0.65, 0.35].forEach((scale) => {
          const heatCircle = L.circle(hs.coordinates, {
            color: "transparent",
            fillColor: hs.color,
            fillOpacity: 0.08,
            radius: hs.radius * scale,
            weight: 0,
            interactive: false
          }).addTo(map);
          markersRef.current.push(heatCircle);
        });
      });

      animatedEarthquakes.forEach((eq) => {
        if (eq.magnitude >= 4.0) {
          const eqHeatCircle = L.circle(eq.coordinates, {
            color: "transparent",
            fillColor: eq.magnitude >= 5.0 ? "#dc2626" : "#f97316",
            fillOpacity: 0.12,
            radius: eq.magnitude * 16000,
            weight: 0,
            interactive: false
          }).addTo(map);
          markersRef.current.push(eqHeatCircle);
        }
      });
    }

    if (showAdminRegions) {
      const adminRegions = [
        {
          name: "Afar Region",
          center: [11.5, 41.0] as [number, number],
          color: "#3b82f6",
          description: "Afar Region: Highest seismic normal faulting & magmatic plumes (Afar Triple Junction)."
        },
        {
          name: "Oromia / East Shewa Zone",
          center: [8.5, 39.3] as [number, number],
          color: "#10b981",
          description: "Oromia Region: Fentale-Metehara basalt fractures and active geothermal calderas."
        },
        {
          name: "SNNPR / Central Lakes Zone",
          center: [7.0, 38.3] as [number, number],
          color: "#ca8a04",
          description: "SNNPR Region (Hawassa Sector): Main Ethiopian Rift crustal stretching and hot springs."
        }
      ];

      adminRegions.forEach((reg) => {
        const boundaryCircle = L.circle(reg.center, {
          color: reg.color,
          fillColor: reg.color,
          fillOpacity: 0.08,
          radius: 120000,
          weight: 2,
          dashArray: "5, 8"
        }).addTo(map);

        boundaryCircle.bindTooltip(
          `<div class="p-2 font-sans">
            <span class="font-extrabold text-[11px] block text-slate-900 dark:text-white uppercase tracking-wider">${reg.name} Administrative Sector</span>
            <p class="text-[10px] text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">&bull; ${reg.description}</p>
           </div>`,
          { sticky: true }
        );

        markersRef.current.push(boundaryCircle);
      });
    }

    if (showInsarOverlay) {
      const insarDeformations = [
        {
          center: [13.60, 40.67] as [number, number],
          name: "Erta Ale Caldera Uplift",
          bands: [
            { radius: 10000, rate: "+15.2 mm/yr", status: "UPLIFT (LAVA RESERVOIR INFLATION)", color: "#c084fc", opacity: 0.25 },
            { radius: 24000, rate: "+8.4 mm/yr", status: "UPLIFT (REGIONAL FLANK MOVEMENT)", color: "#d8b4fe", opacity: 0.15 },
            { radius: 42000, rate: "+3.1 mm/yr", status: "UPLIFT (DISTAL TECTONIC DOME)", color: "#f3e8ff", opacity: 0.08 }
          ]
        },
        {
          center: [12.60, 40.50] as [number, number],
          name: "Dabbahu Fissure Subsidence",
          bands: [
            { radius: 14000, rate: "-12.8 mm/yr", status: "SUBSIDENCE (POST-RIFT INTRUSION SAGGING)", color: "#2563eb", opacity: 0.22 },
            { radius: 28000, rate: "-6.1 mm/yr", status: "SUBSIDENCE (GRABEN FLOOR SETTLING)", color: "#60a5fa", opacity: 0.14 },
            { radius: 50000, rate: "-2.3 mm/yr", status: "SUBSIDENCE (MARGINAL CRUSTAL FLEXURE)", color: "#93c5fd", opacity: 0.07 }
          ]
        },
        {
          center: [7.10, 38.45] as [number, number],
          name: "Corbetti-Aluto Caldera Inflation",
          bands: [
            { radius: 12000, rate: "+11.5 mm/yr", status: "UPLIFT (MAGMATIC GAS FLUID CHAMBER PRESSURIZATION)", color: "#db2777", opacity: 0.22 },
            { radius: 26000, rate: "+4.8 mm/yr", status: "UPLIFT (GEOTHERMAL VENTING EXPANSION)", color: "#f472b6", opacity: 0.12 }
          ]
        }
      ];

      insarDeformations.forEach((defo) => {
        defo.bands.forEach((band) => {
          const defoPolygon = L.circle(defo.center, {
            color: band.color,
            fillColor: band.color,
            fillOpacity: band.opacity,
            radius: band.radius,
            weight: 1.2,
            dashArray: "4, 6"
          }).addTo(map);

          defoPolygon.bindTooltip(
            `<div class="p-1.5 font-sans text-xs bg-slate-950 text-slate-100 rounded border border-slate-800 shadow-lg text-left">
              <strong class="text-purple-400 text-[11px] block uppercase font-mono">${defo.name}</strong>
              <div class="font-mono text-[10.5px] mt-0.5">Rate: <span class="font-black text-white">${band.rate}</span></div>
              <div class="text-[9.5px] text-slate-400 mt-0.5">${band.status}</div>
              <div class="text-[8.5px] text-slate-505 mt-1 uppercase font-semibold">Source: Sentinel-1 InSAR</div>
            </div>`,
            { sticky: true }
          );

          markersRef.current.push(defoPolygon);
        });
      });
    }

    if (showGnss) {
      ETHIOPIA_GNSS_STATIONS.forEach((st) => {
        const outerBench = L.circleMarker(st.coordinates, {
          color: "#06b6d4",
          fillColor: "#0891b2",
          fillOpacity: 0.18,
          radius: 11, // Touch-friendly 22px diameter hit area
          weight: 2,
        }).addTo(map);

        const innerCore = L.circleMarker(st.coordinates, {
          color: "#22d3ee",
          fillColor: "#0891b2",
          fillOpacity: 0.95,
          radius: 4.5,
          weight: 1,
          interactive: false, // Make non-interactive so click/touch events fall through to outerBench
        }).addTo(map);

        outerBench.bindTooltip(
          `<div class="px-2 py-1 font-sans text-[11px] bg-slate-900 text-white rounded shadow-md text-left font-semibold">
            <span class="text-cyan-400 font-black font-mono">📡 GNSS: ${st.id.replace("gnss_", "").toUpperCase()}</span><br/>
            <span class="font-mono text-[10px] text-slate-300">N: +${st.velocityNorth} mm/yr | E: +${st.velocityEast} mm/yr</span>
           </div>`,
          { direction: "top", sticky: true }
        );

        const imgSrc = getGeoImage(st, "gnss");
        
        // Calculate 5-year trace for the popup SVG chart
        const maxDisplacement = Math.max(Math.abs(st.velocityNorth), Math.abs(st.velocityEast), 1) * 5;
        const pointsN: string[] = [];
        const pointsE: string[] = [];
        const chartWidth = 220;
        const chartHeight = 45;
        const paddingLeft = 15;
        const paddingRight = 15;
        
        for (let i = 0; i <= 5; i++) {
          const x = paddingLeft + (i / 5) * (chartWidth - paddingLeft - paddingRight);
          const nVal = i * st.velocityNorth + Math.sin(i * 1.5) * 1.5;
          const eVal = i * st.velocityEast + Math.cos(i * 1.5) * 1.5;
          
          // y values mapped to chartHeight (margin 3 at top/bottom)
          const yN = 3 + (chartHeight - 6) - ((nVal / maxDisplacement) * (chartHeight - 6));
          const yE = 3 + (chartHeight - 6) - ((eVal / maxDisplacement) * (chartHeight - 6));
          
          pointsN.push(`${x.toFixed(1)},${yN.toFixed(1)}`);
          pointsE.push(`${x.toFixed(1)},${yE.toFixed(1)}`);
        }
        const nPointsStr = pointsN.join(" ");
        const ePointsStr = pointsE.join(" ");

        const popupHtml = `
          <div class="p-3.5 text-slate-800 font-sans min-w-[285px] space-y-2">
            <div class="popup-image-inspect-trigger relative rounded-lg overflow-hidden h-28 w-full cursor-pointer group mb-1.5" data-type="gnss" data-id="${st.id}">
              <img src="${imgSrc}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" alt="${st.name}" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-2">
                <span class="text-[9px] font-mono text-amber-400 font-extrabold flex items-center gap-1">
                  🔍 Touch Picture for Altitude & Telemetry
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-[9px] font-mono tracking-wider font-bold px-2 py-0.5 rounded text-white bg-cyan-600 uppercase">
                GNSS GEODETIC STATION
              </span>
              <span class="text-[9px] text-cyan-600 font-bold font-mono">IGS CODE: ${st.id.replace("gnss_", "").toUpperCase()}</span>
            </div>
            
            <h3 class="font-extrabold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-1">
              ${st.name}
            </h3>
            
            <div class="text-[11px] text-slate-600 space-y-0.5">
              <div><span class="text-slate-400 font-bold font-mono">Location:</span> ${st.location}</div>
              <div><span class="text-slate-400 font-bold font-mono">Operator:</span> ${st.monitoredBy}</div>
            </div>

            <div class="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-150 rounded p-1.5 text-center font-mono">
              <div class="border-r border-slate-200">
                <span class="text-[8px] font-mono font-bold text-slate-400 uppercase block leading-none">V_North</span>
                <span class="font-mono font-extrabold text-slate-800 text-[10.5px] block mt-0.5">+${st.velocityNorth} mm/yr</span>
              </div>
              <div class="border-r border-slate-200">
                <span class="text-[8px] font-mono font-bold text-slate-400 uppercase block leading-none">V_East</span>
                <span class="font-mono font-extrabold text-slate-800 text-[10.5px] block mt-0.5">+${st.velocityEast} mm/yr</span>
              </div>
              <div>
                <span class="text-[8px] font-mono font-bold text-slate-400 uppercase block leading-none">V_Vertical</span>
                <span class="font-mono font-extrabold ${st.velocityUp < 0 ? 'text-red-500' : 'text-emerald-500'} text-[10.5px] block mt-0.5">${st.velocityUp >= 0 ? "+" : ""}${st.velocityUp} mm/yr</span>
              </div>
            </div>

            <!-- Trace graph -->
            <div class="bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 font-sans">
              <div class="flex justify-between items-center text-[8.5px] font-mono text-slate-400 uppercase tracking-wider">
                <span>📈 5-Year Cumulative Drift</span>
                <span class="flex items-center gap-2 font-semibold">
                  <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>North</span>
                  <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>East</span>
                </span>
              </div>
              <div class="h-[48px] relative bg-slate-950/70 rounded-lg overflow-hidden border border-slate-800/60 flex items-center justify-center">
                <svg class="w-full h-full absolute inset-0">
                  <line x1="0" y1="12" x2="${chartWidth}" y2="12" stroke="#1e293b" stroke-dasharray="2,2" stroke-width="0.8" />
                  <line x1="0" y1="24" x2="${chartWidth}" y2="24" stroke="#1e293b" stroke-dasharray="2,2" stroke-width="0.8" />
                  <line x1="0" y1="36" x2="${chartWidth}" y2="36" stroke="#1e293b" stroke-dasharray="2,2" stroke-width="0.8" />
                  <polyline fill="none" stroke="#10b981" stroke-width="1.8" points="${nPointsStr}" stroke-linecap="round" />
                  <polyline fill="none" stroke="#6366f1" stroke-width="1.8" points="${ePointsStr}" stroke-linecap="round" />
                </svg>
                <span class="absolute left-1.5 bottom-0.5 text-[7px] text-slate-500 font-mono">Yr 0</span>
                <span class="absolute right-1.5 bottom-0.5 text-[7px] text-slate-500 font-mono">Yr 5 (Est: +${(st.velocityNorth * 5).toFixed(0)}N, +${(st.velocityEast * 5).toFixed(0)}E mm)</span>
              </div>
            </div>

            <p class="text-[11px] text-slate-600 bg-cyan-50/20 p-2 rounded border border-cyan-100/50 italic leading-relaxed">
              "${st.description}"
            </p>

            <button class="comet-portal-trigger-btn px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-[10.5px] cursor-pointer flex items-center justify-center gap-1.5 w-full shadow-xs border-0" data-type="gnss" data-id="${st.id}">
              Open GNSS Time-Series Analyzer 📊
            </button>
            
            <div class="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1">
              <span>Coordinates: ${st.coordinates[0].toFixed(4)}°N, ${st.coordinates[1].toFixed(4)}°E</span>
              <span>ESSGI Space Geodesy</span>
            </div>
          </div>
        `;

        outerBench.bindPopup(popupHtml);

        outerBench.on("click", () => {
          onSelectItem({ type: "gnss", id: st.id });
          setInspectNode({ type: "gnss", item: st });
        });

        markersRef.current.push(outerBench);
        markersRef.current.push(innerCore);
      });
    }

  }, [filteredVolcanoes, animatedEarthquakes, mapLoaded, showVolcanoes, showEarthquakes, showBuffers, showRiftAxis, mapStyle, showGnss, showHeatmap, showInsarOverlay, showAdminRegions, selectedItem]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapRef.current;

    if (pulseMarkerRef.current) {
      pulseMarkerRef.current.remove();
      pulseMarkerRef.current = null;
    }

    if (!selectedItem) return;

    let targetCoords: [number, number] | null = null;
    let targetZoom = 8;

    if (selectedItem.type === "volcano") {
      const v = volcanoes.find((vol) => vol.id === selectedItem.id);
      if (v && showVolcanoes) {
        targetCoords = v.coordinates;
        targetZoom = 9.5;
      } else {
        const zone = ETHIOPIA_ACTIVE_ZONES.find((z) => z.id === selectedItem.id);
        if (zone) {
          targetCoords = zone.coordinates;
          targetZoom = 8.5;
        }
      }
    } else if (selectedItem.type === "earthquake") {
      const eq = earthquakes.find((e) => e.id === selectedItem.id);
      if (eq && showEarthquakes) {
        targetCoords = eq.coordinates;
        targetZoom = 9.5;
      }
    } else if (selectedItem.type === "gnss") {
      const st = ETHIOPIA_GNSS_STATIONS.find((s) => s.id === selectedItem.id);
      if (st && showGnss) {
        targetCoords = st.coordinates;
        targetZoom = 10;
      }
    }

    if (targetCoords) {
      map.flyTo(targetCoords, targetZoom, {
        animate: true,
        duration: 1.6,
        easeLinearity: 0.25
      });

      const customPulseIcon = L.divIcon({
        className: "pulse-glowing-ring",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      pulseMarkerRef.current = L.marker(targetCoords, {
        icon: customPulseIcon,
        interactive: false,
      }).addTo(map);
    }
  }, [selectedItem, mapLoaded, volcanoes, earthquakes, showVolcanoes, showEarthquakes, showGnss]);

  const fitAllBounds = () => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapRef.current;
    const validCoords: any[] = [];

    if (showVolcanoes) {
      filteredVolcanoes.forEach((v) => validCoords.push(v.coordinates));
    }
    if (showEarthquakes) {
      animatedEarthquakes.forEach((eq) => validCoords.push(eq.coordinates));
    }

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1 });
    } else {
      map.setView([9.145, 40.4896], 6, { animate: true, duration: 1 });
    }
    onSelectItem(null);
  };

  const handleApplyPreset = (coords: [number, number], zoom: number) => {
    if (!mapLoaded || !mapRef.current) return;
    mapRef.current.flyTo(coords, zoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25
    });
    onSelectItem(null);
  };


  return (
    <div
      className={`relative w-full transition-all duration-300 font-sans ${
        isFullScreen
          ? "fixed inset-0 z-[99999] h-screen w-screen rounded-none bg-slate-950 p-2 sm:p-4"
          : "h-[640px] rounded-lg border border-slate-300 dark:border-white/5 bg-slate-50 dark:bg-slate-900/10 shadow-sm"
      } overflow-hidden flex flex-col lg:flex-row`}
    >
      {/* FULLSCREEN Floating Exit Banner if active */}
      {isFullScreen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10001] bg-slate-900/90 text-white backdrop-blur-md border border-cyan-500/40 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs">
          <span className="flex items-center gap-2 font-bold text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            FULL SCREEN GIS VIEWPORT MODE
          </span>
          <span className="text-slate-400 text-[10px]">Press Esc or</span>
          <button
            onClick={toggleFullScreen}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-md"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Exit Full Screen
          </button>
        </div>
      )}
      
      {/* 1. LEFT CONTAINER: LEAFLET CANVAS + MAIN FLOATING OVERLAYS */}
      <div className="relative flex-grow h-full min-h-[350px]">
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 max-w-[310px] select-none">
          {!controlsExpanded ? (
            <button
              onClick={() => setControlsExpanded(true)}
              className="bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-slate-800 text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 font-sans"
              title="Expand GIS Overlays & Controls"
            >
              <Sliders className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Layers & Focus Regions</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <div className="bg-white/95 dark:bg-slate-950/95 border border-slate-300 dark:border-white/5 p-2.5 rounded-lg shadow-md flex flex-col gap-2 w-[280px] sm:w-[300px] transition-all">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-extrabold tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  Map Layers & Focus
                </span>
                <button
                  onClick={() => setControlsExpanded(false)}
                  className="text-[9.5px] font-extrabold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-0.5"
                  title="Hide Controls"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Hide
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 p-1.5 rounded-md space-y-1">
                <span className="text-[8.5px] font-mono uppercase text-slate-400 font-bold tracking-wider">Map Style:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {([
                    { id: "geological", label: "Fault Map" },
                    { id: "googleEarthHybrid", label: "GE Hybrid" },
                    { id: "googleEarth", label: "GE Satellite" },
                    { id: "satellite", label: "Esri Sat" },
                    { id: "street", label: "Street" },
                  ] as const).map((styleOpt) => (
                    <button
                      key={styleOpt.id}
                      onClick={() => handleMapStyleChange(styleOpt.id)}
                      className={`text-[9px] font-bold px-1.5 py-1 rounded transition-all cursor-pointer text-center ${
                        mapStyle === styleOpt.id
                          ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-950 font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                      }`}
                    >
                      {styleOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 p-1.5 rounded-md space-y-1.5 text-slate-850 dark:text-slate-100">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-blue-600" />
                    GIS Vector Overlays
                  </span>
                  <button
                    onClick={fitAllBounds}
                    className="text-[8.5px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 transition-colors cursor-pointer"
                    title="Fit viewport bounding envelope"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                    Fit All
                  </button>
                </div>

                <div className="flex flex-col gap-1 text-[9.5px] leading-tight select-none max-h-[110px] overflow-y-auto pr-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showVolcanoes}
                      onChange={(e) => setShowVolcanoes(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block shrink-0"></span>
                      Volcanoes (Active Centers)
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showEarthquakes}
                      onChange={(e) => setShowEarthquakes(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0"></span>
                      Earthquakes (Active Tremors)
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showRiftAxis}
                      onChange={(e) => setShowRiftAxis(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <span className="text-red-600 font-bold">- - -</span>
                      Tectonic Plates (Rift Axis)
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors pt-0.5 border-t border-slate-200 dark:border-white/5">
                    <input
                      type="checkbox"
                      checked={showBuffers}
                      onChange={(e) => setShowBuffers(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                      Buffer Threat Rings (35km)
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors pt-0.5 border-t border-slate-200 dark:border-white/5">
                    <input
                      type="checkbox"
                      checked={showGnss}
                      onChange={(e) => setShowGnss(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 font-semibold text-[9px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block shrink-0"></span>
                      📡 GNSS Reference Network
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showHeatmap}
                      onChange={(e) => setShowHeatmap(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 font-semibold text-[9px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 inline-block shrink-0"></span>
                      🔥 Seismicity Heatmap
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showInsarOverlay}
                      onChange={(e) => setShowInsarOverlay(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 font-semibold text-[9px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block shrink-0"></span>
                      🛰️ InSAR Ground Deformation
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showAdminRegions}
                      onChange={(e) => setShowAdminRegions(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-opacity-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 font-semibold text-[9px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0"></span>
                      🗺️ Administrative Regions
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 p-1.5 rounded-md space-y-1 text-slate-750 dark:text-slate-200">
                <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Quick Focus Region:
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {presets.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleApplyPreset(p.coords as [number, number], p.zoom)}
                      className="text-[8.5px] font-semibold py-0.5 px-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-650 dark:text-slate-300 transition-all text-left truncate cursor-pointer"
                      title={p.name}
                    >
                      &raquo; {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM RIGHT FLOATING MAP LEGEND */}
        <div className="absolute bottom-4 right-4 z-[1000] select-none text-slate-800 dark:text-slate-100">
          {!legendExpanded ? (
            <button
              onClick={() => setLegendExpanded(true)}
              className="bg-white/95 dark:bg-slate-950/95 border border-slate-300 dark:border-white/5 px-3 py-2 rounded-lg shadow-md flex items-center gap-1.5 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer hover:scale-105"
              title="Expand Legend"
            >
              <Info className="w-4 h-4 text-blue-600" />
              <span>Map Legend</span>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <div className="bg-white/95 dark:bg-slate-950/95 border border-slate-300 dark:border-white/5 p-2.5 rounded-lg shadow-md max-w-[200px] max-h-[180px] overflow-y-auto flex flex-col gap-1 w-[180px] sm:w-[200px] transition-all">
              <div className="text-[8.5px] font-mono uppercase font-bold text-slate-500 tracking-wider mb-1 border-b border-slate-200 dark:border-white/5 pb-1 flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Map Legend
                </span>
                <button
                  onClick={() => setLegendExpanded(false)}
                  className="text-slate-400 hover:text-slate-750 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 px-1 py-0.5 rounded text-[9.5px] font-extrabold flex items-center gap-0.5"
                  title="Collapse Legend"
                >
                  Hide &raquo;
                </button>
              </div>
              <div className="space-y-1 text-[9px] leading-snug">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-pulse"></span>
                  <span className="font-bold text-slate-850 dark:text-white">Critical Red Alert</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0"></span>
                  <span className="text-slate-600 dark:text-slate-400">Elevated Orange</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-600 shrink-0"></span>
                  <span className="text-slate-600 dark:text-slate-400">Yellow Monitoring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-600 shrink-0"></span>
                  <span className="text-slate-600 dark:text-slate-400">Stable / Quiet Green</span>
                </div>
                <div className="flex items-center gap-1.5 border-t border-slate-150 dark:border-white/5 pt-1">
                  <span className="text-[10px] font-bold text-red-700 tracking-widest">- - -</span>
                  <span className="text-slate-500 font-mono text-[8.5px]">Rift Valley Axis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-dashed border-rose-400 bg-rose-50/10 shrink-0"></span>
                  <span className="text-slate-500 font-mono text-[8.5px]">Circular Risk Zone</span>
                </div>

                {showGnss && (
                  <div className="flex items-center gap-1.5 border-t border-slate-150 dark:border-white/5 pt-1">
                    <span className="w-2 h-2 rounded-full border border-cyan-500 bg-cyan-700 shrink-0"></span>
                    <span className="text-cyan-700 font-mono font-bold text-[8.5px]">GNSS Beacon</span>
                  </div>
                )}

                {showHeatmap && (
                  <div className="flex items-center gap-1.5 border-t border-slate-150 dark:border-white/5 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-red-600 opacity-85 shrink-0"></span>
                    <span className="text-red-700 font-mono font-bold text-[8.5px]">Seismic Heat</span>
                  </div>
                )}

                {showInsarOverlay && (
                  <div className="flex flex-col gap-0.5 border-t border-slate-150 dark:border-white/5 pt-1">
                    <span className="text-purple-700 font-mono font-bold text-[8px] uppercase">InSAR Displacement:</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                      <span className="text-slate-500 text-[8px] font-mono">+15mm Uplift</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="text-slate-500 text-[8px] font-mono">-12mm Subsidence</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT FLOATING INTERACTIVE GIS PANEL */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 select-none text-slate-800 dark:text-slate-100 max-w-[220px] sm:max-w-[240px]">
          <div className="backdrop-blur-md bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-xl flex flex-col gap-2.5 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-150 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-extrabold tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                GIS Interactive
              </span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Fit Controls: Fullscreen & Bounds */}
            <div className="grid grid-cols-1 gap-1.5">
              <button
                id="toggle-fullscreen-btn"
                onClick={toggleFullScreen}
                className={`w-full py-2 px-3 rounded-xl shadow-sm text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 font-sans border border-blue-500/30 ${
                  isFullScreen
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20"
                }`}
                title="Expand GIS Map to fill full window screen"
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span>Exit Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    <span>Fit Map to Full Screen</span>
                  </>
                )}
              </button>

              <button
                id="zoom-to-extent-btn"
                onClick={fitAllBounds}
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-200 dark:text-slate-100 hover:scale-[1.01] active:scale-[0.98] py-1.5 px-3 rounded-xl shadow-sm text-[9.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans border border-slate-700/60"
                title="Align viewport to envelope all active stations"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Fit Map Bounds (All Nodes)</span>
              </button>

              
            </div>

            {/* Layer toggles */}
            <div className="flex flex-col gap-2">
              <span className="text-[8.5px] font-mono uppercase text-slate-400 font-bold tracking-wider">Independent Layers:</span>
              
              {/* Volcanoes Layer Button */}
              <button
                id="toggle-volcanoes-btn"
                onClick={() => setShowVolcanoes(!showVolcanoes)}
                className={`w-full text-left p-2 border rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] ${
                  showVolcanoes
                    ? "bg-rose-50/70 hover:bg-rose-50 dark:bg-rose-500/10 dark:hover:bg-rose-500/15 border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-400 font-bold"
                    : "bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
                }`}
                title="Toggle Volcano Center Markers"
              >
                <div className="flex items-center gap-2">
                  <Flame className={`w-3.5 h-3.5 shrink-0 ${showVolcanoes ? "text-red-500 animate-[pulse_2s_infinite]" : "text-slate-400"}`} />
                  <span>Volcanic Centers</span>
                </div>
                <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-mono ${
                  showVolcanoes 
                    ? "bg-rose-200/50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold" 
                    : "bg-slate-100 dark:bg-white/5 text-slate-400"
                }`}>
                  {volcanoes.length} V
                </span>
              </button>

              {/* Seismometer Coordinates Button */}
              <button
                id="toggle-earthquakes-btn"
                onClick={() => setShowEarthquakes(!showEarthquakes)}
                className={`w-full text-left p-2 border rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] ${
                  showEarthquakes
                    ? "bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-400 font-bold"
                    : "bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
                }`}
                title="Toggle Seismic Epicenters"
              >
                <div className="flex items-center gap-2">
                  <Activity className={`w-3.5 h-3.5 shrink-0 ${showEarthquakes ? "text-amber-500 animate-[pulse_2.5s_infinite]" : "text-slate-400"}`} />
                  <span>Seismic Epicenters</span>
                </div>
                <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-mono ${
                  showEarthquakes 
                    ? "bg-amber-200/50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold" 
                    : "bg-slate-100 dark:bg-white/5 text-slate-400"
                }`}>
                  {earthquakes.length} E
                </span>
              </button>

              {/* GNSS Stations Button */}
              <button
                id="toggle-gnss-btn"
                onClick={() => setShowGnss(!showGnss)}
                className={`w-full text-left p-2 border rounded-xl text-[10px] transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] ${
                  showGnss
                    ? "bg-cyan-50/70 hover:bg-cyan-50 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/15 border-cyan-200 dark:border-cyan-500/25 text-cyan-700 dark:text-cyan-400 font-bold"
                    : "bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
                }`}
                title="Toggle GNSS reference station layer"
              >
                <div className="flex items-center gap-2">
                  <Globe className={`w-3.5 h-3.5 shrink-0 ${showGnss ? "text-cyan-500" : "text-slate-400"}`} />
                  <span>GNSS Stations</span>
                </div>
                <span className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-mono ${
                  showGnss 
                    ? "bg-cyan-200/50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold" 
                    : "bg-slate-100 dark:bg-white/5 text-slate-400"
                }`}>
                  18 S
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* CORE LEAFLET MAP ELEMENT with 3D elevation simulation */}
        <div 
          className="w-full h-full relative overflow-hidden" 
          style={{ perspective: "1500px" }}
        >
          <div 
            ref={containerRef} 
            className="w-full h-full bg-slate-100 dark:bg-slate-900 transition-all duration-700 ease-in-out origin-center"
            style={
              is3DActiveState
                ? {
                    transform: "rotateX(20deg) rotateY(-0.5deg) scale(0.97) translateY(-6px)",
                    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
                    borderRadius: "12px",
                  }
                : {
                    transform: "none",
                    boxShadow: "none",
                    borderRadius: "0px",
                  }
            }
          />
          {is3DActiveState && (
            <div className="absolute bottom-6 left-6 z-[1002] bg-slate-950/90 text-[9px] font-mono border border-cyan-500/30 text-cyan-400 px-2 py-1 rounded shadow-md pointer-events-none animate-pulse">
              🛰️ Simulated 3D Digital Elevation Model (DEM) Active
            </div>
          )}
        </div>

        {/* EARTHQUAKE DETAIL PANEL */}
        <AnimatePresence>
          {selectedItem?.type === "earthquake" && (() => {
            const eq = earthquakes.find((e) => e.id === selectedItem.id);
            if (!eq) return null;
            return (
              <EarthquakeDetailPanel
                earthquake={eq}
                onClose={() => onSelectItem(null)}
                onExploreNode={onOpenCometPortal ? (id) => onOpenCometPortal({ type: "earthquake", id }) : undefined}
                onFocusOnMap={(coords) => {
                  if (mapRef.current) {
                    mapRef.current.flyTo(coords, 10, { animate: true, duration: 1.2 });
                  }
                }}
                onTriggerSmartAlert={onTriggerSmartAlert}
              />
            );
          })()}
        </AnimatePresence>



      </div>

      {/* 2. RIGHT SIDEBAR: QUICK LOOKUP INDEX */}
      <div className={`bg-white dark:bg-[#0B0C10] border-t lg:border-t-0 lg:border-l border-slate-300 dark:border-white/5 transition-all duration-300 flex flex-col shrink-0 ${
        isSidebarOpen ? "w-full lg:w-[320px] h-[300px] lg:h-full" : "w-full lg:w-[48px] h-[48px] lg:h-full overflow-hidden"
      }`}>
        
        <div className="bg-slate-50 dark:bg-slate-900/60 px-3.5 py-3 border-b border-slate-300 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Compass className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest truncate font-sans">
              GIS Station Index
            </h4>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 hover:text-slate-850 dark:hover:text-white cursor-pointer transition-colors"
            title={isSidebarOpen ? "Collapse sidebar pane" : "Expand sidebar pane"}
          >
            {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="flex-grow flex flex-col overflow-hidden min-h-0">
            
            <div className="p-3 border-b border-slate-300 dark:border-white/5 bg-slate-50 dark:bg-slate-900/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Locate station or place..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 text-slate-800 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-md text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex border-b border-slate-300 dark:border-white/5 font-bold text-xs select-none">
              <button
                onClick={() => { setSidebarTab("volcano"); onSelectItem(null); }}
                className={`flex-1 py-2.5 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1 ${
                  sidebarTab === "volcano"
                    ? "border-blue-600 text-blue-600 dark:text-cyan-400 dark:border-cyan-400 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Volcanoes ({volcanoes.length})
              </button>
              <button
                onClick={() => { setSidebarTab("earthquake"); onSelectItem(null); }}
                className={`flex-1 py-2.5 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1 ${
                  sidebarTab === "earthquake"
                    ? "border-blue-600 text-blue-600 dark:text-cyan-400 dark:border-cyan-400 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Temblors ({earthquakes.length})
              </button>
            </div>

            <div className="flex-grow overflow-y-auto divide-y divide-slate-150 dark:divide-white/5 bg-white dark:bg-slate-950/20">
              {sidebarTab === "volcano" ? (
                filteredVolcanoes.length ? (
                  filteredVolcanoes.map((item) => {
                    const isSelected = selectedItem?.type === "volcano" && selectedItem.id === item.id;
                    
                    const severityColors: Record<SeverityLevel, string> = {
                      Red: "bg-red-50 text-red-700 dark:bg-rose-500/10 dark:text-rose-455 border-red-200 dark:border-rose-500/20",
                      Orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-455 border-orange-200 dark:border-orange-500/20",
                      Yellow: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-455 border-amber-200 dark:border-amber-500/20",
                      Green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-455 border-emerald-200 dark:border-emerald-500/20",
                    };
                    const colorClass = severityColors[item.severity] || "bg-slate-50 text-slate-700";

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectItem({ type: "volcano", id: item.id });
                        }}
                        className={`p-3 text-xs cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col gap-1.5 ${
                          isSelected ? "bg-blue-50/70 dark:bg-cyan-500/10 border-l-4 border-blue-600 dark:border-cyan-450 hover:bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-[12px] truncate flex items-center gap-1">
                            <MapPin className={`w-3 h-3 ${isSelected ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                            {item.name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${colorClass} shrink-0`}>
                            {item.severity}
                          </span>
                        </div>
                        
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.description}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{item.coordinates[0].toFixed(3)}°N, {item.coordinates[1].toFixed(3)}°E</span>
                          <span>{item.elevation}m</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No matching station records found.
                  </div>
                )
              ) : (
                filteredEarthquakes.length ? (
                  filteredEarthquakes.map((item) => {
                    const isSelected = selectedItem?.type === "earthquake" && selectedItem.id === item.id;
                    
                    const severityColors: Record<SeverityLevel, string> = {
                      Red: "bg-red-50 text-red-700 dark:bg-rose-500/10 dark:text-rose-455 border-red-200 dark:border-rose-500/20",
                      Orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-455 border-orange-200 dark:border-orange-500/20",
                      Yellow: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-455 border-amber-200 dark:border-amber-500/20",
                      Green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-455 border-emerald-200 dark:border-emerald-500/20",
                    };
                    const colorClass = severityColors[item.severity] || "bg-slate-50 text-slate-700";

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectItem({ type: "earthquake", id: item.id });
                        }}
                        className={`p-3 text-xs cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col gap-1.5 ${
                          isSelected ? "bg-blue-50/70 dark:bg-cyan-500/10 border-l-4 border-blue-600 dark:border-cyan-450 hover:bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-[12px] truncate flex items-center gap-1">
                            <MapPin className={`w-3 h-3 ${isSelected ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                            {item.location.split(",")[0]}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${colorClass} shrink-0`}>
                            M {item.magnitude.toFixed(1)}
                          </span>
                        </div>
                        
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.description}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{item.coordinates[0].toFixed(3)}°N, {item.coordinates[1].toFixed(3)}°E</span>
                          <span>{item.depth}km</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No matching station records found.
                  </div>
                )
              )}
            </div>

          </div>
        )}

        {!isSidebarOpen && (
          <div className="hidden lg:flex flex-col items-center gap-6 py-6 text-slate-400 dark:text-slate-500">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5 shadow-xs cursor-pointer"
              title="Expand GIS Index Drawer"
            >
              <Compass className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => { setSidebarTab("volcano"); setIsSidebarOpen(true); }}
              className="p-1.5 rounded text-xs font-bold hover:bg-slate-50 hover:text-slate-800 rotate-275 writing-mode-vertical"
            >
              Volcanoes
            </button>
            <button
              onClick={() => { setSidebarTab("earthquake"); setIsSidebarOpen(true); }}
              className="p-1.5 rounded text-xs font-bold hover:bg-slate-50 hover:text-slate-800 rotate-275 writing-mode-vertical"
            >
              Seismic
            </button>
          </div>
        )}

      </div>

      {/* FOOTER COORD REALTIME ROW */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-100 dark:bg-slate-950 text-[10.5px] font-mono text-slate-600 dark:text-slate-400 px-4 flex items-center justify-between z-[1000] border-t border-slate-300 dark:border-white/5">
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Compass className="w-3.5 h-3.5 text-rose-500 animate-[spin_10s_linear_infinite]" />
          <span>GEO-STATION CORRIDOR MONITORING</span>
          {mouseCoords && (
            <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-500/10 px-1.5 py-0.5 rounded ml-2">
              GPS REF: {mouseCoords.lat.toFixed(5)}N, {mouseCoords.lng.toFixed(5)}E
            </span>
          )}
        </div>
        <div className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-450">
          ESSGI Tectonic Division &bull; Continental Rift Study Center
        </div>
      </div>

      {/* GEOLOGIST ALTITUDE & TELEMETRY PICTURE INSPECTOR OVERLAY */}
      {inspectNode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[10000] p-4 text-slate-850 dark:text-slate-100 font-sans">
          <div className="bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col relative animate-fade-in max-h-[88vh]">
            <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-amber-500 animate-[spin_8s_linear_infinite]" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-widest uppercase text-white">
                    Altitude & Telemetry Inspector
                  </h3>
                  <p className="text-[9px] text-slate-400 font-mono">ESSGI CORE GEODETIC INSTRUMENTATION</p>
                </div>
              </div>
              <button
                onClick={() => setInspectNode(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Middle Container */}
            <div className="flex-grow overflow-y-auto min-h-0">
              <div className="relative h-40 w-full bg-slate-950">
                <img
                  src={getGeoImage(inspectNode.item, inspectNode.type)}
                  alt="Station Closeup"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/90 text-slate-950 font-black px-2 py-0.5 rounded shadow-sm">
                      {inspectNode.type.toUpperCase()} STATION
                    </span>
                    <h4 className="text-lg font-black tracking-tight mt-1.5 font-display text-white">
                      {inspectNode.type === "volcano" ? `${inspectNode.item.name} Caldera` :
                       inspectNode.type === "earthquake" ? inspectNode.item.location :
                       inspectNode.item.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">GPS Coordinates</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {inspectNode.item.coordinates[0].toFixed(4)}°N, {inspectNode.item.coordinates[1].toFixed(4)}°E
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-white/5 flex flex-col justify-center">
                    <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                      {inspectNode.type === "volcano" ? "Summit Elevation (MSL)" :
                       inspectNode.type === "earthquake" ? "Focal Depth (Hypocenter)" :
                       "Benchmark Elevation"}
                    </span>
                    <div className="text-2xl font-black text-amber-500 dark:text-[#C9A646] font-mono mt-1 flex items-baseline gap-1">
                      {inspectNode.type === "volcano" && (
                        <>
                          {inspectNode.item.elevation > 0 ? "+" : ""}{inspectNode.item.elevation}
                          <span className="text-xs font-bold text-slate-500">meters</span>
                        </>
                      )}
                      {inspectNode.type === "earthquake" && (
                        <>
                          -{inspectNode.item.depth}
                          <span className="text-xs font-bold text-slate-500">kilometers</span>
                        </>
                      )}
                      {inspectNode.type === "gnss" && (
                        <>
                          +{getGnssElevation(inspectNode.item).toLocaleString()}
                          <span className="text-xs font-bold text-slate-500">meters</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-white/5 flex flex-col justify-center">
                    <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                      {inspectNode.type === "volcano" ? "Magmatic Flow Rate" :
                       inspectNode.type === "earthquake" ? "Richter Scale Yield" :
                       "Horizontal Shift"}
                    </span>
                    <div className="text-lg font-black text-slate-800 dark:text-white font-mono mt-1">
                      {inspectNode.type === "volcano" && (
                        <span className="text-rose-500 uppercase font-bold text-sm">
                          {inspectNode.item.severity === "Red" ? "Critical Effusion" : "Moderate Plume"}
                        </span>
                      )}
                      {inspectNode.type === "earthquake" && (
                        <span className="text-rose-500 uppercase font-mono font-bold">
                          M {inspectNode.item.magnitude.toFixed(1)} Magnitude
                        </span>
                      )}
                      {inspectNode.type === "gnss" && (
                        <span className="text-emerald-500 font-bold font-mono text-sm">
                          +{inspectNode.item.velocityEast} mm / year
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dynamic GNSS Chart rendering inside Sidebar overlay */}
                {inspectNode.type === "gnss" && (
                  <div className="border border-slate-150 dark:border-white/5 rounded-2xl p-4 bg-slate-50/20 dark:bg-slate-950/20">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3">&mdash; geodetic displacement analyzer</span>
                    <GnssChartPanel station={inspectNode.item} />
                  </div>
                )}

                <div className="bg-amber-500/5 dark:bg-amber-500/3 border border-amber-500/20 dark:border-amber-500/15 p-4 rounded-2xl">
                  <div className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Geologist Observatory Report
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {inspectNode.type === "volcano" && `The altitude benchmark profile of ${inspectNode.item.name} caldera sits at an elevation of ${inspectNode.item.elevation}m in the active rifting basin. Thermal sensor imaging demonstrates constant lava flux.`}
                    {inspectNode.type === "earthquake" && `This rupture event originated at a focal depth of ${inspectNode.item.depth}km below sea level. Epicentral ground displacement measurements show localized tectonic stress release.`}
                    {inspectNode.type === "gnss" && `The geodetic summit antenna records continuous centimeter-accurate structural shift rates, signaling safe continuous drift velocities along the East African Rift.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/5 px-6 py-4 flex items-center justify-between font-mono text-[10px] text-slate-400 shrink-0">
              <span>Station Status: Operational</span>
              <button
                onClick={() => setInspectNode(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white font-extrabold rounded-xl text-[10.5px] tracking-wide transition-colors cursor-pointer border border-transparent dark:border-white/10"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    

    </div>
  );
}
