import { Earthquake, GnssStation } from "../types";

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
