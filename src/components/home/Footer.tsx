import React from "react";
import { ESSGILogo } from "../ESSGILogo";
import { Mail, Phone, MapPin, Globe, ExternalLink, Twitter, Send, Linkedin, Youtube } from "lucide-react";

interface FooterProps {
  onNavigate: (tab: any) => void;
  onOpenContact?: () => void;
}
export function Footer({ onNavigate, onOpenContact }: FooterProps) {
  return (
    <footer className="bg-[#041B2D] text-slate-400 border-t border-slate-800/60 py-12 relative z-10 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,133,200,0.08),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {/* Col 1: Institute Rebranding Banner */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-2 inline-block border border-white/10 shadow-lg">
            <ESSGILogo className="h-10 md:h-12 w-auto" />
          </div>
          <p className="text-xs leading-relaxed text-slate-400 font-sans">
            <strong>Ethiopian Space Science and Geospatial Institute (ESSGI)</strong><br />
            Geodynamics Division. Leading real-time spaceborne geodesy and lithospheric hazard monitoring across the Horn of Africa.
          </p>

          {/* Social Channels */}
          <div className="pt-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Official Channels
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com/ssgi2022"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-[#0085C8] text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors shadow-xs"
                title="Twitter / X (@ssgi2022)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/spacegeospatial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-[#0085C8] text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors shadow-xs"
                title="Telegram (t.me/spacegeospatial)"
              >
                <Send className="w-4 h-4 text-sky-400" />
              </a>
              <a
                href="https://www.linkedin.com/in/space-science-and-geospatial-institute-ssgi-37b48623a"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-[#0085C8] text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors shadow-xs"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
              </a>
              <a
                href="https://www.youtube.com/@ssgi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-[#0085C8] text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors shadow-xs"
                title="YouTube (@ssgi)"
              >
                <Youtube className="w-4 h-4 text-rose-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs font-sans">
            <li>
              <button
                onClick={() => onNavigate("home")}
                className="hover:text-[#00D4FF] transition-colors cursor-pointer text-left"
              >
                Home System
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("about")}
                className="hover:text-[#00D4FF] transition-colors text-left text-amber-300 font-bold cursor-pointer"
              >
                <span>About ESSGI Page</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("contact")}
                className="hover:text-[#00D4FF] transition-colors text-left text-amber-300 font-bold cursor-pointer"
              >
                <span>Contact Us Page</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("map")}
                className="hover:text-[#00D4FF] transition-colors text-left text-sky-300 font-bold cursor-pointer"
              >
                <span>GIS & Telemetry Page</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("announcements")}
                className="hover:text-[#00D4FF] transition-colors text-left text-sky-300 font-bold cursor-pointer"
              >
                <span>Official Announcements Page</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate("focus")}
                className="hover:text-[#00D4FF] transition-colors text-left text-slate-300 cursor-pointer"
              >
                <span>Focus Areas Page</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Research Networks */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Academic & Scientific Partners
          </h4>
          <ul className="space-y-2 text-xs font-sans">
            <li className="flex items-center gap-1.5 font-bold text-slate-200">
              <Globe className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Geodesy & Geodynamics Department</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0085C8]" />
              <a href="https://www.usgs.gov" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] flex items-center gap-1">
                USGS Earthquake Hazards <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0085C8]" />
              <a href="https://comet.nerc.ac.uk" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] flex items-center gap-1">
                COMET Ground Deformation <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0085C8]" />
              <a href="https://www.copernicus.eu" target="_blank" rel="noreferrer" className="hover:text-[#00D4FF] flex items-center gap-1">
                Sentinel Copernicus Hub <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact details */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center justify-between">
            <span>Contact Us</span>
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#CA933C] shrink-0 mt-0.5" />
              <span>
                Space Science & Geospatial Institute Headquarters, 4 Kilo, Addis Ababa, Ethiopia
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#CA933C] shrink-0" />
              <span>+251 11 126 1000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#CA933C] shrink-0" />
              <span>info@essgi.gov.et</span>
            </li>
          </ul>

          {onOpenContact && (
            <button
              onClick={onOpenContact}
              className="mt-2 w-full py-2 px-3.5 rounded-xl bg-[#0085C8]/20 hover:bg-[#0085C8]/30 border border-[#0085C8]/40 text-[#00D4FF] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-slate-800/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 relative z-10">
        <div>
          &copy; {new Date().getFullYear()} Ethiopian Space Science and Geospatial Institute (ESSGI). All rights reserved.
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono">
          <span>Powered by ESSGI High-Performance Compute</span>
          <span>•</span>
          <span className="text-emerald-500 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
            STATION STATUS: EXCELLENT
          </span>
        </div>
      </div>
    </footer>
  );
}
