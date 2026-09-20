import { Volcano, Earthquake, GnssStation } from "../../types";
import { ETHIOPIA_GNSS_STATIONS } from "../../data/earthquakes";

interface GeologyChartsProps {
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
}

export default function GeologyChart({ volcanoes, earthquakes }: GeologyChartsProps) {
  // 1. Calculate Volcano Severity Counts
  const volCounts = { Red: 0, Orange: 0, Yellow: 0, Green: 0 };
  volcanoes.forEach((v) => {
    if (v.severity in volCounts) {
      volCounts[v.severity as keyof typeof volCounts]++;
    }
  });

  const totalVolcanoes = volcanoes.length || 1;
  const volShares = {
    Red: (volCounts.Red / totalVolcanoes) * 100,
    Orange: (volCounts.Orange / totalVolcanoes) * 100,
    Yellow: (volCounts.Yellow / totalVolcanoes) * 100,
    Green: (volCounts.Green / totalVolcanoes) * 100,
  };

  // 2. Bin Earthquakes by Magnitude
  const eqBins = {
    "2.0 - 3.9 (Minor)": 0,
    "4.0 - 4.9 (Light)": 0,
    "5.0 - 5.5 (Moderate)": 0,
    "5.6+ (Major-Critical)": 0,
  };

  earthquakes.forEach((eq) => {
    const mag = eq.magnitude;
    if (mag >= 5.6) eqBins["5.6+ (Major-Critical)"]++;
    else if (mag >= 5.0) eqBins["5.0 - 5.5 (Moderate)"]++;
    else if (mag >= 4.0) eqBins["4.0 - 4.9 (Light)"]++;
    else eqBins["2.0 - 3.9 (Minor)"]++;
  });

  const binKeys = Object.keys(eqBins) as Array<keyof typeof eqBins>;
  const maxBinVal = Math.max(...Object.values(eqBins), 1);

  // 3. Depth Breakdown
  const avgDepth = earthquakes.length
    ? earthquakes.reduce((sum, eq) => sum + eq.depth, 0) / earthquakes.length
    : 10;
  const shallowCount = earthquakes.filter((e) => e.depth <= 10).length;
  const deepCount = earthquakes.filter((e) => e.depth > 10).length;

  return (
    <div id="geology_charts_dashboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
      
      {/* 1. Volcanic Threat Severity Advisory Wheel */}
      <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-5 rounded-2xl shadow-xs flex flex-col justify-between transition-all text-slate-800 dark:text-slate-100">
        <div>
          <h3 className="font-extrabold text-slate-850 dark:text-white text-xs tracking-widest uppercase border-b border-slate-100 dark:border-white/5 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#0085C8] to-[#00D4FF] rounded-full inline-block animate-pulse"></span>
              <span className="font-display uppercase tracking-wider text-slate-800 dark:text-white text-[11px]">Volcanic Threat Index</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold">Count: {volcanoes.length}</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 font-sans leading-relaxed">Proportion of Ethiopian calderas and hydrothermal fields partitioned by official alert status indicators.</p>
        </div>

        <div className="flex items-center gap-6 justify-center">
          {/* Custom SVG Donut Chart */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.8" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="4.4" />
              
              {/* Red segment (Critical) */}
              <circle
                cx="18"
                cy="18"
                r="15.8"
                fill="transparent"
                stroke="#e11d48"
                strokeWidth="4.5"
                strokeDasharray={`${volShares.Red} 100`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              
              {/* Orange segment */}
              <circle
                cx="18"
                cy="18"
                r="15.8"
                fill="transparent"
                stroke="#f97316"
                strokeWidth="4.5"
                strokeDasharray={`${volShares.Orange} 100`}
                strokeDashoffset={`-${volShares.Red}`}
                strokeLinecap="round"
              />

              {/* Yellow segment */}
              <circle
                cx="18"
                cy="18"
                r="15.8"
                fill="transparent"
                stroke="#eab308"
                strokeWidth="4.5"
                strokeDasharray={`${volShares.Yellow} 100`}
                strokeDashoffset={`-${volShares.Red + volShares.Orange}`}
                strokeLinecap="round"
              />

              {/* Green segment */}
              <circle
                cx="18"
                cy="18"
                r="15.8"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="4.5"
                strokeDasharray={`${volShares.Green} 100`}
                strokeDashoffset={`-${volShares.Red + volShares.Orange + volShares.Yellow}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-850 dark:text-white font-sans tracking-tight">
                {volCounts.Red + volCounts.Orange}
              </span>
              <span className="text-[10px] uppercase text-slate-400 font-mono font-bold tracking-wider leading-none">
                Risk Vents
              </span>
            </div>
          </div>

          {/* Right Labels */}
          <div className="flex flex-col gap-2 font-sans font-medium text-xs text-slate-600 dark:text-slate-400 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
                <span>Critical:</span>
              </div>
              <span className="font-mono font-bold text-rose-600">{volCounts.Red}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-orange-500"></span>
                <span>Elevated:</span>
              </div>
              <span className="font-mono font-bold text-orange-600">{volCounts.Orange}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500"></span>
                <span>Advisory:</span>
              </div>
              <span className="font-mono font-bold text-yellow-600">{volCounts.Yellow}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Normal:</span>
              </div>
              <span className="font-mono font-bold text-emerald-600">{volCounts.Green}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seismic Magnitude Distribution Histogram */}
      <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-5 rounded-2xl shadow-xs flex flex-col justify-between col-span-1 md:col-span-1 lg:col-span-2 transition-all text-slate-800 dark:text-slate-100">
        <div>
          <h3 className="font-extrabold text-slate-850 dark:text-white text-xs tracking-widest uppercase border-b border-slate-100 dark:border-white/5 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#0085C8] to-[#00D4FF] rounded-full inline-block animate-pulse"></span>
              <span className="font-display uppercase tracking-wider text-slate-800 dark:text-white text-[11px]">Tremor Magnitude Clusters</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold">Dataset size: {earthquakes.length}</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 font-sans leading-relaxed">Historical records combined with real-time telemetry from USGS sorted into standard seismic classification groups.</p>
        </div>

        {/* Custom SVG Bar Graph */}
        <div className="w-full flex-grow flex flex-col gap-4">
          <div className="space-y-3.5 pr-2">
            {binKeys.map((key) => {
              const val = eqBins[key];
              const percent = (val / maxBinVal) * 100;
              
              let barColor = "bg-[#0085C8]";
              if (key.includes("Major")) barColor = "bg-gradient-to-r from-red-600 to-rose-500";
              else if (key.includes("Moderate")) barColor = "bg-gradient-to-r from-[#CA933C] to-[#CA933C]/80";
              else if (key.includes("Light")) barColor = "bg-gradient-to-r from-[#0085C8] to-[#0085C8]/60";
              else barColor = "bg-gradient-to-r from-[#00D4FF] to-[#0085C8]";

              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 font-sans text-xs">
                  <div className="font-semibold text-slate-600 dark:text-slate-450 w-full sm:w-40 flex-shrink-0 text-left">
                    {key}
                  </div>
                  
                  <div className="flex-grow bg-slate-50 dark:bg-slate-900/40 h-6 rounded overflow-hidden flex items-center relative border border-slate-200 dark:border-white/5">
                    <div
                      className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.max(4, percent)}%` }}
                    />
                    <span className="absolute right-3.5 font-bold font-mono text-slate-700 dark:text-slate-305 text-[11px]">
                      {val} events
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
            <span>Focal Parameter: Richter Magnitude</span>
            <span>Scale Limit: {maxBinVal} events</span>
          </div>
        </div>
      </div>

      {/* 3. Focal Depth & Geohazard Metrics Card */}
      <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-5 rounded-2xl shadow-xs flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-3 transition-all text-slate-800 dark:text-slate-100">
        <h3 className="font-extrabold text-slate-850 dark:text-white text-xs tracking-widest uppercase border-b border-slate-100 dark:border-white/5 pb-3 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#0085C8] to-[#00D4FF] rounded-full inline-block animate-pulse"></span>
          <span className="font-display uppercase tracking-wider text-slate-800 dark:text-white text-[11px]">Core Tectonic Geohazard Metrics</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Average Focal Depth */}
          <div className="bg-white/30 dark:bg-slate-900/20 border border-white/20 dark:border-white/5 backdrop-blur-md rounded-xl p-4.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Average Focal Depth</span>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 font-mono tracking-tight">
              {avgDepth.toFixed(1)} <span className="text-sm font-sans font-medium text-slate-500">km</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Shallow earthquakes (0-15km) release maximum seismic strain on infrastructure.</p>
          </div>
   
          {/* Shallow Crustal Seismicity */}
          <div className="bg-white/30 dark:bg-slate-900/20 border border-white/20 dark:border-white/5 backdrop-blur-md rounded-xl p-4.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Very Shallow (&le;10km)</span>
            <div className="text-2xl font-extrabold text-[#CA933C] mt-1 font-mono tracking-tight">
              {shallowCount} <span className="text-xs font-sans font-medium text-slate-500">/ {earthquakes.length}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Highly critical. Common along Rift Valley caldera ring fault complexes.</p>
          </div>
   
          {/* Deep Tectonic Strain */}
          <div className="bg-white/30 dark:bg-slate-900/20 border border-white/20 dark:border-white/5 backdrop-blur-md rounded-xl p-4.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Deep Crustal (&gt;10km)</span>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-500 mt-1 font-mono tracking-tight">
              {deepCount} <span className="text-xs font-sans font-medium text-slate-500">events</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Indicates deep-seated magma chamber dyke widening and plate stress.</p>
          </div>
   
          {/* Max Magnitude in DB */}
          <div className="bg-white/30 dark:bg-slate-900/20 border border-white/20 dark:border-white/5 backdrop-blur-md rounded-xl p-4.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Maximum Amplitude</span>
            <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono tracking-tight">
              M {earthquakes.length ? Math.max(...earthquakes.map(e => e.magnitude)).toFixed(1) : "0.0"}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Maximum energy release captured in our combined active database.</p>
          </div>
        </div>
      </div>

      {/* 4. Continuous GNSS Space Geodesy Baseline Drift Vectors */}
      <div className="bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-5 rounded-2xl shadow-xs flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-3 transition-all text-slate-800 dark:text-slate-100">
        <div>
          <h3 className="font-extrabold text-slate-850 dark:text-white text-xs tracking-widest uppercase border-b border-slate-100 dark:border-white/5 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#0085C8] to-[#00D4FF] rounded-full inline-block animate-pulse"></span>
              <span className="font-display uppercase tracking-wider text-slate-800 dark:text-white text-[11px]">GNSS reference Network plate motion fields</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold">Active Beacons: {ETHIOPIA_GNSS_STATIONS.length} Stations</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 font-sans leading-relaxed">
            Continuous geodetic data recorded by ESSGI's dual-frequency GNSS network, showing tectonic drift velocities relative to the stable Nubian Plate (IGS14 reference frame).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
          {/* Scrollable Table List */}
          <div className="lg:col-span-8 max-h-[260px] overflow-y-auto overflow-x-auto w-full border border-slate-200/80 dark:border-white/10 rounded-xl shadow-inner scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <table className="w-full text-xs text-left border-collapse relative">
              <thead className="bg-slate-100/95 dark:bg-slate-900/95 font-mono text-[9px] text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-3">Station Code</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-right">Vel. North (mm/yr)</th>
                  <th className="p-3 text-right">Vel. East (mm/yr)</th>
                  <th className="p-3 text-right">Vel. Up (mm/yr)</th>
                  <th className="p-3 text-right">Drift Magnitude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150/50 dark:divide-white/5 font-sans">
                {ETHIOPIA_GNSS_STATIONS.map((st) => {
                  const magnitude = Math.sqrt(st.velocityNorth ** 2 + st.velocityEast ** 2).toFixed(2);
                  return (
                    <tr key={st.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300">
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                        {st.id.replace("gnss_", "").toUpperCase()}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{st.location}</td>
                      <td className="p-3 text-right font-mono font-semibold">+{st.velocityNorth.toFixed(1)}</td>
                      <td className="p-3 text-right font-mono font-semibold">+{st.velocityEast.toFixed(1)}</td>
                      <td className={`p-3 text-right font-mono font-bold ${st.velocityUp >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {st.velocityUp >= 0 ? "+" : ""}{st.velocityUp.toFixed(1)}
                      </td>
                      <td className="p-3 text-right font-mono text-cyan-600 dark:text-cyan-400 font-black">{magnitude} mm/yr</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Graphical Vector plot representation */}
          <div className="lg:col-span-4 bg-white/30 dark:bg-slate-900/20 border border-white/20 dark:border-white/5 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-mono font-black text-[#00D4FF] mb-2 block tracking-wider">
              Network Velocity Fields
            </span>
            
            {/* SVG Vector Field Grid */}
            <div className="relative w-40 h-40 bg-white/40 dark:bg-slate-900/40 border border-white/30 dark:border-white/5 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.8" strokeDasharray="2,2" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.8" strokeDasharray="2,2" />
                
                <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="0.8" />
                
                <text x="50" y="12" fill="rgba(148, 163, 184, 0.6)" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
                <text x="50" y="93" fill="rgba(148, 163, 184, 0.6)" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace">S</text>
                <text x="91" y="52" fill="rgba(148, 163, 184, 0.6)" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace">E</text>
                <text x="9" y="52" fill="rgba(148, 163, 184, 0.6)" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace">W</text>

                {ETHIOPIA_GNSS_STATIONS.map((st, i) => {
                  const scale = 2.8;
                  const dx = st.velocityEast * scale;
                  const dy = -st.velocityNorth * scale;
                  const targetX = 50 + dx;
                  const targetY = 50 + dy;

                  const colors = ["#0085C8", "#00D4FF", "#CA933C", "#38bdf8", "#818cf8"];
                  const color = colors[i % colors.length];

                  return (
                    <g key={st.id}>
                      <line 
                        x1="50" 
                        y1="50" 
                        x2={targetX} 
                        y2={targetY} 
                        stroke={color} 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                      />
                      <circle cx={targetX} cy={targetY} r="2" fill={color} />
                      <text 
                        x={targetX + (dx >= 0 ? 3 : -3)} 
                        y={targetY + (dy >= 0 ? 3 : -3)} 
                        fill="rgba(148, 163, 184, 0.85)" 
                        fontSize="5.5" 
                        fontWeight="bold" 
                        textAnchor={dx >= 0 ? "start" : "end"}
                        fontFamily="monospace"
                      >
                        {st.id.replace("gnss_", "").toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <p className="text-[9.5px] text-slate-400 dark:text-slate-450 mt-2 font-mono leading-relaxed">
              Drift is directed to the North-East, reflecting Somali & Nubian rift plates rifting.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
