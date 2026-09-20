import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

export type RoleLevel = "guest" | "researcher" | "official" | "admin" | "superadmin";

const ROLE_HIERARCHY: Record<string, number> = {
  guest: 0,
  researcher: 1,
  scientist: 1, // alias for researcher/scientist
  official: 2,
  staff: 2, // alias for official staff
  admin: 3,
  superadmin: 4
};

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = (req.userRole || "guest").toLowerCase();
    
    // Superadmin has access to everything
    if (role === "superadmin") {
      return next();
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of [${allowedRoles.join(", ")}] clearance.`
      });
    }
    next();
  };
}

export function requireMinRole(minRole: RoleLevel) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = (req.userRole || "guest").toLowerCase();
    const userLevel = ROLE_HIERARCHY[role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: `Access denied. Requires minimum [${minRole.toUpperCase()}] clearance level.`
      });
    }
    next();
  };
}

export const requireResearcherOrAbove = requireMinRole("researcher");
export const requireOfficialOrAbove = requireMinRole("official");
export const requireAdminOrAbove = requireMinRole("admin");
export const requireSuperAdmin = requireRole(["superadmin"]);
export const requireAdminOrSuper = requireRole(["admin", "superadmin"]);

