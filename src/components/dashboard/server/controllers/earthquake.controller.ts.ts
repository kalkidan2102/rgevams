import { Request, Response } from "express";
import { fetchLiveAndHistoricalEarthquakes } from "../Services/usgs.Service";
import { processEarthquakeAlert } from "../Services/alert.service";

export async function listEarthquakes(req: Request, res: Response) {
  const result = await fetchLiveAndHistoricalEarthquakes();
  res.json(result);
}

export async function triggerEarthquakeAlert(req: Request, res: Response) {
  const { magnitude, location, depth, coordinates } = req.body;
  const mag = parseFloat(magnitude) || 5.2;
  const dep = parseFloat(depth) || 10;
  const loc = location || "Main Ethiopian Rift (Adama-Awash Segment)";
  const coords = Array.isArray(coordinates) && coordinates.length === 2 ? coordinates : [8.98, 39.95];

  const syntheticEvent = {
    id: "eq_live_" + Date.now(),
    magnitude: mag,
    location: loc,
    coordinates: coords,
    depth: dep,
    dateTime: new Date().toISOString(),
    severity: mag >= 5.5 ? "Red" : "Orange",
    description: `Real-time geohazard notification trigger for seismic rupture M ${mag.toFixed(1)} in ${loc}.`
  };

  const dispatchResult = await processEarthquakeAlert(syntheticEvent, "Manual / API Trigger");

  res.json({
    success: true,
    message: `Earthquake event M ${mag.toFixed(1)} processed. ${dispatchResult ? "Automated SMS & Email broadcast dispatched!" : "Event logged under threshold parameters."}`,
    event: syntheticEvent,
    dispatch: dispatchResult
  });
}
