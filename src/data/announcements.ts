export interface AnnouncementItem {
  id: string;
  code: string;
  title: string;
  category: "Conference" | "Grant" | "Tender" | "Workshop" | "Advisory";
  date: string;
  deadline: string;
  organizer: string;
  location: string;
  summary: string;
  fullDetails: string;
  requirements: string[];
  contactEmail: string;
  status: "OPEN" | "URGENT" | "UPCOMING";
  targetTab?: string;
}

export const ANNOUNCEMENTS_DATA: AnnouncementItem[] = [
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
    fullDetails: "ESSGI invites international geophysicists, volcanologists, geodesists, and disaster risk managers to register for the S-ARC2026 Conference. The theme is 'Strengthening Rift Basin Resiliency through Integrated Earth Observation Telemetry'. Keynote sessions will feature multi-hazard early warning systems, InSAR deformation mapping, and community alert protocols across the East African Rift System (EARS).",
    requirements: [
      "Abstract submission deadline: September 15, 2026",
      "Early bird registration discount closes: August 30, 2026",
      "Student fellowship travel grants available for East African researchers",
      "Peer-reviewed proceedings to be published in African Journal of Earth Sciences"
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
    organizer: "ESSGI Directorate of Postgraduate R&D & Ministry of Innovation & Technology",
    location: "4 Kilo Headquarters (Addis Ababa) & Entoto Observatory",
    summary: "Funding opportunity offering up to 2.5 Million ETB for doctoral and post-doctoral researchers studying Afar rift opening, Erta Ale magmatic flux, or seismic hazard mitigation in Ethiopia.",
    fullDetails: "The Ethiopian Space Science & Geodesy Institute announces 12 competitive research grants for post-graduate researchers. Awardees will receive full access to ESSGI broadband seismic station raw wave data, Entoto optical telescope time, high-performance computing clusters, and field expedition logistics in the Afar Depression.",
    requirements: [
      "Principal Investigator must be affiliated with an accredited Ethiopian higher education institution",
      "Research proposal must align with national geohazard safety priorities",
      "Project timeline: 12 to 24 months with bi-annual progress milestones",
      "Full proposal package must include IRB clearance and detailed field risk budget"
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
    summary: "International competitive bid for supplying 14 multi-constellation GNSS reference receivers, solar-powered telemetry enclosures, and broadband 120s seismometers for the Main Ethiopian Rift network.",
    fullDetails: "ESSGI solicits sealed bids from qualified international manufacturers and authorized regional distributors for the supply, delivery, and calibration of 14 continuous GNSS geodetic reference stations and 8 broadband triaxial seismometers. Equipment must withstand extreme ambient heat (up to 50°C in Danakil Depression) and support real-time IP telemetry via cellular/satellite modems.",
    requirements: [
      "Bidder must submit a 2% bid security guarantee from a recognized commercial bank",
      "Compliance with ISO 9001 quality standards and minimum 3-year hardware warranty",
      "Demonstrated experience in installing rugged geodetic sensors in remote volcanic terrains",
      "Pre-bid clarification meeting: August 10, 2026 at ESSGI Main Conference Hall"
    ],
    contactEmail: "tenders@essgi.gov.et",
    status: "URGENT"
  },
  {
    id: "ann-workshop-2026",
    code: "ESSGI-WORK-2026-03",
    title: "Professional Workshop: ObsPy Waveform Inversion & InSAR Subsidence Mapping",
    category: "Workshop",
    date: "July 15, 2026",
    deadline: "August 18, 2026",
    organizer: "ESSGI Seismology Directorate & Furi Observatory",
    location: "Mount Furi Seismological Observatory (FURI), Addis Ababa",
    summary: "5-day hands-on technical training program on open-source Python Obspy, Sentinel-1 SNAP InSAR processing, and focal mechanism calculations for rift geophysicists.",
    fullDetails: "Designed for mid-level geophysicists, remote sensing specialists, and emergency managers across Ethiopia. Participants will learn end-to-end signal processing of continuous seismic streams from the Furi Observatory, baseline interferogram generation for ground deformation, and Gemini AI report synthesis.",
    requirements: [
      "Basic proficiency in Python programming and GIS software",
      "Laptop with minimum 16GB RAM for local SAR processing laboratory sessions",
      "Certificate of Completion issued by ESSGI Directorate of Capacity Building"
    ],
    contactEmail: "trainings@essgi.gov.et",
    status: "UPCOMING"
  }
];
