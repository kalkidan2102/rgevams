import { getPostgresEarthquakes } from "./postgres.service";
import { processEarthquakeAlert } from "./alert.service";
import { IEarthquake } from "../models/Earthquake";

export async function fetchLiveAndHistoricalEarthquakes() {
  try {
    // Look back dynamically (60 days) relative to current system time
    const now = new Date();
    const lookbackDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const starttime = lookbackDate.toISOString().split("T")[0];
    const usgsUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=3&maxlatitude=15&minlongitude=33&maxlongitude=48&minmagnitude=2.5&starttime=${starttime}&orderby=time`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch(usgsUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`USGS server returned status ${response.status}`);
    }

    const usgsData = await response.json();

    const usgsEvents: IEarthquake[] = (usgsData.features || []).map((feat: any) => {
      const coords = feat.geometry.coordinates; // [lng, lat, depth]
      const props = feat.properties;
      const magnitude = props.mag;

      // Determine severity based on magnitude
      let severity = "Green";
      if (magnitude >= 5.5) severity = "Red";
      else if (magnitude >= 4.5) severity = "Orange";
      else if (magnitude >= 3.5) severity = "Yellow";

      return {
        id: feat.id,
        magnitude: props.mag,
        location: props.place || "Ethiopia-East Africa region",
        coordinates: [coords[1], coords[0]], // convert [lng, lat] to [lat, lng]
        depth: coords[2] || 10,
        dateTime: new Date(props.time).toISOString(),
        severity,
        description: `Source USGS. Felt intensity: ${props.felt || "unreported"}. Significance score: ${props.sig || "low"}.`,
        isHistorical: false
      };
    });

    // Check for qualifying events and trigger automated geohazard dispatch alerts
    for (const ue of usgsEvents) {
      if (ue.magnitude >= 4.0) {
        await processEarthquakeAlert(ue, "USGS Real-time Telemetry Ingest");
      }
    }

    // Merge with high-value historical monitored earthquakes in Ethiopia from PostgreSQL
    const historical = await getPostgresEarthquakes();
    const combined = [...historical, ...usgsEvents];

    // Sort by dateTime descending
    combined.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    return {
      success: true,
      count: combined.length,
      realTimeCount: usgsEvents.length,
      historicalCount: historical.length,
      data: combined
    };
  } catch {
    const historical = await getPostgresEarthquakes();
    return {
      success: true,
      fallbackMode: true,
      count: historical.length,
      realTimeCount: 0,
      historicalCount: historical.length,
      data: historical
    };
  }
}

