import React, { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
import { Users, TrendingUp, DollarSign, AlertCircle, Calendar, ArrowRight, Activity, Bell, ChevronRight, Dumbbell, CreditCard, FileBarChart, Clock, X, Flame, ShoppingBag, BookOpen } from 'lucide-react';
import { ModuleId } from './PlatformLayout';
import { getAthletes, isRealCustomUser } from '../lib/athleteStore';
import { auth } from '../firebase';
import { DrillModal } from './DrillModal';
import { AnimatePresence } from 'motion/react';
import { useSettings } from '../lib/useSettings';
import { COMPLEMENTARY_PRODUCTS } from '../data/products';

interface DashboardExecutivoProps {
  onNavigate: (module: ModuleId | string) => void;
  userRole?: 'admin' | 'teacher';
}

export function DashboardExecutivo({ onNavigate, userRole = 'admin' }: DashboardExecutivoProps) {
  const settings = useSettings();
  const [athletes, setAthletes] = useState<any[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  
  // State for session details popup and individual drill detailed modal
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedDrillForModal, setSelectedDrillForModal] = useState<any | null>(null);
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

  const loadDashboardData = () => {
    // Load dynamic players
    setAthletes(getAthletes());

    const isReal = isRealCustomUser();

    // Load dynamic finances
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

    const finKey = uid ? `trainer_finance_transactions_user_${uid}` : 'trainer_finance_transactions';
    const savedFin = localStorage.getItem(finKey);
    if (savedFin) {
      try {
        setTransactions(JSON.parse(savedFin));
      } catch (e) {
        // ignore
      }
    } else {
      if (!isReal) {
        const initialTransactions = [
          { id: 1, desc: 'Cuotas Mensuales Sub-15 (Marzo)', date: '04 Mar 2026', amount: 3500.00, type: 'in' },
          { id: 2, desc: 'Alquiler Campo Deportivo', date: '02 Mar 2026', amount: -1200.00, type: 'out' },
          { id: 3, desc: 'Equipaciones y Material Deportivo', date: '28 Feb 2026', amount: -2800.00, type: 'out' },
          { id: 4, desc: 'Cuotas Mensuales Adulto (Marzo)', date: '25 Feb 2026', amount: 5400.00, type: 'in' },
          { id: 5, desc: 'Inscripción Torneo / Federación', date: '20 Feb 2026', amount: -600.00, type: 'out' },
        ];
        setTransactions(initialTransactions);
      } else {
        setTransactions([]);
      }
    }

    // Load dynamic calendar
    const calKey = uid ? `trainer_calendar_events_user_${uid}` : 'trainer_calendar_events';
    const savedCal = localStorage.getItem(calKey);
    if (savedCal) {
      try {
         setCalendarEvents(JSON.parse(savedCal));
      } catch (e) {
         // ignore
      }
    } else {
      if (!isReal) {
        const formatOffsetDate = (daysOffset: number) => {
          const d = new Date();
          d.setDate(new Date().getDate() + daysOffset);
          return d.toISOString().split('T')[0];
        };
        const seed = [
          { id: 'seed-1', dateStr: formatOffsetDate(0), title: 'Entrenamiento Físico Integrado', time: '14:30', category: 'Sub-15', color: 'emerald' },
          { id: 'seed-2', dateStr: formatOffsetDate(1), title: 'Organización Táctica y Presión', time: '16:00', category: 'Sub-13', color: 'indigo' },
          { id: 'seed-3', dateStr: formatOffsetDate(3), title: 'Entrenamiento de Pase y Transición', time: '19:00', category: 'Adulto', color: 'amber' },
          { id: 'seed-4', dateStr: formatOffsetDate(-2), title: 'Definición Rápida y Remates', time: '15:15', category: 'Sub-17', color: 'rose' }
        ];
        setCalendarEvents(seed);
      } else {
        setCalendarEvents([]);
      }
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleSync = () => loadDashboardData();
    window.addEventListener('cloud_sync_completed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cloud_sync_completed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const isReal = isRealCustomUser();

  const categoryCounts: Record<string, number> = {};
  
  // Use 100% real values from the athlete registry for all sessions
  const defaultValues: Record<string, number> = {
    'Sub-6': 0,
    'Sub-7': 0,
    'Sub-8': 0,
    'Sub-9': 0,
    'Sub-10': 0,
    'Sub-11': 0,
    'Sub-12': 0,
    'Sub-13': 0,
    'Sub-14': 0,
    'Sub-15': 0,
    'Sub-16': 0,
    'Sub-17': 0,
    'Sub-18': 0,
    'Sub-20': 0,
    'Sub-23': 0,
    'Adulto': 0
  };

  // Populate counts from the real athletes in the store
  athletes.forEach(athlete => {
    const cat = athlete.category;
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  const categoriesData = [
    { name: 'Sub-6', count: (categoryCounts['Sub-6'] || 0) + defaultValues['Sub-6'], color: '#ec4899' },
    { name: 'Sub-7', count: (categoryCounts['Sub-7'] || 0) + defaultValues['Sub-7'], color: '#06b6d4' },
    { name: 'Sub-8', count: (categoryCounts['Sub-8'] || 0) + defaultValues['Sub-8'], color: '#10b981' },
    { name: 'Sub-9', count: (categoryCounts['Sub-9'] || 0) + defaultValues['Sub-9'], color: '#eab308' },
    { name: 'Sub-10', count: (categoryCounts['Sub-10'] || 0) + defaultValues['Sub-10'], color: '#84cc16' },
    { name: 'Sub-11', count: (categoryCounts['Sub-11'] || 0) + defaultValues['Sub-11'], color: '#f97316' },
    { name: 'Sub-12', count: (categoryCounts['Sub-12'] || 0) + defaultValues['Sub-12'], color: '#00d2ff' },
    { name: 'Sub-13', count: (categoryCounts['Sub-13'] || 0) + defaultValues['Sub-13'], color: '#8da399' },
    { name: 'Sub-14', count: (categoryCounts['Sub-14'] || 0) + defaultValues['Sub-14'], color: '#6366f1' },
    { name: 'Sub-15', count: (categoryCounts['Sub-15'] || 0) + defaultValues['Sub-15'], color: '#a855f7' },
    { name: 'Sub-16', count: (categoryCounts['Sub-16'] || 0) + defaultValues['Sub-16'], color: '#14b8a6' },
    { name: 'Sub-17', count: (categoryCounts['Sub-17'] || 0) + defaultValues['Sub-17'], color: '#ea580c' },
    { name: 'Sub-18', count: (categoryCounts['Sub-18'] || 0) + defaultValues['Sub-18'], color: '#f43f5e' },
    { name: 'Sub-20', count: (categoryCounts['Sub-20'] || 0) + defaultValues['Sub-20'], color: '#0ea5e9' },
    { name: 'Sub-23', count: (categoryCounts['Sub-23'] || 0) + (defaultValues['Sub-23'] || 0), color: '#10b981' },
    { name: 'Adulto', count: (categoryCounts['Adulto'] || 0) + defaultValues['Adulto'], color: '#3b82f6' },
  ].filter(item => item.count > 0 || ['Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Adulto'].includes(item.name));

  const totalAlunos = categoriesData.reduce((sum, item) => sum + item.count, 0);

  // Dynamic calculations for stats card
  const activeCount = athletes.filter(a => a.status === 'Activo' || a.status === 'Ativo').length;
  const displayedActiveCount = activeCount;
  
  // Calculated frequency from presence history
  let presenceCount = 0;
  let totalLogs = 0;
  athletes.forEach(a => {
    if (a.presenceHistory && a.presenceHistory.length > 0) {
      a.presenceHistory.forEach(log => {
        totalLogs++;
        if (log.present) presenceCount++;
      });
    }
  });
  const dynamicFrequencia = totalLogs > 0 
    ? `${Math.round((presenceCount / totalLogs) * 100)}%` 
    : '0%';
  const displayedFrequenciaStr = dynamicFrequencia;

  // Real receipts calculated from athlete monthly fee values
  const parseAmount = (amtStr: string): number => {
    if (!amtStr) return 0;
    let clean = amtStr.replace(/[^\d.,]/g, '').trim();
    if (!clean) return 0;
    
    if (clean.includes(',')) {
      clean = clean.replace(/\./g, '');
      clean = clean.replace(',', '.');
    } else {
      const lastDotIndex = clean.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        const afterDot = clean.substring(lastDotIndex + 1);
        if (afterDot.length === 3) {
          clean = clean.replace(/\./g, '');
        }
      }
    }
    
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };
  const totalPaidMonthlyFees = athletes
    .filter(a => a.finance?.status === 'Pago' || a.finance?.status === 'Pagado')
    .reduce((sum, a) => sum + parseAmount(a.finance?.amount || ''), 0);

  const displayedReceitaStr = `${settings.currencyCode} ${totalPaidMonthlyFees.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Completed practices/trainings are counted from unique attendance sheet dates
  const uniqueTrainingDates = new Set<string>();
  athletes.forEach(a => {
    if (a.presenceHistory) {
      a.presenceHistory.forEach(h => {
        if (h.date) {
          uniqueTrainingDates.add(h.date);
        }
      });
    }
  });
  const completedTrainingsCount = uniqueTrainingDates.size;

  // Calculated default rates
  const overdueCount = athletes.filter(a => a.finance?.status === 'Atrasado' || a.finance?.status === 'Atrasado/Pendiente').length;
  const totalAthletesCount = athletes.length;
  const dynamicInadimplencia = totalAthletesCount > 0 
    ? `${((overdueCount / totalAthletesCount) * 105).toFixed(1)}%` 
    : '0.0%';
  const displayedDefaulterRate = dynamicInadimplencia;

  const stats = [
    { label: 'Alumnos activos', value: `${displayedActiveCount}`, trend: '+1 este mes', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    userRole === 'teacher'
      ? { label: 'Categorías activas', value: `${Object.keys(categoryCounts).length || 5}`, trend: 'Bajo supervisión', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
      : { label: 'Cuotas / Ingresos', value: displayedReceitaStr, trend: 'Total Cobrado', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Entrenamientos realizados', value: `${completedTrainingsCount}`, trend: 'Sesiones guardadas', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Asistencias', value: displayedFrequenciaStr, trend: 'Frecuencia media', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  // Dynamic filter for Today's Scheduled events
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysEvents = calendarEvents.filter(e => e.dateStr === todayStr);

  const upcomingSessions = todaysEvents.length > 0 
    ? todaysEvents.map(evt => ({
        id: evt.id,
        time: evt.time,
        category: evt.category,
        type: evt.title,
        fromCalendar: true,
        color: evt.color || 'emerald',
        drills: evt.drills || [],
        athletes: athletes.filter(a => a.category === evt.category).length || 0
      }))
    : (isReal ? [] : [
        { 
          id: 'seed-1', 
          time: '14:30', 
          category: 'Sub-13', 
          type: 'Táctico / Salida de Balón', 
          color: 'indigo',
          athletes: 18, 
          drills: [
            {
              id: 'mock-drill-1',
              title: 'Salida de Balón Reactiva 3v2',
              description: 'Trabajo de posicionamiento defensivo y movimiento de apoyo para superar líneas de presión intensa del rival.',
              difficulty: 'Fácil',
              durationMinutes: 15,
              type: 'Técnico',
              ageCategory: ['Sub-13'],
              setup: ['Área delimitada con conos de 20x20 metros', 'Dos mini porterías en los extremos laterales', 'Portero posicionado en la línea de fondo'],
              instructions: ['1. El portero inicia el pase corto con uno de los centrales laterales.', '2. Dos defensores presionan de inmediato para forzar el error.', '3. Los jugadores en posesión deben realizar pases rápidos y conectar con las porterías de transición.']
            },
            {
              id: 'mock-drill-2',
              title: 'Transición Rápida y Foco en la Línea Media',
              description: 'Transición ofensiva rápida enfocada en pases largos y precisos tras recuperación de balón en el centro del campo.',
              difficulty: 'Medio',
              durationMinutes: 15,
              type: 'Táctico',
              ageCategory: ['Sub-13'],
              setup: ['Medio campo completo con porterías delimitadas', 'Portero en la portería principal', 'Cones de barrera en el círculo central'],
              instructions: ['1. Dos equipos de 4 jugadores disputan posesión corta.', '2. Al completar 3 pases consecutivos, el equipo debe avanzar al ataque.', '3. Finalizar de primera tras centro rápido por las bandas.']
            }
          ]
        },
        { 
          id: 'seed-2', 
          time: '16:00', 
          category: 'Sub-15', 
          type: 'Físico / Potencia', 
          color: 'emerald',
          athletes: 22, 
          drills: [
            {
              id: 'mock-drill-3',
              title: 'Aceleraciones Explosivas Progresivas',
              description: 'Ejercicio de agilidad con cambio de dirección y potencia máxima en los primeros metros de carrera.',
              difficulty: 'Medio',
              durationMinutes: 15,
              type: 'Físico',
              ageCategory: ['Sub-15'],
              setup: ['Pasillo de conos distribuidos cada 5 metros', 'Cronómetro para seguimiento de marcas individuales'],
              instructions: ['1. El jugador corre de espaldas hasta el primer cono delimitado.', '2. Gira explosivamente 180 grados y hace el sprint hasta el final.', '3. Regresa caminando en recuperación activa.']
            },
            {
              id: 'mock-drill-4',
              title: 'Circuito Funcional con Tiro a Puerta',
              description: 'Circuito que combina fuerza de salto, paredes cortas y remate de media distancia en velocidad.',
              difficulty: 'Difícil',
              durationMinutes: 15,
              type: 'Físico',
              ageCategory: ['Sub-15'],
              setup: ['Escalera de agilidad', 'Tres mini vallas de 30cm', 'Balón posicionado al borde del área'],
              instructions: ['1. Realizar saltos bipodales consecutivos en las vallas funcionales.', '2. Hacer desplazamiento rápido uno-dos en la escalera.', '3. Recibir de espaldas, girar y rematar con potencia a la escuadra.']
            }
          ]
        },
        { 
          id: 'seed-3', 
          time: '18:00', 
          category: 'Adulto', 
          type: 'Partido Colectivo', 
          color: 'amber',
          athletes: 30, 
          drills: [
            {
              id: 'mock-drill-5',
              title: 'Partido Situacional de Posesión Corta',
              description: 'Partido enfocado en toma rápida de decisiones y compactación táctica en campo reducido.',
              difficulty: 'Difícil',
              durationMinutes: 20,
              type: 'Táctico',
              ageCategory: ['Adulto'],
              setup: ['Campo reducido (área a área)', 'Dos porterías reglamentarias con porteros activos'],
              instructions: ['1. Partido 11v11 limitando a máximo dos toques por jugador.', '2. Foco en la amplitud del juego y ocupación racional de espacios.', '3. Transición directa o remate de larga distancia permitido.']
            }
          ]
        },
      ]);

  // Calculate average attributes
  let speedTotal = 0;
  let passingTotal = 0;
  let shootingTotal = 0;
  let agilityTotal = 0;
  let tacticsTotal = 0;
  let tacklingTotal = 0;
  let ratCount = 0;

  athletes.forEach(a => {
    if (a.ratings) {
      speedTotal += a.ratings.speed || 70;
      passingTotal += a.ratings.passing || 70;
      shootingTotal += a.ratings.shooting || 70;
      agilityTotal += a.ratings.agility || 70;
      tacticsTotal += a.ratings.tactics || 70;
      tacklingTotal += a.ratings.tackling || 70;
      ratCount++;
    }
  });

  const avgPassing = ratCount > 0 ? Math.round(passingTotal / ratCount) : 0;
  const avgShooting = ratCount > 0 ? Math.round(shootingTotal / ratCount) : 0;
  const avgAgility = ratCount > 0 ? Math.round(agilityTotal / ratCount) : 0;

  const evolutionSkills = isReal
    ? [
        { label: 'Pase y Control', val: avgPassing },
        { label: 'Definición / Tiro', val: avgShooting },
        { label: 'Agilidad Física', val: avgAgility }
      ]
    : [
        { label: 'Pase y Control', val: 85 },
        { label: 'Definición / Tiro', val: 72 },
        { label: 'Agilidad Física', val: 90 }
      ];

  return (
    <div className="p-6 pb-24 lg:pb-10 lg:p-10 font-sans max-w-7xl mx-auto h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">¡Hola, Entrenador! 👋</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Bienvenido a tu panel de control</p>
        </div>
        <button 
          onClick={() => onNavigate('ai')}
          className="flex items-center gap-1.5 bg-emerald-500 text-[#050a07] px-3 py-2 rounded-xl font-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 focus:outline-none shrink-0"
        >
          <SparklesIcon className="w-4 h-4 shrink-0" />
          <span className="text-[11px] sm:text-xs tracking-tight uppercase">IA Copilot</span>
        </button>
      </header>

      {/* Visión general section */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 font-mono">Visión general</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all"
              >
                <div>
                  <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white mt-1.5 mb-1 tracking-tight">{stat.value}</h3>
                  <p className="text-[11px] sm:text-xs text-emerald-400 font-extrabold font-mono flex items-center gap-1">
                    <span className="inline-block">▲</span> {stat.trend}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Acesso rápido section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 font-mono">Accesos rápidos</h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[
            { label: 'Alumnos', icon: Users, id: 'crm', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Entrenamientos', icon: Dumbbell, id: 'library', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            userRole === 'teacher'
              ? { label: 'Planificador', icon: Calendar, id: 'planner', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
              : { label: 'Finanzas', icon: DollarSign, id: 'finance', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            userRole === 'teacher'
              ? { label: 'Informes', icon: FileBarChart, id: 'reports', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
              : { label: 'Cobros', icon: CreditCard, id: 'billing', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950/40 border border-zinc-800/80 hover:border-emerald-500/20 hover:bg-zinc-900/30 rounded-2xl transition-all group focus:outline-none cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                  <Icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 group-hover:text-white transition-colors text-center truncate w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Próximos entrenamientos
              </h3>
              <button onClick={() => onNavigate('planner')} className="text-zinc-500 hover:text-emerald-400 text-sm font-bold flex items-center gap-1 transition-colors">
                Ver Agenda <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedSession(session)}
                    className="flex items-center justify-between p-4 rounded-2xl border border-zinc-850/80 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-700/80 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {(session as any).fromCalendar || session.type.includes('Treino') || session.type.includes('Entrenamiento') ? session.type : `Entrenamiento Técnico - ${session.category}`}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Hoy, {session.time} • <span className="text-emerald-500/85 font-semibold">Campo 1</span>
                        </p>
                        {session.drills && session.drills.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="text-[9.5px] text-emerald-400 font-extrabold font-mono uppercase tracking-wider">
                              ⚡ {session.drills.length} Ejercicio{session.drills.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-800/40 rounded-xl bg-zinc-900/10">
                  <p className="text-zinc-500 text-sm font-medium">Ningún entrenamiento planificado para hoy.</p>
                  <p className="text-xs text-zinc-600 mt-1">Organiza una nueva sesión en el Planificador o agenda.</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => onNavigate('builder')}
              className="w-full mt-6 py-3 border border-dashed border-emerald-500/30 text-emerald-500/80 hover:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
            >
              + Diseñar Nueva Sesión
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div 
              onClick={() => onNavigate('library')}
              className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 cursor-pointer hover:bg-emerald-900/20 hover:border-emerald-500/40 transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-emerald-400 font-bold">1k+</span>
              </div>
              <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">Biblioteca de Entrenamientos</h3>
              <p className="text-sm text-zinc-400 mt-1">Accede a todas las sesiones y filtros inteligentes.</p>
            </div>

             <div 
              onClick={() => onNavigate('crm')}
              className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-6 cursor-pointer hover:bg-blue-900/20 hover:border-blue-500/40 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">Gestionar Jugadores</h3>
              <p className="text-sm text-zinc-400 mt-1">Control y análisis técnico completo de la plantilla.</p>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Alerts & Status */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-950/50 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-md">Alumnos por Categoría</h3>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                {totalAlunos} Total
              </span>
            </div>
            
            <div className="p-6 flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Donut Chart Container */}
              <div className="relative shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-36 h-36 md:w-38 md:h-38 lg:w-40 lg:h-40 select-none">
                  {totalAlunos > 0 ? (
                    (() => {
                      let currentOffset = 0;
                      return categoriesData.map((item, idx) => {
                        const pct = (item.count / totalAlunos) * 100;
                        if (pct === 0) return null;
                        const strokeDasharray = `${pct} ${100 - pct}`;
                        const strokeDashoffset = -currentOffset;
                        currentOffset += pct;
                        return (
                          <circle
                            key={idx}
                            cx="20"
                            cy="20"
                            r="15.91549430918954"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="5"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 20 20)"
                            className="transition-all duration-350 hover:stroke-[6.5] cursor-pointer"
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                          />
                        );
                      });
                    })()
                  ) : (
                    <circle
                      cx="20"
                      cy="20"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke="#27272a"
                      strokeWidth="5"
                    />
                  )}
                  {/* Inner center text */}
                  <circle cx="20" cy="20" r="11" fill="#09090b" />
                </svg>
                
                {/* Micro-text in the center */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-display font-bold text-white leading-none">
                    {hoveredIdx !== null ? categoriesData[hoveredIdx].count : totalAlunos}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 mt-1">
                    {hoveredIdx !== null ? categoriesData[hoveredIdx].name : 'Jugadores'}
                  </span>
                </div>
              </div>

              {/* Legend Stack */}
              <div className="flex-1 w-full space-y-1.5">
                {categoriesData.map((item, idx) => {
                  const pct = totalAlunos > 0 ? Math.round((item.count / totalAlunos) * 100) : 0;
                  return (
                    <div 
                      key={item.name} 
                      className={`flex items-center justify-between p-1 rounded-xl transition-all ${
                        hoveredIdx === idx ? 'bg-zinc-900/50 scale-[1.02]' : 'hover:bg-zinc-900/20'
                      }`}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-semibold text-zinc-300">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-white font-bold">{item.count}</span>
                        <span className="text-zinc-500 text-[9px]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-indigo-950/40 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6"
          >
            <h3 className="font-display font-bold text-white mb-2">Evolución General de la Cantera</h3>
            <p className="text-sm text-zinc-400 mb-6">Comparativa de rendimiento técnico semanal en todas las categorías.</p>
            
            <div className="space-y-4">
              {evolutionSkills.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-zinc-300">{item.label}</span>
                    <span className="text-indigo-400">{item.val}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.val || 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dynamic Session Details Modal */}
      {selectedSession && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSession(null)}
              className="absolute inset-0 bg-[#030604]/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#070c09] rounded-3xl border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[95dvh] z-10"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-zinc-800/60 relative">
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                    {selectedSession.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono font-medium">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedSession.time}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">
                  {selectedSession.type.includes('Treino') || selectedSession.type.includes('Entrenamiento') ? selectedSession.type : `Sesión de Entrenamiento: ${selectedSession.type}`}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 font-medium">
                  Jugadores en la categoría: <strong className="text-zinc-200">{selectedSession.athletes} jugadores</strong>
                </p>
              </div>

              {/* Scrollable list of drills */}
              <div className="overflow-y-auto p-6 sm:p-8 flex-1 bg-[#090e0b]/50 space-y-4">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Ejercicios y Actividades de la Sesión ({selectedSession.drills?.length || 0}):
                </span>

                {selectedSession.drills && selectedSession.drills.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSession.drills.map((drill: any, dIdx: number) => (
                      <div 
                        key={drill.id || dIdx}
                        onClick={() => {
                          setSelectedDrillForModal(drill);
                        }}
                        className="bg-zinc-950/65 hover:bg-zinc-900/50 border border-zinc-850 hover:border-zinc-700/60 rounded-2xl p-4 flex items-center justify-between gap-4 group/item cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-black text-emerald-400 flex items-center justify-center shrink-0">
                            {dIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-zinc-200 group-hover/item:text-emerald-400 transition-colors truncate">
                              {drill.title}
                            </h4>
                            <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                              {drill.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
                                {drill.type}
                              </span>
                              <span className="text-[9.5px] font-bold text-zinc-400 font-mono">
                                ⏱️ {drill.durationMinutes} min
                              </span>
                              <span className="text-[9.5px] font-bold text-zinc-500">
                                • {drill.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-bold text-zinc-500 group-hover/item:text-emerald-400 group-hover/item:translate-x-0.5 transition-all flex items-center gap-1 shrink-0">
                          Detalles
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-6 border border-dashed border-zinc-800/50 bg-zinc-900/10 rounded-2xl">
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed max-w-sm mx-auto">
                      Aún no se han adjuntado ejercicios estructurados a esta sesión. ¡Crea nuevos entrenamientos en la pestaña <strong>Creador de Entrenamientos</strong> para organizarlos con el máximo detalle!
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-zinc-950 border-t border-zinc-900 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    onNavigate('planner');
                  }}
                  className="text-xs text-zinc-400 hover:text-emerald-400 font-bold transition-colors flex items-center gap-1 py-2 cursor-pointer"
                >
                  Ver en el Planificador completo <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Drill detailed pop-up viewer */}
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

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
