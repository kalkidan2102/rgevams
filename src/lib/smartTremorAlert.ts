/**
 * Smart Seismological Analysis and Early Warning SMS & Email Formatting Engine
 * Space Science and Geospatial Institute (SSGI) - Ethiopia
 */

export interface EthiopianHub {
  name: string;
  lat: number;
  lon: number;
  region: string;
}

export const ETHIOPIAN_HUBS: EthiopianHub[] = [
  { name: "Awash / Metehara (Southern Afar)", lat: 8.98, lon: 39.92, region: "Southern Afar / Rift" },
  { name: "Semera (Afar Capital)", lat: 11.79, lon: 41.00, region: "Central/Northern Afar" },
  { name: "Addis Ababa (National Capital)", lat: 9.03, lon: 38.74, region: "Central" },
  { name: "Adama (Nazret)", lat: 8.54, lon: 39.27, region: "Oromia / Rift" },
  { name: "Hawassa", lat: 7.05, lon: 38.48, region: "Sidama / Southern Rift" },
  { name: "Dire Dawa", lat: 9.59, lon: 41.86, region: "Eastern" },
  { name: "Mekelle", lat: 13.50, lon: 39.47, region: "Tigray" },
  { name: "Arba Minch", lat: 6.03, lon: 37.55, region: "Southern Rift" },
  { name: "Dessie / Kombolcha", lat: 11.13, lon: 39.63, region: "Amhara / Escarpment" },
  { name: "Asosa (Near GERD)", lat: 10.06, lon: 34.53, region: "Benishangul-Gumuz" },
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateCompassBearing(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const compassPoints = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(brng / 22.5) % 16;
  return compassPoints[index];
}

export interface TectonicIntelligence {
  proximityText: string;
  closestHubName: string;
  distanceKm: number;
  riftZone: string;
  faultLine: string;
  mmiRoman: string;
  mmiDescription: string;
  depthRisk: string;
  aftershockRisk: string;
}

export function calculateTectonicSummary(
  lat: number,
  lon: number,
  location: string,
  magnitude: number,
  depth: number
): TectonicIntelligence {
  // Proximity to Ethiopian cities
  let closestHub = ETHIOPIAN_HUBS[0];
  let minDistance = calculateDistanceKm(lat, lon, closestHub.lat, closestHub.lon);

  for (const hub of ETHIOPIAN_HUBS) {
    const dist = calculateDistanceKm(lat, lon, hub.lat, hub.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  const direction = calculateCompassBearing(closestHub.lat, closestHub.lon, lat, lon);
  const proximityText = `${minDistance} km ${direction} of ${closestHub.name}`;

  // Rift Sector & Structural Geodynamics
  let riftZone = "Main Ethiopian Rift (MER) Corridor";
  let faultLine = "Wonji Fault Belt (WFB) active tectonic axis";

  const locLower = (location || "").toLowerCase();
  const isAwashMetehara = locLower.includes("metah") || locLower.includes("awash") || (lat >= 8.4 && lat < 10.3 && lon >= 39.4 && lon <= 41.2);

  if (isAwashMetehara) {
    riftZone = "Southern Afar Region & Northern MER (Awash-Metehara Corridor)";
    faultLine = "Wonji Fault Belt & Fantale-Awash border fault system";
  } else if (lat >= 10.5 && lon >= 40.0) {
    riftZone = "Central/Northern Afar Depression & Danakil Graben (Semera-Tendaho-Erta Ale Corridor)";
    faultLine = "Dabbahu-Erta Ale magmatic-tectonic spreading segment";
  } else if (lat >= 8.5 && lat < 10.5 && lon >= 38.5) {
    riftZone = "Northern Main Ethiopian Rift (Fentale-Awash Basin)";
    faultLine = "Wonji Fault Belt & Fantale-Dofan volcanic axis";
  } else if (lat >= 7.0 && lat < 8.5 && lon >= 38.0) {
    riftZone = "Central Main Ethiopian Rift (Ziway-Langano-Aluto Basin)";
    faultLine = "Aluto-Langano geothermal fault zone";
  } else if (lat < 7.0 && lon < 38.5) {
    riftZone = "Southern Main Ethiopian Rift (Hawassa-Chamo Basin)";
    faultLine = "Ganjii-Chamo boundary fault system";
  } else if (lon < 38.0) {
    riftZone = "Western Ethiopian Plateau & Escarpment";
    faultLine = "Western Marginal Escarpment fault system";
  }

  // Modified Mercalli Intensity
  let mmiRoman = "IV";
  let mmiDescription = "Light - felt indoors, hanging objects swing";
  if (magnitude < 3.5) {
    mmiRoman = "III";
    mmiDescription = "Weak - felt slightly indoors by few people";
  } else if (magnitude < 4.5) {
    mmiRoman = "IV";
    mmiDescription = "Light - felt by many indoors, windows rattle";
  } else if (magnitude < 5.2) {
    mmiRoman = "V";
    mmiDescription = "Moderate - felt widely outdoors, small objects displaced";
  } else if (magnitude < 6.0) {
    mmiRoman = "VI";
    mmiDescription = "Strong - felt by all, light plaster cracking in masonry structures";
  } else if (magnitude < 6.8) {
    mmiRoman = "VII";
    mmiDescription = "Very Strong - considerable damage to poorly built buildings";
  } else {
    mmiRoman = "VIII+";
    mmiDescription = "Severe / Violent - heavy structural damage along fault scarps";
  }

  // Focal depth rupture risk
  let depthRisk = "Shallow Crustal Rupture (<15km): Strongest surface ground acceleration potential.";
  if (depth > 35) {
    depthRisk = "Deep Lithospheric Event (>35km): Attenuated surface displacement risk.";
  } else if (depth > 15) {
    depthRisk = "Mid-Crustal Tectonic Slip (15-35km): Moderate regional ground motion wave.";
  }

  // Aftershock probability
  let aftershockRisk = "Low background aftershock rate anticipated.";
  if (magnitude >= 5.5) {
    aftershockRisk = "HIGH PROBABILITY: Elevated aftershock swarm likely over next 72h within a 40km radius.";
  } else if (magnitude >= 4.5) {
    aftershockRisk = "MODERATE: Expect felt aftershocks in the vicinity within 24-48 hours.";
  }

  return {
    proximityText,
    closestHubName: closestHub.name,
    distanceKm: minDistance,
    riftZone,
    faultLine,
    mmiRoman,
    mmiDescription,
    depthRisk,
    aftershockRisk
  };
}

export interface SmartTremorAlertData {
  eventId: string;
  magnitude: number;
  depth: number;
  location: string;
  coordinates: [number, number];
  dateTime: string;
  timeEat: string;
  dateEat: string;
  tectonic: TectonicIntelligence;
  smsEn: string;
  smsAm: string;
  emailSubject: string;
  emailHtml: string;
  telemetryLink: string;
}

export function formatSmartTremorMessages(eq: any, customConfig?: any): SmartTremorAlertData {
  const mag = Number(eq.magnitude || 4.5).toFixed(1);
  const depth = Number(eq.depth || 10);
  const loc = eq.location || "East African Rift Zone";
  const coords: [number, number] = Array.isArray(eq.coordinates) && eq.coordinates.length === 2 
    ? [eq.coordinates[0], eq.coordinates[1]] 
    : [9.03, 38.74];

  const tectonic = calculateTectonicSummary(coords[0], coords[1], loc, parseFloat(mag), depth);

  const eventDate = eq.dateTime ? new Date(eq.dateTime) : new Date();
  const timeEat = eventDate.toLocaleTimeString("en-US", { 
    timeZone: "Africa/Addis_Ababa", 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit", 
    hour12: true 
  });
  const dateEat = eventDate.toLocaleDateString("en-US", {
    timeZone: "Africa/Addis_Ababa",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const eventId = eq.id || `eq_${Date.now()}`;
  const telemetryLink = `https://ssgi.gov.et/telemetry/eq/${eventId}`;

  // Smart English SMS
  const smsEn = `[ESSGI/DRMC URGENT] M${mag} Earthquake detected by live USGS at depth ${depth}km near ${loc} (${tectonic.proximityText}) on ${dateEat} ${timeEat} EAT. Shaking: MMI ${tectonic.mmiRoman}. Zone: ${tectonic.riftZone}. ADVISORY: Move to open spaces; expect aftershocks; avoid damaged masonry. Telemetry: ${telemetryLink}`;

  // Smart Amharic SMS (አማርኛ)
  const smsAm = `[የኢስፔሳ/አደጋ ስጋት አስቸኳይ] በUSGS የቀጥታ ቴሌሜትሪ ${loc} አካባቢ በ${depth}ኪሜ ጥልቀት የሬክተር ስኬል ${mag} የመሬት መንቀጥቀጥ ተመዝግቧል (${timeEat} EAT)። የመንቀጥቀጥ መጠን፡ MMI ${tectonic.mmiRoman}። ጥንቃቄ፡ ከህንፃዎችና ገደላማ ቦታዎች ይራቁ። ተጨማሪ መረጃ፡ ${telemetryLink}`;

  // Rich Official HTML Email
  const emailSubject = `[ESSGI CRITICAL GEOHAZARD] USGS Live Tremor: M${mag} (${loc}) - Focal Depth ${depth}km`;
  const isHighSeverity = parseFloat(mag) >= 5.0;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0E4A72 0%, #07263c 100%); color: #ffffff; padding: 20px 24px; border-bottom: 3px solid #D48F29;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #F7D08A;">
          Federal Democratic Republic of Ethiopia
        </span>
        <span style="font-size: 10px; font-family: monospace; background: rgba(212, 143, 41, 0.25); color: #F7D08A; padding: 2px 8px; border-radius: 4px; border: 1px solid #D48F29;">
          EOC CODE: SSGI-EQ-${Date.now().toString().slice(-6)}
        </span>
      </div>
      <h1 style="margin: 0; font-size: 19px; font-weight: 700; line-height: 1.3;">
        Space Science and Geospatial Institute (SSGI)
      </h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">
        National Geohazards Early Warning & Seismic Risk Reduction Directorate
      </p>
    </div>

    <!-- Alert Severity Ribbon -->
    <div style="background: ${isHighSeverity ? '#ef4444' : '#f97316'}; color: #ffffff; padding: 10px 24px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
      <span>⚡ LIVE USGS SEISMIC TREMOR DETECTED &bull; M ${mag} RICHTER</span>
      <span style="font-size: 11px; font-family: monospace; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">
        ${tectonic.mmiRoman} (${tectonic.mmiDescription.split(' - ')[0]})
      </span>
    </div>

    <!-- Event Key Metrics -->
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #0E4A72; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        1. Hypocentral Event Parameters
      </h2>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="background: #f8fafc;">
          <td style="padding: 10px 12px; font-weight: 600; color: #475569; width: 35%; border: 1px solid #e2e8f0;">Magnitude (Richter / Mw)</td>
          <td style="padding: 10px 12px; font-weight: 700; color: #0E4A72; border: 1px solid #e2e8f0; font-size: 14px;">M ${mag}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Hypocentral Depth</td>
          <td style="padding: 10px 12px; font-weight: 600; color: #1e293b; border: 1px solid #e2e8f0;">${depth} km (${tectonic.depthRisk})</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 10px 12px; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Epicenter Location</td>
          <td style="padding: 10px 12px; font-weight: 600; color: #1e293b; border: 1px solid #e2e8f0;">${loc}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Proximity to Hubs</td>
          <td style="padding: 10px 12px; font-weight: 600; color: #0085C8; border: 1px solid #e2e8f0;">${tectonic.proximityText}</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 10px 12px; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Coordinates</td>
          <td style="padding: 10px 12px; font-family: monospace; color: #1e293b; border: 1px solid #e2e8f0;">${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Origin Timestamp</td>
          <td style="padding: 10px 12px; font-family: monospace; color: #1e293b; border: 1px solid #e2e8f0;">${dateEat} &bull; ${timeEat} EAT (UTC+3)</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 10px 12px; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Data Source</td>
          <td style="padding: 10px 12px; font-weight: 600; color: #166534; border: 1px solid #e2e8f0;">Live USGS Global Seismographic Network &plus; ESSGI Ingest</td>
        </tr>
      </table>

      <h2 style="margin: 20px 0 12px 0; font-size: 16px; color: #0E4A72; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        2. Tectonic Interpretation & Rift Dynamics
      </h2>
      <div style="background: #e0f2fe; border-left: 4px solid #0085C8; padding: 12px 16px; border-radius: 4px; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
        <strong style="color: #0369a1;">Geotectonic Zone:</strong> ${tectonic.riftZone}<br/>
        <strong style="color: #0369a1;">Active Structure:</strong> ${tectonic.faultLine}<br/>
        <strong style="color: #0369a1;">Estimated Shaking:</strong> ${tectonic.mmiDescription}<br/>
        <strong style="color: #0369a1;">Aftershock Alert:</strong> ${tectonic.aftershockRisk}
      </div>

      <h2 style="margin: 20px 0 12px 0; font-size: 16px; color: #0E4A72; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        3. Civil Defense Directives (DRMC Protocols)
      </h2>
      <ol style="font-size: 13px; line-height: 1.6; margin: 0 0 24px 0; padding-left: 20px; color: #334155;">
        <li><strong>Open Space Clearance:</strong> Personnel in affected zones should exit unreinforced masonry structures and stay clear of power lines, masonry fences, and steep escarpment slopes.</li>
        <li><strong>Aftershock Preparedness:</strong> Expect potential aftershock swarms over the next 24-72 hours within a 35 km radius of the rupture.</li>
        <li><strong>Infrastructure Assessment:</strong> Field engineers must inspect bridges, communication towers, and water dams in the Awash/Afar corridor.</li>
        <li><strong>Emergency Reporting:</strong> Report damages directly to the National Emergency Operations Center via toll-free hotline <strong>8333</strong>.</li>
      </ol>

      <!-- Action Button -->
      <div style="text-align: center; margin: 24px 0 8px 0;">
        <a href="${telemetryLink}" style="display: inline-block; background: #0E4A72; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; border-bottom: 2px solid #07263c;">
          Open Live Telemetry in R-GEVAMS Map &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
      <p style="margin: 0 0 4px 0;">
        Space Science and Geospatial Institute (SSGI) &bull; National Disaster Risk Management Commission (DRMC)
      </p>
      <p style="margin: 0;">
        Addis Ababa, Ethiopia &bull; Tel: +251 11 872 0290 &bull; Web: ssgi.gov.et &bull; Email: earlywarning@ssgi.gov.et
      </p>
    </div>
  </div>
</body>
</html>
`;

  return {
    eventId,
    magnitude: parseFloat(mag),
    depth,
    location: loc,
    coordinates: coords,
    dateTime: eventDate.toISOString(),
    timeEat,
    dateEat,
    tectonic,
    smsEn,
    smsAm,
    emailSubject,
    emailHtml,
    telemetryLink
  };
}

export const generateSmartTremorAlert = formatSmartTremorMessages;
