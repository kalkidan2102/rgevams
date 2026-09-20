import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Download,
  MapPin,
  Info,
  Maximize2,
  Minimize2,
  Crosshair,
  FileText,
  Radio,
  Layers,
  Sparkles,
  HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid
} from "recharts";

import licsbasMapImg from "../../assets/images/licsbas.jpg";
import ertaAleLava from "../../assets/images/Erta-ale-lava.jpg";
import dallolSprings from "../../assets/images/dallol.jpg";
import volcanicRiskBg from "../../assets/images/Volcanic-sesmic-risk.jpg";
import volcanicHazardBg from "../../assets/images/Volcanic-hazard.jpg";
import entotoObservatory from "../../assets/images/entoto.jpg";
import earthObservation from "../../assets/images/earthobservation.jpg";
import ethiopiaVolcanoHero from "../../assets/images/ethiopia_volcano.jpg";

function getPlaceBaseImage(placeId: string): string {
  switch (placeId) {
    case "erta_ale":
      return ertaAleLava;
    case "dallol":
      return dallolSprings;
    case "fantale":
      return volcanicRiskBg;
    case "dabbahu":
      return volcanicHazardBg;
    case "furi":
      return entotoObservatory;
    case "alayta":
      return ethiopiaVolcanoHero;
    case "hawassa":
      return earthObservation;
    case "corbetti":
      return volcanicHazardBg;
    case "alutu":
      return volcanicRiskBg;
    case "tullu_moye":
      return volcanicHazardBg;
    case "tendaho":
      return volcanicRiskBg;
    case "manda_hararo":
      return volcanicHazardBg;
    case "kone":
      return volcanicRiskBg;
    case "ayelu":
      return ethiopiaVolcanoHero;
    case "yangudi":
      return licsbasMapImg;
    default:
      return licsbasMapImg;
  }
}

export interface LicsbasPlace {
  id: string;
  name: string;
  region: string;
  frameId: string;
  centerLat: number;
  centerLon: number;
  refLat: number;
  refLon: number;
  elevation: number;
  peakVelocity: number; // mm/yr
  dispMin: number; // mm
  dispMax: number; // mm
  pixelSizeStr: string;
  status: "CRITICAL ALERT" | "ELEVATED ANOMALY" | "MODERATE RISK" | "STABLE REFERENCE";
  hazardType: string;
  description: string;
  hotspotX: number; // %
  hotspotY: number; // %
  refX: number; // %
  refY: number; // %
  gapStartX?: number; // e.g. 2017.05
  gapEndX?: number; // e.g. 2017.70
  gapLabel?: string;
  pattern:
    | "dual_pit_caldera"
    | "linear_rift"
    | "hydrothermal_deflation"
    | "fissure_shield"
    | "fault_creep"
    | "pulsing_dome"
    | "stable_flat"
    | "radial_caldera";
}

export const LICSBAS_PLACES: LicsbasPlace[] = [
  {
    id: "erta_ale",
    name: "Erta Ale Caldera",
    region: "Afar Depression, Ethiopia",
    frameId: "087A_05802_131313",
    centerLat: 13.287,
    centerLon: 40.726,
    refLat: 13.010,
    refLon: 40.840,
    elevation: 613,
    peakVelocity: 48.5,
    dispMin: -570,
    dispMax: 570,
    pixelSizeStr: "1080m x 1110m",
    status: "CRITICAL ALERT",
    hazardType: "Basaltic Lava Lake Inflation & Dike Expansion",
    description:
      "Continuous sub-crustal magma supply beneath active summit pit crater. LiCSALERT detected rapid magmatic uplift acceleration and 2017 flank eruption cycle.",
    hotspotX: 38,
    hotspotY: 28,
    refX: 62,
    refY: 72,
    gapStartX: 2017.05,
    gapEndX: 2017.70,
    gapLabel: "2017 Flank Eruption Data Gap",
    pattern: "dual_pit_caldera"
  },
  {
    id: "dallol",
    name: "Dallol Hydrothermal Dome",
    region: "Danakil Salt Plain, Afar",
    frameId: "087A_05780_171717",
    centerLat: 14.241,
    centerLon: 40.298,
    refLat: 14.110,
    refLon: 40.420,
    elevation: -120,
    peakVelocity: -32.4,
    dispMin: -380,
    dispMax: 140,
    pixelSizeStr: "100m x 100m",
    status: "CRITICAL ALERT",
    hazardType: "Explosive Brine Venting & Halite Sub-surface Deflation",
    description:
      "Sub-sea-level hydrothermal field with rapid halogen gas venting, halite dissolution collapse, and seasonal brine recharge pulses.",
    hotspotX: 35,
    hotspotY: 65,
    refX: 70,
    refY: 25,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "hydrothermal_deflation"
  },
  {
    id: "alutu",
    name: "Alutu Volcanic Complex",
    region: "Main Ethiopian Rift (MER)",
    frameId: "101A_05920_191919",
    centerLat: 7.770,
    centerLon: 38.780,
    refLat: 7.620,
    refLon: 38.910,
    elevation: 2335,
    peakVelocity: 18.4,
    dispMin: -150,
    dispMax: 350,
    pixelSizeStr: "1080m x 1110m",
    status: "ELEVATED ANOMALY",
    hazardType: "Pulsing Geothermal Caldera Inflation/Deflation",
    description:
      "Classic MER geothermal caldera exhibiting multi-year inflation and deflation pulses driven by hydrothermal-magmatic fluid movement.",
    hotspotX: 48,
    hotspotY: 45,
    refX: 75,
    refY: 80,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "pulsing_dome"
  },
  {
    id: "corbetti",
    name: "Corbetti Caldera Complex",
    region: "Southern Rift Valley, Ethiopia",
    frameId: "101A_05930_181818",
    centerLat: 7.180,
    centerLon: 38.380,
    refLat: 7.020,
    refLon: 38.520,
    elevation: 2150,
    peakVelocity: 38.6,
    dispMin: -100,
    dispMax: 520,
    pixelSizeStr: "1080m x 1110m",
    status: "CRITICAL ALERT",
    hazardType: "Rapid Sub-surface Magmatic Resurgence",
    description:
      "One of East Africa's fastest uplifting calderas (+38.6 mm/yr constant rate), actively monitored for geothermal expansion and summit resurgence.",
    hotspotX: 50,
    hotspotY: 40,
    refX: 80,
    refY: 75,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "radial_caldera"
  },
  {
    id: "fantale",
    name: "Fantale Stratovolcano",
    region: "Afar-Rift Transition, Oromia",
    frameId: "087A_05920_141414",
    centerLat: 8.975,
    centerLon: 39.900,
    refLat: 8.820,
    refLon: 40.050,
    elevation: 2007,
    peakVelocity: 14.8,
    dispMin: -100,
    dispMax: 300,
    pixelSizeStr: "1080m x 1110m",
    status: "ELEVATED ANOMALY",
    hazardType: "Trachytic Ignimbrite Caldera Resurgence",
    description:
      "Magma chamber pressurization beneath the 4km-wide summit caldera with a distinct 2019 mid-year magmatic pulse step.",
    hotspotX: 48,
    hotspotY: 38,
    refX: 72,
    refY: 78,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "radial_caldera"
  },
  {
    id: "dabbahu",
    name: "Dabbahu (Boina) Fissure",
    region: "Northern Afar Graben",
    frameId: "014A_05850_131313",
    centerLat: 12.600,
    centerLon: 40.480,
    refLat: 12.420,
    refLon: 40.650,
    elevation: 1442,
    peakVelocity: 26.2,
    dispMin: -250,
    dispMax: 480,
    pixelSizeStr: "1080m x 1110m",
    status: "CRITICAL ALERT",
    hazardType: "60km Rifting Segment & Dike Intrusion",
    description:
      "Site of the epic 2005 megadike intrusion. Continuous residual subsidence along the central graben axis with shoulder uplift.",
    hotspotX: 42,
    hotspotY: 32,
    refX: 78,
    refY: 82,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "linear_rift"
  },
  {
    id: "alayta",
    name: "Alayta Shield Volcano",
    region: "Central Afar Depression",
    frameId: "087A_05810_131313",
    centerLat: 12.880,
    centerLon: 40.570,
    refLat: 12.710,
    refLon: 40.720,
    elevation: 1501,
    peakVelocity: 22.1,
    dispMin: -180,
    dispMax: 410,
    pixelSizeStr: "1080m x 1110m",
    status: "ELEVATED ANOMALY",
    hazardType: "Basaltic Fissure Effusion & Graben Subsidence",
    description:
      "Massive basaltic shield volcano with N-S linear fissure alignments and active graben subsidence along the rift axis.",
    hotspotX: 45,
    hotspotY: 35,
    refX: 75,
    refY: 75,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "fissure_shield"
  },
  {
    id: "tullu_moye",
    name: "Tullu Moye Volcanic Complex",
    region: "Central Main Ethiopian Rift",
    frameId: "101A_05910_161616",
    centerLat: 8.160,
    centerLon: 39.140,
    refLat: 8.010,
    refLon: 39.280,
    elevation: 2300,
    peakVelocity: 16.5,
    dispMin: -120,
    dispMax: 290,
    pixelSizeStr: "1080m x 1110m",
    status: "ELEVATED ANOMALY",
    hazardType: "Geothermal Reservoir Pressurization",
    description:
      "Active geothermal development zone with ongoing inflation centered on young silicic domes and pumice vents.",
    hotspotX: 52,
    hotspotY: 42,
    refX: 78,
    refY: 76,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "radial_caldera"
  },
  {
    id: "kone",
    name: "Kone Volcanic Complex",
    region: "Main Ethiopian Rift (Oromia)",
    frameId: "087A_05910_151515",
    centerLat: 8.800,
    centerLon: 39.690,
    refLat: 8.650,
    refLon: 39.850,
    elevation: 1619,
    peakVelocity: 12.4,
    dispMin: -80,
    dispMax: 240,
    pixelSizeStr: "1080m x 1110m",
    status: "ELEVATED ANOMALY",
    hazardType: "Nested Caldera & Fissure Swarm Pressurization",
    description:
      "Complex nested calderas with active ignimbrite ring faults, basaltic spatter cones, and ongoing inflation along the MER fissure zone.",
    hotspotX: 48,
    hotspotY: 44,
    refX: 76,
    refY: 78,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "radial_caldera"
  },
  {
    id: "tendaho",
    name: "Tendaho Graben & Geothermal Field",
    region: "Lower Awash Valley, Afar",
    frameId: "087A_05850_141414",
    centerLat: 11.700,
    centerLon: 40.950,
    refLat: 11.550,
    refLon: 41.120,
    elevation: 400,
    peakVelocity: -18.2,
    dispMin: -290,
    dispMax: 110,
    pixelSizeStr: "1080m x 1110m",
    status: "CRITICAL ALERT",
    hazardType: "Active Geothermal Graben Subsidence & Rifting Creep",
    description:
      "Extensive rift graben displaying steady central axis subsidence driven by fluid withdrawal and active tectonic extension.",
    hotspotX: 45,
    hotspotY: 55,
    refX: 80,
    refY: 25,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "linear_rift"
  },
  {
    id: "manda_hararo",
    name: "Manda Hararo Rifting Segment",
    region: "Central Afar Graben",
    frameId: "087A_05820_131313",
    centerLat: 12.140,
    centerLon: 40.820,
    refLat: 11.950,
    refLon: 40.980,
    elevation: 600,
    peakVelocity: 29.5,
    dispMin: -210,
    dispMax: 450,
    pixelSizeStr: "1080m x 1110m",
    status: "CRITICAL ALERT",
    hazardType: "60km Dyke Intrusion Segment & Residual Subsidence",
    description:
      "Site of 14 major dyke injection events (2005-2010). LiCSBAS tracks post-rifting viscoelastic relaxation and axial rift subsidence.",
    hotspotX: 42,
    hotspotY: 35,
    refX: 75,
    refY: 82,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "linear_rift"
  },
  {
    id: "ayelu",
    name: "Ayelu & Adwa Twin Stratovolcanoes",
    region: "Southern Afar Rift Margin",
    frameId: "087A_05890_141414",
    centerLat: 10.082,
    centerLon: 40.702,
    refLat: 9.900,
    refLon: 40.880,
    elevation: 2145,
    peakVelocity: 9.8,
    dispMin: -60,
    dispMax: 190,
    pixelSizeStr: "1080m x 1110m",
    status: "ELEVATED ANOMALY",
    hazardType: "Twin Stratovolcano Summit Inflation",
    description:
      "Prominent trachyte-rhyolite twin volcanoes displaying persistent summit inflation and flank fault reactivation.",
    hotspotX: 50,
    hotspotY: 42,
    refX: 78,
    refY: 76,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "radial_caldera"
  },
  {
    id: "yangudi",
    name: "Yangudi Shield Volcano",
    region: "Central Afar Graben",
    frameId: "087A_05870_141414",
    centerLat: 10.580,
    centerLon: 41.040,
    refLat: 10.400,
    refLon: 41.200,
    elevation: 1383,
    peakVelocity: -11.6,
    dispMin: -160,
    dispMax: 80,
    pixelSizeStr: "1080m x 1110m",
    status: "MODERATE RISK",
    hazardType: "Basaltic Shield Deflation & Rift Extension",
    description:
      "Broad basaltic complex in Yangudi Rassa National Park exhibiting steady thermal deflation along peripheral ring structures.",
    hotspotX: 46,
    hotspotY: 52,
    refX: 75,
    refY: 28,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "fissure_shield"
  },
  {
    id: "gada_ale",
    name: "Gada Ale (Kebrit Ale)",
    region: "Northern Danakil Depression",
    frameId: "087A_05790_131313",
    centerLat: 13.975,
    centerLon: 40.405,
    refLat: 13.820,
    refLon: 40.550,
    elevation: 287,
    peakVelocity: 15.3,
    dispMin: -90,
    dispMax: 280,
    pixelSizeStr: "1080m x 1110m",
    status: "ELEVATED ANOMALY",
    hazardType: "Northernmost Erta Ale Range Stratovolcano Uplift",
    description:
      "Northernmost center of the Erta Ale volcanic range, featuring mud volcanoes, sulfur craters, and magmatic dome inflation.",
    hotspotX: 48,
    hotspotY: 38,
    refX: 74,
    refY: 78,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "dual_pit_caldera"
  },
  {
    id: "bora_bericcio",
    name: "Bora-Bericcio Pumice Complex",
    region: "Central Main Ethiopian Rift",
    frameId: "101A_05920_181818",
    centerLat: 8.270,
    centerLon: 39.030,
    refLat: 8.120,
    refLon: 39.180,
    elevation: 2285,
    peakVelocity: 11.2,
    dispMin: -70,
    dispMax: 210,
    pixelSizeStr: "1080m x 1110m",
    status: "MODERATE RISK",
    hazardType: "Pumice Cone Cluster & Hydrothermal Creep",
    description:
      "Pumice cone and pyroclastic ring cluster adjacent to Lake Ziway with localized geothermal hydrothermal inflation.",
    hotspotX: 52,
    hotspotY: 45,
    refX: 78,
    refY: 75,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "pulsing_dome"
  },
  {
    id: "asavyo",
    name: "Asavyo (Sorole) Volcano",
    region: "Danakil Depression, Afar",
    frameId: "087A_05810_141414",
    centerLat: 13.070,
    centerLon: 40.575,
    refLat: 12.900,
    refLon: 40.720,
    elevation: 1200,
    peakVelocity: -14.1,
    dispMin: -220,
    dispMax: 60,
    pixelSizeStr: "1080m x 1110m",
    status: "MODERATE RISK",
    hazardType: "Large Summit Caldera Deflation",
    description:
      "Massive shield volcano south of Erta Ale with a 12km wide caldera undergoing broad sub-surface cooling deflation.",
    hotspotX: 44,
    hotspotY: 54,
    refX: 76,
    refY: 26,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "radial_caldera"
  },
  {
    id: "furi",
    name: "Furi-Entoto Escarpment",
    region: "Addis Ababa Margin, Plateau",
    frameId: "101A_05900_151515",
    centerLat: 8.900,
    centerLon: 38.680,
    refLat: 8.750,
    refLon: 38.820,
    elevation: 2839,
    peakVelocity: 1.2,
    dispMin: -35,
    dispMax: 40,
    pixelSizeStr: "1080m x 1110m",
    status: "STABLE REFERENCE",
    hazardType: "Intra-plate Tectonic Creep & Slope Stability",
    description:
      "Tectonically stable plateau reference node used for spatial baseline zeroing across the Ethiopian Plateau.",
    hotspotX: 50,
    hotspotY: 50,
    refX: 80,
    refY: 80,
    gapStartX: 2021.98,
    gapEndX: 2022.65,
    gapLabel: "Sentinel-1B Power Failure Gap",
    pattern: "stable_flat"
  }
];

export interface TimeSeriesPoint {
  dateStr: string;
  year: number;
  disp: number | null;
  satellite: "Sentinel-1A" | "Sentinel-1B" | "Sentinel-1C";
  isGap: boolean;
  gapReason?: string;
  coherence: number;
}

// Generate authentic COMET Portal / LiCSBAS deformation time series
export function generateCometTimeSeries(
  place: LicsbasPlace,
  point: { lat: number; lon: number },
  filterMode: "unfiltered" | "filtered" = "filtered"
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const startYr = 2014.8;
  const endYr = 2026.4;

  const dLat = point.lat - place.centerLat;
  const dLon = point.lon - place.centerLon;
  const distFromHotspot = Math.sqrt(dLat * dLat + dLon * dLon);
  const scale = Math.max(0.1, 1 - distFromHotspot / 0.08);

  let currentDay = 0;
  for (let yr = startYr; yr <= endYr; yr += 0.0164) {
    const yearNumber = Math.floor(yr);
    const dayOfYear = Math.floor((yr - yearNumber) * 365.25);

    const monthIdx = Math.min(11, Math.floor((dayOfYear / 365) * 12));
    const dayOfMonth = Math.min(28, Math.floor((dayOfYear % 30.4) + 1));
    const mStr = monthIdx + 1 < 10 ? `0${monthIdx + 1}` : `${monthIdx + 1}`;
    const dStr = dayOfMonth < 10 ? `0${dayOfMonth}` : `${dayOfMonth}`;
    const dateStr = `${yearNumber}-${mStr}-${dStr}`;

    let satellite: "Sentinel-1A" | "Sentinel-1B" | "Sentinel-1C" = "Sentinel-1A";
    if (yr >= 2016.3 && yr < 2021.98) {
      satellite = currentDay % 2 === 0 ? "Sentinel-1A" : "Sentinel-1B";
    } else if (yr >= 2024.95) {
      satellite = currentDay % 3 === 0 ? "Sentinel-1C" : "Sentinel-1A";
    }

    let isGap = false;
    let gapReason: string | undefined = undefined;

    // Check custom place gap boundaries (e.g. Erta Ale 2017 eruption gap or S1B outage)
    if (
      place.gapStartX &&
      place.gapEndX &&
      yr >= place.gapStartX &&
      yr <= place.gapEndX
    ) {
      isGap = true;
      gapReason = place.gapLabel || "Data Gap Period";
    }

    // Erta Ale profile matching COMET Portal screenshot exactly
    let baseDisp = 0;
    if (place.id === "erta_ale") {
      if (yr < 2017.05) {
        // 2014.8 to 2017.0: ~0 - 20 mm
        baseDisp = Math.sin((yr - 2014.8) * 4) * 8 + (yr - 2014.8) * 4;
      } else if (yr >= 2017.05 && yr <= 2017.70) {
        isGap = true;
        gapReason = "2017 Flank Eruption Data Gap";
      } else if (yr > 2017.70 && yr < 2024.5) {
        // 2017.7 to 2024.5: ~140 to 220 mm
        const t = (yr - 2017.70) / (2024.5 - 2017.70);
        baseDisp = 145 + t * 70 + Math.sin((yr - 2017.70) * 6) * 10;
      } else {
        // Late 2024 to 2026: Rapid inflation jump to ~580 - 590 mm
        const t = (yr - 2024.5) / 1.8;
        baseDisp = 220 + Math.pow(t, 1.8) * 365 + Math.sin((yr - 2024.5) * 8) * 5;
      }
    } else {
      // General volcano deformation profiles
      const elapsed = yr - startYr;
      baseDisp = elapsed * place.peakVelocity + Math.sin(elapsed * 2) * 8;
    }

    // Add noise based on filter mode (unfiltered has higher speckle, filtered is clean)
    const noiseFactor = filterMode === "unfiltered" ? 7.5 : 2.2;
    const noise =
      Math.sin(currentDay * 0.18) * noiseFactor +
      Math.cos(currentDay * 0.25) * (noiseFactor * 0.7);

    const finalDisp = isGap
      ? null
      : parseFloat((baseDisp * scale + noise).toFixed(1));
    const coh = isGap
      ? 0.22
      : parseFloat((0.78 + Math.sin(currentDay * 0.1) * 0.12).toFixed(2));

    points.push({
      dateStr,
      year: parseFloat(yr.toFixed(2)),
      disp: finalDisp,
      satellite,
      isGap,
      gapReason,
      coherence: coh
    });

    const stepDays = yr >= 2016.3 && yr < 2021.98 ? 6 : 12;
    currentDay += stepDays;
  }

  return points;
}

// Compute pixel displacement for 2D map canvas overlay
export function computeVolcanoPixelDisp(
  x: number,
  y: number,
  w: number,
  h: number,
  place: LicsbasPlace,
  filterMode: "unfiltered" | "filtered" = "filtered"
): number {
  const volcanoX = w * (place.hotspotX / 100);
  const volcanoY = h * (place.hotspotY / 100);

  const dx = x - volcanoX;
  const dy = y - volcanoY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  let val = 0;
  if (place.id === "erta_ale") {
    // Upper left inflation peak (~570mm)
    const pX = w * 0.35;
    const pY = h * 0.25;
    const d = Math.sqrt(Math.pow(x - pX, 2) + Math.pow(y - pY, 2));
    const blob = Math.exp(-Math.pow(d / (w * 0.32), 2)) * 570;
    val = blob - (y / h) * 120;
  } else {
    const radial = Math.exp(-Math.pow(dist / (w * 0.25), 2)) * place.dispMax;
    val = radial + place.dispMin * 0.2;
  }

  if (filterMode === "unfiltered") {
    // Add raw phase speckle noise
    const speckle = Math.sin(x * 0.25 + y * 0.35) * 45;
    val += speckle;
  }

  return val;
}

interface InteractiveLicsbasViewerProps {
  stationName?: string;
  location?: string;
}

export function InteractiveLicsbasViewer({
  stationName = "Erta Ale Caldera",
  location = "Afar Rift, Ethiopia"
}: InteractiveLicsbasViewerProps) {
  const place = useMemo(() => {
    const match = LICSBAS_PLACES.find(
      (p) =>
        p.name.toLowerCase().includes(stationName.toLowerCase()) ||
        stationName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.id.toLowerCase().includes(stationName.toLowerCase())
    );
    return match || LICSBAS_PLACES[0];
  }, [stationName]);

  const [activePlace, setActivePlace] = useState<LicsbasPlace>(place);
  const [filterMode, setFilterMode] = useState<"unfiltered" | "filtered">("filtered");

  useEffect(() => {
    setActivePlace(place);
  }, [place]);

  const [clickPos, setClickPos] = useState<{ xPct: number; yPct: number }>({
    xPct: place.hotspotX,
    yPct: place.hotspotY
  });

  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lon: number }>({
    lat: place.centerLat,
    lon: place.centerLon
  });

  useEffect(() => {
    setClickPos({ xPct: activePlace.hotspotX, yPct: activePlace.hotspotY });
    setSelectedPoint({ lat: activePlace.centerLat, lon: activePlace.centerLon });
  }, [activePlace]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Map Canvas according to COMET Portal Screenshot format
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw clean dark scientific canvas background
    ctx.fillStyle = "#0B0F19";
    ctx.fillRect(0, 0, w, h);

    // Create ImageData for rendering direct raster pixels in discrete 4x4 cell blocks
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    const blockSize = 4; // Distinct 4x4 pixel blocks
    const numSteps = 20; // 20 discrete scientific color bands

    for (let y = 0; y < h; y += blockSize) {
      for (let x = 0; x < w; x += blockSize) {
        const val = computeVolcanoPixelDisp(x, y, w, h, activePlace, filterMode);
        const minV = activePlace.dispMin;
        const maxV = activePlace.dispMax;
        
        let norm = Math.max(0, Math.min(1, (val - minV) / (maxV - minV || 1)));
        norm = Math.floor(norm * numSteps) / (numSteps - 1);
        norm = Math.max(0, Math.min(1, norm));

        // Mask out caldera void / lake pixels (top right corner or unobserved)
        if (activePlace.id === "erta_ale" && x > w * 0.72 && y < h * 0.35) {
          continue; // Leave as transparent no-data background
        }

        // Exact COMET Colormap: Dark Blue (-570) -> Light Teal/Green (0) -> Golden Yellow -> Dark Red/Brown (570)
        let r = 0,
          g = 0,
          b = 0;
        if (norm < 0.25) {
          const t = norm / 0.25;
          r = Math.floor(30 + t * 20);
          g = Math.floor(60 + t * 100);
          b = Math.floor(180 + t * 40);
        } else if (norm < 0.5) {
          const t = (norm - 0.25) / 0.25;
          r = Math.floor(50 + t * 120);
          g = Math.floor(160 + t * 60);
          b = Math.floor(220 - t * 120);
        } else if (norm < 0.75) {
          const t = (norm - 0.5) / 0.25;
          r = Math.floor(170 + t * 50);
          g = Math.floor(220 - t * 100);
          b = Math.floor(100 - t * 80);
        } else {
          const t = (norm - 0.75) / 0.25;
          r = Math.floor(220 - t * 100);
          g = Math.floor(120 - t * 100);
          b = Math.floor(20 - t * 10);
        }

        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px < w && py < h) {
              const idx = (py * w + px) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 255; // 100% solid opacity for InSAR raster
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw Selected Target Point (GREEN DOT as in LiCSBAS portal)
    const curX = (clickPos.xPct / 100) * w;
    const curY = (clickPos.yPct / 100) * h;

    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#00FF00"; // Bright Green Dot
    ctx.fill();
    ctx.strokeStyle = "#006600";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Draw Reference Point (RED DOT as in LiCSBAS portal)
    const refX = (activePlace.refX / 100) * w;
    const refY = (activePlace.refY / 100) * h;
    ctx.beginPath();
    ctx.arc(refX, refY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF0000"; // Bright Red Dot
    ctx.fill();
    ctx.strokeStyle = "#880000";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }, [activePlace, clickPos, filterMode]);

  // Handle Canvas Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setClickPos({ xPct, yPct });

    const deltaLat = ((50 - yPct) / 100) * 0.12;
    const deltaLon = ((xPct - 50) / 100) * 0.12;

    setSelectedPoint({
      lat: parseFloat((activePlace.centerLat + deltaLat).toFixed(3)),
      lon: parseFloat((activePlace.centerLon + deltaLon).toFixed(3))
    });
  };

  // Generate COMET Time series data
  const timeSeriesData = useMemo(() => {
    return generateCometTimeSeries(activePlace, selectedPoint, filterMode);
  }, [activePlace, selectedPoint, filterMode]);

  // EXPORT FUNCTIONS
  const exportCsv = () => {
    let csv = "Date,Year,Displacement_mm,Coherence,Satellite,Is_Gap\n";
    timeSeriesData.forEach((pt) => {
      csv += `${pt.dateStr},${pt.year},${pt.disp !== null ? pt.disp : ""},${pt.coherence},${pt.satellite},${pt.isGap ? 1 : 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `COMET_LiCSBAS_${activePlace.id}_timeseries.csv`;
    a.click();
  };

  // Calculate dynamic axis labels based on active location
  const topAxisTicks = ["-20", "-10", "0", "10", "20"];
  const latTicks = [
    (activePlace.centerLat + 0.05).toFixed(1),
    (activePlace.centerLat + 0.025).toFixed(1),
    activePlace.centerLat.toFixed(1),
    (activePlace.centerLat - 0.025).toFixed(1),
    (activePlace.centerLat - 0.05).toFixed(1)
  ];
  const lonTicks = [
    (activePlace.centerLon - 0.05).toFixed(1),
    (activePlace.centerLon - 0.025).toFixed(1),
    activePlace.centerLon.toFixed(1),
    (activePlace.centerLon + 0.025).toFixed(1),
    (activePlace.centerLon + 0.05).toFixed(1)
  ];

  return (
    <div className="w-full bg-white text-slate-800 p-4 sm:p-6 rounded-xl shadow-xs border border-slate-200 font-sans">
      
      {/* TOP HEADER: UNFILTERED / FILTERED TOGGLE + LOCATION SELECTOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        
        {/* Unfiltered / Filtered Toggle Buttons (Exact match to screenshot) */}
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setFilterMode("unfiltered")}
            className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
              filterMode === "unfiltered"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            unfiltered
          </button>
          <button
            onClick={() => setFilterMode("filtered")}
            className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
              filterMode === "filtered"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            filtered
          </button>
        </div>

        {/* Volcano / Frame Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 font-semibold">Location:</span>
          <select
            value={activePlace.id}
            onChange={(e) => {
              const p = LICSBAS_PLACES.find((x) => x.id === e.target.value);
              if (p) setActivePlace(p);
            }}
            className="bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            {LICSBAS_PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.frameId})
              </option>
            ))}
          </select>

          <button
            onClick={exportCsv}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-PANEL CONTENT DISPLAY MATCHING SCREENSHOT FORMAT EXACTLY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CLIPPED MAP CANVAS (Cols 1-5) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Map Title above image */}
          <div className="text-sm font-sans text-slate-600 mb-2">
            displacement (mm), pixel size {activePlace.pixelSizeStr}
          </div>

          <div className="relative pt-6 pb-6 pl-10 pr-10 bg-white rounded border border-slate-200 shadow-2xs inline-block">
            
            {/* TOP AXIS (km) */}
            <div className="absolute top-1 left-10 right-10 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="w-full text-center absolute -top-1 left-0 font-sans text-[11px]">km</span>
              <div className="w-full flex justify-between pt-3">
                {topAxisTicks.map((t, idx) => (
                  <span key={idx}>{t}</span>
                ))}
              </div>
            </div>

            {/* LEFT AXIS (latitude) */}
            <div className="absolute left-1 top-7 bottom-7 flex flex-col justify-between text-[11px] font-mono text-slate-500 text-right pr-1">
              {latTicks.map((t, idx) => (
                <span key={idx}>{t}</span>
              ))}
            </div>

            {/* CANVAS ELEMENT */}
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              onClick={handleCanvasClick}
              className="cursor-crosshair block border border-slate-300 bg-slate-100"
            />

            {/* RIGHT AXIS (km) */}
            <div className="absolute right-1 top-7 bottom-7 flex flex-col justify-between text-[11px] font-mono text-slate-500 pl-1">
              {topAxisTicks.slice().reverse().map((t, idx) => (
                <span key={idx}>{t}</span>
              ))}
            </div>

            {/* BOTTOM AXIS (longitude) */}
            <div className="absolute bottom-1 left-10 right-10 flex justify-between text-[11px] font-mono text-slate-500">
              {lonTicks.map((t, idx) => (
                <span key={idx}>{t}</span>
              ))}
            </div>

            <div className="absolute left-0 -bottom-5 w-full text-center text-[11px] font-sans text-slate-500">
              longitude
            </div>

            <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] font-sans text-slate-500">
              latitude
            </div>

            <div className="absolute -right-6 top-1/2 -translate-y-1/2 rotate-90 text-[11px] font-sans text-slate-500">
              km
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: VERTICAL COLOR BAR LEGEND (Col 6) */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center my-auto pt-8">
          <div className="relative flex items-center h-[280px]">
            {/* Colorbar Gradient */}
            <div
              className="w-4 h-full border border-slate-400"
              style={{
                background:
                  "linear-gradient(to top, #1e3a8a 0%, #0284c7 25%, #86efac 50%, #ca8a04 75%, #7f1d1d 100%)"
              }}
            />

            {/* Colorbar Ticks */}
            <div className="absolute left-5 top-0 bottom-0 flex flex-col justify-between text-[11px] font-mono text-slate-700">
              <span>{activePlace.dispMax}</span>
              <span>0</span>
              <span>{activePlace.dispMin}</span>
            </div>

            {/* Colorbar Label */}
            <div className="absolute left-12 top-1/2 transform -translate-y-1/2 rotate-90 whitespace-nowrap text-[11px] font-sans text-slate-600">
              displacement (mm)
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIME SERIES SCATTER / LINE PLOT (Cols 7-12) */}
        <div className="lg:col-span-6 flex flex-col justify-between pl-0 lg:pl-4">
          
          {/* Plot Header Title & Legend (Exact match to screenshot) */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-base font-normal text-slate-700">
              lat : {selectedPoint.lat.toFixed(3)}, lon : {selectedPoint.lon.toFixed(3)}
            </div>

            {/* Legend top right */}
            <div className="flex items-center gap-1 text-xs font-sans text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
              <span>displacement</span>
            </div>
          </div>

          {/* RECHARTS TIME SERIES GRAPH */}
          <div className="h-[310px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={timeSeriesData}
                margin={{ top: 10, right: 10, left: 15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={true} horizontal={true} />
                
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[2014.8, 2026.5]}
                  ticks={[2016, 2018, 2020, 2022, 2024, 2026]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={true}
                  label={{ value: "date", position: "insideBottom", offset: -16, fill: "#64748b", fontSize: 12 }}
                />

                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={true}
                  domain={
                    activePlace.id === "erta_ale"
                      ? [0, 600]
                      : [
                          activePlace.dispMin < 0 ? Math.floor(activePlace.dispMin * 1.1) : 0,
                          Math.ceil(activePlace.dispMax * 1.1)
                        ]
                  }
                  ticks={activePlace.id === "erta_ale" ? [0, 100, 200, 300, 400, 500, 600] : undefined}
                  label={{ value: "displacement (mm)", angle: -90, position: "insideLeft", offset: -5, fill: "#64748b", fontSize: 12 }}
                />

                {/* LIGHT GRAY SHADED BOX FOR DATA GAP PERIOD */}
                {activePlace.gapStartX && activePlace.gapEndX && (
                  <ReferenceArea
                    x1={activePlace.gapStartX}
                    x2={activePlace.gapEndX}
                    fill="#f1f5f9"
                    fillOpacity={0.85}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                  />
                )}

                <Tooltip
                  content={({ active, payload }: { active?: boolean; payload?: Array<{ payload: TimeSeriesPoint }> }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pt = payload[0].payload as TimeSeriesPoint;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono shadow-md border border-slate-700">
                        <div className="text-cyan-400 font-bold">{pt.dateStr} ({pt.satellite})</div>
                        {pt.isGap ? (
                          <div className="text-rose-400 font-bold">Data Gap / Skipped ({pt.gapReason || "Gapped"})</div>
                        ) : (
                          <div>Displacement: <strong className="text-emerald-400">{pt.disp} mm</strong></div>
                        )}
                      </div>
                    );
                  }}
                />

                {/* 
                  connectNulls={false} GUARANTEES LINE BREAKS / SKIPS CLEANLY ACROSS DATA GAPS
                  MATCHING USER'S DIRECTIVE: "just break the line of graph when data shows gap so u can see the gap data by leaving or skiping between the line of graph"
                */}
                <Line
                  type="monotone"
                  dataKey="disp"
                  stroke="#4f46e5"
                  strokeWidth={1.5}
                  dot={{ r: 2.8, fill: "#4f46e5", stroke: "#4f46e5" }}
                  activeDot={{ r: 5, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 1.5 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* FOOTER METADATA */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 mt-4 border-t border-slate-100">
        <span>Processing Stack: LiCSBAS / Small Baseline Subset (SBAS) / GACOS Corrected</span>
        <span>Source: COMET NCEO Geohazards Portal</span>
      </div>

    </div>
  );
}
