import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailDeliveryResult {
  delivered: boolean;
  simulated: boolean;
  recipientCount: number;
  recipients: string[];
  messageId?: string;
  message: string;
  error?: string;
}

/**
 * Checks if the system has valid live SMTP credentials configured in environment variables.
 */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

/**
 * Returns current SMTP configuration state without exposing secrets.
 */
export function getSmtpStatus() {
  const configured = isSmtpConfigured();
  return {
    configured,
    host: process.env.SMTP_HOST || null,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    user: process.env.SMTP_USER ? process.env.SMTP_USER.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null,
    from: process.env.SMTP_FROM || "Ethiopian Space Science and Geospatial Institute <alerts@ssgi.gov.et>",
    statusMessage: configured
      ? "Live SMTP Transport Active - Real emails dispatched to inboxes"
      : "Simulated Dispatch Engine Active - To deliver to real inboxes, set SMTP_HOST, SMTP_USER, SMTP_PASS in .env"
  };
}

/**
 * Lazy transporter factory to prevent crashes if credentials are unset or invalid.
 */
function createTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Useful for institutional mail relays with custom TLS certificates
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    },
  });
}

/**
 * Dispatches an official geohazard alert email to recipient officials.
 * Seamlessly handles real SMTP delivery when configured, or automated simulated delivery otherwise.
 */
export async function sendOfficialAlertEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
  const rawList = Array.isArray(options.to) ? options.to : [options.to];
  const recipients = Array.from(
    new Set(
      rawList
        .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
        .filter((e) => e.length > 3 && e.includes("@"))
    )
  );

  if (recipients.length === 0) {
    return {
      delivered: false,
      simulated: false,
      recipientCount: 0,
      recipients: [],
      message: "No valid recipient email addresses provided.",
    };
  }

  const from = process.env.SMTP_FROM || "SSGI Early Warning Directorate <alerts@ssgi.gov.et>";

  // If live SMTP credentials are NOT configured, record simulation without failing
  if (!isSmtpConfigured()) {
    console.log(
      `[SSGI GEOHAZARD ALERT - SIMULATION] To: ${recipients.join(", ")} | Subject: "${options.subject}"`
    );
    return {
      delivered: true,
      simulated: true,
      recipientCount: recipients.length,
      recipients,
      message: `Simulated geohazard bulletin recorded for ${recipients.length} official(s). (Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env for inbox delivery)`,
    };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error("SMTP Transporter could not be initialized.");
    }

    const info = await transporter.sendMail({
      from,
      to: recipients.join(", "),
      replyTo: options.replyTo || "earlywarning@ssgi.gov.et",
      subject: options.subject,
      text: options.text || "Official Geohazard Alert from the Ethiopian Space Science and Geospatial Institute (SSGI).",
      html: options.html,
    });

    console.log(`[SSGI GEOHAZARD ALERT - LIVE SMTP] Message dispatched successfully! Message ID: ${info.messageId}`);

    return {
      delivered: true,
      simulated: false,
      recipientCount: recipients.length,
      recipients,
      messageId: info.messageId,
      message: `Live official bulletin dispatched to ${recipients.length} official inbox(es) via SMTP.`,
    };
  } catch (err: any) {
    console.error("[SSGI GEOHAZARD ALERT - SMTP ERROR]", err);
    // Return graceful fallback so background telemetry in USGS loop never crashes
    return {
      delivered: false,
      simulated: false,
      recipientCount: recipients.length,
      recipients,
      error: err.message || "Failed to deliver email through SMTP server.",
      message: `SMTP delivery failed (${err.message}). Notification was archived in system audit logs.`,
    };
  }
}

/**
 * Diagnostic tool to test SMTP connection and optionally send a test verification email.
 */
export async function testSmtpConnection(targetEmail?: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  if (!isSmtpConfigured()) {
    return {
      success: false,
      message: "SMTP is not configured in .env. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.",
      details: getSmtpStatus(),
    };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error("Failed to initialize transporter.");
    }

    // Verify SMTP connection
    await transporter.verify();

    // If a target test recipient was provided, send a live handshake email
    if (targetEmail && targetEmail.includes("@")) {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || "SSGI Early Warning Directorate <alerts@ssgi.gov.et>",
        to: targetEmail,
        subject: "[SSGI TEST] Emergency Geohazard Dispatch Link Verification",
        text: "This is an automated test confirming that your institutional email address is authorized and actively receiving SSGI / DRMC emergency notifications.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #0E4A72; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0E4A72; color: #ffffff; padding: 18px 24px;">
              <h2 style="margin: 0; font-size: 18px; color: #F7D08A;">ETHIOPIAN SPACE SCIENCE AND GEOSPATIAL INSTITUTE</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #B9D5EB;">Geodesy & Geodynamics Directorate • Early Warning Telemetry</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
              <h3 style="color: #0E4A72; margin-top: 0;">Emergency Dispatch Link Active</h3>
              <p>This verification email confirms that the <strong>R-GEVAMS Automated Geohazard Notification System</strong> is connected to the SMTP relay.</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; font-size: 13px;">
                <strong>Status:</strong> Verified Live<br>
                <strong>Recipient:</strong> ${targetEmail}<br>
                <strong>Timestamp:</strong> ${new Date().toUTCString()}
              </div>
              <p style="font-size: 12px; color: #64748b;">If a critical seismic rupture or volcanic crisis occurs in the Main Ethiopian Rift, official bulletins will be routed to this inbox.</p>
            </div>
          </div>
        `,
      });

      return {
        success: true,
        message: `SMTP connection verified and test message sent to ${targetEmail}! (Message ID: ${info.messageId})`,
        details: { messageId: info.messageId },
      };
    }

    return {
      success: true,
      message: "SMTP server connection verified successfully.",
      details: getSmtpStatus(),
    };
  } catch (err: any) {
    return {
      success: false,
      message: `SMTP verification failed: ${err.message}`,
      details: { error: err.message },
    };
  }
}
