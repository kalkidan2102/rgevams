import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Building, 
  Clock, 
  ShieldAlert, 
  Globe, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [inquiryType, setInquiryType] = useState("General Inquiry");
  const [priority, setPriority] = useState("Standard");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      alert("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API dispatch
    setTimeout(() => {
      const generatedTicket = "ESSGI-TKT-" + Math.floor(100000 + Math.random() * 900000);
      setTicketId(generatedTicket);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setInstitution("");
    setInquiryType("General Inquiry");
    setPriority("Standard");
    setMessage("");
    setIsSuccess(false);
    setTicketId("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-[#041B2D] border-2 border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col"
        >
          {/* Top Banner - STICKY so Close X is ALWAYS VISIBLE */}
          <div className="sticky top-0 z-30 shrink-0 bg-gradient-to-r from-[#0E4A72] via-[#0085C8] to-[#00D4FF] px-4 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between shadow-md border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md border border-white/20 shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-cyan-200 block">
                  Ethiopian Space Science & Geospatial Institute
                </span>
                <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                  Contact Us
                </h2>
              </div>
            </div>
            
            <button
              onClick={onClose}
              aria-label="Close Contact Us dialog"
              className="p-2 sm:p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer border border-white/30 active:scale-95 shrink-0 flex items-center justify-center shadow-md font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Col: Contact Information & HQ details */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-black font-display uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0085C8]" />
                  Central Headquarters
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
                  Direct official communications for geodynamic inquiries, spatial data requests, and hazard dispatch.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <MapPin className="w-4 h-4 text-[#D48F29] shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white block font-display">
                      4 Kilo Central Headquarters
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 leading-snug block mt-0.5 font-medium">
                      4 Kilo (Arat Kilo), King George VI St, P.O. Box 336, Addis Ababa, Ethiopia
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <Phone className="w-4 h-4 text-[#0085C8] shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white block font-display">
                      Telephone Hotline
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono font-bold block mt-0.5">
                      +251 11 126 1000 / +251 11 126 2000
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white block font-display">
                      Official Email Addresses
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono font-bold block mt-0.5">
                      info@essgi.gov.et
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white block font-display">
                      Operating Hours
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 block mt-0.5 font-medium">
                      Mon – Fri: 8:30 AM – 5:30 PM (EAT)
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 text-[11px] space-y-1">
                <span className="font-black font-mono uppercase tracking-wider text-[9.5px] text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Emergency Geohazard Duty
                </span>
                <p className="leading-relaxed font-medium">
                  To report live volcanic gas vents, ground cracks, or severe earthquake tremors, select <strong>"Geohazard Anomaly Report"</strong> in the form.
                </p>
              </div>

              {/* Official Social Media Channels */}
              <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 shadow-xs space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Official Channels & Feeds
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <a
                    href="https://twitter.com/ssgi2022"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-[#0085C8]/10 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-white/5"
                  >
                    <Twitter className="w-3.5 h-3.5 text-[#0085C8]" />
                    <span className="font-bold">@ssgi2022</span>
                  </a>
                  <a
                    href="https://t.me/spacegeospatial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-[#0085C8]/10 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-white/5"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-500" />
                    <span className="font-bold">Telegram</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/space-science-and-geospatial-institute-ssgi-37b48623a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-[#0085C8]/10 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-white/5"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-700" />
                    <span className="font-bold">LinkedIn</span>
                  </a>
                  <a
                    href="https://www.youtube.com/@ssgi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-[#0085C8]/10 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-white/5"
                  >
                    <Youtube className="w-3.5 h-3.5 text-rose-600" />
                    <span className="font-bold">@ssgi</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Contact Form */}
            <div className="lg:col-span-7 p-4 sm:p-5">
              {isSuccess ? (
                <div className="py-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                      Transmission Confirmed
                    </span>
                    <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                      Message Dispatched to ESSGI HQ
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
                      Your inquiry has been logged in the Geodynamics Division queue. An assigned duty officer will review your request.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 max-w-sm mx-auto text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                      Tracking Reference ID
                    </span>
                    <span className="text-lg font-black font-mono text-[#0085C8] dark:text-[#00D4FF] block">
                      {ticketId}
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0085C8] to-[#00D4FF] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black font-display uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#0085C8]" />
                      Send Direct Inquiry
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      * Required fields
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Kalkidan Amare"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#0085C8] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@institution.gov.et"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#0085C8] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 91 100 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#0085C8] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Institution */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Organization / University
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. Addis Ababa University / USGS"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#0085C8] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Inquiry Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Inquiry Classification
                      </label>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-[#0085C8] outline-none transition-all cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Geohazard Anomaly Report">Geohazard Anomaly Report (Seismic/Volcanic)</option>
                        <option value="GNSS / Seismometer Data Request">GNSS / Seismometer Data Access</option>
                        <option value="Research Collaboration">Research Collaboration</option>
                        <option value="Press & Media Inquiry">Press & Media Inquiry</option>
                      </select>
                    </div>

                    {/* Priority Level */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-[#0085C8] outline-none transition-all cursor-pointer"
                      >
                        <option value="Standard">Standard Routine Inquiry</option>
                        <option value="High Priority">High Priority Research Request</option>
                        <option value="Urgent Hazard">Urgent Crustal Hazard Alert</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Message Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your query, coordinates of interest, or observed geological anomalies..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#0085C8] focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0085C8] to-[#00D4FF] hover:brightness-105 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Transmitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message to ESSGI</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
