import { SeverityLevel } from "../types";

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
}

export function getSeverityBg(severity: SeverityLevel): string {
  switch (severity) {
    case "Red":
      return "bg-red-500/10 text-red-500 border-red-500/25";
    case "Orange":
      return "bg-amber-500/10 text-amber-500 border-amber-500/25";
    case "Yellow":
      return "bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 border-yellow-400/25";
    case "Green":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/25";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/25";
  }
}

export function getSeverityHex(severity: SeverityLevel): string {
  switch (severity) {
    case "Red":
      return "#EF4444";
    case "Orange":
      return "#F59E0B";
    case "Yellow":
      return "#EAB308";
    case "Green":
      return "#10B981";
    default:
      return "#64748B";
  }
}
