import { Router } from "express";
import { getFuriWaveformController, getAugustEventsController } from "../controllers/seismic.controller";

const router = Router();

router.get("/seismic/furi", getFuriWaveformController);
router.get("/seismic/august-events", getAugustEventsController);

export default router;
