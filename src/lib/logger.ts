export type LogLevel = 'info' | 'warning' | 'error' | 'fatal';
export type LogCategory = 'system' | 'api' | 'database' | 'ui' | 'user_action';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
}

const LOGS_STORAGE_KEY = 'drillforge_system_logs';

class Logger {
  private logs: SystemLog[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch {
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs));
    } catch {
      // Ignore
    }
  }

  private addLog(level: LogLevel, category: LogCategory, message: string, details?: any) {
    const log: SystemLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
    };
    this.logs.unshift(log); // Add to beginning
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(0, 500); // Keep last 500
    }
    this.saveLogs();
    
    // Also log to console for dev visibility
    const consoleMethod = level === 'error' || level === 'fatal' ? console.error : level === 'warning' ? console.warn : console.log;
    consoleMethod(`[${level.toUpperCase()}][${category}] ${message}`, details || '');
  }

  info(category: LogCategory, message: string, details?: any) {
    this.addLog('info', category, message, details);
  }

  warn(category: LogCategory, message: string, details?: any) {
    this.addLog('warning', category, message, details);
  }

  error(category: LogCategory, message: string, details?: any) {
    this.addLog('error', category, message, details);
  }

  fatal(category: LogCategory, message: string, details?: any) {
    this.addLog('fatal', category, message, details);
  }

  getLogs(): SystemLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

export const logger = new Logger();
