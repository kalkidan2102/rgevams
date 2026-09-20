import { useState } from "react";
import entotoObservatory from "../../assets/images/entoto.jpg";
import ertaAleLava from "../../assets/images/Erta-ale-lava.jpg";
import dallolSprings from "../../assets/images/dallol.jpg";
import earthObservation from "../../assets/images/earthobservation.jpg";
import { SectionTitle } from "../ui/SectionTitle";
import { Camera, ZoomIn, Maximize2, X, ChevronLeft, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Gallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const images = [
    {
      url: ertaAleLava,
      title: "Erta Ale Active Lava Lake",
      location: "Danakil Depression, Afar Region",
      badge: "Basaltic Shield Volcano",
      caption: "Continuously active basaltic lava lake located in the Danakil graben, venting molten basaltic rock at temperatures exceeding 1,100°C continuously since 1967.",
    },
    {
      url: dallolSprings,
      title: "Dallol Hydrothermal Salt Formations",
      location: "Northern Salt Plains (-120m Elev)",
      badge: "Geothermal Acid Springs",
      caption: "Vibrant sulfuric acid salt spring chimneys and hydrothermal brine pools located more than 120 meters below sea level in the northern Danakil salt flats.",
    },
    {
      url: entotoObservatory,
      title: "Entoto Astronomical Observatory",
      location: "Mount Entoto Summit (3,200m Elev)",
      badge: "Optical & Space Facility",
      caption: "Dual 1-meter twin optical telescopes and high-altitude space monitoring station tracking satellites and astronomical objects from Addis Ababa's summit.",
    },
    {
      url: earthObservation,
      title: "InSAR Radar Interferometry Scan",
      location: "East African Rift System Baseline",
      badge: "Spaceborne Radar Sensing",
      caption: "Synthetic Aperture Radar (InSAR) ground displacement scans visualizing millimeter-level tectonic strain and rift spreading along active Ethiopian fault lines.",
    },
  ];

  const handlePrev = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : (prev ?? 0) - 1));
  };

  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : (prev ?? 0) + 1));
  };

  return (
    <div id="gallery" className="space-y-8 font-sans">
      <SectionTitle
        title="Geomorphic & Geospatial Gallery"
        subtitle="Visualizing the immense forces sculpting the Horn of Africa, from high-altitude space observatories down to boiling fissure vents. Click any image to expand."
        accent="Observation Gallery"
      />

      {/* Compact 4-Column Card Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <motion.div
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Expand media image: ${img.title}`}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setSelectedImageIndex(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedImageIndex(i);
              }
            }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xs hover:shadow-md hover:border-[#0E4A72] focus:outline-none focus:ring-2 focus:ring-[#0085C8] transition-all duration-300 cursor-pointer select-none flex flex-col justify-between"
          >
            {/* Compact Picture Container */}
            <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-950">
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-100"
                referrerPolicy="no-referrer"
              />
              
              {/* Subtle top badge over picture */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2 py-0.5 rounded-md bg-[#0E4A72]/90 backdrop-blur-md text-white border border-[#B8860B]/30 text-[9px] font-mono font-bold uppercase tracking-wider shadow-xs">
                  {img.badge}
                </span>
              </div>

              {/* Hover overlay with Expand indicator */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E4A72]/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-2 text-center">
                <div className="px-3 py-1.5 rounded-lg bg-[#0E4A72] text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md border border-[#B8860B]/40 transform scale-95 group-hover:scale-100 transition-transform duration-200 shadow-md flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3 text-[#F7D08A]" />
                  <span>Expand Image</span>
                </div>
              </div>
            </div>
            
            {/* Card Content Footer */}
            <div className="p-3.5 space-y-1.5 bg-white border-t border-slate-100 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wide text-[#0E4A72] group-hover:text-[#0085C8] transition-colors font-display leading-tight line-clamp-1">
                    {img.title}
                  </h4>
                  <Camera className="w-3.5 h-3.5 text-[#B8860B] shrink-0 mt-0.5" />
                </div>

                <div className="flex items-center gap-1 text-[10.5px] text-[#0085C8] font-mono font-bold mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{img.location}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug font-normal line-clamp-2 pt-0.5 border-t border-slate-100">
                {img.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* EXPANDED FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-5xl bg-[#041B2D] border-2 border-[#00D4FF]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0E4A72] via-[#0085C8] to-[#00D4FF] text-white flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-200 block">
                      ESSGI Geodynamics High-Resolution Media
                    </span>
                    <h3 className="text-lg sm:text-xl font-black font-display tracking-tight">
                      {images[selectedImageIndex].title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedImageIndex(null)}
                  aria-label="Close fullscreen media view"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  title="Close Fullscreen View"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Expanded Image Frame */}
              <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[450px] flex items-center justify-center overflow-hidden">
                <img
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].title}
                  className="w-full h-full max-h-[65vh] object-contain"
                  referrerPolicy="no-referrer"
                />

                {/* Left Arrow */}
                <button
                  onClick={handlePrev}
                  aria-label="Previous gallery image"
                  className="absolute left-4 p-3 rounded-full bg-slate-900/80 hover:bg-[#0085C8] text-white transition-all border border-white/20 cursor-pointer shadow-lg active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  title="Previous Picture"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={handleNext}
                  aria-label="Next gallery image"
                  className="absolute right-4 p-3 rounded-full bg-slate-900/80 hover:bg-[#0085C8] text-white transition-all border border-white/20 cursor-pointer shadow-lg active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  title="Next Picture"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Caption & Metadata Footer */}
              <div className="p-5 sm:p-6 bg-[#041B2D] border-t border-slate-800 text-white space-y-2 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#0085C8]/20 border border-[#00D4FF]/30 text-[#00D4FF] text-xs font-mono font-bold">
                      {images[selectedImageIndex].badge}
                    </span>
                    <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {images[selectedImageIndex].location}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400 font-bold">
                    Picture {selectedImageIndex + 1} of {images.length}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans pt-1">
                  {images[selectedImageIndex].caption}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

