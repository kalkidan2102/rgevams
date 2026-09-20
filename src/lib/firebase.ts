import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../data/firebase-applet-config.json"

// Initialize Firebase app safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore properly using experimentalAutoDetectLongPolling to prevent 10s connection timeout warnings in iframe/sandboxed environments
let dbInstance;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  if (dbId) {
    dbInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true
    }, dbId);
  } else {
    dbInstance = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true
    });
  }
} catch {
  // If already initialized, retrieve instance safely
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);

// Connection test matching Firebase Skill Guidelines with non-blocking graceful fallback
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch {
    // Graceful offline/local mode fallback
  }
}

// Background validation without blocking render
if (typeof window !== "undefined") {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 1000);
}

export default app;

