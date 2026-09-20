import React, { useState, useEffect, useMemo } from "react";
import {
  BellRing,
  Sliders,
  Smartphone,
  Mail,
  ShieldAlert,
  Send,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Radio,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Layers,
  MapPin,
  Flame,
  Check,
  X,
  Info,
  Globe2,
  ShieldCheck,
  CheckCheck
} from "lucide-react";
import { AlertThresholdConfig, AlertDispatchLog, UserRoleType } from "../../types";
import { authenticatedFetch } from "../../lib/api";

interface AlertThresholdConfigPanelProps {
  currentUser: {
    name: string;
    email: string;
    role: UserRoleType;
    institution?: string;
  };
  onConfigSaved?: (config: AlertThresholdConfig) => void;
}

const DEFAULT_REGIONS = [
  "Afar Depression & Danakil Graben",
  "Main Ethiopian Rift (MER) Corridor",
  "Fentale-Awash Basin",
  "Central Highlands Escarpment",
  "Southern Rift Sector (Hawassa-Chamo)",
  "Red Sea - Gulf of Aden Triple Junction"
];

const PRESET_EMAILS = [
  "directorate.alert@essgi.gov.et",
  "duty.seismologist@essgi.gov.et",
  "drmc.operations@drmc.gov.et",
  "semera.fieldbase@essgi.gov.et"
];

const PRESET_PHONES = [
  "+251911223344", // Duty Seismologist Primary (Ethio Telecom)
  "+251922334455", // DRMC Command Center (Ethio Telecom)
  "+251711223344", // DG Emergency Desk (Safaricom Ethiopia)
  "+251944556677"  // Afar Field Logistics (Ethio Telecom)
];

export interface EmailValidationResult {
  isValid: boolean;
  message: string;
  isDuplicate?: boolean;
  domain?: string;
  isInstitutional?: boolean;
}

export interface PhoneValidationResult {
  isValid: boolean;
  message: string;
  isDuplicate?: boolean;
  formatted: string;
  carrier?: string;
  carrierType?: "ethio" | "safaricom" | "fixed" | "intl" | "unknown";
}

/**
 * Real-time deliverability validator for official notification email endpoints
 */
export function validateEmailDeliverability(
  email: string,
  existingList: string[] = []
): EmailValidationResult {
  const clean = email.trim().toLowerCase();
  if (!clean) {
    return { isValid: false, message: "" };
  }

  if (clean.includes(" ")) {
    return { isValid: false, message: "Email addresses cannot contain spaces." };
  }

  const parts = clean.split("@");
  if (parts.length === 1) {
    return { isValid: false, message: "Incomplete address: missing '@' and domain." };
  }
  if (parts.length > 2) {
    return { isValid: false, message: "Invalid syntax: multiple '@' characters." };
  }

  const [user, domain] = parts;

  if (!user) {
    return { isValid: false, message: "Recipient user mailbox name is required before '@'." };
  }

  if (!/^[a-zA-Z0-9._%+-]+$/.test(user)) {
    return { isValid: false, message: "Invalid characters in recipient mailbox username." };
  }

  if (!domain) {
    return { isValid: false, message: "Enter domain (e.g., essgi.gov.et or drmc.gov.et)." };
  }

  if (!domain.includes(".")) {
    return { isValid: false, message: "Domain name must contain a dot and extension (e.g. .et, .gov.et, .org)." };
  }

  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { isValid: false, message: "Top-level domain (extension) must be at least 2 characters (e.g. .et, .com)." };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, message: "Invalid email syntax according to deliverability standards." };
  }

  if (existingList.map((e) => e.toLowerCase()).includes(clean)) {
    return { isValid: false, message: "This email address is already in the recipient list.", isDuplicate: true };
  }

  const isInstitutional = domain.endsWith(".gov.et") || domain.includes("essgi") || domain.includes("drmc") || domain.endsWith(".edu.et");

  return {
    isValid: true,
    message: isInstitutional ? "Verified Official Ethiopian Institutional Address (.gov.et)" : "Deliverable Standard Email Endpoint",
    domain,
    isInstitutional
  };
}

/**
 * Real-time deliverability validator & normalizer for SMS mobile telephone numbers
 */
export function validatePhoneDeliverability(
  phone: string,
  existingList: string[] = []
): PhoneValidationResult {
  const raw = phone.trim();
  if (!raw) {
    return { isValid: false, message: "", formatted: "" };
  }

  // Remove spaces, hyphens, parentheses, dots
  const stripped = raw.replace(/[\s\-().]/g, "");

  // Must not have letters or forbidden symbols
  if (/[^\d+]/.test(stripped)) {
    return { isValid: false, message: "Phone number may only contain digits and optional leading '+'.", formatted: "" };
  }

  // Count '+'
  const plusCount = (stripped.match(/\+/g) || []).length;
  if (plusCount > 1 || (plusCount === 1 && !stripped.startsWith("+"))) {
    return { isValid: false, message: "'+' sign is only allowed at the beginning of international numbers.", formatted: "" };
  }

  let normalized = stripped;
  let carrier = "Standard Mobile Gateway";
  let carrierType: "ethio" | "safaricom" | "fixed" | "intl" | "unknown" = "unknown";

  // Check Ethiopian number patterns
  if (stripped.startsWith("+251")) {
    const localPart = stripped.substring(4);
    if (localPart.length < 9) {
      return { isValid: false, message: `Incomplete Ethiopian number (${localPart.length}/9 digits entered after +251).`, formatted: stripped };
    }
    if (localPart.length > 9) {
      return { isValid: false, message: `Ethiopian mobile numbers must be exactly 9 digits after +251 (found ${localPart.length} digits).`, formatted: stripped };
    }

    if (localPart.startsWith("9")) {
      carrier = "Ethio Telecom Mobile (9-Series)";
      carrierType = "ethio";
    } else if (localPart.startsWith("7")) {
      carrier = "Safaricom Ethiopia Mobile (7-Series)";
      carrierType = "safaricom";
    } else if (localPart.startsWith("11")) {
      carrier = "Addis Ababa Fixed Terminal (+251 11)";
      carrierType = "fixed";
    } else {
      carrier = "Ethiopian Telecom Gateway (+251)";
      carrierType = "ethio";
    }
    normalized = stripped;
  } else if (stripped.startsWith("09") || stripped.startsWith("07") || stripped.startsWith("011")) {
    if (stripped.length < 10) {
      return { isValid: false, message: `Incomplete local number (${stripped.length}/10 digits entered).`, formatted: stripped };
    }
    if (stripped.length > 10) {
      return { isValid: false, message: `Local number exceeds 10 digits (found ${stripped.length} digits).`, formatted: stripped };
    }

    const withoutZero = stripped.substring(1);
    normalized = `+251${withoutZero}`;
    if (withoutZero.startsWith("9")) {
      carrier = "Ethio Telecom Mobile (Auto-normalized to +251)";
      carrierType = "ethio";
    } else if (withoutZero.startsWith("7")) {
      carrier = "Safaricom Ethiopia Mobile (Auto-normalized to +251)";
      carrierType = "safaricom";
    } else {
      carrier = "Ethiopian Telecom Gateway";
      carrierType = "ethio";
    }
  } else if ((stripped.startsWith("9") || stripped.startsWith("7")) && stripped.length === 9) {
    normalized = `+251${stripped}`;
    carrier = stripped.startsWith("9") ? "Ethio Telecom Mobile (Auto-normalized to +251)" : "Safaricom Ethiopia (Auto-normalized to +251)";
    carrierType = stripped.startsWith("9") ? "ethio" : "safaricom";
  } else if (stripped.startsWith("+")) {
    const digitsOnly = stripped.substring(1);
    if (digitsOnly.length < 8) {
      return { isValid: false, message: "International number is too short (min 8 digits after '+').", formatted: stripped };
    }
    if (digitsOnly.length > 15) {
      return { isValid: false, message: "International E.164 number exceeds 15 digits maximum.", formatted: stripped };
    }
    normalized = stripped;
    carrier = "International E.164 SMS Gateway";
    carrierType = "intl";
  } else {
    if (stripped.length >= 8 && stripped.length <= 15) {
      return { isValid: false, message: "Please prefix international numbers with '+' (e.g. +251 9... or +254...)", formatted: stripped };
    }
    return { isValid: false, message: "Enter valid mobile format (e.g. +251 911 223344 or 0911223344).", formatted: stripped };
  }

  // Check duplicate
  if (existingList.includes(normalized) || existingList.includes(stripped) || existingList.includes(raw)) {
    return { isValid: false, message: "This phone number is already registered in the recipient list.", isDuplicate: true, formatted: normalized, carrier };
  }

  return {
    isValid: true,
    message: `Deliverable Mobile SMS Endpoint: ${carrier}`,
    formatted: normalized,
    carrier,
    carrierType
  };
}

export function AlertThresholdConfigPanel({ currentUser, onConfigSaved }: AlertThresholdConfigPanelProps) {
  const [config, setConfig] = useState<AlertThresholdConfig>({
    minMagnitude: 4.5,
    maxDepth: 35,
    depthThreshold: 35,
    emailAlertsEnabled: true,
    smsAlertsEnabled: true,
    alertRecipientsEmail: PRESET_EMAILS.slice(0, 3),
    alertRecipientsPhone: PRESET_PHONES.slice(0, 3),
    targetRegions: DEFAULT_REGIONS.slice(0, 4),
    autoDispatchOnCritical: true,
    severityFilter: "Orange",
    smsTemplateText: "ESSGI CRITICAL ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}. Review seismic protocols.",
    emailSubjectTemplate: "[ESSGI GEODISASTER WARNING] M{mag} Seismic Tremor - {loc}"
  });

  const [dispatches, setDispatches] = useState<AlertDispatchLog[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingDispatch, setTestingDispatch] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Email & Phone input states with real-time validation
  const [newEmailInput, setNewEmailInput] = useState("");
  const [newPhoneInput, setNewPhoneInput] = useState("");

  // Real-time validation computation
  const emailValidation = useMemo(
    () => validateEmailDeliverability(newEmailInput, config.alertRecipientsEmail),
    [newEmailInput, config.alertRecipientsEmail]
  );

  const phoneValidation = useMemo(
    () => validatePhoneDeliverability(newPhoneInput, config.alertRecipientsPhone),
    [newPhoneInput, config.alertRecipientsPhone]
  );

  // Test Simulator State
  const [testMagnitude, setTestMagnitude] = useState<number>(5.2);
  const [testDepth, setTestDepth] = useState<number>(12);
  const [testLocation, setTestLocation] = useState<string>("Awash Basin / Fentale Rift Corridor");
  const [testResult, setTestResult] = useState<any | null>(null);

  // Official SMTP Email Relay State
  const [smtpStatus, setSmtpStatus] = useState<{
    configured: boolean;
    host: string | null;
    port: number;
    secure: boolean;
    user: string | null;
    from: string;
    statusMessage: string;
  } | null>(null);
  const [testingSmtp, setTestingSmtp] = useState<boolean>(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [testSmtpEmailInput, setTestSmtpEmailInput] = useState<string>(currentUser.email || "");
  const [showSmtpDetails, setShowSmtpDetails] = useState<boolean>(false);

  const fetchSmtpStatus = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/smtp-status");
      if (res.ok) {
        const data = await res.json();
        setSmtpStatus(data);
      }
    } catch {
      // Handled silently
    }
  };

  const handleTestSmtpConnection = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const target = testSmtpEmailInput.trim() || currentUser.email;
      const res = await authenticatedFetch("/api/admin/test-smtp", {
        method: "POST",
        body: JSON.stringify({ targetEmail: target })
      });
      const data = await res.json();
      setSmtpTestResult(data);
    } catch (err: any) {
      setSmtpTestResult({ success: false, message: err.message || "Failed to execute SMTP test connection." });
    } finally {
      setTestingSmtp(false);
    }
  };

  const fetchConfigAndDispatches = async () => {
    setLoadingConfig(true);
    try {
      const res = await authenticatedFetch("/api/admin/alert-config");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      }

      const dispRes = await authenticatedFetch("/api/admin/alert-dispatches");
      if (dispRes.ok) {
        const dispData = await dispRes.json();
        if (dispData.dispatches) {
          setDispatches(dispData.dispatches);
        }
      }

      await fetchSmtpStatus();
    } catch {
      // Handled silently
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchConfigAndDispatches();
  }, []);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setStatusMessage(null);
    try {
      const res = await authenticatedFetch("/api/admin/alert-config", {
        method: "POST",
        body: JSON.stringify({
          ...config,
          adminName: currentUser.name,
          adminEmail: currentUser.email,
          adminRole: currentUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data.error || "Failed to save configuration." });
      } else {
        setStatusMessage({
          type: "success",
          text: data.message || "Alert threshold configuration saved and deployed system-wide!"
        });
        if (data.config) {
          setConfig(data.config);
          if (onConfigSaved) {
            onConfigSaved(data.config);
          }
        }
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Network error saving alert configuration." });
    } finally {
      setSavingConfig(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleTestDispatch = async () => {
    setTestingDispatch(true);
    setTestResult(null);
    try {
      const res = await authenticatedFetch("/api/admin/test-dispatch", {
        method: "POST",
        body: JSON.stringify({
          adminName: currentUser.name,
          adminEmail: currentUser.email,
          adminRole: currentUser.role,
          testEvent: {
            title: `M ${testMagnitude.toFixed(1)} Seismic Tremor near ${testLocation}`,
            magnitude: testMagnitude,
            depth: testDepth,
            location: testLocation,
            severity: testMagnitude >= 5.0 ? "Red" : testMagnitude >= 4.0 ? "Orange" : "Yellow"
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data.error || "Test dispatch failed." });
      } else {
        setTestResult(data);
        setStatusMessage({
          type: "success",
          text: `Simulation test triggered! Broadcasted simulated alerts to ${data.dispatch?.recipientsCount || 0} endpoints.`
        });
        const dispRes = await authenticatedFetch("/api/admin/alert-dispatches");
        if (dispRes.ok) {
          const dispData = await dispRes.json();
          if (dispData.dispatches) {
            setDispatches(dispData.dispatches);
          }
        }
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Network error triggering test dispatch." });
    } finally {
      setTestingDispatch(false);
    }
  };

  const handleClearDispatches = async () => {
    if (!window.confirm("Are you sure you want to clear the alert dispatch audit logs?")) return;
    try {
      const res = await fetch("/api/admin/alert-dispatches", { method: "DELETE" });
      if (res.ok) {
        setDispatches([]);
        setStatusMessage({ type: "success", text: "Alert dispatch logs cleared." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to clear dispatch history." });
    }
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValidation.isValid) return;
    const clean = newEmailInput.trim().toLowerCase();
    setConfig((prev) => ({
      ...prev,
      alertRecipientsEmail: [...prev.alertRecipientsEmail, clean]
    }));
    setNewEmailInput("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setConfig((prev) => ({
      ...prev,
      alertRecipientsEmail: prev.alertRecipientsEmail.filter((e) => e !== emailToRemove)
    }));
  };

  const handleAddPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValidation.isValid) return;
    const formattedPhone = phoneValidation.formatted;
    setConfig((prev) => ({
      ...prev,
      alertRecipientsPhone: [...prev.alertRecipientsPhone, formattedPhone]
    }));
    setNewPhoneInput("");
  };

  const handleRemovePhone = (phoneToRemove: string) => {
    setConfig((prev) => ({
      ...prev,
      alertRecipientsPhone: prev.alertRecipientsPhone.filter((p) => p !== phoneToRemove)
    }));
  };

  const toggleRegion = (region: string) => {
    setConfig((prev) => {
      const exists = prev.targetRegions.includes(region);
      return {
        ...prev,
        targetRegions: exists
          ? prev.targetRegions.filter((r) => r !== region)
          : [...prev.targetRegions, region]
      };
    });
  };

  // Preview text computed
  const smsPreview = (config.smsTemplateText || "ESSGI CRITICAL ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}.")
    .replace("{mag}", testMagnitude.toFixed(1))
    .replace("{depth}", String(testDepth))
    .replace("{loc}", testLocation);

  const emailSubjectPreview = (config.emailSubjectTemplate || "[ESSGI GEODISASTER WARNING] M{mag} Seismic Tremor - {loc}")
    .replace("{mag}", testMagnitude.toFixed(1))
    .replace("{depth}", String(testDepth))
    .replace("{loc}", testLocation);

  return (
    <div className="space-y-6 font-sans text-slate-900 animate-fade-in">
      {/* Configuration Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-rose-100 text-rose-800 font-mono text-[10px] font-black uppercase tracking-wider rounded-lg border border-rose-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-600" />
              Automated Alert Dispatch Engine
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase rounded-lg border border-slate-200">
              Live Threshold Engine
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-[#0E4A72]">
            Seismic Magnitude &amp; Depth Alert Thresholds
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Define automated triggering rules for real-time seismic events. When ingested earthquakes meet or exceed these magnitude and depth criteria, the ESSGI platform instantly triggers high-priority visual advisories, pushes automated SMS alerts via Ethio Telecom, and emails the Disaster Risk Management Commission (DRMC).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchConfigAndDispatches}
            disabled={loadingConfig}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingConfig ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="px-6 py-2.5 bg-[#0E4A72] hover:bg-[#093552] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 border border-[#0E4A72]/20"
          >
            <Save className={`w-4 h-4 text-amber-400 ${savingConfig ? "animate-bounce" : ""}`} />
            <span>{savingConfig ? "Saving & Deploying..." : "Save Threshold Config"}</span>
          </button>
        </div>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border shadow-sm flex items-center gap-2 animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Threshold Controls & Channel Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: MAGNITUDE & DEPTH THRESHOLD CONTROLS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    1. Primary Trigger Thresholds
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Seismic magnitude (Richter) and hypocentral depth filter
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-mono font-bold rounded-lg border border-amber-200">
                ACTIVE CRITERIA
              </span>
            </div>

            {/* Threshold 1: Minimum Richter Magnitude */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Minimum Richter Magnitude (M ≥):</span>
                    <span className="text-[10px] font-mono text-rose-600 font-normal">
                      (Auto-alerts trigger for events above this value)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Currently set to trigger for earthquakes of magnitude{" "}
                    <strong className="text-rose-700 font-bold">M {config.minMagnitude.toFixed(1)}</strong> or greater.
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-rose-600 text-white font-mono font-black text-base rounded-xl shadow-xs">
                    M {config.minMagnitude.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Magnitude Slider */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min="2.0"
                  max="7.5"
                  step="0.1"
                  value={config.minMagnitude}
                  onChange={(e) =>
                    setConfig({ ...config, minMagnitude: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[9.5px] font-mono text-slate-400 font-bold">
                  <span>M 2.0 (Micro)</span>
                  <span>M 3.5 (Minor)</span>
                  <span className="text-rose-600">M 4.5 (Moderate)</span>
                  <span>M 5.5 (Strong)</span>
                  <span>M 7.5 (Major)</span>
                </div>
              </div>

              {/* Magnitude Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: "M 3.5 (Minor Swarms)", val: 3.5 },
                  { label: "M 4.0 (Elevated)", val: 4.0 },
                  { label: "M 4.5 (Standard Warning)", val: 4.5 },
                  { label: "M 5.0 (Strong / Destructive)", val: 5.0 },
                  { label: "M 6.0 (Major Disaster)", val: 6.0 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setConfig({ ...config, minMagnitude: preset.val })}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      config.minMagnitude === preset.val
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-rose-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold 2: Maximum Hypocentral Depth */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Maximum Focal Depth (Depth ≤):</span>
                    <span className="text-[10px] font-mono text-teal-600 font-normal">
                      (Shallow crustal filter)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Currently set to alert for events at depths of{" "}
                    <strong className="text-teal-700 font-bold">{config.maxDepth} km</strong> or shallower.
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-teal-700 text-white font-mono font-black text-base rounded-xl shadow-xs">
                    ≤ {config.maxDepth} km
                  </span>
                </div>
              </div>

              {/* Depth Slider */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="1"
                  value={config.maxDepth}
                  onChange={(e) => {
                    const d = parseInt(e.target.value);
                    setConfig({ ...config, maxDepth: d, depthThreshold: d });
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[9.5px] font-mono text-slate-400 font-bold">
                  <span>5 km (Ultra-Shallow)</span>
                  <span className="text-teal-700">35 km (Crustal)</span>
                  <span>70 km (Intermediate)</span>
                  <span>120 km (Deep)</span>
                </div>
              </div>

              {/* Depth Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: "10 km (Afar Magmatic Dykes)", val: 10 },
                  { label: "20 km (Upper Crustal MER)", val: 20 },
                  { label: "35 km (Standard Crustal)", val: 35 },
                  { label: "50 km (Sub-Crustal)", val: 50 },
                  { label: "100 km (All Depths)", val: 100 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setConfig({ ...config, maxDepth: preset.val, depthThreshold: preset.val })}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                      config.maxDepth === preset.val
                        ? "bg-teal-700 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-teal-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Geological Insight Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Rift Valley Geodynamic Rule</strong>: Crustal earthquakes in the Ethiopian Rift occurring at shallow depths (≤ 35 km) deliver significantly higher Peak Ground Acceleration (PGA) to surface infrastructure like the Addis-Djibouti railway and Awash hydroelectric reservoirs than deeper lithospheric events.
              </p>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-mono text-right">
            Last Updated: {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : "System Default Baseline"}
          </div>
        </div>

        {/* PANEL 2: NOTIFICATION CHANNELS & AUTOMATION SETTINGS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-200 text-blue-600">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    2. Notification Channels &amp; Automation
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Carrier SMS &amp; Gov SMTP dispatch toggles
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded-lg border border-emerald-200">
                GATEWAYS READY
              </span>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3">
              {/* SMS Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${config.smsAlertsEnabled ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-slate-200 text-slate-500 border-slate-300"}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Ethio Telecom Direct SMS Broadcast</span>
                      {config.smsAlertsEnabled && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Transmit urgent SMS text bulletins to registered mobile terminals of field duty officers
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.smsAlertsEnabled}
                    onChange={(e) => setConfig({ ...config, smsAlertsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4A72]"></div>
                </label>
              </div>

              {/* Email Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${config.emailAlertsEnabled ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-slate-200 text-slate-500 border-slate-300"}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Government Email Bulletin Gateway</span>
                      {config.emailAlertsEnabled && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Deliver formatted geohazard advisories with coordinates and hypocenter maps to official DRMC emails
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.emailAlertsEnabled}
                    onChange={(e) => setConfig({ ...config, emailAlertsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4A72]"></div>
                </label>
              </div>

              {/* Auto-Dispatch on Red Alert Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${config.autoDispatchOnCritical ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-slate-200 text-slate-500 border-slate-300"}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Immediate Auto-Dispatch on Critical (Red) Events</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Automatically fire SMS/Email dispatches without waiting for manual duty seismologist click confirmation
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoDispatchOnCritical}
                    onChange={(e) => setConfig({ ...config, autoDispatchOnCritical: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4A72]"></div>
                </label>
              </div>
            </div>

            {/* Monitored Rift Zones Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Target Monitored Geotectonic Zones:
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_REGIONS.map((region) => {
                  const selected = config.targetRegions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selected
                          ? "bg-[#0E4A72] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {selected ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{region}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            Current configuration covers <strong>{config.alertRecipientsEmail.length} emails</strong> and <strong>{config.alertRecipientsPhone.length} SMS endpoints</strong> across <strong>{config.targetRegions.length} geotectonic zones</strong>.
          </div>
        </div>
      </div>

      {/* PANEL 3: RECIPIENTS MANAGEMENT WITH REAL-TIME DELIVERABILITY VALIDATION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span>3. Authorized Emergency Alert Recipients</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full border border-emerald-200">
                  REAL-TIME VALIDATION ACTIVE
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Official email addresses and SMS mobile endpoints with RFC 5322 &amp; E.164 deliverability checks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-bold">
              {config.alertRecipientsEmail.length} Deliverable Emails
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 font-bold">
              {config.alertRecipientsPhone.length} Verified Mobile Phones
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EMAIL RECIPIENTS SECTION */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0E4A72]" />
                <span>Authorized DRMC / ESSGI Email Endpoints</span>
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSmtpDetails(!showSmtpDetails)}
                  className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg hover:bg-slate-100 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#0E4A72]" />
                  <span>SMTP Relay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, alertRecipientsEmail: PRESET_EMAILS })}
                  className="text-[10px] text-[#0E4A72] hover:underline font-semibold cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* SMTP Relay Diagnostic & Test Box */}
            {showSmtpDetails && (
              <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-2.5 text-xs shadow-sm animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Radio className="w-3.5 h-3.5 text-[#0E4A72]" />
                    <span>Nodemailer SMTP Gateway Status</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    smtpStatus?.configured 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}>
                    {smtpStatus?.configured ? "Live SMTP Active" : "Simulated Relay"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {smtpStatus?.configured
                    ? `Live delivery active via ${smtpStatus.host}:${smtpStatus.port} (Sender: ${smtpStatus.from}).`
                    : "No external SMTP credentials detected in environment. Alerts are simulated with full HTML bulletin generation & audit persistence."}
                </p>

                {/* Quick Live Email Delivery Tester */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-slate-700">Test Official Alert Dispatch:</span>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testSmtpEmailInput}
                      onChange={(e) => setTestSmtpEmailInput(e.target.value)}
                      placeholder="official.inbox@drmc.gov.et"
                      className="flex-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-900"
                    />
                    <button
                      type="button"
                      disabled={testingSmtp}
                      onClick={handleTestSmtpConnection}
                      className="bg-[#0E4A72] hover:bg-[#093552] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {testingSmtp ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span>Send Test</span>
                    </button>
                  </div>
                  {smtpTestResult && (
                    <div className={`p-2 rounded-lg text-[10.5px] font-mono ${
                      smtpTestResult.success
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {smtpTestResult.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email Add Form with Live Validation */}
            <form onSubmit={handleAddEmail} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="e.g. duty.officer@essgi.gov.et"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    className={`w-full bg-white border px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 transition-all focus:outline-none ${
                      !newEmailInput.trim()
                        ? "border-slate-300 focus:ring-2 focus:ring-[#0E4A72]/20"
                        : emailValidation.isValid
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                        : "border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20"
                    }`}
                  />
                  {newEmailInput.trim() && (
                    <div className="absolute right-3 top-2.5">
                      {emailValidation.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!emailValidation.isValid}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    emailValidation.isValid
                      ? "bg-[#0E4A72] hover:bg-[#093552] text-white cursor-pointer shadow-sm active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Email</span>
                </button>
              </div>

              {/* Real-time Email Deliverability Feedback Banner */}
              {newEmailInput.trim() && (
                <div
                  className={`p-2 rounded-xl text-[11px] font-mono font-medium flex items-center gap-1.5 transition-all ${
                    emailValidation.isValid
                      ? "bg-emerald-100/70 border border-emerald-300 text-emerald-900"
                      : "bg-rose-100/70 border border-rose-300 text-rose-900"
                  }`}
                >
                  {emailValidation.isValid ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  <span>{emailValidation.message}</span>
                </div>
              )}
            </form>

            {/* Email Badges List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {config.alertRecipientsEmail.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No email recipients configured.</p>
              ) : (
                config.alertRecipientsEmail.map((email) => {
                  const isGovEt = email.endsWith(".gov.et") || email.endsWith(".edu.et");
                  return (
                    <div
                      key={email}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-slate-800 font-semibold truncate">{email}</span>
                        {isGovEt && (
                          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[9px] font-bold rounded border border-blue-200 shrink-0">
                            GOV.ET
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                        title="Remove email recipient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PHONE NUMBERS (SMS) SECTION */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span>Authorized Mobile Phone Endpoints (SMS)</span>
              </h4>
              <button
                type="button"
                onClick={() => setConfig({ ...config, alertRecipientsPhone: PRESET_PHONES })}
                className="text-[10px] text-amber-700 hover:underline font-semibold cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>

            {/* Phone Add Form with Live Validation & Carrier Detection */}
            <form onSubmit={handleAddPhone} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    placeholder="e.g. +251 911 223344 or 0911223344"
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value)}
                    className={`w-full bg-white border px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 transition-all focus:outline-none ${
                      !newPhoneInput.trim()
                        ? "border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                        : phoneValidation.isValid
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                        : "border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20"
                    }`}
                  />
                  {newPhoneInput.trim() && (
                    <div className="absolute right-3 top-2.5">
                      {phoneValidation.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!phoneValidation.isValid}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    phoneValidation.isValid
                      ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Phone</span>
                </button>
              </div>

              {/* Real-time Phone Validation & Carrier Feedback Banner */}
              {newPhoneInput.trim() && (
                <div
                  className={`p-2 rounded-xl text-[11px] font-mono font-medium flex items-center justify-between gap-1.5 transition-all ${
                    phoneValidation.isValid
                      ? "bg-emerald-100/70 border border-emerald-300 text-emerald-900"
                      : "bg-rose-100/70 border border-rose-300 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {phoneValidation.isValid ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{phoneValidation.message}</span>
                  </div>

                  {phoneValidation.isValid && phoneValidation.formatted && (
                    <span className="px-1.5 py-0.5 bg-emerald-200/80 text-emerald-950 font-bold rounded text-[10px] shrink-0">
                      Format: {phoneValidation.formatted}
                    </span>
                  )}
                </div>
              )}
            </form>

            {/* Phone Badges List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {config.alertRecipientsPhone.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No phone numbers configured.</p>
              ) : (
                config.alertRecipientsPhone.map((phone) => {
                  const isEthio = phone.startsWith("+2519") || phone.startsWith("09");
                  const isSaf = phone.startsWith("+2517") || phone.startsWith("07");
                  return (
                    <div
                      key={phone}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-slate-800 font-semibold truncate">{phone}</span>
                        {isEthio && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 text-[9px] font-bold rounded border border-amber-200 shrink-0">
                            Ethio Tel (9)
                          </span>
                        )}
                        {isSaf && (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200 shrink-0">
                            Safaricom (7)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(phone)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                        title="Remove phone recipient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL 4: TEMPLATES & LIVE MESSAGE SIMULATION TESTER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                4. Custom Message Templates &amp; Live Simulation Test
              </h3>
              <p className="text-[11px] text-slate-500">
                Customize alert text templates and trigger real-time dispatch simulation
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-purple-50 text-purple-800 text-[10px] font-mono font-bold rounded-lg border border-purple-200">
            SIMULATOR READY
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Editors */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                SMS Text Template:
              </label>
              <textarea
                rows={3}
                value={config.smsTemplateText}
                onChange={(e) => setConfig({ ...config, smsTemplateText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A72]/20"
                placeholder="ESSGI CRITICAL ALERT: M{mag} Earthquake detected at depth {depth}km in {loc}."
              />
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-500">
                <span>Available tokens:</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[#0E4A72]">{`{mag}`}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[#0E4A72]">{`{depth}`}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[#0E4A72]">{`{loc}`}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                Email Subject Template:
              </label>
              <input
                type="text"
                value={config.emailSubjectTemplate}
                onChange={(e) => setConfig({ ...config, emailSubjectTemplate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4A72]/20"
                placeholder="[ESSGI GEODISASTER WARNING] M{mag} Seismic Tremor - {loc}"
              />
            </div>

            {/* Test Parameter Inputs */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-900 uppercase">Test Simulation Event Parameters</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Magnitude:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testMagnitude}
                    onChange={(e) => setTestMagnitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Depth (km):</label>
                  <input
                    type="number"
                    value={testDepth}
                    onChange={(e) => setTestDepth(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Location:</label>
                  <input
                    type="text"
                    value={testLocation}
                    onChange={(e) => setTestLocation(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestDispatch}
                  disabled={testingDispatch}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Send className={`w-4 h-4 ${testingDispatch ? "animate-spin" : ""}`} />
                  <span>{testingDispatch ? "Dispatching Simulation..." : "Trigger Live Test Dispatch Simulation"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Cards */}
          <div className="space-y-4">
            {/* SMS Screen Preview */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10.5px] font-mono text-amber-400 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  SMS Direct Output Preview
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">Ethio Telecom Push Gateway</span>
              </div>
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 text-xs font-mono leading-relaxed text-amber-200">
                {smsPreview}
              </div>
            </div>

            {/* Email Subject & Body Preview */}
            <div className="p-4 bg-[#0E4A72] text-white rounded-2xl border border-[#0E4A72]/50 space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10.5px] font-mono text-cyan-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  Email Advisory Preview
                </span>
                <span className="text-[9.5px] font-mono text-slate-300">Gov SMTP Relay</span>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/15 space-y-1.5">
                <div className="text-xs font-bold text-amber-300 font-mono">
                  Subject: {emailSubjectPreview}
                </div>
                <div className="text-[11px] text-slate-100 leading-relaxed font-sans pt-1 border-t border-white/10">
                  <strong>DISASTER RISK MANAGEMENT COMMISSION (DRMC) &amp; ESSGI EARLY WARNING:</strong> A seismic event measuring <strong>M {testMagnitude.toFixed(1)}</strong> has been detected at <strong>{testDepth} km</strong> focal depth within the <strong>{testLocation}</strong>. Seismological monitoring teams are tracking aftershock probabilities.
                </div>
              </div>
            </div>

            {/* Test Result Feedback Box */}
            {testResult && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 space-y-2 animate-fade-in font-mono">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Alert Broadcast Dispatched to {testResult.dispatch?.recipientsCount || 0} Endpoints!</span>
                </div>

                {testResult.emailDelivery && (
                  <div className={`p-2.5 rounded-xl border text-[11px] ${
                    testResult.emailDelivery.simulated
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-white border-emerald-300 text-emerald-900 shadow-xs"
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Mail className="w-3.5 h-3.5 text-[#0E4A72]" />
                      <span>Email Delivery: {testResult.emailDelivery.message}</span>
                    </div>
                    {testResult.emailDelivery.messageId && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        SMTP Message ID: {testResult.emailDelivery.messageId}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-emerald-700">
                  SMS Output: "{testResult.preview?.smsText}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PANEL 5: DISPATCH AUDIT LOG HISTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                5. Automated Alert Dispatch Audit Log
              </h3>
              <p className="text-[11px] text-slate-500">
                Log of automated and simulated alert broadcasts with recipient status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearDispatches}
              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          </div>
        </div>

        {/* Dispatch Log Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[380px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-xs z-10">
              <tr className="text-slate-500 uppercase text-[10px] tracking-wider font-mono font-bold">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Trigger Event</th>
                <th className="py-3 px-3">Magnitude &amp; Depth</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Channels</th>
                <th className="py-3 px-3">Recipients</th>
                <th className="py-3 px-3">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dispatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic text-xs">
                    No alert dispatches logged yet. Click "Trigger Live Test Dispatch Simulation" above to test.
                  </td>
                </tr>
              ) : (
                dispatches.map((disp) => (
                  <tr key={disp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                      {new Date(disp.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{disp.eventTitle}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-bold">
                        M {disp.magnitude.toFixed(1)}
                      </span>{" "}
                      <span className="text-slate-500 text-[10.5px]">({disp.depth}km)</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{disp.location}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-[10px] font-bold uppercase">
                        {disp.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {disp.recipientsCount} Endpoints
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {String(disp.status).toUpperCase() === "SENT" ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[10px] font-bold flex items-center gap-1 w-fit border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>SENT (LIVE)</span>
                        </span>
                      ) : String(disp.status).toUpperCase() === "FAILED" ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-mono text-[10px] font-bold flex items-center gap-1 w-fit border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>FAILED</span>
                        </span>
                      ) : String(disp.status).toUpperCase() === "SIMULATED" ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-mono text-[10px] font-bold flex items-center gap-1 w-fit border border-blue-200">
                          <Radio className="w-3 h-3 text-[#0E4A72]" />
                          <span>SIMULATED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono text-[10px] font-bold flex items-center gap-1 w-fit border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{String(disp.status || "DISPATCHED").toUpperCase()}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
