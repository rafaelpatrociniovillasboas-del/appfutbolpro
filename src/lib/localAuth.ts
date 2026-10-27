import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, checkQuotaExhausted, markQuotaExhausted } from '../firebase';

const LOCAL_USERS_KEY = 'drillforge_local_accounts_v1';

export function getLocalUsers() {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function sanitizeEmailKey(email: string) {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

// Helper with timeout to avoid hanging network calls
function withTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs))
  ]);
}

export async function authenticateLocalUser(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();
  const docId = sanitizeEmailKey(cleanEmail);

  // 1. Try local storage
  const users = getLocalUsers();
  const local = users.find((u: any) => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (local) {
    // Also backup to cloud asynchronously if quota ok
    if (!checkQuotaExhausted()) {
      try {
        const ref = doc(db, 'registered_accounts', docId);
        withTimeout(setDoc(ref, local, { merge: true }), 2000).catch(() => {});
      } catch (err: any) {
        if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
          markQuotaExhausted();
        }
      }
    }
    return local;
  }

  if (checkQuotaExhausted()) return null;

  // 2. Try Firestore registered_accounts with timeout
  try {
    const ref = doc(db, 'registered_accounts', docId);
    const snap = await withTimeout(getDoc(ref), 3000);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.password === password) {
        const userObj = {
          uid: data.uid || ('usr_' + docId),
          email: data.email || cleanEmail,
          password: data.password,
          createdAt: data.createdAt || new Date().toISOString()
        };
        saveUserLocally(userObj);
        return userObj;
      }
    }
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
      markQuotaExhausted();
    } else {
      console.warn('Could not fetch cloud account:', err);
    }
  }

  return null;
}

export async function registerLocalUser(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();
  const docId = sanitizeEmailKey(cleanEmail);
  const uid = 'usr_' + docId;

  const newUser = {
    uid,
    email: cleanEmail,
    password,
    createdAt: new Date().toISOString()
  };

  if (checkQuotaExhausted()) {
    saveUserLocally(newUser);
    return newUser;
  }

  // Check Firestore first with timeout
  try {
    const ref = doc(db, 'registered_accounts', docId);
    const snap = await withTimeout(getDoc(ref), 3000);
    if (snap.exists()) {
      const existing = snap.data();
      if (existing && existing.password === password) {
        // Same credentials, log in
        saveUserLocally(newUser);
        return newUser;
      }
      throw new Error('EMAIL_EXISTS');
    }

    // Save to Firestore with timeout
    await withTimeout(setDoc(ref, newUser), 3000);
    saveUserLocally(newUser);
    return newUser;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('Quota limit exceeded')) {
      markQuotaExhausted();
    }
    if (err.message === 'EMAIL_EXISTS') {
      throw err;
    }
    // Fallback: save locally
    saveUserLocally(newUser);
    return newUser;
  }
}

function saveUserLocally(user: any) {
  if (typeof window === 'undefined') return;
  const users = getLocalUsers();
  const existingIndex = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}


