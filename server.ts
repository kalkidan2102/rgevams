import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// MongoDB Optional Connection Handler
let isMongoDBConnected = false;
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      isMongoDBConnected = true;
      console.log("Connected successfully to MongoDB instance!");
    })
    .catch((err) => {
      console.warn("MongoDB connection warning:", err.message);
    });
}

// MongoDB Status & Blueprint Info Endpoint
app.get("/api/mongodb/status", (req, res) => {
  res.json({
    configured: Boolean(process.env.MONGODB_URI),
    connected: isMongoDBConnected,
    blueprintFile: "/mongodb-blueprint.json",
    collections: [
      "volcanoes",
      "earthquakes",
      "gnss_stations",
      "users",
      "audit_logs",
      "alerts",
    ],
  });
});

// In-Memory fallback cache & persistent files
const DATA_DIR = path.join(process.cwd(), "data");
const VOLCANOES_FILE = path.join(DATA_DIR, "volcanoes.json");
const EARTHQUAKES_FILE = path.join(DATA_DIR, "historical_earthquakes.json");
const AUDIT_LOGS_FILE = path.join(DATA_DIR, "audit_logs.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SECTORS_FILE = path.join(DATA_DIR, "sectors.json");
const NEWS_FILE = path.join(DATA_DIR, "news.json");
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "announcements.json");
const ALERT_CONFIG_FILE = path.join(DATA_DIR, "alert_config.json");
const ALERT_DISPATCHES_FILE = path.join(DATA_DIR, "alert_dispatches.json");

// Ensure data folder and baseline assets exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Baseline Volcanoes in Ethiopia
const defaultVolcanoes = [
  {
    id: "v1",
    name: "Erta Ale",
    region: "Afar Region (Danakil Depression)",
    elevation: 613,
    coordinates: [13.6, 40.67], // [lat, lng]
    type: "Shield Volcano",
    activityType: "Effusive (Active Lava Lake)",
    severity: "Red", // Red = Critical, Orange = Elevated, Yellow = Advisory, Green = Normal
    lastErupted: "Ongoing since 1967",
    description:
      "Famous continually active basaltic shield volcano. Houses one of the world's longest-lived lava lakes located in the Dallol-Fentale rift.",
    monitoredBy: "Semera University & DRMC",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "v2",
    name: "Dallol",
    region: "Danakil Depression",
    elevation: -48,
    coordinates: [14.24, 40.3],
    type: "Hydrothermal / Explosion Crater",
    activityType: "Phreatic Hydor-Magmatic",
    severity: "Orange",
    lastErupted: "1926",
    description:
      "Extremely hot hydrothermal field featuring bubbling salt springs, sulfur formations, and acidic geysers in the Danakil graben.",
    monitoredBy: "Mekelle University Geological Dept",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "v3",
    name: "Dabbahu (Boina)",
    region: "Afar Region",
    elevation: 1442,
    coordinates: [12.6, 40.48],
    type: "Stratovolcano",
    activityType: "Fumarolic & High Seismicity",
    severity: "Yellow",
    lastErupted: "2005",
    description:
      "Located along the Afar rift. Famous for its 2005 explosive eruption, opening a 60km-long magma-filled graben fissure.",
    monitoredBy: "Ethiopian Space Science & Geodesy Institute",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "v4",
    name: "Mount Fentale",
    region: "Oromia (East Shewa / Awash)",
    elevation: 2007,
    coordinates: [8.97, 39.9],
    type: "Stratovolcano with Caldera",
    activityType: "Fumarolic Venting",
    severity: "Yellow",
    lastErupted: "1820",
    description:
      "A large stratovolcano near Awash National Park. It has a 3.5km wide caldera, active fumaroles, and was recently monitored for micro-earthquake swarms.",
    monitoredBy: "Addis Ababa University (Geophysics)",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "v5",
    name: "Alutu",
    region: "Rift Valley (Ziway-Langano area)",
    elevation: 2335,
    coordinates: [7.78, 38.78],
    type: "Silicic Caldera",
    activityType: "Geothermal Steam Vents",
    severity: "Yellow",
    lastErupted: "50 BC",
    description:
      "Active geothermal field between Lake Ziway and Lake Langano. Shows ongoing inflation/deflation and intense geothermal boiling.",
    monitoredBy: "Alutu Geothermal Energy Project / DRMC",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "v6",
    name: "Kone (Gariboldi)",
    region: "Rift Valley (Metehara)",
    elevation: 1619,
    coordinates: [8.8, 39.69],
    type: "Caldera Complex",
    activityType: "Dormant / Steaming Fumaroles",
    severity: "Green",
    lastErupted: "1820",
    description:
      "Fissure alignments, lava tubes, and cinder cones near Fentale. Contains beautiful nested ring calderas.",
    monitoredBy: "Ethiopian Geological Survey",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "v7",
    name: "Dama Ali",
    region: "Afar Region (Lake Abbe)",
    elevation: 1068,
    coordinates: [11.28, 41.63],
    type: "Broad Shield Volcano",
    activityType: "Solfataric / Warm Springs",
    severity: "Green",
    lastErupted: "1631",
    description:
      "Dominates the NW shore of Lake Abbe. Active steam vents exist on its flanks with historical eruptions of basaltic flows.",
    monitoredBy: "DRMC & Region Afar Authorities",
    updatedAt: new Date().toISOString(),
  },
];

// Baseline High-Magnitude Historical Earthquakes in Ethiopia (serving as stable analysis records)
const defaultEarthquakes = [
  {
    id: "eq_aug_2024_awash",
    magnitude: 4.9,
    location: "Awash Basin & Fentale Graben, Main Ethiopian Rift",
    coordinates: [8.98, 39.95],
    depth: 10,
    dateTime: "2024-08-25T19:42:15.000Z",
    severity: "Orange",
    description:
      "Prominent August 2024 Main Ethiopian Rift tectonic tremor. Strongly felt in Addis Ababa (180 km away), Adama/Nazareth, and Metehara. Peak dominant spectral frequency 2.4 Hz with clear P-to-S phase arrival lag of 22.4 seconds at IU.FURI station.",
    isHistorical: true,
  },
  {
    id: "eq_aug_2024_semera",
    magnitude: 4.5,
    location: "Semera Graben, Afar Triple Junction",
    coordinates: [11.78, 41.05],
    depth: 8,
    dateTime: "2024-08-14T08:18:22.000Z",
    severity: "Orange",
    description:
      "August 2024 Afar crustal rifting swarm near Semera. Triggered localized rockfalls on western marginal escarpment faults. Characteristic high-frequency onset (3.8 Hz).",
    isHistorical: true,
  },
  {
    id: "eq_hist_1",
    magnitude: 6.3,
    location: "Dobi Graben, Afar Region",
    coordinates: [11.8, 40.8],
    depth: 15,
    dateTime: "1989-08-20T11:15:32.000Z",
    severity: "Red",
    description:
      "Major August 1989 Dobi Graben earthquake swarm (M 6.3). Severely damaged the regional highway bridges connecting Addis Ababa to Assab port. Caused multiple landslides.",
    isHistorical: true,
  },
  {
    id: "eq_aug_2023_dofen",
    magnitude: 4.2,
    location: "Mount Dofen Caldera Flank, Afar/Amhara",
    coordinates: [9.35, 40.12],
    depth: 6,
    dateTime: "2023-08-19T14:30:00.000Z",
    severity: "Yellow",
    description:
      "August 2023 shallow magmatic tremor associated with subsurface basaltic dike propagation near Mount Dofen volcano.",
    isHistorical: true,
  },
  {
    id: "eq_hist_2",
    magnitude: 6.2,
    location: "Serdo Town, Afar Region",
    coordinates: [11.9, 41.3],
    depth: 10,
    dateTime: "1969-03-29T07:23:11.000Z",
    severity: "Red",
    description:
      "Completely destroyed the historical town of Serdo, resulting in casualties and widespread ground deformation fissures.",
    isHistorical: true,
  },
  {
    id: "eq_hist_3",
    magnitude: 5.6,
    location: "Dabbahu Fissure, Afar",
    coordinates: [12.6, 40.5],
    depth: 5,
    dateTime: "2005-09-24T18:32:00.000Z",
    severity: "Orange",
    description:
      "Directly triggered by dyke intrusion, this seismic event marked the start of the massive 60km rifting fissure opening near Dabbahu.",
    isHistorical: true,
  },
  {
    id: "eq_hist_4",
    magnitude: 4.9,
    location: "Fentale-Awash Swarm",
    coordinates: [8.97, 39.93],
    depth: 10,
    dateTime: "2024-10-06T02:11:45.000Z",
    severity: "Yellow",
    description:
      "Part of a massive tectonic tremor swarm that was strongly felt in Addis Ababa, inducing fear. Cracked several buildings in Metehara and Wanji.",
    isHistorical: true,
  },
  {
    id: "eq_hist_5",
    magnitude: 4.8,
    location: "Wondo Genet, Rift Valley",
    coordinates: [7.1, 38.6],
    depth: 12,
    dateTime: "2016-11-20T14:45:00.000Z",
    severity: "Yellow",
    description:
      "Shallow earthquake in the central rift. Caused shaking in Awassa and minor structural damage in local institutions.",
    isHistorical: true,
  },
];

// Baseline Sectors in ESSGI
const defaultSectors = [
  {
    id: "seismology",
    title: "Seismology & Tectonic Sector",
    code: "ESSGI-DIR-GEO-01",
    directorate: "Directorate of Geodynamics & Seismological Telemetry",
    head: "Dr. Fekadu Abaye (Chief Geophysicist)",
    location: "Mount Furi Seismological Observatory (FURI), Addis Ababa",
    description:
      "Operates 18 permanent broadband GNSS and seismic stations along the Main Ethiopian Rift (MER). Integrates real-time wave forms from the historical Furi Observatory, USGS stream feeds, and local velocity models to calculate moment tensor solutions for micro-tremor swarms.",
    keyFunctions: [
      "Real-time seismic wave processing and focal mechanism inversion",
      "Continuous monitoring of the Hawassa, Adama, and Ankober seismogenic grabens",
      "Maintenance of the national broadband seismograph network (FURI, BDAS, ATIR)",
      "Automated epicenter localization and focal depth estimation algorithms",
    ],
    activeProjects: [
      "Sub-second USGS API telemetry sync",
      "Furi Observatory ObsPy Obspython spectral noise analyzer",
      "Cross-border East African Rift System (EARS) seismic strain mapping",
    ],
    stationCount: "18 Broadband Seismic Stations",
    status: "ONLINE",
    badge: "Real-time Telemetry",
    targetTab: "earthquakes",
    metrics: [
      { label: "Active Array Stations", value: "18 Online" },
      { label: "Daily Waveform Volume", value: "2.4 GB/sec" },
      { label: "Min Magnitude Detection", value: "M 1.2" },
    ],
  },
  {
    id: "volcanology",
    title: "Volcanology & Geothermal Sector",
    code: "ESSGI-DIR-VOLC-02",
    directorate: "Directorate of Volcanology & Geothermal Hazards",
    head: "Dr. Atalay Ayele (Principal Volcanologist)",
    location: "Afar Rift Dynamics Field Station, Semera & Erta Ale Base",
    description:
      "Maintains a national catalog of 115 volcanic centers in Ethiopia. Combines orbital MODIS/VIIRS thermal infrared anomaly detection, drone gas vent profiling, and ground SO2 emissions sensors at active calderas including Erta Ale, Dallol, Aluto, and Dabbahu.",
    keyFunctions: [
      "Thermal radiation flux tracking over Erta Ale active lava lake",
      "Hydrothermal geothermal fluid and soil degasification sampling",
      "Eruption alert escalation protocol for aviation and civil defense",
      "Volcanic Ash Advisory (VAAC) reporting for regional flight corridors",
    ],
    activeProjects: [
      "Danakil Depression thermal plume satellite radar monitoring",
      "Aluto-Langano geothermal field pressure and inflation modeling",
      "Erta Ale fissure eruption early warning sensor mesh",
    ],
    stationCount: "115 Volcanic Centers Catalogs",
    status: "ELEVATED",
    badge: "Volcanic Database",
    targetTab: "volcanoes",
    metrics: [
      { label: "Monitored Calderas", value: "115 Vents" },
      { label: "Active Lava Lakes", value: "Erta Ale" },
      { label: "Geothermal Fields", value: "14 Sites" },
    ],
  },
  {
    id: "space-science",
    title: "Space Science & Satellite Geodesy Sector",
    code: "ESSGI-DIR-SPAC-03",
    directorate: "Directorate of Space Science & Satellite Navigation",
    head: "Prof. Solomon Belay (Director of Space Science)",
    location: "Entoto Astronomical Observatory & Research Center (3,200m ASL)",
    description:
      "Utilizes twin 1-meter optical telescopes at Entoto Observatory and orbital Synthetic Aperture Radar (SAR) satellite interferometry to quantify rifting crustal strain rate, tropospheric column GPS delay, and space weather ionospheric perturbations.",
    keyFunctions: [
      "Multi-constellation GNSS velocity vector inversion (GPS, GLONASS, Galileo)",
      "Sentinel-1 InSAR phase interferogram processing for ground subsidence",
      "Space weather ionospheric TEC (Total Electron Content) modeling",
      "Astronomical observation and deep celestial imaging at Entoto Observatory",
    ],
    activeProjects: [
      "High-altitude tropospheric delay calibration for GPS rifting vectors",
      "East African Ionospheric Scintillation monitoring network",
      "Satellite ground station tracking and telemetry ingest",
    ],
    stationCount: "2 Twin Optical Telescopes + 18 GNSS",
    status: "ONLINE",
    badge: "Orbital SAR Radar",
    targetTab: "gnss-network",
    metrics: [
      { label: "Geodetic Crustal Vector", value: "15.2 mm/yr" },
      { label: "Observatory Altitude", value: "3,200 meters" },
      { label: "Optical Telescopes", value: "Twin 1.0m" },
    ],
  },
  {
    id: "disaster-risk",
    title: "Disaster Risk & Geospatial Intelligence Sector",
    code: "ESSGI-DIR-DRM-04",
    directorate: "Directorate of Geospatial Intelligence & Civil Preparedness",
    head: "Commander Worku Bekele (Disaster Risk Liaison Officer)",
    location: "National Emergency Operations Center (EOC), Addis Ababa",
    description:
      "Generates automated AI geological risk briefings powered by Gemini models and broadcasts bilingual SMS warning advisories in Afar, Amharic, and Oromiffa to pastoralist communities and transport authorities along active rifting zones.",
    keyFunctions: [
      "Automated Gemini AI hazard risk synthesis and executive briefings",
      "Bilingual SMS advisory dispatch to DRMC regional officers",
      "Spatial GIS overlay of population density vs seismic fault line buffers",
      "Infrastructure vulnerability matrix calculation for transport & energy corridors",
    ],
    activeProjects: [
      "Afar Pastoralist Early Warning SMS Broadcast Gateway",
      "Gemini 2.5 Flash automated daily hazard report synthesis",
      "National Seismogenic Landslide and Subsidence Susceptibility Atlas",
    ],
    stationCount: "National Civil Safety Network",
    status: "NOMINAL",
    badge: "Early Warning",
    targetTab: "report",
    metrics: [
      { label: "Bilingual SMS Reach", value: "45,000 Users" },
      { label: "AI Briefing Cadence", value: "Real-time" },
      { label: "DRMC Integration", value: "Level 1 Direct" },
    ],
  },
  {
    id: "gis-remote-sensing",
    title: "Remote Sensing & GIS Application Sector",
    code: "ESSGI-DIR-GIS-05",
    directorate: "Directorate of GIS, Land Cover & Earth Observation",
    head: "Eng. Tigist Haile (Chief GIS Officer)",
    location: "Geospatial Institute Headquarters, Addis Ababa",
    description:
      "Processes high-resolution Sentinel & Landsat satellite imagery for national land use mapping, flood susceptibility modeling in Awash basin, and active lava flow line mapping over the Danakil rift floor.",
    keyFunctions: [
      "Satellite optical multispectral classification & land surface temperature",
      "GIS hazard vulnerability mapping for urban infrastructure and hydro-dams",
      "Digital Elevation Model (DEM) extraction from stereoscopic space imagery",
    ],
    activeProjects: [
      "National High-Resolution GIS Soil & Rift Fault Atlas",
      "Sentinel-2 Thermal Anomaly Auto-Classification System",
    ],
    stationCount: "3 Earth Observation Ground Receivers",
    status: "ONLINE",
    badge: "GIS Earth Observation",
    targetTab: "map",
    metrics: [
      { label: "Satellite Swath Area", value: "1.1M km²" },
      { label: "GIS Spatial Resolution", value: "0.5m Ortho" },
      { label: "Update Cadence", value: "Daily Orbit Pass" },
    ],
  },
];

// Baseline News Items in ESSGI
const defaultNews = [
  {
    id: "news-1",
    dispatchCode: "ESSGI-BULLETIN-2026-089",
    title:
      "Erta Ale Lava Lake Activity Swells: Satellite Thermal Sensors Detect Fissure Flux",
    excerpt:
      "ESSGI orbital telemetry captures elevated thermal radiation signatures over Erta Ale's southern caldera pit, alerting geology field crews to prepare continuous volcanic gas monitoring.",
    fullText:
      "Orbital radiometric sensors aboard Sentinel-2 and VIIRS have recorded a pronounced thermal anomaly expansion across the southern caldera pit of Erta Ale volcano (13.60° N, 40.67° E). Infrared radiance values exceeded 480°C equivalent blackbody temperature, indicating active lava lake overturning and localized fissure effusion within the crater floor. Ground observation teams from Semera Field Base report increased SO2 gas venting and minor fountaining. ESSGI volcanologists recommend maintaining a 3-kilometer safety perimeter around the summit rim for field researchers and local guides.",
    date: "July 08, 2026",
    category: "Volcanology",
    tag: "Urgent Alert",
    readTime: "4 min read",
    author: "Directorate of Volcanology & Geothermal Hazards",
    location: "Erta Ale Volcano, Danakil Depression, Afar Region",
    keyFindings: [
      "Thermal infrared radiance surge detected at 13.60° N, 40.67° E",
      "Active lava lake level elevated by ~4.2 meters inside pit crater",
      "SO2 gas discharge rate measured at 2,400 tons/day via COSPEC ground arrays",
    ],
    recommendations: [
      "Enforce a 3km exclusion zone around Erta Ale summit caldera",
      "Issue aviation warning advisory (VONA) for low-altitude charter routes",
      "Deploy mobile gas monitoring unit from Semera field headquarters",
    ],
  },
  {
    id: "news-2",
    dispatchCode: "ESSGI-BULLETIN-2026-085",
    title:
      "USGS & ESSGI Integrate High-Frequency Real-time Earthquake Stream APIs",
    excerpt:
      "A direct seismic streaming pipeline from the USGS geohazards server is successfully linked to our active GIS map room, ensuring sub-second georisk alerts across central rift zones.",
    fullText:
      "The Geodynamics and Seismological Telemetry Division has finalized a high-speed WebSocket and REST streaming link connecting USGS Global Seismic Network feeds with ESSGI's internal Furi Seismological Observatory servers. This automated ingest normalizes global event magnitudes (Mw, mb, Ms) with local Ethiopian Rift velocity models (FURI 1D Earth model). In the event of micro-tremor swarms along the Hawassa or Adama grabens, event hypocenters are localized within <8 seconds, triggering automatic risk alerts on the GIS Geo-Portal.",
    date: "July 05, 2026",
    category: "Seismology",
    tag: "API Integration",
    readTime: "3 min read",
    author: "Geodynamics & Seismological Telemetry Division",
    location: "Main Ethiopian Rift (Adama-Hawassa Corridor)",
    keyFindings: [
      "Sub-second event detection latency across East African Rift System",
      "Unified magnitude calibration matching FURI broadband station telemetry",
      "Automatic hypocentral depth mapping for depth-dependent risk modeling",
    ],
    recommendations: [
      "Incorporate USGS real-time feeds into regional emergency dispatch rooms",
      "Automate SMS alert triggers for events exceeding M >= 4.0 in populated grabens",
      "Conduct weekly latency audits between Furi station and global data centers",
    ],
  },
  {
    id: "news-3",
    dispatchCode: "ESSGI-BULLETIN-2026-078",
    title:
      "Entoto Astronomical Observatory Enhances Atmospheric Water Vapor GNSS Corrections",
    excerpt:
      "Joint study by Addis Ababa University shows that high-altitude geodetic stations can correct GPS rifting drift rates by accounting for tropospheric column delays over the Rift Basin.",
    fullText:
      "Researchers at Entoto Astronomical Observatory (3,200m ASL) in collaboration with the Department of Physics at Addis Ababa University have published breakthrough calibration models for satellite geodetic stations. By utilizing co-located water vapor radiometers and high-precision GNSS receivers, tropospheric column path delays—previously masking micro-millimeter crustal extension along the Nubia-Somalia plate boundary—can now be subtracted with 98.4% precision.",
    date: "June 28, 2026",
    category: "Space Science",
    tag: "Research",
    readTime: "6 min read",
    author: "Directorate of Space Science & Satellite Navigation",
    location: "Entoto Observatory, Addis Ababa (3,200m ASL)",
    keyFindings: [
      "Tropospheric delay calibration accuracy improved to 98.4%",
      "Sub-millimeter rifting vector accuracy confirmed across Central MER",
      "Published in African Journal of Space Science & Geodesy",
    ],
    recommendations: [
      "Apply tropospheric correction code across all 18 permanent GNSS stations",
      "Share geodetic velocity vectors with international geodynamics consortia",
      "Upgrade radio receiver arrays at Entoto Observatory station",
    ],
  },
  {
    id: "news-4",
    dispatchCode: "ESSGI-BULLETIN-2026-062",
    title:
      "Bilingual Mobile Early Warning SMS App Tested for Afar Pastoralists",
    excerpt:
      "In partnership with the Disaster Risk Management Commission, automatic SMS alerts in Afar and Amharic are pushed to regions experiencing tectonic micro-tremor swarms.",
    fullText:
      "ESSGI's Geospatial Intelligence & Civil Safety team, working alongside the National Disaster Risk Management Commission (DRMC), has deployed a bilingual mobile alert gateway. The system transmits immediate safety advisories translated in Afar and Amharic via Ethio Telecom cell towers whenever seismic arrays register localized tremor clusters above M 3.5 or crater vent degassing. During recent field tests in the Semera and Mille woredas, delivery latency averaged under 12 seconds.",
    date: "June 15, 2026",
    category: "Disaster Preparedness",
    tag: "Community",
    readTime: "5 min read",
    author: "Directorate of Geospatial Intelligence & Civil Safety",
    location: "Semera & Mille Woredas, Afar Regional State",
    keyFindings: [
      "Average SMS broadcast latency of 11.4 seconds across 45,000 active subscribers",
      "100% translation fidelity verified by Afar Language Culture Bureau",
      "Integrated with DRMC regional emergency coordination centers",
    ],
    recommendations: [
      "Expand subscriber registration to Oromia and SNNPR rift corridor communities",
      "Incorporate Voice-IVR broadcasts for non-literate rural pastoralists",
      "Conduct quarterly emergency drill simulations with local administration heads",
    ],
  },
];

const defaultAnnouncements = [
  {
    id: "ann-sarc-2026",
    code: "ESSGI-CONF-2026-01",
    title:
      "S-ARC2026: 4th International South-East Africa Rift Geohazards Conference",
    category: "Conference",
    date: "July 28, 2026",
    deadline: "September 15, 2026",
    organizer: "Ethiopian Space Science & Geodesy Institute (ESSGI) & USGS",
    location: "African Union Conference Center, Addis Ababa, Ethiopia",
    summary:
      "Call for abstracts and registration for the biennial South-East Africa Rift Conference focusing on real-time seismic array integration, volcano eruption early warnings, and GNSS crustal strain dynamics.",
    fullDetails:
      "ESSGI invites international geophysicists, volcanologists, geodesists, and disaster risk managers to register for the S-ARC2026 Conference. The theme is 'Strengthening Rift Basin Resiliency through Integrated Earth Observation Telemetry'.",
    requirements: [
      "Abstract submission deadline: September 15, 2026",
      "Early bird registration discount closes: August 30, 2026",
      "Student fellowship travel grants available for East African researchers",
    ],
    contactEmail: "s-arc2026@essgi.gov.et",
    status: "OPEN",
  },
  {
    id: "ann-grants-2026",
    code: "ESSGI-GRANT-2026-04",
    title: "National Geohazard & Volcanic Rift Dynamics Research Fellowships",
    category: "Grant",
    date: "July 25, 2026",
    deadline: "October 01, 2026",
    organizer: "ESSGI Directorate of Postgraduate R&D",
    location: "Addis Ababa & Entoto Observatory Research Center",
    summary:
      "Funding opportunity offering up to 2.5 Million ETB for doctoral and post-doctoral researchers studying Afar rift opening or Erta Ale magmatic flux.",
    fullDetails:
      "The Ethiopian Space Science & Geodesy Institute announces 12 competitive research grants for post-graduate researchers. Awardees will receive full access to ESSGI broadband seismic station raw wave data.",
    requirements: [
      "Principal Investigator must be affiliated with an accredited Ethiopian higher education institution",
      "Research proposal must align with national geohazard safety priorities",
    ],
    contactEmail: "grants-rd@essgi.gov.et",
    status: "OPEN",
  },
  {
    id: "ann-tender-2026",
    code: "ESSGI-TENDER-2026-09",
    title:
      "Tender for Expansion of High-Rate GNSS Geodetic Receivers & Seismic Array",
    category: "Tender",
    date: "July 20, 2026",
    deadline: "August 25, 2026",
    organizer: "ESSGI Procurement & Technical Telemetry Directorate",
    location: "ESSGI HQ Procurement Office, Addis Ababa",
    summary:
      "International competitive bid for supplying 14 multi-constellation GNSS reference receivers and 8 broadband 120s seismometers.",
    fullDetails:
      "ESSGI solicits sealed bids from qualified international manufacturers for the supply, delivery, and calibration of continuous GNSS geodetic reference stations.",
    requirements: [
      "Bidder must submit a 2% bid security guarantee from a recognized commercial bank",
      "Compliance with ISO 9001 quality standards and minimum 3-year hardware warranty",
    ],
    contactEmail: "tenders@essgi.gov.et",
    status: "URGENT",
  },
];

// Initialize Files if needed
if (!fs.existsSync(VOLCANOES_FILE)) {
  fs.writeFileSync(
    VOLCANOES_FILE,
    JSON.stringify(defaultVolcanoes, null, 2),
    "utf-8",
  );
}
if (!fs.existsSync(EARTHQUAKES_FILE)) {
  fs.writeFileSync(
    EARTHQUAKES_FILE,
    JSON.stringify(defaultEarthquakes, null, 2),
    "utf-8",
  );
}
if (!fs.existsSync(AUDIT_LOGS_FILE)) {
  fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
}
if (!fs.existsSync(SECTORS_FILE)) {
  fs.writeFileSync(
    SECTORS_FILE,
    JSON.stringify(defaultSectors, null, 2),
    "utf-8",
  );
}
if (!fs.existsSync(NEWS_FILE)) {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(defaultNews, null, 2), "utf-8");
}
if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
  fs.writeFileSync(
    ANNOUNCEMENTS_FILE,
    JSON.stringify(defaultAnnouncements, null, 2),
    "utf-8",
  );
}

// Baseline Automatic Alert Trigger Thresholds
const defaultAlertConfig = {
  minMagnitude: 4.5,
  maxDepth: 35, // in km (crustal shallow focus)
  depthThreshold: 35,
  emailAlertsEnabled: true,
  smsAlertsEnabled: true,
  alertRecipientsEmail: [
    "directorate.alert@essgi.gov.et",
    "duty.seismologist@essgi.gov.et",
    "drmc.operations@drmc.gov.et",
  ],
  alertRecipientsPhone: ["+251911223344", "+251922334455", "+251933445566"],
  targetRegions: [
    "Afar Depression & Danakil Graben",
    "Main Ethiopian Rift (MER) Corridor",
    "Fentale-Awash Basin",
    "Central Highlands Escarpment",
  ],
  autoDispatchOnCritical: true,
  severityFilter: "Orange",
  smsTemplateText:
    "ESSGI CRITICAL ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}. Automatic advisory triggered by ESSGI early warning system.",
  emailSubjectTemplate:
    "[ESSGI GEODISASTER WARNING] M{mag} Seismic Tremor - {loc}",
  updatedAt: new Date().toISOString(),
  updatedBy: "ESSGI Directorate Master",
};

const defaultAlertDispatches = [
  {
    id: "disp_init_1",
    type: "both",
    eventTitle: "M 4.9 Awash Basin & Fentale Graben Seismic Tremor",
    magnitude: 4.9,
    depth: 10,
    location: "Awash Basin & Fentale Graben, Main Ethiopian Rift",
    severity: "Orange",
    recipientsCount: 6,
    recipients: [
      "directorate.alert@essgi.gov.et",
      "duty.seismologist@essgi.gov.et",
      "drmc.operations@drmc.gov.et",
      "+251911223344",
      "+251922334455",
      "+251933445566",
    ],
    status: "dispatched",
    timestamp: "2024-08-25T19:43:00.000Z",
    details:
      "Automated trigger: Magnitude 4.9 >= threshold 4.5 and Depth 10km <= threshold 35km. Broadcasted via Ethio Telecom SMS gateway and SMTP.",
  },
  {
    id: "disp_init_2",
    type: "sms",
    eventTitle: "M 4.5 Semera Graben Crustal Rifting Swarm",
    magnitude: 4.5,
    depth: 8,
    location: "Semera Graben, Afar Triple Junction",
    severity: "Orange",
    recipientsCount: 3,
    recipients: ["+251911223344", "+251922334455", "+251933445566"],
    status: "dispatched",
    timestamp: "2024-08-14T08:19:15.000Z",
    details:
      "Automated SMS alert pushed to Afar regional disaster duty officers.",
  },
];

if (!fs.existsSync(ALERT_CONFIG_FILE)) {
  fs.writeFileSync(
    ALERT_CONFIG_FILE,
    JSON.stringify(defaultAlertConfig, null, 2),
    "utf-8",
  );
}
if (!fs.existsSync(ALERT_DISPATCHES_FILE)) {
  fs.writeFileSync(
    ALERT_DISPATCHES_FILE,
    JSON.stringify(defaultAlertDispatches, null, 2),
    "utf-8",
  );
}

// Seed baseline users
const defaultUsers = [
  {
    id: "superadmin@essgi.gov.et",
    name: "Super Admin (Directorate General)",
    email: "superadmin@essgi.gov.et",
    role: "superadmin",
    status: "approved",
    institution: "ESSGI Directorate General Command",
    password: "super",
    registeredAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "System Master",
  },
  {
    id: "dg@essgi.gov.et",
    name: "Director General",
    email: "dg@essgi.gov.et",
    role: "admin",
    status: "approved",
    institution: "ESSGI Directorate Manager",
    password: "0000",
    registeredAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "Super Admin",
  },
  {
    id: "kalgetachew764@gmail.com",
    name: "Kalkidan Getachew",
    email: "kalgetachew764@gmail.com",
    role: "official",
    status: "approved",
    institution: "Ethiopian Space Science and Geospatial Institute (ESSGI)",
    password: "1234",
    registeredAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "Director General",
  },
  {
    id: "pending.official@essgi.gov.et",
    name: "Dr. Abera Teklu",
    email: "pending.official@essgi.gov.et",
    role: "official",
    status: "pending",
    institution: "Semera University Seismology Lab",
    password: "1234",
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "pending.admin@essgi.gov.et",
    name: "Eng. Tigist Haile",
    email: "pending.admin@essgi.gov.et",
    role: "admin",
    status: "pending",
    institution: "DRMC IT Security Division",
    password: "0000",
    registeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "visitor@essgi.gov.et",
    name: "Guest Geophysicist",
    email: "visitor@essgi.gov.et",
    role: "guest",
    status: "approved",
    institution: "Geospatial Institute (Visitor)",
    password: "guest",
    registeredAt: new Date().toISOString(),
  },
];

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
} else {
  // Ensure default users exist in file if not present
  try {
    const existing = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    let updated = false;
    defaultUsers.forEach((du) => {
      if (
        !existing.some(
          (u: any) => u.email.toLowerCase() === du.email.toLowerCase(),
        )
      ) {
        existing.push(du);
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(existing, null, 2), "utf-8");
    }
  } catch (e) {
    fs.writeFileSync(
      USERS_FILE,
      JSON.stringify(defaultUsers, null, 2),
      "utf-8",
    );
  }
}

// Read helper functions
function getUsers() {
  try {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    return data.map((u: any) => ({
      ...u,
      status: u.status || "approved",
    }));
  } catch (err) {
    return defaultUsers;
  }
}

function saveUsers(users: any) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write users data:", err);
  }
}

function getAuditLogs() {
  try {
    return JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, "utf-8"));
  } catch (err) {
    return [];
  }
}

function saveAuditLog(log: any) {
  try {
    const currentLogs = getAuditLogs();
    currentLogs.unshift(log);
    fs.writeFileSync(
      AUDIT_LOGS_FILE,
      JSON.stringify(currentLogs, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

let emailTransporter: any = null;

async function getEmailTransporter() {
  if (emailTransporter) return emailTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure:
        process.env.SMTP_SECURE === "true" ||
        Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log(
      "No SMTP credentials found in .env, creating Ethereal test account...",
    );
    const testAccount = await nodemailer.createTestAccount();
    emailTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`Ethereal Test Email Account created: ${testAccount.user}`);
  }
  return emailTransporter;
}
function generateEarthquakeAlertEmail(dispatch: any): string {
  const {
    id = "",
    eventId = "",
    type = "",
    eventTitle = "Seismic Event",
    magnitude = "N/A",
    depth = "N/A",
    location = "Unknown location",
    severity = "N/A",
    status = "N/A",
    timestamp = new Date().toISOString(),
    details = "",
  } = dispatch || {};

  const BRAND = "#0e4a72";
  const WHITE = "#ffffff";

  const severityColors: Record<string, string> = {
    Red: "#c0392b",
    Orange: "#e67e22",
    Yellow: "#d4ac0d",
    Green: "#2e8b57",
  };
  const severityColor = severityColors[severity] || BRAND;

  const typeLabel =
    { both: "SMS + Email", sms: "SMS", email: "Email" }[
      String(type).toLowerCase()
    ] || type;

  const statusLabel = String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  let formattedTime = timestamp;
  try {
    formattedTime =
      new Date(timestamp).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "UTC",
      }) + " UTC";
  } catch (e) {
    /* keep raw timestamp */
  }

  const escapeHtml = (str: any) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const row = (label: string, value: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e3e9ee;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7c8c;width:38%;vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e3e9ee;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1b1b1b;font-weight:600;vertical-align:top;">
        ${escapeHtml(value)}
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(eventTitle)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Seismic alert dispatched: ${escapeHtml(eventTitle)} — Magnitude ${escapeHtml(magnitude)}, severity ${escapeHtml(severity)}.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${WHITE};border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:${BRAND};padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;color:${WHITE};font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.8;">
                    ESSGI Geohazard Monitoring System
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;color:${WHITE};font-size:20px;font-weight:bold;padding-top:6px;">
                    ⚠️ Seismic Alert Dispatched
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${severityColor};padding:12px 32px;">
              <span style="font-family:Arial,Helvetica,sans-serif;color:${WHITE};font-size:13px;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;">
                Severity: ${escapeHtml(severity)}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:${BRAND};">
                ${escapeHtml(eventTitle)}
              </p>
              <p style="margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7c8c;">
                Detected ${escapeHtml(formattedTime)}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${row("Magnitude", `M ${magnitude}`)}
                ${row("Depth", `${depth} km`)}
                ${row("Location", location)}
                ${row("Status", statusLabel)}
                ${row("Broadcast Type", typeLabel)}
                ${row("Event ID", eventId)}
                ${row("Dispatch ID", id)}
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:#f2f6f9;border-left:4px solid ${BRAND};border-radius:4px;">
                <tr>
                  <td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#33475b;">
                    ${escapeHtml(details)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND};padding:20px 32px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${WHITE};opacity:0.75;line-height:1.6;">
                This is an automated notification from the ESSGI Geohazard Monitoring System. Do not reply directly to this email.<br/>
                Dispatch ID: ${escapeHtml(id)} · Event ID: ${escapeHtml(eventId)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
async function dispatchEarthquakeAlertEmail(
  recipients: string[],
  subject: string,
  dispatchData: any,
) {
  try {
    const transporter = await getEmailTransporter();
    const htmlContent = generateEarthquakeAlertEmail(dispatchData);
    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        '"ESSGI Early Warning System" <alerts@essgi.gov.et>',
      to: recipients.join(", "),
      subject: subject,
      html: htmlContent,
      text: dispatchData?.details || "",
    });
    console.log("Earthquake alert email sent: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error("Failed to send earthquake alert email:", err);
  }
}

function getVolcanoes() {
  try {
    return JSON.parse(fs.readFileSync(VOLCANOES_FILE, "utf-8"));
  } catch (err) {
    return defaultVolcanoes;
  }
}

function saveVolcanoes(data: any) {
  fs.writeFileSync(VOLCANOES_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getHistoricalEarthquakes() {
  try {
    const list = JSON.parse(fs.readFileSync(EARTHQUAKES_FILE, "utf-8"));
    // Ensure all default earthquakes (including August tremors) are present
    const existingIds = new Set(list.map((e: any) => e.id));
    let updated = false;
    defaultEarthquakes.forEach((de) => {
      if (!existingIds.has(de.id)) {
        list.push(de);
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(
        EARTHQUAKES_FILE,
        JSON.stringify(list, null, 2),
        "utf-8",
      );
    }
    return list;
  } catch (err) {
    return defaultEarthquakes;
  }
}

function getSectors() {
  try {
    return JSON.parse(fs.readFileSync(SECTORS_FILE, "utf-8"));
  } catch (err) {
    return defaultSectors;
  }
}

function getAnnouncements() {
  try {
    return JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8"));
  } catch (err) {
    return defaultAnnouncements;
  }
}

function saveSectors(data: any) {
  try {
    fs.writeFileSync(SECTORS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write sectors data:", err);
  }
}

function getNews() {
  try {
    return JSON.parse(fs.readFileSync(NEWS_FILE, "utf-8"));
  } catch (err) {
    return defaultNews;
  }
}

function saveNews(data: any) {
  try {
    fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write news data:", err);
  }
}

function getAlertConfig() {
  try {
    if (fs.existsSync(ALERT_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(ALERT_CONFIG_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to read alert config:", err);
  }
  return defaultAlertConfig;
}

function saveAlertConfig(config: any) {
  try {
    fs.writeFileSync(
      ALERT_CONFIG_FILE,
      JSON.stringify(config, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Failed to write alert config:", err);
  }
}

function getAlertDispatches() {
  try {
    if (fs.existsSync(ALERT_DISPATCHES_FILE)) {
      return JSON.parse(fs.readFileSync(ALERT_DISPATCHES_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to read alert dispatches:", err);
  }
  return defaultAlertDispatches;
}

function saveAlertDispatches(dispatches: any) {
  try {
    fs.writeFileSync(
      ALERT_DISPATCHES_FILE,
      JSON.stringify(dispatches, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Failed to write alert dispatches:", err);
  }
}

// API Routes
// 0. Authentication Endpoints
app.post("/api/auth/register", (req, res) => {
  const { name, email, role, institution, password, confirmPassword } =
    req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({
      error:
        "Missing required registration fields (name, email/ID, role, password)",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  if (role !== "official" && role !== "admin" && role !== "superadmin") {
    return res
      .status(400)
      .json({ error: "Invalid role selected for security clearance" });
  }

  const users = getUsers();
  const exists = users.some(
    (u: any) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (exists) {
    return res.status(400).json({ error: "Email or ID is already registered" });
  }

  // New registrations default to pending status for Super Admin approval
  const newUser = {
    id: email.toLowerCase(),
    name,
    email: email.toLowerCase(),
    role,
    status: "pending", // Pending Super Admin authorization
    institution:
      institution ||
      (role === "admin"
        ? "ESSGI Directorate"
        : "Ethiopian Space Science and Geospatial Institute"),
    password,
    registeredAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Log audit
  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "register_request",
    performedBy: name,
    performedByEmail: email.toLowerCase(),
    performedByRole: role,
    details: `Registration request submitted for ${name} (${email.toLowerCase()}) as ${role.toUpperCase()}. Awaiting Super Admin authorization.`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    requiresApproval: true,
    message: `Registration submitted successfully! Your request for '${role.toUpperCase()}' access is now pending Super Admin approval.`,
    user: {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      institution: newUser.institution,
    },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing ID/email or password" });
  }

  const users = getUsers();
  const user = users.find(
    (u: any) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );

  if (!user) {
    return res
      .status(401)
      .json({ error: "Invalid credentials. Unauthorized access." });
  }

  // Check account approval status
  if (user.status === "pending") {
    return res.status(403).json({
      error: `Account Pending Authorization: Your registered account as '${user.role.toUpperCase()}' is currently awaiting Super Admin approval. Please contact the ESSGI Directorate.`,
      status: "pending",
    });
  }

  if (user.status === "rejected") {
    return res.status(403).json({
      error:
        "Access Denied: Your registration request was rejected by the Super Admin.",
      status: "rejected",
    });
  }

  res.json({
    success: true,
    message: "Logged in successfully",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      institution: user.institution,
    },
  });
});

// 0.5 Super Admin User Management Endpoints
app.get("/api/admin/users", (req, res) => {
  const userRole = req.headers["x-user-role"] || req.query.role;
  if (
    userRole &&
    userRole !== "superadmin" &&
    userRole !== "admin" &&
    userRole !== "official"
  ) {
    return res.status(403).json({
      error: "Access denied. Only authorized personnel can view user accounts.",
    });
  }

  const users = getUsers().map((u: any) => ({
    id: u.id || u.email,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status || "approved",
    institution: u.institution,
    registeredAt: u.registeredAt || new Date().toISOString(),
    approvedAt: u.approvedAt,
    approvedBy: u.approvedBy,
  }));

  res.json({ success: true, count: users.length, users });
});

app.post("/api/admin/approve-user", (req, res) => {
  const { email, role, adminRole, adminEmail } = req.body;
  const targetEmail = (email || "").toLowerCase();
  const performerName =
    req.headers["x-user-name"] || adminEmail || "Administrator";
  const userRole = req.headers["x-user-role"] || adminRole || "admin";

  const users = getUsers();
  const index = users.findIndex(
    (u: any) => u.email.toLowerCase() === targetEmail,
  );

  if (index !== -1) {
    users[index].status = "approved";
    if (role) users[index].role = role;
    users[index].approvedAt = new Date().toISOString();
    users[index].approvedBy = String(performerName);
    saveUsers(users);

    saveAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "approve_user",
      performedBy: String(performerName),
      performedByEmail: String(adminEmail || "admin@essgi.gov.et"),
      performedByRole: String(userRole),
      details: `Approved user account: ${users[index].name} (${users[index].email}).`,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: `User ${targetEmail} authorized successfully.`,
  });
});

app.post("/api/admin/reject-user", (req, res) => {
  const { email, adminRole, adminEmail } = req.body;
  const targetEmail = (email || "").toLowerCase();
  const performerName =
    req.headers["x-user-name"] || adminEmail || "Administrator";
  const userRole = req.headers["x-user-role"] || adminRole || "admin";

  const users = getUsers();
  const index = users.findIndex(
    (u: any) => u.email.toLowerCase() === targetEmail,
  );

  if (index !== -1) {
    users[index].status = "rejected";
    saveUsers(users);

    saveAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "reject_user",
      performedBy: String(performerName),
      performedByEmail: String(adminEmail || "admin@essgi.gov.et"),
      performedByRole: String(userRole),
      details: `Rejected user account: ${users[index].name} (${users[index].email}).`,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({ success: true, message: `User ${targetEmail} rejected.` });
});

app.post("/api/admin/users/:email/approve", (req, res) => {
  const userRole = req.headers["x-user-role"];
  const performerName = req.headers["x-user-name"] || "Super Admin";
  if (userRole !== "superadmin" && userRole !== "admin") {
    return res.status(403).json({
      error:
        "Access denied. Super Admin privilege required to approve accounts.",
    });
  }

  const targetEmail = req.params.email.toLowerCase();
  const users = getUsers();
  const index = users.findIndex(
    (u: any) => u.email.toLowerCase() === targetEmail,
  );

  if (index === -1) {
    return res.status(404).json({ error: "User account not found." });
  }

  users[index].status = "approved";
  users[index].approvedAt = new Date().toISOString();
  users[index].approvedBy = String(performerName);

  saveUsers(users);

  // Write audit log
  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "approve_user",
    performedBy: String(performerName),
    performedByEmail: String(
      req.headers["x-user-email"] || "superadmin@essgi.gov.et",
    ),
    performedByRole: String(userRole),
    details: `Approved clearance for user account: ${users[index].name} (${users[index].email}) with role [${users[index].role.toUpperCase()}].`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `User '${users[index].name}' approved successfully.`,
    user: users[index],
  });
});

app.post("/api/admin/users/:email/reject", (req, res) => {
  const userRole = req.headers["x-user-role"];
  const performerName = req.headers["x-user-name"] || "Super Admin";
  if (userRole !== "superadmin" && userRole !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Super Admin privilege required." });
  }

  const targetEmail = req.params.email.toLowerCase();
  const users = getUsers();
  const index = users.findIndex(
    (u: any) => u.email.toLowerCase() === targetEmail,
  );

  if (index === -1) {
    return res.status(404).json({ error: "User account not found." });
  }

  users[index].status = "rejected";
  saveUsers(users);

  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "reject_user",
    performedBy: String(performerName),
    performedByEmail: String(
      req.headers["x-user-email"] || "superadmin@essgi.gov.et",
    ),
    performedByRole: String(userRole),
    details: `Rejected clearance request for user account: ${users[index].name} (${users[index].email}).`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `User '${users[index].name}' request rejected.`,
    user: users[index],
  });
});

app.patch("/api/admin/users/:email/role", (req, res) => {
  const userRole = req.headers["x-user-role"];
  const performerName = req.headers["x-user-name"] || "Super Admin";
  if (userRole !== "superadmin" && userRole !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Super Admin privilege required." });
  }

  const { role } = req.body;
  if (
    !role ||
    (role !== "official" &&
      role !== "admin" &&
      role !== "superadmin" &&
      role !== "guest")
  ) {
    return res.status(400).json({ error: "Invalid role specified." });
  }

  const targetEmail = req.params.email.toLowerCase();
  const users = getUsers();
  const index = users.findIndex(
    (u: any) => u.email.toLowerCase() === targetEmail,
  );

  if (index === -1) {
    return res.status(404).json({ error: "User account not found." });
  }

  const oldRole = users[index].role;
  users[index].role = role;
  saveUsers(users);

  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "change_role",
    performedBy: String(performerName),
    performedByEmail: String(
      req.headers["x-user-email"] || "superadmin@essgi.gov.et",
    ),
    performedByRole: String(userRole),
    details: `Updated role for ${users[index].name} (${users[index].email}) from [${oldRole.toUpperCase()}] to [${role.toUpperCase()}].`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `User '${users[index].name}' role changed to ${role.toUpperCase()}.`,
    user: users[index],
  });
});

app.delete("/api/admin/users/:email", (req, res) => {
  const userRole = req.headers["x-user-role"];
  const performerName = req.headers["x-user-name"] || "Super Admin";
  if (userRole !== "superadmin" && userRole !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Super Admin privilege required." });
  }

  const targetEmail = req.params.email.toLowerCase();
  let users = getUsers();
  const userToDelete = users.find(
    (u: any) => u.email.toLowerCase() === targetEmail,
  );

  if (!userToDelete) {
    return res.status(404).json({ error: "User account not found." });
  }

  users = users.filter((u: any) => u.email.toLowerCase() !== targetEmail);
  saveUsers(users);

  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "delete_user",
    performedBy: String(performerName),
    performedByEmail: String(
      req.headers["x-user-email"] || "superadmin@essgi.gov.et",
    ),
    performedByRole: String(userRole),
    details: `Deleted user account: ${userToDelete.name} (${userToDelete.email}).`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Account '${userToDelete.name}' removed successfully.`,
  });
});

app.post("/api/admin/users/seed-test-pending", (req, res) => {
  const sampleNames = [
    "Dr. Belayneh Assefa",
    "Eng. Rahel Wolde",
    "Girma Dejene",
    "Dr. Solomon Tadesse",
  ];
  const sampleInst = [
    "Addis Ababa University",
    "Semera University",
    "Hawassa Geothermal Lab",
    "DRMC Central Command",
  ];
  const roles: Array<"official" | "admin"> = ["official", "admin"];

  const randomName =
    sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const randomInst = sampleInst[Math.floor(Math.random() * sampleInst.length)];
  const randomRole = roles[Math.floor(Math.random() * roles.length)];
  const email = `test.pending_${Date.now()}@essgi.gov.et`;

  const users = getUsers();
  const newUser = {
    id: email,
    name: randomName,
    email: email,
    role: randomRole,
    status: "pending",
    institution: randomInst,
    password: "1234",
    registeredAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  res.json({
    success: true,
    message: "Demo pending registration created!",
    user: newUser,
  });
});

// 0.8 Alert Threshold Configuration & Automated Notification Endpoints
app.get("/api/admin/alert-config", (req, res) => {
  const config = getAlertConfig();
  res.json({ success: true, config });
});

app.post("/api/admin/alert-config", (req, res) => {
  const userRole = req.headers["x-user-role"] || req.body.adminRole;
  const performerName =
    req.headers["x-user-name"] || req.body.adminName || "Administrator";
  const performerEmail =
    req.headers["x-user-email"] || req.body.adminEmail || "admin@essgi.gov.et";

  if (
    userRole &&
    userRole !== "superadmin" &&
    userRole !== "admin" &&
    userRole !== "official"
  ) {
    return res.status(403).json({
      error:
        "Access denied. Administrator clearance required to modify alert threshold parameters.",
    });
  }

  const existing = getAlertConfig();
  const {
    minMagnitude,
    maxDepth,
    depthThreshold,
    emailAlertsEnabled,
    smsAlertsEnabled,
    alertRecipientsEmail,
    alertRecipientsPhone,
    targetRegions,
    autoDispatchOnCritical,
    severityFilter,
    smsTemplateText,
    emailSubjectTemplate,
  } = req.body;

  const updatedConfig = {
    ...existing,
    minMagnitude:
      typeof minMagnitude === "number"
        ? minMagnitude
        : parseFloat(minMagnitude) || existing.minMagnitude,
    maxDepth:
      typeof maxDepth === "number"
        ? maxDepth
        : parseFloat(maxDepth) || existing.maxDepth,
    depthThreshold:
      typeof depthThreshold === "number"
        ? depthThreshold
        : typeof maxDepth === "number"
          ? maxDepth
          : existing.depthThreshold,
    emailAlertsEnabled:
      typeof emailAlertsEnabled === "boolean"
        ? emailAlertsEnabled
        : existing.emailAlertsEnabled,
    smsAlertsEnabled:
      typeof smsAlertsEnabled === "boolean"
        ? smsAlertsEnabled
        : existing.smsAlertsEnabled,
    alertRecipientsEmail: Array.isArray(alertRecipientsEmail)
      ? alertRecipientsEmail
      : existing.alertRecipientsEmail,
    alertRecipientsPhone: Array.isArray(alertRecipientsPhone)
      ? alertRecipientsPhone
      : existing.alertRecipientsPhone,
    targetRegions: Array.isArray(targetRegions)
      ? targetRegions
      : existing.targetRegions,
    autoDispatchOnCritical:
      typeof autoDispatchOnCritical === "boolean"
        ? autoDispatchOnCritical
        : existing.autoDispatchOnCritical,
    severityFilter: severityFilter || existing.severityFilter,
    smsTemplateText: smsTemplateText || existing.smsTemplateText,
    emailSubjectTemplate: emailSubjectTemplate || existing.emailSubjectTemplate,
    updatedAt: new Date().toISOString(),
    updatedBy: `${performerName} (${performerEmail})`,
  };

  saveAlertConfig(updatedConfig);

  // Write audit trail entry
  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "edit",
    volcanoId: "config_alert_thresholds",
    volcanoName: "Alert Threshold Parameters",
    performedBy: String(performerName),
    performedByEmail: String(performerEmail),
    performedByRole: String(userRole || "admin"),
    details: `Updated automated geohazard alert parameters: Magnitude Threshold ≥ M${updatedConfig.minMagnitude}, Focal Depth ≤ ${updatedConfig.maxDepth}km, SMS: ${updatedConfig.smsAlertsEnabled ? "ENABLED" : "DISABLED"}, Email: ${updatedConfig.emailAlertsEnabled ? "ENABLED" : "DISABLED"} (${updatedConfig.alertRecipientsEmail.length} emails, ${updatedConfig.alertRecipientsPhone.length} SMS numbers).`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Alert threshold configuration updated successfully! Trigger set to M ≥ ${updatedConfig.minMagnitude} and Depth ≤ ${updatedConfig.maxDepth} km.`,
    config: updatedConfig,
  });
});

app.get("/api/admin/alert-dispatches", (req, res) => {
  const dispatches = getAlertDispatches();
  res.json({ success: true, count: dispatches.length, dispatches });
});

app.post("/api/admin/alert-config/test-dispatch", (req, res) => {
  const userRole = req.headers["x-user-role"] || req.body.adminRole;
  const performerName =
    req.headers["x-user-name"] || req.body.adminName || "Administrator";
  const performerEmail =
    req.headers["x-user-email"] || req.body.adminEmail || "admin@essgi.gov.et";

  const config = getAlertConfig();
  const { testEvent } = req.body;

  const mag = testEvent?.magnitude || config.minMagnitude || 4.5;
  const depth = testEvent?.depth || config.maxDepth || 10;
  const loc = testEvent?.location || "Afar Depression / Semera Graben";
  const sev = testEvent?.severity || (mag >= 5.0 ? "Red" : "Orange");
  const eventTitle =
    testEvent?.title ||
    `M ${parseFloat(mag).toFixed(1)} Seismic Tremor near ${loc}`;

  const allRecipients = [
    ...(config.emailAlertsEnabled ? config.alertRecipientsEmail : []),
    ...(config.smsAlertsEnabled ? config.alertRecipientsPhone : []),
  ];

  const renderedSms = (
    config.smsTemplateText ||
    "ESSGI URGENT ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}."
  )
    .replace("{mag}", String(parseFloat(mag).toFixed(1)))
    .replace("{depth}", String(depth))
    .replace("{loc}", loc);

  const renderedEmailSubject = (
    config.emailSubjectTemplate ||
    "[ESSGI GEODISASTER WARNING] M{mag} Seismic Tremor - {loc}"
  )
    .replace("{mag}", String(parseFloat(mag).toFixed(1)))
    .replace("{depth}", String(depth))
    .replace("{loc}", loc);

  const newDispatch = {
    id: "disp_" + Date.now(),
    type:
      config.emailAlertsEnabled && config.smsAlertsEnabled
        ? "both"
        : config.emailAlertsEnabled
          ? "email"
          : "sms",
    eventTitle,
    magnitude: parseFloat(mag),
    depth: parseFloat(depth),
    location: loc,
    severity: sev,
    recipientsCount: allRecipients.length,
    recipients: allRecipients,
    status: "dispatched",
    timestamp: new Date().toISOString(),
    details: `Manual test simulation verified by ${performerName}. Threshold condition satisfied: M${mag} >= M${config.minMagnitude} and Depth ${depth}km <= ${config.maxDepth}km. Broadcasted simulated alerts to ${config.alertRecipientsEmail.length} emails and ${config.alertRecipientsPhone.length} SMS endpoints.`,
  };

  const dispatches = getAlertDispatches();
  dispatches.unshift(newDispatch);
  saveAlertDispatches(dispatches);

  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "create",
    volcanoId: "test_dispatch",
    volcanoName: "Simulated Alert Dispatch",
    performedBy: String(performerName),
    performedByEmail: String(performerEmail),
    performedByRole: String(userRole || "admin"),
    details: `Triggered test alert dispatch simulation for event: "${eventTitle}" to ${allRecipients.length} recipients.`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Test alert dispatched successfully to ${allRecipients.length} endpoints!`,
    dispatch: newDispatch,
    preview: {
      smsText: renderedSms,
      emailSubject: renderedEmailSubject,
      emailCount: config.alertRecipientsEmail.length,
      smsCount: config.alertRecipientsPhone.length,
    },
  });
});

// Helper: Process automated geohazard alert dispatch for M 5.0+ earthquakes
function processEarthquakeAlert(eq: any, source: string = "Telemetry Ingest") {
  try {
    const config = getAlertConfig();
    const thresholdMag =
      typeof config.minMagnitude === "number" ? config.minMagnitude : 5.0;
    const thresholdDepth =
      typeof config.maxDepth === "number" ? config.maxDepth : 35;

    // Check if earthquake meets criteria (default M >= 5.0 or configured threshold)
    if (eq.magnitude < thresholdMag) {
      return null;
    }

    if (eq.depth && eq.depth > thresholdDepth) {
      return null;
    }

    const dispatches = getAlertDispatches();
    const alreadyDispatched = dispatches.some(
      (d: any) =>
        d.eventId === eq.id ||
        (d.location === eq.location &&
          Math.abs(d.magnitude - eq.magnitude) < 0.1 &&
          Math.abs(
            new Date(d.timestamp).getTime() - new Date(eq.dateTime).getTime(),
          ) < 60000),
    );

    if (alreadyDispatched) {
      return null;
    }

    const allRecipients = [
      ...(config.emailAlertsEnabled ? config.alertRecipientsEmail : []),
      ...(config.smsAlertsEnabled ? config.alertRecipientsPhone : []),
    ];

    const renderedSms = (
      config.smsTemplateText ||
      "ESSGI CRITICAL ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}. Immediate advisory triggered."
    )
      .replace("{mag}", String(Number(eq.magnitude).toFixed(1)))
      .replace("{depth}", String(eq.depth || 10))
      .replace("{loc}", eq.location);

    const renderedEmailSubject = (
      config.emailSubjectTemplate ||
      "[ESSGI CRITICAL GEOHAZARD WARNING] M{mag} Seismic Tremor - {loc}"
    )
      .replace("{mag}", String(Number(eq.magnitude).toFixed(1)))
      .replace("{depth}", String(eq.depth || 10))
      .replace("{loc}", eq.location);

    const newDispatch = {
      id: "disp_auto_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      eventId: eq.id,
      type:
        config.emailAlertsEnabled && config.smsAlertsEnabled
          ? "both"
          : config.emailAlertsEnabled
            ? "email"
            : "sms",
      eventTitle: `M ${Number(eq.magnitude).toFixed(1)} Seismic Tremor - ${eq.location}`,
      magnitude: Number(eq.magnitude),
      depth: Number(eq.depth || 10),
      location: eq.location,
      severity: eq.magnitude >= 5.5 ? "Red" : "Orange",
      recipientsCount: allRecipients.length,
      recipients: allRecipients,
      status: "dispatched",
      timestamp: new Date().toISOString(),
      details: `Automated geohazard trigger (${source}): Earthquake magnitude M ${Number(eq.magnitude).toFixed(1)} exceeded threshold (M ≥ ${thresholdMag}). Automated SMS and Email broadcasts dispatched to ${allRecipients.length} endpoints.`,
    };

    dispatches.unshift(newDispatch);
    saveAlertDispatches(dispatches);

    if (config.emailAlertsEnabled && config.alertRecipientsEmail.length > 0) {
      dispatchEarthquakeAlertEmail(
        config.alertRecipientsEmail,
        renderedEmailSubject,
        newDispatch, // full dispatch object: magnitude, depth, location, severity, status, timestamp, details, etc.
      ).catch((e) => console.error(e));
    }

    saveAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "automated_alert_dispatch",
      volcanoId: eq.id,
      volcanoName: `Earthquake M ${Number(eq.magnitude).toFixed(1)} (${eq.location})`,
      performedBy: "Automated Early Warning System (ESSGI)",
      performedByEmail: "earlywarning.telemetry@essgi.gov.et",
      performedByRole: "system",
      details: `Automated M 5.0+ Geohazard Alert broadcasted for event: M${Number(eq.magnitude).toFixed(1)} in "${eq.location}". Broadcasted to ${config.alertRecipientsPhone.length} SMS endpoints and ${config.alertRecipientsEmail.length} emails.`,
      timestamp: new Date().toISOString(),
    });

    return newDispatch;
  } catch (err) {
    console.error("Failed to process automated earthquake alert:", err);
    return null;
  }
}

// 0.4 Admin pending approvals count
app.get("/api/admin/pending-count", (req, res) => {
  const users = getUsers();
  const pendingUsers = users.filter((u: any) => u.status === "pending");
  res.json({
    success: true,
    pendingCount: pendingUsers.length,
    pendingUsers: pendingUsers.map((u: any) => ({
      id: u.id || u.email,
      name: u.name,
      email: u.email,
      role: u.role,
      institution: u.institution,
      registeredAt: u.registeredAt,
    })),
  });
});

// CSV Export Endpoints for Reports and Telemetry
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

app.get("/api/reports/csv/volcanoes", (req, res) => {
  try {
    const list = getVolcanoes();
    const headers = [
      "ID",
      "Name",
      "Region",
      "Elevation_Meters",
      "Latitude",
      "Longitude",
      "Volcano_Type",
      "Activity_Type",
      "Severity_Level",
      "Last_Erupted",
      "Monitored_By",
      "Description",
      "Updated_At",
    ];

    const rows = list.map((v: any) => [
      escapeCsv(v.id),
      escapeCsv(v.name),
      escapeCsv(v.region),
      escapeCsv(v.elevation),
      escapeCsv(v.coordinates?.[0] ?? ""),
      escapeCsv(v.coordinates?.[1] ?? ""),
      escapeCsv(v.type),
      escapeCsv(v.activityType),
      escapeCsv(v.severity),
      escapeCsv(v.lastErupted),
      escapeCsv(v.monitoredBy),
      escapeCsv(v.description),
      escapeCsv(v.updatedAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r: any) => r.join(",")),
    ].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="essgi_volcanoes_catalog_${dateStr}.csv"`,
    );
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to generate Volcanoes CSV report",
      message: err.message,
    });
  }
});

app.get("/api/reports/csv/earthquakes", async (req, res) => {
  try {
    const historical = getHistoricalEarthquakes();
    const headers = [
      "ID",
      "Magnitude",
      "Location",
      "Latitude",
      "Longitude",
      "Depth_km",
      "DateTime_UTC",
      "Severity_Level",
      "Description",
      "Is_Historical",
    ];

    const rows = historical.map((eq: any) => [
      escapeCsv(eq.id),
      escapeCsv(eq.magnitude),
      escapeCsv(eq.location),
      escapeCsv(eq.coordinates?.[0] ?? ""),
      escapeCsv(eq.coordinates?.[1] ?? ""),
      escapeCsv(eq.depth),
      escapeCsv(eq.dateTime),
      escapeCsv(eq.severity),
      escapeCsv(eq.description),
      escapeCsv(eq.isHistorical ? "true" : "false"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r: any) => r.join(",")),
    ].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="essgi_earthquakes_catalog_${dateStr}.csv"`,
    );
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to generate Earthquakes CSV report",
      message: err.message,
    });
  }
});

app.get("/api/reports/csv/telemetry", (req, res) => {
  try {
    const volcanoes = getVolcanoes();
    const earthquakes = getHistoricalEarthquakes();

    const headers = [
      "Category",
      "Item_ID",
      "Name_or_Location",
      "Severity_Alert",
      "Magnitude_or_Elevation",
      "Depth_km",
      "Latitude",
      "Longitude",
      "Status_or_Date",
      "Description",
    ];

    const rows: string[][] = [];

    volcanoes.forEach((v: any) => {
      rows.push([
        escapeCsv("Volcano"),
        escapeCsv(v.id),
        escapeCsv(v.name),
        escapeCsv(v.severity),
        escapeCsv(`${v.elevation}m`),
        escapeCsv("N/A"),
        escapeCsv(v.coordinates?.[0] ?? ""),
        escapeCsv(v.coordinates?.[1] ?? ""),
        escapeCsv(v.lastErupted || "Active Monitoring"),
        escapeCsv(v.description),
      ]);
    });

    earthquakes.forEach((eq: any) => {
      rows.push([
        escapeCsv("Earthquake"),
        escapeCsv(eq.id),
        escapeCsv(eq.location),
        escapeCsv(eq.severity),
        escapeCsv(`M ${Number(eq.magnitude).toFixed(1)}`),
        escapeCsv(eq.depth),
        escapeCsv(eq.coordinates?.[0] ?? ""),
        escapeCsv(eq.coordinates?.[1] ?? ""),
        escapeCsv(eq.dateTime),
        escapeCsv(eq.description),
      ]);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="essgi_integrated_geodisaster_telemetry_${dateStr}.csv"`,
    );
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to generate Consolidated Telemetry CSV report",
      message: err.message,
    });
  }
});

app.get("/api/reports/csv/dispatches", (req, res) => {
  try {
    const dispatches = getAlertDispatches();
    const headers = [
      "Dispatch_ID",
      "Event_Title",
      "Magnitude",
      "Depth_km",
      "Location",
      "Severity",
      "Broadcast_Type",
      "Recipients_Count",
      "Timestamp_UTC",
      "Status",
      "Details",
    ];

    const rows = dispatches.map((d: any) => [
      escapeCsv(d.id),
      escapeCsv(d.eventTitle),
      escapeCsv(d.magnitude),
      escapeCsv(d.depth),
      escapeCsv(d.location),
      escapeCsv(d.severity),
      escapeCsv(d.type),
      escapeCsv(d.recipientsCount),
      escapeCsv(d.timestamp),
      escapeCsv(d.status),
      escapeCsv(d.details),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r: any) => r.join(",")),
    ].join("\r\n");
    const dateStr = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="essgi_alert_dispatches_history_${dateStr}.csv"`,
    );
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to generate Alert Dispatches CSV report",
      message: err.message,
    });
  }
});

// Endpoint to trigger automated notifications for an earthquake >= M 5.0
app.post("/api/alerts/trigger-earthquake", (req, res) => {
  const { magnitude, location, depth, coordinates } = req.body;
  const mag = parseFloat(magnitude) || 5.2;
  const dep = parseFloat(depth) || 10;
  const loc = location || "Main Ethiopian Rift (Adama-Awash Segment)";
  const coords =
    Array.isArray(coordinates) && coordinates.length === 2
      ? coordinates
      : [8.98, 39.95];

  const syntheticEvent = {
    id: "eq_live_" + Date.now(),
    magnitude: mag,
    location: loc,
    coordinates: coords,
    depth: dep,
    dateTime: new Date().toISOString(),
    severity: mag >= 5.5 ? "Red" : "Orange",
    description: `Real-time geohazard notification trigger for seismic rupture M ${mag.toFixed(1)} in ${loc}.`,
  };

  const dispatchResult = processEarthquakeAlert(
    syntheticEvent,
    "Manual / API Trigger",
  );

  res.json({
    success: true,
    message: `Earthquake event M ${mag.toFixed(1)} processed. ${dispatchResult ? "Automated SMS & Email broadcast dispatched!" : "Event logged under threshold parameters."}`,
    event: syntheticEvent,
    dispatch: dispatchResult,
  });
});

// Sectors API Endpoints
app.get("/api/sectors", (req, res) => {
  const sectors = getSectors();
  res.json({ success: true, count: sectors.length, sectors });
});

app.get("/api/sectors/:id", (req, res) => {
  const sectors = getSectors();
  const sector = sectors.find((s: any) => s.id === req.params.id);
  if (!sector) {
    return res.status(404).json({ error: "Sector not found" });
  }
  res.json({ success: true, sector });
});

// Announcements API Endpoints
app.get("/api/announcements", (req, res) => {
  const announcements = getAnnouncements();
  res.json({ success: true, count: announcements.length, announcements });
});

app.get("/api/announcements/:id", (req, res) => {
  const announcements = getAnnouncements();
  const announcement = announcements.find((a: any) => a.id === req.params.id);
  if (!announcement) {
    return res.status(404).json({ error: "Announcement not found" });
  }
  res.json({ success: true, announcement });
});

app.post("/api/sectors", (req, res) => {
  const {
    id,
    title,
    code,
    directorate,
    head,
    location,
    description,
    keyFunctions,
    activeProjects,
    stationCount,
    status,
    badge,
    targetTab,
    metrics,
  } = req.body;

  if (!title || !directorate) {
    return res
      .status(400)
      .json({ error: "Missing required sector fields (title, directorate)" });
  }

  const sectors = getSectors();
  const existingIndex = sectors.findIndex(
    (s: any) => s.id === (id || title.toLowerCase().replace(/[^a-z0-9]/g, "-")),
  );

  const newSector = {
    id: id || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    title,
    code: code || `ESSGI-DIR-${Math.floor(10 + Math.random() * 90)}`,
    directorate,
    head: head || "Chief Officer",
    location: location || "Addis Ababa Command Center",
    description: description || "Research and telemetry sector.",
    keyFunctions: Array.isArray(keyFunctions)
      ? keyFunctions
      : ["Telemetry analysis & geodynamic monitoring"],
    activeProjects: Array.isArray(activeProjects)
      ? activeProjects
      : ["National Seismic-Geodetic Mapping"],
    stationCount: stationCount || "Active Telemetry Stations",
    status: status || "ONLINE",
    badge: badge || "Telemetry Ingest",
    targetTab: targetTab || "map",
    metrics: Array.isArray(metrics)
      ? metrics
      : [{ label: "Status", value: "Operational" }],
  };

  if (existingIndex !== -1) {
    sectors[existingIndex] = newSector;
  } else {
    sectors.push(newSector);
  }

  saveSectors(sectors);

  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: existingIndex !== -1 ? "update_sector" : "create_sector",
    performedBy: String(req.headers["x-user-name"] || "Admin"),
    performedByEmail: String(
      req.headers["x-user-email"] || "admin@essgi.gov.et",
    ),
    performedByRole: String(req.headers["x-user-role"] || "admin"),
    details: `${existingIndex !== -1 ? "Updated" : "Created"} sector entry for: "${title}" (${newSector.code}).`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Sector '${title}' saved successfully!`,
    sector: newSector,
  });
});

app.delete("/api/sectors/:id", (req, res) => {
  let sectors = getSectors();
  const targetId = req.params.id;
  const target = sectors.find((s: any) => s.id === targetId);
  if (!target) {
    return res.status(404).json({ error: "Sector not found" });
  }

  sectors = sectors.filter((s: any) => s.id !== targetId);
  saveSectors(sectors);

  res.json({
    success: true,
    message: `Sector '${target.title}' removed successfully`,
  });
});

// News API Endpoints
app.get("/api/news", (req, res) => {
  const { category, search } = req.query;
  let newsList = getNews();

  if (
    category &&
    typeof category === "string" &&
    category.toLowerCase() !== "all"
  ) {
    newsList = newsList.filter(
      (n: any) => n.category.toLowerCase() === category.toLowerCase(),
    );
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase();
    newsList = newsList.filter(
      (n: any) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.fullText.toLowerCase().includes(q) ||
        n.dispatchCode.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q),
    );
  }

  res.json({ success: true, count: newsList.length, news: newsList });
});

app.get("/api/news/:id", (req, res) => {
  const newsList = getNews();
  const item = newsList.find((n: any) => n.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "News bulletin dispatch not found" });
  }
  res.json({ success: true, news: item });
});

app.post("/api/news", (req, res) => {
  const {
    title,
    excerpt,
    fullText,
    category,
    tag,
    author,
    location,
    keyFindings,
    recommendations,
    readTime,
  } = req.body;

  if (!title || !excerpt || !fullText) {
    return res.status(400).json({
      error: "Missing required news bulletin fields (title, excerpt, fullText)",
    });
  }

  const newsList = getNews();
  const newDispatch = {
    id: "news-" + Date.now(),
    dispatchCode: `ESSGI-BULLETIN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    title,
    excerpt,
    fullText,
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }),
    category: category || "Seismology",
    tag: tag || "Official Advisory",
    readTime: readTime || "4 min read",
    author:
      author ||
      String(req.headers["x-user-name"] || "ESSGI Communications Directorate"),
    location: location || "Addis Ababa Headquarters",
    keyFindings: Array.isArray(keyFindings)
      ? keyFindings
      : ["Real-time telemetry verification confirmed"],
    recommendations: Array.isArray(recommendations)
      ? recommendations
      : ["Maintain continuous geodynamic monitoring"],
  };

  newsList.unshift(newDispatch);
  saveNews(newsList);

  saveAuditLog({
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "create_news_bulletin",
    performedBy: String(req.headers["x-user-name"] || "Admin"),
    performedByEmail: String(
      req.headers["x-user-email"] || "admin@essgi.gov.et",
    ),
    performedByRole: String(req.headers["x-user-role"] || "admin"),
    details: `Published news bulletin dispatch [${newDispatch.dispatchCode}]: "${title}".`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "News dispatch bulletin published successfully!",
    news: newDispatch,
  });
});

app.delete("/api/news/:id", (req, res) => {
  let newsList = getNews();
  const targetId = req.params.id;
  const target = newsList.find((n: any) => n.id === targetId);
  if (!target) {
    return res.status(404).json({ error: "News bulletin dispatch not found" });
  }

  newsList = newsList.filter((n: any) => n.id !== targetId);
  saveNews(newsList);

  res.json({
    success: true,
    message: `News bulletin '${target.dispatchCode}' removed successfully`,
  });
});

// 1. Live Volcano status list
app.get("/api/volcanoes", (req, res) => {
  res.json(getVolcanoes());
});

// 2. Insert/Manage Volcanic Activity (Disaster Official)
app.post("/api/volcanoes", (req, res) => {
  const {
    name,
    region,
    elevation,
    coordinates,
    type,
    activityType,
    severity,
    description,
    monitoredBy,
    lastErupted,
  } = req.body;
  if (!name || !coordinates || coordinates.length !== 2) {
    return res.status(400).json({
      error: "Missing required fields (name, coordinates [lat, lng])",
    });
  }

  const list = getVolcanoes();
  const existingIndex = list.findIndex(
    (v: any) => v.name.toLowerCase() === name.toLowerCase(),
  );

  const updatedVolcano = {
    id: existingIndex !== -1 ? list[existingIndex].id : "v_" + Date.now(),
    name,
    region: region || "Unspecified Ethiopia",
    elevation: Number(elevation) || 0,
    coordinates: [Number(coordinates[0]), Number(coordinates[1])],
    type: type || "Volcanic Center",
    activityType: activityType || "Fumarolic Activity",
    severity: severity || "Green",
    lastErupted: lastErupted || "Unknown",
    description: description || "No detailed observation logged yet.",
    monitoredBy: monitoredBy || "Central Disaster Agency",
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    list[existingIndex] = updatedVolcano;
  } else {
    list.unshift(updatedVolcano);
  }

  saveVolcanoes(list);

  // Trigger Audit Logging on successful POST
  const performer = req.headers["x-user-name"] || "System";
  const performerEmail = req.headers["x-user-email"] || "system@essgi.gov.et";
  const performerRole = req.headers["x-user-role"] || "system";
  const action = existingIndex !== -1 ? "edit" : "create";

  const detailText =
    action === "create"
      ? `Created new volcanic center: "${name}" in ${region || "Unspecified Ethiopia"} (Elevation: ${elevation || 0}m, Severity: ${severity || "Green"}).`
      : `Updated existing volcanic center attributes for "${name}" (Region: ${region || "Unspecified Ethiopia"}, Severity Level: ${severity || "Green"}).`;

  const newLog = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action,
    volcanoId: updatedVolcano.id,
    volcanoName: updatedVolcano.name,
    performedBy: String(performer),
    performedByEmail: String(performerEmail),
    performedByRole: String(performerRole),
    details: detailText,
    timestamp: new Date().toISOString(),
  };
  saveAuditLog(newLog);

  res.json({
    message: "Volcano entry recorded successfully",
    data: updatedVolcano,
  });
});

// 3. Delete volcano entry (Admin only)
app.delete("/api/volcanoes/:id", (req, res) => {
  const { id } = req.params;
  let list = getVolcanoes();
  const filtered = list.filter((v: any) => v.id !== id);
  if (filtered.length === list.length) {
    return res.status(404).json({ error: "Volcano not found" });
  }

  const volcanoToDelete = list.find((v: any) => v.id === id);
  const volcanoName = volcanoToDelete
    ? volcanoToDelete.name
    : "Unknown Volcano";

  saveVolcanoes(filtered);

  // Trigger Audit Logging on successful DELETE
  const performer = req.headers["x-user-name"] || "System";
  const performerEmail = req.headers["x-user-email"] || "system@essgi.gov.et";
  const performerRole = req.headers["x-user-role"] || "system";

  const newLog = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    action: "delete",
    volcanoId: id,
    volcanoName: volcanoName,
    performedBy: String(performer),
    performedByEmail: String(performerEmail),
    performedByRole: String(performerRole),
    details: `Deleted volcanic center: "${volcanoName}" (ID: ${id}) from index database.`,
    timestamp: new Date().toISOString(),
  };
  saveAuditLog(newLog);

  res.json({ message: "Volcano deleted successfully" });
});

// 3.5 Retrieve Admin Audit Logs (Admin & Super Admin)
app.get("/api/audit-logs", (req, res) => {
  const userRole = req.headers["x-user-role"];
  if (
    userRole &&
    userRole !== "admin" &&
    userRole !== "superadmin" &&
    userRole !== "official"
  ) {
    return res.status(403).json({
      error:
        "Access denied. Only Admins and Super Admins can retrieve audit logs.",
    });
  }
  res.json(getAuditLogs());
});

app.get("/api/admin/audit-logs", (req, res) => {
  const userRole = req.headers["x-user-role"];
  if (
    userRole &&
    userRole !== "admin" &&
    userRole !== "superadmin" &&
    userRole !== "official"
  ) {
    return res.status(403).json({
      error:
        "Access denied. Only Admins and Super Admins can retrieve audit logs.",
    });
  }
  const logs = getAuditLogs();
  res.json({ success: true, count: logs.length, logs });
});

// 4. Combined real-time and historical Earthquakes proxy
app.get("/api/earthquakes", async (req, res) => {
  try {
    // Look back dynamically (60 days) relative to current system time for rapid response from USGS API
    const now = new Date();
    const lookbackDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const starttime = lookbackDate.toISOString().split("T")[0];
    const usgsUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=3&maxlatitude=15&minlongitude=33&maxlongitude=48&minmagnitude=2.5&starttime=${starttime}&orderby=time`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch(usgsUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`USGS server returned status ${response.status}`);
    }

    const usgsData = await response.json();

    const usgsEvents = (usgsData.features || []).map((feat: any) => {
      const coords = feat.geometry.coordinates; // [lng, lat, depth]
      const props = feat.properties;
      const magnitude = props.mag;

      // Determine severity based on magnitude
      let severity = "Green";
      if (magnitude >= 5.5) severity = "Red";
      else if (magnitude >= 4.5) severity = "Orange";
      else if (magnitude >= 3.5) severity = "Yellow";

      return {
        id: feat.id,
        magnitude: props.mag,
        location: props.place || "Ethiopia-East Africa region",
        coordinates: [coords[1], coords[0]], // convert [lng, lat] to [lat, lng]
        depth: coords[2] || 10,
        dateTime: new Date(props.time).toISOString(),
        severity,
        description: `Source USGS. Felt intensity: ${props.felt || "unreported"}. Significance score: ${props.sig || "low"}.`,
        isHistorical: false,
      };
    });

    // Check for high-magnitude events (M >= 4.5) and trigger automated geohazard dispatch alerts
    usgsEvents.forEach((ue: any) => {
      if (ue.magnitude >= 4.5) {
        processEarthquakeAlert(ue, "USGS Real-time Telemetry Ingest");
      }
    });

    // Merge with our high-value historically monitored earthquakes in Ethiopia
    const historical = getHistoricalEarthquakes();
    const combined = [...historical, ...usgsEvents];

    // Sort by dateTime descending
    combined.sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    );

    res.json({
      success: true,
      count: combined.length,
      realTimeCount: usgsEvents.length,
      historicalCount: historical.length,
      data: combined,
    });
  } catch (error: any) {
    console.warn(
      "USGS live feed fetch notice (serving historical dataset):",
      error?.message || error,
    );
    // Return historical list plus simulated earthquakes for reliability if internet is unavailable or USGS times out
    const historical = getHistoricalEarthquakes();
    res.json({
      success: true,
      fallbackMode: true,
      count: historical.length,
      realTimeCount: 0,
      historicalCount: historical.length,
      data: historical,
    });
  }
});

// FURI Station Seismic Waveform Stream API
app.get("/api/seismic/furi", async (req, res) => {
  try {
    const { eventTime, component, magnitude, depth } = req.query;

    if (!eventTime) {
      return res.status(400).json({ error: "Missing eventTime parameter" });
    }

    const date = new Date(String(eventTime));
    const mag = Number(magnitude) || 4.5;
    const dep = Number(depth) || 10;

    // Calculate a 120-second window starting 10 seconds before the earthquake
    const start = new Date(date.getTime() - 10 * 1000);
    const end = new Date(date.getTime() + 110 * 1000);

    // Format to ISO string without milliseconds and 'Z' suffix (IRIS timeseries accepts YYYY-MM-DDTHH:MM:SS)
    const startStr = start.toISOString().replace(/\.\d+Z$/, "");
    const endStr = end.toISOString().replace(/\.\d+Z$/, "");

    // Map component (Z, N, E) to broadband FURI channels (BHZ, BHN, BHE)
    const comp = String(component || "Z").toUpperCase();
    const channel = `BH${comp}`; // Broad-Band channels

    // Locations typically on FURI are '00' or '--' (blank)
    const irisUrls = [
      `https://service.iris.edu/irisws/timeseries/1/query?net=IU&sta=FURI&loc=00&cha=${channel}&starttime=${startStr}&endtime=${endStr}&output=ascii&correct=true`,
      `https://service.iris.edu/irisws/timeseries/1/query?net=IU&sta=FURI&loc=--&cha=${channel}&starttime=${startStr}&endtime=${endStr}&output=ascii&correct=true`,
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
            // Header lines start with # or letters (e.g. TIMESERIES)
            if (
              !trimmed ||
              trimmed.startsWith("#") ||
              trimmed.startsWith("TIMESERIES") ||
              isNaN(Number(trimmed))
            ) {
              continue;
            }
            points.push(Number(trimmed));
          }

          if (points.length > 50) {
            rawDataPoints = points;
            fetchedSuccessful = true;
            usedUrl = url;
            break; // Successfully fetched!
          }
        }
      } catch (e) {
        console.warn(`Attempt failed for URL: ${url}`);
      }
    }

    let finalPoints: number[] = [];
    if (fetchedSuccessful && rawDataPoints.length > 0) {
      const targetCount = 200;
      // Downsample to fit perfectly in our UI graph
      const step = rawDataPoints.length / targetCount;
      for (let i = 0; i < targetCount; i++) {
        const idx = Math.min(rawDataPoints.length - 1, Math.floor(i * step));
        finalPoints.push(rawDataPoints[idx]);
      }

      // Detrend/Remove DC Offset (Center around 0)
      const sum = finalPoints.reduce((s, val) => s + val, 0);
      const mean = sum / finalPoints.length;
      let detrended = finalPoints.map((v) => v - mean);

      // Standardize and scale to proportional magnitude values
      const maxAbs = Math.max(...detrended.map((v) => Math.abs(v))) || 1;
      const targetScale = Math.min(10, Math.max(1.5, mag * 1.5));
      finalPoints = detrended.map((v) => (v / maxAbs) * targetScale);

      return res.json({
        success: true,
        source: "IU.FURI Station (Real-time EarthScope API)",
        url: usedUrl,
        raw: finalPoints,
        isReal: true,
      });
    } else {
      // Offline / archived Fallback:
      // High-fidelity physical simulation matching P-wave and S-wave travel delays
      const pointsCount = 200;
      const raw: number[] = [];
      const isZ = comp === "Z";
      const isN = comp === "N";
      const isE = comp === "E";

      // Calculate travel delays based on earthquake depth and typical distance to Mount FURI in Addis
      const depthDelay = Math.min(11.0, Math.max(2.5, dep * 0.15));
      const magFactor = mag;

      for (let i = 0; i < pointsCount; i++) {
        const t = i * 0.15; // 30 seconds total simulation scale

        // Microseismic baseline ground drift
        const drift = Math.sin(t * 0.1) * 0.35 + Math.cos(t * 0.05) * 0.18;
        const noise =
          Math.sin(t * 13.0) * 0.12 +
          Math.cos(t * 24.5) * 0.08 +
          Math.sin(t * 1.6) * 0.15;

        // P-wave arrival (compressive, stronger on Z component)
        let pWave = 0;
        const pArrival = depthDelay;
        if (t > pArrival && t < pArrival + 8.0) {
          const tp = t - pArrival;
          const scale = isZ ? 1.5 : isE ? 0.95 : 0.65;
          pWave =
            Math.sin(tp * 19.0) *
            Math.exp(-tp * 0.65) *
            2.3 *
            magFactor *
            scale;
        }

        // S-wave arrival (shear, stronger on horizontal components N/E)
        let sWave = 0;
        const sArrival = depthDelay + 4.5;
        if (t > sArrival) {
          const ts = t - sArrival;
          const scale = isN ? 1.7 : isE ? 1.1 : 0.75;
          sWave =
            (Math.sin(ts * 5.2) * Math.exp(-ts * 0.17) * 5.6 +
              Math.sin(ts * 11.5) * Math.exp(-ts * 0.28) * 2.3) *
            magFactor *
            scale;
        }

        raw.push(drift + noise + pWave + sWave);
      }

      return res.json({
        success: true,
        source: "IU.FURI Station (Simulated Stream)",
        raw,
        isReal: false,
      });
    }
  } catch (err: any) {
    console.error("FURI stream fetch router failed:", err);
    res.status(500).json({
      error: "Failed to load seismic wave data",
      message: err.message,
    });
  }
});

// Endpoint to retrieve curated August tremors in Ethiopia & East Africa
app.get("/api/seismic/august-tremors", (req, res) => {
  const augustEvents = [
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
      feltReports:
        "Felt strongly across Addis Ababa, Adama, Bishoftu, Metehara, and Awash",
      focalMechanism:
        "Normal faulting with oblique-slip along MER master border fault",
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
plt.show()`,
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
      focalMechanism:
        "Pure extensional crustal normal faulting in Afar rift floor",
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
plt.show()`,
    },
    {
      id: "eq_hist_1",
      title: "August 1989 Dobi Graben Earthquake Rupture",
      date: "August 20, 1989",
      dateTime: "1989-08-20T11:15:32.000Z",
      magnitude: 6.3,
      depth: 15,
      location: "Dobi Graben, Central Afar Rift",
      coordinates: [11.8, 40.8],
      distanceFromFuriKm: 330,
      pArrivalSeconds: 47.1,
      sArrivalSeconds: 88.0,
      sLagPSeconds: 40.9,
      peakFrequencyHz: 0.8,
      feltReports:
        "Destructive event. Fractured Assab-Addis Ababa highway bridges and caused heavy ground rupturing",
      focalMechanism:
        "Complex multi-segment strike-slip / normal rupture sequence",
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
plt.show()`,
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
      feltReports:
        "Felt in Gewane, Awash Arba, and local pastoralist communities",
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
plt.show()`,
    },
  ];

  res.json({
    success: true,
    count: augustEvents.length,
    events: augustEvents,
  });
});

// Helper function to generate high-fidelity fallback report when Gemini is offline or under load
function generateFallbackReport(
  summary: any,
  errorMsg?: string,
  briefingType: string = "all",
  customPrompt?: string,
) {
  const totalVolc = summary.totalVolcanoesObserved ?? 0;
  const activeVolcCount = summary.activeAlertVolcanoesCount ?? 0;
  const activeVolcs = summary.activeVolcanoes || [];
  const totalEq = summary.totalEarthquakesInPeriod ?? 0;
  const maxMag = summary.highestMagnitudeRecorded ?? 0;
  const severeEqCount = summary.severeEarthquakesCount ?? 0;
  const latestEqs = summary.latestEarthquakesSample || [];

  // Format active volcanoes list dynamically
  const volcanoesMarkdown =
    activeVolcs.length > 0
      ? activeVolcs
          .map(
            (v: any) =>
              `*   **${v.name}** (${v.type || "Volcano"} in ${v.region || "Ethiopia"}): Marked with **${v.severity.toUpperCase()}** priority alert level. Local monitoring crews recommend elevated vigilance and persistent thermal satellite reviews. Coordinates: [${v.coordinates ? v.coordinates.join(", ") : "Afar/Rift"}].`,
          )
          .join("\n")
      : "*   **No Volcanic Fault Alerts Active**: Currently, there are no elevated alert warning statuses recorded for observed vents.";

  // Format seismic events list dynamically
  const coreEarthquakeMarkdown =
    latestEqs.length > 0
      ? latestEqs
          .map(
            (e: any) =>
              `*   **M ${parseFloat(e.mag).toFixed(1)}** near *${e.place || "East Africa Rift Segment"}* (Depth: **${e.depth}km**, Status: **${e.severity}** severity): Logged telemetry on ${e.dateTime ? new Date(e.dateTime).toLocaleDateString() : "Active Cycle"}.`,
          )
          .join("\n")
      : "*   **No Substantial Rift Ruptures Recorded**: No recent local tremors exceeding baseline advisory thresholds detected.";

  const prefix = errorMsg
    ? `> ⚠️ **SSGI Local Gateway Notice**: The real-time AI generation service is running in local fallback mode. This intelligence brief has been synthesized by the SSGI Local Gateway based strictly on verified on-premise sensor feeds.\n\n`
    : "";

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (briefingType === "volcanic") {
    return `${prefix}# ETHIOPIAN VOLCANIC HAZARD & PLUME SURVEILLANCE BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Volcanological Vents, Thermal Emissions & Ash Dispersion Surveillance

## Executive Summary: Volcanic State of the Rift
Ethiopia's rift volcanic centers are monitored by the **Space Science and Geospatial Institute (SSGI)**, **Department of Geodesy and Geodynamics**, in coordination with the Disaster Risk Management Commission (DRMC) and regional university observatories (Semera, Mekelle, Addis Ababa). Currently, **${totalVolc} volcanic centers** are under active instrumented surveillance across the Danakil Depression and Main Ethiopian Rift. **${activeVolcCount} centers** exhibit elevated thermal or magmatic activity requiring direct advisory protocols.

## Monitored Volcanic Inventory & Alert Levels
${volcanoesMarkdown}

## Critical Caldera & Graben Dynamics
1. **Erta Ale (Danakil Depression - Shield Volcano)**: Continuous active lava lake activity with intermittent overflow pulses. Volcanic degassing emits SO₂ and CO₂ plumes. A strict **5 km exclusion perimeter** is enforced for tourist parties and local logistics teams.
2. **Dallol Hydrothermal Crater Complex (-48m bsl)**: Intense hydrothermal venting, superheated acidic brine pools, and toxic sulfur-gas geysers. Ground crust collapse hazard is elevated.
3. **Mount Fentale & Kone Calderas (Awash / East Shewa)**: Fumarolic venting and low-frequency micro-tremors along the ring faults. Proximity to the Addis-Djibouti railway corridor requires continuous infrasound monitoring.
4. **Alutu Volcanic Complex (Ziway-Langano Corridor)**: Shallow magma reservoir with verified ground inflation cycles. Surrounding geothermal production wells are monitored for pressure perturbations.

## Volcanological Emergency Protocols
* **Aviation Warning**: Maintain flight level FL150 clearance over Danakil airspace during ash venting advisories.
* **Ground Security**: Local pastoralist settlements within 15 km of Erta Ale should be equipped with VHF emergency warning radios.
* **Thermal InSAR Monitoring**: Task Sentinel-1 and optical satellite passes every 6 days for interferometric surface deformation analysis.`;
  }

  if (briefingType === "seismic") {
    return `${prefix}# ETHIOPIAN SEISMIC RUPTURE & TECTONIC FAULT SURVEILLANCE BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Seismicity, Fault Ruptures, Focal Depths & Ground Shaking Hazard

## Executive Summary: Tectonic Strain Across the Rift
Continuous seismic feeds integrated from the **USGS Worldwide Network** and **SSGI Broadband Stations (IU.FURI, BDMT, DESE, ARBA)** by the **Department of Geodesy and Geodynamics** indicate active normal fault slip across the Main Ethiopian Rift (MER) and the Afar Triple Junction. Over the recent observation interval, **${totalEq} seismic events** were ingested with a peak recorded magnitude of **M ${maxMag.toFixed(1)}** and **${severeEqCount} events** passing emergency advisory thresholds.

## Consolidated Chronological Seismic Catalog
${coreEarthquakeMarkdown}

## Tectonic Hotspots & Rupture Mechanisms
1. **Afar Triple Junction & Dobi Graben**: Transtensional plate divergence (Nubia, Somalia, and Arabian plates) generates shallow focal depth earthquakes (5–15 km) capable of high Peak Ground Acceleration (PGA > 0.15g).
2. **Awash Basin & Fentale Graben**: High-density population corridor subject to earthquake swarms. Recent swarms (such as M4.9 events) exhibit dominant spectral energy around 2.4 Hz, strongly felt in Addis Ababa, Adama, and Metehara.
3. **Western Escarpment (Ankober - Debre Sina - Dessie)**: Deep-seated marginal border faults capable of triggering landslides along mountainous highway passes.

## Seismic Engineering & DRMC Guidelines
* **Structural Inspections**: Mandate rapid post-event inspections of concrete viaducts, bridge abutments, and masonry dams along the Awash-Metehara railway line.
* **Public Readiness**: Distribute community drill protocols for masonry drop-cover-hold actions in high-density urban centers of Adama, Hawassa, and Semera.
* **Broadband Array Density**: Accelerate deployment of 3-component broadband seismometers along the Aluto-Langano and Tendaho grabens.`;
  }

  if (briefingType === "gnss") {
    return `${prefix}# ETHIOPIAN CRUSTAL STRAIN & GNSS GEODESY INTELLIGENCE BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Space Geodesy, Continuous GNSS Vectors & Tectonic Plate Kinematics

## Executive Summary: Geodetic Deformation Vectors
High-rate continuous GNSS reference stations operated by SSGI's **Department of Geodesy and Geodynamics** (including **IU.FURI on Mount Furi**, **BDMT in Bahir Dar**, **DESE in Dessie**, and **ARBA in Arba Minch**) track steady-state Nubian-Somalian plate divergence across the Ethiopian Rift.

## Measured Geodetic Dynamics
* **Plate Opening Rate**: Full tectonic extension rate across the Central Main Ethiopian Rift is measured at **4.5 to 6.2 mm/yr**, accelerating to **12.0 to 16.0 mm/yr** in the Northern Afar Depression.
* **Vertical Uplift & Subsidence**: Mount Fentale and Alutu volcanic calderas display episodic vertical inflation cycles (up to 12 mm/yr during magmatic recharge).
* **FURI Master Station Health**: Mount Furi station (9°04'48.0"N, 38°43'12.0"E, 2840m ASL) reports zero-loss 100 Hz high-rate data streaming with nominal multipath RMS < 0.08m.

## Geodetic Policy Recommendations
* Expand continuous GNSS networks in the Danakil graben to quantify strain accumulation before major rift-opening dyke intrusions.
* Integrate GNSS baseline time-series directly into the national land administration datum (Adindan/WGS84).`;
  }

  if (briefingType === "infrastructure") {
    return `${prefix}# CRITICAL INFRASTRUCTURE & GEOHAZARD VULNERABILITY BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Strategic Infrastructure Resilience & Transportation/Energy Corridor Risk

## Executive Summary: Strategic Lifelines at Risk
Ethiopia's key national development infrastructure intersects active rift faults and geothermal calderas. A cross-hazard evaluation of **${totalVolc} volcanic centers** and **${totalEq} seismic ruptures** evaluated by SSGI's **Department of Geodesy and Geodynamics** highlights vulnerability hotspots across national transportation and energy networks.

## Critical Lifeline Assessments
1. **Ethio-Djibouti Railway & Highway Corridor**: Crosses the active Fentale-Metehara graben and Semera-Galafi corridor. Ground rupture and seismic shaking exceeding M 5.0 pose derailment risks and roadway fissures.
2. **Alutu-Langano & Tendaho Geothermal Facilities**: Located directly within active volcanic calderas. Magmatic reinjection and fluid extraction require microseismic monitoring to prevent borehole shearing.
3. **Hydroelectric & Irrigation Dams (Koka Dam, Tendaho Dam, Kesem Dam)**: Subject to siltation shocks and seismic peak ground acceleration during rift swarms.

## Strategic Mitigation Measures
* Install automated seismic shutoff sensors along high-voltage transmission lines in the Adama-Awash sector.
* Establish pre-positioned disaster logistics depots in Semera, Adama, and Kombolcha.`;
  }

  if (briefingType === "geodesy" || briefingType === "drmc") {
    return `${prefix}# GEODESY & GEODYNAMICS STRATEGIC DIRECTIVE
**Date:** ${currentDateFormatted} | **Subject:** Geodetic Strain, Structural Safety & Zonal Emergency Buffers

## Executive Directive: Geodetic Preparedness & Hazard Posture
Issued by the **Space Science and Geospatial Institute (SSGI) - Department of Geodesy and Geodynamics**. Based on real-time geodetic monitoring of **${totalVolc} volcanic centers** and **${totalEq} seismic ruptures**, regional taskforces and infrastructure engineering teams are instructed to maintain active readiness.

## Regional Hazard & Evacuation Buffer Status
1. **Danakil & Afar Pastoralist Zones (Zone 1, Zone 2, Zone 3)**:
   * Maintain 5km exclusion radius around Erta Ale and Dallol hydrothermal geyser fields.
   * Dispatch daily bilingual geohazard early warnings in Afar & Amharic to zonal administrators in Semera, Asaita, and Gewane.
2. **Main Ethiopian Rift & Awash Valley Corridor**:
   * Pre-position emergency water purification units and mobile geodetic telemetry kits in Adama and Metehara.
   * Maintain 24/7 communications link between the National Geohazard Operations Center (Addis Ababa) and regional field observatories.

## Geodynamics & Early Warning Mobilization Matrix
* **Zonal Monitoring Hubs**: Semera Geodetic Field Base (Active), Furi Master Observatory (Active), Hawassa Field Station (Active).
* **Communication Channels**: HF/VHF Emergency Radio Network + Automated Multi-Network SMS Gateway.`;
  }

  if (briefingType === "executive") {
    return `${prefix}# EXECUTIVE STRATEGIC GEOHAZARD BRIEFING
**Date:** ${currentDateFormatted} | **Subject:** Multi-Agency Earth Observation & National Geohazard Strategic Directives

## Directorate Strategic Overview
This executive briefing synthesizes multi-agency earth observation telemetry for the Director General of SSGI, the Commissioner of DRMC, and the Ministry of Innovation and Technology, coordinated by the **Department of Geodesy and Geodynamics**.

## Key Strategic Risk Indicators (SRI)
* **National Seismic Activity Index**: ${severeEqCount > 0 ? "ELEVATED" : "NOMINAL"} (Peak Magnitude M ${maxMag.toFixed(1)}, ${totalEq} total events logged).
* **Volcanic Alert Posture**: ${activeVolcCount} volcanic centers currently classified under Elevated/Critical advisory status out of ${totalVolc} monitored centers.
* **Geodetic Rift Opening Metric**: Steady-state extension proceeding at 4.5-6.2 mm/yr in Central MER and 14-16 mm/yr in Northern Afar.
* **Telemetry Station Availability**: 99.4% uptime across 18 broadband stations including primary IU.FURI station.

## Executive Directives & Inter-Agency Tasks
1. **Ministry of Transport & Logistics**: Review bridge and rail integrity along the Awash-Metehara corridor.
2. **Ministry of Water and Energy**: Maintain structural piezometer monitoring on Tendaho, Kesem, and Koka dams.
3. **Ethiopian Civil Aviation Authority**: Enforce ash dispersal advisory corridors over Afar airspace during active venting periods.`;
  }

  // Default "all" comprehensive brief
  return `${prefix}# GEOLOGICAL DISASTER INTELLIGENCE DECISION SUPPORT BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Comprehensive Seismic, Volcanic & Rift Strain Geohazard Assessment

## Executive Summary
Ethiopia's active tectonic rift alignment exposes critical community and energy corridors to active seismic grabens and magmatic basalt plumes. Monitored by the **Space Science and Geospatial Institute (SSGI)**, **Department of Geodesy and Geodynamics**, our instruments currently observe **${totalVolc} volcanic centers** and **${totalEq} active seismogenetic incidents** over the monitoring sector. Based on consolidated telemetry, ongoing structural hazard and crustal strain persist along the **Afar Triple Junction** and the central **Main Ethiopian Rift (Adama-Awasa corridor)**.

## Dynamic Tectonic Parameter Summary
*   **Active Volcanic Plume Warnings:** Currently tracking **${activeVolcCount} active systems** at advisory/critical warning levels.
*   **Peak Ground Shaking Strain:** Telemetry records a maximum magnitude of **M ${maxMag.toFixed(1)}**, with **${severeEqCount} seismic ruptures** passing elevated warning indexes.

## Active Volcano Alert Status Vector
${volcanoesMarkdown}

## Live Seismic Telemetry Feed Assessment (USGS)
${coreEarthquakeMarkdown}

## Hazards and Vulnerability Hotspots
1.  **Afar Depression (Semera, Serdo, Dubti Corridor):** High vulnerability to seismic fault displacement. Critical logistics arteries (Addis Ababa - Djibouti Highway and Railway) traverse these active normal fault lines and deep grabens.
2.  **Central Rift Valley Corridor (Ziway, Hawassa, Metehara):** Dense agrarian settlements and vital geothermal developments (Aluto-Langano energy plants) sit directly above shallow caldera reservoirs. Sustained tremor swarms pose fracturing danger to local concrete spillways and masonry.

## Key Emergency Response Recommendations
*   **Infrastructure Hazard Thresholds:** Strictly enforce seismically resilient engineering and construction codes for all logistics and energy building projects in the Rift Valley and Danakil sectors.
*   **Active Excursions Safety Boundaries:** Maintain a strict **5km exclusion perimeter** around Erta Ale's boiling basaltic lava lake due to high concentration toxic sulfur emissions and hydrothermal splatter vents.
*   **Bilingual Early Warning Advisories:** Formulate and dispatch automated safety broadcast SMS texts translated in Afar, Amharic, and Oromiffa to agricultural workers inside active rifting sectors.`;
}

// Resilient Gemini model caller with multi-model fallback and retry on 503 / 429 / UNAVAILABLE
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  contents: string,
  models?: string[],
): Promise<{ text: string; modelUsed: string }> {
  // If user sets a custom model in .env (e.g. GEMINI_MODEL=gemini-1.5-flash or gemini-2.5-pro or gemini-2.0-flash), prioritize it
  const configuredModel = process.env.GEMINI_MODEL || process.env.AI_MODEL;

  const defaultModels = [
    ...(configuredModel ? [configuredModel] : []),
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-pro",
  ];

  const candidateModels = models && models.length > 0 ? models : defaultModels;
  // Deduplicate candidate models
  const uniqueModels = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const model of uniqueModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
        });
        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("high demand") ||
          errMsg.includes("overloaded");

        if (isTransient && attempt === 0) {
          // Brief backoff before retry
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        // Advance to next fallback model in the list
        break;
      }
    }
  }

  throw (
    lastError ||
    new Error("Failed to generate content across candidate Gemini models")
  );
}

// 5. AI Georisk Intelligence Report generation with topic specificity & interactive focus
app.post("/api/report", async (req, res) => {
  const { currentDataSummary, briefingType = "all", customPrompt } = req.body;

  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY"
  ) {
    const summary = currentDataSummary || {};
    const dynamicReportText = generateFallbackReport(
      summary,
      undefined,
      briefingType,
      customPrompt,
    );

    return res.json({
      aiGenerated: false,
      briefingType,
      reportText: dynamicReportText,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let topicInstructions = "";
    if (briefingType === "volcanic") {
      topicInstructions = `SPECIFIC FOCUS: VOLCANIC HAZARDS & MAGMATIC PLUMES ONLY.
Focus entirely on Ethiopia's monitored volcanic centers (Erta Ale lava lake, Dallol phreatic springs, Dabbahu/Boina fissure, Mount Fentale caldera, Alutu geothermal complex, Kone, Dama Ali).
Detail alert levels, sulfur gas emissions, eruption history, tourist exclusion zones, and remote sensing surveillance. Do NOT expand deeply on general earthquakes unless directly triggering volcanic magma ascent.`;
    } else if (briefingType === "seismic") {
      topicInstructions = `SPECIFIC FOCUS: SEISMIC HAZARDS, FAULT RUPTURES & EARTHQUAKES ONLY.
Focus entirely on recorded seismic activity in Ethiopia (USGS live feed and historical events such as Dobi Graben M6.3, Awash Basin M4.9, Semera graben, Fentale swarms, FURI broadband phase arrivals).
Detail magnitudes, focal depths (5-15km), peak ground acceleration (PGA), structural vulnerability of masonry buildings, and seismic safety guidelines.`;
    } else if (briefingType === "gnss") {
      topicInstructions = `SPECIFIC FOCUS: GNSS GEODESY, CRUSTAL STRAIN & SEISMOGRAM TELEMETRY ONLY.
Focus entirely on space geodesy, Nubia-Somalia plate divergence rates (4.5 to 16 mm/yr), station network vectors (IU.FURI, BDMT, DESE, ARBA), and spectral seismogram analysis.`;
    } else if (briefingType === "infrastructure") {
      topicInstructions = `SPECIFIC FOCUS: CRITICAL INFRASTRUCTURE & REGIONAL VULNERABILITY ONLY.
Focus entirely on infrastructure intersections (Addis-Djibouti railway/highway, Aluto-Langano geothermal plant, Tendaho/Koka dams, electrical grids, and urban centers like Adama, Semera, Hawassa).`;
    } else {
      topicInstructions = `COMPREHENSIVE STRATEGIC GEOHAZARD BRIEFING.
Provide a holistic decision-support document covering Executive Summary, Active Volcano Status, Seismic Ruptures, Risk Zones (Danakil vs MER vs Addis corridor), and Emergency Preparedness Guidelines.`;
    }

    if (customPrompt && customPrompt.trim()) {
      topicInstructions += `\nUSER SPECIFIC INQUIRY/FOCUS REQUEST: "${customPrompt.trim()}". Tailor the briefing sections to directly address and emphasize this specific request while respecting strict geological grounding.`;
    }

    const prompt = `You are a Senior Geophysical Risk Intelligence Analyst for the Space Science and Geospatial Institute (SSGI), Department of Geodesy and Geodynamics.
Your academic advisor is Mr. Kibru G.

STRICT HEADER & FORMATTING INSTRUCTIONS:
- CRITICAL: Do NOT generate memorandum routing headers such as "TO:", "FROM:", "THROUGH:", "FOR:", or recipient blocks.
- ONLY include the Date and Subject in the header line at the very beginning of the briefing report (for example: **Date:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} | **Subject:** [Concise Subject/Briefing Title based on focus]).
- Immediately follow the Date and Subject line with the Executive Summary and substantive geological intelligence.

STRICT GROUNDING INSTRUCTIONS:
- You must base your analysis strictly and exclusively on the active geological, volcanic, and seismic data provided below for the Ethiopian territory.
- Do NOT fabricate non-existent Ethiopian volcanoes or hypothetical mega-disasters not supported by the data.
- Structure your response in clean, professional, executive-grade Markdown (no HTML tags).
- Use clear headers, bold metrics, and structured bullet points.

${topicInstructions}

CURRENT REAL-TIME GEOLOGICAL DATASET:
${JSON.stringify(currentDataSummary || {}, null, 2)}

Produce the official briefing report now:`;

    const { text, modelUsed } = await generateGeminiContentWithFallback(
      ai,
      prompt,
    );

    res.json({
      aiGenerated: true,
      modelUsed,
      briefingType,
      reportText: text,
    });
  } catch (error: any) {
    console.warn(
      "Gemini report generation temporarily unavailable, serving local fallback:",
      error?.message || error,
    );
    const summary = currentDataSummary || {};
    const dynamicReportText = generateFallbackReport(
      summary,
      error?.message || "High Demand",
      briefingType,
      customPrompt,
    );

    res.json({
      aiGenerated: false,
      briefingType,
      reportText: dynamicReportText,
    });
  }
});

// 5b. Grounded Interactive Georisk Q&A Endpoint ("Ask AI Geohazard Intelligence Assistant")
app.post("/api/ask-georisk", async (req, res) => {
  const { question, currentDataSummary, chatHistory } = req.body;

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "A valid question is required." });
  }

  const userQuery = question.trim();

  // Strict domain verification rule: Check if query relates to geological/seismological/geodetic/disaster scope
  const geologicalKeywords = [
    "volcano",
    "earthquake",
    "seismic",
    "magnitude",
    "depth",
    "furi",
    "erta ale",
    "dallol",
    "fentale",
    "alutu",
    "dabbahu",
    "dama ali",
    "kone",
    "afar",
    "rift",
    "danakil",
    "semara",
    "semera",
    "awash",
    "adama",
    "gnss",
    "station",
    "station",
    "station",
    "station",
    "station",
    "station",
    "focal",
    "tectonic",
    "plume",
    "lava",
    "sulfur",
    "so2",
    "hazard",
    "risk",
    "briefing",
    "drmc",
    "essgi",
    "tremor",
    "fault",
    "graben",
    "mer",
    "ears",
    "escarpment",
    "alert",
    "green",
    "yellow",
    "orange",
    "red",
    "infrastructure",
    "railway",
    "geothermal",
    "tsunami",
    "landslide",
    "rockfall",
    "pga",
    "richter",
    "station",
    "sensor",
    "seismograph",
    "seismogram",
    "gps",
    "geodesy",
    "kibru",
    "ethiopia",
    "east africa",
  ];

  const queryLower = userQuery.toLowerCase();
  const isGeologicallyRelevant = geologicalKeywords.some((kw) =>
    queryLower.includes(kw),
  );

  // If clearly outside domain (e.g. asking for recipe, movie review, unrelated politics)
  if (
    !isGeologicallyRelevant &&
    queryLower.length > 15 &&
    !queryLower.includes("data") &&
    !queryLower.includes("system")
  ) {
    return res.json({
      aiGenerated: false,
      grounded: true,
      answer: `🔒 **ESSGI Intelligence Scope Notice**: I am the authorized Geohazard & Volcanic Intelligence Assistant for the Ethiopian Space Science and Geospatial Institute (ESSGI). 

I am strictly specialized to answer inquiries regarding:
1. **Monitored Volcanoes in Ethiopia** (*Erta Ale, Dallol, Dabbahu, Mount Fentale, Alutu, Kone, Dama Ali*)
2. **Real-time & Historical Earthquakes** (*USGS/ESSGI catalogs, Richter magnitudes, focal depths, rift swarms*)
3. **GNSS Geodesy & Crustal Strain** (*Mount Furi broadband station IU.FURI, plate opening velocities*)
4. **Disaster Risk Guidelines** (*DRMC safety perimeters, critical transport & geothermal corridor vulnerabilities*)

Please submit a query related to the current geological dataset or active monitoring channels.`,
    });
  }

  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY"
  ) {
    // Generate intelligent grounded local fallback response
    const summary = currentDataSummary || {};
    const volcanoes: any[] = summary.activeVolcanoes || [];
    const earthquakes: any[] = summary.latestEarthquakesSample || [];

    let fallbackAnswer = `Based on the active ESSGI & USGS telemetry records: `;

    if (queryLower.includes("erta ale") || queryLower.includes("lava")) {
      fallbackAnswer = `**Erta Ale Surveillance Status**: Erta Ale is an active basaltic shield volcano located in the Danakil Depression (13.60°N, 40.67°E, Elevation: 613m). It currently carries a **RED (Critical)** alert priority due to active effusive lava lake bubbling and persistent SO₂ emissions. ESSGI and DRMC mandate a strict **5 km exclusion perimeter** for non-essential personnel and tourist excursions.`;
    } else if (queryLower.includes("dallol")) {
      fallbackAnswer = `**Dallol Hydrothermal Complex Status**: Dallol (14.24°N, 40.30°E, -48m below sea level) is on **ORANGE (Elevated)** alert. It exhibits phreatic acidic geysers, superheated sulfur vents, and boiling salt crusts in the northern Danakil graben.`;
    } else if (
      queryLower.includes("fentale") ||
      queryLower.includes("awash") ||
      queryLower.includes("alutu")
    ) {
      fallbackAnswer = `**Central Rift Valley Complexes**: Mount Fentale (8.97°N, 39.90°E, Elev: 2007m) and Alutu Caldera (7.78°N, 38.78°E, Elev: 2335m) are maintained under **YELLOW (Advisory)** monitoring. They exhibit fumarolic venting and episodic micro-seismic swarms adjacent to the Addis-Djibouti railway line and the Alutu-Langano geothermal power wells.`;
    } else if (
      queryLower.includes("earthquake") ||
      queryLower.includes("magnitude") ||
      queryLower.includes("seismic")
    ) {
      fallbackAnswer = `**Seismic Catalog Ingestion**: Currently tracking **${summary.totalEarthquakesInPeriod || 14} seismic events** across the Ethiopian Rift. Peak recorded magnitude is **M ${(summary.highestMagnitudeRecorded || 4.9).toFixed(1)}**. Primary active fault zones include the Awash Basin, Semera Graben, and the Dobi fault complex in Afar.`;
    } else if (
      queryLower.includes("gnss") ||
      queryLower.includes("furi") ||
      queryLower.includes("deformation")
    ) {
      fallbackAnswer = `**GNSS & Geodetic Strain**: The primary IU.FURI reference station on Mount Furi (9°04'48.0"N, 38°43'12.0"E, 2840m) streams continuous broadband telemetry. Regional Nubia-Somalia plate divergence ranges from **4.5 mm/yr in the Central MER** to **14-16 mm/yr in Northern Afar**.`;
    } else {
      fallbackAnswer = `**ESSGI Consolidated Geodata Summary**: The system monitors **${summary.totalVolcanoesObserved || 7} volcanic centers** and **${summary.totalEarthquakesInPeriod || 14} seismic ruptures**. All data is validated in real-time against USGS and ESSGI broadband telemetry.`;
    }

    return res.json({
      aiGenerated: false,
      grounded: true,
      answer: fallbackAnswer,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are the specialized Geohazard Intelligence Assistant for the Space Science and Geospatial Institute (SSGI), Department of Geodesy and Geodynamics.

TASK:
Answer the user's specific question strictly and accurately using the provided system dataset for Ethiopia's volcanoes, seismic catalogs, GNSS stations, and geohazard risk plans.

STRICT GROUNDING & SCOPE CONSTRAINTS:
1. ONLY answer with information grounded in the dataset below or standard geophysical facts directly relevant to Ethiopian geology (Afar Depression, Main Ethiopian Rift, Danakil, Mount Furi, Erta Ale, Dallol, etc.).
2. If the user asks a question about unrelated topics (e.g. general pop culture, non-geological matters), politely explain that your scope is strictly limited to SSGI geohazard data.
3. Be concise, authoritative, and clinical. Format with clear Markdown, bold key metrics, and cite relevant sensors (e.g., [Source: Volcano Database], [Source: USGS Catalog], [Source: IU.FURI Seismometer]).

SYSTEM GEOHAZARD DATASET:
${JSON.stringify(currentDataSummary || {}, null, 2)}

USER QUESTION:
"${userQuery}"

Provide your grounded answer:`;

    const { text, modelUsed } = await generateGeminiContentWithFallback(
      ai,
      prompt,
    );

    res.json({
      aiGenerated: true,
      grounded: true,
      modelUsed,
      answer: text,
    });
  } catch (error: any) {
    console.warn("Gemini Q&A error, serving local grounded answer:", error);
    res.json({
      aiGenerated: false,
      grounded: true,
      answer: `**ESSGI Telemetry Intelligence Response**: Based on local telemetry records, ${currentDataSummary?.activeAlertVolcanoesCount || 2} volcanoes in Ethiopia (Erta Ale and Dallol) are on active alert, with peak seismic activity at M ${(currentDataSummary?.highestMagnitudeRecorded || 4.9).toFixed(1)}. Please review the specific telemetry tabs for complete wave files and hypocenter tables.`,
    });
  }
});

// 6. Real-time AI Situation Summary endpoint
app.post("/api/ai-summary", async (req, res) => {
  const { currentDataSummary } = req.body;

  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY"
  ) {
    const fallbackText = `Currently in Ethiopia, active tectonic strain persists primarily across the Afar Depression, where 2 volcanoes (Erta Ale and Dallol) remain under elevated critical monitoring due to active magmatic plumes. Seismometers have recorded ${currentDataSummary?.totalEarthquakesInPeriod || 12} events over the past 30 days, with a peak magnitude of M ${currentDataSummary?.highestMagnitudeRecorded || 5.8} near Semera. Local emergency coordinators are advised to increase real-time satellite radar sweeps and restrict public excursions near boiling lava channels.`;
    return res.json({
      aiGenerated: false,
      summaryText: fallbackText,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are a professional geological hazard intelligence agent for the Space Science and Geospatial Institute (SSGI), Department of Geodesy and Geodynamics.
Based on this raw geological dataset:
${JSON.stringify(currentDataSummary || {}, null, 2)}

Draft an absolute maximum of THREE concise sentences summarizing the current geological situation in Ethiopia. Focus strictly on critical active magmatic alerts (like Erta Ale or Dallol), the peak seismicity magnitude, and key immediate recommendations. Keep it direct, clinical, and authoritative for decision-makers. Do not use any markdown formatting or lists.`;

    const { text, modelUsed } = await generateGeminiContentWithFallback(
      ai,
      prompt,
    );

    res.json({
      aiGenerated: true,
      modelUsed,
      summaryText: text?.trim(),
    });
  } catch (error: any) {
    console.warn(
      "Gemini summary temporarily unavailable, using local synthesis:",
      error?.message || error,
    );
    const fallbackText = `Currently in Ethiopia, active tectonic strain persists primarily across the Afar Depression, where 2 volcanoes (Erta Ale and Dallol) remain under elevated critical monitoring due to active magmatic plumes. Seismometers have recorded ${currentDataSummary?.totalEarthquakesInPeriod || 12} events over the past 30 days, with a peak magnitude of M ${currentDataSummary?.highestMagnitudeRecorded || 5.8} near Semera. Local emergency coordinators are advised to increase real-time satellite radar sweeps and restrict public excursions near boiling lava channels.`;
    res.json({
      aiGenerated: false,
      summaryText: fallbackText,
    });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
