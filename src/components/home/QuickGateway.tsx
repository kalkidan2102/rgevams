import { 
  Activity, 
  Map, 
  Satellite, 
  Compass, 
  FileText, 
  Volume2, 
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

interface QuickGatewayItem {
  id: string;
  title: string;
  amharicTitle: string;
  subtitle: string;
  amharicSubtitle: string;
  icon: any;
  targetTab: string;
  color: string;
  borderAccent: string;
}

const GATEWAYS: QuickGatewayItem[] = [
  {
    id: "gw-cockpit",
    title: "Live Hazard Cockpit",
    amharicTitle: "የቀጥታ አደጋዎች ኮክፒት",
    subtitle: "24/7 Volcanic & Seismic Monitoring",
    amharicSubtitle: "የእሳተ ገሞራና የመሬት መንቀጥቀጥ መቆጣጠሪያ",
    icon: Activity,
    targetTab: "dashboard",
    color: "bg-rose-50 text-rose-700",
    borderAccent: "hover:border-rose-400",
  },
  {
    id: "gw-map",
    title: "GIS Interactive Map Room",
    amharicTitle: "የጂአይኤስ መስተጋብራዊ ካርታ",
    subtitle: "Fault Lines, Vents & Infrastructure",
    amharicSubtitle: "የስምጥ ሸለቆ ስምጥጦችና መሠረተ ልማት",
    icon: Map,
    targetTab: "map",
    color: "bg-blue-50 text-[#0E4A72]",
    borderAccent: "hover:border-blue-400",
  },
  {
    id: "gw-insar",
    title: "InSAR Radar Satellite Lab",
    amharicTitle: "የኢንሳር ራዳር ሳተላይት ላብ",
    subtitle: "Sentinel-1 Crustal Velocities",
    amharicSubtitle: "የሳተላይት መሬት ንቅናቄ መረጃዎች",
    icon: Satellite,
    targetTab: "insar",
    color: "bg-indigo-50 text-indigo-700",
    borderAccent: "hover:border-indigo-400",
  },
  {
    id: "gw-gnss",
    title: "GNSS Geodesy Network",
    amharicTitle: "የጂኤንኤስኤስ ጂኦዴቲክ አውታር",
    subtitle: "Continuous CORS Stations (Ethio-TRF)",
    amharicSubtitle: "ብሔራዊ የጂኦዴቲክ ማመሳከሪያ ጣቢያዎች",
    icon: Compass,
    targetTab: "dashboard",
    color: "bg-emerald-50 text-emerald-700",
    borderAccent: "hover:border-emerald-400",
  },
  {
    id: "gw-reports",
    title: "National Risk Bulletins",
    amharicTitle: "ብሔራዊ የአደጋ ሪፖርቶች",
    subtitle: "Directives, Catalogs & Advisories",
    amharicSubtitle: "የደህንነት መመሪያዎችና ሳይንሳዊ ካታሎግ",
    icon: FileText,
    targetTab: "report",
    color: "bg-amber-50 text-amber-800",
    borderAccent: "hover:border-amber-400",
  },
  {
    id: "gw-announcements",
    title: "Announcements & Grants",
    amharicTitle: "ማስታወቂያዎችና ድጋፎች",
    subtitle: "S-ARC2026, Calls for Papers & Tenders",
    amharicSubtitle: "የምርምር ድጋፍ ማመልከቻዎችና ጨረታዎች",
    icon: Volume2,
    targetTab: "announcements",
    color: "bg-cyan-50 text-cyan-800",
    borderAccent: "hover:border-cyan-400",
  },
];

interface AauQuickGatewaysProps {
  onNavigateToTab: (tab: string) => void;
  onLaunchDashboard: () => void;
}

export function AauQuickGateways({ onNavigateToTab, onLaunchDashboard }: AauQuickGatewaysProps) {
  const { isAmharic } = useLanguage();

  const handleClick = (targetTab: string) => {
    if (targetTab === "dashboard") {
      onLaunchDashboard();
    } else {
      onNavigateToTab(targetTab);
    }
  };

  return (
    <section className="w-full bg-slate-50 dark:bg-slate-900/50 py-8 border-b border-slate-200 dark:border-slate-800 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0E4A72] dark:text-blue-300">
              {isAmharic ? "ፈጣን መግቢያዎችና ፖርታሎች" : "Quick Gateways & Institutional Portals"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAmharic 
                ? "የኢትዮጵያ ስፔስ ሳይንስና ጂኦስፓሻል ኢንስቲትዩት ዋና ዋና ኦብዘርቫቶሪዎች እና መረጃ ቋቶች" 
                : "Direct access to key scientific monitoring divisions, maps, datasets and research services"}
            </p>
          </div>

          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D48F29] bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-800/50 self-start sm:self-auto">
            FDRE SSGI ESSENTIALS
          </span>
        </div>

        {/* 6 Gateway Cards Grid matching AAU Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GATEWAYS.map((gw) => {
            const Icon = gw.icon;
            return (
              <button
                key={gw.id}
                onClick={() => handleClick(gw.targetTab)}
                className={`flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group hover:-translate-y-0.5 ${gw.borderAccent}`}
              >
                <div className={`p-3 rounded-lg shrink-0 ${gw.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0E4A72] dark:group-hover:text-blue-400 transition-colors truncate">
                      {isAmharic ? gw.amharicTitle : gw.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D48F29] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {isAmharic ? gw.amharicSubtitle : gw.subtitle}
                  </p>
                  <p className="text-[11px] font-mono text-[#0E4A72] dark:text-blue-300 font-semibold mt-2">
                    {isAmharic ? "ይመልከቱ &rarr;" : "Access Portal &rarr;"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default AauQuickGateways;
