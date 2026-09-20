import { useState, useEffect } from "react";
import {
  X,
  Terminal,
  FileCode,
  CheckCircle2,
  Copy,
  Layers,
  Cpu,
  Download,
  Search,
  BookOpen,
  Server,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Workflow,
  FileText
} from "lucide-react";

export type LicsbasGuideTab =
  | "overview"
  | "wsl2_setup"
  | "pipeline"
  | "corrections"
  | "ssgi_integration"
  | "troubleshooting";

interface LicsbasGuideModalProps {
  isOpen?: boolean;
  initialTab?: LicsbasGuideTab;
  onClose: () => void;
  targetStationName?: string;
}

export function LicsbasGuideModal({
  isOpen = true,
  initialTab = "overview",
  onClose,
  targetStationName = "Erta Ale / Afar Rift"
}: LicsbasGuideModalProps) {
  const [activeTab, setActiveTab] = useState<LicsbasGuideTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleCopyCode = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2200);
  };

  const wslInstallScript = `# Step 1: Install & Launch WSL2 Ubuntu on Windows 10/11
wsl --install -d Ubuntu-22.04

# Step 2: Update Ubuntu Packages & Install System Toolchain
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential git wget curl unzip gfortran libgdal-dev libhdf5-dev netcdf-bin dos2unix

# Step 3: Set up Miniforge / Mamba environment for Geodesy & InSAR
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh
bash Miniforge3-Linux-x86_64.sh -b -p $HOME/miniforge3
source $HOME/miniforge3/bin/activate

# Step 4: Create Dedicated LiCSBAS Environment
mamba create -n licsbas -c conda-forge python=3.10 gdal rasterio h5py scipy matplotlib scikit-image netcdf4 pyproj -y
conda activate licsbas

# Step 5: Clone LiCSBAS from COMET Official Repository
cd $HOME
git clone https://github.com/m/LiCSBAS.git
export PATH=$HOME/LiCSBAS/bin:$PATH
export PYTHONPATH=$HOME/LiCSBAS:$PYTHONPATH

# Append environment variables to bashrc for persistence
echo 'export PATH=$HOME/LiCSBAS/bin:$PATH' >> ~/.bashrc
echo 'export PYTHONPATH=$HOME/LiCSBAS:$PYTHONPATH' >> ~/.bashrc
source ~/.bashrc`;

  const wslConfigScript = `# Save as C:\\Users\\YourUsername\\.wslconfig on Windows host
[wsl2]
memory=16GB            # Allocate sufficient RAM for Sentinel-1 frame unwrapping
processors=8           # Multithreading for Small Baseline Subset inversion
swap=8GB
localhostForwarding=true

# CRITICAL IO PERFORMANCE NOTE:
# Always place Sentinel-1 data inside native WSL filesystem (~/licsar_work/) 
# NEVER run heavy processing directly inside /mnt/c/ Users directory!`;

  const pipelineBashScript = `#!/usr/bin/env bash
# ==============================================================================
# SSGI - LiCSBAS Sentinel-1 InSAR Processing Script for East African Rift
# Station / Region Target: ${targetStationName}
# ==============================================================================
set -e

FRAME_ID="079A_08920_131313"
WORK_DIR="$HOME/insar_processing/$FRAME_ID"
mkdir -p "$WORK_DIR" && cd "$WORK_DIR"

echo "=== STAGE 1: Downloading LiCSAR Frame Unwrapped Interferograms ==="
licsbas_01_prep.py -i "$FRAME_ID" -d ./licsar_frame --multi_look 10

echo "=== STAGE 2: GACOS / ECMWF ERA5 Tropospheric Delay Correction ==="
# Fetches 3D ERA5 atmospheric temperature, humidity & pressure reanalysis
licsbas_02_prep_era5.py -i ./licsar_frame --gacos_dir ./ERA5_weather --calc_delay

echo "=== STAGE 3: Small Baseline Subset (SBAS) Time-Series Inversion ==="
licsbas_03_sbas.py -i ./licsar_frame --loop_closure_threshold 1.5 --min_cc 0.6

echo "=== STAGE 4: DEM Residual Height Error Estimation & Correction ==="
# Generates gold-standard output: timeseries_ERA5_demErr.h5
licsbas_04_dem_error.py -i ./licsar_frame --out_filename timeseries_ERA5_demErr.h5

echo "=== STAGE 5: Exporting NetCDF / GeoTIFF for SSGI Real-Time Geo-Portal ==="
licsbas_05_export.py -i timeseries_ERA5_demErr.h5 --fmt netcdf --out ${targetStationName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_timeseries_ERA5_demErr.nc

echo "PROCESSING COMPLETE! Output Dataset: $WORK_DIR/timeseries_ERA5_demErr.h5"`;

  const pythonIngestScript = `# SSGI InSAR Ingestion Bridge (Python FastREST Service)
import h5py
import numpy as np
import json
import requests

def ingest_licsbas_hdf5(hdf5_file_path, station_code="${targetStationName}"):
    """
    Parses timeseries_ERA5_demErr.h5 generated in WSL2 
    and posts velocity vector time-series to SSGI Real-Time Geo-Portal REST API.
    """
    with h5py.File(hdf5_file_path, 'r') as h5:
        # Extract dates and cumulative displacement matrix (mm)
        dates = [d.decode('utf-8') for d in h5['dates'][:]]
        cumulative_disp = h5['cum_disp'][:]  # 3D array (time, lat, lon)
        mean_velocity = h5['vel'][:]          # 2D array (mm/yr)
        
        # Calculate mean displacement over target volcano caldera
        caldera_ts = np.nanmean(cumulative_disp, axis=(1, 2))
        
        payload = {
            "station": station_code,
            "pipeline_version": "timeseries_ERA5_demErr",
            "quality_rms_mm": float(h5.attrs.get("rms_noise_mm", 0.7)),
            "timestamps": dates,
            "displacement_mm": caldera_ts.tolist(),
            "mean_velocity_mmyr": float(np.nanmean(mean_velocity))
        }
        
        # Post directly to SSGI Geo-Portal Backend
        response = requests.post(
            "http://localhost:3000/api/inc/insar-ingest",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"SSGI Geo-Portal API Ingestion Status: {response.status_code}")
        return response.json()

if __name__ == "__main__":
    ingest_licsbas_hdf5("timeseries_ERA5_demErr.h5")`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto font-sans text-slate-900">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0E4A72] to-[#0085C8] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-cyan-300 shadow-xs shrink-0">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-cyan-400/20 text-cyan-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-300/30">
                  SSGI TECHNICAL INTEGRATION GUIDE
                </span>
                <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-300/30">
                  WSL2 & Ubuntu Compatible
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1">
                LiCSBAS InSAR Time-Series Integration Guide (<code className="font-mono text-cyan-300">timeseries_ERA5_demErr</code>)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shrink-0 ml-2"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUBHEADER BAR WITH SEARCH & QUICK INFO */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Radio className="w-4 h-4 text-[#0085C8]" />
            <span>Target Region: <strong className="text-slate-900 font-bold">{targetStationName}</strong></span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search guide commands & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="bg-white border-b border-slate-200 px-5 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none font-bold text-xs">
          {[
            { id: "overview", label: "1. Overview & Architecture", icon: BookOpen },
            { id: "wsl2_setup", label: "2. WSL2 Environment", icon: Terminal },
            { id: "pipeline", label: "3. Processing Pipeline", icon: Workflow },
            { id: "corrections", label: "4. ERA5 & DEM Corrections", icon: Zap },
            { id: "ssgi_integration", label: "5. SSGI Ingestion API", icon: Server },
            { id: "troubleshooting", label: "6. Troubleshooting", icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LicsbasGuideTab)}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? "border-[#0085C8] text-[#0085C8] bg-sky-50/50 font-black"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0085C8]" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN BODY CONTENT AREA */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800 leading-relaxed text-sm">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#0085C8] font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-[#0085C8]" />
                  <span>What is LiCSBAS & Why is it Used in SSGI?</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  <strong>LiCSBAS</strong> is an open-source Python tool designed for Interferometric Synthetic Aperture Radar (InSAR) time-series analysis using the <strong>Small BAseline Subset (SBAS)</strong> technique. It processes automated unwrapped interferograms from the <strong>COMET LiCSAR portal</strong> (Sentinel-1 SAR) to monitor ground deformation over volcanoes, rifts, and tectonic faults in Ethiopia (such as <em>Erta Ale, Dallol, Fantale, and the Main Ethiopian Rift</em>).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-amber-700 font-mono font-bold text-xs uppercase flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-amber-600" />
                    Level 1: Raw InSAR (<code className="text-slate-900">timeseries</code>)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Uncorrected time-series containing uncompensated atmospheric phase delay (water vapor noise up to ±50 mm) and topographic height residual errors.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-sky-700 font-mono font-bold text-xs uppercase flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-sky-600" />
                    Level 2: ERA5 Corrected (<code className="text-slate-900">timeseries_ERA5</code>)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Corrected for dynamic tropospheric delay using 3D atmospheric temperature and water vapor reanalysis models from ECMWF ERA5 / GACOS.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2">
                  <div className="text-emerald-800 font-mono font-bold text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Level 3: Gold Standard (<code className="text-slate-900">timeseries_ERA5_demErr</code>)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    The ultimate dataset. Removes both tropospheric weather delays AND residual Digital Elevation Model (DEM) height errors to achieve sub-millimeter crustal movement precision.
                  </p>
                </div>
              </div>

              {/* Architecture Pipeline Diagram */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#0085C8]" />
                  <span>End-to-End System Ingestion Architecture</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono font-bold">
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-800">
                    1. Sentinel-1 SAR
                    <span className="block text-[10px] text-slate-500 font-normal mt-1">Copernicus / ESA</span>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-100 border border-sky-300 text-sky-900">
                    2. LiCSAR Frames
                    <span className="block text-[10px] text-sky-700 font-normal mt-1">COMET Automated</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-900">
                    3. WSL2 LiCSBAS
                    <span className="block text-[10px] text-indigo-700 font-normal mt-1">SBAS + ERA5 + demErr</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900">
                    4. Ingestion API
                    <span className="block text-[10px] text-amber-700 font-normal mt-1">SSGI Python REST</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900">
                    5. Geo-Portal UI
                    <span className="block text-[10px] text-emerald-700 font-normal mt-1">Real-Time Cockpit</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WSL2 SETUP */}
          {activeTab === "wsl2_setup" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#0085C8]" />
                  <span>Step 1: Installing WSL2 & Ubuntu 22.04 LTS on Windows</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  LiCSBAS relies on Linux GDAL, Fortran compilers, and HDF5 C libraries. Installing WSL2 on Windows 10/11 allows you to run native Linux InSAR processing scripts at near-native speeds.
                </p>
              </div>

              {/* Code block with copy button */}
              <div className="bg-slate-900 rounded-2xl p-4 text-cyan-300 font-mono text-xs space-y-3 relative shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    WSL2 & LiCSBAS Toolchain Installation Commands
                  </span>
                  <button
                    onClick={() => handleCopyCode(wslInstallScript, "wsl_install")}
                    className="px-3 py-1 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/80 text-cyan-200 border border-cyan-500/40 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {copiedSection === "wsl_install" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Bash Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto text-slate-300 leading-relaxed p-1">
                  {wslInstallScript}
                </pre>
              </div>

              {/* WSLConfig Box */}
              <div className="border border-amber-200 bg-amber-50/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Crucial WSL2 Optimization: Creating <code className="text-amber-950 font-mono">.wslconfig</code></span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  To prevent out-of-memory crashes during Small Baseline Subset matrix inversion, allocate at least 12–16GB RAM to WSL2:
                </p>
                <div className="bg-slate-900 rounded-xl p-3 text-emerald-300 font-mono text-xs overflow-x-auto">
                  <pre>{wslConfigScript}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PIPELINE */}
          {activeTab === "pipeline" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-[#0085C8]" />
                    <span>Step-by-Step 5-Stage LiCSBAS Pipeline Execution</span>
                  </h3>
                  <button
                    onClick={() => handleCopyCode(pipelineBashScript, "pipeline_script")}
                    className="px-3 py-1.5 rounded-xl bg-[#0085C8] hover:bg-[#0070ab] text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedSection === "pipeline_script" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Copied Pipeline Script!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Copy Complete Bash Pipeline Script</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Run these sequentially in your WSL2 terminal to generate <code className="font-mono text-[#0085C8] font-bold">timeseries_ERA5_demErr.h5</code> for <strong>{targetStationName}</strong>.
                </p>
              </div>

              {/* Stage Cards */}
              <div className="space-y-3">
                {[
                  {
                    step: "Stage 1",
                    cmd: "licsbas_01_prep.py -i 079A_08920_131313 -d ./licsar_frame",
                    title: "Frame Selection & Multilooking",
                    desc: "Downloads Sentinel-1 unwrapped interferogram pairs and coherence maps from COMET LiCSAR portal."
                  },
                  {
                    step: "Stage 2",
                    cmd: "licsbas_02_prep_era5.py -i ./licsar_frame --gacos_dir ./ERA5_weather",
                    title: "GACOS / ERA5 Tropospheric Delay Ingestion",
                    desc: "Computes 3D atmospheric delay maps from ECMWF ERA5 weather reanalysis to remove cloud and water vapor noise."
                  },
                  {
                    step: "Stage 3",
                    cmd: "licsbas_03_sbas.py -i ./licsar_frame --loop_closure 1.5",
                    title: "Small Baseline Subset (SBAS) Inversion",
                    desc: "Performs loop closure quality filtering and solves displacement vector velocity over time."
                  },
                  {
                    step: "Stage 4",
                    cmd: "licsbas_04_dem_error.py -i ./licsar_frame --out_filename timeseries_ERA5_demErr.h5",
                    title: "Topographic DEM Residual Height Error Correction",
                    desc: "Corrects SRTM / Copernicus DEM elevation errors to produce the gold-standard dataset: timeseries_ERA5_demErr.h5."
                  },
                  {
                    step: "Stage 5",
                    cmd: "licsbas_05_export.py -i timeseries_ERA5_demErr.h5 --fmt netcdf --out output.nc",
                    title: "NetCDF / GeoTIFF Export for SSGI Portal",
                    desc: "Formats matrix dataset into NetCDF/GeoJSON for automated ingestion into SSGI Real-Time Geo-Portal."
                  }
                ].map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#0085C8]/10 text-[#0085C8] border border-[#0085C8]/20">
                        {s.step}: {s.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {s.desc}
                    </p>
                    <div className="bg-slate-900 rounded-xl p-2.5 text-cyan-300 font-mono text-xs overflow-x-auto">
                      <code>{s.cmd}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CORRECTIONS */}
          {activeTab === "corrections" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#0085C8]" />
                  <span>Understanding ERA5 Atmospheric & DEM Error Corrections</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In East Africa (especially the Danakil Depression and Afar Rift), extreme atmospheric thermal inversions and steep topography can introduce false InSAR deformation signals if left uncorrected.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-3">
                  <h4 className="font-bold text-sky-950 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-600" />
                    <span>1. ERA5 Tropospheric Correction</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Radar waves slow down as they pass through atmospheric water vapor. By integrating <strong>ECMWF ERA5 3D weather reanalysis data</strong>, LiCSBAS models the exact refractivity index across altitude layers at the satellite pass timestamp, removing false weather artifacts.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>2. DEM Error Correction (<code className="font-mono">demErr</code>)</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Inaccuracies in Digital Elevation Models (e.g. 30m SRTM) cause phase errors proportional to the perpendicular baseline (B_perp). LiCSBAS solves for topographic height residual errors pixel-by-pixel, isolating pure magmatic or fault tectonic displacement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SSGI INTEGRATION */}
          {activeTab === "ssgi_integration" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#0085C8]" />
                  <span>Python Ingestion Bridge into SSGI Geo-Portal API</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use this Python script in WSL2 or server environment to automatically parse <code className="font-mono text-[#0085C8] font-bold">timeseries_ERA5_demErr.h5</code> and push telemetry directly to the SSGI Dashboard REST endpoint.
                </p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 text-cyan-300 font-mono text-xs space-y-3 relative shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    Python Ingestion Script (<code className="text-emerald-400">ssgi_insar_ingest.py</code>)
                  </span>
                  <button
                    onClick={() => handleCopyCode(pythonIngestScript, "python_ingest")}
                    className="px-3 py-1 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/80 text-cyan-200 border border-cyan-500/40 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {copiedSection === "python_ingest" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Python Script</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto text-slate-300 leading-relaxed p-1">
                  {pythonIngestScript}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: TROUBLESHOOTING */}
          {activeTab === "troubleshooting" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#0085C8]" />
                  <span>Common WSL2 & LiCSBAS Troubleshooting Solutions</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quick fixes for common installation, memory, and GDAL/HDF5 environment issues in WSL2.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Issue 1: Extremely Slow File I/O inside <code className="font-mono text-slate-900">/mnt/c/</code>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Solution:</strong> Windows host drive access via `/mnt/c/` is slow due to translation layers. Always clone and run LiCSBAS inside native WSL filesystem (e.g. <code className="font-mono text-[#0085C8]">/home/username/licsbas_work/</code>) for 10x speedup.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Issue 2: HDF5 File Locking Error (<code className="font-mono text-slate-900">Unable to open file</code>)
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Solution:</strong> Set environment variable: <code className="font-mono text-emerald-700 font-bold">export HDF5_USE_FILE_LOCKING=FALSE</code> in your <code className="font-mono text-slate-900">~/.bashrc</code> file.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Issue 3: Windows Line Ending Syntax Error in Bash Scripts (<code className="font-mono text-slate-900">\r command not found</code>)
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Solution:</strong> Convert Windows CRLF to Unix LF using: <code className="font-mono text-[#0085C8] font-bold">dos2unix licsbas_script.sh</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono font-bold text-slate-800">SSGI Space Science & Geospatial Institute — Geodesy & InSAR Division</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopyCode(pipelineBashScript, "footer_copy")}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === "footer_copy" ? "Copied Script!" : "Quick Copy Pipeline Script"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0085C8] hover:bg-[#0070ab] text-white font-extrabold transition-all cursor-pointer shadow-sm"
            >
              Close Technical Guide
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
