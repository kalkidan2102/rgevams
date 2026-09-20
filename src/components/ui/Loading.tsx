import { RefreshCw } from "lucide-react";

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = "Synchronizing Earth Telemetry...", className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center space-y-3 ${className}`}>
      <RefreshCw className="w-8 h-8 text-[#C9A646] animate-spin" />
      <p className="text-xs font-mono tracking-wider font-extrabold text-[#C9A646] uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
