import {
  createUser,
  findUserByEmail,
  hashUserPassword,
  normalizeEmail,
  type NewUserRecord,
  type UserRecord,
} from "./userStore";

type RegistrationRequest = {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  institution?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

type RegistrationDependencies = {
  findByEmail: typeof findUserByEmail;
  hashPassword: typeof hashUserPassword;
  insertUser: (user: NewUserRecord) => Promise<UserRecord>;
};

export type RegistrationResult =
  | { success: true; user: UserRecord }
  | { success: false; status: number; error: string };

const defaultDependencies: RegistrationDependencies = {
  findByEmail: findUserByEmail,
  hashPassword: hashUserPassword,
  insertUser: createUser,
};

export async function registerUser(
  input: RegistrationRequest,
  dependencies: RegistrationDependencies = defaultDependencies,
): Promise<RegistrationResult> {
  const { name, email, role, institution, password, confirmPassword } = input;
  if (typeof name !== "string" || typeof email !== "string" || typeof role !== "string"
    || typeof password !== "string" || !name.trim() || !email.trim() || !password) {
    return { success: false, status: 400, error: "Missing required registration fields (name, email, role, password)." };
  }
  if (password !== confirmPassword) {
    return { success: false, status: 400, error: "Passwords do not match" };
  }
  if (password.length < 8) {
    return { success: false, status: 400, error: "Password must be at least 8 characters." };
  }

  const normalizedRole = role.trim().toLowerCase();
  if (normalizedRole === "admin" || normalizedRole === "superadmin") {
    return { success: false, status: 403, error: "Privileged accounts cannot be self-registered." };
  }
  if (normalizedRole !== "official" && normalizedRole !== "researcher") {
    return { success: false, status: 400, error: "Invalid role selected for security clearance." };
  }

  const emailLower = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return { success: false, status: 400, error: "A valid email address is required." };
  }
  if (await dependencies.findByEmail(emailLower)) {
    return { success: false, status: 400, error: "Email or ID is already registered." };
  }

  const now = new Date();
  const user = await dependencies.insertUser({
    id: emailLower,
    uid: null,
    email: emailLower,
    name: name.trim(),
    role: normalizedRole,
    status: "pending",
    institution: typeof institution === "string" && institution.trim()
      ? institution.trim()
      : "Ethiopian Space Science and Geospatial Institute (ESSGI)",
    password: await dependencies.hashPassword(password),
    registeredAt: now,
    failedLoginAttempts: 0,
    isLocked: false,
    updatedAt: now,
  });

  return { success: true, user };
}
