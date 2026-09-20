import { useState } from "react";
import { motion } from "motion/react";
import { SECTORS_DATA, SectorData } from "../../data/sectors";
import { SectorDetailModal } from "../Modals/SectorModal";
import { LayoutGrid, Map, BarChart3, FileText, ArrowUpRight, Satellite, Globe, Activity, ShieldCheck } from "lucide-react";

interface FeaturesProps {
  onNavigateToTab?: (tab: any) => void;
  onSelectSector?: (sector: SectorData) => void;
  onLaunchDashboard?: () => void;
}

export function Features({ onNavigateToTab, onSelectSector, onLaunchDashboard }: FeaturesProps) {
  const [selectedSectorInternal, setSelectedSectorInternal] = useState<SectorData | null>(null);

  const handleSectorClick = (sectorId: string) => {
    const found = SECTORS_DATA.find((s) => s.id === sectorId) || SECTORS_DATA[0];
    if (onSelectSector) {
      onSelectSector(found);
    } else {
      setSelectedSectorInternal(found);
    }
  };

  return (
    <>
      <section id="features" className="py-16 bg-slate-50 text-slate-900 border-b border-slate-200 font-sans">
        <div id="sectors" />
        <div id="technology" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900">
              Core Capabilities
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl">
              Advanced tools and analytics for comprehensive environmental and spatial awareness.
            </p>
          </div>

          {/* Bento Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Monitoring Cockpit */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={onLaunchDashboard}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    SYSTEM 01
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0085C8] transition-colors">
                    Monitoring Cockpit
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Real-time telemetry and geohazard alerts integrated into a unified command dashboard.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-xs font-bold text-slate-900 group-hover:text-[#0085C8]">
                <span>ACCESS SYSTEM</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.div>

            {/* Card 2: GIS Map Room (Dark Highlighted Card) */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => onNavigateToTab?.("map")}
              className="bg-[#0A1D2E] border border-sky-900/50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer text-white space-y-6 relative overflow-hidden"
            >
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-white/10 rounded-xl text-amber-400 border border-white/10">
                    <Map className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                    LIVE MAP
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">
                    GIS Map Room
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    High-fidelity spatial data visualization and topographic analysis.
                  </p>
                </div>
              </div>

              {/* Data Syncing Progress Bar at Bottom */}
              <div className="space-y-2 pt-4 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-amber-400 tracking-wider">DATA SYNCING</span>
                  <span className="text-slate-300">98.4%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 rounded-full w-[98.4%]" />
                </div>
              </div>
            </motion.div>

            {/* Card 3: Data Analytics */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => onNavigateToTab?.("analytics")}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    ANALYTICS
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0085C8] transition-colors">
                    Data Analytics
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Predictive modeling leveraging decades of satellite imagery.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono text-xs font-bold text-slate-700 group-hover:text-[#0085C8]">
                <span>VERSION v2.4.1</span>
                <span>→</span>
              </div>
            </motion.div>

            {/* Card 4: Publication Card (Span Wide) */}
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleSectorClick("space-science")}
              className="md:col-span-2 lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>LATEST PUBLICATION</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0085C8] transition-colors">
                  Tectonic Shift Analysis: Rift Valley 2024
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  A comprehensive study utilizing synthetic aperture radar (SAR) to measure micro-deformations along critical fault lines across the Main Ethiopian Rift.
                </p>
              </div>

              <div className="shrink-0 p-4 bg-slate-100 rounded-2xl group-hover:bg-[#0085C8]/10 group-hover:text-[#0085C8] transition-colors">
                <FileText className="w-8 h-8 text-slate-700 group-hover:text-[#0085C8]" />
              </div>
            </motion.div>

          </div>

          {/* Institutional Partners & Data Sources Section */}
          <div className="pt-12 border-t border-slate-200 space-y-8 text-center">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Institutional Partners & Data Sources
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Collaborating with global space agencies and geological surveys for real-time telemetry.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pt-2">
              <div className="flex items-center gap-2 text-slate-700 font-black font-mono text-lg tracking-widest hover:text-slate-900 transition-colors">
                <Satellite className="w-5 h-5 text-slate-600" />
                <span>NASA</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-black font-mono text-lg tracking-widest hover:text-slate-900 transition-colors">
                <Globe className="w-5 h-5 text-slate-600" />
                <span>ESA</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-black font-mono text-lg tracking-widest hover:text-slate-900 transition-colors">
                <Activity className="w-5 h-5 text-slate-600" />
                <span>JAXA</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-black font-mono text-lg tracking-widest hover:text-slate-900 transition-colors">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
                <span>USGS</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Internal Modal fallback */}
      {selectedSectorInternal && (
        <SectorDetailModal
          sector={selectedSectorInternal}
          onClose={() => setSelectedSectorInternal(null)}
          onNavigateToTab={onNavigateToTab}
        />
      )}
    </>
  );
}
