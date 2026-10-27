import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock, X, AlignLeft, Info, HelpCircle } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useToast } from './Toast';
import { Drill } from '../types';
import { auth } from '../firebase';
import { isRealCustomUser } from '../lib/athleteStore';
import { triggerInstantCloudSync } from '../lib/cloudSync';
import { DrillModal } from './DrillModal';

interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  title: string;
  time: string;
  category: string;
  color: string; // 'emerald' | 'blue' | 'amber' | 'rose' | 'indigo'
  drills?: any[]; // Keep reference to saved drills/workouts within a session
}

interface PlannerModuleProps {
  drills?: Drill[];
}

export function PlannerModule({ drills = [] }: PlannerModuleProps) {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Custom event form state
  const [eventTitle, setEventTitle] = useState('');
  const [selectedDrillId, setSelectedDrillId] = useState<string>('custom');
  const [eventTime, setEventTime] = useState('15:00');
  const [eventCategory, setEventCategory] = useState('Sub-15');
  const [eventColor, setEventColor] = useState('emerald');

  // Detailed Drill popup modal viewing state
  const [selectedDrillForModal, setSelectedDrillForModal] = useState<Drill | null>(null);

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

  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Load persistence from local storage
  const getCalendarStorageKey = () => {
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
    return uid ? `trainer_calendar_events_user_${uid}` : 'trainer_calendar_events';
  };

  const loadEvents = () => {
    const key = getCalendarStorageKey();
    let saved = localStorage.getItem(key);

    if (!saved) {
      saved = localStorage.getItem('trainer_calendar_events');
      if (saved) {
        try {
          localStorage.setItem(key, saved);
        } catch (e) {}
      }
    }

    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing scheduled events', e);
      }
    } else {
      if (isRealCustomUser()) {
        setEvents([]);
        return;
      }
      // Seed with sample events
      const today = new Date();
      const formatOffsetDate = (daysOffset: number) => {
        const d = new Date();
        d.setDate(today.getDate() + daysOffset);
        return d.toISOString().split('T')[0];
      };

      const seed: CalendarEvent[] = [
        {
          id: 'seed-1',
          dateStr: formatOffsetDate(0),
          title: 'Entrenamiento Físico Integrado',
          time: '14:30',
          category: 'Sub-15',
          color: 'emerald'
        },
        {
          id: 'seed-2',
          dateStr: formatOffsetDate(1),
          title: 'Organización Táctica Reactiva',
          time: '16:00',
          category: 'Sub-13',
          color: 'indigo'
        },
        {
          id: 'seed-3',
          dateStr: formatOffsetDate(3),
          title: 'Entrenamiento de Pase y Transición',
          time: '19:00',
          category: 'Adulto',
          color: 'amber'
        },
        {
          id: 'seed-4',
          dateStr: formatOffsetDate(-2),
          title: 'Enfoque en Definición Rápida',
          time: '15:15',
          category: 'Sub-17',
          color: 'rose'
        }
      ];
      setEvents(seed);
      localStorage.setItem(key, JSON.stringify(seed));
      localStorage.setItem('trainer_calendar_events', JSON.stringify(seed));
    }
  };

  useEffect(() => {
    loadEvents();

    const handleSync = () => loadEvents();
    window.addEventListener('cloud_sync_completed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cloud_sync_completed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    const key = getCalendarStorageKey();
    const serialized = JSON.stringify(newEvents);
    localStorage.setItem(key, serialized);
    localStorage.setItem('trainer_calendar_events', serialized);
    triggerInstantCloudSync();
  };

  // Switch months
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar grid computation
  const getDaysInMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0-6 Sunday-Saturday
    
    const totalDays = new Date(year, month + 1, 0).getDate();
    const grid: { date: Date; isCurrentMonth: boolean; dayStr: string }[] = [];

    // Prior Month Fillers
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      const dayStr = d.toISOString().split('T')[0];
      grid.push({ date: d, isCurrentMonth: false, dayStr });
    }

    // Actual Month Days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      // Ensure local YYYY-MM-DD formatting matching TZ values safely
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      grid.push({ date: d, isCurrentMonth: true, dayStr: dStr });
    }

    // Next Month Fillers (grid cell count up to 42 for complete 6 weeks)
    const totalSlots = 42;
    const remaining = totalSlots - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dayStr = d.toISOString().split('T')[0];
      grid.push({ date: d, isCurrentMonth: false, dayStr });
    }

    return grid;
  };

  const dayGrid = getDaysInMonthGrid();

  const handleOpenAddModal = (dayStr: string) => {
    setSelectedDayStr(dayStr);
    setEventTitle('');
    setSelectedDrillId('custom');
    setIsModalOpen(true);
  };

  const handleSelectDrillChange = (id: string) => {
    setSelectedDrillId(id);
    if (id !== 'custom') {
      const drill = drills.find(d => String(d.id) === id);
      if (drill) {
        setEventTitle(drill.title);
        if (drill.durationMinutes) {
          // Keep title clean
        }
      }
    } else {
      setEventTitle('');
    }
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      addToast('¡Escribe un nombre o selecciona un entrenamiento!', 'error');
      return;
    }

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dateStr: selectedDayStr,
      title: eventTitle.trim(),
      time: eventTime || '15:00',
      category: eventCategory,
      color: eventColor
    };

    const updated = [...events, newEvent];
    saveEvents(updated);
    setIsModalOpen(false);
    addToast('¡Entrenamiento agregado al calendario!', 'success');
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening modular scheduler
    setConfirmDeleteId(id);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'indigo':
        return {
          bg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
          border: 'border-indigo-500/20 hover:border-indigo-500/40',
          dot: 'bg-indigo-400',
          text: 'text-indigo-400',
          accent: 'indigo'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500/10 hover:bg-blue-500/15',
          border: 'border-blue-500/20 hover:border-blue-500/40',
          dot: 'bg-blue-400',
          text: 'text-blue-400',
          accent: 'blue'
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/15',
          border: 'border-amber-500/20 hover:border-amber-500/40',
          dot: 'bg-amber-400',
          text: 'text-amber-400',
          accent: 'amber'
        };
      case 'rose':
        return {
          bg: 'bg-rose-500/10 hover:bg-rose-500/15',
          border: 'border-rose-500/20 hover:border-rose-500/40',
          dot: 'bg-rose-400',
          text: 'text-rose-400',
          accent: 'rose'
        };
      case 'emerald':
      default:
        return {
          bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          dot: 'bg-emerald-400',
          text: 'text-emerald-400',
          accent: 'emerald'
        };
    }
  };

  // Format date helper for display
  const formatFriendlyDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto flex flex-col pb-24 lg:pb-16 h-full overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Planificador de Entrenamientos</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Tu calendario de sesiones. Toca cualquier día para programar entrenamientos y mantener la rutina organizada.
          </p>
        </div>
        <button 
          onClick={() => {
            const todayStr = new Date().toISOString().split('T')[0];
            handleOpenAddModal(todayStr);
          }} 
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4.5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg shadow-emerald-500/10 shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 text-black stroke-[3px]" />
          Nuevo Entrenamiento
        </button>
      </header>

      {/* Info Warning */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4.5 mb-6 flex gap-3 text-xs text-zinc-400 items-start shrink-0">
        <Info className="w-4.5 h-4.5 text-zinc-500 mt-0.5 shrink-0" />
        <div>
          <strong className="text-zinc-200 block mb-1">Consejo de Uso</strong>
          Para organizar entrenamientos por categoría, toca directamente el día en el calendario. Puedes escribir un nombre libre o elegir uno de tu biblioteca inteligente. Los entrenamientos agregados quedan guardados automáticamente.
        </div>
      </div>

      {/* Month Selection Bar */}
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 sm:p-6 flex-none flex flex-col min-h-[480px] sm:min-h-[600px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {months[currentDate.getMonth()]} <span className="text-emerald-500">de {currentDate.getFullYear()}</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 justify-between sm:justify-start">
              <button 
                onClick={prevMonth} 
                className="p-1.5 px-3.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors text-xs font-bold flex items-center gap-1"
                title="Mes Anterior"
              >
                <ChevronLeft className="w-4 h-4"/>
                Anterior
              </button>
              <div className="w-px h-4 bg-zinc-800 hidden sm:block"></div>
              <button 
                onClick={nextMonth} 
                className="p-1.5 px-3.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors text-xs font-bold flex items-center gap-1"
                title="Mes Siguiente"
              >
                Siguiente
                <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
          
          <div className="hidden md:block text-xs text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 uppercase tracking-wider">
            Vista Mensual Interactiva
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-px bg-zinc-900 border-b border-zinc-800 pb-2 mb-2">
          {weekdays.map((day, dIdx) => (
            <div key={day} className="text-center py-2 text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
              <span className="hidden sm:inline">{day}</span>
              <span className="inline sm:hidden">{day[0]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid Body */}
        <div className="grid grid-cols-7 grid-rows-6 gap-1.5 sm:gap-2 flex-grow">
          {dayGrid.map((cell, index) => {
            const isToday = cell.date.toDateString() === new Date().toDateString();
            const dayEvents = events.filter(evt => evt.dateStr === cell.dayStr);
            const isSelected = selectedDayStr === cell.dayStr;

            return (
              <div 
                key={`${cell.dayStr}-${index}`} 
                onClick={() => {
                  setSelectedDayStr(cell.dayStr);
                }}
                className={`min-h-[58px] sm:min-h-[90px] p-1 sm:p-2 rounded-lg sm:rounded-xl flex flex-col cursor-pointer transition-all border group relative ${
                  cell.isCurrentMonth 
                    ? 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-emerald-500/30' 
                    : 'bg-zinc-950/14 border-zinc-900/30 text-zinc-650 hover:bg-zinc-900/10 hover:border-zinc-800/20'
                } ${
                  isToday 
                    ? 'ring-1 ring-emerald-500/60 ring-offset-1 ring-offset-[#050a07] bg-emerald-500/5' 
                    : ''
                } ${
                  isSelected 
                    ? 'border-emerald-500 bg-zinc-900 shadow-md shadow-emerald-500/10' 
                    : ''
                }`}
              >
                {/* Date counter */}
                <div className="flex justify-between items-center mb-0.5 sm:mb-1.5 select-none text-[10px] sm:text-[11px] w-full">
                  <span className={`font-mono font-extrabold ${
                    isSelected ? 'text-emerald-400' : isToday 
                      ? 'text-emerald-400 sm:text-sm' 
                      : cell.isCurrentMonth ? 'text-zinc-200' : 'text-zinc-650'
                  }`}>
                    {cell.date.getDate()}
                  </span>
                  
                  {isToday ? (
                    <span className="hidden sm:inline text-[8px] uppercase tracking-wider bg-emerald-400 text-[#050a07] px-1 py-0.5 rounded font-extrabold scale-95 origin-right">
                      Hoy
                    </span>
                  ) : (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] hidden sm:block bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded font-bold">
                      +
                    </span>
                  )}
                </div>

                {/* Day events content list for Desktop (`hidden sm:block`) */}
                <div className="hidden sm:block flex-grow space-y-0.5 sm:space-y-1.5 overflow-y-auto pr-0.5 max-h-[85px] sm:max-h-[140px] custom-scrollbar">
                  {dayEvents.map((evt) => {
                    const style = getColorClasses(evt.color);
                    return (
                      <div 
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation(); // Stop opening card adder
                        }}
                        className={`text-left rounded-md sm:rounded-lg p-0.5 sm:p-1.5 border leading-none transition-all relative flex flex-col justify-between overflow-hidden cursor-default ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center justify-center sm:block">
                          <span className={`hidden sm:inline text-[8.5px] font-extrabold uppercase tracking-tight truncate ${style.text}`}>
                            {evt.category}
                          </span>
                        </div>
                        <p className="hidden sm:block text-[10px] uppercase font-bold text-zinc-200 mt-1 truncate leading-tight tracking-tight">
                          {evt.title}
                        </p>
                        {evt.drills && evt.drills.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1 mt-0.5">
                            <span className="text-[8px] text-emerald-400 font-black font-mono uppercase tracking-wider">
                              ⚡ {evt.drills.length} Ejercicio{evt.drills.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        <div className="hidden sm:flex items-center gap-1 mt-1">
                          <Clock className={`w-2 h-2 ${style.text}`} />
                          <span className="text-[8px] text-zinc-400 font-mono">{evt.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dot markers for Mobile events (`block sm:hidden`) */}
                {dayEvents.length > 0 && (
                  <div className="block sm:hidden mt-auto w-full">
                    <div className="flex justify-center gap-1 flex-wrap pb-0.5">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const style = getColorClasses(evt.color);
                        return (
                          <span 
                            key={evt.id} 
                            className={`w-2 h-2 rounded-full ${style.dot} border border-black/20`} 
                            title={evt.title}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[7px] text-zinc-400 font-black leading-none -mt-0.5">+</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Agenda List Section for Currently Selected/Tapped Day */}
      <div className="mt-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          <div>
            <h3 className="text-md sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
              Sesiones del Día: <span className="text-emerald-400 font-mono font-bold">{formatFriendlyDate(selectedDayStr)}</span>
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Selecciona cualquier día del calendario para gestionar tus entrenamientos programados.
            </p>
          </div>
          <button 
            onClick={() => handleOpenAddModal(selectedDayStr)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl font-bold transition-all text-xs sm:text-sm shrink-0 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 text-black stroke-[3px]" />
            Programar Entrenamiento
          </button>
        </div>

        {events.filter(evt => evt.dateStr === selectedDayStr).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {events.filter(evt => evt.dateStr === selectedDayStr).map((evt) => {
              const style = getColorClasses(evt.color);
              return (
                <div 
                  key={evt.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${style.bg} ${style.border} hover:scale-[1.01]`}
                >
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[9.5px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.bg.replace('bg-', 'bg-').replace('10', '30')} border border-current/10 ${style.text}`}>
                          {evt.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{evt.time}</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-sm sm:text-base break-words">
                        {evt.title}
                      </h4>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(evt.id);
                      }}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-500/20 transition-all shrink-0 self-start"
                      title="Eliminar Actividad"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Dynamic Drills / Ejercicios del Entrenamiento */}
                  {evt.drills && evt.drills.length > 0 && (
                    <div className="mt-2 pt-3.5 border-t border-zinc-800/40 w-full space-y-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                        Ejercicios Programados ({evt.drills.length}):
                      </span>
                      <div className="space-y-1.5">
                        {evt.drills.map((drill: any, dIdx: number) => (
                          <div 
                            key={drill.uid || drill.id || dIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDrillForModal(drill);
                            }}
                            className="bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-850/60 rounded-xl p-2.5 flex items-center justify-between gap-3 group/drill cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5.5 h-5.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-black text-emerald-400 flex items-center justify-center shrink-0">
                                {dIdx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-300 truncate group-hover/drill:text-emerald-400 transition-colors">
                                  {drill.title}
                                </p>
                                <span className="text-[9.5px] text-zinc-500 font-bold uppercase tracking-wide">
                                  {drill.type} • {drill.durationMinutes || drill.duration || 15} min
                                </span>
                              </div>
                            </div>
                            <span className="text-[9.5px] font-bold text-zinc-500 group-hover/drill:text-emerald-400 group-hover/drill:underline shrink-0">
                              Ver Detalles →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-zinc-800/40 rounded-2xl bg-zinc-900/10">
            <p className="text-zinc-400 text-sm font-semibold">No hay sesiones programadas para este día.</p>
            <p className="text-zinc-650 text-zinc-500 text-xs mt-1">Selecciona una fecha en el calendario para programar o usa el botón para empezar.</p>
            <button 
              onClick={() => handleOpenAddModal(selectedDayStr)}
              className="mt-3.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              Programar para el {formatFriendlyDate(selectedDayStr)}
            </button>
          </div>
        )}
      </div>

      {/* POPUP MODAL TO ADD TRAINING */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl"
          >
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-500" />
                  Programar Sesión de Entrenamiento
                </h3>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                  Para el día: {formatFriendlyDate(selectedDayStr)}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="p-5 mt-1 space-y-4">
              {/* Title Input (Free-text always) */}
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">
                  Título del Entrenamiento / Actividad (Libre)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salida de balón de 3 con pivote..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Day Time and Target Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option>Sub-6</option>
                    <option>Sub-7</option>
                    <option>Sub-8</option>
                    <option>Sub-9</option>
                    <option>Sub-10</option>
                    <option>Sub-11</option>
                    <option>Sub-12</option>
                    <option>Sub-13</option>
                    <option>Sub-14</option>
                    <option>Sub-15</option>
                    <option>Sub-16</option>
                    <option>Sub-17</option>
                    <option>Sub-18</option>
                    <option>Sub-20</option>
                    <option>Sub-23</option>
                    <option>Adulto</option>
                    <option>General</option>
                  </select>
                </div>
              </div>

              {/* Color Scheme Tag */}
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2.5">
                  Color de la Actividad en el Calendario
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'emerald', label: 'Técnico', color: 'bg-emerald-500' },
                    { id: 'blue', label: 'Físico', color: 'bg-blue-500' },
                    { id: 'amber', label: 'Táctico', color: 'bg-amber-500' },
                    { id: 'rose', label: 'Cardio', color: 'bg-rose-500' },
                    { id: 'indigo', label: 'Porteros', color: 'bg-indigo-500' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEventColor(item.id)}
                      className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[9px] font-bold transition-all ${
                        eventColor === item.id 
                          ? 'bg-zinc-900 border-zinc-700 text-white' 
                          : 'bg-zinc-950/20 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${item.color} shadow-inner`}></div>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modern, non-blocking custom delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-805 border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl relative"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/20 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-white">¿Eliminar Entrenamiento?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                ¿Seguro que quieres quitar esta sesión del planificador? Puedes volver a programarla cuando quieras.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all focus:outline-none"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = confirmDeleteId;
                  const filtered = events.filter(evt => evt.id !== id);
                  saveEvents(filtered);
                  addToast('Entrenamiento eliminado del calendario.', 'info');
                  setConfirmDeleteId(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white transition-all focus:outline-none"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed Drill popup modal viewer */}
      {selectedDrillForModal && (
        <DrillModal 
          drill={selectedDrillForModal}
          onClose={() => setSelectedDrillForModal(null)}
          isFavorite={favorites.includes(selectedDrillForModal.id)}
          onToggleFavorite={() => toggleFavorite(selectedDrillForModal.id)}
        />
      )}
    </div>
  );
}
