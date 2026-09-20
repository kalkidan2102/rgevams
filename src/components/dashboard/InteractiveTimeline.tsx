import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Activity, 
  Flame, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Sliders, 
  Map, 
  Sparkles,
  Info
} from "lucide-react";
import { Earthquake, Volcano, SeverityLevel } from "../../types";
import { formatDate, getSeverityBg } from "../../utils/helpers";

interface InteractiveTimelineProps {
  earthquakes: Earthquake[];
  volcanoes: Volcano[];
  onFocusOnMap?: (coords: [number, number], item: { type: "earthquake" | "volcano"; id: string }) => void;
}

interface GeologicalTimelineEvent {
  id: string;
  type: "earthquake" | "volcanic";
  title: string;
  name: string; // Volcano name or Epicenter location
  location: string;
  dateTime: string;
  severity: SeverityLevel;
  description: string;
  magnitude?: number; // Only for earthquakes
  depth?: number; // Only for earthquakes
  coordinates: [number, number]; // [lat, lng]
}

export default function InteractiveTimeline({ 
  earthquakes, 
  volcanoes, 
  onFocusOnMap 
}: InteractiveTimelineProps) {
  // 1. Generate Timeline Range: Last 30 Days relative to today (or the current UTC time: 2026-07-21)
  const targetDate = useMemo(() => new Date("2026-07-21T07:21:07-07:00"), []);
  
  const daysList = useMemo(() => {
    const list = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(targetDate.getTime() - i * 24 * 60 * 60 * 1000);
      list.push(d);
    }
    return list;
  }, [targetDate]);

  // 2. Generate Volcanic Events for the last 30 days deterministically
  const volcanicEvents = useMemo(() => {
    const events: GeologicalTimelineEvent[] = [];
    
    volcanoes.forEach((v) => {
      // We generate 1-3 deterministic historical events in the last 30 days for each volcano
      const nameHash = v.name.charCodeAt(0) + v.name.charCodeAt(v.name.length - 1);
      const numEvents = (nameHash % 2) + 1; // 1 or 2 events

      for (let i = 0; i < numEvents; i++) {
        const offsetDays = ((nameHash * (i + 1)) % 28) + 1; // Day offset 1-28 days ago
        const eventDate = new Date(targetDate.getTime() - offsetDays * 24 * 60 * 60 * 1000);
        
        // Define some beautiful text based on the volcano name
        let title = "Volcanic Activity Update";
        let description = "Sensors detected slight geothermal output spikes. No immediate risk reported.";
        let severity: SeverityLevel = "Green";

        if (v.id === "v1" || v.name === "Erta Ale") {
          if (i === 0) {
            title = "Lava Lake Level Surge";
            description = "Infrared satellite radar recorded a sudden 4.2-meter basaltic surge in the primary lava crater lake, accompanied by high SO2 gas emission plumes.";
            severity = "Red";
          } else {
            title = "Strombolian Fountaining Event";
            description = "Fissure vents on the crater floor began a Strombolian phase, splattering basaltic lava blocks up to 15m above the active magma lake.";
            severity = "Orange";
          }
        } else if (v.id === "v2" || v.name === "Dallol") {
          if (i === 0) {
            title = "Acidic Phreatic Steam Venting";
            description = "High-pressure thermal water explosions formed three new sulfur-potash chimneys with acidic green hydrothermal pools in the western salt graben.";
            severity = "Orange";
          } else {
            title = "Underground Hydrothermal Pressure Spike";
            description = "Acoustic emission arrays registered deep boiling fluid murmurs. Brine temperatures rose by 4.8°C at the Black Mountain geyser fields.";
            severity = "Yellow";
          }
        } else if (v.id === "v3" || v.name === "Dabbahu") {
          title = "Magmatic Graben Fissure Release";
          description = "Thermal gas capture sensors on the 60km-long rift fissure registered a minor surge in carbon dioxide venting. Ground-tilt remained within nominal limits.";
          severity = "Yellow";
        } else if (v.id === "v4" || v.name === "Mount Fentale") {
          title = "Solfatara Sulfur Gas Plume Increase";
          description = "Spectrometers tracked elevated sulfur dioxide concentration hovering over the caldera floor, coinciding with shallow micro-fracture swarms.";
          severity = "Yellow";
        } else if (v.id === "v5" || v.name === "Alutu") {
          title = "InSAR Magma Reservoir Inflation Alert";
          description = "InSAR satellite radar analysis verified localized geodetic inflation of 0.8cm directly above the central silicic caldera chamber.";
          severity = "Yellow";
        } else {
          // Fallback for custom or newly added volcanoes
          title = `${v.name} Thermal Outgassing Spike`;
          description = `Continuous geodetic sensors at ${v.name} observed transient temperature anomalies and increased steam output. Field status remains standard.`;
          severity = v.severity;
        }

        events.push({
          id: `timeline_vol_${v.id}_ev_${i}`,
          type: "volcanic",
          title,
          name: v.name,
          location: v.region,
          dateTime: eventDate.toISOString(),
          severity,
          description,
          coordinates: v.coordinates
        });
      }
    });

    return events;
  }, [volcanoes, targetDate]);

  // 3. Map real earthquakes to the Timeline Events
  const earthquakeEvents = useMemo(() => {
    const events: GeologicalTimelineEvent[] = [];
    const thirtyDaysAgo = new Date(targetDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    earthquakes.forEach((eq) => {
      const eqDate = new Date(eq.dateTime);
      if (eqDate >= thirtyDaysAgo && eqDate <= targetDate) {
        events.push({
          id: eq.id,
          type: "earthquake",
          title: `M ${eq.magnitude.toFixed(1)} Seismic Rupture`,
          name: eq.location.split(",")[0].trim(),
          location: eq.location,
          dateTime: eq.dateTime,
          severity: eq.severity,
          description: eq.description,
          magnitude: eq.magnitude,
          depth: eq.depth,
          coordinates: eq.coordinates
        });
      }
    });

    return events;
  }, [earthquakes, targetDate]);

  // Combined and sorted event timeline (descending by date)
  const allTimelineEvents = useMemo(() => {
    return [...volcanicEvents, ...earthquakeEvents].sort((a, b) => 
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
  }, [volcanicEvents, earthquakeEvents]);

  // 4. Interactive scrubber state variables
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(29); // Default to today (last item)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(800); // ms per step
  const [filterMode, setFilterMode] = useState<"single" | "3day" | "cumulative">("3day");
  const [showEarthquakes, setShowEarthquakes] = useState<boolean>(true);
  const [showVolcanoes, setShowVolcanoes] = useState<boolean>(true);
  const [minMagnitudeFilter, setMinMagnitudeFilter] = useState<number>(2.0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 5. Aggregate events per day for our custom horizontal visualization
  const dailyAggregates = useMemo(() => {
    return daysList.map((dayDate) => {
      const startOfDay = new Date(dayDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dayDate);
      endOfDay.setHours(23, 59, 59, 999);

      const dayEqs = earthquakeEvents.filter((eq) => {
        const date = new Date(eq.dateTime);
        return date >= startOfDay && date <= endOfDay && (eq.magnitude || 0) >= minMagnitudeFilter;
      });

      const dayVols = volcanicEvents.filter((vol) => {
        const date = new Date(vol.dateTime);
        return date >= startOfDay && date <= endOfDay;
      });

      return {
        date: dayDate,
        formattedLabel: dayDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        formattedFull: dayDate.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" }),
        eqCount: dayEqs.length,
        volCount: dayVols.length,
        total: dayEqs.length + dayVols.length,
        peakMagnitude: dayEqs.length ? Math.max(...dayEqs.map(e => e.magnitude || 0)) : 0,
        hasRedAlert: dayEqs.some(e => e.severity === "Red") || dayVols.some(v => v.severity === "Red"),
        hasOrangeAlert: dayEqs.some(e => e.severity === "Orange") || dayVols.some(v => v.severity === "Orange"),
      };
    });
  }, [daysList, earthquakeEvents, volcanicEvents, minMagnitudeFilter]);

  // Calculate the maximum total events in a single day to scale our visual graph
  const maxEventsInDay = useMemo(() => {
    const maxVal = Math.max(...dailyAggregates.map(d => d.total), 1);
    return maxVal;
  }, [dailyAggregates]);

  // 6. Filter events falling in the active scrubbed range
  const activeEvents = useMemo(() => {
    const activeDay = daysList[selectedDayIndex];
    if (!activeDay) return [];

    let startRange = new Date(activeDay);
    let endRange = new Date(activeDay);

    if (filterMode === "single") {
      startRange.setHours(0, 0, 0, 0);
      endRange.setHours(23, 59, 59, 999);
    } else if (filterMode === "3day") {
      // 3 days window: day before, current day, day after
      const prevDay = selectedDayIndex > 0 ? daysList[selectedDayIndex - 1] : activeDay;
      const nextDay = selectedDayIndex < 29 ? daysList[selectedDayIndex + 1] : activeDay;
      startRange = new Date(prevDay);
      startRange.setHours(0, 0, 0, 0);
      endRange = new Date(nextDay);
      endRange.setHours(23, 59, 59, 999);
    } else if (filterMode === "cumulative") {
      // Cumulative: from 30 days ago up to the end of the selected day
      startRange = new Date(daysList[0]);
      startRange.setHours(0, 0, 0, 0);
      endRange.setHours(23, 59, 59, 999);
    }

    return allTimelineEvents.filter((ev) => {
      const evDate = new Date(ev.dateTime);
      const matchesTime = evDate >= startRange && evDate <= endRange;
      
      if (!matchesTime) return false;
      if (ev.type === "earthquake" && !showEarthquakes) return false;
      if (ev.type === "earthquake" && ev.magnitude && ev.magnitude < minMagnitudeFilter) return false;
      if (ev.type === "volcanic" && !showVolcanoes) return false;
      
      return true;
    });
  }, [selectedDayIndex, daysList, filterMode, allTimelineEvents, showEarthquakes, showVolcanoes, minMagnitudeFilter]);

  // Playback engine handler
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSelectedDayIndex((prev) => {
          if (prev >= 29) {
            setIsPlaying(false);
            return 29;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playSpeed]);

  const activeDayDateString = useMemo(() => {
    return daysList[selectedDayIndex]?.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) || "";
  }, [daysList, selectedDayIndex]);

  const totalFilteredEarthquakes = activeEvents.filter(e => e.type === "earthquake").length;
  const totalFilteredVolcanoes = activeEvents.filter(e => e.type === "volcanic").length;
  const maxFilteredMag = activeEvents.length ? Math.max(...activeEvents.filter(e => e.magnitude !== undefined).map(e => e.magnitude || 0)) : 0;

  return (
    <div 
      id="geodynamic_30d_timeline"
      className="bg-white/40 dark:bg-[#041B2D]/45 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-6 rounded-3xl space-y-6 shadow-2xs select-none animate-fade-in relative overflow-hidden"
    >
      {/* Background decoration elements */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header section with status triggers */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-150 dark:border-white/5 pb-4.5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#0085C8]/10 text-[#0085C8] dark:text-[#00D4FF] border border-[#0085C8]/20 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-white text-sm tracking-widest uppercase font-display flex flex-wrap items-center gap-2">
              <span>Geodynamic 30-Day Activity Scrubber</span>
              <span className="text-[9px] bg-[#0085C8]/10 border border-[#0085C8]/20 text-[#0085C8] dark:text-[#00D4FF] px-2 py-0.5 rounded-md font-mono font-black tracking-wide uppercase">Interactive Timelapse</span>
            </h3>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
              Visualize, filter, and replay seismic shocks and volcanic outgassing events over the last 30 days. Scrub through dates or trigger the play system for an automated geodynamic timelapse.
            </p>
          </div>
        </div>

        {/* Configuration Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-100/60 dark:bg-slate-900/30 p-2 rounded-2xl border border-slate-250 dark:border-white/5">
          {/* Mode selections */}
          <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-white/10 pr-2.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Mode:</span>
            <button
              onClick={() => setFilterMode("single")}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer ${
                filterMode === "single"
                  ? "bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-xs"
                  : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="Only show events on the exact scrubbed day"
            >
              Single Day
            </button>
            <button
              onClick={() => setFilterMode("3day")}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer ${
                filterMode === "3day"
                  ? "bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-xs"
                  : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="3-day window centered on scrubbed day (smoothens seismic cycles)"
            >
              3-Day Window
            </button>
            <button
              onClick={() => setFilterMode("cumulative")}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer ${
                filterMode === "cumulative"
                  ? "bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-xs"
                  : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="Cumulative events from day 1 up to the scrubbed day"
            >
              Cumulative
            </button>
          </div>

          {/* Source toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEarthquakes(!showEarthquakes)}
              className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-xl transition-all border cursor-pointer flex items-center gap-1 ${
                showEarthquakes
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600"
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Earthquakes</span>
            </button>
            <button
              onClick={() => setShowVolcanoes(!showVolcanoes)}
              className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-xl transition-all border cursor-pointer flex items-center gap-1 ${
                showVolcanoes
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600"
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Volcanic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visually stunning horizontal daily density timeline graph */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold px-1 uppercase">
          <span>{daysList[0]?.toLocaleDateString(undefined, { month: "short", day: "numeric" })} (30 Days Ago)</span>
          <span className="text-slate-450 flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 text-[#0085C8]" />
            DAILY ACTIVITY INTENSITY
          </span>
          <span>{daysList[29]?.toLocaleDateString(undefined, { month: "short", day: "numeric" })} (Today)</span>
        </div>

        {/* 30-day interactive block board */}
        <div 
          style={{ display: "grid", gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }} 
          className="gap-1 md:gap-1.5 h-16 bg-slate-950/5 dark:bg-slate-950/25 p-2 rounded-2xl border border-slate-200/40 dark:border-white/5 relative"
        >
          {dailyAggregates.map((data, index) => {
            const isSelected = selectedDayIndex === index;
            const hasEvents = data.total > 0;
            
            // Calculate relative heights for stacked components
            const totalWidthPct = maxEventsInDay ? (data.total / maxEventsInDay) * 100 : 0;
            
            // Background indicators based on threat levels on that day
            let threatBg = "bg-slate-200 dark:bg-slate-800/40";
            if (data.hasRedAlert) threatBg = "bg-rose-500/20 dark:bg-rose-500/10";
            else if (data.hasOrangeAlert) threatBg = "bg-amber-500/20 dark:bg-amber-500/10";
            else if (hasEvents) threatBg = "bg-sky-500/15 dark:bg-sky-500/5";

            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedDayIndex(index);
                  setIsPlaying(false);
                }}
                className={`relative h-full rounded-md cursor-pointer transition-all flex flex-col justify-end overflow-hidden group ${threatBg} ${
                  isSelected 
                    ? "ring-2 ring-[#00D4FF] scale-102 shadow-[0_0_12px_rgba(58,190,255,0.4)] z-10" 
                    : "hover:bg-slate-300/45 dark:hover:bg-slate-800"
                }`}
                title={`${data.formattedFull}: ${data.eqCount} Earthquakes, ${data.volCount} Volcanic Events`}
              >
                {/* Visual density stack inside the day block */}
                {hasEvents && (
                  <div className="w-full flex flex-col-reverse justify-start items-center" style={{ height: `${Math.max(totalWidthPct, 15)}%` }}>
                    {/* Earthquake stack component */}
                    {data.eqCount > 0 && (
                      <div 
                        className="w-full bg-amber-500/80 group-hover:bg-amber-400" 
                        style={{ height: `${(data.eqCount / data.total) * 100}%` }} 
                      />
                    )}
                    {/* Volcanic stack component */}
                    {data.volCount > 0 && (
                      <div 
                        className="w-full bg-rose-500/85 group-hover:bg-rose-400" 
                        style={{ height: `${(data.volCount / data.total) * 100}%` }} 
                      />
                    )}
                  </div>
                )}

                {/* Micro selection pointer */}
                {isSelected && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#00D4FF] animate-pulse"></div>
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-slate-900 text-white text-[10px] rounded-lg p-2.5 shadow-xl w-36 pointer-events-none border border-white/10 font-sans leading-relaxed">
                  <div className="font-bold border-b border-white/10 pb-1 mb-1 text-sky-400">{data.formattedLabel}</div>
                  <div className="flex justify-between">
                    <span>Earthquakes:</span>
                    <span className="font-bold font-mono text-amber-400">{data.eqCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volcanic Events:</span>
                    <span className="font-bold font-mono text-rose-400">{data.volCount}</span>
                  </div>
                  {data.peakMagnitude > 0 && (
                    <div className="flex justify-between border-t border-white/5 mt-1 pt-1">
                      <span>Peak Mag:</span>
                      <span className="font-bold font-mono text-cyan-400">M {data.peakMagnitude.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control console deck with play buttons and sliders */}
      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-5 select-none shadow-inner">
        {/* Playback action row */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSelectedDayIndex(0)}
            disabled={selectedDayIndex === 0}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-250 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 disabled:opacity-30 cursor-pointer transition-all"
            title="Reset to 30 Days Ago"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setSelectedDayIndex((prev) => Math.max(0, prev - 1));
              setIsPlaying(false);
            }}
            disabled={selectedDayIndex === 0}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-250 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 disabled:opacity-30 cursor-pointer transition-all"
            title="Step Backwards"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Primary play pulse */}
          <button
            onClick={() => {
              if (selectedDayIndex >= 29 && !isPlaying) {
                // If at the end, restart from 0
                setSelectedDayIndex(0);
              }
              setIsPlaying(!isPlaying);
            }}
            className={`p-3.5 rounded-full text-white cursor-pointer transition-all shadow-md active:scale-95 ${
              isPlaying 
                ? "bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                : "bg-[#0085C8] hover:bg-[#0074b0] shadow-[0_0_15px_rgba(0,133,200,0.3)]"
            }`}
            title={isPlaying ? "Pause timelapse playback" : "Play timeline timelapse"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              setSelectedDayIndex((prev) => Math.min(29, prev + 1));
              setIsPlaying(false);
            }}
            disabled={selectedDayIndex === 29}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-250 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 disabled:opacity-30 cursor-pointer transition-all"
            title="Step Forwards"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Speed controls */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-250 dark:border-white/10 text-[9px] font-mono font-bold text-slate-450 dark:text-slate-400">
            <span>SPEED:</span>
            <button 
              onClick={() => setPlaySpeed(1200)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${playSpeed === 1200 ? "bg-[#0085C8] text-white" : "hover:bg-slate-100"}`}
            >
              1x
            </button>
            <button 
              onClick={() => setPlaySpeed(600)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${playSpeed === 600 ? "bg-[#0085C8] text-white" : "hover:bg-slate-100"}`}
            >
              2x
            </button>
            <button 
              onClick={() => setPlaySpeed(250)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${playSpeed === 250 ? "bg-[#0085C8] text-white" : "hover:bg-slate-100"}`}
            >
              4x
            </button>
          </div>
        </div>

        {/* Double-acting range slider */}
        <div className="flex-grow w-full max-w-xl flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold text-slate-450 dark:text-slate-500 whitespace-nowrap">DAY 30D SLIDE</span>
          <div className="relative flex-grow h-6 flex items-center">
            <input
              type="range"
              min="0"
              max="29"
              value={selectedDayIndex}
              onChange={(e) => {
                setSelectedDayIndex(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0085C8]"
            />
            {/* Slide handle bubble labels */}
            <div 
              className="absolute pointer-events-none bg-slate-950 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md -top-6 transform -translate-x-1/2 shadow-md border border-white/10 flex items-center gap-1"
              style={{ left: `${(selectedDayIndex / 29) * 100}%` }}
            >
              <Calendar className="w-2.5 h-2.5 text-sky-400" />
              <span>Day {selectedDayIndex + 1}</span>
            </div>
          </div>
        </div>

        {/* Magnitude Filter */}
        <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-250 dark:border-white/10 self-stretch md:self-auto shrink-0 justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Mag &ge; {minMagnitudeFilter.toFixed(1)}</span>
          <input
            type="range"
            min="2.0"
            max="5.5"
            step="0.5"
            value={minMagnitudeFilter}
            onChange={(e) => setMinMagnitudeFilter(parseFloat(e.target.value))}
            className="w-20 sm:w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Selected Period geodynamic status board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/5 dark:bg-slate-950/25 p-4 rounded-2xl border border-slate-200/40 dark:border-white/5 relative">
        <div className="space-y-1">
          <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">Active Time Target</div>
          <div className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0085C8]" />
            <span className="truncate">{dailyAggregates[selectedDayIndex]?.formattedLabel || ""}</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            {filterMode === "single" && "Viewing single-day records"}
            {filterMode === "3day" && "Viewing 3-day micro-window"}
            {filterMode === "cumulative" && "Accumulated monthly trends"}
          </div>
        </div>

        <div className="space-y-1 border-l border-slate-200 dark:border-white/5 pl-4">
          <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">Earthquake Ingests</div>
          <div className="text-xl font-black text-amber-500 flex items-baseline gap-1 font-mono">
            <span>{totalFilteredEarthquakes}</span>
            <span className="text-[9.5px] text-slate-400 font-normal uppercase">shocks</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Active filters: Mag &ge; {minMagnitudeFilter.toFixed(1)}
          </div>
        </div>

        <div className="space-y-1 border-l border-slate-200 dark:border-white/5 pl-4">
          <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">Volcanic Discharges</div>
          <div className="text-xl font-black text-rose-500 flex items-baseline gap-1 font-mono">
            <span>{totalFilteredVolcanoes}</span>
            <span className="text-[9.5px] text-slate-400 font-normal uppercase">activities</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Thermal anomaly emissions
          </div>
        </div>

        <div className="space-y-1 border-l border-slate-200 dark:border-white/5 pl-4">
          <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">Peak Strain Index</div>
          <div className="text-xl font-black text-cyan-400 flex items-baseline gap-1 font-mono">
            <span>{maxFilteredMag > 0 ? `M ${maxFilteredMag.toFixed(1)}` : "None"}</span>
            {maxFilteredMag > 0 && <span className="text-[9.5px] text-slate-400 font-normal uppercase">Mw</span>}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Highest regional magnitude recorded
          </div>
        </div>
      </div>

      {/* Target range active events catalog panel */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-[11px] sm:text-xs text-slate-800 dark:text-white tracking-widest uppercase flex items-center gap-2 border-b border-slate-150 dark:border-white/5 pb-2.5">
          <span className="w-1.5 h-3 bg-gradient-to-b from-sky-500 to-indigo-500 rounded-full inline-block"></span>
          <span>Timeline Event Feed ({activeEvents.length})</span>
          <span className="text-[9px] font-mono font-normal text-slate-400 dark:text-slate-500 normal-case ml-auto">
            {filterMode === "single" && `Date: ${activeDayDateString}`}
            {filterMode === "3day" && "3-day rolling window"}
            {filterMode === "cumulative" && "Cumulative logs"}
          </span>
        </h4>

        {activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {activeEvents.map((ev) => {
                const isEq = ev.type === "earthquake";
                const dateObj = new Date(ev.dateTime);
                const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
                const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                
                return (
                  <motion.div
                    layout
                    key={ev.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-2xl bg-white/45 dark:bg-slate-900/10 border border-slate-200/50 dark:border-white/5 hover:border-sky-500/30 dark:hover:border-[#00D4FF]/30 hover:bg-white/65 dark:hover:bg-slate-900/30 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group relative overflow-hidden`}
                  >
                    {/* Micro colored stripe indicating category */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${isEq ? "bg-amber-500" : "bg-rose-500"}`} />

                    <div className="space-y-2.5 pl-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 text-[8.5px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getSeverityBg(ev.severity)}`}>
                          {isEq ? (
                            <>
                              <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
                              <span>M {ev.magnitude?.toFixed(1)}</span>
                            </>
                          ) : (
                            <>
                              <Flame className="w-3 h-3 text-rose-500" />
                              <span>{ev.severity.toUpperCase()} ALERT</span>
                            </>
                          )}
                        </span>
                        
                        <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{dateStr}, {timeStr}</span>
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight uppercase tracking-wide group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {ev.title}
                        </h5>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.name}</span>
                        </p>
                      </div>

                      <p className="text-[10.5px] text-slate-550 dark:text-slate-400 leading-normal font-sans">
                        {ev.description}
                      </p>

                      {/* Earthquake specifics */}
                      {isEq && (
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg border border-slate-200/40 dark:border-white/5 text-[9.5px] font-mono">
                          <div>
                            <span className="text-slate-400 text-[8.5px] block uppercase leading-none mb-0.5">Depth Parameter</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{ev.depth} km</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[8.5px] block uppercase leading-none mb-0.5">Focal Axis</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{ev.coordinates[0].toFixed(2)}°N, {ev.coordinates[1].toFixed(2)}°E</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-800/80 pt-3 mt-4 text-[9.5px] font-mono pl-2">
                      <span className="text-slate-400 uppercase">SYS_LOG: {ev.id.substring(0, 10)}</span>
                      {onFocusOnMap && (
                        <button
                          onClick={() => onFocusOnMap(ev.coordinates, { type: isEq ? "earthquake" : "volcano", id: ev.id.replace("timeline_vol_", "").split("_ev_")[0] })}
                          className="bg-sky-500/10 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-400 font-extrabold px-2.5 py-1 rounded-lg border border-sky-500/20 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Map className="w-3 h-3" />
                          <span>Track Epicenter</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 text-xs italic space-y-2 select-none">
            <Info className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-650 dark:text-slate-300 not-italic">No geodynamic events recorded in selected period</p>
            <p className="max-w-[340px] mx-auto text-[10.5px] font-sans text-slate-450 dark:text-slate-400 not-italic">
              Try adjusting the filter magnitude, toggling earthquakes and volcanic indicators, or expanding the filter mode to 3-Day Window or Cumulative.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
