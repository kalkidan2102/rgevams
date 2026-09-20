import { Volcano, Earthquake, AuditLog, DismissedAlert } from "./types";

export const FALLBACK_VOLCANOES: Volcano[] = [
  {
    id: "v1",
    name: "Erta Ale",
    region: "Afar Region (Danakil Depression)",
    elevation: 613,
    coordinates: [13.60, 40.67],
    type: "Shield Volcano",
    activityType: "Effusive (Active Lava Lake)",
    severity: "Red",
    lastErupted: "Ongoing since 1967",
    description: "Famous continually active basaltic shield volcano. Houses one of the world's longest-lived lava lakes located in the Dallol-Fentale rift.",
    monitoredBy: "Semera University & DRMC",
    updatedAt: new Date().toISOString()
  },
  {
    id: "v2",
    name: "Dallol",
    region: "Danakil Depression",
    elevation: -48,
    coordinates: [14.24, 40.30],
    type: "Hydrothermal / Explosion Crater",
    activityType: "Phreatic Hydor-Magmatic",
    severity: "Orange",
    lastErupted: "1926",
    description: "Extremely hot hydrothermal field featuring bubbling salt springs, sulfur formations, and acidic geysers in the Danakil graben.",
    monitoredBy: "Mekelle University Geological Dept",
    updatedAt: new Date().toISOString()
  },
  {
    id: "v3",
    name: "Dabbahu (Boina)",
    region: "Afar Region",
    elevation: 1442,
    coordinates: [12.60, 40.48],
    type: "Stratovolcano",
    activityType: "Fumarolic & High Seismicity",
    severity: "Yellow",
    lastErupted: "2005",
    description: "Located along the Afar rift. Famous for its 2005 explosive eruption, opening a 60km-long magma-filled graben fissure.",
    monitoredBy: "Ethiopian Space Science & Geodesy Institute",
    updatedAt: new Date().toISOString()
  },
  {
    id: "v4",
    name: "Mount Fentale",
    region: "Oromia (East Shewa / Awash)",
    elevation: 2007,
    coordinates: [8.97, 39.90],
    type: "Stratovolcano with Caldera",
    activityType: "Fumarolic Venting",
    severity: "Yellow",
    lastErupted: "1820",
    description: "A large stratovolcano near Awash National Park. It has a 3.5km wide caldera, active fumaroles, and was recently monitored for micro-earthquake swarms.",
    monitoredBy: "Addis Ababa University (Geophysics)",
    updatedAt: new Date().toISOString()
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
    description: "Active geothermal field between Lake Ziway and Lake Langano. Shows ongoing inflation/deflation and intense geothermal boiling.",
    monitoredBy: "Alutu Geothermal Energy Project / DRMC",
    updatedAt: new Date().toISOString()
  },
  {
    id: "v6",
    name: "Kone (Gariboldi)",
    region: "Rift Valley (Metehara)",
    elevation: 1619,
    coordinates: [8.80, 39.69],
    type: "Caldera Complex",
    activityType: "Dormant / Steaming Fumaroles",
    severity: "Green",
    lastErupted: "1820",
    description: "Fissure alignments, lava tubes, and cinder cones near Fentale. Contains beautiful nested ring calderas.",
    monitoredBy: "Ethiopian Geological Survey",
    updatedAt: new Date().toISOString()
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
    description: "Dominates the NW shore of Lake Abbe. Active steam vents exist on its flanks with historical eruptions of basaltic flows.",
    monitoredBy: "DRMC & Region Afar Authorities",
    updatedAt: new Date().toISOString()
  }
];

export const FALLBACK_EARTHQUAKES: Earthquake[] = [
  {
    id: "us6000tjgf",
    magnitude: 4.6,
    location: "Southern Afar Region (13 km ENE of Metahāra / Awash)",
    coordinates: [8.9506, 40.03],
    depth: 10,
    dateTime: "2026-08-09T17:11:43.006Z",
    severity: "Orange",
    description: "Moderate M 4.6 tectonic earthquake struck the southern part of the Afar Region near Awash and Metehara on August 9, 2026. Felt across the Awash basin, Metehara, and Adama. No significant seismic events have been reported around Semera / Central Afar.",
    isHistorical: false
  },
  {
    id: "eq_hist_1",
    magnitude: 6.3,
    location: "Dobi Graben, Afar Region",
    coordinates: [11.80, 40.80],
    depth: 15,
    dateTime: "1989-08-20T11:15:32.000Z",
    severity: "Red",
    description: "The Dobi Graben earthquake swarm. Severely damaged the regional highway bridges connecting Addis Ababa to Assab port. Caused multiple landslides.",
    isHistorical: true
  },
  {
    id: "eq_hist_2",
    magnitude: 6.2,
    location: "Serdo Town, Afar Region",
    coordinates: [11.90, 41.30],
    depth: 10,
    dateTime: "1969-03-29T07:23:11.000Z",
    severity: "Red",
    description: "Completely destroyed the historical town of Serdo, resulting in casualties and widespread ground deformation fissures.",
    isHistorical: true
  },
  {
    id: "eq_hist_3",
    magnitude: 5.6,
    location: "Dabbahu Fissure, Afar",
    coordinates: [12.60, 40.50],
    depth: 5,
    dateTime: "2005-09-24T18:32:00.000Z",
    severity: "Orange",
    description: "Directly triggered by dyke intrusion, this seismic event marked the start of the massive 60km rifting fissure opening near Dabbahu.",
    isHistorical: true
  },
  {
    id: "eq_hist_4",
    magnitude: 4.9,
    location: "Fentale-Awash Swarm",
    coordinates: [8.97, 39.93],
    depth: 10,
    dateTime: "2024-10-06T02:11:45.000Z",
    severity: "Yellow",
    description: "Part of a massive tectonic tremor swarm that was strongly felt in Addis Ababa, inducing fear. Cracked several buildings in Metehara and Wanji.",
    isHistorical: true
  },
  {
    id: "eq_hist_5",
    magnitude: 4.8,
    location: "Wondo Genet, Rift Valley",
    coordinates: [7.10, 38.60],
    depth: 12,
    dateTime: "2016-11-20T14:45:00.000Z",
    severity: "Yellow",
    description: "Shallow earthquake in the central rift. Caused shaking in Awassa and minor structural damage in local institutions.",
    isHistorical: true
  }
];

export const FALLBACK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log_fallback_1",
    action: "create",
    volcanoId: "v1",
    volcanoName: "Erta Ale",
    performedBy: "Kalkidan Getachew",
    performedByEmail: "kalgetachew764@gmail.com",
    performedByRole: "official",
    details: "Initialized local geohazard offline cache database.",
    timestamp: new Date().toISOString()
  }
];

export const FALLBACK_DISMISSED_ALERTS: DismissedAlert[] = [
  {
    id: "dismissed_vol_dallol_1",
    title: "RESOLVED: Hydrothermal Outgassing Anomaly at Dallol",
    type: "volcanic",
    severity: "Orange",
    location: "Dallol Hydrothermal Field, Afar",
    description: "Geothermal brine temperature spiked above 108°C. Acidic gas vapor plume temporarily restricted tourist access.",
    dateTime: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    dismissedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    dismissedBy: "Dr. Aster Berhane (ESSGI Senior Geochemist)",
    actionTaken: "Field sampling confirmed SO₂ returned to baseline (1.2 ppm). Exclusion zone downgraded.",
    resolutionNotes: "Local tour guides notified; brine pools re-opened with mandatory gas mask protocols."
  },
  {
    id: "dismissed_eq_dobi_2",
    title: "CLEARED: M 4.8 Seismic Swarm in Dobi Graben",
    type: "seismic",
    severity: "Red",
    location: "Dobi Graben, Afar Rift Corridor",
    description: "Series of 14 shallow micro-earthquakes over 3 hours. Potential fault rupture evaluated along Assab highway.",
    dateTime: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(), // 42 hours ago
    dismissedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    dismissedBy: "Semera Disaster Response Taskforce",
    actionTaken: "Bridge structural inspection completed along Awash-Assab corridor. No structural failure detected.",
    resolutionNotes: "Seismic decay curve normalized. Speed restrictions on bridges lifted."
  },
  {
    id: "dismissed_vol_fentale_3",
    title: "DISMISSED: False Thermal Anomaly near Fentale Caldera",
    type: "volcanic",
    severity: "Yellow",
    location: "Fentale Volcano, Main Ethiopian Rift",
    description: "Satellite thermal infrared band flagged 380K thermal hot spot on eastern flank.",
    dateTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    dismissedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    dismissedBy: "EOC Remote Sensing Duty Officer",
    actionTaken: "Cross-verified with Sentinel-2 optical imagery and local park rangers.",
    resolutionNotes: "Hotspot determined to be controlled agricultural brush burning outside caldera rim."
  }
];
