import React, { useState } from "react";
import { VolcanoTarget } from "../types/insar";
import { Code, Copy, Check, Terminal, ExternalLink, X } from "lucide-react";

interface CometScriptModalProps {
  volcano: VolcanoTarget;
  onClose: () => void;
}

export const CometScriptModal: React.FC<CometScriptModalProps> = ({
  volcano,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const pythonScript = `# ==============================================================================
# COMET / LiCSBAS Sentinel-1 InSAR Time-Series Processing Workflow
# Target: ${volcano.name} (${volcano.region})
# Frame: ${volcano.frameId} | Central Coordinates: [${volcano.latitude}°N, ${volcano.longitude}°E]
# Generated for: Department of Geodesy and Geodynamics, ESSGI Ethiopia
# ==============================================================================

import os
import sys
import numpy as np
import matplotlib.pyplot as plt

# 1. DEFINE TARGET BOUNDING BOX & FRAME
FRAME_ID = "${volcano.frameId}"
VOLCANO_ID = "${volcano.id}"
BOUNDS = {
    "north": ${volcano.bounds.north},
    "south": ${volcano.bounds.south},
    "east": ${volcano.bounds.east},
    "west": ${volcano.bounds.west}
}
REF_POINT = {
    "lat": ${volcano.referencePoint.latitude},
    "lon": ${volcano.referencePoint.longitude},
    "name": "${volcano.referencePoint.name || "Reference Station"}"
}

# 2. DOWNLOAD LiCSAR INTERFEROGRAM STACK FROM COMET PORTAL
os.system(f"licsar_download_frame.py --frame {FRAME_ID} --start 20141015 --end 20260520")

# 3. LiCSBAS MULTI-LOOKING & COHERENCE MASKING
os.system(f"licsbas02_unwrap.py -f {FRAME_ID} --gamma_thresh 0.35 --bounds {BOUNDS['west']},{BOUNDS['east']},{BOUNDS['south']},{BOUNDS['north']}")

# 4. SPATIO-TEMPORAL FILTERING & LOOP CLOSURE CHECK
os.system(f"licsbas03_filt.py -f {FRAME_ID} --gacos_correct --deramp")

# 5. SBAS TIME-SERIES INVERSION WITH REFERENCE POINT ZEROING
os.system(f"licsbas04_ts.py -f {FRAME_ID} --ref_lat {REF_POINT['lat']} --ref_lon {REF_POINT['lon']} --output_dir ./results_{VOLCANO_ID}")

# 6. VELOCITY ESTIMATION & GEOPHYSICAL PRODUCT EXPORT
os.system(f"licsbas05_vel.py -f {FRAME_ID} --export_geotiff --export_csv")

print(f"LiCSBAS processing completed for {VOLCANO_ID}. Peak deformation rate: ${volcano.peakVelocity} mm/yr")
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-[#0B0F19] text-slate-100 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans">
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/40">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  COMET / LiCSBAS Python Script Exporter
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {volcano.id.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reproducible automated command script for NERC COMET &amp; LiCSBAS scientific processing
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

        {/* CODE CONTAINER */}
        <div className="p-4 overflow-y-auto space-y-3 bg-[#070A12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Environment: Python 3.10+ / LiCSBAS v1.5 / GMT 6.0
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded-md flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Script!" : "Copy Python Script"}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto selection:bg-cyan-800">
            {pythonScript}
          </pre>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>COMET Volcano Portal Standard LiCSAR Stack</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
