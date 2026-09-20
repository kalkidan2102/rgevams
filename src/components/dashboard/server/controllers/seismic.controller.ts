import { Request, Response } from "express";
import { getFuriWaveform, augustEvents } from "../Services/seismic.service";

export async function getFuriWaveformController(req: Request, res: Response) {
  try {
    const { time, component, magnitude, depth } = req.query;
    const eventTime = String(time || new Date().toISOString());
    const comp = String(component || "Z");
    const mag = parseFloat(String(magnitude || "4.5"));
    const dep = parseFloat(String(depth || "10"));

    const result = await getFuriWaveform(eventTime, comp, mag, dep);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to generate waveform telemetry" });
  }
}

export async function getAugustEventsController(req: Request, res: Response) {
  res.json({
    success: true,
    totalCount: augustEvents.length,
    description: "Curated catalog of significant August seismic and volcanic events recorded by the IU.FURI Mount Furi Broadband Seismological Observatory and USGS feeds across the Main Ethiopian Rift and Afar Depression.",
    events: augustEvents
  });
}
