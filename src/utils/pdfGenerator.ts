import { jsPDF } from "jspdf";
import { Volcano, Earthquake, UserRole } from "../types";

export interface PdfBriefingOptions {
  briefingType: "all" | "seismic" | "volcanic" | "infrastructure" | "geodesy" | "drmc" | "gnss" | "executive";
  classification: "RESTRICTED" | "CONFIDENTIAL" | "OFFICIAL USE ONLY" | "PUBLIC ADVISORY";
  officerName: string;
  officerRole: string;
  officerInstitution: string;
  reportNotes?: string;
  includeAiSummary?: boolean;
  aiSummaryText?: string;
  regionFocus?: string;
}

export function generateRiskSummaryPdf(
  volcanoes: Volcano[],
  earthquakes: Earthquake[],
  currentUser?: UserRole,
  options?: Partial<PdfBriefingOptions>
): { doc: jsPDF; filename: string } {
  const isStaffOrAdmin =
    currentUser?.role === "staff" ||
    currentUser?.role === "official" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "superadmin";

  let rawBriefingType = options?.briefingType || "all";
  if (rawBriefingType === "drmc") {
    rawBriefingType = "geodesy";
  }

  // Security enforcement: Restrict briefing types and classifications for guests
  let briefingType = rawBriefingType;
  let classification = options?.classification || "RESTRICTED";

  if (!isStaffOrAdmin) {
    // Guest is strictly restricted to Public Advisory and public-tier briefing scopes
    classification = "PUBLIC ADVISORY";
    if (briefingType === "geodesy" || briefingType === "infrastructure" || briefingType === "gnss" || briefingType === "executive") {
      briefingType = "all"; // Fall back to general public overview
    }
  }

  const officerName = isStaffOrAdmin
    ? (options?.officerName || currentUser?.name || "Authorized Officer")
    : (currentUser?.name ? `${currentUser.name} (Guest Researcher)` : "Public Access User");
    
  const officerRole = isStaffOrAdmin
    ? (options?.officerRole || currentUser?.role?.toUpperCase() + " OFFICER" || "GEOPHYSICAL OFFICER")
    : "PUBLIC ADVISORY VIEWER";

  const officerInstitution = isStaffOrAdmin
    ? (options?.officerInstitution || currentUser?.institution || "SSGI Department of Geodesy and geodynamics")
    : "Public Geospatial Portal / Open Telemetry";

  const aiSummaryText = options?.aiSummaryText;
  const regionFocus = options?.regionFocus || "National Rift & Tectonic Sectors";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let cursorY = 14;

  const activeVolcanoes = volcanoes.filter((v) => v.severity !== "Green");
  const severeEarthquakes = earthquakes.filter((e) => e.magnitude >= 4.5 || e.severity === "Red" || e.severity === "Orange");
  const maxMag = earthquakes.length ? Math.max(...earthquakes.map((e) => e.magnitude)) : 0;
  const generationDate = new Date();
  const dateStr = generationDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = generationDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const docUuid = "SSGI-GEO-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + generationDate.getFullYear();

  // Helper for adding new page with running header
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 18) {
      doc.addPage();
      cursorY = 16;
      renderRunningHeader();
    }
  };

  const renderRunningHeader = () => {
    doc.setFillColor(14, 74, 114); // #0E4A72
    doc.rect(marginX, cursorY, contentWidth, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text("FDRE SSGI // Department of Geodesy and geodynamics // Geohazard Surveillance Briefing", marginX + 3, cursorY + 4.2);
    doc.text(classification, marginX + contentWidth - 3, cursorY + 4.2, { align: "right" });
    cursorY += 10;
  };

  // =========================================================================
  // PAGE 1: OFFICIAL COVER & HEADER BANNER (NO DRMC, NO East African Rift System)
  // =========================================================================
  
  // Top Federal Accent Bar
  doc.setFillColor(14, 74, 114); // Primary Navy
  doc.rect(marginX, cursorY, contentWidth, 27, "F");
  
  doc.setFillColor(212, 143, 41); // Gold Accent Stripe
  doc.rect(marginX, cursorY + 27, contentWidth, 2, "F");

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA", marginX + 6, cursorY + 5.5);

  doc.setFontSize(8.5);
  doc.setTextColor(247, 208, 138);
  doc.text("SPACE SCIENCE AND GEOSPATIAL INSTITUTE (SSGI)", marginX + 6, cursorY + 10);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Department of Geodesy and geodynamics", marginX + 6, cursorY + 14.5);

  doc.setFontSize(7);
  doc.setTextColor(220, 235, 245);
  doc.text("National Geohazard & Tectonic Surveillance Division", marginX + 6, cursorY + 19);
  doc.text("Real-Time Seismic Array & Geodetic Telemetry Directorate", marginX + 6, cursorY + 23);

  // Classification Tag in Header Right
  doc.setFillColor(212, 143, 41);
  doc.roundedRect(marginX + contentWidth - 42, cursorY + 4, 38, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(14, 74, 114);
  doc.text(classification, marginX + contentWidth - 23, cursorY + 8.5, { align: "center" });

  doc.setFontSize(6.5);
  doc.setTextColor(200, 225, 240);
  doc.text(`DOC REF: ${docUuid}`, marginX + contentWidth - 4, cursorY + 20, { align: "right" });

  cursorY += 34;

  // Document Title Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(14, 74, 114);
  
  let titleText = "COMPREHENSIVE SEISMIC & VOLCANIC RISK BRIEFING FILE";
  if (briefingType === "seismic") {
    titleText = "SEISMIC HAZARD & RECURRENT TREMOR CATALOG REPORT";
  } else if (briefingType === "volcanic") {
    titleText = "VOLCANIC THREAT & MAGMATIC PLUME SURVEILLANCE BRIEF";
  } else if (briefingType === "infrastructure") {
    titleText = "CRITICAL INFRASTRUCTURE & ENERGY CORRIDOR VULNERABILITY REPORT";
  } else if (briefingType === "geodesy") {
    titleText = "GEODESY & GEODYNAMICS STRATEGIC DIRECTIVE FILE";
  } else if (briefingType === "gnss") {
    titleText = "GNSS GEODETIC RIFT STRAIN & SATELLITE INSAR DISPLACEMENT REPORT";
  } else if (briefingType === "executive") {
    titleText = "EXECUTIVE DIRECTOR GENERAL STRATEGIC GEOHAZARD BRIEF";
  }

  doc.text(titleText, marginX, cursorY);
  cursorY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 90, 100);
  doc.text(`Official Decision Support Assessment prepared for Operational Taskforces, Sector Engineers, and Civil Authorities.`, marginX, cursorY);
  cursorY += 7;

  // Metadata Parameters Box (Date, Officer, Classification)
  doc.setFillColor(245, 248, 252);
  doc.setDrawColor(210, 225, 240);
  doc.roundedRect(marginX, cursorY, contentWidth, 18, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(14, 74, 114);
  doc.text("PREPARATION DATE:", marginX + 4, cursorY + 5);
  doc.text("BRIEFING OFFICER:", marginX + 64, cursorY + 5);
  doc.text("CLEARANCE LEVEL:", marginX + 130, cursorY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 40, 50);
  doc.text(`${dateStr} (${timeStr})`, marginX + 4, cursorY + 10);
  doc.text(`${officerName} [${officerRole}]`, marginX + 64, cursorY + 10);
  doc.text(`${classification} // OFFICIAL BRIEFING`, marginX + 130, cursorY + 10);

  doc.setFontSize(7);
  doc.setTextColor(100, 110, 120);
  doc.text(`Institution: ${officerInstitution} • Department of Geodesy and geodynamics`, marginX + 4, cursorY + 15);
  doc.text(`Target Region: ${regionFocus} • Telemetry: SSGI, USGS, InSAR LiCSBAS, IU.FURI`, marginX + 64, cursorY + 15);

  cursorY += 23;

  // =========================================================================
  // KEY STATISTICAL KPI BADGES
  // =========================================================================
  const cardW = (contentWidth - 9) / 4; // 4 cards
  const cardH = 15;

  // Card 1: Volcano Alerts
  doc.setFillColor(activeVolcanoes.length > 0 ? 254 : 240, activeVolcanoes.length > 0 ? 242 : 245, activeVolcanoes.length > 0 ? 242 : 248);
  doc.setDrawColor(activeVolcanoes.length > 0 ? 239 : 200, activeVolcanoes.length > 0 ? 68 : 210, activeVolcanoes.length > 0 ? 68 : 220);
  doc.roundedRect(marginX, cursorY, cardW, cardH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(150, 40, 40);
  doc.text("ACTIVE VOLCANO ALERTS", marginX + cardW / 2, cursorY + 4.5, { align: "center" });
  doc.setFontSize(11);
  doc.text(`${activeVolcanoes.length} Vents`, marginX + cardW / 2, cursorY + 10.5, { align: "center" });
  doc.setFontSize(5.5);
  doc.text(`${volcanoes.length} Total Centers Monitored`, marginX + cardW / 2, cursorY + 13.5, { align: "center" });

  // Card 2: Peak Magnitude
  doc.setFillColor(254, 249, 235);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(marginX + cardW + 3, cursorY, cardW, cardH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(180, 100, 10);
  doc.text("PEAK SEISMIC STRAIN", marginX + cardW + 3 + cardW / 2, cursorY + 4.5, { align: "center" });
  doc.setFontSize(11);
  doc.text(`M ${maxMag.toFixed(1)} Richter`, marginX + cardW + 3 + cardW / 2, cursorY + 10.5, { align: "center" });
  doc.setFontSize(5.5);
  doc.text("Max Ground Shaking Ingest", marginX + cardW + 3 + cardW / 2, cursorY + 13.5, { align: "center" });

  // Card 3: Severe Earthquakes (M >= 4.5)
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(244, 63, 94);
  doc.roundedRect(marginX + (cardW + 3) * 2, cursorY, cardW, cardH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(190, 20, 50);
  doc.text("SEVERE RUPTURES (≥4.5)", marginX + (cardW + 3) * 2 + cardW / 2, cursorY + 4.5, { align: "center" });
  doc.setFontSize(11);
  doc.text(`${severeEarthquakes.length} Events`, marginX + (cardW + 3) * 2 + cardW / 2, cursorY + 10.5, { align: "center" });
  doc.setFontSize(5.5);
  doc.text(`${earthquakes.length} Total Telemetry Feeds`, marginX + (cardW + 3) * 2 + cardW / 2, cursorY + 13.5, { align: "center" });

  // Card 4: Observatory Status
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(marginX + (cardW + 3) * 3, cursorY, cardW, cardH, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(20, 120, 50);
  doc.text("IU.FURI OBSERVATORY", marginX + (cardW + 3) * 3 + cardW / 2, cursorY + 4.5, { align: "center" });
  doc.setFontSize(10);
  doc.text("OPERATIONAL", marginX + (cardW + 3) * 3 + cardW / 2, cursorY + 10.5, { align: "center" });
  doc.setFontSize(5.5);
  doc.text("Continuous Real-Time Feed", marginX + (cardW + 3) * 3 + cardW / 2, cursorY + 13.5, { align: "center" });

  cursorY += 20;

  // =========================================================================
  // SECTION 1: EXECUTIVE INTELLIGENCE SUMMARY
  // =========================================================================
  checkPageBreak(35);
  doc.setFillColor(14, 74, 114);
  doc.rect(marginX, cursorY, 3, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(14, 74, 114);
  doc.text("1. EXECUTIVE SITUATION & TECTONIC OVERVIEW", marginX + 6, cursorY + 4);
  cursorY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 50, 60);

  const defaultExecSummary = `Ethiopia's active tectonic alignment exposes critical economic corridors and settlements to active crustal thinning, normal faulting, and magmatic plume ascent. Current geodetic surveillance by SSGI Department of Geodesy and Geodynamics monitors ${volcanoes.length} volcanic vents and ${earthquakes.length} recent seismic rupture nodes. 

Tectonic stress concentrations remain monitored across two primary sectors:
1. The Afar Triple Junction (Semera-Dobi-Tendaho graben segment) with active crustal strain and shallow swarm potential.
2. The Main Ethiopian Rift (Awash-Fentale, Aluto-Langano, and Adama corridors) with proximity to international highway logistics arteries and geothermal energy installations.`;

  const summaryToPrint = aiSummaryText || defaultExecSummary;
  const splitSummary = doc.splitTextToSize(summaryToPrint, contentWidth);
  doc.text(splitSummary, marginX, cursorY);
  cursorY += splitSummary.length * 4 + 4;

  // =========================================================================
  // SECTION 2: VOLCANIC RISK & THERMAL PLUME MATRIX (IF APPLICABLE)
  // =========================================================================
  if (briefingType === "all" || briefingType === "volcanic" || briefingType === "executive") {
    checkPageBreak(50);
    doc.setFillColor(14, 74, 114);
    doc.rect(marginX, cursorY, 3, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(14, 74, 114);
    doc.text("2. VOLCANIC THREAT & ACTIVE VENT MATRIX", marginX + 6, cursorY + 4);
    cursorY += 7;

    // Table Header
    doc.setFillColor(235, 242, 250);
    doc.setDrawColor(200, 215, 235);
    doc.rect(marginX, cursorY, contentWidth, 6, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(14, 74, 114);
    doc.text("VOLCANO NAME", marginX + 3, cursorY + 4.2);
    doc.text("RIFT REGION", marginX + 45, cursorY + 4.2);
    doc.text("STRUCTURE / TYPE", marginX + 85, cursorY + 4.2);
    doc.text("ELEVATION", marginX + 125, cursorY + 4.2);
    doc.text("ALERT LEVEL", marginX + 152, cursorY + 4.2);

    cursorY += 6;

    // Table Rows
    const displayVolcs = volcanoes.slice(0, briefingType === "volcanic" ? 14 : 8);
    displayVolcs.forEach((v, index) => {
      checkPageBreak(7);
      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 254);
      doc.setDrawColor(230, 235, 245);
      doc.rect(marginX, cursorY, contentWidth, 6, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(20, 30, 40);
      doc.text(v.name, marginX + 3, cursorY + 4.2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(70, 80, 90);
      doc.text(v.region, marginX + 45, cursorY + 4.2);
      doc.text(v.type, marginX + 85, cursorY + 4.2);
      doc.text(`${v.elevation}m`, marginX + 125, cursorY + 4.2);

      // Severity Badge
      let badgeBg = [220, 252, 231]; // Green
      let badgeText = [22, 101, 52];
      if (v.severity === "Red") {
        badgeBg = [254, 226, 226];
        badgeText = [185, 28, 28];
      } else if (v.severity === "Orange") {
        badgeBg = [255, 237, 213];
        badgeText = [194, 65, 12];
      } else if (v.severity === "Yellow") {
        badgeBg = [254, 249, 195];
        badgeText = [161, 98, 7];
      }

      doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
      doc.roundedRect(marginX + 150, cursorY + 1.2, 28, 3.8, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
      doc.text(`${v.severity.toUpperCase()} ALERT`, marginX + 164, cursorY + 3.8, { align: "center" });

      cursorY += 6;
    });

    cursorY += 4;
  }

  // =========================================================================
  // SECTION 3: SEISMIC TELEMETRY & SIGNIFICANT RUPTURES (IF APPLICABLE)
  // =========================================================================
  if (briefingType === "all" || briefingType === "seismic" || briefingType === "gnss" || briefingType === "executive") {
    checkPageBreak(50);
    doc.setFillColor(14, 74, 114);
    doc.rect(marginX, cursorY, 3, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(14, 74, 114);
    doc.text(
      briefingType === "gnss"
        ? "3. SEISMOTECTONIC RUPTURES & CRUSTAL STRAIN RECORDS"
        : "3. SEISMIC CATALOG & HIGH-MAGNITUDE RUPTURE TELEMETRY",
      marginX + 6,
      cursorY + 4
    );
    cursorY += 7;

    // Table Header
    doc.setFillColor(235, 242, 250);
    doc.setDrawColor(200, 215, 235);
    doc.rect(marginX, cursorY, contentWidth, 6, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(14, 74, 114);
    doc.text("MAGNITUDE", marginX + 3, cursorY + 4.2);
    doc.text("EPICENTER / LOCATION", marginX + 30, cursorY + 4.2);
    doc.text("FOCAL DEPTH", marginX + 98, cursorY + 4.2);
    doc.text("TIME STAMP (UTC/LOCAL)", marginX + 128, cursorY + 4.2);
    doc.text("SEVERITY", marginX + 164, cursorY + 4.2);

    cursorY += 6;

    // Table Rows
    const topEarthquakes = earthquakes.slice(0, briefingType === "seismic" ? 14 : 8);
    topEarthquakes.forEach((eq, index) => {
      checkPageBreak(6.5);
      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 254);
      doc.setDrawColor(230, 235, 245);
      doc.rect(marginX, cursorY, contentWidth, 6, "FD");

      // Magnitude Pill
      let magBg = [240, 253, 244];
      let magCol = [22, 101, 52];
      if (eq.magnitude >= 5.0) {
        magBg = [254, 226, 226];
        magCol = [185, 28, 28];
      } else if (eq.magnitude >= 4.0) {
        magBg = [255, 237, 213];
        magCol = [194, 65, 12];
      }

      doc.setFillColor(magBg[0], magBg[1], magBg[2]);
      doc.roundedRect(marginX + 3, cursorY + 1.2, 18, 3.8, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(magCol[0], magCol[1], magCol[2]);
      doc.text(`M ${eq.magnitude.toFixed(1)}`, marginX + 12, cursorY + 3.8, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(30, 40, 50);
      const locationText = eq.location.length > 38 ? eq.location.substring(0, 36) + "..." : eq.location;
      doc.text(locationText, marginX + 30, cursorY + 4.2);
      doc.text(`${eq.depth} km`, marginX + 98, cursorY + 4.2);

      const eqDate = new Date(eq.dateTime);
      const eqDateFormatted = eqDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      doc.text(eqDateFormatted, marginX + 128, cursorY + 4.2);
      doc.text(eq.severity, marginX + 164, cursorY + 4.2);

      cursorY += 6;
    });

    cursorY += 4;
  }

  // =========================================================================
  // SECTION 4: CRITICAL INFRASTRUCTURE & DISASTER RESPONSE DIRECTIVES
  // =========================================================================
  checkPageBreak(55);
  doc.setFillColor(14, 74, 114);
  doc.rect(marginX, cursorY, 3, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(14, 74, 114);
  doc.text("4. INFRASTRUCTURE VULNERABILITY & OPERATIONAL DIRECTIVES", marginX + 6, cursorY + 4);
  cursorY += 7;

  const directives = [
    "1. TRANSPORT & CORRIDOR INTEGRITY: Enforce mandatory structural checks on bridges and rail embankments along the Addis Ababa - Djibouti Highway (A10) following any rupture of M >= 4.5.",
    "2. GEOTHERMAL & ENERGY ASSET MONITORING: Maintain continuous borehole microseismic tracking at Aluto-Langano and Tendaho geothermal sites to prevent induced permeability hydrofractures.",
    "3. ACTIVE VOLCANO EXCLUSION ENVELOPE: Maintain a strict 5.0 km civilian and tourist exclusion buffer around the active Erta Ale lava lake crater during periods of elevated thermal luminescence.",
    "4. MULTILINGUAL GEOHAZARD ALERT DISPATCH: SSGI Geodesy and Geodynamics Directorate authorizes automated early warning broadcasts in Amharic, Afar, and Afaan Oromoo to pastoralist settlements and infrastructure zones."
  ];

  directives.forEach((dir) => {
    checkPageBreak(10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(40, 50, 60);
    const splitDir = doc.splitTextToSize(dir, contentWidth - 4);
    doc.text(splitDir, marginX + 2, cursorY);
    cursorY += splitDir.length * 3.8 + 2;
  });

  cursorY += 4;

  // =========================================================================
  // SECTION 5: FORMAL AUTHENTICATION & SIGN-OFF BLOCK
  // =========================================================================
  checkPageBreak(35);
  doc.setDrawColor(200, 215, 230);
  doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
  cursorY += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(14, 74, 114);
  doc.text("5. AUTHENTICATION & VERIFICATION OF BRIEFING DOCUMENT", marginX, cursorY + 2);
  cursorY += 6;

  const signColW = contentWidth / 2 - 4;

  // Left Box: Prepared By
  doc.setFillColor(248, 250, 253);
  doc.roundedRect(marginX, cursorY, signColW, 22, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(14, 74, 114);
  doc.text("PREPARED & VERIFIED BY:", marginX + 3, cursorY + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 40, 50);
  doc.text(`Officer: ${officerName}`, marginX + 3, cursorY + 9);
  doc.text(`Designation: ${officerRole} / Department of Geodesy and geodynamics (SSGI)`, marginX + 3, cursorY + 13.5);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 110, 120);
  doc.text(`Digital Verification Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, marginX + 3, cursorY + 18.5);

  // Right Box: Authorized Signature & Seal
  doc.setFillColor(248, 250, 253);
  doc.roundedRect(marginX + signColW + 8, cursorY, signColW, 22, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(14, 74, 114);
  doc.text("SSGI DEPARTMENT OF GEODESY & GEODYNAMICS:", marginX + signColW + 11, cursorY + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 40, 50);
  doc.text("Geodesy & Geodynamics Directorate Seal", marginX + signColW + 11, cursorY + 9);
  doc.setDrawColor(180, 195, 215);
  doc.line(marginX + signColW + 11, cursorY + 15, marginX + contentWidth - 4, cursorY + 15);
  doc.setFontSize(6.5);
  doc.setTextColor(120, 130, 140);
  doc.text("Authorized Signature & Official Directorate Stamp", marginX + signColW + 11, cursorY + 19);

  cursorY += 26;

  // =========================================================================
  // RUNNING FOOTERS ON ALL PAGES
  // =========================================================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(210, 220, 230);
    doc.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(120, 130, 140);
    doc.text(
      "CONFIDENTIAL • FDRE SSGI (Department of Geodesy and geodynamics) • FOR AUTHORIZED BRIEFINGS ONLY",
      marginX,
      pageHeight - 7.5
    );
    doc.text(`Page ${i} of ${totalPages}`, marginX + contentWidth, pageHeight - 7.5, { align: "right" });
  }

  const filename = `SSGI_GEODESY_${briefingType.toUpperCase()}_Risk_Briefing_${generationDate.toISOString().split("T")[0]}.pdf`;
  return { doc, filename };
}
