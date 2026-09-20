import React from "react";
import { InSARViewLayer, InSARColormap } from "../types/insar";

interface DisplacementLegendProps {
  viewLayer?: InSARViewLayer;
  colormap?: InSARColormap;
  dispMin?: number;
  dispMax?: number;
  velMin?: number;
  velMax?: number;
  height?: number;
}

export const DisplacementLegend: React.FC<DisplacementLegendProps> = ({
  viewLayer = "cumulative",
  dispMin = -570,
  dispMax = 570,
  height = 360
}) => {
  // Exact COMET volcano portal color gradient (as shown in screenshot: Deep Blue -> Cyan -> Pale Seafoam -> Golden Ochre -> Deep Brown)
  const gradientCss =
    "linear-gradient(to top, #1a3680 0%, #295ab0 15%, #4ea8de 30%, #a8d5cb 45%, #dbe4dc 50%, #d8be60 55%, #ca8a04 70%, #9e530a 85%, #5c1d06 100%)";

  return (
    <div className="flex items-center justify-center font-sans select-none px-2 py-4 h-full">
      <div className="relative flex items-center justify-center" style={{ height: `${height}px` }}>
        
        {/* EXACT COMET VERTICAL COLOR STRIP */}
        <div
          className="w-5 h-full border border-[#1b2a4a] rounded-none shadow-xs"
          style={{ background: gradientCss }}
        />

        {/* 3 SCIENTIFIC VALUES (TOP, 0, BOTTOM) MATCHING SCREENSHOT */}
        <div className="absolute left-7 top-0 bottom-0 flex flex-col justify-between text-[11px] font-sans text-[#333333] font-normal leading-none py-0.5">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-px bg-[#333333]" />
            <span>{dispMax}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-px bg-[#333333]" />
            <span>0</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-px bg-[#333333]" />
            <span>{dispMin}</span>
          </div>
        </div>

        {/* ROTATED 'displacement (mm)' LABEL ON RIGHT */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-[13.5px] font-sans text-[#222222] font-normal tracking-normal">
          displacement (mm)
        </div>

      </div>
    </div>
  );
};
