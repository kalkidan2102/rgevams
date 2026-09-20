import { Router } from "express";
import { listEarthquakes, triggerEarthquakeAlert } from "../controllers/earthquake.controller.ts";

const router = Router();

router.get("/earthquakes", listEarthquakes);
router.post("/trigger-earthquake-alert", triggerEarthquakeAlert);

export default router;
