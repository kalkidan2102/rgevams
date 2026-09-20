import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireResearcherOrAbove } from "../middleware/roles";
import { exportVolcanoesCsv, exportEarthquakesCsv, exportDispatchesCsv } from "../controllers/report.controller";

const router = Router();

// Researchers, Scientists, Officials, Admins, and SuperAdmins can export raw reports & telemetry
router.get("/export/volcanoes.csv", requireAuth, requireResearcherOrAbove, exportVolcanoesCsv);
router.get("/export/earthquakes.csv", requireAuth, requireResearcherOrAbove, exportEarthquakesCsv);
router.get("/export/dispatches.csv", requireAuth, requireResearcherOrAbove, exportDispatchesCsv);

export default router;

