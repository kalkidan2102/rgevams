import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volcano, Earthquake, UserRole, UserRoleType, GeologicalAlert, DismissedAlert, AuditLog, SelectedItem, AlertThresholdConfig } from "./types";
import DashboardMap, { MapLayerStyle } from "./components/dashboard/GeologyMap";
import { GeohazardRegionAlert } from "./components/dashboard/GeohazardRegionAlert";
import { EarthquakeDetailPanel } from "./components/dashboard/EarthquakeDetailPanel";
import { useUSGSData } from "./hooks/useUSGSData";
import { USGSStatusNotification } from "./components/ui/USGSStatusNotification";
import CometPortal from "./components/dashboard/CometPortal";
import GeologyCharts from "./components/dashboard/GeologyChart";
import VolcanoForm from "./components/VolcanoForm";
import ReportPanel from "./components/ReportPanel";
import AdvisoryCard from "./components/dashboard/AdvisoryCard";
import RecentAlertsHistoryPanel from "./components/dashboard/RecentAlertsHistoryPanel";
import GeospatialGallery from "./components/GeospatialGallery";
import GnssNetworkExplorer from "./components/dashboard/GnssNetworkExplorer";
import FuriSeismometer from "./components/dashboard/FuriSeismometer";
import InteractiveTimeline from "./components/dashboard/InteractiveTimeline";
import { ESSGILogo } from "./components/ESSGILogo";
import { AuthModal } from "./components/auth/AuthModal";
import { Navbar } from "./components/layout/navbar";
import { Footer } from "./components/layout/Footer";
import { getPathForTab, getTabFromPath, navigateToTabPath } from "./lib/routing";
import HomePage from "./components/home/HomePage";
import { ContactModal } from "./components/ContactModal";
import {
  AboutSSGIPage,
  FocusAreasPage,
  ContactUsPage,
  MissionMandatePage,
  SectorsPage,
  AnnouncementsPage
} from "./components/home/InstitutionalPages";
import { SectorDetailModal } from "./components/Modals/SectorModal";
import { AnnouncementDetailModal } from "./components/Modals/AnnouncementModal";
import { generateSmartTremorAlert, SmartTremorAlertData } from "./lib/smartTremorAlert";
import SuperAdminDashboard from "./components/admin/SuperAdminDashboard";
import { StaffDashboard } from "./components/dashboard/StaffDashboard";
import { ResearcherDashboard } from "./components/dashboard/ResearcherDashboard";
import { AdminDashboard } from "./components/dashboard/AdminDashboard";
import CockpitSidebar from "./components/dashboard/CockpitSidebar";
import CockpitOverview from "./components/dashboard/CockpitOverview";
import {
  CockpitUserManagement,
  CockpitSystemSettings,
  CockpitAuditLogs
} from "./components/dashboard/CockpitAdminModules";
import { GisOperationsRoom } from "./components/dashboard/GisOperationsRoom";
import InSARAnalysis from "./pages/InSARAnalysis";
import { ETHIOPIA_ACTIVE_ZONES } from "./data";
import { FALLBACK_VOLCANOES, FALLBACK_EARTHQUAKES, FALLBACK_AUDIT_LOGS, FALLBACK_DISMISSED_ALERTS } from "./fallback_data";
import {
  subscribeVolcanoes,
  subscribeEarthquakes,
  subscribeAuditLogs,
  subscribeAlerts,
  saveVolcanoToFirestore,
  deleteVolcanoFromFirestore,
  addAuditLogToFirestore
} from "./lib/dbService";
import essgiBannerBg from "./assets/images/essgibanner.jpg";
import volcanicRiskBg from "./assets/images/Volcanic-sesmic-risk.jpg";
import entotoObservatory from "./assets/images/entoto.jpg";
import ertaAleLava from "./assets/images/Erta-ale-lava.jpg";
import dallolSprings from "./assets/images/dallol.jpg";
import earthObservation from "./assets/images/earthobservation.jpg";
import volcanicHazardBg from "./assets/images/Volcanic-hazard.jpg";
import earthquakeHazardBg from "./assets/images/earthquake_hazard_1783416373231.jpg";
import {
  Flame,
  Home,
  Activity,
  LayoutDashboard,
  Map,
  ShieldAlert,
  FileText,
  Info,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Lock,
  GraduationCap,
  AlertOctagon,
  Calendar,
  AlertTriangle,
  Compass,
  KeyRound,
  History,
  ShieldCheck,
  Sun,
  Moon,
  Globe,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
  X,
  Menu,
  Maximize2,
  LineChart,
  Cpu,
  Loader2,
  ArrowRight,
  Radio,
  Grid,
  List,
  LogOut,
  LogIn,
  Mail,
  Download,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import { playGeologicalAlertSound } from "./utils/audio";
import { authenticatedFetch, clearAuthToken } from "./lib/api";

// Predefined Simulated Simulation Accounts
const SIMULATION_ROLES: UserRole[] = [
  {
    name: "Guest Geophysicist",
    email: "visitor@essgi.gov.et",
    role: "guest",
    institution: "Geospatial Institute (Visitor)"
  },
  {
    name: "Abebe Kebede (Lead Researcher)",
    email: "researcher@essgi.gov.et",
    role: "researcher",
    institution: "ESSGI Directorate of Earth Observation & Geodynamics"
  },
  {
    name: "Kalkidan Getachew (Duty Officer)",
    email: "staff.duty@essgi.gov.et",
    role: "official",
    institution: "ESSGI Real-Time Seismic & Volcanic Observation Center"
  },
  {
    name: "Directorate Administrator",
    email: "admin@essgi.gov.et",
    role: "admin",
    institution: "FDRE Space Science and Geospatial Institute"
  }
];

// 30-Day Simulated Historical Trends for Dashboard Metric Modal expansions
const SEISMIC_TREND_DATA = [
  { day: "D1", count: 2 }, { day: "D2", count: 4 }, { day: "D3", count: 1 },
  { day: "D4", count: 3 }, { day: "D5", count: 5 }, { day: "D6", count: 2 },
  { day: "D7", count: 6 }, { day: "D8", count: 8 }, { day: "D9", count: 4 },
  { day: "D10", count: 3 }, { day: "D11", count: 2 }, { day: "D12", count: 1 },
  { day: "D13", count: 2 }, { day: "D14", count: 3 }, { day: "D15", count: 4 },
  { day: "D16", count: 2 }, { day: "D17", count: 5 }, { day: "D18", count: 3 },
  { day: "D19", count: 1 }, { day: "D20", count: 2 }, { day: "D21", count: 4 },
  { day: "D22", count: 6 }, { day: "D23", count: 7 }, { day: "D24", count: 5 },
  { day: "D25", count: 3 }, { day: "D26", count: 2 }, { day: "D27", count: 1 },
  { day: "D28", count: 2 }, { day: "D29", count: 3 }, { day: "D30", count: 4 }
];

const VOLCANIC_TREND_DATA = [
  { day: "D1", thermal: 42 }, { day: "D2", thermal: 45 }, { day: "D3", thermal: 41 },
  { day: "D4", thermal: 50 }, { day: "D5", thermal: 68 }, { day: "D6", thermal: 85 },
  { day: "D7", thermal: 94 }, { day: "D8", thermal: 88 }, { day: "D9", thermal: 75 },
  { day: "D10", thermal: 60 }, { day: "D11", thermal: 55 }, { day: "D12", thermal: 48 },
  { day: "D13", thermal: 44 }, { day: "D14", thermal: 42 }, { day: "D15", thermal: 40 },
  { day: "D16", thermal: 39 }, { day: "D17", thermal: 41 }, { day: "D18", thermal: 46 },
  { day: "D19", thermal: 52 }, { day: "D20", thermal: 58 }, { day: "D21", thermal: 65 },
  { day: "D22", thermal: 62 }, { day: "D23", thermal: 54 }, { day: "D24", thermal: 48 },
  { day: "D25", thermal: 43 }, { day: "D26", thermal: 41 }, { day: "D27", thermal: 40 },
  { day: "D28", thermal: 38 }, { day: "D29", thermal: 39 }, { day: "D30", thermal: 42 }
];

const FOCAL_TREND_DATA = [
  { day: "D1", mag: 3.2 }, { day: "D2", mag: 4.1 }, { day: "D3", mag: 2.8 },
  { day: "D4", mag: 3.5 }, { day: "D5", mag: 4.6 }, { day: "D6", mag: 3.1 },
  { day: "D7", mag: 5.4 }, { day: "D8", mag: 5.8 }, { day: "D9", mag: 4.9 },
  { day: "D10", mag: 4.2 }, { day: "D11", mag: 3.8 }, { day: "D12", mag: 3.0 },
  { day: "D13", mag: 3.3 }, { day: "D14", mag: 3.6 }, { day: "D15", mag: 4.0 },
  { day: "D16", mag: 3.5 }, { day: "D17", mag: 4.3 }, { day: "D18", mag: 3.7 },
  { day: "D19", mag: 2.9 }, { day: "D20", mag: 3.4 }, { day: "D21", mag: 3.9 },
  { day: "D22", mag: 4.7 }, { day: "D23", mag: 5.2 }, { day: "D24", mag: 4.4 },
  { day: "D25", mag: 3.8 }, { day: "D26", mag: 3.3 }, { day: "D27", mag: 2.7 },
  { day: "D28", mag: 3.1 }, { day: "D29", mag: 3.5 }, { day: "D30", mag: 4.0 }
];

function formatTimeAgo(dateString: string) {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const ms = now.getTime() - past.getTime();
    if (ms < 0) return "Just now";
    
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (day > 0) return `${day} day${day > 1 ? "s" : ""} ago`;
    if (hr > 0) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
    if (min > 0) return `${min} minute${min > 1 ? "s" : ""} ago`;
    return "Just now";
  } catch (e) {
    return "Recently";
  }
}

const GEODETIC_TREND_DATA = [
  { day: "D1", latency: 122 }, { day: "D2", latency: 124 }, { day: "D3", latency: 120 },
  { day: "D4", latency: 125 }, { day: "D5", latency: 138 }, { day: "D6", latency: 142 },
  { day: "D7", latency: 130 }, { day: "D8", latency: 122 }, { day: "D9", latency: 120 },
  { day: "D10", latency: 118 }, { day: "D11", latency: 121 }, { day: "D12", latency: 123 },
  { day: "D13", latency: 125 }, { day: "D14", latency: 124 }, { day: "D15", latency: 120 },
  { day: "D16", latency: 119 }, { day: "D17", latency: 121 }, { day: "D18", latency: 126 },
  { day: "D19", latency: 128 }, { day: "D20", latency: 122 }, { day: "D21", latency: 120 },
  { day: "D22", latency: 121 }, { day: "D23", latency: 125 }, { day: "D24", latency: 128 },
  { day: "D25", latency: 124 }, { day: "D26", latency: 122 }, { day: "D27", latency: 119 },
  { day: "D28", latency: 118 }, { day: "D29", latency: 120 }, { day: "D30", latency: 121 }
];

function MetricTrendChart({
  metric,
  theme
}: {
  metric: "seismic" | "volcanic" | "focal" | "geodetic";
  theme: "light" | "dark";
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  let data: any[] = [];
  let title = "";
  let unit = "";
  let strokeColor = "#C9A646";
  let fillGradient = "seismicGrad";
  let valueKey = "";

  if (metric === "seismic") {
    data = SEISMIC_TREND_DATA;
    title = "Daily Seismic Tremors (30D Freq)";
    unit = " events";
    strokeColor = "#F59E0B";
    fillGradient = "seismicGrad";
    valueKey = "count";
  } else if (metric === "volcanic") {
    data = VOLCANIC_TREND_DATA;
    title = "Crater Thermal Index Fluctuation (30D)";
    unit = " MW";
    strokeColor = "#F43F5E";
    fillGradient = "volcanicGrad";
    valueKey = "thermal";
  } else if (metric === "focal") {
    data = FOCAL_TREND_DATA;
    title = "Max Richter Amplitude Trend (30D)";
    unit = " M";
    strokeColor = "#EF4444";
    fillGradient = "focalGrad";
    valueKey = "mag";
  } else {
    data = GEODETIC_TREND_DATA;
    title = "Station GPS Telemetry Latency Baseline (30D)";
    unit = " ms";
    strokeColor = "#10B981";
    fillGradient = "geodeticGrad";
    valueKey = "latency";
  }

  const width = 600;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const vals = data.map((d) => d[valueKey]);
  const maxVal = Math.max(...vals, 1) * 1.1;
  const minVal = metric === "geodetic" ? Math.min(...vals) * 0.9 : 0;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal;
    return height - paddingBottom - ((val - minVal) / (range || 1)) * chartHeight;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d[valueKey])}`).join(" ");
  const areaPoints = `${getX(0)},${height - paddingBottom} ${points} ${getX(data.length - 1)},${height - paddingBottom}`;

  const gridLines = [];
  const yTicksCount = 4;
  for (let i = 0; i <= yTicksCount; i++) {
    const ratio = i / yTicksCount;
    const val = minVal + ratio * (maxVal - minVal);
    const y = getY(val);
    gridLines.push({ y, val });
  }

  const xTicks = [];
  for (let i = 0; i < data.length; i += 6) {
    xTicks.push({ x: getX(i), label: data[i].day });
  }
  xTicks.push({ x: getX(data.length - 1), label: data[data.length - 1].day });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const relativeX = ((mouseX - paddingLeft) / chartWidth) * (data.length - 1);
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(relativeX)));
    setHoveredIdx(idx);
  };

  const activeHoverItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  const getFormattedPointDate = (idx: number) => {
    const d = new Date(2026, 7, 7);
    d.setDate(d.getDate() - (29 - idx));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-semibold">{title}</span>
          {activeHoverItem && (
            <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse tracking-wider">
              Crosshair Active
            </span>
          )}
        </div>
        {activeHoverItem && hoveredIdx !== null ? (
          <div className="text-white bg-slate-900 border border-cyan-500/50 px-3 py-1 rounded-xl shadow-lg text-[10.5px] tracking-wide font-bold flex items-center gap-2.5">
            <span className="text-slate-400 font-mono text-[9.5px]">DATE:</span>
            <span className="text-cyan-300 font-black">{getFormattedPointDate(hoveredIdx)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[9.5px]">DAY:</span>
            <span className="text-cyan-300 font-black">{activeHoverItem.day}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[9.5px]">VALUE:</span>
            <span className="text-amber-400 font-black">{activeHoverItem[valueKey].toFixed(metric === "focal" ? 1 : 0)}{unit}</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono">Hover chart canvas for crosshair tracking</span>
        )}
      </div>

      <div className="relative bg-[#020B14] border border-cyan-500/30 rounded-2xl p-4 select-none overflow-hidden shadow-xl">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="seismicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="volcanicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="focalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="geodeticGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                textAnchor="end"
                className="font-mono text-[9.5px] font-bold"
                fill="#CBD5E1"
              >
                {line.val.toFixed(metric === "focal" ? 1 : 0)}
              </text>
            </g>
          ))}

          {metric === "focal" && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(5.0)}
                x2={width - paddingRight}
                y2={getY(5.0)}
                stroke="#EF4444"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity="0.9"
              />
              <text
                x={width - paddingRight - 4}
                y={getY(5.0) - 4}
                textAnchor="end"
                className="font-mono text-[8.5px] font-black fill-red-400 uppercase tracking-widest"
              >
                M5.0 CRITICAL THRESHOLD
              </text>
            </g>
          )}

          <polygon points={areaPoints} fill={`url(#${fillGradient})`} opacity="0.45" />

          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="rgba(255,255,255,0.2)"
          />

          {xTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.x}
                y1={height - paddingBottom}
                x2={tick.x}
                y2={height - paddingBottom + 4}
                stroke="rgba(255,255,255,0.25)"
              />
              <text
                x={tick.x}
                y={height - paddingBottom + 14}
                textAnchor="middle"
                className="font-mono text-[8.5px] font-bold"
                fill="#CBD5E1"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* DYNAMIC CROSSHAIR TRACKING OVERLAY */}
          {hoveredIdx !== null && activeHoverItem && (() => {
            const hX = getX(hoveredIdx);
            const valNum = activeHoverItem[valueKey];
            const hY = getY(valNum);

            return (
              <g className="pointer-events-none">
                {/* Vertical Crosshair Line */}
                <line
                  x1={hX}
                  y1={paddingTop - 6}
                  x2={hX}
                  y2={height - paddingBottom}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.85"
                />

                {/* Horizontal Crosshair Line */}
                <line
                  x1={paddingLeft}
                  y1={hY}
                  x2={width - paddingRight + 6}
                  y2={hY}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.85"
                />

                {/* Left Y-Axis Dynamic Coordinate Label Badge */}
                <g>
                  <rect
                    x={paddingLeft - 42}
                    y={hY - 9}
                    width={38}
                    height={18}
                    rx="5"
                    fill={strokeColor}
                  />
                  <text
                    x={paddingLeft - 23}
                    y={hY + 3.5}
                    textAnchor="middle"
                    className="font-mono text-[9px] font-black fill-slate-950"
                  >
                    {valNum.toFixed(metric === "focal" ? 1 : 0)}
                  </text>
                </g>

                {/* Bottom X-Axis Dynamic Coordinate Label Badge */}
                <g>
                  <rect
                    x={hX - 18}
                    y={height - paddingBottom + 3}
                    width={36}
                    height={18}
                    rx="5"
                    fill={strokeColor}
                  />
                  <text
                    x={hX}
                    y={height - paddingBottom + 15}
                    textAnchor="middle"
                    className="font-mono text-[9px] font-black fill-slate-950"
                  >
                    {activeHoverItem.day}
                  </text>
                </g>

                {/* Intersection Glowing Pulsing Ring */}
                <circle
                  cx={hX}
                  cy={hY}
                  r="12"
                  fill={strokeColor}
                  opacity="0.25"
                />
                <circle
                  cx={hX}
                  cy={hY}
                  r="7"
                  fill={strokeColor}
                  opacity="0.4"
                />
                <circle
                  cx={hX}
                  cy={hY}
                  r="3.5"
                  fill="#030712"
                  stroke={strokeColor}
                  strokeWidth="2"
                />
              </g>
            );
          })()}
        </svg>

        {/* POLISHED FLOATING CARD TOOLTIP OVERLAY */}
        {hoveredIdx !== null && activeHoverItem && (() => {
          const hX = getX(hoveredIdx);
          const valNum = activeHoverItem[valueKey];
          const hY = getY(valNum);
          const dateStr = getFormattedPointDate(hoveredIdx);

          const posXPercent = (hX / width) * 100;
          const posYPercent = (hY / height) * 100;

          const isNearRight = posXPercent > 65;
          const isNearTop = posYPercent < 35;

          return (
            <div className="absolute inset-4 pointer-events-none z-30">
              <div
                className="absolute transition-all duration-75 ease-out"
                style={{
                  left: `${posXPercent}%`,
                  top: `${posYPercent}%`,
                  transform: `translate(${isNearRight ? "calc(-100% - 14px)" : "14px"}, ${isNearTop ? "14px" : "calc(-100% - 14px)"})`
                }}
              >
                <div
                  className="bg-slate-900/95 backdrop-blur-md border shadow-2xl rounded-xl p-3 min-w-[185px] space-y-2 text-left ring-1 ring-white/10"
                  style={{ borderColor: `${strokeColor}B0` }}
                >
                  {/* Header: Indicator dot, day label, date badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-1.5 relative">
                      <span
                        className="w-2 h-2 rounded-full animate-ping inline-block"
                        style={{ backgroundColor: strokeColor }}
                      />
                      <span
                        className="w-2 h-2 rounded-full absolute"
                        style={{ backgroundColor: strokeColor }}
                      />
                      <span className="font-mono text-[10px] font-bold text-slate-200 ml-1.5">
                        {activeHoverItem.day}
                      </span>
                    </div>
                    <span className="font-mono text-[9.5px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                      {dateStr}
                    </span>
                  </div>

                  {/* Value row */}
                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Exact Value
                    </span>
                    <span
                      className="font-mono text-base font-black tracking-tight"
                      style={{ color: strokeColor }}
                    >
                      {valNum.toFixed(metric === "focal" ? 1 : 0)}
                      <span className="text-xs font-bold text-slate-300 ml-0.5">{unit.trim()}</span>
                    </span>
                  </div>

                  {/* Context footer */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-white/5">
                    <span className="truncate max-w-[110px] text-slate-300 font-medium">
                      {metric === "seismic" && "Daily Tremors"}
                      {metric === "volcanic" && "Thermal Fluctuation"}
                      {metric === "focal" && "Richter Amplitude"}
                      {metric === "geodetic" && "GPS Latency"}
                    </span>
                    <span className="font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                      Pt {hoveredIdx + 1}/30
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white/5 dark:bg-white/2 rounded-xl p-3 text-[10.5px] text-slate-400">
        <span className="flex items-center gap-1.5 font-mono">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: strokeColor }}></span>
          <span>30-Day Velocity Baseline</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="font-sans leading-relaxed">
          {metric === "seismic" && "Seismic tremors swarm frequencies show high activity on days 7-8 near Erta Ale."}
          {metric === "volcanic" && "Peak radiative anomaly values align with magma convective cycles."}
          {metric === "focal" && "Maximum recorded Richter force is safe, but requires active telemetry vigilance."}
          {metric === "geodetic" && "Receiver station continuous packet transmissions stay within nominal operational constraints."}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  // tab selector with URL path synchronization
  const [activeTabRaw, setActiveTabRaw] = useState<"home" | "dashboard" | "staff-dashboard" | "researcher-dashboard" | "admin-dashboard" | "map" | "analytics" | "insar" | "report" | "gallery" | "about" | "focus" | "contact" | "mission" | "sectors" | "announcements">(() => {
    try {
      const path = window.location.pathname;
      if (path && path !== "/" && path !== "/index.html") {
        return getTabFromPath(path) as any;
      }
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) return getTabFromPath("/" + tabParam) as any;
    } catch {}
    return "home";
  });

  const setActiveTab = (tab: any) => {
    setActiveTabRaw(tab);
    navigateToTabPath(tab);
  };

  const activeTab = activeTabRaw;

  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  
  // Live Smart USGS Tremor SMS & DRMC Bulletin Alert States
  const [liveTremorAlert, setLiveTremorAlert] = useState<SmartTremorAlertData | null>(null);
  const [isTremorModalOpen, setIsTremorModalOpen] = useState<boolean>(false);
  const [dismissedTremorId, setDismissedTremorId] = useState<string | null>(null);

  const handleOpenSmartTremorDispatch = (targetEq: Earthquake) => {
    const alertData = generateSmartTremorAlert(targetEq);
    setLiveTremorAlert(alertData);
    setIsTremorModalOpen(true);
  };

  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"charts" | "volcanoes" | "earthquakes" | "gnss" | "furi">("charts");
  const [viewMode, setViewMode] = useState<"home" | "dashboard">("home");

  // Google Earth States
  const [googleEarthActive, setGoogleEarthActive] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<MapLayerStyle>("googleEarthHybrid");
  const [is3DActive, setIs3DActive] = useState<boolean>(false);

  // Dashboard dynamic filtering state for interactive professional toggle cards
  const [dashboardAdvisoryFilter, setDashboardAdvisoryFilter] = useState<"all" | "volcanic" | "seismic">("all");
  const [dashboardZoneFilter, setDashboardZoneFilter] = useState<"all" | "high-risk" | "volcanic" | "seismic">("all");

  // Hover states for the Interactive Analysis Hub metric cards
  const [isSeismicHovered, setIsSeismicHovered] = useState(false);
  const [isVolcanicHovered, setIsVolcanicHovered] = useState(false);
  const [isFocalHovered, setIsFocalHovered] = useState(false);
  const [isGeodeticHovered, setIsGeodeticHovered] = useState(false);

  // Sub-tab selection within the unified Dashboard view
  const [dashboardSubTab, setDashboardSubTab] = useState<
    "overview" | "volcanoes" | "earthquakes" | "seismicwave" | "gnss" | "analytics" | "observatory" | "users" | "settings" | "audit"
  >("overview");
  
  // Collapsible Monitoring Cockpit Sidebar State (persisted to localStorage)
  const [isCockpitSidebarCollapsed, setIsCockpitSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cockpit_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCockpitSidebar = () => {
    setIsCockpitSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cockpit_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };
  
  // White Light Mode for entire system
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Detailed modal trend state
  const [expandedMetric, setExpandedMetric] = useState<"seismic" | "volcanic" | "focal" | "geodetic" | null>(null);

  // High-fidelity dynamic styling and layout controls for Earth Monitoring cards
  const [eqCardLayout, setEqCardLayout] = useState<"grid" | "list" | "slider">("grid");
  const [eqCardDensity, setEqCardDensity] = useState<"standard" | "compact">("standard");
  const [zoneCardLayout, setZoneCardLayout] = useState<"grid" | "list" | "slider">("grid");
  const [zoneCardDensity, setZoneCardDensity] = useState<"detailed" | "standard" | "compact">("standard");
  const [zoneRegionFilter, setZoneRegionFilter] = useState<"all" | "afar" | "rift" | "danakil" | "lake">("all");
  const [currentZoneIndex, setCurrentZoneIndex] = useState<number>(0);
  const [currentEqIndex, setCurrentEqIndex] = useState<number>(0);

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      const body = window.document.body;
      root.classList.remove("dark");
      if (body) body.classList.remove("dark");
      localStorage.setItem("essgi_theme", "light");
    } catch {
      // theme sync fallback
    }
  }, [theme]);

  // Sync tab from URL path and popstate browser navigation
  useEffect(() => {
    const syncFromLocation = () => {
      const path = window.location.pathname;
      if (path && path !== "/" && path !== "/index.html") {
        const matched = getTabFromPath(path);
        setActiveTabRaw(matched as any);
      } else {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab") || window.location.hash.replace("#", "");
        if (tabParam) {
          const matched = getTabFromPath("/" + tabParam);
          setActiveTabRaw(matched as any);
        }
      }
    };

    syncFromLocation();

    const handlePopState = () => {
      syncFromLocation();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  
  // databases list state with robust localStorage/constant fallbacks
  const [volcanoes, setVolcanoes] = useState<Volcano[]>(() => {
    try {
      const stored = localStorage.getItem("essgi_volcanoes");
      return stored ? JSON.parse(stored) : FALLBACK_VOLCANOES;
    } catch {
      return FALLBACK_VOLCANOES;
    }
  });
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>(() => {
    try {
      const stored = localStorage.getItem("essgi_earthquakes");
      return stored ? JSON.parse(stored) : FALLBACK_EARTHQUAKES;
    } catch {
      return FALLBACK_EARTHQUAKES;
    }
  });

  // Client-side real-time USGS data hook to fetch live seismic movements directly from the source
  const {
    earthquakes: liveUSGSEarthquakes,
    loading: loadingUSGS,
    error: usgsError,
    retryCount: usgsRetryCount,
    isRetrying: usgsIsRetrying,
    lastSuccessTime: usgsLastSuccessTime,
    isUsingFallbackData: usgsIsUsingFallback,
    maxRetries: usgsMaxRetries,
    refetch: refetchUSGS,
    statusMessage: usgsStatusMessage,
  } = useUSGSData({
    daysLookback: 180,
    minMagnitude: 2.0,
    maxRetries: 3,
    retryDelayMs: 2000,
    backoffFactor: 1.5,
  });

  // Synchronize live USGS earthquakes into active state when retrieved
  useEffect(() => {
    if (liveUSGSEarthquakes && liveUSGSEarthquakes.length > 0) {
      setEarthquakes((prev) => {
        const liveIds = new Set(liveUSGSEarthquakes.map((e) => e.id));
        const filteredPrev = prev.filter((e) => !liveIds.has(e.id));
        const combined = [...liveUSGSEarthquakes, ...filteredPrev];
        combined.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        return combined;
      });
    }
  }, [liveUSGSEarthquakes]);

  // PostgreSQL Authoritative Subscriptions
  useEffect(() => {
    const unsubVolcanoes = subscribeVolcanoes((data) => {
      if (data && data.length > 0) {
        setVolcanoes(data);
      }
    });

    const unsubEarthquakes = subscribeEarthquakes((data) => {
      if (data && data.length > 0) {
        setEarthquakes((prev) => {
          const fetchedIds = new Set(data.map((e) => e.id));
          const unmergedLive = (liveUSGSEarthquakes || []).filter((e) => !fetchedIds.has(e.id));
          const combined = [...unmergedLive, ...data];
          combined.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
          return combined;
        });
        try {
          localStorage.setItem("essgi_earthquakes", JSON.stringify(data));
        } catch {
          // localStorage fallback
        }
      }
    });

    const unsubAuditLogs = subscribeAuditLogs((logs) => {
      if (logs) {
        setAuditLogs(logs);
      }
    });

    const unsubAlerts = subscribeAlerts((al) => {
      if (al && al.length > 0) {
        setAlerts(al);
      }
    });

    return () => {
      unsubVolcanoes();
      unsubEarthquakes();
      unsubAuditLogs();
      unsubAlerts();
    };
  }, [liveUSGSEarthquakes]);

  // Automatically evaluate live USGS earthquakes for smart tectonic analysis & emergency bilingual SMS/email dispatch
  useEffect(() => {
    if (!earthquakes || earthquakes.length === 0) return;
    
    const significantEvents = earthquakes
      .filter((eq) => !eq.isHistorical && eq.magnitude >= 3.8)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    const topEvent = significantEvents[0] || earthquakes.filter((eq) => !eq.isHistorical).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0];
    
    if (topEvent && topEvent.id !== dismissedTremorId && !liveTremorAlert) {
      const smartAlert = generateSmartTremorAlert(topEvent);
      setLiveTremorAlert(smartAlert);
    }
  }, [earthquakes, dismissedTremorId, liveTremorAlert]);

  const [loadingVolcanoes, setLoadingVolcanoes] = useState(true);
  const [loadingEarthquakes, setLoadingEarthquakes] = useState(true);
  const [manualRefreshSpin, setManualRefreshSpin] = useState(false);

  // Filter criteria states
  const [volcanoSearch, setVolcanoSearch] = useState("");
  const [volcanoSeverity, setVolcanoSeverity] = useState<string>("All");
  
  const [eqSearch, setEqSearch] = useState("");
  const [eqMinMag, setEqMinMag] = useState<number>(2.0);
  const [eqMaxDepth, setEqMaxDepth] = useState<number>(100);
  const [eqDatePreset, setEqDatePreset] = useState<string>("all");
  const [eqStartDate, setEqStartDate] = useState<string>("");
  const [eqEndDate, setEqEndDate] = useState<string>("");

  // Pagination for Earthquakes to prevent excessive scrolling
  const [eqPage, setEqPage] = useState<number>(1);
  const eqPerPage = 12;

  // Real-time synchronization interval countdown inside ESSGI (seconds remaining)
  const [secondsToSync, setSecondsToSync] = useState(30);

  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    setAiSummaryLoading(true);
    setAiSummaryResult(null);
    try {
      const activeVolcanoes = volcanoes.filter((v) => v.severity !== "Green");
      const maxMag = earthquakes.length
        ? Math.max(...earthquakes.map((e) => e.magnitude))
        : 0;
      const criticalSeismicEvents = earthquakes.filter((e) => e.severity === "Red" || e.severity === "Orange").length;

      const summaryPayload = {
        totalVolcanoesObserved: volcanoes.length,
        activeAlertVolcanoesCount: activeVolcanoes.length,
        activeVolcanoes: activeVolcanoes.map((v) => ({ name: v.name, severity: v.severity, region: v.region })),
        totalEarthquakesInPeriod: earthquakes.length,
        highestMagnitudeRecorded: maxMag,
        severeEarthquakesCount: criticalSeismicEvents,
      };

      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentDataSummary: summaryPayload }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummaryResult(data.summaryText || "Situation stable. No active alerts.");
      } else {
        throw new Error("API failed");
      }
    } catch {
      const activeVolcCount = volcanoes.filter((v) => v.severity !== "Green").length;
      const maxMagVal = earthquakes.length ? Math.max(...earthquakes.map((e) => e.magnitude)).toFixed(1) : "5.8";
      setAiSummaryResult(`Currently in Ethiopia, active tectonic strain is monitored across the Main Ethiopian Rift and Southern Afar, where ${activeVolcCount} volcanic centers remain under elevated observation. Seismological networks recorded ${earthquakes.length} events over the monitored period, with recent moderate seismic activity (M ${maxMagVal}) centered in the southern part of the Afar Region near Awash and Metehara, while the northern and central Semera corridor remains seismically stable.`);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Audio Alerts status and system state
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("essgi_audio_alerts_enabled");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });

  interface AudioAlertToast {
    id: string;
    message: string;
    severity: "Red" | "Orange";
    type: "volcano" | "earthquake";
    name: string;
    timestamp: string;
  }
  const [activeAudioAlertToasts, setActiveAudioAlertToasts] = useState<AudioAlertToast[]>([]);
  const knownEventIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);
  const systemMountTimeRef = useRef<number>(Date.now());

  // current logged user role
  const [currentUser, setCurrentUser] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("essgi_current_user");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return SIMULATION_ROLES[0]; // Default to Guest Geophysicist (Read-Only)
  });

  useEffect(() => {
    try {
      localStorage.setItem("essgi_current_user", JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Audit log states
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem("essgi_audit_logs");
      return stored ? JSON.parse(stored) : FALLBACK_AUDIT_LOGS;
    } catch {
      return FALLBACK_AUDIT_LOGS;
    }
  });
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  const loadAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const res = await authenticatedFetch("/api/audit-logs");
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        const logsArray = Array.isArray(data) ? data : (data && Array.isArray(data.logs) ? data.logs : []);
        if (logsArray.length > 0) {
          setAuditLogs(logsArray);
          localStorage.setItem("essgi_audit_logs", JSON.stringify(logsArray));
        }
      }
    } catch {
      // client cache fallback
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    if (currentUser.role === "admin") {
      loadAuditLogs();
    }
  }, [currentUser]);

  // Map selections sync state
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [cometPortalItem, setCometPortalItem] = useState<SelectedItem | null>(null);
  const [selectedReportTopic, setSelectedReportTopic] = useState<"all" | "volcanic" | "seismic" | "infrastructure" | "geodesy" | "drmc" | "gnss" | "executive">("all");
  const [mobileHomeMenuOpen, setMobileHomeMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Keyboard navigation shortcuts for accessibility (tabs 1-5)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Safely ignore when user is typing in form controls or inputs
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          activeEl.hasAttribute("contenteditable") ||
          (activeEl as HTMLElement).isContentEditable
        ) {
          return;
        }
      }

      // Skip modifier keys e.g. command+1, ctrl+1, alt+1 (to maintain browser shortcuts compatibility)
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }

      const keyTabs: Record<string, "dashboard" | "map" | "analytics" | "report" | "gallery"> = {
        "1": "dashboard",
        "2": "map",
        "3": "analytics",
        "4": "report",
        "5": "gallery"
      };

      if (keyTabs[event.key]) {
        setActiveTab(keyTabs[event.key]);
        setSelectedItem(null);
        setCometPortalItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Contact Us Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Security authorization states for privilege elevation (Database-linked)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "register">("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authRole, setAuthRole] = useState<"official" | "admin" | "researcher">("official");
  const [authInstitution, setAuthInstitution] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Authentication Handlers
  const handleSignIn = async (overrideEmail?: string, overridePass?: string) => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    
    const emailToUse = (overrideEmail !== undefined ? overrideEmail : authEmail).trim();
    const passToUse = (overridePass !== undefined ? overridePass : authPassword).trim();

    if (!emailToUse) {
      setAuthError("Please enter your official institutional ID or Email.");
      return;
    }

    if (!passToUse) {
      setAuthError("Please enter your account password.");
      return;
    }

    if (passToUse.length < 6) {
      setAuthError("Security Requirement: Password must be at least 6 characters in length.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse, password: passToUse })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 423) {
          setAuthError(`⛔ ACCOUNT LOCKED: ${data.error || "This account has been temporarily locked due to 5 consecutive failed login attempts. Please try again in 15 minutes or request an administrator unlock."}`);
        } else {
          setAuthError(data.error || "Login failed. Please verify your credentials.");
        }
        return;
      } else {
        setAuthSuccessMsg(`Welcome back, ${data.user.name}! Access Granted.`);
        setTimeout(() => {
          setCurrentUser(data.user);
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthSuccessMsg(null);

          if (data.user.role === "superadmin" || data.user.role === "admin") {
            setViewMode("dashboard");
            setActiveTab("admin-dashboard");
          } else if (data.user.role === "researcher" || data.user.role === "scientist") {
            setViewMode("dashboard");
            setActiveTab("researcher-dashboard");
          } else {
            setViewMode("dashboard");
            setActiveTab("staff-dashboard");
          }
        }, 800);
      }
    } catch (err) {
      // Offline / Local Fallback Authentication
      const lowerEmail = emailToUse.toLowerCase();
      if (lowerEmail === "admin@essgi.gov.et" || lowerEmail === "director.general@essgi.gov.et" || lowerEmail === "dg@essgi.gov.et") {
        const u = {
          id: lowerEmail,
          name: lowerEmail.includes("director") ? "Director General" : "Directorate Administrator",
          email: lowerEmail,
          role: "admin" as const,
          institution: "FDRE Space Science and Geospatial Institute (ESSGI)"
        };
        setAuthSuccessMsg(`Welcome, ${u.name}! Access Granted.`);
        setTimeout(() => {
          setCurrentUser(u);
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthSuccessMsg(null);
          setViewMode("dashboard");
          setActiveTab("admin-dashboard");
        }, 800);
      } else if (lowerEmail === "researcher@essgi.gov.et") {
        const u = {
          id: lowerEmail,
          name: "Abebe Kebede (Lead Researcher)",
          email: lowerEmail,
          role: "researcher" as const,
          institution: "ESSGI Directorate of Earth Observation & Geodynamics"
        };
        setAuthSuccessMsg(`Welcome, ${u.name}! Access Granted.`);
        setTimeout(() => {
          setCurrentUser(u);
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthSuccessMsg(null);
          setViewMode("dashboard");
          setActiveTab("researcher-dashboard");
        }, 800);
      } else if (lowerEmail === "staff.duty@essgi.gov.et" || lowerEmail === "kalgetachew764@gmail.com") {
        const u = {
          id: lowerEmail,
          name: "Kalkidan Getachew (Duty Officer)",
          email: lowerEmail,
          role: "official" as const,
          institution: "ESSGI Real-Time Seismic & Volcanic Observation Center"
        };
        setAuthSuccessMsg(`Welcome, ${u.name}! Access Granted.`);
        setTimeout(() => {
          setCurrentUser(u);
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthSuccessMsg(null);
          setViewMode("dashboard");
          setActiveTab("staff-dashboard");
        }, 800);
      } else {
        // Fallback for any other custom login
        const isAdm = lowerEmail.includes("admin") || lowerEmail.includes("dg");
        const isRes = lowerEmail.includes("research") || lowerEmail.includes("sci");
        const assignedRole: UserRoleType = isAdm ? "admin" : isRes ? "researcher" : "official";
        const customUser = {
          id: lowerEmail,
          name: lowerEmail.split("@")[0].toUpperCase(),
          email: lowerEmail,
          role: assignedRole,
          institution: "Ethiopian Space Science and Geospatial Institute"
        };
        setAuthSuccessMsg(`Welcome, ${customUser.name}! Access Granted.`);
        setTimeout(() => {
          setCurrentUser(customUser);
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthSuccessMsg(null);
          setViewMode("dashboard");
          if (assignedRole === "admin") {
            setActiveTab("admin-dashboard");
          } else if (assignedRole === "researcher") {
            setActiveTab("researcher-dashboard");
          } else {
            setActiveTab("staff-dashboard");
          }
        }, 800);
      }
    }
  };

  const handleRegister = async () => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    if (!authName || !authEmail || !authPassword || !authConfirmPassword) {
      setAuthError("Please fill in all registration fields.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("Password security requirement: minimum length is 6 characters.");
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          role: authRole,
          institution: authInstitution,
          password: authPassword,
          confirmPassword: authConfirmPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed");
      } else {
        setAuthSuccessMsg(`Account registered successfully as ${authRole.toUpperCase()}! Directing to your dashboard...`);
        setTimeout(() => {
          const registeredUser = {
            id: authEmail.toLowerCase(),
            name: authName,
            email: authEmail.toLowerCase(),
            role: authRole as UserRoleType,
            institution: authInstitution || "ESSGI Directorate"
          };
          setCurrentUser(registeredUser);
          setIsAuthModalOpen(false);
          setAuthName("");
          setAuthEmail("");
          setAuthInstitution("");
          setAuthPassword("");
          setAuthConfirmPassword("");
          setAuthSuccessMsg(null);
          setViewMode("dashboard");
          if ((authRole as string) === "admin" || (authRole as string) === "superadmin") {
            setActiveTab("admin-dashboard");
          } else if ((authRole as string) === "researcher") {
            setActiveTab("researcher-dashboard");
          } else {
            setActiveTab("staff-dashboard");
          }
        }, 1200);
      }
    } catch (err) {
      // Fallback local registration & immediate login redirect
      setAuthSuccessMsg(`Registration complete for ${authName}! Directing to your dashboard...`);
      setTimeout(() => {
        const registeredUser = {
          id: authEmail.toLowerCase(),
          name: authName,
          email: authEmail.toLowerCase(),
          role: authRole as UserRoleType,
          institution: authInstitution || "ESSGI Directorate"
        };
        setCurrentUser(registeredUser);
        setIsAuthModalOpen(false);
        setAuthName("");
        setAuthEmail("");
        setAuthInstitution("");
        setAuthPassword("");
        setAuthConfirmPassword("");
        setAuthSuccessMsg(null);
        setViewMode("dashboard");
        if ((authRole as string) === "admin" || (authRole as string) === "superadmin") {
          setActiveTab("admin-dashboard");
        } else if ((authRole as string) === "researcher") {
          setActiveTab("researcher-dashboard");
        } else {
          setActiveTab("staff-dashboard");
        }
      }, 1200);
    }
  };

  const handleSignOut = () => {
    const guestUser: UserRole = {
      name: "Guest Geophysicist",
      email: "visitor@essgi.gov.et",
      role: "guest",
      institution: "Geospatial Institute (Visitor)"
    };
    setCurrentUser(guestUser);
    clearAuthToken();
    try {
      localStorage.removeItem("essgi_current_user");
    } catch {
      // silent fallback
    }
    setActiveTab("home");
    setViewMode("home");
  };

  // Standard alerts list
  const [alerts, setAlerts] = useState<GeologicalAlert[]>([]);

  // Dismissed Alerts History State for Recent Alerts History Side Panel
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);
  const [roleRestrictionNotice, setRoleRestrictionNotice] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: ""
  });

  const [dismissedAlertsHistory, setDismissedAlertsHistory] = useState<DismissedAlert[]>(() => {
    try {
      const saved = localStorage.getItem("essgi_dismissed_alerts_history");
      return saved ? JSON.parse(saved) : FALLBACK_DISMISSED_ALERTS;
    } catch {
      return FALLBACK_DISMISSED_ALERTS;
    }
  });

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("essgi_dismissed_alert_ids");
      return saved ? JSON.parse(saved) : FALLBACK_DISMISSED_ALERTS.map((a) => a.id);
    } catch {
      return FALLBACK_DISMISSED_ALERTS.map((a) => a.id);
    }
  });

  // Sync dismissed history and IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("essgi_dismissed_alerts_history", JSON.stringify(dismissedAlertsHistory));
      localStorage.setItem("essgi_dismissed_alert_ids", JSON.stringify(dismissedAlertIds));
    } catch {
      // silent fallback
    }
  }, [dismissedAlertsHistory, dismissedAlertIds]);

  // Alert Threshold Configuration State (Dynamic from Server)
  const [alertThresholdConfig, setAlertThresholdConfig] = useState<AlertThresholdConfig>({
    minMagnitude: 4.5,
    maxDepth: 35,
    depthThreshold: 35,
    emailAlertsEnabled: true,
    smsAlertsEnabled: true,
    alertRecipientsEmail: ["directorate.alert@essgi.gov.et", "duty.seismologist@essgi.gov.et", "drmc.operations@drmc.gov.et"],
    alertRecipientsPhone: ["+251911223344", "+251922334455"],
    targetRegions: ["Afar Depression & Danakil Graben", "Main Ethiopian Rift (MER) Corridor", "Fentale-Awash Basin", "Central Highlands Escarpment"],
    autoDispatchOnCritical: true,
    severityFilter: "Orange",
    smsTemplateText: "ESSGI CRITICAL ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}.",
    emailSubjectTemplate: "[ESSGI GEODISASTER WARNING] M{mag} Seismic Tremor - {loc}"
  });

  useEffect(() => {
    fetch("/api/admin/alert-config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.config) {
          setAlertThresholdConfig(data.config);
        }
      })
      .catch(() => {});
  }, []);

  // Handler to dismiss an active alert and move to history
  const handleDismissAlert = (alertToDismiss: GeologicalAlert) => {
    if (currentUser.role === "guest") {
      setRoleRestrictionNotice({
        isOpen: true,
        title: "Official Authorization Required",
        description: `You are currently logged in as ${currentUser.name} (Guest Geophysicist / Read-Only). Dismissing active emergency advisories is restricted to Official (Disaster Duty Officer) or Administrator privileges. Please select 'Official' or 'Administrator' in the top-right role dropdown to dismiss active regional advisories.`
      });
      return;
    }

    const newDismissedEntry: DismissedAlert = {
      ...alertToDismiss,
      dismissedAt: new Date().toISOString(),
      dismissedBy: `${currentUser.name} (${currentUser.institution || "EOC Command"})`,
      actionTaken: "Reviewed and cleared by official duty officer.",
      resolutionNotes: "Disaster management protocol verified. Threat subsided or perimeter secured."
    };

    setDismissedAlertsHistory((prev) => [newDismissedEntry, ...prev]);
    setDismissedAlertIds((prev) => [...prev, alertToDismiss.id]);
  };

  // Handler to restore a dismissed alert back to active
  const handleRestoreAlert = (alertToRestore: DismissedAlert) => {
    if (currentUser.role === "guest") {
      setRoleRestrictionNotice({
        isOpen: true,
        title: "Official Authorization Required",
        description: `Re-activating archived geological alerts requires Official or Administrator privileges. Switch user role in top header.`
      });
      return;
    }

    setDismissedAlertsHistory((prev) => prev.filter((a) => a.id !== alertToRestore.id));
    setDismissedAlertIds((prev) =>
      prev.filter((id) => id !== alertToRestore.id && id !== `alert_vol_${alertToRestore.id}` && id !== `alert_eq_${alertToRestore.id}`)
    );
  };

  // Handler to update resolution notes
  const handleUpdateNotes = (alertId: string, notes: string) => {
    if (currentUser.role === "guest") {
      setRoleRestrictionNotice({
        isOpen: true,
        title: "Official Authorization Required",
        description: `Saving resolution notes requires Official or Administrator privileges.`
      });
      return;
    }

    setDismissedAlertsHistory((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, resolutionNotes: notes } : item))
    );
  };

  // Handler to add manual historical log
  const handleAddManualHistory = (newAlert: DismissedAlert) => {
    if (currentUser.role === "guest") {
      setRoleRestrictionNotice({
        isOpen: true,
        title: "Official Authorization Required",
        description: `Logging historical disaster records requires Official or Administrator privileges.`
      });
      return;
    }

    setDismissedAlertsHistory((prev) => [newAlert, ...prev]);
    if (!dismissedAlertIds.includes(newAlert.id)) {
      setDismissedAlertIds((prev) => [...prev, newAlert.id]);
    }
  };

  // Handler to clear history
  const handleClearHistory = () => {
    if (currentUser.role === "guest") {
      setRoleRestrictionNotice({
        isOpen: true,
        title: "Official Authorization Required",
        description: `Clearing disaster alert logs requires Administrator privileges.`
      });
      return;
    }

    if (window.confirm("Are you sure you want to clear the entire recent alert history log?")) {
      setDismissedAlertsHistory([]);
      setDismissedAlertIds([]);
    }
  };

  // Fetch Volcanoes and Earthquakes with robust client-side validation
  const loadData = async () => {
    setManualRefreshSpin(true);
    setLoadingVolcanoes(true);
    setLoadingEarthquakes(true);

    try {
      const volRes = await fetch("/api/volcanoes");
      const contentType = volRes.headers.get("content-type");
      if (volRes.ok && contentType && contentType.includes("application/json")) {
        const volData = await volRes.json();
        setVolcanoes(volData);
        localStorage.setItem("essgi_volcanoes", JSON.stringify(volData));
      }
    } catch {
      // silent cache fallback
    } finally {
      setLoadingVolcanoes(false);
    }

    try {
      const eqRes = await fetch("/api/earthquakes");
      const contentType = eqRes.headers.get("content-type");
      if (eqRes.ok && contentType && contentType.includes("application/json")) {
        const eqData = await eqRes.json();
        if (eqData.success) {
          setEarthquakes(eqData.data);
          localStorage.setItem("essgi_earthquakes", JSON.stringify(eqData.data));
        }
      }
    } catch {
      // silent cache fallback
    } finally {
      setLoadingEarthquakes(false);
      setSecondsToSync(30);
      setTimeout(() => setManualRefreshSpin(false), 800);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Periodic background real-time synchronization with the Universe (auto-refresh every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToSync((prev) => {
        if (prev <= 1) {
          loadData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Active Alerts lists based on database severities
  useEffect(() => {
    const activeAlertsLists: GeologicalAlert[] = [];

    // RED and ORANGE Volcano alerts
    volcanoes
      .filter((v) => v.severity === "Red" || v.severity === "Orange")
      .forEach((v) => {
        activeAlertsLists.push({
          id: `alert_vol_${v.id}`,
          title: `CRITICAL ALERT: Magmatic Turmoil at ${v.name}`,
          type: "volcanic",
          severity: v.severity,
          location: v.region,
          dateTime: v.updatedAt,
          description: `Thermal heat flux signatures indicate magmatic expansion. Safety exclusion circles must be enforced by disaster authorities.`
        });
      });

    // Earthquakes meeting dynamic threshold configuration
    const minMag = alertThresholdConfig?.minMagnitude ?? 4.5;
    const maxDep = alertThresholdConfig?.maxDepth ?? 35;

    earthquakes
      .filter((e) => e.magnitude >= minMag && e.depth <= maxDep)
      .slice(0, 6) // keep top matching events
      .forEach((e) => {
        const isCritical = e.magnitude >= 5.0 || e.severity === "Red";
        activeAlertsLists.push({
          id: `alert_eq_${e.id}`,
          title: `SEISMIC EVENT: M ${e.magnitude.toFixed(1)} Earthquake (Threshold ≥ M${minMag.toFixed(1)})`,
          type: "seismic",
          severity: isCritical ? "Red" : e.severity === "Orange" ? "Orange" : "Yellow",
          location: e.location,
          dateTime: e.dateTime,
          description: `Seismic rupture recorded at depth ${e.depth}km (Limit ≤ ${maxDep}km). Automated Channels: ${alertThresholdConfig?.smsAlertsEnabled ? "SMS Active" : "SMS Off"} | ${alertThresholdConfig?.emailAlertsEnabled ? "Email Active" : "Email Off"}.`
        });
      });

    setAlerts(activeAlertsLists.filter((a) => !dismissedAlertIds.includes(a.id)));
  }, [volcanoes, earthquakes, dismissedAlertIds, alertThresholdConfig]);

  // Real-time Audio alert detection monitor for Red & Orange events
  useEffect(() => {
    if (volcanoes.length === 0 && earthquakes.length === 0) return;

    const currentRedOrOrangeEvents: { id: string; name: string; type: "volcano" | "earthquake"; severity: "Red" | "Orange"; location: string }[] = [];

    volcanoes.forEach((v) => {
      if (v.severity === "Red" || v.severity === "Orange") {
        currentRedOrOrangeEvents.push({
          id: v.id,
          name: v.name,
          type: "volcano",
          severity: v.severity,
          location: v.region
        });
      }
    });

    earthquakes.forEach((eq) => {
      if (eq.severity === "Red" || eq.severity === "Orange") {
        currentRedOrOrangeEvents.push({
          id: eq.id,
          name: `M ${eq.magnitude.toFixed(1)} Temblor`,
          type: "earthquake",
          severity: eq.severity,
          location: eq.location
        });
      }
    });

    const currentRedOrOrangeIds = new Set(currentRedOrOrangeEvents.map(e => e.id));

    const isStartupPhase = Date.now() - systemMountTimeRef.current < 15000;

    if (isInitialLoadRef.current || isStartupPhase) {
      // System startup phase: populate known IDs silently to prevent unwanted alert popups on open
      knownEventIdsRef.current = currentRedOrOrangeIds;
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
      return;
    }

    // Identify new high-severity events that were not previously in knownEventIdsRef
    const newEvents = currentRedOrOrangeEvents.filter(e => !knownEventIdsRef.current.has(e.id));

    // Update known IDs with all currently active ones
    knownEventIdsRef.current = currentRedOrOrangeIds;

    if (newEvents.length > 0) {
      // Play audio alert if enabled
      if (audioAlertsEnabled) {
        const highestSeverity = newEvents.some(e => e.severity === "Red") ? "Red" : "Orange";
        playGeologicalAlertSound(highestSeverity);
      }

      // Generate visual notification toast for real-time new alert
      const newToasts = newEvents.map((e) => ({
        id: `toast_${e.id}_${Date.now()}`,
        name: e.name,
        type: e.type,
        severity: e.severity,
        message: e.type === "volcano"
          ? `Real-time alert active for ${e.name} caldera in ${e.location}.`
          : `Real-time significant seismic tremor detected near ${e.location}.`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      }));

      setActiveAudioAlertToasts((prev) => [...prev, ...newToasts]);
    }
  }, [volcanoes, earthquakes, audioAlertsEnabled]);

  // Auto-dismiss audio alerts toasts after 8 seconds
  useEffect(() => {
    if (activeAudioAlertToasts.length === 0) return;
    const timer = setTimeout(() => {
      setActiveAudioAlertToasts((prev) => prev.filter((toast, idx) => idx > 0));
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeAudioAlertToasts]);

  // Insert Volcanic Advisory Activity
  const handleAddVolcano = async (vData: Omit<Volcano, "id" | "updatedAt">): Promise<boolean> => {
    try {
      const res = await authenticatedFetch("/api/volcanoes", {
        method: "POST",
        body: JSON.stringify(vData),
      });
      if (res.ok) {
        await loadData();
        return true;
      }
    } catch {
      // fallback to saveVolcanoToFirestore helper
      await saveVolcanoToFirestore({
        ...vData,
        id: "v_" + Date.now(),
        updatedAt: new Date().toISOString()
      });
    }

    await loadData();
    return true;
  };

  // Delete Volcanic Entry (Admin authority)
  const handleDeleteVolcano = async (id: string) => {
    if (currentUser.role !== "admin" && currentUser.role !== "superadmin") return;
    if (!window.confirm("Confirm deletion of this monitored volcanic catalog record? This action is irreversible.")) return;

    try {
      await authenticatedFetch(`/api/volcanoes/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    } catch {
      await deleteVolcanoFromFirestore(id);
    }

    await loadData();

    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  // Directory Filters
  const filteredVolcanoes = volcanoes.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(volcanoSearch.toLowerCase()) ||
                          v.region.toLowerCase().includes(volcanoSearch.toLowerCase()) ||
                          v.type.toLowerCase().includes(volcanoSearch.toLowerCase());
    const matchesSeverity = volcanoSeverity === "All" || v.severity === volcanoSeverity;
    return matchesSearch && matchesSeverity;
  });

  const filteredEarthquakes = earthquakes.filter((eq) => {
    const matchesSearch = eq.location.toLowerCase().includes(eqSearch.toLowerCase()) ||
                          (eq.description && eq.description.toLowerCase().includes(eqSearch.toLowerCase()));
    const matchesMag = eq.magnitude >= eqMinMag;
    const matchesDepth = eq.depth <= eqMaxDepth;

    // Date range filter logic
    let matchesDate = true;
    if (eqDatePreset !== "all" && eq.dateTime) {
      const eqTime = new Date(eq.dateTime).getTime();
      const now = Date.now();
      if (!isNaN(eqTime)) {
        if (eqDatePreset === "24h") {
          matchesDate = eqTime >= now - 24 * 60 * 60 * 1000;
        } else if (eqDatePreset === "7d") {
          matchesDate = eqTime >= now - 7 * 24 * 60 * 60 * 1000;
        } else if (eqDatePreset === "30d") {
          matchesDate = eqTime >= now - 30 * 24 * 60 * 60 * 1000;
        } else if (eqDatePreset === "90d") {
          matchesDate = eqTime >= now - 90 * 24 * 60 * 60 * 1000;
        } else if (eqDatePreset === "1y") {
          matchesDate = eqTime >= now - 365 * 24 * 60 * 60 * 1000;
        } else if (eqDatePreset === "custom") {
          if (eqStartDate) {
            const start = new Date(eqStartDate + "T00:00:00").getTime();
            if (!isNaN(start)) {
              matchesDate = matchesDate && eqTime >= start;
            }
          }
          if (eqEndDate) {
            const end = new Date(eqEndDate + "T23:59:59.999").getTime();
            if (!isNaN(end)) {
              matchesDate = matchesDate && eqTime <= end;
            }
          }
        }
      }
    }

    return matchesSearch && matchesMag && matchesDepth && matchesDate;
  });

  // Reset earthquake page to 1 whenever filters change
  useEffect(() => {
    setEqPage(1);
  }, [eqSearch, eqMinMag, eqMaxDepth, eqDatePreset, eqStartDate, eqEndDate]);

  // Compute pagination parameters
  const totalEqPages = Math.ceil(filteredEarthquakes.length / eqPerPage) || 1;
  const paginatedEarthquakes = filteredEarthquakes.slice((eqPage - 1) * eqPerPage, eqPage * eqPerPage);

  return (
    <div 
      className="min-h-screen text-slate-800 flex flex-col font-sans selection:bg-[#0085C8] selection:text-white transition-colors duration-200 relative overflow-x-hidden bg-white pb-20 lg:pb-0"
    >
      {/* 1. TOP OFFICIAL GOVERNMENT HEADER */}
      <div className="relative z-50 bg-white">
        <Navbar
          activePage={activeTab === "home" ? "home" : "dashboard"}
          setActivePage={(page) => {
            if (page === "home") setActiveTab("home");
            else setActiveTab("dashboard");
          }}
          activeTab={activeTab === "analytics" ? "dashboard" : activeTab}
          setActiveTab={(tab) => {
            if (tab === "analytics") {
              setActiveTab("dashboard");
              setDashboardSubTab("analytics");
            } else {
              setActiveTab(tab as any);
            }
          }}
          onSelectDashboardSubTab={(subTab) => {
            setActiveTab("dashboard");
            setDashboardSubTab(subTab as any);
          }}
          onSelectAnalyticsSubTab={(subTab) => {
            setActiveTab("dashboard");
            if (subTab === "charts") setDashboardSubTab("analytics");
            else if (subTab === "furi") setDashboardSubTab("gnss");
            else setDashboardSubTab(subTab as any);
          }}
          onSelectReportType={(topic) => {
            setSelectedReportTopic(topic);
            setActiveTab("report");
          }}
          theme={theme}
          toggleTheme={() => {}}
          searchQuery=""
          setSearchQuery={() => {}}
          userRole={currentUser}
          onChangeRole={() => {
            setAuthModalTab("signin");
            setIsAuthModalOpen(true);
          }}
          onSignOut={handleSignOut}
          pendingApprovalsCount={0}
          onSelectAnnouncement={(ann) => setSelectedAnnouncement(ann)}
        />
      </div>

      {/* 2. LIVE SEISMIC SCROLLING TICKER */}
      <div className="bg-[#030914] py-2 px-4 md:px-6 overflow-hidden relative font-mono text-[11.5px] shrink-0 z-20 border-b border-[#00D4FF]/20 text-slate-100 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="bg-[#0085C8] text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0 uppercase text-[10px] tracking-wider shadow-sm border border-[#00D4FF]/30">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-300" />
            Live Stream
          </span>
          <div className="flex-grow overflow-hidden w-full relative">
            <div className="flex gap-12 whitespace-nowrap animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused] text-slate-200 font-semibold">
              {alerts.length ? (
                alerts.map((al) => (
                  <span
                    key={al.id}
                    onClick={() => {
                      setActiveTab("map");
                      const item_id = al.id.replace("alert_vol_", "").replace("alert_eq_", "");
                      setSelectedItem({
                        type: al.type === "volcanic" ? "volcano" : "earthquake",
                        id: item_id
                      });
                    }}
                    className="hover:text-[#00D4FF] cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full inline-block ${al.severity === "Red" ? "bg-rose-500 animate-ping" : al.severity === "Orange" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                    <strong className="text-[#00D4FF]">[{al.location}]</strong> {al.title} - Severity Level {al.severity}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">No critical magmatic warnings active at this epoch. Monitoring system calm.</span>
              )}
            </div>
          </div>
          <button
            onClick={loadData}
            title="Force refresh database telemetry"
            className="text-slate-300 hover:text-[#00D4FF] transition-all border-l border-slate-800 pl-3 shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span className="text-[10.5px] font-mono text-slate-300 font-bold tracking-tight uppercase select-none">Sync in {secondsToSync}s</span>
            <RefreshCw className={`w-3.5 h-3.5 ${manualRefreshSpin ? "animate-spin text-[#00D4FF]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 3. MAIN CENTRAL CONTENT CANVAS */}
      <main className="flex-grow p-4 md:p-6 bg-transparent transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

          {cometPortalItem ? (
            <CometPortal
              item={cometPortalItem}
              volcanoes={volcanoes}
              earthquakes={earthquakes}
              onBack={() => setCometPortalItem(null)}
            />
          ) : (
            <>
              {/* ==================== HOME OVERVIEW VIEW ==================== */}
              {activeTab === "home" && (
                <HomePage
                  alerts={alerts}
                  secondsToSync={secondsToSync}
                  manualRefreshSpin={manualRefreshSpin}
                  onRefresh={loadData}
                  volcanoes={volcanoes}
                  earthquakes={earthquakes}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  onOpenCometPortal={(item) => setCometPortalItem(item)}
                  onOpenContact={() => setIsContactModalOpen(true)}
                  onOpenLogin={() => {
                    setAuthModalTab("signin");
                    setIsAuthModalOpen(true);
                  }}
                  onLaunchDashboard={() => setActiveTab("dashboard")}
                  onNavigateToTab={(tab) => {
                    if (tab === "volcanoes" || tab === "earthquakes") {
                      setActiveTab("analytics");
                      setAnalyticsSubTab(tab);
                    } else {
                      setActiveTab(tab as any);
                    }
                  }}
                  onSelectAlert={(al) => {
                    const item_id = al.id.replace("alert_vol_", "").replace("alert_eq_", "");
                    setSelectedItem({
                      type: al.type === "volcanic" ? "volcano" : "earthquake",
                      id: item_id,
                    });
                  }}
                />
              )}

              {/* ==================== INSTITUTIONAL PAGES ==================== */}
              {activeTab === "about" && (
                <AboutSSGIPage onNavigateToTab={(tab) => setActiveTab(tab as any)} />
              )}
              {activeTab === "focus" && (
                <FocusAreasPage onNavigateToTab={(tab) => setActiveTab(tab as any)} />
              )}
              {activeTab === "contact" && (
                <ContactUsPage onNavigateToTab={(tab) => setActiveTab(tab as any)} />
              )}
              {activeTab === "mission" && (
                <MissionMandatePage onNavigateToTab={(tab) => setActiveTab(tab as any)} />
              )}
              {activeTab === "sectors" && (
                <SectorsPage
                  onNavigateToTab={(tab) => setActiveTab(tab as any)}
                  onOpenSectorModal={(sec) => setSelectedSector(sec)}
                />
              )}
              {activeTab === "announcements" && (
                <AnnouncementsPage
                  onNavigateToTab={(tab) => setActiveTab(tab as any)}
                  selectedAnnouncement={selectedAnnouncement}
                  onSelectAnnouncement={(ann) => setSelectedAnnouncement(ann)}
                  onOpenAnnouncementModal={(ann) => setSelectedAnnouncement(ann)}
                />
              )}
              {/* ==================== A. DASHBOARD VIEW ==================== */}
              {activeTab === "dashboard" && (
            <div className="space-y-5">
              {/* Institutional Federal Cockpit Hero Banner */}
              <div className="relative overflow-hidden rounded-xl bg-[#0A2540] text-white border border-slate-700/70 border-b-3 border-b-[#D48F29] shadow-md select-none">
                {/* Background image with light overlay */}
                <div className="absolute inset-0">
                  <img
                    src={essgiBannerBg}
                    alt="SSGI Banner Background"
                    className="w-full h-full object-cover opacity-15"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540] via-[#0A2540]/90 to-[#0A2540]/70" />
                </div>

                <div className="relative z-10 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#D48F29]/20 border border-[#D48F29]/40 text-[#F7D08A] text-[9px] font-mono tracking-wider uppercase font-semibold">
                        <Building2 className="w-3 h-3 text-[#F7D08A]" />
                        NATIONAL GEOHAZARD COCKPIT &bull; EARS NETWORK
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[8.5px] font-mono font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        TELEMETRY STREAM: 20 Hz LIVE
                      </span>
                    </div>

                    <div>
                      <div className="text-[10.5px] font-amharic text-cyan-200/80 font-medium mb-0.5">
                        የኢትዮጵያ ስፔስ ሳይንስ እና ጂኦስፓሻል ኢንስቲትዩት &bull; ብሔራዊ የጂኦዳይናሚክስ መቆጣጠሪያ ፖርታል
                      </div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-sans tracking-tight text-white uppercase">
                        Geohazard &amp; Earth Observation Cockpit
                      </h2>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed max-w-2xl font-normal">
                      Continuous real-time surveillance of the Main Ethiopian Rift (MER), Afar Triple Junction, and active magma bodies. Real-time telemetry integrated with the USGS Global Seismographic Network, COMET InSAR deformation archives, and the FURI broadband seismic node.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-300 font-mono">
                      <span className="flex items-center gap-1.5 border-r border-slate-600/60 pr-3">
                        <Compass className="w-3.5 h-3.5 text-cyan-400" />
                        Afar Rift Transect (EARS)
                      </span>
                      <span className="flex items-center gap-1.5 border-r border-slate-600/60 pr-3">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        9°04'48.0"N, 38°43'12.0"E (Addis Ababa)
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Network Operational
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start md:items-center gap-2 shrink-0">
                    {/* Toggle Cockpit Navigation Sidebar */}
                    <button
                      id="toggle-cockpit-sidebar-btn"
                      onClick={toggleCockpitSidebar}
                      className={`font-mono text-[9.5px] uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 font-semibold shadow-xs border ${
                        isCockpitSidebarCollapsed
                          ? "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/15"
                      }`}
                      title={isCockpitSidebarCollapsed ? "Show Navigation Sidebar" : "Hide Sidebar to maximize workspace"}
                    >
                      {isCockpitSidebarCollapsed ? (
                        <>
                          <PanelLeftOpen className="w-3.5 h-3.5" />
                          <span>Show Sidebar</span>
                        </>
                      ) : (
                        <>
                          <PanelLeftClose className="w-3.5 h-3.5" />
                          <span>Hide Sidebar</span>
                        </>
                      )}
                    </button>

                    {(dashboardAdvisoryFilter !== "all" || dashboardZoneFilter !== "all") && (
                      <button
                        onClick={() => {
                          setDashboardAdvisoryFilter("all");
                          setDashboardZoneFilter("all");
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold font-mono text-[9.5px] uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1 border border-amber-600"
                      >
                        <span>&times; Reset Active Filters</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* EXECUTIVE DASHBOARD LAYOUT WITH COLLAPSIBLE LEFT-SIDE VERTICAL NAVIGATION SIDEBAR */}
              <div className="flex flex-col lg:flex-row items-start gap-5 w-full">
                {/* LEFT-SIDE VERTICAL NAVIGATION SIDEBAR */}
                {!isCockpitSidebarCollapsed && (
                  <CockpitSidebar
                    activeSubTab={dashboardSubTab}
                    onSelectSubTab={(tab) => setDashboardSubTab(tab)}
                    volcanoes={volcanoes}
                    earthquakes={earthquakes}
                    dashboardZoneFilter={dashboardZoneFilter}
                    onSelectZoneFilter={(filter) => setDashboardZoneFilter(filter)}
                    currentUser={currentUser}
                    isCollapsed={isCockpitSidebarCollapsed}
                    onToggleCollapse={toggleCockpitSidebar}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onNavigateTab={(tab) => {
                      setViewMode(tab === "home" ? "home" : "dashboard");
                      setActiveTab(tab as any);
                    }}
                  />
                )}

                {/* RIGHT-SIDE ACTIVE MONITORING CONTENT */}
                <div className="flex-1 min-w-0 w-full space-y-5">
                  {/* Collapsed Sidebar Quick Navigation & Expand Toolbar */}
                  {isCockpitSidebarCollapsed && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={toggleCockpitSidebar}
                          className="bg-[#0E4A72] hover:bg-[#0085C8] text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title="Restore Navigation Sidebar"
                        >
                          <PanelLeftOpen className="w-4 h-4 text-cyan-200" />
                          <span>Show Navigation</span>
                        </button>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                        <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hidden md:inline">
                          Active Module: <span className="text-[#0E4A72] dark:text-sky-400 font-bold capitalize">{dashboardSubTab}</span>
                        </span>
                      </div>

                      {/* Quick Module Switcher Tabs when in Full Width */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                        {[
                          { id: "overview", label: "Overview" },
                          { id: "volcanoes", label: "Volcanoes" },
                          { id: "earthquakes", label: "Earthquakes" },
                          { id: "seismicwave", label: "Seismic Waves (FURI)" },
                          { id: "gnss", label: "GNSS Geodesy" },
                          { id: "observatory", label: "InSAR & Observatory" },
                          { id: "analytics", label: "Analytics" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setDashboardSubTab(item.id as any)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
                              dashboardSubTab === item.id
                                ? "bg-[#0E4A72] text-white border-[#0E4A72] shadow-2xs"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* OVERVIEW SUB-TAB CONTENT */}
                  {dashboardSubTab === "overview" && (
                    <div className="space-y-5">
                      <CockpitOverview
                        volcanoes={volcanoes}
                        earthquakes={earthquakes}
                        onNavigateTab={(tab) => {
                          setViewMode(tab === "home" ? "home" : "dashboard");
                          setActiveTab(tab);
                        }}
                        onSelectSubTab={(subTab) => setDashboardSubTab(subTab)}
                        onSelectEarthquake={(id) => {
                          setViewMode("dashboard");
                          setActiveTab("map");
                          setSelectedItem({ type: "earthquake", id });
                        }}
                        loadingUSGS={loadingUSGS}
                        usgsError={usgsError}
                        refetchUSGS={refetchUSGS}
                        secondsToSync={secondsToSync}
                        eqSearch={eqSearch}
                        setEqSearch={setEqSearch}
                        volcanoSearch={volcanoSearch}
                        setVolcanoSearch={setVolcanoSearch}
                      />

              {/* Quick Summary Widgets styled as high-fidelity interactive toggle cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* Total Earthquakes Toggle Card */}
                <div
                  onMouseEnter={() => setIsSeismicHovered(true)}
                  onMouseLeave={() => setIsSeismicHovered(false)}
                  onClick={() => setDashboardAdvisoryFilter(dashboardAdvisoryFilter === "seismic" ? "all" : "seismic")}
                  className={`p-4 rounded-lg relative border transition-colors cursor-pointer select-none group bg-white dark:bg-slate-900 ${
                    dashboardAdvisoryFilter === "seismic"
                      ? "border-[#0E4A72] dark:border-sky-500 ring-1 ring-[#0E4A72] dark:ring-sky-500 bg-blue-50/20 dark:bg-slate-800/80 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                  title="Click to toggle Seismic Alert filtering on advisories list below"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Seismic Ingests</span>
                    </div>
                    {dashboardAdvisoryFilter === "seismic" ? (
                      <span className="bg-[#0E4A72] text-white text-[8px] font-mono px-1.5 py-0.5 rounded font-bold">FILTER ON</span>
                    ) : (
                      <Activity className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">
                    {loadingEarthquakes ? "..." : earthquakes.length}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                    {dashboardAdvisoryFilter === "seismic" ? "Filtered to seismic advisories" : "Click to isolate seismic alerts"}
                  </p>

                  <AnimatePresence>
                    {isSeismicHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-350"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Latest Event:</span>
                          <span className="font-semibold text-amber-700 dark:text-amber-400 truncate max-w-[130px]">
                            M {earthquakes[0]?.magnitude.toFixed(1) || "0.0"} ({earthquakes[0]?.location?.split(",")[0] || "Afar"})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Critical (M &ge; 5.0):</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">{earthquakes.filter(e => e.magnitude >= 5.0).length} active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Telemetry:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                            Continuous Feed
                          </span>
                        </div>

                        {/* 30D Trend expansion trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMetric("seismic");
                          }}
                          className="w-full mt-2 py-1 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3 text-slate-500" />
                          <span>30-Day Trends</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Volcano Status Indicators Toggle Card */}
                <div
                  onMouseEnter={() => setIsVolcanicHovered(true)}
                  onMouseLeave={() => setIsVolcanicHovered(false)}
                  onClick={() => setDashboardAdvisoryFilter(dashboardAdvisoryFilter === "volcanic" ? "all" : "volcanic")}
                  className={`p-4 rounded-lg relative border transition-colors cursor-pointer select-none group bg-white dark:bg-slate-900 ${
                    dashboardAdvisoryFilter === "volcanic"
                      ? "border-[#0E4A72] dark:border-sky-500 ring-1 ring-[#0E4A72] dark:ring-sky-500 bg-blue-50/20 dark:bg-slate-800/80 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                  title="Click to toggle Volcanic Alert filtering on advisories list below"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>Monitored Volcanoes</span>
                    </div>
                    {dashboardAdvisoryFilter === "volcanic" ? (
                      <span className="bg-[#0E4A72] text-white text-[8px] font-mono px-1.5 py-0.5 rounded font-bold">FILTER ON</span>
                    ) : (
                      <Flame className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">
                    {loadingVolcanoes ? "..." : volcanoes.length}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                    {dashboardAdvisoryFilter === "volcanic" ? "Filtered to volcanic advisories" : "Click to isolate volcanic alerts"}
                  </p>

                  <AnimatePresence>
                    {isVolcanicHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-350"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">High Threat:</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {volcanoes.filter(v => v.severity === "Red" || v.severity === "Orange").length} Active Centers
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Primary Center:</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">{volcanoes.find(v => v.severity === "Red")?.name || "Erta Ale"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Satellite Feed:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                            Sentinel-2 / MODIS
                          </span>
                        </div>

                        {/* 30D Trend expansion trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMetric("volcanic");
                          }}
                          className="w-full mt-2 py-1 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3 text-slate-500" />
                          <span>30-Day Trends</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Maximum Tremor Magnitude / High Risk Toggle Card */}
                <div
                  onMouseEnter={() => setIsFocalHovered(true)}
                  onMouseLeave={() => setIsFocalHovered(false)}
                  onClick={() => setDashboardZoneFilter(dashboardZoneFilter === "high-risk" ? "all" : "high-risk")}
                  className={`p-4 rounded-lg relative border transition-colors cursor-pointer select-none group bg-white dark:bg-slate-900 ${
                    dashboardZoneFilter === "high-risk"
                      ? "border-[#0E4A72] dark:border-sky-500 ring-1 ring-[#0E4A72] dark:ring-sky-500 bg-blue-50/20 dark:bg-slate-800/80 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                  title="Click to filter hotspots zone below to High Risk areas (Score &ge; 7)"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>Max Recorded Magnitude</span>
                    </div>
                    {dashboardZoneFilter === "high-risk" ? (
                      <span className="bg-[#0E4A72] text-white text-[8px] font-mono px-1.5 py-0.5 rounded font-bold">FILTER ON</span>
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight">
                    M {earthquakes.length ? Math.max(...earthquakes.map((e) => e.magnitude)).toFixed(1) : "0.0"}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                    {dashboardZoneFilter === "high-risk" ? "Filtered to threat index &ge; 7/10" : "Click to view high-risk zones"}
                  </p>

                  <AnimatePresence>
                    {isFocalHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-350"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">High Risk Sectors:</span>
                          <span className="font-semibold text-red-600 dark:text-red-400 font-mono">
                            {ETHIOPIA_ACTIVE_ZONES.filter(z => z.riskScore >= 7).length} Designated
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Peak Threat Index:</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">9.2/10 (Afar Rift)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Active Warnings:</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {alerts.filter(a => a.severity === "Red").length} Critical
                          </span>
                        </div>

                        {/* 30D Trend expansion trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMetric("focal");
                          }}
                          className="w-full mt-2 py-1 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3 text-slate-500" />
                          <span>30-Day Trends</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* System Monitoring Uptime Status / Seismic Vulnerability Toggle Card */}
                <div
                  onMouseEnter={() => setIsGeodeticHovered(true)}
                  onMouseLeave={() => setIsGeodeticHovered(false)}
                  onClick={() => setDashboardZoneFilter(dashboardZoneFilter === "seismic" ? "all" : "seismic")}
                  className={`p-4 rounded-lg relative border transition-colors cursor-pointer select-none group bg-white dark:bg-slate-900 ${
                    dashboardZoneFilter === "seismic"
                      ? "border-[#0E4A72] dark:border-sky-500 ring-1 ring-[#0E4A72] dark:ring-sky-500 bg-blue-50/20 dark:bg-slate-800/80 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                  title="Click to toggle Seismic Vulnerability filtering on active danger zones list below"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Geodetic Status</span>
                    </div>
                    {dashboardZoneFilter === "seismic" ? (
                      <span className="bg-[#0E4A72] text-white text-[8px] font-mono px-1.5 py-0.5 rounded font-bold">FILTER ON</span>
                    ) : (
                      <Compass className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                    <span>ACTIVE</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                    {dashboardZoneFilter === "seismic" ? "Filtered to seismic corridors" : "Continuous GNSS telemetry"}
                  </p>

                  <AnimatePresence>
                    {isGeodeticHovered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-350"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">GNSS Stations:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                            {ETHIOPIA_ACTIVE_ZONES.length * 3} Online
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Stream Latency:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">&lt; 140ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Network Availability:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">99.98% uptime</span>
                        </div>

                        {/* 30D Trend expansion trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMetric("geodetic");
                          }}
                          className="w-full mt-2 py-1 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3 text-slate-500" />
                          <span>30-Day Trends</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* National Geospatial Observatories & Field Stations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
                <div className="relative overflow-hidden rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={entotoObservatory}
                      alt="Entoto Astronomical Observatory"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-amber-400 border border-amber-500/30 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded">
                      Space & Astronomy
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 text-white font-semibold text-xs tracking-wide">
                      3,200m Altitude Station &bull; Entoto
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wide">
                        Entoto Deep-Space Observatory
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Tracks satellite orbital paths over the Horn of Africa and houses twin high-precision optical telescopes aligned to deep celestial sectors.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("gallery")}
                      className="text-[#0E4A72] hover:text-[#0085C8] dark:text-sky-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 font-mono pt-1 cursor-pointer"
                    >
                      <span>Explore Station Archive</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={ertaAleLava}
                      alt="Erta Ale Boiling Lava Lake"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-rose-400 border border-rose-500/30 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded">
                      Active Volcanology
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 text-white font-semibold text-xs tracking-wide">
                      Afar Triangle Depression
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wide">
                        Erta Ale Volcanic Observatory
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Continuous thermal monitoring of the active basaltic lava lake, rift valley magma plumbing, sulfur vent flux, and crustal spreading dynamics.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("analytics");
                        setAnalyticsSubTab("volcanoes");
                      }}
                      className="text-[#0E4A72] hover:text-[#0085C8] dark:text-sky-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 font-mono pt-1 cursor-pointer"
                    >
                      <span>View Volcanic Telemetry</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={dallolSprings}
                      alt="Dallol Acid Hydrothermal Pools"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded">
                      Geothermal Extremes
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 text-white font-semibold text-xs tracking-wide">
                      -130m Below Sea Level &bull; Danakil
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wide">
                        Dallol Hydrothermal Complex
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        Hyper-acidic geothermal brine basins serving as terrestrial analog field sites for extreme-environment geochemical and geophysical modeling.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("map")}
                      className="text-[#0E4A72] hover:text-[#0085C8] dark:text-sky-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 font-mono pt-1 cursor-pointer"
                    >
                      <span>Locate on GIS Map</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dashboard Row 2: Statistics Charts Panel */}
              <GeologyCharts volcanoes={filteredVolcanoes} earthquakes={filteredEarthquakes} />

              {/* Dashboard Row 3: Active Danger Alerts Advisory Bulletin */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg shadow-2xs space-y-4">
                <div className="border-b border-slate-150 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-[#0E4A72] rounded-full inline-block"></span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase font-mono">
                      Current Regional Geohazard Advisories ({
                        alerts.filter((al) => {
                          if (dashboardAdvisoryFilter === "all") return true;
                          if (dashboardAdvisoryFilter === "volcanic") return al.type === "volcanic";
                          if (dashboardAdvisoryFilter === "seismic") return al.type === "seismic";
                          return true;
                        }).length
                      })
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                    {dashboardAdvisoryFilter !== "all" && (
                      <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono px-2 py-0.5 rounded text-[8.5px] border border-amber-200 dark:border-amber-800 font-semibold">
                        Filter: {dashboardAdvisoryFilter}
                      </span>
                    )}

                    {/* Button to toggle Recent Alerts History side panel */}
                    <button
                      onClick={() => setIsHistoryPanelOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Alert Archive ({dismissedAlertsHistory.length})</span>
                    </button>
                  </div>
                </div>

                {alerts.filter((al) => {
                  if (dashboardAdvisoryFilter === "all") return true;
                  if (dashboardAdvisoryFilter === "volcanic") return al.type === "volcanic";
                  if (dashboardAdvisoryFilter === "seismic") return al.type === "seismic";
                  return true;
                }).length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {alerts
                      .filter((al) => {
                        if (dashboardAdvisoryFilter === "all") return true;
                        if (dashboardAdvisoryFilter === "volcanic") return al.type === "volcanic";
                        if (dashboardAdvisoryFilter === "seismic") return al.type === "seismic";
                        return true;
                      })
                      .map((al) => (
                        <AdvisoryCard
                          key={al.id}
                          alert={al}
                          currentUserRole={currentUser.role}
                          onDismiss={handleDismissAlert}
                          onInspectMap={(rawId, type) => {
                            setActiveTab("map");
                            setSelectedItem({
                              type,
                              id: rawId
                            });
                          }}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-mono">
                    No active advisories found matching the current criteria.
                  </div>
                )}
              </div>

              {/* Dashboard Row 4: Frequently Active Geological Hotspots of Ethiopia */}
              <div id="ethiopia_danger_hotspots_panel" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg shadow-2xs space-y-4">
                <div className="border-b border-slate-150 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs tracking-wider uppercase flex items-center gap-2 font-mono">
                      <span className="w-1.5 h-3.5 bg-[#0E4A72] rounded-full inline-block shrink-0"></span>
                      <span>Volcano &amp; Earthquake Active Tectonic Corridors (Ethiopia Sector)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                      Designated high-risk continental tectonic corridors monitored continuously by ESSGI Directorate.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {dashboardZoneFilter !== "all" && (
                      <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold font-mono px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 uppercase">
                        Filter: {dashboardZoneFilter}
                      </span>
                    )}
                    <span className="text-[9.5px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">
                      EAST AFRICAN RIFT SYSTEM
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {ETHIOPIA_ACTIVE_ZONES.filter((zone) => {
                    if (dashboardZoneFilter === "all") return true;
                    if (dashboardZoneFilter === "high-risk") return zone.riskScore >= 7;
                    if (dashboardZoneFilter === "volcanic") return zone.volcanicVulnerability === "High" || zone.volcanicVulnerability === "Extremely High";
                    if (dashboardZoneFilter === "seismic") return zone.seismicVulnerability === "High" || zone.seismicVulnerability === "Extremely High";
                    return true;
                  }).map((zone) => (
                    <div key={zone.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 transition-colors bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600 inline-block shrink-0"></span>
                            {zone.name}
                          </h4>
                          <span className="text-[9.5px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                            Threat: {zone.riskScore}/10
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal font-sans">{zone.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md border border-slate-150 dark:border-slate-800 text-[10.5px]">
                          <div>
                            <span className="text-slate-400 font-semibold block text-[8.5px] uppercase font-mono leading-none mb-0.5">Volcanic Vulnerability</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase text-[10px]">{zone.volcanicVulnerability}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block text-[8.5px] uppercase font-mono leading-none mb-0.5">Seismic Vulnerability</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase text-[10px]">{zone.seismicVulnerability}</span>
                          </div>
                        </div>

                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-sans pt-0.5">
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold block uppercase text-[8.5px] font-mono tracking-wider">Notable Historical Ruptures:</strong>
                          <span className="text-slate-600 dark:text-slate-400">{zone.historicalEvents}</span>
                        </div>

                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-sans pt-0.5">
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold block uppercase text-[8.5px] font-mono tracking-wider">Directorate Assessment:</strong>
                          <span className="text-slate-600 dark:text-slate-400">{zone.geologicalContext}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {zone.majorVents.map((vent) => (
                            <span key={vent} className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                              {vent}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-3 text-[10px] font-mono text-slate-500">
                        <span>{zone.coordinates[0].toFixed(2)}°N, {zone.coordinates[1].toFixed(2)}°E</span>
                        <button
                          onClick={() => {
                            setActiveTab("map");
                            setSelectedItem({ type: "volcano", id: zone.id });
                          }}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[#0E4A72] dark:text-sky-400 font-semibold px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer text-[10px]"
                        >
                          <Map className="w-3 h-3" />
                          <span>View on GIS Map</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard Row 5: Admin Audit Logs (visible only to admins) */}
              {currentUser.role === "admin" && (
                <div id="admin_audit_logs_panel" className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Directorate Volcanic DB Audit Logs</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        Secure transaction log capturing creation, updates, and archival deletions performed by verified operators.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={loadAuditLogs}
                        disabled={loadingAuditLogs}
                        className="bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg p-1.5 px-3 flex items-center gap-1.5 transition-all text-[11px] font-medium cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingAuditLogs ? "animate-spin" : ""}`} />
                        <span>Refresh Logs</span>
                      </button>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold font-mono px-2 py-0.5 rounded border border-emerald-150 uppercase">
                        Secured System Logs
                      </span>
                    </div>
                  </div>

                  {loadingAuditLogs ? (
                    <div className="py-8 text-center text-slate-450 text-xs italic flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-550" />
                      <span>Retrieving secure ledger entries from DSS node...</span>
                    </div>
                  ) : auditLogs.length > 0 ? (
                    <div className="overflow-hidden border border-slate-150 rounded-xl max-h-[350px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-slate-150 text-[11px] font-sans">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-450 uppercase font-mono sticky top-0 bg-slate-50/95 backdrop-blur-xs">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left">Timestamp</th>
                            <th scope="col" className="px-4 py-2 text-left">Action</th>
                            <th scope="col" className="px-4 py-2 text-left">Target Record</th>
                            <th scope="col" className="px-4 py-2 text-left">Authorized Account</th>
                            <th scope="col" className="px-4 py-2 text-left w-2/5">Transactional Details</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-150">
                          {auditLogs.map((log) => {
                            let actionBadge = "";
                            if (log.action === "create") {
                              actionBadge = "bg-emerald-50 text-emerald-700 border-emerald-150";
                            } else if (log.action === "edit") {
                              actionBadge = "bg-ssgi-blue/10 text-ssgi-blue border-ssgi-blue/20";
                            } else if (log.action === "delete") {
                              actionBadge = "bg-rose-50 text-rose-700 border-rose-150";
                            }

                            return (
                              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 font-mono text-[10.5px]">
                                  {new Date(log.timestamp).toLocaleString(undefined, {
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: false
                                  })}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold font-mono tracking-tight border uppercase ${actionBadge}`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap font-bold text-slate-800">
                                  {log.volcanoName}
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  <div className="font-semibold text-slate-700">{log.performedBy}</div>
                                  <div className="text-[9.5px] text-slate-400 font-mono leading-none mt-0.5">{log.performedByEmail}</div>
                                </td>
                                <td className="px-4 py-2.5 text-slate-600 leading-normal font-sans break-words text-[11px]">
                                  {log.details}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-slate-150 rounded-xl text-slate-400 text-xs italic space-y-2">
                      <History className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-600 not-italic">No database audits recorded yet</p>
                      <p className="max-w-[280px] mx-auto text-[11px] font-sans text-slate-400 not-italic">
                        Create, modify, or archive volcanic catalogs in the database to record audit trails inside this secure terminal segment.
                      </p>
                    </div>
                  )}
                </div>
              )}

              </div>
              )}

              {/* VOLCANIC OBSERVATORY SUB-TAB */}
              {dashboardSubTab === "volcanoes" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Volcanic Observatory Header Banner - Refined Institutional Style */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FAF9F5] via-white to-[#FFF5F5] text-slate-900 border border-slate-300 dark:border-slate-700/60 border-b-3 border-b-rose-600 shadow-md p-4 sm:p-5 md:p-6 select-none">
                    <div className="absolute inset-0">
                      <img
                        src={ertaAleLava}
                        alt="Erta Ale Active Lava Lake"
                        className="w-full h-full object-cover opacity-15 scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-100/80 border border-rose-300/80 text-rose-900 text-[10px] font-mono tracking-wider uppercase font-bold">
                          <Flame className="w-3 h-3 text-rose-600" />
                          ESSGI VOLCANOLOGY &amp; MAGMATIC PROCESSES DIVISION
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-[#0E4A72]">
                          Ethiopian Volcanic Observatory &amp; Crater Surveillance
                        </h2>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                          Continuous 24/7 thermal telemetry, satellite Sentinel-1 InSAR ground deformation tracking, and SO₂ gas flux analysis for active Ethiopian rift volcanoes.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5 shrink-0">
                        <div className="bg-white/90 border border-rose-200/80 shadow-xs p-2.5 rounded-lg text-center min-w-[100px]">
                          <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Monitored Peaks</span>
                          <span className="text-xl font-bold font-mono text-rose-700">{volcanoes.length}</span>
                        </div>
                        <div className="bg-white/90 border border-red-200/80 shadow-xs p-2.5 rounded-lg text-center min-w-[100px]">
                          <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Eruption Threat</span>
                          <span className="text-xl font-bold font-mono text-red-600">
                            {volcanoes.filter(v => v.severity === "Red").length} Red Alert
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Volcanic Grid Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {volcanoes.map((volcano) => {
                      const isRed = volcano.severity === "Red";
                      const isOrange = volcano.severity === "Orange";
                      const isYellow = volcano.severity === "Yellow";

                      let badgeBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                      if (isRed) badgeBg = "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse";
                      else if (isOrange) badgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]";
                      else if (isYellow) badgeBg = "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";

                      // Select thumbnail image
                      let cardImg = volcanicHazardBg;
                      if (volcano.name.toLowerCase().includes("erta")) cardImg = ertaAleLava;
                      else if (volcano.name.toLowerCase().includes("dallol")) cardImg = dallolSprings;
                      else if (volcano.name.toLowerCase().includes("fentale")) cardImg = volcanicRiskBg;

                      return (
                        <div
                          key={volcano.id}
                          className="bg-white/70 dark:bg-[#041B2D]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                        >
                          <div>
                            {/* Image Header with Alert Overlay */}
                            <div className="relative h-44 overflow-hidden">
                              <img
                                src={cardImg}
                                alt={volcano.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                              
                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                <span className={`text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full border backdrop-blur-md ${badgeBg}`}>
                                  {volcano.severity} SEVERITY &bull; ALERT
                                </span>
                                <span className="text-[9px] font-mono bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-md border border-white/20">
                                  {volcano.elevation}m Elev.
                                </span>
                              </div>

                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-xl font-black font-display text-white drop-shadow-md">
                                  {volcano.name}
                                </h3>
                                <p className="text-[11px] text-slate-300 font-mono font-medium truncate">
                                  {volcano.region}
                                </p>
                              </div>
                            </div>

                            {/* Details Content */}
                            <div className="p-5 space-y-3.5">
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium line-clamp-3">
                                {volcano.description}
                              </p>

                              {/* Telemetry Metrics Grid */}
                              <div className="grid grid-cols-2 gap-2 bg-slate-100/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/60 dark:border-white/5 font-mono text-[10.5px]">
                                <div>
                                  <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Activity Style</span>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                                    {volcano.activityType || "Active Magmatic"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Last Eruption</span>
                                  <span className="font-extrabold text-amber-600 dark:text-amber-400 block">
                                    {volcano.lastErupted}
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10.5px] text-slate-500 font-mono flex items-center justify-between pt-1">
                                <span className="text-slate-400">Monitoring Station:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{volcano.monitoredBy}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="p-4 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400">
                              COORDS: {volcano.coordinates[0].toFixed(2)}°N, {volcano.coordinates[1].toFixed(2)}°E
                            </span>
                            <button
                              onClick={() => {
                                setActiveTab("map");
                                setSelectedItem({ type: "volcano", id: volcano.id });
                              }}
                              className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-1 border-0"
                            >
                              <span>Inspect Crater</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EARTHQUAKE CATALOG SUB-TAB */}
              {dashboardSubTab === "earthquakes" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters control sidebar: (1 column) */}
                    <div className="bg-white/90 dark:bg-[#07131F]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm space-y-5 h-fit text-slate-800 dark:text-slate-100">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-xs tracking-wider uppercase flex items-center gap-2">
                          <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span>Seismic Filters</span>
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                          {filteredEarthquakes.length} Found
                        </span>
                      </div>

                      {/* Search bar */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold font-sans">
                        <label>Epicenter Location Keyword</label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={eqSearch}
                            onChange={(e) => setEqSearch(e.target.value)}
                            placeholder="Search Metahara, Afar, Semera..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 pl-9 pr-3 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none focus:border-teal-500 font-sans"
                          />
                        </div>
                      </div>

                      {/* Min Magnitude Slider */}
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between items-center font-semibold">
                          <label>Minimum Magnitude</label>
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800 text-[11px]">
                            &ge; M {eqMinMag.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="2.0"
                          max="6.5"
                          step="0.1"
                          value={eqMinMag}
                          onChange={(e) => setEqMinMag(parseFloat(e.target.value))}
                          className="w-full accent-rose-500 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                          <span>M 2.0 (Minor)</span>
                          <span>M 6.5 (Severe)</span>
                        </div>
                      </div>

                      {/* Max Focal Depth Slider */}
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between items-center font-semibold">
                          <label>Max Focal Depth</label>
                          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-800 text-[11px]">
                            &le; {eqMaxDepth} km
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="150"
                          step="5"
                          value={eqMaxDepth}
                          onChange={(e) => setEqMaxDepth(parseInt(e.target.value))}
                          className="w-full accent-teal-500 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                          <span>5 km (Crustal)</span>
                          <span>150 km (Deep)</span>
                        </div>
                      </div>

                      {/* Date Range Filter */}
                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-white/10 pt-3">
                        <div className="flex justify-between items-center font-semibold">
                          <label className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-[#0085C8]" />
                            <span>Date Range Filter</span>
                          </label>
                          {eqDatePreset !== "all" && (
                            <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.2 rounded border border-sky-200 dark:border-sky-800">
                              {eqDatePreset.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Preset Buttons Grid */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: "all", label: "All Time" },
                            { id: "24h", label: "Past 24h" },
                            { id: "7d", label: "Past 7d" },
                            { id: "30d", label: "Past 30d" },
                            { id: "90d", label: "Past 90d" },
                            { id: "custom", label: "Custom Range" },
                          ].map((preset) => {
                            const isSelected = eqDatePreset === preset.id;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setEqDatePreset(preset.id)}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center ${
                                  isSelected
                                    ? "bg-[#0085C8] text-white font-bold shadow-xs border border-[#0085C8]"
                                    : "bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750"
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Date Range Selectors */}
                        {eqDatePreset === "custom" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-2 pt-1.5"
                          >
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Start Date (From)</label>
                              <input
                                type="date"
                                value={eqStartDate}
                                onChange={(e) => setEqStartDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 px-2.5 rounded-lg text-slate-800 dark:text-white text-xs focus:outline-none focus:border-[#0085C8] font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">End Date (To)</label>
                              <input
                                type="date"
                                value={eqEndDate}
                                onChange={(e) => setEqEndDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 px-2.5 rounded-lg text-slate-800 dark:text-white text-xs focus:outline-none focus:border-[#0085C8] font-mono"
                              />
                            </div>
                            {(eqStartDate || eqEndDate) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEqStartDate("");
                                  setEqEndDate("");
                                }}
                                className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-mono pt-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                <span>Clear Custom Dates</span>
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>

                      {/* Reset All Filters Button */}
                      {(eqSearch || eqMinMag > 2.0 || eqMaxDepth < 100 || eqDatePreset !== "all" || eqStartDate || eqEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setEqSearch("");
                            setEqMinMag(2.0);
                            setEqMaxDepth(100);
                            setEqDatePreset("all");
                            setEqStartDate("");
                            setEqEndDate("");
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset All Filters</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 dark:border-white/5 pt-3 text-[10px] leading-normal font-mono text-slate-500 dark:text-slate-400">
                        Displaying <strong>{filteredEarthquakes.length}</strong> of <strong>{earthquakes.length}</strong> real-time seismic events.
                      </div>
                    </div>

                    {/* Earthquake Records table (3 columns) */}
                    <div className="lg:col-span-3 bg-white/90 dark:bg-[#07131F]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-4 text-slate-800 dark:text-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight font-display">
                            Ingested Seismic Activity Catalog &amp; Chronology
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Multi-station focal mechanisms, arrival lags, and hypocentral coordinates
                          </p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          USGS &amp; ESSGI Real-Time Feeds
                        </span>
                      </div>

                      {loadingEarthquakes ? (
                        <div className="py-16 text-center text-slate-400 text-xs italic font-sans flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#0E4A72]" />
                          <span>Syncing live earthquake catalogs...</span>
                        </div>
                      ) : filteredEarthquakes.length ? (
                        <div className="space-y-4">
                          <div className="overflow-x-auto max-h-[480px] overflow-y-auto pr-1 border border-slate-200 dark:border-white/10 rounded-2xl">
                            <table className="w-full text-left border-collapse text-xs text-slate-700 dark:text-slate-300 relative font-sans">
                              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-xs z-10">
                                <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-mono font-bold">
                                  <th className="py-3 px-3">Mag</th>
                                  <th className="py-3 px-3">Epicenter Location</th>
                                  <th className="py-3 px-3">Focal Depth</th>
                                  <th className="py-3 px-3">Origin Time (UTC)</th>
                                  <th className="py-3 px-3">Coordinates</th>
                                  <th className="py-3 px-3">Source</th>
                                  <th className="py-3 px-3 text-right">Inspect</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
                                {paginatedEarthquakes.map((eq) => {
                                  let magColor = "text-emerald-700 font-bold dark:text-emerald-400";
                                  let sevColor = "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/25 dark:border-emerald-800/40";
                                  if (eq.magnitude >= 5.5) {
                                    magColor = "text-rose-700 font-black dark:text-rose-400";
                                    sevColor = "bg-rose-50 border border-rose-200 dark:bg-rose-950/25 dark:border-rose-800/40";
                                  } else if (eq.magnitude >= 4.5) {
                                    magColor = "text-orange-700 font-black dark:text-orange-400";
                                    sevColor = "bg-orange-50 border border-orange-200 dark:bg-orange-950/25 dark:border-orange-800/40";
                                  } else if (eq.magnitude >= 3.5) {
                                    magColor = "text-amber-700 font-bold dark:text-amber-400";
                                    sevColor = "bg-amber-50 border border-amber-200 dark:bg-amber-950/25 dark:border-amber-800/40";
                                  }

                                  const readableDate = new Date(eq.dateTime).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  });

                                  return (
                                    <tr key={eq.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                      <td className="py-3 px-3 font-mono">
                                        <span className={`px-2 py-0.5 rounded-lg font-bold ${sevColor} ${magColor}`}>
                                          M {eq.magnitude.toFixed(1)}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3">
                                        <div>
                                          <div className="font-bold text-slate-900 dark:text-white">{eq.location}</div>
                                          <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic max-w-xs">{eq.description}</div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 font-semibold">{eq.depth} km</td>
                                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{readableDate}</td>
                                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                        {eq.coordinates[0].toFixed(2)}°N, {eq.coordinates[1].toFixed(2)}°E
                                      </td>
                                      <td className="py-3 px-3">
                                        <span className={`text-[9.5px] font-bold font-mono uppercase px-2 py-0.5 rounded-md ${
                                          eq.isHistorical
                                            ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                            : "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                                        }`}>
                                          {eq.isHistorical ? "HISTORIC" : "USGS LIVE"}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 text-right">
                                        <button
                                          onClick={() => {
                                            setActiveTab("map");
                                            setSelectedItem({ type: "earthquake", id: eq.id });
                                          }}
                                          className="bg-white dark:bg-slate-900 hover:bg-[#0E4A72] hover:text-white border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-2 rounded-xl transition-all cursor-pointer shadow-xs"
                                          title="Focus Center on GIS Map"
                                        >
                                          <Map className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Controls bar */}
                          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 gap-3 text-xs">
                            <div className="text-slate-500 dark:text-slate-400 font-sans">
                              Showing <strong className="text-slate-900 dark:text-white">{((eqPage - 1) * eqPerPage) + 1}</strong> to{" "}
                              <strong className="text-slate-900 dark:text-white">
                                {Math.min(eqPage * eqPerPage, filteredEarthquakes.length)}
                              </strong>{" "}
                              of <strong className="text-slate-900 dark:text-white">{filteredEarthquakes.length}</strong> events
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                disabled={eqPage === 1}
                                onClick={() => setEqPage((p) => Math.max(p - 1, 1))}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-bold disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                              >
                                Previous
                              </button>
                              <div className="font-mono text-xs text-slate-600 dark:text-slate-300 px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                                Page {eqPage} of {totalEqPages}
                              </div>
                              <button
                                disabled={eqPage === totalEqPages}
                                onClick={() => setEqPage((p) => Math.min(p + 1, totalEqPages))}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-bold disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-16 text-center text-slate-400 text-xs italic">
                          No seismic incidents match the current filters. Adjust your search or magnitude sliders.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DEDICATED SEISMIC WAVEFORMS & FURI SEISMOGRAPH SUB-TAB */}
              {dashboardSubTab === "seismicwave" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gradient-to-r from-teal-900/30 via-slate-900/60 to-slate-900/30 border border-teal-500/30 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6 animate-pulse text-teal-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest">
                            IU.FURI GLOBAL SEISMOGRAPHIC NETWORK (GSN)
                          </span>
                          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            TELEMETRY STREAM LIVE
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-0.5">
                          Mount Furi Seismic Waveform &amp; Travel-Time Analyzer
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Broadband 3-component triaxial seismograms (BHZ / BHN / BHE) with millisecond hover inspection &amp; synthetic phase arrivals.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDashboardSubTab("gnss")}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>View GNSS Geodesy</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <FuriSeismometer 
                    earthquakes={earthquakes} 
                    onSelectEarthquake={(eq) => setSelectedItem({ type: "earthquake", id: eq.id })}
                  />
                </div>
              )}

              {/* GNSS GEODESY & CRUSTAL DRIFT SUB-TAB */}
              {dashboardSubTab === "gnss" && (
                <div className="space-y-6 animate-fade-in">
                  <GnssNetworkExplorer />
                  
                  {/* Quick Access to FURI Seismometer */}
                  <div className="bg-white/40 dark:bg-[#0B0C10]/45 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Looking for Seismic Waveforms &amp; FURI Seismograph?
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Inspect continuous 3-component waveforms and P/S phase travel times recorded at Mount Furi broadband observatory.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setDashboardSubTab("seismicwave")}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold font-sans text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs border-0"
                    >
                      <span>Open Seismic Waveforms</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <FuriSeismometer 
                    earthquakes={earthquakes} 
                    onSelectEarthquake={(eq) => setSelectedItem({ type: "earthquake", id: eq.id })}
                  />
                </div>
              )}

              {/* GEOHAZARD ANALYTICS & TRENDS SUB-TAB */}
              {dashboardSubTab === "analytics" && (
                <div className="space-y-6 animate-fade-in">
                  <GeologyCharts
                    volcanoes={volcanoes}
                    earthquakes={earthquakes}
                  />
                </div>
              )}

              {/* SPACE OBSERVATORY SUB-TAB */}
              {dashboardSubTab === "observatory" && (
                <div className="space-y-6 animate-fade-in">
                  <GeospatialGallery />
                </div>
              )}

              {/* ADMINISTRATION SUB-TAB 1: USER & ROLES */}
              {dashboardSubTab === "users" && (
                <div className="space-y-6 animate-fade-in">
                  {currentUser.role === "admin" || currentUser.role === "official" || currentUser.role === "superadmin" ? (
                    <CockpitUserManagement
                      currentUser={currentUser}
                      onOpenAuthModal={() => setIsAuthModalOpen(true)}
                      onNavigateTab={(tab) => setActiveTab(tab as any)}
                    />
                  ) : (
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 text-center space-y-4 shadow-md">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-display">
                        Staff / Admin Authentication Required
                      </h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        User &amp; role management is restricted to authorized officers of the Department of Geodesy and Geodynamics.
                      </p>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-6 py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Sign In as Staff / Administrator
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ADMINISTRATION SUB-TAB 2: SYSTEM SETTINGS */}
              {dashboardSubTab === "settings" && (
                <div className="space-y-6 animate-fade-in">
                  {currentUser.role === "admin" || currentUser.role === "official" || currentUser.role === "superadmin" ? (
                    <CockpitSystemSettings currentUser={currentUser} />
                  ) : (
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 text-center space-y-4 shadow-md">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-display">
                        Staff / Admin Authentication Required
                      </h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        System configuration, notification alert pipelines, and sensor parameters are restricted to verified staff and administrators.
                      </p>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-6 py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Sign In as Staff / Administrator
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ADMINISTRATION SUB-TAB 3: AUDIT LOGS */}
              {dashboardSubTab === "audit" && (
                <div className="space-y-6 animate-fade-in">
                  {currentUser.role === "admin" || currentUser.role === "official" || currentUser.role === "superadmin" ? (
                    <CockpitAuditLogs
                      currentUser={currentUser}
                      auditLogs={auditLogs}
                      loadingAuditLogs={loadingAuditLogs}
                      onRefreshAuditLogs={loadAuditLogs}
                    />
                  ) : (
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 text-center space-y-4 shadow-md">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase font-display">
                        Staff / Admin Authentication Required
                      </h2>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Directorate database audit trails and security ledgers are confidential to authenticated staff and administrators.
                      </p>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-6 py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Sign In as Staff / Administrator
                      </button>
                    </div>
                  )}
                </div>
              )}

                </div>
              </div>
            </div>
          )}

          {/* ==================== B. GIS MAP ROOM ==================== */}
          {activeTab === "map" && (
            <GisOperationsRoom
              volcanoes={volcanoes}
              earthquakes={earthquakes}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onOpenCometPortal={setCometPortalItem}
              currentUser={currentUser}
              mapStyle={mapStyle}
              onMapStyleChange={(style) => {
                setMapStyle(style);
                setGoogleEarthActive(style === "googleEarth" || style === "googleEarthHybrid");
              }}
              googleEarthActive={googleEarthActive}
              onToggleGoogleEarth={setGoogleEarthActive}
              is3DActive={is3DActive}
              onToggle3D={() => setIs3DActive(!is3DActive)}
              onTriggerSmartAlert={handleOpenSmartTremorDispatch}
            />
          )}

          {/* ==================== C. GEOLOGICAL ANALYTICS & CATALOGS (MAPPED TO UNIFIED DASHBOARD) ==================== */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-fade-in">
              <GeologyCharts
                volcanoes={volcanoes}
                earthquakes={earthquakes}
              />
            </div>
          )}

           {/* ==================== E. AI RISK BRIEF DECISION SUPPORT ==================== */}
          {activeTab === "report" && (
            <div className="animate-fade-in">
              <ReportPanel
                volcanoes={volcanoes}
                earthquakes={earthquakes}
                currentUser={currentUser}
                initialTopic={selectedReportTopic}
              />
            </div>
          )}

          {/* ==================== F. ESSGI GEOSPATIAL GALLERY ==================== */}
          {activeTab === "gallery" && (
            <div className="animate-fade-in">
              <GeospatialGallery />
            </div>
          )}

          {/* ==================== INSAR GROUND DISPLACEMENT ANALYSIS ==================== */}
          {activeTab === "insar" && (
            <div className="animate-fade-in">
              <InSARAnalysis />
            </div>
          )}

          {/* ==================== G. STAFF DASHBOARD ==================== */}
          {activeTab === "staff-dashboard" && (
            <div className="animate-fade-in max-w-7xl mx-auto px-4 py-4">
              <StaffDashboard
                currentUser={currentUser}
                volcanoes={volcanoes}
                earthquakes={earthquakes}
                onAddVolcano={handleAddVolcano}
                onSignOut={handleSignOut}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            </div>
          )}

          {/* ==================== G2. RESEARCHER DASHBOARD ==================== */}
          {activeTab === "researcher-dashboard" && (
            <div className="animate-fade-in max-w-7xl mx-auto px-4 py-4">
              <ResearcherDashboard
                currentUser={currentUser}
                volcanoes={volcanoes}
                earthquakes={earthquakes}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
                onSignOut={handleSignOut}
              />
            </div>
          )}

          {/* ==================== H. ADMIN DASHBOARD ==================== */}
          {activeTab === "admin-dashboard" && (
            <div className="animate-fade-in max-w-7xl mx-auto px-4 py-4">
              <AdminDashboard
                currentUser={currentUser}
                volcanoes={volcanoes}
                earthquakes={earthquakes}
                onSignOut={handleSignOut}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onAuthenticateUser={(user) => setCurrentUser(user)}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            </div>
          )}
            </>
          )}
        </div>
      </main>

      {/* Universal Institutional Government Footer for non-home and non-map tabs */}
      {activeTab !== "home" && activeTab !== "map" && (
        <Footer 
          onOpenContact={() => setIsContactModalOpen(true)}
          onNavigate={(tab) => setActiveTab(tab as any)}
          compact={true}
        />
      )}

      {/* R-GEVAMS INSTITUTIONAL ACCESS AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onSuccess={(user) => {
          setCurrentUser(user as any);
          setIsAuthModalOpen(false);
          setViewMode("dashboard");
          if (user.role === "superadmin" || user.role === "admin") {
            setActiveTab("admin-dashboard");
          } else if (user.role === "researcher" || user.role === "scientist") {
            setActiveTab("researcher-dashboard");
          } else {
            setActiveTab("staff-dashboard");
          }
        }}
      />

      {/* REAL-TIME GEOLOGICAL AUDIO ALERT TOAST OVERLAYS */}
      {activeAudioAlertToasts.length > 0 && (
        <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full font-sans pointer-events-none">
          {activeAudioAlertToasts.map((toast) => {
            const isRed = toast.severity === "Red";
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto bg-white dark:bg-slate-900 border ${
                  isRed
                    ? "border-rose-150 dark:border-rose-900 shadow-rose-100/40 dark:shadow-rose-950/20"
                    : "border-orange-150 dark:border-orange-900 shadow-orange-100/40 dark:shadow-orange-950/20"
                } rounded-2xl shadow-xl flex flex-col p-4 relative overflow-hidden transition-all duration-300 transform animate-fade-in`}
              >
                {/* Accent bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    isRed ? "bg-rose-500" : "bg-orange-500"
                  }`}
                />
                
                <div className="pl-2.5 flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isRed
                      ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                      : "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                  }`}>
                    {toast.type === "volcano" ? (
                      <Flame className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Activity className="w-5 h-5 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded ${
                        isRed
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                          : "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                      }`}>
                        {toast.severity} Alert Detected
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{toast.timestamp}</span>
                    </div>
                    
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1 truncate">
                      {toast.name}
                    </h4>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {toast.message}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setActiveAudioAlertToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="absolute top-3 right-3 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 30-DAY HISTORICAL TREND ANALYSIS LUXURY MODAL */}
      <AnimatePresence>
        {expandedMetric && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedMetric(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.45 }}
              className="relative w-full max-w-2xl bg-[#041525] text-slate-100 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] z-10 flex flex-col max-h-[90vh]"
            >
              {/* Top Accent Bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${
                expandedMetric === "seismic" ? "from-amber-500 to-amber-600" :
                expandedMetric === "volcanic" ? "from-rose-500 to-rose-600" :
                expandedMetric === "focal" ? "from-red-500 to-red-600" :
                "from-emerald-500 to-emerald-600"
              }`} />

              {/* Modal Header */}
              <div className="p-6 pb-0 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded tracking-widest ${
                      expandedMetric === "seismic" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                      expandedMetric === "volcanic" ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" :
                      expandedMetric === "focal" ? "bg-red-500/15 text-red-300 border border-red-500/30" :
                      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      ESSGI Geodynamic Observatory
                    </span>
                    <span className="text-[9px] text-cyan-300/80 font-mono">ID: {expandedMetric?.toUpperCase()}-30D</span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mt-1.5 font-display flex items-center gap-2">
                    {expandedMetric === "seismic" && <>Seismic Tremor Velocity Swarms</>}
                    {expandedMetric === "volcanic" && <>Volcano Radiative & Gas Flux</>}
                    {expandedMetric === "focal" && <>Peak Richter Magnitude Index</>}
                    {expandedMetric === "geodetic" && <>Continuous GNSS Stream Latency</>}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Historical 30-day monitoring data ingested from telemetry ground servers in Addis Ababa and Erta Ale field sensors.
                  </p>
                </div>

                <button
                  onClick={() => setExpandedMetric(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Embedded High Fidelity Trend Chart */}
                <MetricTrendChart metric={expandedMetric} theme={theme} />

                {/* Grid of Key Analytical Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {expandedMetric === "seismic" && (
                    <>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Swarms</div>
                        <div className="text-lg font-black text-amber-400 mt-1 font-mono">92 Events</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Peak Daily Freq</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">8 / Day</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Avg Mag (30D)</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">M 3.8</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Active Swarms</div>
                        <div className="text-lg font-black text-emerald-400 mt-1 font-mono">Normal</div>
                      </div>
                    </>
                  )}

                  {expandedMetric === "volcanic" && (
                    <>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Avg Thermal Radiance</div>
                        <div className="text-lg font-black text-rose-400 mt-1 font-mono">53.4 MW</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Peak Radiance</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">94 MW</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">SO2 Concentration</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">162 ppm</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Magma Convection</div>
                        <div className="text-lg font-black text-rose-400 mt-1 font-mono">Active</div>
                      </div>
                    </>
                  )}

                  {expandedMetric === "focal" && (
                    <>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Highest Magnitude</div>
                        <div className="text-lg font-black text-red-400 mt-1 font-mono">M 5.8</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Events &ge; M5.0</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">3 Swarms</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Mean Depth</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">11.4 km</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Rift Stress Coeff</div>
                        <div className="text-lg font-black text-amber-400 mt-1 font-mono">0.64 (Mod)</div>
                      </div>
                    </>
                  )}

                  {expandedMetric === "geodetic" && (
                    <>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Average Latency</div>
                        <div className="text-lg font-black text-emerald-400 mt-1 font-mono">123 ms</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Jitter Variance</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">&plusmn; 4.2 ms</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Stations Tracked</div>
                        <div className="text-lg font-black text-white mt-1 font-mono">18 GNSS</div>
                      </div>
                      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
                        <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Packet Delivery</div>
                        <div className="text-lg font-black text-emerald-400 mt-1 font-mono">99.99%</div>
                      </div>
                    </>
                  )}

                </div>

                {/* Executive Assessment Statement */}
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex gap-3 items-start">
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 font-black font-mono text-[10px] shrink-0 mt-0.5">
                    ANALYSIS
                  </span>
                  <div className="text-xs text-slate-200 space-y-1.5 leading-relaxed">
                    <p className="font-bold text-amber-200">ESSGI Geophysicist Intelligence Briefing:</p>
                    <p className="text-slate-200">
                      {expandedMetric === "seismic" && "Current 30-day seismic data shows a series of minor fault movements along the Afar rift axis. Tectonic stress is releasing progressively with no sudden regional block-shifts or impending hazards identified. Continuous geodetic surveillance is running."}
                      {expandedMetric === "volcanic" && "Erta Ale volcano continues to display healthy convection within the lava lake caldera. Moderate thermal anomaly peaks (85–94 MW) indicate normal heat emission cycles with no significant volcanic inflation detected in satellite radar measurements."}
                      {expandedMetric === "focal" && "The brief seismic swarm on days 7-8 peaked with a M 5.8 earthquake at a depth of 12 km. Structural damage was absent due to the sparse population in the Rift zone. Swarm decay rate matches ideal Omori-law equations, confirming safe stabilization."}
                      {expandedMetric === "geodetic" && "GNSS real-time geodetic receiver networks are feeding highly precise, millimeter-accurate crustal coordinates. Atmospheric water vapor index is fully calibrated. The network's 123ms telemetry latency baseline guarantees millisecond-accurate rift-spread tracking."}
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>Last Updated: Real-Time Sync</span>
                <button
                  onClick={() => setExpandedMetric(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-[10.5px] tracking-wide transition-colors cursor-pointer border border-slate-700"
                >
                  Dismiss Analysis
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL EARTHQUAKE DETAIL PANEL */}
      <AnimatePresence>
        {selectedItem?.type === "earthquake" && activeTab !== "map" && (() => {
          const eq = earthquakes.find((e) => e.id === selectedItem.id);
          if (!eq) return null;
          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 font-sans">
              <div className="relative">
                <EarthquakeDetailPanel
                  earthquake={eq}
                  onClose={() => setSelectedItem(null)}
                  onExploreNode={(id) => setCometPortalItem({ type: "earthquake", id })}
                  onFocusOnMap={(coords) => {
                    setActiveTab("map");
                  }}
                  onTriggerSmartAlert={handleOpenSmartTremorDispatch}
                />
              </div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* RECENT ALERTS HISTORY SIDE PANEL */}
      <RecentAlertsHistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        currentUserRole={currentUser.role}
        dismissedAlerts={dismissedAlertsHistory}
        onRestoreAlert={handleRestoreAlert}
        onClearHistory={handleClearHistory}
        onUpdateNotes={handleUpdateNotes}
        onAddManualHistory={handleAddManualHistory}
        onInspectMap={(rawId, type) => {
          setActiveTab("map");
          setSelectedItem({ type, id: rawId });
        }}
      />

      {/* ROLE RESTRICTION NOTICE MODAL */}
      <AnimatePresence>
        {roleRestrictionNotice.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100 font-sans"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white font-display">
                    {roleRestrictionNotice.title}
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                    Access Permission Warning
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                {roleRestrictionNotice.description}
              </p>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[10.5px] text-slate-400 font-mono">
                  Current Role: <strong className="text-amber-300">{currentUser.name}</strong>
                </span>
                <button
                  onClick={() => setRoleRestrictionNotice((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTACT HEADQUARTERS MODAL */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      {/* SECTOR DETAIL MODAL */}
      <SectorDetailModal
        sector={selectedSector}
        isOpen={Boolean(selectedSector)}
        onClose={() => setSelectedSector(null)}
        onNavigateToTab={(tab) => setActiveTab(tab as any)}
      />

      {/* ANNOUNCEMENT DETAIL MODAL */}
      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
      />
  
    </div>
  );
}