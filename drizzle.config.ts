import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const sqlHost = process.env.SQL_HOST || "localhost";

const sqlPort = parseInt(process.env.SQL_PORT || "5432", 10);

const sqlDbName = process.env.SQL_DB_NAME || "rgevams";

const user = process.env.SQL_ADMIN_USER || "postgres";

const password = process.env.SQL_ADMIN_PASSWORD || "";


export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  extensionsFilters: ["postgis"],
 dbCredentials: {
  host: sqlHost,
  port: sqlPort,
  user: user,
  password: password,
  database: sqlDbName,
  ssl: false,
},
  verbose: true,
  strict: true,
});

