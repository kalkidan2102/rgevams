import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Menu,
  X,
  Search,
  BookOpen,
  Mail,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Send,
  Home,
  ChevronDown,
  ChevronRight,
  Info,
  Newspaper,
  Cpu,
  Megaphone,
  GraduationCap,
  CloudSun,
  MoreHorizontal,
  LogOut,
  LogIn,
  ShieldCheck,
  UserCheck,
  User,
  Users,
  Key,
  LayoutDashboard,
  Map as MapIcon,
  LineChart,
  FileText,
  Camera,
  ExternalLink,
  Activity,
  Flame,
  Radio,
  Compass,
  Globe,
  Bell,
  Layers,
  Shield,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ESSGILogo } from "../ESSGILogo";
import { AboutUsModal, AboutTab } from "../Modals/AboutUsModal";
import { SectorDetailModal } from "../Modals/SectorModal";
import { AnnouncementDetailModal } from "../Modals/AnnouncementModal";
import { SearchModal } from "../Modals/SearchModal";
import { LicsbasGuideModal } from "../Modals/LicsbasGuideModal";
import { NotificationCenterModal } from "../Modals/NotificationCenterModal";
import { SECTORS_DATA, SectorData } from "../../data/sectors";
import { ANNOUNCEMENTS_DATA, AnnouncementItem } from "../../data/announcements";
import { useLanguage } from "../../Contexts/LanguageContext";
import { LanguageToggle } from "../common/LanguageToggle";

interface NavbarProps {
  activePage: "home" | "dashboard";
  setActivePage: (page: "home" | "dashboard") => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onSelectDashboardSubTab?: (subTab: string) => void;
  onSelectAnalyticsSubTab?: (subTab: string) => void;
  onSelectReportType?: (type: "all" | "volcanic" | "seismic" | "infrastructure" | "geodesy" | "drmc" | "gnss" | "executive") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userRole: any;
  onChangeRole: () => void;
  onSignOut?: () => void;
  pendingApprovalsCount?: number;
  onOpenLicsbasGuide?: () => void;
  onSelectAnnouncement?: (announcement: AnnouncementItem | null) => void;
}

export function Navbar({
  activePage,
  setActivePage,
  activeTab,
  setActiveTab,
  onSelectDashboardSubTab,
  onSelectAnalyticsSubTab,
  onSelectReportType,
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  userRole,
  onChangeRole,
  onSignOut,
  pendingApprovalsCount = 0,
  onOpenLicsbasGuide,
  onSelectAnnouncement
}: NavbarProps) {
  const { t, isAmharic, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [aboutModalTab, setAboutModalTab] = useState<AboutTab>("about");
  const [fetchedSectors, setFetchedSectors] = useState<SectorData[]>(SECTORS_DATA);
  const [fetchedAnnouncements, setFetchedAnnouncements] = useState<AnnouncementItem[]>(ANNOUNCEMENTS_DATA);

  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  const [showSectorModal, setShowSectorModal] = useState(false);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLicsbasGuideModal, setShowLicsbasGuideModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isDgProfileMenuOpen, setIsDgProfileMenuOpen] = useState(false);
  const dgProfileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (dgProfileDropdownRef.current && !dgProfileDropdownRef.current.contains(event.target as Node)) {
        setIsDgProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen || isDgProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen, isDgProfileMenuOpen]);

  const handleNotificationNavigation = (target: { page: "dashboard" | "home"; tab?: string; volcanoId?: string }) => {
    setActivePage(target.page);
    if (target.tab) {
      setActiveTab(target.tab);
      onSelectDashboardSubTab?.(target.tab);
    }
  };

  useEffect(() => {
    fetch("/api/sectors")
      .then((res) => res.json())
      .then((data) => {
        if (data.sectors && Array.isArray(data.sectors)) {
          setFetchedSectors(data.sectors);
        }
      })
      .catch(() => {});

    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements && Array.isArray(data.announcements)) {
          setFetchedAnnouncements(data.announcements);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close desktop navigation dropdowns on outside click or touch
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".nav-dropdown-group")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (isAmharic) {
      const now = new Date();
      const amDays = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
      const amMonths = ["ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን", "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር"];
      const dayName = amDays[now.getDay()];
      const monthName = amMonths[now.getMonth()];
      setFormattedDate(`${dayName}፣ ${monthName} ${now.getDate()}፣ ${now.getFullYear()}`);
    } else {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const dateStr = new Date().toLocaleDateString("en-US", options);
      setFormattedDate(dateStr.toUpperCase());
    }
  }, [isAmharic]);

  // Map the navigation actions to match the user's interface needs
  const handleNavClick = (itemKey: string) => {
    setMobileMenuOpen(false);
    switch (itemKey) {
      case "home":
        setActiveTab("home");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "dashboard":
        setActiveTab("dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "map":
        setActiveTab("map");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "analytics":
        setActiveTab("analytics");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "insar":
        setActiveTab("insar");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "report":
        setActiveTab("report");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "gallery":
        setActiveTab("gallery");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "admin-dashboard":
        setActiveTab("admin-dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "staff-dashboard":
        setActiveTab("staff-dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "official-dashboard":
      case "official":
        setActiveTab("official-dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "researcher-dashboard":
      case "researcher":
        setActiveTab("researcher-dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "institutional":
      case "about":
      case "about-ssgi":
        setActiveTab("about");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "focus":
      case "focus-area":
        setActiveTab("focus");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "contact":
      case "contact-us":
        setActiveTab("contact");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "mission":
      case "mission-mandate":
        setActiveTab("mission");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "news":
        setActiveTab("home");
        setTimeout(() => {
          const el = document.getElementById("news");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        break;
      case "sectors":
        setActiveTab("sectors");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "announcements":
        setActiveTab("announcements");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "spaceweather":
        setActiveTab("map");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "more":
        setActiveTab("report");
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      default:
        setActiveTab(itemKey as any);
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
    }
  };

  const isSuperAdminOrAdmin = userRole.role === "superadmin" || userRole.role === "admin";
  const isGuest = userRole.role === "guest";

  // Role helper configuration for profile picture logo & direct navigation
  const getDashboardTabForRole = (role: string): string => {
    if (role === "admin" || role === "superadmin") return "admin-dashboard";
    if (role === "researcher" || role === "scientist") return "researcher-dashboard";
    if (role === "official") return "official-dashboard";
    if (role === "staff") return "staff-dashboard";
    return "dashboard";
  };

  const getRoleBadgeConfig = (role: string) => {
    switch (role) {
      case "superadmin":
      case "admin":
        return {
          label: "ADMIN",
          fullName: isAmharic ? "አስተዳዳሪ" : "Administrator",
          dashboardName: isAmharic ? "የአስተዳዳሪ ማዕከል" : "Admin Command Center",
          tab: "admin-dashboard",
          avatarBg: "bg-gradient-to-br from-[#0E4A72] to-[#062438]",
          ringColor: "ring-[#D48F29]",
          badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
          icon: ShieldCheck,
          iconColor: "text-[#D48F29]",
        };
      case "official":
        return {
          label: "OFFICIAL",
          fullName: isAmharic ? "የአደጋ ኦፊሰር" : "Disaster Duty Officer",
          dashboardName: isAmharic ? "የባለስልጣን የስራ ክፍል" : "Official Duty Workspace",
          tab: "official-dashboard",
          avatarBg: "bg-gradient-to-br from-emerald-600 to-teal-800",
          ringColor: "ring-emerald-500",
          badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
          icon: Activity,
          iconColor: "text-emerald-300",
        };
      case "researcher":
      case "scientist":
        return {
          label: "RESEARCH",
          fullName: isAmharic ? "ተመራማሪ" : "Lead Researcher",
          dashboardName: isAmharic ? "የምርምር ማዕከል" : "Research Console",
          tab: "researcher-dashboard",
          avatarBg: "bg-gradient-to-br from-cyan-600 to-blue-800",
          ringColor: "ring-cyan-500",
          badgeBg: "bg-cyan-100 text-cyan-900 border-cyan-300",
          icon: BookOpen,
          iconColor: "text-cyan-300",
        };
      case "staff":
        return {
          label: "STAFF",
          fullName: isAmharic ? "ሰራተኛ" : "Staff Operator",
          dashboardName: isAmharic ? "የሰራተኞች የስራ ክፍል" : "Staff Workspace",
          tab: "staff-dashboard",
          avatarBg: "bg-gradient-to-br from-indigo-600 to-violet-800",
          ringColor: "ring-indigo-500",
          badgeBg: "bg-indigo-100 text-indigo-900 border-indigo-300",
          icon: UserCheck,
          iconColor: "text-indigo-300",
        };
      default:
        return {
          label: "GUEST",
          fullName: isAmharic ? "እንግዳ" : "Guest Observer",
          dashboardName: isAmharic ? "ኮክፒት" : "Geohazard Cockpit",
          tab: "dashboard",
          avatarBg: "bg-slate-400",
          ringColor: "ring-slate-300",
          badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
          icon: Shield,
          iconColor: "text-slate-500",
        };
    }
  };

  const roleConfig = getRoleBadgeConfig(userRole.role);

  const getInitials = (name: string): string => {
    if (!name) return "SS";
    const clean = name.replace(/\(.*?\)/g, "").trim();
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Direct touch handler to navigate back to the user's role dashboard
  const handleNavigateToUserDashboard = () => {
    const targetDashboard = getDashboardTabForRole(userRole.role);
    setActiveTab(targetDashboard as any);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="Navbar w-full shrink-0 font-sans select-none bg-white border-b border-slate-200 text-slate-900 shadow-md">
      {/* 0. ETHIOPIAN NATIONAL TRICOLOR RIBBON */}
      <div className="w-full h-1 flex shrink-0">
        <div className="w-1/3 h-full bg-[#009A44]" />
        <div className="w-1/3 h-full bg-[#FED100]" />
        <div className="w-1/3 h-full bg-[#EF2B2D]" />
      </div>

      {/* 1. TOP STATUTORY FEDERAL UTILITY BAR */}
      <div className="relative z-[60] bg-slate-100 border-b border-slate-200 text-xs py-1.5 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-0">
          
          {/* Left: Federal Republic Identity & Live EAT Clock */}
          <div className="flex items-center flex-wrap justify-center md:justify-start gap-3 md:gap-4 text-slate-700 font-medium text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-600 uppercase tracking-wider">
                {isAmharic ? "የጠፈር ሳይንስ እና ጂኦስፓሻል ኢንስቲትዩት" : "Space Science & Geospatial Institute"}
              </span>
            </div>

            {/* Date block with subtle accent */}
            <div className="bg-white border border-slate-300 text-slate-700 px-2.5 py-0.5 font-mono font-medium tracking-wider rounded text-[10px] select-none shadow-2xs text-center">
              EAT (UTC+3) &bull; {formattedDate || "SATURDAY, JULY 11, 2026"}
            </div>

            {/* Contact Email */}
            <a
              href="mailto:info@ssgi.gov.et"
              className="hidden sm:flex items-center gap-1 text-slate-600 hover:text-[#0E4A72] transition-colors cursor-pointer font-medium text-[11px]"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>info@ssgi.gov.et</span>
            </a>
          </div>

          {/* Right utility items: Language toggle, social channels, simulation role selector, Sign In / Sign Out */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Primary Language Toggle (EN / አማርኛ) */}
            <LanguageToggle variant="pill" className="mr-1" />

            {/* Social channels */}
            <div className="hidden sm:flex items-center gap-1">
              <a
                href="https://twitter.com/ssgi2022"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6.5 h-6.5 flex items-center justify-center bg-white text-slate-600 hover:bg-[#0085C8] hover:text-white transition-all rounded-md border border-slate-200 shadow-xs"
                title="SSGI Twitter / X (@ssgi2022)"
              >
                <Twitter className="w-3 h-3" />
              </a>
              <a
                href="https://t.me/spacegeospatial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6.5 h-6.5 flex items-center justify-center bg-white text-slate-600 hover:bg-[#0085C8] hover:text-white transition-all rounded-md border border-slate-200 shadow-xs"
                title="SSGI Official Telegram Channel (t.me/spacegeospatial)"
              >
                <Send className="w-3 h-3 text-[#0085C8] group-hover:text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/space-science-and-geospatial-institute-ssgi-37b48623a"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6.5 h-6.5 flex items-center justify-center bg-white text-slate-600 hover:bg-[#0085C8] hover:text-white transition-all rounded-md border border-slate-200 shadow-xs"
                title="SSGI Official LinkedIn"
              >
                <Linkedin className="w-3 h-3" />
              </a>
              <a
                href="https://www.youtube.com/@ssgi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6.5 h-6.5 flex items-center justify-center bg-white text-slate-600 hover:bg-[#0085C8] hover:text-white transition-all rounded-md border border-slate-200 shadow-xs"
                title="SSGI Official YouTube (@ssgi)"
              >
                <Youtube className="w-3 h-3 text-rose-600 group-hover:text-white" />
              </a>
            </div>

            <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

            {/* NOTIFICATION BELL BUTTON (Top Utility Bar) */}
            <button
              onClick={() => setShowNotificationModal(true)}
              className="relative flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0E4A72] px-2.5 py-1 rounded-md border border-slate-300 shadow-xs transition-colors cursor-pointer"
              title={isAmharic ? "የቅርብ ጊዜ የተፈጥሮ አደጋ ማስጠንቀቂያዎችን ተመልከት" : "View Recent Volcano & Seismic Geohazard Notifications"}
            >
              <div className="relative flex items-center">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 ml-0.5" />
              </div>
              <span className="font-medium text-[11px]">{t("navAlerts")}</span>
              <span className="bg-rose-600 text-white font-mono text-[9px] font-medium px-1.5 py-0.5 rounded">
                3
              </span>
            </button>

            {/* Current Account Profile & Role / Profile Picture Logo */}
            {!isGuest ? (
              /* LOGGED IN: Profile Logo Button with Direct Touch Navigation back to Dashboard */
              <div className="relative z-[70] flex items-center gap-1.5" ref={profileDropdownRef}>
                <div className="flex items-center gap-1 bg-white pl-1.5 pr-1 py-1 rounded-full border-2 border-[#D48F29] shadow-xs hover:shadow-md transition-all">
                  {/* Direct Touch: Profile Picture Logo to return to dashboard */}
                 
                 
                    {/* Circular Profile Avatar Picture with Ring & Glowing Online Dot */}
                    <div className="relative">
                      <div className={`w-7 h-7 rounded-full ${roleConfig.avatarBg} text-white flex items-center justify-center font-bold text-[10.5px] shadow-xs ring-2 ${roleConfig.ringColor} group-hover:scale-105 transition-transform`}>
                        {getInitials(userRole.name)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                    </div>

                   

                  {/* Profile Dropdown Trigger Chevron */}
                  <button
                    id="profile-menu-toggle-btn"
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    aria-label="Open profile options menu"
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Account options & sign out"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProfileMenuOpen ? "rotate-180 text-[#D48F29]" : ""}`} />
                  </button>
                </div>

                {/* Profile Options Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] py-2 text-slate-800 animate-fade-in font-sans ring-1 ring-black/5">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-8 h-8 rounded-full ${roleConfig.avatarBg} text-white flex items-center justify-center font-bold text-xs ring-2 ${roleConfig.ringColor}`}>
                          {getInitials(userRole.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{userRole.name}</p>
                          <span className={`inline-block font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${roleConfig.badgeBg}`}>
                            {roleConfig.label} &bull; {roleConfig.fullName}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{userRole.email || "Official Staff Account"}</p>
                      <p className="text-[10px] text-slate-600 truncate mt-0.5">{userRole.institution || "FDRE Space Science and Geospatial Institute"}</p>
                    </div>

                    {/* Primary Action: Go to My Dashboard */}
                    <div className="p-2 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleNavigateToUserDashboard();
                        }}
                        className="w-full py-2 px-2.5 rounded-lg bg-[#0E4A72] hover:bg-[#093552] text-[#F7D08A] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <roleConfig.icon className="w-4 h-4 text-[#F7D08A]" />
                        <span>{isAmharic ? "ወደ እኔ ዳሽቦርድ ሂድ" : `Go to ${roleConfig.dashboardName}`}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#F7D08A]" />
                      </button>
                    </div>

                    {/* Switch role option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onChangeRole();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isAmharic ? "መለያ / ደረጃ ቀይር" : "Switch Clearance Role"}</span>
                    </button>

                    {/* Sign Out */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onSignOut) onSignOut();
                        else onChangeRole();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isAmharic ? "ከስርዓቱ ውጣ" : "Sign Out Session"}</span>
                    </button>
                  </div>
                )}

                {/* Quick Sign Out Icon Button */}
                <button
                  id="topbar-quick-signout-btn"
                  onClick={onSignOut || onChangeRole}
                  className="flex items-center justify-center p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer shadow-xs"
                  title={isAmharic ? "ከስርዓቱ ውጣ" : "Sign out of current session"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* GUEST MODE: Visitor Observer badge & Login button */
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-medium text-[11px] text-slate-700 truncate max-w-[130px]">
                    {isAmharic ? "እንግዳ ተጠቃሚ" : "Guest Observer"}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-600">
                    READ-ONLY
                  </span>
                </div>

                <button
                  id="topbar-login-btn"
                  onClick={onChangeRole}
                  className="flex items-center gap-1 bg-[#0085C8] hover:bg-[#0070ab] text-white font-medium text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-xs border border-[#0070ab]"
                  title={isAmharic ? "ወደ ስርዓቱ ግባ" : "Login with official, researcher, or administrator credentials"}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t("login")}</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 2. MAIN OFFICIAL GOVERNMENT MASTHEAD */}
      <div className="bg-white text-slate-900 py-3.5 px-4 md:px-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Institutional Insignia: SSGI Official Crest */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => handleNavClick("home")}
              className="cursor-pointer hover:opacity-95 transition-opacity shrink-0 bg-white p-1 rounded-sm border border-slate-200 shadow-xs"
              title="Space Science and Geospatial Institute (SSGI)"
            >
              <ESSGILogo className="h-14 sm:h-16 w-auto" />
            </div>

            {/* Institutional Titles in Amharic & English */}
            <div className="space-y-0.5 text-left select-none">
              <h1 className="text-base sm:text-lg md:text-[19px] font-semibold text-[#0E4A72] tracking-tight font-sans leading-tight">
                የኢትዮጵያ ስፔስ ሳይንስ እና ጂኦስፓሻል ኢንስቲትዩት
              </h1>
              <h2 className="text-xs sm:text-[13px] md:text-sm font-medium text-slate-700 tracking-wider uppercase font-sans leading-tight">
                SPACE SCIENCE AND GEOSPATIAL INSTITUTE (SSGI)
              </h2>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-sans">
                  {isAmharic ? "የጂኦዴሲ እና ጂኦዳይናሚክስ መምሪያ" : "Department of Geodesy & Geodynamics"}
                </span>
                <span className="text-[9.5px] sm:text-[10px] font-normal text-slate-500 font-mono tracking-wider uppercase">
                  Proclamation No. 1263/2021
                </span>
              </div>
            </div>
          </div>

          {/* Right: Telemetry & Profile Provided in the Director General Bar */}
          <div className="flex items-center gap-3">
            {/* Official 24/7 Operations Desk Badge */}
            <div className="hidden xl:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <div className="space-y-0.5 text-left font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px] font-mono font-medium uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded">
                    24/7 Telemetry Active
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-500">4 Kilo HQ</span>
                </div>
                <p className="text-[10.5px] font-semibold text-[#0E4A72]">
                  National Geohazard &amp; Volcano Observatory
                </p>
              </div>
            </div>

            {/* PROFILE PROVIDED IN THE DIRECTOR GENERAL BAR WITH INTEGRATED DASHBOARD BUTTON */}
            {!isGuest ? (
              <div className="relative z-40" ref={dgProfileDropdownRef}>
                <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border-2 border-[#D48F29] rounded-xl p-1.5 pl-2.5 shadow-xs transition-all">
                  
                  {/* User Avatar + Identity Info */}
                  <button
                    type="button"
                    onClick={handleNavigateToUserDashboard}
                    className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
                    title={isAmharic ? `የ${roleConfig.fullName} ዳሽቦርድ ክፈት` : `Open ${roleConfig.fullName} Dashboard`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 rounded-full ${roleConfig.avatarBg} text-white flex items-center justify-center font-bold text-xs ring-2 ${roleConfig.ringColor} group-hover:scale-105 transition-transform shadow-xs`}>
                        {getInitials(userRole.name)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                    </div>

                    <div className="flex flex-col min-w-0 pr-1 leading-tight">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-[#0E4A72] transition-colors truncate max-w-[110px] sm:max-w-[140px]">
                        {userRole.name || "Director General"}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`font-mono text-[8.5px] uppercase font-bold px-1 py-0.2 rounded border ${roleConfig.badgeBg}`}>
                          {roleConfig.label}
                        </span>
                        <span className="text-[9.5px] text-slate-500 truncate max-w-[90px] hidden sm:inline">
                          SSGI
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* THE DASHBOARD BUTTON INSIDE THE PROFILE */}
                  <button
                    id="dg-profile-dashboard-btn"
                    type="button"
                    onClick={handleNavigateToUserDashboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E4A72] hover:bg-[#093552] active:scale-95 text-[#F7D08A] font-bold text-xs rounded-lg border border-[#D48F29] shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                    title={isAmharic ? `ወደ ${roleConfig.dashboardName} ሂድ` : `Go to your ${roleConfig.dashboardName}`}
                  >
                    <roleConfig.icon className="w-3.5 h-3.5 text-[#F7D08A]" />
                    <span className="font-semibold tracking-wide">
                      {isAmharic ? "ዳሽቦርድ" : "Dashboard"}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  </button>

                  {/* Profile Options Chevron */}
                  <button
                    id="dg-profile-chevron-btn"
                    type="button"
                    onClick={() => setIsDgProfileMenuOpen(!isDgProfileMenuOpen)}
                    aria-label="Open profile options menu"
                    className="p-1 rounded-md hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Account options & sign out"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDgProfileMenuOpen ? "rotate-180 text-[#D48F29]" : ""}`} />
                  </button>

                </div>

                {/* Profile Options Dropdown Menu */}
                {isDgProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] py-2 text-slate-800 animate-fade-in font-sans ring-1 ring-black/5">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-8 h-8 rounded-full ${roleConfig.avatarBg} text-white flex items-center justify-center font-bold text-xs ring-2 ${roleConfig.ringColor}`}>
                          {getInitials(userRole.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{userRole.name}</p>
                          <span className={`inline-block font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${roleConfig.badgeBg}`}>
                            {roleConfig.label} &bull; {roleConfig.fullName}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{userRole.email || "Official Staff Account"}</p>
                      <p className="text-[10px] text-slate-600 truncate mt-0.5">{userRole.institution || "FDRE Space Science and Geospatial Institute"}</p>
                    </div>

                    {/* Direct Action: Go to Dashboard */}
                    <div className="p-2 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDgProfileMenuOpen(false);
                          handleNavigateToUserDashboard();
                        }}
                        className="w-full py-2 px-2.5 rounded-lg bg-[#0E4A72] hover:bg-[#093552] text-[#F7D08A] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <roleConfig.icon className="w-4 h-4 text-[#F7D08A]" />
                        <span>{isAmharic ? "ወደ እኔ ዳሽቦርድ ሂድ" : `Go to ${roleConfig.dashboardName}`}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#F7D08A]" />
                      </button>
                    </div>

                    {/* Switch role option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDgProfileMenuOpen(false);
                        onChangeRole();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isAmharic ? "መለያ / ደረጃ ቀይር" : "Switch Clearance Role"}</span>
                    </button>

                    {/* Sign Out */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDgProfileMenuOpen(false);
                        if (onSignOut) onSignOut();
                        else onChangeRole();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isAmharic ? "ከስርዓቱ ውጣ" : "Sign Out Session"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

        </div>
      </div>

      {/* 3. NAVIGATION MENU BAR (Clean, Streamlined AAU University Architecture) */}
      <div className="sticky top-0 z-30 bg-[#0E4A72] text-white py-0 border-b border-[#0A3856] shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Desktop Links: Restrained, Professional Government Portal Navigation matching aau.edu.et */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 py-0 font-sans">
            
            {/* 1. HOME */}
            <button
              onClick={() => handleNavClick("home")}
              className={`py-3 px-3 xl:px-3.5 text-[12px] xl:text-[12.5px] font-medium tracking-wide uppercase cursor-pointer transition-all hover:text-[#F7D08A] hover:bg-[#0A3856] border-b-2 ${
                activeTab === "home"
                  ? "text-[#F7D08A] border-[#D48F29] bg-[#0A3856]"
                  : "text-white border-transparent"
              }`}
            >
              <span>{isAmharic ? "ዋና ገጽ" : "HOME"}</span>
            </button>

            {/* 2. INSTITUTIONAL (Consolidated About Us & Directorates/Academics) */}
            <div 
              className="relative group nav-dropdown-group"
              onMouseEnter={() => setOpenDropdown("institutional")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  handleNavClick("about");
                }}
                className={`py-3 px-3 xl:px-3.5 text-[12px] xl:text-[12.5px] font-medium tracking-wide uppercase cursor-pointer transition-all flex items-center gap-1 hover:text-[#F7D08A] hover:bg-[#0A3856] border-b-2 ${
                  activeTab === "about" || activeTab === "mission" || activeTab === "focus" || activeTab === "sectors" || activeTab === "contact" || openDropdown === "institutional" || showAboutModal
                    ? "text-[#F7D08A] border-[#D48F29] bg-[#0A3856]"
                    : "text-white border-transparent"
                }`}
              >
                <span>{isAmharic ? "ተቋማዊ" : "INSTITUTIONAL"}</span>
                <ChevronDown className={`w-3 h-3 opacity-80 transition-transform ${openDropdown === "institutional" ? "rotate-180 text-[#F7D08A]" : ""}`} />
              </button>
              {openDropdown === "institutional" && (
                <div className="absolute top-full left-0 min-w-[320px] bg-white shadow-xl border border-slate-200 z-50 animate-fade-in text-slate-800 font-sans rounded-b-lg py-2 border-t-2 border-t-[#D48F29]">
                  {/* Category: Overview & Governance */}
                  <div className="px-3.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                    {isAmharic ? "አጠቃላይ መረጃ እና አመራር" : "Overview & Governance"}
                  </div>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("about"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ስለ ኢንስቲትዩቱ (SSGI)" : "About the Institute (SSGI)"}
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("mission"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ተልዕኮ፣ ራዕይና ኃላፊነት" : "Mission, Vision & Strategic Mandate"}
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("focus"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የትኩረት መስኮችና ስትራቴጂ" : "Key Scientific Focus Areas"}
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("contact"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ያግኙን እና የቢሮ አድራሻ" : "Contact & Regional Stations"}
                  </button>

                  <div className="my-1.5 border-t border-slate-100" />

                  {/* Category: Scientific Directorates */}
                  <div className="px-3.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                    {isAmharic ? "ሳይንሳዊ መምሪያዎች" : "Scientific Directorates"}
                  </div>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("sectors"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-semibold text-[#0E4A72] hover:bg-blue-50 transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ሁሉም 4ቱ ሳይንሳዊ መምሪያዎች" : "All Scientific Directorates Overview"}
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("sectors"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የጂኦዴሲ እና ጂኦዳይናሚክስ መምሪያ" : "Geodesy & Geodynamics"}
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("sectors"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ስፔስ ሳይንስ እና አስትሮኖሚ (እንጦጦ)" : "Space Science & Astronomy (Entoto)"}
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("sectors"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የርቀት ዳሰሳና ሳተላይት ጣቢያዎች" : "Remote Sensing & Satellite Stations"}
                  </button>
                  <button
                    onClick={() => { setOpenDropdown(null); handleNavClick("sectors"); }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የአደጋ ስጋት ትንተና እና ጂኦስፓሻል AI" : "Geospatial AI & Disaster Risk Analytics"}
                  </button>
                </div>
              )}
            </div>

            {/* 3. OBSERVATORIES & DATA */}
            <div 
              className="relative group nav-dropdown-group"
              onMouseEnter={() => setOpenDropdown("dashboard")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  handleNavClick("dashboard");
                  onSelectDashboardSubTab?.("overview");
                }}
                className={`py-3 px-3 xl:px-3.5 text-[12px] xl:text-[12.5px] font-medium tracking-wide uppercase cursor-pointer transition-all flex items-center gap-1 hover:text-[#F7D08A] hover:bg-[#0A3856] border-b-2 ${
                  activeTab === "dashboard" || activeTab === "analytics" || activeTab === "map" || activeTab === "insar" || openDropdown === "dashboard"
                    ? "text-[#F7D08A] border-[#D48F29] bg-[#0A3856]"
                    : "text-white border-transparent"
                }`}
              >
                <span>{isAmharic ? "ኦብዘርቫቶሪ" : "OBSERVATORIES"}</span>
                <ChevronDown className={`w-3 h-3 opacity-80 transition-transform ${openDropdown === "dashboard" ? "rotate-180 text-[#F7D08A]" : ""}`} />
              </button>
              {openDropdown === "dashboard" && (
                <div className="absolute top-full left-0 min-w-[260px] bg-white shadow-xl border border-slate-200 z-50 animate-fade-in text-slate-800 font-sans rounded-b-lg py-1.5 border-t-2 border-t-[#D48F29]">
                  {!isGuest && (
                    <div className="px-2 py-1.5 bg-amber-50/80 border-b border-amber-200/70 mb-1">
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          handleNavigateToUserDashboard();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#0E4A72] bg-white hover:bg-amber-100/60 rounded-md border border-[#D48F29]/40 transition-colors cursor-pointer flex items-center justify-between gap-1 shadow-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <roleConfig.icon className="w-3.5 h-3.5 text-[#D48F29]" />
                          <span>{isAmharic ? `የእኔ ${roleConfig.dashboardName}` : `My ${roleConfig.dashboardName}`}</span>
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => { 
                      setOpenDropdown(null); 
                      handleNavClick("dashboard"); 
                      onSelectDashboardSubTab?.("overview"); 
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0E4A72] hover:bg-blue-50 transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የቀጥታ አደጋዎች መቆጣጠሪያ ኮክፒት" : "Live Geohazard Cockpit"}
                  </button>
                  <button
                    onClick={() => { 
                      setOpenDropdown(null); 
                      handleNavClick("map"); 
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የጂአይኤስ መስተጋብራዊ ካርታ ክፍል" : "GIS Interactive Map Room"}
                  </button>
                  <button
                    onClick={() => { 
                      setOpenDropdown(null); 
                      handleNavClick("insar"); 
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የኢንሳር ራዳር ሳተላይት ላብ (Sentinel-1)" : "InSAR Radar Satellite Lab (Sentinel-1)"}
                  </button>
                  <button
                    onClick={() => { 
                      setOpenDropdown(null); 
                      handleNavClick("dashboard"); 
                      onSelectDashboardSubTab?.("gnss"); 
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የጂኤንኤስኤስ ጂኦዴሲ አውታር" : "GNSS Geodetic Array & Velocities"}
                  </button>
                  <button
                    onClick={() => { 
                      setOpenDropdown(null); 
                      handleNavClick("dashboard"); 
                      onSelectDashboardSubTab?.("earthquakes"); 
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block border-t border-slate-100"
                  >
                    {isAmharic ? "የመሬት መንቀጥቀጥ ካታሎግና ሴይስሞግራም" : "Seismic Catalog & Seismograms"}
                  </button>
                  <button
                    onClick={() => { 
                      setOpenDropdown(null); 
                      handleNavClick("dashboard"); 
                      onSelectDashboardSubTab?.("volcanoes"); 
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የእሳተ ገሞራዎች ምልከታና ጋዝ ፍተሻ" : "Volcanic Centers & Gas Surveillance"}
                  </button>
                </div>
              )}
            </div>

            {/* 4. PUBLICATIONS & REPORTS */}
            <div 
              className="relative group nav-dropdown-group"
              onMouseEnter={() => setOpenDropdown("reports")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  if (onSelectReportType) onSelectReportType("all");
                  handleNavClick("report");
                }}
                className={`py-3 px-3 xl:px-3.5 text-[12px] xl:text-[12.5px] font-medium tracking-wide uppercase cursor-pointer transition-all flex items-center gap-1 hover:text-[#F7D08A] hover:bg-[#0A3856] border-b-2 ${
                  openDropdown === "reports" || activeTab === "report"
                    ? "text-[#F7D08A] border-[#D48F29] bg-[#0A3856]"
                    : "text-white border-transparent"
                }`}
              >
                <span>{isAmharic ? "ህትመቶች" : "PUBLICATIONS"}</span>
                <ChevronDown className={`w-3 h-3 opacity-80 transition-transform ${openDropdown === "reports" ? "rotate-180 text-[#F7D08A]" : ""}`} />
              </button>
              {openDropdown === "reports" && (
                <div className="absolute top-full left-0 min-w-[250px] bg-white shadow-xl border border-slate-200 z-50 animate-fade-in text-slate-800 font-sans rounded-b-lg py-1.5 border-t-2 border-t-[#D48F29]">
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      if (onSelectReportType) onSelectReportType("all");
                      handleNavClick("report");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0E4A72] hover:bg-blue-50 transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ብሔራዊ የአደጋ ስጋት ግምገማዎች" : "National Hazard Assessments"}
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      if (onSelectReportType) onSelectReportType("volcanic");
                      handleNavClick("report");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የእሳተ ገሞራ ስጋትና ጋዝ ቡለቲን" : "Volcanic Threat & Gas Bulletins"}
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      if (onSelectReportType) onSelectReportType("seismic");
                      handleNavClick("report");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "የመሬት መንቀጥቀጥ መመሪያዎች" : "Seismic Swarms & Directives"}
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      if (onSelectReportType) onSelectReportType("infrastructure");
                      handleNavClick("report");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ወሳኝ መሠረተ ልማት ደህንነት" : "Critical Infrastructure Reports"}
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      setShowLicsbasGuideModal(true);
                      onOpenLicsbasGuide?.();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block border-t border-slate-100"
                  >
                    {isAmharic ? "የLiCSBAS ኢንሳር መመሪያ" : "LiCSBAS InSAR Processing Guide"}
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      handleNavClick("report");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-blue-50 transition-colors cursor-pointer block"
                  >
                    {isAmharic ? "ሪፖርት ማመንጫ እና ማውረጃ ስቱዲዮ" : "Report Studio & Exporter"}
                  </button>
                </div>
              )}
            </div>

            {/* 5. ANNOUNCEMENTS & NEWS */}
            <div 
              className="relative group nav-dropdown-group"
              onMouseEnter={() => setOpenDropdown("announcements")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(null);
                  if (onSelectAnnouncement) onSelectAnnouncement(null);
                  handleNavClick("announcements");
                }}
                className={`py-3 px-3 xl:px-3.5 text-[12px] xl:text-[12.5px] font-medium tracking-wide uppercase cursor-pointer transition-all flex items-center gap-1 hover:text-[#F7D08A] hover:bg-[#0A3856] border-b-2 ${
                  openDropdown === "announcements" || activeTab === "announcements"
                    ? "text-[#F7D08A] border-[#D48F29] bg-[#0A3856]"
                    : "text-white border-transparent"
                }`}
              >
                <span>{isAmharic ? "ማስታወቂያዎች" : "ANNOUNCEMENTS"}</span>
                <ChevronDown className={`w-3 h-3 opacity-80 transition-transform ${openDropdown === "announcements" ? "rotate-180 text-[#F7D08A]" : ""}`} />
              </button>
              {openDropdown === "announcements" && (
                <div className="absolute top-full left-0 min-w-[240px] bg-white shadow-xl border border-slate-200 z-50 animate-fade-in text-slate-800 font-sans rounded-b-lg py-1.5 border-t-2 border-t-[#D48F29]">
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      if (onSelectAnnouncement) onSelectAnnouncement(null);
                      handleNavClick("announcements");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0E4A72] hover:bg-blue-50 transition-colors cursor-pointer block border-b border-slate-100"
                  >
                    {isAmharic ? "ሁሉም ማስታወቂያዎችና ጋዜጦች" : "All Announcements & Gazettes"}
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      const ann = fetchedAnnouncements.find(a => a.id === "ann-sarc-2026") || ANNOUNCEMENTS_DATA[0];
                      if (onSelectAnnouncement) onSelectAnnouncement(ann);
                      handleNavClick("announcements");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    S-ARC2026 Academic Conference
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      const ann = fetchedAnnouncements.find(a => a.id === "ann-grants-2026") || ANNOUNCEMENTS_DATA[1];
                      if (onSelectAnnouncement) onSelectAnnouncement(ann);
                      handleNavClick("announcements");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    Presidential Research Grants 2026/27
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      const ann = fetchedAnnouncements.find(a => a.id === "ann-tender-2026") || ANNOUNCEMENTS_DATA[2];
                      if (onSelectAnnouncement) onSelectAnnouncement(ann);
                      handleNavClick("announcements");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    Tenders &amp; Procurement Calls
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      const ann = fetchedAnnouncements.find(a => a.category === "Workshop") || ANNOUNCEMENTS_DATA[3] || ANNOUNCEMENTS_DATA[0];
                      if (onSelectAnnouncement) onSelectAnnouncement(ann);
                      handleNavClick("announcements");
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0E4A72] transition-colors cursor-pointer block"
                  >
                    Technical Training Workshops
                  </button>
                </div>
              )}
            </div>

          </nav>

          {/* Search, Notifications & Language Switcher in Main Nav */}
          <div className="flex items-center gap-2 py-2 pr-1">
            {/* Quick Language Toggle in Main Nav for accessibility */}
            <LanguageToggle variant="compact" className="hidden sm:inline-flex" />

            {/* Notification Bell Icon */}
            <button
              onClick={() => setShowNotificationModal(true)}
              className="relative p-2 rounded-lg bg-[#0A3856] hover:bg-[#07263c] text-white transition-all cursor-pointer border border-[#D48F29]/40 flex items-center justify-center hover:scale-105 shadow-xs group"
              title={isAmharic ? "የቅርብ ጊዜ የተፈጥሮ አደጋ ማስጠንቀቂያ ማዕከል" : "Recent Volcano & Seismic Events Notification Center"}
            >
              <Bell className="w-4 h-4 text-[#F7D08A] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-mono text-[9px] font-medium rounded-full flex items-center justify-center border border-white shadow-xs animate-pulse">
                3
              </span>
            </button>

            {/* Search Symbol Only Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-lg bg-[#0A3856] hover:bg-[#07263c] text-white transition-all cursor-pointer border border-[#D48F29]/40 flex items-center justify-center hover:scale-105 shadow-xs"
              title={isAmharic ? "የጂኦሃዛርድ ዳታ፣ ዘርፎችና ማስታወቂያዎችን ይፈልጉ" : "Search Geohazard Telemetry, Sectors & Announcements"}
            >
              <Search className="w-4 h-4 text-[#F7D08A]" />
            </button>

            {/* Mobile Profile Logo Button - Touch directly to return to Dashboard */}
            {!isGuest && (
              <button
                id="mobile-header-profile-logo-btn"
                type="button"
                onClick={handleNavigateToUserDashboard}
                className="lg:hidden relative p-0.5 rounded-full bg-white border-2 border-[#D48F29] shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                title={`Touch profile logo to return to ${roleConfig.fullName} Dashboard`}
              >
                <div className={`w-7 h-7 rounded-full ${roleConfig.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shadow-inner`}>
                  {getInitials(userRole.name)}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle SSGI official mobile portal menu directory"
            aria-expanded={mobileMenuOpen}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setMobileMenuOpen(!mobileMenuOpen);
              }
            }}
            className="lg:hidden p-2 rounded-lg bg-[#0A3856] text-white hover:bg-[#07263c] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F7D08A]"
            title="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#F7D08A]" /> : <Menu className="w-5 h-5 text-[#F7D08A]" />}
          </button>

        </div>
      </div>

      {/* 4. MOBILE BOTTOM-DOCKED NAVIGATION BAR (Government Ergonomic Layout) */}
      <nav
        aria-label="Mobile Bottom Navigation Bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/98 backdrop-blur-md border-t-2 border-[#D48F29] text-[#0E4A72] shadow-[0_-4px_25px_rgba(14,74,114,0.18)] px-1 py-1 flex items-center justify-around select-none"
      >
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => handleNavClick("home")}
          aria-label="Navigate to Home Page"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNavClick("home");
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#0085C8] ${
            activeTab === "home"
              ? "bg-[#0E4A72] text-[#F7D08A] font-semibold shadow-sm"
              : "text-[#0E4A72]/80 hover:text-[#0E4A72] hover:bg-[#0E4A72]/5 font-medium"
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${activeTab === "home" ? "text-[#F7D08A]" : "text-[#0E4A72]"}`} />
          <span className="text-[10px] uppercase tracking-wider font-mono font-medium leading-none">
            {isAmharic ? "ዋና" : "Home"}
          </span>
        </button>

        {/* 2. Executive Cockpit */}
        <button
          onClick={() => {
            handleNavClick("dashboard");
            onSelectDashboardSubTab?.("overview");
          }}
          aria-label="Navigate to Geohazard Monitoring Cockpit Page"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
            activeTab === "dashboard" || activeTab === "analytics"
              ? "bg-[#0E4A72] text-[#F7D08A] font-semibold shadow-sm"
              : "text-[#0E4A72]/80 hover:text-[#0E4A72] hover:bg-[#0E4A72]/5 font-medium"
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeTab === "dashboard" || activeTab === "analytics" ? "text-[#F7D08A]" : "text-[#0E4A72]"}`} />
          <span className="text-[10px] uppercase tracking-wider font-mono font-medium leading-none">
            {isAmharic ? "ክትትል" : "Cockpit"}
          </span>
        </button>

        {/* 3. GIS Map */}
        <button
          onClick={() => handleNavClick("map")}
          aria-label="Navigate to GIS Interactive Map Room Page"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
            activeTab === "map"
              ? "bg-[#0E4A72] text-[#F7D08A] font-semibold shadow-sm"
              : "text-[#0E4A72]/80 hover:text-[#0E4A72] hover:bg-[#0E4A72]/5 font-medium"
          }`}
        >
          <MapIcon className={`w-5 h-5 mb-0.5 ${activeTab === "map" ? "text-[#F7D08A]" : "text-[#0E4A72]"}`} />
          <span className="text-[10px] uppercase tracking-wider font-mono font-medium leading-none">
            {isAmharic ? "ካርታ" : "GIS Map"}
          </span>
        </button>

        {/* 4. AI Briefing */}
        <button
          type="button"
          onClick={() => handleNavClick("report")}
          aria-label="Navigate to AI Geohazard Briefing"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNavClick("report");
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#0085C8] ${
            activeTab === "report"
              ? "bg-[#0E4A72] text-[#F7D08A] font-semibold shadow-sm"
              : "text-[#0E4A72]/80 hover:text-[#0E4A72] hover:bg-[#0E4A72]/5 font-medium"
          }`}
        >
          <FileText className={`w-5 h-5 mb-0.5 ${activeTab === "report" ? "text-[#F7D08A]" : "text-[#0E4A72]"}`} />
          <span className="text-[10px] uppercase tracking-wider font-mono font-medium leading-none">
            {isAmharic ? "ሪፖርት" : "Briefing"}
          </span>
        </button>

        {/* 4.5 Dedicated Role Dashboard on Mobile Bottom Bar (when logged in) */}
        {!isGuest && (
          <button
            id="mobile-bottom-role-dashboard-btn"
            type="button"
            onClick={handleNavigateToUserDashboard}
            aria-label={`Navigate to ${roleConfig.fullName} Dashboard`}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeTab === roleConfig.tab
                ? "bg-[#0E4A72] text-[#F7D08A] font-semibold shadow-sm"
                : "text-[#0E4A72]/80 hover:text-[#0E4A72] hover:bg-[#0E4A72]/5 font-medium"
            }`}
          >
            <div className="relative">
              <roleConfig.icon className={`w-5 h-5 mb-0.5 ${activeTab === roleConfig.tab ? "text-[#F7D08A]" : "text-[#0E4A72]"}`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold leading-none truncate max-w-[55px]">
              {roleConfig.label}
            </span>
          </button>
        )}

        {/* 5. Menu / Portal Directory Sheet Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open SSGI Official Portal Directory and Menu"
          aria-expanded={mobileMenuOpen}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setMobileMenuOpen(!mobileMenuOpen);
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] relative focus:outline-none focus:ring-2 focus:ring-[#0085C8] ${
            mobileMenuOpen
              ? "bg-[#D48F29] text-[#0E4A72] font-semibold shadow-sm"
              : "text-[#0E4A72]/80 hover:text-[#0E4A72] hover:bg-[#0E4A72]/5 font-medium"
          }`}
        >
          <div className="relative">
            {mobileMenuOpen ? <X className="w-5 h-5 mb-0.5 text-[#0E4A72]" /> : <Menu className="w-5 h-5 mb-0.5 text-[#0E4A72]" />}
            {pendingApprovalsCount > 0 && !mobileMenuOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider font-mono font-medium leading-none">
            {mobileMenuOpen ? (isAmharic ? "ዝጋ" : "Close") : (isAmharic ? "ማውጫ" : "Menu")}
          </span>
        </button>
      </nav>

      {/* 5. MOBILE MENU BOTTOM SHEET DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl border-t-2 border-[#D48F29] overflow-y-auto pb-24 p-5 lg:hidden text-[#0E4A72]"
            >
              {/* Grab Handle */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between border-b pb-3 border-[#D48F29]/40 mb-4">
                <div className="flex items-center gap-2">
                  <ESSGILogo className="h-9 w-auto" />
                  <div>
                    <div className="text-[9px] font-mono font-semibold uppercase text-[#D48F29] tracking-wider">
                      Official Directory
                    </div>
                    <div className="text-xs font-semibold text-[#0E4A72] uppercase tracking-tight">
                      SSGI Portal Services
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close portal directory menu"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0E4A72] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Language Selector */}
              <div className="mb-4">
                <LanguageToggle variant="full" className="w-full" />
              </div>

              {/* User Account & Role Badge */}
              <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#D48F29]/30 text-xs mb-4 space-y-2.5 shadow-2xs">
                {!isGuest ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleNavigateToUserDashboard();
                        }}
                        className="relative shrink-0 hover:scale-105 transition-transform cursor-pointer"
                        title="Touch profile logo to return to dashboard"
                      >
                        <div className={`w-10 h-10 rounded-full ${roleConfig.avatarBg} text-white flex items-center justify-center font-bold text-xs ring-2 ${roleConfig.ringColor}`}>
                          {getInitials(userRole.name)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800 text-xs truncate">{userRole.name || "Authorized User"}</p>
                          <span className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${roleConfig.badgeBg}`}>
                            {roleConfig.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{userRole.email || "Official Staff"}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavigateToUserDashboard();
                      }}
                      className="w-full py-2 px-3 bg-[#0E4A72] hover:bg-[#093552] text-[#F7D08A] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer border border-[#D48F29]/50"
                    >
                      <roleConfig.icon className="w-4 h-4 text-[#F7D08A]" />
                      <span>{isAmharic ? "ወደ እኔ ዳሽቦርድ ተመለስ" : `Return to ${roleConfig.fullName} Dashboard`}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-[#F7D08A]" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0E4A72] flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Logged Clearance:
                      </span>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        GUEST
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 text-xs truncate">{userRole.name || "Guest Visitor"}</p>
                  </>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  {!isGuest ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSignOut) onSignOut();
                        else onChangeRole();
                      }}
                      aria-label="Sign out of current user session"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          if (onSignOut) onSignOut();
                          else onChangeRole();
                        }
                      }}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out Session</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onChangeRole();
                      }}
                      aria-label="Sign in or change user clearance role"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          onChangeRole();
                        }
                      }}
                      className="w-full py-2 bg-[#0E4A72] hover:bg-[#D48F29] text-[#F7D08A] hover:text-[#0E4A72] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#0085C8] cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In / Change Role</span>
                    </button>
                  )}
                  
                  {/* Quick Notification Bell Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowNotificationModal(true);
                    }}
                    aria-label="Open geohazard notifications and event history"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setShowNotificationModal(true);
                      }
                    }}
                    className="relative p-2 bg-amber-50 hover:bg-amber-100 text-[#0E4A72] rounded-xl border border-[#D48F29]/40 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    title="View Recent Volcano & Seismic Events"
                  >
                    <Bell className="w-4 h-4 text-[#D48F29]" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white font-mono text-[8px] font-medium rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* Quick Search Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowSearchModal(true);
                    }}
                    aria-label="Search telemetry, dispatches, and sectors"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setShowSearchModal(true);
                      }
                    }}
                    className="p-2 bg-[#0E4A72]/10 hover:bg-[#0E4A72]/20 text-[#0E4A72] rounded-xl border border-[#D48F29]/30 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Directory Content Modules */}
              <div className="space-y-4 font-sans text-xs">
                
                {/* Secondary Views */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono font-semibold text-[#D48F29] uppercase tracking-wider px-1">
                    Core Intelligence & Media
                  </div>
                  
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSelectReportType) onSelectReportType("all");
                        handleNavClick("report");
                      }}
                      aria-label="Open AI Geohazard Briefing"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          if (onSelectReportType) onSelectReportType("all");
                          handleNavClick("report");
                        }
                      }}
                      className={`w-full p-3 rounded-xl text-left font-semibold text-xs flex items-center justify-between transition-all border cursor-pointer ${
                        activeTab === "report"
                          ? "bg-[#0E4A72] text-[#F7D08A] border-[#0E4A72] shadow-sm"
                          : "bg-slate-50 text-[#0E4A72] border-slate-200/80 hover:bg-slate-100"
                      } focus:outline-none focus:ring-2 focus:ring-[#0085C8]`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#D48F29]" />
                        <span>AI Geohazard Reports &amp; Briefings</span>
                      </div>
                      <span className="text-[10px] bg-[#0E4A72]/10 text-[#0E4A72] font-mono px-2 py-0.5 rounded font-medium">
                        7 Types
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 pl-1">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onSelectReportType) onSelectReportType("volcanic");
                          handleNavClick("report");
                        }}
                        className="p-2 rounded-lg bg-rose-50/70 border border-rose-200 text-[11px] font-medium text-rose-800 text-left hover:bg-rose-100 transition-colors"
                      >
                        🌋 Volcanic Threat
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onSelectReportType) onSelectReportType("seismic");
                          handleNavClick("report");
                        }}
                        className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] font-medium text-amber-800 text-left hover:bg-amber-100 transition-colors"
                      >
                        ⚡ Seismic Swarms
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onSelectReportType) onSelectReportType("geodesy");
                          handleNavClick("report");
                        }}
                        className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] font-medium text-emerald-800 text-left hover:bg-emerald-100 transition-colors"
                      >
                        🚨 Geodesy Directives
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onSelectReportType) onSelectReportType("executive");
                          handleNavClick("report");
                        }}
                        className="p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] font-medium text-blue-800 text-left hover:bg-blue-100 transition-colors"
                      >
                        🏛️ Executive Brief
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-Monitoring & Analytics Subtabs */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono font-semibold text-[#D48F29] uppercase tracking-wider px-1">
                    Cockpit Intelligence Sub-Modules
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("dashboard");
                        onSelectDashboardSubTab?.("overview");
                      }}
                      aria-label="Open Executive Hazard Cockpit Overview"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          handleNavClick("dashboard");
                          onSelectDashboardSubTab?.("overview");
                        }
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Hazard Cockpit</span>
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("dashboard");
                        onSelectDashboardSubTab?.("volcanoes");
                      }}
                      aria-label="Open Volcano Observatory & Catalog"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          handleNavClick("dashboard");
                          onSelectDashboardSubTab?.("volcanoes");
                        }
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Volcano Catalog</span>
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("dashboard");
                        onSelectDashboardSubTab?.("earthquakes");
                      }}
                      aria-label="Open Earthquake Chronology Catalog"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          handleNavClick("dashboard");
                          onSelectDashboardSubTab?.("earthquakes");
                        }
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Earthquake Catalog</span>
                      <Radio className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("dashboard");
                        onSelectDashboardSubTab?.("gnss");
                      }}
                      aria-label="Open GNSS Geodesy & Seismograms"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          handleNavClick("dashboard");
                          onSelectDashboardSubTab?.("gnss");
                        }
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>GNSS Geodesy</span>
                      <Compass className="w-3.5 h-3.5 text-cyan-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("dashboard");
                        onSelectDashboardSubTab?.("analytics");
                      }}
                      aria-label="Open Geohazard Analytics & Trends"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          handleNavClick("dashboard");
                          onSelectDashboardSubTab?.("analytics");
                        }
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Analytics & Charts</span>
                      <LineChart className="w-3.5 h-3.5 text-sky-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("dashboard");
                        onSelectDashboardSubTab?.("observatory");
                      }}
                      aria-label="Open Space & Earth Observatory"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setMobileMenuOpen(false);
                          handleNavClick("dashboard");
                          onSelectDashboardSubTab?.("observatory");
                        }
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Space Observatory</span>
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  </div>
                </div>

                {/* Authorized Workspace */}
                {(userRole.role === "official" || userRole.role === "staff" || userRole.role === "researcher" || userRole.role === "scientist" || userRole.role === "admin" || userRole.role === "superadmin") && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono font-semibold text-[#D48F29] uppercase tracking-wider px-1">
                      {isAmharic ? "የሥራ ማስኬጃ ዳሽቦርድ" : "Operational Workspace"}
                    </div>
                    {userRole.role === "official" && (
                      <button
                        type="button"
                        onClick={() => handleNavClick("official-dashboard")}
                        aria-label="Navigate to Official Duty Workspace"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNavClick("official-dashboard");
                          }
                        }}
                        className={`w-full p-3 rounded-xl text-left font-semibold text-xs flex items-center justify-between transition-all border cursor-pointer ${
                          activeTab === "official-dashboard"
                            ? "bg-[#0E4A72] text-[#F7D08A] border-[#0E4A72]"
                            : "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100/80"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span>Official Duty Workspace</span>
                        </div>
                        <span className="font-mono text-[9px] bg-emerald-700 text-white px-2 py-0.5 rounded font-medium">
                          OFFICIAL
                        </span>
                      </button>
                    )}

                    {userRole.role === "staff" && (
                      <button
                        type="button"
                        onClick={() => handleNavClick("staff-dashboard")}
                        aria-label="Navigate to Staff Internal Dashboard"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNavClick("staff-dashboard");
                          }
                        }}
                        className={`w-full p-3 rounded-xl text-left font-semibold text-xs flex items-center justify-between transition-all border cursor-pointer ${
                          activeTab === "staff-dashboard"
                            ? "bg-[#0E4A72] text-[#F7D08A] border-[#0E4A72]"
                            : "bg-[#0E4A72]/5 text-[#0E4A72] border-[#0E4A72]/20 hover:bg-[#0E4A72]/10"
                        } focus:outline-none focus:ring-2 focus:ring-[#0085C8]`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Staff Operations Dashboard</span>
                        </div>
                        <span className="font-mono text-[9px] bg-[#0E4A72] text-[#F7D08A] px-2 py-0.5 rounded font-medium">
                          STAFF
                        </span>
                      </button>
                    )}

                    {(userRole.role === "researcher" || userRole.role === "scientist") && (
                      <button
                        type="button"
                        onClick={() => handleNavClick("researcher-dashboard")}
                        aria-label="Navigate to Researcher Internal Dashboard"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNavClick("researcher-dashboard");
                          }
                        }}
                        className={`w-full p-3 rounded-xl text-left font-semibold text-xs flex items-center justify-between transition-all border cursor-pointer ${
                          activeTab === "researcher-dashboard"
                            ? "bg-cyan-900 text-cyan-200 border-cyan-700"
                            : "bg-cyan-50 text-cyan-900 border-cyan-200 hover:bg-cyan-100/80"
                        } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-cyan-600" />
                          <span>Researcher Dashboard</span>
                        </div>
                        <span className="font-mono text-[9px] bg-cyan-800 text-cyan-100 px-2 py-0.5 rounded font-medium">
                          RESEARCH
                        </span>
                      </button>
                    )}

                    {(userRole.role === "admin" || userRole.role === "superadmin") && (
                      <button
                        type="button"
                        onClick={() => handleNavClick("admin-dashboard")}
                        aria-label="Navigate to Admin Command Center"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNavClick("admin-dashboard");
                          }
                        }}
                        className={`w-full p-3 rounded-xl text-left font-semibold text-xs flex items-center justify-between transition-all border cursor-pointer ${
                          activeTab === "admin-dashboard"
                            ? "bg-[#0E4A72] text-[#F7D08A] border-[#0E4A72]"
                            : "bg-amber-50 text-[#0E4A72] border-amber-200 hover:bg-amber-100/80"
                        } focus:outline-none focus:ring-2 focus:ring-[#0085C8]`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Admin Command Center</span>
                        </div>
                        {pendingApprovalsCount > 0 ? (
                          <span className="bg-amber-500 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-medium">
                            {pendingApprovalsCount} PENDING
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] bg-[#0E4A72] text-[#F7D08A] px-2 py-0.5 rounded font-medium">
                            ADMIN
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Institutional & Directorates Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-semibold text-[#D48F29] uppercase tracking-wider">
                      {isAmharic ? "ተቋማዊ እና መምሪያዎች" : "Institutional & Directorates"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("sectors");
                      }}
                      className="text-[10px] font-mono font-medium text-[#0085C8] hover:underline"
                    >
                      {isAmharic ? "ሁሉንም ይመልከቱ →" : "View All →"}
                    </button>
                  </div>

                  {/* Core Institutional Links */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("about");
                      }}
                      aria-label="View About SSGI Overview"
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>About SSGI</span>
                      <Info className="w-3.5 h-3.5 text-[#0085C8]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("mission");
                      }}
                      aria-label="View Mission and Mandate"
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Mission &amp; Mandate</span>
                      <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("focus");
                      }}
                      aria-label="View Focus Areas"
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Focus Areas</span>
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick("contact");
                      }}
                      aria-label="View Contact Us details"
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                    >
                      <span>Contact &amp; Stations</span>
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </div>

                  {/* Scientific Directorates Navigation */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavClick("sectors");
                    }}
                    aria-label="View All Scientific Directorates"
                    className="w-full p-2.5 bg-[#0E4A72]/10 hover:bg-[#0E4A72]/20 rounded-xl border border-[#0E4A72]/30 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0085C8]"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#D48F29]" />
                      <span>{isAmharic ? "ሁሉም 4ቱ ሳይንሳዊ መምሪያዎች" : "Scientific Directorates (4 Wings)"}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#0E4A72]" />
                  </button>
                </div>

                {/* Official Announcements & Gazettes in Mobile Menu */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-semibold text-[#D48F29] uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#D48F29]" />
                      {isAmharic ? "ይፋዊ ማስታወቂያዎችና ጋዜጦች" : "Announcements & Gazettes"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onSelectAnnouncement) onSelectAnnouncement(null);
                        handleNavClick("announcements");
                      }}
                      className="text-[10px] font-mono font-medium text-[#0085C8] hover:underline cursor-pointer"
                    >
                      {isAmharic ? "ሁሉንም ይመልከቱ →" : "View All →"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onSelectAnnouncement) onSelectAnnouncement(null);
                      handleNavClick("announcements");
                    }}
                    aria-label="View All Announcements & Gazettes"
                    className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200/80 text-left font-semibold text-xs text-[#0E4A72] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D48F29]"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D48F29]" />
                      <span>{isAmharic ? "የኢንስቲትዩቱ ይፋዊ ማስታወቂያዎች" : "Official Bulletins & Public Notices"}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D48F29]" />
                  </button>
                </div>

                {/* Official Social Channels in Mobile Menu */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-mono font-semibold text-[#0E4A72] uppercase tracking-wider block mb-2 px-1">
                    {isAmharic ? "ይፋዊ ማህበራዊ ሚዲያዎች" : "Official Social Channels"}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <a
                      href="https://twitter.com/ssgi2022"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 border border-slate-200 text-[#0E4A72] transition-colors"
                      title="Twitter / X"
                    >
                      <Twitter className="w-4 h-4 text-[#0085C8] mb-1" />
                      <span className="text-[9px] font-medium">Twitter</span>
                    </a>
                    <a
                      href="https://t.me/spacegeospatial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 border border-slate-200 text-[#0E4A72] transition-colors"
                      title="Telegram"
                    >
                      <Send className="w-4 h-4 text-sky-500 mb-1" />
                      <span className="text-[9px] font-medium">Telegram</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/space-science-and-geospatial-institute-ssgi-37b48623a"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 border border-slate-200 text-[#0E4A72] transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 text-blue-700 mb-1" />
                      <span className="text-[9px] font-medium">LinkedIn</span>
                    </a>
                    <a
                      href="https://www.youtube.com/@ssgi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-[#0085C8]/10 border border-slate-200 text-[#0E4A72] transition-colors"
                      title="YouTube"
                    >
                      <Youtube className="w-4 h-4 text-rose-600 mb-1" />
                      <span className="text-[9px] font-medium">YouTube</span>
                    </a>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AboutUsModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        initialTab={aboutModalTab}
      />

      <SectorDetailModal
        sector={selectedSector}
        isOpen={showSectorModal}
        onClose={() => {
          setShowSectorModal(false);
          setSelectedSector(null);
        }}
        onNavigateToTab={(tab) => handleNavClick(tab)}
      />

      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={showAnnouncementModal}
        onClose={() => {
          setShowAnnouncementModal(false);
          setSelectedAnnouncement(null);
        }}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectSector={(sec) => {
          setSelectedSector(sec);
          setShowSectorModal(true);
        }}
        onSelectAnnouncement={(ann) => {
          setSelectedAnnouncement(ann);
          setShowAnnouncementModal(true);
        }}
        onNavigateTab={(tab) => handleNavClick(tab)}
      />

      <LicsbasGuideModal
        isOpen={showLicsbasGuideModal}
        onClose={() => setShowLicsbasGuideModal(false)}
      />

      <NotificationCenterModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onNavigateToEvent={handleNotificationNavigation}
      />
    </header>
  );
}
