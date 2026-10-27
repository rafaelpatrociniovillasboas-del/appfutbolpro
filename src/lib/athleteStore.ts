// Shared Athlete Store with localStorage persistence and instant Cloud synchronization
import { auth } from '../firebase';
import { compressImageDataUrl } from './utils';
import { getSettings } from './settingsStore';
import { triggerInstantCloudSync } from './cloudSync';

export interface AthleteRating {
  speed: number;
  passing: number;
  shooting: number;
  agility: number;
  tactics: number;
  tackling: number;
}

export interface AttendanceRecord {
  date: string;
  present: boolean;
}

export interface FinanceRecord {
  responsible: string;
  dueDate: string;
  amount: string;
  status: 'Pago' | 'Atrasado' | 'Pendente' | 'Pendiente' | 'Atrasado/Pendiente';
}

export interface Athlete {
  id: number;
  name: string;
  category: string;
  age: number;
  position: string;
  status: 'Ativo' | 'Inativo' | 'Activo' | 'Inactivo';
  phone: string;
  photo?: string;
  present: boolean | null; // current selection
  presenceHistory: AttendanceRecord[];
  ratings: AthleteRating;
  evolution: number; // e.t. improvement percentage ex: +12
  evolutionComment: string;
  attenComment: string;
  finance: FinanceRecord;
  birthDate?: string;
  height?: number;
  weight?: number;
  bodyFat?: number;
}

const DEFAULT_ATHLETES: Athlete[] = [
  {
    id: 1,
    name: 'João Silva',
    category: 'Sub-15',
    age: 14,
    position: 'Atacante',
    status: 'Ativo',
    phone: '(11) 99999-1111',
    present: true,
    presenceHistory: [
      { date: '10/05/2026', present: true },
      { date: '12/05/2026', present: true },
      { date: '15/05/2026', present: true },
      { date: '18/05/2026', present: true },
      { date: '21/05/2026', present: true },
      { date: '25/05/2026', present: true },
      { date: '28/05/2026', present: true },
      { date: '01/06/2026', present: true }
    ],
    ratings: {
      speed: 85,
      passing: 78,
      shooting: 82,
      agility: 88,
      tactics: 68,
      tackling: 74
    },
    evolution: 12,
    evolutionComment: 'Melhoria em Finalização nos últimos 30 dias após aplicação de microciclo específico.',
    attenComment: 'Abaixo da média da categoria em posicionamento tático. Sugerido treinos de rondo posicional.',
    finance: {
      responsible: 'Marcos Silva',
      dueDate: '10/06/2026',
      amount: `${getSettings().currencyCode} 150,00`,
      status: 'Pago'
    }
  },
  {
    id: 2,
    name: 'Pedro Santos',
    category: 'Sub-13',
    age: 12,
    position: 'Meio-campo',
    status: 'Ativo',
    phone: '(11) 99999-2222',
    present: false,
    presenceHistory: [
      { date: '10/05/2026', present: true },
      { date: '12/05/2026', present: false },
      { date: '15/05/2026', present: true },
      { date: '18/05/2026', present: true },
      { date: '21/05/2026', present: false },
      { date: '25/05/2026', present: true },
      { date: '28/05/2026', present: true },
      { date: '01/06/2026', present: true }
    ],
    ratings: {
      speed: 72,
      passing: 85,
      shooting: 75,
      agility: 78,
      tactics: 82,
      tackling: 65
    },
    evolution: 8,
    evolutionComment: 'Grande facilidade na transição ofensiva e passes curtos sob pressão.',
    attenComment: 'Dificuldades no combate defensivo direto 1v1. Focar em exercícios de temporização.',
    finance: {
      responsible: 'Carla Santos',
      dueDate: '10/06/2026',
      amount: `${getSettings().currencyCode} 150,00`,
      status: 'Pago'
    }
  },
  {
    id: 3,
    name: 'Lucas Oliveira',
    category: 'Sub-17',
    age: 16,
    position: 'Zagueiro',
    status: 'Inativo',
    phone: '(11) 99999-3333',
    present: true,
    presenceHistory: [
      { date: '10/05/2026', present: true },
      { date: '12/05/2026', present: true },
      { date: '15/05/2026', present: true },
      { date: '18/05/2026', present: false },
      { date: '21/05/2026', present: true }
    ],
    ratings: {
      speed: 76,
      passing: 70,
      shooting: 60,
      agility: 72,
      tactics: 80,
      tackling: 85
    },
    evolution: 4,
    evolutionComment: 'Consistente na cobertura defensiva por elevação e cortes diretos.',
    attenComment: 'Pouco engajamento nos treinos recentes. Atleta atualmente listado como Inativo.',
    finance: {
      responsible: 'Roberto Oliveira',
      dueDate: '05/05/2026',
      amount: `${getSettings().currencyCode} 150,00`,
      status: 'Atrasado'
    }
  },
  {
    id: 4,
    name: 'Mateus Costa',
    category: 'Sub-15',
    age: 15,
    position: 'Goleiro',
    status: 'Ativo',
    phone: '(11) 99999-4444',
    present: null,
    presenceHistory: [
      { date: '10/05/2026', present: true },
      { date: '12/05/2026', present: true },
      { date: '15/05/2026', present: true },
      { date: '18/05/2026', present: true },
      { date: '21/05/2026', present: true },
      { date: '25/05/2026', present: true },
      { date: '28/05/2026', present: true }
    ],
    ratings: {
      speed: 80,
      passing: 62,
      shooting: 50,
      agility: 92,
      tactics: 75,
      tackling: 55
    },
    evolution: 15,
    evolutionComment: 'Excelentes reflexos e evolução física significativa sob o plano de goleiros do clube.',
    attenComment: 'Trabalho com os pés e reposição de bola rápida sob pressão.',
    finance: {
      responsible: 'Roberto Costa',
      dueDate: '05/03/2026',
      amount: `${getSettings().currencyCode} 150,00`,
      status: 'Atrasado'
    }
  },
  {
    id: 5,
    name: 'Lucas Moura',
    category: 'Sub-15',
    age: 14,
    position: 'Lateral',
    status: 'Ativo',
    phone: '(11) 99999-5555',
    present: true,
    presenceHistory: [
      { date: '10/05/2026', present: true },
      { date: '12/05/2026', present: true },
      { date: '15/05/2026', present: false },
      { date: '18/05/2026', present: true }
    ],
    ratings: {
      speed: 88,
      passing: 74,
      shooting: 68,
      agility: 82,
      tactics: 70,
      tackling: 72
    },
    evolution: 6,
    evolutionComment: 'Boa evolução de condicionamento aeróbico correndo as laterais.',
    attenComment: 'Refinar passe cruzado na linha de fundo.',
    finance: {
      responsible: 'Ana Moura',
      dueDate: '10/03/2026',
      amount: `${getSettings().currencyCode} 150,00`,
      status: 'Atrasado'
    }
  }
];

const LOCAL_STORAGE_KEY = 'drillforge_crm_athletes_v2';
const VAULT_STORAGE_KEY = 'drillforge_crm_athletes_permanent_vault_v1';

function getLocalStorageKey(): string {
  let uid = auth.currentUser?.uid;
  if (!uid && typeof window !== 'undefined') {
    try {
      const guestObj = localStorage.getItem('drillforge_guest_user');
      if (guestObj) {
        const parsed = JSON.parse(guestObj);
        uid = parsed?.uid;
      }
    } catch (e) {
      // ignore
    }
  }
  return uid ? `${LOCAL_STORAGE_KEY}_user_${uid}` : LOCAL_STORAGE_KEY;
}

export function isRealCustomUser(): boolean {
  let uid = auth.currentUser?.uid;
  let isGuest = false;
  if (!uid && typeof window !== 'undefined') {
    try {
      const guestObj = localStorage.getItem('drillforge_guest_user');
      if (guestObj) {
        const parsed = JSON.parse(guestObj);
        uid = parsed?.uid;
        isGuest = uid === 'guest_trainer_99';
      }
    } catch (e) {
      // ignore
    }
  } else if (uid) {
    isGuest = uid === 'guest_trainer_99';
  }
  return !!uid && !isGuest;
}

export function checkAndSyncMonthlyBilling(athletes: Athlete[]): { athletes: Athlete[]; changed: boolean } {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1; // 1 to 12
  const currentYear = now.getFullYear();

  let changed = false;

  const updated = athletes.map((athlete): Athlete => {
    const finance = athlete.finance;
    if (!finance) return athlete;

    const dueDateStr = finance.dueDate;
    if (!dueDateStr) return athlete;

    const parts = dueDateStr.trim().split('/');
    if (parts.length !== 3) return athlete;

    const dueDay = parseInt(parts[0], 10);
    const dueMonth = parseInt(parts[1], 10);
    const dueYear = parseInt(parts[2], 10);

    if (isNaN(dueDay) || isNaN(dueMonth) || isNaN(dueYear)) return athlete;

    // Check if the due date is in the past month/year
    const isPastMonth = (dueYear < currentYear) || (dueYear === currentYear && dueMonth < currentMonth);

    if (isPastMonth) {
      // Month changed! Due day stays the same, month/year update to current
      const formattedDay = String(dueDay).padStart(2, '0');
      const formattedMonth = String(currentMonth).padStart(2, '0');
      const newDueDateStr = `${formattedDay}/${formattedMonth}/${currentYear}`;

      // Reset to Pendente, but if today has already passed the due day in this new month, it becomes Atrasado
      const newStatus: 'Pago' | 'Atrasado' | 'Pendente' = currentDay > dueDay ? 'Atrasado' : 'Pendente';

      changed = true;
      return {
        ...athlete,
        finance: {
          ...finance,
          dueDate: newDueDateStr,
          status: newStatus
        } as FinanceRecord
      };
    } else if (dueYear === currentYear && dueMonth === currentMonth) {
      // Current month. If it's Pendente but today has passed the due day, it becomes Atrasado automatically
      if (finance.status === 'Pendente' && currentDay > dueDay) {
        changed = true;
        return {
          ...athlete,
          finance: {
            ...finance,
            status: 'Atrasado'
          } as FinanceRecord
        };
      }
    }

    return athlete;
  });

  return { athletes: updated, changed };
}

// Helper to validate if an array is a valid Athlete[] list
function isValidAthleteArray(arr: any): arr is Athlete[] {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some(item => item && typeof item === 'object' && typeof item.name === 'string' && item.name.trim().length > 0);
}

// Helper to merge multiple athlete collections intelligently without losing any athlete
export function mergeAthleteCollections(primary: Athlete[], incoming: Athlete[]): Athlete[] {
  const map = new Map<string, Athlete>();

  // Add primary athletes
  for (const a of primary) {
    if (!a || !a.name) continue;
    const key = a.id ? String(a.id) : a.name.toLowerCase().trim();
    map.set(key, { ...a });
  }

  // Merge incoming athletes
  for (const b of incoming) {
    if (!b || !b.name) continue;
    const key = b.id ? String(b.id) : b.name.toLowerCase().trim();
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { ...b });
    } else {
      // Merge properties favoring rich data
      const merged: Athlete = {
        ...existing,
        ...b,
        photo: (b.photo && b.photo.length > 5) ? b.photo : (existing.photo || ''),
        presenceHistory: (b.presenceHistory && b.presenceHistory.length > (existing.presenceHistory?.length || 0))
          ? b.presenceHistory
          : (existing.presenceHistory || []),
        finance: b.finance ? { ...existing.finance, ...b.finance } : existing.finance,
        ratings: b.ratings ? { ...existing.ratings, ...b.ratings } : existing.ratings,
        evolutionComment: b.evolutionComment || existing.evolutionComment,
        attenComment: b.attenComment || existing.attenComment,
        phone: b.phone || existing.phone,
        category: b.category || existing.category,
        position: b.position || existing.position,
        birthDate: b.birthDate || existing.birthDate,
      };
      map.set(key, merged);
    }
  }

  return Array.from(map.values());
}

// Deep scanner that inspects ALL localStorage keys to recover any existing athletes
export function scanAndRecoverAllLocalAthletes(): Athlete[] {
  if (typeof window === 'undefined') return DEFAULT_ATHLETES;

  let candidates: Athlete[][] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;

      // Check all keys related to athletes, crm, or generic storage
      if (
        k.includes('athlete') || 
        k.includes('atleta') || 
        k.includes('crm') || 
        k.startsWith('drillforge_') ||
        k.includes('vault')
      ) {
        const val = localStorage.getItem(k);
        if (val && val.startsWith('[') && val.length > 20) {
          try {
            const parsed = JSON.parse(val);
            if (isValidAthleteArray(parsed)) {
              candidates.push(parsed);
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}

  if (candidates.length === 0) return [];

  // Sort candidates by length descending
  candidates.sort((a, b) => b.length - a.length);

  // Merge all candidates together starting with the largest
  let merged: Athlete[] = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    merged = mergeAthleteCollections(merged, candidates[i]);
  }

  return merged;
}

export function getAthletes(): Athlete[] {
  if (typeof window === 'undefined') return DEFAULT_ATHLETES;
  const userKey = getLocalStorageKey();

  // 1. Gather athletes from all available keys
  let allFoundAthletes: Athlete[] = [];

  // Current user key
  const rawUser = localStorage.getItem(userKey);
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      if (isValidAthleteArray(parsed)) {
        allFoundAthletes = mergeAthleteCollections(allFoundAthletes, parsed);
      }
    } catch (e) {}
  }

  // Canonical global key
  const rawGlobal = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (rawGlobal) {
    try {
      const parsed = JSON.parse(rawGlobal);
      if (isValidAthleteArray(parsed)) {
        allFoundAthletes = mergeAthleteCollections(allFoundAthletes, parsed);
      }
    } catch (e) {}
  }

  // Permanent vault key
  const rawVault = localStorage.getItem(VAULT_STORAGE_KEY);
  if (rawVault) {
    try {
      const parsed = JSON.parse(rawVault);
      if (isValidAthleteArray(parsed)) {
        allFoundAthletes = mergeAthleteCollections(allFoundAthletes, parsed);
      }
    } catch (e) {}
  }

  // 2. Deep scan all local storage vaults & historical keys (from mobile, previous sessions, etc.)
  const recovered = scanAndRecoverAllLocalAthletes();
  if (recovered.length > 0) {
    allFoundAthletes = mergeAthleteCollections(allFoundAthletes, recovered);
  }

  // 3. If still empty, evaluate defaults for guest or return empty for real user
  if (allFoundAthletes.length === 0) {
    if (isRealCustomUser()) {
      return [];
    }
    const { athletes: syncedDefaults } = checkAndSyncMonthlyBilling(DEFAULT_ATHLETES);
    saveAthletes(syncedDefaults);
    return syncedDefaults;
  }

  const { athletes: synced } = checkAndSyncMonthlyBilling(allFoundAthletes);
  
  // Keep user key, global key, and vault in sync across all stores
  try {
    const serialized = JSON.stringify(synced);
    if (localStorage.getItem(userKey) !== serialized) localStorage.setItem(userKey, serialized);
    if (localStorage.getItem(LOCAL_STORAGE_KEY) !== serialized) localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    if (localStorage.getItem(VAULT_STORAGE_KEY) !== serialized) localStorage.setItem(VAULT_STORAGE_KEY, serialized);
  } catch (e) {}

  return synced;
}

export function saveAthletes(athletes: Athlete[]): void {
  if (typeof window === 'undefined') return;
  const key = getLocalStorageKey();
  const serialized = JSON.stringify(athletes);
  
  try {
    localStorage.setItem(key, serialized);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    localStorage.setItem(VAULT_STORAGE_KEY, serialized);
    window.dispatchEvent(new CustomEvent('cloud_sync_completed'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving athletes to localStorage:', e);
  }
  
  triggerInstantCloudSync();
}

export function updateAthlete(id: number, data: Partial<Athlete>): Athlete[] {
  const current = getAthletes();
  const updated = current.map(a => {
    if (a.id === id) {
      const merged = { ...a, ...data };
      if ('photo' in data) {
        merged.photo = data.photo || '';
      }
      return merged;
    }
    return a;
  });
  saveAthletes(updated);
  return updated;
}

export function addAthlete(data: Omit<Athlete, 'id' | 'presenceHistory' | 'ratings' | 'finance' | 'evolution' | 'evolutionComment' | 'attenComment' | 'present'> & { responsibleName?: string; amount?: string; dueDate?: string }): Athlete[] {
  const current = getAthletes();
  const { responsibleName, amount, dueDate, ...otherData } = data;
  
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = now.getFullYear();
  const defaultDueDate = `10/${currentMonth}/${currentYear}`;
  
  const finalDueDate = dueDate || defaultDueDate;
  let finalStatus: 'Pendente' | 'Atrasado' | 'Pago' = 'Pendente';
  
  const parts = finalDueDate.split('/');
  if (parts.length === 3) {
    const dueDay = parseInt(parts[0], 10);
    const dueMonth = parseInt(parts[1], 10);
    const dueYear = parseInt(parts[2], 10);
    
    if (dueYear < currentYear || 
       (dueYear === currentYear && dueMonth < now.getMonth() + 1) ||
       (dueYear === currentYear && dueMonth === now.getMonth() + 1 && currentDay > dueDay)) {
      finalStatus = 'Atrasado';
    }
  }

  const currencyCode = getSettings().currencyCode;
  
  const newAthlete: Athlete = {
    ...otherData,
    photo: otherData.photo || '',
    id: Date.now(),
    present: null,
    presenceHistory: [],
    ratings: {
      speed: 70,
      passing: 70,
      shooting: 70,
      agility: 70,
      tactics: 70,
      tackling: 70
    },
    evolution: 0,
    evolutionComment: 'Novatos cadastrados recentemente no sistema.',
    attenComment: 'Necessita avaliação técnica inicial completa.',
    finance: {
      responsible: responsibleName || (data.name.split(' ')[0] + ' Parent'),
      dueDate: finalDueDate,
      amount: amount || `${currencyCode} 150,00`,
      status: finalStatus
    }
  };
  const updated = [...current, newAthlete];
  saveAthletes(updated);
  return updated;
}

export function deleteAthlete(id: number): Athlete[] {
  const current = getAthletes();
  const updated = current.filter(a => a.id !== id);
  saveAthletes(updated);
  return updated;
}
