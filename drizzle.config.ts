import "dotenv/config";

const sqlHost = process.env.SQL_HOST || "localhost";
const sqlPort = parseInt(process.env.SQL_PORT || "5432", 10);
const sqlDbName = process.env.SQL_DB_NAME || "rgevams";
const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER || "postgres";
const password = process.env.SQL_PASSWORD ?? process.env.SQL_ADMIN_PASSWORD;


export default {
  schema: "./src/db/Schema.ts",
  out: "./data/drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  extensionsFilters: ["postgis"],
  dbCredentials: process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: sqlHost,
        port: sqlPort,
        user,
        ...(password !== undefined ? { password } : {}),
        database: sqlDbName,
        ssl: false,
      },
  verbose: true,
  strict: true,
};

