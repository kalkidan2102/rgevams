import { useState } from "react";
import {
  LineChart,
  Layers,
  Compass,
  Activity,
  Download,
  BookOpen,
  FileText,
  Sparkles,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Globe,
  Share2,
  CheckCircle2,
  Flame,
  Radio,
  Sliders,
  Maximize2,
  Building2,
  LogOut,
  MapPin
} from "lucide-react";
import { UserRoleType, Volcano, Earthquake, GnssStation } from "../../types";
import { ETHIOPIA_GNSS_STATIONS } from "../../data/earthquakes";

interface ResearcherDashboardProps {
  currentUser: {
    name: string;
    email: string;
    role: UserRoleType;
    institution?: string;
  };
  volcanoes?: Volcano[];
  earthquakes?: Earthquake[];
  onSignOut?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface ResearchMemo {
  id: string;
  title: string;
  author: string;
  date: string;
  topic: "InSAR Deformation" | "Magma Dyke Intrusion" | "GNSS Strain Kinematics" | "Focal Mechanism";
  abstract: string;
  targetRegion: string;
  doi?: string;
  status: "Published" | "Draft" | "Under Review";
}

export function ResearcherDashboard({
  currentUser,
  volcanoes = [],
  earthquakes = [],
  onSignOut,
  onNavigateToTab
}: ResearcherDashboardProps) {
  const [activeTab, setActiveTab] = useState<"insar" | "gnss-kinematics" | "dbscan-seismic" | "memos" | "export">("insar");

  // InSAR Analysis state
  const [selectedInSarTarget, setSelectedInSarTarget] = useState<string>("erta-ale");
  const [selectedOrbit, setSelectedOrbit] = useState<"descending" | "ascending">("descending");
  const [coherenceThreshold, setCoherenceThreshold] = useState<number>(0.65);

  // GNSS Strain Model state
  const [selectedGnssPlate, setSelectedGnssPlate] = useState<"all" | "nubian" | "somalian" | "danakil">("all");
  const [gnssSearch, setGnssSearch] = useState("");

  // DBSCAN Seismic state
  const [epsRadius, setEpsRadius] = useState<number>(15);
  const [minClusterPts, setMinClusterPts] = useState<number>(4);
  const [calculatedBValue, setCalculatedBValue] = useState<number>(1.14);

  // Research Memos state
  const [memos, setMemos] = useState<ResearchMemo[]>([
    {
      id: "MEMO-2026-041",
      title: "Co-seismic Strain Partitioning across Dobi Graben during 2026 Swarm",
      author: "Prof. Dawit Alemu, Dr. Belayneh Assefa",
      date: "2026-08-26",
      topic: "InSAR Deformation",
      abstract: "Sentinel-1 unwrapped interferograms demonstrate 42mm line-of-sight extension along normal fault scarps, consistent with shallow (<6 km) magmatic dyke intrusion along the Tendaho-Goba'ad discontinuity.",
      targetRegion: "Central Afar Graben",
      doi: "10.1016/j.jvolgeores.2026.107890",
      status: "Published"
    },
    {
      id: "MEMO-2026-039",
      title: "Continuous GPS Kinematic Vector Discontinuity across Erta Ale Shield",
      author: "Prof. Dawit Alemu (Lead Crustal Geodesist)",
      date: "2026-08-20",
      topic: "GNSS Strain Kinematics",
      abstract: "Station ERAL and SEME record divergent horizontal velocities of 38.2 mm/yr (Azimuth 048°), corroborating sustained opening of the Red Sea-Aden rift arm.",
      targetRegion: "Danakil Depression",
      doi: "10.1029/2026JB024510",
      status: "Published"
    },
    {
      id: "MEMO-2026-035",
      title: "Gutenberg-Richter b-Value Elevation during 2026 Erta Ale Caldera Swarm",
      author: "Geodynamics Research Group",
      date: "2026-08-14",
      topic: "Focal Mechanism",
      abstract: "A high b-value of 1.28±0.06 was observed during the peak thermal phase, indicative of thermal pore-fluid overpressure rather than purely tectonic shear dislocation.",
      targetRegion: "Erta Ale Caldera",
      status: "Under Review"
    }
  ]);

  const [newMemoTitle, setNewMemoTitle] = useState("");
  const [newMemoTopic, setNewMemoTopic] = useState<ResearchMemo["topic"]>("InSAR Deformation");
  const [newMemoRegion, setNewMemoRegion] = useState("Afar Triple Junction");
  const [newMemoAbstract, setNewMemoAbstract] = useState("");
  const [memoPublishSuccess, setMemoPublishSuccess] = useState(false);

  // Filtered GNSS Stations
  const filteredGnss = ETHIOPIA_GNSS_STATIONS.filter((st) => {
    const matchSearch = st.name.toLowerCase().includes(gnssSearch.toLowerCase()) || st.location.toLowerCase().includes(gnssSearch.toLowerCase());
    return matchSearch;
  });

  const handlePublishMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoTitle.trim() || !newMemoAbstract.trim()) return;

    const newMemo: ResearchMemo = {
      id: `MEMO-2026-0${memos.length + 42}`,
      title: newMemoTitle,
      author: currentUser.name || "Geoscientist Researcher",
      date: new Date().toISOString().split("T")[0],
      topic: newMemoTopic,
      abstract: newMemoAbstract,
      targetRegion: newMemoRegion,
      status: "Published"
    };

    setMemos([newMemo, ...memos]);
    setNewMemoTitle("");
    setNewMemoAbstract("");
    setMemoPublishSuccess(true);
    setTimeout(() => setMemoPublishSuccess(false), 4000);
  };

  const handleDownloadDataset = (format: string, name: string) => {
    let content = "";
    let mimeType = "text/plain";
    let filename = `${name}_${Date.now()}`;

    if (format === "json") {
      content = JSON.stringify({ metadata: { provider: "ESSGI Research Portal", exportedAt: new Date().toISOString() }, data: filteredGnss }, null, 2);
      mimeType = "application/json";
      filename += ".json";
    } else if (format === "csv") {
      content = "Station_ID,Name,Latitude,Longitude,Vel_North_mm_yr,Vel_East_mm_yr,Vel_Up_mm_yr,Monitored_By\n" +
        ETHIOPIA_GNSS_STATIONS.map(s => `${s.id},"${s.name}",${s.coordinates[0]},${s.coordinates[1]},${s.velocityNorth},${s.velocityEast},${s.velocityUp},"${s.monitoredBy}"`).join("\n");
      mimeType = "text/csv";
      filename += ".csv";
    } else {
      content = `# ESSGI GMT Geodetic Vector Format\n# Provider: Ethiopian Space Science and Geospatial Institute\n` +
        ETHIOPIA_GNSS_STATIONS.map(s => `${s.coordinates[1]} ${s.coordinates[0]} ${s.velocityEast} ${s.velocityNorth} 0.5 0.5 0.0 ${s.name}`).join("\n");
      mimeType = "text/plain";
      filename += ".gmt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07243A] via-[#0E4A72] to-[#125B8C] text-white p-6 md:p-8 shadow-xl border border-sky-400/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono uppercase tracking-widest font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              ESSGI &amp; COMET RIFT GEODYNAMICS LABORATORY
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
              <span>Geoscientific Research &amp; InSAR Crustal Laboratory</span>
            </h1>
            
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans font-medium">
              High-precision Sentinel-1 InSAR ground deformation tracking, 18-station continuous GNSS kinematic modeling, and PostGIS DBSCAN seismic swarm strain partitioning.
            </p>
          </div>

          {/* Officer identity card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex flex-col gap-2 shrink-0 min-w-[240px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold">Lead Investigator</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[9.5px] font-mono uppercase font-black">
                {currentUser.role.toUpperCase()}
              </span>
            </div>
            
            <div>
              <div className="font-extrabold text-sm text-white">{currentUser.name}</div>
              <div className="text-[10.5px] text-slate-300 font-mono">{currentUser.email}</div>
            </div>
            
            <div className="text-[10px] text-slate-300 border-t border-white/10 pt-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="truncate">{currentUser.institution || "ESSGI Crustal Geodynamics Lab"}</span>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 border-t border-white/10 mt-6 scrollbar-none">
          <button
            onClick={() => setActiveTab("insar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "insar"
                ? "bg-white text-[#0E4A72] shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. InSAR Ground Deformation</span>
          </button>

          <button
            onClick={() => setActiveTab("gnss-kinematics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "gnss-kinematics"
                ? "bg-white text-[#0E4A72] shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2. GNSS Strain Kinematics</span>
          </button>

          <button
            onClick={() => setActiveTab("dbscan-seismic")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "dbscan-seismic"
                ? "bg-white text-[#0E4A72] shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. DBSCAN Swarm &amp; b-Value</span>
          </button>

          <button
            onClick={() => setActiveTab("memos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "memos"
                ? "bg-white text-[#0E4A72] shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Research Memos ({memos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "export"
                ? "bg-white text-[#0E4A72] shadow-md"
                : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>5. Research Data Export</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SATELLITE InSAR & GROUND DISPLACEMENT DEFORMATION */}
      {/* ========================================================================= */}
      {activeTab === "insar" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Target Selector & Parameters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5">
              <div>
                <h3 className="font-extrabold text-sm text-[#0E4A72] dark:text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Sentinel-1 InSAR Track Controls</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  LiCSBAS automated time-series processing with atmospheric phase screen (GACOS) tropospheric correction.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Volcanic / Rifting Focus:
                  </label>
                  <select
                    value={selectedInSarTarget}
                    onChange={(e) => setSelectedInSarTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="erta-ale">Erta Ale Caldera &amp; Lava Lake (Afar)</option>
                    <option value="dallol">Dallol Hydrothermal Graben (Danakil)</option>
                    <option value="alutu">Alutu-Langano Caldera (Main Ethiopian Rift)</option>
                    <option value="fentale">Fentale &amp; Dofen Fissure Swarm</option>
                    <option value="corbetti">Corbetti Caldera Uplift Zone</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Satellite Pass Orbit:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedOrbit("descending")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                        selectedOrbit === "descending"
                          ? "bg-[#0E4A72] text-white border-[#0E4A72]"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Track 079 (Desc)
                    </button>
                    <button
                      onClick={() => setSelectedOrbit("ascending")}
                      className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                        selectedOrbit === "ascending"
                          ? "bg-[#0E4A72] text-white border-[#0E4A72]"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Track 014 (Asc)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Phase Coherence Mask (γ):</span>
                    <span className="text-[#0E4A72] dark:text-cyan-400">&ge; {coherenceThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="0.9"
                    step="0.05"
                    value={coherenceThreshold}
                    onChange={(e) => setCoherenceThreshold(parseFloat(e.target.value))}
                    className="w-full accent-[#0E4A72] dark:accent-cyan-400"
                  />
                  <div className="flex justify-between text-[9.5px] font-mono text-slate-400 mt-0.5">
                    <span>0.30 (Loose)</span>
                    <span>0.65 (Nominal)</span>
                    <span>0.90 (Bedrock)</span>
                  </div>
                </div>
              </div>

              {/* Statistical Summary Box */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">LiCSBAS Deformation Stats</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Peak LOS Rate:</span>
                    <strong className="text-rose-600 font-extrabold">+32.4 mm/yr</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Mean Subsidence:</span>
                    <strong className="text-sky-600 font-extrabold">-11.8 mm/yr</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Coherent Pixels:</span>
                    <strong className="text-slate-700 dark:text-slate-300">142,890 pts</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">RMS Residual:</span>
                    <strong className="text-emerald-600 font-extrabold">&plusmn; 2.1 mm</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab?.("insar")}
                className="w-full py-2.5 bg-gradient-to-r from-[#0E4A72] to-[#0085C8] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Launch Full InSAR Interferogram Viewer</span>
              </button>
            </div>

            {/* Middle and Right: Interactive Synthetic Interferogram Display */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-widest">
                    SENTINEL-1 IW SLC TIME-SERIES DISPLACEMENT
                  </div>
                  <h4 className="text-lg font-black font-display text-white mt-0.5">
                    Target: {selectedInSarTarget.toUpperCase().replace("-", " ")} CALDERA DEFORMATION MAP
                  </h4>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono rounded-full font-bold">
                  Coherence Validated
                </span>
              </div>

              {/* Visual Simulated Phase Fringe Canvas Container */}
              <div className="my-4 bg-slate-950 rounded-2xl border border-cyan-500/30 p-4 relative min-h-[220px] flex flex-col justify-between">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-rose-500 to-amber-500 rounded-2xl" />
                
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>Frame: 079D_05612_131313</span>
                  <span>Temporal Baseline: 12 Days (Epoch 2026-08-14 to 2026-08-26)</span>
                </div>

                {/* Phase Fringe Waveform Graphic */}
                <div className="relative z-10 py-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="h-20 w-full flex items-center justify-center gap-1.5 overflow-hidden px-4">
                    {[18, 35, 62, 85, 94, 78, 55, 32, 15, 28, 58, 88, 92, 70, 45, 20, 38, 72, 95, 84, 52, 24].map((val, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${val}%` }}
                        className={`w-3 rounded-full transition-all duration-500 ${
                          val > 80 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" :
                          val > 50 ? "bg-amber-400" :
                          val > 30 ? "bg-cyan-400" : "bg-sky-600"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    LOS Displacement Velocity Gradient Profile: [ -12.4 mm/yr &larr;&bull;&rarr; +38.6 mm/yr ]
                  </div>
                </div>

                {/* Colorbar Scale */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono bg-slate-900/80 p-2 rounded-xl border border-white/10">
                  <span className="text-sky-400 font-bold">-28 mm (Subsidence)</span>
                  <div className="h-2.5 flex-1 mx-4 rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 via-amber-400 to-rose-500" />
                  <span className="text-rose-400 font-bold">+35 mm (Inflation/Uplift)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
                <span>Phase Wavelength: &lambda; = 5.546 cm (C-Band Radar)</span>
                <button
                  onClick={() => handleDownloadDataset("json", "insar_velocity_profile")}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download LiCSBAS GeoTIFF Matrix</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GNSS CRUSTAL KINEMATICS & STRAIN-RATE MODELING */}
      {/* ========================================================================= */}
      {activeTab === "gnss-kinematics" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#0E4A72] dark:text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  <span>Ethiopian Continuous GNSS Geodetic Velocity Ledger (ITRF2020)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Millimeter-accurate horizontal and vertical crustal drift velocities relative to stable Nubia reference frame.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gnssSearch}
                    onChange={(e) => setGnssSearch(e.target.value)}
                    placeholder="Search station ID or city..."
                    className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0E4A72]/20"
                  />
                </div>

                <button
                  onClick={() => handleDownloadDataset("csv", "gnss_kinematic_velocities")}
                  className="px-3.5 py-1.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table of GNSS Stations */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left">Station ID</th>
                    <th scope="col" className="px-4 py-3 text-left">Station Name &amp; Location</th>
                    <th scope="col" className="px-4 py-3 text-left">Coordinates (Lat, Lon)</th>
                    <th scope="col" className="px-4 py-3 text-right">V_North (mm/yr)</th>
                    <th scope="col" className="px-4 py-3 text-right">V_East (mm/yr)</th>
                    <th scope="col" className="px-4 py-3 text-right">V_Up (mm/yr)</th>
                    <th scope="col" className="px-4 py-3 text-right">Net Horiz. Drift</th>
                    <th scope="col" className="px-4 py-3 text-left">Monitored Directorate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredGnss.map((station) => {
                    const netSpeed = Math.sqrt(Math.pow(station.velocityNorth, 2) + Math.pow(station.velocityEast, 2)).toFixed(1);
                    return (
                      <tr key={station.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#0E4A72] dark:text-cyan-400">
                          {station.id.replace("gnss_", "").toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{station.name}</div>
                          <div className="text-[10px] text-slate-400">{station.location}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {station.coordinates[0].toFixed(3)}°N, {station.coordinates[1].toFixed(3)}°E
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          +{station.velocityNorth.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-sky-600 dark:text-sky-400">
                          +{station.velocityEast.toFixed(1)}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${
                          station.velocityUp >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {station.velocityUp > 0 ? `+${station.velocityUp.toFixed(1)}` : station.velocityUp.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-amber-600 dark:text-amber-400">
                          {netSpeed} mm/yr
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[10.5px]">
                          {station.monitoredBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Geodynamic Strain Rate Formula Box */}
            <div className="bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 p-4 rounded-2xl text-xs space-y-1.5">
              <div className="font-bold text-[#0E4A72] dark:text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Kinematic Formulation (Afar Triple Junction Divergence Model):</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                The horizontal strain rate tensor &epsilon;&#775;<sub>ij</sub> is inverted using continuous least-squares collocation across the 18-station network.
                Maximum extension rate across the Central Afar segment measures <strong>~18.5 nanostrain/year</strong> along an opening azimuth of N046°E.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SPATIAL DBSCAN SEISMIC SWARM & GUTENBERG-RICHTER B-VALUE */}
      {/* ========================================================================= */}
      {activeTab === "dbscan-seismic" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: DBSCAN Clustering Parameters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5">
              <div>
                <h3 className="font-extrabold text-sm text-[#0E4A72] dark:text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>DBSCAN Magma Dyke Swarm Clustering</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Spatial density-based clustering algorithm for isolating episodic magma intrusion swarms from background tectonic microseismicity.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Search Radius (&epsilon;):</span>
                    <span className="text-[#0E4A72] dark:text-cyan-400">{epsRadius} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={epsRadius}
                    onChange={(e) => setEpsRadius(parseInt(e.target.value))}
                    className="w-full accent-[#0E4A72]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Min Cluster Points (MinPts):</span>
                    <span className="text-[#0E4A72] dark:text-cyan-400">{minClusterPts} events</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={minClusterPts}
                    onChange={(e) => setMinClusterPts(parseInt(e.target.value))}
                    className="w-full accent-[#0E4A72]"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-mono">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Clustering Output:</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Identified Magma Swarms:</span>
                    <strong className="text-amber-600 font-extrabold">3 Active Clusters</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Isolated Noise Events:</span>
                    <strong className="text-slate-700 dark:text-slate-300">12 events</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mean Hypocenter Depth:</span>
                    <strong className="text-[#0E4A72] dark:text-cyan-400">8.4 km</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newB = (1.05 + Math.random() * 0.25).toFixed(2);
                    setCalculatedBValue(parseFloat(newB));
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Compute Maximum Likelihood b-Value</span>
                </button>
              </div>
            </div>

            {/* Middle & Right Column: Gutenberg-Richter Law & Hypocenter Depth Slices */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-extrabold text-sm text-[#0E4A72] dark:text-cyan-400 uppercase tracking-wide">
                    Gutenberg-Richter Magnitude Recurrence: log<sub>10</sub> N = a - bM
                  </h4>
                  <p className="text-xs text-slate-500">
                    Aki maximum likelihood b-value estimation across Ethiopian rift catalogs (N = 850 events).
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated b-Value</span>
                  <span className="text-xl font-black text-rose-600">{calculatedBValue} &plusmn; 0.04</span>
                </div>
              </div>

              {/* Graphical Recurrence Fit Simulation */}
              <div className="bg-slate-950 rounded-2xl p-5 text-white font-mono space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Frequency-Magnitude Distribution (FMD)</span>
                  <span className="text-emerald-400 font-bold">Magnitude of Completeness: M<sub>c</sub> = 2.4</span>
                </div>

                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  {[
                    { mag: "M 2.0+", count: 480, height: "100%" },
                    { mag: "M 2.5+", count: 210, height: "72%" },
                    { mag: "M 3.0+", count: 94, height: "50%" },
                    { mag: "M 3.5+", count: 38, height: "34%" },
                    { mag: "M 4.0+", count: 14, height: "20%" },
                    { mag: "M 5.0+", count: 3, height: "8%" }
                  ].map((col) => (
                    <div key={col.mag} className="flex flex-col items-center justify-end h-32 space-y-1.5">
                      <span className="text-[10px] text-cyan-300">{col.count}</span>
                      <div style={{ height: col.height }} className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg" />
                      <span className="text-[10px] text-slate-400">{col.mag}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-amber-400">Geophysical Interpretation:</strong> The computed b-value of <strong>{calculatedBValue}</strong> is significantly greater than the standard tectonic baseline (b &asymp; 0.90), indicating <strong>high thermal pore-pressure and active magmatic fluid degassing</strong> driving swarm activity along the Afar rift axis.
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RESEARCH MEMOS & PEER-REVIEWED FIELD OBSERVATIONS */}
      {/* ========================================================================= */}
      {activeTab === "memos" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Draft New Memo */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-[#0E4A72] dark:text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Draft Research Intelligence Memo</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish peer-reviewed geodynamic field observations to the ESSGI Scientific Directorate.
                </p>
              </div>

              {memoPublishSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold">
                  ✅ Research memo published to ESSGI Scientific Archive!
                </div>
              )}

              <form onSubmit={handlePublishMemo} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 block">
                    Memo / Paper Title:
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemoTitle}
                    onChange={(e) => setNewMemoTitle(e.target.value)}
                    placeholder="e.g. Crustal Uplift Dynamics at Corbetti..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E4A72]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold text-slate-700 dark:text-slate-300 block">
                      Primary Discipline:
                    </label>
                    <select
                      value={newMemoTopic}
                      onChange={(e) => setNewMemoTopic(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100"
                    >
                      <option value="InSAR Deformation">InSAR Deformation</option>
                      <option value="GNSS Strain Kinematics">GNSS Kinematics</option>
                      <option value="Magma Dyke Intrusion">Magma Dykes</option>
                      <option value="Focal Mechanism">Focal Mechanism</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold text-slate-700 dark:text-slate-300 block">
                      Target Rift Sector:
                    </label>
                    <input
                      type="text"
                      value={newMemoRegion}
                      onChange={(e) => setNewMemoRegion(e.target.value)}
                      placeholder="e.g. Afar Triple Junction"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 block">
                    Abstract &amp; Geoscientific Synthesis:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newMemoAbstract}
                    onChange={(e) => setNewMemoAbstract(e.target.value)}
                    placeholder="Synthesize methodology, deformation rates, strain tensors, and hazard implications..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E4A72]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Publish to Scientific Archive</span>
                </button>
              </form>
            </div>

            {/* Right: Published Memos Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  ESSGI Peer-Reviewed Research Archive ({memos.length} Memos)
                </h4>
                <span className="text-[10.5px] font-mono text-slate-400">Open Access Geodesy Repository</span>
              </div>

              <div className="space-y-3.5">
                {memos.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 hover:border-[#0E4A72]/40 transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-[9.5px] font-mono font-bold uppercase">
                            {m.topic}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{m.id} &bull; {m.date}</span>
                        </div>
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white font-display">
                          {m.title}
                        </h5>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-200 dark:border-emerald-800">
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-normal">
                      {m.abstract}
                    </p>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10.5px] font-mono text-slate-500 gap-2">
                      <span>Author: <strong className="text-slate-700 dark:text-slate-300">{m.author}</strong></span>
                      {m.doi && (
                        <span className="text-[#0E4A72] dark:text-cyan-400 font-bold">DOI: {m.doi}</span>
                      )}
                      <span>Region: <strong>{m.targetRegion}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GEOSCIENTIFIC OPEN DATA EXPORT HUB */}
      {/* ========================================================================= */}
      {activeTab === "export" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            
            <div>
              <h3 className="font-extrabold text-base text-[#0E4A72] dark:text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Geoscientific Research Data Export Terminal</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct export of calibrated geodetic time-series, InSAR velocity matrices, and seismic hypocenter catalogs formatted for GMT, MATLAB, Python, and GIS software.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: GNSS CSV Velocities */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Continuous GNSS Vectors (.CSV)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Includes 18 Ethiopian station coordinates, North/East/Up velocities (mm/yr), standard errors, and station operator tags.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadDataset("csv", "essgi_gnss_kinematics")}
                  className="w-full py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download GNSS CSV</span>
                </button>
              </div>

              {/* Card 2: GeoJSON Faults & Volcanoes */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Spatial GeoJSON Feature Layers</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Standard GeoJSON package containing volcano vent polygons, quaternary rift fault lineaments, and station points.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadDataset("json", "essgi_geospatial_layers")}
                  className="w-full py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download GeoJSON Layer</span>
                </button>
              </div>

              {/* Card 3: GMT Vector Format */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Generic Mapping Tools (GMT) Grid</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ASCII vector file ready for <code className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">gmt velo</code> plotting with confidence ellipses.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadDataset("gmt", "essgi_gmt_vectors")}
                  className="w-full py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download GMT Format</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
