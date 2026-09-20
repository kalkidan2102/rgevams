import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { getUsers } from "../services/dataStore.service";

const JWT_SECRET = process.env.JWT_SECRET || "essgi_geomonitor_secure_jwt_secret_key_2025_et";

export interface AuthenticatedRequest extends Request {
  userRole?: string;
  userName?: string;
  userEmail?: string;
  userId?: string;
  userInstitution?: string;
}

export interface JwtPayload {
  email: string;
  name: string;
  role: string;
  institution?: string;
  iat: number;
  exp: number;
}

/**
 * Creates a signed HS256 JSON Web Token
 */
export function createJwtToken(payload: { email: string; name: string; role: string; institution?: string }, expiresInSec = 86400 * 7): string {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSec;

  const fullPayload: JwtPayload = {
    ...payload,
    iat,
    exp
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest("base64url");

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Verifies a HS256 JSON Web Token and returns payload if valid
 */
export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [b64Header, b64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${b64Header}.${b64Payload}`)
      .digest("base64url");

    if (signature !== expectedSig) {
      return null;
    }

    const payloadJson = Buffer.from(b64Payload, "base64url").toString("utf8");
    const payload: JwtPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Middleware: Requires a valid JWT in Authorization header (Bearer <token>)
 * Extracts REAL user and role from server database state
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  let token: string | null = null;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    return res.status(401).json({
      error: "Authentication required. Please log in with valid credentials.",
      code: "NO_TOKEN"
    });
  }

  const payload = verifyJwtToken(token);
  if (!payload || !payload.email) {
    return res.status(401).json({
      error: "Invalid or expired session token. Please re-authenticate.",
      code: "INVALID_TOKEN"
    });
  }

  // Cross-reference with real data store to get current status and role
  const users = getUsers();
  const realUser = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());

  if (!realUser) {
    return res.status(401).json({
      error: "User profile not found in directory. Access revoked.",
      code: "USER_NOT_FOUND"
    });
  }

  if (realUser.status === "rejected") {
    return res.status(403).json({
      error: "Account access has been rejected/suspended by the Super Administrator.",
      code: "ACCOUNT_REJECTED"
    });
  }

  if (realUser.status === "pending") {
    return res.status(403).json({
      error: "Account authorization is pending Super Admin review.",
      code: "ACCOUNT_PENDING"
    });
  }

  // Attach verified user identity from authoritative database
  req.userId = realUser.id || realUser.email;
  req.userEmail = realUser.email;
  req.userName = realUser.name;
  req.userRole = realUser.role;
  req.userInstitution = realUser.institution;

  next();
}

/**
 * Optional Auth middleware: if JWT exists and is valid, populates identity; otherwise defaults to guest
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  let token: string | null = null;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (token) {
    const payload = verifyJwtToken(token);
    if (payload && payload.email) {
      const users = getUsers();
      const realUser = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
      if (realUser && realUser.status === "approved") {
        req.userId = realUser.id || realUser.email;
        req.userEmail = realUser.email;
        req.userName = realUser.name;
        req.userRole = realUser.role;
        req.userInstitution = realUser.institution;
        return next();
      }
    }
  }

  req.userRole = "guest";
  req.userName = "Guest User";
  req.userEmail = "guest@essgi.gov.et";
  next();
}

/**
 * Backward compatibility extractor
 */
export function extractAuthContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  optionalAuth(req, res, next);
}
