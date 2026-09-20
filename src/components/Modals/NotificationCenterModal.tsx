import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  X,
  Flame,
  Radio,
  Activity,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ExternalLink,
  Filter,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { FALLBACK_VOLCANOES, FALLBACK_EARTHQUAKES, FALLBACK_DISMISSED_ALERTS } from "../../fallback_data";
import { VOLCANO_TARGETS } from "../../services/insarService";

export interface NotificationEvent {
  id: string;
  category: "volcanic" | "seismic" | "insar" | "system";
  severity: "critical" | "warning" | "advisory" | "resolved";
  title: string;
  location: string;
  coordinates: [number, number];
  dateTime: string;
  relativeTime: string;
  description: string;
  details: string;
  metricLabel: string;
  metricValue: string;
  status: string;
  read: boolean;
  actionTarget?: {
    page: "dashboard" | "home";
    tab?: string;
    volcanoId?: string;
  };
}

const INITIAL_EVENTS: NotificationEvent[] = [
  {
    id: "notif-1",
    category: "volcanic",
    severity: "critical",
    title: "Erta Ale Caldera: Magmatic Uplift Surge & Lava Lake Expansion",
    location: "Danakil Depression, Northern Afar",
    coordinates: [13.287, 40.726],
    dateTime: "2026-08-19T08:45:00.000Z",
    relativeTime: "2 hours ago",
    description: "LiCSBAS InSAR automatic inversion detected accelerated ground deformation surge reaching +48.5 mm/yr. Active lava lake level raised 14m in summit pit crater.",
    details: "Sentinel-1 Frame 087A interferometric fringe coherence exceeds 0.85. Sub-surface magma pressurization source modeled at 2.4 km depth beneath northern crater rim.",
    metricLabel: "Uplift Rate",
    metricValue: "+48.5 mm/yr",
    status: "ACTIVE SURGE",
    read: false,
    actionTarget: {
      page: "dashboard",
      tab: "insar",
      volcanoId: "erta_ale"
    }
  },
  {
    id: "notif-2",
    category: "seismic",
    severity: "warning",
    title: "M 4.9 Seismic Tremor Swarm near Fentale-Awash Corridor",
    location: "Main Ethiopian Rift (East Shewa)",
    coordinates: [8.97, 39.93],
    dateTime: "2026-08-18T22:15:30.000Z",
    relativeTime: "12 hours ago",
    description: "Series of 18 shallow tectonic earthquakes (depth 8-12 km) recorded by FURI Entoto Observatory and Addis Ababa seismic network. Felt across Adama and Awash.",
    details: "Micro-seismic focal mechanisms indicate normal faulting along the Wonji Fault Belt. No critical structural collapse reported on the Awash railway bridge.",
    metricLabel: "Peak Magnitude",
    metricValue: "M 4.9 (Depth 9km)",
    status: "MONITORED SWARM",
    read: false,
    actionTarget: {
      page: "dashboard",
      tab: "earthquakes"
    }
  },
  {
    id: "notif-3",
    category: "volcanic",
    severity: "critical",
    title: "Corbetti Caldera: Sustained Rapid Silicic Inflation",
    location: "Southern Rift Valley (Hawassa Basin)",
    coordinates: [7.18, 38.38],
    dateTime: "2026-08-17T14:30:00.000Z",
    relativeTime: "2 days ago",
    description: "Continuous ground deformation rate at Urji obsidian dome stable at +38.6 mm/yr over 12+ year baseline. Total cumulative geodetic uplift exceeds 45 cm.",
    details: "Mogi inversion source parameters confirm continuous silicic magma influx at 5.2 km depth beneath Chabbi-Urji post-caldera domes.",
    metricLabel: "Cumulative Disp",
    metricValue: "+450 mm",
    status: "ALERT ELEVATED",
    read: false,
    actionTarget: {
      page: "dashboard",
      tab: "insar",
      volcanoId: "corbetti"
    }
  },
  {
    id: "notif-4",
    category: "seismic",
    severity: "critical",
    title: "Historical Benchmark: M 6.3 Dobi Graben Earthquake Swarm",
    location: "Dobi Graben, Afar Region",
    coordinates: [11.80, 40.80],
    dateTime: "1989-08-20T11:15:32.000Z",
    relativeTime: "Historical Baseline",
    description: "Catastrophic seismic swarm opening multiple surface rupture scarps up to 1.8m vertical throw. Severely damaged regional transport bridges to Assab port.",
    details: "Seismogenic rifting sequence involving 12 events of M > 5.5 within 48 hours. Serves as the primary structural design ground acceleration benchmark.",
    metricLabel: "Magnitude",
    metricValue: "M 6.3 (Depth 15km)",
    status: "BENCHMARK ARCHIVE",
    read: true,
    actionTarget: {
      page: "dashboard",
      tab: "earthquakes"
    }
  },
  {
    id: "notif-5",
    category: "insar",
    severity: "advisory",
    title: "Alutu Caldera: Multi-Looked InSAR Time Series Refresh",
    location: "Central Main Ethiopian Rift (Aluto-Langano)",
    coordinates: [7.78, 38.78],
    dateTime: "2026-08-16T09:10:00.000Z",
    relativeTime: "3 days ago",
    description: "New Sentinel-1 Descending Frame 029D interferometric batch ingested. Geothermal steam production sector shows minor localized deflation (-4 mm/yr).",
    details: "Temporal coherence remains above 0.78 over the central volcanic edifice. Geothermal energy borehole pressure sensors report stable hydrothermal reservoir state.",
    metricLabel: "Coherence γ",
    metricValue: "0.82 (High)",
    status: "DATA REFRESH",
    read: true,
    actionTarget: {
      page: "dashboard",
      tab: "insar",
      volcanoId: "alutu"
    }
  },
  {
    id: "notif-6",
    category: "volcanic",
    severity: "warning",
    title: "Dallol Hydrothermal Complex: Acid Geyser Plume & Degassing",
    location: "Danakil Salt Plain (120m below sea level)",
    coordinates: [14.24, 40.30],
    dateTime: "2026-08-15T16:20:00.000Z",
    relativeTime: "4 days ago",
    description: "Brine pool temperature spiked to 108°C accompanied by high-concentration SO₂ and HCl vapor discharge. Phreatic explosion hazard heightened.",
    details: "Thermal infrared satellite radiance shows 3.2°C anomaly across the potassium salt chimneys. Regional DRMC warning in effect for tourism operators.",
    metricLabel: "Brine Temp",
    metricValue: "108°C (+12°C)",
    status: "ADVISORY ACTIVE",
    read: true,
    actionTarget: {
      page: "dashboard",
      tab: "volcanoes"
    }
  },
  {
    id: "notif-7",
    category: "seismic",
    severity: "critical",
    title: "Historical Benchmark: 1969 Serdo Town M 6.2 Earthquakes",
    location: "Serdo Town, Central Afar",
    coordinates: [11.90, 41.30],
    dateTime: "1969-03-29T07:23:11.000Z",
    relativeTime: "Historical Baseline",
    description: "Major strike-slip and normal fault rupture completely devastating the historical town of Serdo, causing ground fissures and multiple aftershock sequences.",
    details: "Total fault surface rupture length exceeded 22 km. Documented by Gouin (1979) as the premier historical rifting seismic sequence in the Afar triangle.",
    metricLabel: "Magnitude",
    metricValue: "M 6.2 (Intensity IX)",
    status: "BENCHMARK ARCHIVE",
    read: true,
    actionTarget: {
      page: "dashboard",
      tab: "earthquakes"
    }
  },
  {
    id: "notif-8",
    category: "volcanic",
    severity: "critical",
    title: "Historical Benchmark: 2005 Dabbahu Explosive Graben Opening",
    location: "Dabbahu Volcano, Afar Depression",
    coordinates: [12.60, 40.48],
    dateTime: "2005-09-24T18:32:00.000Z",
    relativeTime: "Historical Baseline",
    description: "A major explosive rhyolitic ash eruption followed by a 60 km long, 8 m wide magma-filled graben fissure opening over just 3 weeks.",
    details: "Injected 2.5 km³ of basaltic magma into the continental crust, representing the largest sub-aerial continental rifting dyke intrusion event ever monitored by satellite geodesy.",
    metricLabel: "Dyke Intrusion",
    metricValue: "60 km Fissure",
    status: "BENCHMARK ARCHIVE",
    read: true,
    actionTarget: {
      page: "dashboard",
      tab: "insar",
      volcanoId: "dabbahu"
    }
  }
];

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToEvent?: (target: { page: "dashboard" | "home"; tab?: string; volcanoId?: string }) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateToEvent
}) => {
  const [events, setEvents] = useState<NotificationEvent[]>(INITIAL_EVENTS);
  const [activeFilter, setActiveFilter] = useState<"all" | "volcanic" | "seismic" | "insar">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Mark all as read
  const handleMarkAllRead = () => {
    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
  };

  // Mark single as read
  const handleMarkRead = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
  };

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = activeFilter === "all" || e.category === activeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, activeFilter, searchQuery]);

  const unreadCount = events.filter((e) => !e.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans"
        >
          {/* 1. TOP HEADER */}
          <div className="bg-gradient-to-r from-[#0E4A72] via-[#0085C8] to-[#0E4A72] text-white px-5 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Bell className="w-5 h-5 text-[#F7D08A]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-[#0E4A72] shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                    Geohazard Event &amp; Notification Center
                  </h2>
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    LIVE FEED
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 font-medium">
                  Recent seismic swarms, volcanic alerts, and InSAR ground deformation history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  soundEnabled
                    ? "bg-white/15 text-white border-white/30 hover:bg-white/25"
                    : "bg-black/20 text-slate-300 border-white/10"
                }`}
                title={soundEnabled ? "Audio Chime ON" : "Audio Chime OFF"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. FILTER TABS & SEARCH BAR */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* CATEGORY FILTER PILLS */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "all"
                    ? "bg-[#0E4A72] text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200"
                }`}
              >
                <span>All Events</span>
                <span className="font-mono text-[10px] opacity-80">({events.length})</span>
              </button>

              <button
                onClick={() => setActiveFilter("volcanic")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "volcanic"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-rose-50 border border-slate-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Volcanic</span>
              </button>

              <button
                onClick={() => setActiveFilter("seismic")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "seismic"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-amber-50 border border-slate-200"
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-500" />
                <span>Seismic</span>
              </button>

              <button
                onClick={() => setActiveFilter("insar")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "insar"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-sky-50 border border-slate-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-sky-500" />
                <span>InSAR</span>
              </button>
            </div>

            {/* SEARCH & MARK ALL READ */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0085C8]"
                />
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="shrink-0 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-[#0E4A72] border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  Mark all read
                </button>
              )}
            </div>

          </div>

          {/* 3. EVENT LIST CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
                <p className="text-sm font-semibold">No matching geohazard events found</p>
                <p className="text-xs text-slate-500 mt-0.5">Try changing your search query or filter pills</p>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const isVolcanic = evt.category === "volcanic";
                const isSeismic = evt.category === "seismic";
                const isInSAR = evt.category === "insar";

                let badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                if (evt.severity === "warning") badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                if (evt.severity === "advisory") badgeColor = "bg-sky-100 text-sky-800 border-sky-200";
                if (evt.severity === "resolved") badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";

                return (
                  <div
                    key={evt.id}
                    onClick={() => handleMarkRead(evt.id)}
                    className={`pt-3 first:pt-0 transition-all rounded-xl p-3 border ${
                      !evt.read
                        ? "bg-amber-50/40 border-amber-200/80 shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* ICON & TITLE */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs border ${
                            isVolcanic
                              ? "bg-rose-50 border-rose-200 text-rose-600"
                              : isSeismic
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-sky-50 border-sky-200 text-sky-600"
                          }`}
                        >
                          {isVolcanic && <Flame className="w-5 h-5" />}
                          {isSeismic && <Radio className="w-5 h-5" />}
                          {isInSAR && <Compass className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {evt.title}
                            </h4>
                            {!evt.read && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-[#0085C8]" />
                              <span>{evt.location}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{evt.relativeTime}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SEVERITY & METRIC BADGE */}
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${badgeColor}`}>
                          {evt.status}
                        </span>
                        <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                          {evt.metricValue}
                        </div>
                      </div>

                    </div>

                    {/* DESCRIPTION & GEOLOGICAL CONTEXT */}
                    <div className="mt-2 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      <p>{evt.description}</p>
                      <p className="mt-1 text-slate-500 text-[11px] italic border-t border-slate-200/60 pt-1">
                        {evt.details}
                      </p>
                    </div>

                    {/* ACTION BUTTON */}
                    {evt.actionTarget && (
                      <div className="mt-2.5 flex items-center justify-between text-xs pt-1">
                        <span className="text-[11px] font-mono text-slate-400">
                          Coords: {evt.coordinates[0]}°N, {evt.coordinates[1]}°E
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            if (onNavigateToEvent && evt.actionTarget) {
                              onNavigateToEvent(evt.actionTarget);
                            }
                          }}
                          className="px-3 py-1 bg-[#0E4A72] hover:bg-[#0085C8] text-[#F7D08A] font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <span>Inspect on Observatory</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* 4. FOOTER STATUS BAR */}
          <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600 font-sans">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">
                Department of Geodesy &amp; Geodynamics Automated Warning Network
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Synced with Sentinel-1 &amp; FURI Real-Time Stream
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
