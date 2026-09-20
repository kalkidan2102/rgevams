CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint
CREATE TABLE "alert_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_magnitude" numeric(4, 2) DEFAULT '4.5' NOT NULL,
	"max_depth" numeric(6, 2) DEFAULT '35' NOT NULL,
	"depth_threshold" numeric(6, 2) DEFAULT '35' NOT NULL,
	"email_alerts_enabled" boolean DEFAULT true NOT NULL,
	"sms_alerts_enabled" boolean DEFAULT true NOT NULL,
	"alert_recipients_email" jsonb DEFAULT '[]'::jsonb,
	"alert_recipients_phone" jsonb DEFAULT '[]'::jsonb,
	"target_regions" jsonb DEFAULT '[]'::jsonb,
	"auto_dispatch_on_critical" boolean DEFAULT true NOT NULL,
	"severity_filter" text DEFAULT 'Orange' NOT NULL,
	"sms_template_text" text DEFAULT '',
	"email_subject_template" text DEFAULT '',
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" text DEFAULT 'System'
);
--> statement-breakpoint
CREATE TABLE "alert_dispatches" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text,
	"event_type" text DEFAULT 'EARTHQUAKE' NOT NULL,
	"type" text DEFAULT 'both' NOT NULL,
	"severity" text DEFAULT 'Orange' NOT NULL,
	"region" text DEFAULT 'Ethiopia',
	"location" text DEFAULT '',
	"event_title" text NOT NULL,
	"magnitude" numeric(4, 2),
	"depth" numeric(6, 2),
	"message" text DEFAULT '',
	"dispatched_by" text DEFAULT 'ESSGI Early Warning Operations Room' NOT NULL,
	"recipients_count" integer DEFAULT 1,
	"recipients" jsonb DEFAULT '[]'::jsonb,
	"channels" jsonb DEFAULT '["SMS", "EMAIL", "CAP_BROADCAST"]'::jsonb,
	"status" text DEFAULT 'dispatched',
	"details" text DEFAULT '',
	"dispatched_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"date" text NOT NULL,
	"deadline" text DEFAULT '',
	"organizer" text NOT NULL,
	"location" text NOT NULL,
	"summary" text NOT NULL,
	"full_details" text NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb,
	"contact_email" text NOT NULL,
	"status" text DEFAULT 'OPEN',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"volcano_id" text,
	"volcano_name" text,
	"performed_by" text NOT NULL,
	"performed_by_email" text NOT NULL,
	"performed_by_role" text NOT NULL,
	"details" text NOT NULL,
	"ip_address" text DEFAULT '127.0.0.1',
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "earthquakes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"magnitude" numeric(4, 2) NOT NULL,
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"depth_km" numeric(6, 2) NOT NULL,
	"place" text NOT NULL,
	"region" text NOT NULL,
	"category" text DEFAULT 'Regional',
	"source" text DEFAULT 'FURI Seismic Station / USGS / EMSC',
	"severity" text DEFAULT 'Yellow',
	"description" text DEFAULT '',
	"is_historical" boolean DEFAULT false,
	"is_realtime" boolean DEFAULT true,
	"geom" geometry(point),
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gnss_stations" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"network" text DEFAULT 'ESSGI / COMET / UNAVCO',
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"elevation_m" numeric(7, 2) DEFAULT '0',
	"velocity_east_mm_yr" numeric(6, 2) DEFAULT '0',
	"velocity_north_mm_yr" numeric(6, 2) DEFAULT '0',
	"velocity_up_mm_yr" numeric(6, 2) DEFAULT '0',
	"status" text DEFAULT 'Active',
	"geom" geometry(point),
	"last_observation_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "gnss_stations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "infrastructures" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"region" text NOT NULL,
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"vulnerability_index" numeric(4, 2) DEFAULT '0.5',
	"status" text DEFAULT 'Operational',
	"description" text DEFAULT '',
	"geom" geometry(point)
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" text PRIMARY KEY NOT NULL,
	"dispatch_code" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"full_text" text NOT NULL,
	"date" text NOT NULL,
	"category" text NOT NULL,
	"tag" text DEFAULT '',
	"read_time" text DEFAULT '4 min read',
	"author" text NOT NULL,
	"location" text NOT NULL,
	"key_findings" jsonb DEFAULT '[]'::jsonb,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"code" text NOT NULL,
	"directorate" text NOT NULL,
	"head" text NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	"key_functions" jsonb DEFAULT '[]'::jsonb,
	"active_projects" jsonb DEFAULT '[]'::jsonb,
	"station_count" text DEFAULT '',
	"status" text DEFAULT 'ONLINE',
	"badge" text DEFAULT '',
	"target_tab" text DEFAULT '',
	"metrics" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sectors_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'guest' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"institution" text DEFAULT 'Ethiopian Space Science and Geospatial Institute (ESSGI)',
	"password" text,
	"registered_at" timestamp with time zone DEFAULT now(),
	"approved_at" timestamp with time zone,
	"approved_by" text,
	"failed_login_attempts" integer DEFAULT 0,
	"is_locked" boolean DEFAULT false,
	"lock_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "volcanoes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"region" text NOT NULL,
	"latitude" numeric(9, 6) NOT NULL,
	"longitude" numeric(9, 6) NOT NULL,
	"elevation_m" integer DEFAULT 0 NOT NULL,
	"alert_level" text DEFAULT 'Green' NOT NULL,
	"activity_type" text DEFAULT 'Fumarolic Activity',
	"status" text DEFAULT 'Normal' NOT NULL,
	"primary_hazard" text DEFAULT 'Lava Flow / Ash',
	"last_eruption" text DEFAULT 'Unknown',
	"description" text DEFAULT '',
	"monitored_by" text DEFAULT 'ESSGI Directorate',
	"hazard_radius_km" integer DEFAULT 25 NOT NULL,
	"geom" geometry(point),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_alert_dispatches_dispatched_at" ON "alert_dispatches" USING btree ("dispatched_at");--> statement-breakpoint
CREATE INDEX "idx_alert_dispatches_severity" ON "alert_dispatches" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_email" ON "audit_logs" USING btree ("performed_by_email");--> statement-breakpoint
CREATE INDEX "idx_earthquakes_geom" ON "earthquakes" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "idx_earthquakes_occurred_at" ON "earthquakes" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_earthquakes_magnitude" ON "earthquakes" USING btree ("magnitude");--> statement-breakpoint
CREATE INDEX "idx_earthquakes_region" ON "earthquakes" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_gnss_stations_geom" ON "gnss_stations" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "idx_gnss_stations_code" ON "gnss_stations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_infrastructures_geom" ON "infrastructures" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "idx_infrastructures_region" ON "infrastructures" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_volcanoes_geom" ON "volcanoes" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "idx_volcanoes_alert_level" ON "volcanoes" USING btree ("alert_level");--> statement-breakpoint
CREATE INDEX "idx_volcanoes_region" ON "volcanoes" USING btree ("region");