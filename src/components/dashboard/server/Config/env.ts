import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-2.5-flash",
  SQL_HOST: process.env.SQL_HOST || "localhost",
  SQL_PORT: parseInt(process.env.SQL_PORT || "5432", 10),
  SQL_USER: process.env.SQL_USER || process.env.SQL_ADMIN_USER || "postgres",
  SQL_PASSWORD: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || "",
  SQL_DB_NAME: process.env.SQL_DB_NAME || "rgevams",
  DATABASE_URL: process.env.DATABASE_URL || "",
};

