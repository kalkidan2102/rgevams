import {
  Activity,
  Mountain,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { ETHIOPIA_GNSS_STATIONS } from "./earthquakes";

export const statistics = [
  {
    title: "Earthquakes Recorded",
    value: "154",
    subtitle: "Past 30 Days",
    color: "text-red-400",
    icon: Activity,
  },
  {
    title: "Active Volcanoes",
    value: "13",
    subtitle: "Monitored Sites",
    color: "text-orange-400",
    icon: Mountain,
  },
  {
    title: "GNSS Stations",
    value: ETHIOPIA_GNSS_STATIONS.length.toString(),
    subtitle: "Online Stations",
    color: "text-cyan-400",
    icon: Radio,
  },
  {
    title: "System Health",
    value: "99.98%",
    subtitle: "Operational",
    color: "text-green-400",
    icon: ShieldCheck,
  },
];