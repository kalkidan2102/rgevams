import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireAdminOrAbove, requireSuperAdmin } from "../middleware/roles";
import {
  listUsers,
  getPendingCount,
  approveUserDirect,
  rejectUserDirect,
  approveUserByParam,
  rejectUserByParam,
  unlockUserAccount,
  updateUserRole,
  deleteUser,
  seedTestPending,
  getAlertConfigController,
  updateAlertConfigController,
  getAlertDispatchesController,
  testDispatchAlert,
  dispatchLiveTremorController,
  getAuditLogsController,
  getSmtpStatusController,
  testSmtpConnectionController
} from "../controllers/admin.controller";

const router = Router();

// ============================================================================
// 1. SUPERADMIN EXCLUSIVE ROUTES (Account Governance & Authorization)
// ============================================================================
router.post("/approve-user", requireAuth, requireSuperAdmin, approveUserDirect);
router.post("/reject-user", requireAuth, requireSuperAdmin, rejectUserDirect);
router.put("/users/:email/approve", requireAuth, requireSuperAdmin, approveUserByParam);
router.put("/users/:email/reject", requireAuth, requireSuperAdmin, rejectUserByParam);
router.put("/users/:email/unlock", requireAuth, requireSuperAdmin, unlockUserAccount);
router.put("/users/:email/role", requireAuth, requireSuperAdmin, updateUserRole);
router.delete("/users/:email", requireAuth, requireSuperAdmin, deleteUser);
router.post("/seed-test-pending", requireAuth, requireSuperAdmin, seedTestPending);

// ============================================================================
// 2. ADMIN & SUPERADMIN ROUTES (Operational Monitoring & Alert Thresholds)
// ============================================================================
router.get("/users", requireAuth, requireAdminOrAbove, listUsers);
router.get("/pending-count", requireAuth, requireAdminOrAbove, getPendingCount);
router.get("/alert-config", requireAuth, requireAdminOrAbove, getAlertConfigController);
router.post("/alert-config", requireAuth, requireAdminOrAbove, updateAlertConfigController);
router.get("/alert-dispatches", requireAuth, requireAdminOrAbove, getAlertDispatchesController);
router.post("/test-dispatch", requireAuth, requireAdminOrAbove, testDispatchAlert);

router.get("/audit-logs", requireAuth, requireAdminOrAbove, getAuditLogsController);
router.get("/smtp-status", requireAuth, requireAdminOrAbove, getSmtpStatusController);
router.post("/test-smtp", requireAuth, requireAdminOrAbove, testSmtpConnectionController);

export default router;
