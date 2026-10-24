import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db, pool, schema } from "../db/index";

const userTable = schema.users;
const saltRounds = 12;
let verifiedDatabase = false;

export type UserRecord = typeof userTable.$inferSelect;
export type NewUserRecord = typeof userTable.$inferInsert;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function ensureRgevamsDatabase(): Promise<void> {
  if (verifiedDatabase) return;
  const result = await pool.query<{ current_database: string }>("SELECT current_database() AS current_database");
  if (result.rows[0]?.current_database !== "rgevams") {
    throw new Error("User management requires the rgevams PostgreSQL database.");
  }
  verifiedDatabase = true;
}

export async function listUsers(): Promise<UserRecord[]> {
  await ensureRgevamsDatabase();
  return db.select().from(userTable);
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  await ensureRgevamsDatabase();
  const [user] = await db.select().from(userTable).where(
    sql`lower(${userTable.email}) = ${normalizeEmail(email)}`,
  ).limit(1);
  return user;
}

export async function createUser(user: NewUserRecord): Promise<UserRecord> {
  await ensureRgevamsDatabase();
  const [created] = await db.insert(userTable).values(user).returning();
  return created;
}

export async function updateUser(id: string, changes: Partial<NewUserRecord>): Promise<UserRecord | undefined> {
  await ensureRgevamsDatabase();
  const [updated] = await db.update(userTable)
    .set({ ...changes, updatedAt: new Date() })
    .where(eq(userTable.id, id))
    .returning();
  return updated;
}

export async function removeUser(id: string): Promise<UserRecord | undefined> {
  await ensureRgevamsDatabase();
  const [deleted] = await db.delete(userTable).where(eq(userTable.id, id)).returning();
  return deleted;
}

export async function hashUserPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function verifyAndUpgradePassword(
  user: UserRecord,
  password: string,
  persistPassword: (id: string, passwordHash: string) => Promise<unknown> = async (id, passwordHash) =>
    updateUser(id, { password: passwordHash }),
): Promise<boolean> {
  if (!user.password) return false;
  const storedPassword = user.password;
  const isHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);
  const valid = isHash
    ? await bcrypt.compare(password, storedPassword)
    : password === storedPassword;

  if (valid && !isHash) {
    const upgraded = await persistPassword(user.id, await hashUserPassword(password));
    if (!upgraded) throw new Error("Legacy password could not be upgraded.");
  }
  return valid;
}

export function serializeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    institution: user.institution,
    registeredAt: user.registeredAt,
    approvedAt: user.approvedAt,
    approvedBy: user.approvedBy,
    failedLoginAttempts: user.failedLoginAttempts,
    isLocked: user.isLocked,
    lockUntil: user.lockUntil,
  };
}
