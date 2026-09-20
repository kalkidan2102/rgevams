import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Mail,
  Shield,
  Key,
  ChevronRight,
  UserPlus,
  Sparkles,
  Lock,
  LogOut,
  Activity,
  X
} from "lucide-react";
import { UserAccount, UserRoleType } from "../../types";
import { authenticatedFetch } from "../../lib/api";

interface SuperAdminDashboardProps {
  currentUser: {
    name: string;
    email: string;
    role: UserRoleType;
    institution?: string;
  };
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onSelectUser?: (email: string) => void;
  onAuthenticateUser?: (user: any) => void;
}

export function SuperAdminDashboard({
  currentUser,
  onOpenAuthModal,
  onSignOut,
  onAuthenticateUser
}: SuperAdminDashboardProps) {
  // Explicit state arrays for approved vs pending users
  const [approvedUsers, setApprovedUsers] = useState<UserAccount[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserAccount[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<UserAccount[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingEmail, setActionLoadingEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Quick Access Grant Panel State
  const [grantEmailInput, setGrantEmailInput] = useState("");
  const [grantRoleInput, setGrantRoleInput] = useState<UserRoleType>("official");
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);

  // Super Admin Approval Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalSearchQuery, setApprovalSearchQuery] = useState("");

  // Gateway form state for non-superadmin users
  const [gatewayMode, setGatewayMode] = useState<"signin" | "register">("signin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regRole, setRegRole] = useState<UserRoleType>("official");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regMsg, setRegMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isSuperAdminOrAdmin = currentUser.role === "superadmin" || currentUser.role === "admin";

  const handleQuickSuperAdmin = () => {
    const superAdminUser = {
      name: "Dr. Biruk Tesfaye",
      email: "superadmin@essgi.gov.et",
      role: "superadmin" as UserRoleType,
      institution: "ESSGI Directorate General"
    };
    if (onAuthenticateUser) {
      onAuthenticateUser(superAdminUser);
    }
  };

  const handleGatewayLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Authentication failed.");
      } else {
        if (data.token) {
          localStorage.setItem("essgi_auth_token", data.token);
        }
        setLoginSuccess(`Clearance Granted! Welcome, ${data.user.name}`);
        setTimeout(() => {
          if (onAuthenticateUser) {
            onAuthenticateUser(data.user);
          }
        }, 800);
      }
    } catch {
      setLoginError("Failed to connect to ESSGI Security Server.");
    }
  };

  const handleGatewayRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMsg(null);
    if (regPassword !== regConfirmPassword) {
      setRegMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          institution: regInstitution || "Ethiopian Space Science and Geospatial Institute",
          role: regRole,
          password: regPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegMsg({ type: "error", text: data.error || "Registration failed." });
      } else {
        if (data.token) {
          localStorage.setItem("essgi_auth_token", data.token);
        }
        setRegMsg({
          type: "success",
          text: data.message || "Registration submitted successfully! Your account is now in the pending queue awaiting Super Admin approval."
        });
        setRegName("");
        setRegEmail("");
        setRegInstitution("");
        setRegPassword("");
        setRegConfirmPassword("");
      }
    } catch {
      setRegMsg({ type: "error", text: "Network error during registration." });
    }
  };

  const fetchUsersAndLogs = async () => {
    if (!isSuperAdminOrAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/admin/users");
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.users) {
          const fetchedUsers: UserAccount[] = data.users;
          setUsers(fetchedUsers);
          setApprovedUsers(fetchedUsers.filter((u) => u.status === "approved"));
          setPendingUsers(fetchedUsers.filter((u) => u.status === "pending"));
          setRejectedUsers(fetchedUsers.filter((u) => u.status === "rejected"));
        }
      }

      // Fetch audit logs
      const logsRes = await authenticatedFetch("/api/admin/audit-logs");
      const logsContentType = logsRes.headers.get("content-type");
      if (logsRes.ok && logsContentType && logsContentType.includes("application/json")) {
        const logsData = await logsRes.json();
        setAuditLogs(Array.isArray(logsData.logs) ? logsData.logs.slice(0, 10) : Array.isArray(logsData) ? logsData.slice(0, 10) : []);
      }
    } catch {
      // Fallback handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdminOrAdmin) {
      fetchUsersAndLogs();
    } else {
      setLoading(false);
    }
  }, [currentUser.role, currentUser.email]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const grantUserAccessRights = async (targetEmail: string, targetRole: UserRoleType = "official") => {
    if (!targetEmail || !targetEmail.trim()) {
      showToast("error", "Please specify a valid user email address.");
      return;
    }

    const cleanEmail = targetEmail.trim().toLowerCase();
    setIsGrantingAccess(true);
    setActionLoadingEmail(cleanEmail);

    try {
      // 1. Send approval request to backend
      const approveRes = await authenticatedFetch(`/api/admin/users/${encodeURIComponent(cleanEmail)}/approve`, {
        method: "PUT"
      });

      const approveData = await approveRes.json();
      if (!approveRes.ok) {
        showToast("error", approveData.error || `Failed to approve user access rights for ${cleanEmail}`);
        return;
      }

      // 2. If assigned role differs from current role, update role via endpoint
      if (targetRole && currentUser.role === "superadmin") {
        await authenticatedFetch(`/api/admin/users/${encodeURIComponent(cleanEmail)}/role`, {
          method: "PUT",
          body: JSON.stringify({ role: targetRole })
        });
      }

      showToast("success", `✅ Access Rights Granted! ${cleanEmail} approved as [${targetRole.toUpperCase()}]`);
      setGrantEmailInput("");
      fetchUsersAndLogs();
    } catch {
      showToast("error", "Network error granting access rights.");
    } finally {
      setIsGrantingAccess(false);
      setActionLoadingEmail(null);
    }
  };

  const handleApproveUser = async (email: string, name: string) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const roleToGrant = existing?.role || "official";
    await grantUserAccessRights(email, roleToGrant);
  };

  const handleRejectUser = async (email: string, name: string) => {
    setActionLoadingEmail(email);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${encodeURIComponent(email)}/reject`, {
        method: "PUT"
      });
      const data = await res.json();
      if (res.ok) {
        showToast("error", `⛔ Registration Denied: Request for ${name} was rejected.`);
        fetchUsersAndLogs();
      } else {
        showToast("error", data.error || "Rejection action failed");
      }
    } catch (err) {
      showToast("error", "Network error during rejection");
    } finally {
      setActionLoadingEmail(null);
    }
  };

  const handleChangeRole = async (email: string, newRole: UserRoleType, name: string) => {
    setActionLoadingEmail(email);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${encodeURIComponent(email)}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", `Role updated for ${name}: changed to ${newRole.toUpperCase()}`);
        fetchUsersAndLogs();
      } else {
        showToast("error", data.error || "Failed to update role");
      }
    } catch (err) {
      showToast("error", "Network error updating role");
    } finally {
      setActionLoadingEmail(null);
    }
  };

  const handleDeleteUser = async (email: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently revoke and delete the account for ${name} (${email})?`)) {
      return;
    }
    setActionLoadingEmail(email);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", `Account for ${name} deleted.`);
        fetchUsersAndLogs();
      } else {
        showToast("error", data.error || "Delete failed");
      }
    } catch (err) {
      showToast("error", "Network error deleting user");
    } finally {
      setActionLoadingEmail(null);
    }
  };

  const handleSeedTestPending = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/seed-test-pending", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("success", `🧪 Test Registration Created: ${data.user.name} (${data.user.role})`);
        fetchUsersAndLogs();
      }
    } catch {
      showToast("error", "Failed to seed test user");
    }
  };


  const handleApproveAllPending = async () => {
    if (pendingUsers.length === 0) return;
    if (!window.confirm(`Are you sure you want to approve all ${pendingUsers.length} pending registration requests?`)) {
      return;
    }
    setLoading(true);
    let count = 0;
    for (const pUser of pendingUsers) {
      await grantUserAccessRights(pUser.email, pUser.role || "official");
      count++;
    }
    showToast("success", `✅ Approved ${count} pending official/admin accounts.`);
    setLoading(false);
    fetchUsersAndLogs();
  };

  // Metrics
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const approvedOfficialCount = users.filter((u) => u.status === "approved" && u.role === "official").length;
  const approvedAdminCount = users.filter((u) => u.status === "approved" && (u.role === "admin" || u.role === "superadmin")).length;
  const totalUsersCount = users.length;

  // Filtered List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.institution.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ? true : u.status === statusFilter;
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  if (!isSuperAdminOrAdmin) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 font-sans pb-12 animate-fade-in">
        {/* Flag Bar Accent */}
        <div className="w-full h-1.5 bg-gradient-to-r from-[#009A44] via-[#FED100] to-[#EF2B2D] rounded-t-2xl shadow-sm" />

        {/* Bureau Header Card */}
        <div className="bg-gradient-to-br from-[#0A2E47] via-[#0E4A72] to-[#081F30] text-white p-7 md:p-9 rounded-2xl shadow-2xl border border-[#D48F29]/40 relative overflow-hidden text-center space-y-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D48F29]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Bilingual Federal Badge Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-[#D48F29] text-[#0E4A72] font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-widest font-mono shadow-md">
              <ShieldCheck className="w-4 h-4 text-[#0E4A72]" />
              FDRE — ETHIOPIAN SPACE SCIENCE & GEOSPATIAL INSTITUTE (ESSGI)
            </div>
            <p className="text-[10px] text-amber-200/90 font-mono tracking-wider pt-1 uppercase">
              የኢትዮጵያ ስፔስ ሳይንስ እና ጂኦስፓሻል ኢንስቲትዩት • DIRECTORATE GENERAL CONTROL CENTER
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-3">
              <Shield className="w-8 h-8 text-[#F7D08A]" />
              Super Admin Security Authorization Portal
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              Restricted clearance terminal for Directorate Generals, Security Managers, and Senior Geophysicists. Unauthenticated users must sign in with official credentials or apply for officer authorization.
            </p>
          </div>

          {/* Institutional Access Security Note */}
          <div className="pt-2 border-t border-white/10 max-w-xl mx-auto">
            <div className="bg-white/5 border border-amber-400/30 rounded-2xl p-4 space-y-2 backdrop-blur-md text-left">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase text-amber-300 font-bold tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  ESSGI Security Clearance Notice
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                  AUTH REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Enter your official email address and authorized security key below to gain access to the Super Admin portal.
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 relative">
          {/* Form Tabs */}
          <div className="flex items-center justify-center border-b border-slate-200 dark:border-white/10 pb-4 gap-6">
            <button
              onClick={() => setGatewayMode("signin")}
              className={`pb-2.5 px-5 font-black text-xs md:text-sm cursor-pointer transition-all border-b-2 uppercase tracking-wider ${
                gatewayMode === "signin"
                  ? "border-[#0085C8] text-[#0085C8] dark:border-[#00D4FF] dark:text-[#00D4FF]"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              Directorate Sign In
            </button>
            <button
              onClick={() => setGatewayMode("register")}
              className={`pb-2.5 px-5 font-black text-xs md:text-sm cursor-pointer transition-all border-b-2 uppercase tracking-wider ${
                gatewayMode === "register"
                  ? "border-[#0085C8] text-[#0085C8] dark:border-[#00D4FF] dark:text-[#00D4FF]"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              Apply for Officer Clearance
            </button>
          </div>

          {gatewayMode === "signin" ? (
            <form onSubmit={handleGatewayLogin} className="space-y-4 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Official Institutional Authentication
                </h3>
                <p className="text-xs text-slate-500">Provide official bureau email and security password</p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
                  {loginError}
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                  {loginSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-mono">
                  Institutional Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. superadmin@essgi.gov.et"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0E4A72]"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-mono">
                  Security Key / Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0E4A72]"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#F7D08A]" />
                <span>Verify & Login to Bureau</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleGatewayRegister} className="space-y-4 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Officer Clearance Application
                </h3>
                <p className="text-xs text-slate-500">Submitted profiles are placed in the Super Admin review queue</p>
              </div>

              {regMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold text-center border ${
                    regMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {regMsg.text}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name & Rank</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Abebe Bikila (Senior Geophysicist)"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Bureau Email</label>
                <input
                  type="email"
                  placeholder="e.g. abebe@essgi.gov.et"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bureau Directorate / Department</label>
                <input
                  type="text"
                  placeholder="e.g. ESSGI Volcano & Geohazard Monitoring Directorate"
                  value={regInstitution}
                  onChange={(e) => setRegInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Requested Role Level</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                >
                  <option value="guest">GUEST (Public Geohazard Viewer)</option>
                  <option value="researcher">RESEARCHER / SCIENTIST (Analytics & GIS)</option>
                  <option value="official">DISASTER MANAGEMENT OFFICIAL (Monitoring & Alerts)</option>
                  <option value="admin">ADMINISTRATOR (Operational & User Management)</option>
                  <option value="superadmin">SUPER ADMINISTRATOR (Platform Governance)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#D48F29] hover:bg-[#b8781e] text-[#0E4A72] font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Submit Application to Super Admin Review Queue</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans select-none pb-12 animate-fade-in">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-[9999] p-4 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-bold max-w-md animate-bounce ${
            toastMessage.type === "success"
              ? "bg-emerald-900/90 text-emerald-100 border-emerald-500/40"
              : "bg-rose-900/90 text-rose-100 border-rose-500/40"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0E4A72] via-[#123854] to-[#0B2538] text-white p-6 md:p-8 rounded-2xl shadow-xl border border-[#D48F29]/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#D48F29]/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#D48F29] text-[#0E4A72] font-black text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ESSGI DIRECTORATE GENERAL CONTROL
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                PROD SECURITY GATEWAY
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#F7D08A]" />
              Super Admin Approval Portal
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
              Authorize, approve, or reject official geophysicists, disaster duty personnel, and administrators. Approved users gain access to real-time advisory controls and hazard databases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0E4A72] font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md relative group active:scale-95"
            >
              <Clock className="w-4 h-4 text-[#0E4A72]" />
              <span>Approval Queue</span>
              {pendingUsers.length > 0 && (
                <span className="bg-[#0E4A72] text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                  {pendingUsers.length} PENDING
                </span>
              )}
            </button>

            <button
              onClick={handleSeedTestPending}
              className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-[#F7D08A] font-bold rounded-xl text-xs border border-amber-500/40 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              title="Generate a sample registration request to test the approval pipeline"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>🧪 Demo Pending Request</span>
            </button>

            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 bg-[#D48F29] hover:bg-[#b8781e] text-[#0E4A72] font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </button>
            )}

            <button
              onClick={fetchUsersAndLogs}
              disabled={loading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl border border-white/10 cursor-pointer transition-all"
              title="Refresh users database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Direct Access Rights Authorization Panel */}
      <div className="bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-[#0E4A72] dark:text-[#D48F29]" />
            <h3 className="font-black text-xs tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
              Direct Access Rights Authorization (Email Override)
            </h3>
          </div>
          <span className="text-[10px] bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono px-2.5 py-0.5 rounded-full font-extrabold uppercase border border-amber-500/30">
            SUPER ADMIN AUTHORITY
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            grantUserAccessRights(grantEmailInput, grantRoleInput);
          }}
          className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-1"
        >
          <div className="flex-1 relative">
            <input
              type="email"
              placeholder="Enter target user email (e.g. duty.officer@essgi.gov.et)"
              value={grantEmailInput}
              onChange={(e) => setGrantEmailInput(e.target.value)}
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0E4A72]"
              required
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="w-full md:w-60 shrink-0">
            <select
              value={grantRoleInput}
              onChange={(e) => setGrantRoleInput(e.target.value as UserRoleType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0E4A72]"
            >
              <option value="guest">GUEST (Visitor)</option>
              <option value="researcher">RESEARCHER / SCIENTIST</option>
              <option value="official">DISASTER OFFICIAL</option>
              <option value="admin">ADMINISTRATOR</option>
              <option value="superadmin">SUPER ADMINISTRATOR</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isGrantingAccess}
            className="px-5 py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F7D08A]" />
            <span>{isGrantingAccess ? "Granting Access..." : "Grant Access Rights"}</span>
          </button>
        </form>

        {/* Quick Email Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
          <span className="text-[10px] uppercase font-bold text-slate-400">Quick Fill:</span>
          {[
            { label: "duty.geophysicist@essgi.gov.et", role: "official" as const },
            { label: "directorate.manager@essgi.gov.et", role: "admin" as const },
            { label: "seismologist@essgi.gov.et", role: "official" as const }
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setGrantEmailInput(chip.label);
                setGrantRoleInput(chip.role);
              }}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#0E4A72] hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-[10px] transition-colors cursor-pointer border border-slate-200 dark:border-white/5"
            >
              + {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals Card */}
        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            statusFilter === "pending"
              ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20"
              : "bg-white dark:bg-[#0B0C10] border-amber-200 dark:border-amber-900/40 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider font-mono">
              Pending Queue
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingUsers.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">pending users</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsApprovalModalOpen(true);
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>Approval Modal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {pendingUsers.length > 0 ? (
            <div className="mt-2 flex items-center justify-between text-[10px] text-amber-600 font-bold animate-pulse">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Awaiting decision</span>
              </span>
              <span className="underline">Click to view modal</span>
            </div>
          ) : (
            <span className="mt-2 block text-[10px] text-slate-400 font-mono">Queue completely clear</span>
          )}
        </div>

        {/* Approved Officials Card */}
        <div
          onClick={() => {
            setStatusFilter("approved");
            setRoleFilter("official");
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "approved" && roleFilter === "official"
              ? "bg-sky-500/10 border-sky-500 shadow-md ring-2 ring-sky-500/20"
              : "bg-white dark:bg-[#0B0C10] border-slate-200 dark:border-white/10 hover:border-sky-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider font-mono">
              Approved Registry
            </span>
            <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-600 dark:text-sky-400">{approvedUsers.length}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">approved accounts</span>
          </div>
          <span className="mt-2 block text-[10px] text-slate-400">Granted Official/Admin clearance</span>
        </div>

        {/* Approved Admins Card */}
        <div
          onClick={() => {
            setStatusFilter("approved");
            setRoleFilter("admin");
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "approved" && (roleFilter === "admin" || roleFilter === "superadmin")
              ? "bg-indigo-500/10 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
              : "bg-white dark:bg-[#0B0C10] border-slate-200 dark:border-white/10 hover:border-indigo-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider font-mono">
              Approved Admins
            </span>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{approvedAdminCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">system managers</span>
          </div>
          <span className="mt-2 block text-[10px] text-slate-400">Full system & audit authority</span>
        </div>

        {/* Total Accounts Card */}
        <div
          onClick={() => {
            setStatusFilter("all");
            setRoleFilter("all");
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "all" && roleFilter === "all"
              ? "bg-slate-500/10 border-slate-500 shadow-md"
              : "bg-white dark:bg-[#0B0C10] border-slate-200 dark:border-white/10 hover:border-slate-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Total Accounts
            </span>
            <div className="p-2 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{totalUsersCount}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">registered identities</span>
          </div>
          <span className="mt-2 block text-[10px] text-slate-400">Database synchronization active</span>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden space-y-4">
        {/* Table Controls Toolbar */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#0B0C10]/50">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-white/10"
              }`}
            >
              <span>Pending Queue</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                statusFilter === "pending" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              }`}>
                {pendingUsers.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-white/10"
              }`}
            >
              <span>Approved Registry</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black bg-emerald-100 text-emerald-800">
                {approvedUsers.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                statusFilter === "rejected"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-white/10"
              }`}
            >
              <span>Rejected List</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black bg-rose-100 text-rose-800">
                {rejectedUsers.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-white/10"
              }`}
            >
              All Users ({totalUsersCount})
            </button>
          </div>

          {/* Search & Role Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search name, email, institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-1.5 pl-9 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0E4A72]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="official">Official Only</option>
              <option value="admin">Admin Only</option>
              <option value="superadmin">Super Admin</option>
              <option value="guest">Guest / Visitor</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0E4A72]" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider">Loading ESSGI User Database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <UserX className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No accounts match the current filter criteria.</p>
              <p className="text-xs text-slate-400">
                {statusFilter === "pending"
                  ? "There are currently no pending registration requests awaiting approval."
                  : "Try clearing search filters or selecting 'All Users'."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-[#121820] text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                  <th className="py-3 px-5">User Identity</th>
                  <th className="py-3 px-4">Requested Role</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-5 text-right">Clearance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {filteredUsers.map((user) => {
                  const isPending = user.status === "pending";
                  const isApproved = user.status === "approved";
                  const isRejected = user.status === "rejected";
                  const isSelf = user.email.toLowerCase() === currentUser.email.toLowerCase();
                  const isLoading = actionLoadingEmail === user.email;

                  return (
                    <tr
                      key={user.email}
                      className={`hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors ${
                        isPending ? "bg-amber-500/5 dark:bg-amber-500/10" : ""
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-xs shrink-0 ${
                              user.role === "superadmin"
                                ? "bg-amber-500 text-[#0E4A72]"
                                : user.role === "admin"
                                ? "bg-indigo-600 text-white"
                                : user.role === "official"
                                ? "bg-sky-600 text-white"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>{user.name}</span>
                              {isSelf && (
                                <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.email, e.target.value as UserRoleType, user.name)}
                          disabled={isLoading || isSelf}
                          className={`px-2.5 py-1 rounded-lg font-mono text-[10.5px] font-bold border cursor-pointer focus:outline-none ${
                            user.role === "superadmin"
                              ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                              : user.role === "admin"
                              ? "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                              : user.role === "official"
                              ? "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                              : user.role === "researcher" || user.role === "scientist"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <option value="guest">GUEST (Public)</option>
                          <option value="researcher">RESEARCHER / SCIENTIST</option>
                          <option value="official">DISASTER OFFICIAL</option>
                          <option value="admin">ADMINISTRATOR</option>
                          <option value="superadmin">SUPER ADMINISTRATOR</option>
                        </select>
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {user.institution}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>PENDING APPROVAL</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>APPROVED</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>REJECTED</span>
                          </span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : "Pre-seeded"}
                        {user.approvedBy && (
                          <div className="text-[9.5px] text-slate-400">By {user.approvedBy}</div>
                        )}
                      </td>

                      {/* Clearance Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApproveUser(user.email, user.name)}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Approve user registration and grant access"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => handleRejectUser(user.email, user.name)}
                                disabled={isLoading}
                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-lg text-xs border border-rose-200 dark:border-rose-900 transition-all cursor-pointer flex items-center gap-1"
                                title="Reject registration request"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Deny</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleRejectUser(user.email, user.name)}
                              disabled={isLoading || isSelf}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-600 dark:text-slate-400 hover:text-rose-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                              title="Suspend or reject access"
                            >
                              Revoke
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleApproveUser(user.email, user.name)}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                              title="Re-approve access"
                            >
                              Re-Approve
                            </button>
                          )}

                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(user.email, user.name)}
                              disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Security Audit Trail Stream */}
      {auditLogs.length > 0 && (
        <div className="bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0E4A72] dark:text-[#D48F29]" />
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-slate-900 dark:text-slate-100 font-mono">
                Recent Security Audit Logs (Clearance Events)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Real-time persistent audit channel</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {log.performedBy} ({log.performedByRole?.toUpperCase()})
                    </span>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono uppercase">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11.5px] leading-normal">{log.details}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECURE SUPER ADMIN APPROVAL MODAL */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-sans animate-fade-in">
          <div className="bg-white dark:bg-[#0B0C10] rounded-2xl border border-amber-500/30 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0E4A72] via-[#0b3857] to-[#0E4A72] px-6 py-4 text-white flex items-center justify-between border-b border-amber-500/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/40 text-amber-400">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base tracking-wider uppercase font-display text-white">
                      Super Admin Approval Gate
                    </h3>
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-mono px-2 py-0.5 rounded-full font-black uppercase">
                      Official Clearance
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 font-mono mt-0.5">
                    Review and toggle Approve / Deny status for pending Official & Admin account registrations
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-bar Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* Search pending users */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search pending applicants..."
                  value={approvalSearchQuery}
                  onChange={(e) => setApprovalSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSeedTestPending}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Add a sample pending request for testing"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Seed Test Request</span>
                </button>

                {pendingUsers.length > 0 && (
                  <button
                    onClick={handleApproveAllPending}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve All ({pendingUsers.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body / Pending Queue List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {pendingUsers.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      Pending Approval Queue Clear
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                      There are currently no pending registration requests awaiting Super Admin authorization. All official and administrator accounts are cleared.
                    </p>
                  </div>
                  <button
                    onClick={handleSeedTestPending}
                    className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Sample Pending Account</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers
                    .filter(
                      (u) =>
                        u.name.toLowerCase().includes(approvalSearchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(approvalSearchQuery.toLowerCase()) ||
                        u.institution.toLowerCase().includes(approvalSearchQuery.toLowerCase())
                    )
                    .map((user) => {
                      const isLoading = actionLoadingEmail === user.email;

                      return (
                        <div
                          key={user.email}
                          className="p-4 bg-slate-50 dark:bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl transition-all shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-black flex items-center justify-center text-sm shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    {user.name}
                                  </span>
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                                    user.role === "admin"
                                      ? "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800"
                                      : "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800"
                                  }`}>
                                    Requested: {user.role.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{user.email}</span>
                                  <span>•</span>
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span>{user.institution}</span>
                                </div>
                              </div>
                            </div>

                            {/* Timestamp */}
                            <div className="text-[10.5px] font-mono text-slate-400 flex items-center gap-1 sm:text-right">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>
                                Submitted: {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : "Just now"}
                              </span>
                            </div>
                          </div>

                          {/* Approval / Denial Toggle Controls */}
                          <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/50 dark:bg-slate-950/50 p-3 rounded-xl">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              <label className="text-[11px] font-mono uppercase text-slate-400">Grant Level:</label>
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeRole(user.email, e.target.value as UserRoleType, user.name)}
                                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                              >
                                <option value="guest">Guest (Read Only)</option>
                                <option value="researcher">Researcher / Scientist</option>
                                <option value="official">Disaster Management Official</option>
                                <option value="admin">Administrator</option>
                                <option value="superadmin">Super Administrator</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2 justify-end">
                              {/* DENY BUTTON */}
                              <button
                                onClick={() => handleRejectUser(user.email, user.name)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold rounded-xl text-xs border border-rose-200 dark:border-rose-900 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                <span>Deny Request</span>
                              </button>

                              {/* APPROVE BUTTON */}
                              <button
                                onClick={() => handleApproveUser(user.email, user.name)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve Account</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>ESSGI Directorate General Authorization Gate</span>
              </div>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
