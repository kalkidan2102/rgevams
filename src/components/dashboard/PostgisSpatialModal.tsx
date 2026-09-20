import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  Radio,
  Layers,
  MapPin,
  Flame,
  Activity,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Compass,
  Zap,
  Building2,
  RefreshCw
} from "lucide-react";
import { Volcano, Earthquake } from "../../types";

interface PostgisSpatialModalProps {
  isOpen: boolean;
  onClose: () => void;
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
  onSelectCoordinate?: (lat: number, lng: number) => void;
}

export const PostgisSpatialModal: React.FC<PostgisSpatialModalProps> = ({
  isOpen,
  onClose,
  volcanoes,
  earthquakes,
  onSelectCoordinate
}) => {
  const [activeTab, setActiveTab] = useState<"radius" | "hazardZone" | "dbscan" | "geojson">("radius");

  // Proximity query states
  const [selectedVolcanoId, setSelectedVolcanoId] = useState<string>("erta_ale");
  const [customLat, setCustomLat] = useState<number>(13.60);
  const [customLng, setCustomLng] = useState<number>(40.67);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [proximityLoading, setProximityLoading] = useState(false);
  const [proximityResults, setProximityResults] = useState<any[] | null>(null);
  const [proximityError, setProximityError] = useState<string | null>(null);

  // Hazard buffer states
  const [hazardLoading, setHazardLoading] = useState(false);
  const [hazardResults, setHazardResults] = useState<any[] | null>(null);
  const [hazardError, setHazardError] = useState<string | null>(null);

  // DBSCAN cluster states
  const [dbscanLoading, setDbscanLoading] = useState(false);
  const [dbscanResults, setDbscanResults] = useState<any[] | null>(null);
  const [dbscanError, setDbscanError] = useState<string | null>(null);
  const [epsKm, setEpsKm] = useState<number>(25);
  const [minPoints, setMinPoints] = useState<number>(3);

  // GeoJSON state
  const [geoJsonData, setGeoJsonData] = useState<any | null>(null);
  const [geoJsonLoading, setGeoJsonLoading] = useState(false);

  // Run Proximity Query
  const handleRunProximity = async () => {
    setProximityLoading(true);
    setProximityError(null);
    try {
      const res = await fetch(`/api/spatial/earthquakes-radius?lat=${customLat}&lng=${customLng}&radiusKm=${radiusKm}`);
      const data = await res.json();
      if (res.ok && data.earthquakes) {
        setProximityResults(data.earthquakes);
      } else {
        setProximityError(data.error || "Failed to execute spatial proximity search.");
      }
    } catch (e: any) {
      setProximityError(e.message || "Network error");
    } finally {
      setProximityLoading(false);
    }
  };

  // Run Hazard Zone Vulnerability
  const handleRunHazardZone = async () => {
    setHazardLoading(true);
    setHazardError(null);
    try {
      const res = await fetch(`/api/spatial/volcano-hazard-zone/${selectedVolcanoId}`);
      const data = await res.json();
      if (res.ok && data.infrastructureAtRisk) {
        setHazardResults(data.infrastructureAtRisk);
      } else {
        setHazardError(data.error || "Failed to compute hazard zone infrastructure intersections.");
      }
    } catch (e: any) {
      setHazardError(e.message || "Network error");
    } finally {
      setHazardLoading(false);
    }
  };

  // Run DBSCAN Swarm Clustering
  const handleRunDbscan = async () => {
    setDbscanLoading(true);
    setDbscanError(null);
    try {
      const res = await fetch(`/api/spatial/seismic-clusters?epsKm=${epsKm}&minPoints=${minPoints}`);
      const data = await res.json();
      if (res.ok && data.clusters) {
        setDbscanResults(data.clusters);
      } else {
        setDbscanError(data.error || "Failed to identify seismic clusters.");
      }
    } catch (e: any) {
      setDbscanError(e.message || "Network error");
    } finally {
      setDbscanLoading(false);
    }
  };

  // Fetch GeoJSON
  const handleFetchGeoJson = async () => {
    setGeoJsonLoading(true);
    try {
      const res = await fetch("/api/spatial/earthquakes.geojson");
      const data = await res.json();
      setGeoJsonData(data);
    } catch {
      // Handled silently
    } finally {
      setGeoJsonLoading(false);
    }
  };

  // Auto-fill coordinates when selecting a volcano
  const handleVolcanoSelectChange = (id: string) => {
    setSelectedVolcanoId(id);
    const v = volcanoes.find((vol) => vol.id === id);
    if (v) {
      setCustomLat(v.coordinates[0]);
      setCustomLng(v.coordinates[1]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleRunProximity();
      handleRunHazardZone();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#FAF9F5] dark:bg-slate-900 border-2 border-[#0E4A72]/20 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0E4A72] text-white flex items-center justify-between border-b-4 border-[#D48F29] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-[#F7D08A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#D48F29] text-slate-950 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded">
                  PostGIS 3.6 &bull; PostgreSQL
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Spatial Engine Active
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white uppercase">
                PostGIS Geospatial Analysis Engine
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-4 sm:px-6 gap-2 pt-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("radius")}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase transition-all rounded-t-xl cursor-pointer flex items-center gap-1.5 ${
              activeTab === "radius"
                ? "bg-[#FAF9F5] dark:bg-slate-900 text-[#0E4A72] dark:text-[#F7D08A] border-t-2 border-x-2 border-[#0E4A72] dark:border-slate-700"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ST_DWithin Radial Search</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("hazardZone");
              handleRunHazardZone();
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase transition-all rounded-t-xl cursor-pointer flex items-center gap-1.5 ${
              activeTab === "hazardZone"
                ? "bg-[#FAF9F5] dark:bg-slate-900 text-[#0E4A72] dark:text-[#F7D08A] border-t-2 border-x-2 border-[#0E4A72] dark:border-slate-700"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>ST_Buffer Hazard Zones</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("dbscan");
              handleRunDbscan();
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase transition-all rounded-t-xl cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dbscan"
                ? "bg-[#FAF9F5] dark:bg-slate-900 text-[#0E4A72] dark:text-[#F7D08A] border-t-2 border-x-2 border-[#0E4A72] dark:border-slate-700"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span>ST_ClusterDBSCAN Swarms</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("geojson");
              handleFetchGeoJson();
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase transition-all rounded-t-xl cursor-pointer flex items-center gap-1.5 ${
              activeTab === "geojson"
                ? "bg-[#FAF9F5] dark:bg-slate-900 text-[#0E4A72] dark:text-[#F7D08A] border-t-2 border-x-2 border-[#0E4A72] dark:border-slate-700"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>ST_AsGeoJSON Export</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: RADIAL PROXIMITY */}
          {activeTab === "radius" && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-4 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>WGS 84 Ellipsoidal Distance Calculation (`ST_DWithin` &amp; `ST_Distance`)</span>
                </div>
                <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                  PostGIS projects coordinates onto the WGS84 spheroid (`EPSG:4326::geography`) to compute geodesically exact earthquake distances in kilometers.
                </p>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Preset Volcanic Crater
                  </label>
                  <select
                    value={selectedVolcanoId}
                    onChange={(e) => handleVolcanoSelectChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {volcanoes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.region})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Latitude (°N)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customLat}
                    onChange={(e) => setCustomLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Longitude (°E)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customLng}
                    onChange={(e) => setCustomLng(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                      Radius: {radiusKm} km
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                      className="w-full accent-[#0E4A72]"
                    />
                  </div>
                  <button
                    onClick={handleRunProximity}
                    disabled={proximityLoading}
                    className="px-4 py-2 bg-[#0E4A72] text-[#F7D08A] hover:bg-[#0A3452] font-black text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${proximityLoading ? "animate-spin" : ""}`} />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span>
                    Query Results: <strong>{proximityResults?.length || 0}</strong> earthquake(s) within {radiusKm} km
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Spatial Index GiST Applied</span>
                </div>

                {proximityError && (
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold">
                    {proximityError}
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-3">Proximity</th>
                        <th className="p-3">Magnitude</th>
                        <th className="p-3">Location / Place</th>
                        <th className="p-3">Depth</th>
                        <th className="p-3">Occurred At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {proximityResults && proximityResults.length > 0 ? (
                        proximityResults.map((eq, i) => (
                          <tr key={eq.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="p-3 font-mono font-black text-[#0E4A72] dark:text-[#F7D08A]">
                              {eq.distanceKm} km
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded font-mono font-black bg-rose-100 text-rose-800 text-[10px]">
                                M{Number(eq.magnitude).toFixed(1)}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                              {eq.place || eq.title}
                            </td>
                            <td className="p-3 font-mono text-slate-500">{eq.depthKm} km</td>
                            <td className="p-3 font-mono text-slate-400 text-[10px]">
                              {new Date(eq.occurredAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                            No earthquake epicenters found within the {radiusKm} km spatial buffer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HAZARD ZONE BUFFER */}
          {activeTab === "hazardZone" && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-4 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Volcanic Buffer Intersection (`ST_Buffer` &amp; Spatial Join)</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  Computes intersections between active volcanic vent exclusion radii and critical national infrastructures (electrical grids, geothermal fields, transport corridors).
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Select Target Volcano
                  </label>
                  <select
                    value={selectedVolcanoId}
                    onChange={(e) => {
                      setSelectedVolcanoId(e.target.value);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {volcanoes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} &bull; {v.region} (Alert: {v.severity || "Green"})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleRunHazardZone}
                  disabled={hazardLoading}
                  className="mt-4 px-4 py-2 bg-[#D48F29] text-slate-950 font-black text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${hazardLoading ? "animate-spin" : ""}`} />
                  <span>Calculate Risk</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span>
                    Infrastructure At-Risk: <strong>{hazardResults?.length || 0}</strong> facility(ies) inside buffer
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-3">Facility Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Distance From Vent</th>
                        <th className="p-3">Vulnerability Index</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {hazardResults && hazardResults.length > 0 ? (
                        hazardResults.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>{item.infrastructureName}</span>
                            </td>
                            <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{item.infrastructureType}</td>
                            <td className="p-3 font-mono font-bold text-rose-600">{item.distanceKm} km</td>
                            <td className="p-3 font-mono font-bold text-amber-600">
                              {(Number(item.vulnerabilityIndex) * 100).toFixed(0)}% Risk
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[9px] bg-emerald-100 text-emerald-800">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                            No critical facilities detected inside the designated exclusion radius.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DBSCAN CLUSTERS */}
          {activeTab === "dbscan" && (
            <div className="space-y-4">
              <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 p-4 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <span>PostGIS Spatial Swarm Detection (`ST_ClusterDBSCAN`)</span>
                </div>
                <p className="text-cyan-800 dark:text-cyan-300 text-[11px] leading-relaxed">
                  Identifies localized magma dyke intrusion swarms across the Afar depression and Main Ethiopian Rift by clustering spatial point coordinates within epsilon search distances.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Epsilon Distance: {epsKm} km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={epsKm}
                    onChange={(e) => setEpsKm(parseInt(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>
                <div className="w-36">
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                    Min Events (k)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={minPoints}
                    onChange={(e) => setMinPoints(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <button
                  onClick={handleRunDbscan}
                  disabled={dbscanLoading}
                  className="mt-4 px-4 py-2 bg-cyan-700 text-white font-black text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbscanLoading ? "animate-spin" : ""}`} />
                  <span>Identify Swarms</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-600 dark:text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-3">Cluster ID</th>
                      <th className="p-3">Magnitude</th>
                      <th className="p-3">Epicenter Place</th>
                      <th className="p-3">Coordinates</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {dbscanResults && dbscanResults.length > 0 ? (
                      dbscanResults.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-3">
                            {c.cluster_id !== null ? (
                              <span className="px-2 py-0.5 rounded font-mono font-black text-[9.5px] bg-cyan-100 text-cyan-800 border border-cyan-300">
                                SWARM #{c.cluster_id + 1}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded font-mono text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800">
                                Isolated Noise
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-600">
                            M{Number(c.magnitude).toFixed(1)}
                          </td>
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{c.place || c.title}</td>
                          <td className="p-3 font-mono text-slate-400 text-[10px]">
                            {Number(c.latitude).toFixed(2)}°N, {Number(c.longitude).toFixed(2)}°E
                          </td>
                          <td className="p-3 font-mono text-slate-400 text-[10px]">
                            {new Date(c.occurredAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                          No DBSCAN clusters found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: GEOJSON */}
          {activeTab === "geojson" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                  Direct GeoJSON export generated server-side using PostGIS `ST_AsGeoJSON()`:
                </p>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], {
                      type: "application/geo+json"
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "postgis_earthquakes.geojson";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!geoJsonData}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .geojson File</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-72 border border-slate-800">
                {geoJsonLoading
                  ? "Generating PostGIS GeoJSON from Cloud SQL..."
                  : JSON.stringify(geoJsonData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Spatial SRID: EPSG:4326 (WGS84 Geodetic)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
