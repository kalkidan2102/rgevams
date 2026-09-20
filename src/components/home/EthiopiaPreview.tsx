import { useState } from "react";
import { Compass, Globe, SlidersHorizontal, Map, Flame, Activity, Sparkles, MapPin } from "lucide-react";
import { SectionTitle } from "../ui/SectionTitle";
import { motion, AnimatePresence } from "motion/react";

interface EthiopiaPreviewProps {
  onExploreMap: () => void;
}

interface Hotspot {
  id: string;
  name: string;
  type: "volcanic" | "seismic" | "junction";
  x: number; // percentage from left
  y: number; // percentage from top
  status: "Active" | "Critical" | "Stable";
  description: string;
  metrics: string;
}

export function EthiopiaPreview({ onExploreMap }: EthiopiaPreviewProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const hotspots: Hotspot[] = [
    {
      id: "erta-ale",
      name: "Erta Ale Shield Volcano",
      type: "volcanic",
      x: 65,
      y: 20,
      status: "Active",
      description: "Continuous basaltic lava lake activity with localized magma pressure surges.",
      metrics: "Lava Temp: 1,180°C • Inflation: +2.1cm/yr",
    },
    {
      id: "dallol",
      name: "Dallol Hydrothermal Zone",
      type: "volcanic",
      x: 60,
      y: 12,
      status: "Stable",
      description: "Extreme low-altitude phreatic vents showing active sulfur deposits.",
      metrics: "Elevation: -130m • pH Level: 0.8",
    },
    {
      id: "afar-triple",
      name: "Afar Triple Junction",
      type: "junction",
      x: 72,
      y: 28,
      status: "Critical",
      description: "Intersection of Nubian, Somalian, and Arabian plates spreading outward.",
      metrics: "Slip rate: 20mm/year • Dilatancy: High",
    },
    {
      id: "main-rift",
      name: "Main Ethiopian Rift (MER)",
      type: "junction",
      x: 48,
      y: 55,
      status: "Active",
      description: "Central axial graben zone linking the Afar depression to the Lake Turkana rift.",
      metrics: "Crustal thickness: 22km • Seismic activity: High",
    },
    {
      id: "corbetti",
      name: "Corbetti Caldera",
      type: "volcanic",
      x: 42,
      y: 68,
      status: "Active",
      description: "Massive silicic caldera displaying significant geodetic uplift and steam discharge.",
      metrics: "Inflation: 6.2cm/year • Heat flux: Stable",
    },
    {
      id: "nazret-eq",
      name: "Adama-Nazret Rift Faults",
      type: "seismic",
      x: 52,
      y: 48,
      status: "Critical",
      description: "Tectonic lineaments with a high density of shallow micro-earthquakes.",
      metrics: "Recent: M 4.8 • Depth: 9.2km",
    }
  ];

  return (
    <div id="ethiopia-preview" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-10 font-sans bg-gradient-to-br from-slate-50 via-sky-50/50 to-white text-slate-900 border-y border-sky-200/80 shadow-xs px-4 sm:px-6 lg:px-8">
      
      {/* Left descriptive text */}
      <div className="lg:col-span-5 space-y-6">
        <SectionTitle
          title="The East African Rift: Tectonics in Real-Time"
          subtitle="Ethiopia is the epicenter of global plate divergence, offering a natural laboratory for spaceborne and ground-based geodetic sensors."
          accent="Rifting Corridor"
          align="left"
        />

        <div className="space-y-4 text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
          <p>
            The <strong className="text-[#0070AC] font-black">Afar Triple Junction</strong> (located in northeastern Ethiopia) represents the meeting point of three massive tectonic plates—the Nubian, Somalian, and Arabian plates. Over millions of years, these plates have been pulling apart, creating a new ocean basin in the Horn of Africa.
          </p>
          <p>
            This physical tearing of the Earth's lithosphere results in intense volcanic activity, high heat flow, and recurrent crustal earthquakes. From <strong className="text-[#0070AC] font-black">Erta Ale's</strong> bubbling lava lake to the high-inflation calderas of <strong className="text-[#0070AC] font-black">Corbetti</strong> and <strong className="text-[#0070AC] font-black">Aluto-Langano</strong>, the Rift Valley is actively stretching.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-sky-200/90 shadow-md space-y-1">
          <h4 className="text-xs font-black text-[#0070AC] flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-[#B8860B]" />
            Continuous Observatory Feeds
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Click any pulsating hotspot on the map preview to view active geological telemetry metrics. Launch the full command center to explore real-time coordinate changes.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onExploreMap}
            aria-label="Open Interactive Active GIS Map Room"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0085C8] to-[#00B2E3] hover:from-[#0070AC] hover:to-[#0092BA] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
          >
            <Map className="w-4 h-4 text-white" />
            <span>Interactive Active GIS Map Room</span>
          </button>
        </div>
      </div>

      {/* Right Column: Stylized Vector Tectonic Map of Ethiopia */}
      <div className="lg:col-span-7 flex flex-col justify-center">
        <div className="relative aspect-video w-full max-w-2xl bg-[#041B2D] border border-slate-800 rounded-3xl overflow-hidden p-4 shadow-xl select-none group">
          
          {/* Subtle grid mesh overlays */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          {/* Abstract Ethiopia Outline Path in glowing slate color */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 500 300" fill="none">
            {/* Highly stylized polygon representing the borders of Ethiopia */}
            <polygon 
              points="150,50 250,40 380,60 440,110 450,180 390,220 330,260 250,280 180,240 100,210 80,150 110,90" 
              className="stroke-[#00D4FF] stroke-[2] fill-[#0085C8]/10" 
            />
            {/* The major rifting valley faults line */}
            <path 
              d="M100,210 L250,140 L380,60 M250,140 L330,260" 
              className="stroke-red-500/40 stroke-[3] stroke-dasharray-[4,4] animate-[pulse_3s_infinite]" 
            />
          </svg>

          {/* Map Compass Rose Accent */}
          <div className="absolute bottom-4 left-4 z-10 text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#CA933C] animate-spin-slow" />
            <span>Map Reference: horn-rift-v2</span>
          </div>

          <div className="absolute top-4 left-4 z-10 text-[10px] font-mono text-slate-400 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800">
            Plate Divergence Boundary Map
          </div>

          {/* Render pulsating hotspots */}
          {hotspots.map((spot) => {
            const isSelected = activeHotspot?.id === spot.id;
            return (
              <div
                key={spot.id}
                role="button"
                tabIndex={0}
                aria-label={`Explore hotspot marker: ${spot.name}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/marker focus:outline-none focus:ring-2 focus:ring-[#00D4FF] rounded-full"
                onMouseEnter={() => setActiveHotspot(spot)}
                onMouseLeave={() => setActiveHotspot(null)}
                onClick={onExploreMap}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onExploreMap();
                  }
                }}
              >
                {/* Glowing ripple ring */}
                <span className={`absolute inset-[-10px] rounded-full animate-ping pointer-events-none ${
                  spot.type === "volcanic" 
                    ? "bg-red-500/20" 
                    : spot.type === "seismic" 
                      ? "bg-amber-500/20" 
                      : "bg-cyan-500/20"
                }`} />

                {/* Inner core badge */}
                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border shadow-lg transition-transform duration-300 group-hover/marker:scale-125 ${
                  spot.type === "volcanic"
                    ? "bg-red-950 border-red-500 text-red-400"
                    : spot.type === "seismic"
                      ? "bg-amber-950 border-amber-500 text-amber-400"
                      : "bg-cyan-950 border-cyan-500 text-cyan-400"
                }`}>
                  {spot.type === "volcanic" ? (
                    <Flame className="w-3 h-3" />
                  ) : spot.type === "seismic" ? (
                    <Activity className="w-3 h-3" />
                  ) : (
                    <MapPin className="w-3 h-3" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Tooltip Overlay */}
          <AnimatePresence>
            {activeHotspot && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-4 right-4 max-w-sm bg-slate-900/95 border border-slate-800 p-4 rounded-2xl text-white backdrop-blur-md shadow-2xl z-30 font-sans space-y-2 pointer-events-none"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs font-bold text-[#00D4FF] font-display flex items-center gap-1">
                    {activeHotspot.type === "volcanic" && <Flame className="w-3.5 h-3.5 text-red-500" />}
                    {activeHotspot.type === "seismic" && <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
                    {activeHotspot.type === "junction" && <Compass className="w-3.5 h-3.5 text-cyan-500" />}
                    {activeHotspot.name}
                  </h4>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    activeHotspot.status === "Critical" 
                      ? "bg-red-500/20 text-[#D0232B] border border-red-500/30" 
                      : activeHotspot.status === "Active"
                        ? "bg-amber-500/20 text-[#CA933C] border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {activeHotspot.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {activeHotspot.description}
                </p>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>METRICS:</span>
                  <span className="text-[#CA933C]">{activeHotspot.metrics}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Hint */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-3 py-1.5 rounded-full bg-[#0085C8]/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-[#00D4FF]/30">
              Double Click to Inspect GIS Region
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
