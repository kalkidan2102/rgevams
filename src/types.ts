export type SeverityLevel = "Red" | "Orange" | "Yellow" | "Green";

export interface SelectedItem {
  type: "volcano" | "earthquake" | "gnss";
  id: string;
}

export interface GnssStation {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  velocityNorth: number; // mm/year
  velocityEast: number;  // mm/year
  velocityUp: number;    // mm/year
  monitoredBy: string;
  description: string;
}

export interface Volcano {
  id: string;
  name: string;
  region: string;
  elevation: number;
  coordinates: [number, number]; // [latitude, longitude]
  type: string;
  activityType: string;
  severity: SeverityLevel;
  lastErupted: string;
  description: string;
  monitoredBy: string;
  updatedAt: string;
}

export interface Earthquake {
  id: string;
  magnitude: number;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  depth: number;
  dateTime: string;
  severity: SeverityLevel;
  description: string;
  isHistorical: boolean;
}

export type UserRoleType = "superadmin" | "admin" | "official" | "researcher" | "scientist" | "staff" | "guest";
export type UserStatusType = "approved" | "pending" | "rejected";

export interface UserRole {
  name: string;
  email: string;
  role: UserRoleType;
  institution: string;
  status?: UserStatusType;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  status: UserStatusType;
  institution: string;
  registeredAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  failedLoginAttempts?: number;
  isLocked?: boolean;
  lockUntil?: string;
}

export interface GeologicalReport {
  aiGenerated: boolean;
  reportText: string;
}

export interface GeologicalAlert {
  id: string;
  title: string;
  type: "seismic" | "volcanic";
  severity: SeverityLevel;
  location: string;
  description: string;
  dateTime: string;
}

export interface DismissedAlert extends GeologicalAlert {
  dismissedAt: string;
  dismissedBy: string;
  resolutionNotes?: string;
  actionTaken?: string;
}

export interface AuditLog {
  id: string;
  action: "create" | "edit" | "delete";
  volcanoId: string;
  volcanoName: string;
  performedBy: string;
  performedByEmail: string;
  performedByRole: string;
  details: string;
  timestamp: string;
}

export interface AlertThresholdConfig {
  minMagnitude: number;
  maxDepth: number;
  depthThreshold: number;
  emailAlertsEnabled: boolean;
  smsAlertsEnabled: boolean;
  alertRecipientsEmail: string[];
  alertRecipientsPhone: string[];
  targetRegions: string[];
  autoDispatchOnCritical: boolean;
  severityFilter?: "All" | "Red" | "Orange" | "Yellow";
  smsTemplateText?: string;
  emailSubjectTemplate?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AlertDispatchLog {
  id: string;
  type: "email" | "sms" | "both" | "simulated";
  eventTitle: string;
  magnitude: number;
  depth: number;
  location: string;
  severity: SeverityLevel;
  recipientsCount: number;
  recipients: string[];
  status: "dispatched" | "simulated" | "failed" | "SENT" | "SIMULATED" | "FAILED" | string;
  timestamp: string;
  details: string;
}

export type ReportType =
  | "all"
  | "volcanic"
  | "seismic"
  | "infrastructure"
  | "geodesy"
  | "drmc"
  | "gnss"
  | "executive";

export interface ReportConfigOptions {
  type: ReportType;
  region: string;
  classification: "RESTRICTED" | "CONFIDENTIAL" | "OFFICIAL USE ONLY" | "PUBLIC ADVISORY";
  timeframe: "24h" | "7d" | "30d" | "all";
  officerName: string;
  officerRole: string;
  officerInstitution: string;
  customFocus?: string;
  includeAiSummary?: boolean;
}

