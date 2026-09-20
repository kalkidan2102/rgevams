import { motion } from "motion/react";

interface SectionTitleProps {
  badge?: string;
  accent?: string;
  title: string;
  description?: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionTitle({
  badge,
  accent,
  title,
  description,
  subtitle,
  align = "center",
}: SectionTitleProps) {
  const isCenter = align === "center";
  const displayBadge = badge || accent;
  const displayDescription = description || subtitle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-5 ${
        isCenter ? "text-center" : "text-left"
      }`}
    >
      {displayBadge && (
        <div className={`inline-flex items-center gap-2 rounded-lg border border-[#0E4A72]/20 bg-[#0E4A72]/5 px-4 py-1.5 text-xs font-mono font-black uppercase tracking-widest text-[#0E4A72] shadow-2xs ${isCenter ? "mx-auto" : ""}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
          <span>{displayBadge}</span>
        </div>
      )}

      <h2 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-[#0E4A72] tracking-tight">
        {title}
      </h2>

      {/* Formal Gold / Navy Accent Divider Line */}
      <div className={`flex items-center gap-1 mt-3.5 mb-2 ${isCenter ? "justify-center" : "justify-start"}`}>
        <div className="h-1 w-12 bg-[#0E4A72] rounded-full" />
        <div className="h-1 w-6 bg-[#0085C8] rounded-full" />
        <div className="h-1 w-3 bg-[#B8860B] rounded-full" />
      </div>

      {displayDescription && (
        <p
          className={`mt-2 text-xs sm:text-sm md:text-base leading-relaxed text-slate-700 font-normal ${
            isCenter ? "mx-auto max-w-3xl" : "max-w-2xl"
          }`}
        >
          {displayDescription}
        </p>
      )}
    </motion.div>
  );
}

export { SectionTitle };