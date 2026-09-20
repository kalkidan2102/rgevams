interface DividerProps {
  className?: string;
  gradient?: boolean;
}

export function Divider({ className = "", gradient = true }: DividerProps) {
  return (
    <hr
      className={`border-0 h-px ${
        gradient
          ? "bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"
          : "bg-slate-100 dark:bg-white/5"
      } ${className}`}
    />
  );
}
