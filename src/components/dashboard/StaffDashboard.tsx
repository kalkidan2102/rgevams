import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FileCheck,
  Flame,
  Info,
  Lock,
  LogOut,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Send,
  Shield,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

import { UserRoleType, Volcano, Earthquake } from "../../types";

interface StaffDashboardProps {
  currentUser: {
    name: string;
    email: string;
    role: UserRoleType;
    institution?: string;
  };
  volcanoes?: Volcano[];
  earthquakes?: Earthquake[];
  onAddVolcano?: (volcano: any) => void;
  onSignOut?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface FieldReport {
  id: string;
  submittedBy: string;
  region: string;
  type:
    | "Seismic Swarm"
    | "Volcanic Plume"
    | "Ground Fissure"
    | "Gas Venting";
  severity: "Red" | "Orange" | "Yellow";
  timestamp: string;
  status: "Under Review" | "Field Verified" | "Resolved";
  description: string;
}

/* -------------------------------------------------------------------------- */
/*                            PRIVILEGE DEFINITIONS                           */
/* -------------------------------------------------------------------------- */

type StaffPrivilege =
  | "VIEW_OVERVIEW"
  | "VIEW_GIS"
  | "VIEW_HAZARD_DATA"
  | "SUBMIT_FIELD_OBSERVATION"
  | "REVIEW_FIELD_REPORTS"
  | "VERIFY_FIELD_REPORTS"
  | "RESOLVE_FIELD_REPORTS"
  | "VIEW_TELEMETRY"
  | "CALIBRATE_SENSORS"
  | "EXPORT_OPERATIONAL_DATA"
  | "MANAGE_USERS"
  | "MANAGE_ROLES"
  | "SYSTEM_CONFIGURATION"
  | "AUDIT_SECURITY";

const ROLE_PRIVILEGES: Record<string, StaffPrivilege[]> = {
  staff: [
    "VIEW_OVERVIEW",
    "VIEW_GIS",
    "VIEW_HAZARD_DATA",
    "SUBMIT_FIELD_OBSERVATION",
    "REVIEW_FIELD_REPORTS",
    "VERIFY_FIELD_REPORTS",
    "RESOLVE_FIELD_REPORTS",
    "VIEW_TELEMETRY",
    "CALIBRATE_SENSORS",
    "EXPORT_OPERATIONAL_DATA",
  ],

  official: [
    "VIEW_OVERVIEW",
    "VIEW_GIS",
    "VIEW_HAZARD_DATA",
    "SUBMIT_FIELD_OBSERVATION",
    "REVIEW_FIELD_REPORTS",
    "VIEW_TELEMETRY",
    "EXPORT_OPERATIONAL_DATA",
  ],

  researcher: [
    "VIEW_OVERVIEW",
    "VIEW_GIS",
    "VIEW_HAZARD_DATA",
    "SUBMIT_FIELD_OBSERVATION",
    "REVIEW_FIELD_REPORTS",
    "VIEW_TELEMETRY",
    "EXPORT_OPERATIONAL_DATA",
  ],

  admin: [
    "VIEW_OVERVIEW",
    "VIEW_GIS",
    "VIEW_HAZARD_DATA",
    "SUBMIT_FIELD_OBSERVATION",
    "REVIEW_FIELD_REPORTS",
    "VERIFY_FIELD_REPORTS",
    "RESOLVE_FIELD_REPORTS",
    "VIEW_TELEMETRY",
    "CALIBRATE_SENSORS",
    "EXPORT_OPERATIONAL_DATA",
    "MANAGE_USERS",
    "MANAGE_ROLES",
    "SYSTEM_CONFIGURATION",
    "AUDIT_SECURITY",
  ],

  superadmin: [
    "VIEW_OVERVIEW",
    "VIEW_GIS",
    "VIEW_HAZARD_DATA",
    "SUBMIT_FIELD_OBSERVATION",
    "REVIEW_FIELD_REPORTS",
    "VERIFY_FIELD_REPORTS",
    "RESOLVE_FIELD_REPORTS",
    "VIEW_TELEMETRY",
    "CALIBRATE_SENSORS",
    "EXPORT_OPERATIONAL_DATA",
    "MANAGE_USERS",
    "MANAGE_ROLES",
    "SYSTEM_CONFIGURATION",
    "AUDIT_SECURITY",
  ],
};

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

const normalizeRole = (role: UserRoleType | string | undefined): string => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

const getRoleLabel = (role: UserRoleType | string | undefined): string => {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "admin":
      return "System Administrator";

    case "superadmin":
      return "Super Administrator";

    case "researcher":
      return "Research Officer";

    case "official":
      return "Government Official";

    case "staff":
    case "staffduty":
    case "staffdutyofficer":
      return "Staff Duty Officer";

    default:
      return "Operational Staff";
  }
};

const getClearanceLabel = (role: UserRoleType | string | undefined): string => {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "admin":
    case "superadmin":
      return "SYSTEM ADMINISTRATION";

    case "researcher":
      return "RESEARCH & ANALYSIS";

    case "official":
      return "OFFICIAL MONITORING";

    case "staff":
    case "staffduty":
    case "staffdutyofficer":
      return "FIELD OPERATIONS";

    default:
      return "OPERATIONAL MONITORING";
  }
};

const getRolePrivileges = (
  role: UserRoleType | string | undefined
): StaffPrivilege[] => {
  const normalized = normalizeRole(role);

  if (
    normalized === "staffduty" ||
    normalized === "staffdutyofficer" ||
    normalized === "fieldstaff"
  ) {
    return ROLE_PRIVILEGES.staff;
  }

  return ROLE_PRIVILEGES[normalized] || ROLE_PRIVILEGES.official;
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export function StaffDashboard({
  currentUser,
  volcanoes = [],
  earthquakes = [],
  onAddVolcano,
  onSignOut,
  onNavigateToTab,
}: StaffDashboardProps) {
  const [activeStaffTab, setActiveStaffTab] = useState<
    "overview" | "reports" | "log-data" | "telemetry"
  >("overview");

  /* ---------------------------- Privilege layer --------------------------- */

  const privileges = useMemo(
    () => getRolePrivileges(currentUser.role),
    [currentUser.role]
  );

  const hasPrivilege = (privilege: StaffPrivilege): boolean => {
    return privileges.includes(privilege);
  };

  const isAdministrator =
    normalizeRole(currentUser.role) === "admin" ||
    normalizeRole(currentUser.role) === "superadmin";

  const roleLabel = getRoleLabel(currentUser.role);
  const clearanceLabel = getClearanceLabel(currentUser.role);

  /* ----------------------------- Field reports ---------------------------- */

  const [fieldReports, setFieldReports] = useState<FieldReport[]>([
    {
      id: "FR-2026-091",
      submittedBy: "Afar Sector Patrol Team B",
      region: "Erta Ale Caldera South Rim",
      type: "Volcanic Plume",
      severity: "Orange",
      timestamp: new Date(
        Date.now() - 3600000 * 4
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Under Review",
      description:
        "Increased thermal radiance and dense SO2 gas emissions observed near active lava lake fissure.",
    },
    {
      id: "FR-2026-088",
      submittedBy: "Semera Seismic Station Tech",
      region: "Dobi Graben Sector",
      type: "Seismic Swarm",
      severity: "Yellow",
      timestamp: new Date(
        Date.now() - 3600000 * 12
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Field Verified",
      description:
        "Cluster of 14 micro-earthquakes (M 2.4 - M 3.1) registered within 3 hours along normal fault scarp.",
    },
    {
      id: "FR-2026-084",
      submittedBy: "Hawassa Geodesy Crew",
      region: "Alutu Caldera Geothermal Field",
      type: "Ground Fissure",
      severity: "Yellow",
      timestamp: "Yesterday",
      status: "Resolved",
      description:
        "Minor hydrothermal surface steam venting along local farmland boundary. Pressure relief valve calibrated.",
    },
  ]);

  /* ---------------------------- Observation form -------------------------- */

  const [newObsName, setNewObsName] = useState("");
  const [newObsRegion, setNewObsRegion] = useState("Afar Rift Zone");
  const [newObsType, setNewObsType] = useState("Shield Volcano");
  const [newObsActivity, setNewObsActivity] = useState(
    "Magmatic Fissure Venting"
  );
  const [newObsSeverity, setNewObsSeverity] = useState<
    "Red" | "Orange" | "Yellow" | "Green"
  >("Orange");
  const [newObsElevation, setNewObsElevation] = useState("613");
  const [newObsDesc, setNewObsDesc] = useState("");
  const [obsSubmitSuccess, setObsSubmitSuccess] = useState(false);

  /* ----------------------------- Report filter ---------------------------- */

  const [reportFilter, setReportFilter] = useState<
    "All" | "Under Review" | "Field Verified" | "Resolved"
  >("All");

  /* ------------------------------ Telemetry ------------------------------- */

  const [lastStationPing, setLastStationPing] = useState<string | null>(null);

  /* -------------------------------------------------------------------------- */
  /*                                  HANDLERS                                  */
  /* -------------------------------------------------------------------------- */

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPrivilege("SUBMIT_FIELD_OBSERVATION")) {
      return;
    }

    if (!newObsName.trim()) return;

    if (onAddVolcano) {
      onAddVolcano({
        name: newObsName,
        region: newObsRegion,
        elevation: parseInt(newObsElevation) || 600,
        coordinates: [12.6, 40.5],
        type: newObsType,
        activityType: newObsActivity,
        severity: newObsSeverity,
        lastErupted: "Ongoing 2026 Observation",
        description:
          newObsDesc ||
          "Recorded by ESSGI Staff Duty Officer during active field sweep.",
        monitoredBy:
          currentUser.name +
          " (" +
          (currentUser.institution || "ESSGI Staff") +
          ")",
      });
    }

    setObsSubmitSuccess(true);

    setTimeout(() => {
      setObsSubmitSuccess(false);
      setNewObsName("");
      setNewObsDesc("");
    }, 2500);
  };

  const handleUpdateReportStatus = (
    id: string,
    newStatus: "Under Review" | "Field Verified" | "Resolved"
  ) => {
    if (newStatus === "Field Verified") {
      if (!hasPrivilege("VERIFY_FIELD_REPORTS")) return;
    }

    if (newStatus === "Resolved") {
      if (!hasPrivilege("RESOLVE_FIELD_REPORTS")) return;
    }

    if (newStatus === "Under Review") {
      if (!hasPrivilege("REVIEW_FIELD_REPORTS")) return;
    }

    setFieldReports((prev) =>
      prev.map((report) =>
        report.id === id
          ? {
              ...report,
              status: newStatus,
            }
          : report
      )
    );
  };

  const handlePingStations = () => {
    if (!hasPrivilege("VIEW_TELEMETRY")) return;

    setLastStationPing(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const filteredReports = fieldReports.filter((report) =>
    reportFilter === "All" ? true : report.status === reportFilter
  );

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-5 font-sans text-slate-900">
      {/* ==================================================================== */}
      {/* INSTITUTIONAL HEADER                                                 */}
      {/* ==================================================================== */}

      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0E4A72] via-[#075985] to-[#0E4A72] text-white shadow-lg border-b-4 border-[#D48F29]">
        <div className="absolute right-0 top-0 h-full w-80 bg-white/[0.025] pointer-events-none" />

        <div className="relative z-10 px-5 py-5 md:px-7 md:py-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D48F29] text-[#0E4A72] font-mono text-[10px] font-black uppercase tracking-widest">
                  <Radio className="w-3.5 h-3.5" />
                  R-GEVAMS
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-100 border border-emerald-300/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Duty
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-slate-100 border border-white/10 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {clearanceLabel}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Geophysics Staff Dashboard
              </h1>

              <p className="mt-2 text-xs md:text-sm text-slate-200 max-w-3xl leading-relaxed">
                Operational monitoring and field-data workspace for{" "}
                <strong className="text-white">{currentUser.name}</strong>.
                Current authorization:{" "}
                <strong className="text-[#F7D08A]">{roleLabel}</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {hasPrivilege("VIEW_GIS") && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab?.("map")}
                  className="px-4 py-2.5 bg-[#D48F29] hover:bg-[#E4A747] text-[#0E4A72] font-black rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  GIS Map
                </button>
              )}

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center gap-2 border border-white/15"
                >
                  <LogOut className="w-4 h-4 text-[#F7D08A]" />
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Access summary */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-wider text-slate-300">
            <span>
              Operator:{" "}
              <strong className="text-white">{currentUser.name}</strong>
            </span>

            <span>
              Role: <strong className="text-[#F7D08A]">{roleLabel}</strong>
            </span>

            <span>
              Privileges:{" "}
              <strong className="text-white">{privileges.length}</strong>
            </span>

            <span>
              Authorization:{" "}
              <strong className="text-emerald-300">VERIFIED</strong>
            </span>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* OPERATIONAL KPI STRIP                                                */}
      {/* ==================================================================== */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Pending Reviews
              </p>
              <p className="mt-1 text-2xl font-black font-mono text-[#0E4A72]">
                {fieldReports.filter((r) => r.status === "Under Review").length}
              </p>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                Requires attention
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Volcano Records
              </p>
              <p className="mt-1 text-2xl font-black font-mono text-rose-600">
                {volcanoes.length}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Current catalog
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Earthquake Records
              </p>
              <p className="mt-1 text-2xl font-black font-mono text-emerald-600">
                {earthquakes.length}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                Monitoring catalog
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Telemetry
              </p>
              <p className="mt-1 text-2xl font-black font-mono text-cyan-600">
                32
              </p>
              <p className="text-[10px] text-cyan-600 font-semibold mt-0.5">
                Network streams
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Radio className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ACCESS / PRIVILEGE PANEL                                             */}
      {/* ==================================================================== */}

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0E4A72]" />

            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#0E4A72]">
                Access Control
              </h2>

              <p className="text-[10px] text-slate-500 mt-0.5">
                Current privileges are determined from the authenticated role.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Authorization Verified
          </span>
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
          <PrivilegeBadge
            label="Overview"
            allowed={hasPrivilege("VIEW_OVERVIEW")}
          />

          <PrivilegeBadge
            label="GIS Map"
            allowed={hasPrivilege("VIEW_GIS")}
          />

          <PrivilegeBadge
            label="Hazard Data"
            allowed={hasPrivilege("VIEW_HAZARD_DATA")}
          />

          <PrivilegeBadge
            label="Field Entry"
            allowed={hasPrivilege("SUBMIT_FIELD_OBSERVATION")}
          />

          <PrivilegeBadge
            label="Report Review"
            allowed={hasPrivilege("REVIEW_FIELD_REPORTS")}
          />

          <PrivilegeBadge
            label="Verification"
            allowed={hasPrivilege("VERIFY_FIELD_REPORTS")}
          />

          <PrivilegeBadge
            label="Telemetry"
            allowed={hasPrivilege("VIEW_TELEMETRY")}
          />

          <PrivilegeBadge
            label="Calibration"
            allowed={hasPrivilege("CALIBRATE_SENSORS")}
          />

          <PrivilegeBadge
            label="Data Export"
            allowed={hasPrivilege("EXPORT_OPERATIONAL_DATA")}
          />

          <PrivilegeBadge
            label="User Management"
            allowed={hasPrivilege("MANAGE_USERS")}
          />

          <PrivilegeBadge
            label="Role Management"
            allowed={hasPrivilege("MANAGE_ROLES")}
          />

          <PrivilegeBadge
            label="System Config"
            allowed={hasPrivilege("SYSTEM_CONFIGURATION")}
          />

          <PrivilegeBadge
            label="Security Audit"
            allowed={hasPrivilege("AUDIT_SECURITY")}
          />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* NAVIGATION                                                           */}
      {/* ==================================================================== */}

      <nav className="bg-white border border-slate-200 rounded-xl shadow-sm p-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <StaffTabButton
            active={activeStaffTab === "overview"}
            onClick={() => setActiveStaffTab("overview")}
            icon={<Activity className="w-4 h-4" />}
            label="Duty Overview"
          />

          {hasPrivilege("REVIEW_FIELD_REPORTS") && (
            <StaffTabButton
              active={activeStaffTab === "reports"}
              onClick={() => setActiveStaffTab("reports")}
              icon={<FileCheck className="w-4 h-4" />}
              label="Field Reports"
              count={fieldReports.length}
            />
          )}

          {hasPrivilege("SUBMIT_FIELD_OBSERVATION") && (
            <StaffTabButton
              active={activeStaffTab === "log-data"}
              onClick={() => setActiveStaffTab("log-data")}
              icon={<Plus className="w-4 h-4" />}
              label="Log Observation"
            />
          )}

          {hasPrivilege("VIEW_TELEMETRY") && (
            <StaffTabButton
              active={activeStaffTab === "telemetry"}
              onClick={() => setActiveStaffTab("telemetry")}
              icon={<Radio className="w-4 h-4" />}
              label="Telemetry"
            />
          )}
        </div>
      </nav>

      {/* ==================================================================== */}
      {/* TAB: OVERVIEW                                                        */}
      {/* ==================================================================== */}

      {activeStaffTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <PanelHeader
              title="Assigned Operational Tasks"
              subtitle="Current duty workflow for the geohazards monitoring team"
              icon={<Activity className="w-4 h-4" />}
            />

            <div className="p-4 space-y-3">
              <OperationalTask
                priority="HIGH"
                status="Critical monitoring"
                title="Erta Ale Thermal Radiance Ingest"
                description="Verify MODIS/VIIRS thermal satellite anomalies over Erta Ale lava lake and cross-examine with field team reports."
                color="red"
                actionLabel={
                  hasPrivilege("SUBMIT_FIELD_OBSERVATION")
                    ? "Log Data"
                    : "View"
                }
                onAction={() => {
                  if (hasPrivilege("SUBMIT_FIELD_OBSERVATION")) {
                    setActiveStaffTab("log-data");
                  } else {
                    onNavigateToTab?.("map");
                  }
                }}
              />

              <OperationalTask
                priority="MEDIUM"
                status="Review queue"
                title="Field Hazard Submission Review"
                description="Inspect ground deformation reports, localized seismic notices, and volcanic observations submitted by regional monitoring teams."
                color="amber"
                actionLabel="Open Queue"
                onAction={() => {
                  if (hasPrivilege("REVIEW_FIELD_REPORTS")) {
                    setActiveStaffTab("reports");
                  }
                }}
              />

              <OperationalTask
                priority="NORMAL"
                status="Station monitoring"
                title="FURI Observatory Broadband Calibration"
                description="Check seismic stream stability for Station FURI and confirm current signal and noise threshold parameters."
                color="emerald"
                actionLabel="Inspect Node"
                onAction={() => {
                  if (hasPrivilege("VIEW_TELEMETRY")) {
                    setActiveStaffTab("telemetry");
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-5">
            {/* Identity */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <PanelHeader
                title="Staff Identity"
                subtitle="Authenticated operator profile"
                icon={<UserCheck className="w-4 h-4" />}
              />

              <div className="p-4 space-y-3 text-xs">
                <InfoRow label="Officer Name" value={currentUser.name} />

                <InfoRow
                  label="Email"
                  value={currentUser.email}
                  mono
                />

                <InfoRow
                  label="Institution"
                  value={
                    currentUser.institution ||
                    "ESSGI Geodesy & Geodynamics"
                  }
                />

                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                    Role
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0E4A72] text-[#F7D08A] font-mono text-[10px] font-bold uppercase">
                    <Shield className="w-3 h-3" />
                    {roleLabel}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                    Clearance
                  </span>

                  <span className="font-mono text-[10px] font-bold text-emerald-700">
                    {clearanceLabel}
                  </span>
                </div>
              </div>
            </section>

            {/* Catalog */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <PanelHeader
                title="Recent Volcanic Catalog"
                subtitle="Latest records available to this operator"
                icon={<Flame className="w-4 h-4" />}
              />

              <div className="p-4 space-y-2">
                {volcanoes.length === 0 ? (
                  <EmptyState message="No volcanic records available." />
                ) : (
                  volcanoes.slice(0, 4).map((volcano) => (
                    <div
                      key={volcano.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="block font-bold text-xs text-slate-900 truncate">
                          {volcano.name}
                        </span>

                        <span className="block text-[10px] text-slate-500 truncate">
                          {volcano.region}
                        </span>
                      </div>

                      <span
                        className={`shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                          volcano.severity === "Red"
                            ? "bg-red-100 text-red-800"
                            : volcano.severity === "Orange"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {volcano.severity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB: FIELD REPORTS                                                   */}
      {/* ==================================================================== */}

      {activeStaffTab === "reports" &&
        hasPrivilege("REVIEW_FIELD_REPORTS") && (
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <PanelHeader
              title="Field Hazard Incident Reports"
              subtitle="Review and process incoming operational observations"
              icon={<FileCheck className="w-4 h-4" />}
              rightContent={
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  {(
                    [
                      "All",
                      "Under Review",
                      "Field Verified",
                      "Resolved",
                    ] as const
                  ).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setReportFilter(status)}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-colors ${
                        reportFilter === status
                          ? "bg-[#0E4A72] text-white"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              }
            />

            <div className="p-4 space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-1 bg-slate-900 text-white font-mono text-[9px] font-bold rounded">
                          {report.id}
                        </span>

                        <span className="font-bold text-xs text-slate-900">
                          {report.type}
                        </span>

                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {report.region}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <SeverityBadge severity={report.severity} />
                        <StatusBadge status={report.status} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="text-[10px] text-slate-500">
                        Reporter:{" "}
                        <strong className="text-slate-800">
                          {report.submittedBy}
                        </strong>{" "}
                        · {report.timestamp}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mr-1">
                          Actions
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateReportStatus(
                              report.id,
                              "Under Review"
                            )
                          }
                          disabled={
                            report.status === "Under Review" ||
                            !hasPrivilege("REVIEW_FIELD_REPORTS")
                          }
                          className="px-2.5 py-1.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Review
                        </button>

                        {hasPrivilege("VERIFY_FIELD_REPORTS") && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateReportStatus(
                                report.id,
                                "Field Verified"
                              )
                            }
                            disabled={report.status === "Field Verified"}
                            className="px-2.5 py-1.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Verify
                          </button>
                        )}

                        {hasPrivilege("RESOLVE_FIELD_REPORTS") && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateReportStatus(
                                report.id,
                                "Resolved"
                              )
                            }
                            disabled={report.status === "Resolved"}
                            className="px-2.5 py-1.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <EmptyState message="No field reports match the selected filter." />
              )}
            </div>
          </section>
        )}

      {/* ==================================================================== */}
      {/* TAB: LOG DATA                                                        */}
      {/* ==================================================================== */}

      {activeStaffTab === "log-data" &&
        hasPrivilege("SUBMIT_FIELD_OBSERVATION") && (
          <section className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm">
            <PanelHeader
              title="Register Field Observation"
              subtitle="Submit an official geohazard observation to the operational catalog"
              icon={<Plus className="w-4 h-4" />}
            />

            <div className="p-5">
              {obsSubmitSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />

                  <div>
                    <div>Observation successfully submitted.</div>
                    <div className="text-[10px] font-normal text-emerald-700 mt-0.5">
                      The entry has been forwarded to the operational data
                      workflow.
                    </div>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleCreateObservation}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Volcano / Feature Name" required>
                    <input
                      type="text"
                      required
                      value={newObsName}
                      onChange={(e) => setNewObsName(e.target.value)}
                      placeholder="e.g. Borawli, Hertali, South Erta Vent"
                      className="form-input"
                    />
                  </FormField>

                  <FormField label="Geographic Region">
                    <input
                      type="text"
                      value={newObsRegion}
                      onChange={(e) => setNewObsRegion(e.target.value)}
                      placeholder="e.g. Afar Depression / Rift Axis"
                      className="form-input"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Structure Type">
                    <select
                      value={newObsType}
                      onChange={(e) => setNewObsType(e.target.value)}
                      className="form-input"
                    >
                      <option value="Shield Volcano">
                        Shield Volcano
                      </option>
                      <option value="Stratovolcano">
                        Stratovolcano
                      </option>
                      <option value="Caldera Complex">
                        Caldera Complex
                      </option>
                      <option value="Hydrothermal Field">
                        Hydrothermal Field
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Severity Status">
                    <select
                      value={newObsSeverity}
                      onChange={(e) =>
                        setNewObsSeverity(
                          e.target.value as
                            | "Red"
                            | "Orange"
                            | "Yellow"
                            | "Green"
                        )
                      }
                      className="form-input"
                    >
                      <option value="Red">
                        Red — Critical Advisory
                      </option>
                      <option value="Orange">
                        Orange — Elevated Activity
                      </option>
                      <option value="Yellow">
                        Yellow — Watch
                      </option>
                      <option value="Green">
                        Green — Normal Baseline
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Elevation (Meters)">
                    <input
                      type="number"
                      value={newObsElevation}
                      onChange={(e) =>
                        setNewObsElevation(e.target.value)
                      }
                      className="form-input"
                    />
                  </FormField>
                </div>

                <FormField label="Activity Type">
                  <select
                    value={newObsActivity}
                    onChange={(e) =>
                      setNewObsActivity(e.target.value)
                    }
                    className="form-input"
                  >
                    <option value="Magmatic Fissure Venting">
                      Magmatic Fissure Venting
                    </option>
                    <option value="Thermal Anomaly">
                      Thermal Anomaly
                    </option>
                    <option value="Seismic Swarm">
                      Seismic Swarm
                    </option>
                    <option value="Gas Venting">
                      Gas Venting
                    </option>
                    <option value="Ground Deformation">
                      Ground Deformation
                    </option>
                    <option value="Hydrothermal Activity">
                      Hydrothermal Activity
                    </option>
                  </select>
                </FormField>

                <FormField label="Field Observation Notes & Telemetry">
                  <textarea
                    rows={5}
                    value={newObsDesc}
                    onChange={(e) => setNewObsDesc(e.target.value)}
                    placeholder="Record SO2 concentration, ground deformation, lava activity, thermal anomaly, micro-seismic swarm count, or other field observations..."
                    className="form-input resize-none"
                  />
                </FormField>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-[10px] text-slate-500">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />

                    <span>
                      This submission will be associated with{" "}
                      <strong className="text-slate-700">
                        {currentUser.name}
                      </strong>{" "}
                      and the current authenticated role.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0E4A72] hover:bg-[#075985] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-[#F7D08A]" />
                    Submit Observation
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

      {/* ==================================================================== */}
      {/* TAB: TELEMETRY                                                       */}
      {/* ==================================================================== */}

      {activeStaffTab === "telemetry" &&
        hasPrivilege("VIEW_TELEMETRY") && (
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <PanelHeader
              title="Sensor Network & Telemetry"
              subtitle="Monitoring station diagnostics across the Ethiopian Rift Network"
              icon={<Radio className="w-4 h-4" />}
              rightContent={
                <button
                  type="button"
                  onClick={handlePingStations}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ping Stations
                </button>
              }
            />

            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Network operational
              </div>

              {lastStationPing && (
                <span className="text-[10px] font-mono text-slate-500">
                  Last diagnostic: {lastStationPing}
                </span>
              )}
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                {
                  id: "FURI",
                  name: "Furi Mountain Broadband",
                  type: "Seismometer",
                  status: "ONLINE",
                  rate: "100 Hz",
                  location: "8.90 N, 38.68 E",
                },
                {
                  id: "SMR1",
                  name: "Semera Rift Station",
                  type: "GNSS Geodesy",
                  status: "ONLINE",
                  rate: "1 Hz",
                  location: "11.79 N, 41.00 E",
                },
                {
                  id: "ERTA",
                  name: "Erta Ale Summit Thermal",
                  type: "Infrared Radiometer",
                  status: "ONLINE",
                  rate: "1 / 15 min",
                  location: "13.60 N, 40.67 E",
                },
                {
                  id: "DALL",
                  name: "Dallol Geothermal Hydro",
                  type: "pH / Temperature Sensor",
                  status: "ONLINE",
                  rate: "1 / 5 min",
                  location: "14.24 N, 40.30 E",
                },
                {
                  id: "AWSH",
                  name: "Awash Park Fentale Fault",
                  type: "Tiltmeter",
                  status: "CALIBRATING",
                  rate: "10 Hz",
                  location: "8.97 N, 39.90 E",
                },
                {
                  id: "ALUT",
                  name: "Alutu Geothermal Borehole",
                  type: "Pressure Transducer",
                  status: "ONLINE",
                  rate: "1 Hz",
                  location: "7.78 N, 38.78 E",
                },
              ].map((station) => (
                <TelemetryCard
                  key={station.id}
                  station={station}
                  canCalibrate={hasPrivilege("CALIBRATE_SENSORS")}
                />
              ))}
            </div>
          </section>
        )}

      {/* ==================================================================== */}
      {/* RESTRICTED ADMIN NOTICE                                              */}
      {/* ==================================================================== */}

      {!isAdministrator && (
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-200 text-slate-500 shrink-0">
              <Lock className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Administrative Controls Restricted
              </h3>

              <p className="mt-1 text-[10px] leading-relaxed text-slate-500 max-w-3xl">
                User administration, role management, system configuration,
                and security audit controls are restricted to authorized
                administrative roles. Your current clearance permits
                operational monitoring and field activities only.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* FOOTER                                                              */}
      {/* ==================================================================== */}

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 pt-1 pb-2 text-[9px] font-mono uppercase tracking-wider text-slate-400">
        <span>R-GEVAMS · Geohazard Operations</span>

        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Authenticated · {roleLabel}
        </span>
      </footer>
    </div>
  );
}

/* ========================================================================== */
/*                              SUBCOMPONENTS                                 */
/* ========================================================================== */

function PrivilegeBadge({
  label,
  allowed,
}: {
  label: string;
  allowed: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[9px] font-bold uppercase tracking-wide ${
        allowed
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-slate-50 border-slate-200 text-slate-400"
      }`}
    >
      {allowed ? (
        <CheckCircle2 className="w-3 h-3 shrink-0" />
      ) : (
        <Lock className="w-3 h-3 shrink-0" />
      )}

      <span>{label}</span>
    </div>
  );
}

function StaffTabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
        active
          ? "bg-[#0E4A72] text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}

      <span>{label}</span>

      {typeof count === "number" && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[8px] font-mono ${
            active
              ? "bg-white/15 text-white"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function PanelHeader({
  title,
  subtitle,
  icon,
  rightContent,
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div className="flex items-start gap-2.5">
        {icon && (
          <div className="mt-0.5 text-[#0E4A72] shrink-0">{icon}</div>
        )}

        <div>
          <h2 className="text-sm font-black uppercase tracking-wide text-[#0E4A72]">
            {title}
          </h2>

          <p className="mt-0.5 text-[10px] text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      {rightContent}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-0.5">
        {label}
      </span>

      <span
        className={`block text-slate-900 font-semibold ${
          mono ? "font-mono text-[10px]" : "text-xs"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function OperationalTask({
  priority,
  status,
  title,
  description,
  color,
  actionLabel,
  onAction,
}: {
  priority: string;
  status: string;
  title: string;
  description: string;
  color: "red" | "amber" | "emerald";
  actionLabel: string;
  onAction: () => void;
}) {
  const colorClasses = {
    red: {
      dot: "bg-red-500",
      badge: "bg-red-50 text-red-700 border-red-200",
      button: "bg-[#0E4A72] hover:bg-[#075985]",
    },
    amber: {
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      button: "bg-[#0E4A72] hover:bg-[#075985]",
    },
    emerald: {
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      button: "bg-slate-700 hover:bg-slate-800",
    },
  }[color];

  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${colorClasses.dot} ${
                color === "red" ? "animate-pulse" : ""
              }`}
            />

            <span className="text-xs font-bold text-slate-900">
              {title}
            </span>

            <span
              className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold uppercase ${colorClasses.badge}`}
            >
              {priority}
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            {description}
          </p>

          <div className="mt-2 text-[9px] font-mono uppercase text-slate-400">
            Status:{" "}
            <span className="text-slate-600 font-bold">{status}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          className={`shrink-0 px-3 py-2 text-white font-bold rounded-md text-[9px] uppercase tracking-wider transition-colors ${colorClasses.button}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: "Red" | "Orange" | "Yellow";
}) {
  const classes =
    severity === "Red"
      ? "bg-red-50 text-red-700 border-red-200"
      : severity === "Orange"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span
      className={`px-2 py-1 rounded-md border text-[9px] font-mono font-bold uppercase ${classes}`}
    >
      {severity}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: "Under Review" | "Field Verified" | "Resolved";
}) {
  const classes =
    status === "Resolved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "Field Verified"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span
      className={`px-2 py-1 rounded-md border text-[9px] font-mono font-bold uppercase ${classes}`}
    >
      {status}
    </span>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}
    </div>
  );
}

function TelemetryCard({
  station,
  canCalibrate,
}: {
  station: {
    id: string;
    name: string;
    type: string;
    status: string;
    rate: string;
    location: string;
  };
  canCalibrate: boolean;
}) {
  const isOnline = station.status === "ONLINE";

  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="px-2 py-1 bg-[#0E4A72] text-[#F7D08A] rounded-md font-mono text-[9px] font-black">
          {station.id}
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-mono text-[8px] font-bold ${
            isOnline
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />

          {station.status}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="text-xs font-bold text-slate-900">
          {station.name}
        </h3>

        <p className="mt-1 text-[10px] text-slate-500">
          {station.type}
        </p>

        <p className="mt-0.5 text-[10px] font-mono text-slate-400">
          {station.location}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[9px] font-mono text-slate-500">
          Rate: {station.rate}
        </span>

        <span className="text-[9px] font-mono font-bold text-emerald-700">
          Latency: 1.2s
        </span>
      </div>

      {station.status === "CALIBRATING" && (
        <div className="mt-3">
          {canCalibrate ? (
            <button
              type="button"
              className="w-full px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-md text-[9px] font-bold uppercase tracking-wider"
            >
              Open Calibration
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-md text-[9px] font-bold uppercase">
              <Lock className="w-3 h-3" />
              Calibration Restricted
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg">
      <Eye className="w-6 h-6 text-slate-300 mx-auto mb-2" />

      <p className="text-xs font-semibold text-slate-500">
        {message}
      </p>
    </div>
  );
}