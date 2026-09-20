import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { 
  getPostgresUsers, 
  upsertPostgresUser, 
  deletePostgresUser, 
  getPostgresAuditLogs, 
  savePostgresAuditLog, 
  getPostgresAlertConfig, 
  savePostgresAlertConfig, 
  getPostgresAlertDispatches, 
  savePostgresAlertDispatch 
} from "../services/postgres.service";
import { defaultAlertConfig, IAlertDispatch } from "../models/Alert";
import { sanitizeUser } from "../utils/crypto";
import { generateSmartTremorAlert, calculateTectonicSummary } from "../services/alert.service";
import { sendOfficialAlertEmail, getSmtpStatus, testSmtpConnection } from "../services/email.service";

export async function listUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const rawUsers = await getPostgresUsers();
    const users = rawUsers.map((u) => sanitizeUser({
      id: u.id || u.email,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status || "approved",
      institution: u.institution,
      registeredAt: u.registeredAt || new Date().toISOString(),
      approvedAt: u.approvedAt,
      approvedBy: u.approvedBy,
      failedLoginAttempts: u.failedLoginAttempts || 0,
      isLocked: u.isLocked || false,
      lockUntil: u.lockUntil
    }));

    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to list users from database", details: error.message });
  }
}

export async function getPendingCount(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await getPostgresUsers();
    const pendingUsers = users.filter((u) => u.status === "pending");
    res.json({
      success: true,
      pendingCount: pendingUsers.length,
      pendingUsers: pendingUsers.map((u) => sanitizeUser({
        id: u.id || u.email,
        name: u.name,
        email: u.email,
        role: u.role,
        institution: u.institution,
        registeredAt: u.registeredAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch pending user count", details: error.message });
  }
}

export async function approveUserDirect(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, role } = req.body;
    const targetEmail = (email || "").toLowerCase().trim();
    const performerName = req.userName || "Super Administrator";
    const performerEmail = req.userEmail || "superadmin@essgi.gov.et";
    const performerRole = req.userRole || "superadmin";

    const users = await getPostgresUsers();
    const targetUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!targetUser) {
      return res.status(404).json({ error: "User account not found.", code: "USER_NOT_FOUND" });
    }

    targetUser.status = "approved";
    if (role) {
      targetUser.role = role;
    }
    targetUser.approvedAt = new Date().toISOString();
    targetUser.approvedBy = `${performerName} (${performerEmail})`;
    
    await upsertPostgresUser(targetUser);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "approve_user",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Authorized user account: ${targetUser.name} (${targetUser.email}) with clearance [${targetUser.role.toUpperCase()}].`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User ${targetEmail} authorized successfully with [${targetUser.role.toUpperCase()}] clearance.`,
      user: sanitizeUser(targetUser)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to approve user in database", details: error.message });
  }
}

export async function rejectUserDirect(req: AuthenticatedRequest, res: Response) {
  try {
    const { email } = req.body;
    const targetEmail = (email || "").toLowerCase().trim();
    const performerName = req.userName || "Super Administrator";
    const performerEmail = req.userEmail || "superadmin@essgi.gov.et";
    const performerRole = req.userRole || "superadmin";

    const users = await getPostgresUsers();
    const targetUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!targetUser) {
      return res.status(404).json({ error: "User account not found.", code: "USER_NOT_FOUND" });
    }

    // Prevent rejecting the primary superadmin
    if (targetEmail === "superadmin@essgi.gov.et") {
      return res.status(400).json({ error: "Cannot reject the root Super Administrator account.", code: "IMMUTABLE_ROOT_ACCOUNT" });
    }

    targetUser.status = "rejected";
    await upsertPostgresUser(targetUser);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "reject_user",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Rejected clearance request for user account: ${targetUser.name} (${targetUser.email}).`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User ${targetEmail} registration rejected.`,
      user: sanitizeUser(targetUser)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reject user in database", details: error.message });
  }
}

export async function approveUserByParam(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Super Administrator";
    const performerEmail = req.userEmail || "superadmin@essgi.gov.et";
    const performerRole = req.userRole || "superadmin";

    const targetEmail = req.params.email.toLowerCase().trim();
    const users = await getPostgresUsers();
    const targetUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!targetUser) {
      return res.status(404).json({ error: "User account not found.", code: "USER_NOT_FOUND" });
    }

    targetUser.status = "approved";
    targetUser.approvedAt = new Date().toISOString();
    targetUser.approvedBy = `${performerName} (${performerEmail})`;

    await upsertPostgresUser(targetUser);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "approve_user",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Approved clearance for user account: ${targetUser.name} (${targetUser.email}) with clearance [${targetUser.role.toUpperCase()}].`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User '${targetUser.name}' approved successfully.`,
      user: sanitizeUser(targetUser)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to approve user in database", details: error.message });
  }
}

export async function rejectUserByParam(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Super Administrator";
    const performerEmail = req.userEmail || "superadmin@essgi.gov.et";
    const performerRole = req.userRole || "superadmin";

    const targetEmail = req.params.email.toLowerCase().trim();
    const users = await getPostgresUsers();
    const targetUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!targetUser) {
      return res.status(404).json({ error: "User account not found.", code: "USER_NOT_FOUND" });
    }

    if (targetEmail === "superadmin@essgi.gov.et") {
      return res.status(400).json({ error: "Cannot reject the root Super Administrator account.", code: "IMMUTABLE_ROOT_ACCOUNT" });
    }

    targetUser.status = "rejected";
    await upsertPostgresUser(targetUser);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "reject_user",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Rejected clearance request for user: ${targetUser.name} (${targetUser.email}).`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User '${targetUser.name}' request rejected.`,
      user: sanitizeUser(targetUser)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reject user in database", details: error.message });
  }
}

export async function unlockUserAccount(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Super Administrator";
    const performerEmail = req.userEmail || "superadmin@essgi.gov.et";
    const performerRole = req.userRole || "superadmin";

    const targetEmail = req.params.email.toLowerCase().trim();
    const users = await getPostgresUsers();
    const targetUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!targetUser) {
      return res.status(404).json({ error: "User account not found.", code: "USER_NOT_FOUND" });
    }

    targetUser.isLocked = false;
    targetUser.failedLoginAttempts = 0;
    targetUser.lockUntil = undefined;
    await upsertPostgresUser(targetUser);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "unlock_user",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Manually unlocked account and reset failed attempts to 0 for: ${targetUser.name} (${targetUser.email}).`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Account '${targetUser.name}' has been unlocked and failed login attempts reset to 0.`,
      user: sanitizeUser(targetUser)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to unlock user account in database", details: error.message });
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Super Administrator";
    const performerEmail = req.userEmail || "superadmin@essgi.gov.et";
    const performerRole = req.userRole || "superadmin";

    const { role } = req.body;
    const validRoles = ["guest", "official", "admin", "superadmin"];
    const targetRole = String(role || "").toLowerCase().trim();

    if (!validRoles.includes(targetRole)) {
      return res.status(400).json({
        error: "Invalid role specified. Allowed roles: guest, official, admin, superadmin.",
        code: "INVALID_ROLE"
      });
    }

    const targetEmail = req.params.email.toLowerCase().trim();
    const users = await getPostgresUsers();
    const targetUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!targetUser) {
      return res.status(404).json({ error: "User account not found.", code: "USER_NOT_FOUND" });
    }

    const oldRole = targetUser.role;
    targetUser.role = targetRole as any;
    await upsertPostgresUser(targetUser);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "change_role",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Changed clearance role for ${targetUser.name} (${targetUser.email}) from [${String(oldRole).toUpperCase()}] to [${targetRole.toUpperCase()}].`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User '${targetUser.name}' role changed to ${targetRole.toUpperCase()}.`,
      user: sanitizeUser(targetUser)
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update user role in database", details: error.message });
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Super Administrator";
    const performerEmail = req.userEmail || "superadmin@essgi.gov.et";
    const performerRole = req.userRole || "superadmin";

    const targetEmail = req.params.email.toLowerCase().trim();
    
    if (targetEmail === "superadmin@essgi.gov.et") {
      return res.status(400).json({
        error: "Root Super Administrator account cannot be deleted.",
        code: "IMMUTABLE_ROOT_ACCOUNT"
      });
    }

    const users = await getPostgresUsers();
    const userToDelete = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!userToDelete) {
      return res.status(404).json({ error: "User account not found.", code: "USER_NOT_FOUND" });
    }

    await deletePostgresUser(targetEmail);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "delete_user",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(performerRole),
      details: `Deleted user account from directory: ${userToDelete.name} (${userToDelete.email}).`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Account '${userToDelete.name}' removed successfully.`
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete user in database", details: error.message });
  }
}

export async function seedTestPending(req: AuthenticatedRequest, res: Response) {
  try {
    const sampleNames = ["Dr. Belayneh Assefa", "Eng. Rahel Wolde", "Girma Dejene", "Dr. Solomon Tadesse"];
    const sampleInst = ["Addis Ababa University", "Semera University", "Hawassa Geothermal Lab", "DRMC Central Command"];
    const roles: Array<"official" | "admin"> = ["official", "admin"];

    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomInst = sampleInst[Math.floor(Math.random() * sampleInst.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const email = `test.pending_${Date.now()}@essgi.gov.et`;

    const newUser = {
      id: email,
      name: randomName,
      email: email,
      role: randomRole as any,
      status: "pending" as const,
      institution: randomInst,
      password: "PendingPasswordHash2026",
      registeredAt: new Date().toISOString(),
      failedLoginAttempts: 0,
      isLocked: false
    };

    await upsertPostgresUser(newUser);

    res.json({ success: true, message: "Demo pending registration created for testing authorization workflow.", user: sanitizeUser(newUser) });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to seed demo pending user in database", details: error.message });
  }
}

export async function getAlertConfigController(req: AuthenticatedRequest, res: Response) {
  try {
    const config = (await getPostgresAlertConfig()) || defaultAlertConfig;
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch alert config from database", details: error.message });
  }
}

export async function updateAlertConfigController(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Administrator";
    const performerEmail = req.userEmail || "admin@essgi.gov.et";
    const userRole = req.userRole || "admin";

    const existing = (await getPostgresAlertConfig()) || defaultAlertConfig;
    const {
      minMagnitude,
      maxDepth,
      depthThreshold,
      emailAlertsEnabled,
      smsAlertsEnabled,
      alertRecipientsEmail,
      alertRecipientsPhone,
      targetRegions,
      autoDispatchOnCritical,
      severityFilter,
      smsTemplateText,
      emailSubjectTemplate
    } = req.body;

    const updatedConfig = {
      ...existing,
      minMagnitude: typeof minMagnitude === "number" ? minMagnitude : (parseFloat(minMagnitude) || existing.minMagnitude),
      maxDepth: typeof maxDepth === "number" ? maxDepth : (parseFloat(maxDepth) || existing.maxDepth),
      depthThreshold: typeof depthThreshold === "number" ? depthThreshold : (typeof maxDepth === "number" ? maxDepth : existing.depthThreshold),
      emailAlertsEnabled: typeof emailAlertsEnabled === "boolean" ? emailAlertsEnabled : existing.emailAlertsEnabled,
      smsAlertsEnabled: typeof smsAlertsEnabled === "boolean" ? smsAlertsEnabled : existing.smsAlertsEnabled,
      alertRecipientsEmail: Array.isArray(alertRecipientsEmail) ? alertRecipientsEmail : existing.alertRecipientsEmail,
      alertRecipientsPhone: Array.isArray(alertRecipientsPhone) ? alertRecipientsPhone : existing.alertRecipientsPhone,
      targetRegions: Array.isArray(targetRegions) ? targetRegions : existing.targetRegions,
      autoDispatchOnCritical: typeof autoDispatchOnCritical === "boolean" ? autoDispatchOnCritical : existing.autoDispatchOnCritical,
      severityFilter: severityFilter || existing.severityFilter,
      smsTemplateText: smsTemplateText || existing.smsTemplateText,
      emailSubjectTemplate: emailSubjectTemplate || existing.emailSubjectTemplate,
      updatedAt: new Date().toISOString(),
      updatedBy: `${performerName} (${performerEmail})`
    };

    await savePostgresAlertConfig(updatedConfig);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "config_alert_thresholds",
      volcanoId: "config_alert_thresholds",
      volcanoName: "National Alert Thresholds",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(userRole),
      details: `Updated automated geohazard alert parameters: Magnitude Threshold ≥ M${updatedConfig.minMagnitude}, Focal Depth ≤ ${updatedConfig.maxDepth}km, SMS: ${updatedConfig.smsAlertsEnabled ? "ENABLED" : "DISABLED"}, Email: ${updatedConfig.emailAlertsEnabled ? "ENABLED" : "DISABLED"}.`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Alert threshold configuration updated successfully. Trigger parameters: M ≥ ${updatedConfig.minMagnitude}, Depth ≤ ${updatedConfig.maxDepth} km.`,
      config: updatedConfig
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update alert config in database", details: error.message });
  }
}

export async function getAlertDispatchesController(req: AuthenticatedRequest, res: Response) {
  try {
    const dispatches = await getPostgresAlertDispatches();
    res.json({ success: true, count: dispatches.length, dispatches });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch alert dispatches from database", details: error.message });
  }
}

export async function testDispatchAlert(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Administrator";
    const performerEmail = req.userEmail || "admin@essgi.gov.et";
    const userRole = req.userRole || "admin";

    const config = (await getPostgresAlertConfig()) || defaultAlertConfig;
    const { testEvent } = req.body;

    const mag = parseFloat(testEvent?.magnitude) || parseFloat(config.minMagnitude as any) || 4.8;
    const depth = parseFloat(testEvent?.depth) || parseFloat(config.maxDepth as any) || 10;
    const loc = testEvent?.location || "Afar Depression / Semera Graben";
    const sev = testEvent?.severity || (mag >= 5.0 ? "Red" : "Orange");
    const coords = Array.isArray(testEvent?.coordinates) && testEvent.coordinates.length === 2 
      ? testEvent.coordinates 
      : [11.79, 41.00];

    const eventToAnalyze = {
      id: testEvent?.id || `test_${Date.now()}`,
      magnitude: mag,
      depth,
      location: loc,
      coordinates: coords,
      dateTime: testEvent?.dateTime || new Date().toISOString(),
      severity: sev
    };

    const smartAlert = generateSmartTremorAlert(eventToAnalyze, config);
    const eventTitle = testEvent?.title || `M ${mag.toFixed(1)} Seismic Tremor near ${loc}`;

    const allRecipients = [
      ...(config.emailAlertsEnabled ? config.alertRecipientsEmail : []),
      ...(config.smsAlertsEnabled ? config.alertRecipientsPhone : [])
    ];

    let emailResult: any = null;
    let deliveryStatus: "SENT" | "SIMULATED" | "FAILED" = "SIMULATED";
    let deliveryMsg = "";
    if (config.emailAlertsEnabled && config.alertRecipientsEmail.length > 0) {
      try {
        emailResult = await sendOfficialAlertEmail({
          to: config.alertRecipientsEmail,
          subject: smartAlert.emailSubject,
          html: smartAlert.emailHtml,
          text: `${smartAlert.smsEn}\n\n${smartAlert.smsAm}\n\nInteractive Telemetry: ${smartAlert.telemetryLink}`,
        });
        if (emailResult.delivered && !emailResult.simulated) {
          deliveryStatus = "SENT";
          deliveryMsg = `Delivered to ${emailResult.recipientCount} inboxes via SMTP.`;
        } else if (!emailResult.delivered) {
          deliveryStatus = "FAILED";
          deliveryMsg = `Email delivery failed: ${emailResult.error || emailResult.message}.`;
        } else {
          deliveryStatus = "SIMULATED";
          deliveryMsg = `Simulated dispatch for ${config.alertRecipientsEmail.length} emails.`;
        }
      } catch (e: any) {
        console.error("Failed to send test alert email:", e);
        deliveryStatus = "FAILED";
        deliveryMsg = `Email dispatch error: ${e.message}.`;
      }
    } else {
      deliveryStatus = "SIMULATED";
      deliveryMsg = "Email alerts disabled or empty recipient list.";
    }

    const newDispatch: IAlertDispatch = {
      id: "disp_" + Date.now(),
      eventId: "test_" + Date.now(),
      type: config.emailAlertsEnabled && config.smsAlertsEnabled ? "both" : config.emailAlertsEnabled ? "email" : "sms",
      eventTitle,
      magnitude: mag,
      depth,
      location: loc,
      severity: sev,
      recipientsCount: allRecipients.length,
      recipients: allRecipients,
      status: deliveryStatus,
      timestamp: new Date().toISOString(),
      details: `Test dispatch verified by ${performerName} (${performerEmail}). Proximity: ${smartAlert.tectonic.proximityText}. Zone: ${smartAlert.tectonic.riftZone}. Status: ${deliveryStatus} - ${deliveryMsg} Broadcasted to ${config.alertRecipientsEmail.length} emails and ${config.alertRecipientsPhone.length} SMS endpoints.`
    };

    await savePostgresAlertDispatch(newDispatch);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "test_alert_dispatch",
      volcanoId: "test_dispatch",
      volcanoName: "Simulated Alert Dispatch",
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(userRole),
      details: `Triggered test alert dispatch simulation for event: "${eventTitle}" to ${allRecipients.length} recipients. Delivery Status: ${deliveryStatus}. Email delivery: ${emailResult ? (emailResult.simulated ? "simulated" : "live delivered") : "disabled"}.`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: emailResult && !emailResult.simulated
        ? `Live official email alert sent to ${emailResult.recipientCount} inboxes and simulated SMS dispatched!`
        : `Smart alert simulation dispatched successfully to ${allRecipients.length} endpoints!`,
      dispatch: newDispatch,
      smartAlert,
      emailDelivery: emailResult,
      preview: {
        smsText: smartAlert.smsEn,
        smsAm: smartAlert.smsAm,
        emailSubject: smartAlert.emailSubject,
        emailHtml: smartAlert.emailHtml,
        emailCount: config.alertRecipientsEmail.length,
        smsCount: config.alertRecipientsPhone.length,
        recipientsEmail: config.alertRecipientsEmail,
        recipientsPhone: config.alertRecipientsPhone,
        tectonic: smartAlert.tectonic
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to dispatch test alert in database", details: error.message });
  }
}

export async function dispatchLiveTremorController(req: AuthenticatedRequest, res: Response) {
  try {
    const performerName = req.userName || "Duty Seismologist";
    const performerEmail = req.userEmail || "duty.seismologist@essgi.gov.et";
    const userRole = req.userRole || "official";

    const config = (await getPostgresAlertConfig()) || defaultAlertConfig;
    const { earthquake, triggerSource, customPhone, customEmail } = req.body;

    if (!earthquake || typeof earthquake.magnitude !== "number") {
      return res.status(400).json({ error: "Valid earthquake object with magnitude is required." });
    }

    const smartAlert = generateSmartTremorAlert(earthquake, config);

    const phones = [...config.alertRecipientsPhone];
    if (customPhone && !phones.includes(customPhone)) {
      phones.push(customPhone);
    }

    const emails = [...config.alertRecipientsEmail];
    if (customEmail && !emails.includes(customEmail)) {
      emails.push(customEmail);
    }

    const allRecipients = [
      ...(config.emailAlertsEnabled ? emails : []),
      ...(config.smsAlertsEnabled ? phones : [])
    ];

    const eventId = earthquake.id || smartAlert.eventId;

    let emailResult: any = null;
    let deliveryStatus: "SENT" | "SIMULATED" | "FAILED" = "SIMULATED";
    let deliveryMsg = "";
    if (config.emailAlertsEnabled && emails.length > 0) {
      try {
        emailResult = await sendOfficialAlertEmail({
          to: emails,
          subject: smartAlert.emailSubject,
          html: smartAlert.emailHtml,
          text: `${smartAlert.smsEn}\n\n${smartAlert.smsAm}\n\nInteractive Telemetry: ${smartAlert.telemetryLink}`,
        });
        if (emailResult.delivered && !emailResult.simulated) {
          deliveryStatus = "SENT";
          deliveryMsg = `Transmitted to ${emailResult.recipientCount} inboxes via SMTP.`;
        } else if (!emailResult.delivered) {
          deliveryStatus = "FAILED";
          deliveryMsg = `Email delivery failed: ${emailResult.error || emailResult.message}.`;
        } else {
          deliveryStatus = "SIMULATED";
          deliveryMsg = `Simulated bulletin archived for ${emails.length} recipients.`;
        }
      } catch (e: any) {
        console.error("Failed to send live tremor email alert:", e);
        deliveryStatus = "FAILED";
        deliveryMsg = `Email delivery error: ${e.message}.`;
      }
    } else {
      deliveryStatus = "SIMULATED";
      deliveryMsg = "Email alerts disabled or 0 email targets.";
    }

    const newDispatch: IAlertDispatch = {
      id: "disp_live_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      eventId,
      type: config.emailAlertsEnabled && config.smsAlertsEnabled ? "both" : config.emailAlertsEnabled ? "email" : "sms",
      eventTitle: `M ${smartAlert.magnitude.toFixed(1)} Seismic Tremor - ${smartAlert.location}`,
      magnitude: smartAlert.magnitude,
      depth: smartAlert.depth,
      location: smartAlert.location,
      severity: smartAlert.magnitude >= 5.5 ? "Red" : "Orange",
      recipientsCount: allRecipients.length,
      recipients: allRecipients,
      status: deliveryStatus,
      timestamp: new Date().toISOString(),
      details: `Live USGS geohazard dispatch (${triggerSource || "manual_duty"}): Triggered by ${performerName}. Magnitude M ${smartAlert.magnitude.toFixed(1)} at depth ${smartAlert.depth}km (${smartAlert.tectonic.proximityText}). Delivery: ${deliveryStatus} - ${deliveryMsg} Generated bilingual SMS and official HTML bulletin to ${phones.length} SMS endpoints and ${emails.length} email distribution lists.`
    };

    await savePostgresAlertDispatch(newDispatch);

    await savePostgresAuditLog({
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      action: "smart_live_tremor_dispatch",
      volcanoId: earthquake.id || smartAlert.eventId,
      volcanoName: `USGS Tremor M ${smartAlert.magnitude.toFixed(1)} (${smartAlert.location})`,
      performedBy: String(performerName),
      performedByEmail: String(performerEmail),
      performedByRole: String(userRole),
      details: `Live USGS tremor dispatch executed for M ${smartAlert.magnitude.toFixed(1)} in "${smartAlert.location}". Broadcasted to ${phones.length} phones & ${emails.length} emails. Email delivery: ${emailResult ? (emailResult.simulated ? "simulated" : "live delivered") : "disabled"}.`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: emailResult && !emailResult.simulated
        ? `Live tremor bulletin emailed to ${emailResult.recipientCount} officials and SMS broadcast triggered!`
        : `Live USGS tremor smart alert dispatched to ${allRecipients.length} endpoints!`,
      dispatch: newDispatch,
      smartAlert,
      emailDelivery: emailResult,
      stats: {
        phonesCount: phones.length,
        emailsCount: emails.length,
        totalRecipients: allRecipients.length,
        carrierBreakdown: {
          ethioTelecom: phones.filter(p => p.startsWith("+2519") || p.startsWith("09") || p.startsWith("2519")).length,
          safaricom: phones.filter(p => p.startsWith("+2517") || p.startsWith("07") || p.startsWith("2517")).length,
          other: phones.filter(p => !p.startsWith("+2519") && !p.startsWith("09") && !p.startsWith("2519") && !p.startsWith("+2517") && !p.startsWith("07") && !p.startsWith("2517")).length
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to dispatch live tremor alert", details: error.message });
  }
}

export async function getAuditLogsController(req: AuthenticatedRequest, res: Response) {
  try {
    const logs = await getPostgresAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch audit logs from database", details: error.message });
  }
}

export async function getSmtpStatusController(req: AuthenticatedRequest, res: Response) {
  try {
    const status = getSmtpStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to query SMTP status", details: err.message });
  }
}

export async function testSmtpConnectionController(req: AuthenticatedRequest, res: Response) {
  try {
    const { targetEmail } = req.body;
    const result = await testSmtpConnection(targetEmail || req.userEmail);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
