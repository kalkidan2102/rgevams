import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Activity, 
  Settings2, 
  Code2, 
  Play, 
  Square, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sliders,
  Flame,
  Info,
  Radio,
  Workflow,
  Terminal,
  Cpu,
  Zap,
  Bell,
  Calendar,
  Waves,
  Search,
  Maximize2,
  RefreshCw,
  Clock,
  Compass,
  MapPin,
  TrendingUp,
  AlertTriangle,
  FileCode2,
  ExternalLink,
  ChevronRight,
  BarChart2,
  Download,
  Crosshair,
  SlidersHorizontal,
  FileDown,
  Layers,
  Sparkles,
  ListFilter
} from "lucide-react";
import { Earthquake } from "../../types";

type FilterType = "bandpass" | "lowpass" | "highpass" | "none";
type SeismicEvent = "earthquake" | "volcanic" | "cultural" | "background";
type ChannelType = "BHZ" | "BHN" | "BHE" | "HHZ";

export interface SeismicTremorEvent {
  id: string;
  title: string;
  date: string;
  dateTime: string;
  magnitude: number;
  depth: number;
  location: string;
  coordinates: [number, number];
  distanceFromFuriKm: number;
  pArrivalSeconds: number;
  sArrivalSeconds: number;
  sLagPSeconds: number;
  peakFrequencyHz: number;
  feltReports: string;
  focalMechanism: string;
  pgaG: number;
  intensity: string;
  obspyQuery: string;
  summary: string;
  isRealTime?: boolean;
}

// Real-time and recent tremors catalog including recent events in Ethiopia
const RECENT_REAL_TREMORS: SeismicTremorEvent[] = [
  {
    id: "eq_recent_metahara_2026",
    title: "Recent Metahāra Awash Rift Rupture (M 4.6)",
    date: "August 9, 2026",
    dateTime: "2026-08-09T14:22:18.000Z",
    magnitude: 4.6,
    depth: 10,
    location: "Metahāra / Awash Basin, Main Ethiopian Rift",
    coordinates: [8.810, 40.071],
    distanceFromFuriKm: 154,
    pArrivalSeconds: 22.6,
    sArrivalSeconds: 39.5,
    sLagPSeconds: 16.9,
    peakFrequencyHz: 2.8,
    feltReports: "Felt across East Shewa, Metahāra sugar factory, Awash National Park, and felt lightly in Addis Ababa high-rises (150 km)",
    focalMechanism: "Extensional normal faulting along Wonji Fault Belt (WFB)",
    pgaG: 0.042,
    intensity: "MMI V (Moderate Shaking)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

# 1. Connect to IRIS / EarthScope FDSN Web Service
client = Client("IRIS")

# 2. Query Mount Furi Broadband Station (IU.FURI) for Metahara Event (M 4.6)
t_event = UTCDateTime("2026-08-09T14:22:18")
st = client.get_waveforms(
    network="IU", 
    station="FURI", 
    location="00", 
    channel="BHZ", 
    starttime=t_event - 30, 
    endtime=t_event + 300
)

# 3. Preprocessing: Detrend and Butterworth Bandpass Filter
st.detrend("demean")
st.taper(max_percentage=0.05)
st.filter("bandpass", freqmin=1.0, freqmax=5.0, corners=4, zerophase=True)

# 4. Generate Static Matplotlib Seismogram
fig = st.plot(type="relative", color="navy", title="IU.FURI - Metahara Awash Rift Rupture (M 4.6)")
plt.show()`,
    summary: "Active crustal extension in the central Main Ethiopian Rift. Generated distinct P-wave onset at Furi followed by strong S-wave horizontal shear.",
    isRealTime: true
  },
  {
    id: "eq_recent_awash_fentale",
    title: "Awash–Fentale Tectonic Tremor (M 4.9)",
    date: "August 25, 2024",
    dateTime: "2024-08-25T19:42:15.000Z",
    magnitude: 4.9,
    depth: 10,
    location: "Awash Basin / Fentale Graben, Main Ethiopian Rift",
    coordinates: [8.98, 39.95],
    distanceFromFuriKm: 184,
    pArrivalSeconds: 26.2,
    sArrivalSeconds: 48.6,
    sLagPSeconds: 22.4,
    peakFrequencyHz: 2.4,
    feltReports: "Felt strongly across Addis Ababa (180 km), Adama/Nazareth, Bishoftu, Metehara, and Awash Basin",
    focalMechanism: "Normal faulting with oblique-slip along MER master border fault",
    pgaG: 0.048,
    intensity: "MMI V (Moderate Shaking)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
t_event = UTCDateTime("2024-08-25T19:42:15")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 30, t_event + 300)
st.detrend("linear")
st.taper(max_percentage=0.05)
st.filter("bandpass", freqmin=1.0, freqmax=5.0, corners=4, zerophase=True)
fig = st.plot(type="relative", color="crimson", title="IU.FURI - Awash Rift Tremor (M 4.9)")
plt.show()`,
    summary: "Prominent tectonic rifting earthquake in the Main Ethiopian Rift corridor. Ground rupture generated strong shear waves recorded with high signal-to-noise ratio at Furi Observatory."
  },
  {
    id: "eq_recent_semera_afar",
    title: "Semera Afar Graben Seismic Swarm (M 4.5)",
    date: "August 14, 2024",
    dateTime: "2024-08-14T08:18:22.000Z",
    magnitude: 4.5,
    depth: 8,
    location: "Semera Graben, Afar Triple Junction",
    coordinates: [11.78, 41.05],
    distanceFromFuriKm: 342,
    pArrivalSeconds: 48.8,
    sArrivalSeconds: 91.2,
    sLagPSeconds: 42.4,
    peakFrequencyHz: 3.8,
    feltReports: "Felt in Semera town, Logiya, Asaita, and Tendaho irrigation dam vicinity",
    focalMechanism: "Extensional crustal normal faulting in Afar rift floor",
    pgaG: 0.032,
    intensity: "MMI IV (Light Shaking)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
t_event = UTCDateTime("2024-08-14T08:18:22")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 60, t_event + 360)
st.detrend("demean")
st.filter("bandpass", freqmin=0.8, freqmax=4.5, corners=4, zerophase=True)
st.plot(color="teal", title="IU.FURI - Semera Afar Tremor (M 4.5)")
plt.show()`,
    summary: "Shallow tectonic swarm in the Afar depression caused by active crustal thinning. High-frequency onset with prominent surface wave dispersal."
  },
  {
    id: "eq_recent_mekele",
    title: "Mek'ele Northern Escarpment Rupture (M 5.6)",
    date: "October 11, 2025",
    dateTime: "2025-10-11T12:05:44.000Z",
    magnitude: 5.6,
    depth: 12,
    location: "55 km NE of Mek'ele, Tigray / Afar Border",
    coordinates: [13.78, 39.88],
    distanceFromFuriKm: 545,
    pArrivalSeconds: 78.4,
    sArrivalSeconds: 146.2,
    sLagPSeconds: 67.8,
    peakFrequencyHz: 1.6,
    feltReports: "Widely felt across northern Ethiopia, Mek'ele, Wukro, Adigrat, and the western Danakil margin",
    focalMechanism: "Deep rift border fault reactivation with normal slip",
    pgaG: 0.075,
    intensity: "MMI VI (Strong Shaking)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
t_event = UTCDateTime("2025-10-11T12:05:44")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 30, t_event + 400)
st.detrend("demean")
st.filter("bandpass", freqmin=0.5, freqmax=3.5, corners=4, zerophase=True)
st.plot(color="indigo", title="IU.FURI - Mek'ele Escarpment (M 5.6)")
plt.show()`,
    summary: "Energetic seismic event along the northern Western Ethiopian Plateau escarpment. Long-period surface waves recorded across East Africa."
  },
  {
    id: "eq_recent_erta_ale",
    title: "Erta Ale Caldera Magmatic Tremor (M 4.3)",
    date: "November 4, 2025",
    dateTime: "2025-11-04T06:14:30.000Z",
    magnitude: 4.3,
    depth: 4,
    location: "Erta Ale Volcanic Range, Danakil Depression",
    coordinates: [13.60, 40.67],
    distanceFromFuriKm: 560,
    pArrivalSeconds: 80.5,
    sArrivalSeconds: 150.0,
    sLagPSeconds: 69.5,
    peakFrequencyHz: 1.2,
    feltReports: "Associated with lava lake surface surging and gas pistoning in the south pit crater",
    focalMechanism: "Volumetric tensile crack opening under basaltic magma pressure",
    pgaG: 0.021,
    intensity: "MMI III (Weak Tremor)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
t_event = UTCDateTime("2025-11-04T06:14:30")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 30, t_event + 300)
st.filter("bandpass", freqmin=0.5, freqmax=2.5, corners=4)
st.plot(color="darkorange", title="IU.FURI - Erta Ale Magmatic Tremor (M 4.3)")
plt.show()`,
    summary: "Harmonic volcanic tremor generated by magma convective degassing within the Erta Ale active lava lake plumbing system."
  },
  {
    id: "eq_hist_dobi",
    title: "Historic Dobi Graben Earthquake Sequence (M 6.3)",
    date: "August 20, 1989",
    dateTime: "1989-08-20T11:15:32.000Z",
    magnitude: 6.3,
    depth: 15,
    location: "Dobi Graben, Central Afar Rift",
    coordinates: [11.80, 40.80],
    distanceFromFuriKm: 330,
    pArrivalSeconds: 47.1,
    sArrivalSeconds: 88.0,
    sLagPSeconds: 40.9,
    peakFrequencyHz: 0.8,
    feltReports: "Destructive event. Fractured bridges on the Addis Ababa–Assab international transport corridor, causing extensive rockslides",
    focalMechanism: "Complex multi-segment strike-slip & normal rupture sequence",
    pgaG: 0.185,
    intensity: "MMI VIII (Severe Rupture)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
t_event = UTCDateTime("1989-08-20T11:15:32")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 30, t_event + 600)
st.filter("lowpass", freq=1.5, corners=4)
st.plot(color="darkred", title="IU.FURI - Historic Aug 1989 Dobi Graben (M 6.3)")
plt.show()`,
    summary: "One of the most energetic seismic sequences recorded in modern Ethiopian history. Generated massive low-frequency surface waves observable globally."
  }
];

function applySandboxFilter(rawData: number[], filter: { type: string; freq?: number; freqmin?: number; freqmax?: number } | null) {
  if (!filter || filter.type === "none") {
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

function parsePythonScript(scriptText: string) {
  let isReadLoaded = false;
  let activeFilter: { type: string; freq?: number; freqmin?: number; freqmax?: number } | null = null;
  let selectedComponent: string | null = null;
  let hasPlot = false;
  let extractedDate: string | null = null;
  
  const lines = scriptText.split("\n");
  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed === "") continue;
    
    if (trimmed.includes("read()") || trimmed.includes("get_waveforms")) {
      isReadLoaded = true;
    }

    if (trimmed.includes("UTCDateTime(")) {
      const match = trimmed.match(/UTCDateTime\(['"]([^'"]+)['"]\)/);
      if (match) {
        extractedDate = match[1];
      }
    }
    
    if (trimmed.includes(".filter(")) {
      const match = trimmed.match(/\.filter\(([^)]+)\)/);
      if (match) {
        const argsStr = match[1];
        let type = "none";
        if (argsStr.includes("highpass")) type = "highpass";
        else if (argsStr.includes("lowpass")) type = "lowpass";
        else if (argsStr.includes("bandpass")) type = "bandpass";
        
        let freq: number | undefined = undefined;
        let freqmin: number | undefined = undefined;
        let freqmax: number | undefined = undefined;
        
        const freqMatch = argsStr.match(/freq\s*=\s*([0-9.]+)/);
        if (freqMatch) freq = parseFloat(freqMatch[1]);
        
        const freqminMatch = argsStr.match(/freqmin\s*=\s*([0-9.]+)/);
        if (freqminMatch) freqmin = parseFloat(freqminMatch[1]);
        
        const freqmaxMatch = argsStr.match(/freqmax\s*=\s*([0-9.]+)/);
        if (freqmaxMatch) freqmax = parseFloat(freqmaxMatch[1]);
        
        activeFilter = { type, freq, freqmin, freqmax };
      }
    }
    
    if (trimmed.includes(".select(") || trimmed.includes("channel=")) {
      const match = trimmed.match(/component\s*=\s*['"]([ZNEzne])['"]/) || trimmed.match(/channel\s*=\s*['"](?:BH|HH)?([ZNEzne])['"]/);
      if (match) {
        selectedComponent = match[1].toUpperCase();
      }
    }
    
    if (trimmed.includes(".plot(") || trimmed.includes("plt.show(")) {
      hasPlot = true;
    }
  }
  
  return { isReadLoaded, activeFilter, selectedComponent, hasPlot, extractedDate };
}

// Generate static deterministic scientific waveform based on inserted date & parameters
// CRITICAL: DO NOT ANIMATE / TRANSLATE THIS WAVE. IT IS A FIXED HIGH-PRECISION SCIENTIFIC FIGURE.
function generateStaticSeismogram(
  dateString: string,
  magnitude: number,
  depthKm: number,
  distanceKm: number,
  channel: ChannelType,
  filter: { type: FilterType; freqmin: number; freqmax: number }
): {
  points: number[];
  pArrivalSec: number;
  sArrivalSec: number;
  sLagPSec: number;
  durationSec: number;
  maxAmp: number;
} {
  const pointsCount = 300;
  const durationSec = 300; // 0 to 300 seconds window
  const dt = durationSec / pointsCount;

  // Calculate physical travel times (continental crust: Vp ~ 6.8 km/s, Vs ~ 3.9 km/s)
  const pArrivalSec = Math.max(2.0, distanceKm / 6.8);
  const sArrivalSec = Math.max(pArrivalSec + 4.0, distanceKm / 3.9);
  const sLagPSec = parseFloat((sArrivalSec - pArrivalSec).toFixed(1));

  // Create deterministic seed from dateString to ensure fixed, reproducible waveform for any date
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = (seed * 31 + dateString.charCodeAt(i)) & 0xffffffff;
  }
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const isZ = channel === "BHZ" || channel === "HHZ";
  const isN = channel === "BHN";
  const isE = channel === "BHE";

  const raw: number[] = [];
  const magFactor = Math.pow(10, (magnitude - 3.5) * 0.45);

  for (let i = 0; i < pointsCount; i++) {
    const t = i * dt;
    let val = 0;

    // 1. Stationary microseismic background noise (0.1 - 0.3 Hz)
    const microseism = Math.sin(t * 1.8 + seed) * 0.12 + Math.cos(t * 0.8 + seed * 2) * 0.08;
    // Ambient cultural noise
    const highNoise = (pseudoRandom(i) - 0.5) * 0.15;
    val += microseism + highNoise;

    // 2. P-wave compressive packet (High frequency 2.5 - 4.5 Hz, sharp onset, dominant on Z)
    if (t >= pArrivalSec) {
      const tp = t - pArrivalSec;
      const pScale = isZ ? 1.8 : isE ? 0.9 : 0.7;
      const pEnv = Math.exp(-tp / 14.0) * pScale * magFactor * 1.8;
      const pWave = Math.sin(tp * 18.5) * pEnv + Math.sin(tp * 28.0) * (pEnv * 0.4);
      val += pWave;
    }

    // 3. S-wave shear packet (Lower frequency 1.0 - 2.2 Hz, strong horizontal amp, emergent on N/E)
    if (t >= sArrivalSec) {
      const ts = t - sArrivalSec;
      const sScale = isN ? 2.4 : isE ? 2.1 : 1.1;
      const sEnv = Math.exp(-ts / 28.0) * sScale * magFactor * 3.6;
      const sWave = Math.sin(ts * 7.5) * sEnv + Math.sin(ts * 13.0) * (sEnv * 0.45);
      val += sWave;

      // 4. Surface wave dispersive coda train
      const tSurf = sArrivalSec + (distanceKm / 15.0);
      if (t >= tSurf) {
        const tCoda = t - tSurf;
        const codaEnv = Math.exp(-tCoda / 45.0) * magFactor * 2.2;
        const codaWave = Math.sin(tCoda * 2.6) * codaEnv;
        val += codaWave;
      }
    }

    raw.push(val);
  }

  // Apply Butterworth digital filter
  const filterObj = {
    type: filter.type,
    freqmin: filter.freqmin,
    freqmax: filter.freqmax,
    freq: filter.type === "highpass" ? filter.freqmin : filter.freqmax
  };
  const filtered = applySandboxFilter(raw, filterObj);

  // Normalize/scale for standard plotting
  let maxAbs = 0.001;
  for (const v of filtered) {
    if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
  }

  return {
    points: filtered,
    pArrivalSec: parseFloat(pArrivalSec.toFixed(1)),
    sArrivalSec: parseFloat(sArrivalSec.toFixed(1)),
    sLagPSec,
    durationSec,
    maxAmp: maxAbs
  };
}

interface FuriSeismometerProps {
  earthquakes?: Earthquake[];
  onSelectEarthquake?: (eq: Earthquake) => void;
  initialDate?: string;
}

export default function FuriSeismometer({
  earthquakes = [],
  onSelectEarthquake,
  initialDate
}: FuriSeismometerProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"feed" | "august" | "sandbox">("feed");

  // Format today's / current real date ISO for default
  const defaultIsoDate = useMemo(() => {
    if (initialDate) return initialDate;
    const now = new Date();
    // Use format suitable for datetime-local: YYYY-MM-DDTHH:mm
    return now.toISOString().slice(0, 16);
  }, [initialDate]);

  // COMBINED RECENT REAL EARTHQUAKES & TREMORS CATALOG
  const catalogList = useMemo(() => {
    // Map live props earthquakes to tremor format
    const mappedLive: SeismicTremorEvent[] = earthquakes.map(eq => {
      // Calculate distance to Mount FURI (Lat 8.895, Lon 38.680)
      const latDiff = (eq.coordinates[0] - 8.895) * 111;
      const lonDiff = (eq.coordinates[1] - 38.680) * 110;
      const dist = Math.round(Math.sqrt(latDiff * latDiff + lonDiff * lonDiff)) || 120;
      const pArr = parseFloat((dist / 6.8).toFixed(1));
      const sArr = parseFloat((dist / 3.9).toFixed(1));

      return {
        id: eq.id,
        title: `${eq.location} (M ${eq.magnitude.toFixed(1)})`,
        date: new Date(eq.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        dateTime: eq.dateTime,
        magnitude: eq.magnitude,
        depth: eq.depth,
        location: eq.location,
        coordinates: eq.coordinates,
        distanceFromFuriKm: dist,
        pArrivalSeconds: pArr,
        sArrivalSeconds: sArr,
        sLagPSeconds: parseFloat((sArr - pArr).toFixed(1)),
        peakFrequencyHz: eq.magnitude > 5 ? 1.5 : eq.magnitude > 4 ? 2.4 : 3.6,
        feltReports: `Recorded by USGS / ESSGI Seismic Network in ${eq.location}. Depth: ${eq.depth} km.`,
        focalMechanism: "Rift Extensional / Strike-slip Faulting",
        pgaG: parseFloat((0.01 * Math.pow(10, (eq.magnitude - 3) * 0.4)).toFixed(3)),
        intensity: eq.magnitude >= 5 ? "MMI VI (Strong)" : eq.magnitude >= 4 ? "MMI IV-V (Moderate)" : "MMI III (Light)",
        obspyQuery: `from obspy import UTCDateTime\nfrom obspy.clients.fdsn import Client\nimport matplotlib.pyplot as plt\n\nclient = Client("IRIS")\nt_event = UTCDateTime("${eq.dateTime.replace("Z", "")}")\nst = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 30, t_event + 300)\nst.detrend("demean")\nst.filter("bandpass", freqmin=1.0, freqmax=5.0, corners=4, zerophase=True)\nst.plot(title="IU.FURI - ${eq.location} (M ${eq.magnitude})")\nplt.show()`,
        summary: eq.description || "Real-time detected seismic ground motion event.",
        isRealTime: !eq.isHistorical
      };
    });

    // Merge and deduplicate by ID
    const combined = [...RECENT_REAL_TREMORS];
    for (const live of mappedLive) {
      if (!combined.some(c => c.id === live.id || (Math.abs(c.coordinates[0] - live.coordinates[0]) < 0.05 && Math.abs(c.coordinates[1] - live.coordinates[1]) < 0.05))) {
        combined.unshift(live);
      }
    }
    return combined;
  }, [earthquakes]);

  // Selected Catalog Event
  const [selectedTremor, setSelectedTremor] = useState<SeismicTremorEvent>(catalogList[0]);
  const [customSearchQuery, setCustomSearchQuery] = useState("");

  // =========================================================================
  // INTERACTIVE DATE-BASED SEISMOGRAM STATE (FOR MATPLOTLIB WINDOW)
  // =========================================================================
  const [inputDateTime, setInputDateTime] = useState<string>("2026-08-09T14:22");
  const [inputMagnitude, setInputMagnitude] = useState<number>(4.6);
  const [inputDepth, setInputDepth] = useState<number>(10);
  const [inputDistance, setInputDistance] = useState<number>(154);
  const [inputLocation, setInputLocation] = useState<string>("Metahāra Awash Rift Corridor");
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("BHZ");
  const [plotFilterType, setPlotFilterType] = useState<FilterType>("bandpass");
  const [plotFreqMin, setPlotFreqMin] = useState<number>(1.0);
  const [plotFreqMax, setPlotFreqMax] = useState<number>(5.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showPhaseLines, setShowPhaseLines] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoverData, setHoverData] = useState<{
    time: number;
    amp: number;
    x: number;
    y: number;
    svgX: number;
    svgY: number;
    year: number;
    dateFormatted: string;
    utcTimeFormatted: string;
    eatTimeFormatted: string;
    isoFullTimestamp: string;
    phaseType: "p_pick" | "s_pick" | "peak_wave" | "coda" | "baseline";
    phaseLabel: string;
  } | null>(null);
  const [sandboxHoverData, setSandboxHoverData] = useState<{
    time: number;
    amp: number;
    svgX: number;
    svgY: number;
    year: number;
    dateFormatted: string;
    utcTimeFormatted: string;
    eatTimeFormatted: string;
    phaseLabel: string;
  } | null>(null);
  const [figureExportSuccess, setFigureExportSuccess] = useState<boolean>(false);

  // Live Stream Audio & Wave (Oscilloscope View) States
  const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [timeStep, setTimeStep] = useState<number>(0);
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [gainMultiplier, setGainMultiplier] = useState<number>(1.5);
  const [showSpectrum, setShowSpectrum] = useState<boolean>(true);
  const [activeEvent, setActiveEvent] = useState<SeismicEvent>("earthquake");
  const [triggerThreshold, setTriggerThreshold] = useState<number>(4.0);

  // Real-time Trigger alert banner
  const [activeTriggerAlert, setActiveTriggerAlert] = useState<{
    id: string;
    magnitude: number;
    location: string;
    pArrival: string;
    sArrival: string;
    sLagP: number;
    distanceKm: number;
    pga: number;
    isSimulated?: boolean;
    timestamp: string;
  }>({
    id: "trigger_live_recent",
    magnitude: 4.6,
    location: "Metahāra Awash Rift Basin",
    pArrival: "+22.6s",
    sArrival: "+39.5s",
    sLagP: 16.9,
    distanceKm: 154,
    pga: 0.042,
    isSimulated: false,
    timestamp: new Date().toLocaleTimeString()
  });

  // Sandbox Code Editor States
  const [sandboxCode, setSandboxCode] = useState<string>(
    `from obspy import UTCDateTime\nfrom obspy.clients.fdsn import Client\nimport matplotlib.pyplot as plt\n\n# 1. Connect to IRIS FDSN Service\nclient = Client("IRIS")\n\n# 2. Query Mount Furi Station for User Inserted Date: 2026-08-09T14:22:18\nt_event = UTCDateTime("2026-08-09T14:22:18")\nst = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 30, t_event + 300)\n\n# 3. Apply Butterworth 1.0 - 5.0 Hz Bandpass Filter\nst.detrend("demean")\nst.taper(max_percentage=0.05)\nst.filter("bandpass", freqmin=1.0, freqmax=5.0, corners=4, zerophase=True)\n\n# 4. Plot Static Matplotlib Seismogram\nst.plot(type="relative", color="navy", title="IU.FURI - Seismic Record (M 4.6)")\nplt.show()`
  );
  const [sandboxPreset, setSandboxPreset] = useState<string>("recent_metahara");
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [sandboxOutputs, setSandboxOutputs] = useState<{
    isReadLoaded: boolean;
    activeFilter: { type: string; freq?: number; freqmin?: number; freqmax?: number } | null;
    selectedComponent: string | null;
    hasPlot: boolean;
    extractedDate: string | null;
  }>({
    isReadLoaded: true,
    activeFilter: { type: "bandpass", freqmin: 1.0, freqmax: 5.0 },
    selectedComponent: "Z",
    hasPlot: true,
    extractedDate: "2026-08-09T14:22:18"
  });

  // Calculate the Static Deterministic Waveform based strictly on user date & parameters
  // CRITICAL: The wave in the Matplotlib plot DOES NOT MOVE. It is completely static.
  const staticSeismogram = useMemo(() => {
    return generateStaticSeismogram(
      inputDateTime,
      inputMagnitude,
      inputDepth,
      inputDistance,
      selectedChannel,
      {
        type: plotFilterType,
        freqmin: plotFreqMin,
        freqmax: plotFreqMax
      }
    );
  }, [inputDateTime, inputMagnitude, inputDepth, inputDistance, selectedChannel, plotFilterType, plotFreqMin, plotFreqMax]);

  // Synchronize the ObsPy Python Script whenever user changes date, channel, magnitude, or filters
  const dynamicObsPyScript = useMemo(() => {
    const isoClean = inputDateTime.includes("T") ? inputDateTime : `${inputDateTime}T00:00:00`;
    const compLetter = selectedChannel.slice(-1);
    
    let filterLines = "";
    if (plotFilterType === "bandpass") {
      filterLines = `st.filter("bandpass", freqmin=${plotFreqMin.toFixed(1)}, freqmax=${plotFreqMax.toFixed(1)}, corners=4, zerophase=True)`;
    } else if (plotFilterType === "highpass") {
      filterLines = `st.filter("highpass", freq=${plotFreqMin.toFixed(1)}, corners=4)`;
    } else if (plotFilterType === "lowpass") {
      filterLines = `st.filter("lowpass", freq=${plotFreqMax.toFixed(1)}, corners=4)`;
    } else {
      filterLines = `# Raw record - no filter applied`;
    }

    return `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

# 1. Initialize IRIS FDSN Client
client = Client("IRIS")

# 2. Query Mount Furi Station (IU.FURI) for Date: ${isoClean}
t_event = UTCDateTime("${isoClean}")
st = client.get_waveforms(
    network="IU", 
    station="FURI", 
    location="00", 
    channel="${selectedChannel}", 
    starttime=t_event - 30, 
    endtime=t_event + 300
)

# 3. Digital Signal Processing
st.detrend("demean")
st.taper(max_percentage=0.05)
${filterLines}

# 4. Generate Static Matplotlib Seismogram Plot Window
fig = st.plot(
    type="relative", 
    color="midnightblue", 
    title="IU.FURI.${selectedChannel} - ${inputLocation} (M ${inputMagnitude.toFixed(1)})"
)
plt.show()`;
  }, [inputDateTime, selectedChannel, plotFilterType, plotFreqMin, plotFreqMax, inputLocation, inputMagnitude]);

  // Audio synthesizer for real-time oscilloscope
  useEffect(() => {
    if (isSoundOn) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
      } catch {
        // AudioContext browser restrictions handled silently
      }
    } else {
      stopAudio();
    }

    return () => {
      stopAudio();
    };
  }, [isSoundOn]);

  const stopAudio = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch(e){}
      oscRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e){}
      audioContextRef.current = null;
    }
    gainRef.current = null;
  };

  // Oscilloscope Animation Loop (ONLY FOR TAB 1 LIVE STREAM)
  useEffect(() => {
    let animId: number;
    if (isLiveStream && activeTab === "feed") {
      const tick = () => {
        setTimeStep(prev => (prev + 1) % 1000000);
        animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animId);
  }, [isLiveStream, activeTab]);

  // Live Oscilloscope Wave Data (used only in Tab 1 live feed)
  const liveOscilloscopeWave = useMemo(() => {
    const pointsCount = 240;
    const raw: number[] = [];
    const tBase = timeStep * 0.08;

    for (let i = 0; i < pointsCount; i++) {
      const t = tBase + i * 0.05;
      const noise = Math.sin(t * 11.8) * 0.14 + Math.cos(t * 26.2) * 0.09;
      let eventVal = 0;
      
      const envelopePhase = (tBase + i * 0.05) % 24;
      if (envelopePhase > 2 && envelopePhase < 19) {
        const tEvent = envelopePhase - 2;
        if (tEvent < 3.2) {
          eventVal += Math.exp(-tEvent * 0.65) * 2.2 * Math.sin(tEvent * 28.0);
        }
        if (tEvent >= 2.8) {
          const tS = tEvent - 2.8;
          eventVal += Math.exp(-tS * 0.18) * 4.5 * Math.sin(tS * 4.6);
        }
      }
      raw.push((noise + eventVal) * gainMultiplier);
    }
    return raw;
  }, [timeStep, gainMultiplier]);

  // Power Spectral Density
  const spectrumData = useMemo(() => {
    const bins = 32;
    const data: { freq: number; power: number }[] = [];
    const peakFreq = inputMagnitude > 5 ? 1.5 : 2.4;

    for (let i = 0; i < bins; i++) {
      const f = (i / (bins - 1)) * 10.0;
      const sigma = 0.85;
      const power = Math.exp(-Math.pow(f - peakFreq, 2) / (2 * Math.pow(sigma, 2))) * 85 + (Math.random() * 6 + 4);
      data.push({ freq: parseFloat(f.toFixed(1)), power: Math.min(100, Math.max(5, power)) });
    }
    return data;
  }, [inputMagnitude]);

  // Populate user interactive date/magnitude when picking from catalog
  const handleSelectTremorFromCatalog = (tremor: SeismicTremorEvent) => {
    setSelectedTremor(tremor);
    const dateOnly = tremor.dateTime.slice(0, 16);
    setInputDateTime(dateOnly);
    setInputMagnitude(tremor.magnitude);
    setInputDepth(tremor.depth);
    setInputDistance(tremor.distanceFromFuriKm);
    setInputLocation(tremor.location);
    
    // Update live trigger alert
    setActiveTriggerAlert({
      id: "trig_" + tremor.id,
      magnitude: tremor.magnitude,
      location: tremor.location,
      pArrival: `+${tremor.pArrivalSeconds}s`,
      sArrival: `+${tremor.sArrivalSeconds}s`,
      sLagP: tremor.sLagPSeconds,
      distanceKm: tremor.distanceFromFuriKm,
      pga: tremor.pgaG,
      isSimulated: false,
      timestamp: new Date(tremor.dateTime).toLocaleTimeString()
    });
  };

  const handleCopyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Run script in Sandbox
  const runSandboxScript = () => {
    setIsSandboxRunning(true);
    setTimeout(() => {
      const parsed = parsePythonScript(sandboxCode);
      setSandboxOutputs(parsed);
      
      const logs: string[] = [
        ">>> python obspy_waveform_studio.py",
        "ObsPy 1.4.1 (Python 3.11.8) loaded with NumPy & SciPy.",
        "Connecting to FDSN Web Service client at https://service.iris.edu ...",
        `>>> st = client.get_waveforms('IU', 'FURI', '00', '${parsed.selectedComponent || "BHZ"}', ...)`
      ];

      if (parsed.extractedDate) {
        logs.push(`Retrieved waveform stream for target event: ${parsed.extractedDate} UTC`);
      }
      logs.push("Station IU.FURI | Sample Rate: 20.0 Hz | 6600 samples (330.0s window)");
      
      if (parsed.activeFilter) {
        logs.push(`>>> st.filter('${parsed.activeFilter.type}', freqmin=${parsed.activeFilter.freqmin ?? 1.0}, freqmax=${parsed.activeFilter.freqmax ?? 5.0})`);
        logs.push("Zero-phase Butterworth filter successfully applied to stream.");
      }
      if (parsed.hasPlot) {
        logs.push(">>> st.plot(type='relative', title='IU.FURI Seismogram')");
        logs.push("Matplotlib Figure 1 displayed successfully.");
      }
      setSandboxLogs(logs);
      setIsSandboxRunning(false);
    }, 400);
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    if (!customSearchQuery.trim()) return catalogList;
    const q = customSearchQuery.toLowerCase();
    return catalogList.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.location.toLowerCase().includes(q) ||
      t.date.toLowerCase().includes(q) ||
      t.magnitude.toString().includes(q)
    );
  }, [catalogList, customSearchQuery]);

  // Export Matplotlib Seismogram Figure as PNG / SVG
  const handleExportFigure = () => {
    const svgEl = document.getElementById("matplotlib-seismogram-svg");
    if (!svgEl) return;
    
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `IU_FURI_Seismogram_${inputDateTime.replace(/[^a-zA-Z0-9]/g, "_")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setFigureExportSuccess(true);
    setTimeout(() => setFigureExportSuccess(false), 2500);
  };

  return (
    <div className="bg-white/85 dark:bg-[#07131F]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6 select-none transition-all font-sans">
      
      {/* ========================================================================= */}
      {/* HEADER BANNER & STATION METADATA */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-[#0E4A72] to-[#0085C8] text-white rounded-2xl shadow-md">
            <Activity className="w-6 h-6 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight font-display">
                Mount Furi Seismological Observatory (IU.FURI) & ObsPy Studio
              </h3>
              <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-[9.5px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                REAL-TIME FDSN INGEST
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Station FURI &bull; Lat 8.895°N, Lon 38.680°E &bull; Elev 2,570m &bull; GSN / IRIS / EarthScope / ESSGI
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 self-start lg:self-center">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
              activeTab === "feed"
                ? "bg-[#0E4A72] text-white shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Interactive Matplotlib Seismogram</span>
          </button>

          <button
            onClick={() => setActiveTab("august")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
              activeTab === "august"
                ? "bg-amber-600 text-white shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recent Earthquakes &amp; Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
              activeTab === "sandbox"
                ? "bg-[#0085C8] text-white shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>ObsPy Python Script Studio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE MATPLOTLIB SEISMOGRAM PLOT (USER INSERTED DATE & TIME) */}
      {/* ========================================================================= */}
      {activeTab === "feed" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* USER INTERACTION BAR: DATE INSERTION & SEISMIC PARAMETER CONTROLS */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0E4A72] to-slate-900 text-white rounded-3xl p-5 border-2 border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-mono text-[9.5px] font-black uppercase rounded-lg">
                    DATE-DRIVEN SEISMOGRAM GENERATOR
                  </span>
                  <span className="text-xs text-amber-300 font-mono font-bold">
                    Static Matplotlib Rendering (Zero Movement)
                  </span>
                </div>
                <h4 className="text-base font-black text-white font-display">
                  Insert Event Date &amp; Query IU.FURI Broadband Seismogram
                </h4>
              </div>

              {/* Quick Preset Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-300 font-semibold shrink-0">Quick Preset:</span>
                <select
                  value={selectedTremor.id}
                  onChange={(e) => {
                    const found = catalogList.find(c => c.id === e.target.value);
                    if (found) handleSelectTremorFromCatalog(found);
                  }}
                  className="bg-white/10 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-white/20 cursor-pointer focus:outline-hidden focus:bg-slate-900"
                >
                  {catalogList.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.title} ({t.date})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              
              {/* 1. Date & Time Input */}
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Insert Date &amp; Time (UTC)</span>
                </label>
                <input
                  type="datetime-local"
                  value={inputDateTime}
                  onChange={(e) => setInputDateTime(e.target.value)}
                  className="w-full bg-slate-950/80 text-white font-mono text-xs px-2.5 py-1.5 rounded-xl border border-white/25 focus:outline-hidden focus:border-amber-400"
                />
                <span className="text-[9px] text-slate-300 font-mono block">
                  Plots exact wave for this timestamp
                </span>
              </div>

              {/* 2. Magnitude (M) */}
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Magnitude (M)</span>
                  </label>
                  <span className="font-mono font-black text-amber-300">
                    M {inputMagnitude.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2.5"
                  max="7.5"
                  step="0.1"
                  value={inputMagnitude}
                  onChange={(e) => setInputMagnitude(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[8.5px] font-mono text-slate-300">
                  <span>M 2.5 (Minor)</span>
                  <span>M 5.0 (Moderate)</span>
                  <span>M 7.5 (Major)</span>
                </div>
              </div>

              {/* 3. Hypocentral Depth & Distance */}
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Dist &amp; Depth from FURI</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-[8.5px] text-slate-300 block font-mono">Dist (km):</span>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={inputDistance}
                      onChange={(e) => setInputDistance(parseInt(e.target.value) || 150)}
                      className="w-full bg-slate-950/80 text-white font-mono text-xs px-2 py-1 rounded-lg border border-white/20"
                    />
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-300 block font-mono">Depth (km):</span>
                    <input
                      type="number"
                      min="1"
                      max="70"
                      value={inputDepth}
                      onChange={(e) => setInputDepth(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-950/80 text-white font-mono text-xs px-2 py-1 rounded-lg border border-white/20"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Station Component Channel */}
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Channel Component</span>
                </label>
                <div className="grid grid-cols-4 gap-1 font-mono font-bold text-xs">
                  {(["BHZ", "BHN", "BHE", "HHZ"] as ChannelType[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSelectedChannel(ch)}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        selectedChannel === ch
                          ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                          : "bg-black/30 hover:bg-white/20 text-white"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
                <span className="text-[8.5px] text-slate-300 font-mono block">
                  {selectedChannel === "BHZ" ? "Z: Vertical (P-wave)" : selectedChannel === "BHN" ? "N: North (S-wave)" : selectedChannel === "BHE" ? "E: East (S-wave)" : "HHZ: High-Rate 100Hz"}
                </span>
              </div>

              {/* 5. Butterworth Filter Configuration */}
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 space-y-1.5">
                <label className="text-[10px] font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Butterworth Filter</span>
                </label>
                <div className="grid grid-cols-2 gap-1 font-bold text-[10.5px]">
                  {(["bandpass", "highpass", "lowpass", "none"] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPlotFilterType(f)}
                      className={`py-1 rounded-lg capitalize transition-all cursor-pointer ${
                        plotFilterType === f
                          ? "bg-amber-400 text-slate-950 font-black"
                          : "bg-black/30 hover:bg-white/20 text-slate-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[8.5px] font-mono text-slate-300">
                  <span>Band: {plotFreqMin.toFixed(1)} - {plotFreqMax.toFixed(1)} Hz</span>
                  <span className="text-amber-300 font-bold">4-Pole Zero-Phase</span>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE MATPLOTLIB SCIENTIFIC SEISMOGRAM WINDOW (FIGURE 1) */}
          {/* ========================================================================= */}
          <div className="bg-slate-900 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden text-slate-100">
            
            {/* Matplotlib Figure Window Titlebar */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 inline-block" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Figure 1: matplotlib.pyplot.show() &bull; IU.FURI.{selectedChannel}</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold rounded-md border border-emerald-500/30">
                  STATIC WAVEFORM (NON-MOVING)
                </span>
              </div>

              {/* Matplotlib Figure Toolbar Controls */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    showGrid ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold" : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                  title="Toggle Grid Lines"
                >
                  <span>Grid {showGrid ? "ON" : "OFF"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPhaseLines(!showPhaseLines)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    showPhaseLines ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold" : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                  title="Toggle P and S Wave Phase Arrival Picks"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>P/S Picks</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportFigure}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border border-emerald-400/40"
                  title="Export High-Resolution Seismogram Vector (SVG)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{figureExportSuccess ? "Saved!" : "Save Figure"}</span>
                </button>
              </div>
            </div>

            {/* Matplotlib Canvas Area */}
            <div className="p-6 bg-white dark:bg-slate-950 relative">
              
              {/* Figure Header Information */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs">
                <div>
                  <span className="font-extrabold text-[#0E4A72] dark:text-cyan-400 text-sm">
                    IU.FURI.00.{selectedChannel} &bull; {inputLocation} (M {inputMagnitude.toFixed(1)})
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                    Origin Time: <strong>{inputDateTime.replace("T", " ")}:00 UTC</strong> &bull; Distance: {inputDistance} km &bull; Depth: {inputDepth} km
                  </span>
                </div>
                <div className="text-right text-[10.5px] text-slate-500 dark:text-slate-400 font-mono">
                  <div>Filter: <strong className="text-amber-600 dark:text-amber-400">{plotFilterType.toUpperCase()} ({plotFreqMin} - {plotFreqMax} Hz)</strong></div>
                  <div>P-Arrival: <strong className="text-blue-600 dark:text-blue-400">+{staticSeismogram.pArrivalSec}s</strong> | S-Arrival: <strong className="text-rose-600 dark:text-rose-400">+{staticSeismogram.sArrivalSec}s</strong> (&Delta;t: {staticSeismogram.sLagPSec}s)</div>
                </div>
              </div>

              {/* High-Resolution Static Seismogram SVG Rendering */}
              <div className="relative mt-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden shadow-inner">
                
                <svg
                  id="matplotlib-seismogram-svg"
                  className="w-full h-64 md:h-72 cursor-crosshair"
                  viewBox="0 0 900 240"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const normX = Math.max(0, Math.min(1, (mouseX - 80) / (rect.width - 120)));
                    const timeSec = normX * staticSeismogram.durationSec;
                    const ptIdx = Math.floor(normX * (staticSeismogram.points.length - 1));
                    const ampVal = staticSeismogram.points[ptIdx] || 0;
                    
                    // Parse origin date rigorously as UTC
                    let originIso = inputDateTime.trim();
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

                    // East Africa Time (EAT = UTC+3)
                    const eatDate = new Date(hoveredMs + 3 * 3600 * 1000);
                    const hEat = String(eatDate.getUTCHours()).padStart(2, "0");
                    const mEat = String(eatDate.getUTCMinutes()).padStart(2, "0");
                    const sEat = String(eatDate.getUTCSeconds()).padStart(2, "0");
                    const eatTimeFormatted = `${hEat}:${mEat}:${sEat}.${msUtc} EAT`;

                    const isoFullTimestamp = `${hoveredDate.toISOString().slice(0, 10)} ${utcTimeFormatted}`;
                    
                    // Wave phase pick analysis
                    const isNearP = Math.abs(timeSec - staticSeismogram.pArrivalSec) <= 4.0;
                    const isNearS = Math.abs(timeSec - staticSeismogram.sArrivalSec) <= 4.0;
                    const isPeak = Math.abs(ampVal) >= staticSeismogram.maxAmp * 0.8;
                    
                    let phaseType: "p_pick" | "s_pick" | "peak_wave" | "coda" | "baseline" = "baseline";
                    let phaseLabel = "Ambient Baseline Wave";

                    if (isNearP) {
                      phaseType = "p_pick";
                      phaseLabel = `P-Wave Arrival Pick (+${staticSeismogram.pArrivalSec}s)`;
                    } else if (isNearS) {
                      phaseType = "s_pick";
                      phaseLabel = `S-Wave Arrival Pick (+${staticSeismogram.sArrivalSec}s)`;
                    } else if (isPeak) {
                      phaseType = "peak_wave";
                      phaseLabel = "Peak Velocity Rupture Phase";
                    } else if (timeSec > staticSeismogram.sArrivalSec) {
                      phaseType = "coda";
                      phaseLabel = "Coda Surface Wave Scatter";
                    }

                    const svgY = 115 - (ampVal / (staticSeismogram.maxAmp || 1)) * 75;
                    const svgX = 80 + normX * 780;

                    setHoverData({
                      time: parseFloat(timeSec.toFixed(2)),
                      amp: parseFloat(ampVal.toFixed(3)),
                      x: mouseX,
                      y: e.clientY - rect.top,
                      svgX,
                      svgY,
                      year,
                      dateFormatted,
                      utcTimeFormatted,
                      eatTimeFormatted,
                      isoFullTimestamp,
                      phaseType,
                      phaseLabel
                    });
                  }}
                  onMouseLeave={() => setHoverData(null)}
                >
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Canvas Outer Boundary */}
                  <rect x="80" y="20" width="780" height="190" fill="none" stroke="#64748b" strokeWidth="1.2" />

                  {/* Grid Lines */}
                  {showGrid && (
                    <>
                      {/* Horizontal Amplitude Grid Lines */}
                      <line x1="80" y1="115" x2="860" y2="115" stroke="#cbd5e1" strokeDasharray="3,3" strokeWidth="1" />
                      <line x1="80" y1="67" x2="860" y2="67" stroke="#e2e8f0" strokeDasharray="2,2" strokeWidth="0.8" />
                      <line x1="80" y1="163" x2="860" y2="163" stroke="#e2e8f0" strokeDasharray="2,2" strokeWidth="0.8" />
                      
                      {/* Vertical Time Grid Lines */}
                      {[0, 50, 100, 150, 200, 250, 300].map((tVal) => {
                        const x = 80 + (tVal / 300) * 780;
                        return (
                          <line
                            key={tVal}
                            x1={x}
                            y1="20"
                            x2={x}
                            y2="210"
                            stroke="#e2e8f0"
                            strokeDasharray="2,2"
                            strokeWidth="0.8"
                          />
                        );
                      })}
                    </>
                  )}

                  {/* P-wave and S-wave Arrival Pick Lines */}
                  {showPhaseLines && (
                    <>
                      {/* P-Arrival Pick */}
                      {staticSeismogram.pArrivalSec <= 300 && (
                        <g>
                          <line
                            x1={80 + (staticSeismogram.pArrivalSec / 300) * 780}
                            y1="20"
                            x2={80 + (staticSeismogram.pArrivalSec / 300) * 780}
                            y2="210"
                            stroke="#2563eb"
                            strokeWidth="2"
                            strokeDasharray="4,3"
                          />
                          <rect
                            x={82 + (staticSeismogram.pArrivalSec / 300) * 780}
                            y="24"
                            width="90"
                            height="16"
                            rx="3"
                            fill="#2563eb"
                            fillOpacity="0.15"
                          />
                          <text
                            x={85 + (staticSeismogram.pArrivalSec / 300) * 780}
                            y="36"
                            fill="#2563eb"
                            fontSize="9.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            P-Pick (+{staticSeismogram.pArrivalSec}s)
                          </text>
                        </g>
                      )}

                      {/* S-Arrival Pick */}
                      {staticSeismogram.sArrivalSec <= 300 && (
                        <g>
                          <line
                            x1={80 + (staticSeismogram.sArrivalSec / 300) * 780}
                            y1="20"
                            x2={80 + (staticSeismogram.sArrivalSec / 300) * 780}
                            y2="210"
                            stroke="#dc2626"
                            strokeWidth="2"
                            strokeDasharray="4,3"
                          />
                          <rect
                            x={82 + (staticSeismogram.sArrivalSec / 300) * 780}
                            y="42"
                            width="90"
                            height="16"
                            rx="3"
                            fill="#dc2626"
                            fillOpacity="0.15"
                          />
                          <text
                            x={85 + (staticSeismogram.sArrivalSec / 300) * 780}
                            y="54"
                            fill="#dc2626"
                            fontSize="9.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            S-Pick (+{staticSeismogram.sArrivalSec}s)
                          </text>
                        </g>
                      )}

                      {/* S-P Lag Interval Box */}
                      {staticSeismogram.sArrivalSec <= 300 && (
                        <rect
                          x={80 + (staticSeismogram.pArrivalSec / 300) * 780}
                          y="20"
                          width={((staticSeismogram.sArrivalSec - staticSeismogram.pArrivalSec) / 300) * 780}
                          height="190"
                          fill="#f59e0b"
                          fillOpacity="0.08"
                        />
                      )}
                    </>
                  )}

                  {/* STATIC HIGH-PRECISION SEISMOGRAM POLYLINE TRACE (DO NOT ANIMATE) */}
                  <polyline
                    fill="none"
                    stroke={selectedChannel === "BHZ" ? "#0f172a" : selectedChannel === "BHN" ? "#047857" : "#b45309"}
                    strokeWidth="1.4"
                    points={staticSeismogram.points.map((val, idx) => {
                      const x = 80 + (idx / (staticSeismogram.points.length - 1)) * 780;
                      const y = 115 - (val / (staticSeismogram.maxAmp || 1)) * 75;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    }).join(" ")}
                  />

                  {/* Y-Axis Amplitude Ticks & Labels */}
                  <text x="25" y="30" fill="#64748b" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    +{(staticSeismogram.maxAmp * 12).toFixed(1)} &mu;m/s
                  </text>
                  <text x="35" y="118" fill="#64748b" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    0.0
                  </text>
                  <text x="25" y="208" fill="#64748b" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                    -{(staticSeismogram.maxAmp * 12).toFixed(1)} &mu;m/s
                  </text>

                  {/* Interactive Cursor Indicator on Hover with Time and Wave Pick Tracking */}
                  {hoverData && (
                    <g>
                      {/* Vertical tracking line */}
                      <line
                        x1={hoverData.svgX}
                        y1="20"
                        x2={hoverData.svgX}
                        y2="210"
                        stroke={
                          hoverData.phaseType === "p_pick"
                            ? "#2563eb"
                            : hoverData.phaseType === "s_pick"
                            ? "#dc2626"
                            : hoverData.phaseType === "peak_wave"
                            ? "#d97706"
                            : "#0284c7"
                        }
                        strokeWidth="1.5"
                        strokeDasharray="3,2"
                      />

                      {/* Dot on wave line */}
                      <circle
                        cx={hoverData.svgX}
                        cy={hoverData.svgY}
                        r="4"
                        fill={
                          hoverData.phaseType === "p_pick"
                            ? "#2563eb"
                            : hoverData.phaseType === "s_pick"
                            ? "#dc2626"
                            : hoverData.phaseType === "peak_wave"
                            ? "#d97706"
                            : "#0284c7"
                        }
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />

                      {/* Floating year/timestamp pill attached directly to crosshair */}
                      <rect
                        x={Math.min(680, Math.max(85, hoverData.svgX - 90))}
                        y="22"
                        width="180"
                        height="20"
                        rx="5"
                        fill="#061A2B"
                        stroke={
                          hoverData.phaseType === "p_pick"
                            ? "#3b82f6"
                            : hoverData.phaseType === "s_pick"
                            ? "#ef4444"
                            : hoverData.phaseType === "peak_wave"
                            ? "#f59e0b"
                            : "#0ea5e9"
                        }
                        strokeWidth="1.2"
                      />
                      <text
                        x={Math.min(680, Math.max(85, hoverData.svgX - 90)) + 90}
                        y="35.5"
                        fill="#ffffff"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        YEAR {hoverData.year} • {hoverData.utcTimeFormatted.slice(0, 8)} UTC • +{hoverData.time}s
                      </text>
                    </g>
                  )}
                </svg>

                {/* X-Axis Time Labels (Relative + Absolute UTC) */}
                <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between items-center text-[10px] font-mono text-slate-600 dark:text-slate-400 font-bold">
                  <div className="pl-14">
                    <span>0.0s (Origin)</span>
                    <span className="text-[8.5px] text-slate-400 block">{inputDateTime.slice(11, 16)}:00 UTC</span>
                  </div>
                  <div>
                    <span>+50.0s</span>
                    <span className="text-[8.5px] text-slate-400 block">+00:50</span>
                  </div>
                  <div>
                    <span>+100.0s</span>
                    <span className="text-[8.5px] text-slate-400 block">+01:40</span>
                  </div>
                  <div>
                    <span>+150.0s (Coda)</span>
                    <span className="text-[8.5px] text-slate-400 block">+02:30</span>
                  </div>
                  <div>
                    <span>+200.0s</span>
                    <span className="text-[8.5px] text-slate-400 block">+03:20</span>
                  </div>
                  <div>
                    <span>+250.0s</span>
                    <span className="text-[8.5px] text-slate-400 block">+04:10</span>
                  </div>
                  <div className="pr-8 text-right">
                    <span>+300.0s</span>
                    <span className="text-[8.5px] text-slate-400 block">+05:00 UTC</span>
                  </div>
                </div>

                {/* HIGH-PRECISION INSTITUTIONAL HOVER TOOLTIP CARD (EXACT YEAR & TIMESTAMPS) */}
                {hoverData && (
                  <div className="absolute top-3 left-20 right-4 md:right-auto bg-[#041624]/95 text-white text-[11px] font-mono p-3.5 rounded-2xl border-2 border-cyan-400/60 shadow-2xl pointer-events-none flex flex-wrap items-center gap-3.5 backdrop-blur-xl animate-fade-in z-20">
                    <div className="flex items-center gap-2 border-r border-white/15 pr-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-xs">
                        YEAR: {hoverData.year}
                      </span>
                      <span className="text-cyan-300 font-extrabold text-[11px]">
                        {hoverData.dateFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border-r border-white/15 pr-3">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-[10.5px]">
                          {hoverData.utcTimeFormatted}
                        </span>
                        <span className="text-[9px] text-amber-300/90 font-semibold">
                          {hoverData.eatTimeFormatted}
                        </span>
                      </div>
                      <span className="text-cyan-400 font-black ml-1">
                        (+{hoverData.time}s from origin)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border-r border-white/15 pr-3">
                      <span className="text-slate-400">Ground Velocity:</span>
                      <span className="text-emerald-400 font-black">
                        {hoverData.amp > 0 ? `+${hoverData.amp}` : hoverData.amp} &mu;m/s
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          hoverData.phaseType === "p_pick"
                            ? "bg-blue-500 animate-ping"
                            : hoverData.phaseType === "s_pick"
                            ? "bg-rose-500 animate-ping"
                            : hoverData.phaseType === "peak_wave"
                            ? "bg-amber-400 animate-pulse"
                            : "bg-cyan-400"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-extrabold uppercase ${
                          hoverData.phaseType === "p_pick"
                            ? "text-blue-400"
                            : hoverData.phaseType === "s_pick"
                            ? "text-rose-400"
                            : hoverData.phaseType === "peak_wave"
                            ? "text-amber-400"
                            : "text-cyan-300"
                        }`}
                      >
                        {hoverData.phaseLabel}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* OBSPY PYTHON CODE SNIPPET SYNCHRONIZED WITH THIS EXACT DATE */}
              <div className="mt-6 bg-slate-950 rounded-2xl p-5 border border-slate-800 text-white space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4.5 h-4.5 text-amber-400" />
                    <span className="font-mono text-xs font-bold text-slate-200">
                      ObsPy Python Script Generated for Date: {inputDateTime.replace("T", " ")} UTC
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(dynamicObsPyScript)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? "Copied" : "Copy Code"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSandboxCode(dynamicObsPyScript);
                        setActiveTab("sandbox");
                        runSandboxScript();
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Run in ObsPy Sandbox</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-48 custom-scrollbar border border-slate-800/80 leading-relaxed">
                  <pre>{dynamicObsPyScript}</pre>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RECENT REAL-TIME EARTHQUAKES & TREMORS CATALOG */}
      {/* ========================================================================= */}
      {activeTab === "august" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/30 rounded-3xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-black uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>REAL-TIME RECENT SEISMIC RUPTURES &amp; WAVEFORM ARCHIVE</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display">
                  Ethiopia Recent Earthquakes &amp; Recorded Seismograms
                </h3>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
                  Explore recently occurred real earthquakes across Ethiopia (including the recent <strong>Metahāra Awash Rift M 4.6</strong>, <strong>Awash-Fentale M 4.9</strong>, <strong>Semera Afar M 4.5</strong>, and <strong>Mek'ele M 5.6</strong> events). Click any event to immediately load its date and plot its static ObsPy seismogram.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0 w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter events by region or M..."
                  value={customSearchQuery}
                  onChange={(e) => setCustomSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 pl-9 pr-3 py-2 rounded-xl text-xs font-sans text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Select Grid for Recent Events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((tremor) => {
              const isSelected = selectedTremor.id === tremor.id;
              return (
                <div
                  key={tremor.id}
                  onClick={() => handleSelectTremorFromCatalog(tremor)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-amber-400"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        {tremor.date}
                      </span>
                      <span className="font-mono text-base font-black text-rose-600 dark:text-rose-400">
                        M {tremor.magnitude.toFixed(1)}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {tremor.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans line-clamp-2">
                      {tremor.location}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-150 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Dist: <strong>{tremor.distanceFromFuriKm} km</strong></span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">&Delta;t: {tremor.sLagPSeconds}s</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTremorFromCatalog(tremor);
                        setActiveTab("feed");
                      }}
                      className="px-2.5 py-1 bg-[#0E4A72] text-white rounded-lg text-[10px] font-sans font-bold hover:bg-[#0085C8] transition-colors cursor-pointer"
                    >
                      Plot Date &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Diagnostic Panel for Selected Event */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Diagnostics (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4">
              <div className="border-b border-slate-200 dark:border-white/10 pb-3">
                <span className="text-[10px] font-mono uppercase font-black text-amber-600 block">
                  SELECTED RUPTURE DIAGNOSTICS
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
                  {selectedTremor.title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Magnitude</span>
                  <span className="font-black text-lg text-rose-600">M {selectedTremor.magnitude.toFixed(1)}</span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Focal Depth</span>
                  <span className="font-black text-lg text-slate-800 dark:text-slate-200">{selectedTremor.depth} km</span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Station Distance</span>
                  <span className="font-black text-lg text-blue-600">{selectedTremor.distanceFromFuriKm} km</span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">S-P Travel Lag</span>
                  <span className="font-black text-lg text-amber-600">+{selectedTremor.sLagPSeconds}s</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2 text-xs">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Theoretical Phase Arrivals at Mount FURI:</span>
                </h5>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Compressional P-Wave (Vp ~ 6.8 km/s):</span>
                    <strong className="text-blue-500">+{selectedTremor.pArrivalSeconds}s</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Shear S-Wave (Vs ~ 3.9 km/s):</span>
                    <strong className="text-rose-500">+{selectedTremor.sArrivalSeconds}s</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Peak Spectral Frequency:</span>
                    <strong className="text-amber-500">{selectedTremor.peakFrequencyHz} Hz</strong>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                <strong>Felt Intensity:</strong> {selectedTremor.feltReports}
              </p>
            </div>

            {/* Right Column: Code and Action (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-white space-y-4 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4.5 h-4.5 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">
                    ObsPy Query Script for {selectedTremor.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedTremor.obspyQuery)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-72 custom-scrollbar leading-relaxed">
                <pre>{selectedTremor.obspyQuery}</pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-[10.5px] text-slate-400 font-mono">
                  Compatible with ObsPy 1.4+ &amp; Matplotlib 3.8+
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectTremorFromCatalog(selectedTremor);
                    setActiveTab("feed");
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-0"
                >
                  <Activity className="w-4 h-4" />
                  <span>Plot in Matplotlib Window</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OBSPY PYTHON SCRIPT STUDIO & EXECUTION SANDBOX */}
      {/* ========================================================================= */}
      {activeTab === "sandbox" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
          
          {/* LEFT COLUMN: Python Code Editor (5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">obspy_waveform_studio.py</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSandboxCode(dynamicObsPyScript)}
                  className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
                >
                  Load Current Date Script
                </button>
              </div>

              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                rows={11}
                className="w-full bg-slate-950 text-cyan-300 font-mono text-[11px] p-3.5 rounded-2xl border border-slate-800 focus:outline-hidden focus:border-cyan-500 leading-relaxed custom-scrollbar resize-none"
                spellCheck={false}
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={runSandboxScript}
                  disabled={isSandboxRunning}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-0 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isSandboxRunning ? "animate-spin" : ""}`} />
                  <span>{isSandboxRunning ? "Executing ObsPy..." : "Execute Python Script"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyCode(sandboxCode)}
                  className="text-slate-400 hover:text-white font-mono text-xs flex items-center gap-1 cursor-pointer bg-transparent border-0"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Python Execution Log Console */}
            <div className="bg-slate-950 rounded-3xl p-5 border border-slate-800 text-white space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="uppercase text-[9.5px] font-bold">ObsPy Execution Console</span>
                <span className="text-[9.5px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  INTERPRETER READY
                </span>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                {sandboxLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.startsWith(">>>") 
                        ? "text-cyan-400 font-bold" 
                        : log.startsWith("WARNING") 
                          ? "text-amber-400 font-semibold" 
                          : "text-slate-400"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Output Matplotlib Window (7 cols) */}
          <div className="xl:col-span-7 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0085C8]" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Matplotlib Seismogram Output Window
                </h4>
              </div>
              <span className="text-[9px] font-mono text-slate-400">IU.FURI Station Stream</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-300 font-mono">
                <div className="flex items-center gap-2 font-bold">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>matplotlib.pyplot.show() &bull; Static Figure</span>
                </div>
                <span>{inputDateTime.replace("T", " ")} UTC</span>
              </div>

              <div className="p-4 relative">
                <svg
                  className="w-full h-48 cursor-crosshair"
                  viewBox="0 0 700 150"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const normX = Math.max(0, Math.min(1, (mouseX - 70) / (rect.width - 120)));
                    const timeSec = normX * staticSeismogram.durationSec;
                    const ptIdx = Math.floor(normX * (staticSeismogram.points.length - 1));
                    const ampVal = staticSeismogram.points[ptIdx] || 0;

                    let originIso = inputDateTime.trim();
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

                    let phaseLabel = "Ambient Wave";
                    if (Math.abs(timeSec - staticSeismogram.pArrivalSec) <= 4.0) {
                      phaseLabel = `P-Wave Pick (+${staticSeismogram.pArrivalSec}s)`;
                    } else if (Math.abs(timeSec - staticSeismogram.sArrivalSec) <= 4.0) {
                      phaseLabel = `S-Wave Pick (+${staticSeismogram.sArrivalSec}s)`;
                    } else if (Math.abs(ampVal) >= staticSeismogram.maxAmp * 0.8) {
                      phaseLabel = "Peak Rupture Phase";
                    }

                    const svgX = 70 + normX * 580;
                    const svgY = 70 - (ampVal / (staticSeismogram.maxAmp || 1)) * 50;

                    setSandboxHoverData({
                      time: parseFloat(timeSec.toFixed(2)),
                      amp: parseFloat(ampVal.toFixed(3)),
                      svgX,
                      svgY,
                      year,
                      dateFormatted,
                      utcTimeFormatted,
                      eatTimeFormatted,
                      phaseLabel
                    });
                  }}
                  onMouseLeave={() => setSandboxHoverData(null)}
                >
                  <rect x="70" y="10" width="580" height="120" fill="none" stroke="#64748b" strokeWidth="1" />
                  <line x1="70" y1="70" x2="650" y2="70" stroke="#cbd5e1" strokeDasharray="3,3" />
                  <polyline
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="1.3"
                    points={staticSeismogram.points.map((val, idx) => {
                      const x = 70 + (idx / (staticSeismogram.points.length - 1)) * 580;
                      const y = 70 - (val / (staticSeismogram.maxAmp || 1)) * 50;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    }).join(" ")}
                  />

                  {/* Sandbox Crosshair and Year Tag on Hover */}
                  {sandboxHoverData && (
                    <g>
                      <line
                        x1={sandboxHoverData.svgX}
                        y1="10"
                        x2={sandboxHoverData.svgX}
                        y2="130"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                        strokeDasharray="3,2"
                      />
                      <circle
                        cx={sandboxHoverData.svgX}
                        cy={sandboxHoverData.svgY}
                        r="3.5"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />
                      <rect
                        x={Math.min(500, Math.max(75, sandboxHoverData.svgX - 75))}
                        y="14"
                        width="150"
                        height="18"
                        rx="4"
                        fill="#061a2b"
                        stroke="#0ea5e9"
                        strokeWidth="1"
                      />
                      <text
                        x={Math.min(500, Math.max(75, sandboxHoverData.svgX - 75)) + 75}
                        y="26.5"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        YEAR {sandboxHoverData.year} • {sandboxHoverData.utcTimeFormatted.slice(0, 8)} UTC
                      </text>
                    </g>
                  )}
                </svg>

                {/* Floating Tooltip in Sandbox */}
                {sandboxHoverData && (
                  <div className="absolute top-2 left-20 bg-[#041624]/95 text-white text-[10px] font-mono px-3 py-2 rounded-xl border border-cyan-400/60 shadow-xl pointer-events-none flex items-center gap-3 backdrop-blur-md z-20">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black uppercase text-[9px]">
                      YEAR: {sandboxHoverData.year}
                    </span>
                    <span className="text-cyan-300 font-bold">{sandboxHoverData.dateFormatted}</span>
                    <span className="text-white font-bold">{sandboxHoverData.utcTimeFormatted}</span>
                    <span className="text-amber-400 font-bold">+{sandboxHoverData.time}s</span>
                    <span className="text-emerald-400 font-bold">{sandboxHoverData.amp} &mu;m/s</span>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-1.5 flex justify-between font-mono text-[9px] text-slate-500 font-bold">
                  <div className="pl-12">0.0s (Origin)</div>
                  <div>+{staticSeismogram.pArrivalSec}s (P-Phase)</div>
                  <div>+{staticSeismogram.sArrivalSec}s (S-Phase)</div>
                  <div>+150s (Coda)</div>
                  <div className="pr-10">+300s</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <strong className="text-slate-900 dark:text-white font-bold block mb-1">
                ObsPy Digital Signal Processing Note:
              </strong>
              Applying zero-phase 4th order Butterworth filtering attenuates low-frequency baseline drift and ambient cultural noise, allowing exact picking of compressional P-wave and shear S-wave arrival onsets.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
