import { useEffect } from "react";
import { X, Calendar, MapPin, User, CheckCircle2, ShieldAlert, Download, Mail, FileText, Megaphone, ArrowRight, Compass } from "lucide-react";
import { AnnouncementItem } from "../../data/announcements";

interface AnnouncementDetailModalProps {
  announcement: AnnouncementItem | null;
  isOpen?: boolean;
  onClose: () => void;
}

export function AnnouncementDetailModal({ announcement, isOpen = true, onClose }: AnnouncementDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (announcement && isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [announcement, isOpen, onClose]);

  if (!announcement || !isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans cursor-pointer overflow-y-auto"
    >
      <div 
        className="bg-white border-2 border-[#0E4A72] rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative cursor-default transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0E4A72] via-[#0A3452] to-[#0E4A72] text-white p-4 sm:p-5 relative border-b-2 border-[#D48F29]/40 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-90"
            title="Close Notice"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1.5 pr-10">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D48F29]/20 border border-[#D48F29]/40 text-[#F7D08A] font-mono text-[9px] uppercase font-bold tracking-widest">
                <Megaphone className="w-3 h-3 text-[#F7D08A]" />
                {announcement.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-[#F7D08A] font-mono text-[9px] uppercase font-bold">
                REF: {announcement.id.toUpperCase()}
              </span>
            </div>

            {/* Announcement Project Title */}
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug font-display">
              {announcement.title}
            </h3>

            {/* Geodesy and Geodynamics Department Label */}
            <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium pt-0.5">
              <Compass className="w-3.5 h-3.5 text-[#F7D08A] shrink-0" />
              <span className="font-bold text-[#F7D08A]">Geodesy & Geodynamics Department</span>
              <span className="text-white/40">•</span>
              <span className="text-slate-200 truncate">{announcement.organizer}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 text-slate-800 overflow-y-auto text-xs leading-relaxed">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/80 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#B8860B] uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Effective Date
              </span>
              <p className="font-extrabold text-xs text-[#0E4A72]">
                {announcement.date} (Deadline: {announcement.deadline})
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/80 space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#B8860B] uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Department Venue / Scope
              </span>
              <p className="font-extrabold text-xs text-slate-800">
                {announcement.location}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-mono font-black text-[#0E4A72] uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#B8860B]" /> Official Dispatch Briefing
            </h4>
            <div className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-2">
              <p>{announcement.summary}</p>
              <p>{announcement.fullDetails}</p>
            </div>
          </div>

          {/* Contact and Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">
                Target Audience & Key Requirements
              </span>
              <ul className="text-xs font-medium text-slate-800 space-y-0.5">
                {announcement.requirements.slice(0, 3).map((req, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">
                Department Focal Point
              </span>
              <p className="text-xs font-semibold text-[#0E4A72] flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#D48F29]" />
                {announcement.contactEmail}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 px-4 sm:px-5 bg-[#FAF9F5] border-t border-slate-200 rounded-b-xl flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer active:scale-95"
          >
            Close Notice
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Document PDF downloaded for announcement: ${announcement.title}`);
            }}
            className="px-4 py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white text-xs font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-[#0E4A72] active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#F7D08A]" />
            <span>Download Official Directive PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
