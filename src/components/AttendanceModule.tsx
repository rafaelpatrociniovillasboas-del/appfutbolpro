import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, XCircle, Search, Save, Filter } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useToast } from './Toast';
import { getAthletes, saveAthletes, Athlete } from '../lib/athleteStore';

export function AttendanceModule({ inline }: { inline?: boolean }) {
  const [date] = useState(new Date().toLocaleDateString('es-ES'));
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const reload = () => setAthletes(getAthletes());
    reload();

    window.addEventListener('cloud_sync_completed', reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener('cloud_sync_completed', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const handleToggle = (id: number, status: boolean) => {
    setAthletes(prev => prev.map(a => a.id === id ? { ...a, present: status } : a));
  };

  const handleSave = () => {
    try {
      const all = getAthletes();
      
      // Merge current active changes back into full store
      const updated = all.map(original => {
        const matchingActive = athletes.find(a => a.id === original.id);
        if (matchingActive && (selectedCategory === 'Todos' || matchingActive.category === selectedCategory)) {
          // Check if this date is already recorded, if so update it, otherwise push it
          const cleanHistory = (original.presenceHistory || []).filter(h => h.date !== date);
          const newHistory = [...cleanHistory, { date, present: matchingActive.present === true }];
          return {
            ...original,
            present: matchingActive.present,
            presenceHistory: newHistory
          };
        }
        return original;
      });

      saveAthletes(updated);
      setAthletes(updated);
      addToast('¡Asistencia guardada con éxito para ' + (selectedCategory === 'Todos' ? 'todos los jugadores' : 'la categoría ' + selectedCategory) + '!', 'success');
    } catch (e) {
      addToast('Error al guardar asistencia.', 'error');
    }
  };

  const handleQRCode = () => {
    addToast('Función de Cámara / Código QR próximamente', 'info');
  };

  // Filter athletes shown in the UI
  const filteredAthletes = athletes.filter(a => {
    const matchesCategory = selectedCategory === 'Todos' || a.category === selectedCategory;
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const presents = filteredAthletes.filter(a => a.present === true).length;
  const absents = filteredAthletes.filter(a => a.present === false).length;

  const content = (
    <>
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${inline ? 'hidden' : ''}`}>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Asistencia Digital</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Sesión actual: {date}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleQRCode} className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-zinc-800 transition-colors border border-zinc-800">
            <QrCode className="w-4 h-4" /> Escanear QR
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-500 text-[#050a07] px-4 py-2 rounded-xl font-bold hover:bg-emerald-400 transition-colors">
            <Save className="w-4 h-4" /> Guardar Asistencia
          </button>
        </div>
      </header>

      {inline && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="font-bold text-white flex items-center gap-2 text-md">Sesión actual: {date}</h2>
          <div className="flex gap-2">
            <button onClick={handleQRCode} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-zinc-850 text-xs transition-colors">
              <QrCode className="w-3.5 h-3.5" /> Código QR
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-500 text-[#050a07] px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors">
              <Save className="w-3.5 h-3.5" /> Guardar Asistencia
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                      type="text" 
                      placeholder="Buscar por nombre..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
              </div>
              <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 self-start sm:self-auto shrink-0">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select 
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-white focus:outline-none font-bold"
                >
                  <option value="Todos" className="bg-zinc-900 text-white">Todas las Categorías</option>
                  <option value="Sub-6" className="bg-zinc-900 text-white">Sub-6</option>
                  <option value="Sub-7" className="bg-zinc-900 text-white">Sub-7</option>
                  <option value="Sub-8" className="bg-zinc-900 text-white">Sub-8</option>
                  <option value="Sub-9" className="bg-zinc-900 text-white">Sub-9</option>
                  <option value="Sub-10" className="bg-zinc-900 text-white">Sub-10</option>
                  <option value="Sub-11" className="bg-zinc-900 text-white">Sub-11</option>
                  <option value="Sub-12" className="bg-zinc-900 text-white">Sub-12</option>
                  <option value="Sub-13" className="bg-zinc-900 text-white">Sub-13</option>
                  <option value="Sub-14" className="bg-zinc-900 text-white">Sub-14</option>
                  <option value="Sub-15" className="bg-zinc-900 text-white">Sub-15</option>
                  <option value="Sub-16" className="bg-zinc-900 text-white">Sub-16</option>
                  <option value="Sub-17" className="bg-zinc-900 text-white">Sub-17</option>
                  <option value="Sub-18" className="bg-zinc-900 text-white">Sub-18</option>
                  <option value="Sub-20" className="bg-zinc-900 text-white">Sub-20</option>
                  <option value="Sub-23" className="bg-zinc-900 text-white">Sub-23</option>
                  <option value="Adulto" className="bg-zinc-900 text-white">Adulto</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 text-sm font-bold">
                <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-4 h-4"/> {presents} Presentes</div>
                <div className="flex items-center gap-2 text-rose-400"><XCircle className="w-4 h-4"/> {absents} Ausentes</div>
            </div>
        </div>
        <div className="divide-y divide-zinc-800/60 p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredAthletes.map((a, i) => (
             <div key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold overflow-hidden">
                    {a.photo ? (
                      <img src={a.photo} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      a.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-0.5">{a.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{a.category} • {a.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(a.id, true)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      a.present === true ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-900 text-zinc-500 hover:text-white'
                  }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Presente
                  </button>
                  <button onClick={() => handleToggle(a.id, false)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      a.present === false ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-zinc-900 text-zinc-500 hover:text-white'
                  }`}>
                      <XCircle className="w-3.5 h-3.5" /> Ausente
                  </button>
                </div>
             </div>
          ))}
          {filteredAthletes.length === 0 && (
            <div className="text-center py-10 text-zinc-500 italic text-sm">
              Ningún jugador en esta categoría o término de búsqueda.
            </div>
          )}
        </div>
      </div>
    </>
  );

  return inline ? <div>{content}</div> : <div className="p-6 lg:p-10 max-w-7xl mx-auto">{content}</div>;
}
