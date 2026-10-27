import { triggerInstantCloudSync } from "./cloudSync";

export interface CurrencyOption {
  code: string;       // ISO code (e.g. 'USD', 'MXN', 'COP', 'BRL', 'PEN')
  symbol: string;     // Currency display symbol (e.g. '$', 'R$', 'S/', '₲', '₡', 'RD$', 'Q', '€')
  name: string;       // Full name (e.g. 'Peso Mexicano', 'Dólar Estadounidense')
  country: string;    // Country/Region (e.g. 'México', 'Colombia')
  flag: string;       // Flag emoji (e.g. '🇲🇽', '🇨🇴')
}

export const LATAM_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', country: 'Internacional / LATAM', flag: '🇺🇸' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', country: 'México', flag: '🇲🇽' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', country: 'Colombia', flag: '🇨🇴' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', country: 'Argentina', flag: '🇦🇷' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', country: 'Chile', flag: '🇨🇱' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', country: 'Perú', flag: '🇵🇪' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño', country: 'Brasil', flag: '🇧🇷' },
  { code: 'UYU', symbol: '$', name: 'Peso Uruguayo', country: 'Uruguay', flag: '🇺🇾' },
  { code: 'PYG', symbol: '₲', name: 'Guaraní Paraguayo', country: 'Paraguay', flag: '🇵🇾' },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano', country: 'Bolivia', flag: '🇧🇴' },
  { code: 'CRC', symbol: '₡', name: 'Colón Costarricense', country: 'Costa Rica', flag: '🇨🇷' },
  { code: 'DOP', symbol: 'RD$', name: 'Peso Dominicano', country: 'Rep. Dominicana', flag: '🇩🇴' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal Guatemalteco', country: 'Guatemala', flag: '🇬🇹' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'España / Europa', flag: '🇪🇺' },
];

export interface Settings {
  currencyCode: string;   // Display symbol or code (e.g. '$', 'R$', 'S/', '€')
  currencyIso: string;    // ISO Code (e.g. 'USD', 'MXN', 'COP')
  currencyName: string;   // Name (e.g. 'Dólar Estadounidense')
  currencyFlag: string;   // Flag (e.g. '🇺🇸')
}

const SETTINGS_KEY = 'futbolpro_settings_v1';
let cachedSettings: Settings | null = null;

const defaultSettings: Settings = {
  currencyCode: '$',
  currencyIso: 'USD',
  currencyName: 'Dólar Estadounidense',
  currencyFlag: '🇺🇸'
};

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  
  if (cachedSettings) return cachedSettings;

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // If currencyIso is missing, resolve it from currencyCode or default to USD
        const iso = parsed.currencyIso || (parsed.currencyCode === 'R$' ? 'BRL' : parsed.currencyCode === 'S/' ? 'PEN' : 'USD');
        const matched = LATAM_CURRENCIES.find(c => c.code === iso);
        
        cachedSettings = {
          currencyCode: parsed.currencyCode || matched?.symbol || defaultSettings.currencyCode,
          currencyIso: iso,
          currencyName: parsed.currencyName || matched?.name || defaultSettings.currencyName,
          currencyFlag: parsed.currencyFlag || matched?.flag || defaultSettings.currencyFlag
        };
        return cachedSettings;
      }
    }
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
  }

  cachedSettings = { ...defaultSettings };
  return cachedSettings;
}

export function updateSettings(newSettings: Partial<Settings>) {
  if (typeof window === 'undefined') return;

  const current = getSettings();
  
  // If ISO code was passed, auto populate matched currency details
  let matched: CurrencyOption | undefined;
  if (newSettings.currencyIso) {
    matched = LATAM_CURRENCIES.find(c => c.code === newSettings.currencyIso);
  }

  cachedSettings = {
    ...current,
    ...newSettings,
    currencyCode: newSettings.currencyCode || matched?.symbol || current.currencyCode || '$',
    currencyIso: newSettings.currencyIso || matched?.code || current.currencyIso || 'USD',
    currencyName: newSettings.currencyName || matched?.name || current.currencyName || 'Dólar Estadounidense',
    currencyFlag: newSettings.currencyFlag || matched?.flag || current.currencyFlag || '🇺🇸'
  };

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(cachedSettings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }

  // Trigger sync to Firestore cloud
  try {
    triggerInstantCloudSync();
  } catch (e) {}

  // Dispatch event for reactive updates across all components
  window.dispatchEvent(new Event('settings_updated'));
}

export function formatCurrencyAmount(amount: number, settings?: Settings): string {
  const currentSettings = settings || getSettings();
  const formattedNumber = Math.abs(amount).toLocaleString('es-ES', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const prefix = amount < 0 ? '-' : '';
  return `${prefix}${currentSettings.currencyCode} ${formattedNumber}`;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === SETTINGS_KEY) {
      cachedSettings = null;
      window.dispatchEvent(new Event('settings_updated'));
    }
  });

  window.addEventListener('cloud_sync_completed', () => {
    cachedSettings = null;
    window.dispatchEvent(new Event('settings_updated'));
  });
}
