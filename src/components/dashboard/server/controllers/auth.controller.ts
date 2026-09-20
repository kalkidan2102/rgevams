import { Request, Response } from "express";
import { 
  getPostgresUsers, 
  upsertPostgresUser, 
  savePostgresAuditLog 
} from "../Services/postgres.services";
import { createJwtToken, AuthenticatedRequest } from "../middleware/auth";
import { hashPassword, verifyPassword, sanitizeUser } from "../utils/crypto.ts";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Public User Registration
 * Enforces strong password policy, hashes password via bcrypt,
 * and sets non-guest users to 'pending' status awaiting Super Admin authorization.
 */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, role, institution, password, confirmPassword } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({
        error: "Missing required registration parameters (name, email, role, password).",
        code: "INVALID_INPUT"
      });
    }

    // Strong password policy (min 8 chars)
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        error: "Security Policy: Password must be at least 8 characters in length.",
        code: "WEAK_PASSWORD"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match.",
        code: "PASSWORD_MISMATCH"
      });
    }

    // Normalize role and validate
    const requestedRole = String(role).toLowerCase().trim();
    const validRoles = ["guest", "official", "admin", "researcher", "scientist", "staff"];
    
    if (!validRoles.includes(requestedRole)) {
      return res.status(400).json({
        error: "Invalid role requested. Valid self-registration roles: guest, official, admin.",
        code: "INVALID_ROLE"
      });
    }

    // Prevent self-registration as SuperAdmin
    if (requestedRole === "superadmin") {
      return res.status(403).json({
        error: "Privilege Escalation Blocked: The Super Administrator role cannot be self-registered.",
        code: "PRIVILEGE_ESCALATION_BLOCKED"
      });
    }

    // Map legacy role aliases to core roles
    const normalizedRole = requestedRole === "staff" || requestedRole === "scientist" || requestedRole === "researcher"
      ? "official"
      : requestedRole;

    const users = await getPostgresUsers();
    const emailLower = email.toLowerCase().trim();
    const exists = users.some((u) => u.email.toLowerCase() === emailLower);

    if (exists) {
      return res.status(400).json({
        error: "An account with this email is already registered in the system.",
        code: "EMAIL_ALREADY_EXISTS"
      });
    }

    // Securely hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Guests are auto-approved; all privileged personnel (official, admin) require Super Admin authorization
    const status = normalizedRole === "guest" ? "approved" : "pending";

    const newUser = {
      id: emailLower,
      name: name.trim(),
      email: emailLower,
      role: normalizedRole as any,
      status: status as "pending" | "approved" | "rejected",
      institution: institution ? institution.trim() : (normalizedRole === "admin" ? "ESSGI Directorate" : "Ethiopian Space Science and Geospatial Institute"),
      password: hashedPassword,
      registeredAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      isLocked: false
    };

    const saved = await upsertPostgresUser(newUser);
    if (!saved) {
      return res.status(500).json({ error: "Failed to create user record in database." });
    }

    // Record audit log for security accountability
    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "register_request",
      performedBy: newUser.name,
      performedByEmail: newUser.email,
      performedByRole: newUser.role,
      details: `Registration request submitted by ${newUser.name} (${newUser.email}) for role [${newUser.role.toUpperCase()}]. Status: [${status.toUpperCase()}].${status === "pending" ? " Awaiting Super Admin authorization." : " Auto-approved as guest."}`,
      timestamp: new Date().toISOString()
    });

    // Only auto-approved guest accounts receive immediate JWT tokens; pending accounts must wait
    const token = status === "approved"
      ? createJwtToken({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          institution: newUser.institution
        })
      : undefined;

    res.status(201).json({
      success: true,
      requiresApproval: status === "pending",
      message: status === "pending"
        ? `Registration submitted successfully! Your account application for '${newUser.role.toUpperCase()}' clearance is currently PENDING Super Administrator approval.`
        : `Registration successful! You are authorized with '${newUser.role.toUpperCase()}' clearance.`,
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error during registration", details: error.message });
  }
}

/**
 * User Authentication (Login)
 * Validates credentials via bcrypt, enforces lockout upon 5 failed attempts,
 * checks approval status, and issues HMAC-SHA256 signed JWT tokens.
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing email/ID or password credentials.",
        code: "INVALID_CREDENTIALS_FORMAT"
      });
    }

    const emailLower = String(email).toLowerCase().trim();
    const users = await getPostgresUsers();
    const user = users.find((u) => u.email.toLowerCase() === emailLower);

    if (!user) {
      // Audit failed attempt for non-existent email
      await savePostgresAuditLog({
        id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        action: "auth_failed_unknown_user",
        performedBy: "Anonymous / Unknown",
        performedByEmail: emailLower,
        performedByRole: "unauthenticated",
        details: `Failed login attempt for non-existent email: ${emailLower}.`,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        error: "Invalid email or password. Please verify your credentials or register.",
        code: "AUTH_FAILED"
      });
    }

    // 1. Account Lockout Check
    if (user.isLocked) {
      if (user.lockUntil) {
        const lockExpiry = new Date(user.lockUntil).getTime();
        const now = Date.now();
        if (now < lockExpiry) {
          const remainingMinutes = Math.max(1, Math.ceil((lockExpiry - now) / 60000));
          return res.status(423).json({
            error: `Security Lockout: This account is locked due to ${MAX_FAILED_ATTEMPTS} consecutive failed attempts. Try again in ${remainingMinutes} minute(s) or contact the Super Administrator.`,
            code: "ACCOUNT_LOCKED",
            isLocked: true,
            lockUntil: user.lockUntil,
            remainingMinutes
          });
        } else {
          // Lockout expired -> automatically reset
          user.isLocked = false;
          user.failedLoginAttempts = 0;
          user.lockUntil = undefined;
          await upsertPostgresUser(user);
        }
      } else {
        return res.status(423).json({
          error: `Security Lockout: This account has been locked by system policy. Please contact the Super Administrator.`,
          code: "ACCOUNT_LOCKED",
          isLocked: true
        });
      }
    }

    // 2. Validate Password via bcrypt
    const isPasswordValid = await verifyPassword(password, user.password || "");

    if (!isPasswordValid) {
      const newFailedCount = (user.failedLoginAttempts || 0) + 1;
      user.failedLoginAttempts = newFailedCount;

      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
        await upsertPostgresUser(user);

        await savePostgresAuditLog({
          id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          action: "auth_account_locked",
          performedBy: user.name,
          performedByEmail: user.email,
          performedByRole: user.role,
          details: `Account for ${user.name} (${user.email}) has been LOCKED for 15 minutes after ${MAX_FAILED_ATTEMPTS} consecutive failed authentication attempts.`,
          timestamp: new Date().toISOString()
        });

        return res.status(423).json({
          error: `Security Lockout: 5 consecutive failed attempts detected. Account is now LOCKED for 15 minutes to mitigate brute-force attacks. Contact Super Administrator to unlock immediately.`,
          code: "ACCOUNT_LOCKED",
          isLocked: true,
          failedAttempts: MAX_FAILED_ATTEMPTS,
          remainingAttempts: 0
        });
      } else {
        await upsertPostgresUser(user);
        const remaining = MAX_FAILED_ATTEMPTS - newFailedCount;

        await savePostgresAuditLog({
          id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          action: "auth_failed",
          performedBy: user.name,
          performedByEmail: user.email,
          performedByRole: user.role,
          details: `Failed authentication attempt for ${user.name} (${user.email}). Attempt ${newFailedCount}/${MAX_FAILED_ATTEMPTS}.`,
          timestamp: new Date().toISOString()
        });

        return res.status(401).json({
          error: `Invalid credentials. ${remaining} attempt(s) remaining before security lockout.`,
          code: "INVALID_CREDENTIALS",
          failedAttempts: newFailedCount,
          remainingAttempts: remaining
        });
      }
    }

    // 3. Authorization Check: Pending Status
    if (user.status === "pending") {
      await savePostgresAuditLog({
        id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        action: "auth_denied_pending",
        performedBy: user.name,
        performedByEmail: user.email,
        performedByRole: user.role,
        details: `Authentication blocked for ${user.name} (${user.email}): Account is currently pending Super Admin review.`,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: `Account Pending Authorization: Your account registration for '${user.role.toUpperCase()}' clearance is awaiting Super Administrator approval.`,
        code: "ACCOUNT_PENDING",
        status: "pending"
      });
    }

    // 4. Authorization Check: Rejected Status
    if (user.status === "rejected") {
      await savePostgresAuditLog({
        id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        action: "auth_denied_rejected",
        performedBy: user.name,
        performedByEmail: user.email,
        performedByRole: user.role,
        details: `Authentication blocked for ${user.name} (${user.email}): Account registration has been rejected.`,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        error: "Access Denied: Your account authorization request has been rejected by the Super Administrator.",
        code: "ACCOUNT_REJECTED",
        status: "rejected"
      });
    }

    // 5. Successful Authentication: Reset counters & ensure hash upgrade
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;

    // Upgrade legacy unhashed password if needed
    if (user.password && !user.password.startsWith("$2a$") && !user.password.startsWith("$2b$") && !user.password.startsWith("$2y$")) {
      user.password = await hashPassword(password);
    }

    await upsertPostgresUser(user);

    // Generate cryptographic JWT session token (24-hour expiration)
    const token = createJwtToken({
      email: user.email,
      name: user.name,
      role: user.role,
      institution: user.institution
    });

    // Record successful login audit log
    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "auth_login_success",
      performedBy: user.name,
      performedByEmail: user.email,
      performedByRole: user.role,
      details: `User ${user.name} (${user.email}) successfully authenticated with [${user.role.toUpperCase()}] clearance.`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Authentication successful. Clearance granted: [${user.role.toUpperCase()}].`,
      token,
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error during authentication", details: error.message });
  }
}

/**
 * Get Verified Current User Profile
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userEmail) {
      return res.status(401).json({ error: "Unauthenticated session.", code: "UNAUTHENTICATED" });
    }

    const users = await getPostgresUsers();
    const user = users.find((u) => u.email.toLowerCase() === req.userEmail!.toLowerCase());

    if (!user) {
      return res.status(404).json({ error: "User record not found in system.", code: "USER_NOT_FOUND" });
    }

    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve user profile from database", details: error.message });
  }
}

/**
 * Logout
 */
export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.userEmail) {
      await savePostgresAuditLog({
        id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        action: "auth_logout",
        performedBy: req.userName || "User",
        performedByEmail: req.userEmail,
        performedByRole: req.userRole || "guest",
        details: `User ${req.userName || req.userEmail} logged out of session.`,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error: any) {
    res.status(500).json({ error: "Server error during logout", details: error.message });
  }
}
