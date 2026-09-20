import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid
} from "recharts";
import { InSARPointTimeSeries, VolcanoTarget, InSARFilterMode } from "../types/insar";

interface TimeSeriesChartProps {
  timeSeries: InSARPointTimeSeries;
  volcano: VolcanoTarget;
  filterMode?: InSARFilterMode;
  onFilterModeChange?: (mode: InSARFilterMode) => void;
  onExportCsv?: () => void;
}

interface ChartPoint {
  dateStr: string;
  year: number;
  disp: number | null;
  satellite: "Sentinel-1A" | "Sentinel-1B" | "Sentinel-1C";
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  timeSeries,
  volcano
}) => {
  const chartData = useMemo(() => {
    if (!timeSeries || !timeSeries.dates) return [];

    return timeSeries.dates
      .map((dateStr, idx) => {
        const yr = timeSeries.decimalYears[idx];
        const disp = timeSeries.displacementTimeSeries[idx];

        return {
          dateStr,
          year: yr,
          disp,
          satellite: timeSeries.satellites ? timeSeries.satellites[idx] : "Sentinel-1A"
        } as ChartPoint;
      })
      .filter((p): p is ChartPoint => p.disp !== null);
  }, [timeSeries]);

  const gapAreas = useMemo(() => {
    if (!volcano.gaps) return [{ startYear: 2017.05, endYear: 2017.70 }];
    return volcano.gaps;
  }, [volcano]);

  return (
    <div className="w-full h-full flex flex-col font-sans select-none bg-white p-2">
      
      {/* 1. TOP HEADER: EXACT COMET TITLE & LEGEND */}
      <div className="flex items-center justify-between px-6 pt-1 pb-2">
        <h3 className="text-[17px] font-normal text-[#222222]">
          lat : {timeSeries.latitude.toFixed(3)}, lon : {timeSeries.longitude.toFixed(3)}
        </h3>

        {/* COMET LEGEND BADGE (Top Right) */}
        <div className="flex items-center gap-2 border border-[#E0E0E0] rounded px-3 py-1 bg-white shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5066FF] inline-block" />
          <span className="text-[13px] text-[#444444] font-normal">displacement</span>
        </div>
      </div>

      {/* 2. RECHARTS PLOT */}
      <div className="relative flex-1 w-full min-h-[380px]">
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
                y1={-10}
                y2={600}
                fill="#F2F2F2"
                stroke="#E5E5E5"
                strokeWidth={1}
              />
            ))}

            {/* X-AXIS: DECIMAL YEARS (2016, 2018, 2020, 2022, 2024, 2026) */}
            <XAxis
              dataKey="year"
              type="number"
              domain={[2014.8, 2026.5]}
              ticks={[2016, 2018, 2020, 2022, 2024, 2026]}
              tickFormatter={(v: number) => `${v}`}
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

            {/* Y-AXIS: DISPLACEMENT MM (0, 100, 200, 300, 400, 500, 600) */}
            <YAxis
              domain={[-10, 600]}
              ticks={[0, 100, 200, 300, 400, 500, 600]}
              tick={{ fill: "#555555", fontSize: 13 }}
              tickLine={{ stroke: "#CCCCCC" }}
              axisLine={{ stroke: "#CCCCCC" }}
              label={{
                value: "displacement (mm)",
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fill: "#333333",
                fontSize: 14
              }}
            />

            {/* TOOLTIP */}
            <Tooltip
              content={({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartPoint;
                  return (
                    <div className="bg-white border border-slate-300 p-2.5 rounded shadow-lg text-xs font-sans text-slate-800">
                      <div className="font-bold text-slate-900">{data.dateStr} (Yr {data.year.toFixed(2)})</div>
                      <div className="text-[#5066FF] font-semibold mt-1">
                        Displacement: {data.disp !== null ? `${data.disp.toFixed(1)} mm` : "Gap"}
                      </div>
                      <div className="text-[11px] text-slate-500">{data.satellite}</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* EXACT BLUE SCATTER CIRCLES */}
            <Scatter
              dataKey="disp"
              fill="#5066FF"
              stroke="#5066FF"
              isAnimationActive={false}
              shape={(props: any) => {
                const { cx, cy } = props;
                if (cx === undefined || cy === undefined) return null;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3.2}
                    fill="#5066FF"
                    opacity={0.88}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
