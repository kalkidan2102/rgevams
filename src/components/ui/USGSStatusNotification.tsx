import React from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Clock,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface USGSStatusNotificationProps {
  loading?: boolean;
  error?: string | null;
  retryCount?: number;
  isRetrying?: boolean;
  lastSuccessTime?: Date | null;
  isUsingFallbackData?: boolean;
  maxRetries?: number;
  statusMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export const USGSStatusNotification: React.FC<USGSStatusNotificationProps> = ({
  loading = false,
  error = null,
  retryCount = 0,
  isRetrying = false,
  lastSuccessTime = null,
  isUsingFallbackData = false,
  maxRetries = 3,
  statusMessage = "",
  onRetry,
  className = ""
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // 1. IS RETRYING STATE (Auto-retry in progress)
  if (isRetrying) {
    return (
      <div className={`bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md backdrop-blur-md font-sans text-amber-900 dark:text-amber-200 transition-all ${className}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                USGS Reconnecting (Attempt {retryCount}/{maxRetries})
              </span>
              <span className="text-[9.5px] font-mono text-amber-600 dark:text-amber-400">
                Exponential Backoff
              </span>
            </div>
            <p className="text-xs font-medium text-amber-900 dark:text-amber-100 truncate">
              {statusMessage || `Live feed connection interrupted. Retrying automatic sync...`}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            <span>Force Retry Now</span>
          </button>
        )}
      </div>
    );
  }

  // 2. ERROR / MAX RETRIES EXCEEDED STATE
  if (error && !isRetrying) {
    return (
      <div className={`bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md backdrop-blur-md font-sans text-rose-950 dark:text-rose-200 transition-all ${className}`}>
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                USGS Stream Offline
              </span>
              <span className="text-[9.5px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Serving Local Cached Seismology
              </span>
            </div>
            <p className="text-xs font-semibold text-rose-900 dark:text-rose-100 leading-relaxed">
              {error}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reconnect Live Stream</span>
          </button>
        )}
      </div>
    );
  }

  // 3. SUCCESS / ONLINE STATE
  return (
    <div className={`bg-slate-900/40 border border-slate-700/40 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-mono text-slate-300 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-400 font-bold uppercase text-[10.5px]">
          USGS Live Stream:
        </span>
        <span className="text-slate-300 truncate text-[11px]">
          {statusMessage || "Operational & Synced"}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0 text-[10.5px] text-slate-400">
        <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3 text-cyan-400" />
          Last sync: <strong className="text-slate-200">{formatTime(lastSuccessTime)}</strong>
        </span>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={loading}
            title="Refresh USGS stream manually"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
};
