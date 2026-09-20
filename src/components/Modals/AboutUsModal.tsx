import { useState, useEffect } from "react";
import {
  X,
  Building2,
  Target,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Send,
  Sparkles,
  Shield,
  Compass,
  Globe,
  Award,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";

export type AboutTab = "about" | "focus" | "contact" | "mission";

interface AboutUsModalProps {
  isOpen?: boolean;
  initialTab?: AboutTab;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export function AboutUsModal({
  isOpen = true,
  initialTab = "about",
  onClose,
  onNavigateToTab
}: AboutUsModalProps) {
  const [activeTab, setActiveTab] = useState<AboutTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "Geological Inquiry / Telemetry Ingestion",
    message: ""
  });

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactForm({ name: "", email: "", subject: "Geological Inquiry / Telemetry Ingestion", message: "" });
    }, 4000);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans cursor-pointer overflow-y-auto"
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl flex flex-col relative cursor-default transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon - Light Blue, Professional & Compact */}
        <div className="bg-[#EBF3FA] dark:bg-slate-850 border-b border-[#B9D5EB] dark:border-slate-800 px-4 py-3 sm:px-5 sm:py-3.5 relative shrink-0 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/90 dark:bg-slate-800 border border-[#B9D5EB] dark:border-slate-700 text-[#0E4A72] dark:text-sky-300 font-mono text-[9px] uppercase font-bold tracking-wider">
                <Globe className="w-3 h-3 text-[#0085C8]" />
                SSGI Directorate
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Department of Geodesy &amp; Geodynamics
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#0E4A72] dark:text-white tracking-tight leading-snug font-sans">
              {activeTab === "about" && "Institutional Profile & Department Mandate"}
              {activeTab === "focus" && "Key Scientific Focus Areas & Technical Pillars"}
              {activeTab === "mission" && "Mission, Vision & Strategic Mandate"}
              {activeTab === "contact" && "Official Contact & Regional Station Directory"}
            </h3>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-7 h-7 rounded-md bg-white/80 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
            title="Close Institutional Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 flex-grow">
          
          {/* 1. ABOUT SSGI TAB */}
          {activeTab === "about" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FAF9F5] border border-[#0E4A72]/20 p-5 rounded-2xl space-y-3">
                <span className="text-[10px] font-mono font-bold text-[#B8860B] uppercase tracking-wider block">
                  DEPARTMENT OF GEODESY &amp; GEODYNAMICS • SSGI
                </span>
                <h3 className="text-lg font-black text-[#0E4A72] font-display">
                  Geodesy Science &amp; The Department of Geodesy and Geodynamics
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Geodesy</strong> is the fundamental Earth science of measuring and understanding the geometric shape, spatial orientation, gravity field, and crustal deformation vectors of Earth. Situated across the active East African Rift System (EARS), Ethiopia relies on high-precision continuous GNSS (CORS) stations and satellite InSAR to monitor tectonic plate divergence (2–6 mm/year) and subterranean volcanic magma movement.
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  The <strong>Department of Geodesy and Geodynamics</strong> under SSGI maintains the National Geodetic Reference Frame, operates the nationwide CORS array, processes Sentinel-1 radar interferometry, and leads real-time seismic monitoring with the historical Mount Furi (IU.FURI) seismological observatory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0E4A72]/10 text-[#0E4A72] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">National CORS Array</h4>
                  <p className="text-[11px] text-slate-600">Continuous GNSS base stations delivering millimeter 3D crustal motion tracking across Ethiopia.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">FURI Seismology Node</h4>
                  <p className="text-[11px] text-slate-600">Mount Furi broadband observatory recording tectonic rupture waves and focal mechanism solutions.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">InSAR Deformation Lab</h4>
                  <p className="text-[11px] text-slate-600">Satellite radar interferometry measuring volcanic inflation at Erta Ale, Fentale, and Dabbahu.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-mono font-bold text-[#0E4A72] uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#B8860B]" /> Department Leadership &amp; Inquiries
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold block text-slate-900">Department of Geodesy &amp; Geodynamics</span>
                    <span className="text-[11px] text-slate-500">SSGI Head Office • Addis Ababa</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold block text-slate-900">Geodynamics &amp; Seismology Division</span>
                    <span className="text-[11px] text-slate-500">Lead: Dr. Fekadu Abaye • furi.seismo@essgi.gov.et</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. FOCUS AREA TAB */}
          {activeTab === "focus" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-black text-[#0E4A72] uppercase tracking-wider font-display">
                  Primary Research & Operational Focus Areas
                </h3>
                <p className="text-xs text-slate-600">
                  SSGI integrates space technology and Earth observation to safeguard lives and foster economic development across Ethiopia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0085C8] transition-all space-y-2">
                  <div className="flex items-center gap-2 text-[#0085C8] font-mono text-xs font-extrabold uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#0085C8]" />
                    01. Geodynamics & Tectonics
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Rift Graben Deformation & Seismicity</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Continuous monitoring of seismic velocity structures along the Main Ethiopian Rift, focal hypocenter localization, and East African Rift crustal extension calculation using 18 permanent GNSS broadband stations.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-rose-600 transition-all space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 font-mono text-xs font-extrabold uppercase">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    02. Volcanology & Hydrothermal Hazards
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Danakil & Afar Magmatic Systems</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Orbital MODIS/VIIRS thermal radiance tracking over 115 Ethiopian volcanic vents, continuous degassing sampling at Erta Ale active lava lake, and aviation volcanic ash advisory reports (VAAC).
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 transition-all space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs font-extrabold uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    03. Space Science & Satellite Geodesy
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Astronomical Observation & SAR Radar</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Entoto Astronomical Observatory optical telescope operation, space weather ionospheric Total Electron Content (TEC) modeling, and Sentinel-1 Synthetic Aperture Radar interferometry.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-600 transition-all space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 font-mono text-xs font-extrabold uppercase">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    04. Civil Defense & DRMC Early Warning
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Bilingual Pastoralist SMS Gateway</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Deploying automated Gemini AI decision-support reports and broadcasting real-time bilingual SMS emergency alerts in Afar, Amharic, and Oromiffa to pastoralist communities during volcanic degassing or tremor swarms.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. MISSION AND MANDATE TAB */}
          {activeTab === "mission" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#B8860B]/30 space-y-3">
                <span className="text-[10px] font-mono font-bold text-[#B8860B] uppercase tracking-wider block">
                  PARLIAMENTARY PROCLAMATION & MANDATE
                </span>
                <h3 className="text-base font-black text-[#0E4A72] font-display">
                  Official Mandate & Statutory Directives
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ESSGI is empowered by federal legislation to establish, regulate, and maintain Ethiopia's spatial data infrastructure, satellite constellations, astronomical observatories, and geodynamic hazard early warning networks.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#0E4A72] uppercase flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#B8860B]" /> Strategic Mission Objectives
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Sub-Second Tectonic Risk Detection</span>
                      <span className="text-slate-600 text-[11px]">Maintain real-time broadband seismic telemetry linked with USGS global feeds and local Furi Observatory arrays to detect micro-tremor swarms.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">National Volcanic & Hydrothermal Protection</span>
                      <span className="text-slate-600 text-[11px]">Catalog and continuously profile 115 volcanic vents across the Danakil Graben and Main Ethiopian Rift, enforcing exclusion safety perimeters.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Space Science Research & Satellite Communications</span>
                      <span className="text-slate-600 text-[11px]">Operate Entoto Astronomical Observatory, process Sentinel InSAR ground subsidence radar data, and model space weather perturbations.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. CONTACT US TAB */}
          {activeTab === "contact" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-slate-200 space-y-1 text-center">
                  <Phone className="w-5 h-5 text-[#0085C8] mx-auto mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Hotline Phone</span>
                  <p className="font-black text-xs text-[#0E4A72]">+251 11 878 7311</p>
                  <p className="text-[10px] text-slate-500">+251 11 878 7312 (Fax)</p>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-slate-200 space-y-1 text-center">
                  <Mail className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Official Email</span>
                  <p className="font-black text-xs text-slate-900">info@essgi.gov.et</p>
                  <p className="text-[10px] text-slate-500">contact@ssgi.gov.et</p>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-slate-200 space-y-1 text-center">
                  <MapPin className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Headquarters</span>
                  <p className="font-black text-xs text-slate-900">4 Kilo (Arat Kilo)</p>
                  <p className="text-[10px] text-slate-500">Addis Ababa, Ethiopia</p>
                </div>
              </div>

              {/* Official Social Channels */}
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Official Channels & Feeds
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href="https://twitter.com/ssgi2022"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
                  >
                    <Twitter className="w-4 h-4 text-[#0085C8]" />
                    <span>@ssgi2022</span>
                  </a>
                  <a
                    href="https://t.me/spacegeospatial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
                  >
                    <Send className="w-4 h-4 text-sky-500" />
                    <span>Telegram</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/space-science-and-geospatial-institute-ssgi-37b48623a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
                  >
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.youtube.com/@ssgi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-[#0085C8]/10 text-slate-700 hover:text-[#0085C8] transition-colors border border-slate-200 text-xs font-bold"
                  >
                    <Youtube className="w-4 h-4 text-rose-600" />
                    <span>@ssgi</span>
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-mono font-extrabold text-[#0E4A72] uppercase flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#B8860B]" /> Send Official Telemetry or General Inquiry
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Submit questions or telemetry requests directly to ESSGI Directorate General Command.
                  </p>
                </div>

                {contactSent ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-1 animate-fade-in font-mono text-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-bold">Inquiry Dispatched Successfully!</p>
                    <p className="text-[11px]">Your dispatch reference has been submitted to ESSGI Command desk.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Dr. Abebe Bekele"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Your Email</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="abebe@university.edu.et"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Subject</label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">Message</label>
                      <textarea
                        required
                        rows={3}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Detail your request for GNSS data, volcano alerts, or institutional partnership..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5 text-[#F7D08A]" />
                      <span>Submit Inquiry to Command Office</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-[#FAF9F5] border-t border-slate-200 rounded-b-[22px] flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-slate-500">
            ESSGI Public Information Directorate • Federal Democratic Republic of Ethiopia
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
