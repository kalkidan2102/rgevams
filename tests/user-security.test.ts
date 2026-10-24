import assert from "node:assert/strict";
import { test } from "node:test";
import bcrypt from "bcryptjs";
import type { UserRecord } from "../src/server/userStore";
import { serializeUser, verifyAndUpgradePassword } from "../src/server/userStore";
import { registerUser } from "../src/server/userRegistration";
import { authenticateUser } from "../src/server/userLogin";
import { requireUserRole } from "../src/server/userAuth";
import { approveUser, changeUserRole, rejectUser } from "../src/server/userAdmin";
import { planImport, validateUsers } from "../scripts/migrate-users";

function storedUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: "person@example.org",
    uid: null,
    email: "person@example.org",
    name: "Test Person",
    role: "official",
    status: "pending",
    institution: "ESSGI",
    password: "$2b$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuu123456789012",
    registeredAt: new Date("2025-01-01T00:00:00.000Z"),
    approvedAt: null,
    approvedBy: null,
    failedLoginAttempts: 0,
    isLocked: false,
    lockUntil: null,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const validRegistration = {
  name: "Test Person",
  email: " Person@Example.org ",
  role: "official",
  password: "correct horse battery",
  confirmPassword: "correct horse battery",
};

test("registration creates a pending account with normalized email and hashed password", async () => {
  let inserted: Record<string, unknown> | undefined;
  const result = await registerUser(validRegistration, {
    findByEmail: async () => undefined,
    hashPassword: async (password) => bcrypt.hash(password, 4),
    insertUser: async (user) => {
      inserted = user;
      return storedUser({ ...user, password: user.password ?? null });
    },
  });

  assert.equal(result.success, true);
  assert.equal(inserted?.email, "person@example.org");
  assert.equal(inserted?.status, "pending");
  assert.equal(inserted?.role, "official");
  assert.equal(await bcrypt.compare("correct horse battery", String(inserted?.password)), true);
});

test("researcher registration is persisted with pending status and a hashed password", async () => {
  let inserted: Record<string, unknown> | undefined;
  const result = await registerUser({ ...validRegistration, role: "researcher" }, {
    findByEmail: async () => undefined,
    hashPassword: async (password) => bcrypt.hash(password, 4),
    insertUser: async (user) => {
      inserted = user;
      return storedUser({ ...user, role: "researcher", password: user.password ?? null });
    },
  });

  assert.equal(result.success, true);
  assert.equal(inserted?.role, "researcher");
  assert.equal(inserted?.status, "pending");
  assert.equal(await bcrypt.compare("correct horse battery", String(inserted?.password)), true);
});

test("registration rejects duplicate email without inserting", async () => {
  let insertCalled = false;
  const result = await registerUser(validRegistration, {
    findByEmail: async () => storedUser(),
    hashPassword: async (password) => password,
    insertUser: async () => {
      insertCalled = true;
      return storedUser();
    },
  });

  assert.deepEqual(result, { success: false, status: 400, error: "Email or ID is already registered." });
  assert.equal(insertCalled, false);
});

test("registration rejects mismatched password confirmation", async () => {
  let lookupCalled = false;
  const result = await registerUser({ ...validRegistration, confirmPassword: "different" }, {
    findByEmail: async () => {
      lookupCalled = true;
      return undefined;
    },
    hashPassword: async (password) => password,
    insertUser: async () => storedUser(),
  });

  assert.deepEqual(result, { success: false, status: 400, error: "Passwords do not match" });
  assert.equal(lookupCalled, false);
});

test("login accepts correct credentials for an approved account", async () => {
  const user = storedUser({ status: "approved" });
  const result = await authenticateUser(" PERSON@example.org ", "correct", {
    findByEmail: async (email) => {
      assert.equal(email, "person@example.org");
      return user;
    },
    verifyPassword: async (_user, password) => password === "correct",
  });

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.user.email, "person@example.org");
});

test("login rejects incorrect credentials", async () => {
  const result = await authenticateUser("person@example.org", "wrong", {
    findByEmail: async () => storedUser({ status: "approved" }),
    verifyPassword: async () => false,
  });

  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.status, 401);
});

test("login blocks pending and rejected accounts after password verification", async () => {
  for (const status of ["pending", "rejected"] as const) {
    const result = await authenticateUser("person@example.org", "correct", {
      findByEmail: async () => storedUser({ status }),
      verifyPassword: async () => true,
    });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.status, 403);
      assert.equal(result.accountStatus, status);
    }
  }
});

test("database lookup failures propagate for sanitized service-unavailable handling", async () => {
  await assert.rejects(authenticateUser("person@example.org", "correct", {
    findByEmail: async () => { throw new Error("database unavailable"); },
    verifyPassword: async () => false,
  }), /database unavailable/);
});

test("public registration rejects admin and superadmin without inserting", async () => {
  for (const role of ["admin", "superadmin"]) {
    let insertCalled = false;
    const result = await registerUser({ ...validRegistration, role }, {
      findByEmail: async () => undefined,
      hashPassword: async (password) => password,
      insertUser: async () => {
        insertCalled = true;
        return storedUser();
      },
    });
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.status, 403);
    assert.equal(insertCalled, false);
  }
});

test("database insert failure propagates for a sanitized HTTP response", async () => {
  await assert.rejects(registerUser(validRegistration, {
    findByEmail: async () => undefined,
    hashPassword: async (password) => password,
    insertUser: async () => { throw new Error("database unavailable"); },
  }), /database unavailable/);
});

test("legacy password is upgraded only after a correct match", async () => {
  const legacy = storedUser({ password: "legacy-password" });
  let savedHash = "";
  const incorrect = await verifyAndUpgradePassword(legacy, "wrong", async () => {
    savedHash = "unexpected";
  });
  assert.equal(incorrect, false);
  assert.equal(savedHash, "");

  const correct = await verifyAndUpgradePassword(legacy, "legacy-password", async (_id, hash) => {
    savedHash = hash;
    return true;
  });
  assert.equal(correct, true);
  assert.notEqual(savedHash, "legacy-password");
  assert.equal(await bcrypt.compare("legacy-password", savedHash), true);
});

test("legacy password login fails when the hash upgrade cannot be persisted", async () => {
  await assert.rejects(
    verifyAndUpgradePassword(storedUser({ password: "legacy-password" }), "legacy-password", async () => undefined),
    /could not be upgraded/,
  );
});

test("API serialization never returns password hashes", () => {
  const safeUser = serializeUser(storedUser());
  assert.equal(Object.hasOwn(safeUser, "password"), false);
});

test("administrator role headers cannot satisfy the superadmin guard", () => {
  const middleware = requireUserRole("superadmin");
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(value: unknown) { this.body = value; return this; },
  };
  let nextCalled = false;
  middleware({
    headers: { "x-user-role": "superadmin" },
    authUser: storedUser({ role: "admin", status: "approved" }),
  } as never, response as never, (() => { nextCalled = true; }) as never);

  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("admin identity is rejected by superadmin-only role guard", () => {
  const middleware = requireUserRole("superadmin");
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(value: unknown) { this.body = value; return this; },
  };
  let nextCalled = false;
  middleware({ authUser: storedUser({ role: "admin", status: "approved" }) } as never,
    response as never, (() => { nextCalled = true; }) as never);
  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("superadmin approval persists approval metadata and requested role", async () => {
  let update: Record<string, unknown> | undefined;
  const result = await approveUser("person@example.org", {
    name: "Root Admin",
    email: "root@example.org",
    role: "superadmin",
  }, "admin", {
    findByEmail: async () => storedUser(),
    update: async (_id, changes) => {
      update = changes;
      return storedUser({ ...changes, status: "approved", role: "admin" });
    },
  });

  assert.equal(result.success, true);
  assert.equal(update?.status, "approved");
  assert.equal(update?.role, "admin");
  assert.equal(update?.approvedBy, "Root Admin (root@example.org)");
});

test("superadmin rejection persists rejected status and protects root account", async () => {
  let update: Record<string, unknown> | undefined;
  const result = await rejectUser("person@example.org", "superadmin", {
    findByEmail: async () => storedUser(),
    update: async (_id, changes) => {
      update = changes;
      return storedUser({ ...changes, status: "rejected" });
    },
  });
  assert.equal(result.success, true);
  assert.equal(update?.status, "rejected");

  const rootResult = await rejectUser("SUPERADMIN@ESSGI.GOV.ET", "superadmin", {
    findByEmail: async () => { throw new Error("must not query root account"); },
    update: async () => undefined,
  });
  assert.equal(rootResult.success, false);
  if (!rootResult.success) assert.equal(rootResult.status, 400);
});

test("admin may approve or reject ordinary pending accounts but cannot grant or reject privileged accounts", async () => {
  const adminActor = { name: "Admin", email: "admin@example.org", role: "admin" };
  let update: Record<string, unknown> | undefined;
  const ordinaryDeps = {
    findByEmail: async () => storedUser({ role: "researcher", status: "pending" }),
    update: async (_id: string, changes: Record<string, unknown>) => {
      update = changes;
      return storedUser({ ...changes, role: "researcher", status: String(changes.status) });
    },
  };

  const approved = await approveUser("person@example.org", adminActor, undefined, ordinaryDeps);
  assert.equal(approved.success, true);
  assert.equal(update?.status, "approved");

  const roleEscalation = await approveUser("person@example.org", adminActor, "admin", ordinaryDeps);
  assert.equal(roleEscalation.success, false);
  if (!roleEscalation.success) assert.equal(roleEscalation.status, 403);

  const privilegedDeps = {
    ...ordinaryDeps,
    findByEmail: async () => storedUser({ role: "admin", status: "pending" }),
  };
  const privilegedApproval = await approveUser("person@example.org", adminActor, undefined, privilegedDeps);
  assert.equal(privilegedApproval.success, false);
  if (!privilegedApproval.success) assert.equal(privilegedApproval.status, 403);

  const privilegedRejection = await rejectUser("person@example.org", "admin", privilegedDeps);
  assert.equal(privilegedRejection.success, false);
  if (!privilegedRejection.success) assert.equal(privilegedRejection.status, 403);

  const ordinaryRejection = await rejectUser("person@example.org", "admin", ordinaryDeps);
  assert.equal(ordinaryRejection.success, true);
});

test("role changes reject invalid roles and database failures", async () => {
  const invalid = await changeUserRole("person@example.org", "super-user", {
    findByEmail: async () => storedUser(),
    update: async () => storedUser(),
  });
  assert.equal(invalid.success, false);
  if (!invalid.success) assert.equal(invalid.status, 400);

  await assert.rejects(changeUserRole("person@example.org", "admin", {
    findByEmail: async () => { throw new Error("database unavailable"); },
    update: async () => storedUser(),
  }), /database unavailable/);
});

test("user migration planning is idempotent for an already-imported hashed record", async () => {
  const source = validateUsers([{
    id: "person@example.org",
    email: "Person@Example.org",
    name: "Test Person",
    role: "official",
    status: "pending",
    institution: "ESSGI",
    password: "legacy-password",
    registeredAt: "2025-01-01T00:00:00.000Z",
    failedLoginAttempts: 0,
    isLocked: false,
  }]);
  const initialPlan = await planImport(source, []);
  assert.equal(initialPlan.insertUsers.length, 1);
  assert.equal(initialPlan.alreadyPresent, 0);

  const target = storedUser({ password: await bcrypt.hash("legacy-password", 4) });
  const rerunPlan = await planImport(source, [target]);
  assert.equal(rerunPlan.insertUsers.length, 0);
  assert.equal(rerunPlan.alreadyPresent, 1);
  assert.equal(rerunPlan.conflicts.length, 0);
});

test("user migration reports conflicting database identities instead of overwriting", async () => {
  const source = validateUsers([{
    id: "new-id",
    email: "person@example.org",
    name: "Different Record",
    role: "official",
    status: "pending",
    institution: "ESSGI",
    password: "legacy-password",
  }]);
  const plan = await planImport(source, [storedUser()]);
  assert.equal(plan.insertUsers.length, 0);
  assert.equal(plan.conflicts.length, 1);
  assert.match(plan.conflicts[0], /database email belongs to a different id/);
});

test("user migration rejects duplicate source emails", () => {
  assert.throws(() => validateUsers([
    { id: "one", email: "same@example.org", name: "One", role: "official", password: "legacy" },
    { id: "two", email: "SAME@example.org", name: "Two", role: "official", password: "legacy" },
  ]), /duplicate source email/);
});
