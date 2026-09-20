import { ShieldCheck, ArrowRight, Award, Globe2, Building2 } from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";
import controlRoomOps from "../../assets/images/control_room_ops_1786877665430.jpg";

interface AauDirectorWelcomeProps {
  onNavigateToAbout: () => void;
}

export function DirectorWelcome({ onNavigateToAbout }: AauDirectorWelcomeProps) {
  const { isAmharic } = useLanguage();

  return (
    <section className="w-full bg-white dark:bg-slate-900 py-10 border-b border-slate-200 dark:border-slate-800 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col lg:flex-row items-center gap-8">
          
          {/* Left: Official Photo / Institutional Crest Box */}
          <div className="w-full lg:w-1/3 flex flex-col items-center text-center space-y-4 shrink-0">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
              <img
                src={controlRoomOps}
                alt="SSGI Directorate Leadership and Operations"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E4A72]/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 text-white text-[11px] font-mono font-medium bg-[#0E4A72]/90 py-1 px-2 rounded backdrop-blur-xs">
                <ShieldCheck size={14} className="text-[#F7D08A]" />
                <span>PROCLAMATION NO. 1263/2021</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0E4A72] dark:text-blue-300">
                {isAmharic ? "ዶ/ር አብዲሳ ይልማ" : "Dr. Abdissa Yilma"}
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isAmharic ? "የኢንስቲትዩቱ ዋና ዳይሬክተር" : "Director General, SSGI"}
              </p>
              <p className="text-[11px] font-mono text-[#D48F29] uppercase tracking-wider">
                Space Science &amp; Geospatial Institute
              </p>
            </div>
          </div>

          {/* Right: Welcome Message Body matching AAU Academic Architecture */}
          <div className="w-full lg:w-2/3 space-y-4 text-left">
            <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-[#0E4A72] dark:text-blue-300 font-mono text-[10.5px] font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[#D48F29]" />
                <span>{isAmharic ? "የዋና ዳይሬክተሩ መልእክት" : "DIRECTOR GENERAL'S WELCOME"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {isAmharic 
                  ? "እንኳን ወደ ስፔስ ሳይንስና ጂኦስፓሻል ኢንስቲትዩት በደህና መጡ"
                  : "Empowering National Development Through Space & Geospatial Intelligence"}
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                {isAmharic
                  ? "የስፔስ ሳይንስ እና ጂኦስፓሻል ኢንስቲትዩት (SSGI) በአዋጅ ቁጥር 1263/2021 መሰረት የተቋቋመ ሲሆን፣ ሀገራችን ኢትዮጵያ በጠፈር ቴክኖሎጂ፣ በርቀት ዳሰሳ፣ በጂኦዴሲ እና በተፈጥሮ አደጋዎች ቅድመ ማስጠንቀቂያ ራሷን እንድትችል 24 ሰዓት ያለማቋረጥ ይሰራል::"
                  : "On behalf of the scientists, engineers, and researchers at the Space Science and Geospatial Institute (SSGI), I welcome you to our primary institutional portal. Established under FDRE Proclamation No. 1263/2021, SSGI spearheads Ethiopia's sovereignty in space exploration, Earth observation, and geodetic surveying."}
              </p>
              <p>
                {isAmharic
                  ? "በእንጦጦ ኦብዘርቫቶሪ ከሚገኙት ግዙፍ ቴሌስኮፖች አንስቶ በመላው ሀገሪቱ በተተከሉ ከ48 በላይ የጂኤንኤስኤስ ጣቢያዎች እና የሴይስሞሎጂ መከታተያዎች አማካኝነት የምናመነጨው መረጃ ለሀገራዊ ደህንነት፣ ለመሠረተ ልማት ግንባታ እና ለሳይንሳዊ ምርምር ወሳኝ ምሰሶ ነው:: ከአዲስ አበባ ዩኒቨርሲቲ እና ከዓለም አቀፍ አጋሮቻችን ጋር በትብብር እንሰራለን::"
                  : "Through our state-of-the-art Entoto Observatory optical telescopes, nationwide continuous GNSS CORS geodetic infrastructure, and automated seismic-volcanic telemetry arrays along the East African Rift, we deliver high-fidelity spatial data supporting national infrastructure, disaster mitigation, and academic inquiry in close synergy with Addis Ababa University."}
              </p>
            </div>

            {/* Read More Button */}
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={onNavigateToAbout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0E4A72] hover:bg-[#093553] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                <span>{isAmharic ? "ስለ ኢንስቲትዩቱ ሙሉ መረጃ ያንብቡ" : "Read Full Mandate & Profile"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7D08A]" />
              </button>

              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                FDRE Ministry of Innovation &amp; Technology (MInT)
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
export default DirectorWelcome;
