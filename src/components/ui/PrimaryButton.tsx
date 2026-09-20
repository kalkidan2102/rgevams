import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "solid" | "outline" | "ghost" | "blue" | "outline-blue" | "orange";
}

export default function PrimaryButton({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  variant = "solid",
}: PrimaryButtonProps) {
  const baseStyle =
    "px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variantStyles = {
    solid:
      "bg-gradient-to-r from-[#C9A646] via-[#ca933c] to-[#ca933c] text-slate-950 font-extrabold shadow-[0_4px_14px_rgba(201,166,70,0.3)] hover:shadow-[0_6px_20px_rgba(201,166,70,0.45)] hover:brightness-105 border border-[#C9A646]/25",
    outline:
      "border border-slate-200 dark:border-white/10 hover:border-[#C9A646] text-slate-700 dark:text-slate-300 hover:text-[#C9A646] hover:bg-amber-500/5",
    ghost: "text-slate-600 dark:text-slate-400 hover:text-[#C9A646] hover:bg-amber-500/5",
    blue:
      "bg-gradient-to-r from-[#0085C8] to-[#00D4FF] text-white font-extrabold shadow-[0_4px_14px_rgba(0,133,200,0.3)] hover:shadow-[0_6px_20px_rgba(0,133,200,0.45)] hover:brightness-105 border border-[#00D4FF]/25",
    "outline-blue":
      "border border-[#0085C8] hover:border-[#00D4FF] text-slate-700 dark:text-slate-300 hover:text-[#0085C8] dark:hover:text-[#00D4FF] hover:bg-[#0085C8]/5",
    orange:
      "bg-gradient-to-r from-[#D48F29] to-[#B27218] text-white font-extrabold shadow-[0_4px_14px_rgba(212,143,41,0.3)] hover:shadow-[0_6px_20px_rgba(212,143,41,0.45)] hover:brightness-105 border border-[#D48F29]/25",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export { PrimaryButton };
