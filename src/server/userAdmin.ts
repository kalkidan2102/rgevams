import {
  findUserByEmail,
  normalizeEmail,
  updateUser,
  type UserRecord,
} from "./userStore";

export type UserAdminDependencies = {
  findByEmail: typeof findUserByEmail;
  update: typeof updateUser;
};

export type UserAdminResult =
  | { success: true; user: UserRecord }
  | { success: false; status: 400 | 403 | 404; error: string };

const allowedRoles = ["guest", "researcher", "official", "admin", "superadmin"];
const defaultDependencies: UserAdminDependencies = {
  findByEmail: findUserByEmail,
  update: updateUser,
};

export async function approveUser(
  email: string,
  actor: Pick<UserRecord, "name" | "email" | "role">,
  role?: unknown,
  dependencies: UserAdminDependencies = defaultDependencies,
): Promise<UserAdminResult> {
  if (role !== undefined && (typeof role !== "string" || !allowedRoles.includes(role))) {
    return { success: false, status: 400, error: "Invalid role specified." };
  }
  const user = await dependencies.findByEmail(normalizeEmail(email));
  if (!user) return { success: false, status: 404, error: "User account not found." };
  if (actor.role !== "superadmin") {
    if (role !== undefined) {
      return { success: false, status: 403, error: "Only Super Admin can assign account roles." };
    }
    if (user.role === "admin" || user.role === "superadmin") {
      return { success: false, status: 403, error: "Only Super Admin can approve privileged accounts." };
    }
  }
  const updated = await dependencies.update(user.id, {
    status: "approved",
    ...(typeof role === "string" ? { role } : {}),
    approvedAt: new Date(),
    approvedBy: `${actor.name} (${actor.email})`,
  });
  if (!updated) return { success: false, status: 404, error: "User account not found." };
  return { success: true, user: updated };
}

export async function rejectUser(
  email: string,
  actorRole: string,
  dependencies: UserAdminDependencies = defaultDependencies,
): Promise<UserAdminResult> {
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail === "superadmin@essgi.gov.et") {
    return { success: false, status: 400, error: "Cannot reject the root Super Administrator account." };
  }
  const user = await dependencies.findByEmail(normalizedEmail);
  if (!user) return { success: false, status: 404, error: "User account not found." };
  if (actorRole !== "superadmin" && (user.role === "admin" || user.role === "superadmin")) {
    return { success: false, status: 403, error: "Only Super Admin can reject privileged accounts." };
  }
  const updated = await dependencies.update(user.id, { status: "rejected" });
  if (!updated) return { success: false, status: 404, error: "User account not found." };
  return { success: true, user: updated };
}

export async function changeUserRole(
  email: string,
  role: unknown,
  dependencies: UserAdminDependencies = defaultDependencies,
): Promise<UserAdminResult> {
  if (typeof role !== "string" || !allowedRoles.includes(role)) {
    return { success: false, status: 400, error: "Invalid role specified." };
  }
  const user = await dependencies.findByEmail(normalizeEmail(email));
  if (!user) return { success: false, status: 404, error: "User account not found." };
  const updated = await dependencies.update(user.id, { role });
  if (!updated) return { success: false, status: 404, error: "User account not found." };
  return { success: true, user: updated };
}
