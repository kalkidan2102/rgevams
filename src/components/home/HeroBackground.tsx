import volcanicHazardBg from "../../assets/images/volcanic_hazard_1783416356460.jpg";
import earthquakeHazardBg from "../../assets/images/earthquake_hazard_1783416373231.jpg";

interface HeroBackgroundProps {
  activeTab?: string;
  theme: "light" | "dark";
}

export function HeroBackground({ activeTab = "volcanoes", theme }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Cinematic Dynamic Hazard Background Layer */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out bg-cover bg-center"
        style={{
          backgroundImage:
            activeTab === "volcanoes"
              ? `url(${volcanicHazardBg})`
              : activeTab === "earthquakes"
              ? `url(${earthquakeHazardBg})`
              : "none",
          opacity:
            activeTab === "volcanoes" || activeTab === "earthquakes"
              ? theme === "dark"
                ? 0.12
                : 0.18
              : 0,
        }}
      />

      {/* Luxurious High-Fidelity Background Glowing Glass Nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-[#C9A646]/10 to-[#3ABEFF]/5 blur-[130px] animate-pulse duration-[12000ms]" />
      <div className="absolute top-[40%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-[#3ABEFF]/8 to-transparent blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#C9A646]/8 to-transparent blur-[110px]" />
    </div>
  );
}
