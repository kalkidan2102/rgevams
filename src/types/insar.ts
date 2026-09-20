export type InSARFilterMode = "filtered" | "unfiltered";
export type InSARViewLayer = "cumulative" | "velocity" | "coherence" | "dem";
export type InSARColormap = "comet_jet" | "spectral" | "turbo" | "diverging";

export interface InSARBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface InSARPoint {
  latitude: number;
  longitude: number;
  name: string;
}

export interface InSARTrackFrame {
  frameId: string;
  orbitDirection: "Ascending" | "Descending";
  trackNumber: number;
  swath: string;
  headingDeg: number;
  lookAngleDeg: number;
  incidenceAngleDeg: number;
  dispMin: number;
  dispMax: number;
  peakVelocity: number;
}

export interface InSARGap {
  startDate: string;
  endDate: string;
  startYear: number;
  endYear: number;
  reason: string;
}

export interface InSAREventMarker {
  date: string;
  year: number;
  title: string;
  description: string;
  category: "hydrothermal" | "seismic" | "volcanic" | "tectonic";
}

export interface VolcanoTarget {
  id: string;
  name: string;
  amharicName: string;
  region: string;
  category: string;
  frameId: string;
  tracks: InSARTrackFrame[];
  latitude: number;
  longitude: number;
  elevation: number;
  peakVelocity: number;
  velMin: number;
  velMax: number;
  status: string;
  hazardType: string;
  description: string;
  geologySummary: string;
  pixelSizeStr: string;
  dispMin: number;
  dispMax: number;
  bounds: InSARBoundingBox;
  referencePoint: InSARPoint;
  hotspotPoint: InSARPoint;
  gaps?: InSARGap[];
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
  values: (number | null)[];
  velocityValues: (number | null)[];
  coherenceValues: number[];
  demValues: number[];
  noDataValue: number | null;
  unit: string;
  pixelSizeStr: string;
  dispMin: number;
  dispMax: number;
  velMin: number;
  velMax: number;
  observationStart: string;
  observationEnd: string;
  referencePoint: InSARPoint;
  hotspotPoint: InSARPoint;
}

export interface TransectPoint {
  distanceKm: number;
  latitude: number;
  longitude: number;
  displacement: number | null;
  velocity: number | null;
  elevation: number;
}

export interface InSARPointTimeSeries {
  latitude: number;
  longitude: number;
  displacement: number | null;
  velocity: number;
  velocityError: number;
  r2Fit: number;
  rmsMisfit: number;
  dates: string[];
  decimalYears: number[];
  displacementTimeSeries: (number | null)[];
  rawDisplacementTimeSeries: (number | null)[];
  verticalTimeSeries: (number | null)[];
  eastWestTimeSeries: (number | null)[];
  errorBars: number[];
  coherence: number[];
  satellites: ("Sentinel-1A" | "Sentinel-1B" | "Sentinel-1C")[];
  gaps?: InSARGap[];
  eventMarkers?: InSAREventMarker[];
}
