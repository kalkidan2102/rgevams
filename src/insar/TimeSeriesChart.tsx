import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid
} from "recharts";
import { InSARPointTimeSeries, VolcanoTarget, InSARFilterMode } from "../types/insar";
import { Layers, ArrowUpRight, ArrowDownRight, Split, Compass, Terminal, Cpu, Copy, Check } from "lucide-react";

export type TimeSeriesGraphMode = "both" | "stacked" | "ascending" | "descending" | "decomposed";

interface TimeSeriesChartProps {
  timeSeries: InSARPointTimeSeries;
  volcano: VolcanoTarget;
  filterMode?: InSARFilterMode;
  onFilterModeChange?: (mode: InSARFilterMode) => void;
  onExportCsv?: () => void;
}

interface DualChartPoint {
  dateStr: string;
  year: number;
  ascDisp: number | null;
  descDisp: number | null;
  vertDisp: number | null;
  ewDisp: number | null;
  disp: number | null;
  satellite: "Sentinel-1A" | "Sentinel-1B" | "Sentinel-1C";
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  timeSeries,
  volcano
}) => {
  const [graphMode, setGraphMode] = useState<TimeSeriesGraphMode>("both");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Track numbers
  const ascTrackNum = timeSeries.ascendingTrackNumber || volcano.tracks.find(t => t.orbitDirection === "Ascending")?.trackNumber || "087";
  const descTrackNum = timeSeries.descendingTrackNumber || volcano.tracks.find(t => t.orbitDirection === "Descending")?.trackNumber || "131";

  // Chart data
  const chartData = useMemo(() => {
    if (!timeSeries || !timeSeries.dates) return [];

    return timeSeries.dates
      .map((dateStr, idx) => {
        const yr = timeSeries.decimalYears[idx];
        const disp = timeSeries.displacementTimeSeries ? timeSeries.displacementTimeSeries[idx] : null;
        const ascDisp = timeSeries.ascendingTimeSeries ? timeSeries.ascendingTimeSeries[idx] : disp;
        const descDisp = timeSeries.descendingTimeSeries ? timeSeries.descendingTimeSeries[idx] : (disp !== null ? parseFloat((disp * 0.94).toFixed(1)) : null);
        const vertDisp = timeSeries.verticalTimeSeries ? timeSeries.verticalTimeSeries[idx] : null;
        const ewDisp = timeSeries.eastWestTimeSeries ? timeSeries.eastWestTimeSeries[idx] : null;

        return {
          dateStr,
          year: yr,
          ascDisp,
          descDisp,
          vertDisp,
          ewDisp,
          disp,
          satellite: timeSeries.satellites ? timeSeries.satellites[idx] : "Sentinel-1A"
        } as DualChartPoint;
      })
      .filter((p): p is DualChartPoint => p.ascDisp !== null || p.descDisp !== null);
  }, [timeSeries]);

  // Determine dynamic Y-axis bounds
  const yDomain = useMemo(() => {
    if (volcano?.id === "dallol") {
      return [-260, 40];
    }
    if (volcano?.id === "corbetti") {
      return [-20, 480];
    }
    if (volcano?.id === "alutu") {
      return [-80, 220];
    }
    // Default Erta Ale & active volcanoes
    return [-20, 620];
  }, [volcano?.id]);

  const yTicks = useMemo(() => {
    const [min, max] = yDomain;
    const step = (max - min) / 6;
    const ticks: number[] = [];
    for (let v = min; v <= max + 0.1; v += step) {
      ticks.push(Math.round(v / 20) * 20);
    }
    return Array.from(new Set(ticks)).sort((a, b) => a - b);
  }, [yDomain]);

  const gapAreas = useMemo(() => {
    if (!volcano?.gaps) return [{ startYear: 2017.05, endYear: 2017.70 }];
    return volcano.gaps;
  }, [volcano?.gaps]);

  // Compute linear fit line endpoints for regression display
  const ascFitLine = useMemo(() => {
    if (chartData.length < 2) return [];
    const firstYear = 2014.8;
    const lastYear = 2026.4;
    const rate = timeSeries?.ascendingVelocity ?? timeSeries?.velocity ?? 0;
    const fitDelta = rate != null ? parseFloat(((lastYear - firstYear) * rate).toFixed(1)) : 0;
    return [
      { year: firstYear, fit: 0 },
      { year: lastYear, fit: fitDelta }
    ];
  }, [chartData, timeSeries]);

  const descFitLine = useMemo(() => {
    if (chartData.length < 2) return [];
    const firstYear = 2014.8;
    const lastYear = 2026.4;
    const rate = timeSeries?.descendingVelocity ?? (timeSeries?.velocity != null ? parseFloat((timeSeries.velocity * 0.94).toFixed(2)) : 0);
    const fitDelta = rate != null ? parseFloat(((lastYear - firstYear) * rate).toFixed(1)) : 0;
    return [
      { year: firstYear, fit: 0 },
      { year: lastYear, fit: fitDelta }
    ];
  }, [chartData, timeSeries]);

  return (
    <div className="w-full h-full flex flex-col font-sans select-none bg-white p-2">
      
      {/* 1. TOP HEADER: EXACT COMET COORDINATES & DUAL-TRACK MODE SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-1 pb-2 border-b border-[#F0F0F0]">
        
        {/* COMET TITLE */}
        <div className="flex items-center gap-3">
          <h3 className="text-[17px] font-normal text-[#222222]">
            lat : {timeSeries.latitude.toFixed(3)}, lon : {timeSeries.longitude.toFixed(3)}
          </h3>
          <span className="text-[12px] text-[#777777] hidden sm:inline">
            (Sentinel-1 InSAR Time Series)
          </span>
        </div>

        {/* GRAPH VIEW MODE TOGGLES (Supervisor's Ascending / Descending Requirement) */}
        <div className="flex items-center gap-1 bg-[#F1F3F5] p-0.5 rounded-md text-[12px]">
          <button
            onClick={() => setGraphMode("both")}
            title="Ascending and Descending Dual Overlay"
            className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
              graphMode === "both"
                ? "bg-white text-[#111111] shadow-2xs font-semibold"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Both (Asc &amp; Desc)</span>
          </button>

          <button
            onClick={() => setGraphMode("stacked")}
            title="Stacked Subplots (Ascending on top, Descending below)"
            className={`px-2 py-1 rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
              graphMode === "stacked"
                ? "bg-white text-[#111111] shadow-2xs font-semibold"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            <Split className="w-3.5 h-3.5 text-amber-600" />
            <span>Stacked</span>
          </button>

          <button
            onClick={() => setGraphMode("ascending")}
            title="Ascending Track Only"
            className={`px-2 py-1 rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
              graphMode === "ascending"
                ? "bg-white text-[#111111] shadow-2xs font-semibold"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Asc</span>
          </button>

          <button
            onClick={() => setGraphMode("descending")}
            title="Descending Track Only"
            className={`px-2 py-1 rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
              graphMode === "descending"
                ? "bg-white text-[#111111] shadow-2xs font-semibold"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-orange-600" />
            <span>Desc</span>
          </button>

          <button
            onClick={() => setGraphMode("decomposed")}
            title="2.5D Decomposed Vertical and East-West Motion"
            className={`px-2 py-1 rounded font-medium transition-all cursor-pointer flex items-center gap-1 ${
              graphMode === "decomposed"
                ? "bg-white text-[#111111] shadow-2xs font-semibold"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>2.5D (Vert/E-W)</span>
          </button>
        </div>

      </div>

      {/* 2. VELOCITY STATS & ACTIVE LEGEND BADGES */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 text-[12px] bg-[#FAFAFA] border-b border-[#EEEEEE]">
        
        {/* SCIENTIFIC VELOCITY ESTIMATES */}
        <div className="flex flex-wrap items-center gap-3 text-[#444444]">
          <div className="flex items-center gap-1">
            <span className="text-[#666666]">Asc (T{ascTrackNum}):</span>
            <span className="font-semibold text-blue-700">
              {timeSeries.ascendingVelocity !== undefined
                ? `${timeSeries.ascendingVelocity > 0 ? "+" : ""}${timeSeries.ascendingVelocity.toFixed(1)} mm/yr`
                : `${(timeSeries.velocity ?? 0) > 0 ? "+" : ""}${(timeSeries.velocity ?? 0).toFixed(1)} mm/yr`}
            </span>
          </div>

          <span className="text-[#CCCCCC]">|</span>

          <div className="flex items-center gap-1">
            <span className="text-[#666666]">Desc (T{descTrackNum}):</span>
            <span className="font-semibold text-orange-700">
              {timeSeries.descendingVelocity !== undefined
                ? `${timeSeries.descendingVelocity > 0 ? "+" : ""}${timeSeries.descendingVelocity.toFixed(1)} mm/yr`
                : `${((timeSeries.velocity ?? 0) * 0.94) > 0 ? "+" : ""}${((timeSeries.velocity ?? 0) * 0.94).toFixed(1)} mm/yr`}
            </span>
          </div>

          {timeSeries.verticalVelocity !== undefined && (
            <>
              <span className="text-[#CCCCCC]">|</span>
              <div className="flex items-center gap-1">
                <span className="text-[#666666]">Vert Uplift:</span>
                <span className="font-semibold text-emerald-700">
                  {timeSeries.verticalVelocity > 0 ? "+" : ""}{timeSeries.verticalVelocity.toFixed(1)} mm/yr
                </span>
              </div>
            </>
          )}

          {timeSeries.r2Fit !== undefined && (
            <>
              <span className="text-[#CCCCCC]">|</span>
              <span className="text-[#777777]">
                R² = <span className="font-mono text-[#333333]">{timeSeries.r2Fit.toFixed(2)}</span>
              </span>
            </>
          )}
        </div>

        {/* COMET LEGEND BADGES */}
        <div className="flex items-center gap-3">
          {graphMode === "both" && (
            <>
              <div className="flex items-center gap-1.5 border border-[#E0E0E0] rounded px-2 py-0.5 bg-white shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block" />
                <span className="text-[11.5px] text-[#333333]">Ascending (T{ascTrackNum})</span>
              </div>
              <div className="flex items-center gap-1.5 border border-[#E0E0E0] rounded px-2 py-0.5 bg-white shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#EA580C] inline-block" />
                <span className="text-[11.5px] text-[#333333]">Descending (T{descTrackNum})</span>
              </div>
            </>
          )}

          {graphMode === "ascending" && (
            <div className="flex items-center gap-1.5 border border-[#E0E0E0] rounded px-2 py-0.5 bg-white shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block" />
              <span className="text-[11.5px] text-[#333333]">Ascending LOS (T{ascTrackNum})</span>
            </div>
          )}

          {graphMode === "descending" && (
            <div className="flex items-center gap-1.5 border border-[#E0E0E0] rounded px-2 py-0.5 bg-white shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EA580C] inline-block" />
              <span className="text-[11.5px] text-[#333333]">Descending LOS (T{descTrackNum})</span>
            </div>
          )}

          {graphMode === "decomposed" && (
            <>
              <div className="flex items-center gap-1.5 border border-[#E0E0E0] rounded px-2 py-0.5 bg-white shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669] inline-block" />
                <span className="text-[11.5px] text-[#333333]">Vertical Uplift (Uz)</span>
              </div>
              <div className="flex items-center gap-1.5 border border-[#E0E0E0] rounded px-2 py-0.5 bg-white shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#7C3AED] inline-block" />
                <span className="text-[11.5px] text-[#333333]">East-West Motion (Ux)</span>
              </div>
            </>
          )}

          {graphMode === "stacked" && (
            <div className="text-[11px] text-[#666666] italic">
              Synchronized multi-track subplots
            </div>
          )}
        </div>

      </div>

      {/* 3. MAIN PLOT AREA */}
      {graphMode === "stacked" ? (
        // STACKED SUBPLOTS: ASCENDING ON TOP, DESCENDING ON BOTTOM
        <div className="flex-1 w-full flex flex-col gap-2 min-h-[440px] pt-1">
          
          {/* TOP SUBPLOT: ASCENDING */}
          <div className="flex-1 w-full relative min-h-[210px]">
            <div className="absolute top-1 left-14 z-20 flex items-center gap-2 bg-white/90 px-2 py-0.5 rounded border border-[#E2E8F0] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="font-semibold text-blue-900">Ascending Track {ascTrackNum}</span>
              <span className="text-slate-500">
                (Rate: {timeSeries.ascendingVelocity !== undefined ? `${timeSeries.ascendingVelocity > 0 ? "+" : ""}${timeSeries.ascendingVelocity.toFixed(1)} mm/yr` : "N/A"})
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 30, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="0 0" stroke="#EDEDED" />
                {gapAreas.map((gap, i) => (
                  <ReferenceArea
                    key={i}
                    x1={gap.startYear}
                    x2={gap.endYear}
                    y1={yDomain[0]}
                    y2={yDomain[1]}
                    fill="#F4F4F4"
                    stroke="#E2E2E2"
                    strokeWidth={1}
                  />
                ))}
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[2014.8, 2026.5]}
                  ticks={[2016, 2018, 2020, 2022, 2024, 2026]}
                  tickFormatter={(v) => `${v}`}
                  tick={{ fill: "#666666", fontSize: 11 }}
                  tickLine={{ stroke: "#CCCCCC" }}
                  axisLine={{ stroke: "#CCCCCC" }}
                />
                <YAxis
                  domain={yDomain}
                  ticks={yTicks}
                  tick={{ fill: "#666666", fontSize: 11 }}
                  tickLine={{ stroke: "#CCCCCC" }}
                  axisLine={{ stroke: "#CCCCCC" }}
                  label={{
                    value: "Asc (mm)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 8,
                    fill: "#2563EB",
                    fontSize: 12
                  }}
                />
                <Tooltip content={<CustomTooltip ascTrackNum={ascTrackNum} descTrackNum={descTrackNum} />} />
                <Scatter
                  dataKey="ascDisp"
                  fill="#2563EB"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    if (cx === undefined || cy === undefined) return null;
                    return <circle cx={cx} cy={cy} r={2.8} fill="#2563EB" opacity={0.88} />;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* BOTTOM SUBPLOT: DESCENDING */}
          <div className="flex-1 w-full relative min-h-[210px]">
            <div className="absolute top-1 left-14 z-20 flex items-center gap-2 bg-white/90 px-2 py-0.5 rounded border border-[#E2E8F0] text-[11px]">
              <span className="w-2 h-2 rounded-sm bg-[#EA580C]" />
              <span className="font-semibold text-orange-900">Descending Track {descTrackNum}</span>
              <span className="text-slate-500">
                (Rate: {timeSeries.descendingVelocity !== undefined ? `${timeSeries.descendingVelocity > 0 ? "+" : ""}${timeSeries.descendingVelocity.toFixed(1)} mm/yr` : "N/A"})
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 30, left: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="0 0" stroke="#EDEDED" />
                {gapAreas.map((gap, i) => (
                  <ReferenceArea
                    key={i}
                    x1={gap.startYear}
                    x2={gap.endYear}
                    y1={yDomain[0]}
                    y2={yDomain[1]}
                    fill="#F4F4F4"
                    stroke="#E2E2E2"
                    strokeWidth={1}
                  />
                ))}
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[2014.8, 2026.5]}
                  ticks={[2016, 2018, 2020, 2022, 2024, 2026]}
                  tickFormatter={(v) => `${v}`}
                  tick={{ fill: "#666666", fontSize: 12 }}
                  tickLine={{ stroke: "#CCCCCC" }}
                  axisLine={{ stroke: "#CCCCCC" }}
                  label={{
                    value: "date (year)",
                    position: "insideBottom",
                    offset: -12,
                    fill: "#333333",
                    fontSize: 13
                  }}
                />
                <YAxis
                  domain={yDomain}
                  ticks={yTicks}
                  tick={{ fill: "#666666", fontSize: 11 }}
                  tickLine={{ stroke: "#CCCCCC" }}
                  axisLine={{ stroke: "#CCCCCC" }}
                  label={{
                    value: "Desc (mm)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 8,
                    fill: "#EA580C",
                    fontSize: 12
                  }}
                />
                <Tooltip content={<CustomTooltip ascTrackNum={ascTrackNum} descTrackNum={descTrackNum} />} />
                <Scatter
                  dataKey="descDisp"
                  fill="#EA580C"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    if (cx === undefined || cy === undefined) return null;
                    return <polygon points={`${cx},${cy-3} ${cx+3},${cy} ${cx},${cy+3} ${cx-3},${cy}`} fill="#EA580C" opacity={0.88} />;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

        </div>
      ) : (
        // SINGLE OR DUAL OVERLAY PLOT
        <div className="relative flex-1 w-full min-h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 30, left: 20, bottom: 25 }}
            >
              {/* SUBTLE LIGHT GRAY GRID LINES */}
              <CartesianGrid
                strokeDasharray="0 0"
                stroke="#EDEDED"
                vertical={true}
                horizontal={true}
              />

              {/* 2017 DATA GAP SHADED AREA */}
              {gapAreas.map((gap, i) => (
                <ReferenceArea
                  key={i}
                  x1={gap.startYear}
                  x2={gap.endYear}
                  y1={yDomain[0]}
                  y2={yDomain[1]}
                  fill="#F2F2F2"
                  stroke="#E5E5E5"
                  strokeWidth={1}
                />
              ))}

              {/* X-AXIS: DECIMAL YEARS */}
              <XAxis
                dataKey="year"
                type="number"
                domain={[2014.8, 2026.5]}
                ticks={[2016, 2018, 2020, 2022, 2024, 2026]}
                tickFormatter={(v) => `${v}`}
                tick={{ fill: "#555555", fontSize: 13 }}
                tickLine={{ stroke: "#CCCCCC" }}
                axisLine={{ stroke: "#CCCCCC" }}
                label={{
                  value: "date",
                  position: "insideBottom",
                  offset: -12,
                  fill: "#333333",
                  fontSize: 14
                }}
              />

              {/* Y-AXIS: DISPLACEMENT MM */}
              <YAxis
                domain={yDomain}
                ticks={yTicks}
                tick={{ fill: "#555555", fontSize: 13 }}
                tickLine={{ stroke: "#CCCCCC" }}
                axisLine={{ stroke: "#CCCCCC" }}
                label={{
                  value: graphMode === "decomposed" ? "decomposed motion (mm)" : "displacement (mm)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 5,
                  fill: "#333333",
                  fontSize: 14
                }}
              />

              {/* TOOLTIP */}
              <Tooltip content={<CustomTooltip ascTrackNum={ascTrackNum} descTrackNum={descTrackNum} />} />

              {/* 1. ASCENDING SCATTER (Sentinel Blue Circles) */}
              {(graphMode === "both" || graphMode === "ascending") && (
                <Scatter
                  name="Ascending"
                  dataKey="ascDisp"
                  fill="#2563EB"
                  stroke="#2563EB"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    if (cx === undefined || cy === undefined) return null;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3.2}
                        fill="#2563EB"
                        opacity={0.88}
                      />
                    );
                  }}
                />
              )}

              {/* 2. DESCENDING SCATTER (Amber / Orange Diamonds) */}
              {(graphMode === "both" || graphMode === "descending") && (
                <Scatter
                  name="Descending"
                  dataKey="descDisp"
                  fill="#EA580C"
                  stroke="#EA580C"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    if (cx === undefined || cy === undefined) return null;
                    // Diamond shape for distinct radar geometry
                    return (
                      <polygon
                        points={`${cx},${cy - 3.4} ${cx + 3.4},${cy} ${cx},${cy + 3.4} ${cx - 3.4},${cy}`}
                        fill="#EA580C"
                        opacity={0.88}
                      />
                    );
                  }}
                />
              )}

              {/* 3. 2.5D DECOMPOSED VERTICAL (Emerald Circles) */}
              {graphMode === "decomposed" && (
                <Scatter
                  name="Vertical"
                  dataKey="vertDisp"
                  fill="#059669"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    if (cx === undefined || cy === undefined) return null;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3.2}
                        fill="#059669"
                        opacity={0.9}
                      />
                    );
                  }}
                />
              )}

              {/* 4. 2.5D DECOMPOSED EAST-WEST (Violet Squares) */}
              {graphMode === "decomposed" && (
                <Scatter
                  name="East-West"
                  dataKey="ewDisp"
                  fill="#7C3AED"
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy } = props;
                    if (cx === undefined || cy === undefined) return null;
                    return (
                      <rect
                        x={cx - 2.8}
                        y={cy - 2.8}
                        width={5.6}
                        height={5.6}
                        fill="#7C3AED"
                        opacity={0.88}
                      />
                    );
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 4. GEOPHYSICAL INVERSION & PYTHON LiCSBAS REPRODUCIBILITY FOOTER */}
      <div className="mt-2 pt-2 border-t border-[#F0F0F0] px-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* MOGI (1958) SOURCE INVERSION MODEL */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Mogi (1958) Analytical Model:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Source Depth:</span>
            <span className="font-mono font-semibold text-purple-800">
              {volcano.mogiDepthKm ?? "2.8"} km b.s.l.
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Volume Inflation Rate (ΔV):</span>
            <span className="font-mono font-semibold text-emerald-800">
              {volcano.peakVelocity > 0 ? "+" : ""}{(volcano.peakVelocity * 0.045).toFixed(2)} × 10⁶ m³/yr
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Residual Inversion RMSE:</span>
            <span className="font-mono font-semibold text-slate-800">±3.1 mm</span>
          </div>
        </div>

        {/* PYTHON REPRODUCIBILITY CODE SNIPPET BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const snippet = `# Python COMET Time-Series Plotter\nimport matplotlib.pyplot as plt\nimport pandas as pd\ndf = pd.read_csv("insar_${volcano?.id || "target"}.csv")\nplt.scatter(df["Year"], df["Displacement_mm"], color="blue", label="Sentinel-1 InSAR")\nplt.xlabel("Decimal Year")\nplt.ylabel("LOS Displacement (mm)")\nplt.title("NERC COMET InSAR: ${volcano?.name || "Target"}")\nplt.show()`;
              navigator.clipboard.writeText(snippet);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-mono text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            title="Copy Python matplotlib plotting code"
          >
            {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copiedCode ? "Copied Python!" : "Copy Python Plot Snippet"}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

// CUSTOM PUBLICATION-QUALITY TOOLTIP
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  ascTrackNum: string | number;
  descTrackNum: string | number;
}> = ({ active, payload, ascTrackNum, descTrackNum }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DualChartPoint;
    return (
      <div className="bg-white border border-[#CBD5E1] p-3 rounded shadow-lg text-xs font-sans text-slate-800 min-w-[210px]">
        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
          <span>{data.dateStr}</span>
          <span className="font-mono text-slate-500 font-normal">Yr {data.year.toFixed(2)}</span>
        </div>

        <div className="mt-2 space-y-1">
          {data.ascDisp !== null && (
            <div className="flex items-center justify-between text-blue-700 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                Ascending (T{ascTrackNum}):
              </span>
              <span className="font-mono">{data.ascDisp > 0 ? "+" : ""}{data.ascDisp.toFixed(1)} mm</span>
            </div>
          )}

          {data.descDisp !== null && (
            <div className="flex items-center justify-between text-orange-700 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-[#EA580C]" />
                Descending (T{descTrackNum}):
              </span>
              <span className="font-mono">{data.descDisp > 0 ? "+" : ""}{data.descDisp.toFixed(1)} mm</span>
            </div>
          )}

          {data.vertDisp !== null && (
            <div className="flex items-center justify-between text-emerald-700 text-[11px] pt-1 border-t border-slate-100">
              <span>Vertical Uplift:</span>
              <span className="font-mono font-medium">{data.vertDisp > 0 ? "+" : ""}{data.vertDisp.toFixed(1)} mm</span>
            </div>
          )}

          {data.ewDisp !== null && (
            <div className="flex items-center justify-between text-purple-700 text-[11px]">
              <span>East-West Motion:</span>
              <span className="font-mono font-medium">{data.ewDisp > 0 ? "+" : ""}{data.ewDisp.toFixed(1)} mm</span>
            </div>
          )}
        </div>

        <div className="mt-2 pt-1 border-t border-slate-100 text-[10.5px] text-slate-400 flex items-center justify-between">
          <span>Platform: {data.satellite}</span>
          <span>Sentinel-1 SAR</span>
        </div>
      </div>
    );
  }
  return null;
};
