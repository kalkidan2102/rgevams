import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function GlowButton({ children, onClick, className = "" }: GlowButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-2xl text-xs font-bold font-display tracking-widest uppercase bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-lg hover:shadow-[0_0_20px_rgba(201,166,70,0.5)] transition-all duration-300 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
