import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "am";

export interface Translations {
  // Brand & Institute
  instituteName: string;
  instituteShort: string;
  departmentName: string;
  departmentShort: string;
  portalSubtitle: string;

  // Nav items
  navHome: string;
  navAboutUs: string;
  navFocusAreas: string;
  navSectors: string;
  navCockpit: string;
  navRealTimeHazards: string;
  navInSAR: string;
  navAnnouncements: string;
  navReports: string;
  navStaffDashboard: string;
  navAdminDashboard: string;
  navContactUs: string;
  navGeoPortal: string;
  navAlerts: string;

  // Geodesy & Geodynamics Department terminology
  geodesy: string;
  geodynamics: string;
  seismology: string;
  volcanology: string;
  satelliteGeodesy: string;
  gnssNetwork: string;
  corsStation: string;
  tectonicRift: string;
  groundDeformation: string;
  interferometry: string;
  remoteSensing: string;
  geomagneticObservatory: string;
  gravitySurvey: string;
  crustalMotion: string;
  broadbandSeismic: string;
  earlyWarning: string;

  // Top Bar & Controls
  languageLabel: string;
  toggleLanguageTooltip: string;
  switchToAmharic: string;
  switchToEnglish: string;
  themeToggle: string;
  login: string;
  logout: string;
  search: string;
  searchPlaceholder: string;
  roleClearance: string;
  guestUser: string;

  // Status & Metrics
  activeVolcanoes: string;
  recentEarthquakes: string;
  gnssStationsActive: string;
  highRiskZones: string;
  alertLevel: string;
  normal: string;
  elevated: string;
  critical: string;
  liveTelemetry: string;
  liveFeed: string;
  lastUpdated: string;
  magnitude: string;
  depth: string;
  coordinates: string;
  region: string;
  epicenter: string;
  timestamp: string;

  // Actions
  viewDetails: string;
  viewMap: string;
  viewCatalog: string;
  downloadReport: string;
  exportPdf: string;
  filter: string;
  refresh: string;
  close: string;
  submit: string;
  save: string;
  cancel: string;
  back: string;
  exploreMore: string;

  // Hero & Homepage
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroCtaExplore: string;
  heroCtaInSAR: string;
  heroCtaMap: string;

  // Department Highlights
  directorateMissionTitle: string;
  directorateMissionDesc: string;
  keyFunctionsTitle: string;
  activeProjectsTitle: string;
  stationNetworkTitle: string;

  // Emergency & Advisories
  geohazardAdvisoryTitle: string;
  seismicAdvisoryDesc: string;
  volcanicAdvisoryDesc: string;
  publicSafetyNotice: string;

  // Cockpit & Tools
  cockpitTitle: string;
  cockpitSubtitle: string;
  overviewTab: string;
  volcanoesTab: string;
  earthquakesTab: string;
  gnssTab: string;
  furiTab: string;
  cometPortalTab: string;
  gisOperationsTab: string;
  timelineTab: string;
  geospatialGalleryTab: string;
  superAdminTab: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Brand & Institute
    instituteName: "Space Science and Geospatial Institute",
    instituteShort: "SSGI",
    departmentName: "Department of Geodesy and Geodynamics",
    departmentShort: "DGD",
    portalSubtitle: "Real-Time Geological & Geodetic Hazard Monitoring and Observatory System",

    // Nav items
    navHome: "Home",
    navAboutUs: "About SSGI",
    navFocusAreas: "Focus Areas",
    navSectors: "Sectors",
    navCockpit: "Monitoring Cockpit",
    navRealTimeHazards: "Real-Time Hazards",
    navInSAR: "InSAR Radar Analysis",
    navAnnouncements: "Announcements",
    navReports: "Report Studio",
    navStaffDashboard: "Staff Portal",
    navAdminDashboard: "Admin Portal",
    navContactUs: "Contact Us",
    navGeoPortal: "Geo-Portal GIS",
    navAlerts: "Alerts",

    // Geodesy & Geodynamics Department terminology
    geodesy: "Geodesy",
    geodynamics: "Geodynamics",
    seismology: "Seismology & Tectonics",
    volcanology: "Volcanology & Geothermal",
    satelliteGeodesy: "Satellite Geodesy & GNSS",
    gnssNetwork: "CORS GNSS Network",
    corsStation: "Continuously Operating Reference Station",
    tectonicRift: "Main Ethiopian Rift (MER)",
    groundDeformation: "Ground Surface Deformation",
    interferometry: "Synthetic Aperture Radar Interferometry (InSAR)",
    remoteSensing: "Remote Sensing & Earth Observation",
    geomagneticObservatory: "Geomagnetic Observatory",
    gravitySurvey: "Absolute & Relative Gravimetry",
    crustalMotion: "Crustal Plate Motion Velocity",
    broadbandSeismic: "Broadband Seismic Array",
    earlyWarning: "Geohazard Early Warning System",

    // Top Bar & Controls
    languageLabel: "Language",
    toggleLanguageTooltip: "Switch interface language between English and Amharic",
    switchToAmharic: "አማርኛ",
    switchToEnglish: "English",
    themeToggle: "Toggle Theme",
    login: "Login",
    logout: "Sign Out",
    search: "Search",
    searchPlaceholder: "Search geohazards, GNSS stations, telemetry...",
    roleClearance: "Role Clearance",
    guestUser: "Guest Geophysicist",

    // Status & Metrics
    activeVolcanoes: "Active Volcanoes",
    recentEarthquakes: "Recent Earthquakes",
    gnssStationsActive: "Active GNSS Stations",
    highRiskZones: "High-Risk Rift Zones",
    alertLevel: "Alert Level",
    normal: "Normal / Quiet",
    elevated: "Elevated / Watch",
    critical: "Critical Warning",
    liveTelemetry: "Live Telemetry",
    liveFeed: "LIVE FEED",
    lastUpdated: "Last Updated",
    magnitude: "Magnitude (Mw/ML)",
    depth: "Focal Depth",
    coordinates: "Coordinates",
    region: "Geographic Region",
    epicenter: "Epicenter Location",
    timestamp: "UTC Timestamp",

    // Actions
    viewDetails: "View Details",
    viewMap: "View on Map",
    viewCatalog: "View Full Catalog",
    downloadReport: "Download Report",
    exportPdf: "Export PDF",
    filter: "Filter",
    refresh: "Refresh Telemetry",
    close: "Close",
    submit: "Submit Assessment",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    exploreMore: "Explore Sector",

    // Hero & Homepage
    heroTitle: "Real-Time Geological & Geodetic Hazard Surveillance",
    heroSubtitle: "National satellite geodesy, seismic array telemetry, InSAR crustal deformation analysis, and volcanic gas flux monitoring across the East African Rift System.",
    heroBadge: "Geodesy & Geodynamics Directorate",
    heroCtaExplore: "Launch Monitoring Cockpit",
    heroCtaInSAR: "InSAR Radar Studio",
    heroCtaMap: "Interactive 3D Hazard Map",

    // Department Highlights
    directorateMissionTitle: "Geodesy & Geodynamics Directorate Mandate",
    directorateMissionDesc: "Providing the Federal Democratic Republic of Ethiopia with accurate geodetic reference frames, continuous GNSS crustal deformation tracking, seismic threat quantification, and rapid geohazard early warning.",
    keyFunctionsTitle: "Statutory Functions",
    activeProjectsTitle: "Active Strategic Projects",
    stationNetworkTitle: "National Observation Networks",

    // Emergency & Advisories
    geohazardAdvisoryTitle: "Active Rift Valley Geohazard Advisory",
    seismicAdvisoryDesc: "Broadband stations recording localized micro-seismicity along the Afar Depression and Main Ethiopian Rift axial grabens.",
    volcanicAdvisoryDesc: "Continuous thermal infrared and SO2 gas flux monitoring at active centers including Erta Ale, Dabbahu, and Aluto.",
    publicSafetyNotice: "Official bulletins issued in coordination with the Disaster Risk Management Commission (DRMC).",

    // Cockpit & Tools
    cockpitTitle: "Geodesy & Geodynamics Cockpit",
    cockpitSubtitle: "Multi-Source Geoscientific Intelligence & Early Warning Hub",
    overviewTab: "Executive Overview",
    volcanoesTab: "Volcanic Centers",
    earthquakesTab: "Seismic Catalog",
    gnssTab: "GNSS Geodesy Network",
    furiTab: "FURI Seismometer Waveforms",
    cometPortalTab: "COMET / LiCSBAS InSAR Portal",
    gisOperationsTab: "GIS Operations Room",
    timelineTab: "Hazard Timeline",
    geospatialGalleryTab: "Geospatial Gallery",
    superAdminTab: "System Administration"
  },
  am: {
    // Brand & Institute
    instituteName: "የስፔስ ሳይንስ እና ጂኦስፓሻል ኢንስቲትዩት",
    instituteShort: "ኢስፔጂአይ",
    departmentName: "የጂኦዴሲ እና ጂኦዳይናሚክስ መምሪያ",
    departmentShort: "ጂኦዳይናሚክስ",
    portalSubtitle: "የቀጥታ ስርጭት የጂኦሎጂካል እና የጂኦዴቲክ አደጋዎች ክትትልና ኦብዘርቫቶሪ ሲስተም",

    // Nav items
    navHome: "ዋና ገጽ",
    navAboutUs: "ስለ ኢንስቲትዩቱ",
    navFocusAreas: "የትኩረት መስኮች",
    navSectors: "ዘርፎችና መምሪያዎች",
    navCockpit: "የክትትል ክፍል",
    navRealTimeHazards: "የቀጥታ አደጋዎች",
    navInSAR: "የኢንሳር ራዳር ትንተና",
    navAnnouncements: "ማስታወቂያዎች",
    navReports: "ሪፖርት ማመንጫ",
    navStaffDashboard: "የባለሙያዎች ፖርታል",
    navAdminDashboard: "የአስተዳደር ፖርታል",
    navContactUs: "ያግኙን",
    navGeoPortal: "ጂኦ-ፖርታል ጂአይኤስ",
    navAlerts: "ማስጠንቀቂያዎች",

    // Geodesy & Geodynamics Department terminology
    geodesy: "ጂኦዴሲ",
    geodynamics: "ጂኦዳይናሚክስ",
    seismology: "ሴይስሞሎጂ እና ቴክቶኒክስ",
    volcanology: "ቮልካኖሎጂ እና የከርሰ ምድር ሙቀት",
    satelliteGeodesy: "የሳተላይት ጂኦዴሲ እና ጂኤንኤስኤስ",
    gnssNetwork: "የኮርስ (CORS) ጂኤንኤስኤስ ኔትወርክ",
    corsStation: "ቀጣይነት ያለው የሳተላይት መቆጣጠሪያ ጣቢያ",
    tectonicRift: "ዋናው የኢትዮጵያ ስምጥ ሸለቆ",
    groundDeformation: "የመሬት ገጽታ መዛባት እና እንቅስቃሴ",
    interferometry: "የራዳር ኢንተርፌሮሜትሪ (InSAR)",
    remoteSensing: "የሪሞት ሴንሲንግ እና የሳተላይት ምልከታ",
    geomagneticObservatory: "የጂኦማግኔቲክ ኦብዘርቫቶሪ",
    gravitySurvey: "የስበት ኃይል (ግራቪቲ) ቅየሳ",
    crustalMotion: "የመሬት ንጣፍ የመንቀሳቀስ ፍጥነት",
    broadbandSeismic: "ብሮድባንድ የመሬት መንቀጥቀጥ መከታተያ",
    earlyWarning: "የቅድመ ማስጠንቀቂያ ስርዓት",

    // Top Bar & Controls
    languageLabel: "ቋንቋ",
    toggleLanguageTooltip: "የስርዓቱን ቋንቋ በእንግሊዝኛ እና በአማርኛ መካከል ይቀይሩ",
    switchToAmharic: "አማርኛ",
    switchToEnglish: "English",
    themeToggle: "የቀለም ገጽታ ቀይር",
    login: "ግባ",
    logout: "ውጣ",
    search: "ፈልግ",
    searchPlaceholder: "የመሬት መንቀጥቀጥ፣ እሳተ ገሞራ፣ ጂኤንኤስኤስ ጣቢያዎችን ፈልግ...",
    roleClearance: "የተጠቃሚ ደረጃ",
    guestUser: "እንግዳ ጂኦፊዚሲስት",

    // Status & Metrics
    activeVolcanoes: "ንቁ እሳተ ገሞራዎች",
    recentEarthquakes: "የቅርብ ጊዜ የመሬት መንቀጥቀጦች",
    gnssStationsActive: "ንቁ የጂኤንኤስኤስ ጣቢያዎች",
    highRiskZones: "ከፍተኛ አደጋ ያለባቸው የስምጥ ሸለቆ ዞኖች",
    alertLevel: "የማስጠንቀቂያ ደረጃ",
    normal: "መደበኛ / የተረጋጋ",
    elevated: "ከፍ ያለ / ክትትል የሚሻ",
    critical: "ከፍተኛ አስቸኳይ ማስጠንቀቂያ",
    liveTelemetry: "የቀጥታ ቴሌሜትሪ መረጃ",
    liveFeed: "የቀጥታ ስርጭት",
    lastUpdated: "የመጨረሻ ዝመና",
    magnitude: "መጠን (Magnitude)",
    depth: "ጥልቀት (Depth)",
    coordinates: "መገኛ መጋጠሚያዎች",
    region: "ክልል / ዞን",
    epicenter: "የመንቀጥቀጡ ማዕከል",
    timestamp: "የተከሰተበት ሰዓት",

    // Actions
    viewDetails: "ዝርዝሩን ተመልከት",
    viewMap: "በካርታ ላይ እይ",
    viewCatalog: "ሙሉ ካታሎግ ተመልከት",
    downloadReport: "ሪፖርት አውርድ",
    exportPdf: "ፒዲኤፍ (PDF) አውርድ",
    filter: "አጣራ",
    refresh: "መረጃ አድስ",
    close: "ዝጋ",
    submit: "ግምገማ አስገባ",
    save: "አስቀምጥ",
    cancel: "ተመለስ",
    back: "ወደ ኋላ",
    exploreMore: "ዘርፉን ተመልከት",

    // Hero & Homepage
    heroTitle: "የቀጥታ የጂኦሎጂካል እና ጂኦዴቲክ አደጋዎች ክትትልና ቅኝት",
    heroSubtitle: "የብሔራዊ የሳተላይት ጂኦዴሲ፣ የሴይስሚክ ቴሌሜትሪ፣ የኢንሳር የመሬት ቅርጽ ለውጥ ትንተና እና በእሳተ ገሞራዎች ዙሪያ የሚለቀቁ ጋዞች የቀጥታ ክትትል በኢትዮጵያ ስምጥ ሸለቆ ውስጥ።",
    heroBadge: "የጂኦዴሲ እና ጂኦዳይናሚክስ መምሪያ",
    heroCtaExplore: "የክትትል ክፍሉን ክፈት",
    heroCtaInSAR: "የኢንሳር ራዳር ስቱዲዮ",
    heroCtaMap: "ተንቀሳቃሽ 3D አደጋ ካርታ",

    // Department Highlights
    directorateMissionTitle: "የጂኦዴሲ እና ጂኦዳይናሚክስ መምሪያ ተልዕኮ",
    directorateMissionDesc: "ለኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ አስተማማኝ የጂኦዴቲክ ማመሳከሪያ ማዕቀፍ ማዘጋጀት፣ የመሬት ቅርጽ ለውጦችን በጂኤንኤስኤስ መከታተል፣ እና ፈጣን የተፈጥሮ አደጋ ቅድመ ማስጠንቀቂያ መስጠት።",
    keyFunctionsTitle: "ዋና ዋና ተግባራት",
    activeProjectsTitle: "በሂደት ላይ ያሉ ስትራቴጂካዊ ፕሮጀክቶች",
    stationNetworkTitle: "ብሔራዊ የክትትል ጣቢያዎች መረብ",

    // Emergency & Advisories
    geohazardAdvisoryTitle: "የስምጥ ሸለቆ የተፈጥሮ አደጋዎች ቅድመ ማስጠንቀቂያ",
    seismicAdvisoryDesc: "የብሮድባንድ ጣቢያዎች በአፋር እና በዋናው የኢትዮጵያ ስምጥ ሸለቆ ውስጥ የሚከሰቱ ጥቃቅን የመሬት መንቀጥቀጦችን ያለማቋረጥ እየመዘገቡ ይገኛሉ።",
    volcanicAdvisoryDesc: "እንደ ኤርታ አሌ፣ ዳባሁ እና አሉቶ ባሉ ንቁ እሳተ ገሞራዎች ላይ የሙቀት እና የጋዝ ልቀት ክትትል በቀጥታ እየተካሄደ ነው።",
    publicSafetyNotice: "ከብሔራዊ የአደጋ ስጋት አመራር ኮሚሽን (DRMC) ጋር በመተባበር የወጣ ይፋዊ መግለጫ።",

    // Cockpit & Tools
    cockpitTitle: "የጂኦዴሲ እና ጂኦዳይናሚክስ የክትትል ክፍል",
    cockpitSubtitle: "የተቀናጀ የጂኦሳይንስ መረጃ እና የቅድመ ማስጠንቀቂያ ማዕከል",
    overviewTab: "አጠቃላይ እይታ",
    volcanoesTab: "የእሳተ ገሞራ ማዕከላት",
    earthquakesTab: "የመሬት መንቀጥቀጥ ካታሎግ",
    gnssTab: "የጂኤንኤስኤስ ጂኦዴሲ ኔትወርክ",
    furiTab: "የፉሪ (FURI) ሴይስሞሜትር ሞገዶች",
    cometPortalTab: "የኮሜት (COMET) / LiCSBAS ኢንሳር ፖርታል",
    gisOperationsTab: "የጂአይኤስ ኦፕሬሽንስ ክፍል",
    timelineTab: "የአደጋዎች የጊዜ ሰሌዳ",
    geospatialGalleryTab: "የጂኦስፓሻል ጋለሪ",
    superAdminTab: "የስርዓት አስተዳደር"
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations, fallback?: string) => string;
  isAmharic: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "essgi_dgd_ui_language";

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === "en" || saved === "am") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "am" : "en");
  };

  const t = (key: keyof Translations, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && key in langDict) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS.en;
    if (enDict && key in enDict) {
      return enDict[key];
    }
    return fallback || (key as string);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isAmharic: language === "am"
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
