import { useState, useMemo, useEffect } from "react";
import { X, Search, Building2, Megaphone, Newspaper, Activity, AlertOctagon, ArrowRight } from "lucide-react";
import { SECTORS_DATA, SectorData } from "../../data/Sectors";
import { ANNOUNCEMENTS_DATA, AnnouncementItem } from "../../data/announcements";
import { LATEST_NEWS } from "../../data/news";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSector?: (sector: SectorData) => void;
  onSelectAnnouncement?: (announcement: AnnouncementItem) => void;
  onNavigateTab?: (tab: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  onSelectSector,
  onSelectAnnouncement,
  onNavigateTab
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const items: Array<{
      type: "sector" | "announcement" | "news" | "system";
      id: string;
      title: string;
      subtitle: string;
      tag: string;
      raw: any;
    }> = [];

    // Search Sectors
    SECTORS_DATA.forEach((sec) => {
      if (
        sec.title.toLowerCase().includes(q) ||
        sec.code.toLowerCase().includes(q) ||
        sec.directorate.toLowerCase().includes(q) ||
        sec.description.toLowerCase().includes(q)
      ) {
        items.push({
          type: "sector",
          id: sec.id,
          title: sec.title,
          subtitle: `${sec.code} • ${sec.head}`,
          tag: "Institutional Sector",
          raw: sec
        });
      }
    });

    // Search Announcements
    ANNOUNCEMENTS_DATA.forEach((ann) => {
      if (
        ann.title.toLowerCase().includes(q) ||
        ann.code.toLowerCase().includes(q) ||
        ann.category.toLowerCase().includes(q) ||
        ann.summary.toLowerCase().includes(q)
      ) {
        items.push({
          type: "announcement",
          id: ann.id,
          title: ann.title,
          subtitle: `${ann.code} • Deadline: ${ann.deadline}`,
          tag: `Announcement: ${ann.category}`,
          raw: ann
        });
      }
    });

    // Search News
    LATEST_NEWS.forEach((news) => {
      if (
        news.title.toLowerCase().includes(q) ||
        news.dispatchCode.toLowerCase().includes(q) ||
        news.category.toLowerCase().includes(q) ||
        news.excerpt.toLowerCase().includes(q)
      ) {
        items.push({
          type: "news",
          id: news.id,
          title: news.title,
          subtitle: `${news.dispatchCode} • ${news.date}`,
          tag: `Bulletin (${news.category})`,
          raw: news
        });
      }
    });

    // Search System Tabs
    const tabs = [
      { name: "Monitoring Cockpit", tab: "dashboard", desc: "Real-time telemetry and hazard alert dashboard" },
      { name: "GIS Map Room", tab: "map", desc: "Interactive leaflet seismic and volcano spatial map" },
      { name: "Analytics & Catalogs", tab: "analytics", desc: "Volcano and earthquake historical data records" },
      { name: "AI Geological Briefing", tab: "report", desc: "Automated Gemini executive risk reports" },
      { name: "Observatory Gallery", tab: "gallery", desc: "Field imagery and satellite remote sensing photos" },
      { name: "Super Admin Portal", tab: "admin-dashboard", desc: "System administration and telemetry approvals" }
    ];

    tabs.forEach((tb) => {
      if (tb.name.toLowerCase().includes(q) || tb.desc.toLowerCase().includes(q)) {
        items.push({
          type: "system",
          id: tb.tab,
          title: tb.name,
          subtitle: tb.desc,
          tag: "System Portal",
          raw: tb.tab
        });
      }
    });

    return items;
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-start justify-center pt-20 p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in font-sans cursor-pointer"
    >
      <div 
        className="bg-white border-2 border-[#0E4A72] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar Header */}
        <div className="p-4 sm:p-5 bg-[#FAF9F5] border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#0E4A72] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search sectors, announcements, bulletins, map room, telemetry..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[#0E4A72] placeholder:text-slate-400 text-sm font-semibold focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-md bg-slate-200/60 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!query.trim() ? (
            <div className="text-center py-10 space-y-2 text-slate-500 font-sans">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Type keywords to search across ESSGI portal
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Search for volcano catalogs, earthquake swarms, institutional sectors, announcements, or GIS map rooms.
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-sans">
              <p className="text-xs font-bold">No matching records found for "{query}"</p>
            </div>
          ) : (
            searchResults.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  onClose();
                  if (item.type === "sector" && onSelectSector) {
                    onSelectSector(item.raw);
                  } else if (item.type === "announcement" && onSelectAnnouncement) {
                    onSelectAnnouncement(item.raw);
                  } else if (item.type === "system" && onNavigateTab) {
                    onNavigateTab(item.raw);
                  } else if (onNavigateTab) {
                    onNavigateTab("home");
                  }
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[#FAF9F5] border border-slate-200/80 hover:border-[#0E4A72]/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#0E4A72]/10 text-[#0E4A72] uppercase">
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#0E4A72] group-hover:text-[#D48F29] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                    {item.subtitle}
                  </p>
                </div>

                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 group-hover:bg-[#0E4A72] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10.5px] text-slate-500 font-mono">
          <span>ESSGI Search Engine • Connected to Real-time Geohazard Telemetry Database</span>
        </div>
      </div>
    </div>
  );
}
