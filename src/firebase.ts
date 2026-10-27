import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch, setLogLevel, disableNetwork } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Silence internal Firestore SDK retry logs when quota is reached
setLogLevel('silent');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Always active on Firebase Blaze plan
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('drillforge_firestore_quota_exhausted');
  } catch (e) {}
}

export function checkQuotaExhausted(): boolean {
  return false;
}

export function safeDisableNetwork() {
  // Blaze plan active - network remains enabled
}

export function markQuotaExhausted() {
  // Blaze plan active
}

// Simple Error Handler
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (errMsg.includes('resource-exhausted') || errMsg.includes('Quota limit exceeded') || (error as any)?.code === 'resource-exhausted') {
    markQuotaExhausted();
    safeDisableNetwork();
    console.warn("Firestore daily quota limit reached.");
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo, null, 2));
  // In frontend we don't throw to crash, just log and return
}

export async function fetchDrillsFromFirestore() {
  if (checkQuotaExhausted()) return [];
  try {
    const fetchPromise = getDocs(collection(db, "drills_v2"));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DRILLS_FETCH_TIMEOUT")), 3000)
    );
    const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]);
    const drills = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return drills;
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || String(error).includes('Quota limit exceeded')) {
      markQuotaExhausted();
      console.warn("Firestore quota reached. Using default drills catalog.");
      return [];
    }
    if (error?.message === 'DRILLS_FETCH_TIMEOUT') {
      console.warn("Drills fetch timed out, using default catalog.");
      return [];
    }
    handleFirestoreError(error, OperationType.LIST, "drills_v2");
    return [];
  }
}

export async function syncDrillsToFirestore(drills: any[]) {
  if (checkQuotaExhausted()) return;
  try {
    const list = await fetchDrillsFromFirestore();
    
    if (list.length >= drills.length) {
      console.log("Database already seeded with drills.");
      return;
    }
    
    console.log("Seeding database with drills...");
    // Firestore batches allow a max of 500 writes per batch.
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;
    
    for (let i = 0; i < drills.length; i++) {
      const drill = drills[i];
      const drillRef = doc(db, "drills_v2", drill.id);
      currentBatch.set(drillRef, drill);
      operationCount++;
      
      if (operationCount === 500) {
        batches.push(currentBatch.commit());
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }
    if (operationCount > 0) {
      batches.push(currentBatch.commit());
    }
    
    await Promise.all(batches);
    console.log("Successfully seeded", drills.length, "drills to Firestore.");
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || String(error).includes('Quota limit exceeded')) {
      markQuotaExhausted();
      console.warn("Firestore quota limit reached while seeding drills. Using local catalog.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, "drills_v2");
  }
}
