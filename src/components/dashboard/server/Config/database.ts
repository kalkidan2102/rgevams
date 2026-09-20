import { pool } from "../../../../db/index";
import { initPostgresSchemaAndSeed } from "../Services/postgres.services";

export let isPostgresConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (!process.env.SQL_HOST && !process.env.DATABASE_URL) {
    return false;
  }

  try {
    const client = await pool.connect();
    await client.query("SELECT postgis_full_version();");
    client.release();
    isPostgresConnected = true;
    
    // Bootstrap schema and seed baseline tables if empty
    await initPostgresSchemaAndSeed();
    return true;
  } catch {
    isPostgresConnected = false;
    return false;
  }
}

export function getDatabaseStatus() {
  return {
    type: "PostgreSQL with PostGIS",
    configured: Boolean((process.env.SQL_HOST && process.env.SQL_DB_NAME) || process.env.DATABASE_URL),
    connected: isPostgresConnected,
    host: process.env.SQL_HOST || "localhost",
    database: process.env.SQL_DB_NAME || "rgevams",
    tables: ["earthquakes", "volcanoes", "gnss_stations", "infrastructures", "users", "alert_dispatches", "audit_logs", "alert_configs", "sectors", "news", "announcements"]
  };
}

