import { Compass, Telescope, Satellite, Cpu, ArrowRight } from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

interface DirectorateItem {
  id: string;
  name: string;
  amharicName: string;
  code: string;
  head: string;
  location: string;
  icon: any;
  description: string;
  amharicDescription: string;
  stats: string;
  amharicStats: string;
  targetTab: string;
  targetSectorId: string;
}

const DIRECTORATES: DirectorateItem[] = [
  {
    id: "dir-geodesy",
    name: "Directorate of Geodesy & Geodynamics",
    amharicName: "የጂኦዴሲ እና ጂኦዳይናሚክስ መምሪያ",
    code: "D-GEOD",
    head: "Dr. Tsegaye Abebe",
    location: "SSGI 4 Kilo Headquarters, Block B",
    icon: Compass,
    description: "Maintains Ethiopia's Terrestrial Reference Frame (Ethio-TRF), manages 48+ continuous GNSS CORS stations, and models crustal deformation along the Afar Triple Junction.",
    amharicDescription: "የኢትዮጵያን ብሔራዊ የጂኦዴቲክ ማመሳከሪያ ማዕቀፍ ያስተዳድራል፤ ከ48 በላይ የጂኤንኤስኤስ ጣቢያዎችን በመከታተል የመሬት ንቅናቄን በከፍተኛ ትክክለኛነት ያሰላል።",
    stats: "48+ GNSS Stations &bull; Sub-centimeter Precision",
    amharicStats: "48+ የጂኤንኤስኤስ ጣቢያዎች",
    targetTab: "sectors",
    targetSectorId: "geodesy",
  },
  {
    id: "dir-space",
    name: "Directorate of Space Science & Astronomy",
    amharicName: "የስፔስ ሳይንስና አስትሮኖሚ መምሪያ",
    code: "D-SPAC",
    head: "Dr. Solomon Belay",
    location: "Entoto Space Observatory Summit",
    icon: Telescope,
    description: "Operates East Africa's premier twin 1-meter optical telescopes at Entoto, conducting research in planetary atmospheres, stellar evolution, and deep-space satellite telemetry.",
    amharicDescription: "በእንጦጦ የሚገኙትን ባለ 1 ሜትር ግዙፍ የኦፕቲካል ቴሌስኮፖች በማስተዳደር በህዋ ሳይንስ፣ በከዋክብት እና በሳተላይት ምህዋር ላይ ጥናትና ምርምር ያከናውናል።",
    stats: "3,200m Elevation &bull; Twin 1m Telescopes",
    amharicStats: "3,200 ሜትር ከፍታ &bull; 2 ኦፕቲካል ቴሌስኮፖች",
    targetTab: "sectors",
    targetSectorId: "space-science",
  },
  {
    id: "dir-remote-sensing",
    name: "Directorate of Remote Sensing & Satellite Ground Stations",
    amharicName: "የርቀት ዳሰሳና ሳተላይት መሬት ጣቢያዎች መምሪያ",
    code: "D-REMS",
    head: "Eng. Yonas Tesfaye",
    location: "Mesketo Ground Station / 4 Kilo",
    icon: Satellite,
    description: "Downlinks and processes multispectral, hyperspectral, and Synthetic Aperture Radar (InSAR) Sentinel-1 imagery for food security, water resources, and volcanic rift monitoring.",
    amharicDescription: "የተለያዩ የሳተላይት መረጃዎችን (ኢንሳር እና ኦፕቲካል) በመቀበል ለግብርና፣ ለውሃ ሀብት እና ለአደጋ መከላከል የሚያገለግሉ ትንተናዎችን ያቀርባል።",
    stats: "Daily Downlinks &bull; 10m Ground Resolution",
    amharicStats: "ዕለታዊ የሳተላይት ዳውንሊንክ",
    targetTab: "sectors",
    targetSectorId: "remote-sensing",
  },
  {
    id: "dir-disaster-ai",
    name: "Geospatial AI & Disaster Risk Analytics Center",
    amharicName: "የጂኦስፓሻል አርቴፊሻል ኢንተለጀንስና አደጋ ቅነሳ ማዕከል",
    code: "C-GAID",
    head: "Dr. Aster Kassa",
    location: "SSGI Central Computing Wing",
    icon: Cpu,
    description: "Deploys machine learning and neural networks for automated seismic epicentral solutions, volcanic SO2 plume dispersion forecasting, and emergency civil alerts.",
    amharicDescription: "አርቴፊሻል ኢንተለጀንስን በመጠቀም የመሬት መንቀጥቀጥ መነሻዎችን በቅጽበት ይተነትናል፤ የእሳተ ገሞራ ጋዝ ስርጭትን እና ድንገተኛ አደጋዎችን አስቀድሞ ያስጠነቅቃል።",
    stats: "Real-Time AI Inversion &bull; Automated Alerts",
    amharicStats: "የቅጽበት ኤአይ ትንተና",
    targetTab: "sectors",
    targetSectorId: "gis-cadastre",
  },
];

interface DirectoratesGridProps {
  onNavigateToTab: (tab: string) => void;
  onSelectSector?: (sectorId: string) => void;
}

export function AauDirectoratesGrid({ onNavigateToTab, onSelectSector }: DirectoratesGridProps) {
  const { isAmharic } = useLanguage();

  const handleDirectorateClick = (dir: DirectorateItem) => {
    if (onSelectSector) {
      onSelectSector(dir.targetSectorId);
    }
    onNavigateToTab(dir.targetTab);
  };

  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900/60 py-10 border-b border-slate-200 dark:border-slate-800 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700 mb-8">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0E4A72] dark:text-blue-400">
              {isAmharic ? "አካዳሚያዊ እና ሳይንሳዊ መምሪያዎች" : "CORE SCIENTIFIC DIVISIONS & COLLEGES"}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {isAmharic ? "የኢንስቲትዩቱ የምርምር መምሪያዎች" : "Directorates & Research Centers"}
            </h2>
          </div>

          <button
            onClick={() => onNavigateToTab("sectors")}
            className="text-xs font-bold text-[#0E4A72] dark:text-blue-300 hover:text-[#D48F29] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{isAmharic ? "ሁሉንም መምሪያዎች ይመልከቱ" : "Explore All Directorates"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Directorates Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {DIRECTORATES.map((dir) => {
            const Icon = dir.icon;
            return (
              <div
                key={dir.id}
                onClick={() => handleDirectorateClick(dir)}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 hover:border-[#0E4A72]/60 dark:hover:border-blue-400/60"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#0E4A72] dark:text-blue-300 group-hover:bg-[#0E4A72] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                      {dir.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0E4A72] dark:group-hover:text-blue-300 transition-colors leading-snug">
                      {isAmharic ? dir.amharicName : dir.name}
                    </h3>
                    <p className="text-[11px] text-[#D48F29] font-medium mt-0.5">
                      {dir.head} &bull; {dir.location}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {isAmharic ? dir.amharicDescription : dir.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold text-[#0E4A72] dark:text-blue-300">
                  <span className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {isAmharic ? dir.amharicStats : dir.stats}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D48F29] group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default AauDirectoratesGrid;
