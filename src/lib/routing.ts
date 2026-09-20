export function getPathForTab(tab: string): string {
  switch (tab) {
    case "dashboard":
    case "cockpit":
      return "/cockpit";
    case "map":
    case "gismap":
    case "gis":
      return "/Gismap";
    case "report":
    case "ai-briefing":
    case "briefing":
      return "/ai-briefing";
    case "about":
    case "about-ssgi":
    case "institutional":
      return "/about";
    case "focus":
    case "focus-area":
      return "/focus";
    case "contact":
    case "contact-us":
      return "/contact";
    case "mission":
    case "mission-mandate":
      return "/mission";
    case "sectors":
      return "/sectors";
    case "announcements":
      return "/announcements";
    case "analytics":
      return "/analytics";
    case "insar":
      return "/insar";
    case "gallery":
      return "/gallery";
    case "staff-dashboard":
      return "/staff-dashboard";
    case "researcher-dashboard":
      return "/researcher-dashboard";
    case "admin-dashboard":
      return "/admin-dashboard";
    case "home":
    default:
      return "/home";
  }
}

export function getTabFromPath(pathname: string): string {
  const cleanPath = pathname.toLowerCase().replace(/\/$/, "");
  if (cleanPath === "/gismap" || cleanPath === "/gis" || cleanPath === "/map" || cleanPath === "/gis.html") return "map";
  if (cleanPath === "/cockpit" || cleanPath === "/dashboard" || cleanPath === "/cockpit.html") return "dashboard";
  if (cleanPath === "/ai-briefing" || cleanPath === "/report" || cleanPath === "/briefing") return "report";
  if (cleanPath === "/about" || cleanPath === "/about-ssgi" || cleanPath === "/about-us" || cleanPath === "/about.html" || cleanPath === "/institutional") return "about";
  if (cleanPath === "/focus" || cleanPath === "/focus-area" || cleanPath === "/focus-areas" || cleanPath === "/focus.html") return "focus";
  if (cleanPath === "/contact" || cleanPath === "/contact-us" || cleanPath === "/contact.html") return "contact";
  if (cleanPath === "/mission" || cleanPath === "/mission-mandate") return "mission";
  if (cleanPath === "/sectors") return "sectors";
  if (cleanPath === "/announcements" || cleanPath === "/announcements.html") return "announcements";
  if (cleanPath === "/analytics") return "analytics";
  if (cleanPath === "/insar" || cleanPath === "/insar-analysis") return "insar";
  if (cleanPath === "/gallery") return "gallery";
  if (cleanPath === "/staff-dashboard") return "staff-dashboard";
  if (cleanPath === "/researcher-dashboard" || cleanPath === "/research-dashboard") return "researcher-dashboard";
  if (cleanPath === "/admin-dashboard") return "admin-dashboard";
  return "home";
}

export function navigateToTabPath(tab: string) {
  const targetPath = getPathForTab(tab);
  if (window.location.pathname !== targetPath) {
    window.history.pushState({ tab }, "", targetPath);
  }
}
