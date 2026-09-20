import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireOfficialOrAbove } from "../middleware/roles";
import { listVolcanoes, upsertVolcano, deleteVolcano } from "../controllers/volcano.controller";

const router = Router();

// Public: All users (including Guest) can view volcanic activity information
router.get("/volcanoes", listVolcanoes);

// Protected: Disaster Management Officials, Admins, and SuperAdmins can manage volcanic records
router.post("/volcanoes", requireAuth, requireOfficialOrAbove, upsertVolcano);
router.delete("/volcanoes/:id", requireAuth, requireOfficialOrAbove, deleteVolcano);

export default router;

