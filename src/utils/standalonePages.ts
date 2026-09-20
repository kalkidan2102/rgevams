export type StandalonePageKey =
  | "home"
  | "dashboard"
  | "map"
  | "analytics"
  | "report"
  | "gallery"
  | "about"
  | "focus"
  | "contact"
  | "mission";

const PAGE_ROUTES: Record<StandalonePageKey, string> = {
  home: "/home",
  dashboard: "/dashboard.html",
  map: "/gis-map",
  analytics: "/analytics.html",
  report: "/report.html",
  gallery: "/gallery.html",
  about: "/about-us.html",
  focus: "/about-focus.html",
  contact: "/about-contact.html",
  mission: "/about-mission.html",
};

export function getStandalonePageRoute(key: StandalonePageKey) {
  return PAGE_ROUTES[key] ?? PAGE_ROUTES.home;
}

export function openStandalonePage(key: StandalonePageKey) {
  const route = getStandalonePageRoute(key);

  if (typeof window !== "undefined") {
    window.open(route, "_blank", "noopener,noreferrer");
  }
}
