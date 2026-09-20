import React, { useState } from "react";
import { Volcano, SeverityLevel } from "../types";
import { Shield, Plus, X, Globe, Save, AlertTriangle } from "lucide-react";

interface VolcanoFormProps {
  onAdd: (vData: Omit<Volcano, "id" | "updatedAt">) => Promise<boolean>;
  currentUserRole: string;
}

export default function VolcanoForm({ onAdd, currentUserRole }: VolcanoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [elevation, setElevation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [type, setType] = useState("Stratovolcano");
  const [activityType, setActivityType] = useState("Fumarolic Activity");
  const [severity, setSeverity] = useState<SeverityLevel>("Green");
  const [lastErupted, setLastErupted] = useState("");
  const [description, setDescription] = useState("");
  const [monitoredBy, setMonitoredBy] = useState("Ethiopian Geological Survey");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (currentUserRole !== "admin" && currentUserRole !== "official") {
    return (
      <div className="bg-white dark:bg-[#041B2D]/40 border border-slate-200/60 dark:border-white/15 p-6 text-center text-slate-650 dark:text-slate-300 font-sans text-xs flex flex-col items-center justify-center gap-2 rounded-2xl shadow-sm transition-colors duration-200">
        <Shield className="w-8 h-8 text-[#0085C8] dark:text-[#00D4FF] mb-1" />
        <p className="font-extrabold text-slate-800 dark:text-white tracking-wider uppercase font-display">Observation Record Portal Restricted</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          Creating and updating active volcano advisory states is strictly restricted to authenticated **Disaster Management Officials** or **Administrators**. Switch your simulation role in the top header to proceed.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim() || !region.trim() || !elevation || !lat || !lng || !description.trim()) {
      setError("Please fill out all mandatory fields.");
      return;
    }

    const elevationNum = parseFloat(elevation);
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(elevationNum)) {
      setError("Elevation must be a valid number.");
      return;
    }

    if (isNaN(latNum) || latNum < 3 || latNum > 15) {
      setError("Latitude must be a valid number within Ethiopia bounding frame (3.0°N to 15.0°N).");
      return;
    }

    if (isNaN(lngNum) || lngNum < 33 || lngNum > 48) {
      setError("Longitude must be a valid number within Ethiopia bounding frame (33.0°E to 48.0°E).");
      return;
    }

    setLoading(true);

    try {
      const added = await onAdd({
        name: name.trim(),
        region: region.trim(),
        elevation: elevationNum,
        coordinates: [latNum, lngNum],
        type,
        activityType,
        severity,
        lastErupted: lastErupted.trim() || "Unknown",
        description: description.trim(),
        monitoredBy: monitoredBy.trim() || "Central Disaster Agency",
      });

      if (added) {
        setSuccess(true);
        // Reset state
        setName("");
        setRegion("");
        setElevation("");
        setLat("");
        setLng("");
        setDescription("");
        setLastErupted("");
        
        // auto dismiss after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 2200);
      } else {
        setError("Database server rejected entry. Verify details and try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-[#0085C8] to-[#00D4FF] text-white border border-[#00D4FF]/25 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,133,200,0.25)] hover:shadow-[0_4px_16px_rgba(0,212,255,0.4)] cursor-pointer transition-all animate-fade-in"
        >
          <Plus className="w-4 h-4 text-white font-bold" />
          <span>Record New Volcanic Observation Log</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-[#041B2D]/90 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
          <div className="bg-slate-50 dark:bg-[#041B2D]/40 border-b border-slate-150 dark:border-white/10 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-[#0085C8] dark:text-[#00D4FF]" />
              <span className="text-xs font-bold font-mono tracking-wider text-slate-800 dark:text-white">
                DRMC OFFICIAL ENTRY PORTAL
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-slate-700 text-xs">
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-600 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-750 flex items-center gap-2 font-bold justify-center">
                <Globe className="w-4.5 h-4.5 text-emerald-600 animate-spin" />
                <span>OBSERVATION LOG PERSISTED SECURELY IN BASELINE</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Volcano Name */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Volcano Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Erta Ale, Tullu Moje"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                  required
                />
              </div>

              {/* Region */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Geographic Region <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., Afar Depression, Central Rift"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                  required
                />
              </div>

              {/* Volcano Structural Classification */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Geological Structure Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] focus:outline-none transition-all shadow-xs cursor-pointer"
                >
                  <option value="Stratovolcano">Stratovolcano</option>
                  <option value="Shield Volcano">Shield Volcano</option>
                  <option value="Silicic Caldera">Silicic Caldera</option>
                  <option value="Hydrothermal Crater">Hydrothermal Crater</option>
                  <option value="Fissure System">Fissure System</option>
                  <option value="Cinder Cone Grid">Cinder Cone Grid</option>
                </select>
              </div>

              {/* Elevation */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Summit Elevation (meters) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  value={elevation}
                  onChange={(e) => setElevation(e.target.value)}
                  placeholder="e.g., 2007, -48"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                  required
                />
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Latitude Coordinate <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g., 13.6000 (3° to 15°N)"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                  required
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Longitude Coordinate <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g., 40.6700 (33° to 48°E)"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                  required
                />
              </div>

              {/* Activity Class */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Current Activity Class</label>
                <input
                  type="text"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  placeholder="e.g., Active Lava Lake, High Thermals"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* Official Monitored Agency */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Monitoring Agency</label>
                <input
                  type="text"
                  value={monitoredBy}
                  onChange={(e) => setMonitoredBy(e.target.value)}
                  placeholder="e.g., AAU Geophysics, Mekelle Uni"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* Severity / Warning Level */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Advisory Indicator Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] focus:outline-none transition-all shadow-xs font-bold cursor-pointer"
                >
                  <option value="Green" className="text-emerald-700 dark:text-emerald-400 font-bold">Green — Normal Calm</option>
                  <option value="Yellow" className="text-yellow-700 dark:text-[#CA933C] font-bold">Yellow — Restless / Advisory</option>
                  <option value="Orange" className="text-orange-700 dark:text-orange-400 font-bold">Orange — Elevated High Warning</option>
                  <option value="Red" className="text-red-700 dark:text-[#D0232B] font-bold">Red — Critical Active Danger</option>
                </select>
              </div>

              {/* Last Eruption Date */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Last Recorded Eruptive Event</label>
                <input
                  type="text"
                  value={lastErupted}
                  onChange={(e) => setLastErupted(e.target.value)}
                  placeholder="e.g., 2005, 1820, Ongoing"
                  className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none transition-all shadow-xs"
                />
              </div>

            </div>

            {/* Geological Description */}
            <div>
              <label className="block text-slate-600 dark:text-slate-300 mb-1.5 font-bold text-xs tracking-tight">Geological Observation Log <span className="text-rose-500">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Log physical thermal vents changes, geodetic radar updates, and ash plume indices observed..."
                rows={4}
                className="w-full bg-white dark:bg-[#041B2D]/60 border border-slate-250 dark:border-white/10 focus:border-[#0085C8] dark:focus:border-[#00D4FF] focus:ring-1 focus:ring-[#0085C8] py-2 px-3 rounded-xl text-slate-800 dark:text-[#F5F5F5] placeholder-slate-450 focus:outline-none resize-none transition-all shadow-xs"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end border-t border-slate-150 dark:border-white/10 pt-4 mt-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-white dark:bg-[#041B2D]/55 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-250 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#0085C8] to-[#00D4FF] border border-[#00D4FF]/30 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Persisting..." : "Commit Log To Database"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
