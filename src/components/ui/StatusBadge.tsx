interface StatusBadgeProps {
  text: string;
  color?: "green" | "blue" | "red" | "yellow";
}

export default function StatusBadge({
  text,
  color = "green",
}: StatusBadgeProps) {
  const colors = {
    green:
      "bg-green-500/15 text-green-300 border-green-500/30",

    blue:
      "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",

    red:
      "bg-red-500/15 text-red-300 border-red-500/30",

    yellow:
      "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-4
        py-2
        text-xs
        font-semibold
        uppercase
        tracking-widest
        ${colors[color]}
      `}
    >
      <span className="h-2 w-2 rounded-full bg-current"></span>

      {text}
    </span>
  );
}