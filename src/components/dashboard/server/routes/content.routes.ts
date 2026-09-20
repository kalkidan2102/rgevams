import { Router } from "express";
import { listSectors, listNews, listAnnouncements, getSystemHealth } from "../controllers/content.controller";

const router = Router();

router.get("/sectors", listSectors);
router.get("/news", listNews);
router.get("/announcements", listAnnouncements);
router.get("/health", getSystemHealth);

export default router;
