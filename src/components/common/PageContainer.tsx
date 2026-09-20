import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  const hasBgClass = className.includes("bg-");
  const hasTextClass = className.includes("text-");

  return (
    <div
      className={`
        relative
        min-h-screen
        overflow-x-hidden
        ${hasBgClass ? "" : "bg-white"}
        ${hasTextClass ? "" : "text-slate-900"}
        antialiased
        selection:bg-[#0085c8]
        selection:text-white
        ${className}
      `}
    >
      {children}
    </div>
  );
}