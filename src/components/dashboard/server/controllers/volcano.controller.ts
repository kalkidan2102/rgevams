import { Request, Response } from "express";
import {
  getPostgresVolcanoes,
  upsertPostgresVolcano,
  deletePostgresVolcano,
  savePostgresAuditLog,
} from "../Services/postgres.services";
import { IVolcano } from "../models/Volcano";
import { AuthenticatedRequest } from "../middleware/auth";
import { hashPassword, verifyPassword, sanitizeUser } from "../utils/crypto";
export async function listVolcanoes(req: Request, res: Response) {
  try {
    const list = await getPostgresVolcanoes();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve volcanoes from database.", details: error.message });
  }
}

export async function upsertVolcano(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, region, elevation, coordinates, type, activityType, severity, description, monitoredBy, lastErupted } = req.body;
    if (!name || !coordinates || coordinates.length !== 2) {
      return res.status(400).json({ error: "Missing required fields (name, coordinates [lat, lng])" });
    }

    const list: IVolcano[] = await getPostgresVolcanoes();
    const existingIndex = list.findIndex((v: IVolcano) => v.name.toLowerCase() === name.toLowerCase());

    const updatedVolcano: IVolcano = {
      id: existingIndex !== -1 ? list[existingIndex].id : "v_" + Date.now(),
      name,
      region: region || "Unspecified Ethiopia",
      elevation: Number(elevation) || 0,
      coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      type: type || "Volcanic Center",
      activityType: activityType || "Fumarolic Activity",
      severity: severity || "Green",
      lastErupted: lastErupted || "Unknown",
      description: description || "No detailed observation logged yet.",
      monitoredBy: monitoredBy || "Central Disaster Agency",
      updatedAt: new Date().toISOString()
    };

    const saved = await upsertPostgresVolcano(updatedVolcano);
    if (!saved) {
      return res.status(500).json({ error: "Failed to save volcano record to PostgreSQL database." });
    }

    // Use verified server-side identity
    const performer = req.userName || "ESSGI Geohazard Officer";
    const performerEmail = req.userEmail || "officer@essgi.gov.et";
    const performerRole = req.userRole || "official";
    const action = existingIndex !== -1 ? "edit" : "create";
    
    const detailText = action === "create"
      ? `Created new volcanic center: "${name}" in ${region || "Unspecified Ethiopia"} (Elevation: ${elevation || 0}m, Severity: ${severity || "Green"}).`
      : `Updated existing volcanic center attributes for "${name}" (Region: ${region || "Unspecified Ethiopia"}, Severity Level: ${severity || "Green"}).`;

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action,
      volcanoId: updatedVolcano.id,
      volcanoName: updatedVolcano.name,
      performedBy: String(performer),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: detailText,
      timestamp: new Date().toISOString()
    });

    res.json({ message: "Volcano entry recorded successfully", data: updatedVolcano });
  } catch (error: any) {
    res.status(500).json({ error: "Server error updating volcano", details: error.message });
  }
}

export async function deleteVolcano(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const list: IVolcano[] = await getPostgresVolcanoes();
    const volcanoToDelete = list.find((v: IVolcano) => v.id === id);

    if (!volcanoToDelete) {
      return res.status(404).json({ error: "Volcano not found" });
    }

    const volcanoName = volcanoToDelete.name;
    const deleted = await deletePostgresVolcano(id);
    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete volcano from database." });
    }

    // Use verified server-side identity
    const performer = req.userName || "ESSGI Geohazard Officer";
    const performerEmail = req.userEmail || "officer@essgi.gov.et";
    const performerRole = req.userRole || "official";

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "delete",
      volcanoId: id,
      volcanoName: volcanoName,
      performedBy: String(performer),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Deleted volcanic center: "${volcanoName}" (ID: ${id}) from catalog.`,
      timestamp: new Date().toISOString()
    });

    res.json({ message: "Volcano deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Server error deleting volcano", details: error.message });
  }
}
