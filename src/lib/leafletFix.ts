/**
 * Leaflet Lifecycle and MapPane Pos Resilience Patch
 * 
 * Prevents "Cannot read properties of undefined (reading '_leaflet_pos')" errors
 * caused by Leaflet's DomUtil.getPosition accessing el._leaflet_pos when an element
 * or map._mapPane is undefined during unmounting, resizing, or rapid tab transitions.
 */

import L from "leaflet";

export function applyleafletFix(leafletInstance?: any) {
  const instances = [
    leafletInstance,
    L,
    typeof window !== "undefined" ? (window as any).L : null
  ].filter(Boolean);

  for (const lib of instances) {
    if (!lib) continue;

    // 1. Patch DomUtil.getPosition to return a Point(0, 0) if el is undefined or null
    if (lib.DomUtil && !lib.DomUtil._isSafePatched) {
      const origGetPos = lib.DomUtil.getPosition;
      lib.DomUtil.getPosition = function (el: any) {
        if (!el) {
          return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
        }
        try {
          if (el._leaflet_pos) {
            return el._leaflet_pos;
          }
          if (origGetPos) {
            const res = origGetPos(el);
            if (res) return res;
          }
        } catch {}
        return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
      };
      lib.DomUtil._isSafePatched = true;
    }

    // 2. Patch Map prototype methods that access _mapPane or _container
    if (lib.Map && lib.Map.prototype && !lib.Map.prototype._isSafePatched) {
      const origGetMapPanePos = lib.Map.prototype._getMapPanePos;
      lib.Map.prototype._getMapPanePos = function () {
        if (!this._mapPane) {
          return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
        }
        try {
          if (this._mapPane._leaflet_pos) {
            return this._mapPane._leaflet_pos;
          }
          if (origGetMapPanePos) {
            const res = origGetMapPanePos.call(this);
            if (res) return res;
          }
        } catch {}
        return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
      };

      const origLatLngToContainerPoint = lib.Map.prototype.latLngToContainerPoint;
      lib.Map.prototype.latLngToContainerPoint = function (latlng: any) {
        if (!this._mapPane || !this._container) {
          return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
        }
        try {
          return origLatLngToContainerPoint.call(this, latlng);
        } catch {
          return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
        }
      };

      const origContainerPointToLatLng = lib.Map.prototype.containerPointToLatLng;
      lib.Map.prototype.containerPointToLatLng = function (point: any) {
        if (!this._mapPane || !this._container) {
          return lib.latLng ? lib.latLng(0, 0) : { lat: 0, lng: 0 };
        }
        try {
          return origContainerPointToLatLng.call(this, point);
        } catch {
          return lib.latLng ? lib.latLng(0, 0) : { lat: 0, lng: 0 };
        }
      };

      const origLayerPointToContainerPoint = lib.Map.prototype.layerPointToContainerPoint;
      lib.Map.prototype.layerPointToContainerPoint = function (currentPoint: any) {
        if (!this._mapPane || !this._container) {
          return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
        }
        try {
          return origLayerPointToContainerPoint.call(this, currentPoint);
        } catch {
          return lib.point ? lib.point(0, 0) : { x: 0, y: 0 };
        }
      };

      const origInvalidateSize = lib.Map.prototype.invalidateSize;
      lib.Map.prototype.invalidateSize = function (options: any) {
        if (!this._mapPane || !this._container) {
          return this;
        }
        try {
          return origInvalidateSize.call(this, options);
        } catch {
          return this;
        }
      };

      const origRemove = lib.Map.prototype.remove;
      lib.Map.prototype.remove = function () {
        try {
          if (typeof this.stop === "function") {
            this.stop();
          }
        } catch {}
        try {
          return origRemove.call(this);
        } catch {
          return this;
        }
      };

      lib.Map.prototype._isSafePatched = true;
    }

    // 3. Patch PosAnimation prototype to guard against unmounted elements
    if (lib.PosAnimation && lib.PosAnimation.prototype && !lib.PosAnimation.prototype._isSafePatched) {
      const origRun = lib.PosAnimation.prototype.run;
      lib.PosAnimation.prototype.run = function (el: any, newPos: any, duration: any, easeLinearity: any) {
        if (!el) return;
        try {
          return origRun.call(this, el, newPos, duration, easeLinearity);
        } catch {}
      };
      lib.PosAnimation.prototype._isSafePatched = true;
    }
  }
}

// Auto-run patch on load
applyleafletFix();

if (typeof window !== "undefined") {
  applyleafletFix((window as any).L);
  let count = 0;
  const interval = setInterval(() => {
    count++;
    if ((window as any).L) {
      applyleafletFix((window as any).L);
    }
    if (count > 20) clearInterval(interval);
  }, 100);
}
