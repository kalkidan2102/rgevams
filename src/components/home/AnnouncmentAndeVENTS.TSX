import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  FileText, 
  Bell, 
  Volume2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";
import { ANNOUNCEMENTS_DATA, AnnouncementItem } from "../../data/announcements";

interface AcademicEvent {
  id: string;
  day: string;
  month: string;
  year: string;
  title: string;
  amharicTitle: string;
  category: string;
  time: string;
  venue: string;
  amharicVenue: string;
  linkTab: string;
}

const UPCOMING_EVENTS: AcademicEvent[] = [
  {
    id: "event-sarc",
    day: "14",
    month: "OCT",
    year: "2026",
    title: "4th Space Science & Geodynamics Academic Symposium (S-ARC2026)",
    amharicTitle: "4ኛው የጠፈር ሳይንስና ጂኦዳይናሚክስ ዓለም አቀፍ ሳይንሳዊ ጉባዔ",
    category: "Academic Conference",
    time: "09:00 AM – 05:00 PM EAT",
    venue: "SSGI 4 Kilo Headquarters Auditorium, Addis Ababa",
    amharicVenue: "የኢንስቲትዩቱ 4 ኪሎ ዋና መሥሪያ ቤት አዳራሽ፣ አዲስ አበባ",
    linkTab: "announcements",
  },
  {
    id: "event-insar-workshop",
    day: "28",
    month: "OCT",
    year: "2026",
    title: "National Sentinel-1 InSAR & LiCSBAS Phase Unwrapping Workshop",
    amharicTitle: "የሴንቲኔል-1 ኢንሳር ራዳር መረጃ ትንተና ተግባራዊ ስልጠና",
    category: "Technical Workshop",
    time: "10:00 AM – 04:00 PM EAT",
    venue: "Geodesy Directorate Lab 3, 4 Kilo HQ",
    amharicVenue: "የጂኦዴሲ መምሪያ ላብራቶሪ 3፣ 4 ኪሎ",
    linkTab: "dashboard",
  },
  {
    id: "event-entoto-survey",
    day: "12",
    month: "NOV",
    year: "2026",
    title: "Entoto Observatory Public Sky Survey & Near-Earth Object Lecture",
    amharicTitle: "የእንጦጦ ኦብዘርቫቶሪ የሰማይ ቅኝትና የህዋ ሳይንስ ትምህርታዊ ሴሚናር",
    category: "Observatory Lecture",
    time: "06:30 PM – 09:30 PM EAT",
    venue: "Entoto Space Observatory Summit Center, Addis Ababa",
    amharicVenue: "የእንጦጦ ስፔስ ኦብዘርቫቶሪ አናት ማዕከል፣ አዲስ አበባ",
    linkTab: "sectors",
  },
  {
    id: "event-geohazard-drill",
    day: "04",
    month: "DEC",
    year: "2026",
    title: "National Rift Valley Volcanic Gas & Seismic Emergency Simulation",
    amharicTitle: "የስምጥ ሸለቆ እሳተ ጎመራና የመሬት መንቀጥቀጥ የድንገተኛ አደጋ ዝግጁነት ልምምድ",
    category: "National Exercise",
    time: "08:30 AM – 01:00 PM EAT",
    venue: "Semera Afar Field Command Station & Virtual Sync",
    amharicVenue: "የሰመራ አፋር የመስክ መቆጣጠሪያ ማዕከል",
    linkTab: "dashboard",
  },
];

interface AauAnnouncementsAndEventsProps {
  onNavigateToTab: (tab: string) => void;
  onSelectAnnouncement?: (announcement: AnnouncementItem | null) => void;
}

export function AauAnnouncementsAndEvents({
  onNavigateToTab,
  onSelectAnnouncement,
}: AauAnnouncementsAndEventsProps) {
  const { isAmharic } = useLanguage();

  const handleAnnouncementClick = (ann: AnnouncementItem) => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(ann);
    }
    onNavigateToTab("announcements");
  };

  return (
    <section className="w-full bg-white dark:bg-slate-900 py-10 border-b border-slate-200 dark:border-slate-800 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: LATEST ANNOUNCEMENTS (AAU University Newsboard Architecture) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#0E4A72]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0E4A72] dark:text-blue-300">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0E4A72] dark:text-blue-300 uppercase tracking-wide">
                  {isAmharic ? "ወቅታዊ ማስታወቂያዎች" : "Announcements & Gazettes"}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (onSelectAnnouncement) onSelectAnnouncement(null);
                  onNavigateToTab("announcements");
                }}
                className="text-xs font-bold text-[#0E4A72] dark:text-blue-400 hover:text-[#D48F29] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{isAmharic ? "ሁሉንም ይመልከቱ" : "View All"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Announcements List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {ANNOUNCEMENTS_DATA.slice(0, 4).map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => handleAnnouncementClick(ann)}
                  className="py-3.5 group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                      {ann.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {ann.date}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0E4A72] dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                    {ann.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {ann.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: UPCOMING ACADEMIC & OBSERVATORY EVENTS (AAU Date Badge Architecture) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#D48F29]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-950 text-[#D48F29]">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0E4A72] dark:text-blue-300 uppercase tracking-wide">
                  {isAmharic ? "መጪ ሁነቶችና ሲምፖዚየሞች" : "Upcoming Academic Events"}
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab("announcements")}
                className="text-xs font-bold text-[#D48F29] hover:text-[#0E4A72] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{isAmharic ? "ሁሉንም ሁነቶች" : "All Events"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Events List with Signature AAU Date Badge */}
            <div className="space-y-3">
              {UPCOMING_EVENTS.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onNavigateToTab(event.linkTab)}
                  className="flex items-start gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-[#D48F29]/60 transition-all cursor-pointer group shadow-xs"
                >
                  {/* Big AAU Style Calendar Date Box */}
                  <div className="shrink-0 w-13 h-13 sm:w-14 sm:h-14 rounded-lg bg-[#0E4A72] text-white flex flex-col items-center justify-center font-mono shadow-xs group-hover:bg-[#D48F29] group-hover:text-slate-950 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                      {event.month}
                    </span>
                    <span className="text-lg sm:text-xl font-black leading-tight">
                      {event.day}
                    </span>
                  </div>

                  {/* Event Information */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#0E4A72] dark:text-blue-300 uppercase tracking-wider">
                      {event.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0E4A72] dark:group-hover:text-blue-300 transition-colors line-clamp-1 mt-0.5">
                      {isAmharic ? event.amharicTitle : event.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{event.time}</span>
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[220px]">
                        <MapPin className="w-3 h-3 text-[#D48F29] shrink-0" />
                        <span className="truncate">{isAmharic ? event.amharicVenue : event.venue}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
export default AauAnnouncementsAndEvents;
