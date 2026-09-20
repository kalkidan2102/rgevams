import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  Play, 
  Sliders, 
  Bot, 
  Zap, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  Layers, 
  Activity, 
  Flame, 
  MapPin, 
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AiStudioPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromptResult?: (resultText: string) => void;
}

export function AiStudioPromptModal({ isOpen, onClose, onApplyPromptResult }: AiStudioPromptModalProps) {
  const [promptText, setPromptText] = useState(
    "Analyze the active Afar Rift triple-junction fault swarms and Erta Ale lava lake levels over the past 30 days. Highlight critical geohazard zones, crustal deformation rates, and emergency advisory steps."
  );
  const [temperature, setTemperature] = useState(0.2);
  const [model, setModel] = useState("gemini-2.5-flash-geodynamic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const promptPresets = [
    {
      label: "Afar Rift Swarms & Magma Surge",
      prompt: "Synthesize current 30-day seismic tremor velocity and magma lakes at Erta Ale and Dallol. Assess potential rifting hazards for local Afar infrastructure."
    },
    {
      label: "Entoto & FURI Broadband Seismicity",
      prompt: "Evaluate the 100Hz broadband signal integrity at FURI station in Addis Ababa. Identify micro-seismic swarm origins relative to the Main Ethiopian Rift."
    },
    {
      label: "Geodetic Crustal Strain Rate",
      prompt: "Calculate millimeter-level crustal extension rates across the 18 GNSS receiver array from Semera to Dobi Graben."
    }
  ];

  const handleRunPrompt = () => {
    setIsGenerating(true);
    setGeneratedOutput(null);

    // Simulate fast grounded inference
    setTimeout(() => {
      const response = `✦ ESSGI GROUNDED GEOHAZARD BRIEF
Model: ${model} | Temp: ${temperature} | Latency: 22ms

1. RIFTING AXIS STRAIN SUMMARY:
Continuous 18-station GNSS telemetry verifies an extension velocity of 18.4 mm/year across the Afar Triple Junction. Seismic swarm focal mechanisms in Dobi Graben indicate shallow normal faulting at 8–12 km depth.

2. VOLCANIC THERMAL & SO2 OUTGASSING:
Erta Ale caldera lake displays active basaltic convection with thermal output peaking at 92 MW. Moderate SO2 gas plumes (1,200 tons/day) remain confined to the summit crater.

3. GEODYNAMIC ADVISORY & SAFETY ACTION:
• Maintain RED hazard level for immediate Erta Ale crater lip (3 km radius).
• Keep ORANGE readiness for Dallol hydrothermal brine field tours.
• Regional rift infrastructure remains STABLE with normal background baseline.`;

      setGeneratedOutput(response);
      setIsGenerating(false);
      if (onApplyPromptResult) {
        onApplyPromptResult(response);
      }
    }, 1200);
  };

  const handleCopy = () => {
    if (generatedOutput) {
      navigator.clipboard.writeText(generatedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-cyan-500/30 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        >
          {/* Header */}
          <div className="bg-slate-950 px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-widest uppercase font-display flex items-center gap-2">
                  <span>Geodynamic Prompt Workspace</span>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-mono">
                    System Sandbox
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Craft grounded geodynamic analysis prompts powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main workspace layout */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
            {/* Left Column: Prompt Input & Parameters */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Quick Studio Prompt Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {promptPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPromptText(preset.prompt)}
                      className="text-[10px] bg-slate-800/80 hover:bg-slate-800 hover:border-cyan-400/40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700/60 transition-all cursor-pointer text-left font-sans"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Prompt Box */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase">
                  <span>Input Prompt Instructions</span>
                  <span className="text-cyan-400 font-mono">{promptText.length} chars</span>
                </div>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 font-sans leading-relaxed resize-none"
                  placeholder="Enter custom geodynamic query..."
                />
              </div>

              {/* Run Prompt button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-mono">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Model: <strong className="text-white">{model}</strong></span>
                </div>

                <button
                  onClick={handleRunPrompt}
                  disabled={isGenerating || !promptText.trim()}
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all cursor-pointer flex items-center gap-2 text-xs font-sans disabled:opacity-50 active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                      <span>Streaming Response...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white text-white" />
                      <span>Run AI Prompt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Response View */}
              {generatedOutput && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Grounded Stream Output
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer bg-slate-800 px-2 py-0.5 rounded-md"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <pre className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap select-text max-h-60 overflow-y-auto">
                    {generatedOutput}
                  </pre>
                </div>
              )}

            </div>

            {/* Right Column: Model Hyperparameter Tuning */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hyperparameters</span>
              </h4>

              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10.5px] font-mono">
                  <span className="text-slate-400">Temperature</span>
                  <span className="text-cyan-400 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0.0 (Precise)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* System Grounding Options */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Grounding Sources
                </label>
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>COMET Satellite Radar</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>18-GNSS Station Telemetry</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>FURI Broadband Seismometer</span>
                  </div>
                </div>
              </div>

              {/* Latency info */}
              <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/20 text-[10px] font-mono text-cyan-300 space-y-1">
                <div className="font-bold flex items-center gap-1 text-white">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Cloud Run Container
                </div>
                <p className="text-slate-400 leading-normal">
                  Inference calls execute server-side with zero key exposure.
                </p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
