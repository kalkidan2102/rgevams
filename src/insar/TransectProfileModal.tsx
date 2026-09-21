import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { VolcanoTarget, TransectPoint, InSARFilterMode } from "../types/insar";
import { insarService } from "../services/insarService";
import { X, TrendingUp, Compass, Download, Layers } from "lucide-react";

interface TransectProfileModalProps {
  volcano: VolcanoTarget;
  filterMode: InSARFilterMode;
  onClose: () => void;
}

export const TransectProfileModal: React.FC<TransectProfileModalProps> = ({
  volcano,
  filterMode,
  onClose
}) => {
  const [profileData, setProfileData] = useState<TransectPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orientation, setOrientation] = useState<"WE" | "NS" | "SWNE">("WE");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    if (!volcano || !volcano.bounds) {
      setLoading(false);
      return;
    }

    const b = volcano.bounds;
    const midLat = (b.north + b.south) / 2;
    const midLon = (b.east + b.west) / 2;

    let pA = { lat: midLat, lon: b.west + 0.02 };
    let pB = { lat: midLat, lon: b.east - 0.02 };

    if (orientation === "NS") {
      pA = { lat: b.south + 0.02, lon: midLon };
      pB = { lat: b.north - 0.02, lon: midLon };
    } else if (orientation === "SWNE") {
      pA = { lat: b.south + 0.03, lon: b.west + 0.03 };
      pB = { lat: b.north - 0.03, lon: b.east - 0.03 };
    }

    insarService
      .getTransectProfile(volcano.id, pA, pB, filterMode)
      .then((data) => {
        if (isMounted) {
          setProfileData(data);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [volcano, orientation, filterMode]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#0B0F19] text-slate-100 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans">
        
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  1D Cross-Section Transect Profile (A-A')
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {volcano.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Spatial InSAR displacement profile and topography across volcanic caldera axis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ORIENTATION SELECTOR */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setOrientation("WE")}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                  orientation === "WE" ? "bg-cyan-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                West - East
              </button>
              <button
                onClick={() => setOrientation("NS")}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                  orientation === "NS" ? "bg-cyan-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                South - North
              </button>
              <button
                onClick={() => setOrientation("SWNE")}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                  orientation === "SWNE" ? "bg-cyan-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                SW - NE
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-cyan-400 font-mono text-sm">
              Sampling LiCSBAS InSAR raster profile...
            </div>
          ) : (
            <>
              {/* TOP PLOT: DISPLACEMENT & VELOCITY PROFILE */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    Ground Displacement (mm) along Profile A → A'
                  </span>
                  <span className="text-amber-400 font-bold">
                    Peak Deformation: {volcano.peakVelocity > 0 ? `+${volcano.peakVelocity}` : volcano.peakVelocity} mm/yr
                  </span>
                </div>

                <div className="w-full h-[220px] bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={profileData} margin={{ top: 10, right: 15, left: 5, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="distanceKm"
                        stroke="#64748b"
                        fontSize={10}
                        fontFamily="monospace"
                        label={{
                          value: "Distance along transect (km)",
                          position: "insideBottom",
                          offset: -12,
                          fill: "#94a3b8",
                          fontSize: 10
                        }}
                      />
                      <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      
                      <Line
                        type="monotone"
                        dataKey="displacement"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: "#10b981" }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BOTTOM PLOT: TOPOGRAPHY ELEVATION PROFILE (DEM) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                    SRTM Topography Elevation (m a.s.l.)
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Caldera Summit: {volcano.elevation} m
                  </span>
                </div>

                <div className="w-full h-[180px] bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={profileData} margin={{ top: 10, right: 15, left: 5, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="distanceKm"
                        stroke="#64748b"
                        fontSize={10}
                        fontFamily="monospace"
                        label={{
                          value: "Distance (km)",
                          position: "insideBottom",
                          offset: -12,
                          fill: "#94a3b8",
                          fontSize: 10
                        }}
                      />
                      <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="elevation"
                        stroke="#0ea5e9"
                        fill="#0284c7"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>COMET InSAR Topo-Deformation Inversion</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Transect
          </button>
        </div>

      </div>
    </div>
  );
};
