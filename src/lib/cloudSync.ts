import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, writeBatch } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, checkQuotaExhausted, markQuotaExhausted } from "../firebase";
import { auth } from "../firebase";
import { mergeAthleteCollections, scanAndRecoverAllLocalAthletes, Athlete } from "./athleteStore";

const SYNC_KEYS = [
  'drillforge_crm_athletes_v2',
  'drillforge_crm_athletes_permanent_vault_v1',
  'drillforge_leads_v1',
  'trainer_calendar_events',
  'trainer_finance_transactions',
  'drillforge_finances',
  'drillforge_billing_template',
  'drillforge_marketplace_v1',
  'drillforge_p_clients',
  'drillforge_p_sessions',
  'drillforge_favorites',
  'futbolpro_settings_v1',
  'drillforge_comms_history',
];

export let isPullingFromCloud = false;
const lastPushedCache: Record<string, string> = {};
const hasPulledFromCloud: Record<string, boolean> = {};
let activeUnsubscribe: (() => void) | null = null;
let activeEmailUnsubscribe: (() => void) | null = null;
let activeAthleteUnsubscribe: (() => void) | null = null;
let activeEmailAthleteUnsubscribe: (() => void) | null = null;

export function sanitizeEmailKey(email: string) {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

export function getCurrentUserIdentifier(): { uid: string; email: string } {
  let uid = auth.currentUser?.uid || '';
  let email = auth.currentUser?.email || '';

  if (typeof window !== 'undefined') {
    try {
      const guestObj = localStorage.getItem('drillforge_guest_user');
      if (guestObj) {
        const parsed = JSON.parse(guestObj);
        if (!uid && parsed?.uid) uid = parsed.uid;
        if (!email && parsed?.email) email = parsed.email;
      }
    } catch (e) {
      // ignore
    }
  }

  return { uid, email };
}

export function applyCloudBackupToLocalStorage(backup: Record<string, string>, currentUid: string) {
  if (!backup || typeof backup !== 'object') return;
  isPullingFromCloud = true;

  try {
    // 1. Authoritative Athlete Resolution with Comprehensive Merging
    let cloudAthletes: Athlete[] = [];
    const userAthleteKey = currentUid ? `drillforge_crm_athletes_v2_user_${currentUid}` : null;
    
    // Check authoritative user key first
    if (userAthleteKey && backup[userAthleteKey]) {
      try {
        const parsed = JSON.parse(backup[userAthleteKey]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cloudAthletes = mergeAthleteCollections(cloudAthletes, parsed);
        }
      } catch (e) {}
    }

    // Check vault key
    if (backup['drillforge_crm_athletes_permanent_vault_v1']) {
      try {
        const parsed = JSON.parse(backup['drillforge_crm_athletes_permanent_vault_v1']);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cloudAthletes = mergeAthleteCollections(cloudAthletes, parsed);
        }
      } catch (e) {}
    }
    
    // Check general canonical key
    if (backup['drillforge_crm_athletes_v2']) {
      try {
        const parsed = JSON.parse(backup['drillforge_crm_athletes_v2']);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cloudAthletes = mergeAthleteCollections(cloudAthletes, parsed);
        }
      } catch (e) {}
    }

    // Check legacy v1 key
    if (backup['drillforge_crm_athletes']) {
      try {
        const parsed = JSON.parse(backup['drillforge_crm_athletes']);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cloudAthletes = mergeAthleteCollections(cloudAthletes, parsed);
        }
      } catch (e) {}
    }

    // Check all other keys in backup matching athlete/atleta/crm
    for (const [k, v] of Object.entries(backup)) {
      if (v && typeof v === 'string' && (k.includes('athlete') || k.includes('atleta') || k.includes('crm'))) {
        try {
          const list = JSON.parse(v);
          if (Array.isArray(list) && list.length > 0 && list.some(item => item && item.name)) {
            cloudAthletes = mergeAthleteCollections(cloudAthletes, list);
          }
        } catch (e) {}
      }
    }

    // Recover and merge existing local athletes from current device before saving
    const existingLocal = scanAndRecoverAllLocalAthletes();
    const finalAthletes = mergeAthleteCollections(cloudAthletes, existingLocal);

    if (finalAthletes && finalAthletes.length > 0) {
      const sanitized = finalAthletes.map((a: any) => ({
        ...a,
        photo: typeof a.photo === 'string' ? a.photo : ''
      }));
      const athleteStr = JSON.stringify(sanitized);
      localStorage.setItem('drillforge_crm_athletes_v2', athleteStr);
      localStorage.setItem('drillforge_crm_athletes_permanent_vault_v1', athleteStr);
      if (currentUid) {
        localStorage.setItem(`drillforge_crm_athletes_v2_user_${currentUid}`, athleteStr);
      }
    }

    // 2. Authoritative Finance Resolution
    let finalFinances: any[] | null = null;
    const userFinKey = currentUid ? `trainer_finance_transactions_user_${currentUid}` : null;
    if (userFinKey && backup[userFinKey]) {
      try {
        const parsed = JSON.parse(backup[userFinKey]);
        if (Array.isArray(parsed)) finalFinances = parsed;
      } catch (e) {}
    }
    if (!finalFinances && backup['trainer_finance_transactions']) {
      try {
        const parsed = JSON.parse(backup['trainer_finance_transactions']);
        if (Array.isArray(parsed)) finalFinances = parsed;
      } catch (e) {}
    }
    if (!finalFinances && backup['drillforge_finances']) {
      try {
        const parsed = JSON.parse(backup['drillforge_finances']);
        if (Array.isArray(parsed)) finalFinances = parsed;
      } catch (e) {}
    }
    if (finalFinances && Array.isArray(finalFinances)) {
      const finStr = JSON.stringify(finalFinances);
      localStorage.setItem('trainer_finance_transactions', finStr);
      localStorage.setItem('drillforge_finances', finStr);
      if (currentUid) {
        localStorage.setItem(`trainer_finance_transactions_user_${currentUid}`, finStr);
      }
    }

    // 3. Authoritative Calendar Events Resolution
    let finalEvents: any[] | null = null;
    const userCalKey = currentUid ? `trainer_calendar_events_user_${currentUid}` : null;
    if (userCalKey && backup[userCalKey]) {
      try {
        const parsed = JSON.parse(backup[userCalKey]);
        if (Array.isArray(parsed)) finalEvents = parsed;
      } catch (e) {}
    }
    if (!finalEvents && backup['trainer_calendar_events']) {
      try {
        const parsed = JSON.parse(backup['trainer_calendar_events']);
        if (Array.isArray(parsed)) finalEvents = parsed;
      } catch (e) {}
    }
    if (finalEvents && Array.isArray(finalEvents)) {
      const evtStr = JSON.stringify(finalEvents);
      localStorage.setItem('trainer_calendar_events', evtStr);
      if (currentUid) {
        localStorage.setItem(`trainer_calendar_events_user_${currentUid}`, evtStr);
      }
    }

    // 4. Apply all other direct key values (leads, tactics, drills, settings, etc.)
    for (const [k, v] of Object.entries(backup)) {
      if (!v || typeof v !== 'string') continue;
      if (k.includes('athletes_v2') || k.includes('finance') || k.includes('transactions') || k.includes('calendar_events')) {
        continue;
      }
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    }
  } finally {
    isPullingFromCloud = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cloud_sync_completed', { detail: { uid: currentUid } }));
      window.dispatchEvent(new Event('storage'));
    }
  }
}

export function subscribeToUserData(uid: string, email?: string) {
  if (!uid || uid === 'guest_trainer_99' || checkQuotaExhausted()) return () => {};

  const cleanEmail = (email || getCurrentUserIdentifier().email).trim().toLowerCase();
  const emailSanitized = cleanEmail && cleanEmail.includes('@') ? sanitizeEmailKey(cleanEmail) : null;

  // Clear existing listeners
  if (activeUnsubscribe) { try { activeUnsubscribe(); } catch (e) {} activeUnsubscribe = null; }
  if (activeEmailUnsubscribe) { try { activeEmailUnsubscribe(); } catch (e) {} activeEmailUnsubscribe = null; }
  if (activeAthleteUnsubscribe) { try { activeAthleteUnsubscribe(); } catch (e) {} activeAthleteUnsubscribe = null; }
  if (activeEmailAthleteUnsubscribe) { try { activeEmailAthleteUnsubscribe(); } catch (e) {} activeEmailAthleteUnsubscribe = null; }

  try {
    // 1. Root user doc snapshot
    const userDocRef = doc(db, 'users', uid);
    activeUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.localStorageBackup) {
          const backupStr = JSON.stringify(data.localStorageBackup);
          if (lastPushedCache[uid] === backupStr) return;
          hasPulledFromCloud[uid] = true;
          applyCloudBackupToLocalStorage(data.localStorageBackup, uid);
        }
      }
    }, (error: any) => {
      console.warn("User root subscription notice:", error?.message || error);
    });

    // 2. Direct Athlete Subcollection Listener (Instant cross-device student updates)
    const userAthletesCol = collection(db, 'users', uid, 'athletes');
    activeAthleteUnsubscribe = onSnapshot(userAthletesCol, (snapshot) => {
      if (!snapshot.empty) {
        const cloudAthletes: Athlete[] = [];
        snapshot.forEach(docSnap => {
          const a = docSnap.data() as Athlete;
          if (a && a.name) cloudAthletes.push(a);
        });
        if (cloudAthletes.length > 0) {
          const local = scanAndRecoverAllLocalAthletes();
          const merged = mergeAthleteCollections(cloudAthletes, local);
          const serialized = JSON.stringify(merged);
          localStorage.setItem('drillforge_crm_athletes_v2', serialized);
          localStorage.setItem('drillforge_crm_athletes_permanent_vault_v1', serialized);
          if (uid) localStorage.setItem(`drillforge_crm_athletes_v2_user_${uid}`, serialized);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cloud_sync_completed', { detail: { uid } }));
            window.dispatchEvent(new Event('storage'));
          }
        }
      }
    }, (error: any) => {
      console.warn("Athlete subcollection subscription notice:", error?.message || error);
    });

    // 3. Email Backup root doc and athlete subcollection
    if (emailSanitized) {
      const emailDocRef = doc(db, 'user_backups', emailSanitized);
      activeEmailUnsubscribe = onSnapshot(emailDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.localStorageBackup) {
            const backupStr = JSON.stringify(data.localStorageBackup);
            if (lastPushedCache[cleanEmail] === backupStr) return;
            hasPulledFromCloud[cleanEmail] = true;
            applyCloudBackupToLocalStorage(data.localStorageBackup, uid);
          }
        }
      }, (error: any) => {
        console.warn("Email backup subscription notice:", error?.message || error);
      });

      const emailAthletesCol = collection(db, 'user_backups', emailSanitized, 'athletes');
      activeEmailAthleteUnsubscribe = onSnapshot(emailAthletesCol, (snapshot) => {
        if (!snapshot.empty) {
          const cloudAthletes: Athlete[] = [];
          snapshot.forEach(docSnap => {
            const a = docSnap.data() as Athlete;
            if (a && a.name) cloudAthletes.push(a);
          });
          if (cloudAthletes.length > 0) {
            const local = scanAndRecoverAllLocalAthletes();
            const merged = mergeAthleteCollections(cloudAthletes, local);
            const serialized = JSON.stringify(merged);
            localStorage.setItem('drillforge_crm_athletes_v2', serialized);
            localStorage.setItem('drillforge_crm_athletes_permanent_vault_v1', serialized);
            if (uid) localStorage.setItem(`drillforge_crm_athletes_v2_user_${uid}`, serialized);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cloud_sync_completed', { detail: { uid } }));
              window.dispatchEvent(new Event('storage'));
            }
          }
        }
      }, (error: any) => {
        console.warn("Email athlete subcollection subscription notice:", error?.message || error);
      });
    }
  } catch (err) {
    console.error("Failed to subscribe to cloud data:", err);
  }

  return () => {
    if (activeUnsubscribe) { try { activeUnsubscribe(); } catch (e) {} activeUnsubscribe = null; }
    if (activeEmailUnsubscribe) { try { activeEmailUnsubscribe(); } catch (e) {} activeEmailUnsubscribe = null; }
    if (activeAthleteUnsubscribe) { try { activeAthleteUnsubscribe(); } catch (e) {} activeAthleteUnsubscribe = null; }
    if (activeEmailAthleteUnsubscribe) { try { activeEmailAthleteUnsubscribe(); } catch (e) {} activeEmailAthleteUnsubscribe = null; }
  };
}

// Helper with timeout to prevent hanging when Firestore network is slow
function withTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs))
  ]);
}

export async function pullUserDataFromCloud(uid: string, explicitEmail?: string): Promise<boolean> {
  if (!uid || uid === 'guest_trainer_99') return false;
  
  const { email: storedEmail } = getCurrentUserIdentifier();
  const targetEmail = (explicitEmail || storedEmail || '').trim().toLowerCase();
  const sanitizedEmail = targetEmail && targetEmail.includes('@') ? sanitizeEmailKey(targetEmail) : null;

  try {
    let pulledBackup: Record<string, string> | null = null;
    let subcollectionAthletes: Athlete[] = [];

    // 1. Try pulling from users/${uid}
    try {
      const userDocRef = doc(db, 'users', uid);
      const snapshot = await withTimeout(getDoc(userDocRef), 10000);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.localStorageBackup) {
          pulledBackup = data.localStorageBackup;
        }
      }
    } catch (err) {
      console.warn("User doc pull notice:", err);
    }

    // 1b. Try pulling from subcollection users/${uid}/athletes
    try {
      const userAthletesCol = collection(db, 'users', uid, 'athletes');
      const snap = await withTimeout(getDocs(userAthletesCol), 10000);
      if (!snap.empty) {
        snap.forEach(docSnap => {
          const a = docSnap.data() as Athlete;
          if (a && a.name) subcollectionAthletes.push(a);
        });
      }
    } catch (err) {
      console.warn("User athletes subcollection pull notice:", err);
    }

    // 2. Check user_backups/${emailDoc}
    if (sanitizedEmail) {
      try {
        const emailDocRef = doc(db, 'user_backups', sanitizedEmail);
        const emailSnap = await withTimeout(getDoc(emailDocRef), 10000);
        if (emailSnap.exists()) {
          const emailData = emailSnap.data();
          if (emailData && emailData.localStorageBackup) {
            if (!pulledBackup) {
              pulledBackup = emailData.localStorageBackup;
            } else {
              pulledBackup = { ...emailData.localStorageBackup, ...pulledBackup };
            }
          }
        }
      } catch (err) {
        console.warn("User email backup pull notice:", err);
      }

      // 2b. Check subcollection user_backups/${emailDoc}/athletes
      try {
        const emailAthletesCol = collection(db, 'user_backups', sanitizedEmail, 'athletes');
        const snap = await withTimeout(getDocs(emailAthletesCol), 10000);
        if (!snap.empty) {
          snap.forEach(docSnap => {
            const a = docSnap.data() as Athlete;
            if (a && a.name) subcollectionAthletes.push(a);
          });
        }
      } catch (err) {
        console.warn("Email athletes subcollection pull notice:", err);
      }
    }

    // Apply any subcollection athletes into the backup map
    if (subcollectionAthletes.length > 0) {
      if (!pulledBackup) pulledBackup = {};
      const local = scanAndRecoverAllLocalAthletes();
      const merged = mergeAthleteCollections(subcollectionAthletes, local);
      const str = JSON.stringify(merged);
      pulledBackup['drillforge_crm_athletes_v2'] = str;
      pulledBackup['drillforge_crm_athletes_permanent_vault_v1'] = str;
      if (uid) pulledBackup[`drillforge_crm_athletes_v2_user_${uid}`] = str;
    }

    if (pulledBackup) {
      hasPulledFromCloud[uid] = true;
      if (targetEmail) hasPulledFromCloud[targetEmail] = true;
      applyCloudBackupToLocalStorage(pulledBackup, uid);
      console.log("Cloud sync: Pulled and merged all cloud user data successfully.");
      return true;
    } else {
      hasPulledFromCloud[uid] = true;
      if (targetEmail) hasPulledFromCloud[targetEmail] = true;
      console.log("Cloud sync: Profile loaded, syncing local changes to cloud.");
      pushUserDataToCloud(uid, targetEmail).catch(() => {});
      return false;
    }
  } catch (error: any) {
    console.warn("Cloud sync pull notice:", error?.message || error);
    return false;
  }
}

let isPushing = false;

export async function pushUserDataToCloud(explicitUid?: string, explicitEmail?: string) {
  const { uid: currentUid, email: currentEmail } = getCurrentUserIdentifier();
  const uid = explicitUid || currentUid;
  const email = (explicitEmail || currentEmail || '').trim().toLowerCase();
  const sanitizedEmail = email && email.includes('@') ? sanitizeEmailKey(email) : null;

  if (!uid || uid === 'guest_trainer_99' || isPullingFromCloud || isPushing) return;

  isPushing = true;
  try {
    const backup: Record<string, string> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        
        let shouldSync = false;
        if (k.startsWith('drillforge_') || k.startsWith('trainer_') || k.startsWith('futbolpro_')) {
            if (k !== 'drillforge_guest_user' && k !== 'drillforge_user_role' && k !== 'drillforge_local_accounts_v1') {
                shouldSync = true;
            }
        } else {
            for (const base of SYNC_KEYS) {
                if (k.startsWith(base)) {
                    shouldSync = true;
                    break;
                }
            }
        }
        
        if (shouldSync) {
            backup[k] = localStorage.getItem(k) || '';
        }
    }

    // Comprehensive athlete recovery across all keys
    const allLocalAthletes = scanAndRecoverAllLocalAthletes();
    if (allLocalAthletes.length > 0) {
      const athleteStr = JSON.stringify(allLocalAthletes);
      backup['drillforge_crm_athletes_v2'] = athleteStr;
      backup['drillforge_crm_athletes_permanent_vault_v1'] = athleteStr;
      if (uid) backup[`drillforge_crm_athletes_v2_user_${uid}`] = athleteStr;
    }

    // Safety check: if local backup is completely empty and we haven't pulled yet, pull first
    const hasLocalAthletes = allLocalAthletes.length > 0 || Object.entries(backup).some(([k, v]) => k.includes('athletes_v2') && v && v.length > 5);
    if (!hasLocalAthletes && !hasPulledFromCloud[uid] && (!email || !hasPulledFromCloud[email])) {
      console.log("Push blocked: Device hasn't loaded cloud data yet. Pulling first...");
      await pullUserDataFromCloud(uid, email);
      return;
    }

    const backupString = JSON.stringify(backup);
    if (lastPushedCache[uid] === backupString) {
      return;
    }
    
    const nowIso = new Date().toISOString();
    const payload = { 
      uid,
      email: email || null,
      athletesCount: allLocalAthletes.length,
      localStorageBackup: backup,
      lastSyncedAt: nowIso
    };

    // 1. Save to users/${uid}
    const userDocRef = doc(db, 'users', uid);
    await withTimeout(setDoc(userDocRef, payload, { merge: true }), 10000);

    // 2. Also save to user_backups/${emailDoc}
    if (sanitizedEmail) {
      const emailDocRef = doc(db, 'user_backups', sanitizedEmail);
      await withTimeout(setDoc(emailDocRef, payload, { merge: true }), 10000);
    }

    // 3. Save each athlete individually to Firestore subcollection so subcollection listeners sync in real-time
    if (allLocalAthletes.length > 0) {
      try {
        const batch = writeBatch(db);
        let batchCount = 0;
        
        // Push to users/${uid}/athletes
        for (const athlete of allLocalAthletes) {
          if (!athlete.id && !athlete.name) continue;
          const athleteDocId = String(athlete.id || athlete.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
          const athleteDocRef = doc(db, 'users', uid, 'athletes', athleteDocId);
          batch.set(athleteDocRef, athlete, { merge: true });
          batchCount++;

          if (sanitizedEmail) {
            const emailAthleteDocRef = doc(db, 'user_backups', sanitizedEmail, 'athletes', athleteDocId);
            batch.set(emailAthleteDocRef, athlete, { merge: true });
            batchCount++;
          }

          if (batchCount >= 450) {
            await batch.commit();
            batchCount = 0;
          }
        }

        if (batchCount > 0) {
          await withTimeout(batch.commit(), 10000);
        }
      } catch (subColErr) {
        console.warn("Subcollection batch save notice:", subColErr);
      }
    }

    lastPushedCache[uid] = backupString;
    if (email) lastPushedCache[email] = backupString;
    hasPulledFromCloud[uid] = true;
    if (email) hasPulledFromCloud[email] = true;
    
    console.log("Cloud sync: Pushed user data and athlete collection successfully to cloud Firestore.");
  } catch (error: any) {
    console.warn("Cloud sync push notice:", error?.message || error);
  } finally {
    isPushing = false;
  }
}

let instantPushDebounce: any = null;
export function triggerInstantCloudSync() {
  if (typeof window === 'undefined') return;
  clearTimeout(instantPushDebounce);
  instantPushDebounce = setTimeout(() => {
    pushUserDataToCloud();
  }, 50);
}
