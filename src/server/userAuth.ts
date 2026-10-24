import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { findUserByEmail, type UserRecord } from "./userStore";

const tokenLifetimeSeconds = 60 * 60 * 8;

declare global {
  namespace Express {
    interface Request {
      authUser?: UserRecord;
    }
  }
}

type TokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || /replace|your[_ -]?secret|example/i.test(secret)) {
    throw new Error("JWT_SECRET must be configured with a unique secret of at least 32 characters");
  }
  return secret;
}

function signature(input: string): Buffer {
  return crypto.createHmac("sha256", getJwtSecret()).update(input).digest();
}

export function createUserToken(user: Pick<UserRecord, "id" | "email">): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    iat: now,
    exp: now + tokenLifetimeSeconds,
  } satisfies TokenPayload)).toString("base64url");
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${signature(unsigned).toString("base64url")}`;
}

function verifyUserToken(token: string): TokenPayload | null {
  try {
    const [encodedHeader, encodedPayload, encodedSignature, extra] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature || extra) return null;

    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const expected = signature(`${encodedHeader}.${encodedPayload}`);
    const actual = Buffer.from(encodedSignature, "base64url");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.sub !== "string" || typeof payload.email !== "string"
      || !Number.isFinite(payload.exp) || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

export const requireUserAuth: RequestHandler = (req, res, next) => {
  void (async () => {
    const authHeader = req.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const payload = verifyUserToken(token);
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
      return;
    }

    const user = await findUserByEmail(payload.email);
    if (!user || user.id !== payload.sub) {
      res.status(401).json({ error: "User account was not found." });
      return;
    }
    if (user.status !== "approved") {
      res.status(403).json({
        error: user.status === "pending" ? "Account approval is pending." : "Account access has been rejected.",
        status: user.status,
      });
      return;
    }

    req.authUser = user;
    next();
  })().catch(() => {
    if (!res.headersSent) res.status(503).json({ error: "Authentication service is temporarily unavailable." });
  });
};

export function requireUserRole(...roles: string[]): RequestHandler {
  return (req, res, next) => {
    if (!req.authUser || !roles.includes(req.authUser.role)) {
      res.status(403).json({ error: "Insufficient privileges for this operation." });
      return;
    }
    next();
  };
}
