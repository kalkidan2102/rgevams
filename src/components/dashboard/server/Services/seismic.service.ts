export const augustEvents = [
  {
    id: "eq_aug_2024_awash",
    title: "August 2024 Awash-Fentale Rift Tremor",
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
    feltReports: "Felt strongly across Addis Ababa, Adama, Bishoftu, Metehara, and Awash",
    focalMechanism: "Normal faulting with oblique-slip along MER master border fault",
    pgaG: 0.048,
    intensity: "MMI V (Moderate)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
# August 2024 Awash Tremor (M4.9)
t_event = UTCDateTime("2024-08-25T19:42:15")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 60, t_event + 300)
st.detrend("linear")
st.taper(max_percentage=0.05)
st.filter("bandpass", freqmin=1.0, freqmax=5.0, corners=4, zerophase=True)
st.plot(type="relative", color="crimson", title="IU.FURI - Aug 2024 Awash Tremor (M4.9)")
plt.show()`
  },
  {
    id: "eq_aug_2024_semera",
    title: "August 2024 Semera Afar Graben Tremor",
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
    feltReports: "Felt in Semera, Logiya, Asaita and Tendaho dam vicinity",
    focalMechanism: "Pure extensional crustal normal faulting in Afar rift floor",
    pgaG: 0.032,
    intensity: "MMI IV (Light)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
# August 2024 Semera Graben Tremor (M4.5)
t_event = UTCDateTime("2024-08-14T08:18:22")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 60, t_event + 360)
st.detrend("demean")
st.filter("bandpass", freqmin=0.8, freqmax=4.5, corners=4, zerophase=True)
st.plot(color="teal", title="IU.FURI - Aug 2024 Semera Afar Tremor (M4.5)")
plt.show()`
  },
  {
    id: "eq_hist_1",
    title: "August 1989 Dobi Graben Earthquake Rupture",
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
    feltReports: "Destructive event. Fractured Assab-Addis Ababa highway bridges and caused heavy ground rupturing",
    focalMechanism: "Complex multi-segment strike-slip / normal rupture sequence",
    pgaG: 0.185,
    intensity: "MMI VIII (Severe)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
# August 1989 Dobi Graben Rupture (M6.3)
t_event = UTCDateTime("1989-08-20T11:15:32")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 30, t_event + 600)
st.filter("lowpass", freq=1.5, corners=4)
st.plot(color="darkred", title="IU.FURI - Historic Aug 1989 Dobi Graben (M6.3)")
plt.show()`
  },
  {
    id: "eq_aug_2023_dofen",
    title: "August 2023 Mount Dofen Volcanic Tremor",
    date: "August 19, 2023",
    dateTime: "2023-08-19T14:30:00.000Z",
    magnitude: 4.2,
    depth: 6,
    location: "Mount Dofen Caldera Flank, Afar/Amhara",
    coordinates: [9.35, 40.12],
    distanceFromFuriKm: 165,
    pArrivalSeconds: 23.5,
    sArrivalSeconds: 43.8,
    sLagPSeconds: 20.3,
    peakFrequencyHz: 1.8,
    feltReports: "Felt in Gewane, Awash Arba, and local pastoralist communities",
    focalMechanism: "Magmatic dyke opening with volumetric tensile component",
    pgaG: 0.024,
    intensity: "MMI IV (Light)",
    obspyQuery: `from obspy import UTCDateTime
from obspy.clients.fdsn import Client
import matplotlib.pyplot as plt

client = Client("IRIS")
# August 2023 Dofen Volcanic Tremor (M4.2)
t_event = UTCDateTime("2023-08-19T14:30:00")
st = client.get_waveforms("IU", "FURI", "00", "BHZ", t_event - 60, t_event + 240)
st.filter("bandpass", freqmin=0.5, freqmax=3.0, corners=4, zerophase=True)
st.plot(color="orange", title="IU.FURI - Aug 2023 Mount Dofen Volcanic Tremor (M4.2)")
plt.show()`
  }
];

export async function getFuriWaveform(eventTime: string, component: string = "Z", magnitude: number = 4.5, depth: number = 10) {
  const date = new Date(eventTime);
  const mag = Number(magnitude) || 4.5;
  const dep = Number(depth) || 10;
  
  // Calculate a 120-second window starting 10 seconds before the earthquake
  const start = new Date(date.getTime() - 10 * 1000);
  const end = new Date(date.getTime() + 110 * 1000);
  
  const startStr = start.toISOString().replace(/\.\d+Z$/, "");
  const endStr = end.toISOString().replace(/\.\d+Z$/, "");

  const comp = String(component || "Z").toUpperCase();
  const channel = `BH${comp}`;

  const irisUrls = [
    `https://service.iris.edu/irisws/timeseries/1/query?net=IU&sta=FURI&loc=00&cha=${channel}&starttime=${startStr}&endtime=${endStr}&output=ascii&correct=true`,
    `https://service.iris.edu/irisws/timeseries/1/query?net=IU&sta=FURI&loc=--&cha=${channel}&starttime=${startStr}&endtime=${endStr}&output=ascii&correct=true`
  ];

  let rawDataPoints: number[] = [];
  let fetchedSuccessful = false;
  let usedUrl = "";

  for (const url of irisUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status === 200) {
        const text = await response.text();
        const lines = text.split("\n");
        const points: number[] = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("TIMESERIES") || isNaN(Number(trimmed))) {
            continue;
          }
          points.push(Number(trimmed));
        }

        if (points.length > 50) {
          rawDataPoints = points;
          fetchedSuccessful = true;
          usedUrl = url;
          break;
        }
      }
    } catch (e) {
      // Continue to next URL
    }
  }

  if (fetchedSuccessful && rawDataPoints.length > 0) {
    const targetCount = 200;
    const step = rawDataPoints.length / targetCount;
    let finalPoints: number[] = [];
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.min(rawDataPoints.length - 1, Math.floor(i * step));
      finalPoints.push(rawDataPoints[idx]);
    }
    
    // Detrend/Remove DC Offset
    const sum = finalPoints.reduce((s, val) => s + val, 0);
    const mean = sum / finalPoints.length;
    let detrended = finalPoints.map(v => v - mean);
    
    const maxAbs = Math.max(...detrended.map(v => Math.abs(v))) || 1;
    const targetScale = Math.min(10, Math.max(1.5, mag * 1.5));
    finalPoints = detrended.map(v => (v / maxAbs) * targetScale);

    return {
      success: true,
      source: "IU.FURI Station (Real-time EarthScope API)",
      url: usedUrl,
      raw: finalPoints,
      isReal: true,
    };
  } else {
    // Physical high-fidelity waveform simulation
    const pointsCount = 200;
    const raw: number[] = [];
    const isZ = comp === "Z";
    const isN = comp === "N";
    const isE = comp === "E";

    const depthDelay = Math.min(11.0, Math.max(2.5, dep * 0.15));
    const magFactor = mag;

    for (let i = 0; i < pointsCount; i++) {
      const t = i * 0.15;
      
      const drift = Math.sin(t * 0.1) * 0.35 + Math.cos(t * 0.05) * 0.18;
      const noise = Math.sin(t * 13.0) * 0.12 + Math.cos(t * 24.5) * 0.08 + Math.sin(t * 1.6) * 0.15;
      
      // P-wave
      let pWave = 0;
      const pArrival = depthDelay;
      if (t > pArrival && t < pArrival + 8.0) {
        const tp = t - pArrival;
        const scale = isZ ? 1.5 : isE ? 0.95 : 0.65;
        pWave = Math.sin(tp * 19.0) * Math.exp(-tp * 0.65) * 2.3 * magFactor * scale;
      }
      
      // S-wave
      let sWave = 0;
      const sArrival = depthDelay + 4.5;
      if (t > sArrival) {
        const ts = t - sArrival;
        const scale = isN ? 1.7 : isE ? 1.1 : 0.75;
        sWave = (Math.sin(ts * 5.2) * Math.exp(-ts * 0.17) * 5.6 + Math.sin(ts * 11.5) * Math.exp(-ts * 0.28) * 2.3) * magFactor * scale;
      }
      
      raw.push(drift + noise + pWave + sWave);
    }

    return {
      success: true,
      source: "IU.FURI Station (Simulated Stream)",
      raw,
      isReal: false,
    };
  }
}
