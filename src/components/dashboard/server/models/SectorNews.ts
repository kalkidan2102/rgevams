export interface ISector {
  id: string;
  title: string;
  code: string;
  directorate: string;
  head: string;
  location: string;
  description: string;
  keyFunctions: string[];
  activeProjects: string[];
  stationCount: string;
  status: string;
  badge: string;
  targetTab: string;
  metrics: Array<{ label: string; value: string }>;
}

export interface INews {
  id: string;
  dispatchCode: string;
  title: string;
  excerpt: string;
  fullText: string;
  date: string;
  category: string;
  tag: string;
  readTime: string;
  author: string;
  location: string;
  keyFindings: string[];
  recommendations: string[];
}

export interface IAnnouncement {
  id: string;
  code: string;
  title: string;
  category: string;
  date: string;
  deadline: string;
  organizer: string;
  location: string;
  summary: string;
  fullDetails: string;
  requirements: string[];
  contactEmail: string;
  status: string;
}

export const defaultSectors: ISector[] = [
  {
    id: "seismology",
    title: "Seismology & Tectonic Sector",
    code: "ESSGI-DIR-GEO-01",
    directorate: "Directorate of Geodynamics & Seismological Telemetry",
    head: "Dr. Fekadu Abaye (Chief Geophysicist)",
    location: "Mount Furi Seismological Observatory (FURI), Addis Ababa",
    description: "Operates 18 permanent broadband GNSS and seismic stations along the Main Ethiopian Rift (MER). Integrates real-time wave forms from the historical Furi Observatory, USGS stream feeds, and local velocity models to calculate moment tensor solutions for micro-tremor swarms.",
    keyFunctions: [
      "Real-time seismic wave processing and focal mechanism inversion",
      "Continuous monitoring of the Hawassa, Adama, and Ankober seismogenic grabens",
      "Maintenance of the national broadband seismograph network (FURI, BDAS, ATIR)",
      "Automated epicenter localization and focal depth estimation algorithms"
    ],
    activeProjects: [
      "Sub-second USGS API telemetry sync",
      "Furi Observatory ObsPy Obspython spectral noise analyzer",
      "Cross-border East African Rift System (EARS) seismic strain mapping"
    ],
    stationCount: "18 Broadband Seismic Stations",
    status: "ONLINE",
    badge: "Real-time Telemetry",
    targetTab: "earthquakes",
    metrics: [
      { label: "Active Array Stations", value: "18 Online" },
      { label: "Daily Waveform Volume", value: "2.4 GB/sec" },
      { label: "Min Magnitude Detection", value: "M 1.2" }
    ]
  },
  {
    id: "volcanology",
    title: "Volcanology & Geothermal Sector",
    code: "ESSGI-DIR-VOLC-02",
    directorate: "Directorate of Volcanology & Geothermal Hazards",
    head: "Dr. Atalay Ayele (Principal Volcanologist)",
    location: "Afar Rift Dynamics Field Station, Semera & Erta Ale Base",
    description: "Maintains a national catalog of 115 volcanic centers in Ethiopia. Combines orbital MODIS/VIIRS thermal infrared anomaly detection, drone gas vent profiling, and ground SO2 emissions sensors at active calderas including Erta Ale, Dallol, Aluto, and Dabbahu.",
    keyFunctions: [
      "Thermal radiation flux tracking over Erta Ale active lava lake",
      "Hydrothermal geothermal fluid and soil degasification sampling",
      "Eruption alert escalation protocol for aviation and civil defense",
      "Volcanic Ash Advisory (VAAC) reporting for regional flight corridors"
    ],
    activeProjects: [
      "Danakil Depression thermal plume satellite radar monitoring",
      "Aluto-Langano geothermal field pressure and inflation modeling",
      "Erta Ale fissure eruption early warning sensor mesh"
    ],
    stationCount: "115 Volcanic Centers Catalogs",
    status: "ELEVATED",
    badge: "Volcanic Database",
    targetTab: "volcanoes",
    metrics: [
      { label: "Monitored Calderas", value: "115 Vents" },
      { label: "Active Lava Lakes", value: "Erta Ale" },
      { label: "Geothermal Fields", value: "14 Sites" }
    ]
  },
  {
    id: "space-science",
    title: "Space Science & Satellite Geodesy Sector",
    code: "ESSGI-DIR-SPAC-03",
    directorate: "Directorate of Space Science & Satellite Navigation",
    head: "Prof. Solomon Belay (Director of Space Science)",
    location: "Entoto Astronomical Observatory & Research Center (3,200m ASL)",
    description: "Utilizes twin 1-meter optical telescopes at Entoto Observatory and orbital Synthetic Aperture Radar (SAR) satellite interferometry to quantify rifting crustal strain rate, tropospheric column GPS delay, and space weather ionospheric perturbations.",
    keyFunctions: [
      "Multi-constellation GNSS velocity vector inversion (GPS, GLONASS, Galileo)",
      "Sentinel-1 InSAR phase interferogram processing for ground subsidence",
      "Space weather ionospheric TEC (Total Electron Content) modeling",
      "Astronomical observation and deep celestial imaging at Entoto Observatory"
    ],
    activeProjects: [
      "High-altitude tropospheric delay calibration for GPS rifting vectors",
      "East African Ionospheric Scintillation monitoring network",
      "Satellite ground station tracking and telemetry ingest"
    ],
    stationCount: "2 Twin Optical Telescopes + 18 GNSS",
    status: "ONLINE",
    badge: "Orbital SAR Radar",
    targetTab: "gnss-network",
    metrics: [
      { label: "Geodetic Crustal Vector", value: "15.2 mm/yr" },
      { label: "Observatory Altitude", value: "3,200 meters" },
      { label: "Optical Telescopes", value: "Twin 1.0m" }
    ]
  },
  {
    id: "disaster-risk",
    title: "Disaster Risk & Geospatial Intelligence Sector",
    code: "ESSGI-DIR-DRM-04",
    directorate: "Directorate of Geospatial Intelligence & Civil Preparedness",
    head: "Commander Worku Bekele (Disaster Risk Liaison Officer)",
    location: "National Emergency Operations Center (EOC), Addis Ababa",
    description: "Generates automated AI geological risk briefings powered by Gemini models and broadcasts bilingual SMS warning advisories in Afar, Amharic, and Oromiffa to pastoralist communities and transport authorities along active rifting zones.",
    keyFunctions: [
      "Automated Gemini AI hazard risk synthesis and executive briefings",
      "Bilingual SMS advisory dispatch to DRMC regional officers",
      "Spatial GIS overlay of population density vs seismic fault line buffers",
      "Infrastructure vulnerability matrix calculation for transport & energy corridors"
    ],
    activeProjects: [
      "Afar Pastoralist Early Warning SMS Broadcast Gateway",
      "Gemini 2.5 Flash automated daily hazard report synthesis",
      "National Seismogenic Landslide and Subsidence Susceptibility Atlas"
    ],
    stationCount: "National Civil Safety Network",
    status: "NOMINAL",
    badge: "Early Warning",
    targetTab: "report",
    metrics: [
      { label: "Bilingual SMS Reach", value: "45,000 Users" },
      { label: "AI Briefing Cadence", value: "Real-time" },
      { label: "DRMC Integration", value: "Level 1 Direct" }
    ]
  },
  {
    id: "gis-remote-sensing",
    title: "Remote Sensing & GIS Application Sector",
    code: "ESSGI-DIR-GIS-05",
    directorate: "Directorate of GIS, Land Cover & Earth Observation",
    head: "Eng. Tigist Haile (Chief GIS Officer)",
    location: "Geospatial Institute Headquarters, Addis Ababa",
    description: "Processes high-resolution Sentinel & Landsat satellite imagery for national land use mapping, flood susceptibility modeling in Awash basin, and active lava flow line mapping over the Danakil rift floor.",
    keyFunctions: [
      "Satellite optical multispectral classification & land surface temperature",
      "GIS hazard vulnerability mapping for urban infrastructure and hydro-dams",
      "Digital Elevation Model (DEM) extraction from stereoscopic space imagery"
    ],
    activeProjects: [
      "National High-Resolution GIS Soil & Rift Fault Atlas",
      "Sentinel-2 Thermal Anomaly Auto-Classification System"
    ],
    stationCount: "3 Earth Observation Ground Receivers",
    status: "ONLINE",
    badge: "GIS Earth Observation",
    targetTab: "map",
    metrics: [
      { label: "Satellite Swath Area", value: "1.1M km²" },
      { label: "GIS Spatial Resolution", value: "0.5m Ortho" },
      { label: "Update Cadence", value: "Daily Orbit Pass" }
    ]
  }
];

export const defaultNews: INews[] = [
  {
    id: "news-1",
    dispatchCode: "ESSGI-BULLETIN-2026-089",
    title: "Erta Ale Lava Lake Activity Swells: Satellite Thermal Sensors Detect Fissure Flux",
    excerpt: "ESSGI orbital telemetry captures elevated thermal radiation signatures over Erta Ale's southern caldera pit, alerting geology field crews to prepare continuous volcanic gas monitoring.",
    fullText: "Orbital radiometric sensors aboard Sentinel-2 and VIIRS have recorded a pronounced thermal anomaly expansion across the southern caldera pit of Erta Ale volcano (13.60° N, 40.67° E). Infrared radiance values exceeded 480°C equivalent blackbody temperature, indicating active lava lake overturning and localized fissure effusion within the crater floor. Ground observation teams from Semera Field Base report increased SO2 gas venting and minor fountaining. ESSGI volcanologists recommend maintaining a 3-kilometer safety perimeter around the summit rim for field researchers and local guides.",
    date: "July 08, 2026",
    category: "Volcanology",
    tag: "Urgent Alert",
    readTime: "4 min read",
    author: "Directorate of Volcanology & Geothermal Hazards",
    location: "Erta Ale Volcano, Danakil Depression, Afar Region",
    keyFindings: [
      "Thermal infrared radiance surge detected at 13.60° N, 40.67° E",
      "Active lava lake level elevated by ~4.2 meters inside pit crater",
      "SO2 gas discharge rate measured at 2,400 tons/day via COSPEC ground arrays"
    ],
    recommendations: [
      "Enforce a 3km exclusion zone around Erta Ale summit caldera",
      "Issue aviation warning advisory (VONA) for low-altitude charter routes",
      "Deploy mobile gas monitoring unit from Semera field headquarters"
    ]
  },
  {
    id: "news-2",
    dispatchCode: "ESSGI-BULLETIN-2026-085",
    title: "USGS & ESSGI Integrate High-Frequency Real-time Earthquake Stream APIs",
    excerpt: "A direct seismic streaming pipeline from the USGS geohazards server is successfully linked to our active GIS map room, ensuring sub-second georisk alerts across central rift zones.",
    fullText: "The Geodynamics and Seismological Telemetry Division has finalized a high-speed WebSocket and REST streaming link connecting USGS Global Seismic Network feeds with ESSGI's internal Furi Seismological Observatory servers. This automated ingest normalizes global event magnitudes (Mw, mb, Ms) with local Ethiopian Rift velocity models (FURI 1D Earth model). In the event of micro-tremor swarms along the Hawassa or Adama grabens, event hypocenters are localized within <8 seconds, triggering automatic risk alerts on the GIS Geo-Portal.",
    date: "July 05, 2026",
    category: "Seismology",
    tag: "API Integration",
    readTime: "3 min read",
    author: "Geodynamics & Seismological Telemetry Division",
    location: "Main Ethiopian Rift (Adama-Hawassa Corridor)",
    keyFindings: [
      "Sub-second event detection latency across East African Rift System",
      "Unified magnitude calibration matching FURI broadband station telemetry",
      "Automatic hypocentral depth mapping for depth-dependent risk modeling"
    ],
    recommendations: [
      "Incorporate USGS real-time feeds into regional emergency dispatch rooms",
      "Automate SMS alert triggers for events exceeding M >= 4.0 in populated grabens",
      "Conduct weekly latency audits between Furi station and global data centers"
    ]
  },
  {
    id: "news-3",
    dispatchCode: "ESSGI-BULLETIN-2026-078",
    title: "Entoto Astronomical Observatory Enhances Atmospheric Water Vapor GNSS Corrections",
    excerpt: "Joint study by Addis Ababa University shows that high-altitude geodetic stations can correct GPS rifting drift rates by accounting for tropospheric column delays over the Rift Basin.",
    fullText: "Researchers at Entoto Astronomical Observatory (3,200m ASL) in collaboration with the Department of Physics at Addis Ababa University have published breakthrough calibration models for satellite geodetic stations. By utilizing co-located water vapor radiometers and high-precision GNSS receivers, tropospheric column path delays—previously masking micro-millimeter crustal extension along the Nubia-Somalia plate boundary—can now be subtracted with 98.4% precision.",
    date: "June 28, 2026",
    category: "Space Science",
    tag: "Research",
    readTime: "6 min read",
    author: "Directorate of Space Science & Satellite Navigation",
    location: "Entoto Observatory, Addis Ababa (3,200m ASL)",
    keyFindings: [
      "Tropospheric delay calibration accuracy improved to 98.4%",
      "Sub-millimeter rifting vector accuracy confirmed across Central MER",
      "Published in African Journal of Space Science & Geodesy"
    ],
    recommendations: [
      "Apply tropospheric correction code across all 18 permanent GNSS stations",
      "Share geodetic velocity vectors with international geodynamics consortia",
      "Upgrade radio receiver arrays at Entoto Observatory station"
    ]
  },
  {
    id: "news-4",
    dispatchCode: "ESSGI-BULLETIN-2026-062",
    title: "Bilingual Mobile Early Warning SMS App Tested for Afar Pastoralists",
    excerpt: "In partnership with the Disaster Risk Management Commission, automatic SMS alerts in Afar and Amharic are pushed to regions experiencing tectonic micro-tremor swarms.",
    fullText: "ESSGI's Geospatial Intelligence & Civil Safety team, working alongside the National Disaster Risk Management Commission (DRMC), has deployed a bilingual mobile alert gateway. The system transmits immediate safety advisories translated in Afar and Amharic via Ethio Telecom cell towers whenever seismic arrays register localized tremor clusters above M 3.5 or crater vent degassing. During recent field tests in the Semera and Mille woredas, delivery latency averaged under 12 seconds.",
    date: "June 15, 2026",
    category: "Disaster Preparedness",
    tag: "Community",
    readTime: "5 min read",
    author: "Directorate of Geospatial Intelligence & Civil Safety",
    location: "Semera & Mille Woredas, Afar Regional State",
    keyFindings: [
      "Average SMS broadcast latency of 11.4 seconds across 45,000 active subscribers",
      "100% translation fidelity verified by Afar Language Culture Bureau",
      "Integrated with DRMC regional emergency coordination centers"
    ],
    recommendations: [
      "Expand subscriber registration to Oromia and SNNPR rift corridor communities",
      "Incorporate Voice-IVR broadcasts for non-literate rural pastoralists",
      "Conduct quarterly emergency drill simulations with local administration heads"
    ]
  }
];

export const defaultAnnouncements: IAnnouncement[] = [
  {
    id: "ann-sarc-2026",
    code: "ESSGI-CONF-2026-01",
    title: "S-ARC2026: 4th International South-East Africa Rift Geohazards Conference",
    category: "Conference",
    date: "July 28, 2026",
    deadline: "September 15, 2026",
    organizer: "Ethiopian Space Science & Geodesy Institute (ESSGI) & USGS",
    location: "African Union Conference Center, Addis Ababa, Ethiopia",
    summary: "Call for abstracts and registration for the biennial South-East Africa Rift Conference focusing on real-time seismic array integration, volcano eruption early warnings, and GNSS crustal strain dynamics.",
    fullDetails: "ESSGI invites international geophysicists, volcanologists, geodesists, and disaster risk managers to register for the S-ARC2026 Conference. The theme is 'Strengthening Rift Basin Resiliency through Integrated Earth Observation Telemetry'.",
    requirements: [
      "Abstract submission deadline: September 15, 2026",
      "Early bird registration discount closes: August 30, 2026",
      "Student fellowship travel grants available for East African researchers"
    ],
    contactEmail: "s-arc2026@essgi.gov.et",
    status: "OPEN"
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
    summary: "Funding opportunity offering up to 2.5 Million ETB for doctoral and post-doctoral researchers studying Afar rift opening or Erta Ale magmatic flux.",
    fullDetails: "The Ethiopian Space Science & Geodesy Institute announces 12 competitive research grants for post-graduate researchers. Awardees will receive full access to ESSGI broadband seismic station raw wave data.",
    requirements: [
      "Principal Investigator must be affiliated with an accredited Ethiopian higher education institution",
      "Research proposal must align with national geohazard safety priorities"
    ],
    contactEmail: "grants-rd@essgi.gov.et",
    status: "OPEN"
  },
  {
    id: "ann-tender-2026",
    code: "ESSGI-TENDER-2026-09",
    title: "Tender for Expansion of High-Rate GNSS Geodetic Receivers & Seismic Array",
    category: "Tender",
    date: "July 20, 2026",
    deadline: "August 25, 2026",
    organizer: "ESSGI Procurement & Technical Telemetry Directorate",
    location: "ESSGI HQ Procurement Office, Addis Ababa",
    summary: "International competitive bid for supplying 14 multi-constellation GNSS reference receivers and 8 broadband 120s seismometers.",
    fullDetails: "ESSGI solicits sealed bids from qualified international manufacturers for the supply, delivery, and calibration of continuous GNSS geodetic reference stations.",
    requirements: [
      "Bidder must submit a 2% bid security guarantee from a recognized commercial bank",
      "Compliance with ISO 9001 quality standards and minimum 3-year hardware warranty"
    ],
    contactEmail: "tenders@essgi.gov.et",
    status: "URGENT"
  }
];
