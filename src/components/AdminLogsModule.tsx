import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { logger, SystemLog } from '../lib/logger';

export function AdminLogsModule() {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    // Initial load
    setLogs(logger.getLogs());
    
    // Poll for new logs just in case
    const interval = setInterval(() => setLogs(logger.getLogs()), 5000);
    return () => clearInterval(interval);
  }, []);

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'fatal': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'error':
      case 'fatal': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto h-full flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" /> Registro del Sistema
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Auditoría del sistema, fallos de API, base de datos e interfaz.</p>
        </div>
        <button onClick={clearLogs} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
          <Trash2 className="w-4 h-4" /> Limpiar Registros
        </button>
      </header>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-zinc-300 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800 sticky top-0 backdrop-blur-md">
            <tr>
              <th className="px-4 py-3">Fecha y Hora</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 w-1/2">Mensaje / Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 font-medium">Ningún registro en el sistema.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-4 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center w-fit gap-1 border ${getLevelStyle(log.level)}`}>
                      {getLevelIcon(log.level)} {log.level}
                    </span>
                  </td>
                  <td className="px-4 py-4 uppercase font-bold text-zinc-300 text-[11px] tracking-wider">{log.category}</td>
                  <td className="px-4 py-4">
                     <p className="text-white font-medium mb-1">{log.message}</p>
                     {log.details && <p className="text-xs text-zinc-500 font-mono bg-zinc-950 p-2 rounded-lg break-all border border-zinc-800/50">{JSON.stringify(log.details)}</p>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
