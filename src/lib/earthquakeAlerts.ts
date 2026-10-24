export const USGS_ALERT_SOURCE = "USGS Real-time Telemetry Ingest";
export const USGS_ALERT_MAX_AGE_MS = 15 * 60 * 1000;

export interface EarthquakeAlertDispatch {
  id?: string;
  eventId?: string;
  source?: string;
  timestamp?: string;
  magnitude?: number;
  location?: string;
  severity?: "Red" | "Orange";
}

interface AlertSeenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function isRecentUSGSEvent(
  event: { id?: unknown; dateTime?: unknown },
  now = Date.now(),
): boolean {
  if (typeof event.id !== "string" || event.id.trim().length === 0) return false;
  if (typeof event.dateTime !== "string") return false;

  const eventTime = new Date(event.dateTime).getTime();
  return (
    Number.isFinite(eventTime) &&
    eventTime <= now &&
    now - eventTime <= USGS_ALERT_MAX_AGE_MS
  );
}

export function isRecentUSGSDispatch(
  dispatch: EarthquakeAlertDispatch,
  now = Date.now(),
): boolean {
  if (
    dispatch.source !== USGS_ALERT_SOURCE ||
    typeof dispatch.eventId !== "string" ||
    dispatch.eventId.length === 0 ||
    typeof dispatch.timestamp !== "string"
  ) {
    return false;
  }

  const dispatchedAt = new Date(dispatch.timestamp).getTime();
  return (
    Number.isFinite(dispatchedAt) &&
    dispatchedAt <= now &&
    now - dispatchedAt <= USGS_ALERT_MAX_AGE_MS
  );
}

export function hasDispatchForEventId(
  dispatches: EarthquakeAlertDispatch[],
  eventId: string,
): boolean {
  return dispatches.some((dispatch) => dispatch.eventId === eventId);
}

export function getUSGSAlertSeenStorageKey(email: string): string {
  return `essgi_notified_earthquake_ids:${encodeURIComponent(email.trim().toLowerCase())}`;
}

export function getSeenUSGSEventIds(
  storage: AlertSeenStorage,
  email: string,
  now = Date.now(),
): Set<string> {
  try {
    const saved = storage.getItem(getUSGSAlertSeenStorageKey(email));
    if (!saved) return new Set();

    const seenAtByEventId = JSON.parse(saved);
    if (!seenAtByEventId || typeof seenAtByEventId !== "object") {
      return new Set();
    }

    return new Set(
      Object.entries(seenAtByEventId)
        .filter(
          ([, seenAt]) =>
            typeof seenAt === "number" &&
            Number.isFinite(seenAt) &&
            seenAt <= now &&
            now - seenAt <= USGS_ALERT_MAX_AGE_MS,
        )
        .map(([eventId]) => eventId),
    );
  } catch {
    return new Set();
  }
}

export function getUnseenRecentUSGSDispatches(
  dispatches: EarthquakeAlertDispatch[],
  seenEventIds: Set<string>,
  now = Date.now(),
): EarthquakeAlertDispatch[] {
  return dispatches.filter(
    (dispatch) =>
      isRecentUSGSDispatch(dispatch, now) &&
      !seenEventIds.has(dispatch.eventId as string),
  );
}

export function markUSGSDispatchesSeen(
  storage: AlertSeenStorage,
  email: string,
  dispatches: EarthquakeAlertDispatch[],
  now = Date.now(),
): void {
  try {
    const seenAtByEventId: Record<string, number> = {};
    const saved = storage.getItem(getUSGSAlertSeenStorageKey(email));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        Object.entries(parsed).forEach(([eventId, seenAt]) => {
          if (
            typeof seenAt === "number" &&
            Number.isFinite(seenAt) &&
            seenAt <= now &&
            now - seenAt <= USGS_ALERT_MAX_AGE_MS
          ) {
            seenAtByEventId[eventId] = seenAt;
          }
        });
      }
    }

    dispatches.forEach((dispatch) => {
      if (isRecentUSGSDispatch(dispatch, now) && dispatch.eventId) {
        seenAtByEventId[dispatch.eventId] = new Date(
          dispatch.timestamp as string,
        ).getTime();
      }
    });

    storage.setItem(
      getUSGSAlertSeenStorageKey(email),
      JSON.stringify(seenAtByEventId),
    );
  } catch {
    // In-memory deduplication in the caller remains available if storage is blocked.
  }
}
