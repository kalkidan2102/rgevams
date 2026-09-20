import React from "react";
import { Languages, Globe } from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

interface LanguageToggleProps {
  variant?: "pill" | "compact" | "full" | "dropdown";
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = "pill",
  className = ""
}) => {
  const { language, setLanguage, toggleLanguage, isAmharic } = useLanguage();

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLanguage}
        title={isAmharic ? "Switch to English" : "ወደ አማርኛ ቀይር (Switch to Amharic)"}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs active:scale-95 select-none ${
          isAmharic
            ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
            : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-[#0085C8]"
        } ${className}`}
      >
        <Globe className={`w-3.5 h-3.5 ${isAmharic ? "text-emerald-700" : "text-[#0085C8]"}`} />
        <span className="font-mono tracking-tight text-[11px] font-black">
          {isAmharic ? "አማርኛ (AM)" : "EN"}
        </span>
      </button>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl ${className}`}>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E4A72]">
          <Languages className="w-4 h-4 text-[#D48F29]" />
          <span>{isAmharic ? "የቋንቋ ምርጫ (Language)" : "Language Selection"}</span>
        </div>
        <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs ml-auto">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              language === "en"
                ? "bg-[#0E4A72] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            English (EN)
          </button>
          <button
            onClick={() => setLanguage("am")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              language === "am"
                ? "bg-[#D48F29] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            አማርኛ (Amharic)
          </button>
        </div>
      </div>
    );
  }

  // Default "pill" switcher
  return (
    <div
      className={`inline-flex items-center bg-white/90 backdrop-blur-xs p-0.5 rounded-xl border border-slate-200 shadow-xs select-none ${className}`}
      role="group"
      aria-label="Language selection toggle"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        title="English interface"
        className={`px-2.5 py-1 text-[11px] font-mono font-black tracking-tight rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
          language === "en"
            ? "bg-[#0E4A72] text-[#F7D08A] shadow-xs"
            : "text-slate-600 hover:text-[#0E4A72] hover:bg-slate-100"
        }`}
      >
        <span>EN</span>
      </button>

      <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />

      <button
        type="button"
        onClick={() => setLanguage("am")}
        title="የአማርኛ ቋንቋ አማራጭ"
        className={`px-2.5 py-1 text-[11px] font-sans font-bold tracking-tight rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
          language === "am"
            ? "bg-[#D48F29] text-white shadow-xs"
            : "text-slate-600 hover:text-[#D48F29] hover:bg-slate-100"
        }`}
      >
        <span>አማርኛ</span>
      </button>
    </div>
  );
};
