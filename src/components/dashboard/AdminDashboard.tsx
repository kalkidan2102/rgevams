import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  Clock,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Key,
  Lock,
  LogOut,
  Activity,
  Megaphone,
  Database,
  FileCheck,
  Sliders,
  UserPlus,
  Server,
  Radio,
  Settings,
  ChevronRight,
  Circle,
} from "lucide-react";

import {
  UserAccount,
  UserRoleType,
  Volcano,
  Earthquake,
} from "../../types";

import {
  subscribeUsers,
  subscribeAuditLogs,
  saveUserToFirestore,
  addAlertToFirestore,
} from "../../lib/dbService";

import { generateRiskSummaryPdf } from "../../utils/pdfGenerator";

import {
  AlertThresholdConfigPanel,
  validateEmailDeliverability,
} from "../admin/AlertThresholdConfigPanel";

interface AdminDashboardProps {
  currentUser: {
    name: string;
    email: string;
    role: UserRoleType;
    institution?: string;
  };
  volcanoes?: Volcano[];
  earthquakes?: Earthquake[];
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onSelectUser?: (email: string) => void;
  onAuthenticateUser?: (user: any) => void;
  onNavigateToTab?: (tab: string) => void;
}

type AdminTab =
  | "users"
  | "thresholds"
  | "alerts"
  | "audit"
  | "system";

export function AdminDashboard({
  currentUser,
  volcanoes = [],
  earthquakes = [],
  onSignOut,
}: AdminDashboardProps) {
  const [activeAdminTab, setActiveAdminTab] =
    useState<AdminTab>("users");

  const [approvedUsers, setApprovedUsers] = useState<UserAccount[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserAccount[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<UserAccount[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingEmail, setActionLoadingEmail] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* -------------------------------------------------------------------------- */
  /* QUICK ROLE GRANT                                                            */
  /* -------------------------------------------------------------------------- */

  const [grantEmailInput, setGrantEmailInput] = useState("");
  const [grantRoleInput, setGrantRoleInput] =
    useState<UserRoleType>("official");
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* EMERGENCY BROADCAST                                                         */
  /* -------------------------------------------------------------------------- */

  const [alertTitle, setAlertTitle] = useState("");
  const [alertType, setAlertType] =
    useState<"volcanic" | "seismic">("volcanic");
  const [alertSeverity, setAlertSeverity] =
    useState<"Red" | "Orange" | "Yellow">("Red");
  const [alertLocation, setAlertLocation] =
    useState("Erta Ale Caldera & Afar Graben");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertBroadcastSuccess, setAlertBroadcastSuccess] =
    useState(false);

  /* -------------------------------------------------------------------------- */
  /* DATA LOADING                                                                */
  /* -------------------------------------------------------------------------- */

  const fetchUsersAndLogs = async () => {
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "X-User-Role": currentUser?.role || "admin",
        "X-User-Email":
          currentUser?.email || "admin@essgi.gov.et",
        "X-User-Name":
          currentUser?.name || "Administrator",
      };

      const res = await fetch("/api/admin/users", {
        headers,
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");

        if (
          contentType &&
          contentType.includes("application/json")
        ) {
          const data = await res.json();

          if (
            data &&
            data.users &&
            Array.isArray(data.users)
          ) {
            setUsers(data.users);

            setApprovedUsers(
              data.users.filter(
                (u: UserAccount) => u.status === "approved"
              )
            );

            setPendingUsers(
              data.users.filter(
                (u: UserAccount) => u.status === "pending"
              )
            );

            setRejectedUsers(
              data.users.filter(
                (u: UserAccount) => u.status === "rejected"
              )
            );
          }
        }
      }

      const logsRes = await fetch(
        "/api/admin/audit-logs",
        { headers }
      );

      if (logsRes.ok) {
        const contentType =
          logsRes.headers.get("content-type");

        if (
          contentType &&
          contentType.includes("application/json")
        ) {
          const logsData = await logsRes.json();

          const logsList = Array.isArray(logsData)
            ? logsData
            : logsData && logsData.logs
              ? logsData.logs
              : [];

          if (Array.isArray(logsList)) {
            setAuditLogs(logsList);
          }
        }
      }
    } catch {
      // Keep the interface available if the API is temporarily unavailable.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLogs();

    const unsubUsers = subscribeUsers((fetchedUsers) => {
      if (fetchedUsers && fetchedUsers.length > 0) {
        setUsers(fetchedUsers);

        setApprovedUsers(
          fetchedUsers.filter(
            (u) => u.status === "approved"
          )
        );

        setPendingUsers(
          fetchedUsers.filter(
            (u) => u.status === "pending"
          )
        );

        setRejectedUsers(
          fetchedUsers.filter(
            (u) => u.status === "rejected"
          )
        );

        setLoading(false);
      }
    });

    const unsubLogs = subscribeAuditLogs((fetchedLogs) => {
      if (fetchedLogs) {
        setAuditLogs(fetchedLogs);
      }
    });

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* USER ACTIONS                                                                */
  /* -------------------------------------------------------------------------- */

  const handleUnlockUser = async (userEmail: string) => {
    setActionLoadingEmail(userEmail);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-User-Role":
          currentUser?.role || "admin",
        "X-User-Email":
          currentUser?.email ||
          "admin@essgi.gov.et",
        "X-User-Name":
          currentUser?.name ||
          "Administrator",
      };

      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(
          userEmail
        )}/unlock`,
        {
          method: "PUT",
          headers,
        }
      );

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.email.toLowerCase() ===
            userEmail.toLowerCase()
              ? {
                  ...u,
                  isLocked: false,
                  failedLoginAttempts: 0,
                  lockUntil: undefined,
                }
              : u
          )
        );

        setToastMessage({
          type: "success",
          text: `Account for ${userEmail} unlocked successfully.`,
        });
      } else {
        const data = await res.json();

        setToastMessage({
          type: "error",
          text:
            data.error ||
            "Failed to unlock account.",
        });
      }
    } catch {
      setToastMessage({
        type: "error",
        text: "Network error unlocking account.",
      });
    } finally {
      setActionLoadingEmail(null);

      setTimeout(
        () => setToastMessage(null),
        3000
      );
    }
  };

  const handleApproveUser = async (
    userEmail: string
  ) => {
    setActionLoadingEmail(userEmail);

    try {
      const existingUser = users.find(
        (u) =>
          u.email.toLowerCase() ===
          userEmail.toLowerCase()
      );

      if (existingUser) {
        const updatedUser: UserAccount = {
          ...existingUser,
          status: "approved",
          approvedAt:
            new Date().toISOString(),
          approvedBy: currentUser.email,
        };

        await saveUserToFirestore(updatedUser);
      }

      await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          adminEmail: currentUser.email,
          adminRole: currentUser.role,
        }),
      });

      setToastMessage({
        type: "success",
        text: `User ${userEmail} authorized successfully.`,
      });
    } catch {
      setToastMessage({
        type: "error",
        text: "Network error approving user.",
      });
    } finally {
      setActionLoadingEmail(null);

      setTimeout(
        () => setToastMessage(null),
        3000
      );
    }
  };

  const handleRejectUser = async (
    userEmail: string
  ) => {
    setActionLoadingEmail(userEmail);

    try {
      const existingUser = users.find(
        (u) =>
          u.email.toLowerCase() ===
          userEmail.toLowerCase()
      );

      if (existingUser) {
        const updatedUser: UserAccount = {
          ...existingUser,
          status: "rejected",
        };

        await saveUserToFirestore(updatedUser);
      }

      await fetch("/api/admin/reject-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          adminEmail: currentUser.email,
          adminRole: currentUser.role,
        }),
      });

      setToastMessage({
        type: "success",
        text: `User ${userEmail} rejected or suspended.`,
      });
    } catch {
      setToastMessage({
        type: "error",
        text: "Network error rejecting user.",
      });
    } finally {
      setActionLoadingEmail(null);

      setTimeout(
        () => setToastMessage(null),
        3000
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /* DIRECT ROLE GRANT                                                           */
  /* -------------------------------------------------------------------------- */

  const handleDirectRoleGrant = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!grantEmailInput) return;

    setIsGrantingAccess(true);

    try {
      const emailClean =
        grantEmailInput.trim().toLowerCase();

      const existingUser = users.find(
        (u) =>
          u.email.toLowerCase() === emailClean
      );

      const userToSave: UserAccount =
        existingUser
          ? {
              ...existingUser,
              role: grantRoleInput,
              status: "approved",
            }
          : {
              id: "usr_" + Date.now(),
              name: emailClean
                .split("@")[0]
                .toUpperCase(),
              email: emailClean,
              role: grantRoleInput,
              status: "approved",
              institution:
                "Space Science & Geospatial Institute",
              registeredAt:
                new Date().toISOString(),
              approvedAt:
                new Date().toISOString(),
              approvedBy: currentUser.email,
            };

      await saveUserToFirestore(userToSave);

      await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailClean,
          role: grantRoleInput,
          adminEmail: currentUser.email,
          adminRole: currentUser.role,
        }),
      });

      setToastMessage({
        type: "success",
        text: `Granted ${grantRoleInput.toUpperCase()} access to ${emailClean}.`,
      });

      setGrantEmailInput("");
    } catch {
      setToastMessage({
        type: "error",
        text: "Error assigning user role.",
      });
    } finally {
      setIsGrantingAccess(false);

      setTimeout(
        () => setToastMessage(null),
        3000
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /* EMERGENCY ALERT                                                             */
  /* -------------------------------------------------------------------------- */

  const handleBroadcastAlert = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!alertTitle || !alertMessage) return;

    try {
      await addAlertToFirestore({
        id: "alert_" + Date.now(),
        title: alertTitle,
        type: alertType,
        severity: alertSeverity,
        location: alertLocation,
        description: alertMessage,
        dateTime: new Date().toISOString(),
      });

      setAlertBroadcastSuccess(true);

      setTimeout(() => {
        setAlertBroadcastSuccess(false);
        setAlertTitle("");
        setAlertMessage("");
      }, 3000);
    } catch {
      setToastMessage({
        type: "error",
        text: "Unable to broadcast the advisory.",
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /* FILTERING                                                                   */
  /* -------------------------------------------------------------------------- */

  const filteredUserList = users.filter((u) => {
    const query =
      searchQuery.toLowerCase();

    const matchesSearch =
      u.name
        .toLowerCase()
        .includes(query) ||
      u.email
        .toLowerCase()
        .includes(query) ||
      (u.institution || "")
        .toLowerCase()
        .includes(query);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : u.status === statusFilter;

    const matchesRole =
      roleFilter === "all"
        ? true
        : u.role === roleFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRole
    );
  });

  /* -------------------------------------------------------------------------- */
  /* UI HELPERS                                                                  */
  /* -------------------------------------------------------------------------- */

  const tabItems: {
    id: AdminTab;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    {
      id: "users",
      label: "User Access",
      icon: UserCheck,
      count:
        pendingUsers.length > 0
          ? pendingUsers.length
          : undefined,
    },
    {
      id: "thresholds",
      label: "Alert Configuration",
      icon: Sliders,
    },
    {
      id: "alerts",
      label: "Emergency Broadcast",
      icon: Megaphone,
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: Activity,
    },
    {
      id: "system",
      label: "System Services",
      icon: Settings,
    },
  ];

  const roleLabel = (role: string) => {
    if (role === "official") return "Staff / Duty Officer";
    if (role === "researcher") return "Researcher";
    if (role === "admin") return "Administrator";
    if (role === "guest") return "Guest Observer";
    return role;
  };

  const roleBadgeClass = (role: string) => {
    if (role === "admin")
      return "bg-purple-50 text-purple-700 border-purple-200";

    if (
      role === "researcher" ||
      role === "scientist"
    )
      return "bg-cyan-50 text-cyan-700 border-cyan-200";

    if (
      role === "official" ||
      role === "staff"
    )
      return "bg-blue-50 text-blue-700 border-blue-200";

    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                      */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-full bg-[#f5f7f9] text-slate-900">
      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* ================================================================== */}
        {/* INSTITUTIONAL HEADER                                               */}
        {/* ================================================================== */}

        <header className="bg-white border border-slate-200 shadow-sm">
          <div className="border-t-[3px] border-[#D48F29]" />

          <div className="px-5 py-4 lg:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0E4A72]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Administration & System Control
                  </span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    R-GEVAMS
                  </span>
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Administrator Dashboard
                </h1>

                <p className="mt-1 max-w-3xl text-xs text-slate-500">
                  Central administration for personnel
                  authorization, security controls, hazard
                  communications and operational services.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-2 hidden items-center gap-2 border-r border-slate-200 pr-4 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E4A72] text-xs font-bold text-white">
                    {currentUser.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {currentUser.name}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const { doc, filename } =
                      generateRiskSummaryPdf(
                        volcanoes,
                        earthquakes,
                        currentUser as any,
                        {
                          briefingType: "all",
                          classification:
                            "CONFIDENTIAL",
                          officerName:
                            currentUser.name,
                          officerRole:
                            "SUPERINTENDENT ADMINISTRATOR",
                          officerInstitution:
                            currentUser.institution ||
                            "ESSGI Directorate & DRMC",
                        }
                      );

                    doc.save(filename);
                  }}
                  className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  Briefing PDF
                </button>

                <button
                  type="button"
                  onClick={fetchUsersAndLogs}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-[#0E4A72] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#0a3c5d] disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Refresh
                </button>

                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ================================================================== */}
        {/* TOAST                                                               */}
        {/* ================================================================== */}

        {toastMessage && (
          <div
            className={`flex items-start gap-3 border px-4 py-3 text-xs font-medium shadow-sm ${
              toastMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {toastMessage.type ===
            "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            )}

            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* ================================================================== */}
        {/* KPI STRIP                                                           */}
        {/* ================================================================== */}

        <section className="grid grid-cols-2 border border-slate-200 bg-white shadow-sm lg:grid-cols-4">

          <div className="border-b border-r border-slate-200 p-4 lg:border-b-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Pending Clearance
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-amber-600">
                  {pendingUsers.length}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Awaiting authorization
                </p>
              </div>

              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Active Personnel
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-[#0E4A72]">
                  {approvedUsers.length}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Authorized accounts
                </p>
              </div>

              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <div className="border-r border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Audit Events
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {auditLogs.length}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Logged administrative actions
                </p>
              </div>

              <Activity className="h-5 w-5 text-slate-500" />
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Platform Status
                </p>

                <p className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Core services operational
                </p>
              </div>

              <Server className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* ADMIN NAVIGATION                                                    */}
        {/* ================================================================== */}

        <nav className="border border-slate-200 bg-white shadow-sm">
          <div className="flex overflow-x-auto">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const active =
                activeAdminTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveAdminTab(tab.id)
                  }
                  className={`relative flex shrink-0 items-center gap-2 border-r border-slate-200 px-4 py-3 text-[11px] font-bold transition ${
                    active
                      ? "bg-[#0E4A72] text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0E4A72]"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      active
                        ? "text-[#F4C66A]"
                        : "text-slate-400"
                    }`}
                  />

                  <span>{tab.label}</span>

                  {tab.count !== undefined && (
                    <span
                      className={`min-w-[19px] rounded-full px-1.5 py-0.5 text-center text-[9px] ${
                        active
                          ? "bg-[#D48F29] text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ================================================================== */}
        {/* USERS                                                               */}
        {/* ================================================================== */}

        {activeAdminTab === "users" && (
          <div className="space-y-5">

            {/* Access overview */}
            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#0E4A72]" />

                    <h2 className="text-sm font-bold text-slate-900">
                      Personnel Access Control
                    </h2>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Review registration requests,
                    manage security status and assign
                    operational roles.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                  ACCESS SERVICE ACTIVE
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Total Accounts
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {users.length}
                  </p>
                </div>

                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Pending
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-600">
                    {pendingUsers.length}
                  </p>
                </div>

                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Approved
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {approvedUsers.length}
                  </p>
                </div>

                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Rejected
                  </p>
                  <p className="mt-1 text-xl font-bold text-rose-600">
                    {rejectedUsers.length}
                  </p>
                </div>
              </div>
            </section>

            {/* Direct role assignment */}
            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="border-l-4 border-[#D48F29] px-5 py-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-[#D48F29]" />

                  <h2 className="text-sm font-bold text-slate-900">
                    Direct Access Authorization
                  </h2>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Grant an approved operational role
                  directly to an institutional account.
                </p>
              </div>

              <form
                onSubmit={handleDirectRoleGrant}
                className="border-t border-slate-100 bg-slate-50/50 p-4"
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_230px_auto]">

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="email"
                      required
                      value={grantEmailInput}
                      onChange={(e) =>
                        setGrantEmailInput(
                          e.target.value
                        )
                      }
                      placeholder="Institutional email address"
                      className={`h-10 w-full border bg-white pl-9 pr-9 text-xs outline-none transition focus:ring-2 ${
                        !grantEmailInput.trim()
                          ? "border-slate-300 focus:border-[#0E4A72] focus:ring-[#0E4A72]/10"
                          : validateEmailDeliverability(
                                grantEmailInput
                              ).isValid
                            ? "border-emerald-400 focus:ring-emerald-500/10"
                            : "border-rose-400 focus:ring-rose-500/10"
                      }`}
                    />

                    {grantEmailInput.trim() && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validateEmailDeliverability(
                          grantEmailInput
                        ).isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <select
                    value={grantRoleInput}
                    onChange={(e) =>
                      setGrantRoleInput(
                        e.target.value as UserRoleType
                      )
                    }
                    className="h-10 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0E4A72] focus:ring-2 focus:ring-[#0E4A72]/10"
                  >
                    <option value="official">
                      Staff / Duty Officer
                    </option>

                    <option value="researcher">
                      Lead Researcher / Scientist
                    </option>

                    <option value="admin">
                      Administrator
                    </option>

                    <option value="guest">
                      Guest Observer
                    </option>
                  </select>

                  <button
                    type="submit"
                    disabled={
                      isGrantingAccess ||
                      (grantEmailInput.trim().length >
                        0 &&
                        !validateEmailDeliverability(
                          grantEmailInput
                        ).isValid)
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 bg-[#0E4A72] px-5 text-xs font-bold text-white transition hover:bg-[#0a3c5d] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Key className="h-4 w-4" />

                    {isGrantingAccess
                      ? "Authorizing..."
                      : "Authorize Access"}
                  </button>
                </div>

                {grantEmailInput.trim() && (
                  <div
                    className={`mt-3 border px-3 py-2 text-[10px] font-medium ${
                      validateEmailDeliverability(
                        grantEmailInput
                      ).isValid
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {
                      validateEmailDeliverability(
                        grantEmailInput
                      ).message
                    }
                  </div>
                )}
              </form>
            </section>

            {/* User directory */}
            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                  <div className="relative w-full xl:max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value
                        )
                      }
                      placeholder="Search name, email or institution..."
                      className="h-10 w-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-[#0E4A72] focus:bg-white focus:ring-2 focus:ring-[#0E4A72]/10"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    <select
                      value={roleFilter}
                      onChange={(e) =>
                        setRoleFilter(
                          e.target.value
                        )
                      }
                      className="h-9 border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-wide text-slate-600 outline-none"
                    >
                      <option value="all">
                        All Roles
                      </option>

                      <option value="official">
                        Staff / Officer
                      </option>

                      <option value="researcher">
                        Researcher
                      </option>

                      <option value="admin">
                        Administrator
                      </option>

                      <option value="guest">
                        Guest
                      </option>
                    </select>

                    {(
                      [
                        "pending",
                        "approved",
                        "rejected",
                        "all",
                      ] as const
                    ).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setStatusFilter(
                            status
                          )
                        }
                        className={`h-9 border px-3 text-[10px] font-bold uppercase tracking-wide transition ${
                          statusFilter === status
                            ? "border-[#0E4A72] bg-[#0E4A72] text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-4 py-3">
                        Personnel
                      </th>

                      <th className="px-4 py-3">
                        Role
                      </th>

                      <th className="px-4 py-3">
                        Security
                      </th>

                      <th className="px-4 py-3">
                        Institution
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUserList.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center"
                        >
                          <div className="mx-auto flex max-w-xs flex-col items-center">
                            <Search className="h-7 w-7 text-slate-300" />

                            <p className="mt-3 text-xs font-semibold text-slate-600">
                              No personnel found
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Adjust the search or
                              filter criteria.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUserList.map((u) => {
                        const isAccountLocked =
                          u.isLocked ||
                          (u.failedLoginAttempts &&
                            u.failedLoginAttempts >=
                              5);

                        return (
                          <tr
                            key={u.email}
                            className={`transition hover:bg-slate-50 ${
                              isAccountLocked
                                ? "bg-rose-50/40"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0E4A72] text-[10px] font-bold text-white">
                                  {u.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="truncate text-xs font-bold text-slate-900">
                                      {u.name}
                                    </p>

                                    {isAccountLocked && (
                                      <Lock className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                                    )}
                                  </div>

                                  <p className="mt-0.5 truncate font-mono text-[9.5px] text-slate-400">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${roleBadgeClass(
                                  u.role
                                )}`}
                              >
                                {roleLabel(u.role)}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              {isAccountLocked ? (
                                <span className="inline-flex items-center gap-1.5 border border-rose-200 bg-rose-50 px-2 py-1 font-mono text-[9px] font-bold text-rose-700">
                                  <Lock className="h-3 w-3" />
                                  LOCKED
                                </span>
                              ) : u.failedLoginAttempts &&
                                u.failedLoginAttempts >
                                  0 ? (
                                <span className="inline-flex border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[9px] font-bold text-amber-700">
                                  {
                                    u.failedLoginAttempts
                                  }
                                  /5 FAILED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[9px] font-bold text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" />
                                  SECURE
                                </span>
                              )}
                            </td>

                            <td className="max-w-[220px] px-4 py-3 text-[10px] font-medium text-slate-500">
                              <span className="line-clamp-2">
                                {u.institution ||
                                  "ESSGI"}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex border px-2 py-1 text-[9px] font-bold uppercase ${
                                  u.status ===
                                  "approved"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : u.status ===
                                        "pending"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-rose-200 bg-rose-50 text-rose-700"
                                }`}
                              >
                                {u.status}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1.5">
                                {isAccountLocked && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUnlockUser(
                                        u.email
                                      )
                                    }
                                    disabled={
                                      actionLoadingEmail ===
                                      u.email
                                    }
                                    className="inline-flex items-center gap-1 border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                                  >
                                    <Key className="h-3 w-3" />
                                    Unlock
                                  </button>
                                )}

                                {u.status !==
                                  "approved" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApproveUser(
                                        u.email
                                      )
                                    }
                                    disabled={
                                      actionLoadingEmail ===
                                      u.email
                                    }
                                    className="inline-flex items-center gap-1 bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approve
                                  </button>
                                )}

                                {u.status !==
                                  "rejected" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRejectUser(
                                        u.email
                                      )
                                    }
                                    disabled={
                                      actionLoadingEmail ===
                                      u.email
                                    }
                                    className="inline-flex items-center gap-1 bg-rose-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Reject
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-[10px] text-slate-400">
                  Showing{" "}
                  <strong className="text-slate-600">
                    {filteredUserList.length}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-slate-600">
                    {users.length}
                  </strong>{" "}
                  accounts
                </span>

                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Access Control Registry
                </span>
              </div>
            </section>

            {/* Institutional reference */}
            <section className="border border-slate-200 bg-[#0b2f48] text-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <Key className="h-4 w-4 text-[#D48F29]" />

                <h3 className="text-[11px] font-bold uppercase tracking-[0.12em]">
                  Institutional Access Reference
                </h3>

                <span className="ml-auto hidden font-mono text-[9px] text-slate-400 sm:block">
                  SECURITY POLICY: 5-TRY LOCKOUT
                </span>
              </div>

              <div className="grid grid-cols-1 divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#F4C66A]">
                      ADMINISTRATOR
                    </span>

                    <ShieldCheck className="h-4 w-4 text-[#D48F29]" />
                  </div>

                  <p className="mt-2 font-mono text-[10px] text-slate-300">
                    admin@essgi.gov.et
                  </p>

                  <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
                    Full administrative control,
                    authorization and security
                    management.
                  </p>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-300">
                      DUTY OFFICER
                    </span>

                    <Radio className="h-4 w-4 text-sky-300" />
                  </div>

                  <p className="mt-2 font-mono text-[10px] text-slate-300">
                    staff.duty@essgi.gov.et
                  </p>

                  <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
                    Operational monitoring, duty-room
                    functions and field reporting.
                  </p>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-300">
                      LEAD RESEARCHER
                    </span>

                    <Activity className="h-4 w-4 text-cyan-300" />
                  </div>

                  <p className="mt-2 font-mono text-[10px] text-slate-300">
                    researcher@essgi.gov.et
                  </p>

                  <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
                    Scientific analysis, GNSS, InSAR and
                    geohazard research functions.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================== */}
        {/* ALERT THRESHOLDS                                                    */}
        {/* ================================================================== */}

        {activeAdminTab === "thresholds" && (
          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#0E4A72]" />

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Automated Alert Configuration
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Configure hazard thresholds and
                    dispatch parameters used by the
                    monitoring platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <AlertThresholdConfigPanel
                currentUser={currentUser}
                onConfigSaved={(updatedConfig) => {
                  setToastMessage({
                    type: "success",
                    text: `Threshold parameters updated: M ≥ ${updatedConfig.minMagnitude}, Depth ≤ ${updatedConfig.maxDepth}km`,
                  });

                  setTimeout(
                    () => setToastMessage(null),
                    4000
                  );
                }}
              />
            </div>
          </section>
        )}

        {/* ================================================================== */}
        {/* EMERGENCY BROADCAST                                                  */}
        {/* ================================================================== */}

        {activeAdminTab === "alerts" && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">

            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-rose-50">
                    <Megaphone className="h-4 w-4 text-rose-600" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Emergency Hazard Broadcast
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Publish an official seismic or
                      volcanic hazard advisory.
                    </p>
                  </div>
                </div>
              </div>

              {alertBroadcastSuccess && (
                <div className="m-5 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Advisory bulletin broadcast
                  successfully.
                </div>
              )}

              <form
                onSubmit={handleBroadcastAlert}
                className="space-y-5 p-5"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Alert title
                    </label>

                    <input
                      type="text"
                      required
                      value={alertTitle}
                      onChange={(e) =>
                        setAlertTitle(
                          e.target.value
                        )
                      }
                      placeholder="Official alert title"
                      className="h-10 w-full border border-slate-300 bg-white px-3 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Target region
                    </label>

                    <input
                      type="text"
                      value={alertLocation}
                      onChange={(e) =>
                        setAlertLocation(
                          e.target.value
                        )
                      }
                      placeholder="Region / affected area"
                      className="h-10 w-full border border-slate-300 bg-white px-3 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Hazard classification
                    </label>

                    <select
                      value={alertType}
                      onChange={(e) =>
                        setAlertType(
                          e.target.value as
                            | "volcanic"
                            | "seismic"
                        )
                      }
                      className="h-10 w-full border border-slate-300 bg-white px-3 text-xs font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                    >
                      <option value="volcanic">
                        Volcanic Hazard
                      </option>

                      <option value="seismic">
                        Seismic Hazard
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Threat level
                    </label>

                    <select
                      value={alertSeverity}
                      onChange={(e) =>
                        setAlertSeverity(
                          e.target.value as
                            | "Red"
                            | "Orange"
                            | "Yellow"
                        )
                      }
                      className="h-10 w-full border border-slate-300 bg-white px-3 text-xs font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                    >
                      <option value="Red">
                        Red — Critical
                      </option>

                      <option value="Orange">
                        Orange — High
                      </option>

                      <option value="Yellow">
                        Yellow — Advisory
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Advisory instructions
                  </label>

                  <textarea
                    rows={6}
                    required
                    value={alertMessage}
                    onChange={(e) =>
                      setAlertMessage(
                        e.target.value
                      )
                    }
                    placeholder="Enter official safety instructions, affected area information and recommended response..."
                    className="w-full resize-y border border-slate-300 bg-white p-3 text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                  />
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700"
                  >
                    <Megaphone className="h-4 w-4" />
                    Broadcast Advisory
                  </button>
                </div>
              </form>
            </section>

            <aside className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />

                  <h3 className="text-xs font-bold text-slate-900">
                    Broadcast Protocol
                  </h3>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-600">
                    01
                  </span>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800">
                      Verify location
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                      Confirm the affected region and
                      hazard classification.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-600">
                    02
                  </span>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800">
                      Review severity
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                      Select the appropriate national
                      threat classification.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-slate-100 text-[9px] font-bold text-slate-600">
                    03
                  </span>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800">
                      Publish
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                      Broadcast only after verifying the
                      advisory instructions.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ALERT DISPATCH SERVICE READY
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ================================================================== */}
        {/* AUDIT LOGS                                                          */}
        {/* ================================================================== */}

        {activeAdminTab === "audit" && (
          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#0E4A72]" />

                  <h2 className="text-sm font-bold text-slate-900">
                    Security Audit Trail
                  </h2>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Administrative actions, authentication
                  events and database changes.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchUsersAndLogs}
                className="inline-flex items-center gap-2 self-start border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 md:self-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Logs
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Activity className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-xs font-semibold text-slate-600">
                    No audit events recorded
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Administrative activity will
                    appear here.
                  </p>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-slate-100">
                        <Activity className="h-3.5 w-3.5 text-slate-500" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="border border-[#0E4A72]/20 bg-[#0E4A72]/5 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#0E4A72]">
                            {log.action}
                          </span>

                          <span className="text-xs font-semibold text-slate-800">
                            {log.details ||
                              log.action}
                          </span>
                        </div>

                        <p className="mt-1 font-mono text-[9.5px] text-slate-400">
                          By:{" "}
                          {log.performedBy ||
                            log.performedByEmail ||
                            "System"}{" "}
                          ·{" "}
                          {log.performedByRole ||
                            "Admin"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-[9px] text-slate-400 md:text-right">
                      {log.timestamp
                        ? new Date(
                            log.timestamp
                          ).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                ))
              )}
            </div>

            {auditLogs.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  {auditLogs.length} recorded security
                  events
                </span>
              </div>
            )}
          </section>
        )}

        {/* ================================================================== */}
        {/* SYSTEM SERVICES                                                      */}
        {/* ================================================================== */}

        {activeAdminTab === "system" && (
          <div className="space-y-5">

            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#0E4A72]" />

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      System Services & Telemetry
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Operational status of external data
                      services and server-side intelligence
                      components.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center bg-blue-50">
                        <Database className="h-4 w-4 text-[#0085C8]" />
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          USGS Earthquake Telemetry
                        </h3>

                        <p className="mt-1 text-[10px] text-slate-500">
                          External seismic event feed
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      CONNECTED
                    </span>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Live seismic event synchronization
                      service used to ingest earthquake
                      observations into the monitoring
                      platform.
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center bg-amber-50">
                        <Lock className="h-4 w-4 text-[#D48F29]" />
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Gemini AI Geological Engine
                        </h3>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Server-side decision support
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      PROXIED
                    </span>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Server-side AI service used for
                      automated disaster decision briefings
                      and volcanic hazard summaries.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-500" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Application Server
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-sm font-bold text-emerald-600">
                    Operational
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-500" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Data Services
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-sm font-bold text-emerald-600">
                    Operational
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-slate-500" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Telemetry
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-sm font-bold text-emerald-600">
                    Operational
                  </span>
                </div>
              </div>

            </section>

            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-xs font-bold text-slate-900">
                  Administrative Service Notes
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-[10px] text-slate-500">
                    Registered personnel
                  </span>

                  <span className="font-mono text-[10px] font-bold text-slate-800">
                    {users.length}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-[10px] text-slate-500">
                    Audit records
                  </span>

                  <span className="font-mono text-[10px] font-bold text-slate-800">
                    {auditLogs.length}
                  </span>
                </div>

                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-[10px] text-slate-500">
                    Current administrator
                  </span>

                  <span className="font-mono text-[10px] font-bold text-slate-800">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================== */}
        {/* FOOTER STATUS                                                       */}
        {/* ================================================================== */}

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-3 text-[9px] font-mono uppercase tracking-wider text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            R-GEVAMS Administration Services Operational
          </div>

          <div className="flex items-center gap-2">
            <span>ESSGI</span>
            <ChevronRight className="h-3 w-3" />
            <span>Administrative Control</span>
          </div>
        </footer>

      </div>
    </div>
  );
}