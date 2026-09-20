import { useState, useEffect } from "react";
import { Bell, ChevronRight, ChevronLeft, Volume2, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

interface NoticeItem {
  id: string;
  category: string;
  title: string;
  amharicTitle: string;
  date: string;
  actionTab?: string;
}

const NOTICES: NoticeItem[] = [
  {
    id: "notice-1",
    category: "CONFERENCE",
    title: "S-ARC2026: 4th International Space & Geodynamics Academic Symposium — Call for Papers Open",
    amharicTitle: "የጠፈር ሳይንስና ጂኦዳይናሚክስ ዓለም አቀፍ ሲምፖዚየም የጥናት ጥሪ ይፋ ሆነ",
    date: "July 2026",
    actionTab: "announcements",
  },
  {
    id: "notice-2",
    category: "RESEARCH GRANTS",
    title: "Presidential Research Fellowships 2026/27: Funding for Geospatial & InSAR Planetary Studies",
    amharicTitle: "የ2026/27 የፕሬዝዳንት የምርምር ድጋፍ ማመልከቻ ክፍት ሆኗል",
    date: "July 2026",
    actionTab: "announcements",
  },
  {
    id: "notice-3",
    category: "OBSERVATORY",
    title: "Real-Time Sentinel-1 Interferograms (Track 137) Processed for Main Ethiopian Rift Sector",
    amharicTitle: "የሴንቲኔል-1 ኢንሳር ራዳር መረጃዎች ለኢትዮጵያ ስምጥ ሸለቆ ይፋ ተደርገዋል",
    date: "Live Stream",
    actionTab: "insar",
  },
  {
    id: "notice-4",
    category: "SEISMOLOGY",
    title: "Continuous GNSS FURI & Semera CORS Beacons Operational with Millimeter Accuracy",
    amharicTitle: "የፉሪ እና ሰመራ ጂኤንኤስኤስ ጣቢያዎች በተሟላ ጥራት መረጃ በማስተላለፍ ላይ ናቸው",
    date: "24/7 Telemetry",
    actionTab: "dashboard",
  },
];

interface AauNoticeTickerProps {
  onNavigateToTab?: (tab: string) => void;
}

export function AauNoticeTicker({ onNavigateToTab }: AauNoticeTickerProps) {
  const { isAmharic } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NOTICES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentNotice = NOTICES[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + NOTICES.length) % NOTICES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % NOTICES.length);
  };

  return (
    <div
      className="w-full bg-[#092842] text-white border-b border-[#0E4A72] py-2 px-4 select-none font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left Notice Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#D48F29] text-slate-950 font-bold px-2.5 py-0.5 rounded text-[10.5px] uppercase tracking-wider font-mono shadow-xs">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>{isAmharic ? "ማስታወቂያ" : "LATEST NOTICE"}</span>
          </div>
          <span className="hidden sm:inline-block text-[#D48F29] font-mono text-[11px] font-bold">
            [{currentNotice.category}]
          </span>
        </div>

        {/* Center Animated Notice Text */}
        <div className="flex-1 truncate text-slate-200">
          <button
            onClick={() => currentNotice.actionTab && onNavigateToTab?.(currentNotice.actionTab)}
            className="text-left text-xs sm:text-[12.5px] hover:text-[#F7D08A] transition-colors truncate font-medium flex items-center gap-1.5 w-full cursor-pointer"
            title={isAmharic ? currentNotice.amharicTitle : currentNotice.title}
          >
            <span className="truncate">
              {isAmharic ? currentNotice.amharicTitle : currentNotice.title}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#F7D08A] shrink-0 hidden md:inline" />
          </button>
        </div>

        {/* Right Navigation Arrows & Counter */}
        <div className="flex items-center gap-2 shrink-0 text-slate-400">
          <span className="hidden md:inline font-mono text-[11px] text-slate-400">
            {currentIndex + 1} / {NOTICES.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded hover:bg-[#0E4A72] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous notice"
              aria-label="Previous notice"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-[#0E4A72] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next notice"
              aria-label="Next notice"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AauNoticeTicker;
