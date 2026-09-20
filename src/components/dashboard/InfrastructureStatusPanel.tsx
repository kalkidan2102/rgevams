import { useState } from "react";
import { 
  Wifi, 
  Zap, 
  Database, 
  Radio, 
  RefreshCw, 
  ShieldCheck, 
  Server, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Gauge,
  Signal,
  Terminal
} from "lucide-react";

interface StatusTile {
  id: string;
  name: string;
  code: string;
  category: string;
  status: "OPERATIONAL" | "OPTIMAL" | "NOMINAL" | "SYNCING";
  statusColor: string;
  badgeBg: string;
  badgeText: string;
  icon: any;
  primaryValue: string;
  primaryLabel: string;
  secondaryValue: string;
  secondaryLabel: string;
  detailText: string;
  lastPing: string;
  metrics: { label: string; value: string }[];
}

export function InfrastructureStatusPanel() {
  const [runningDiag, setRunningDiag] = useState<string | null>(null);
  const [diagLogs, setDiagLogs] = useState<string[]>([]);
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("JUST NOW");

  const statusTiles: StatusTile[] = [
    {
      id: "sat-link",
      name: "Satellite Downlink & Orbit Lock",
      code: "LINK-SENTINEL-1A",
      category: "Space Science Geodesy",
      status: "OPERATIONAL",
      statusColor: "bg-emerald-500",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      badgeText: "SIGNAL LOCK",
      icon: Wifi,
      primaryValue: "-54 dBm",
      primaryLabel: "Carrier RSSI",
      secondaryValue: "99.98%",
      secondaryLabel: "Monthly Orbit Uptime",
      detailText: "Entoto Astronomical Observatory & Semera ground station receivers maintain active Ku-band orbital tracking with Sentinel-1 SAR & EthioSat constellation.",
      lastPing: "0.2s ago",
      metrics: [
        { label: "Frequency Band", value: "Ku/Ka-Band" },
        { label: "Orbital Azimuth", value: "142.8° East" },
        { label: "Downlink Speed", value: "1.2 Gbps" }
      ]
    },
    {
      id: "power-grid",
      name: "Facility Power & UPS Backup",
      code: "PWR-FURI-ENTOTO",
      category: "Infrastructure Auxiliary",
      status: "OPTIMAL",
      statusColor: "bg-emerald-500",
      badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      badgeText: "DUAL GRID + SOLAR",
      icon: Zap,
      primaryValue: "230 V",
      primaryLabel: "AC Bus Voltage",
      secondaryValue: "100%",
      secondaryLabel: "UPS Autonomy (48h)",
      detailText: "Primary Mount Furi Seismological Station and Entoto Observatory are supported by redundant solar-diesel hybrid arrays with zero micro-interruptions.",
      lastPing: "1.1s ago",
      metrics: [
        { label: "Frequency Stability", value: "50.00 Hz ± 0.01" },
        { label: "Current Load", value: "3.4 kW (18%)" },
        { label: "Solar Generation", value: "14.2 kWh/day" }
      ]
    },
    {
      id: "sensor-freshness",
      name: "Broadband Ingest & Data Freshness",
      code: "STREAM-FURI-USGS",
      category: "Seismological Ingest",
      status: "NOMINAL",
      statusColor: "bg-emerald-500",
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      badgeText: "SUB-SECOND SYNC",
      icon: Database,
      primaryValue: "0.3 sec",
      primaryLabel: "Packet Latency",
      secondaryValue: "0.00%",
      secondaryLabel: "Waveform Drop Rate",
      detailText: "Direct WebSocket telemetry from 18 permanent Ethiopian Rift broadband stations normalized against USGS Global Seismic Network feeds.",
      lastPing: "0.1s ago",
      metrics: [
        { label: "Active Channels", value: "54 Seismic Streams" },
        { label: "Data Rate", value: "2.4 MB/sec" },
        { label: "Buffer Window", value: "30 Days Rolling" }
      ]
    },
    {
      id: "sms-gateway",
      name: "Ethio Telecom DRMC Alert Gateway",
      code: "TRUNK-EOC-SMS",
      category: "Civil Safety Broadcast",
      status: "OPERATIONAL",
      statusColor: "bg-emerald-500",
      badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      badgeText: "EOC TRUNK LINK",
      icon: Radio,
      primaryValue: "45,000+",
      primaryLabel: "Registered Subscribers",
      secondaryValue: "< 12 sec",
      secondaryLabel: "Broadcast Delivery",
      detailText: "Bilingual emergency SMS dispatch pipeline directly integrated with Ethio Telecom cellular nodes for Afar, Amharic, and Oromiffa advisories.",
      lastPing: "0.5s ago",
      metrics: [
        { label: "Active Cell Towers", value: "128 Stations" },
        { label: "Language Profiles", value: "Afar, Amh, Oro" },
        { label: "Queue Capacity", value: "10,000 SMS/min" }
      ]
    }
  ];

  const handleRunDiagnostic = (tile: StatusTile) => {
    setRunningDiag(tile.id);
    setActiveTileId(tile.id);
    setDiagLogs([
      `[DIAGNOSTIC-PING] Initiating handshake sequence for ${tile.code}...`,
      `[NETWORK] Contacting gateway node @ ${tile.name}...`,
      `[PAYLOAD] Executing packet loss & latency verification test...`
    ]);

    setTimeout(() => {
      setDiagLogs(prev => [
        ...prev,
        `[SIGNAL-CHECK] RSSI Response verified (${tile.primaryValue}).`,
        `[HEALTH-AUDIT] All sub-systems reporting status: ${tile.status}.`,
        `[COMPLETED] Handshake successful. Diagnostic status: 100% HEALTHY.`
      ]);
      setRunningDiag(null);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 1200);
  };

  return (
    <div className="bg-slate-900 dark:bg-[#030c14] text-white p-5 md:p-6 rounded-3xl border border-blue-500/25 shadow-2xl space-y-5 font-sans relative overflow-hidden select-none">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-black uppercase tracking-widest text-blue-400">
                EXTERNAL INFRASTRUCTURE & TELEMETRY HEALTH
              </h3>
              <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SYSTEMS NORMAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Real-time monitoring of satellite links, auxiliary power, telemetry streams & DRMC broadcast gateways
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] self-start sm:self-center">
          <button
            onClick={() => {
              setLastSyncTime(new Date().toLocaleTimeString());
            }}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>LAST SYNC: {lastSyncTime}</span>
          </button>
        </div>
      </div>

      {/* 4 Status Indicator Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {statusTiles.map((tile) => {
          const Icon = tile.icon;
          const isSelected = activeTileId === tile.id;
          const isTesting = runningDiag === tile.id;

          return (
            <div
              key={tile.id}
              onClick={() => setActiveTileId(isSelected ? null : tile.id)}
              className={`bg-slate-950/70 border rounded-2xl p-4 space-y-3.5 transition-all duration-300 cursor-pointer relative group ${
                isSelected 
                  ? "border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)] bg-slate-900/90" 
                  : "border-white/10 hover:border-blue-500/40 hover:bg-slate-900/60"
              }`}
            >
              {/* Header inside tile */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:text-amber-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase block font-semibold">
                      {tile.code}
                    </span>
                    <h4 className="text-xs font-black text-white leading-tight font-display">
                      {tile.name}
                    </h4>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border shrink-0 flex items-center gap-1 ${tile.badgeBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tile.statusColor} animate-pulse`} />
                  <span>{tile.badgeText}</span>
                </div>
              </div>

              {/* Primary & Secondary Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[8px] font-mono text-slate-400 uppercase block">
                    {tile.primaryLabel}
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {tile.primaryValue}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-400 uppercase block">
                    {tile.secondaryLabel}
                  </span>
                  <span className="text-sm font-black font-mono text-cyan-300">
                    {tile.secondaryValue}
                  </span>
                </div>
              </div>

              {/* Detail text */}
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                {tile.detailText}
              </p>

              {/* Action / Diagnostics Bar */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-500 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-emerald-500" />
                  Telemetry: {tile.lastPing}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunDiagnostic(tile);
                  }}
                  disabled={isTesting}
                  className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white rounded-lg border border-blue-500/30 transition-colors flex items-center gap-1 font-bold cursor-pointer disabled:opacity-50"
                >
                  <Terminal className={`w-2.5 h-2.5 ${isTesting ? "animate-spin text-amber-400" : "text-blue-400"}`} />
                  <span>{isTesting ? "Testing..." : "Diag Ping"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Diagnostic Terminal View when a tile is selected or pinged */}
      {activeTileId && (
        <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-3 animate-fade-in relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                Telemetry Diagnostics Terminal • Node ID: {activeTileId.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTileId(null);
                setDiagLogs([]);
              }}
              className="text-[10px] text-slate-400 hover:text-white bg-white/5 px-2 py-0.5 rounded cursor-pointer"
            >
              Close Console &times;
            </button>
          </div>

          <div className="space-y-1 bg-black/60 p-3 rounded-xl border border-white/5 text-[10.5px] leading-relaxed max-h-36 overflow-y-auto">
            <p className="text-slate-500">// ESSGI National Telemetry Diagnostic Pipeline v2.4</p>
            {diagLogs.length === 0 ? (
              <p className="text-slate-400">
                Click <span className="text-cyan-400 font-bold">[Diag Ping]</span> on any tile above to initiate real-time signal latency & handshake verification tests.
              </p>
            ) : (
              diagLogs.map((log, index) => (
                <p key={index} className={log.includes("COMPLETED") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
