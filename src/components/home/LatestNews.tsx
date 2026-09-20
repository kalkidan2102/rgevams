import { useState, useEffect } from "react";
import { Calendar, ArrowRight, Search, Plus, Newspaper, Send, X, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { LATEST_NEWS, NewsItem } from "../../data/news";
import { SectionTitle } from "../ui/SectionTitle";
import { motion, AnimatePresence } from "motion/react";
import { NewsDetailModal } from "../Modals/NewsModal";

interface LatestNewsProps {
  onSelectNews?: (news: NewsItem) => void;
}

export function LatestNews({ onSelectNews }: LatestNewsProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(LATEST_NEWS);
  const [selectedNewsInternal, setSelectedNewsInternal] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Publish & Authorization Gate State
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authGateError, setAuthGateError] = useState("");

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState("");
  const [newDispatch, setNewDispatch] = useState({
    title: "",
    excerpt: "",
    fullText: "",
    category: "Volcanology",
    tag: "Official Advisory",
    author: "ESSGI Directorate of Volcanology",
    location: "Afar Regional State / Main Ethiopian Rift",
    keyFindingsText: "",
    recommendationsText: ""
  });

  const handleOpenPublish = () => {
    if (isAuthorized) {
      setShowPublishModal(true);
    } else {
      setPasscode("");
      setAuthGateError("");
      setShowAuthGate(true);
    }
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "SSGI-ADMIN-2026" || passcode.trim() === "1234" || passcode.trim() === "admin") {
      setIsAuthorized(true);
      setShowAuthGate(false);
      setShowPublishModal(true);
    } else {
      setAuthGateError("Invalid Authorization Code. Enter SSGI-ADMIN-2026 or contact your Director.");
    }
  };

  // Fetch news dynamically from API
  const fetchNewsFromBackend = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          setNewsItems(data.news);
        }
      }
    } catch {
      // Fallback to local dataset silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsFromBackend();
  }, []);

  const handleNewsClick = (item: NewsItem) => {
    if (onSelectNews) {
      onSelectNews(item);
    } else {
      setSelectedNewsInternal(item);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDispatch.title || !newDispatch.excerpt || !newDispatch.fullText) return;

    try {
      setPublishing(true);
      const findings = newDispatch.keyFindingsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const recs = newDispatch.recommendationsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": "ESSGI Officer",
          "x-user-role": "admin"
        },
        body: JSON.stringify({
          title: newDispatch.title,
          excerpt: newDispatch.excerpt,
          fullText: newDispatch.fullText,
          category: newDispatch.category,
          tag: newDispatch.tag,
          author: newDispatch.author,
          location: newDispatch.location,
          keyFindings: findings.length ? findings : ["Telemetry data verified by ESSGI arrays"],
          recommendations: recs.length ? recs : ["Maintain regular monitoring protocols"]
        })
      });

      if (res.ok) {
        setPublishSuccess("Bulletin Dispatch published successfully!");
        fetchNewsFromBackend();
        setTimeout(() => {
          setShowPublishModal(false);
          setPublishSuccess("");
          setNewDispatch({
            title: "",
            excerpt: "",
            fullText: "",
            category: "Volcanology",
            tag: "Official Advisory",
            author: "ESSGI Directorate of Volcanology",
            location: "Afar Regional State / Main Ethiopian Rift",
            keyFindingsText: "",
            recommendationsText: ""
          });
        }, 1500);
      }
    } catch {
      // Handled silently
    } finally {
      setPublishing(false);
    }
  };

  // Filtered list by search query only
  const filteredNews = newsItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.dispatchCode && item.dispatchCode.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div id="news" className="space-y-8 font-sans scroll-mt-24">
        <SectionTitle
          title="Latest Monitoring Events & Bulletins"
          subtitle="Stay updated with the latest regional tectonic reports, real-time satellite sensor alerts, and seismic data publications."
          accent="Monitoring Hub"
        />

        {/* Toolbar: Search & Authorized Publish Button */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dispatches by title, code, or keyword..."
                aria-label="Search dispatches by title, code, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72] bg-slate-50 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action & Status */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                {filteredNews.length} Dispatch{filteredNews.length !== 1 ? "es" : ""} Retrieved
              </span>

              <button
                onClick={handleOpenPublish}
                aria-label="Publish new official bulletin dispatch"
                className="px-4 py-2 bg-[#0E4A72] hover:bg-[#0085C8] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-[#0E4A72] focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
              >
                <Lock className="w-3.5 h-3.5 text-[#F7D08A]" />
                <span>Publish Bulletin</span>
              </button>
            </div>
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-2">
            <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No news dispatches found</h4>
            <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredNews.map((item) => (
              <motion.div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Read bulletin dispatch: ${item.title}`}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={() => handleNewsClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNewsClick(item);
                  }
                }}
                className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-[#0085C8]/50 focus:outline-none focus:ring-2 focus:ring-[#0085C8] transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#B8860B]" />
                      {item.date}
                    </span>
                    <span className="bg-[#0085C8]/10 text-[#0085C8] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider text-[9px] border border-[#0085C8]/20">
                      {item.category}
                    </span>
                  </div>
                  
                  {item.dispatchCode && (
                    <span className="text-[9px] font-mono font-bold text-slate-400 block tracking-widest uppercase">
                      {item.dispatchCode}
                    </span>
                  )}

                  <h3 className="text-sm font-black tracking-tight text-slate-900 leading-snug group-hover:text-[#0085C8] transition-colors font-display">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 font-normal">
                    {item.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    {item.readTime || "4 min read"}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewsClick(item);
                    }}
                    className="text-[11px] font-mono uppercase tracking-wider text-[#0085C8] font-black inline-flex items-center gap-1 group-hover:text-[#B8860B] transition-colors cursor-pointer"
                  >
                    <span>Retrieve Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Internal News Detail Modal */}
      {selectedNewsInternal && (
        <NewsDetailModal
          news={selectedNewsInternal}
          onClose={() => setSelectedNewsInternal(null)}
        />
      )}

      {/* Publish Bulletin Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in font-sans">
          <div 
            className="bg-white border-2 border-[#0E4A72] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0E4A72] text-white p-6 rounded-t-[22px] relative">
              <button
                onClick={() => setShowPublishModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black font-display tracking-tight text-white">
                Publish Official Bulletin Dispatch
              </h3>
              <p className="text-xs text-slate-200">
                Dispatch entries are stored on ESSGI server backends and immediately streamed to public and field dashboards.
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handlePublishSubmit} className="p-6 space-y-4 text-slate-800">
              {publishSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold font-mono">
                  ✓ {publishSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                    Bulletin Category
                  </label>
                  <select
                    value={newDispatch.category}
                    onChange={(e) => setNewDispatch({ ...newDispatch, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                  >
                    <option value="Volcanology">Volcanology</option>
                    <option value="Seismology">Seismology</option>
                    <option value="Space Science">Space Science</option>
                    <option value="Disaster Preparedness">Disaster Preparedness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                    Advisory Tag
                  </label>
                  <input
                    type="text"
                    value={newDispatch.tag}
                    onChange={(e) => setNewDispatch({ ...newDispatch, tag: e.target.value })}
                    placeholder="Urgent Alert / Research Update"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                  Bulletin Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={newDispatch.title}
                  onChange={(e) => setNewDispatch({ ...newDispatch, title: e.target.value })}
                  placeholder="e.g. Erta Ale Caldera Thermal Radiance Expansion Detected"
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                  Executive Excerpt (1-2 sentences) *
                </label>
                <input
                  type="text"
                  required
                  value={newDispatch.excerpt}
                  onChange={(e) => setNewDispatch({ ...newDispatch, excerpt: e.target.value })}
                  placeholder="Summary for grid card view..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                  Full Dispatch Statement Body *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDispatch.fullText}
                  onChange={(e) => setNewDispatch({ ...newDispatch, fullText: e.target.value })}
                  placeholder="Comprehensive technical report details, station sensors, and findings..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                    Issuing Authority / Division
                  </label>
                  <input
                    type="text"
                    value={newDispatch.author}
                    onChange={(e) => setNewDispatch({ ...newDispatch, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                    Location / Sector Region
                  </label>
                  <input
                    type="text"
                    value={newDispatch.location}
                    onChange={(e) => setNewDispatch({ ...newDispatch, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase mb-1">
                  Key Technical Observations (One point per line)
                </label>
                <textarea
                  rows={2}
                  value={newDispatch.keyFindingsText}
                  onChange={(e) => setNewDispatch({ ...newDispatch, keyFindingsText: e.target.value })}
                  placeholder="Thermal radiance surge detected at 13.60 N&#10;Active lava lake level elevated"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-[#F7D08A]" />
                  <span>{publishing ? "Publishing..." : "Publish Dispatch"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTHORIZATION GATE MODAL FOR PUBLISHING BULLETINS */}
      <AnimatePresence>
        {showAuthGate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-[#0E4A72] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 font-sans relative"
            >
              <button
                onClick={() => setShowAuthGate(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0E4A72]/10 border border-[#0E4A72]/20 flex items-center justify-center text-[#0E4A72] shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#0E4A72]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-[#B8860B] uppercase tracking-widest block">
                    Security Clearance Required
                  </span>
                  <h3 className="text-base font-black text-[#0E4A72] font-display uppercase tracking-wider">
                    Authorized Personnel Only
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Publishing operational bulletins to the national public feed is restricted to authorized ESSGI duty officers and administrative directors. Please verify your security key.
              </p>

              <form onSubmit={handleVerifyPasscode} className="space-y-4 pt-1">
                {authGateError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-700 leading-snug">
                    ⚠️ {authGateError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wide block">
                    Security Key / Officer Passcode:
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="e.g. SSGI-ADMIN-2026 or officer passcode"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0E4A72] bg-slate-50 text-xs font-mono font-bold text-slate-900"
                      autoFocus
                    />
                  </div>
                  <span className="text-[9.5px] font-mono text-slate-400 block pt-0.5">
                    Demo clearance key: <code className="text-[#0E4A72] font-bold bg-slate-100 px-1 py-0.5 rounded">SSGI-ADMIN-2026</code>
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAuthGate(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0E4A72] hover:bg-[#0085C8] text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2 border border-[#0E4A72]"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#F7D08A]" />
                    <span>Verify &amp; Proceed</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
