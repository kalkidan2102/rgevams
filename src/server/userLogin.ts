import {
  findUserByEmail,
  normalizeEmail,
  verifyAndUpgradePassword,
  type UserRecord,
} from "./userStore";

type LoginDependencies = {
  findByEmail: typeof findUserByEmail;
  verifyPassword: typeof verifyAndUpgradePassword;
};

export type LoginResult =
  | { success: true; user: UserRecord }
  | { success: false; status: 400 | 401 | 403; error: string; accountStatus?: string };

const defaultDependencies: LoginDependencies = {
  findByEmail: findUserByEmail,
  verifyPassword: verifyAndUpgradePassword,
};

export async function authenticateUser(
  email: string,
  password: string,
  dependencies: LoginDependencies = defaultDependencies,
): Promise<LoginResult> {
  if (!email.trim() || !password) {
    return { success: false, status: 400, error: "Missing ID/email or password" };
  }

  const user = await dependencies.findByEmail(normalizeEmail(email));
  if (!user || !(await dependencies.verifyPassword(user, password))) {
    return { success: false, status: 401, error: "Invalid credentials. Unauthorized access." };
  }
  if (user.status === "pending") {
    return {
      success: false,
      status: 403,
      error: `Account Pending Authorization: Your registered account as '${user.role.toUpperCase()}' is awaiting Super Admin approval.`,
      accountStatus: "pending",
    };
  }
  if (user.status === "rejected") {
    return {
      success: false,
      status: 403,
      error: "Access Denied: Your registration request was rejected by the Super Admin.",
      accountStatus: "rejected",
    };
  }
  return { success: true, user };
}
