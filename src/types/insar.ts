export interface InSARBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface InSARTrackFrame {
  frameId: string;
  orbitDirection: "Ascending" | "Descending";
  trackNumber: number;
  swath: string;
  headingDeg: number; // e.g. 348.5° (Asc) or 192.3° (Desc)
  lookAngleDeg: number; // e.g. 39.2°
  incidenceAngleDeg: number; // e.g. 39.2°
  dispMin: number;
  dispMax: number;
  peakVelocity: number; // mm/yr
}

export interface InSAREventMarker {
  date: string; // "2017-01-21"
  year: number; // 2017.06
  title: string; // "2017 Erta Ale Flank Eruption"
  description: string;
  category: "volcanic" | "seismic" | "hydrothermal" | "instrumental";
}

export interface InSARPointTimeSeries {
  latitude: number;
  longitude: number;
  displacement: number | null; // current cumulative displacement in mm
  velocity: number | null; // mean velocity in mm/yr
  velocityError: number; // ± 1-sigma uncertainty in mm/yr
  r2Fit: number; // linear trend correlation coefficient
  rmsMisfit: number; // root mean square misfit in mm
  dates: string[]; // e.g. ["2014-10-15", "2014-10-27", ...]
  decimalYears: number[]; // e.g. [2014.79, 2014.82, ...]
  displacementTimeSeries: (number | null)[]; // array of displacement values in mm (active track)
  ascendingTimeSeries?: (number | null)[]; // Ascending orbit LOS displacement (mm)
  descendingTimeSeries?: (number | null)[]; // Descending orbit LOS displacement (mm)
  rawDisplacementTimeSeries?: (number | null)[]; // unfiltered values
  verticalTimeSeries?: (number | null)[]; // 2.5D decomposed vertical uplift (mm)
  eastWestTimeSeries?: (number | null)[]; // 2.5D decomposed horizontal motion (mm)
  ascendingVelocity?: number; // mm/yr
  descendingVelocity?: number; // mm/yr
  verticalVelocity?: number; // mm/yr
  eastWestVelocity?: number; // mm/yr
  ascendingTrackNumber?: number;
  descendingTrackNumber?: number;
  ascendingFrameId?: string;
  descendingFrameId?: string;
  errorBars?: number[]; // ± 1-sigma uncertainty per epoch in mm
  coherence?: number[]; // co-registration coherence values [0..1]
  satellites?: ("Sentinel-1A" | "Sentinel-1B" | "Sentinel-1C")[];
  gaps?: {
    startDate: string;
    endDate: string;
    startYear: number;
    endYear: number;
    reason: string;
  }[];
  eventMarkers?: InSAREventMarker[];
}

export interface InSARRasterMap {
  volcanoId: string;
  volcanoName: string;
  region: string;
  frameId: string;
  trackNumber: number;
  orbitDirection: "Ascending" | "Descending";
  bounds: InSARBoundingBox;
  width: number;
  height: number;
  values: (number | null)[]; // flattened row-major array of displacement (mm) or velocity (mm/yr) values; null indicates no-data
  velocityValues: (number | null)[]; // mean velocity (mm/yr)
  coherenceValues: number[]; // coherence grid [0..1]
  demValues: number[]; // elevation in meters
  noDataValue: null;
  unit: "mm" | "mm/yr";
  pixelSizeStr: string; // e.g. "100m × 100m (Multi-looked LiCSAR)"
  dispMin: number;
  dispMax: number;
  velMin: number;
  velMax: number;
  observationStart: string; // "2014-10-15"
  observationEnd: string; // "2026-05-20"
  referencePoint: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  hotspotPoint: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

export interface TransectPoint {
  distanceKm: number;
  latitude: number;
  longitude: number;
  displacement: number | null;
  velocity: number | null;
  elevation: number;
}

export interface VolcanoTarget {
  id: string;
  name: string;
  amharicName?: string;
  region: string;
  category: "Active Caldera" | "Rifting Segment / Dike" | "Stratovolcano" | "Hydrothermal Field" | "Pumice Complex" | "Stable Reference";
  frameId: string;
  tracks: InSARTrackFrame[];
  latitude: number;
  longitude: number;
  elevation: number;
  peakVelocity: number; // mm/yr
  status: "CRITICAL ALERT" | "ELEVATED ANOMALY" | "MODERATE RISK" | "STABLE REFERENCE";
  hazardType: string;
  description: string;
  geologySummary: string;
  pixelSizeStr: string;
  dispMin: number;
  dispMax: number;
  velMin: number;
  velMax: number;
  bounds: InSARBoundingBox;
  referencePoint: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  hotspotPoint: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  gaps?: {
    startDate: string;
    endDate: string;
    startYear: number;
    endYear: number;
    reason: string;
  }[];
  eventMarkers?: InSAREventMarker[];
  mogiDepthKm?: number;
}

export type InSARFilterMode = "unfiltered" | "filtered";
export type InSARViewLayer = "velocity" | "cumulative" | "coherence" | "dem" | "wrapped_fringes";
export type InSARDecompMode = "los" | "vertical" | "east_west";
export type InSARColormap = "comet_jet" | "turbo" | "diverging" | "spectral";
