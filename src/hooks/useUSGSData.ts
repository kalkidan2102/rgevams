import { useState, useEffect, useCallback, useRef } from "react";
import { Earthquake, SeverityLevel } from "../types";

export interface UseUSGSDataOptions {
  daysLookback?: number;
  minMagnitude?: number;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  backoffFactor?: number;
  autoRefreshMs?: number;
}

export interface UseUSGSDataReturn {
  earthquakes: Earthquake[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  isRetrying: boolean;
  lastSuccessTime: Date | null;
  isUsingFallbackData: boolean;
  maxRetries: number;
  refetch: (manualReset?: boolean) => Promise<void>;
  statusMessage: string;
}

export function useUSGSData(options: UseUSGSDataOptions = {}): UseUSGSDataReturn {
  const {
    daysLookback = 180,
    minMagnitude = 2.0,
    minLatitude = 3.0,
    maxLatitude = 15.0,
    minLongitude = 33.0,
    maxLongitude = 48.0,
    maxRetries = 3,
    retryDelayMs = 2000,
    backoffFactor = 1.5,
    autoRefreshMs = 300000, // 5 minutes
  } = options;

  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [lastSuccessTime, setLastSuccessTime] = useState<Date | null>(null);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing USGS stream link...");

  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const fetchUSGSDataWithRetry = useCallback(
    async (attempt = 0, isManualTrigger = false): Promise<void> => {
      if (!isMountedRef.current) return;

      if (attempt === 0) {
        setLoading(true);
        setError(null);
        setRetryCount(0);
        setIsRetrying(false);
        setStatusMessage("Fetching live USGS earthquake feed...");
      }

      try {
        const now = new Date();
        const lookbackDate = new Date(now.getTime() - daysLookback * 24 * 60 * 60 * 1000);
        const starttime = lookbackDate.toISOString().split("T")[0];

        const usgsUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=${minLatitude}&maxlatitude=${maxLatitude}&minlongitude=${minLongitude}&maxlongitude=${maxLongitude}&minmagnitude=${minMagnitude}&starttime=${starttime}&orderby=time`;

        // Abort previous request if active
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const timeoutId = setTimeout(() => controller.abort(), 9000);

        let response;
        try {
          response = await fetch(usgsUrl, { signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error(`USGS HTTP ${response.status} (${response.statusText || "Server error"})`);
        }

        const usgsData = await response.json();
        if (!isMountedRef.current) return;

        const mappedEvents: Earthquake[] = (usgsData.features || []).map((feat: any) => {
          const coords = feat.geometry.coordinates; // [lng, lat, depth]
          const props = feat.properties;
          const magnitude = props.mag || 0;

          // Determine severity based on magnitude
          let severity: SeverityLevel = "Green";
          if (magnitude >= 5.5) severity = "Red";
          else if (magnitude >= 4.5) severity = "Orange";
          else if (magnitude >= 3.5) severity = "Yellow";

          return {
            id: feat.id,
            magnitude: props.mag,
            location: props.place || "East Africa region",
            coordinates: [coords[1], coords[0]], // convert [lng, lat] to [lat, lng]
            depth: coords[2] || 10,
            dateTime: new Date(props.time).toISOString(),
            severity,
            description: `Direct USGS Live Feed. Felt intensity: ${props.felt || "unreported"}. Significance score: ${props.sig || "low"}.`,
            isHistorical: false,
          };
        });

        setEarthquakes(mappedEvents);
        setError(null);
        setRetryCount(0);
        setIsRetrying(false);
        setLastSuccessTime(new Date());
        setIsUsingFallbackData(false);
        setStatusMessage(`Live USGS stream connected (${mappedEvents.length} events synced).`);
      } catch (err: any) {
        if (!isMountedRef.current) return;

        const isAbort = err.name === "AbortError";
        const errorMsg = isAbort ? "Request timed out after 9 seconds." : (err.message || "Failed to reach USGS endpoint.");

        if (attempt < maxRetries) {
          const delay = Math.round(retryDelayMs * Math.pow(backoffFactor, attempt));
          setRetryCount(attempt + 1);
          setIsRetrying(true);
          setError(`Attempt ${attempt + 1}/${maxRetries} failed: ${errorMsg}. Retrying...`);
          setStatusMessage(`Retrying connection in ${(delay / 1000).toFixed(1)}s (Attempt ${attempt + 1}/${maxRetries})...`);

          // Schedule automatic retry
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              fetchUSGSDataWithRetry(attempt + 1, isManualTrigger);
            }
          }, delay);
        } else {
          // Max retries exceeded
          setIsRetrying(false);
          setError(`Unable to connect to live USGS servers after ${maxRetries} retries. Serving cached dataset.`);
          setStatusMessage(`Offline: Live feed unavailable (${errorMsg}). Using cached records.`);
          setIsUsingFallbackData(true);
          setLoading(false);
        }
      } finally {
        if (isMountedRef.current && !isRetrying) {
          setLoading(false);
        }
      }
    },
    [daysLookback, minMagnitude, minLatitude, maxLatitude, minLongitude, maxLongitude, maxRetries, retryDelayMs, backoffFactor]
  );

  const refetch = useCallback(
    async (manualReset = true) => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      return fetchUSGSDataWithRetry(0, manualReset);
    },
    [fetchUSGSDataWithRetry]
  );

  // Initial fetch
  useEffect(() => {
    fetchUSGSDataWithRetry(0);
  }, [fetchUSGSDataWithRetry]);

  // Optional periodic auto-refresh
  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs <= 0) return;

    const interval = setInterval(() => {
      if (isMountedRef.current && !isRetrying) {
        fetchUSGSDataWithRetry(0);
      }
    }, autoRefreshMs);

    return () => clearInterval(interval);
  }, [autoRefreshMs, isRetrying, fetchUSGSDataWithRetry]);

  return {
    earthquakes,
    loading,
    error,
    retryCount,
    isRetrying,
    lastSuccessTime,
    isUsingFallbackData,
    maxRetries,
    refetch,
    statusMessage,
  };
}

