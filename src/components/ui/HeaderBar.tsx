import React, { useState } from "react";
import { 
  Sparkles, 
  Cpu, 
  Code2, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Terminal, 
  Layers, 
  X, 
  Play, 
  Activity, 
  Flame, 
  Database,
  ExternalLink,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AiStudioHeaderBarProps {
  theme?: "light" | "dark";
  onOpenPromptAssistant?: () => void;
}

export function AiStudioHeaderBar({ theme = "dark", onOpenPromptAssistant }: AiStudioHeaderBarProps) {
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [activeModel, setActiveModel] = useState("gemini-2.5-flash-geodynamic");

  const modelOptions = [
    { id: "gemini-2.5-flash-geodynamic", name: "Gemini 2.5 Flash Geodynamic", speed: "18ms", badge: "Default • High Speed" },
    { id: "gemini-2.5-pro-crustal", name: "Gemini 2.5 Pro Crustal Analysis", speed: "140ms", badge: "Deep Reasoning" },
    { id: "gemini-live-telemetry", name: "Gemini Live Telemetry Stream", speed: "Real-time", badge: "Multimodal Audio/Video" },
  ];

  return (
    <>
      {/* Geospatial Top System Bar */}
      <div className="w-full bg-slate-950 text-white border-b border-cyan-500/20 text-xs py-1 px-3 sm:px-5 font-mono select-none z-50 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        
        {/* Left: ESSGI Branding & Model Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-2.5 py-0.5 rounded-full border border-cyan-400/30 text-cyan-300 font-extrabold text-[10.5px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="tracking-widest uppercase">GEOSPATIAL PLATFORM</span>
          </div>

          <div className="h-3 w-px bg-white/15 hidden sm:block"></div>

          {/* Model Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowModelDetails(!showModelDetails)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-2.5 py-0.5 rounded-lg border border-slate-700/60 text-slate-200 hover:border-cyan-400/40 text-[10px] transition-all cursor-pointer font-sans"
            >
              <Bot className="w-3 h-3 text-purple-400" />
              <span className="font-bold text-white font-mono">{activeModel}</span>
              <Sliders className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {/* Model details dropdown popover */}
            <AnimatePresence>
              {showModelDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-cyan-500/30 rounded-xl p-3 shadow-2xl z-50 text-slate-200 text-xs font-sans space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold font-mono text-[11px] text-cyan-400 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> STUDIO MODEL ENGINE
                    </span>
                    <button 
                      onClick={() => setShowModelDetails(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {modelOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setActiveModel(opt.id);
                          setShowModelDetails(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer border transition-all text-[11px] ${
                          activeModel === opt.id
                            ? "bg-cyan-500/10 border-cyan-400/50 text-white font-bold"
                            : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt.name}</span>
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">{opt.speed}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{opt.badge}</div>
                      </div>
                    ))}
                  </div>

                  {/* Hyper-parameters info */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-white/5 text-[9.5px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span className="text-purple-300">0.20 (Precise)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top-P / Top-K:</span>
                      <span className="text-cyan-300">0.95 / 40</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grounding:</span>
                      <span className="text-emerald-400 font-bold">Enabled (USGS & COMET)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Realtime Telemetry Status */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>18ms Latency</span>
          </div>

          <div className="flex items-center gap-1.5 text-sky-300 bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded-md">
            <Database className="w-3 h-3 text-sky-400" />
            <span>COMET & FURI Live Sync</span>
          </div>

          <div className="flex items-center gap-1.5 text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            <span>ESSGI Grounded</span>
          </div>
        </div>

        {/* Right: Inspector & Prompt Assistant triggers */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Inspector Toggle */}
          <button
            onClick={() => setShowInspector(!showInspector)}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-0.5 rounded-lg border border-slate-700 text-[10px] transition-all cursor-pointer font-mono"
            title="Inspect Live Grounded Telemetry JSON Stream"
          >
            <Code2 className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Inspect API</span>
          </button>

          {/* Prompt Assistant trigger */}
          <button
            onClick={onOpenPromptAssistant}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold px-3 py-0.5 rounded-lg shadow-[0_0_12px_rgba(0,212,255,0.3)] transition-all cursor-pointer text-[10.5px] font-sans active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>AI Prompt Intelligence</span>
          </button>
        </div>
      </div>

      {/* Code Inspector Drawer */}
      <AnimatePresence>
        {showInspector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-slate-950 border-b border-cyan-500/30 overflow-hidden text-xs font-mono text-cyan-300 select-text z-40"
          >
            <div className="p-4 max-w-7xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2">
                <span className="font-bold flex items-center gap-2 text-white">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  ESSGI GROUNDED TELEMETRY PAYLOAD (REALTIME RESPONSE STREAM)
                </span>
                <button 
                  onClick={() => setShowInspector(false)}
                  className="hover:text-white text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[10.5px] leading-relaxed text-slate-300">
{`{
  "status": "200_OK",
  "geospatial_platform": "ESSGI Geodynamic Engine",
  "model": "${activeModel}",
  "telemetry": {
    "gnss_stations": 18,
    "furi_broadband_status": "STREAMING_100HZ",
    "active_faults": "Afar Triple Junction Rift Graben",
    "grounding_sources": ["COMET Geodesy", "USGS Realtime Feeds", "ESSGI Ground Stations"]
  },
  "risk_index": "MODERATE_RIFT_DEFORMATION",
  "latency_ms": 18
}`}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
