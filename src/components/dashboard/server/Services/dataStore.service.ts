import fs from "fs";
import path from "path";
import { defaultUsers, IUser } from "../models/User";
import { defaultVolcanoes, IVolcano } from "../models/Volcano";
import { defaultEarthquakes, IEarthquake } from "../models/Earthquake";
import { defaultAlertConfig, defaultAlertDispatches, IAlertConfig, IAlertDispatch } from "../models/Alert";
import { IAuditLog } from "../models/AuditLog";
import { defaultSectors, defaultNews, defaultAnnouncements, ISector, INews, IAnnouncement } from "../models/SectorNews";
import {
  getPostgresUsers,
  upsertPostgresUser,
  getPostgresVolcanoes,
  upsertPostgresVolcano,
  deletePostgresVolcano,
  getPostgresEarthquakes,
  savePostgresEarthquake,
  getPostgresAuditLogs,
  savePostgresAuditLog,
  getPostgresAlertConfig,
  savePostgresAlertConfig,
  getPostgresAlertDispatches,
  savePostgresAlertDispatch,
  getPostgresSectors,
  getPostgresNews,
  getPostgresAnnouncements
} from "./postgres.services";

const DATA_DIR = path.join(process.cwd(), "data");
const VOLCANOES_FILE = path.join(DATA_DIR, "volcanoes.json");
const EARTHQUAKES_FILE = path.join(DATA_DIR, "historical_earthquakes.json");
const AUDIT_LOGS_FILE = path.join(DATA_DIR, "audit_logs.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SECTORS_FILE = path.join(DATA_DIR, "sectors.json");
const NEWS_FILE = path.join(DATA_DIR, "news.json");
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "announcements.json");
const ALERT_CONFIG_FILE = path.join(DATA_DIR, "alert_config.json");
const ALERT_DISPATCHES_FILE = path.join(DATA_DIR, "alert_dispatches.json");

// Ensure data directory and baseline files exist
export function initializeDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(VOLCANOES_FILE)) {
    fs.writeFileSync(VOLCANOES_FILE, JSON.stringify(defaultVolcanoes, null, 2), "utf-8");
  }
  if (!fs.existsSync(EARTHQUAKES_FILE)) {
    fs.writeFileSync(EARTHQUAKES_FILE, JSON.stringify(defaultEarthquakes, null, 2), "utf-8");
  }
  if (!fs.existsSync(AUDIT_LOGS_FILE)) {
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(SECTORS_FILE)) {
    fs.writeFileSync(SECTORS_FILE, JSON.stringify(defaultSectors, null, 2), "utf-8");
  }
  if (!fs.existsSync(NEWS_FILE)) {
    fs.writeFileSync(NEWS_FILE, JSON.stringify(defaultNews, null, 2), "utf-8");
  }
  if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(defaultAnnouncements, null, 2), "utf-8");
  }
  if (!fs.existsSync(ALERT_CONFIG_FILE)) {
    fs.writeFileSync(ALERT_CONFIG_FILE, JSON.stringify(defaultAlertConfig, null, 2), "utf-8");
  }
  if (!fs.existsSync(ALERT_DISPATCHES_FILE)) {
    fs.writeFileSync(ALERT_DISPATCHES_FILE, JSON.stringify(defaultAlertDispatches, null, 2), "utf-8");
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
  } else {
    try {
      const existing: IUser[] = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      let updated = false;
      defaultUsers.forEach(du => {
        if (!existing.some(u => u.email.toLowerCase() === du.email.toLowerCase())) {
          existing.push(du);
          updated = true;
        }
      });
      if (updated) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(existing, null, 2), "utf-8");
      }
    } catch (e) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
    }
  }
}

// User methods
export function getUsers(): IUser[] {
  try {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    return data.map((u: any) => ({
      ...u,
      status: u.status || "approved"
    }));
  } catch (err) {
    return defaultUsers;
  }
}

export async function asyncGetUsers(): Promise<IUser[]> {
  try {
    const pgUsers = await getPostgresUsers();
    if (pgUsers && pgUsers.length > 0) {
      saveUsers(pgUsers);
      return pgUsers;
    }
  } catch (e) {}
  return getUsers();
}

export function saveUsers(users: IUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    // Asynchronously synchronize with PostgreSQL
    users.forEach(u => upsertPostgresUser(u).catch(() => {}));
  } catch {}
}

// Audit Logs
export function getAuditLogs(): IAuditLog[] {
  try {
    return JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function asyncGetAuditLogs(): Promise<IAuditLog[]> {
  try {
    const pgLogs = await getPostgresAuditLogs();
    if (pgLogs && pgLogs.length > 0) {
      return pgLogs;
    }
  } catch (e) {}
  return getAuditLogs();
}

export function saveAuditLog(log: IAuditLog) {
  try {
    const currentLogs = getAuditLogs();
    currentLogs.unshift(log);
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(currentLogs, null, 2), "utf-8");
    savePostgresAuditLog(log).catch(() => {});
  } catch {}
}

// Volcanoes
export function getVolcanoes(): IVolcano[] {
  try {
    return JSON.parse(fs.readFileSync(VOLCANOES_FILE, "utf-8"));
  } catch {
    return defaultVolcanoes;
  }
}

export async function asyncGetVolcanoes(): Promise<IVolcano[]> {
  try {
    const pgVolcanoes = await getPostgresVolcanoes();
    if (pgVolcanoes && pgVolcanoes.length > 0) {
      saveVolcanoes(pgVolcanoes);
      return pgVolcanoes;
    }
  } catch (e) {}
  return getVolcanoes();
}

export function saveVolcanoes(data: IVolcano[]) {
  try {
    fs.writeFileSync(VOLCANOES_FILE, JSON.stringify(data, null, 2), "utf-8");
    data.forEach(v => upsertPostgresVolcano(v).catch(() => {}));
  } catch {}
}

// Earthquakes
export function getHistoricalEarthquakes(): IEarthquake[] {
  try {
    const list: IEarthquake[] = JSON.parse(fs.readFileSync(EARTHQUAKES_FILE, "utf-8"));
    const existingIds = new Set(list.map((e) => e.id));
    let updated = false;
    defaultEarthquakes.forEach(de => {
      if (!existingIds.has(de.id)) {
        list.push(de);
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(EARTHQUAKES_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
    return list;
  } catch (err) {
    return defaultEarthquakes;
  }
}

export async function asyncGetHistoricalEarthquakes(): Promise<IEarthquake[]> {
  try {
    const pgEarthquakes = await getPostgresEarthquakes();
    if (pgEarthquakes && pgEarthquakes.length > 0) {
      return pgEarthquakes;
    }
  } catch (e) {}
  return getHistoricalEarthquakes();
}

export const getEarthquakes = getHistoricalEarthquakes;
export const asyncGetEarthquakes = asyncGetHistoricalEarthquakes;

// Sectors
export function getSectors(): ISector[] {
  try {
    return JSON.parse(fs.readFileSync(SECTORS_FILE, "utf-8"));
  } catch (err) {
    return defaultSectors;
  }
}

export async function asyncGetSectors(): Promise<ISector[]> {
  try {
    const pgSectors = await getPostgresSectors();
    if (pgSectors && pgSectors.length > 0) {
      return pgSectors;
    }
  } catch (e) {}
  return getSectors();
}

export function saveSectors(data: ISector[]) {
  try {
    fs.writeFileSync(SECTORS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

// Announcements
export function getAnnouncements(): IAnnouncement[] {
  try {
    return JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8"));
  } catch (err) {
    return defaultAnnouncements;
  }
}

export async function asyncGetAnnouncements(): Promise<IAnnouncement[]> {
  try {
    const pgAnn = await getPostgresAnnouncements();
    if (pgAnn && pgAnn.length > 0) {
      return pgAnn;
    }
  } catch (e) {}
  return getAnnouncements();
}

// News
export function getNews(): INews[] {
  try {
    return JSON.parse(fs.readFileSync(NEWS_FILE, "utf-8"));
  } catch (err) {
    return defaultNews;
  }
}

export async function asyncGetNews(): Promise<INews[]> {
  try {
    const pgNews = await getPostgresNews();
    if (pgNews && pgNews.length > 0) {
      return pgNews;
    }
  } catch (e) {}
  return getNews();
}

export function saveNews(data: INews[]) {
  try {
    fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

// Alert Config
export function getAlertConfig(): IAlertConfig {
  try {
    if (fs.existsSync(ALERT_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(ALERT_CONFIG_FILE, "utf-8"));
    }
  } catch {}
  return defaultAlertConfig;
}

export async function asyncGetAlertConfig(): Promise<IAlertConfig> {
  try {
    const pgConfig = await getPostgresAlertConfig();
    if (pgConfig) {
      return pgConfig;
    }
  } catch (e) {}
  return getAlertConfig();
}

export function saveAlertConfig(config: IAlertConfig) {
  try {
    fs.writeFileSync(ALERT_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    savePostgresAlertConfig(config).catch(() => {});
  } catch {}
}

// Alert Dispatches
export function getAlertDispatches(): IAlertDispatch[] {
  try {
    if (fs.existsSync(ALERT_DISPATCHES_FILE)) {
      return JSON.parse(fs.readFileSync(ALERT_DISPATCHES_FILE, "utf-8"));
    }
  } catch {}
  return defaultAlertDispatches;
}

export async function asyncGetAlertDispatches(): Promise<IAlertDispatch[]> {
  try {
    const pgDisp = await getPostgresAlertDispatches();
    if (pgDisp && pgDisp.length > 0) {
      return pgDisp;
    }
  } catch (e) {}
  return getAlertDispatches();
}

export function saveAlertDispatches(dispatches: IAlertDispatch[]) {
  try {
    fs.writeFileSync(ALERT_DISPATCHES_FILE, JSON.stringify(dispatches, null, 2), "utf-8");
    if (dispatches.length > 0) {
      savePostgresAlertDispatch(dispatches[0]).catch(() => {});
    }
  } catch {}
}

