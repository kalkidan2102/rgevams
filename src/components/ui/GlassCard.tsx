import { ReactNode } from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -6,
              scale: 1.02,
            }
          : undefined
      }
      transition={{
        duration: 0.25,
      }}
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-2xl
        shadow-[0_10px_40px_rgba(0,133,200,0.08)]
        before:absolute
        before:inset-0
        before:bg-gradient-to-br
        before:from-white/10
        before:to-transparent
        before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}