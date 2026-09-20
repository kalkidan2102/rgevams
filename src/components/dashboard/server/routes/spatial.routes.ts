import { Router, Request, Response } from "express";
import { PostgisService } from "../Services/postgis.service";
import { db } from "../../../../db/index";
import { gnssStations } from "../../../../db/Schema";
import { isPostgresConnected } from "../Config/database";
import { ETHIOPIA_GNSS_STATIONS } from "../../../../data/earthquakes";

const router = Router();

// PostGIS Proximity Search: Find earthquakes within radius of coordinates
router.get("/spatial/earthquakes-radius", async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radiusKm as string) || 50;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid latitude or longitude parameters." });
    }

    const results = await PostgisService.getEarthquakesWithinRadius(lat, lng, radiusKm);
    res.json({
      center: { lat, lng },
      radiusKm,
      count: results.length,
      earthquakes: results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to execute spatial proximity search." });
  }
});

// PostGIS Volcano Vulnerability & Hazard Buffer Zone calculation
router.get("/spatial/volcano-hazard-zone/:volcanoId", async (req: Request, res: Response) => {
  try {
    const { volcanoId } = req.params;
    const infrastructureAtRisk = await PostgisService.getInfrastructureInVolcanoHazardZone(volcanoId);
    res.json({
      volcanoId,
      infrastructureCount: infrastructureAtRisk.length,
      infrastructureAtRisk
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to compute hazard zone intersections." });
  }
});

// PostGIS Seismic Swarm DBSCAN Cluster Identification
router.get("/spatial/seismic-clusters", async (req: Request, res: Response) => {
  try {
    const epsKm = parseFloat(req.query.epsKm as string) || 25;
    const minPoints = parseInt(req.query.minPoints as string) || 3;
    const clusters = await PostgisService.getSeismicClusters(epsKm, minPoints);
    res.json({ epsKm, minPoints, clusters });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to perform seismic DBSCAN clustering." });
  }
});

// Direct PostGIS GeoJSON generation
router.get("/spatial/earthquakes.geojson", async (req: Request, res: Response) => {
  try {
    const geojson = await PostgisService.getEarthquakesGeoJson();
    res.json(geojson);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to export PostGIS GeoJSON layer." });
  }
});

// Relational GNSS Geodesy Strain Vectors
router.get("/spatial/gnss-stations", async (req: Request, res: Response) => {
  try {
    if (isPostgresConnected) {
      const stations = await db.select().from(gnssStations);
      if (stations && stations.length > 0) {
        return res.json(stations);
      }
    }
  } catch {
    // Fallback handled smoothly
  }
  res.json(ETHIOPIA_GNSS_STATIONS);
});

export default router;
