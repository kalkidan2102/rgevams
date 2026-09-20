import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireOfficialOrAbove } from "../middleware/roles";
import { generateReport, askGeorisk, getAiSummary } from "../controllers/ai.controller";

const router = Router();

// Georisk AI intelligence briefings for Disaster Management Officials, Admins, and SuperAdmins
router.post("/report", requireAuth, requireOfficialOrAbove, generateReport);
router.post("/ask-georisk", requireAuth, requireOfficialOrAbove, askGeorisk);
router.get("/ai-summary", requireAuth, requireOfficialOrAbove, getAiSummary);

export default router;

