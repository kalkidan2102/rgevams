export interface IVolcano {
  id: string;
  name: string;
  region: string;
  elevation: number;
  coordinates: [number, number]; // [lat, lng]
  type: string;
  activityType: string;
  severity: "Red" | "Orange" | "Yellow" | "Green" | string;
  lastErupted: string;
  description: string;
  monitoredBy: string;
  updatedAt: string;
}

export const defaultVolcanoes: IVolcano[] = [
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

