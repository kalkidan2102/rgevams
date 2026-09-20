import { Activity, MapPinned, Mountain, ArrowRight, RefreshCw } from "lucide-react";

import SectionContainer from "../common/SectionContainer";
import SectionTitle from "../ui/SectionTitle";
import GlassCard from "../ui/GlassCard";
import PrimaryButton from "../ui/PrimaryButton";
import SeismicSparkline from "../common/seismicSparkline";

import mapBg from "../../assets/images/Volcanic-sesmic-risk.jpg";

interface LiveStatusProps {
  onLaunchDashboard?: () => void;
  earthquakes?: any[];
  volcanoes?: any[];
  secondsToSync?: number;
  manualRefreshSpin?: boolean;
  onRefresh?: () => void;
}

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

export default function LiveStatus({
  onLaunchDashboard,
  earthquakes = [],
  volcanoes = [],
  secondsToSync,
  manualRefreshSpin,
  onRefresh,
}: LiveStatusProps) {
  // Find the absolute latest earthquake
  const latestEq = earthquakes.length > 0 ? earthquakes[0] : null;

  // Find the highest alert level volcano or the most active one
  const highAlertVolcano = volcanoes.find((v) => v.severity === "Red" || v.severity === "Orange") || volcanoes[0];

  return (
    <SectionContainer className="py-8 bg-white dark:bg-[#020b14] text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-white/10">

      <SectionTitle
        badge="Real-Time Network Telemetry"
        title="Active Hazard Telemetry & Stream Status"
        description="Continuous geological surveillance array synced with USGS seismic stream and ESSGI space geodesy."
      />

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Left Map Background Interactive Card */}
        <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white shadow-xs p-5 flex flex-col justify-between group">
          <img
            src={mapBg}
            alt="Ethiopian Rift Zone Map Background"
            className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[#0085C8]/10 border border-[#0085C8]/30 text-[#0085C8] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0085C8]" />
                SOUTHERN AFAR &amp; RIFT CORRIDOR
              </span>
              <span className="text-xs font-mono text-slate-600 font-semibold">
                8°57'N 40°02'E
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-sans">
                Awash Basin &amp; Metehara (Southern Afar Region)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                A moderate 4.6-magnitude earthquake struck the southern part of the Afar Region near Awash and Metehara on August 9, 2026. Central and Northern Afar (including the Semera corridor) currently reports no recent significant seismic events.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">RECENT EVENT</span>
                <div className="text-sm font-bold text-rose-700">M 4.6 (Awash/Metehara)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">SEMERA / NORTH AFAR</span>
                <div className="text-sm font-bold text-emerald-700">Stable / No Swarms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Telemetry Stream Panel */}
        <div className="p-5 rounded-lg bg-white border border-slate-300 shadow-xs flex flex-col justify-between space-y-4">

          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 font-sans uppercase tracking-wider">
                Live Stream Data Feed
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </h3>
              
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={manualRefreshSpin}
                  aria-label="Force refresh USGS database"
                  title="Force refresh USGS database"
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-300 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${manualRefreshSpin ? "animate-spin text-[#0085C8]" : ""}`} />
                </button>
              )}
            </div>

            <div className="mt-3.5 space-y-3">

              {/* Dynamic Latest Earthquake Card List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-semibold tracking-wider text-rose-800 uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-600" />
                    USGS Seismic Stream (Recent Events)
                  </h4>
                  <span className="text-[9.5px] bg-rose-50 border border-rose-200 text-rose-800 px-2 py-0.5 rounded font-mono font-semibold">
                    {earthquakes.length} Events Synced
                  </span>
                </div>

                {earthquakes.length > 0 ? (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                    {earthquakes.slice(0, 3).map((eq, i) => (
                      <div 
                        key={eq.id || i} 
                        className="p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col gap-1.5 group text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <div className="px-1.5 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-bold font-mono shrink-0">
                            M {eq.magnitude.toFixed(1)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-semibold text-slate-900 truncate">
                              {eq.location}
                            </h5>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5 font-mono">
                              <span>Depth: {eq.depth}km</span>
                              <span>{formatTimeAgo(eq.dateTime)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Real-Time D3.js Sparkline Chart */}
                        <div className="pt-1 border-t border-slate-200">
                          <SeismicSparkline
                            magnitude={eq.magnitude}
                            dateTime={eq.dateTime}
                            eventId={eq.id || `eq-${i}`}
                            height={20}
                            showLabels={false}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 italic font-mono">
                    No active crust ruptures cataloged in this segment.
                  </div>
                )}
              </div>

              {/* Dynamic Volcano status */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 border border-amber-300 shadow-xs">
                  <Mountain className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <h4 className="font-bold text-slate-900 truncate">
                    {highAlertVolcano ? `${highAlertVolcano.name} Peak` : "Volcanic Centers Stable"}
                  </h4>
                  <p className="text-[10.5px] text-amber-900/80 truncate font-mono font-medium">
                    {highAlertVolcano
                      ? `${highAlertVolcano.region} • Alert: ${highAlertVolcano.severity}`
                      : "Monitored vents below alert margins."}
                  </p>
                </div>
              </div>

              {/* Network sync status */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                <div className="p-2 rounded-xl bg-[#0085C8]/10 text-[#0085C8] shrink-0 border border-[#0085C8]/30 shadow-xs">
                  <MapPinned className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <h4 className="font-bold text-slate-900">
                    Seismic Telemetry Ingest
                  </h4>
                  <p className="text-[10.5px] text-[#0085C8] truncate font-mono font-medium">
                    {secondsToSync !== undefined
                      ? `Sync Active • Auto-update in ${secondsToSync}s`
                      : "Network operating normally"}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <PrimaryButton variant="blue" className="w-full py-3 text-xs font-black uppercase tracking-wider bg-[#0085C8] hover:bg-[#0073AD] text-white border border-[#0085C8] shadow-md transition-all active:scale-95 cursor-pointer" onClick={onLaunchDashboard} aria-label="Open full monitoring dashboard">
              <span className="flex items-center justify-center gap-2">
                Open Full Operations Dashboard
                <ArrowRight size={14} />
              </span>
            </PrimaryButton>
          </div>

        </div>

      </div>

    </SectionContainer>
  );
}
