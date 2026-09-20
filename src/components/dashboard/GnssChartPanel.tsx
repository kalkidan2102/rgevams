import { useState, useMemo } from "react";
import { GnssStation } from "../../types";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Activity, 
  Compass, 
  TrendingUp, 
  Radio, 
  CheckCircle2, 
  Layers, 
  Info, 
  RotateCw,
  Server,
  Calendar
} from "lucide-react";

export interface GnssChartPanelProps {
  station: GnssStation;
  className?: string;
}

export default function GnssChartPanel({ station, className = "" }: GnssChartPanelProps) {
  const [timeSpan, setTimeSpan] = useState<"1y" | "5y" | "10y">("5y");
  const [plotMode, setPlotMode] = useState<"comet_3plot" | "overlay">("comet_3plot");
  const [visibleLines, setVisibleLines] = useState({
    north: true,
    east: true,
    vertical: true,
    combined: false
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveJitter, setLiveJitter] = useState({ north: 0, east: 0, vertical: 0 });
  const [trackedSatellites, setTrackedSatellites] = useState(26);

  // Compute horizontal drift vector
  const vN = station.velocityNorth + liveJitter.north;
  const vE = station.velocityEast + liveJitter.east;
  const vU = station.velocityUp + liveJitter.vertical;

  const velocityMagnitude = useMemo(() => {
    return Math.sqrt(vN * vN + vE * vE);
  }, [vN, vE]);

  const azimuthDegrees = useMemo(() => {
    let angle = Math.atan2(vE, vN) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, [vN, vE]);

  const compassDirection = useMemo(() => {
    const directions = [
      { name: "North", min: 337.5, max: 22.5 },
      { name: "North-East", min: 22.5, max: 67.5 },
      { name: "East", min: 67.5, max: 112.5 },
      { name: "South-East", min: 112.5, max: 157.5 },
      { name: "South", min: 157.5, max: 202.5 },
      { name: "South-West", min: 202.5, max: 247.5 },
      { name: "West", min: 247.5, max: 292.5 },
      { name: "North-West", min: 292.5, max: 337.5 }
    ];
    const deg = azimuthDegrees;
    const match = directions.find(d => {
      if (d.name === "North") {
        return deg >= d.min || deg < d.max;
      }
      return deg >= d.min && deg < d.max;
    });
    return match ? match.name : "North-East";
  }, [azimuthDegrees]);

  // Compute future drift projections
  const projectionYears = [5, 10, 50, 100];
  const projections = useMemo(() => {
    return projectionYears.map(yr => {
      const nDrift = vN * yr;
      const eDrift = vE * yr;
      const totalDrift = Math.sqrt(nDrift * nDrift + eDrift * eDrift);
      return {
        years: yr,
        north: nDrift.toFixed(0),
        east: eDrift.toFixed(0),
        total: totalDrift.toFixed(0)
      };
    });
  }, [vN, vE]);

  // Generate historical drift curve timeseries data
  const chartData = useMemo(() => {
    const dataPoints: any[] = [];
    let periods = 0;
    let labelMultiplier = 1; // map periods to actual labels
    let step = 1; // year fractions

    if (timeSpan === "1y") {
      periods = 12; // 12 months
      labelMultiplier = 1 / 12;
      step = 1;
    } else if (timeSpan === "5y") {
      periods = 20; // 20 quarters
      labelMultiplier = 1 / 4;
      step = 1;
    } else {
      periods = 40; // 10 years * 4 quarters
      labelMultiplier = 1 / 4;
      step = 1;
    }

    const currentYear = 2026;

    for (let i = 0; i <= periods; i += step) {
      const offsetYears = i * labelMultiplier;
      const t = currentYear - (timeSpan === "1y" ? 1 : timeSpan === "5y" ? 5 : 10) + offsetYears;
      
      // Add cyclic seasonal geodynamic signal (thermal + atmosphere loading)
      const seasonalJitterN = Math.sin(offsetYears * 2 * Math.PI) * 1.4;
      const seasonalJitterE = Math.cos(offsetYears * 2 * Math.PI) * 1.1;
      const seasonalJitterU = Math.sin(offsetYears * 4 * Math.PI) * 0.7;

      const cumNorth = offsetYears * vN + seasonalJitterN;
      const cumEast = offsetYears * vE + seasonalJitterE;
      const cumVertical = offsetYears * vU + seasonalJitterU;
      const cumCombined = Math.sqrt(cumNorth * cumNorth + cumEast * cumEast);

      const label = timeSpan === "1y" 
        ? `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i % 12]}`
        : `${t.toFixed(timeSpan === "10y" ? 1 : 2)}`;

      dataPoints.push({
        label,
        North: Number(cumNorth.toFixed(2)),
        East: Number(cumEast.toFixed(2)),
        Vertical: Number(cumVertical.toFixed(2)),
        Combined: Number(cumCombined.toFixed(2))
      });
    }

    return dataPoints;
  }, [vN, vE, vU, timeSpan]);

  const handleSimulateEpoch = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // micro jitter simulating sub-millimeter noise on a dual-frequency geodetic GPS receiver
      setLiveJitter({
        north: Number((Math.random() - 0.5) * 0.15),
        east: Number((Math.random() - 0.5) * 0.15),
        vertical: Number((Math.random() - 0.5) * 0.08)
      });
      setTrackedSatellites(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(18, Math.min(32, prev + delta));
      });
      setIsSimulating(false);
    }, 600);
  };

  const handleResetJitter = () => {
    setLiveJitter({ north: 0, east: 0, vertical: 0 });
    setTrackedSatellites(26);
  };

  return (
    <div className={`space-y-4 font-sans ${className}`} id={`gnss-chart-panel-${station.id}`}>
      {/* Visual Header Grid for Station Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-white/5 rounded-2xl p-3">
          <span className="text-[8.5px] font-mono font-bold text-slate-450 dark:text-slate-500 uppercase block">Horiz Velocity</span>
          <span className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 font-mono block mt-0.5">
            {velocityMagnitude.toFixed(2)} mm/yr
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-white/5 rounded-2xl p-3">
          <span className="text-[8.5px] font-mono font-bold text-slate-450 dark:text-slate-500 uppercase block">Drift Heading</span>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white font-mono block mt-0.5 truncate" title={`${azimuthDegrees.toFixed(1)}° Azimuth`}>
            {compassDirection} ({azimuthDegrees.toFixed(0)}°)
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-white/5 rounded-2xl p-3">
          <span className="text-[8.5px] font-mono font-bold text-slate-450 dark:text-slate-500 uppercase block">Vertical Rate</span>
          <span className={`text-sm font-extrabold font-mono block mt-0.5 ${vU >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {vU >= 0 ? "+" : ""}{vU.toFixed(2)} mm/yr
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-white/5 rounded-2xl p-3">
          <span className="text-[8.5px] font-mono font-bold text-slate-450 dark:text-slate-500 uppercase block">Active Satellites</span>
          <span className="text-sm font-extrabold text-amber-500 font-mono block mt-0.5 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            {trackedSatellites} SVs
          </span>
        </div>
      </div>

      {/* Chart Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-150 dark:border-white/5">
        {/* Mode Toggle & Layer Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5 shadow-2xs">
            <button
              onClick={() => setPlotMode("comet_3plot")}
              className={`px-2 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold transition-colors ${plotMode === "comet_3plot" ? "bg-cyan-600 text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
            >
              3 Subplots (COMET)
            </button>
            <button
              onClick={() => setPlotMode("overlay")}
              className={`px-2 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-colors ${plotMode === "overlay" ? "bg-cyan-600 text-white font-bold" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
            >
              Overlay
            </button>
          </div>

          {plotMode === "overlay" && (
            <div className="flex items-center gap-2 ml-2">
              <label className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={visibleLines.north} 
                  onChange={() => setVisibleLines(prev => ({ ...prev, north: !prev.north }))}
                  className="accent-emerald-500 rounded border-slate-300"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                North
              </label>
              <label className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={visibleLines.east} 
                  onChange={() => setVisibleLines(prev => ({ ...prev, east: !prev.east }))}
                  className="accent-indigo-500 rounded border-slate-300"
                />
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                East
              </label>
              <label className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={visibleLines.vertical} 
                  onChange={() => setVisibleLines(prev => ({ ...prev, vertical: !prev.vertical }))}
                  className="accent-rose-500 rounded border-slate-300"
                />
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Vertical
              </label>
            </div>
          )}
        </div>

        {/* Timespan Buttons */}
        <div className="flex items-center bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5 shadow-2xs self-end sm:self-auto shrink-0">
          <button 
            onClick={() => setTimeSpan("1y")}
            className={`px-2 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-colors ${timeSpan === "1y" ? "bg-slate-900 text-white font-black" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
          >
            1Y
          </button>
          <button 
            onClick={() => setTimeSpan("5y")}
            className={`px-2 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-colors ${timeSpan === "5y" ? "bg-slate-900 text-white font-black" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
          >
            5Y
          </button>
          <button 
            onClick={() => setTimeSpan("10y")}
            className={`px-2 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-colors ${timeSpan === "10y" ? "bg-slate-900 text-white font-black" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
          >
            10Y
          </button>
        </div>
      </div>

      {/* Main Geodetic Timeseries Chart */}
      {plotMode === "comet_3plot" ? (
        <div className="space-y-3">
          {/* 1. East Displacement Subplot */}
          <div className="bg-slate-950 border border-slate-900/80 rounded-2xl p-3 space-y-1">
            <div className="flex justify-between items-center text-[9.5px] font-mono">
              <span className="font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                East-West Displacement (East Drift)
              </span>
              <span className="text-indigo-300 font-bold bg-indigo-950/60 border border-indigo-800/80 px-2 py-0.5 rounded">
                dE/dt = {vE >= 0 ? "+" : ""}{vE.toFixed(2)} mm/yr
              </span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.6} />
                  <XAxis dataKey="label" stroke="#475569" fontSize={8} fontFamily="monospace" tickLine={false} />
                  <YAxis stroke="#475569" fontSize={8} fontFamily="monospace" tickLine={false} axisLine={false} unit=" mm" />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace", color: "#f1f5f9" }} formatter={(val: any) => [`${val} mm`, "East Drift"]} />
                  <Line type="monotone" dataKey="East" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. North Displacement Subplot */}
          <div className="bg-slate-950 border border-slate-900/80 rounded-2xl p-3 space-y-1">
            <div className="flex justify-between items-center text-[9.5px] font-mono">
              <span className="font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                North-South Displacement (North Drift)
              </span>
              <span className="text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                dN/dt = {vN >= 0 ? "+" : ""}{vN.toFixed(2)} mm/yr
              </span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.6} />
                  <XAxis dataKey="label" stroke="#475569" fontSize={8} fontFamily="monospace" tickLine={false} />
                  <YAxis stroke="#475569" fontSize={8} fontFamily="monospace" tickLine={false} axisLine={false} unit=" mm" />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace", color: "#f1f5f9" }} formatter={(val: any) => [`${val} mm`, "North Drift"]} />
                  <Line type="monotone" dataKey="North" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Vertical Displacement Subplot */}
          <div className="bg-slate-950 border border-slate-900/80 rounded-2xl p-3 space-y-1">
            <div className="flex justify-between items-center text-[9.5px] font-mono">
              <span className="font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Vertical Displacement (Uplift / Subsidence)
              </span>
              <span className="text-rose-300 font-bold bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded">
                dU/dt = {vU >= 0 ? "+" : ""}{vU.toFixed(2)} mm/yr
              </span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.6} />
                  <XAxis dataKey="label" stroke="#475569" fontSize={8} fontFamily="monospace" tickLine={false} />
                  <YAxis stroke="#475569" fontSize={8} fontFamily="monospace" tickLine={false} axisLine={false} unit=" mm" />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace", color: "#f1f5f9" }} formatter={(val: any) => [`${val} mm`, "Vertical Uplift"]} />
                  <Line type="monotone" dataKey="Vertical" stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-900/80 rounded-2xl p-4 space-y-1.5 w-full relative">
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-widest px-1">
            <span className="flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Cumulative Displacement History
            </span>
            <span className="text-slate-500">Unit: Millimeters (mm)</span>
          </div>

          <div className="h-[180px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -22, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="label" 
                  stroke="#475569" 
                  fontSize={8.5} 
                  fontFamily="monospace"
                  tickLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={8.5} 
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#020617", 
                    borderColor: "#1e293b", 
                    borderRadius: "12px",
                    fontSize: "10.5px",
                    fontFamily: "monospace",
                    color: "#f1f5f9"
                  }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                />
                {visibleLines.north && (
                  <Line 
                    type="monotone" 
                    dataKey="North" 
                    name="North Disp" 
                    stroke="#10b981" 
                    strokeWidth={2.2} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {visibleLines.east && (
                  <Line 
                    type="monotone" 
                    dataKey="East" 
                    name="East Disp" 
                    stroke="#6366f1" 
                    strokeWidth={2.2} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {visibleLines.vertical && (
                  <Line 
                    type="monotone" 
                    dataKey="Vertical" 
                    name="Vertical Disp" 
                    stroke="#f43f5e" 
                    strokeWidth={2.2} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {visibleLines.combined && (
                  <Line 
                    type="monotone" 
                    dataKey="Combined" 
                    name="Net 2D Disp" 
                    stroke="#06b6d4" 
                    strokeWidth={1.8} 
                    strokeDasharray="4 3"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-mono px-1">
            <span>Timespan Start: {timeSpan === "1y" ? "12 Months Ago" : `${2026 - (timeSpan === "5y" ? 5 : 10)} Epoch`}</span>
            <span>Predicted drift rate is model-computed on real-time geodynamics</span>
          </div>
        </div>
      )}

      {/* Geodynamic Epoch Simulation & Projections Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Geodetic Epoch Simulation */}
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
              <Server className="w-3.5 h-3.5" /> Space Geodesy Stream
            </div>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed">
              Generate real-time geodetic stream packets directly from the GPS receiver. This adds continuous dual-frequency coordinate micro-fluctuations.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSimulateEpoch}
              disabled={isSimulating}
              className="flex-grow py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
              id="epoch-sim-button"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "Receiving Ephemeris..." : "Simulate Live GPS Epoch"}
            </button>
            {(liveJitter.north !== 0 || liveJitter.east !== 0) && (
              <button
                onClick={handleResetJitter}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer border-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Future Tectonic Shift Projections */}
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> future shift projections
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-center text-slate-700 dark:text-slate-300">
            {projections.slice(1).map((proj, idx) => (
              <div key={idx} className="bg-white/50 dark:bg-slate-950/40 border border-slate-150/70 dark:border-white/5 p-2 rounded-xl">
                <span className="text-[8px] font-mono font-bold text-slate-450 uppercase block">In {proj.years} Years</span>
                <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-white block mt-0.5">
                  +{proj.total} mm
                </span>
                <span className="text-[7.5px] text-slate-400 block mt-0.5 font-mono">
                  {proj.north}N, {proj.east}E
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
