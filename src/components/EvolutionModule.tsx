import React, { useState, useEffect } from 'react';
import { Target, Zap, Activity, Save, RefreshCw, Trophy, Award, TrendingUp, Download, User, Flame, Plus, Minus } from 'lucide-react';
import * as motion from 'motion/react-client';
import { getAthletes, saveAthletes, Athlete } from '../lib/athleteStore';
import { useToast } from './Toast';
import { generateAthleteReportPDF } from '../lib/pdf';

export function EvolutionModule({ inline }: { inline?: boolean }) {
  const { addToast } = useToast();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<number>(1);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  // Editable attributes
  const [speed, setSpeed] = useState<number>(70);
  const [passing, setPassing] = useState<number>(70);
  const [shooting, setShooting] = useState<number>(70);
  const [agility, setAgility] = useState<number>(70);
  const [tactics, setTactics] = useState<number>(70);
  const [tackling, setTackling] = useState<number>(70);

  // Body metrics
  const [height, setHeight] = useState<number>(1.75); // meters
  const [weight, setWeight] = useState<number>(68);   // kg
  const [bodyFat, setBodyFat] = useState<number>(11.5); // %

  const [evolutionPercent, setEvolutionPercent] = useState<number>(10);
  const [evolutionComment, setEvolutionComment] = useState<string>('');
  const [attenComment, setAttenComment] = useState<string>('');

  useEffect(() => {
    const reload = () => {
      const list = getAthletes();
      setAthletes(list);
      if (list.length > 0) {
        setSelectedAthleteId(prev => {
          const exists = list.find(a => a.id === prev);
          return exists ? exists.id : list[0].id;
        });
      }
    };

    reload();
    window.addEventListener('cloud_sync_completed', reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener('cloud_sync_completed', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  useEffect(() => {
    if (athletes.length > 0) {
      const active = athletes.find(a => a.id === selectedAthleteId);
      if (active) {
        setSelectedAthlete(active);
        setSpeed(active.ratings?.speed ?? 70);
        setPassing(active.ratings?.passing ?? 70);
        setShooting(active.ratings?.shooting ?? 70);
        setAgility(active.ratings?.agility ?? 70);
        setTactics(active.ratings?.tactics ?? 70);
        setTackling(active.ratings?.tackling ?? 70);
        
        setEvolutionPercent(active.evolution ?? 10);
        setEvolutionComment(active.evolutionComment ?? '');
        setAttenComment(active.attenComment ?? '');

        // Smart procedural height/weight based on age if not recorded
        // joão silva id=1 -> age 14
        const ageSeed = active.age || 14;
        const seedHeight = ageSeed > 15 ? 1.78 : ageSeed === 12 ? 1.58 : 1.70;
        const seedWeight = ageSeed > 15 ? 70 : ageSeed === 12 ? 48 : 60;
        
        // Pick stored values if present, otherwise fallback to stable procedural values
        setHeight(active.height ?? Number((seedHeight + (active.id % 5) * 0.02).toFixed(2)));
        setWeight(active.weight ?? Number((seedWeight + (active.id % 7) * 1.5).toFixed(1)));
        setBodyFat(active.bodyFat ?? Number((10.5 + (active.id % 3) * 1.2).toFixed(1)));
      }
    }
  }, [selectedAthleteId, athletes]);

  const handleSave = () => {
    if (!selectedAthlete) return;
    try {
      const updatedList = athletes.map(a => {
        if (a.id === selectedAthleteId) {
          return {
            ...a,
            ratings: {
              speed,
              passing,
              shooting,
              agility,
              tactics,
              tackling
            },
            height,
            weight,
            bodyFat,
            evolution: evolutionPercent,
            evolutionComment,
            attenComment
          };
        }
        return a;
      });
      saveAthletes(updatedList);
      setAthletes(updatedList);
      addToast(`¡Evolución técnica de ${selectedAthlete.name} guardada con éxito!`, 'success');
    } catch (e) {
      addToast('Error al guardar evolución.', 'error');
    }
  };

  const calculateIMC = () => {
    if (!height) return { bmi: 0, category: 'N/A', color: 'text-zinc-500' };
    const bmi = weight / (height * height);
    if (bmi < 18.5) return { bmi: bmi.toFixed(1), category: 'Bajo Peso', color: 'text-amber-400 bg-amber-500/10' };
    if (bmi < 25.0) return { bmi: bmi.toFixed(1), category: 'Composición Ideal', color: 'text-emerald-400 bg-emerald-500/10' };
    return { bmi: bmi.toFixed(1), category: 'Sobrepeso Atleta', color: 'text-rose-400 bg-rose-500/10' };
  };

  const imcInfo = calculateIMC();

  // Helper functions for anthropometry updates (safer/easier than sliders)
  const decHeight = () => setHeight(prev => Number(Math.max(1.0, prev - 0.01).toFixed(2)));
  const incHeight = () => setHeight(prev => Number(Math.min(2.5, prev + 0.01).toFixed(2)));

  const decWeight = () => setWeight(prev => Number(Math.max(20, prev - 0.5).toFixed(1)));
  const incWeight = () => setWeight(prev => Number(Math.min(150, prev + 0.5).toFixed(1)));

  const decBodyFat = () => setBodyFat(prev => Number(Math.max(2, prev - 0.1).toFixed(1)));
  const incBodyFat = () => setBodyFat(prev => Number(Math.min(45, prev + 0.1).toFixed(1)));

  // Radar chart drawing variables & calculations
  const radarRadius = 75;
  const radarCenter = 100;
  const attributes = [
    { label: 'Velocidad', val: speed, max: 100 },
    { label: 'Pase', val: passing, max: 100 },
    { label: 'Tiro', val: shooting, max: 100 },
    { label: 'Agilidad', val: agility, max: 100 },
    { label: 'Táctica', val: tactics, max: 100 },
    { label: 'Recuperación', val: tackling, max: 100 },
  ];

  // Helper inside SVG to compute coordinates for 6 vertices
  const getRadarCoordinates = (attrs: typeof attributes) => {
    return attrs.map((attr, index) => {
      const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2; // -90 deg aligns first label on top center
      const valueRatio = Math.max(20, Math.min(attr.val, 100)) / 100; // clamp between 20 & 100
      const x = radarCenter + radarRadius * valueRatio * Math.cos(angle);
      const y = radarCenter + radarRadius * valueRatio * Math.sin(angle);
      return { x, y, label: attr.label, val: attr.val };
    });
  };

  const radarPoints = getRadarCoordinates(attributes);
  const polygonPointsString = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Procedural Web concentric lines for SVG
  const concentricRings = [25, 50, 75, 100];

  const getRingCoordinates = (percent: number) => {
    const ratio = percent / 100;
    return Array.from({ length: 6 }).map((_, index) => {
      const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
      const x = radarCenter + radarRadius * ratio * Math.cos(angle);
      const y = radarCenter + radarRadius * ratio * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const getMetricColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const currentAvgScore = ((speed + passing + shooting + agility + tactics + tackling) / 6).toFixed(1);

  const mockTestDays = [
    { date: '15/05/2026', title: 'Yo-Yo Intermittent Recovery Test', result: 'Nivel 17.4', status: 'Excelente', type: 'Físico', badge: 'bg-emerald-500/15 text-emerald-400' },
    { date: '22/05/2026', title: 'Sprint de 30 metros (Célula)', result: '4.12 segundos', status: 'Top 3 Grupo', type: 'Velocidad', badge: 'bg-sky-500/15 text-sky-400' },
    { date: '29/05/2026', title: 'Salto Vertical Inicial (Sargento)', result: '46.5 cm', status: 'Evolución +3cm', type: 'Potencia', badge: 'bg-amber-500/15 text-amber-400' }
  ];

  const content = (
    <>
      {/* Title Header */}
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${inline ? 'hidden' : ''}`}>
        <div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block mb-2">Rendimiento Profesional</span>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Evolución del Jugador</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Ingresa, simula y exporta datos antropométricos, pruebas físicas y competencias.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={selectedAthleteId}
            onChange={e => setSelectedAthleteId(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {athletes.map(a => (
              <option key={a.id} value={a.id} className="bg-zinc-900 text-white">{a.name} ({a.category})</option>
            ))}
          </select>

          {selectedAthlete && (
            <button 
              onClick={() => {
                generateAthleteReportPDF(selectedAthlete);
                addToast('¡Ficha del Jugador exportada en PDF!', 'success');
              }}
              title="Generar PDF detallado"
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-855 hover:bg-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Exportar PDF
            </button>
          )}

          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 bg-emerald-500 text-[#050a07] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all font-sans"
          >
            <Save className="w-4 h-4" /> Guardar Evolución
          </button>
        </div>
      </header>

      {/* Inline Section layout separator when embedded in CRM tabs */}
      {inline && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Análisis y Evolución del Jugador
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Ingresa resultados de pruebas de campo para generar gráficos de radar automáticos en el PDF.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select 
              value={selectedAthleteId}
              onChange={e => setSelectedAthleteId(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-white px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 flex-1 md:flex-initial cursor-pointer"
            >
              {athletes.map(a => (
                <option key={a.id} value={a.id} className="bg-zinc-900 text-white">{a.name} ({a.category})</option>
              ))}
            </select>
            
            {selectedAthlete && (
              <button 
                onClick={() => {
                  generateAthleteReportPDF(selectedAthlete);
                  addToast('¡Informe Individual PDF generado!', 'success');
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            )}

            <button 
              onClick={handleSave} 
              className="flex items-center justify-center gap-1.5 bg-emerald-500 text-[#050a07] px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors shrink-0"
            >
              <Save className="w-3.5 h-3.5" /> Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {selectedAthlete ? (
        <div className="space-y-6">
          
          {/* TOP HIGHLIGHTS ROW: Personal Card, Average, and IMC (Physical traits) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Athlete Profile Summary */}
            <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl"></div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Ficha Biográfica</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-1.5">{selectedAthlete.name}</h3>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-0.5">{selectedAthlete.category} • {selectedAthlete.position}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block">EDAD</span>
                    <span className="text-sm font-bold text-white">{selectedAthlete.age} años</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block">ESTADO</span>
                    <span className={`text-xs font-bold inline-block px-2 py-0.5 rounded ${selectedAthlete.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {selectedAthlete.status === 'Ativo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-zinc-800/60 pt-4 mt-5 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <p className="text-zinc-500 font-medium">Tutor CRM</p>
                  <p className="font-bold text-white">{selectedAthlete.finance?.responsible || 'Ficha Estándar'}</p>
                </div>
              </div>
            </div>

            {/* Performance Global Index card */}
            <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full filter blur-lg"></div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Índice Global</span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-display font-black text-white tracking-tight">{currentAvgScore}</h3>
                  <span className="text-sm text-zinc-500 font-bold">/100 Pts</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mt-2 block">
                  Cálculo en tiempo real basado en el radar de 6 métricas táctico-deportivas.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span>Nivel Actual:</span>
                <span className="bg-emerald-400/10 text-emerald-400 px-2.5 py-0.5 rounded font-bold">
                  {Number(currentAvgScore) >= 80 ? 'Excelente / Élite' : Number(currentAvgScore) >= 65 ? 'Intermedio / En Evolución' : 'Requiere Refuerzo Técnico'}
                </span>
              </div>
            </div>

            {/* Micro Antropometria & IMC Visualizer */}
            <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Evaluación Antropométrica</span>
                
                <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                  <div className="bg-zinc-900/40 border border-zinc-800 p-2 rounded-xl">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5">Altura</span>
                    <span className="text-sm font-bold text-white">{height} m</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800 p-2 rounded-xl">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5">Peso</span>
                    <span className="text-sm font-bold text-white">{weight} kg</span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800 p-2 rounded-xl">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-0.5">% Grasa</span>
                    <span className="text-sm font-bold text-[#f43f5e]">{bodyFat}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Índice IMC</span>
                  <span className="font-bold text-white text-sm">{imcInfo.bmi}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${imcInfo.color}`}>
                  {imcInfo.category}
                </span>
              </div>
            </div>

          </div>

          {/* MAIN INTERACTIVE CORE: Interactive Sliders vs Web Radar Chart Svg */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Interactive Attribute Config (Col-7) */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500"/>
                    Métricas Tácticas & Físicas (Mesa Deportiva)
                  </h3>
                  <span className="text-xs text-zinc-500">Arrastra para actualizar</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  
                  {/* Speed */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/10 border border-zinc-900">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">Velocidad y Explosión</span>
                      <span className="text-[#34d399] font-mono text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded">{speed}</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={speed} 
                      onChange={e => setSpeed(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Passing */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/10 border border-zinc-900">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">Pase y Control</span>
                      <span className="text-[#34d399] font-mono text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded">{passing}</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={passing} 
                      onChange={e => setPassing(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Shooting */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/10 border border-zinc-900">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">Definición y Tiro</span>
                      <span className="text-[#34d399] font-mono text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded">{shooting}</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={shooting} 
                      onChange={e => setShooting(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Agility */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/10 border border-zinc-900">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">Agilidad y Coordinación</span>
                      <span className="text-[#34d399] font-mono text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded">{agility}</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={agility} 
                      onChange={e => setAgility(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Tactics */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/10 border border-zinc-900">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">Posicionamiento Táctico</span>
                      <span className="text-[#34d399] font-mono text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded">{tactics}</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={tactics} 
                      onChange={e => setTactics(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Tackling */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/10 border border-zinc-900">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-300">Recuperación Defensiva</span>
                      <span className="text-[#34d399] font-mono text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded">{tackling}</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={tackling} 
                      onChange={e => setTackling(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                </div>

                {/* Sub Anthropometric Config Sliders (Height, Weight, Body Fat) */}
                <div className="mt-6 pt-5 border-t border-zinc-900 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">Registro Antropométrico</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Altura */}
                    <div className="space-y-1.5 bg-zinc-900/40 border border-zinc-800 p-3 rounded-2xl">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-400 px-1">
                        <span>Altura (M)</span>
                        <span className="text-emerald-400 font-mono">{height} m</span>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={decHeight}
                          className="h-9 w-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <input 
                          type="number" 
                          step="0.01"
                          min="1.00"
                          max="2.50"
                          value={height} 
                          onChange={e => setHeight(parseFloat(e.target.value) || 0)}
                          className="h-9 w-full bg-zinc-950 border border-zinc-800 mx-1.5 text-center font-mono text-xs font-bold text-white rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={incHeight}
                          className="h-9 w-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </div>
                    </div>

                    {/* Peso */}
                    <div className="space-y-1.5 bg-zinc-900/40 border border-zinc-800 p-3 rounded-2xl">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-400 px-1">
                        <span>Peso (KG)</span>
                        <span className="text-emerald-400 font-mono">{weight} kg</span>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={decWeight}
                          className="h-9 w-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <input 
                          type="number" 
                          step="0.5"
                          min="20"
                          max="150"
                          value={weight} 
                          onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                          className="h-9 w-full bg-zinc-950 border border-zinc-800 mx-1.5 text-center font-mono text-xs font-bold text-white rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={incWeight}
                          className="h-9 w-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </div>
                    </div>

                    {/* Massa Gorda */}
                    <div className="space-y-1.5 bg-zinc-900/40 border border-zinc-800 p-3 rounded-2xl">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-400 px-1">
                        <span>% Grasa Corporal</span>
                        <span className="text-[#f43f5e] font-mono">{bodyFat}%</span>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={decBodyFat}
                          className="h-9 w-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <input 
                          type="number" 
                          step="0.1"
                          min="2"
                          max="45"
                          value={bodyFat} 
                          onChange={e => setBodyFat(parseFloat(e.target.value) || 0)}
                          className="h-9 w-full bg-zinc-950 border border-zinc-800 mx-1.5 text-center font-mono text-xs font-bold text-white rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={incBodyFat}
                          className="h-9 w-9 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bars layout visual feedback row */}
              <div className="mt-6 pt-5 border-t border-zinc-900 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Control de Niveles de Competencia</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                  {attributes.map((stat, idx) => (
                    <div key={idx} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-2.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block mb-1 truncate">{stat.label}</span>
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-xs font-mono font-bold text-white">{stat.val}</span>
                        <div className="flex-1 bg-zinc-800 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${getMetricColor(stat.val)} rounded-full`} style={{ width: `${stat.val}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side: High-Tech Live Radar Map Svg Viewer (Col-5) */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between items-center text-center">
              <div className="w-full flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Mapa de Competencias Deportivas
                </h3>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Mapa en Vivo</span>
              </div>

              {/* SVG Spidery Radar Web */}
              <div className="relative w-full max-w-[210px] md:max-w-[240px] aspect-square flex items-center justify-center bg-zinc-900/20 rounded-2xl p-4 border border-zinc-900/60 shadow-inner">
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                  {/* Web concentric circles */}
                  {concentricRings.map((ring, idx) => (
                    <polygon
                      key={idx}
                      points={getRingCoordinates(ring)}
                      fill="none"
                      stroke="rgba(63, 63, 70, 0.35)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Concentric levels numeric value helpers */}
                  <text x="100" y="85" fill="rgba(255,255,255,0.15)" fontSize="6" textAnchor="middle">25</text>
                  <text x="100" y="65" fill="rgba(255,255,255,0.15)" fontSize="6" textAnchor="middle">50</text>
                  <text x="100" y="45" fill="rgba(255,255,255,0.15)" fontSize="6" textAnchor="middle">75</text>
                  <text x="100" y="23" fill="rgba(255,255,255,0.2)" fontSize="6" textAnchor="middle">100</text>

                  {/* Axis lines */}
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                    const x = radarCenter + radarRadius * Math.cos(angle);
                    const y = radarCenter + radarRadius * Math.sin(angle);
                    return (
                      <line
                        key={idx}
                        x1={radarCenter}
                        y1={radarCenter}
                        x2={x}
                        y2={y}
                        stroke="rgba(82, 82, 91, 0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="2,2"
                      />
                    );
                  })}

                  {/* ACTIVE dynamic value polygon */}
                  <polygon
                    points={polygonPointsString}
                    fill="rgba(16, 185, 129, 0.2)"
                    stroke="rgba(16, 185, 129, 0.75)"
                    strokeWidth="2.5"
                    className="transition-all duration-300 ease-out"
                  />

                  {/* Vertex circles for the polygon */}
                  {radarPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      className="fill-[#10b981] stroke-zinc-950 stroke-[1.5] transition-all duration-300 ease-out cursor-pointer hover:r-[6]"
                      title={`${p.label}: ${p.val}`}
                    />
                  ))}

                  {/* Metric Labels on axis tips */}
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                    const labelRadius = radarRadius + 18;
                    const x = radarCenter + labelRadius * Math.cos(angle);
                    const y = radarCenter + labelRadius * Math.sin(angle);
                    const item = attributes[idx];

                    // Align text nicely
                    let anchor = "middle";
                    if (Math.cos(angle) > 0.1) anchor = "start";
                    if (Math.cos(angle) < -0.1) anchor = "end";

                    return (
                      <g key={idx}>
                        <text
                          x={x}
                          y={y}
                          fill="rgba(255, 255, 255, 0.85)"
                          fontSize="7"
                          fontWeight="bold"
                          textAnchor={anchor}
                          className="font-sans"
                        >
                          {item.label}
                        </text>
                        <text
                          x={x}
                          y={y + 8}
                          fill="#34d399"
                          fontSize="6.5"
                          fontWeight="normal"
                          textAnchor={anchor}
                          className="font-mono font-bold"
                        >
                          {item.val} Pts
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Tips for development */}
              <div className="w-full bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 mt-4 text-left text-xs space-y-1 text-zinc-400">
                <span className="font-bold text-white block">Consejo de Entrenamiento:</span>
                Al modificar calificaciones de pruebas físicas/tácticas, el gráfico se actualiza en tiempo real. Al exportar el PDF, se incluirán estos datos en el informe.
              </div>

            </div>

          </div>

          {/* LOWER ANALYSIS & PHYSICAL HISTORY SECTION */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Text Comentaries & Evolution Percentages input */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
                <h3 className="font-bold text-white flex items-center gap-2 text-md">
                  <Flame className="w-5 h-5 text-amber-500" />
                  Historial de Observaciones & Progreso Técnico
                </h3>
                
                {/* Evolution increment indicator */}
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-2 px-3 self-start sm:self-auto">
                  <span className="text-xs text-zinc-400 font-bold">Crecimiento Físico (Mes):</span>
                  <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                    <span className="text-emerald-500 font-extrabold">+</span>
                    <input 
                      type="number" 
                      value={evolutionPercent} 
                      onChange={e => setEvolutionPercent(Number(e.target.value))}
                      className="w-8 bg-transparent text-center focus:outline-none font-bold"
                    />%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1.5 block">
                    Mayor Evolución & Comentario Técnico (Cuerpo Técnico)
                  </label>
                  <textarea 
                    value={evolutionComment}
                    onChange={e => setEvolutionComment(e.target.value)}
                    rows={4} 
                    placeholder="Menciona detalles específicos del microciclo, logros técnicos recientes del jugador..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
                  />
                  <p className="text-[10px] text-zinc-500 leading-normal italic">
                    *Esta observación se mostrará automáticamente en la parte superior de la Ficha Individual generada para el jugador.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1.5 block">
                    Puntos de Atención & Ejercicios Recomendados
                  </label>
                  <textarea 
                    value={attenComment}
                    onChange={e => setAttenComment(e.target.value)}
                    rows={4} 
                    placeholder="¿Cuáles son los principales focos de corrección táctica o entrenamientos complementarios recomendados?"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-rose-500/40 leading-relaxed font-sans"
                  />
                  <p className="text-[10px] text-zinc-500 leading-normal italic text-rose-400/80">
                    *Prescribe ejercicios específicos para mejorar las calificaciones más bajas del gráfico de radar.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-zinc-500 italic">
          Registra o selecciona jugadores activos para mostrar su evolución técnica y física.
        </div>
      )}
    </>
  );

  return inline ? <div>{content}</div> : <div className="p-6 lg:p-10 max-w-7xl mx-auto h-full overflow-y-auto">{content}</div>;
}
