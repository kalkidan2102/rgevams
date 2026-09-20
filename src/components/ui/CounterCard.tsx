import { motion } from "motion/react";

interface CounterCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

export default function CounterCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: CounterCardProps) {
  // High contrast styling for white theme: bold black titles, vibrant badges, crisp dark/light-blue values
  let iconBg = "bg-slate-100 text-[#0E4A72]";
  let valueColor = "text-[#0085C8]";

  if (color.includes("red")) {
    iconBg = "bg-rose-100 text-rose-700";
    valueColor = "text-rose-700";
  } else if (color.includes("orange")) {
    iconBg = "bg-amber-100 text-amber-800";
    valueColor = "text-amber-800";
  } else if (color.includes("cyan") || color.includes("blue")) {
    iconBg = "bg-sky-100 text-[#0085C8]";
    valueColor = "text-[#0085C8]";
  } else if (color.includes("green")) {
    iconBg = "bg-emerald-100 text-emerald-800";
    valueColor = "text-emerald-800";
  }

  return (
    <div className="p-7 h-full rounded-3xl bg-white border-2 border-slate-200/90 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:border-[#0085C8]/50 transition-all duration-300 group">

      <motion.div
        whileHover={{ rotate: 10 }}
        className={`mb-5 inline-flex rounded-2xl p-4 font-bold shadow-sm ${iconBg}`}
      >
        <Icon size={34} />
      </motion.div>

      <h3 className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${valueColor}`}>
        {value}
      </h3>

      <h4 className="mt-3 text-base font-black text-slate-900 uppercase tracking-wider font-display">
        {title}
      </h4>

      <p className="mt-1.5 text-xs font-semibold text-slate-600 font-sans leading-relaxed">
        {subtitle}
      </p>

    </div>
  );
}