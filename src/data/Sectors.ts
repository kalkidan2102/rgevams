export interface SectorData {
  id: string;
  title: string;
  code: string;
  directorate: string;
  head: string;
  location: string;
  overview: string;
  description: string;
  scopeAndMandate: string;
  keyFunctions: string[];
  operationalDivisions: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  activeProjects: {
    title: string;
    leadAgency: string;
    description: string;
    status: "Active" | "Ongoing" | "Continuous Operation" | "Operational";
  }[];
  infrastructureAssets: {
    name: string;
    type: string;
    specification: string;
    coordinates?: string;
  }[];
  stationCount: string;
  status: "ONLINE" | "ELEVATED" | "NOMINAL";
  badge: string;
  targetTab: string;
  stakeholders: string[];
  metrics: {
    label: string;
    value: string;
    trend?: string;
  }[];
}

export const SECTORS_DATA: SectorData[] = [
  {
    id: "seismology",
    title: "Seismology & Tectonic Geodynamics Sector",
    code: "ESSGI-DIR-GEO-01",
    directorate: "Directorate of Geodynamics & Seismological Telemetry",
    head: "Dr. Fekadu Abaye (Chief Seismologist & Geodynamicist)",
    location: "Mount Furi Seismological Observatory (IU.FURI), Addis Ababa & Regional Stations",
    overview: "The Seismology & Tectonic Geodynamics Sector serves as Ethiopia's statutory authority for earthquake recording, seismic hazard assessment, and tectonic rupture analysis across the East African Rift System (EARS).",
    description: "Operates 18 permanent broadband seismograph stations linked directly into the USGS Global Seismographic Network (GSN) and the Furi Observatory array. Processes 3-component continuous waveforms to compute instantaneous hypocenter coordinates, focal depth, local magnitude (ML), moment tensor solutions (Mw), and ground acceleration shakemaps for public safety and engineering design.",
    scopeAndMandate: "To safeguard Ethiopian society and critical infrastructure from earthquake destruction by maintaining 24/7 continuous seismic monitoring, performing advanced seismic hazard microzonation, and issuing immediate emergency hypocentral notifications to the Disaster Risk Management Commission (DRMC) within 90 seconds of any M >= 4.0 rupture.",
    keyFunctions: [
      "24/7 Continuous seismic wave recording and automated hypocenter inversion",
      "Real-time focal mechanism and double-couple fault plane solution calculations",
      "Continuous monitoring of active rift grabens: Hawassa, Adama, Ankober, Semera, and Dobi",
      "Operation and calibration of the national broadband seismograph network (FURI, BDAS, ATIR, SEME)",
      "Computation of Peak Ground Acceleration (PGA) and probabilistic seismic hazard maps (PSHA)",
      "Sub-second USGS, IRIS, and ORFEUS global seismological data federation exchange",
      "Deployment of rapid-response temporary seismic nodal arrays during volcanic or tectonic swarms"
    ],
    operationalDivisions: [
      {
        name: "Waveform Telemetry & Network Operations",
        description: "Manages real-time data ingestion via SeedLink, VSAT, and 4G telemetry from remote solar-powered broadband seismometer vaults across the Ethiopian rift.",
        technologies: ["SeedLink Protocol", "Nanometrics Centaur Digitizers", "Streckeisen STS-2 Seismometers", "ObsPy Automated Pipelines"]
      },
      {
        name: "Hypocenter Localization & Inversion Lab",
        description: "Executes automated and analyst-reviewed phase picking (P and S arrivals), HypoInverse travel-time inversion, and regional 1D/3D crustal velocity modeling.",
        technologies: ["Hypo71 / HypoInverse", "NonLinLoc 3D Velocity Modeling", "ISOLA Moment Tensor Package"]
      },
      {
        name: "Seismic Engineering & Hazard Microzonation",
        description: "Evaluates ground motion amplification, soil liquefaction risks, and site response spectra for structural codes (ES EN 1998) along railway corridors and mega dams.",
        technologies: ["OpenQuake PSHA Engine", "Microtremor HVSR Ambient Noise", "Accelerograph Arrays"]
      }
    ],
    activeProjects: [
      {
        title: "National Rift Seismic Array Modernization (NRSAM)",
        leadAgency: "ESSGI in partnership with USGS & IRIS",
        description: "Upgrading 12 legacy analog and short-period stations with ultra-broadband 120s triaxial sensors and real-time satellite data links.",
        status: "Operational"
      },
      {
        title: "Main Ethiopian Rift Micro-Tremor Swarm Modeling",
        leadAgency: "Addis Ababa University & ESSGI Geodynamics Directorate",
        description: "Investigating fluid-induced micro-earthquakes in the Aluto-Langano and Corbetti geothermal reservoirs to distinguish tectonic from hydrothermal triggers.",
        status: "Active"
      },
      {
        title: "Addis Ababa Urban Seismic Microzonation & Vulnerability Mapping",
        leadAgency: "FDRE Ministry of Innovation and Technology (MInT) & SSGI",
        description: "High-resolution soil resonance profiling across the 11 sub-cities of Addis Ababa to assess earthquake ground motion amplification from the active Filwoha and Entoto fault lines.",
        status: "Ongoing"
      }
    ],
    infrastructureAssets: [
      {
        name: "Mount Furi Seismological Vault (IU.FURI)",
        type: "Global Seismographic Network (GSN) Primary Node",
        specification: "Streckeisen STS-2.5 broadband sensor, Quanterra Q330 digitizer in subterranean basalt tunnel (2,560m ASL)",
        coordinates: "8.895° N, 38.680° E"
      },
      {
        name: "BDAS Seismograph Station (Bahir Dar)",
        type: "Regional Broadband Node",
        specification: "Guralp CMG-3T 120s sensor, 24-bit high dynamic range digitizer, solar-backed UPS",
        coordinates: "11.598° N, 37.391° E"
      },
      {
        name: "SEME Seismograph Station (Semera, Afar)",
        type: "Afar Rifting High-Frequency Array",
        specification: "Nanometrics Trillium Compact 120s, satellite VSAT real-time data link",
        coordinates: "11.792° N, 41.008° E"
      }
    ],
    stationCount: "18 Broadband Seismic Stations",
    status: "ONLINE",
    badge: "Real-time 20Hz Waveforms",
    targetTab: "earthquakes",
    stakeholders: [
      "Disaster Risk Management Commission (DRMC)",
      "Ethiopian Electric Power (EEP) - Dam Safety Unit",
      "Ethiopian Construction Authority (Building Codes)",
      "Ethiopian Railway Corporation (ERC)",
      "International Seismological Centre (ISC, UK)"
    ],
    metrics: [
      { label: "Active Array Stations", value: "18 Online", trend: "100% operational" },
      { label: "Daily Waveform Ingest", value: "2.4 GB/day", trend: "20 Hz continuous" },
      { label: "Min Detection Threshold", value: "M 1.2", trend: "Within MER rift" },
      { label: "Notification Latency", value: "< 90 seconds", trend: "Automated alert" }
    ]
  },
  {
    id: "volcanology",
    title: "Volcanology & Geothermal Hazards Sector",
    code: "ESSGI-DIR-VOLC-02",
    directorate: "Directorate of Volcanology & Magmatic Processes",
    head: "Dr. Atalay Ayele (Principal Volcanologist & Geochemist)",
    location: "Afar Rift Dynamics Field Station, Semera & Erta Ale Base Camp",
    overview: "The Volcanology & Geothermal Hazards Sector is the national center for volcanic surveillance, magma dynamics modeling, and geothermal degassing monitoring across Ethiopia's 115 identified volcanic systems.",
    description: "Combines orbital Synthetic Aperture Radar (InSAR), multi-spectral satellite thermal infrared imagery (MODIS/VIIRS), differential optical absorption spectroscopy (DOAS) for SO₂ flux, and drone thermal mapping. Tracks persistent magma lakes (Erta Ale), hyper-saline acid brine geysers (Dallol), and inflating silicic calderas (Corbetti, Alutu, Fantale, Dabbahu).",
    scopeAndMandate: "To prevent volcanic catastrophes, aviation hazards, and toxic gas poisoning by providing early warnings of impending magmatic eruptions, mapping volcanic ash dispersion trajectories, and supporting the safe development of national geothermal energy projects.",
    keyFunctions: [
      "Continuous thermal infrared monitoring of Erta Ale lava lake levels and crust overturns",
      "Geodetic and InSAR ground deformation tracking over 115 volcanic centers",
      "SO₂ and CO₂ volcanic gas emission flux quantification using satellite and ground DOAS sensors",
      "Issuance of Volcanic Ash Advisory (VONA) bulletins for Ethiopian Civil Aviation and regional corridors",
      "Hydrothermal temperature and pH monitoring at Dallol hydrothermal springs and salt domes",
      "Magma chamber volume and depth inversion using finite element and Mogi elastostatic modeling",
      "Collaborative volcanic hazard mapping and community safety evacuation planning with DRMC"
    ],
    operationalDivisions: [
      {
        name: "Orbital Thermal & Gas Remote Sensing Lab",
        description: "Processes MODIS, VIIRS, Sentinel-5P TROPOMI, and Landsat thermal infrared channels to calculate Volcanic Radiative Power (VRP in Megawatts) and total daily sulfur dioxide gas tonnage.",
        technologies: ["Sentinel-5P TROPOMI SO2", "MODIS MIROVA Thermal Inversion", "FLIR High-Temp Radiometry"]
      },
      {
        name: "Magma Dynamics & Caldera Inversion Lab",
        description: "Models subsurface magmatic intrusion geometries, dyke propagation velocity, and pressure changes beneath silicic calderas using Sentinel-1 InSAR phase unwrapping.",
        technologies: ["LiCSBAS InSAR Inversion", "PyGDM Deformation Modeling", "Mogi / Yang Analytical Inversion"]
      },
      {
        name: "Geothermal Field Surveillance Division",
        description: "Monitors ground stability, steam pressure oscillations, and fumarolic soil temperatures at national geothermal power fields (Aluto-Langano, Corbetti, Tendaho).",
        technologies: ["Ground Multi-GAS Analyzers", "Fiber-Optic Distributed Temp Sensing", "Gas Chromatography"]
      }
    ],
    activeProjects: [
      {
        title: "Danakil Depression Magma & Volcanic Volatiles Observatory",
        leadAgency: "ESSGI & COMET Consortium (Universities of Leeds, Oxford, Bristol)",
        description: "Integrated real-time satellite radar and ground acoustic monitoring of Erta Ale's active lava lake dynamics and northern fissure vents.",
        status: "Active"
      },
      {
        title: "Corbetti & Alutu Silicic Caldera Inflation Risk Assessment",
        leadAgency: "ESSGI Volcanology Directorate & Ethiopian Geological Survey (GSE)",
        description: "Long-term InSAR and GNSS geodetic study tracking rapid +38 mm/year vertical inflation at Urji obsidian dome in Corbetti caldera.",
        status: "Continuous Operation"
      },
      {
        title: "National Volcanic Ash Advisory & Aviation Corridor Network (VONA-ET)",
        leadAgency: "ESSGI in partnership with Ethiopian Civil Aviation Authority (ECAA)",
        description: "Automated ash dispersion trajectory forecasting using HYSPLIT and GFS atmospheric wind models to safeguard Bole International Airport flight corridors.",
        status: "Operational"
      }
    ],
    infrastructureAssets: [
      {
        name: "Erta Ale Summit Caldera Sensor Node",
        type: "High-Temperature Volcano Telemetry Station",
        specification: "FLIR radiometric thermal camera, UV DOAS mini-spectrometer, solar-powered wireless relay to Semera",
        coordinates: "13.603° N, 40.662° E"
      },
      {
        name: "Dallol Hydrothermal Extreme Station",
        type: "Geothermal Acid Brine Monitoring Post",
        specification: "Continuous pH, conductivity, and multi-depth thermocouple probes in hyper-saline salt pools",
        coordinates: "14.241° N, 40.298° E"
      },
      {
        name: "Aluto-Langano Geothermal Monitoring Array",
        type: "Continuous Hydrothermal GNSS & InSAR Target",
        specification: "4 Continuous GNSS receivers, 12 corner radar reflectors for Sentinel-1 C-band coherence",
        coordinates: "7.780° N, 38.780° E"
      }
    ],
    stationCount: "115 Volcanic Centers Catalog",
    status: "ELEVATED",
    badge: "115 Volcanic Centers Catalog",
    targetTab: "volcanoes",
    stakeholders: [
      "Ethiopian Civil Aviation Authority (ECAA)",
      "Ethiopian Electric Power (EEP) - Geothermal Generation",
      "Toulouse Volcanic Ash Advisory Centre (VAAC)",
      "Afar Regional Disaster Prevention Bureau",
      "Ministry of Mines and Petroleum"
    ],
    metrics: [
      { label: "Cataloged Calderas", value: "115 Centers", trend: "Full national inventory" },
      { label: "Active Lava Lakes", value: "Erta Ale", trend: "Active degassing" },
      { label: "Monitored Geothermal Fields", value: "14 Sites", trend: "Continuous baseline" },
      { label: "Aviation Alerts (VONA)", value: "Level Yellow", trend: "Standard readiness" }
    ]
  },
  {
    id: "space-science",
    title: "Space Science, Satellite Geodesy & Remote Sensing Sector",
    code: "ESSGI-DIR-SPAC-03",
    directorate: "Directorate of Space Science, Satellite Geodesy & Navigation",
    head: "Prof. Solomon Belay (Director of Space Science & Satellite Engineering)",
    location: "4 Kilo Headquarters (Addis Ababa) & Entoto Space Observatory (3,200m ASL)",
    overview: "The Space Science, Satellite Geodesy & Remote Sensing Sector is responsible for national satellite operations, optical astronomy, deep-space observations, and high-precision multi-constellation GNSS reference frames.",
    description: "Operates the Entoto Astronomical Observatory equipped with twin 1.0-meter optical telescopes, the national Continuously Operating Reference Stations (CORS), and satellite radar interferometry (InSAR) pipelines. Quantifies East African continental rifting spreading velocities (2 to 6 mm/yr), ionospheric Total Electron Content (TEC) for GPS corrections, and satellite earth observation downloads.",
    scopeAndMandate: "To lead Ethiopia into the space age by operating satellite ground command stations, establishing the millimeter-accurate national geodetic datum, conducting space weather forecasts, and providing high-resolution earth observation imagery for national development.",
    keyFunctions: [
      "Operation and scientific management of Entoto Astronomical Observatory (twin 1-meter optical telescopes)",
      "Maintenance and processing of the national GNSS CORS geodetic reference frame",
      "Automated Sentinel-1 Synthetic Aperture Radar (SAR) interferometry with LiCSBAS and COMET",
      "Space weather and ionospheric scintillation forecasting for satellite communication reliability",
      "Multi-spectral Earth Observation (EO) satellite data ingestion and processing for agriculture & water resources",
      "Orbital trajectory tracking and ground receiving station operations for national satellites (ET-RSS1)",
      "High-precision millimeter geoid determination and 3D crustal strain rate tensor mapping"
    ],
    operationalDivisions: [
      {
        name: "Entoto Astronomical Observatory Division",
        description: "Conducts optical astronomy, photometric variable star monitoring, asteroid tracking, and deep-sky imaging utilizing twin 1.0-meter Ritchey-Chrétien optical telescopes at 3,200m elevation.",
        technologies: ["Twin 1.0m Optical Telescopes", "Cryogenic CCD Cameras", "High-Resolution Spectrographs"]
      },
      {
        name: "Satellite Geodesy & CORS Operations Center",
        description: "Processes multi-GNSS constellation data (GPS, GLONASS, Galileo, BeiDou) using GAMIT/GLOBK and Bernese GNSS software to derive millimeter crustal velocity fields.",
        technologies: ["Trimble NetR9 & Alloy GNSS Receivers", "Choke-Ring Multi-Constellation Antennas", "GAMIT/GLOBK Processing"]
      },
      {
        name: "InSAR Earth Observation & Radar Processing Lab",
        description: "Executes batch interferometric processing of Sentinel-1 SLC radar frames, phase unwrapping via SNAPHU, and atmospheric phase screen corrections using GACOS.",
        technologies: ["LiCSBAS InSAR Suite", "GACOS Atmospheric Delay Correction", "ISCE2 / MintPy Radar Software"]
      }
    ],
    activeProjects: [
      {
        title: "Ethiopian National Geodetic CORS Modernization (ENG-CORS)",
        leadAgency: "SSGI Directorate of Satellite Geodesy",
        description: "Expanding the national CORS network to 45 high-rate GNSS stations to serve real-time RTK positioning for national land cadastral surveying and rifting geodesy.",
        status: "Active"
      },
      {
        title: "East African Ionospheric Scintillation & Space Weather Network",
        leadAgency: "SSGI & International Space Weather Initiative (ISWI / NASA)",
        description: "Deploying high-rate (50 Hz) GNSS scintillation receivers along the geomagnetic equator to model equatorial plasma bubbles and signal degradation.",
        status: "Operational"
      },
      {
        title: "National Satellite Earth Observation Data Cube (ET-DataCube)",
        leadAgency: "SSGI Remote Sensing Directorate & Digital Earth Africa",
        description: "Cloud-native repository of Analysis-Ready Data (ARD) from Sentinel-2, Landsat-9, and national satellites for water basin and forest carbon inventory.",
        status: "Ongoing"
      }
    ],
    infrastructureAssets: [
      {
        name: "Entoto Space Observatory (Twin 1.0m Telescopes)",
        type: "High-Altitude Astronomical Research Center",
        specification: "Twin 1.0m Ritchey-Chrétien optical reflectors, motorized domes, optical tracking cameras (3,200m ASL)",
        coordinates: "9.078° N, 38.730° E"
      },
      {
        name: "ET-RSS1 Ground Receiving & Mission Control Station",
        type: "Satellite TT&C Ground Station",
        specification: "7.3m S/X-Band tracking dish antenna, orbital mission control center at Entoto",
        coordinates: "9.076° N, 38.732° E"
      },
      {
        name: "National Geodetic Master CORS Station (ADIS)",
        type: "IGS Global Core Geodetic Station",
        specification: "Trimble Alloy receiver, Dorne-Margolin Choke Ring antenna on deep bedrock pillar",
        coordinates: "9.035° N, 38.766° E"
      }
    ],
    stationCount: "2 Twin 1.0m Telescopes + 20 GNSS CORS",
    status: "ONLINE",
    badge: "Orbital SAR Radar & Telescopes",
    targetTab: "insar",
    stakeholders: [
      "International GNSS Service (IGS)",
      "African Space Agency (AfSA)",
      "Ministry of Urban and Infrastructure (Land Cadastre)",
      "National Meteorological Institute (NMI)",
      "International Astronomical Union (IAU)"
    ],
    metrics: [
      { label: "Rift Spreading Rate", value: "2.4 - 5.8 mm/yr", trend: "High precision geodetic" },
      { label: "Observatory Elevation", value: "3,200 meters", trend: "Pristine dark sky" },
      { label: "Optical Telescopes", value: "Twin 1.0m Domes", trend: "Active observation" },
      { label: "CORS Reference Network", value: "20 Stations", trend: "Continuous RTK streaming" }
    ]
  },
  {
    id: "disaster-risk",
    title: "Disaster Risk & Geospatial Intelligence Sector",
    code: "ESSGI-DIR-DRM-04",
    directorate: "Directorate of Geospatial Intelligence & Civil Preparedness",
    head: "Commander Worku Bekele (Director of Geospatial Emergency Operations)",
    location: "National Emergency Operations Command Center (EOC), Addis Ababa",
    overview: "The Disaster Risk & Geospatial Intelligence Sector bridges cutting-edge geoscientific telemetry with emergency response, humanitarian operations, and civil protection across Ethiopia.",
    description: "Leverages Gemini AI automated reasoning engines, real-time spatial GIS overlays, and national multilingual telecommunications to translate complex seismic, volcanic, and InSAR data into actionable emergency directives. Dispatches bilingual SMS alerts in Afar, Amharic, and Oromiffa to regional administrators, pastoralist leaders, and infrastructure operators.",
    scopeAndMandate: "To minimize loss of human life, protect pastoralist livelihoods, and prevent catastrophic critical infrastructure failures from geological hazards through automated AI hazard synthesis, real-time spatial vulnerability modeling, and rapid multi-channel early warning dissemination.",
    keyFunctions: [
      "Automated Gemini 2.5 AI synthesis of daily multi-hazard geoscientific telemetry briefings",
      "Multilingual SMS emergency alert broadcasts to regional Disaster Risk Management committees",
      "Spatial vulnerability modeling combining population density, fault buffers, and soil liquefaction",
      "Critical infrastructure exposure audits for railways, hydro-power dams, substations, and highways",
      "GIS spatial analysis of ground subsidence in developing geothermal and agricultural zones",
      "Rapid post-disaster satellite damage assessment mapping using high-resolution optical and radar feeds",
      "Inter-agency coordination with the National Disaster Risk Management Commission (DRMC)"
    ],
    operationalDivisions: [
      {
        name: "AI Geointelligence & Automated Synthesis Lab",
        description: "Executes automated multi-parameter hazard synthesis using generative AI models to convert live sensor telemetry into structured executive, technical, and community briefings.",
        technologies: ["Gemini 2.5 Flash Engine", "Automated Natural Language Synthesis", "Multi-Hazard Scoring Matrix"]
      },
      {
        name: "Spatial GIS Vulnerability & Exposure Lab",
        description: "Integrates national demographic census data, transportation corridors, and energy grids with active fault lines and volcanic ash hazard footprints.",
        technologies: ["ArcGIS Enterprise / QGIS", "PostGIS Spatial Databases", "Geoserver Web Mapping Services"]
      },
      {
        name: "Emergency Telecom & Early Warning Broadcast Unit",
        description: "Maintains dedicated direct-gateway SMS and cellular broadcast infrastructure for rapid emergency alert dispatch to field operators and community focal points.",
        technologies: ["Ethio Telecom High-Throughput SMS Gateway", "CAP (Common Alerting Protocol)", "Bilingual Text Encoders"]
      }
    ],
    activeProjects: [
      {
        title: "Afar & MER Pastoralist Early Warning SMS Network (PEWN)",
        leadAgency: "ESSGI & Disaster Risk Management Commission (DRMC)",
        description: "Automated direct-to-phone alert system reaching over 45,000 regional administrators, health officers, and community elders in Afar, Amharic, and Oromiffa.",
        status: "Operational"
      },
      {
        title: "National Seismic & Volcanic Infrastructure Vulnerability Atlas",
        leadAgency: "ESSGI Directorate of Geospatial Intelligence",
        description: "High-resolution geospatial database scoring earthquake and ground rupture vulnerability for all national transport corridors and electrical power grids.",
        status: "Active"
      },
      {
        title: "AI-Powered Automated Daily Geohazard Briefing Pipeline",
        leadAgency: "SSGI Software & AI Engineering Division",
        description: "Continuous automated pipeline ingesting USGS, FURI, and Sentinel-1 data every 6 hours to generate instant PDF and interactive intelligence briefings for cabinet ministers.",
        status: "Continuous Operation"
      }
    ],
    infrastructureAssets: [
      {
        name: "National Emergency Operations Command Center (EOC)",
        type: "24/7 Situational Decision Room",
        specification: "Multi-screen GIS video wall, redundant satellite communications, real-time telemetry dashboards",
        coordinates: "9.032° N, 38.761° E"
      },
      {
        name: "Automated SMS Alert Gateway Servers",
        type: "High-Availability Telecom Gateway",
        specification: "Direct Ethio Telecom SMPP protocol link, capable of 1,200 SMS dispatches per second",
        coordinates: "Addis Ababa Data Center"
      },
      {
        name: "Geospatial Cloud Mapping Infrastructure",
        type: "High-Performance Spatial Cluster",
        specification: "Enterprise spatial database cluster storing 10+ TB of national hazard vector layers and satellite mosaics",
        coordinates: "SSGI Secure Data Center"
      }
    ],
    stationCount: "National Civil Safety Network",
    status: "NOMINAL",
    badge: "AI Risk Engine & SMS Broadcast",
    targetTab: "report",
    stakeholders: [
      "National Disaster Risk Management Commission (DRMC)",
      "Ministry of Innovation and Technology (MInT)",
      "Ethiopian Red Cross Society",
      "United Nations OCHA Ethiopia",
      "Regional State Emergency Coordination Bureaus"
    ],
    metrics: [
      { label: "SMS Alert Reach", value: "45,000+ Officers", trend: "Bilingual coverage" },
      { label: "AI Briefing Cadence", value: "Real-Time / 6h", trend: "Automated generation" },
      { label: "DRMC Integration", value: "Level 1 Direct", trend: "Sub-minute dispatch" },
      { label: "Infrastructure Assets Audited", value: "1,240 Facilities", trend: "Mapped along rift" }
    ]
  }
];
