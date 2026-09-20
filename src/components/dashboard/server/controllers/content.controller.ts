import { Request, Response } from "express";
import { getPostgresSectors, getPostgresNews, getPostgresAnnouncements } from "../Services/postgres.services";
import { getDatabaseStatus } from "../Config/database.ts";
import { ENV } from "../Config/env";

export async function listSectors(req: Request, res: Response) {
  try {
    const sectors = await getPostgresSectors();
    res.json({ success: true, count: sectors.length, sectors });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve sectors from database", details: error.message });
  }
}

export async function listNews(req: Request, res: Response) {
  try {
    const news = await getPostgresNews();
    res.json({ success: true, count: news.length, news });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve news from database", details: error.message });
  }
}

export async function listAnnouncements(req: Request, res: Response) {
  try {
    const announcements = await getPostgresAnnouncements();
    res.json({ success: true, count: announcements.length, announcements });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve announcements from database", details: error.message });
  }
}

export async function getSystemHealth(req: Request, res: Response) {
  res.json({
    status: "ok",
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    model: ENV.GEMINI_MODEL,
    database: getDatabaseStatus()
  });
}

