import React, { useState } from "react";
import { Crosshair, MapPin, Search, RotateCcw } from "lucide-react";
import { VolcanoTarget } from "../types/insar";

interface PointSelectorProps {
  volcano: VolcanoTarget;
  selectedLat: number;
  selectedLon: number;
  onPointSelect: (coords: { lat: number; lon: number }) => void;
}

export const PointSelector: React.FC<PointSelectorProps> = ({
  volcano,
  selectedLat,
  selectedLon,
  onPointSelect
}) => {
  const [inputLat, setInputLat] = useState<string>(selectedLat.toFixed(3));
  const [inputLon, setInputLon] = useState<string>(selectedLon.toFixed(3));

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(inputLat);
    const parsedLon = parseFloat(inputLon);
    if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
      onPointSelect({ lat: parsedLat, lon: parsedLon });
    }
  };

  const handleResetHotspot = () => {
    onPointSelect({
      lat: volcano.hotspotPoint.latitude,
      lon: volcano.hotspotPoint.longitude
    });
    setInputLat(volcano.hotspotPoint.latitude.toFixed(3));
    setInputLon(volcano.hotspotPoint.longitude.toFixed(3));
  };

  const handleResetRef = () => {
    onPointSelect({
      lat: volcano.referencePoint.latitude,
      lon: volcano.referencePoint.longitude
    });
    setInputLat(volcano.referencePoint.latitude.toFixed(3));
    setInputLon(volcano.referencePoint.longitude.toFixed(3));
  };

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-lg p-3 text-slate-200 font-sans shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* MANUAL COORDINATE INPUT FORM */}
        <form onSubmit={handleApply} className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-md">
            <span className="text-[11px] font-mono text-slate-400">Lat:</span>
            <input
              type="number"
              step="0.001"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              className="w-20 bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
              placeholder="13.287"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-md">
            <span className="text-[11px] font-mono text-slate-400">Lon:</span>
            <input
              type="number"
              step="0.001"
              value={inputLon}
              onChange={(e) => setInputLon(e.target.value)}
              className="w-20 bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
              placeholder="40.726"
            />
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Jump</span>
          </button>
        </form>

        {/* QUICK JUMP BUTTONS: HOTSPOT & REFERENCE POINT */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetHotspot}
            className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-md text-xs font-mono font-semibold cursor-pointer flex items-center gap-1 transition-all"
            title="Jump to Deformation Peak Target"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Uplift Peak</span>
          </button>

          <button
            onClick={handleResetRef}
            className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded-md text-xs font-mono font-semibold cursor-pointer flex items-center gap-1 transition-all"
            title="Jump to Zero Reference Node"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ref Node</span>
          </button>
        </div>

      </div>
    </div>
  );
};
