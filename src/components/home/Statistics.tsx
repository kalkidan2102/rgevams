import { statistics } from "../../data/statistics";

import SectionContainer from "../common/SectionContainer";
import SectionTitle from "../ui/SectionTitle";
import CounterCard from "../ui/CounterCard";

export default function Statistics() {
  return (
    <SectionContainer className="py-10 bg-gradient-to-br from-slate-50 via-sky-50/50 to-white text-slate-900 border-y border-sky-200/80 shadow-xs">

      <SectionTitle
        badge="Live Telemetry Stats"
        title="National Monitoring Overview & Station Uptime"
        description="Current operational statistics from the Ethiopian Space Science and Geospatial Institute monitoring platform."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">

        {statistics.map((item) => (
          <CounterCard
            key={item.title}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
            color={item.color}
          />
        ))}

      </div>

    </SectionContainer>
  );
}