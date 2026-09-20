import { Request, Response } from "express";
import { 
  getPostgresVolcanoes, 
  getPostgresEarthquakes, 
  getPostgresAlertDispatches 
} from "../Services/postgres.services";

export async function exportVolcanoesCsv(req: Request, res: Response) {
  try {
    const volcanoes = await getPostgresVolcanoes();
    const headers = ["ID", "Name", "Region", "Elevation(m)", "Latitude", "Longitude", "Type", "ActivityType", "Severity", "LastErupted", "MonitoredBy", "UpdatedAt"];
    const rows = volcanoes.map((v) => [
      `"${v.id}"`,
      `"${(v.name || "").replace(/"/g, '""')}"`,
      `"${(v.region || "").replace(/"/g, '""')}"`,
      v.elevation,
      v.coordinates?.[0] || "",
      v.coordinates?.[1] || "",
      `"${(v.type || "").replace(/"/g, '""')}"`,
      `"${(v.activityType || "").replace(/"/g, '""')}"`,
      `"${v.severity}"`,
      `"${(v.lastErupted || "").replace(/"/g, '""')}"`,
      `"${(v.monitoredBy || "").replace(/"/g, '""')}"`,
      `"${v.updatedAt || ""}"`
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="ESSGI_Volcanoes_Catalog.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export volcanoes CSV from database", details: error.message });
  }
}

export async function exportEarthquakesCsv(req: Request, res: Response) {
  try {
    const earthquakes = await getPostgresEarthquakes();
    const headers = ["ID", "Magnitude", "Location", "Latitude", "Longitude", "Depth(km)", "DateTime", "Severity", "IsHistorical", "Description"];
    const rows = earthquakes.map((e) => [
      `"${e.id}"`,
      e.magnitude,
      `"${(e.location || "").replace(/"/g, '""')}"`,
      e.coordinates?.[0] || "",
      e.coordinates?.[1] || "",
      e.depth,
      `"${e.dateTime}"`,
      `"${e.severity}"`,
      e.isHistorical ? "TRUE" : "FALSE",
      `"${(e.description || "").replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="ESSGI_Earthquakes_Catalog.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export earthquakes CSV from database", details: error.message });
  }
}

export async function exportDispatchesCsv(req: Request, res: Response) {
  try {
    const dispatches = await getPostgresAlertDispatches();
    const headers = ["ID", "Type", "EventTitle", "Magnitude", "Depth(km)", "Location", "Severity", "RecipientsCount", "Status", "Timestamp", "Details"];
    const rows = dispatches.map((d) => [
      `"${d.id}"`,
      `"${d.type}"`,
      `"${(d.eventTitle || "").replace(/"/g, '""')}"`,
      d.magnitude,
      d.depth,
      `"${(d.location || "").replace(/"/g, '""')}"`,
      `"${d.severity}"`,
      d.recipientsCount,
      `"${d.status}"`,
      `"${d.timestamp}"`,
      `"${(d.details || "").replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="ESSGI_Alert_Dispatches.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export alert dispatches CSV from database", details: error.message });
  }
}

