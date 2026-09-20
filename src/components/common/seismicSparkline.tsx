import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

interface SeismicSparklineProps {
  magnitude: number;
  dateTime: string;
  eventId?: string;
  height?: number;
  colorScheme?: "rose" | "amber" | "blue" | "auto";
  showLabels?: boolean;
  compact?: boolean;
}

export default function SeismicSparkline({
  magnitude,
  dateTime,
  eventId = "eq-0",
  height = 42,
  colorScheme = "auto",
  showLabels = true,
  compact = false
}: SeismicSparklineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [livePulse, setLivePulse] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<{
    year: number;
    dateStr: string;
    timeStr: string;
    offsetMin: number;
    amplitude: string;
    isPeak: boolean;
  } | null>(null);

  // Determine color theme based on magnitude or explicit prop
  const theme = useMemo(() => {
    if (colorScheme === "rose" || (colorScheme === "auto" && magnitude >= 4.5)) {
      return {
        line: "#F43F5E", // rose-500
        gradientStart: "rgba(244, 63, 94, 0.35)",
        gradientStop: "rgba(244, 63, 94, 0.0)",
        peakDot: "#E11D48",
        liveDot: "#FB7185",
        text: "text-rose-600 dark:text-rose-400"
      };
    } else if (colorScheme === "amber" || (colorScheme === "auto" && magnitude >= 3.5)) {
      return {
        line: "#F59E0B", // amber-500
        gradientStart: "rgba(245, 158, 11, 0.35)",
        gradientStop: "rgba(245, 158, 11, 0.0)",
        peakDot: "#D97706",
        liveDot: "#FBBF24",
        text: "text-amber-600 dark:text-amber-400"
      };
    } else {
      return {
        line: "#0085C8", // essgi blue / cyan
        gradientStart: "rgba(0, 133, 200, 0.35)",
        gradientStop: "rgba(0, 133, 200, 0.0)",
        peakDot: "#0284C7",
        liveDot: "#38BDF8",
        text: "text-[#0085C8] dark:text-cyan-400"
      };
    }
  }, [magnitude, colorScheme]);

  // Generate 60 minutes of amplitude data points (t = -60m to t = 0m)
  const amplitudeData = useMemo(() => {
    // Hash event ID to create unique background profile
    let hash = 0;
    const str = (eventId || "eq") + dateTime;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const eventTime = new Date(dateTime).getTime();
    const now = Date.now();
    const minutesAgoEvent = Math.max(0, Math.min(60, Math.floor((now - eventTime) / 60000)));

    const baseAmplitude = Math.pow(10, 0.4 * Math.max(1, magnitude));
    const data: { minute: number; amplitude: number; isPeak?: boolean }[] = [];

    // Calculate shock location (minute index 0 to 59, where 59 is "now")
    const shockIdx = Math.max(5, Math.min(55, 60 - minutesAgoEvent));

    for (let m = 0; m < 60; m++) {
      // Background ambient microseismic noise
      let noise = (Math.abs(Math.sin(hash + m * 0.45)) * 0.15 + Math.abs(Math.cos(hash + m * 0.9)) * 0.1) * baseAmplitude * 0.15;
      
      let amp = noise + 0.05 * baseAmplitude;

      if (m === shockIdx) {
        // Mainshock main peak
        amp = baseAmplitude;
      } else if (m > shockIdx && m < shockIdx + 15) {
        // Aftershock decay envelope (modified Omori's law)
        const dt = m - shockIdx;
        const decay = Math.exp(-dt * 0.32);
        const aftershockRipple = Math.abs(Math.sin(dt * 1.8)) * 0.4;
        amp = baseAmplitude * decay * (0.6 + aftershockRipple) + noise;
      } else if (m < shockIdx && m > shockIdx - 6) {
        // Foreshock build-up
        const dt = shockIdx - m;
        amp = baseAmplitude * Math.exp(-dt * 0.6) * 0.35 + noise;
      }

      data.push({
        minute: m - 59, // -59 to 0
        amplitude: Math.max(0.1, amp),
        isPeak: m === shockIdx
      });
    }

    return data;
  }, [magnitude, dateTime, eventId]);

  // Live real-time tick to fluctuate current minute amplitude slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulse((prev) => (prev + 1) % 100);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Draw D3 Sparkline
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const containerWidth = containerRef.current.clientWidth || 200;
    const effectiveHeight = compact ? Math.min(height, 26) : height;
    const margin = compact
      ? { top: 2, right: 2, bottom: 2, left: 2 }
      : { top: 4, right: 6, bottom: 4, left: 6 };
    const width = Math.max(10, containerWidth - margin.left - margin.right);
    const innerHeight = Math.max(10, effectiveHeight - margin.top - margin.bottom);

    if (!amplitudeData || amplitudeData.length === 0) return;

    // Adjust last data point slightly with livePulse for real-time motion
    const liveData = amplitudeData.map((d, i) => {
      if (i === amplitudeData.length - 1) {
        const jitter = (Math.sin(livePulse * 0.8) * 0.08 + Math.cos(livePulse * 1.2) * 0.05) * d.amplitude;
        return { ...d, amplitude: Math.max(0.1, d.amplitude + jitter) };
      }
      return d;
    });

    const xScale = d3
      .scaleLinear()
      .domain([-59, 0])
      .range([0, width]);

    const maxAmp = (liveData.length > 0 ? d3.max(liveData, (d) => d.amplitude) : 10) || 10;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxAmp * 1.1])
      .range([innerHeight, 0]);

    const g = svg
      .attr("width", containerWidth)
      .attr("height", effectiveHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create unique SVG Gradient ID
    const gradientId = `sparkline-grad-${eventId.replace(/[^a-zA-Z0-9]/g, "")}-${Math.floor(Math.random() * 1000)}`;

    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    linearGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", theme.line)
      .attr("stop-opacity", 0.35);

    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", theme.line)
      .attr("stop-opacity", 0.0);

    // D3 Area
    const areaGenerator = d3
      .area<{ minute: number; amplitude: number }>()
      .x((d) => xScale(d.minute))
      .y0(innerHeight)
      .y1((d) => yScale(d.amplitude))
      .curve(d3.curveMonotoneX);

    const areaPath = areaGenerator(liveData) || "";

    g.append("path")
      .attr("fill", `url(#${gradientId})`)
      .attr("d", areaPath);

    // D3 Line
    const lineGenerator = d3
      .line<{ minute: number; amplitude: number }>()
      .x((d) => xScale(d.minute))
      .y((d) => yScale(d.amplitude))
      .curve(d3.curveMonotoneX);

    const linePath = lineGenerator(liveData) || "";

    g.append("path")
      .attr("fill", "none")
      .attr("stroke", theme.line)
      .attr("stroke-width", 1.75)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", linePath);

    // D3 Peak point dot
    const peakPt = liveData.find((d) => d.isPeak) || liveData.reduce((prev, curr) => (curr.amplitude > prev.amplitude ? curr : prev));
    if (peakPt) {
      g.append("circle")
        .attr("cx", xScale(peakPt.minute))
        .attr("cy", yScale(peakPt.amplitude))
        .attr("r", 3)
        .attr("fill", theme.peakDot)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);
    }

    // D3 Live point dot at t=0
    const lastPt = liveData[liveData.length - 1];
    if (lastPt) {
      g.append("circle")
        .attr("cx", xScale(lastPt.minute))
        .attr("cy", yScale(lastPt.amplitude))
        .attr("r", 3.5)
        .attr("fill", theme.liveDot)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.2);
    }
    // D3 Interactive Overlay for Hovering with Time and Year on Wave Pick
    const overlay = g
      .append("rect")
      .attr("width", width)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair");

    const hoverGroup = g.append("g").style("display", "none");

    const hoverLine = hoverGroup
      .append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", theme.line)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    const hoverDot = hoverGroup
      .append("circle")
      .attr("r", 3.5)
      .attr("fill", theme.peakDot)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.2);

    overlay
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const minuteVal = Math.round(xScale.invert(mx));
        const clampedMin = Math.max(-59, Math.min(0, minuteVal));
        const pt = liveData.find((d) => d.minute === clampedMin) || liveData[liveData.length - 1];

        if (pt) {
          const ptX = xScale(pt.minute);
          const ptY = yScale(pt.amplitude);

          hoverGroup.style("display", null);
          hoverLine.attr("x1", ptX).attr("x2", ptX);
          hoverDot.attr("cx", ptX).attr("cy", ptY);

          // Calculate exact time and year for this minute offset
          const baseDate = new Date(dateTime);
          const baseTimeMs = isNaN(baseDate.getTime()) ? Date.now() : baseDate.getTime();
          const targetTimeMs = baseTimeMs + (pt.minute * 60 * 1000);
          const targetDate = new Date(targetTimeMs);
          const year = targetDate.getUTCFullYear();
          const dateStr = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
          const timeStr = targetDate.toISOString().slice(11, 16) + " UTC";

          setHoveredPoint({
            year,
            dateStr,
            timeStr,
            offsetMin: pt.minute,
            amplitude: (pt.amplitude * 0.1).toFixed(1),
            isPeak: !!pt.isPeak
          });
        }
      })
      .on("mouseleave", () => {
        hoverGroup.style("display", "none");
        setHoveredPoint(null);
      });
  }, [amplitudeData, height, theme, eventId, livePulse, compact, dateTime]);

  const maxAmplitudeVal = useMemo(() => {
    if (!amplitudeData || amplitudeData.length === 0) return 10;
    return Math.max(0.1, ...amplitudeData.map((d) => d.amplitude));
  }, [amplitudeData]);

  return (
    <div className={`w-full select-none ${compact ? "py-0" : ""}`} ref={containerRef}>
      {showLabels && !compact && (
        <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 dark:text-slate-500 mb-0.5 px-0.5">
          <span className="flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 inline-block" />
            -60m
          </span>
          <span className="font-bold text-[8px] tracking-tight uppercase opacity-80">
            60 Min Seismic Trend (D3.js)
          </span>
          <span className={`flex items-center gap-1 font-bold ${theme.text}`}>
            Peak: {(maxAmplitudeVal * 0.1).toFixed(1)} µm/s
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          </span>
        </div>
      )}

      <div className="relative w-full overflow-hidden rounded-md bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-white/5 py-0.5">
        <svg ref={svgRef} className="w-full block overflow-visible" />

        {hoveredPoint && (
          <div className="absolute top-0.5 left-1 right-1 pointer-events-none flex items-center justify-between px-2 py-1 bg-slate-950/90 text-white rounded text-[8.5px] font-mono border border-cyan-500/40 backdrop-blur-sm z-10 animate-fade-in shadow-md">
            <span className="font-bold text-cyan-300">
              {hoveredPoint.year} • {hoveredPoint.dateStr} {hoveredPoint.timeStr}
            </span>
            <span className="text-amber-300 font-bold">
              {hoveredPoint.offsetMin === 0 ? "NOW" : `${hoveredPoint.offsetMin}m`} | {hoveredPoint.amplitude} µm/s {hoveredPoint.isPeak ? "★ PEAK PICK" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
