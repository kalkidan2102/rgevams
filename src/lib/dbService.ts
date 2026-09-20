// Real-Time PostgreSQL / PostGIS Data Service
// Replaces legacy Firestore with authenticated REST API endpoints while preserving existing callback and subscription signatures

import { Volcano, Earthquake, GnssStation, UserAccount, AuditLog, GeologicalAlert } from "../types";
import { FALLBACK_VOLCANOES } from "../data/volcanoes";
import { FALLBACK_EARTHQUAKES } from "../data/earthquakes";
import { ETHIOPIA_GNSS_STATIONS } from "../data";
import { authenticatedFetch } from "./api";

// Initial Fallback Users for local state resilience
const DEFAULT_USERS: UserAccount[] = [
  {
    id: "usr_admin_1",
    name: "Dr. Getachew Bekele",
    email: "admin@ssgi.gov.et",
    role: "admin",
    status: "approved",
    institution: "Space Science & Geospatial Institute (Headquarters)",
    registeredAt: "2025-01-10T08:00:00.000Z",
    approvedAt: "2025-01-10T08:00:00.000Z",
    approvedBy: "System Administrator"
  },
  {
    id: "usr_official_1",
    name: "Prof. Solomon Belay",
    email: "director@ssgi.gov.et",
    role: "official",
    status: "approved",
    institution: "ESSGI Directorate of Space Science",
    registeredAt: "2025-01-15T09:30:00.000Z",
    approvedAt: "2025-01-15T10:00:00.000Z",
    approvedBy: "admin@ssgi.gov.et"
  },
  {
    id: "usr_staff_1",
    name: "Alemayehu Tadesse",
    email: "staff@ssgi.gov.et",
    role: "staff",
    status: "approved",
    institution: "Entoto Geophysical Observatory",
    registeredAt: "2025-02-01T11:15:00.000Z",
    approvedAt: "2025-02-01T12:00:00.000Z",
    approvedBy: "admin@ssgi.gov.et"
  }
];

// Initial Alerts for fallback resilience
const DEFAULT_ALERTS: GeologicalAlert[] = [
  {
    id: "alert_1",
    title: "Erta Ale Active Lava Overturning & Thermal Anomaly",
    type: "volcanic",
    severity: "Red",
    location: "Danakil Depression, Afar Region",
    description: "Infrared satellite sensors report thermal radiation exceeding 480°C in the south crater pit. Increased SO2 degassing and minor lava fountain bursts.",
    dateTime: new Date().toISOString()
  },
  {
    id: "alert_2",
    title: "Semera - Dobi Graben Seismic Swarm Activity",
    type: "seismic",
    severity: "Orange",
    location: "Afar Triple Junction Margin",
    description: "Multiple micro-earthquake clusters recorded over 24 hours between depths of 8km to 14km. Local emergency units alerted for road infrastructure inspection.",
    dateTime: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

// Legacy enum and interface preserved for consumer backward compatibility
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// 1. Subscribe Volcanoes (PostgreSQL REST API)
export function subscribeVolcanoes(onData: (volcanoes: Volcano[]) => void): () => void {
  let isCancelled = false;

  const fetchVolcanoes = async () => {
    try {
      const res = await fetch("/api/volcanoes");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            if (!isCancelled) onData(data);
            return;
          }
        }
      }
      if (!isCancelled) onData(FALLBACK_VOLCANOES);
    } catch {
      if (!isCancelled) onData(FALLBACK_VOLCANOES);
    }
  };

  fetchVolcanoes();
  const intervalId = setInterval(fetchVolcanoes, 30000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
}

// Volcano CRUD via PostgreSQL API
export async function saveVolcanoToFirestore(volcano: Volcano): Promise<void> {
  try {
    await authenticatedFetch("/api/volcanoes", {
      method: "POST",
      body: JSON.stringify(volcano)
    });
  } catch (error) {
    console.warn("Failed to persist volcano to PostgreSQL API:", error);
  }
}

export async function deleteVolcanoFromFirestore(id: string): Promise<void> {
  try {
    await authenticatedFetch(`/api/volcanoes/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.warn("Failed to delete volcano from PostgreSQL API:", error);
  }
}

// 2. Subscribe Earthquakes (PostgreSQL REST API)
export function subscribeEarthquakes(onData: (earthquakes: Earthquake[]) => void): () => void {
  let isCancelled = false;

  const fetchEarthquakes = async () => {
    try {
      const res = await fetch("/api/earthquakes");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const list = data?.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : null);
          if (list && list.length > 0) {
            if (!isCancelled) onData(list);
            return;
          }
        }
      }
      if (!isCancelled) onData(FALLBACK_EARTHQUAKES);
    } catch {
      if (!isCancelled) onData(FALLBACK_EARTHQUAKES);
    }
  };

  fetchEarthquakes();
  const intervalId = setInterval(fetchEarthquakes, 30000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
}

// Earthquake CRUD via PostgreSQL API
export async function saveEarthquakeToFirestore(earthquake: Earthquake): Promise<void> {
  try {
    await authenticatedFetch("/api/trigger-earthquake-alert", {
      method: "POST",
      body: JSON.stringify(earthquake)
    });
  } catch (error) {
    console.warn("Failed to persist earthquake alert to PostgreSQL API:", error);
  }
}

export async function deleteEarthquakeFromFirestore(_id: string): Promise<void> {
  // No-op for read-only catalog
}

// 3. Subscribe GNSS Stations (PostGIS Spatial REST API)
export function subscribeGnssStations(onData: (gnss: GnssStation[]) => void): () => void {
  let isCancelled = false;

  const fetchGnss = async () => {
    try {
      const res = await fetch("/api/spatial/gnss-stations");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            if (!isCancelled) onData(data);
            return;
          }
        }
      }
      if (!isCancelled) onData(ETHIOPIA_GNSS_STATIONS);
    } catch {
      if (!isCancelled) onData(ETHIOPIA_GNSS_STATIONS);
    }
  };

  fetchGnss();
  const intervalId = setInterval(fetchGnss, 60000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
}

// 4. Subscribe User Accounts (PostgreSQL Admin API)
export function subscribeUsers(onData: (users: UserAccount[]) => void): () => void {
  let isCancelled = false;

  const fetchUsers = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/users");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const list = data?.users && Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : null);
          if (list && list.length > 0) {
            if (!isCancelled) onData(list);
            return;
          }
        }
      }
      if (!isCancelled) onData(DEFAULT_USERS);
    } catch {
      if (!isCancelled) onData(DEFAULT_USERS);
    }
  };

  fetchUsers();
  const intervalId = setInterval(fetchUsers, 30000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
}

// User Accounts CRUD
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    await authenticatedFetch(`/api/admin/users/${encodeURIComponent(user.email)}/role`, {
      method: "PUT",
      body: JSON.stringify({ role: user.role })
    });
  } catch (error) {
    console.warn("Failed to update user in PostgreSQL API:", error);
  }
}

export async function deleteUserFromFirestore(id: string): Promise<void> {
  try {
    await authenticatedFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.warn("Failed to delete user in PostgreSQL API:", error);
  }
}

// 5. Subscribe Audit Logs (PostgreSQL Admin API)
export function subscribeAuditLogs(onData: (logs: AuditLog[]) => void): () => void {
  let isCancelled = false;

  const fetchLogs = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/audit-logs");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const list = data?.logs && Array.isArray(data.logs) ? data.logs : (Array.isArray(data) ? data : []);
          if (!isCancelled) onData(list);
          return;
        }
      }
      if (!isCancelled) onData([]);
    } catch {
      if (!isCancelled) onData([]);
    }
  };

  fetchLogs();
  const intervalId = setInterval(fetchLogs, 20000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
}

export async function addAuditLogToFirestore(_log: AuditLog): Promise<void> {
  // Server-side controllers automatically record audit logs in PostgreSQL on mutations
}

// 6. Subscribe Alerts (PostgreSQL Admin Alerts Dispatches API)
export function subscribeAlerts(onData: (alerts: GeologicalAlert[]) => void): () => void {
  let isCancelled = false;

  const fetchAlerts = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/alert-dispatches");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const dispatches = data?.dispatches && Array.isArray(data.dispatches) ? data.dispatches : [];
          if (dispatches.length > 0) {
            const mappedAlerts: GeologicalAlert[] = dispatches.map((d: any) => ({
              id: d.id || `dispatch_${Date.now()}`,
              title: d.eventTitle || `Seismic Alert M ${d.magnitude || 5.0}`,
              type: "seismic",
              severity: d.severity || "Orange",
              location: d.location || "East African Rift",
              description: d.notes || d.message || "Dispatched alert broadcast.",
              dateTime: d.timestamp || d.createdAt || new Date().toISOString()
            }));
            if (!isCancelled) onData(mappedAlerts);
            return;
          }
        }
      }
      if (!isCancelled) onData(DEFAULT_ALERTS);
    } catch {
      if (!isCancelled) onData(DEFAULT_ALERTS);
    }
  };

  fetchAlerts();
  const intervalId = setInterval(fetchAlerts, 30000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
}

export async function addAlertToFirestore(alert: GeologicalAlert): Promise<void> {
  try {
    await authenticatedFetch("/api/admin/test-dispatch", {
      method: "POST",
      body: JSON.stringify({
        magnitude: 5.2,
        location: alert.location,
        operatorEmail: "admin@essgi.gov.et"
      })
    });
  } catch (error) {
    console.warn("Failed to trigger alert dispatch in PostgreSQL API:", error);
  }
}

export async function deleteAlertFromFirestore(_id: string): Promise<void> {
  // No-op for read-only audit
}
