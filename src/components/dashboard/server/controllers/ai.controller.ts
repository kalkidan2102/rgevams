import { Request, Response } from "express";
import { getGeminiClient, generateGeminiContentWithFallback, generateFallbackReport } from "../Services/gemini.service";
import { getPostgresVolcanoes, getPostgresEarthquakes } from "../Services/postgres.services";

export async function generateReport(req: Request, res: Response) {
  const { summary, customPrompt, briefingType = "all" } = req.body;
  if (!summary) {
    return res.status(400).json({ error: "Missing data summary payload" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    const fallbackText = generateFallbackReport(summary, undefined, briefingType, customPrompt);
    return res.json({
      report: fallbackText,
      fallbackMode: true,
      notice: "GEMINI_API_KEY is not configured on the server. Generated grounded analytical brief via SSGI local intelligence engine."
    });
  }

  const prompt = `You are the Chief Geospatial Intelligence Officer for the Ethiopian Space Science and Geospatial Institute (ESSGI), Department of Geodesy and Geodynamics, operating in close coordination with the Disaster Risk Management Commission (DRMC) and the Ethiopian Geological Survey.

Below is real-time geophysical telemetry:
${JSON.stringify(summary, null, 2)}

${customPrompt ? `Additional Directive from SSGI Directorate: "${customPrompt}"\n` : ""}
Selected Briefing Focus: "${briefingType}"

Please compile a professional, scientifically rigorous, and actionable Geohazard Intelligence Decision Support Brief.
Follow this Markdown structure:
1. # TITLE IN BOLD UPPERCASE WITH DATE AND SUBJECT
2. ## Executive Summary: Current Tectonic & Volcanic State of the Rift
3. ## Monitored Volcanic Inventory & Alert Levels (Include specific caldera names like Erta Ale, Dallol, Fentale, Alutu, coordinates, alert severity, and monitored parameters)
4. ## Seismic Rupture & Tectonic Fault Telemetry (Include recent USGS/SSGI events, magnitudes, focal depths, focal mechanisms, and shaking intensities)
5. ## High-Risk Geospatial Zones & Infrastructure Vulnerability (Focus on Afar Triple Junction, Main Ethiopian Rift corridor, Addis Ababa-Djibouti railway, Awash basin, and geothermal plants)
6. ## Strategic Recommendations & Multi-Agency Action Plan (Clear bulleted action items for DRMC, SSGI field teams, aviation authorities, and local administrations in Afar, Oromia, and Amhara)

Use clear, professional terminology (e.g., extensional tectonics, focal mechanism, hypocenter depth, PGA, basaltic fissure effusion, InSAR strain rate).`;

  try {
    const result = await generateGeminiContentWithFallback(ai, prompt);
    res.json({
      report: result.text,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const fallbackText = generateFallbackReport(
      summary,
      error?.message || "AI Service temporarily unavailable",
      briefingType,
      customPrompt
    );
    res.json({
      report: fallbackText,
      fallbackMode: true,
      error: error?.message || "Failed to generate report via Gemini"
    });
  }
}

export async function askGeorisk(req: Request, res: Response) {
  const { question, context } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Missing question query" });
  }

  const ai = getGeminiClient();
  const volcanoes = await getPostgresVolcanoes();
  const earthquakes = await getPostgresEarthquakes();

  const groundedContext = `
Current Active Volcanic Centers:
${JSON.stringify(volcanoes.map((v) => ({ name: v.name, region: v.region, type: v.type, severity: v.severity, elev: v.elevation })), null, 2)}

Recent Monitored Seismic Activity:
${JSON.stringify(earthquakes.slice(0, 10).map((e) => ({ mag: e.magnitude, place: e.location, depth: e.depth, date: e.dateTime, sev: e.severity })), null, 2)}

User Client Context:
${JSON.stringify(context || {}, null, 2)}
`;

  if (!ai) {
    // Generate intelligent local fallback answer
    const qLower = question.toLowerCase();
    let localAnswer = "Based on ESSGI Department of Geodesy and Geodynamics baseline telemetry: Ethiopia is located over the active East African Rift System where the Nubian, Somalian, and Arabian plates diverge. The Afar Depression and Main Ethiopian Rift experience regular seismic swarms and volcanic thermal anomalies.";
    if (qLower.includes("erta ale") || qLower.includes("lava")) {
      localAnswer = "Erta Ale (13.60° N, 40.67° E) is currently under RED alert. It is an active basaltic shield volcano in the Danakil Depression housing a persistent active lava lake. Ongoing thermal satellite emissions indicate magma circulation inside the southern pit crater with elevated SO2 degasification.";
    } else if (qLower.includes("earthquake") || qLower.includes("furi") || qLower.includes("seismic")) {
      localAnswer = "The Main Ethiopian Rift experiences frequent shallow-focus earthquakes (5-15 km depth) associated with crustal extension. Broadband seismic stations like IU.FURI on Mount Furi continuously monitor tremors along the Awash-Fentale and Hawassa grabens.";
    }

    return res.json({
      answer: localAnswer,
      modelUsed: "local-ssgi-rules-engine",
      fallbackMode: true
    });
  }

  const prompt = `You are the AI Senior Geoscientist for the Ethiopian Space Science and Geospatial Institute (ESSGI).
Grounded Reference Telemetry:
${groundedContext}

User Question: "${question}"

Provide a concise, precise, and scientifically accurate response tailored to Ethiopian rift geology, seismology, and volcanology.`;

  try {
    const result = await generateGeminiContentWithFallback(ai, prompt);
    res.json({
      answer: result.text,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.json({
      answer: "The Ethiopian Rift system is currently undergoing active crustal extension at 4.5-15 mm/year. For urgent assistance or station telemetry, please review the live Seismology or Volcanology dashboards.",
      fallbackMode: true,
      error: err?.message
    });
  }
}

export async function getAiSummary(req: Request, res: Response) {
  const volcanoes = await getPostgresVolcanoes();
  const earthquakes = await getPostgresEarthquakes();
  const criticalVolcs = volcanoes.filter((v) => v.severity === "Red" || v.severity === "Orange");
  const severeEqs = earthquakes.filter((e) => e.magnitude >= 4.5);

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      summary: `ESSGI Telemetry Digest: Currently observing ${volcanoes.length} volcanic vents (${criticalVolcs.length} at elevated alert) and ${earthquakes.length} monitored seismic ruptures. Rift extension rate steady at 4.5-15 mm/yr.`,
      fallbackMode: true
    });
  }

  const prompt = `Provide a 2-sentence executive situation summary for the ESSGI Geohazard portal header banner based on:
Active alert volcanoes: ${criticalVolcs.map((v) => v.name + " (" + v.severity + ")").join(", ")}
Recent high tremors: ${severeEqs.slice(0, 3).map((e) => "M" + e.magnitude + " " + e.location).join(", ")}.`;

  try {
    const result = await generateGeminiContentWithFallback(ai, prompt, ["gemini-2.5-flash", "gemini-2.0-flash"]);
    res.json({
      success: true,
      summary: result.text.trim(),
      modelUsed: result.modelUsed
    });
  } catch (err: any) {
    res.json({
      success: true,
      summary: `ESSGI Telemetry: ${criticalVolcs.length} volcanic centers under active advisory; seismic monitoring nominal across the Main Ethiopian Rift.`,
      fallbackMode: true
    });
  }
}
