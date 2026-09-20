import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function SectionContainer({
  children,
  className = "",
  id,
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`
        relative
        w-full
        py-4
        lg:py-6
        ${className}
      `}
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}