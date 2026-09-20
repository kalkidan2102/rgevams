import { Volcano } from "../types";

export interface ActiveGeologicalZone {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  description: string;
  riskScore: number; // 1-10
  volcanicVulnerability: "High" | "Extremely High" | "Moderate";
  seismicVulnerability: "High" | "Extremely High" | "Moderate";
  historicalEvents: string;
  geologicalContext: string;
  majorVents: string[];
}

export const ETHIOPIA_ACTIVE_ZONES: ActiveGeologicalZone[] = [
  {
    id: "afar_depression",
    name: "Afar Depression & Triple Junction",
    coordinates: [11.75, 41.50],
    description: "The tectonic meeting point of three separating plates (Arabian, Nubian, and Somalian). Known for extreme geothermal temperature venting, deep dyke fissures, and continuous micro-seismic swarm activity.",
    riskScore: 10,
    volcanicVulnerability: "Extremely High",
    seismicVulnerability: "Extremely High",
    historicalEvents: "2005 Dabbahu Fissure eruption, continuous basaltic effusion at Erta Ale, and Gewane seismic swarms.",
    geologicalContext: "Divergent margin crustal thinning. Magmatic-tectonic rifting events where continental crust is splitting apart to form a new ocean basin.",
    majorVents: ["Erta Ale", "Dabbahu", "Dallol Geothermal Field", "Alayta"]
  },
  {
    id: "main_ethiopian_rift",
    name: "Main Ethiopian Rift (Nazret-Dera Corridor)",
    coordinates: [8.55, 39.27],
    description: "Segments stretching from the Afar depression through the lakes region. Characterized by high density of Quaternary calderas, structural normal faults, and extensive ignimbrite fields.",
    riskScore: 8,
    volcanicVulnerability: "High",
    seismicVulnerability: "High",
    historicalEvents: "1906 Rift Valley magnitude 6.2 quake, 1961 Kara Kore seismic swarms, and repeated historic ash-venting at Fantale.",
    geologicalContext: "Inter-plate transitional boundary cutting right through central Ethiopia, causing widespread crustal fracturing and subsidence.",
    majorVents: ["Fantale", "Kone Caldera", "Adama Gariboldi", "Tullu Moje"]
  },
  {
    id: "dallol_danakil",
    name: "Danakil Depression / Salt Block",
    coordinates: [14.24, 40.30],
    description: "One of the absolute lowest and hottest places on Earth, sitting more than 120 meters below sea level. Marked by explosive phreatic craters, potash chimneys, and active salt diapirism.",
    riskScore: 9,
    volcanicVulnerability: "Extremely High",
    seismicVulnerability: "High",
    historicalEvents: "1926 Dallol phreatic eruption forming the neon acid pools, frequent shallow magma intrusions.",
    geologicalContext: "Sub-sea level rift margin characterized by highly concentrated hydrothermal fluids and extensive salt tectonics directly above shallow magma.",
    majorVents: ["Dallol Vent", "Alu-Pasat Fissure", "Gada Ale"]
  },
  {
    id: "corbetti_lake_lakes",
    name: "Awassa - Corbetti Caldera Corridor",
    coordinates: [7.10, 38.45],
    description: "Southern segment of the Main Ethiopian Rift. Highly active silicon-rich caldera complexes surrounding heavy human settlements like Awassa. Substantial ground deformation tracked via satellite.",
    riskScore: 7,
    volcanicVulnerability: "High",
    seismicVulnerability: "Moderate",
    historicalEvents: "Plinian eruptions during the Holocene; current massive steam and fumarolic activity with progressive geodetic inflation.",
    geologicalContext: "Continental rift segment with high magmatic fluid pressure, creating high explosive potential beneath heavy agricultural and population zones.",
    majorVents: ["Corbetti", "Aluto-Langano", "Chabi Volcano"]
  }
];

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
