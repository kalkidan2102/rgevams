import { integer, numeric, pgTable, serial, text, timestamp, boolean, jsonb, geometry, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. Users & Institutional Clearance Table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('guest'), // guest, researcher, official, admin, superadmin
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  institution: text('institution').default('Ethiopian Space Science and Geospatial Institute (ESSGI)'),
  password: text('password'),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  approvedBy: text('approved_by'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  isLocked: boolean('is_locked').default(false),
  lockUntil: timestamp('lock_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_users_email').on(table.email),
  index('idx_users_role').on(table.role),
  index('idx_users_status').on(table.status)
]);

// 2. Earthquakes Table with PostGIS Geospatial geometry (SRID 4326) & seismic attributes
export const earthquakes = pgTable('earthquakes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  magnitude: numeric('magnitude', { precision: 4, scale: 2 }).notNull(),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  depthKm: numeric('depth_km', { precision: 6, scale: 2 }).notNull(),
  place: text('place').notNull(),
  region: text('region').notNull(),
  category: text('category').default('Regional'), // Regional, Afar Rift, Main Ethiopian Rift, Global
  source: text('source').default('FURI Seismic Station / USGS / EMSC'),
  severity: text('severity').default('Yellow'),
  description: text('description').default(''),
  isHistorical: boolean('is_historical').default(false),
  isRealtime: boolean('is_realtime').default(true),
  // PostGIS Point Geometry in WGS84 Geographic Coordinate System (SRID 4326: Lon/Lat)
  geom: geometry('geom', { type: 'point', mode: 'xy', srid: 4326 }),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_earthquakes_geom').using('gist', table.geom),
  index('idx_earthquakes_occurred_at').on(table.occurredAt),
  index('idx_earthquakes_magnitude').on(table.magnitude),
  index('idx_earthquakes_region').on(table.region)
]);

// 3. Volcanoes Table with PostGIS vent coordinates, alert level & hazard zone radius
export const volcanoes = pgTable('volcanoes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  region: text('region').notNull(),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  elevationM: integer('elevation_m').notNull().default(0),
  alertLevel: text('alert_level').notNull().default('Green'), // Green, Yellow, Orange, Red
  activityType: text('activity_type').default('Fumarolic Activity'),
  status: text('status').notNull().default('Normal'),
  primaryHazard: text('primary_hazard').default('Lava Flow / Ash'),
  lastEruption: text('last_eruption').default('Unknown'),
  description: text('description').default(''),
  monitoredBy: text('monitored_by').default('ESSGI Directorate'),
  hazardRadiusKm: integer('hazard_radius_km').notNull().default(25),
  // PostGIS Point Geometry in WGS84 (SRID 4326)
  geom: geometry('geom', { type: 'point', mode: 'xy', srid: 4326 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_volcanoes_geom').using('gist', table.geom),
  index('idx_volcanoes_alert_level').on(table.alertLevel),
  index('idx_volcanoes_region').on(table.region)
]);

// 4. GNSS Crustal Deformation Stations with PostGIS geometry
export const gnssStations = pgTable('gnss_stations', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  network: text('network').default('ESSGI / COMET / UNAVCO'),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  elevationM: numeric('elevation_m', { precision: 7, scale: 2 }).default('0'),
  velocityEastMmYr: numeric('velocity_east_mm_yr', { precision: 6, scale: 2 }).default('0'),
  velocityNorthMmYr: numeric('velocity_north_mm_yr', { precision: 6, scale: 2 }).default('0'),
  velocityUpMmYr: numeric('velocity_up_mm_yr', { precision: 6, scale: 2 }).default('0'),
  status: text('status').default('Active'),
  // PostGIS Point Geometry in WGS84 (SRID 4326)
  geom: geometry('geom', { type: 'point', mode: 'xy', srid: 4326 }),
  lastObservationAt: timestamp('last_observation_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_gnss_stations_geom').using('gist', table.geom),
  index('idx_gnss_stations_code').on(table.code)
]);

// 5. Geohazard Critical Infrastructure with PostGIS geometry
export const infrastructures = pgTable('infrastructures', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Power Grid, Dam, Transport Corridor, Geothermal Field, Telecom Hub
  region: text('region').notNull(),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  vulnerabilityIndex: numeric('vulnerability_index', { precision: 4, scale: 2 }).default('0.5'),
  status: text('status').default('Operational'),
  description: text('description').default(''),
  // PostGIS Point Geometry in WGS84 (SRID 4326)
  geom: geometry('geom', { type: 'point', mode: 'xy', srid: 4326 }),
}, (table) => [
  index('idx_infrastructures_geom').using('gist', table.geom),
  index('idx_infrastructures_region').on(table.region)
]);

// 6. Geohazard Alert Configuration & Threshold Parameters
export const alertConfigs = pgTable('alert_configs', {
  id: serial('id').primaryKey(),
  minMagnitude: numeric('min_magnitude', { precision: 4, scale: 2 }).notNull().default('4.5'),
  maxDepth: numeric('max_depth', { precision: 6, scale: 2 }).notNull().default('35'),
  depthThreshold: numeric('depth_threshold', { precision: 6, scale: 2 }).notNull().default('35'),
  emailAlertsEnabled: boolean('email_alerts_enabled').notNull().default(true),
  smsAlertsEnabled: boolean('sms_alerts_enabled').notNull().default(true),
  alertRecipientsEmail: jsonb('alert_recipients_email').default(sql`'[]'::jsonb`),
  alertRecipientsPhone: jsonb('alert_recipients_phone').default(sql`'[]'::jsonb`),
  targetRegions: jsonb('target_regions').default(sql`'[]'::jsonb`),
  autoDispatchOnCritical: boolean('auto_dispatch_on_critical').notNull().default(true),
  severityFilter: text('severity_filter').notNull().default('Orange'),
  smsTemplateText: text('sms_template_text').default(''),
  emailSubjectTemplate: text('email_subject_template').default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  updatedBy: text('updated_by').default('System'),
});

// 7. Geohazard Alert Dispatches
export const alertDispatches = pgTable('alert_dispatches', {
  id: text('id').primaryKey(),
  eventId: text('event_id'),
  eventType: text('event_type').notNull().default('EARTHQUAKE'), // EARTHQUAKE, VOLCANIC_UNREST, FAULT_RUPTURE, TEST_DISPATCH
  type: text('type').notNull().default('both'), // sms, email, both
  severity: text('severity').notNull().default('Orange'), // LOW, MODERATE, HIGH, CRITICAL, Red, Orange, Yellow, Green
  region: text('region').default('Ethiopia'),
  location: text('location').default(''),
  eventTitle: text('event_title').notNull(),
  magnitude: numeric('magnitude', { precision: 4, scale: 2 }),
  depth: numeric('depth', { precision: 6, scale: 2 }),
  message: text('message').default(''),
  dispatchedBy: text('dispatched_by').notNull().default('ESSGI Early Warning Operations Room'),
  recipientsCount: integer('recipients_count').default(1),
  recipients: jsonb('recipients').default(sql`'[]'::jsonb`),
  channels: jsonb('channels').default(sql`'["SMS", "EMAIL", "CAP_BROADCAST"]'::jsonb`),
  status: text('status').default('dispatched'),
  details: text('details').default(''),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_alert_dispatches_dispatched_at').on(table.dispatchedAt),
  index('idx_alert_dispatches_severity').on(table.severity)
]);

// 8. Institutional Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  volcanoId: text('volcano_id'),
  volcanoName: text('volcano_name'),
  performedBy: text('performed_by').notNull(),
  performedByEmail: text('performed_by_email').notNull(),
  performedByRole: text('performed_by_role').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address').default('127.0.0.1'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_audit_logs_timestamp').on(table.timestamp),
  index('idx_audit_logs_action').on(table.action),
  index('idx_audit_logs_email').on(table.performedByEmail)
]);

// 9. Institutional Sectors, News & Announcements
export const sectors = pgTable('sectors', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  code: text('code').notNull().unique(),
  directorate: text('directorate').notNull(),
  head: text('head').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  keyFunctions: jsonb('key_functions').default(sql`'[]'::jsonb`),
  activeProjects: jsonb('active_projects').default(sql`'[]'::jsonb`),
  stationCount: text('station_count').default(''),
  status: text('status').default('ONLINE'),
  badge: text('badge').default(''),
  targetTab: text('target_tab').default(''),
  metrics: jsonb('metrics').default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const news = pgTable('news', {
  id: text('id').primaryKey(),
  dispatchCode: text('dispatch_code').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  fullText: text('full_text').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  tag: text('tag').default(''),
  readTime: text('read_time').default('4 min read'),
  author: text('author').notNull(),
  location: text('location').notNull(),
  keyFindings: jsonb('key_findings').default(sql`'[]'::jsonb`),
  recommendations: jsonb('recommendations').default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  deadline: text('deadline').default(''),
  organizer: text('organizer').notNull(),
  location: text('location').notNull(),
  summary: text('summary').notNull(),
  fullDetails: text('full_details').notNull(),
  requirements: jsonb('requirements').default(sql`'[]'::jsonb`),
  contactEmail: text('contact_email').notNull(),
  status: text('status').default('OPEN'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

