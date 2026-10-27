import React, { useState, useMemo, useEffect } from 'react';
import { Download, LayoutTemplate, Layers, GripHorizontal, FileText, Check, Plus, Trash2, Search, Filter, Calendar, Clock } from 'lucide-react';
import * as motion from 'motion/react-client';
import { generateSessionPDF } from '../lib/pdf';
import { useToast } from './Toast';
import { Drill, DrillType, AgeCategory, Difficulty } from '../types';
import { DrillModal } from './DrillModal';
import { auth } from '../firebase';
import { triggerInstantCloudSync } from '../lib/cloudSync';

export function BuilderModule({ drills = [] }: { drills?: Drill[] }) {
  const [sessionParts, setSessionParts] = useState<any[]>([]);
  const [sessionDate, setSessionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [sessionTime, setSessionTime] = useState('15:00');
  const [sessionColor, setSessionColor] = useState('emerald');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterAge, setFilterAge] = useState<string>('Todos');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('Todos');
  const [visibleCount, setVisibleCount] = useState(30);

  const [sessionTitle, setSessionTitle] = useState("Sesión de Entrenamiento: Definición y Presión");
  const [titleEdited, setTitleEdited] = useState(false);
  const [sessionCategory, setSessionCategory] = useState("Sub-15");
  const [sessionDuration, setSessionDuration] = useState("0 minutos");

  // Selection state for Drill modal
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);

  // Sync favorites with the Intelligent Library's storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('drillforge_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('drillforge_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Automating the training session title
  useEffect(() => {
    if (!titleEdited) {
      if (sessionParts.length === 0) {
        setSessionTitle("Sesión de Entrenamiento: Definición y Presión");
      } else {
        const titles = sessionParts.map(p => p.title);
        if (titles.length === 1) {
          setSessionTitle(`Sesión de Entrenamiento: ${titles[0]}`);
        } else if (titles.length === 2) {
          setSessionTitle(`Sesión de Entrenamiento: ${titles[0]} & ${titles[1]}`);
        } else {
          setSessionTitle(`Sesión de Entrenamiento: ${titles[0]} & más ${titles.length - 1} ejercicios`);
        }
      }
    }
  }, [sessionParts, titleEdited]);

  // Automating the training duration calculations
  useEffect(() => {
    const minutes = sessionParts.reduce((acc, current) => acc + (current.durationMinutes || 0), 0);
    setSessionDuration(`${minutes} minutos`);

    // Auto update category on first item if default
    if (sessionParts.length === 1 && sessionCategory === 'Sub-15') {
      const first = sessionParts[0];
      if (first.ageCategory && first.ageCategory.length > 0) {
        setSessionCategory(first.ageCategory[0]);
      }
    }
  }, [sessionParts]);

  const { addToast } = useToast();

  const getCalendarStorageKey = () => {
    let uid = auth?.currentUser?.uid;
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
    return uid ? `trainer_calendar_events_user_${uid}` : 'trainer_calendar_events';
  };

  const handleScheduleSession = () => {
    if (sessionParts.length === 0) {
      addToast('Añade ejercicios a la sesión primero.', 'default');
      return;
    }
    
    if (!sessionTitle || !sessionTitle.trim()) {
      addToast('Añade un título para la sesión de entrenamiento.', 'default');
      return;
    }

    try {
      const key = getCalendarStorageKey();
      let currentEvents: any[] = [];
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          currentEvents = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }

      const newEvent = {
        id: `session-evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dateStr: sessionDate,
        title: sessionTitle.trim(),
        time: sessionTime || '15:00',
        category: sessionCategory || 'Sub-15',
        color: sessionColor || 'emerald',
        drills: sessionParts // Store the full list of scheduled exercises/drills
      };

      currentEvents.push(newEvent);
      const serialized = JSON.stringify(currentEvents);
      localStorage.setItem(key, serialized);
      localStorage.setItem('trainer_calendar_events', serialized);
      triggerInstantCloudSync();

      const todayStr = new Date().toISOString().split('T')[0];
      if (sessionDate === todayStr) {
        addToast('¡Entrenamiento programado con éxito! Como es para hoy, ya aparece en tu Panel Principal.', 'success');
      } else {
        const parts = sessionDate.split('-');
        const friendlyDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : sessionDate;
        addToast(`¡Entrenamiento programado para el ${friendlyDate}! Añadido al Planificador de Temporada.`, 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Error al programar la sesión de entrenamiento.', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      if (sessionParts.length === 0) {
        addToast('Añade ejercicios a la sesión primero.', 'default');
        return;
      }
      generateSessionPDF(sessionParts, {
        title: sessionTitle,
        category: sessionCategory,
        duration: sessionDuration
      });
      addToast('¡PDF generado con éxito!', 'success');
    } catch (e) {
      addToast('Error al generar el PDF', 'error');
    }
  };

  const handleDragStart = (e: React.DragEvent, drill: any) => {
    e.dataTransfer.setData('drill', JSON.stringify(drill));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const drillData = e.dataTransfer.getData('drill');
    if (drillData) {
      try {
        const drill = JSON.parse(drillData);
        handleAddDrill(drill);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddDrill = (drill: any) => {
    setSessionParts(prev => [...prev, { ...drill, uid: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]);
    addToast(`${drill.title} añadido a la sesión.`, 'success');
  };

  const handleRemoveDrill = (uid: string) => {
    setSessionParts(prev => prev.filter(p => p.uid !== uid));
  };

  const filteredLibrary = useMemo(() => {
    return drills.filter(drill => {
      const matchSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          drill.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchType = true;
      if (filterType !== 'Todos') {
        const typeStr = drill.type as string;
        if (filterType === 'Táctico' || filterType === 'Táctica' || filterType === 'Tático') {
          matchType = typeStr === 'Táctica' || typeStr === 'Tática';
        } else if (filterType === 'Técnico') {
          matchType = ['Pase', 'Passe', 'Regate', 'Drible', 'Finalización', 'Finalização', 'Definición', 'Goleiro', 'Portero', 'Arquero'].includes(typeStr);
        } else if (filterType === 'Calentamiento' || filterType === 'Aquecimento') {
          matchType = typeStr === 'Calentamiento' || typeStr === 'Aquecimento';
        } else if (filterType === 'Pase' || filterType === 'Passe') {
          matchType = typeStr === 'Pase' || typeStr === 'Passe';
        } else if (filterType === 'Regate' || filterType === 'Drible') {
          matchType = typeStr === 'Regate' || typeStr === 'Drible';
        } else if (filterType === 'Definición' || filterType === 'Finalización' || filterType === 'Finalização') {
          matchType = typeStr === 'Definición' || typeStr === 'Finalización' || typeStr === 'Finalização';
        } else if (filterType === 'Portero' || filterType === 'Arquero' || filterType === 'Goleiro') {
          matchType = typeStr === 'Portero' || typeStr === 'Arquero' || typeStr === 'Goleiro';
        } else {
          matchType = typeStr === filterType;
        }
      }

      const matchAge = filterAge === 'Todos' || drill.ageCategory.includes(filterAge as AgeCategory);
      
      let matchDiff = true;
      if (filterDifficulty !== 'Todos') {
        const diffStr = drill.difficulty as string;
        if (filterDifficulty === 'Principiante' || filterDifficulty === 'Iniciante') {
          matchDiff = diffStr === 'Principiante' || diffStr === 'Iniciante';
        } else if (filterDifficulty === 'Intermedio' || filterDifficulty === 'Intermediário') {
          matchDiff = diffStr === 'Intermedio' || diffStr === 'Intermediário';
        } else if (filterDifficulty === 'Avanzado' || filterDifficulty === 'Avançado') {
          matchDiff = diffStr === 'Avanzado' || diffStr === 'Avançado';
        } else {
          matchDiff = diffStr === filterDifficulty;
        }
      }

      return matchSearch && matchType && matchAge && matchDiff;
    });
  }, [drills, searchQuery, filterType, filterAge, filterDifficulty]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto flex flex-col h-auto lg:h-full relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Creador de Entrenamientos</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Haz clic o arrastra los ejercicios de la biblioteca para armar tu sesión.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleScheduleSession} 
            className="flex items-center gap-2 bg-emerald-500 text-[#050a07] px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 text-sm"
          >
            <Check className="w-4 h-4 text-[#050a07] stroke-[3px]" />
            Finalizar y Programar
          </button>
          <button 
            onClick={handleExportPDF} 
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-805 px-4 py-2.5 rounded-xl font-bold transition-all text-sm"
          >
            <Download className="w-4 h-4 text-zinc-400" />
            PDF
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Sidebar library */}
        <div className="lg:w-[410px] h-[50vh] lg:h-auto flex flex-col bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden shrink-0">
          <div className="p-3 lg:p-5 border-b border-zinc-800 bg-zinc-900/30 space-y-3 lg:space-y-4">
            <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm lg:text-md">
              <Layers className="w-4 h-4 text-emerald-500" />
              Biblioteca ({filteredLibrary.length})
            </h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="block text-[8px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Tipo</label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded-lg px-1.5 py-1 focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                >
                  <option value="Todos">Todos</option>
                  <option value="Calentamiento">Calentamiento</option>
                  <option value="Físico">Físico</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Táctico">Táctico</option>
                  <option value="Pase">Pase</option>
                  <option value="Regate">Regate</option>
                  <option value="Definición">Definición</option>
                  <option value="Portero">Portero</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[8px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Edad</label>
                <select 
                  value={filterAge}
                  onChange={(e) => setFilterAge(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded-lg px-1.5 py-1 focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                >
                  <option value="Todos">Todos</option>
                  <option value="Sub-7">Sub-7</option>
                  <option value="Sub-9">Sub-9</option>
                  <option value="Sub-11">Sub-11</option>
                  <option value="Sub-13">Sub-13</option>
                  <option value="Sub-15">Sub-15</option>
                  <option value="Sub-17">Sub-17</option>
                  <option value="Adulto">Adulto</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Nivel</label>
                <select 
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded-lg px-1.5 py-1 focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                >
                  <option value="Todos">Todos</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {filteredLibrary.slice(0, visibleCount).map((drill) => {
              const typeStr = drill.type as string;
              const isAquecimento = typeStr === 'Aquecimento' || typeStr === 'Calentamiento';
              const isFisico = typeStr === 'Físico';
              const isTactical = typeStr === 'Tática' || typeStr === 'Tático' || typeStr === 'Táctica' || typeStr === 'Táctico';
              const typeColor = isAquecimento 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : isFisico 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : isTactical 
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

              return (
                <div 
                  key={drill.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, drill)}
                  onClick={() => setSelectedDrill(drill)}
                  className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 rounded-lg p-2.5 md:p-4 cursor-pointer transition-all flex items-start gap-2.5 relative group"
                >
                  <GripHorizontal className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0 cursor-grab" onClick={(e) => e.stopPropagation()} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-zinc-200 leading-snug tracking-tight break-words pr-4">{drill.title}</h4>
                    <p className="hidden md:block text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{drill.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5 md:mt-2.5">
                      <span className={`text-[8px] md:text-[9px] border px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${typeColor}`}>
                        {drill.type}
                      </span>
                      <span className="text-[8px] md:text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">
                        {drill.durationMinutes} MIN
                      </span>
                      {drill.difficulty && (
                        <span className="text-[8px] md:text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold">
                          {drill.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddDrill(drill);
                    }} 
                    className="p-1 rounded-md bg-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shrink-0 self-start ml-0.5" 
                    title="Añadir a la sesión"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            
            {filteredLibrary.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-sm">No se encontraron ejercicios con los filtros seleccionados.</div>
            )}

            {filteredLibrary.length > visibleCount && (
              <button 
                onClick={() => setVisibleCount(p => p + 30)}
                className="w-full py-2.5 mt-2 text-xs font-bold text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-colors"
              >
                Cargar Más Ejercicios...
              </button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div 
          className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 lg:p-8 overflow-y-auto relative custom-scrollbar"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="max-w-2xl mx-auto space-y-6 pb-20">
            
            <div className="border-b border-zinc-800 pb-5 mb-6">
              <input 
                type="text" 
                value={sessionTitle}
                onChange={(e) => {
                  setSessionTitle(e.target.value);
                  setTitleEdited(true);
                }}
                className="w-full bg-transparent text-2xl lg:text-3xl font-display font-bold text-white focus:outline-none focus:border-b focus:border-emerald-500 pb-1"
                placeholder="Título de la Sesión"
              />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                 <div className="flex flex-col">
                   <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Categoría Objetivo</span>
                   <input 
                     type="text" 
                     value={sessionCategory} 
                     onChange={(e) => setSessionCategory(e.target.value)}
                     className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors h-9" 
                     placeholder="Categoría (ej: Sub-15)"
                   />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Duración</span>
                   <input 
                     type="text" 
                     readOnly
                     value={sessionDuration} 
                     className="bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-500 outline-none select-none cursor-not-allowed h-9" 
                     placeholder="Duración"
                   />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider mb-1 flex items-center gap-1">
                     <Calendar className="w-3 h-3 text-emerald-500" /> Día del Entrenamiento
                   </span>
                   <input 
                     type="date" 
                     value={sessionDate} 
                     onChange={(e) => setSessionDate(e.target.value)}
                     className="bg-zinc-900 border border-zinc-805 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors h-9 [color-scheme:dark]" 
                   />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider mb-1 flex items-center gap-1">
                     <Clock className="w-3 h-3 text-emerald-500" /> Horario
                   </span>
                   <input 
                     type="time" 
                     value={sessionTime} 
                     onChange={(e) => setSessionTime(e.target.value)}
                     className="bg-zinc-900 border border-zinc-805 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors h-9 [color-scheme:dark]" 
                   />
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              {sessionParts.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/5">
                  <LayoutTemplate className="w-8 h-8 mb-3 mx-auto opacity-30 text-zinc-400" />
                  <p className="text-sm font-medium">Tu sesión de entrenamiento está vacía.</p>
                  <p className="text-xs text-zinc-650 mt-1">Arrastra o haz clic en los ejercicios de la biblioteca a la izquierda para comenzar.</p>
                </div>
              ) : (
                sessionParts.map((part, index) => {
                  const typeStr = part.type as string;
                  const isAquecimento = typeStr === 'Aquecimento' || typeStr === 'Calentamiento';
                  const isFisico = typeStr === 'Físico';
                  const isTactical = typeStr === 'Tática' || typeStr === 'Tático' || typeStr === 'Táctica' || typeStr === 'Táctico';
                  const typeColor = isAquecimento 
                    ? 'text-emerald-400' 
                    : isFisico 
                      ? 'text-blue-400' 
                      : isTactical 
                        ? 'text-indigo-400' 
                        : 'text-amber-400';

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={part.uid} 
                      onClick={() => setSelectedDrill(part)}
                      className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs shadow-inner shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 flex-wrap">
                             <span className={`text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>{part.type}</span>
                             <span className="text-zinc-700 text-xs">•</span>
                             <span className="text-[10px] font-bold text-zinc-405">{part.durationMinutes || part.duration} MIN</span>
                             {part.difficulty && (
                               <>
                                 <span className="text-zinc-700 text-xs">•</span>
                                 <span className="text-[10px] font-bold text-zinc-400">{part.difficulty}</span>
                               </>
                             )}
                           </div>
                           <h3 className="text-lg font-bold text-white mt-1 leading-snug tracking-tight uppercase">{part.title}</h3>
                           <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{part.description || part.desc}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDrill(part.uid);
                          }} 
                          className="text-zinc-500 hover:text-rose-450 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Eliminar ejercicio"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
              
              {sessionParts.length > 0 && (
                <div className="border-2 border-dashed border-zinc-800/60 rounded-xl p-6 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950/10">
                  <LayoutTemplate className="w-6 h-6 mb-2 opacity-40" />
                  <p className="text-xs font-medium">Continúa añadiendo más ejercicios desde la biblioteca</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RENDER THE DETAILED MODAL VIEWER */}
      {selectedDrill && (
        <DrillModal 
          drill={selectedDrill}
          onClose={() => setSelectedDrill(null)}
          isFavorite={favorites.includes(selectedDrill.id)}
          onToggleFavorite={() => toggleFavorite(selectedDrill.id)}
        />
      )}
    </div>
  );
}
