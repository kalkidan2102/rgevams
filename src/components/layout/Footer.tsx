import { Globe, Compass, GraduationCap, Mail, Phone, MapPin, Twitter, Send, Linkedin, Youtube, ShieldCheck, Building2, ExternalLink } from "lucide-react";
import { ESSGILogo } from "../ESSGILogo";

interface FooterProps {
  onOpenContact?: () => void;
  onNavigate?: (tab: string) => void;
  compact?: boolean;
}

export function Footer({ onOpenContact, onNavigate, compact = false }: FooterProps) {
  if (compact) {
    return (
      <footer id="footer-compact" className="Footer w-full bg-[#1B2333] text-slate-200 border-t border-[#28334A] font-sans z-10 relative select-none">
        {/* Top National Flag Tricolor Ribbon */}
        <div className="w-full h-1 flex overflow-hidden">
          <div className="w-1/3 h-full bg-[#009A44]" />
          <div className="w-1/3 h-full bg-[#FED100]" />
          <div className="w-1/3 h-full bg-[#EF2B2D]" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3">
            <div 
              className="cursor-pointer bg-white/95 p-1 rounded-sm border border-[#28334A] hover:opacity-90 transition-opacity shrink-0"
              onClick={() => onNavigate?.("home")}
              title="Return to Home"
            >
              <ESSGILogo className="h-6 w-auto" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-100 tracking-tight">
                  SSGI &bull; Dept. of Geodesy &amp; Geodynamics
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[9.5px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Operations Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                FDRE Space Science and Geospatial Institute &bull; Proclamation No. 1263/2021
              </p>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-300 text-[11.5px]">
            <button onClick={() => onNavigate?.("home")} className="hover:text-[#F28C28] transition-colors cursor-pointer">
              Home
            </button>
            <span className="text-[#28334A]">&bull;</span>
            <button onClick={() => onNavigate?.("dashboard")} className="hover:text-[#F28C28] transition-colors cursor-pointer">
              Cockpit
            </button>
            <span className="text-[#28334A]">&bull;</span>
            <button onClick={() => onNavigate?.("map")} className="hover:text-[#F28C28] transition-colors cursor-pointer">
              GIS Map
            </button>
            <span className="text-[#28334A]">&bull;</span>
            <button onClick={() => onNavigate?.("insar")} className="hover:text-[#F28C28] transition-colors cursor-pointer">
              InSAR Lab
            </button>
            <span className="text-[#28334A]">&bull;</span>
            <button onClick={() => onNavigate?.("sectors")} className="hover:text-[#F28C28] transition-colors cursor-pointer">
              Directorates
            </button>
            <span className="text-[#28334A]">&bull;</span>
            <button onClick={() => onNavigate?.("announcements")} className="hover:text-[#F28C28] transition-colors cursor-pointer">
              Notices
            </button>
            <span className="text-[#28334A]">&bull;</span>
            <button onClick={onOpenContact} className="hover:text-[#F28C28] transition-colors cursor-pointer">
              Contact
            </button>
          </div>

          {/* Right: Channels & Copyright */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <a
                href="https://twitter.com/ssgi2022"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-[#176783] hover:bg-[#1D7E9F] text-white flex items-center justify-center transition-colors shadow-xs"
                title="Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://t.me/spacegeospatial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-[#176783] hover:bg-[#1D7E9F] text-white flex items-center justify-center transition-colors shadow-xs"
                title="Telegram"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.youtube.com/@ssgi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-[#176783] hover:bg-[#1D7E9F] text-white flex items-center justify-center transition-colors shadow-xs"
                title="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
            <span className="text-[10px] text-slate-400 font-mono border-l border-[#28334A] pl-3">
              &copy; {new Date().getFullYear()} SSGI
            </span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer id="footer" className="Footer w-full bg-[#1B2333] text-slate-200 pt-12 pb-8 px-4 sm:px-6 border-t-2 border-[#F28C28] font-sans z-10 relative select-none">
      {/* Top National Flag Tricolor Ribbon */}
      <div className="w-full h-1.5 flex absolute top-0 left-0 right-0 overflow-hidden">
        <div className="w-1/3 h-full bg-[#009A44]" />
        <div className="w-1/3 h-full bg-[#FED100]" />
        <div className="w-1/3 h-full bg-[#EF2B2D]" />
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-9">
        
        {/* Top Government Masthead Row in Footer */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-7 border-b border-[#28334A]">
          <div className="flex items-center gap-4">
            <div className="cursor-pointer bg-white/95 p-1 rounded-sm border border-[#28334A]" onClick={() => onNavigate?.("home")}>
              <ESSGILogo className="h-8 w-auto" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono tracking-widest text-[#F28C28] uppercase font-semibold block">
                NATIONAL SCIENTIFIC PORTAL
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight">
                Space Science and Geospatial Institute (SSGI)
              </h3>
              <p className="text-[11px] text-slate-300">
                የኢትዮጵያ ስፔስ ሳይንስ እና ጂኦስፓሻል ኢንስቲትዩት &bull; Ministry of Innovation and Technology (MInT)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              24/7 NATIONAL OPERATIONS ROOM: ACTIVE
            </span>
           
          </div>
        </div>

        {/* Main 4-Column Government Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Institutional Profile & Mandate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#F28C28]" />
              <h4 className="text-slate-100 font-semibold text-xs uppercase tracking-wider">About The Institute</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              SSGI is Ethiopia's premier federal scientific institution mandated under Proclamation 1263/2021 to lead space exploration, satellite telemetry, and geodetic hazard monitoring across the East African Rift.
            </p>
            <div className="pt-1">
              <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Official Channels</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://twitter.com/ssgi2022"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#176783] hover:bg-[#1D7E9F] text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Twitter / X (@ssgi2022)"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://t.me/spacegeospatial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#176783] hover:bg-[#1D7E9F] text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Telegram (t.me/spacegeospatial)"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/space-science-and-geospatial-institute-ssgi-37b48623a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#176783] hover:bg-[#1D7E9F] text-white flex items-center justify-center transition-colors shadow-xs"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.youtube.com/@ssgi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#176783] hover:bg-[#1D7E9F] text-white flex items-center justify-center transition-colors shadow-xs"
                  title="YouTube (@ssgi)"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Institutional & Directorates */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#176783]" />
              <span>Institutional &amp; Wings</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate?.("about")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> About SSGI &amp; Strategic Mandate
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("mission")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Mission, Vision &amp; Strategic Goals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("sectors")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Geodesy &amp; Geodynamics Directorate
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("sectors")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Space Science &amp; Astronomy (Entoto)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("sectors")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Remote Sensing &amp; Satellite Operations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("sectors")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Geospatial AI &amp; Disaster Risk Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Observatories & Portals */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Observatories &amp; Portals</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate?.("dashboard")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Live Geohazard Cockpit
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("map")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> GIS Interactive Hazard Map Room
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("insar")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> LiCSBAS InSAR Sentinel-1 Radar Lab
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("report")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Publications &amp; Technical Bulletins
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.("staff-dashboard")}
                  className="hover:text-[#F28C28] text-left transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#176783]">&rsaquo;</span> Staff &amp; Researcher Portals
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Active Stations</span>
              <div className="flex flex-wrap gap-1">
                {["FURI (Addis)", "SEME (Semera)", "DESE (Dessie)", "DIWA (Dire Dawa)", "ARBA (Arba Minch)"].map((stn) => (
                  <span key={stn} className="px-1.5 py-0.5 bg-[#232C3F] border border-[#2F3C54] rounded text-[9px] font-mono text-emerald-300">
                    {stn}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Headquarters */}
          <div className="space-y-3">
            <h4 className="text-slate-100 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Headquarters &amp; Contact</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F28C28] font-semibold text-xs block mb-0.5">Address</span>
                  <span className="text-slate-300 leading-relaxed">Queen Elizabeth II St, 4 Kilo Headquarters &amp; Entoto Observatory, Addis Ababa, Ethiopia</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F28C28] font-semibold text-xs block mb-0.5">Phone</span>
                  <span className="text-slate-300 font-mono">+251 11 126 1000 / +251 11 126 2000</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F28C28] font-semibold text-xs block mb-0.5">Email</span>
                  <a 
                    href="mailto:info@ssgi.gov.et" 
                    className="text-[#38BDF8] hover:text-[#7DD3FC] hover:underline font-medium transition-colors"
                  >
                    info@ssgi.gov.et
                  </a>
                </div>
              </li>
              <li className="text-[11px] text-slate-400 font-mono pl-6.5">
                P.O. Box: 33679 Addis Ababa, Ethiopia
              </li>
            </ul>

            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#176783] hover:bg-[#1D7E9F] border border-[#176783] text-white text-[11px] font-semibold tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Official Desk</span>
              </button>
            )}
          </div>

        </div>

        {/* Subtle Horizontal Divider */}
        <hr className="border-[#28334A]" />

        {/* Bottom Statutory Notice & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-3 text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} Space Science and Geospatial Institute (SSGI). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 font-mono">Official Portal: ssgi.gov.et</span>
            <span className="text-[#28334A]">|</span>
            <button onClick={onOpenContact} className="text-[#F28C28] hover:underline cursor-pointer font-medium">
              Direct Inquiries
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

