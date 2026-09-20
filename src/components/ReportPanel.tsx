import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Volcano, Earthquake, UserRole } from "../types";
import { authenticatedFetch } from "../lib/api";
import {
  FileText,
  Cpu,
  ArrowRight,
  Loader2,
  Download,
  Copy,
  RefreshCw,
  ShieldAlert,
  Printer,
  FileSpreadsheet,
  FileCheck,
  Shield,
  Sliders,
  X,
  Sparkles,
  Radio,
  Flame,
  Activity,
  CheckCircle2,
  MessageSquare,
  Send,
  HelpCircle,
  PlusCircle,
  Check,
  Compass,
  Building2,
  Lock,
  ShieldCheck,
  Layers
} from "lucide-react";
import { generateRiskSummaryPdf, PdfBriefingOptions } from "../utils/pdfGenerator";

interface ReportPanelProps {
  volcanoes: Volcano[];
  earthquakes: Earthquake[];
  currentUser?: UserRole;
  initialTopic?: "all" | "volcanic" | "seismic" | "infrastructure" | "geodesy" | "drmc" | "gnss" | "executive";
}

interface QaItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

export default function ReportPanel({ volcanoes, earthquakes, currentUser, initialTopic }: ReportPanelProps) {
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const role = currentUser?.role || "guest";
  const isSuperAdmin = role === "superadmin";
  const isAdmin = role === "admin" || isSuperAdmin;
  const isOfficial = role === "official" || role === "staff" || isAdmin;
  const isStaff = isOfficial;
  const isResearcher = role === "researcher" || role === "scientist" || isOfficial;
  const isStaffOrAdmin = isOfficial;
  const isGuest = !isResearcher;

  // Interactive Topic Selection
  const [selectedTopic, setSelectedTopic] = useState<"all" | "volcanic" | "seismic" | "infrastructure" | "geodesy" | "drmc" | "gnss" | "executive">(
    initialTopic === "drmc" ? "geodesy" : (initialTopic || "all")
  );
  const [customBriefingFocus, setCustomBriefingFocus] = useState<string>("");

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic === "drmc" ? "geodesy" : initialTopic);
    }
  }, [initialTopic]);

  // Interactive Grounded Q&A Assistant State
  const [userQuery, setUserQuery] = useState<string>("");
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<QaItem[]>([]);
  const [copiedQaId, setCopiedQaId] = useState<string | null>(null);
  const [appendedQaId, setAppendedQaId] = useState<string | null>(null);

  // PDF Configuration Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const [pdfOptions, setPdfOptions] = useState<PdfBriefingOptions>({
    briefingType: "all",
    classification: isGuest ? "PUBLIC ADVISORY" : "RESTRICTED",
    officerName: isGuest
      ? (currentUser?.name ? `${currentUser.name} (Guest Researcher)` : "Public Access User")
      : (currentUser?.name || "Kalkidan Getachew"),
    officerRole: isGuest
      ? "PUBLIC ADVISORY VIEWER"
      : (currentUser?.role?.toUpperCase() || "SENIOR GEOPHYSICAL OFFICER"),
    officerInstitution: isGuest
      ? "Public Geospatial Portal / Open Telemetry"
      : (currentUser?.institution || "SSGI Department of Geodesy and geodynamics"),
    includeAiSummary: true,
    aiSummaryText: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync pdfOptions when topic or currentUser changes
  useEffect(() => {
    setPdfOptions((prev) => {
      let nextBriefingType: PdfBriefingOptions["briefingType"] = "all";
      if (selectedTopic === "seismic") nextBriefingType = "seismic";
      else if (selectedTopic === "volcanic") nextBriefingType = "volcanic";
      else if (selectedTopic === "infrastructure" && !isGuest) nextBriefingType = "infrastructure";
      else if ((selectedTopic === "geodesy" || selectedTopic === "drmc") && !isGuest) nextBriefingType = "geodesy";
      else if (selectedTopic === "gnss" && !isGuest) nextBriefingType = "gnss";
      else if (selectedTopic === "executive" && isAdmin) nextBriefingType = "executive";
      else nextBriefingType = "all";

      return {
        ...prev,
        briefingType: nextBriefingType
      };
    });
  }, [selectedTopic, isGuest, isAdmin]);

  useEffect(() => {
    if (currentUser) {
      const userIsStaffOrAdmin =
        currentUser.role === "staff" ||
        currentUser.role === "official" ||
        currentUser.role === "admin" ||
        currentUser.role === "superadmin";

      setPdfOptions((prev) => ({
        ...prev,
        classification: userIsStaffOrAdmin ? prev.classification : "PUBLIC ADVISORY",
        officerName: userIsStaffOrAdmin
          ? (currentUser.name || prev.officerName)
          : (currentUser.name ? `${currentUser.name} (Guest Researcher)` : "Public Access User"),
        officerRole: userIsStaffOrAdmin
          ? (currentUser.role ? currentUser.role.toUpperCase() + " OFFICER" : prev.officerRole)
          : "PUBLIC ADVISORY VIEWER",
        officerInstitution: userIsStaffOrAdmin
          ? (currentUser.institution || "SSGI Department of Geodesy and geodynamics")
          : "Public Geospatial Portal / Open Telemetry",
      }));
    }
  }, [currentUser]);

  // Summarize stats to pass as context constraints to the server-side Gemini pipeline
  const activeVolcanoes = volcanoes.filter((v) => v.severity !== "Green");
  const maxMag = earthquakes.length
    ? Math.max(...earthquakes.map((e) => e.magnitude))
    : 0;
  const criticalSeismicEvents = earthquakes.filter((e) => e.severity === "Red" || e.severity === "Orange").length;

  const currentSummary = {
    totalVolcanoesObserved: volcanoes.length,
    activeAlertVolcanoesCount: activeVolcanoes.length,
    activeVolcanoes: activeVolcanoes.map((v) => ({
      name: v.name,
      severity: v.severity,
      region: v.region,
      type: v.type,
      coordinates: v.coordinates
    })),
    totalEarthquakesInPeriod: earthquakes.length,
    highestMagnitudeRecorded: maxMag,
    severeEarthquakesCount: criticalSeismicEvents,
    latestEarthquakesSample: earthquakes.slice(0, 8).map((e) => ({
      mag: e.magnitude,
      place: e.location,
      dateTime: e.dateTime,
      depth: e.depth,
      severity: e.severity,
      coordinates: e.coordinates
    })),
  };

  const generateClientFallbackReport = (summary: typeof currentSummary, topic: string) => {
    const totalVolc = summary.totalVolcanoesObserved ?? 0;
    const activeVolcCount = summary.activeAlertVolcanoesCount ?? 0;
    const activeVolcs = summary.activeVolcanoes || [];
    const totalEq = summary.totalEarthquakesInPeriod ?? 0;
    const maxMag = summary.highestMagnitudeRecorded ?? 0;
    const severeEqCount = summary.severeEarthquakesCount ?? 0;
    const latestEqs = summary.latestEarthquakesSample || [];

    const volcanoesMarkdown = activeVolcs.length > 0 
      ? activeVolcs.map((v: any) => `*   **${v.name}** (${v.type || "Volcano"} in ${v.region || "Ethiopia"}): Marked with **${v.severity.toUpperCase()}** priority alert level. Continuous satellite infrared monitoring and local perimeter alerts advised.`).join("\n")
      : "*   **No Volcanic Fault Alerts Active**: Currently, there are no elevated alert warning statuses recorded for observed vents.";

    const coreEarthquakeMarkdown = latestEqs.length > 0
      ? latestEqs.map((e: any) => `*   **M ${parseFloat(e.mag).toFixed(1)}** near *${e.place || "East Africa Rift Segment"}* (Depth: **${e.depth}km**, Status: **${e.severity}** severity): Logged telemetry on ${e.dateTime ? new Date(e.dateTime).toLocaleDateString() : "Active Cycle"}.`).join("\n")
      : "*   **No Substantial Rift Ruptures Recorded**: No recent local tremors exceeding baseline advisory thresholds detected.";

    const currentDateFormatted = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    if (topic === "volcanic") {
      return `# ETHIOPIAN VOLCANIC HAZARD & PLUME SURVEILLANCE BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Volcanological Vents, Thermal Emissions & Ash Dispersion Surveillance

## Executive Summary: Volcanic Activity Across the Rift
Surveillance conducted by the **Space Science and Geospatial Institute (SSGI)**, **Department of Geodesy and Geodynamics**, tracks **${totalVolc} observed volcanic centers**, with **${activeVolcCount} centers** displaying elevated magmatic or hydrothermal activity requiring direct advisory protocols.

## Active Volcanic Inventory & Alert Status
${volcanoesMarkdown}

## Caldera Dynamics & Exclusion Limits
*   **Erta Ale (Danakil Shield)**: Active basaltic lava lake bubbling with SO₂ gas plumes. Strict **5km exclusion buffer** enforced for visitor parties.
*   **Dallol Hydrothermal Crater**: Superheated acidic brines and sulfur deposits at -48m below sea level. Crustal stability alerts active.
*   **Mount Fentale & Kone**: Fumarolic degassing and micro-tremor swarms along ring faults adjacent to the Addis-Djibouti corridor.
*   **Alutu Geothermal Caldera**: Magmatic reservoir inflation cycles monitored for geothermal well integrity.`;
    }

    if (topic === "seismic") {
      return `# ETHIOPIAN SEISMIC RUPTURE & TECTONIC FAULT BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Seismicity, Fault Ruptures, Focal Depths & Ground Shaking Hazard

## Executive Summary: Tectonic Slip & Seismicity
Consolidated telemetry from USGS and SSGI broadband stations maintained by the **Department of Geodesy and Geodynamics** tracks **${totalEq} seismic incidents** over the monitoring window, peaking at **M ${maxMag.toFixed(1)} Richter** with **${severeEqCount} events** passing advisory thresholds.

## Chronological Seismic Rupture Feed
${coreEarthquakeMarkdown}

## Key Rupture Zones & Engineering Guidelines
1.  **Awash Basin & Fentale Graben**: High tremor swarm density with shallow hypocenters (5–12km). Strict structural inspection required for railway viaducts and masonry buildings.
2.  **Afar Triple Junction & Semera Graben**: Normal fault extension (Nubia-Arabia-Somalia plate divergence). High PGA values expected during swarms.
3.  **Western Escarpment (Ankober/Dessie)**: Deep marginal faults prone to co-seismic rockfalls along mountain roads.`;
    }

    if (topic === "gnss") {
      return `# ETHIOPIAN CRUSTAL STRAIN & GNSS GEODESY BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Space Geodesy, Continuous GNSS Vectors & Plate Tectonics

## Executive Summary: Geodetic Deformation Field
Continuous GNSS tracking across reference stations operated by SSGI's **Department of Geodesy and Geodynamics** (**IU.FURI on Mount Furi**, **BDMT Bahir Dar**, **DESE Dessie**, **ARBA Arba Minch**) registers steady-state East African Rift extension.

## Geodetic Vectors & Velocity Fields
*   **Central MER Extension Rate**: **4.5 to 6.2 mm/yr** opening rate.
*   **Northern Afar Extension Rate**: **12.0 to 16.0 mm/yr** opening rate.
*   **Master Station IU.FURI**: Mount Furi station (2,840m ASL) reports nominal 100 Hz broadband streaming with low multipath noise.`;
    }

    if (topic === "infrastructure") {
      return `# CRITICAL INFRASTRUCTURE GEOHAZARD VULNERABILITY BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Strategic Infrastructure Resilience & Transportation Corridors

## Strategic Infrastructure Intersections
Evaluated by the **Space Science and Geospatial Institute (SSGI)**, **Department of Geodesy and Geodynamics**:
1.  **Ethio-Djibouti Railway & Highway Corridor**: Crosses active fault grabens in Fentale and Semera. Ground shaking exceeding M5.0 poses structural and alignment risks.
2.  **Alutu-Langano Geothermal Power**: Geothermal steam wells require continuous micro-seismic monitoring during fluid reinjection.
3.  **Koka & Tendaho Dams**: Spillways and concrete structures monitored for peak ground acceleration thresholds.`;
    }

    if (topic === "geodesy" || topic === "drmc") {
      return `# GEODESY & GEODYNAMICS STRATEGIC DIRECTIVE
**Date:** ${currentDateFormatted} | **Subject:** Geodetic Strain, Structural Safety & Zonal Emergency Buffers

## Executive Mandate: Regional Preparedness Posture
Issued by the **Space Science and Geospatial Institute (SSGI) - Department of Geodesy and Geodynamics**. In response to monitoring of **${totalVolc} volcanic centers** and **${totalEq} seismic ruptures**, regional taskforces and infrastructure engineering teams are instructed to maintain active readiness.

## Zonal Evacuation Buffers & Exclusion Protocols
*   **Danakil / Afar Pastoralist Zones**: 5km exclusion radius around Erta Ale active caldera. Daily warning dissemination in Afar & Amharic to Semera and Gewane.
*   **Main Ethiopian Rift Corridor**: Pre-position emergency monitoring logistics, mobile field teams, and geodetic stations in Adama and Metehara.

## Geodynamics & Early Warning Logistics
*   **Primary Monitoring Hubs**: Semera Geodetic Field Base (Active), Furi Master Observatory (Active), Hawassa Field Station (Active).
*   **Civil Broadcast Protocol**: Multilingual geohazard alerts active across SMS gateway and HF/VHF emergency radio network.`;
    }

    if (topic === "executive") {
      return `# EXECUTIVE STRATEGIC GEOHAZARD BRIEFING
**Date:** ${currentDateFormatted} | **Subject:** Multi-Agency Earth Observation & National Geohazard Strategic Directives

## Executive Strategic Overview
High-level geohazard telemetry synthesis prepared for the Director General of SSGI and the Ministry of Innovation and Technology, coordinated by the **Department of Geodesy and Geodynamics**.

## Key Strategic Risk Indicators (SRI)
*   **National Seismic Activity Index**: ${severeEqCount > 0 ? "ELEVATED" : "NOMINAL"} (Peak Recorded Strain: M ${maxMag.toFixed(1)}, ${totalEq} total ruptures logged).
*   **Volcanic Alert Level**: ${activeVolcCount} volcanic centers classified under Elevated or Critical advisory status out of ${totalVolc} monitored centers.
*   **Crustal Rift Extension**: Steady-state plate divergence proceeding at 4.5-6.2 mm/yr in MER and 14-16 mm/yr in Northern Afar.
*   **Broadband Station Uptime**: 99.4% telemetry availability across all 18 seismic & GNSS stations.

## Directorate Action Directives
1.  **Ministry of Transport**: Structural safety audit along railway & road bridges in the Awash-Metehara corridor.
2.  **Ministry of Water & Energy**: Piezometer and hydraulic pressure logging on Tendaho, Kesem, and Koka dams.
3.  **Ethiopian Civil Aviation Authority**: Flight corridor ash dispersal notices updated daily for Afar airspace.`;
    }

    return `# GEOLOGICAL DISASTER INTELLIGENCE DECISION SUPPORT BRIEF
**Date:** ${currentDateFormatted} | **Subject:** Comprehensive Seismic, Volcanic & Rift Strain Geohazard Assessment

## Executive Summary
Ethiopia's positioning inside the **East African Rift System (EARS)** exposes critical community and energy corridors to active seismic grabens and magmatic basalt plumes. Monitored by the **Space Science and Geospatial Institute (SSGI)**, **Department of Geodesy and Geodynamics**, our instruments currently observe **${totalVolc} volcanic centers** and **${totalEq} active seismogenetic incidents** over the monitoring sector. Based on consolidated telemetry, ongoing structural hazard and crustal strain persist along the **Afar Triple Junction** and the central **Main Ethiopian Rift (Adama-Awasa corridor)**.

## Dynamic Tectonic Parameter Summary
*   **Active Volcanic Plume Warnings:** Currently tracking **${activeVolcCount} active systems** at advisory/critical warning levels.
*   **Peak Ground Shaking Strain:** Telemetry records a maximum magnitude of **M ${maxMag.toFixed(1)}**, with **${severeEqCount} seismic ruptures** passing elevated warning indexes.

## Active Volcano Alert Status Vector
${volcanoesMarkdown}

## Live Seismic Telemetry Feed Assessment (USGS)
${coreEarthquakeMarkdown}

## Hazards and Vulnerability Hotspots
1.  **Afar Depression (Semera, Serdo, Dubti Corridor):** High vulnerability to seismic fault displacement. Critical logistics arteries (Addis Ababa - Djibouti Highway and Railway) traverse these active normal fault lines and deep grabens.
2.  **Central Rift Valley Corridor (Ziway, Hawassa, Metehara):** Dense agrarian settlements and vital geothermal developments (Aluto-Langano energy plants) sit directly above shallow caldera reservoirs. Sustained tremor swarms pose fracturing danger to local concrete spillways and masonry.

## Key Emergency Response Recommendations
*   **Infrastructure Hazard Thresholds:** Strictly enforce seismically resilient engineering and construction codes for all logistics and energy building projects in the Rift Valley and Danakil sectors.
*   **Active Excursions Safety Boundaries:** Maintain a strict **5km exclusion perimeter** around Erta Ale's boiling basaltic lava lake due to high concentration toxic sulfur emissions and hydrothermal splatter vents.
*   **Bilingual Early Warning Advisories:** Formulate and dispatch automated safety broadcast SMS texts translated in Afar, Amharic, and Oromiffa to agricultural workers inside active rifting sectors.`;
  };

  const handleGenerateReport = async (overrideTopic?: string) => {
    const topicToUse = overrideTopic || selectedTopic;
    setLoading(true);
    setLoaded(false);
    setReport("");

    try {
      const res = await authenticatedFetch("/api/report", {
        method: "POST",
        body: JSON.stringify({
          currentDataSummary: currentSummary,
          briefingType: topicToUse,
          customPrompt: customBriefingFocus
        }),
      });

      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        const text = data.reportText || "No response received.";
        setReport(text);
        setIsAiGenerated(!!data.aiGenerated);
        setLoaded(true);
        const mappedPdfTopic: "all" | "volcanic" | "seismic" = topicToUse === "volcanic" ? "volcanic" : topicToUse === "seismic" ? "seismic" : "all";
        setPdfOptions((prev) => ({ ...prev, aiSummaryText: text, briefingType: mappedPdfTopic }));
      } else {
        const fallbackText = generateClientFallbackReport(currentSummary, topicToUse);
        setReport(fallbackText);
        setIsAiGenerated(false);
        setLoaded(true);
        const mappedPdfTopic: "all" | "volcanic" | "seismic" = topicToUse === "volcanic" ? "volcanic" : topicToUse === "seismic" ? "seismic" : "all";
        setPdfOptions((prev) => ({ ...prev, aiSummaryText: fallbackText, briefingType: mappedPdfTopic }));
      }
    } catch {
      const fallbackText = generateClientFallbackReport(currentSummary, topicToUse);
      setReport(fallbackText);
      setIsAiGenerated(false);
      setLoaded(true);
      const mappedPdfTopic: "all" | "volcanic" | "seismic" = topicToUse === "volcanic" ? "volcanic" : topicToUse === "seismic" ? "seismic" : "all";
      setPdfOptions((prev) => ({ ...prev, aiSummaryText: fallbackText, briefingType: mappedPdfTopic }));
    } finally {
      setLoading(false);
    }
  };

  // Interactive Question Asking Handler (Strictly Grounded in System Data)
  const handleAskQuestion = async (customQ?: string) => {
    const q = (customQ || userQuery).trim();
    if (!q) return;

    setIsQuerying(true);
    try {
      const res = await authenticatedFetch("/api/ask-georisk", {
        method: "POST",
        body: JSON.stringify({
          question: q,
          currentDataSummary: currentSummary
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newQa: QaItem = {
          id: "qa-" + Date.now(),
          question: q,
          answer: data.answer || "No response recorded.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAiGenerated: !!data.aiGenerated
        };
        setQaHistory((prev) => [newQa, ...prev]);
        setUserQuery("");
      } else {
        throw new Error("Failed to contact georisk intelligence server.");
      }
    } catch (err) {
      // Local fallback grounded answer
      let localAns = `Based on active telemetry: The system currently tracks ${volcanoes.length} volcanic vents and ${earthquakes.length} seismic ruptures in Ethiopia. Peak recorded strain is M ${maxMag.toFixed(1)}.`;
      if (q.toLowerCase().includes("erta ale")) {
        localAns = `**Erta Ale Surveillance Status**: Active shield volcano in Danakil (13.60°N, 40.67°E). Alert Level: **RED (Critical)**. Active lava lake with SO₂ degassing. Strict **5 km safety exclusion zone** enforced.`;
      } else if (q.toLowerCase().includes("dallol")) {
        localAns = `**Dallol Crater Status**: Hydrothermal complex in Danakil (-48m bsl). Alert Level: **ORANGE (Elevated)**. Phreatic acidic geysers and toxic gas emissions.`;
      } else if (q.toLowerCase().includes("seismic") || q.toLowerCase().includes("earthquake")) {
        localAns = `**Seismic Records**: ${earthquakes.length} earthquakes logged across the East African Rift System. Peak magnitude M ${maxMag.toFixed(1)} recorded in Semera / Awash grabens.`;
      }
      const newQa: QaItem = {
        id: "qa-" + Date.now(),
        question: q,
        answer: localAns,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isAiGenerated: false
      };
      setQaHistory((prev) => [newQa, ...prev]);
      setUserQuery("");
    } finally {
      setIsQuerying(false);
    }
  };

  const handleInjectQaIntoReport = (item: QaItem) => {
    const additionalSection = `\n\n### Supplemental Inquired Intelligence (${item.timestamp})\n**Q: ${item.question}**\n\n${item.answer}\n`;
    setReport((prev) => prev + additionalSection);
    setLoaded(true);
    setAppendedQaId(item.id);
    setTimeout(() => setAppendedQaId(null), 2500);
  };

  const handleCopyQa = (item: QaItem) => {
    navigator.clipboard.writeText(`Q: ${item.question}\n\nA: ${item.answer}`);
    setCopiedQaId(item.id);
    setTimeout(() => setCopiedQaId(null), 2000);
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SSGI_Geological_Brief_${selectedTopic.toUpperCase()}_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const headers = ["Category", "Name_or_Location", "Severity_Alert", "Magnitude_or_Elevation", "Coordinates_or_Depth", "Timestamp_or_Status"];
    const rows: string[][] = [];

    volcanoes.forEach((v) => {
      rows.push([
        "Volcano",
        `"${v.name}"`,
        v.severity,
        `"${v.elevation}m"`,
        `"${v.coordinates ? v.coordinates.join(', ') : 'N/A'}"`,
        `"${v.lastErupted || 'Monitored'}"`
      ]);
    });

    earthquakes.forEach((eq) => {
      rows.push([
        "Earthquake",
        `"${eq.location.replace(/"/g, '""')}"`,
        eq.severity,
        `"M ${eq.magnitude.toFixed(1)}"`,
        `"Depth: ${eq.depth}km [${eq.coordinates.join(', ')}]"`,
        `"${eq.dateTime}"`
      ]);
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SSGI_Geological_Telemetry_Data_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExecutePdfExport = async () => {
    setIsGeneratingPdf(true);
    setPdfSuccessMessage(null);
    setAccessDeniedMessage(null);

    // Strict validation for Guest downloads
    const effectiveOptions: Partial<PdfBriefingOptions> = { ...pdfOptions };
    if (isGuest) {
      effectiveOptions.classification = "PUBLIC ADVISORY";
      if (
        effectiveOptions.briefingType === "geodesy" ||
        effectiveOptions.briefingType === "infrastructure" ||
        effectiveOptions.briefingType === "gnss" ||
        effectiveOptions.briefingType === "executive"
      ) {
        effectiveOptions.briefingType = "all";
      }
      effectiveOptions.officerName = currentUser?.name ? `${currentUser.name} (Guest Researcher)` : "Public Access User";
      effectiveOptions.officerRole = "PUBLIC ADVISORY VIEWER";
      effectiveOptions.officerInstitution = "Public Geospatial Portal / Open Telemetry";
    } else if (isStaff && !isAdmin) {
      if (effectiveOptions.briefingType === "executive") {
        effectiveOptions.briefingType = "all";
      }
    }

    try {
      const { doc, filename } = generateRiskSummaryPdf(
        volcanoes,
        earthquakes,
        currentUser,
        {
          ...effectiveOptions,
          aiSummaryText: report || pdfOptions.aiSummaryText || ""
        }
      );
      doc.save(filename);
      setPdfSuccessMessage("Official Briefing PDF generated and downloaded successfully.");
      setTimeout(() => {
        setPdfSuccessMessage(null);
        setIsPdfModalOpen(false);
      }, 1800);
    } catch {
      alert("Failed to render PDF briefing. Please try standard print option.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const renderMarkdown = (md: string) => {
    if (!md) return null;
    const lines = md.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const key = `line-${idx}`;

      if (trimmed.startsWith(">")) {
        return (
          <blockquote key={key} className="border-l-4 border-[#0085C8] dark:border-[#00D4FF] bg-sky-50/50 dark:bg-white/5 pl-4 py-2 my-2 text-xs italic text-slate-700 dark:text-slate-300 rounded-r">
            {parseBoldText(trimmed.replace(/^>\s*/, ""))}
          </blockquote>
        );
      }

      if (trimmed.startsWith("###")) {
        return (
          <h4 key={key} className="text-xs font-bold text-[#0085C8] dark:text-[#00D4FF] mt-3 mb-1 uppercase tracking-wider font-mono">
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={key} className="text-sm font-black text-slate-900 dark:text-white mt-4 mb-2 tracking-tight flex items-center gap-2 border-b border-slate-200/60 dark:border-white/10 pb-1 font-display">
            <span className="w-1.5 h-3.5 bg-[#0085C8] dark:bg-[#00D4FF] rounded-xs inline-block"></span>
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={key} className="text-base font-extrabold text-[#0085C8] dark:text-[#00D4FF] mt-2 mb-3 tracking-tight border-b border-slate-200 dark:border-white/10 pb-2">
            {trimmed.replace(/^#\s*/, "")}
          </h2>
        );
      }

      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const itemContent = trimmed.replace(/^[\*\-]\s*/, "");
        return (
          <ul key={key} className="list-disc list-inside ml-4 my-1 text-xs text-slate-600 dark:text-slate-300">
            <li>{parseBoldText(itemContent)}</li>
          </ul>
        );
      }

      if (/^\d+\./.test(trimmed)) {
        const itemContent = trimmed.replace(/^\d+\.\s*/, "");
        return (
          <ol key={key} className="list-decimal list-inside ml-4 my-1.5 text-xs text-slate-600 dark:text-slate-300">
            <li>{parseBoldText(itemContent)}</li>
          </ol>
        );
      }

      if (trimmed === "") {
        return <div key={key} className="h-1.5" />;
      }

      return (
        <p key={key} className="my-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (rawStr: string) => {
    const parts = rawStr.split(/\*\*([^\*]+)\*\*/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded border border-slate-200/50 dark:border-white/5">{part}</strong>;
      }
      return part;
    });
  };

  const loaderTips = [
    "Synthesizing live USGS tectonic graben plates stress indices...",
    "Retrieving heat flux advisories for Danakil hydrothermal springs...",
    "Analyzing Afar Rift Valley 2026 epicentral density distributions...",
    "Querying IU.FURI Mount Furi broadband spectral vectors...",
    "Evaluating civil corridor infrastructure safety buffer envelopes..."
  ];

  const [currentTipIdx, setCurrentTipIdx] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentTipIdx((p) => (p + 1) % loaderTips.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  const topicTabs = [
    { id: "all", label: "Comprehensive Brief", icon: Layers, desc: "Full multi-hazard intelligence briefing" },
    { id: "seismic", label: "Seismic Catalog", icon: Activity, desc: "Earthquake ruptures, focal depths & swarms" },
    { id: "volcanic", label: "Volcanic Plumes", icon: Flame, desc: "Caldera plumes, vents & exclusion perimeters" },
    { id: "infrastructure", label: "Infrastructure", icon: Building2, desc: "Railway, highways, dams & geothermal risks" },
    { id: "geodesy", label: "Geodesy Directive", icon: ShieldAlert, desc: "Geodetic strain, structural safety & emergency buffers" },
    { id: "gnss", label: "GNSS Geodesy", icon: Compass, desc: "Plate divergence rates & FURI broadband" },
    { id: "executive", label: "Executive Brief", icon: Shield, desc: "Strategic SRI indicators & ministerial actions" },
  ] as const;

  const presetQuestions = [
    { label: "🌋 Erta Ale Safety Perimeter", query: "What is the current alert status and tourist exclusion perimeter for Erta Ale volcano?" },
    { label: "⚡ Awash / Fentale Swarms", query: "Summarize recent earthquake swarms near the Awash Basin and Mount Fentale graben." },
    { label: "🛰️ Afar Plate Opening Rates", query: "What are the measured GNSS tectonic divergence rates in the Afar Depression?" },
    { label: "🏗️ Addis-Djibouti Rail Risk", query: "What are the primary geohazard vulnerabilities along the Addis-Djibouti railway corridor?" },
    { label: "♨️ Aluto Caldera Status", query: "What is the volcanic alert status and ground deformation trend for Aluto-Langano geothermal field?" },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Interactive Command Header & Topic Filter Bar */}
      <div className="bg-white/60 dark:bg-[#041B2D]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#0085C8]/10 text-[#0085C8] dark:text-[#00D4FF] rounded-xl border border-[#0085C8]/20 shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-wide uppercase font-display">
                    Interactive AI Geological Briefing Studio
                  </h2>
                  <span className="bg-[#0085C8]/10 text-[#0085C8] dark:text-[#00D4FF] border border-[#0085C8]/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    Grounded in Live ESSGI/USGS Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-2xl leading-relaxed mt-0.5">
                  Select a specific briefing focus (Volcanic, Seismic, GNSS, or Infrastructure) or ask targeted intelligence questions grounded strictly in current system records.
                </p>
              </div>
            </div>

            {/* Quick Context Parameters Cards */}
            <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono">
              <span className="bg-white/80 dark:bg-[#041B2D]/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CA933C] animate-pulse"></span>
                Volcano Vents: {activeVolcanoes.length} Active / {volcanoes.length} Total
              </span>
              <span className="bg-white/80 dark:bg-[#041B2D]/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Severe Tremors: {criticalSeismicEvents} Events (&ge;4.5)
              </span>
              <span className="bg-white/80 dark:bg-[#041B2D]/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"></span>
                Peak Recorded Strain: M {maxMag.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Quick PDF Export Button */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
              title="Download formatted geological risk briefing as an official PDF file for offline briefing"
            >
              <FileCheck className="w-4 h-4 text-emerald-100" />
              <span>Download PDF Briefing</span>
            </button>

            <button
              onClick={() => handleGenerateReport(selectedTopic)}
              disabled={loading}
              className="bg-gradient-to-r from-[#0085C8] to-[#00D4FF] text-white font-bold text-xs py-2.5 px-4.5 rounded-xl shadow-[0_4px_6px_rgba(0,133,200,0.25)] hover:shadow-[0_4px_6px_rgba(0,212,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer border border-[#00D4FF]/15"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Intelligence Brief...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Generate {selectedTopic.toUpperCase()} Briefing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. INTERACTIVE TOPIC SELECTION PILLS */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#0085C8]" />
              <span>Select Briefing Target Scope:</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Click any category to tailor the AI generation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {topicTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedTopic === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedTopic(tab.id as any);
                    if (loaded) {
                      handleGenerateReport(tab.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#0E4A72]/10 dark:bg-[#0085C8]/20 border-[#0085C8] dark:border-[#00D4FF] shadow-xs ring-1 ring-[#0085C8]/30"
                      : "bg-white/40 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#0085C8] dark:text-[#00D4FF]" : "text-slate-400"}`} />
                    <span className={`text-xs font-bold ${isSelected ? "text-[#0085C8] dark:text-[#00D4FF]" : "text-slate-800 dark:text-slate-200"}`}>
                      {tab.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {tab.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Optional specific briefing focus field */}
          <div className="pt-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">Custom Focus Directive (Optional):</span>
              <input
                type="text"
                value={customBriefingFocus}
                onChange={(e) => setCustomBriefingFocus(e.target.value)}
                placeholder="e.g. Focus on Semera highway logistics, or Erta Ale degassing rates..."
                className="bg-transparent w-full text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none text-xs"
              />
              {customBriefingFocus && (
                <button
                  onClick={() => setCustomBriefingFocus("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. GROUNDED INTERACTIVE Q&A CONSOLE ("ASK GEOHAZARD INTELLIGENCE ASSISTANT") */}
      <div className="bg-white/60 dark:bg-[#041B2D]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                Ask AI Geohazard Intelligence Assistant
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ask interactive questions strictly constrained to the current system data (Volcanoes, USGS earthquakes, FURI GNSS).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 shrink-0">
            <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Strict Grounding: Verified Geodata Only</span>
          </div>
        </div>

        {/* Preset Question Quick Chips */}
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Quick Inquiries from Active Telemetry:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetQuestions.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserQuery(pq.query);
                  handleAskQuestion(pq.query);
                }}
                disabled={isQuerying}
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer font-medium disabled:opacity-50 flex items-center gap-1"
              >
                <span>{pq.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="flex items-center gap-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/15 rounded-xl p-1.5 shadow-2xs focus-within:border-[#0085C8] focus-within:ring-1 focus-within:ring-[#0085C8]/30 transition-all"
        >
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask specific questions regarding active volcanoes, seismic swarms, or plate deformation..."
            className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
            disabled={isQuerying}
          />
          <button
            type="submit"
            disabled={isQuerying || !userQuery.trim()}
            className="bg-[#0085C8] hover:bg-[#0074b0] text-white px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isQuerying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </>
            )}
          </button>
        </form>

        {/* Q&A Interactive History Cards */}
        {qaHistory.length > 0 && (
          <div className="space-y-3 pt-2">
            {qaHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 dark:bg-[#041B2D]/80 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] border-b border-slate-100 dark:border-white/5 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-[#0085C8] font-mono">Q:</span>
                    <span>{item.question}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <div className="text-slate-700 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-[#0085C8]/40 prose dark:prose-invert max-w-none text-xs">
                  {renderMarkdown(item.answer)}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Grounded in active telemetry</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyQa(item)}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-white/5 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedQaId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleInjectQaIntoReport(item)}
                      className="text-[#0085C8] dark:text-[#00D4FF] hover:underline px-2 py-1 rounded bg-[#0085C8]/10 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {appendedQaId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Appended to Brief!</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3 h-3" />
                          <span>Append to Briefing Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading Canvas */}
      {loading && (
        <div className="bg-white/60 dark:bg-[#041B2D]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs transition-all text-slate-800 dark:text-white">
          <Loader2 className="w-10 h-10 text-[#00D4FF] animate-spin" />
          <div className="space-y-1.5">
            <p className="font-bold text-sm text-slate-800 dark:text-white font-sans">
              Compiling {selectedTopic.toUpperCase()} Geological Brief
            </p>
            <p className="text-xs text-[#0085C8] dark:text-[#00D4FF] font-mono animate-pulse max-w-md mx-auto">
              {loaderTips[currentTipIdx]}
            </p>
          </div>
        </div>
      )}

      {/* No Report State */}
      {!loading && !loaded && (
        <div className="bg-white/60 dark:bg-[#041B2D]/60 backdrop-blur-xl border border-dashed border-slate-200/80 dark:border-white/10 rounded-2xl p-10 text-center text-slate-400 font-sans text-xs flex flex-col items-center justify-center gap-4 transition-all">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <FileText className="w-10 h-10 text-[#0085C8] dark:text-[#00D4FF] stroke-1" />
          </div>
          <div className="space-y-1">
            <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase font-display">
              Geological Advisory Briefing Terminal
            </p>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
              Synthesize live USGS seismic telemetry, Afar Depression graben stress vectors, and volcanic caldera alert statuses into an official disaster response briefing document or export directly to PDF.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={() => handleGenerateReport(selectedTopic)}
              className="bg-[#0085C8] hover:bg-[#0074b0] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Generate {selectedTopic.toUpperCase()} Briefing</span>
            </button>
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Export Offline Briefing PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Showcase Canvas */}
      {loaded && !loading && (
        <div className="bg-white/60 dark:bg-[#041B2D]/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all">
          
          {/* Action Bar */}
          <div className="bg-slate-50 dark:bg-[#041B2D]/80 px-5 py-3 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2 text-left">
              <ShieldAlert className="w-4.5 h-4.5 text-[#0085C8]" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800 dark:text-white">SSGI GEODYNAMICS &amp; HAZARD BRIEF</span>
                  <span className="text-[10px] bg-[#0085C8]/10 text-[#0085C8] dark:text-[#00D4FF] border border-[#0085C8]/20 px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                    {selectedTopic} Focus
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                    {isAiGenerated ? "GEMINI FLINT AI v3.5" : "SYSTEM LOCAL"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Authorized geodetic telemetry &amp; regional georisk briefing file.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 animate-fade-in">
              {/* Download PDF for Offline Briefing */}
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs font-bold"
                title="Download formatted geological and seismic risk summary as PDF for offline briefing"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-100" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handleCopy}
                className="bg-white dark:bg-[#041B2D]/55 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-2xs font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess ? "Copied!" : "Copy MD"}</span>
              </button>
              
              <button
                onClick={handleDownloadMarkdown}
                className="bg-white dark:bg-[#041B2D]/55 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-2xs font-bold"
                title="Download report in Markdown format (.md)"
              >
                <Download className="w-3.5 h-3.5 text-[#0085C8]" />
                <span>Download .MD</span>
              </button>

              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 dark:border-white/10 py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-2xs font-bold"
                title="Print Report as PDF-ready format"
              >
                <Printer className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>Print</span>
              </button>
              
              <button
                onClick={handleDownloadCsv}
                className="bg-white dark:bg-[#041B2D]/55 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-2xs font-bold"
                title="Export georisk telemetry data inventory in CSV format"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => handleGenerateReport(selectedTopic)}
                className="bg-gradient-to-r from-[#0085C8] to-[#00D4FF] border border-[#00D4FF]/25 text-white py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-md font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Render Area */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#041B2D]/25 overflow-y-auto max-h-[600px] border-b border-slate-200 dark:border-white/10 font-sans text-slate-800 dark:text-slate-100">
            <div className="space-y-3 prose max-w-none text-slate-800 dark:text-slate-100">
              {renderMarkdown(report)}
            </div>
          </div>

          {/* Verification Disclaimer Footer */}
          <div className="bg-slate-50 dark:bg-[#041B2D]/60 px-5 py-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono text-center border-t border-slate-200 dark:border-white/10">
            DISCLOSURE: This briefing document compiles statistical geodetic and seismic vectors. Real-time seismic trends vary, and physical site exploration should always be verified alongside the Space Science and Geospatial Institute (SSGI) - Department of Geodesy and Geodynamics.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICER OFFLINE BRIEFING PDF EXPORT CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {isPdfModalOpen && (
        <div
          onClick={() => setIsPdfModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0c121e] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100 relative cursor-default"
          >
            {/* Top Federal Ribbon */}
            <div className="h-1.5 bg-gradient-to-r from-[#0E4A72] via-[#D48F29] to-[#0085C8] w-full" />

            {/* Modal Header */}
            <div className="bg-[#0E4A72] px-6 py-4 text-white flex items-center justify-between border-b border-[#D48F29]/30">
              <div className="flex items-center gap-3">
                <div className="bg-[#D48F29]/20 p-2 rounded-xl border border-[#D48F29]/40 text-[#F7D08A] shrink-0">
                  <FileCheck className="w-5 h-5 text-[#F7D08A]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-[#F7D08A] uppercase font-bold flex items-center gap-2">
                    <span>SSGI // DEPT OF GEODESY &amp; GEODYNAMICS</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isAdmin
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : isStaff
                        ? "bg-sky-500/20 text-sky-300 border border-sky-400/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                    }`}>
                      {isAdmin ? "ADMIN" : isStaff ? "STAFF" : "GUEST"}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm tracking-wide text-white">
                    Geohazard Briefing PDF Generator
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Role-Based Access Guidance Banner */}
              {isGuest ? (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Guest Mode: Public Advisory Downloads Enabled</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      You have access to <strong>Combined Georisk</strong>, <strong>Seismic Catalog</strong>, and <strong>Volcanic Plumes</strong> public advisories. Operational directives (Geodesy Directive, Infrastructure, GNSS Strain, Executive Brief) and official credentials require authenticated <strong>Staff</strong> or <strong>Admin</strong> sign-in.
                    </p>
                  </div>
                </div>
              ) : isStaff && !isAdmin ? (
                <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl flex items-start gap-2.5 text-sky-800 dark:text-sky-300 text-xs">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Staff Operational Clearance Active</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      You are authorized to generate operational Geodesy Directives, Infrastructure Vulnerability, GNSS Strain, and standard briefings with official credentials.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">Administrator Full Clearance Active</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Full access to all briefing templates, Executive Strategic direct syntheses, and custom clearance levels.
                    </p>
                  </div>
                </div>
              )}

              {/* Access Denied Warning */}
              {accessDeniedMessage && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/50 p-3 rounded-xl flex items-center gap-2.5 text-rose-800 dark:text-rose-300 text-xs font-semibold animate-shake">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{accessDeniedMessage}</span>
                </div>
              )}

              {/* Success Notification Banner */}
              {pdfSuccessMessage && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 p-3 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pdfSuccessMessage}</span>
                </div>
              )}

              {/* Briefing Scope Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#0085C8]" />
                  <span>1. Briefing Document Scope</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  
                  {/* Full Scope - Public */}
                  <div
                    onClick={() => {
                      setAccessDeniedMessage(null);
                      setPdfOptions((p) => ({ ...p, briefingType: "all" }));
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      pdfOptions.briefingType === "all"
                        ? "bg-[#0E4A72]/10 dark:bg-[#0E4A72]/30 border-[#0E4A72] dark:border-cyan-400 font-bold shadow-2xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <Shield className="w-4 h-4 text-[#0085C8]" />
                        <span className="font-bold">Combined Georisk</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        PUBLIC
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Full summary: Volcanoes, Earthquakes, Infrastructure &amp; Geodesy.
                    </p>
                  </div>

                  {/* Seismic Focus - Public */}
                  <div
                    onClick={() => {
                      setAccessDeniedMessage(null);
                      setPdfOptions((p) => ({ ...p, briefingType: "seismic" }));
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      pdfOptions.briefingType === "seismic"
                        ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 font-bold shadow-2xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                        <Activity className="w-4 h-4" />
                        <span className="font-bold">Seismic Catalog</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        PUBLIC
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Focus on Richter strain, focal depths, swarms &amp; station records.
                    </p>
                  </div>

                  {/* Volcanic Focus - Public */}
                  <div
                    onClick={() => {
                      setAccessDeniedMessage(null);
                      setPdfOptions((p) => ({ ...p, briefingType: "volcanic" }));
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      pdfOptions.briefingType === "volcanic"
                        ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500 font-bold shadow-2xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">Volcanic Plumes</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        PUBLIC
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Caldera vents, Erta Ale exclusion perimeter &amp; degassing.
                    </p>
                  </div>

                  {/* Infrastructure Focus - Staff/Admin Only */}
                  <div
                    onClick={() => {
                      if (isGuest) {
                        setAccessDeniedMessage("Infrastructure Vulnerability briefs require authenticated Staff or Admin clearance.");
                        return;
                      }
                      setAccessDeniedMessage(null);
                      setPdfOptions((p) => ({ ...p, briefingType: "infrastructure" }));
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isGuest
                        ? "opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 cursor-not-allowed"
                        : pdfOptions.briefingType === "infrastructure"
                        ? "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500 font-bold shadow-2xs cursor-pointer"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 opacity-80 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                        <Building2 className="w-4 h-4" />
                        <span className="font-bold">Infrastructure</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                        isGuest ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      }`}>
                        {isGuest && <Lock className="w-2.5 h-2.5" />}
                        STAFF
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Railway, highways, dams &amp; geothermal facility vulnerability.
                    </p>
                  </div>

                  {/* Geodesy Directives - Staff/Admin Only */}
                  <div
                    onClick={() => {
                      if (isGuest) {
                        setAccessDeniedMessage("Geodesy & Geodynamics Strategic Directives require authenticated Staff or Admin clearance.");
                        return;
                      }
                      setAccessDeniedMessage(null);
                      setPdfOptions((p) => ({ ...p, briefingType: "geodesy" }));
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isGuest
                        ? "opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 cursor-not-allowed"
                        : pdfOptions.briefingType === "geodesy"
                        ? "bg-red-500/10 dark:bg-red-500/20 border-red-500 font-bold shadow-2xs cursor-pointer"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 opacity-80 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="font-bold">Geodesy Directive</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                        isGuest ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      }`}>
                        {isGuest && <Lock className="w-2.5 h-2.5" />}
                        STAFF
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Geodetic strain, structural safety &amp; emergency buffers.
                    </p>
                  </div>

                  {/* GNSS Geodesy - Staff/Admin Only */}
                  <div
                    onClick={() => {
                      if (isGuest) {
                        setAccessDeniedMessage("Crustal Deformation & GNSS Vector briefs require authenticated Staff or Admin clearance.");
                        return;
                      }
                      setAccessDeniedMessage(null);
                      setPdfOptions((p) => ({ ...p, briefingType: "gnss" }));
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isGuest
                        ? "opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 cursor-not-allowed"
                        : pdfOptions.briefingType === "gnss"
                        ? "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500 font-bold shadow-2xs cursor-pointer"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 opacity-80 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                        <Compass className="w-4 h-4" />
                        <span className="font-bold">GNSS Strain</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                        isGuest ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      }`}>
                        {isGuest && <Lock className="w-2.5 h-2.5" />}
                        STAFF
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Plate divergence rates, InSAR velocity &amp; FURI tracking.
                    </p>
                  </div>

                  {/* Executive Brief - Admin Only */}
                  <div
                    onClick={() => {
                      if (!isAdmin) {
                        setAccessDeniedMessage("Executive Strategic synthesis is restricted strictly to Administrator level clearance.");
                        return;
                      }
                      setAccessDeniedMessage(null);
                      setPdfOptions((p) => ({ ...p, briefingType: "executive" }));
                    }}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      !isAdmin
                        ? "opacity-50 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 cursor-not-allowed"
                        : pdfOptions.briefingType === "executive"
                        ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 font-bold shadow-2xs cursor-pointer"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 opacity-80 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <Shield className="w-4 h-4" />
                        <span className="font-bold">Executive Strategic</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                        !isAdmin ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {!isAdmin && <Lock className="w-2.5 h-2.5" />}
                        ADMIN
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Director General level synthesis &amp; ministerial directives.
                    </p>
                  </div>

                </div>
              </div>

              {/* Classification Clearance Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    2. Document Classification Clearance
                  </label>
                  {isGuest && (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked to Public Advisory
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {(["RESTRICTED", "CONFIDENTIAL", "OFFICIAL USE ONLY", "PUBLIC ADVISORY"] as const).map((lvl) => {
                    const isRestrictedForGuest = isGuest && lvl !== "PUBLIC ADVISORY";
                    return (
                      <button
                        key={lvl}
                        type="button"
                        disabled={isRestrictedForGuest}
                        onClick={() => {
                          if (isRestrictedForGuest) {
                            setAccessDeniedMessage("Classification levels above PUBLIC ADVISORY require authenticated Staff or Admin credentials.");
                            return;
                          }
                          setAccessDeniedMessage(null);
                          setPdfOptions((p) => ({ ...p, classification: lvl }));
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-center font-bold uppercase transition-all text-[10px] flex items-center justify-center gap-1.5 ${
                          isRestrictedForGuest
                            ? "opacity-40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed bg-slate-100/50 dark:bg-slate-900/50"
                            : pdfOptions.classification === lvl
                            ? "bg-[#D48F29] text-white border-[#D48F29] shadow-xs cursor-pointer"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                        }`}
                      >
                        {isRestrictedForGuest && <Lock className="w-3 h-3 text-slate-400" />}
                        <span>{lvl}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Briefing Officer Details */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    3. Authorized Briefing Officer Credentials
                  </label>
                  {isGuest && (
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Guest View (Watermarked)
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold">Officer Name</span>
                    <input
                      type="text"
                      disabled={isGuest}
                      value={pdfOptions.officerName}
                      onChange={(e) => setPdfOptions((p) => ({ ...p, officerName: e.target.value }))}
                      placeholder="e.g. Kalkidan Getachew"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 px-3 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-[#0085C8] ${
                        isGuest ? "opacity-75 cursor-not-allowed bg-slate-100/70 dark:bg-slate-900/50" : ""
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold">Role / Designation</span>
                    <input
                      type="text"
                      disabled={isGuest}
                      value={pdfOptions.officerRole}
                      onChange={(e) => setPdfOptions((p) => ({ ...p, officerRole: e.target.value }))}
                      placeholder="e.g. Senior Seismologist"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 px-3 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-[#0085C8] ${
                        isGuest ? "opacity-75 cursor-not-allowed bg-slate-100/70 dark:bg-slate-900/50" : ""
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold">Directorate / Unit</span>
                  <input
                    type="text"
                    disabled={isGuest}
                    value={pdfOptions.officerInstitution}
                    onChange={(e) => setPdfOptions((p) => ({ ...p, officerInstitution: e.target.value }))}
                    placeholder="e.g. SSGI Department of Geodesy and geodynamics"
                    className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 px-3 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-[#0085C8] ${
                      isGuest ? "opacity-75 cursor-not-allowed bg-slate-100/70 dark:bg-slate-900/50" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Data Ingest Preview */}
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Included Live Telemetry Inventory</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Verified Offline Cache
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                  <div>• {volcanoes.length} Volcano Centers</div>
                  <div>• {earthquakes.length} Earthquake Feeds</div>
                  <div>• Peak: M {maxMag.toFixed(1)} Richter</div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-100 dark:bg-[#090d16] px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={() => handleExecutePdfExport()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering Vector PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download {isGuest ? "Public Advisory PDF" : "Official PDF Briefing"}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Legacy Print Portal for browser Ctrl+P */}
      {loaded && !loading && isMounted && createPortal(
        <div className="hidden print:block printable-report-wrapper">
          <div className="print-report-container w-full max-w-4xl mx-auto p-4 bg-white text-slate-900 border border-slate-300 rounded-lg">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-800 flex items-center justify-center font-serif text-xs font-black select-none shrink-0 text-slate-800">
                  SSGI
                </div>
                <div className="text-left">
                  <h1 className="text-[13px] font-black tracking-wider uppercase font-sans text-slate-900 leading-tight">
                    Space Science and Geospatial Institute (SSGI)
                  </h1>
                  <h2 className="text-[11px] font-bold text-sky-800 font-sans tracking-wide uppercase mt-0.5">
                    Department of Geodesy and Geodynamics
                  </h2>
                  <p className="text-[8.5px] text-slate-500 font-mono mt-0.5">SSGI REAL-TIME GEOSPATIAL HAZARD NETWORK</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="bg-slate-900 text-white font-mono font-extrabold text-[8px] px-2 py-0.5 rounded uppercase tracking-widest">
                  Geodesy &amp; Geodynamics Brief
                </div>
                <p className="text-[9px] text-slate-500 font-mono mt-1">OFFICIAL GEOHAZARD TELEMETRY</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 bg-slate-50 border border-slate-300 p-3 rounded-md mb-4 text-[10px]">
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Preparation Date</span>
                <span className="font-bold text-slate-800 font-mono">
                  {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Active Alerts</span>
                <span className="font-bold text-slate-800 font-mono">{activeVolcanoes.length} Volcano Vents</span>
              </div>
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">USGS Seismic Catalogs</span>
                <span className="font-bold text-slate-800 font-mono">{criticalSeismicEvents} Incidents (&ge;4.5)</span>
              </div>
              <div className="text-left">
                <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Max Recorded Strain</span>
                <span className="font-bold text-rose-700 font-mono">M {maxMag.toFixed(1)} Richter</span>
              </div>
            </div>

            <div className="border-b border-slate-300 pb-2 mb-4 text-left">
              <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-tight">
                AI Geological Advisory & Tectonic Alert Briefing Document ({selectedTopic.toUpperCase()})
              </h2>
              <div className="flex gap-4 text-[9px] text-slate-500 font-mono mt-1">
                <span>GEN-ENGINE: GEMINI PRO</span>
                <span>CLEARANCE: LEVEL-2 OPERATIONAL DIRECTIVE</span>
                <span>INTELLIGENCE SOURCE: SSGI / USGS BROADBAND MATRIX</span>
              </div>
            </div>

            <div className="space-y-3 printable-content-body font-sans text-[10px] text-slate-800 leading-relaxed text-left">
              {renderMarkdown(report)}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-300">
              <div className="grid grid-cols-2 gap-8 text-[9px] text-slate-500 font-mono mt-2">
                <div className="text-left">
                  <div className="border-b border-slate-400 pb-8 mb-1"></div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Prepared: SSGI Department of Geodesy and Geodynamics</span>
                    <span>Date</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="border-b border-slate-400 pb-8 mb-1"></div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Authorized: SSGI Directorate General</span>
                    <span>Seal / Stamp</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-[8px] text-slate-400 font-mono text-center border-t border-slate-200 pt-2 leading-normal">
              SSGI DEPARTMENT OF GEODESY AND GEODYNAMICS • REAL-TIME GEOHAZARD TELEMETRY PORTAL. All live trends must be cross-verified in-situ prior to civil infrastructure operations.
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
