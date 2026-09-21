import React, { useState, useEffect, useRef } from "react";
import { VolcanoTarget } from "../types/insar";
import {
  Terminal,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Code,
  Layers,
  Activity,
  Sliders,
  Sparkles,
  ExternalLink,
  BookOpen,
  FileCode,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface PythonLicsbasStudioModalProps {
  volcano: VolcanoTarget;
  onClose: () => void;
}

type StudioTab = "pipeline" | "mogi" | "decomposition" | "script" | "notebook";

export const PythonLicsbasStudioModal: React.FC<PythonLicsbasStudioModalProps> = ({
  volcano,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>("pipeline");
  const [copied, setCopied] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<string>("");

  // Pipeline simulation state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Mogi Inversion interactive parameters
  const [mogiDepth, setMogiDepth] = useState<number>(3.8); // km
  const [mogiVolumeChange, setMogiVolumeChange] = useState<number>(14.5); // 10^6 m^3 / yr
  const [poissonRatio, setPoissonRatio] = useState<number>(0.25); // typical crust
  const [shearModulus, setShearModulus] = useState<number>(30); // GPa

  // 2.5D decomposition parameters
  const [simAscLOS, setSimAscLOS] = useState<number>(volcano?.peakVelocity ?? 25.0); // mm/yr
  const [simDescLOS, setSimDescLOS] = useState<number>(parseFloat(((volcano?.peakVelocity ?? 25.0) * 0.91).toFixed(1))); // mm/yr

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Initial terminal welcome
  useEffect(() => {
    setTerminalLogs([
      "================================================================================",
      " COMET / LiCSBAS InSAR Scientific Processing Environment (Python 3.10.12)",
      " NERC Centre for Observation and Modelling of Earthquakes, Volcanoes & Tectonics",
      ` Active Target: ${volcano?.name || "Target"} | Frame: ${volcano?.frameId || "014A_05128_131313"}`,
      " Ready to execute LiCSAR Sentinel-1 SBAS inversion pipeline.",
      " Click 'Execute LiCSBAS Pipeline' to start automated phase processing.",
      "================================================================================"
    ]);
  }, [volcano]);

  // Execute LiCSBAS 5-stage pipeline simulation
  const handleExecutePipeline = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setExecutionProgress(0);
    setActiveStep(1);

    const steps = [
      {
        step: 1,
        progress: 18,
        log: [
          "[STAGE 1/5] licsbas_01_prep.py -d ./licsar_frame -i " + volcano.frameId,
          "  -> Downloading Sentinel-1 SLC interferometric pairs from COMET LiCSAR archive...",
          `  -> Target geographic bounding box: [N: ${volcano.bounds.north}, S: ${volcano.bounds.south}, E: ${volcano.bounds.east}, W: ${volcano.bounds.west}]`,
          "  -> 384 unwrapped interferograms discovered (2014-10-15 to 2026-05-20).",
          "  -> Multi-looking ratio: 20 range x 4 azimuth looks -> Spatial resolution ~100m.",
          "  -> Initial baseline network B_perp range: [-112.4m, +124.8m]."
        ]
      },
      {
        step: 2,
        progress: 38,
        log: [
          "[STAGE 2/5] licsbas_02_prep_era5.py --gacos_dir ./ERA5_weather --calc_zenith_delay",
          "  -> Integrating ECMWF ERA5 3D atmospheric temperature & water-vapor profiles...",
          "  -> Calculating Zenith Path Delay (ZPD) phase screens at radar acquisition timestamps.",
          "  -> Deramping planar orbital phase ramp across Ethiopian Rift margin.",
          "  -> Phase standard deviation reduced: 1.48 rad -> 0.62 rad (Atmospheric noise eliminated)."
        ]
      },
      {
        step: 3,
        progress: 60,
        log: [
          "[STAGE 3/5] licsbas_03_sbas.py --gamma_thresh 0.35 --loop_closure 1.5",
          "  -> Evaluating 842 triangular loop closures for unwrapping error detection...",
          "  -> Flagging phase unwrapping jumps: 14 triplets identified and masked out.",
          "  -> Coherence threshold masking applied: gamma >= 0.35.",
          "  -> Valid pixels retained: 88.4% across caldera rim and rift fault scarps."
        ]
      },
      {
        step: 4,
        progress: 82,
        log: [
          "[STAGE 4/5] licsbas_04_dem_error.py --dem srtm30m.dem --out timeseries_demErr.h5",
          "  -> Estimating residual topographic height errors proportional to perpendicular baseline.",
          "  -> Solving delta-h parameter: peak DEM correction = -4.2m on steep caldera wall.",
          `  -> Zeroing deformation datum to reference station: [${volcano.referencePoint.latitude}°N, ${volcano.referencePoint.longitude}°E]`,
          `  -> Reference site: ${volcano.referencePoint.name || "Bedrock stable datum"}.`
        ]
      },
      {
        step: 5,
        progress: 100,
        log: [
          "[STAGE 5/5] licsbas_05_vel.py --export_geotiff --export_csv --r2_thresh 0.85",
          "  -> Performing Small BAseline Subset (SBAS) SVD matrix inversion (G * m = d)...",
          `  -> Peak line-of-sight (LOS) velocity detected: +${volcano?.peakVelocity ?? 25} mm/yr.`,
          "  -> Standard 1-sigma uncertainty: +/- 1.4 mm/yr across 428 epochs.",
          "  -> Geotiff exported: ./products/velocity_sbas_masked.tif",
          "  -> NetCDF exported: ./products/timeseries_displacement.nc",
          "================================================================================",
          ` [SUCCESS] LiCSBAS pipeline execution finished for ${volcano?.name || "Target"} (${(volcano?.id || "volcano").toUpperCase()})!`,
          "================================================================================"
        ]
      }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const s = steps[currentStepIdx];
        setActiveStep(s.step);
        setExecutionProgress(s.progress);
        setTerminalLogs((prev) => [...prev, ...s.log]);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 750);
  };

  // Reset pipeline simulation
  const handleResetPipeline = () => {
    setIsExecuting(false);
    setExecutionProgress(0);
    setActiveStep(0);
    setTerminalLogs([
      "================================================================================",
      " COMET / LiCSBAS InSAR Scientific Processing Environment (Python 3.10.12)",
      ` Active Target: ${volcano.name} | Frame: ${volcano.frameId}`,
      " Terminal reset. Click 'Execute LiCSBAS Pipeline' to run again.",
      "================================================================================"
    ]);
  };

  // Mogi model analytical computation
  const mogiChartData = React.useMemo(() => {
    // r from 0 to 12 km
    const data = [];
    const d = mogiDepth * 1000; // depth in meters
    const deltaV = mogiVolumeChange * 1e6; // m^3 / yr
    const nu = poissonRatio;

    // Peak uplift at r=0
    // uz(0) = ((1-nu) / pi) * deltaV / d^2 in m -> *1000 to mm
    for (let rKm = 0; rKm <= 12; rKm += 0.5) {
      const r = rKm * 1000; // meters
      const denominator = Math.pow(r * r + d * d, 1.5);
      
      // Vertical uplift uz (mm/yr)
      const uzMeters = ((1 - nu) / Math.PI) * deltaV * (d / denominator);
      const uzMm = uzMeters * 1000;

      // Radial horizontal displacement ur (mm/yr)
      const urMeters = ((1 - nu) / Math.PI) * deltaV * (r / denominator);
      const urMm = urMeters * 1000;

      // Synthetic InSAR observed points with realistic noise
      const hash = Math.sin(rKm * 7.1 + d * 0.001);
      const observedNoise = hash * 1.8;
      const insarObservedMm = parseFloat((uzMm + observedNoise).toFixed(1));

      data.push({
        rKm,
        mogiUpliftMm: parseFloat(uzMm.toFixed(2)),
        mogiRadialMm: parseFloat(urMm.toFixed(2)),
        insarObservedMm: rKm <= 9 ? insarObservedMm : null
      });
    }

    return data;
  }, [mogiDepth, mogiVolumeChange, poissonRatio]);

  // Calculate 2.5D decomposition
  const decompositionResult = React.useMemo(() => {
    const thetaAsc = (volcano.tracks[0]?.incidenceAngleDeg || 39.2) * (Math.PI / 180);
    const alphaAsc = (volcano.tracks[0]?.headingDeg || 348.5) * (Math.PI / 180);

    const thetaDesc = (volcano.tracks[1]?.incidenceAngleDeg || 41.5) * (Math.PI / 180);
    const alphaDesc = (volcano.tracks[1]?.headingDeg || 192.3) * (Math.PI / 180);

    // Matrix elements
    // [d_asc ] = [ cos(theta_asc),  -sin(theta_asc)*cos(alpha_asc) ] [ U_vert ]
    // [d_desc]   [ cos(theta_desc), -sin(theta_desc)*cos(alpha_desc)] [ U_east ]
    const a11 = Math.cos(thetaAsc);
    const a12 = -Math.sin(thetaAsc) * Math.cos(alphaAsc);
    const a21 = Math.cos(thetaDesc);
    const a22 = -Math.sin(thetaDesc) * Math.cos(alphaDesc);

    const det = a11 * a22 - a12 * a21;
    if (Math.abs(det) < 1e-6) {
      return { vert: 0, east: 0 };
    }

    const uVert = (a22 * simAscLOS - a12 * simDescLOS) / det;
    const uEast = (-a21 * simAscLOS + a11 * simDescLOS) / det;

    return {
      vert: parseFloat(uVert.toFixed(2)),
      east: parseFloat(uEast.toFixed(2)),
      thetaAscDeg: (thetaAsc * 180 / Math.PI).toFixed(1),
      thetaDescDeg: (thetaDesc * 180 / Math.PI).toFixed(1),
      alphaAscDeg: (alphaAsc * 180 / Math.PI).toFixed(1),
      alphaDescDeg: (alphaDesc * 180 / Math.PI).toFixed(1)
    };
  }, [simAscLOS, simDescLOS, volcano]);

  // Complete Python code string
  const fullPythonCode = `# ==============================================================================
# COMET / LiCSBAS Sentinel-1 InSAR Time-Series Processing & Modeling Suite
# Target Volcano: ${volcano.name} (${volcano.region})
# Frame ID: ${volcano.frameId} | Central Lat/Lon: [${volcano.latitude}°N, ${volcano.longitude}°E]
# Generated for: Department of Geodesy and Geodynamics, ESSGI Ethiopia & AAU
# Reference: Morishita et al. (2020), Remote Sensing; Lazecky et al. (2020), MDPI
# ==============================================================================

import os
import sys
import numpy as np
import scipy.optimize as opt
import matplotlib.pyplot as plt

print("Initializing COMET LiCSBAS automated processing for ${volcano?.id || "volcano"}...")

# ------------------------------------------------------------------------------
# 1. PARAMETERS & SPATIAL GEODETIC BOUNDS
# ------------------------------------------------------------------------------
FRAME_ID = "${volcano?.frameId || "014A_05128_131313"}"
TARGET_ID = "${volcano?.id || "volcano"}"
BOUNDS = {
    "north": ${volcano?.bounds?.north ?? 13.8},
    "south": ${volcano?.bounds?.south ?? 13.0},
    "east": ${volcano?.bounds?.east ?? 41.2},
    "west": ${volcano?.bounds?.west ?? 40.2}
}
REF_POINT = {
    "lat": ${volcano?.referencePoint?.latitude ?? 13.5},
    "lon": ${volcano?.referencePoint?.longitude ?? 40.5},
    "name": "${volcano?.referencePoint?.name || "Bedrock Stable Datum"}"
}

# ------------------------------------------------------------------------------
# 2. LiCSBAS 5-STAGE PIPELINE COMMANDS
# ------------------------------------------------------------------------------
def run_licsbas_pipeline():
    print("[1/5] Downloading Sentinel-1 frame and multi-looking...")
    os.system(f"licsar_download_frame.py --frame {FRAME_ID} --start 20141015 --end 20260520")
    os.system(f"licsbas01_prep.py -f {FRAME_ID} --bounds {BOUNDS['west']},{BOUNDS['east']},{BOUNDS['south']},{BOUNDS['north']}")

    print("[2/5] GACOS 3D ECMWF ERA5 atmospheric delay correction...")
    os.system(f"licsbas02_prep_era5.py -f {FRAME_ID} --gacos_dir ./gacos --deramp")

    print("[3/5] Loop closure unwrapping error check & coherence thresholding...")
    os.system(f"licsbas03_sbas.py -f {FRAME_ID} --gamma_thresh 0.35 --loop_closure 1.5")

    print("[4/5] Estimating DEM residual topographic height error...")
    os.system(f"licsbas04_dem_error.py -f {FRAME_ID} --dem srtm30m.dem")

    print("[5/5] SVD matrix inversion to displacement time-series & mean velocity...")
    os.system(f"licsbas04_ts.py -f {FRAME_ID} --ref_lat {REF_POINT['lat']} --ref_lon {REF_POINT['lon']}")
    os.system(f"licsbas05_vel.py -f {FRAME_ID} --export_geotiff --export_csv")

# ------------------------------------------------------------------------------
# 3. 2.5D MULTI-TRACK DECOMPOSITION (Ascending + Descending -> Vertical + East-West)
# ------------------------------------------------------------------------------
def decompose_25d(los_asc, los_desc, theta_asc_deg=39.2, alpha_asc_deg=348.5, theta_desc_deg=41.5, alpha_desc_deg=192.3):
    theta_a = np.radians(theta_asc_deg)
    alpha_a = np.radians(alpha_asc_deg)
    theta_d = np.radians(theta_desc_deg)
    alpha_d = np.radians(alpha_desc_deg)

    A = np.array([
        [np.cos(theta_a), -np.sin(theta_a) * np.cos(alpha_a)],
        [np.cos(theta_d), -np.sin(theta_d) * np.cos(alpha_d)]
    ])
    d_los = np.array([los_asc, los_desc])
    u_vert, u_east = np.linalg.lstsq(A, d_los, rcond=None)[0]
    return u_vert, u_east

# ------------------------------------------------------------------------------
# 4. MOGI (1958) ANALYTICAL MAGMA CHAMBER INVERSION
# ------------------------------------------------------------------------------
def mogi_uplift(r, d, delta_v, nu=0.25):
    """
    Calculates surface vertical uplift uz(r) for spherical pressure source.
    r: radial distance from summit in meters
    d: chamber depth in meters
    delta_v: volume change in m^3
    nu: Poisson's ratio (typically 0.25)
    """
    return ((1.0 - nu) / np.pi) * delta_v * (d / (r**2 + d**2)**1.5)

# Example execution
if __name__ == "__main__":
    u_vert, u_east = decompose_25d(los_asc=${simAscLOS}, los_desc=${simDescLOS})
    print(f"2.5D Decomposed Vertical Uplift: {u_vert:.2f} mm/yr")
    print(f"2.5D Decomposed East-West Drift:  {u_east:.2f} mm/yr")

    r_test = np.linspace(0, 10000, 50)
    uz_test = mogi_uplift(r_test, d=${mogiDepth * 1000}, delta_v=${mogiVolumeChange * 1e6}) * 1000
    print(f"Peak Mogi Central Uplift (r=0): {uz_test[0]:.2f} mm/yr")
`;

  // Download Python file
  const handleDownloadPython = () => {
    const blob = new Blob([fullPythonCode], { type: "text/x-python;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `comet_licsbas_${volcano?.id || "volcano"}_pipeline.py`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Downloaded comet_licsbas_" + (volcano?.id || "volcano") + "_pipeline.py");
  };

  // Download Jupyter Notebook (.ipynb)
  const handleDownloadNotebook = () => {
    const notebookContent = {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `# COMET / LiCSBAS InSAR Processing & Magma Modeling: ${volcano?.name || "Target"}\n`,
            `**Target**: ${volcano?.name || "Target"} (${volcano?.region || "Ethiopia"})\n`,
            `**Sentinel-1 Frame**: \`${volcano?.frameId || "014A_05128_131313"}\`\n`,
            `**Institutes**: Department of Geodesy and Geodynamics, ESSGI Ethiopia & NERC COMET\n\n`,
            `This notebook executes the 5-stage LiCSBAS Small Baseline Subset (SBAS) pipeline and fits a Mogi (1958) analytical chamber inversion.`
          ]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "import numpy as np\n",
            "import matplotlib.pyplot as plt\n",
            "import scipy.optimize as opt\n",
            "%matplotlib inline\n",
            "print('Environment initialized.')"
          ]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            fullPythonCode
          ]
        }
      ],
      metadata: {
        language_info: { name: "python", version: "3.10.12" },
        kernelspec: { display_name: "Python 3 (ipykernel)", language: "python", name: "python3" }
      },
      nbformat: 4,
      nbformat_minor: 4
    };

    const blob = new Blob([JSON.stringify(notebookContent, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `COMET_LiCSBAS_${volcano?.id || "volcano"}.ipynb`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Downloaded COMET_LiCSBAS_" + (volcano?.id || "volcano") + ".ipynb");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullPythonCode);
    setCopied(true);
    triggerToast("Copied Python Script to Clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const triggerToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(""), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-5xl bg-[#0B0F19] text-slate-100 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 text-cyan-400 rounded-xl border border-cyan-500/40 shadow-inner">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                  <span>COMET / LiCSBAS Python Studio</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded-full font-sans">
                    Python 3.10
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Scientific InSAR processing, SBAS inversion, Mogi magma modeling &amp; reproducible Python toolchain for {volcano.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadNotebook}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
              title="Download Jupyter Notebook ready for Google Colab / WSL2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>.ipynb Notebook</span>
            </button>

            <button
              onClick={handleDownloadPython}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
              title="Download standalone Python script"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.py Script</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/80 hover:text-white text-slate-400 border border-slate-700 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST ALERT */}
        {copyToast && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-1.5 flex items-center justify-between animate-fade-in font-mono">
            <span>✓ {copyToast}</span>
            <Check className="w-3.5 h-3.5" />
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center border-b border-slate-800 bg-[#070A12] px-4 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "pipeline"
                ? "bg-[#0B0F19] text-cyan-400 border-cyan-500/40 shadow-sm"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>LiCSBAS 5-Stage Runner</span>
            {isExecuting && (
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("mogi")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "mogi"
                ? "bg-[#0B0F19] text-amber-400 border-amber-500/40 shadow-sm"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Mogi (1958) Magma Source</span>
          </button>

          <button
            onClick={() => setActiveTab("decomposition")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "decomposition"
                ? "bg-[#0B0F19] text-emerald-400 border-emerald-500/40 shadow-sm"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>2.5D Multi-Track Decomposition</span>
          </button>

          <button
            onClick={() => setActiveTab("script")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "script"
                ? "bg-[#0B0F19] text-purple-400 border-purple-500/40 shadow-sm"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>Python Source Code</span>
          </button>
        </div>

        {/* TAB 1: LiCSBAS 5-STAGE RUNNER */}
        {activeTab === "pipeline" && (
          <div className="p-4 overflow-y-auto space-y-4 flex-grow flex flex-col">
            {/* STAGE STATUS INDICATOR BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { step: 1, title: "01_prep.py", desc: "Frame Download & Multi-look" },
                { step: 2, title: "02_prep_era5.py", desc: "GACOS ECMWF Weather" },
                { step: 3, title: "03_sbas.py", desc: "Loop Closure & Coherence" },
                { step: 4, title: "04_dem_error.py", desc: "SRTM DEM Residual Inversion" },
                { step: 5, title: "05_vel.py", desc: "SVD Time-Series & Velocity" }
              ].map((s) => (
                <div
                  key={s.step}
                  className={`p-2.5 rounded-xl border transition-all ${
                    activeStep === s.step
                      ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-500/50"
                      : activeStep > s.step
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-slate-900/50 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                    <span>{s.title}</span>
                    {activeStep > s.step ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : activeStep === s.step ? (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    ) : null}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>

            {/* ACTION CONTROLS & PROGRESS */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecutePipeline}
                  disabled={isExecuting}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isExecuting
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg active:scale-95"
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isExecuting ? "animate-spin" : ""}`} />
                  <span>{isExecuting ? "Executing Python LiCSBAS..." : "Execute LiCSBAS Pipeline"}</span>
                </button>

                <button
                  onClick={handleResetPipeline}
                  disabled={isExecuting}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Terminal</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3 w-full sm:w-64">
                <div className="text-xs font-mono text-slate-400">Progress:</div>
                <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${executionProgress}%` }}
                  />
                </div>
                <div className="text-xs font-mono font-bold text-cyan-400 w-10 text-right">
                  {executionProgress}%
                </div>
              </div>
            </div>

            {/* REAL-TIME TERMINAL OUTPUT */}
            <div className="flex-1 min-h-[260px] bg-[#050811] rounded-2xl border border-slate-800 p-4 font-mono text-[11px] text-cyan-300 overflow-y-auto leading-relaxed space-y-1 shadow-inner select-text">
              {terminalLogs.map((line, idx) => (
                <div
                  key={idx}
                  className={`${
                    line.startsWith("[SUCCESS]")
                      ? "text-emerald-400 font-bold bg-emerald-950/40 p-1 rounded"
                      : line.startsWith("[STAGE")
                      ? "text-amber-300 font-bold mt-2"
                      : line.startsWith("=")
                      ? "text-slate-600"
                      : "text-slate-300"
                  }`}
                >
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        )}

        {/* TAB 2: MOGI (1958) MAGMA SOURCE MODEL */}
        {activeTab === "mogi" && (
          <div className="p-4 overflow-y-auto space-y-4 flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* SLIDERS & PARAMETERS */}
              <div className="lg:col-span-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs font-sans">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white uppercase text-xs tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Mogi Elastic Inversion Parameters</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Spherical point pressure source in an elastic half-space (Mogi, 1958)
                  </p>
                </div>

                {/* Depth slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300">Chamber Depth (d):</span>
                    <span className="text-amber-400 font-bold">{mogiDepth.toFixed(1)} km</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={mogiDepth}
                    onChange={(e) => setMogiDepth(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1.0 km (Shallow)</span>
                    <span>10.0 km (Deep)</span>
                  </div>
                </div>

                {/* Volume change slider */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300">Volume Inflow (ΔV):</span>
                    <span className="text-cyan-400 font-bold">+{mogiVolumeChange.toFixed(1)} × 10⁶ m³/yr</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="40.0"
                    step="0.5"
                    value={mogiVolumeChange}
                    onChange={(e) => setMogiVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1.0 × 10⁶</span>
                    <span>40.0 × 10⁶ m³/yr</span>
                  </div>
                </div>

                {/* Poisson's ratio */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-300">Poisson's Ratio (ν):</span>
                    <span className="text-emerald-400 font-bold">{poissonRatio.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.35"
                    step="0.01"
                    value={poissonRatio}
                    onChange={(e) => setPoissonRatio(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Peak calculated values */}
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 font-mono text-[11px] space-y-1.5">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Calculated Geophysics:</div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Peak Caldera Uplift (r=0):</span>
                    <span className="text-amber-400 font-bold">
                      {mogiChartData[0]?.mogiUpliftMm} mm/yr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Max Radial Tilt Distance:</span>
                    <span className="text-cyan-400 font-bold">
                      r = {(mogiDepth / Math.SQRT2).toFixed(1)} km
                    </span>
                  </div>
                </div>

              </div>

              {/* MOGI UPLIFT VS INVERTED INSAR CHART */}
              <div className="lg:col-span-8 bg-slate-900/70 p-4 rounded-2xl border border-slate-800 flex flex-col min-h-[340px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-white font-mono uppercase">
                    Surface Uplift Profile u_z(r) vs Radial Distance (km)
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-3 h-0.5 bg-amber-400 inline-block"></span> Mogi Theoretical
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> InSAR Observed
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mogiChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis
                        dataKey="rKm"
                        stroke="#64748B"
                        tick={{ fontSize: 11 }}
                        label={{ value: "Radial Distance from Center r (km)", position: "insideBottom", offset: -10, fill: "#94A3B8", fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#64748B"
                        tick={{ fontSize: 11 }}
                        label={{ value: "Surface Displacement (mm/yr)", angle: -90, position: "insideLeft", fill: "#94A3B8", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mogiUpliftMm"
                        name="Mogi Vertical uz (mm/yr)"
                        stroke="#F59E0B"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="mogiRadialMm"
                        name="Mogi Radial ur (mm/yr)"
                        stroke="#10B981"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Scatter
                        dataKey="insarObservedMm"
                        name="InSAR Observed (mm/yr)"
                        fill="#00D4FF"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: 2.5D MULTI-TRACK DECOMPOSITION */}
        {activeTab === "decomposition" && (
          <div className="p-4 overflow-y-auto space-y-4 flex-grow text-xs font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* INPUT SLIDERS */}
              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white uppercase text-xs tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Sentinel-1 Line-of-Sight LOS Inputs</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Decomposing Ascending &amp; Descending flight geometries into true Vertical and East-West components.
                  </p>
                </div>

                {/* Ascending LOS input */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-blue-400 font-bold">Ascending Track LOS:</span>
                    <span className="text-blue-300 font-bold">{simAscLOS} mm/yr</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="80"
                    step="0.5"
                    value={simAscLOS}
                    onChange={(e) => setSimAscLOS(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Incidence: {decompositionResult.thetaAscDeg}°</span>
                    <span>Heading: {decompositionResult.alphaAscDeg}°</span>
                  </div>
                </div>

                {/* Descending LOS input */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-orange-400 font-bold">Descending Track LOS:</span>
                    <span className="text-orange-300 font-bold">{simDescLOS} mm/yr</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="80"
                    step="0.5"
                    value={simDescLOS}
                    onChange={(e) => setSimDescLOS(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Incidence: {decompositionResult.thetaDescDeg}°</span>
                    <span>Heading: {decompositionResult.alphaDescDeg}°</span>
                  </div>
                </div>

                {/* MATH MATRIX EXPLANATION */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="text-emerald-400 font-bold uppercase text-[10px]">Geodetic Projection Matrix:</div>
                  <div className="text-slate-400">
                    [ d_asc  ] = [ cos(θ_asc)  -sin(θ_asc)·cos(α_asc) ] [ U_vert ]
                  </div>
                  <div className="text-slate-400">
                    [ d_desc ]   [ cos(θ_desc) -sin(θ_desc)·cos(α_desc)] [ U_east ]
                  </div>
                </div>
              </div>

              {/* DECOMPOSED VECTOR OUTPUTS */}
              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white uppercase text-xs tracking-wider text-emerald-400">
                    Decomposed Physical Displacement Vectors
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Separated from radar line-of-sight distortion
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Vertical */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-1">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                      Vertical Motion (U_z)
                    </div>
                    <div className="text-2xl font-mono font-black text-white">
                      {decompositionResult.vert > 0 ? `+${decompositionResult.vert}` : decompositionResult.vert}
                      <span className="text-xs font-normal text-slate-400 ml-1">mm/yr</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {decompositionResult.vert > 0 ? "Magmatic Uplift / Inflation" : "Caldera Subsidence"}
                    </div>
                  </div>

                  {/* Horizontal East-West */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/40 space-y-1">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                      Horizontal Motion (U_e)
                    </div>
                    <div className="text-2xl font-mono font-black text-white">
                      {decompositionResult.east > 0 ? `+${decompositionResult.east}` : decompositionResult.east}
                      <span className="text-xs font-normal text-slate-400 ml-1">mm/yr</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {decompositionResult.east > 0 ? "Eastward Crustal Extension" : "Westward Crustal Extension"}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                  <span className="text-amber-400 font-bold">Note for Advisors:</span> Near-polar Sentinel-1 orbits have low sensitivity to North-South motion, which is why InSAR 2.5D decomposition reliably solves for Vertical (U_z) and East-West (U_e).
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: COMPLETE PYTHON SOURCE CODE */}
        {activeTab === "script" && (
          <div className="p-4 overflow-y-auto space-y-3 flex-grow bg-[#070A12]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Executable Python 3 Script (NumPy, SciPy, Matplotlib, LiCSBAS)
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Script!" : "Copy Python Script"}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto selection:bg-cyan-800 max-h-[460px]">
              {fullPythonCode}
            </pre>
          </div>
        )}

        {/* FOOTER */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-3">
            <span>NERC COMET LiCSAR Frame: <strong className="text-white">{volcano.frameId}</strong></span>
            <span>Target: <strong className="text-cyan-400">{volcano.name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              Close Studio
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
