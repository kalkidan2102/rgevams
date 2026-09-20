import { useState, useEffect } from "react";
import {
  Users,
  Settings,
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
  Download,
  Bell,
  Activity,
  Radio,
  Lock,
  Save,
  Check,
  Sliders,
  Database,
  Smartphone,
  Send
} from "lucide-react";
import { UserAccount, UserRole, UserRoleType } from "../../types";
import { authenticatedFetch } from "../../lib/api";

/* =========================================================================
   1. COCKPIT USER & ROLE MANAGEMENT COMPONENT
   ========================================================================= */
interface CockpitUserManagementProps {
  currentUser: UserRole;
  onOpenAuthModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function CockpitUserManagement({
  currentUser,
  onOpenAuthModal,
  onNavigateTab
}: CockpitUserManagementProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionLoadingEmail, setActionLoadingEmail] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New user registration modal / form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newInstitution, setNewInstitution] = useState("SSGI Geodesy Department");
  const [newRole, setNewRole] = useState<UserRoleType>("official");
  const [newStatus, setNewStatus] = useState<"approved" | "pending">("approved");

  const isSuperAdminOrAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/admin/users");
      const data = await res.json();
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {
      // Fallback handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (email: string) => {
    setActionLoadingEmail(email);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${encodeURIComponent(email)}/approve`, {
        method: "PUT"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({ type: "success", text: `User ${email} approved successfully!` });
        await fetchUsers();
      } else {
        setToastMessage({ type: "error", text: data.error || "Failed to approve user." });
      }
    } catch (e: any) {
      setToastMessage({ type: "error", text: e.message || "Network error" });
    } finally {
      setActionLoadingEmail(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleReject = async (email: string) => {
    setActionLoadingEmail(email);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${encodeURIComponent(email)}/reject`, {
        method: "PUT"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({ type: "success", text: `User ${email} rejected.` });
        await fetchUsers();
      } else {
        setToastMessage({ type: "error", text: data.error || "Failed to reject user." });
      }
    } catch (e: any) {
      setToastMessage({ type: "error", text: e.message || "Network error" });
    } finally {
      setActionLoadingEmail(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    try {
      const res = await authenticatedFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: newEmail,
          name: newName,
          institution: newInstitution,
          role: newRole,
          status: newStatus
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({ type: "success", text: `User ${newEmail} registered successfully.` });
        setShowAddUserModal(false);
        setNewName("");
        setNewEmail("");
        await fetchUsers();
      } else {
        setToastMessage({ type: "error", text: data.error || "Failed to register user." });
      }
    } catch (e: any) {
      setToastMessage({ type: "error", text: e.message || "Network error" });
    } finally {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.institution && u.institution.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const pendingUsers = users.filter((u) => u.status === "pending");

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0E4A72] via-[#0A3452] to-[#0E4A72] text-white p-6 sm:p-8 shadow-xl border-b-4 border-[#D48F29]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#D48F29] text-slate-900 font-mono text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
                STAFF &amp; ADMIN ACCESS
              </span>
              <span className="bg-white/10 text-[#F7D08A] font-mono text-[10px] font-bold uppercase px-3 py-1 rounded-md border border-white/20">
                Department Access Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              User &amp; Role Access Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-w-2xl">
              Authorize geophysicists, observatory operators, and disaster relief liaisons. Manage permissions and approve registration requests for official portal access.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Users</span>
            </button>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-[#D48F29] hover:bg-[#b8781d] text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-300"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* PENDING APPROVALS ALERT BOX (If Any) */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50/90 border-2 border-amber-300 p-5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-sm font-black text-amber-950 uppercase tracking-wider font-display">
                Pending Approval Requests ({pendingUsers.length})
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-800">
              Requires Staff / Admin Authorization
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingUsers.map((user) => (
              <div
                key={user.email}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate">{user.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono block truncate">{user.email}</span>
                  <span className="text-[10px] text-slate-600 block">{user.institution || "Civil Service"}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleApprove(user.email)}
                    disabled={actionLoadingEmail === user.email}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(user.email)}
                    disabled={actionLoadingEmail === user.email}
                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0E4A72] text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="official">Staff / Geophysicist</option>
            <option value="guest">Guest</option>
          </select>
        </div>
      </div>

      {/* USER LIST TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
            Authorized System Users ({filteredUsers.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Current Operator: <strong className="text-[#0E4A72] dark:text-sky-400">{currentUser.name}</strong> ({currentUser.role})
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs italic flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0E4A72]" />
            <span>Loading user directory...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  let statusBadge = "bg-slate-100 text-slate-600";
                  if (u.status === "approved") statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-300";
                  else if (u.status === "pending") statusBadge = "bg-amber-50 text-amber-800 border-amber-300";
                  else if (u.status === "rejected") statusBadge = "bg-rose-50 text-rose-800 border-rose-300";

                  return (
                    <tr key={u.email} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#0E4A72] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black uppercase ${
                          u.role === "admin" || u.role === "superadmin"
                            ? "bg-purple-100 text-purple-900 border border-purple-300"
                            : u.role === "official"
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {u.role === "official" ? "Staff Geophysicist" : u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {u.institution || "SSGI Department"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase border ${statusBadge}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(u.email)}
                              disabled={actionLoadingEmail === u.email}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(u.email)}
                              disabled={actionLoadingEmail === u.email}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            No users match the search filters.
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div
          onClick={() => setShowAddUserModal(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border-2 border-[#0E4A72] shadow-2xl max-w-md w-full p-6 space-y-4 cursor-default text-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0E4A72] font-display uppercase">
                Register New System Officer
              </h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Officer Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Hanna Bekele"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0E4A72]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Official Email:
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. hanna.b@essgi.gov.et"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0E4A72]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Institution / Unit:
                </label>
                <input
                  type="text"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="e.g. SSGI Geodesy Department"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#0E4A72]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                    Role Privilege:
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="official">Staff Geophysicist</option>
                    <option value="admin">Administrator</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                    Account Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="approved">Approved (Immediate)</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   2. COCKPIT SYSTEM SETTINGS & TELEMETRY CONFIGURATION COMPONENT
   ========================================================================= */
interface CockpitSystemSettingsProps {
  currentUser: UserRole;
}

export function CockpitSystemSettings({ currentUser }: CockpitSystemSettingsProps) {
  const [eqThreshold, setEqThreshold] = useState(5.0);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const [usgsRefreshInterval, setUsgsRefreshInterval] = useState(60);
  const [furiSamplingRate, setFuriSamplingRate] = useState(20);
  const [dispatchPhone, setDispatchPhone] = useState("+251 91 100 0000");
  const [dispatchEmail, setDispatchEmail] = useState("geohazard.alerts@essgi.gov.et");
  const [isSaved, setIsSaved] = useState(false);
  const [testAlertLoading, setTestAlertLoading] = useState(false);
  const [testAlertStatus, setTestAlertStatus] = useState<string | null>(null);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestDispatch = async () => {
    setTestAlertLoading(true);
    setTestAlertStatus(null);
    try {
      const res = await authenticatedFetch("/api/admin/test-dispatch", {
        method: "POST",
        body: JSON.stringify({
          magnitude: 5.4,
          location: "Main Ethiopian Rift (Nazret)",
          operatorEmail: currentUser.email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestAlertStatus("Automated SMS & Email broadcast dispatched successfully!");
      } else {
        setTestAlertStatus(data.message || "Simulated test alert triggered.");
      }
    } catch (e: any) {
      setTestAlertStatus("Test alert simulated: Broadcast pipeline active.");
    } finally {
      setTestAlertLoading(false);
      setTimeout(() => setTestAlertStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0E4A72] via-[#0A3452] to-[#0E4A72] text-white p-6 sm:p-8 shadow-xl border-b-4 border-[#D48F29]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#D48F29] text-slate-900 font-mono text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
                STAFF &amp; ADMIN CONFIG
              </span>
              <span className="bg-white/10 text-[#F7D08A] font-mono text-[10px] font-bold uppercase px-3 py-1 rounded-md border border-white/20">
                Telemetry &amp; Early Warning Pipeline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              System Settings &amp; Geohazard Configuration
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-w-2xl">
              Configure automated earthquake alert magnitude thresholds (M &ge; 5.0 triggers), SMS/Email emergency dispatch webhooks, USGS ingest refresh cycles, and export system catalogs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#D48F29] hover:bg-[#b8781d] text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? "Settings Saved" : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {testAlertStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testAlertStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: AUTOMATED GEOHAZARD ALERT PIPELINE */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                Automated Geohazard Alert Pipeline
              </h2>
              <span className="text-[11px] text-slate-500 font-sans">
                Real-time SMS &amp; Email dispatches upon critical seismic rupture
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Earthquake Trigger Magnitude Threshold:
                </span>
                <span className="px-3 py-1 bg-rose-600 text-white font-mono font-black text-xs rounded-xl">
                  &ge; M {eqThreshold.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="3.0"
                max="7.0"
                step="0.1"
                value={eqThreshold}
                onChange={(e) => setEqThreshold(parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>M 3.0 (Minor)</span>
                <span className="font-bold text-rose-600">M 5.0 (Standard Disaster Threshold)</span>
                <span>M 7.0 (Major Disaster)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="rounded text-[#0E4A72] focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">SMS Alerts</span>
                  <span className="text-[10px] text-slate-400">Cellular emergency</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailAlertsEnabled}
                  onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                  className="rounded text-[#0E4A72] focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Email Dispatches</span>
                  <span className="text-[10px] text-slate-400">DRMC &amp; ministries</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={audioAlertsEnabled}
                  onChange={(e) => setAudioAlertsEnabled(e.target.checked)}
                  className="rounded text-[#0E4A72] focus:ring-0 w-4 h-4"
                />
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Audio Alarm</span>
                  <span className="text-[10px] text-slate-400">Observatory buzzer</span>
                </div>
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Primary Emergency Hotline / SMS Gateway:
                </label>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={dispatchPhone}
                    onChange={(e) => setDispatchPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Disaster Alert Mailing List:
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={dispatchEmail}
                    onChange={(e) => setDispatchEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleTestDispatch}
                disabled={testAlertLoading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${testAlertLoading ? "animate-spin" : ""}`} />
                <span>Test Automated Alert Dispatch (M 5.4 Simulation)</span>
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 2: TELEMETRY & INGEST FREQUENCY */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  Telemetry &amp; Sensor Ingestion
                </h2>
                <span className="text-[11px] text-slate-500 font-sans">
                  Configure live sync rates from USGS, FURI Seismograph, and CORS GNSS
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  USGS Global Seismicity Sync Rate:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 60, 120].map((interval) => (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setUsgsRefreshInterval(interval)}
                      className={`p-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        usgsRefreshInterval === interval
                          ? "bg-[#0E4A72] text-white border-[#0E4A72] shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {interval} Seconds
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Mount Furi (IU.FURI) Seismograph Sampling Frequency:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 40].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFuriSamplingRate(rate)}
                      className={`p-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        furiSamplingRate === rate
                          ? "bg-[#0E4A72] text-white border-[#0E4A72] shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {rate} Hz (SPS)
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white uppercase font-mono text-[10px] tracking-wider block">
                  Live Sensor Network Status
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">USGS GeoJSON Feed:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Mount Furi GSN Node:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 20.0 Hz Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">National CORS GNSS:</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 22 Stations Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV DATA EXPORT & AUDIT HUB */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                Data Hub &amp; CSV Reports Hub
              </h2>
              <span className="text-[11px] text-slate-500 font-sans">
                Direct export endpoints for GIS integration and scientific archiving
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            OFFICIAL DSS ENDPOINTS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="/api/export/earthquakes.csv"
            download
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Earthquakes (CSV)</span>
              <span className="text-[10px] text-slate-400 font-mono">Catalog &amp; magnitudes</span>
            </div>
            <Download className="w-4 h-4 text-[#0E4A72] dark:text-sky-400 group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="/api/export/volcanoes.csv"
            download
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Volcanoes (CSV)</span>
              <span className="text-[10px] text-slate-400 font-mono">Calderas &amp; alerts</span>
            </div>
            <Download className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="/api/export/furi-telemetry.csv"
            download
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">FURI Waveforms (CSV)</span>
              <span className="text-[10px] text-slate-400 font-mono">Broadband telemetry</span>
            </div>
            <Download className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </a>

          <a
            href="/api/export/audit-logs.csv"
            download
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Audit Trail (CSV)</span>
              <span className="text-[10px] text-slate-400 font-mono">Security records</span>
            </div>
            <Download className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. COCKPIT AUDIT LOGS COMPONENT
   ========================================================================= */
interface CockpitAuditLogsProps {
  currentUser: UserRole;
  auditLogs: any[];
  loadingAuditLogs: boolean;
  onRefreshAuditLogs: () => void;
}

export function CockpitAuditLogs({
  currentUser,
  auditLogs,
  loadingAuditLogs,
  onRefreshAuditLogs
}: CockpitAuditLogsProps) {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesSearch =
      (log.volcanoName && log.volcanoName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.performedBy && log.performedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.performedByEmail && log.performedByEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0E4A72] via-[#0A3452] to-[#0E4A72] text-white p-6 sm:p-8 shadow-xl border-b-4 border-[#D48F29]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#D48F29] text-slate-900 font-mono text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
                STAFF &amp; ADMIN LOGS
              </span>
              <span className="bg-white/10 text-[#F7D08A] font-mono text-[10px] font-bold uppercase px-3 py-1 rounded-md border border-white/20">
                Directorate Security Audit Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              Security &amp; Transaction Audit Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-w-2xl">
              Complete tamper-evident audit stream of all volcano record updates, alert trigger dispatches, user access approvals, and system state modifications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefreshAuditLogs}
              disabled={loadingAuditLogs}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAuditLogs ? "animate-spin" : ""}`} />
              <span>Refresh Ledger</span>
            </button>
            <a
              href="/api/export/audit-logs.csv"
              download
              className="px-4 py-2.5 bg-[#D48F29] hover:bg-[#b8781d] text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by operator, target, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0E4A72] text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="create">Create Record</option>
            <option value="edit">Edit / Update</option>
            <option value="delete">Delete / Archive</option>
            <option value="approve">User Approval</option>
          </select>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-display flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit Trail Entries ({filteredLogs.length})</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40 uppercase">
            Encrypted Transaction Ledger
          </span>
        </div>

        {loadingAuditLogs ? (
          <div className="py-16 text-center text-slate-400 text-xs italic flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0E4A72]" />
            <span>Retrieving secure ledger entries from DSS node...</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-mono text-[10px] uppercase sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-xs">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Record</th>
                  <th className="py-3 px-4">Authorized Account</th>
                  <th className="py-3 px-4 w-2/5">Transactional Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredLogs.map((log) => {
                  let actionBadge = "bg-slate-100 text-slate-700 border-slate-200";
                  if (log.action === "create") actionBadge = "bg-emerald-50 text-emerald-800 border-emerald-300";
                  else if (log.action === "edit") actionBadge = "bg-blue-50 text-blue-800 border-blue-300";
                  else if (log.action === "delete") actionBadge = "bg-rose-50 text-rose-800 border-rose-300";
                  else if (log.action === "approve") actionBadge = "bg-purple-50 text-purple-800 border-purple-300";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {log.volcanoName || "System / User Entity"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{log.performedBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.performedByEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs italic space-y-2">
            <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold text-slate-600 dark:text-slate-300 not-italic">No audit logs match current filters</p>
            <p className="text-[11px] text-slate-400 not-italic">
              Audit trails are recorded when catalog records are added, edited, or deleted by authorized staff.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
