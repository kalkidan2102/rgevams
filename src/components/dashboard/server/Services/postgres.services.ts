import { db, pool } from "../../../../db/index";
import { sql, eq, desc } from "drizzle-orm";
import {
  users,
  volcanoes,
  earthquakes,
  gnssStations,
  infrastructures,
  alertConfigs,
  alertDispatches,
  auditLogs,
  sectors,
  news,
  announcements
} from "../../../../db/Schema";
import { defaultUsers, IUser } from "../models/User";
import { defaultVolcanoes, IVolcano } from "../models/Volcano";
import { defaultEarthquakes, IEarthquake } from "../models/Earthquake";
import { defaultAlertConfig, defaultAlertDispatches, IAlertConfig, IAlertDispatch } from "../models/Alert";
import { IAuditLog } from "../models/AuditLog";
import { defaultSectors, defaultNews, defaultAnnouncements, ISector, INews, IAnnouncement } from "../models/SectorNews";

// Baseline Ethiopian GNSS Reference Stations with Crustal Deformation Velocity Vectors
export const defaultGnssStations = [
  {
    id: "gnss_furi",
    code: "FURI",
    name: "Mount Furi Geophysical Observatory",
    network: "ESSGI / IRIS / GSN",
    latitude: "8.895000",
    longitude: "38.680000",
    elevationM: "2560.00",
    velocityEastMmYr: "14.20",
    velocityNorthMmYr: "18.60",
    velocityUpMmYr: "1.40",
    status: "Active"
  },
  {
    id: "gnss_bdas",
    code: "BDAS",
    name: "Bahir Dar Geodetic Array",
    network: "ESSGI / UNAVCO",
    latitude: "11.598000",
    longitude: "37.355000",
    elevationM: "1820.00",
    velocityEastMmYr: "12.80",
    velocityNorthMmYr: "17.40",
    velocityUpMmYr: "0.80",
    status: "Active"
  },
  {
    id: "gnss_dese",
    code: "DESE",
    name: "Dessie Western Escarpment Station",
    network: "ESSGI / COMET",
    latitude: "11.130000",
    longitude: "39.630000",
    elevationM: "2470.00",
    velocityEastMmYr: "15.60",
    velocityNorthMmYr: "19.10",
    velocityUpMmYr: "2.10",
    status: "Active"
  },
  {
    id: "gnss_hawk",
    code: "HAWK",
    name: "Hawassa MER Rift Floor Station",
    network: "ESSGI / COMET",
    latitude: "7.050000",
    longitude: "38.480000",
    elevationM: "1690.00",
    velocityEastMmYr: "16.90",
    velocityNorthMmYr: "21.30",
    velocityUpMmYr: "-1.20",
    status: "Active"
  },
  {
    id: "gnss_arba",
    code: "ARBA",
    name: "Arba Minch Southern Rift Station",
    network: "ESSGI / UNAVCO",
    latitude: "6.030000",
    longitude: "37.550000",
    elevationM: "1280.00",
    velocityEastMmYr: "13.40",
    velocityNorthMmYr: "16.80",
    velocityUpMmYr: "0.40",
    status: "Active"
  },
  {
    id: "gnss_seme",
    code: "SEME",
    name: "Semera Afar Triple Junction Station",
    network: "ESSGI / COMET",
    latitude: "11.790000",
    longitude: "41.010000",
    elevationM: "430.00",
    velocityEastMmYr: "21.40",
    velocityNorthMmYr: "24.70",
    velocityUpMmYr: "3.80",
    status: "Active"
  }
];

// Baseline Critical Infrastructure within Ethiopian Rift Corridor
export const defaultInfrastructures = [
  {
    id: "inf_gerd",
    name: "Grand Ethiopian Renaissance Dam (GERD)",
    type: "Hydroelectric Dam",
    region: "Benishangul-Gumuz",
    latitude: "11.215000",
    longitude: "35.093000",
    vulnerabilityIndex: "0.25",
    status: "Operational",
    description: "Major national hydro-power facility with continuous seismic sensor perimeter."
  },
  {
    id: "inf_gibe3",
    name: "Gibe III Hydroelectric Plant",
    type: "Hydroelectric Dam",
    region: "SNNPR / Oromia",
    latitude: "6.848000",
    longitude: "37.302000",
    vulnerabilityIndex: "0.38",
    status: "Operational",
    description: "Roller-compacted concrete gravity dam on the Omo River."
  },
  {
    id: "inf_aluto",
    name: "Aluto-Langano Geothermal Power Plant",
    type: "Geothermal Field",
    region: "Oromia (Rift Valley)",
    latitude: "7.790000",
    longitude: "38.790000",
    vulnerabilityIndex: "0.65",
    status: "Operational",
    description: "Located within active volcanic caldera geothermal field with high seismic strain."
  },
  {
    id: "inf_rail_djibouti",
    name: "Ethio-Djibouti Railway Rift Crossing Corridor",
    type: "Transport Corridor",
    region: "Afar / Somali / Oromia",
    latitude: "9.600000",
    longitude: "41.860000",
    vulnerabilityIndex: "0.55",
    status: "Operational",
    description: "Strategic electrified standard-gauge freight railway traversing the Afar Depression."
  },
  {
    id: "inf_koka",
    name: "Koka Dam & Hydroelectric Station",
    type: "Hydroelectric Dam",
    region: "Main Ethiopian Rift (Awash)",
    latitude: "8.470000",
    longitude: "39.160000",
    vulnerabilityIndex: "0.52",
    status: "Operational",
    description: "Awash River flood control and energy generator in active rift segment."
  },
  {
    id: "inf_tendaho",
    name: "Tendaho Sugar Factory & Dam Reservoir",
    type: "Industrial / Irrigation Dam",
    region: "Afar (Lower Awash)",
    latitude: "11.680000",
    longitude: "40.970000",
    vulnerabilityIndex: "0.60",
    status: "Operational",
    description: "Critical agricultural irrigation and reservoir infrastructure in Central Afar."
  }
];

/**
 * Initialize PostgreSQL tables, PostGIS extensions, and seed initial records if empty
 */
export async function initPostgresSchemaAndSeed(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      // 1. Seed Users if empty
      const userCountRes = await client.query("SELECT COUNT(*) FROM users;");
      if (parseInt(userCountRes.rows[0].count, 10) === 0) {
        for (const u of defaultUsers) {
          await client.query(`
            INSERT INTO users (id, email, name, role, status, institution, password, registered_at, approved_at, approved_by, failed_login_attempts, is_locked)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (email) DO NOTHING;
          `, [
            u.id,
            u.email.toLowerCase(),
            u.name,
            u.role,
            u.status,
            u.institution,
            u.password,
            u.registeredAt,
            u.approvedAt || null,
            u.approvedBy || null,
            u.failedLoginAttempts || 0,
            u.isLocked || false
          ]);
        }
      }

      // 4. Seed Volcanoes if empty
      const volcanoCountRes = await client.query("SELECT COUNT(*) FROM volcanoes;");
      if (parseInt(volcanoCountRes.rows[0].count, 10) === 0) {
        for (const v of defaultVolcanoes) {
          const lat = v.coordinates[0];
          const lng = v.coordinates[1];
          await client.query(`
            INSERT INTO volcanoes (id, name, type, region, latitude, longitude, elevation_m, alert_level, activity_type, status, last_eruption, description, monitored_by, geom)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_SetSRID(ST_MakePoint($14, $15), 4326))
            ON CONFLICT (id) DO NOTHING;
          `, [
            v.id,
            v.name,
            v.type,
            v.region,
            lat.toString(),
            lng.toString(),
            v.elevation,
            v.severity,
            v.activityType,
            "Normal",
            v.lastErupted,
            v.description,
            v.monitoredBy,
            lng,
            lat
          ]);
        }
      }

      // 5. Seed Historical Earthquakes if empty
      const eqCountRes = await client.query("SELECT COUNT(*) FROM earthquakes;");
      if (parseInt(eqCountRes.rows[0].count, 10) === 0) {
        for (const eqItem of defaultEarthquakes) {
          const lat = eqItem.coordinates[0];
          const lng = eqItem.coordinates[1];
          await client.query(`
            INSERT INTO earthquakes (id, title, magnitude, latitude, longitude, depth_km, place, region, category, severity, description, is_historical, is_realtime, geom, occurred_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_SetSRID(ST_MakePoint($14, $15), 4326), $16)
            ON CONFLICT (id) DO NOTHING;
          `, [
            eqItem.id,
            `M ${eqItem.magnitude} - ${eqItem.location}`,
            eqItem.magnitude.toString(),
            lat.toString(),
            lng.toString(),
            eqItem.depth.toString(),
            eqItem.location,
            "Ethiopian Rift System",
            "Regional",
            eqItem.severity,
            eqItem.description,
            true,
            false,
            lng,
            lat,
            new Date(eqItem.dateTime)
          ]);
        }
      }

      // 6. Seed GNSS Reference Stations if empty
      const gnssCountRes = await client.query("SELECT COUNT(*) FROM gnss_stations;");
      if (parseInt(gnssCountRes.rows[0].count, 10) === 0) {
        for (const gnss of defaultGnssStations) {
          const lat = parseFloat(gnss.latitude);
          const lng = parseFloat(gnss.longitude);
          await client.query(`
            INSERT INTO gnss_stations (id, code, name, network, latitude, longitude, elevation_m, velocity_east_mm_yr, velocity_north_mm_yr, velocity_up_mm_yr, status, geom)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ST_SetSRID(ST_MakePoint($12, $13), 4326))
            ON CONFLICT (code) DO NOTHING;
          `, [
            gnss.id,
            gnss.code,
            gnss.name,
            gnss.network,
            gnss.latitude,
            gnss.longitude,
            gnss.elevationM,
            gnss.velocityEastMmYr,
            gnss.velocityNorthMmYr,
            gnss.velocityUpMmYr,
            gnss.status,
            lng,
            lat
          ]);
        }
      }

      // 7. Seed Critical Infrastructures if empty
      const infCountRes = await client.query("SELECT COUNT(*) FROM infrastructures;");
      if (parseInt(infCountRes.rows[0].count, 10) === 0) {
        for (const inf of defaultInfrastructures) {
          const lat = parseFloat(inf.latitude);
          const lng = parseFloat(inf.longitude);
          await client.query(`
            INSERT INTO infrastructures (id, name, type, region, latitude, longitude, vulnerability_index, status, description, geom)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($10, $11), 4326))
            ON CONFLICT (id) DO NOTHING;
          `, [
            inf.id,
            inf.name,
            inf.type,
            inf.region,
            inf.latitude,
            inf.longitude,
            inf.vulnerabilityIndex,
            inf.status,
            inf.description,
            lng,
            lat
          ]);
        }
      }

      // 8. Seed Alert Config if empty
      const alertConfigRes = await client.query("SELECT COUNT(*) FROM alert_configs;");
      if (parseInt(alertConfigRes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO alert_configs (min_magnitude, max_depth, depth_threshold, email_alerts_enabled, sms_alerts_enabled, alert_recipients_email, alert_recipients_phone, target_regions, auto_dispatch_on_critical, severity_filter, sms_template_text, email_subject_template, updated_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [
          defaultAlertConfig.minMagnitude.toString(),
          defaultAlertConfig.maxDepth.toString(),
          defaultAlertConfig.depthThreshold.toString(),
          defaultAlertConfig.emailAlertsEnabled,
          defaultAlertConfig.smsAlertsEnabled,
          JSON.stringify(defaultAlertConfig.alertRecipientsEmail),
          JSON.stringify(defaultAlertConfig.alertRecipientsPhone),
          JSON.stringify(defaultAlertConfig.targetRegions),
          defaultAlertConfig.autoDispatchOnCritical,
          defaultAlertConfig.severityFilter,
          defaultAlertConfig.smsTemplateText,
          defaultAlertConfig.emailSubjectTemplate,
          defaultAlertConfig.updatedBy
        ]);
      }

      // 9. Seed Alert Dispatches if empty
      const dispatchesRes = await client.query("SELECT COUNT(*) FROM alert_dispatches;");
      if (parseInt(dispatchesRes.rows[0].count, 10) === 0) {
        for (const disp of defaultAlertDispatches) {
          await client.query(`
            INSERT INTO alert_dispatches (id, event_type, type, event_title, magnitude, depth, location, severity, recipients_count, recipients, status, details, dispatched_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO NOTHING;
          `, [
            disp.id,
            "EARTHQUAKE",
            disp.type,
            disp.eventTitle,
            disp.magnitude.toString(),
            disp.depth.toString(),
            disp.location,
            disp.severity,
            disp.recipientsCount,
            JSON.stringify(disp.recipients),
            disp.status,
            disp.details,
            new Date(disp.timestamp)
          ]);
        }
      }

      // 10. Seed Sectors if empty
      const sectorRes = await client.query("SELECT COUNT(*) FROM sectors;");
      if (parseInt(sectorRes.rows[0].count, 10) === 0) {
        for (const sec of defaultSectors) {
          await client.query(`
            INSERT INTO sectors (id, title, code, directorate, head, location, description, key_functions, active_projects, station_count, status, badge, target_tab, metrics)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO NOTHING;
          `, [
            sec.id,
            sec.title,
            sec.code,
            sec.directorate,
            sec.head,
            sec.location,
            sec.description,
            JSON.stringify(sec.keyFunctions),
            JSON.stringify(sec.activeProjects),
            sec.stationCount,
            sec.status,
            sec.badge,
            sec.targetTab,
            JSON.stringify(sec.metrics)
          ]);
        }
      }

      // 11. Seed News if empty
      const newsRes = await client.query("SELECT COUNT(*) FROM news;");
      if (parseInt(newsRes.rows[0].count, 10) === 0) {
        for (const n of defaultNews) {
          await client.query(`
            INSERT INTO news (id, dispatch_code, title, excerpt, full_text, date, category, tag, read_time, author, location, key_findings, recommendations)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO NOTHING;
          `, [
            n.id,
            n.dispatchCode,
            n.title,
            n.excerpt,
            n.fullText,
            n.date,
            n.category,
            n.tag,
            n.readTime,
            n.author,
            n.location,
            JSON.stringify(n.keyFindings),
            JSON.stringify(n.recommendations)
          ]);
        }
      }

      // 12. Seed Announcements if empty
      const annRes = await client.query("SELECT COUNT(*) FROM announcements;");
      if (parseInt(annRes.rows[0].count, 10) === 0) {
        for (const a of defaultAnnouncements) {
          await client.query(`
            INSERT INTO announcements (id, code, title, category, date, deadline, organizer, location, summary, full_details, requirements, contact_email, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO NOTHING;
          `, [
            a.id,
            a.code,
            a.title,
            a.category,
            a.date,
            a.deadline,
            a.organizer,
            a.location,
            a.summary,
            a.fullDetails,
            JSON.stringify(a.requirements),
            a.contactEmail,
            a.status
          ]);
        }
      }

      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Error during initPostgresSchemaAndSeed:", err);
    return false;
  }
}

// ----------------- USER REPOSITORY -----------------
export async function getPostgresUsers(): Promise<IUser[]> {
  try {
    const rows = await db.select().from(users).orderBy(desc(users.registeredAt));
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as any,
      status: u.status as any,
      institution: u.institution || "ESSGI",
      password: u.password || undefined,
      registeredAt: u.registeredAt ? u.registeredAt.toISOString() : new Date().toISOString(),
      approvedAt: u.approvedAt ? u.approvedAt.toISOString() : undefined,
      approvedBy: u.approvedBy || undefined,
      failedLoginAttempts: u.failedLoginAttempts || 0,
      isLocked: u.isLocked || false,
      lockUntil: u.lockUntil ? u.lockUntil.toISOString() : undefined
    }));
  } catch (e) {
    return [];
  }
}

export async function upsertPostgresUser(user: IUser): Promise<boolean> {
  try {
    const existing = await db.select().from(users).where(eq(users.email, user.email.toLowerCase()));
    if (existing.length > 0) {
      await db.update(users).set({
        name: user.name,
        role: user.role,
        status: user.status,
        institution: user.institution,
        password: user.password,
        approvedAt: user.approvedAt ? new Date(user.approvedAt) : null,
        approvedBy: user.approvedBy || null,
        failedLoginAttempts: user.failedLoginAttempts || 0,
        isLocked: user.isLocked || false,
        lockUntil: user.lockUntil ? new Date(user.lockUntil) : null,
        updatedAt: new Date()
      }).where(eq(users.email, user.email.toLowerCase()));
    } else {
      await db.insert(users).values({
        id: user.id || user.email.toLowerCase(),
        email: user.email.toLowerCase(),
        name: user.name,
        role: user.role,
        status: user.status,
        institution: user.institution,
        password: user.password,
        registeredAt: user.registeredAt ? new Date(user.registeredAt) : new Date(),
        approvedAt: user.approvedAt ? new Date(user.approvedAt) : null,
        approvedBy: user.approvedBy || null,
        failedLoginAttempts: user.failedLoginAttempts || 0,
        isLocked: user.isLocked || false,
        lockUntil: user.lockUntil ? new Date(user.lockUntil) : null
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function deletePostgresUser(email: string): Promise<boolean> {
  try {
    await db.delete(users).where(eq(users.email, email.toLowerCase()));
    return true;
  } catch {
    return false;
  }
}

// ----------------- VOLCANO REPOSITORY -----------------
export async function getPostgresVolcanoes(): Promise<IVolcano[]> {
  try {
    const rows = await db.select().from(volcanoes).orderBy(volcanoes.name);
    return rows.map((v) => ({
      id: v.id,
      name: v.name,
      region: v.region,
      elevation: v.elevationM,
      coordinates: [parseFloat(v.latitude), parseFloat(v.longitude)],
      type: v.type,
      activityType: v.activityType || "Fumarolic",
      severity: v.alertLevel,
      lastErupted: v.lastEruption || "Unknown",
      description: v.description || "",
      monitoredBy: v.monitoredBy || "ESSGI Directorate",
      updatedAt: v.updatedAt ? v.updatedAt.toISOString() : new Date().toISOString()
    }));
  } catch {
    return [];
  }
}

export async function upsertPostgresVolcano(v: IVolcano): Promise<boolean> {
  try {
    const lat = v.coordinates[0];
    const lng = v.coordinates[1];
    await pool.query(`
      INSERT INTO volcanoes (id, name, type, region, latitude, longitude, elevation_m, alert_level, activity_type, status, last_eruption, description, monitored_by, geom, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_SetSRID(ST_MakePoint($14, $15), 4326), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        region = EXCLUDED.region,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        elevation_m = EXCLUDED.elevation_m,
        alert_level = EXCLUDED.alert_level,
        activity_type = EXCLUDED.activity_type,
        last_eruption = EXCLUDED.last_eruption,
        description = EXCLUDED.description,
        monitored_by = EXCLUDED.monitored_by,
        geom = EXCLUDED.geom,
        updated_at = NOW();
    `, [
      v.id,
      v.name,
      v.type,
      v.region,
      lat.toString(),
      lng.toString(),
      v.elevation,
      v.severity,
      v.activityType,
      "Normal",
      v.lastErupted,
      v.description,
      v.monitoredBy,
      lng,
      lat
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function deletePostgresVolcano(id: string): Promise<boolean> {
  try {
    await db.delete(volcanoes).where(eq(volcanoes.id, id));
    return true;
  } catch {
    return false;
  }
}

// ----------------- EARTHQUAKE REPOSITORY -----------------
export async function getPostgresEarthquakes(): Promise<IEarthquake[]> {
  try {
    const rows = await db.select().from(earthquakes).orderBy(desc(earthquakes.occurredAt));
    return rows.map((e) => ({
      id: e.id,
      magnitude: parseFloat(e.magnitude),
      location: e.place,
      coordinates: [parseFloat(e.latitude), parseFloat(e.longitude)],
      depth: parseFloat(e.depthKm),
      dateTime: e.occurredAt.toISOString(),
      severity: e.severity || "Yellow",
      description: e.description || "",
      isHistorical: e.isHistorical ?? false
    }));
  } catch {
    return [];
  }
}

export async function savePostgresEarthquake(eqItem: IEarthquake): Promise<boolean> {
  try {
    const lat = eqItem.coordinates[0];
    const lng = eqItem.coordinates[1];
    await pool.query(`
      INSERT INTO earthquakes (id, title, magnitude, latitude, longitude, depth_km, place, region, category, severity, description, is_historical, is_realtime, geom, occurred_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ST_SetSRID(ST_MakePoint($14, $15), 4326), $16)
      ON CONFLICT (id) DO UPDATE SET
        magnitude = EXCLUDED.magnitude,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        depth_km = EXCLUDED.depth_km,
        place = EXCLUDED.place,
        severity = EXCLUDED.severity,
        geom = EXCLUDED.geom;
    `, [
      eqItem.id,
      `M ${eqItem.magnitude} - ${eqItem.location}`,
      eqItem.magnitude.toString(),
      lat.toString(),
      lng.toString(),
      eqItem.depth.toString(),
      eqItem.location,
      "Ethiopian Rift System",
      "Regional",
      eqItem.severity,
      eqItem.description,
      eqItem.isHistorical ?? false,
      !eqItem.isHistorical,
      lng,
      lat,
      new Date(eqItem.dateTime)
    ]);
    return true;
  } catch {
    return false;
  }
}

// ----------------- AUDIT LOGS REPOSITORY -----------------
export async function getPostgresAuditLogs(): Promise<IAuditLog[]> {
  try {
    const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(200);
    return rows.map((l) => ({
      id: l.id,
      action: l.action,
      volcanoId: l.volcanoId || undefined,
      volcanoName: l.volcanoName || undefined,
      performedBy: l.performedBy,
      performedByEmail: l.performedByEmail,
      performedByRole: l.performedByRole,
      details: l.details,
      timestamp: l.timestamp ? l.timestamp.toISOString() : new Date().toISOString()
    }));
  } catch (e) {
    return [];
  }
}

export async function savePostgresAuditLog(log: IAuditLog): Promise<boolean> {
  try {
    await db.insert(auditLogs).values({
      id: log.id,
      action: log.action,
      volcanoId: log.volcanoId || null,
      volcanoName: log.volcanoName || null,
      performedBy: log.performedBy,
      performedByEmail: log.performedByEmail,
      performedByRole: log.performedByRole,
      details: log.details,
      timestamp: new Date(log.timestamp)
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ----------------- ALERT CONFIG REPOSITORY -----------------
export async function getPostgresAlertConfig(): Promise<IAlertConfig | null> {
  try {
    const rows = await db.select().from(alertConfigs).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      minMagnitude: parseFloat(r.minMagnitude),
      maxDepth: parseFloat(r.maxDepth),
      depthThreshold: parseFloat(r.depthThreshold),
      emailAlertsEnabled: r.emailAlertsEnabled,
      smsAlertsEnabled: r.smsAlertsEnabled,
      alertRecipientsEmail: (r.alertRecipientsEmail as string[]) || [],
      alertRecipientsPhone: (r.alertRecipientsPhone as string[]) || [],
      targetRegions: (r.targetRegions as string[]) || [],
      autoDispatchOnCritical: r.autoDispatchOnCritical,
      severityFilter: r.severityFilter,
      smsTemplateText: r.smsTemplateText || "",
      emailSubjectTemplate: r.emailSubjectTemplate || "",
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
      updatedBy: r.updatedBy || "System"
    };
  } catch (e) {
    return null;
  }
}

export async function savePostgresAlertConfig(cfg: IAlertConfig): Promise<boolean> {
  try {
    const existing = await db.select().from(alertConfigs).limit(1);
    if (existing.length > 0) {
      await db.update(alertConfigs).set({
        minMagnitude: cfg.minMagnitude.toString(),
        maxDepth: cfg.maxDepth.toString(),
        depthThreshold: cfg.depthThreshold.toString(),
        emailAlertsEnabled: cfg.emailAlertsEnabled,
        smsAlertsEnabled: cfg.smsAlertsEnabled,
        alertRecipientsEmail: cfg.alertRecipientsEmail,
        alertRecipientsPhone: cfg.alertRecipientsPhone,
        targetRegions: cfg.targetRegions,
        autoDispatchOnCritical: cfg.autoDispatchOnCritical,
        severityFilter: cfg.severityFilter,
        smsTemplateText: cfg.smsTemplateText,
        emailSubjectTemplate: cfg.emailSubjectTemplate,
        updatedAt: new Date(),
        updatedBy: cfg.updatedBy
      }).where(eq(alertConfigs.id, existing[0].id));
    } else {
      await db.insert(alertConfigs).values({
        minMagnitude: cfg.minMagnitude.toString(),
        maxDepth: cfg.maxDepth.toString(),
        depthThreshold: cfg.depthThreshold.toString(),
        emailAlertsEnabled: cfg.emailAlertsEnabled,
        smsAlertsEnabled: cfg.smsAlertsEnabled,
        alertRecipientsEmail: cfg.alertRecipientsEmail,
        alertRecipientsPhone: cfg.alertRecipientsPhone,
        targetRegions: cfg.targetRegions,
        autoDispatchOnCritical: cfg.autoDispatchOnCritical,
        severityFilter: cfg.severityFilter,
        smsTemplateText: cfg.smsTemplateText,
        emailSubjectTemplate: cfg.emailSubjectTemplate,
        updatedAt: new Date(),
        updatedBy: cfg.updatedBy
      });
    }
    return true;
  } catch (e) {
    return false;
  }
}

// ----------------- ALERT DISPATCHES REPOSITORY -----------------
export async function getPostgresAlertDispatches(): Promise<IAlertDispatch[]> {
  try {
    const rows = await db.select().from(alertDispatches).orderBy(desc(alertDispatches.dispatchedAt));
    return rows.map((d) => ({
      id: d.id,
      eventId: d.eventId || undefined,
      type: d.type as any,
      eventTitle: d.eventTitle,
      magnitude: d.magnitude ? parseFloat(d.magnitude) : 0,
      depth: d.depth ? parseFloat(d.depth) : 0,
      location: d.location || "",
      severity: d.severity,
      recipientsCount: d.recipientsCount || 0,
      recipients: (d.recipients as string[]) || [],
      status: d.status || "dispatched",
      timestamp: d.dispatchedAt ? d.dispatchedAt.toISOString() : new Date().toISOString(),
      details: d.details || ""
    }));
  } catch (e) {
    return [];
  }
}

export async function savePostgresAlertDispatch(disp: IAlertDispatch): Promise<boolean> {
  try {
    await db.insert(alertDispatches).values({
      id: disp.id,
      eventId: disp.eventId || null,
      type: disp.type,
      eventTitle: disp.eventTitle,
      magnitude: disp.magnitude ? disp.magnitude.toString() : null,
      depth: disp.depth ? disp.depth.toString() : null,
      location: disp.location,
      severity: disp.severity,
      recipientsCount: disp.recipientsCount,
      recipients: disp.recipients,
      status: disp.status,
      details: disp.details,
      dispatchedAt: new Date(disp.timestamp)
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ----------------- SECTORS, NEWS, ANNOUNCEMENTS REPOSITORY -----------------
export async function getPostgresSectors(): Promise<ISector[]> {
  try {
    const rows = await db.select().from(sectors);
    return rows.map((s) => ({
      id: s.id,
      title: s.title,
      code: s.code,
      directorate: s.directorate,
      head: s.head,
      location: s.location,
      description: s.description,
      keyFunctions: (s.keyFunctions as string[]) || [],
      activeProjects: (s.activeProjects as string[]) || [],
      stationCount: s.stationCount || "",
      status: s.status || "ONLINE",
      badge: s.badge || "",
      targetTab: s.targetTab || "",
      metrics: (s.metrics as any[]) || []
    }));
  } catch (e) {
    return [];
  }
}

export async function getPostgresNews(): Promise<INews[]> {
  try {
    const rows = await db.select().from(news).orderBy(desc(news.createdAt));
    return rows.map((n) => ({
      id: n.id,
      dispatchCode: n.dispatchCode,
      title: n.title,
      excerpt: n.excerpt,
      fullText: n.fullText,
      date: n.date,
      category: n.category,
      tag: n.tag || "",
      readTime: n.readTime || "4 min read",
      author: n.author,
      location: n.location,
      keyFindings: (n.keyFindings as string[]) || [],
      recommendations: (n.recommendations as string[]) || []
    }));
  } catch (e) {
    return [];
  }
}

export async function getPostgresAnnouncements(): Promise<IAnnouncement[]> {
  try {
    const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
    return rows.map((a) => ({
      id: a.id,
      code: a.code,
      title: a.title,
      category: a.category,
      date: a.date,
      deadline: a.deadline || "",
      organizer: a.organizer,
      location: a.location,
      summary: a.summary,
      fullDetails: a.fullDetails,
      requirements: (a.requirements as string[]) || [],
      contactEmail: a.contactEmail,
      status: a.status || "OPEN"
    }));
  } catch (e) {
    return [];
  }
}
