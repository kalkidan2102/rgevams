import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, 
  X, 
  CheckCircle2, 
  Search, 
  Download, 
  RotateCcw, 
  Flame, 
  Activity, 
  Clock, 
  UserCheck, 
  FileText, 
  MapPin, 
  Plus, 
  Edit3, 
  Save, 
  Trash2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { DismissedAlert } from "../../types";

interface RecentAlertsHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dismissedAlerts: DismissedAlert[];
  onRestoreAlert: (alert: DismissedAlert) => void;
  onClearHistory: () => void;
  onUpdateNotes?: (alertId: string, notes: string) => void;
  onInspectMap?: (id: string, type: "volcano" | "earthquake") => void;
  onAddManualHistory?: (alert: DismissedAlert) => void;
  currentUserRole?: string;
}

export default function RecentAlertsHistoryPanel({
  isOpen,
  onClose,
  dismissedAlerts,
  onRestoreAlert,
  onClearHistory,
  onUpdateNotes,
  onInspectMap,
  onAddManualHistory,
  currentUserRole
}: RecentAlertsHistoryPanelProps) {
  const isGuest = currentUserRole === "guest";
  const [guestNotice, setGuestNotice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "volcanic" | "seismic" | "critical">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);

  // Form state for adding manual history log entry
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"volcanic" | "seismic">("seismic");
  const [newSeverity, setNewSeverity] = useState<"Red" | "Orange" | "Yellow">("Orange");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOfficer, setNewOfficer] = useState("EOC Duty Officer");
  const [newNotes, setNewNotes] = useState("");

  const filteredAlerts = dismissedAlerts.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.dismissedBy && item.dismissedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.resolutionNotes && item.resolutionNotes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === "volcanic") return item.type === "volcanic";
    if (filterType === "seismic") return item.type === "seismic";
    if (filterType === "critical") return item.severity === "Red" || item.severity === "Orange";

    return true;
  });

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const calculateDuration = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr).getTime();
      const end = new Date(endStr).getTime();
      const diffMinutes = Math.max(1, Math.round((end - start) / (1000 * 60)));
      if (diffMinutes >= 1440) return `${(diffMinutes / 1440).toFixed(1)} days`;
      if (diffMinutes >= 60) return `${(diffMinutes / 60).toFixed(1)} hours`;
      return `${diffMinutes} mins`;
    } catch {
      return "N/A";
    }
  };

  const exportCSV = () => {
    if (dismissedAlerts.length === 0) return;

    const headers = ["ID", "Title", "Type", "Severity", "Location", "Event Time", "Dismissed Time", "Dismissed By", "Action Taken", "Resolution Notes"];
    const rows = dismissedAlerts.map(a => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      a.type,
      a.severity,
      `"${a.location.replace(/"/g, '""')}"`,
      a.dateTime,
      a.dismissedAt,
      `"${(a.dismissedBy || "").replace(/"/g, '""')}"`,
      `"${(a.actionTaken || "").replace(/"/g, '""')}"`,
      `"${(a.resolutionNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ESSGI_Recent_Alerts_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation) return;

    const newEntry: DismissedAlert = {
      id: `manual_dismissed_${Date.now()}`,
      title: newTitle,
      type: newType,
      severity: newSeverity,
      location: newLocation,
      description: newDescription || "Manually logged past geological incident.",
      dateTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      dismissedAt: new Date().toISOString(),
      dismissedBy: newOfficer || "Duty Seismologist",
      actionTaken: "Manual historical incident record filed.",
      resolutionNotes: newNotes || "Cleared by EOC evaluation."
    };

    if (onAddManualHistory) {
      onAddManualHistory(newEntry);
    }

    // Reset form
    setNewTitle("");
    setNewLocation("");
    setNewDescription("");
    setNewNotes("");
    setIsAddingModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
          />

          {/* Slide-over Side Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-2xl bg-slate-900 text-slate-100 h-full shadow-2xl flex flex-col border-l border-amber-500/30 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-5 md:p-6 bg-slate-950/90 border-b border-white/10 flex items-center justify-between shrink-0 relative">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <History className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black font-display tracking-tight text-white">
                      Recent Geological Alerts History
                    </h2>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40">
                      {dismissedAlerts.length} Archived
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Audited timeline of dismissed volcanic & seismic emergency advisories
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Summary Bar */}
            {isGuest && (
              <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs font-mono flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Guest Read-Only Access:</strong> Switch user role in header to Official or Admin to dismiss alerts, re-activate, or clear history logs.
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-950/60 border-b border-white/5 grid grid-cols-3 gap-3 text-center font-mono text-xs shrink-0">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[9px] text-slate-400 block uppercase">Total Recorded</span>
                <span className="text-base font-black text-amber-400">{dismissedAlerts.length}</span>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[9px] text-slate-400 block uppercase">Critical Cleared</span>
                <span className="text-base font-black text-rose-400">
                  {dismissedAlerts.filter(a => a.severity === "Red" || a.severity === "Orange").length}
                </span>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[9px] text-slate-400 block uppercase">Avg Response Time</span>
                <span className="text-base font-black text-emerald-400">18.4 mins</span>
              </div>
            </div>

            {/* Controls Bar: Search, Filters & Action Buttons */}
            <div className="p-4 bg-slate-900 border-b border-white/5 space-y-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by location, officer or notes..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-sans"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={exportCSV}
                  disabled={dismissedAlerts.length === 0}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 shrink-0"
                  title="Export alert history to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  onClick={() => setIsAddingModalOpen(true)}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Incident</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 min-w-max">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      filterType === "all"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All ({dismissedAlerts.length})
                  </button>
                  <button
                    onClick={() => setFilterType("volcanic")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                      filterType === "volcanic"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Flame className="w-3 h-3 text-rose-400" />
                    Volcanic
                  </button>
                  <button
                    onClick={() => setFilterType("seismic")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                      filterType === "seismic"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Activity className="w-3 h-3 text-cyan-400" />
                    Seismic
                  </button>
                  <button
                    onClick={() => setFilterType("critical")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1 ${
                      filterType === "critical"
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : "bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    High Severity
                  </button>
                </div>

                {dismissedAlerts.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 shrink-0 font-bold"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {/* Manual Entry Form Modal */}
            <AnimatePresence>
              {isAddingModalOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddSubmit}
                  className="p-4 bg-slate-950 border-b border-amber-500/30 space-y-3 font-sans shrink-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                      <FileText className="w-4 h-4" />
                      Log Historical Geological Incident
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingModalOpen(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Event Title *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. RESOLVED: Micro-tremor swarm near Semera"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Location *</label>
                      <input
                        type="text"
                        required
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g. Tendaho Dam, Afar"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Hazard Category</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as "volcanic" | "seismic")}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                      >
                        <option value="volcanic">Volcanic</option>
                        <option value="seismic">Seismic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Severity Level</label>
                      <select
                        value={newSeverity}
                        onChange={(e) => setNewSeverity(e.target.value as "Red" | "Orange" | "Yellow")}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                      >
                        <option value="Red">Red (Critical)</option>
                        <option value="Orange">Orange (High)</option>
                        <option value="Yellow">Yellow (Elevated)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">Logged Officer</label>
                      <input
                        type="text"
                        value={newOfficer}
                        onChange={(e) => setNewOfficer(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">Resolution / Audit Summary</label>
                    <input
                      type="text"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="e.g. Evaluated on broadband seismograms; no structural dam threat."
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-mono font-black text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Save Historical Record
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* History Timeline Main Body */}
            <div className="p-4 md:p-6 overflow-y-auto flex-grow space-y-4 font-sans custom-scrollbar">
              {filteredAlerts.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-slate-950/40 rounded-3xl border border-dashed border-white/10 p-8">
                  <div className="p-3 bg-white/5 rounded-2xl w-fit mx-auto text-slate-500">
                    <History className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300">No Dismissed Alerts in History</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When active geological warnings are dismissed by disaster officials on the dashboard, they will be tracked chronologically here.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-500/50 before:via-blue-500/30 before:to-transparent">
                  {filteredAlerts.map((item) => {
                    const isVolcanic = item.type === "volcanic";
                    const isRed = item.severity === "Red";
                    const isOrange = item.severity === "Orange";

                    let badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/40";
                    if (isRed) badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
                    else if (isOrange) badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";

                    const isEditing = editingId === item.id;

                    return (
                      <div key={item.id} className="relative group">
                        {/* Timeline Dot Indicator */}
                        <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-amber-500 flex items-center justify-center text-[9px] text-amber-400 font-black shadow-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>

                        {/* Dismissed Alert Card */}
                        <div className="bg-slate-950/80 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4.5 space-y-3 shadow-lg transition-all duration-200">
                          {/* Top Row: Type & Severity Badges */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded-lg ${isVolcanic ? "bg-rose-500/20 text-rose-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                                {isVolcanic ? <Flame className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                              </span>
                              <span className="text-[10px] font-mono uppercase font-black tracking-wider text-slate-400">
                                {isVolcanic ? "Volcanic Alert" : "Seismic Advisory"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                                {item.severity} SEVERITY
                              </span>
                              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                DISMISSED
                              </span>
                            </div>
                          </div>

                          {/* Event Title & Location */}
                          <div>
                            <h4 className="text-sm font-bold text-white leading-snug">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                              <span className="flex items-center gap-1 text-slate-300 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                {item.location}
                              </span>
                            </div>
                          </div>

                          {/* Event Timeline Timestamps */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-white/5 font-mono text-[10px]">
                            <div>
                              <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Original Event:</span>
                              <span className="text-slate-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                {formatDateTime(item.dateTime)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Dismissed / Resolved:</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                {formatDateTime(item.dismissedAt)}
                              </span>
                            </div>
                          </div>

                          {/* Officer Info & Action Taken */}
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>Actioned By: <strong className="text-slate-200">{item.dismissedBy || "EOC Command"}</strong></span>
                              <span>Duration: <strong className="text-amber-400">{calculateDuration(item.dateTime, item.dismissedAt)}</strong></span>
                            </div>

                            {item.actionTaken && (
                              <p className="text-xs text-slate-300 font-sans leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                                <strong className="text-amber-300 font-mono text-[10px] uppercase block">Action Conducted:</strong>
                                {item.actionTaken}
                              </p>
                            )}
                          </div>

                          {/* Resolution Notes Box (Editable) */}
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                                <FileText className="w-3 h-3 text-amber-400" />
                                Official Resolution Audit Notes:
                              </span>

                              {!isEditing ? (
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setTempNotes(item.resolutionNotes || "");
                                  }}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Edit Notes
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (onUpdateNotes) onUpdateNotes(item.id, tempNotes);
                                    setEditingId(null);
                                  }}
                                  className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Save className="w-3 h-3" />
                                  Save
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <textarea
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-xs text-white focus:outline-none"
                              />
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                "{item.resolutionNotes || "No specific remarks attached to this dismissal action."}"
                              </p>
                            )}
                          </div>

                          {/* Action Footer Bar */}
                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                            {onInspectMap && (
                              <button
                                onClick={() => {
                                  const rawId = item.id.replace("dismissed_vol_", "").replace("dismissed_eq_", "").replace("alert_vol_", "").replace("alert_eq_", "");
                                  onInspectMap(rawId, item.type === "volcanic" ? "volcano" : "earthquake");
                                  onClose();
                                }}
                                className="text-[10.5px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
                              >
                                <span>Inspect Location on Map</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => onRestoreAlert(item)}
                              className="ml-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10.5px] font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                              <span>Re-activate Alert</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                ESSGI AUDIT COMPLIANT
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                Close History Panel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
