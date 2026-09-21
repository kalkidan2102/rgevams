import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Earthquake, SeverityLevel } from "../../types";
import {
  Activity,
  Clock,
  Compass,
  X,
  Navigation,
  ShieldAlert,
  Layers,
  Radio,
  Calendar,
  Waves,
  TrendingUp,
  Info,
  Copy,
  Check,
  Globe,
  Download,
  Settings,
  Smartphone,
  Mail
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

type FilterType = "bandpass" | "lowpass" | "highpass" | "none";

function applySeismicFilter(rawData: number[], filter: { type: FilterType; freq?: number; freqmin?: number; freqmax?: number }) {
  if (filter.type === "none") {
    return [...rawData];
  }
  
  const filtered = [...rawData];
  const n = filtered.length;
  
  if (filter.type === "highpass") {
    const f = filter.freq ?? 3.0;
    const beta = Math.min(0.999, Math.max(0.6, 1.0 - (f / 15.0)));
    let trend = filtered[0];
    for (let i = 0; i < n; i++) {
      trend = beta * trend + (1 - beta) * filtered[i];
      filtered[i] = filtered[i] - trend;
    }
    for (let i = 0; i < n; i++) filtered[i] *= 1.8;
  } 
  else if (filter.type === "lowpass") {
    const f = filter.freq ?? 2.0;
    const alpha = Math.min(0.95, Math.max(0.01, (f / 10.0) * 0.5));
    let lastVal = filtered[0];
    for (let i = 0; i < n; i++) {
      filtered[i] = lastVal + alpha * (filtered[i] - lastVal);
      lastVal = filtered[i];
    }
  } 
  else if (filter.type === "bandpass") {
    const fmin = filter.freqmin ?? 0.5;
    const fmax = filter.freqmax ?? 5.0;
    
    const lpAlpha = Math.min(0.95, Math.max(0.01, (fmax / 10.0) * 0.5));
    let lastVal = filtered[0];
    for (let i = 0; i < n; i++) {
      filtered[i] = lastVal + lpAlpha * (filtered[i] - lastVal);
      lastVal = filtered[i];
    }
    
    const hpBeta = Math.min(0.999, Math.max(0.6, 1.0 - (fmin / 15.0)));
    let trend = filtered[0];
    for (let i = 0; i < n; i++) {
      trend = hpBeta * trend + (1 - hpBeta) * filtered[i];
      filtered[i] = filtered[i] - trend;
    }
    for (let i = 0; i < n; i++) filtered[i] *= 2.0;
  }
  
  return filtered;
}

interface EarthquakeDetailPanelProps {
  earthquake: Earthquake;
  onClose: () => void;
  onExploreNode?: (id: string) => void;
  onFocusOnMap?: (coords: [number, number]) => void;
  onTriggerSmartAlert?: (earthquake: Earthquake) => void;
}

export function EarthquakeDetailPanel({
  earthquake,
  onClose,
  onExploreNode,
  onFocusOnMap,
  onTriggerSmartAlert
}: EarthquakeDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "live" | "trend" | "wave" | "earth">("info");

  // Google Earth Geologist 3D Controller States
  const [earthHeading, setEarthHeading] = useState<number>(35);
  const [earthTilt, setEarthTilt] = useState<number>(45);
  const [earthRange, setEarthRange] = useState<number>(2500);
  const [copiedKml, setCopiedKml] = useState<boolean>(false);
  const [lithoLayer, setLithoLayer] = useState<"crust" | "mantle" | "fault">("fault");

  // Waveform visualization states (IU.FURI ObsPy simulation)
  const [waveSource, setWaveSource] = useState<"node" | "furi" | "obspy_default">("node");
  const [waveFilterType, setWaveFilterType] = useState<FilterType>("highpass");
  const [waveFreqMin, setWaveFreqMin] = useState<number>(3.0);
  const [waveFreqMax, setWaveFreqMax] = useState<number>(8.0);
  const [waveComponent, setWaveComponent] = useState<"Z" | "N" | "E">("Z");
  const [isFetchingWave, setIsFetchingWave] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Real-time FURI Station API states
  const [furiWaveData, setFuriWaveData] = useState<number[] | null>(null);
  const [furiDataSource, setFuriDataSource] = useState<string>("IU.FURI Station (Simulated Stream)");
  const [isFuriLoading, setIsFuriLoading] = useState<boolean>(false);
  const [waveHoverData, setWaveHoverData] = useState<{
    time: number;
    amp: number;
    svgX: number;
    svgY: number;
    year: number;
    dateFormatted: string;
    utcTimeFormatted: string;
    eatTimeFormatted: string;
  } | null>(null);

  useEffect(() => {
    if (!earthquake || waveSource !== "furi") {
      setFuriWaveData(null);
      return;
    }

    let active = true;
    setIsFuriLoading(true);

    const qEventTime = encodeURIComponent(earthquake.dateTime || new Date().toISOString());
    const qMag = earthquake.magnitude ?? 5.0;
    const qDepth = earthquake.depth ?? 10;

    fetch(`/api/seismic/furi?eventTime=${qEventTime}&component=${waveComponent}&magnitude=${qMag}&depth=${qDepth}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("HTTP error " + res.status);
        }
        return res.json();
      })
      .then(data => {
        if (!active) return;
        if (data && data.raw) {
          setFuriWaveData(data.raw);
          setFuriDataSource(data.source || "IU.FURI Station (Simulated Stream)");
        }
        setIsFuriLoading(false);
      })
      .catch(() => {
        if (active) {
          setIsFuriLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [earthquake?.id, earthquake?.dateTime, earthquake?.magnitude, earthquake?.depth, waveComponent, waveSource]);

  const formattedDate = useMemo(() => {
    if (!earthquake?.dateTime) return "N/A";
    return new Date(earthquake.dateTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    });
  }, [earthquake?.dateTime]);

  const getRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const severityColors: Record<SeverityLevel, { text: string; bg: string; border: string; accent: string }> = {
    Red: {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-200 dark:border-rose-500/30",
      accent: "bg-rose-500"
    },
    Orange: {
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-200 dark:border-orange-500/30",
      accent: "bg-orange-500"
    },
    Yellow: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/30",
      accent: "bg-amber-500"
    },
    Green: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/30",
      accent: "bg-emerald-500"
    }
  };

  const currentTheme = severityColors[earthquake.severity] || severityColors.Yellow;

  // Real-time FURI wave scrolling animation
  const [timeStep, setTimeStep] = useState(0);

  useEffect(() => {
    let animId: number;
    const tick = () => {
      setTimeStep(prev => (prev + 1) % 1000000);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const liveWavePoints = useMemo(() => {
    const pointsCount = 130;
    const points: string[] = [];
    const tBase = timeStep * 0.12;

    for (let i = 0; i < pointsCount; i++) {
      const t = tBase + i * 0.08;
      
      // Base seismic background noise
      let val = Math.sin(t * 7.5) * 0.12 + Math.cos(t * 15.3) * 0.06 + Math.sin(t * 1.2) * 0.1;

      // Realistic recurring shock envelope based on magnitude
      const envelopePhase = (tBase + i * 0.08) % 18;
      if (envelopePhase > 2 && envelopePhase < 14) {
        const tEvent = envelopePhase - 2;
        // P-wave compression
        if (tEvent < 2.0) {
          val += Math.sin(tEvent * 30) * Math.exp(-tEvent * 1.5) * (earthquake.magnitude * 0.25);
        }
        // S-wave high amplitude arrival
        if (tEvent >= 1.8) {
          const tS = tEvent - 1.8;
          val += Math.sin(tS * 5.5) * Math.exp(-tS * 0.25) * (earthquake.magnitude * 1.1);
          val += Math.cos(tS * 14.2) * Math.exp(-tS * 0.18) * (earthquake.magnitude * 0.3);
        }
      }

      // Map coordinate system: width 240, height 70
      const x = (i / (pointsCount - 1)) * 240;
      const y = 35 + val * 6; // Center at y=35, scale by 6
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(" ");
  }, [timeStep, earthquake.magnitude]);

  // Generate Simulated RJOB/FURI Seismogram Stream data specifically for this earthquake event
  const eventWaveData = useMemo(() => {
    const pointsCount = 200;
    let raw: number[] = [];
    const isZ = waveComponent === "Z";
    const isN = waveComponent === "N";
    const isE = waveComponent === "E";
    
    if (waveSource === "obspy_default") {
      // Iconic GSE2 ObsPy sample trace simulation
      for (let i = 0; i < pointsCount; i++) {
        const t = i * 0.15; // 30s scale
        
        // Background noise
        const noise = Math.sin(t * 18.5) * 0.12 + Math.cos(t * 31.2) * 0.08 + Math.sin(t * 0.9) * 0.15;
        
        // P-wave arrival at t = 6.0s (index 40)
        let pWave = 0;
        const pArrival = 6.0;
        if (t > pArrival) {
          const tp = t - pArrival;
          const amp = isZ ? 2.5 : isE ? 1.5 : 0.8;
          pWave = Math.sin(tp * 24.0) * Math.exp(-tp * 0.8) * amp;
        }
        
        // S-wave arrival at t = 13.5s (index 90)
        let sWave = 0;
        const sArrival = 13.5;
        if (t > sArrival) {
          const ts = t - sArrival;
          const amp = isN ? 6.5 : isE ? 4.8 : 2.2;
          sWave = Math.sin(ts * 5.5) * Math.exp(-ts * 0.18) * amp + Math.sin(ts * 11.0) * Math.exp(-ts * 0.4) * (amp * 0.4);
        }
        
        raw.push(noise + pWave + sWave);
      }
    } else {
      if (furiWaveData && furiWaveData.length > 0) {
        raw = [...furiWaveData];
      } else {
        // FURI station real magnitude/depth simulation
        // Scale parameters based on earthquake magnitude and depth
        const magFactor = earthquake.magnitude;
        const depthDelay = Math.min(10.0, Math.max(2.0, earthquake.depth * 0.15)); // deeper events arrive later or have different envelope
        
        for (let i = 0; i < pointsCount; i++) {
          const t = i * 0.15; // 30 seconds total simulation
          
          // Baseline low-frequency drift / trend (tide/instrument drift)
          const drift = Math.sin(t * 0.12) * 2.0 + Math.cos(t * 0.04) * 0.8;
          // Background crustal noise
          const noise = Math.sin(t * 15.2) * 0.15 + Math.cos(t * 28.4) * 0.1 + Math.sin(t * 1.8) * 0.2;
          
          // P-wave arrival at t = depthDelay
          let pWave = 0;
          const pArrival = depthDelay;
          if (t > pArrival && t < pArrival + 6.0) {
            const tp = t - pArrival;
            const scale = isE ? 1.2 : isZ ? 1.0 : 0.5;
            pWave = Math.sin(tp * 20.0) * Math.exp(-tp * 0.6) * 1.8 * magFactor * scale;
          }
          
          // S-wave arrival at t = depthDelay + 4.0s
          let sWave = 0;
          const sArrival = depthDelay + 4.0;
          if (t > sArrival) {
            const ts = t - sArrival;
            const scale = isN ? 1.4 : isE ? 0.8 : 0.6;
            sWave = (Math.sin(ts * 6.0) * Math.exp(-ts * 0.15) * 5.0 + Math.sin(ts * 12.0) * Math.exp(-ts * 0.3) * 2.0) * magFactor * scale;
          }
          
          raw.push(drift + noise + pWave + sWave);
        }
      }
    }
    
    // Apply selected filter logic
    const filterParams = {
      type: waveFilterType,
      freq: waveFilterType === "highpass" ? waveFreqMin : waveFreqMax,
      freqmin: waveFreqMin,
      freqmax: waveFreqMax
    };
    
    const filtered = applySeismicFilter(raw, filterParams);
    
    return {
      raw,
      filtered
    };
  }, [earthquake, waveSource, waveComponent, waveFilterType, waveFreqMin, waveFreqMax, furiWaveData]);

  const obspyCode = useMemo(() => {
    let filterLine = "";
    if (waveFilterType === "highpass") {
      filterLine = `st.filter(type='highpass', freq=${waveFreqMin.toFixed(1)})`;
    } else if (waveFilterType === "lowpass") {
      filterLine = `st.filter(type='lowpass', freq=${waveFreqMax.toFixed(1)})`;
    } else if (waveFilterType === "bandpass") {
      filterLine = `st.filter(type='bandpass', freqmin=${waveFreqMin.toFixed(1)}, freqmax=${waveFreqMax.toFixed(1)})`;
    }

    if (waveSource === "obspy_default") {
      return `from obspy import read
st = read()  # load example seismogram
${filterLine ? filterLine + "\n" : ""}st = st.select(component='${waveComponent}')
st.plot()`;
    } else {
      return `from obspy import read
# Fetch raw seismogram from IU.FURI station
st = read("http://service.iris.edu/fdsnws/dataselect/1/query?net=IU&sta=FURI&cha=HH${waveComponent}&mag=${earthquake.magnitude}")
${filterLine ? filterLine + "\n" : ""}st.plot()`;
    }
  }, [waveSource, waveFilterType, waveFreqMin, waveFreqMax, waveComponent, earthquake.magnitude]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(obspyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 90 Days Seismic Rate & Peak Magnitude history generator
  const ninetyDaysData = useMemo(() => {
    if (!earthquake) return [];
    let hash = 0;
    const eqId = earthquake.id || "eq";
    for (let i = 0; i < eqId.length; i++) {
      hash = eqId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const data = [];
    for (let d = 1; d <= 90; d++) {
      const baseFreq = Math.abs(Math.sin(hash + d * 0.14) * 6) + 1;
      let maxMag = Math.abs(Math.cos(hash + d * 0.2) * 1.4) + 1.2;
      let dailyCount = baseFreq;

      // Simulated main shock around day 60
      if (d === 60) {
        maxMag = earthquake.magnitude ?? 5.0;
        dailyCount = Math.round((earthquake.magnitude ?? 5.0) * 12 + 6);
      } else if (d > 60 && d <= 76) {
        // Aftershock decay
        const daysAfter = d - 60;
        const decay = Math.exp(-daysAfter * 0.2);
        maxMag = Math.max(1.2, (earthquake.magnitude ?? 5.0) - (daysAfter * 0.22) + Math.sin(d * 1.5) * 0.3);
        dailyCount = baseFreq + Math.round(((earthquake.magnitude ?? 5.0) * 12) * decay);
      } else if (d >= 54 && d < 60) {
        // Foreshock build-up
        const daysBefore = 60 - d;
        maxMag = Math.max(1.2, (earthquake.magnitude ?? 5.0) - (daysBefore * 0.5) + Math.cos(d * 1.2) * 0.2);
        dailyCount = baseFreq + Math.round(((earthquake.magnitude ?? 5.0) * 3) / daysBefore);
      }

      data.push({
        day: d,
        "Peak Mag": parseFloat(maxMag.toFixed(1)),
        "Daily Tremors": Math.round(dailyCount)
      });
    }
    return data;
  }, [earthquake?.id, earthquake?.magnitude]);

  // Regional Seismic Monitoring Nodes
  const REGIONAL_NODES = useMemo(() => [
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
  ], []);

  // Compute nearest seismic monitoring node and node telemetry parameters for ALL epicenters
  const nodeTelemetry = useMemo(() => {
    if (!earthquake || !earthquake.coordinates) {
      return {
        nodeCode: "IU.FURI",
        nodeName: "Entoto Observatory",
        nodeRegion: "Addis Ababa",
        distanceKm: 0,
        pWaveTravelSec: "0.0",
        sWaveTravelSec: "0.0",
        pga: "0.020",
        mmi: "III (Weak)",
        focalSolution: { strike: 30, dip: 45, rake: -90 },
        status: "Node Telemetry Retrieved"
      };
    }
    const [lat, lng] = earthquake.coordinates;
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
    const pWaveTravelSec = (distKm / 6.2).toFixed(1);
    const sWaveTravelSec = (distKm / 3.6).toFixed(1);

    const mag = earthquake.magnitude ?? 5.0;
    const pga = Math.min(0.85, (0.015 * Math.pow(10, 0.45 * mag) / Math.max(5, distKm * 0.75))).toFixed(3);
    const mmi = mag >= 6.0 ? "VII (Very Strong)" : mag >= 5.0 ? "VI (Strong)" : mag >= 4.0 ? "IV (Light)" : "III (Weak)";

    let hash = 0;
    const eqId = earthquake.id || "eq";
    for (let i = 0; i < eqId.length; i++) {
      hash = eqId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const strike = Math.abs((hash * 17) % 360);
    const dip = Math.abs((hash * 13) % 45 + 35);
    const rake = -110 + Math.abs((hash * 7) % 40);

    return {
      nodeCode: closest.code,
      nodeName: closest.name,
      nodeRegion: closest.region,
      distanceKm: distKm,
      pWaveTravelSec,
      sWaveTravelSec,
      pga,
      mmi,
      focalSolution: { strike, dip, rake },
      status: "Node Telemetry Retrieved"
    };
  }, [earthquake?.coordinates, earthquake?.magnitude, earthquake?.id, REGIONAL_NODES]);

  // Dynamic Geologist observatory DSS (Decision Support System) assessment report
  const dssAssessment = useMemo(() => {
    if (!earthquake || !earthquake.coordinates) {
      return {
        region: "East African Rift Segment",
        risk: "Moderate (Yellow)",
        nearbyVolcano: "Mount Fentale (~25 km)",
        recommendation: "Deploy local station micro-seismic arrays.",
        nodeCode: "IU.FURI",
        nodeDistance: 10
      };
    }
    const [lat, lng] = earthquake.coordinates;
    const loc = (earthquake.location || "").toLowerCase();
    const mag = earthquake.magnitude ?? 5.0;

    let region = "East African Rift Segment";
    let nearbyVolcano = "Mount Fentale (~25 km)";
    let risk = mag >= 5.5 ? "Critical (Red)" : mag >= 4.5 ? "High (Orange)" : "Moderate (Yellow)";
    let recommendation = "Deploy local station micro-seismic arrays and record baseline ground motion velocity.";

    if (lat < 6.5 && lng < 37.8) {
      region = "Turmi / South Omo Graben Zone";
      nearbyVolcano = "Corbetti Caldera (~145 km)";
      recommendation = "Audit Southern Rift crustal strain vectors and monitor local ground water table anomalies.";
    } else if (lng > 41.8 || loc.includes("arta") || loc.includes("djibouti") || loc.includes("tadjoura")) {
      region = "Arta / Gulf of Aden Oceanic Rift Sector";
      nearbyVolcano = "Ardoukoba Fissure Volcano (~38 km)";
      recommendation = "Synchronize Djibouti Arta observatory hydrophone feeds and strainmeter logs.";
    } else if (loc.includes("fentale") || loc.includes("metehara") || loc.includes("awash") || (lat >= 8.5 && lat <= 9.8 && lng >= 39.2 && lng <= 41.0)) {
      region = "Fentale / Awash Central Rift Segment";
      nearbyVolcano = "Mount Fentale Volcano (~12 km)";
      recommendation = "Inspect Awash highway bridges and initiate micro-tremor modeling on civil edifices.";
    } else if (loc.includes("afar") || loc.includes("dobi") || loc.includes("serdo") || loc.includes("dabbahu") || loc.includes("semera") || (lat >= 10.5 && lat <= 13.5 && lng >= 40.0 && lng <= 42.0)) {
      region = "Afar Triple Junction / Graben System";
      nearbyVolcano = "Erta Ale Shield Volcano (~45 km)";
      recommendation = "Deploy thermal satellite scan arrays and increase ground telemetry intervals.";
    } else if (loc.includes("wondo") || loc.includes("hawassa") || loc.includes("ziway") || (lat >= 6.5 && lat < 8.5 && lng >= 37.8 && lng <= 39.5)) {
      region = "Main Ethiopian Rift Lakes Sector";
      nearbyVolcano = "Aluto Geothermal Center (~19 km)";
      recommendation = "Coordinate with Aluto Geothermal project managers to audit steam vent pressures.";
    } else {
      region = `${nodeTelemetry.nodeRegion} (Zone ${lat.toFixed(1)}°N-${lng.toFixed(1)}°E)`;
      nearbyVolcano = `Dallol/Erta Rift Complex (~${Math.round(nodeTelemetry.distanceKm + 15)} km)`;
      recommendation = `Continuous waveform telemetry retrieval active via nearest station ${nodeTelemetry.nodeCode}.`;
    }

    return {
      region,
      risk,
      nearbyVolcano,
      recommendation,
      nodeCode: nodeTelemetry.nodeCode,
      nodeDistance: nodeTelemetry.distanceKm
    };
  }, [earthquake?.coordinates, earthquake?.location, earthquake?.magnitude, nodeTelemetry]);

  if (!earthquake) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute top-4 right-4 z-[1002] w-[320px] sm:w-[350px] bg-white/95 dark:bg-[#041B2D]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden select-none font-sans flex flex-col max-h-[560px]"
    >
      {/* Header Banner */}
      <div className={`p-3 border-b border-slate-150 dark:border-white/5 flex items-center justify-between shrink-0 ${currentTheme.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg text-white ${currentTheme.accent} shadow-sm animate-pulse`}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-450 dark:text-slate-400 block">
              Seismic Event Alert
            </span>
            <span className={`text-[10px] font-bold uppercase font-mono ${currentTheme.text}`}>
              {earthquake.severity} Level Activity
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer border-0"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-slate-50 dark:bg-slate-900/50 border-b border-slate-150 dark:border-white/5 shrink-0 text-[10px] font-bold">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 text-center transition-all border-b-2 ${
            activeTab === "info"
              ? "border-blue-500 text-blue-600 dark:text-cyan-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => {
            setActiveTab("wave");
            setIsFetchingWave(true);
            setTimeout(() => {
              setIsFetchingWave(false);
            }, 800);
          }}
          className={`flex-1 py-2 text-center transition-all border-b-2 flex items-center justify-center gap-0.5 relative overflow-hidden ${
            activeTab === "wave"
              ? "border-blue-500 text-blue-600 dark:text-cyan-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          } ${isFetchingWave ? "animate-pulse bg-red-500/5 text-red-600 dark:text-red-400 font-black shadow-[inset_0_0_12px_rgba(239,68,68,0.1)]" : ""}`}
          id="furi-tab-detail-wave"
        >
          <Waves className="w-3 h-3 text-red-500" />
          Wave
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`flex-1 py-2 text-center transition-all border-b-2 flex items-center justify-center gap-1 ${
            activeTab === "live"
              ? "border-blue-500 text-blue-600 dark:text-cyan-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Live
        </button>
        <button
          onClick={() => setActiveTab("trend")}
          className={`flex-1 py-2 text-center transition-all border-b-2 ${
            activeTab === "trend"
              ? "border-blue-500 text-blue-600 dark:text-cyan-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          90D Trend
        </button>
        <button
          onClick={() => setActiveTab("earth")}
          className={`flex-1 py-2 text-center transition-all border-b-2 flex items-center justify-center gap-0.5 ${
            activeTab === "earth"
              ? "border-blue-500 text-blue-600 dark:text-cyan-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Globe className="w-3 h-3 text-emerald-500 animate-[spin_12s_linear_infinite]" />
          3D Earth
        </button>
      </div>

      {/* Tab contents (Scrollable middle container) */}
      <div className="flex-grow overflow-y-auto min-h-0 p-4 space-y-4">
        {activeTab === "info" && (
          <div className="space-y-4 animate-fade-in">
            {/* Location & Coordinates */}
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug tracking-tight">
                {earthquake.location}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {earthquake.coordinates[0].toFixed(5)}°N, {earthquake.coordinates[1].toFixed(5)}°E
                </span>
                {earthquake.isHistorical && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider ml-1.5">
                    Historic
                  </span>
                )}
              </div>
            </div>

            {/* Triple Primary Metrics */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-white/5 rounded-xl p-2 text-center">
                <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Magnitude
                </span>
                <span className={`text-base font-black font-mono tracking-tight block mt-1 ${currentTheme.text}`}>
                  M {earthquake.magnitude.toFixed(1)}
                </span>
                <span className="text-[7.5px] text-slate-400 block mt-0.5">Richter Scale</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-white/5 rounded-xl p-2 text-center">
                <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Focal Depth
                </span>
                <span className="text-base font-black font-mono tracking-tight text-slate-800 dark:text-slate-100 block mt-1">
                  {earthquake.depth} <span className="text-[10px] font-bold text-slate-400">km</span>
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-cyan-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (earthquake.depth / 45) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-white/5 rounded-xl p-2 text-center">
                <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Event Time
                </span>
                <span className="text-[9px] font-mono font-black text-slate-800 dark:text-slate-200 block truncate mt-1">
                  {getRelativeTime(earthquake.dateTime)}
                </span>
                <span className="text-[7.5px] text-slate-400 block mt-1">Calculated UT</span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="bg-slate-50/60 dark:bg-[#031425]/40 border border-slate-150 dark:border-white/5 p-3 rounded-xl">
              <span className="text-[8.5px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Geodynamical Description & Context
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-350 italic leading-relaxed">
                "{earthquake.description}"
              </p>
            </div>

            {/* Assigned Primary Seismic Node (Retrieved Telemetry) */}
            <div className="bg-cyan-950/20 dark:bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl space-y-2 text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-[9.5px] font-mono font-black text-cyan-600 dark:text-cyan-300 uppercase tracking-wider">
                    Assigned Node: {nodeTelemetry.nodeCode}
                  </span>
                </div>
                <span className="text-[8px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                  Telemetry Active
                </span>
              </div>

              <div className="text-[10px] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Station Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{nodeTelemetry.nodeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Epicenter Distance:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{nodeTelemetry.distanceKm} km</span>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-cyan-500/10 text-[9px]">
                  <div>P-Wave: <strong className="text-amber-500">+{nodeTelemetry.pWaveTravelSec}s</strong></div>
                  <div>S-Wave: <strong className="text-rose-500">+{nodeTelemetry.sWaveTravelSec}s</strong></div>
                  <div>PGA: <strong className="text-slate-700 dark:text-slate-200">{nodeTelemetry.pga} g</strong></div>
                  <div>MMI: <strong className="text-slate-700 dark:text-slate-200">{nodeTelemetry.mmi}</strong></div>
                </div>
              </div>

              <button
                onClick={() => {
                  setWaveSource("node");
                  setIsFetchingWave(true);
                  setTimeout(() => setActiveTab("wave"), 200);
                  setTimeout(() => setIsFetchingWave(false), 900);
                }}
                className="w-full mt-1.5 py-1.5 px-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-extrabold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>Retrieve Node Stream ({nodeTelemetry.nodeCode}) ↗</span>
              </button>
            </div>

            {/* DSS Assessment */}
            <div className="bg-[#0f172a]/95 dark:bg-[#020b14]/90 text-white p-3 rounded-xl border border-red-500/20 space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-500" />
                  DSS Impact Assessment
                </span>
                <span className="text-[7.5px] bg-red-500/20 border border-red-500/30 text-red-400 font-mono px-1 rounded font-bold uppercase animate-pulse">
                  SYSTEM EVAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                <div>
                  <span className="text-[8px] text-slate-400 font-mono block">REGION:</span>
                  <span className="font-bold text-slate-100 truncate block">{dssAssessment.region}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 font-mono block">SEISMIC RISK:</span>
                  <span className={`font-bold ${
                    dssAssessment.risk.includes("Critical") ? "text-red-500" : "text-orange-400"
                  }`}>{dssAssessment.risk}</span>
                </div>
                <div className="col-span-2 pt-0.5 border-t border-white/5">
                  <span className="text-[8px] text-slate-400 font-mono block"> officer recommendation:</span>
                  <p className="text-[9.5px] text-slate-300 italic leading-normal">
                    &bull; {dssAssessment.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Emergency SMS & DRMC Bulletin Dispatch */}
            {onTriggerSmartAlert && (
              <button
                onClick={() => onTriggerSmartAlert(earthquake)}
                className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-500/40 active:scale-98"
                title="Dispatch Smart USGS Emergency Bilingual SMS & Official DRMC Email Bulletin"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-200" />
                <span>Smart Emergency SMS &amp; Bulletin</span>
              </button>
            )}

            {/* Seismic Wave View button */}
            <button
              onClick={() => {
                setIsFetchingWave(true);
                // 400ms delay to show the beautiful button pulse state before switching views
                setTimeout(() => {
                  setActiveTab("wave");
                }, 400);
                setTimeout(() => {
                  setIsFetchingWave(false);
                }, 1200);
              }}
              className={`w-full py-2.5 px-4 border text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none ${
                isFetchingWave
                  ? "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400 animate-pulse scale-98 shadow-inner font-black"
                  : "bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 hover:border-red-500/40 text-red-600 dark:text-red-400 font-extrabold"
              }`}
              id="view-seismic-wave-btn"
              disabled={isFetchingWave}
            >
              <Waves className={`w-4 h-4 text-red-500 ${isFetchingWave ? "animate-spin" : "animate-pulse"}`} />
              <span>{isFetchingWave ? "Fetching Station Stream..." : "Seismic Wave View (IU.FURI ObsPy)"}</span>
            </button>
          </div>
        )}

        {activeTab === "wave" && (
          <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {isFetchingWave ? (
              /* Simulated loading state */
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Fetching Simulated Waveform...
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-550 font-mono mt-1">
                    Querying IU.FURI dataselect endpoint...
                  </p>
                </div>
              </div>
            ) : (
              /* Waveform controls & display */
              <div className="space-y-3">
                {/* Data Source Selector */}
                <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-white/5 shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setWaveSource("node");
                      setIsFetchingWave(true);
                      setTimeout(() => {
                        setIsFetchingWave(false);
                      }, 400);
                    }}
                    className={`flex-1 py-1.5 px-1.5 text-[9.5px] font-bold rounded-lg transition-all cursor-pointer text-center border-0 ${
                      waveSource === "node"
                        ? "bg-cyan-600 text-white shadow-xs font-black animate-pulse"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    Node ({nodeTelemetry.nodeCode})
                  </button>
                  <button
                    onClick={() => {
                      setWaveSource("furi");
                      setIsFetchingWave(true);
                      setTimeout(() => {
                        setIsFetchingWave(false);
                      }, 550);
                    }}
                    className={`flex-1 py-1.5 px-1.5 text-[9.5px] font-bold rounded-lg transition-all cursor-pointer text-center border-0 ${
                      waveSource === "furi"
                        ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    IU.FURI Stream
                  </button>
                  <button
                    onClick={() => {
                      setWaveSource("obspy_default");
                      setIsFetchingWave(true);
                      setTimeout(() => {
                        setIsFetchingWave(false);
                      }, 350);
                    }}
                    className={`flex-1 py-1.5 px-1.5 text-[9.5px] font-bold rounded-lg transition-all cursor-pointer text-center border-0 ${
                      waveSource === "obspy_default"
                        ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    ObsPy GSE2
                  </button>
                </div>

                {/* Info summary */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-150 dark:border-white/5 text-[9.5px] space-y-1">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-slate-450">STATION NODE:</span>
                    <span className="text-slate-800 dark:text-slate-250 truncate max-w-[200px]">
                      {waveSource === "node" 
                        ? `${nodeTelemetry.nodeCode} (${nodeTelemetry.distanceKm} km)`
                        : waveSource === "furi"
                          ? "IU.FURI (Entoto Observatory)"
                          : "GSE2 (ObsPy Default)"}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-slate-450">CHANNEL ID:</span>
                    <span className="text-cyan-500 font-extrabold">
                      {waveSource === "node" ? `HH${waveComponent} (${nodeTelemetry.nodeCode} 100Hz)` : waveSource === "furi" ? `EH${waveComponent} (IU.FURI)` : `Trace Component (${waveComponent})`}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-slate-450">EPICENTER MAG:</span>
                    <span className="text-slate-800 dark:text-slate-200">M {earthquake.magnitude.toFixed(1)} ({earthquake.location})</span>
                  </div>
                </div>

                {/* Component & Filter Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                      Component Channel
                    </label>
                    <select
                      value={waveComponent}
                      onChange={(e) => {
                        setWaveComponent(e.target.value as "Z" | "N" | "E");
                        setIsFetchingWave(true);
                        setTimeout(() => {
                          setIsFetchingWave(false);
                        }, 400);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/10 py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
                    >
                      <option value="Z">Z (Vertical)</option>
                      <option value="N">N (North-South)</option>
                      <option value="E">E (East-West)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                      ObsPy Filter
                    </label>
                    <select
                      value={waveFilterType}
                      onChange={(e) => {
                        setWaveFilterType(e.target.value as FilterType);
                        setIsFetchingWave(true);
                        setTimeout(() => {
                          setIsFetchingWave(false);
                        }, 400);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-white/10 py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
                    >
                      <option value="none">No Filter (Raw)</option>
                      <option value="bandpass">Bandpass</option>
                      <option value="lowpass">Lowpass</option>
                      <option value="highpass">Highpass</option>
                    </select>
                  </div>
                </div>

                {/* Slider corner frequencies */}
                {waveFilterType !== "none" && (
                  <div className="bg-slate-50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-150 dark:border-white/5 space-y-2">
                    {(waveFilterType === "bandpass" || waveFilterType === "highpass") && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono font-bold">
                          <span className="text-slate-400">MIN CORNER (freqmin)</span>
                          <span className="text-red-500">{waveFreqMin.toFixed(2)} Hz</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="3.0"
                          step="0.1"
                          value={waveFreqMin}
                          onChange={(e) => setWaveFreqMin(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>
                    )}

                    {(waveFilterType === "bandpass" || waveFilterType === "lowpass") && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono font-bold">
                          <span className="text-slate-400">MAX CORNER (freqmax)</span>
                          <span className="text-red-500">{waveFreqMax.toFixed(2)} Hz</span>
                        </div>
                        <input
                          type="range"
                          min="3.0"
                          max="15.0"
                          step="0.5"
                          value={waveFreqMax}
                          onChange={(e) => setWaveFreqMax(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* RAW & FILTERED Waveform Stack with Framer Motion Entrance */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-2 relative"
                >
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                    <span className="flex items-center gap-1 font-bold text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse"></span>
                      {waveSource === "obspy_default" ? `ObsPy Default trace (component='${waveComponent}')` : `FURI wave trace BH${waveComponent}`}
                    </span>
                    <span>{waveFilterType === "none" ? "RAW STREAM" : `${waveFilterType.toUpperCase()} DIGITAL`}</span>
                  </div>

                  <div className="h-28 bg-black/40 border border-slate-900 rounded-lg relative overflow-hidden">
                    {/* Simulated Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                    </div>

                    {/* Loader overlay */}
                    {isFuriLoading && (
                      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 z-20">
                        <Waves className="w-4 h-4 text-red-500 animate-bounce" />
                        <span className="text-[7.5px] font-mono font-bold text-red-400 uppercase tracking-widest animate-pulse">
                          Fetching IU.FURI Stream...
                        </span>
                      </div>
                    )}

                    {/* Plot SVG */}
                    <svg
                      className="w-full h-full absolute inset-0 cursor-crosshair"
                      viewBox="0 0 200 112"
                      preserveAspectRatio="none"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        const normX = Math.max(0, Math.min(1, mouseX / rect.width));
                        const timeSec = normX * 30.0;
                        const dataArr = eventWaveData.filtered.length > 0 ? eventWaveData.filtered : eventWaveData.raw;
                        const ptIdx = Math.floor(normX * (dataArr.length - 1));
                        const ampVal = dataArr[ptIdx] || 0;

                        let originIso = (earthquake.dateTime || "").trim();
                        if (!originIso.includes("Z") && !originIso.includes("+") && !originIso.slice(10).includes("-")) {
                          if (originIso.length === 16) originIso += ":00.000Z";
                          else if (originIso.length === 19) originIso += ".000Z";
                          else originIso += "Z";
                        }
                        const originParsed = new Date(originIso);
                        const originTimeMs = isNaN(originParsed.getTime()) 
                          ? new Date("2026-08-09T14:22:00.000Z").getTime() 
                          : originParsed.getTime();

                        const hoveredMs = originTimeMs + timeSec * 1000;
                        const hoveredDate = new Date(hoveredMs);
                        const year = hoveredDate.getUTCFullYear();

                        const dateFormatted = hoveredDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC"
                        });

                        const hUtc = String(hoveredDate.getUTCHours()).padStart(2, "0");
                        const mUtc = String(hoveredDate.getUTCMinutes()).padStart(2, "0");
                        const sUtc = String(hoveredDate.getUTCSeconds()).padStart(2, "0");
                        const msUtc = String(hoveredDate.getUTCMilliseconds()).padStart(3, "0");
                        const utcTimeFormatted = `${hUtc}:${mUtc}:${sUtc}.${msUtc} UTC`;

                        const eatDate = new Date(hoveredMs + 3 * 3600 * 1000);
                        const hEat = String(eatDate.getUTCHours()).padStart(2, "0");
                        const mEat = String(eatDate.getUTCMinutes()).padStart(2, "0");
                        const sEat = String(eatDate.getUTCSeconds()).padStart(2, "0");
                        const eatTimeFormatted = `${hEat}:${mEat}:${sEat}.${msUtc} EAT`;

                        const svgX = normX * 200;
                        const svgY = 56 + ampVal * 3.0;

                        setWaveHoverData({
                          time: parseFloat(timeSec.toFixed(2)),
                          amp: parseFloat(ampVal.toFixed(2)),
                          svgX,
                          svgY,
                          year,
                          dateFormatted,
                          utcTimeFormatted,
                          eatTimeFormatted
                        });
                      }}
                      onMouseLeave={() => setWaveHoverData(null)}
                    >
                      {/* Raw trace (dark grey background) if filter active */}
                      {waveFilterType !== "none" && (
                        <motion.polyline
                          fill="none"
                          stroke="#334155"
                          strokeWidth="1.0"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.55 }}
                          transition={{ duration: 1.0, ease: "easeOut" }}
                          points={eventWaveData.raw.map((val, idx) => {
                            const x = (idx / (eventWaveData.raw.length - 1)) * 200;
                            const y = 56 + val * 2.5;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          }).join(" ")}
                        />
                      )}

                      {/* Active Filtered Trace Line */}
                      <motion.polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.85, ease: "easeInOut" }}
                        points={eventWaveData.filtered.map((val, idx) => {
                          const x = (idx / (eventWaveData.filtered.length - 1)) * 200;
                          const y = 56 + val * 3.0;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(" ")}
                      />

                      {/* Crosshair indicator */}
                      {waveHoverData && (
                        <g>
                          <line
                            x1={waveHoverData.svgX}
                            y1="0"
                            x2={waveHoverData.svgX}
                            y2="112"
                            stroke="#38bdf8"
                            strokeWidth="0.75"
                            strokeDasharray="2,1"
                          />
                          <circle
                            cx={waveHoverData.svgX}
                            cy={waveHoverData.svgY}
                            r="2.5"
                            fill="#38bdf8"
                            stroke="#ffffff"
                            strokeWidth="0.75"
                          />
                        </g>
                      )}
                    </svg>

                    {/* Floating Hover Badge on Waveform */}
                    {waveHoverData && (
                      <div className="absolute top-1 left-2 right-2 bg-slate-950/95 text-white text-[8px] font-mono px-2 py-1 rounded-md border border-cyan-400/50 shadow-xl pointer-events-none flex items-center justify-between backdrop-blur-md z-30 animate-fade-in">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[7px] uppercase">
                            YEAR {waveHoverData.year}
                          </span>
                          <span className="text-cyan-300 font-bold">{waveHoverData.dateFormatted}</span>
                          <span className="text-slate-200">{waveHoverData.utcTimeFormatted}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold">+{waveHoverData.time}s</span>
                          <span className="text-emerald-400 font-bold">{waveHoverData.amp} &mu;m/s</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-1 left-2 text-[6.5px] font-mono text-slate-500 max-w-[140px] truncate" title={waveSource === "furi" ? furiDataSource : "ObsPy Sample Trace"}>
                      {waveSource === "furi" ? furiDataSource : "ObsPy Sample Trace"}
                    </div>

                    <div className="absolute bottom-1 right-2 text-[6.5px] font-mono text-slate-500">
                      ObsPy Butterworth Model
                    </div>
                  </div>
                </motion.div>

                {/* Python ObsPy Code generator snippet */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    <span>ObsPy Python Script</span>
                    <button
                      onClick={handleCopyCode}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-650 dark:text-slate-350 rounded font-mono text-[8px] flex items-center gap-1 transition-all cursor-pointer border-0"
                    >
                      {copiedCode ? "Copied!" : "Copy code"}
                    </button>
                  </div>
                  <pre className="p-2 bg-[#090b10] rounded-lg text-[8.5px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-normal text-left max-h-24">
                    <code>{obspyCode}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "live" && (
          <div className="space-y-4 animate-fade-in">
            {/* Real-time FURI Seismometer Header */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-150 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase text-red-500 font-black tracking-widest flex items-center gap-1">
                  <Radio className="w-3 h-3 text-red-500 animate-pulse" /> Live Telemetry Feed
                </span>
                <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold uppercase">
                  ONLINE
                </span>
              </div>
              <h4 className="font-extrabold text-xs text-slate-800 dark:text-white mt-1 uppercase">
                Mount Furi Seismograph (IU.FURI)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Continuous high-rate broadband channel HHZ records ground displacement live near the western boundary of the Main Ethiopian Rift.
              </p>
            </div>

            {/* Live Seismogram Waveform Plot */}
            <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2 relative">
              <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-450 uppercase">
                <span className="flex items-center gap-1 font-bold text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block"></span>
                  Ground Trace Output (Vertical)
                </span>
                <span>CH: HHZ (40.0 Hz)</span>
              </div>

              {/* Wave SVG Container */}
              <div className="h-20 bg-black/40 border border-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                {/* Simulated Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-2 opacity-5 pointer-events-none">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                </div>

                {/* Plot Line */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 240 70" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    points={liveWavePoints}
                    style={{ vectorEffect: "non-scaling-stroke" }}
                  />
                </svg>

                <div className="absolute bottom-1 right-2 text-[7.5px] font-mono text-slate-500">
                  Amplitude: mm/s
                </div>
              </div>

              <div className="flex justify-between text-[7.5px] font-mono text-slate-500">
                <span>Rift Zone: Central sector</span>
                <span>Epoch: Real-time dynamic stream</span>
              </div>
            </div>

            {/* Signal analysis stats */}
            <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-150 dark:border-white/5 rounded-xl p-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-1.5 bg-white dark:bg-slate-950/40 rounded border border-slate-100 dark:border-white/3">
                <span className="text-slate-450 uppercase block text-[7.5px]">RMS POWER</span>
                <span className="font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                  {(0.12 + Math.abs(Math.sin(timeStep * 0.05)) * 0.25).toFixed(3)} nm/s
                </span>
              </div>
              <div className="p-1.5 bg-white dark:bg-slate-950/40 rounded border border-slate-100 dark:border-white/3">
                <span className="text-slate-450 uppercase block text-[7.5px]">SATELLITE SYNC</span>
                <span className="font-extrabold text-amber-500 mt-0.5 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                  24 SVs
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "trend" && (
          <div className="space-y-4 animate-fade-in flex flex-col h-full">
            {/* Header description */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-white/5 rounded-xl p-3">
              <span className="text-[9px] font-mono uppercase text-amber-500 font-extrabold tracking-widest flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 90-Day Seismic Timeline Rate
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Displays maximum daily magnitude ( Richter scale ) and total micro-tremor event frequency centered on Day 60 (the primary active fault rupture event).
              </p>
            </div>

            {/* Recharts chart representation */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-2 h-[155px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ninetyDaysData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.4} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#475569" 
                    fontSize={8} 
                    tickFormatter={(val: number | string) => `D${val}`}
                    tickLine={false}
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={8} 
                    tickLine={false}
                    axisLine={false}
                    fontFamily="monospace"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#020617", 
                      borderColor: "#1e293b", 
                      borderRadius: "8px",
                      fontSize: "9px",
                      fontFamily: "monospace",
                      color: "#f1f5f9"
                    }}
                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Peak Mag" 
                    stroke="#ef4444" 
                    strokeWidth={1.8} 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Daily Tremors" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5} 
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend / Info footer for graph */}
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-900/10 p-2 rounded-lg border border-slate-100 dark:border-white/3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-red-500 inline-block"></span>
                <span>Peak Magnitude</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-blue-500 border-dashed border-t-2 inline-block"></span>
                <span>Daily Tremor Frequency</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "earth" && (
          <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* 3D Geologist Desk Title */}
            <div className="bg-emerald-500/5 border border-emerald-500/25 p-3 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-emerald-500 font-extrabold tracking-widest flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                Google Earth 3D Geologist Desk
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Command center for 3D geodynamic observation. Set the orbit pitch, range, and rotation azimuth to examine the seismic fault-slip.
              </p>
            </div>

            {/* Radar Orbital Scanning Sphere (Simulated Interactive Canvas) */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 relative overflow-hidden h-36 flex flex-col justify-between">
              {/* Decorative Tech Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:10px_10px] opacity-20 pointer-events-none" />
              
              <div className="flex justify-between items-center text-[8px] font-mono text-emerald-400 uppercase z-10 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                  Radar Scanner Mode: ACTIVE
                </span>
                <span>FOV: 45° | LITHOSPHERE REF</span>
              </div>

              {/* Vector Globe Ring showing Azimuth & Tilt pitch */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-24 h-24 text-emerald-500/35 animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" />
                </svg>

                {/* Simulated Epicenter Pointer node reflecting Slider State */}
                <motion.div
                  animate={{ 
                    x: Math.sin((earthHeading * Math.PI) / 180) * 24,
                    y: -Math.cos((earthTilt * Math.PI) / 180) * 16,
                  }}
                  transition={{ type: "spring", stiffness: 85, damping: 15 }}
                  className="w-2.5 h-2.5 bg-red-500 rounded-full absolute shadow-[0_0_12px_#ef4444]"
                />
              </div>

              {/* Coordinates overlay */}
              <div className="flex justify-between text-[7.5px] font-mono text-slate-500 z-10 pt-24 border-t border-slate-900/40">
                <span>RADAR AZIMUTH: {earthHeading}°</span>
                <span>ALT RANGE: {earthRange.toLocaleString()}m</span>
              </div>
            </div>

            {/* Orbit & Camera Flight Sliders */}
            <div className="bg-slate-50 dark:bg-slate-900/35 border border-slate-150 dark:border-white/5 rounded-xl p-3.5 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono font-black">
                  <span className="text-slate-400 dark:text-slate-500">CAMERA BEARING / AZIMUTH</span>
                  <span className="text-emerald-500 font-bold font-mono">{earthHeading}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={earthHeading}
                  onChange={(e) => setEarthHeading(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono font-black">
                  <span className="text-slate-400 dark:text-slate-500">CAMERA LOOK-PITCH / TILT</span>
                  <span className="text-emerald-500 font-bold font-mono">{earthTilt}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="85"
                  value={earthTilt}
                  onChange={(e) => setEarthTilt(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono font-black">
                  <span className="text-slate-400 dark:text-slate-500">ALTITUDE SCAN RANGE</span>
                  <span className="text-emerald-500 font-bold font-mono">{earthRange.toLocaleString()}m</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="250"
                  value={earthRange}
                  onChange={(e) => setEarthRange(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Sub-surface Lithosphere Cross Section */}
            <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-150 dark:border-white/5 rounded-xl p-3 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Sub-surface Hypocenter Cross-Section
                </span>
                <div className="flex gap-1">
                  {(["fault", "crust", "mantle"] as const).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => setLithoLayer(layer)}
                      className={`px-1.5 py-0.5 rounded text-[7.5px] font-mono uppercase font-black cursor-pointer border-0 ${
                        lithoLayer === layer
                          ? "bg-emerald-500/15 text-emerald-500 font-black border border-emerald-500/30"
                          : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-250"
                      }`}
                    >
                      {layer}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Lithospheric Section Block */}
              <div className="h-20 bg-[#060a10] border border-slate-900 rounded-lg relative overflow-hidden flex flex-col justify-end">
                {/* Geological strata rendering */}
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                  {/* Epicenter cross */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute"></span>
                    <span className="text-[7.5px] text-red-400 font-mono font-black uppercase mt-2">
                      FOCAL DEPTH: {earthquake.depth}km
                    </span>
                  </div>

                  {lithoLayer === "fault" && (
                    <>
                      <div className="border-t border-dashed border-red-500/30 w-full h-0 absolute top-1/2 left-0 rotate-12" />
                      <div className="border-t border-dashed border-red-500/30 w-full h-0 absolute top-1/2 left-0 -rotate-12" />
                      <span className="text-[7px] text-slate-550 font-mono">Tectonic Graben Slip-Plane</span>
                    </>
                  )}

                  {lithoLayer === "crust" && (
                    <>
                      <div className="w-full h-4 bg-emerald-500/10 absolute top-0 left-0 border-b border-emerald-500/20" />
                      <div className="w-full h-8 bg-amber-500/5 absolute bottom-0 left-0 border-t border-amber-500/10" />
                      <span className="text-[7px] text-slate-500 font-mono mt-0.5">Basaltic Upper Crust (Moho: 12km)</span>
                    </>
                  )}

                  {lithoLayer === "mantle" && (
                    <>
                      <div className="w-6 h-full bg-gradient-to-t from-red-500/25 to-orange-500/5 absolute left-1/2 -translate-x-1/2" />
                      <span className="text-[7px] text-orange-400/90 font-mono">Plume Pathways (Lava Flow)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* KML Export Console */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 font-extrabold uppercase tracking-wider">
                <span>Standard KML Export</span>
                <button
                  onClick={() => {
                    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>ESSGI Seismic Alert: ${earthquake.id}</name>
    <Placemark>
      <name>M${earthquake.magnitude.toFixed(1)} - ${earthquake.location}</name>
      <description>Depth: ${earthquake.depth}km | Time: ${earthquake.dateTime}</description>
      <Point>
        <coordinates>${earthquake.coordinates[1]},${earthquake.coordinates[0]},0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;
                    navigator.clipboard.writeText(kml);
                    setCopiedKml(true);
                    setTimeout(() => setCopiedKml(false), 2000);
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded font-mono text-[8px] flex items-center gap-1 transition-all cursor-pointer border-0"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  {copiedKml ? "Copied KML!" : "Copy Geologist KML"}
                </button>
              </div>
              <pre className="p-2 bg-[#060a10] rounded-lg text-[8px] font-mono text-emerald-500 overflow-x-auto border border-slate-900 leading-normal max-h-16 text-left">
                <code>{`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>M${earthquake.magnitude.toFixed(1)} Epicenter Node</name>
    <Point>
      <coordinates>${earthquake.coordinates[1]},${earthquake.coordinates[0]},0</coordinates>
    </Point>
  </Document>
</kml>`}</code>
              </pre>
            </div>

            {/* Dynamic Orbit Launch Button */}
            <a
              href={`https://earth.google.com/web/@${earthquake.coordinates[0]},${earthquake.coordinates[1]},1850a,${earthRange}d,35y,${earthHeading}h,${earthTilt}t,0r`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border-0 uppercase tracking-widest text-center no-underline"
            >
              <Globe className="w-4 h-4 text-white animate-spin-slow" />
              <span>Launch 3D Geologist Flight ↗</span>
            </a>
          </div>
        )}
      </div>

      {/* Footer Timestamp & Coordinates */}
      <div className="p-3 bg-slate-50 dark:bg-[#031526]/80 border-t border-slate-150 dark:border-white/5 shrink-0 text-[10px] font-mono text-slate-400 dark:text-slate-500">
        <div className="flex items-center justify-between">
          <span>UTC: {formattedDate.split(",")[0]}</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">Operational</span>
        </div>
        
        {/* Actions row */}
        <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-slate-150 dark:border-white/5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onFocusOnMap?.(earthquake.coordinates)}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-extrabold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-0"
            >
              <Navigation className="w-3 h-3 text-blue-500" />
              <span>Focus Epicenter</span>
            </button>

            {onExploreNode && (
              <button
                onClick={() => onExploreNode(earthquake.id)}
                className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-0 shadow-sm"
              >
                <Layers className="w-3 h-3" />
                <span>Seismic Node ↗</span>
              </button>
            )}
          </div>

          <a
            href={`https://earth.google.com/web/@${earthquake.coordinates[0]},${earthquake.coordinates[1]},1500d`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-2 bg-emerald-600/10 hover:bg-emerald-600/15 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center no-underline"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Open Epicenter in Google Earth ↗</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
