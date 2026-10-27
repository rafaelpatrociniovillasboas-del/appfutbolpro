import { useState, useEffect } from 'react';
import { getSettings, Settings } from './settingsStore';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getSettings());
    };
    
    window.addEventListener('settings_updated', handleUpdate);
    return () => window.removeEventListener('settings_updated', handleUpdate);
  }, []);

  return settings;
}
