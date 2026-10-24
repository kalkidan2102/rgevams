import "dotenv/config";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool, schema } from "../src/db/index.ts";

type LegacyUser = Record<string, unknown>;

type ValidatedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  institution: string | null;
  password: string;
  registeredAt: Date | null;
  approvedAt: Date | null;
  approvedBy: string | null;
  failedLoginAttempts: number;
  isLocked: boolean;
  lockUntil: Date | null;
};

const usersTable = schema.users;
const saltRounds = 12;
const usersFile = path.resolve(process.cwd(), "data/users.json");
const isDryRun = process.argv.includes("--dry-run");
const isValidateOnly = process.argv.includes("--validate-only");
const fileArgumentIndex = process.argv.indexOf("--file");
const sourceFile = fileArgumentIndex >= 0 && process.argv[fileArgumentIndex + 1]
  ? path.resolve(process.argv[fileArgumentIndex + 1])
  : usersFile;

function dateValue(value: unknown, field: string, rowNumber: number): Date | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = new Date(String(value));
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error(`row ${rowNumber}: invalid ${field}`);
  }
  return parsed;
}

export function validateUsers(records: unknown): ValidatedUser[] {
  if (!Array.isArray(records)) throw new Error("source must be a JSON array");

  const ids = new Map<string, number>();
  const emails = new Map<string, number>();
  const validated: ValidatedUser[] = [];
  const problems: string[] = [];

  records.forEach((value: LegacyUser, index) => {
    const rowNumber = index + 1;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      problems.push(`row ${rowNumber}: invalid record`);
      return;
    }

    const id = typeof value.id === "string" ? value.id.trim() : "";
    const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
    const name = typeof value.name === "string" ? value.name.trim() : "";
    const role = typeof value.role === "string" ? value.role.trim().toLowerCase() : "";
    const status = typeof value.status === "string" ? value.status.trim().toLowerCase() : "approved";
    const password = typeof value.password === "string" ? value.password : "";
    const attempts = value.failedLoginAttempts === undefined ? 0 : Number(value.failedLoginAttempts);
    const isLocked = value.isLocked === undefined ? false : value.isLocked;

    if (!id) problems.push(`row ${rowNumber}: missing id`);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push(`row ${rowNumber}: invalid email`);
    if (!name) problems.push(`row ${rowNumber}: missing name`);
    if (!role || !["guest", "researcher", "official", "admin", "superadmin"].includes(role)) {
      problems.push(`row ${rowNumber}: invalid role`);
    }
    if (!["approved", "pending", "rejected"].includes(status)) problems.push(`row ${rowNumber}: invalid status`);
    if (!password) problems.push(`row ${rowNumber}: missing password value`);
    if (!Number.isSafeInteger(attempts) || attempts < 0) problems.push(`row ${rowNumber}: invalid failedLoginAttempts`);
    if (typeof isLocked !== "boolean") problems.push(`row ${rowNumber}: invalid isLocked`);

    if (id) {
      const firstRow = ids.get(id);
      if (firstRow) problems.push(`row ${rowNumber}: duplicate source id (first seen at row ${firstRow})`);
      else ids.set(id, rowNumber);
    }
    if (email) {
      const firstRow = emails.get(email);
      if (firstRow) problems.push(`row ${rowNumber}: duplicate source email (first seen at row ${firstRow})`);
      else emails.set(email, rowNumber);
    }

    try {
      const registeredAt = dateValue(value.registeredAt, "registeredAt", rowNumber);
      const approvedAt = dateValue(value.approvedAt, "approvedAt", rowNumber);
      const lockUntil = dateValue(value.lockUntil, "lockUntil", rowNumber);
      if (id && email && name && password && role && ["approved", "pending", "rejected"].includes(status)
        && Number.isSafeInteger(attempts) && attempts >= 0 && typeof isLocked === "boolean") {
        validated.push({
          id,
          email,
          name,
          role,
          status,
          institution: value.institution == null ? null : String(value.institution),
          password,
          registeredAt,
          approvedAt,
          approvedBy: value.approvedBy == null ? null : String(value.approvedBy),
          failedLoginAttempts: attempts,
          isLocked,
          lockUntil,
        });
      }
    } catch (error) {
      problems.push(error instanceof Error ? error.message : `row ${rowNumber}: invalid timestamp`);
    }
  });

  if (problems.length) {
    throw new Error(`validation failed for ${problems.length} item(s): ${problems.join("; ")}`);
  }
  return validated;
}

function makeBackup(filePath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${filePath}.backup-${timestamp}`;
  copyFileSync(filePath, backupPath, 1);
  return backupPath;
}

function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

async function sameAccount(source: ValidatedUser, target: typeof usersTable.$inferSelect): Promise<boolean> {
  const passwordMatches = target.password
    ? isBcryptHash(target.password)
      ? await bcrypt.compare(source.password, target.password)
      : source.password === target.password
    : false;

  return source.id === target.id
    && source.email === target.email.toLowerCase()
    && source.name === target.name
    && source.role === target.role
    && source.status === target.status
    && source.institution === target.institution
    && passwordMatches
    && source.approvedBy === target.approvedBy
    && source.failedLoginAttempts === (target.failedLoginAttempts ?? 0)
    && source.isLocked === (target.isLocked ?? false)
    && source.registeredAt?.getTime() === target.registeredAt?.getTime()
    && source.approvedAt?.getTime() === target.approvedAt?.getTime()
    && source.lockUntil?.getTime() === target.lockUntil?.getTime();
}

export async function planImport(
  sourceUsers: ValidatedUser[],
  existingUsers: Array<typeof usersTable.$inferSelect>,
) {
  const conflicts: string[] = [];
  const insertUsers: ValidatedUser[] = [];
  let alreadyPresent = 0;

  for (let index = 0; index < sourceUsers.length; index += 1) {
    const source = sourceUsers[index];
    const byId = existingUsers.find((user) => user.id === source.id);
    const byEmail = existingUsers.find((user) => user.email.toLowerCase() === source.email);

    if (!byId && !byEmail) {
      insertUsers.push(source);
      continue;
    }
    if (byId && byEmail && byId.id === byEmail.id && await sameAccount(source, byId)) {
      alreadyPresent += 1;
      continue;
    }

    const category = byId && byEmail
      ? "database id/email pair differs from source record"
      : byId
        ? "database id belongs to a different account"
        : "database email belongs to a different id";
    conflicts.push(`row ${index + 1}: ${category}`);
  }

  return { conflicts, insertUsers, alreadyPresent };
}

async function main() {
  if (!existsSync(sourceFile)) throw new Error("source user file was not found");

  const backupPath = makeBackup(sourceFile);
  const parsed: unknown = JSON.parse(await import("node:fs/promises").then(({ readFile }) => readFile(sourceFile, "utf8")));
  const sourceUsers = validateUsers(parsed);

  if (isValidateOnly) {
    console.log(JSON.stringify({
      result: "validated",
      sourceRecords: sourceUsers.length,
      conflicts: 0,
      backup: path.relative(process.cwd(), backupPath),
    }, null, 2));
    return;
  }

  const connection = await pool.query<{ current_database: string }>("SELECT current_database() AS current_database");
  if (connection.rows[0]?.current_database !== "rgevams") {
    throw new Error("connected database is not rgevams; no migration was performed");
  }

  const existingUsers = await db.select().from(usersTable);
  const { conflicts, insertUsers, alreadyPresent } = await planImport(sourceUsers, existingUsers);

  if (conflicts.length) {
    console.error(JSON.stringify({
      result: "aborted",
      sourceRecords: sourceUsers.length,
      alreadyPresent,
      conflicts: conflicts.length,
      conflictDetails: conflicts,
      backup: path.relative(process.cwd(), backupPath),
    }, null, 2));
    process.exitCode = 2;
    return;
  }

  if (isDryRun) {
    console.log(JSON.stringify({
      result: "dry-run",
      sourceRecords: sourceUsers.length,
      alreadyPresent,
      readyToInsert: insertUsers.length,
      conflicts: 0,
      backup: path.relative(process.cwd(), backupPath),
    }, null, 2));
    return;
  }

  const preparedUsers = await Promise.all(insertUsers.map(async (user) => ({
    ...user,
    password: isBcryptHash(user.password) ? user.password : await bcrypt.hash(user.password, saltRounds),
  })));

  await db.transaction(async (transaction) => {
    for (const user of preparedUsers) {
      await transaction.insert(usersTable).values({
        ...user,
        uid: null,
        createdAt: user.registeredAt ?? new Date(),
        updatedAt: new Date(),
      });
    }
  });

  console.log(JSON.stringify({
    result: "imported",
    sourceRecords: sourceUsers.length,
    alreadyPresent,
    inserted: preparedUsers.length,
    conflicts: 0,
    backup: path.relative(process.cwd(), backupPath),
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "unknown migration error";
      console.error(`User migration failed: ${message}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}