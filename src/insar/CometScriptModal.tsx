import React, { useState, useEffect } from "react";
import { VolcanoTarget } from "../types/insar";
import {
  Code,
  Copy,
  Check,
  Terminal,
  Download,
  Play,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  X
} from "lucide-react";

interface CometScriptModalProps {
  volcano: VolcanoTarget;
  onClose: () => void;
}

export const CometScriptModal: React.FC<CometScriptModalProps> = ({
  volcano,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"pipeline" | "mogi" | "terminal">("pipeline");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "# Ready to execute Python LiCSBAS workflow for " + (volcano?.name || "Target Volcano"),
    "# Click 'Run Simulated Python Pipeline' to trace execution..."
  ]);

  // Full Python LiCSBAS Workflow Script
  const pythonScript = `# ==============================================================================
# NERC COMET & LiCSBAS Sentinel-1 InSAR Multi-Track Time-Series Processing
# Target Volcano: ${volcano?.name || "Target Volcano"} (${volcano?.region || "Ethiopia"})
# Sentinel-1 Frame: ${volcano?.frameId || "014A_05128_131313"} | Coordinates: [${volcano?.latitude ?? 13.6}°N, ${volcano?.longitude ?? 40.7}°E]
# Produced for: ESSGI Planetary Geodesy & Remote Sensing Laboratory
# Python Environment: Python 3.10+ / LiCSBAS v1.5 / GDAL / GMT 6.0 / SciPy
# ==============================================================================

import os
import sys
import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

# 1. DEFINE VOLCANO BOUNDING BOX AND FRAME GEOMETRY
VOLCANO_ID = "${volcano?.id || "volcano"}"
VOLCANO_NAME = "${volcano?.name || "Volcano"}"
FRAME_ID = "${volcano?.frameId || "014A_05128_131313"}"

BOUNDS = {
    "north": ${volcano?.bounds?.north ?? 13.8},
    "south": ${volcano?.bounds?.south ?? 13.0},
    "east": ${volcano?.bounds?.east ?? 41.2},
    "west": ${volcano?.bounds?.west ?? 40.2}
}

REF_STATION = {
    "lat": ${volcano?.referencePoint?.latitude ?? 13.5},
    "lon": ${volcano?.referencePoint?.longitude ?? 40.5},
    "name": "${volcano?.referencePoint?.name || "Far-field Stable Bedrock"}"
}

print(f"[*] Initializing LiCSBAS pipeline for {VOLCANO_NAME} (Frame: {FRAME_ID})...")

# 2. DOWNLOAD LiCSAR INTERFEROGRAM STACK VIA COMET PORTAL API
# Downloads Sentinel-1 SLC unwrapped differential interferograms with ERA5 GACOS weather
cmd_download = f"licsar_download_frame.py --frame {FRAME_ID} --start 20141015 --end 20260520 --outdir ./licsar_data"
print(f"[1/5] Downloading LiCSAR stack: {cmd_download}")
os.system(cmd_download)

# 3. LiCSBAS STAGE 1 & 2: MULTI-LOOKING, CLIP TO CALDERA, ERA5 WEATHER CORRECTION
# Eliminates tropospheric atmospheric phase screens (APS) using ECMWF ERA5 weather reanalysis
cmd_prep = f"licsbas02_prep_era5.py -i ./licsar_data/{FRAME_ID} --bounds {BOUNDS['west']},{BOUNDS['east']},{BOUNDS['south']},{BOUNDS['north']} --gamma_thresh 0.35"
print(f"[2/5] Multilooking & Tropospheric ERA5 APS Correction: {cmd_prep}")
os.system(cmd_prep)

# 4. LiCSBAS STAGE 3: LOOP CLOSURE CHECK & PHASE UNWRAPPING ERROR MASKING
# Detects unwrapping triplet closure phase non-zero residuals (> 1.5 pi) and removes biased pixels
cmd_closure = f"licsbas03_sbas.py -i ./licsar_data/{FRAME_ID} --loop_closure 1.5 --min_coherence 0.30"
print(f"[3/5] Loop closure phase unwrapping QA: {cmd_closure}")
os.system(cmd_closure)

# 5. LiCSBAS STAGE 4: SBAS TIME-SERIES MATRIX INVERSION & REFERENCE ZEROING
# Inverts network of interferograms via NSBAS algorithm and anchors displacement to reference station
cmd_ts = f"licsbas04_ts.py -i ./licsar_data/{FRAME_ID} --ref_lat {REF_STATION['lat']} --ref_lon {REF_STATION['lon']} --output_dir ./results_{VOLCANO_ID}"
print(f"[4/5] SBAS matrix time-series inversion: {cmd_ts}")
os.system(cmd_ts)

# 6. LiCSBAS STAGE 5: LINEAR VELOCITY RATE ESTIMATION & GEOTIFF EXPORT
cmd_vel = f"licsbas05_vel.py -i ./results_{VOLCANO_ID}/timeseries_ERA5_demErr.h5 --export_geotiff --export_csv"
print(f"[5/5] Velocity raster and NetCDF export: {cmd_vel}")
os.system(cmd_vel)

# 7. PYTHON SCIENTIFIC VISUALIZATION (COMET STYLE PLOT)
print("[*] Generating publication-quality COMET displacement time-series plot...")
data = np.genfromtxt(f"./results_{VOLCANO_ID}/cumulative_displacement.csv", delimiter=",", names=True)

plt.figure(figsize=(10, 5), dpi=300)
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

# Plot individual Sentinel-1 SAR acquisition points
plt.scatter(data["DecimalYear"], data["Ascending_LOS_mm"], color="#1A73E8", s=22, alpha=0.85, label="Ascending Track LOS (Sentinel-1)")
plt.scatter(data["DecimalYear"], data["Descending_LOS_mm"], color="#E65100", s=22, alpha=0.85, label="Descending Track LOS (Sentinel-1)")

# Linear trend regression
fit_years = np.linspace(data["DecimalYear"].min(), data["DecimalYear"].max(), 100)
p_asc = np.polyfit(data["DecimalYear"], data["Ascending_LOS_mm"], 1)
plt.plot(fit_years, np.polyval(p_asc, fit_years), "--", color="#0D47A1", lw=1.8, label=f"Ascending Velocity ({p_asc[0]:+.1f} mm/yr)")

plt.title(f"NERC COMET / LiCSBAS Ground Deformation: {VOLCANO_NAME}", fontsize=13, fontweight="bold", pad=12)
plt.xlabel("Acquisition Date (Decimal Year)", fontsize=11)
plt.ylabel("Cumulative LOS Displacement (mm)", fontsize=11)
plt.legend(frameon=True, loc="upper left")
plt.tight_layout()
plt.savefig(f"{VOLCANO_ID}_comet_timeseries.png", dpi=300)
print(f"[+] Complete. Saved high-res figure to {VOLCANO_ID}_comet_timeseries.png")
`;

  // Mogi Analytical Inversion Python Script
  const mogiPythonScript = `# ==============================================================================
# MOGI (1958) ANALYTICAL MAGMA CHAMBER INVERSION MODEL
# Inversion of InSAR line-of-sight surface deformation into sub-surface volume change
# Target: ${volcano.name} Caldera
# ==============================================================================

import numpy as np
from scipy.optimize import least_squares
import matplotlib.pyplot as plt

def mogi_vertical_displacement(r, dV, d, nu=0.25):
    """
    Computes vertical surface deformation Uz(r) for an isotropic point source (Mogi 1958).
    Parameters:
      r : Radial horizontal distance from caldera center (m)
      dV: Magma volume change rate (m^3 / year)
      d : Depth of magma reservoir below surface (m)
      nu: Poisson's ratio of the crust (default = 0.25)
    Returns:
      Uz: Vertical uplift / subsidence (m / year)
    """
    C = ((1 - nu) / np.pi) * dV
    Uz = C * (d / ((r**2 + d**2)**1.5))
    return Uz

# INVERSION OPTIMIZATION FUNCTION
def invert_mogi(r_observed, u_observed_mm):
    u_observed_m = u_observed_mm * 1e-3  # convert mm to meters
    
    # Residual objective function
    def residuals(params):
        dV, d = params
        u_model = mogi_vertical_displacement(r_observed, dV, d)
        return u_model - u_observed_m

    # Initial guess: [dV = 1e6 m^3/yr, depth = 3000 m]
    initial_guess = [1.0e6, 3000.0]
    bounds = ([1e4, 500.0], [5e7, 15000.0])

    res = least_squares(residuals, initial_guess, bounds=bounds, method="trf")
    dV_est, d_est = res.x
    rmse_mm = np.sqrt(np.mean(res.fun**2)) * 1e3

    return {
        "volume_change_m3_yr": dV_est,
        "depth_km": d_est / 1000.0,
        "rmse_mm": rmse_mm
    }

# Synthetic profile across ${volcano.name} Caldera
radii = np.linspace(0, 15000, 31) # 0 to 15 km from summit
observed_displacement_mm = ${volcano.peakVelocity} * (1.0 / (1.0 + (radii / 3200.0)**2)**1.5) + np.random.normal(0, 1.2, len(radii))

result = invert_mogi(radii, observed_displacement_mm)

print(f"=== MOGI INVERSION RESULTS FOR ${volcano.name.toUpperCase()} ===")
print(f"Estimated Magma Reservoir Depth: {result['depth_km']:.2f} km b.s.l.")
print(f"Magma Volume Inflation Rate:   {result['volume_change_m3_yr']/1e6:+.2f} x 10^6 m^3/year")
print(f"Inversion Fit RMSE:            {result['rmse_mm']:.2f} mm")
`;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadPy = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/x-python;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTerminalLogs([
      `[2026-09-15 06:35:01] Initializing LiCSBAS v1.5 Python session on Linux x86_64...`,
      `[INFO] Target: ${volcano.name} (${volcano.region})`,
      `[INFO] Sentinel-1 Frame: ${volcano.frameId}`,
      `[INFO] Spatial bounds: [N:${volcano.bounds.north}, S:${volcano.bounds.south}, E:${volcano.bounds.east}, W:${volcano.bounds.west}]`,
      `[STEP 1/5] Downloading LiCSAR unwrapped interferogram stack from COMET portal...`,
      `[SUCCESS] 342 SAR acquisition epochs acquired (Sentinel-1A / 1B / 1C).`,
      `[STEP 2/5] Multilooking (20x4) and applying ECMWF ERA5 3D atmospheric delay corrections...`,
      `[INFO] Tropospheric phase delay model GACOS applied: -14.2 mm atmospheric screen removed.`,
      `[STEP 3/5] Computing loop closure triplets (threshold = 1.5 pi)...`,
      `[INFO] Filtered 28 decorrelated pairs; unwrapping consistency > 98.4%.`,
      `[STEP 4/5] Executing NSBAS inversion with reference point lat=${volcano.referencePoint.latitude}, lon=${volcano.referencePoint.longitude}...`,
      `[INFO] Inversion matrix solved in 4.2 seconds (SVD solver).`,
      `[STEP 5/5] Inverting spherical Mogi (1958) analytical reservoir model:`,
      `       --> Magma Depth: 2.84 km below sea level`,
      `       --> Volume Flux: +1.84 x 10^6 m^3/year`,
      `       --> Peak LOS Rate: ${volcano.peakVelocity > 0 ? "+" : ""}${volcano.peakVelocity} mm/year`,
      `[COMPLETE] Exported results to ./results_${volcano.id}/ (GeoTIFF + NetCDF + CSV).`
    ]);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#0B0F19] text-slate-100 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-sans">
        
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600/30 to-blue-600/30 text-cyan-300 rounded-xl border border-cyan-500/40">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  COMET / LiCSBAS Python Scientific Pipeline
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                  {volcano.id.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 hidden sm:inline">
                  Python 3.10+ / LiCSBAS v1.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official reproducible command scripts for NERC COMET and Sentinel-1 InSAR processing in Ethiopia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex items-center justify-between px-4 pt-2 border-b border-slate-800 bg-[#070A12] shrink-0 text-xs font-mono">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pipeline"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Full Python Pipeline (.py)</span>
            </button>

            <button
              onClick={() => setActiveTab("mogi")}
              className={`px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "mogi"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Mogi (1958) Inversion Code</span>
            </button>

            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "terminal"
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terminal Execution Simulation</span>
            </button>
          </div>

          {/* ACTION BUTTONS (COPY & DOWNLOAD .PY) */}
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={() => handleCopy(activeTab === "mogi" ? mogiPythonScript : pythonScript)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              onClick={() =>
                handleDownloadPy(
                  activeTab === "mogi" ? `mogi_inversion_${volcano.id}.py` : `licsbas_${volcano.id}_processor.py`,
                  activeTab === "mogi" ? mogiPythonScript : pythonScript
                )
              }
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded flex items-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95"
              title="Download standalone Python script for VS Code"
            >
              <Download className="w-3 h-3" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 overflow-y-auto space-y-3 bg-[#070A12] flex-1">
          {activeTab === "pipeline" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Script: licsbas_{volcano.id}_processor.py (LiCSAR + LiCSBAS pipeline)</span>
                <span className="text-cyan-400">Ready to execute in VS Code or Terminal</span>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11.5px] font-mono text-cyan-300 leading-relaxed overflow-x-auto selection:bg-cyan-800">
                {pythonScript}
              </pre>
            </div>
          )}

          {activeTab === "mogi" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>Script: mogi_inversion_{volcano.id}.py (Analytical Magma Chamber Pressure Inversion)</span>
                <span className="text-purple-400">Using SciPy least_squares non-linear optimization</span>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11.5px] font-mono text-purple-300 leading-relaxed overflow-x-auto selection:bg-purple-900">
                {mogiPythonScript}
              </pre>
            </div>
          )}

          {activeTab === "terminal" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono text-slate-400">
                  Interactive Python execution console simulation:
                </span>
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSimulating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>{isSimulating ? "Running Python Script..." : "Run Simulated Python Pipeline"}</span>
                </button>
              </div>

              <div className="p-4 bg-black rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 min-h-[300px] shadow-inner">
                {terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.startsWith("[SUCCESS]") || log.startsWith("[COMPLETE]")
                        ? "text-cyan-300 font-bold"
                        : log.startsWith("[STEP")
                        ? "text-amber-300 font-semibold"
                        : log.startsWith("#")
                        ? "text-slate-500 italic"
                        : "text-emerald-400"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>NERC COMET / University of Leeds LiCSBAS standard</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Target ID: {volcano.id}</span>
            <button
              onClick={onClose}
              className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
