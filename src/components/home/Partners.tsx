import { Globe2, ShieldCheck, Award } from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

interface PartnerItem {
  id: string;
  name: string;
  role: string;
  category: string;
}

const PARTNERS: PartnerItem[] = [
  {
    id: "aau",
    name: "Addis Ababa University",
    role: "Academic Research & Graduate Studies",
    category: "Academic",
  },
  {
    id: "mint",
    name: "Ministry of Innovation & Tech (MInT)",
    role: "Federal Governance & Policy",
    category: "Federal Government",
  },
  {
    id: "drmc",
    name: "National Disaster Risk Management",
    role: "Civil Protection & Early Warning",
    category: "Federal Agency",
  },
  {
    id: "comet",
    name: "COMET / University of Leeds",
    role: "InSAR Radar & Tectonic Geodesy",
    category: "International Research",
  },
  {
    id: "esa",
    name: "European Space Agency (ESA)",
    role: "Copernicus Sentinel-1 & 2 Telemetry",
    category: "Space Agency",
  },
  {
    id: "igs",
    name: "International GNSS Service (IGS)",
    role: "Global Geodetic Orbit Infrastructure",
    category: "Geodetic Network",
  },
  {
    id: "usgs",
    name: "USGS Global Seismographic Network",
    role: "Broadband Seismic Waveform Feeds",
    category: "Seismology Network",
  },
];

export function AauPartners() {
  const { isAmharic } = useLanguage();

  return (
    <section className="w-full bg-white dark:bg-slate-900 py-8 border-b border-slate-200 dark:border-slate-800 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0E4A72] dark:text-blue-400">
            {isAmharic ? "ዓለም አቀፍ እና ሀገራዊ ትብብሮች" : "ACADEMIC & STRATEGIC PARTNERSHIPS"}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {isAmharic 
              ? "ከአዲስ አበባ ዩኒቨርሲቲ እና ከዓለም አቀፍ የጠፈር ተቋማት ጋር በጋራ እንሰራለን" 
              : "Collaborative Research with Premier Universities & Space Agencies"}
          </h3>
        </div>

        {/* Partners Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {PARTNERS.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-center flex flex-col items-center justify-center space-y-1 hover:border-[#0E4A72]/40 transition-colors shadow-2xs"
            >
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#D48F29]">
                {p.category}
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {p.name}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {p.role}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
export default AauPartners;
