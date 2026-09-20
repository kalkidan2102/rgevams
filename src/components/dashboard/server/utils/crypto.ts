import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) {
    throw new Error("Password must not be empty");
  }
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Securely compares a plaintext password against a stored bcrypt hash
 * Supports legacy migration if password in storage wasn't hashed yet
 */
export async function verifyPassword(plainText: string, storedHashOrPlain: string): Promise<boolean> {
  if (!plainText || !storedHashOrPlain) {
    return false;
  }
  // If stored value is already a bcrypt hash
  if (storedHashOrPlain.startsWith("$2a$") || storedHashOrPlain.startsWith("$2b$") || storedHashOrPlain.startsWith("$2y$")) {
    return bcrypt.compare(plainText, storedHashOrPlain);
  }
  // Graceful comparison for legacy seed data (exact match), but caller should re-hash
  return plainText === storedHashOrPlain;
}

/**
 * Strips sensitive fields (passwords, hashes) from user objects before serialization
 */
export function sanitizeUser<T extends Record<string, any>>(user: T): Omit<T, "password"> {
  const { password, ...safeUser } = user;
  return safeUser as Omit<T, "password">;
}
