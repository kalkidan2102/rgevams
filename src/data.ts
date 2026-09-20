import { GnssStation } from "./types";

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

export const ETHIOPIA_GNSS_STATIONS: GnssStation[] = [
  {
    id: "gnss_adis",
    name: "ADIS Geodetic Station",
    location: "Addis Ababa Observatory (Entoto Hill)",
    coordinates: [9.035, 38.767],
    velocityNorth: 18.5,
    velocityEast: 32.2,
    velocityUp: 1.5,
    monitoredBy: "ESSGI Geodesy Command",
    description: "The primary geodetic reference station for Ethiopia. Serves as the national reference frame origin and is a key node in the International GNSS Service (IGS) global tracking network. Captures stable Nubian plate baseline velocity vectors."
  },
  {
    id: "gnss_seme",
    name: "SEME Rift Station",
    location: "Semera University, Afar",
    coordinates: [11.792, 41.005],
    velocityNorth: 22.8,
    velocityEast: 42.1,
    velocityUp: -4.5,
    monitoredBy: "ESSGI Afar Monitoring Division",
    description: "Strategically located in the hyper-active Afar Triple Junction. Measures intense crustal rifting, graben widening, and active plate divergence between the Nubian, Somalian, and Arabian plates. Demonstrates extremely high horizontal strain and localized rift floor subsidence (-4.5 mm/year)."
  },
  {
    id: "gnss_ante",
    name: "ANTE Southern Rift Station",
    location: "Arba Minch University",
    coordinates: [6.028, 37.562],
    velocityNorth: 16.2,
    velocityEast: 28.5,
    velocityUp: 0.8,
    monitoredBy: "Southern Rift Geodetic Team",
    description: "Positioned in the southern sector of the Main Ethiopian Rift. Monitors the extension rate across the bilateral Chamo-Abaya graben system. Essential for modeling plate boundary translation towards the Kenyan rift system."
  },
  {
    id: "gnss_bard",
    name: "BARD Plateau Station",
    location: "Bahir Dar University (Lake Tana)",
    coordinates: [11.595, 37.388],
    velocityNorth: 14.3,
    velocityEast: 29.1,
    velocityUp: 1.2,
    monitoredBy: "Lake Tana Basin Authority",
    description: "Located on the stable northwestern Ethiopian plateau, west of the rift. Serves as a primary tectonic baseline station, allowing geophysicists to differentiate true continental rift strain from regional plateau motion."
  },
  {
    id: "gnss_gond",
    name: "GOND Plateau Station",
    location: "Gondar University Campus",
    coordinates: [12.602, 37.458],
    velocityNorth: 13.9,
    velocityEast: 28.8,
    velocityUp: 1.0,
    monitoredBy: "Plateau Geodetic Team",
    description: "Plateau reference station situated in the Simien highland block. Tracks long-term vertical stability and potential hotspot-induced mantle plume swelling beneath the volcanic flood basalt fields."
  },
  {
    id: "gnss_hara",
    name: "HARA Somali Plate Station",
    location: "Harar, Eastern Escarpment",
    coordinates: [9.314, 42.118],
    velocityNorth: 19.8,
    velocityEast: 36.5,
    velocityUp: -1.1,
    monitoredBy: "East Somali Plate division",
    description: "Positioned on the Somalian plate side of the eastern rift escarpment. Key for measuring the independent tectonic motion of the Somalian micro-plate relative to the main African continent."
  },
  {
    id: "gnss_meke",
    name: "MEKE Tigray Station",
    location: "Mekelle University Campus",
    coordinates: [13.496, 39.471],
    velocityNorth: 15.1,
    velocityEast: 30.2,
    velocityUp: 1.4,
    monitoredBy: "Northern Ethiopia Geodetic Team",
    description: "Northern plateau station tracking deep structural shifts and regional strain rates adjacent to the northwestern escarpment."
  },
  {
    id: "gnss_hawa",
    name: "HAWA Central Rift Station",
    location: "Hawassa Lake Basin",
    coordinates: [7.049, 38.485],
    velocityNorth: 17.3,
    velocityEast: 33.4,
    velocityUp: -2.1,
    monitoredBy: "Central Rift Geodetic Group",
    description: "Main Ethiopian Rift station located in the Hawassa caldera basin. Measures active crustal stretching and subsidence associated with shallow geothermal fluids and active faults."
  },
  {
    id: "gnss_jimm",
    name: "JIMM Western Plateau Station",
    location: "Jimma University Campus",
    coordinates: [7.674, 36.834],
    velocityNorth: 14.8,
    velocityEast: 27.9,
    velocityUp: 0.9,
    monitoredBy: "Southwestern Geodesy Unit",
    description: "Monitors plate movement on the southwestern volcanic highlands. Serves as a stable intra-plate reference to contrast against active rift expansion velocities."
  },
  {
    id: "gnss_dess",
    name: "DESS Western Escarpment Station",
    location: "Dessie Highlands",
    coordinates: [11.134, 39.638],
    velocityNorth: 16.9,
    velocityEast: 34.8,
    velocityUp: 1.1,
    monitoredBy: "Rift Margin Surveillance Team",
    description: "Located on the high-altitude western escarpment margin. Crucial for calculating seismic shear strain rates across the master border fault system."
  },
  {
    id: "gnss_dire",
    name: "DIRE Eastern Escarpment Station",
    location: "Dire Dawa Hillside",
    coordinates: [9.593, 41.862],
    velocityNorth: 20.4,
    velocityEast: 38.1,
    velocityUp: -1.5,
    monitoredBy: "Somalian Margin Division",
    description: "Tracks relative movement across the eastern boundary faults of the Ethiopian rift where the plateau slopes into the southern Afar desert floor."
  },
  {
    id: "gnss_awas",
    name: "AWAS Middle Rift Station",
    location: "Awash National Park",
    coordinates: [8.989, 40.165],
    velocityNorth: 21.6,
    velocityEast: 39.8,
    velocityUp: -3.2,
    monitoredBy: "Middle Rift Geodetic Network",
    description: "Captures rapid tectonic widening and active magma intrusion in the Fantale volcano zone. Shows prominent crustal extension and localized graben subsidence."
  },
  {
    id: "gnss_jigj",
    name: "JIGJ Somali Plate Station",
    location: "Jigjiga University",
    coordinates: [9.351, 42.802],
    velocityNorth: 19.5,
    velocityEast: 36.1,
    velocityUp: -0.8,
    monitoredBy: "Far-East Geodetic Unit",
    description: "Deep Somalian plate station tracking regional plate rotational kinematics and passive margin crustal stability."
  },
  {
    id: "gnss_asos",
    name: "ASOS Western Border Station",
    location: "Asosa University",
    coordinates: [10.065, 34.531],
    velocityNorth: 12.1,
    velocityEast: 26.5,
    velocityUp: 0.5,
    monitoredBy: "Western Plateau Geodetic Group",
    description: "Located on ancient Precambrian basement rocks of western Ethiopia. Serves as a key reference node on the stable African craton core."
  },
  {
    id: "gnss_gamb",
    name: "GAMB Baro River Station",
    location: "Gambela Lowlands",
    coordinates: [8.249, 34.588],
    velocityNorth: 11.4,
    velocityEast: 25.8,
    velocityUp: 0.3,
    monitoredBy: "Western Border Network",
    description: "Farthest western station in the low-lying Baro river basin, providing stable basement velocity constraints on the Nubian plate."
  },
  {
    id: "gnss_shas",
    name: "SHAS Shala Basin Station",
    location: "Shashemene Junction",
    coordinates: [7.199, 38.599],
    velocityNorth: 17.5,
    velocityEast: 33.9,
    velocityUp: -1.9,
    monitoredBy: "Central Rift Geodetic Group",
    description: "Tracks active fault expansion and localized subsidence between the high silica volcanic centers of Shala and Aluto-Langano."
  },
  {
    id: "gnss_lali",
    name: "LALI Wollo Highlands Station",
    location: "Lalibela Escarpment",
    coordinates: [12.031, 39.041],
    velocityNorth: 14.9,
    velocityEast: 30.5,
    velocityUp: 1.3,
    monitoredBy: "Northern Ethiopia Geodetic Team",
    description: "Tracks uplift dynamics and thermal swelling of the crust in the rugged mountainous terrain of Wollo province."
  },
  {
    id: "gnss_adam",
    name: "ADAM Adama Rift Station",
    location: "Adama Science & Tech University",
    coordinates: [8.541, 39.268],
    velocityNorth: 19.1,
    velocityEast: 35.4,
    velocityUp: -2.8,
    monitoredBy: "Central Rift Geodetic Group",
    description: "Tracks tectonic strain accumulation and fault-creep across the dense Adama-Koka pull-apart basin."
  },
  {
    id: "gnss_sodo",
    name: "SODO Wolaita Station",
    location: "Sodo University Campus",
    coordinates: [6.862, 37.761],
    velocityNorth: 15.8,
    velocityEast: 28.1,
    velocityUp: 0.4,
    monitoredBy: "Southern Rift Geodetic Team",
    description: "Tracks bilateral rift border translation and transition zones towards the southwestern rift block."
  },
  {
    id: "gnss_neke",
    name: "NEKE Western Highlands Station",
    location: "Nekemte Highlands",
    coordinates: [9.081, 36.541],
    velocityNorth: 13.4,
    velocityEast: 27.0,
    velocityUp: 0.7,
    monitoredBy: "Southwestern Geodesy Unit",
    description: "Monitors the western rift flank transition, tracing tectonic strain decay away from active central rift segment axes."
  }
];
