import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../lib/LeafletFix.ts";
import {
  InSARRasterMap,
  VolcanoTarget,
  InSARFilterMode,
  InSARViewLayer,
  InSARColormap
} from "../types/insar";

export interface DisplacementMapProps {
  rasterMap: InSARRasterMap;
  volcano: VolcanoTarget;
  selectedLat: number;
  selectedLon: number;
  filterMode: InSARFilterMode;
  viewLayer: InSARViewLayer;
  colormap?: InSARColormap;
  coherenceThreshold: number;
  showPixelGrid?: boolean;
  onPointSelect: (coords: { lat: number; lon: number }) => void;
  onOpenTransectModal?: () => void;
  onSetCustomRef?: (coords: { lat: number; lon: number }) => void;
  basemapStyle?: "relief" | "satellite" | "topo";
  rasterOpacity?: number;
  customRefCoords?: { lat: number; lon: number } | null;
  activeDateStr?: string | null;
}

// Exact COMET Volcano Portal 32-bit ABGR color lookup calculation
function get32BitColor(
  val: number,
  minVal: number,
  maxVal: number,
  colormap: InSARColormap = "comet_jet",
  alpha: number = 220
): number {
  const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal || 1)));

  let r = 0;
  let g = 0;
  let b = 0;

  if (colormap === "spectral") {
    const fringeCycle = 28; // mm
    const phaseNorm = (((val % fringeCycle) + fringeCycle) % fringeCycle) / fringeCycle;
    const t = phaseNorm;
    r = Math.floor(128 + 127 * Math.cos(2 * Math.PI * t));
    g = Math.floor(128 + 127 * Math.cos(2 * Math.PI * t - (2 * Math.PI) / 3));
    b = Math.floor(128 + 127 * Math.cos(2 * Math.PI * t - (4 * Math.PI) / 3));
  } else if (colormap === "turbo") {
    r = Math.min(255, Math.max(0, Math.floor(34.61 + norm * (1172.33 - norm * (10793.56 - norm * (33300.12 - norm * (38394.49 - norm * 14825.05)))))));
    g = Math.min(255, Math.max(0, Math.floor(23.31 + norm * (557.33 + norm * (1225.33 - norm * (3574.96 - norm * (1073.77 - norm * 707.56)))))));
    b = Math.min(255, Math.max(0, Math.floor(27.2 + norm * (3211.1 - norm * (15327.97 - norm * (27814.0 - norm * (22569.18 - norm * 6838.66)))))));
  } else if (colormap === "diverging") {
    if (norm < 0.5) {
      const t = norm / 0.5;
      r = Math.floor(30 + t * 215);
      g = Math.floor(60 + t * 185);
      b = Math.floor(190 + t * 55);
    } else {
      const t = (norm - 0.5) / 0.5;
      r = Math.floor(245 - t * 30);
      g = Math.floor(245 - t * 205);
      b = Math.floor(245 - t * 215);
    }
  } else {
    // EXACT COMET VOLCANO PORTAL PALETTE (Deep Blue -> Cyan -> Pale Mint -> Golden Ochre -> Dark Brown)
    if (norm < 0.25) {
      const t = norm / 0.25;
      r = Math.floor(26 + t * 52);
      g = Math.floor(54 + t * 114);
      b = Math.floor(128 + t * 94);
    } else if (norm < 0.50) {
      const t = (norm - 0.25) / 0.25;
      r = Math.floor(78 + t * 141);
      g = Math.floor(168 + t * 60);
      b = Math.floor(222 - t * 2);
    } else if (norm < 0.75) {
      const t = (norm - 0.50) / 0.25;
      r = Math.floor(219 - t * 17);
      g = Math.floor(228 - t * 90);
      b = Math.floor(220 - t * 216);
    } else {
      const t = (norm - 0.75) / 0.25;
      r = Math.floor(202 - t * 110);
      g = Math.floor(138 - t * 109);
      b = Math.floor(4 + t * 2);
    }
  }

  // 32-bit ABGR packing for Little-Endian Uint32Array (Alpha = 220 for crystal-clear blending over optical satellite)
  const aClamped = Math.max(0, Math.min(255, Math.round(alpha)));
  return (((aClamped << 24) | (b << 16) | (g << 8) | r) >>> 0);
}

export const DisplacementMap: React.FC<DisplacementMapProps> = ({
  rasterMap,
  volcano,
  selectedLat,
  selectedLon,
  filterMode: _filterMode,
  viewLayer,
  colormap = "comet_jet",
  coherenceThreshold,
  showPixelGrid = false,
  onPointSelect,
  onOpenTransectModal,
  onSetCustomRef,
  customRefCoords = null,
  activeDateStr,
  basemapStyle = "satellite",
  rasterOpacity = 0.65
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Keep references to frequently updated callbacks & state to decouple Leaflet map lifecycle
  const onPointSelectRef = useRef(onPointSelect);
  useEffect(() => {
    onPointSelectRef.current = onPointSelect;
  }, [onPointSelect]);

  const rasterMapRef = useRef(rasterMap);
  useEffect(() => {
    rasterMapRef.current = rasterMap;
  }, [rasterMap]);

  const volcanoRef = useRef(volcano);
  useEffect(() => {
    volcanoRef.current = volcano;
  }, [volcano]);

  // High-performance offscreen raster canvas cache
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Hover state for interactive pixel inspector
  const [hoverInfo, setHoverInfo] = useState<{
    col: number;
    row: number;
    lat: number;
    lon: number;
    disp: number | null;
    vel: number | null;
    coh: number;
    dem: number;
  } | null>(null);

  // 1. PRE-BAKE OFFSCREEN RASTER IMAGE BUFFER
  const bakeOffscreenRaster = useCallback(() => {
    const currentRaster = rasterMapRef.current;
    if (!currentRaster) return;

    const {
      width,
      height,
      values,
      velocityValues,
      coherenceValues,
      demValues,
      dispMin,
      dispMax,
      velMin,
      velMax
    } = currentRaster;

    let offCanvas = offscreenCanvasRef.current;
    if (!offCanvas) {
      offCanvas = document.createElement("canvas");
      offscreenCanvasRef.current = offCanvas;
    }

    offCanvas.width = width;
    offCanvas.height = height;

    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    const imgData = offCtx.createImageData(width, height);
    const buf32 = new Uint32Array(imgData.data.buffer);

    let minV = dispMin;
    let maxV = dispMax;
    if (viewLayer === "velocity") {
      minV = velMin;
      maxV = velMax;
    } else if (viewLayer === "coherence") {
      minV = 0.0;
      maxV = 1.0;
    } else if (viewLayer === "dem") {
      minV = 500;
      maxV = 3000;
    } else if (viewLayer === "wrapped_fringes") {
      minV = -14.0;
      maxV = 14.0;
    }

    const totalCells = width * height;
    for (let i = 0; i < totalCells; i++) {
      const coh = coherenceValues ? coherenceValues[i] : 0.8;

      if (coh < coherenceThreshold) {
        buf32[i] = 0; // transparent
        continue;
      }

      let val: number | null = null;
      if (viewLayer === "velocity") {
        val = velocityValues ? velocityValues[i] : null;
      } else if (viewLayer === "cumulative") {
        val = values[i];
      } else if (viewLayer === "coherence") {
        val = coh;
      } else if (viewLayer === "wrapped_fringes") {
        const rawDisp = values[i];
        val = rawDisp !== null ? (((rawDisp % 28) + 42) % 28) - 14 : null;
      } else {
        val = demValues ? demValues[i] : 1500;
      }

      if (val === null || val === undefined) {
        buf32[i] = 0;
        continue;
      }

      buf32[i] = get32BitColor(val, minV, maxV, colormap);
    }

    offCtx.putImageData(imgData, 0, 0);
  }, [viewLayer, colormap, coherenceThreshold]);

  // 2. HARDWARE-ACCELERATED RENDER TO SCREEN CANVAS
  const renderScreenCanvas = useCallback(() => {
    const map = leafletMapRef.current;
    const canvas = canvasRef.current;
    const offCanvas = offscreenCanvasRef.current;
    const currentRaster = rasterMapRef.current;

    // Strict Leaflet map viability checks to prevent '_leaflet_pos' on detached elements
    if (!map || !(map as any)._mapPane || !(map as any)._container || !canvas || !offCanvas || !currentRaster) {
      return;
    }

    try {
      const containerSize = map.getSize();
      if (!containerSize || containerSize.x <= 0 || containerSize.y <= 0) return;

      const dpr = window.devicePixelRatio || 1;

      if (
        canvas.width !== containerSize.x * dpr ||
        canvas.height !== containerSize.y * dpr
      ) {
        canvas.width = containerSize.x * dpr;
        canvas.height = containerSize.y * dpr;
        canvas.style.width = `${containerSize.x}px`;
        canvas.style.height = `${containerSize.y}px`;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false; // Crisp pixelated COMET blocks
      ctx.clearRect(0, 0, containerSize.x, containerSize.y);

      const b = currentRaster.bounds;
      const pNW = map.latLngToContainerPoint([b.north, b.west]);
      const pSE = map.latLngToContainerPoint([b.south, b.east]);

      const destX = Math.round(pNW.x);
      const destY = Math.round(pNW.y);
      const destW = Math.round(pSE.x - pNW.x);
      const destH = Math.round(pSE.y - pNW.y);

      if (destW > 0 && destH > 0) {
        ctx.drawImage(offCanvas, destX, destY, destW, destH);

        // Optional pixel grid outlines
        if (showPixelGrid && destW > 40 && destH > 40) {
          const cellW = destW / currentRaster.width;
          const cellH = destH / currentRaster.height;

          if (cellW >= 3.0 && cellH >= 3.0) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
            ctx.lineWidth = 0.5;

            for (let c = 0; c <= currentRaster.width; c++) {
              const lx = Math.round(destX + c * cellW) - 0.5;
              ctx.moveTo(lx, destY);
              ctx.lineTo(lx, destY + destH);
            }

            for (let r = 0; r <= currentRaster.height; r++) {
              const ly = Math.round(destY + r * cellH) - 0.5;
              ctx.moveTo(destX, ly);
              ctx.lineTo(destX + destW, ly);
            }
            ctx.stroke();
          }
        }

        // COMET Top/Right crosshair reference marks (km grid ticks)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 0.6;
        ctx.setLineDash([2, 2]);

        const midX = destX + destW * 0.5;
        const midY = destY + destH * 0.5;

        // Center vertical cross line (0 km)
        ctx.beginPath();
        ctx.moveTo(midX, destY);
        ctx.lineTo(midX, destY + destH * 0.3);
        ctx.stroke();

        // Center horizontal cross line (0 km)
        ctx.beginPath();
        ctx.moveTo(destX + destW * 0.7, midY);
        ctx.lineTo(destX + destW, midY);
        ctx.stroke();

        ctx.setLineDash([]);
      }

      ctx.restore();
    } catch {
      // Catch any transient Leaflet coordinate transform during teardown
    }
  }, [showPixelGrid]);

  // 3. OVERLAY CANVAS FOR TARGET POINT, REFERENCE POINT, AND HOVER RETICLE
  const renderOverlayCanvas = useCallback(() => {
    if (!isMountedRef.current) return;
    const map = leafletMapRef.current;
    const overlay = overlayCanvasRef.current;
    const currentRaster = rasterMapRef.current;

    if (!map || !(map as any)._mapPane || !(map as any)._container || !overlay) {
      return;
    }

    try {
      const containerSize = map.getSize();
      if (!containerSize || containerSize.x <= 0 || containerSize.y <= 0) return;

      const dpr = window.devicePixelRatio || 1;

      if (
        overlay.width !== containerSize.x * dpr ||
        overlay.height !== containerSize.y * dpr
      ) {
        overlay.width = containerSize.x * dpr;
        overlay.height = containerSize.y * dpr;
        overlay.style.width = `${containerSize.x}px`;
        overlay.style.height = `${containerSize.y}px`;
      }

      const ctx = overlay.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, containerSize.x, containerSize.y);

      // A. Reference Marker (Red Dot) - matching COMET LiCSBAS style
      const currentVolcano = volcanoRef.current;
      const refLat = customRefCoords ? customRefCoords.lat : currentVolcano.referencePoint.latitude;
      const refLon = customRefCoords ? customRefCoords.lon : currentVolcano.referencePoint.longitude;

      if (typeof refLat === "number" && typeof refLon === "number") {
        const refPt = map.latLngToContainerPoint([refLat, refLon]);
        if (refPt && isFinite(refPt.x) && isFinite(refPt.y)) {
          // Drop shadow for contrast
          ctx.beginPath();
          ctx.arc(refPt.x, refPt.y, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fill();

          // Red outer circle
          ctx.beginPath();
          ctx.arc(refPt.x, refPt.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#FF0033";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#FFFFFF";
          ctx.stroke();

          // White center core
          ctx.beginPath();
          ctx.arc(refPt.x, refPt.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
        }
      }

      // B. Target Marker (Green Dot) - matching COMET LiCSBAS style
      if (typeof selectedLat === "number" && typeof selectedLon === "number") {
        const tgtPt = map.latLngToContainerPoint([selectedLat, selectedLon]);
        if (tgtPt && isFinite(tgtPt.x) && isFinite(tgtPt.y)) {
          // Drop shadow for contrast
          ctx.beginPath();
          ctx.arc(tgtPt.x, tgtPt.y, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fill();

          // Bright green outer circle
          ctx.beginPath();
          ctx.arc(tgtPt.x, tgtPt.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#00FF00";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#FFFFFF";
          ctx.stroke();

          // Dark center core
          ctx.beginPath();
          ctx.arc(tgtPt.x, tgtPt.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "#005500";
          ctx.fill();
        }
      }

      // C. Hover Reticle / Inspector Box
      if (currentRaster && hoverInfo && hoverInfo.col !== undefined && hoverInfo.row !== undefined) {
        const b = currentRaster.bounds;
        const dLat = (b.north - b.south) / currentRaster.height;
        const dLon = (b.east - b.west) / currentRaster.width;

        const cellNorth = b.north - hoverInfo.row * dLat;
        const cellSouth = b.north - (hoverInfo.row + 1) * dLat;
        const cellWest = b.west + hoverInfo.col * dLon;
        const cellEast = b.west + (hoverInfo.col + 1) * dLon;

        const pNW = map.latLngToContainerPoint([cellNorth, cellWest]);
        const pSE = map.latLngToContainerPoint([cellSouth, cellEast]);

        const cellX = Math.floor(pNW.x);
        const cellY = Math.floor(pNW.y);
        const cellW = Math.max(2, Math.ceil(pSE.x - pNW.x));
        const cellH = Math.max(2, Math.ceil(pSE.y - pNW.y));

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cellX - 0.5, cellY - 0.5, cellW + 1, cellH + 1);

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.0;
        ctx.strokeRect(cellX - 1.5, cellY - 1.5, cellW + 3, cellH + 3);
      }

      ctx.restore();
    } catch {
      // Ignore during unmount or rapid bounds shift
    }
  }, [hoverInfo, selectedLat, selectedLon, customRefCoords]);

  const scheduleScreenRender = useCallback(() => {
    if (!isMountedRef.current) return;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      const map = leafletMapRef.current;
      if (!map || !(map as any)._mapPane || !(map as any)._container) return;
      renderScreenCanvas();
      renderOverlayCanvas();
    });
  }, [renderScreenCanvas, renderOverlayCanvas]);

  // When raster or layers change, re-bake and repaint without touching the Leaflet map instance
  useEffect(() => {
    bakeOffscreenRaster();
    scheduleScreenRender();
  }, [rasterMap, bakeOffscreenRaster, scheduleScreenRender]);

  useEffect(() => {
    renderOverlayCanvas();
  }, [renderOverlayCanvas]);

    // Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    isMountedRef.current = true;
    const container = mapContainerRef.current;
    if (!container) return;

    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.stop();
        leafletMapRef.current.remove();
      } catch {}
      leafletMapRef.current = null;
    }

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const currentVolcano = volcanoRef.current;
    const centerLat = (currentVolcano.bounds.north + currentVolcano.bounds.south) / 2;
    const centerLon = (currentVolcano.bounds.east + currentVolcano.bounds.west) / 2;

    const map = L.map(container, {
      center: [centerLat, centerLon],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // High-Resolution Esri World Imagery / Topo with resilient fallback chain and zero CORS issues
    const getTileUrl = (style: string) => {
      if (style === "topo" || style === "relief") {
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
      }
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    };

    const tileLayer = L.tileLayer(getTileUrl(basemapStyle), {
      maxZoom: 19,
      attribution: basemapStyle === "topo" || basemapStyle === "relief" ? "Esri World Topo" : "Esri World Imagery",
      referrerPolicy: "no-referrer-when-downgrade"
    }).addTo(map);

    tileLayer.on("tileerror", (error: any) => {
      const tile = error.tile;
      if (!tile) return;
      const attempt = parseInt(tile.dataset.attempt || "0", 10);
      tile.dataset.attempt = String(attempt + 1);

      if (attempt === 0) {
        const src = tile.src || "";
        if (src.includes("server.arcgisonline.com")) {
          tile.src = src.replace("server.arcgisonline.com", "services.arcgisonline.com");
          return;
        }
      } else if (attempt === 1) {
        // Fallback to USGS National Map Satellite Imagery
        tile.src = `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${error.coords.z}/${error.coords.y}/${error.coords.x}`;
        return;
      } else if (attempt === 2) {
        // Fallback to OpenStreetMap Carto
        tile.src = `https://tile.openstreetmap.org/${error.coords.z}/${error.coords.x}/${error.coords.y}.png`;
        return;
      }
    });

    baseTileLayerRef.current = tileLayer;

    map.whenReady(() => {
      if (!isMountedRef.current) return;
      try {
        const b = currentVolcano.bounds;
        const leafletBounds = L.latLngBounds([b.south, b.west], [b.north, b.east]);
        map.fitBounds(leafletBounds, { animate: false, padding: [10, 10] });
        map.invalidateSize({ animate: false });
        bakeOffscreenRaster();
        scheduleScreenRender();
      } catch {}
    });

    map.on("move", scheduleScreenRender);
    map.on("zoom", scheduleScreenRender);
    map.on("viewreset", scheduleScreenRender);
    map.on("resize", scheduleScreenRender);

    // Direct click selection without floating mode button clutter
    map.on("click", (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      onPointSelectRef.current?.({ lat, lon });
    });

    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      const currentRaster = rasterMapRef.current;
      if (!currentRaster) return;
      const b = currentRaster.bounds;
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      if (lat < b.south || lat > b.north || lon < b.west || lon > b.east) {
        setHoverInfo(null);
        return;
      }

      const dLat = (b.north - b.south) / currentRaster.height;
      const dLon = (b.east - b.west) / currentRaster.width;

      const col = Math.floor((lon - b.west) / dLon);
      const row = Math.floor((b.north - lat) / dLat);

      if (
        col >= 0 &&
        col < currentRaster.width &&
        row >= 0 &&
        row < currentRaster.height
      ) {
        const idx = row * currentRaster.width + col;
        const disp = currentRaster.values[idx];
        const vel = currentRaster.velocityValues ? currentRaster.velocityValues[idx] : null;
        const coh = currentRaster.coherenceValues ? currentRaster.coherenceValues[idx] : 0.8;
        const dem = currentRaster.demValues ? currentRaster.demValues[idx] : 1500;

        const pixelCenterLat = b.north - (row + 0.5) * dLat;
        const pixelCenterLon = b.west + (col + 0.5) * dLon;

        setHoverInfo({
          col,
          row,
          lat: parseFloat(pixelCenterLat.toFixed(4)),
          lon: parseFloat(pixelCenterLon.toFixed(4)),
          disp,
          vel,
          coh,
          dem
        });
      } else {
        setHoverInfo(null);
      }
    });

    map.on("mouseout", () => {
      setHoverInfo(null);
    });

    leafletMapRef.current = map;

    // Attach ResizeObserver to container to eliminate 0x0 size bugs in VS Code / iframe
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (isMountedRef.current && leafletMapRef.current && (leafletMapRef.current as any)._mapPane) {
          try {
            leafletMapRef.current.invalidateSize({ animate: false });
            scheduleScreenRender();
          } catch {}
        }
      });
      ro.observe(container);
    }

    // Schedule incremental size invalidation to handle DOM layout settlement
    const t1 = setTimeout(() => {
      if (isMountedRef.current && leafletMapRef.current && (leafletMapRef.current as any)._mapPane) {
        try {
          leafletMapRef.current.invalidateSize({ animate: false });
          scheduleScreenRender();
        } catch {}
      }
    }, 60);

    const t2 = setTimeout(() => {
      if (isMountedRef.current && leafletMapRef.current && (leafletMapRef.current as any)._mapPane) {
        try {
          leafletMapRef.current.invalidateSize({ animate: false });
          scheduleScreenRender();
        } catch {}
      }
    }, 250);

    const t3 = setTimeout(() => {
      if (isMountedRef.current && leafletMapRef.current && (leafletMapRef.current as any)._mapPane) {
        try {
          leafletMapRef.current.invalidateSize({ animate: false });
          scheduleScreenRender();
        } catch {}
      }
    }, 600);

    return () => {
      isMountedRef.current = false;
      if (ro) ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.stop();
          leafletMapRef.current.remove();
        } catch {}
        leafletMapRef.current = null;
      }
    };
  }, [scheduleScreenRender]);

  // Update bounds when volcano changes (without recreating map)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !(map as any)._mapPane || !(map as any)._container) return;
    if (!volcano || !volcano.bounds) return;

    try {
      const b = volcano.bounds;
      const leafletBounds = L.latLngBounds([b.south, b.west], [b.north, b.east]);
      map.fitBounds(leafletBounds, { animate: false, padding: [10, 10] });
      const timer = setTimeout(() => {
        if (isMountedRef.current && leafletMapRef.current && (leafletMapRef.current as any)._mapPane) {
          try {
            leafletMapRef.current.invalidateSize({ animate: false });
            scheduleScreenRender();
          } catch {}
        }
      }, 100);
      return () => clearTimeout(timer);
    } catch {}
  }, [volcano?.id, volcano?.bounds?.north, volcano?.bounds?.south, volcano?.bounds?.east, volcano?.bounds?.west, scheduleScreenRender]);

  // Live update basemap tile layer when style changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !(map as any)._mapPane) return;

    if (baseTileLayerRef.current) {
      try {
        map.removeLayer(baseTileLayerRef.current);
      } catch {}
      baseTileLayerRef.current = null;
    }

    const getTileUrl = (style: string) => {
      if (style === "topo" || style === "relief") {
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
      }
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    };

    const newLayer = L.tileLayer(getTileUrl(basemapStyle), {
      maxZoom: 19,
      attribution: basemapStyle === "topo" || basemapStyle === "relief" ? "Esri World Topo" : "Esri World Imagery",
      referrerPolicy: "no-referrer-when-downgrade"
    }).addTo(map);

    newLayer.on("tileerror", (error: any) => {
      const tile = error.tile;
      if (!tile) return;
      const attempt = parseInt(tile.dataset.attempt || "0", 10);
      tile.dataset.attempt = String(attempt + 1);

      if (attempt === 0) {
        const src = tile.src || "";
        if (src.includes("server.arcgisonline.com")) {
          tile.src = src.replace("server.arcgisonline.com", "services.arcgisonline.com");
          return;
        }
      } else if (attempt === 1) {
        tile.src = `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${error.coords.z}/${error.coords.y}/${error.coords.x}`;
        return;
      } else if (attempt === 2) {
        tile.src = `https://tile.openstreetmap.org/${error.coords.z}/${error.coords.x}/${error.coords.y}.png`;
        return;
      }
    });

    baseTileLayerRef.current = newLayer;
  }, [basemapStyle]);

  // Dynamic latitude and longitude ticks calculated from volcano bounds
  const latTicks = useMemo(() => {
    if (!volcano?.bounds) return [13.6, 13.4, 13.2, 13.0, 12.8];
    const { north, south } = volcano.bounds;
    const step = (north - south) / 4;
    return [north, north - step, north - 2 * step, north - 3 * step, south];
  }, [volcano?.bounds]);

  const lonTicks = useMemo(() => {
    if (!volcano?.bounds) return [40.4, 40.6, 40.8, 41.0, 41.2];
    const { east, west } = volcano.bounds;
    const step = (east - west) / 4;
    return [west, west + step, west + 2 * step, west + 3 * step, east];
  }, [volcano?.bounds]);

  // Dynamic km distance scales for top and right axis
  const kmWidthTicks = useMemo(() => {
    if (!volcano?.bounds) return [-20, -10, 0, 10, 20];
    const { east, west, north, south } = volcano.bounds;
    const midLat = (north + south) / 2;
    const kmTotal = (east - west) * 111.32 * Math.cos((midLat * Math.PI) / 180);
    const half = Math.round(kmTotal / 2);
    const q = Math.round(half / 2);
    return [-half, -q, 0, q, half];
  }, [volcano?.bounds]);

  const kmHeightTicks = useMemo(() => {
    if (!volcano?.bounds) return [20, 10, 0, -10, -20];
    const { north, south } = volcano.bounds;
    const kmTotal = (north - south) * 111.32;
    const half = Math.round(kmTotal / 2);
    const q = Math.round(half / 2);
    return [half, q, 0, -q, -half];
  }, [volcano?.bounds]);

  // Orbit parameters for radar geometry badge
  const isAscending = rasterMap?.orbitDirection === "Ascending";
  const activeTrack = (volcano?.tracks || []).find(t => t.frameId === rasterMap?.frameId) || (volcano?.tracks || [])[0];
  const heading = activeTrack?.headingDeg ?? (isAscending ? 349.1 : 191.8);
  const lookAngle = activeTrack?.lookAngleDeg ?? activeTrack?.incidenceAngleDeg ?? (isAscending ? 39.0 : 42.1);

  return (
    <div className="relative w-full h-full flex flex-col font-sans select-none bg-white">
      
      {/* 1. TOP KM SCALE BAR (Exact COMET layout) */}
      <div className="flex flex-col items-center justify-center pb-1 text-[#444444] text-[13px]">
        <span className="font-normal text-[13px] mb-0.5">km</span>
        <div className="w-full flex justify-between px-10 text-[12px] font-normal text-[#555555]">
          {kmWidthTicks.map((km, i) => (
            <div key={i} className="flex flex-col items-center">
              <span>{km}</span>
              <span className="h-1.5 w-px bg-[#777777] mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. MAIN MAP FRAME WITH AXES */}
      <div className="relative flex-1 w-full flex items-stretch">
        
        {/* LEFT Y-AXIS: LATITUDE */}
        <div className="w-10 flex flex-col justify-between items-end pr-1.5 py-2 text-[12.5px] text-[#444444] font-normal">
          {latTicks.map((lat, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span>{lat.toFixed(1)}</span>
              <span className="w-1.5 h-px bg-[#777777]" />
            </div>
          ))}
        </div>

        {/* ROTATED 'latitude' LABEL */}
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-[13.5px] font-normal text-[#333333]">
          latitude
        </div>

        {/* MAP CONTAINER */}
        <div className="relative flex-1 h-full min-h-[380px] border border-[#CCCCCC] bg-[#1a2321] overflow-hidden">
          
          {/* LEAFLET SATELLITE BASEMAP (z-0) with resilient volcanic optical fallback backdrop */}
          <div 
            ref={mapContainerRef} 
            className="absolute inset-0 w-full h-full z-0" 
            style={{
              backgroundColor: "#1c2623",
              backgroundImage: "radial-gradient(ellipse at center, #2b3935 0%, #151d1a 100%)"
            }}
          />
          
          {/* INSAR DEFORMATION RASTER CANVAS (z-10, semi-transparent over optical satellite) */}
          <canvas
            ref={canvasRef}
            style={{ opacity: rasterOpacity }}
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-200"
          />
          
          {/* HOVER / RETICLE OVERLAY CANVAS (z-20) */}
          <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none z-20" />

          {/* ACTIVE DATE / EPOCH BADGE (Top-Left of Map - only if timeline scrubber is active) */}
          {activeDateStr && (
            <div className="absolute top-2 left-2 z-30 bg-slate-900/90 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded shadow text-[10.5px] font-mono flex items-center gap-1.5 animate-fade-in w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Epoch: <strong>{activeDateStr}</strong></span>
            </div>
          )}

          {/* EXACT COMET RADAR LOOK GEOMETRY BADGE (Top-Right of Map, z-30) */}
          <div className="absolute top-2 right-2 z-30 bg-white/95 backdrop-blur-xs border border-[#CCCCCC] px-2.5 py-1.5 rounded shadow-xs text-[11px] text-[#333333] flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-bold text-[#111111]">
                Track {rasterMap.trackNumber} ({rasterMap.orbitDirection})
              </span>
              <span className="text-[10px] text-[#666666]">
                Heading {heading.toFixed(1)}° | Look {lookAngle.toFixed(1)}° {isAscending ? "E" : "W"}
              </span>
            </div>

            {/* Radar geometry arrows */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 font-mono">FLIGHT</span>
                <span className={`text-sm font-bold ${isAscending ? "text-blue-600" : "text-orange-600"}`}>
                  {isAscending ? "↑" : "↓"}
                </span>
              </div>
              <div className="flex flex-col items-center ml-1">
                <span className="text-[9px] text-slate-500 font-mono">LOOK</span>
                <span className="text-sm font-bold text-slate-700">
                  {isAscending ? "→" : "←"}
                </span>
              </div>
            </div>
          </div>

          {/* HOVER PIXEL READOUT OVERLAY (Bottom-Left of Map, z-30) */}
          {hoverInfo && (
            <div className="absolute bottom-2 left-2 z-30 bg-white/95 border border-[#CCCCCC] px-2.5 py-1 rounded shadow-xs text-[11px] text-[#222222] font-mono flex items-center gap-2">
              <span>lat: {hoverInfo.lat.toFixed(3)}, lon: {hoverInfo.lon.toFixed(3)}</span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-700 font-semibold">
                disp: {hoverInfo.disp !== null ? `${hoverInfo.disp > 0 ? "+" : ""}${hoverInfo.disp.toFixed(1)} mm` : "NaN"}
              </span>
              {hoverInfo.vel !== null && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-emerald-700">
                    vel: {hoverInfo.vel > 0 ? "+" : ""}${hoverInfo.vel.toFixed(1)} mm/yr
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT Y-AXIS: KM */}
        <div className="w-12 flex flex-col justify-between items-start pl-1.5 py-2 text-[12px] text-[#555555]">
          {kmHeightTicks.map((km, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="w-1.5 h-px bg-[#777777]" />
              <span>{km}</span>
            </div>
          ))}
        </div>

        {/* ROTATED RIGHT 'km' LABEL */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 rotate-90 text-[13px] font-normal text-[#444444]">
          km
        </div>

      </div>

      {/* 3. BOTTOM X-AXIS: LONGITUDE TICKS & LABEL */}
      <div className="flex flex-col items-center justify-center pt-1 pl-10 pr-12 text-[#444444]">
        <div className="w-full flex justify-between text-[12.5px] font-normal text-[#444444]">
          {lonTicks.map((lon, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="h-1.5 w-px bg-[#777777] mb-0.5" />
              <span>{lon.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <span className="font-normal text-[13.5px] text-[#333333] mt-1">longitude</span>
      </div>

    </div>
  );
};

export default DisplacementMap;
