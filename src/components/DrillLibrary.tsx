import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DrillCard } from './DrillCard';
import { DrillModal } from './DrillModal';
import { AgeCategory, Difficulty, DrillType, Drill } from '../types';
import { Search, Server, Loader2, ArrowLeft, Star, Video, AlignLeft, ExternalLink, Play, Sparkles, FolderClosed, Compass, Dumbbell, ArrowRight, Flame } from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { COMPLEMENTARY_PRODUCTS } from '../data/products';

type DrillLibraryProps = {
  drills: Drill[];
  isSyncing: boolean;
  onBack: () => void;
};

export function DrillLibrary({ drills, isSyncing, onBack }: DrillLibraryProps) {
  const [selectedAges, setSelectedAges] = useState<AgeCategory[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<DrillType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [drillSource, setDrillSource] = useState<'descriptive' | 'video'>('descriptive');
  
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [visibleCount, setVisibleCount] = useState(60);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('drillforge_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('drillforge_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!id || typeof id !== 'string') return;
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(60);
  }, [selectedAges, selectedDifficulties, selectedTypes, searchQuery, showFavoritesOnly]);

  const DIFFICULTY_MAP: Record<string, string[]> = {
    'Principiante': ['Principiante', 'Iniciante'],
    'Iniciante': ['Principiante', 'Iniciante'],
    'Intermedio': ['Intermedio', 'Intermediário'],
    'Intermediário': ['Intermedio', 'Intermediário'],
    'Avanzado': ['Avanzado', 'Avançado'],
    'Avançado': ['Avanzado', 'Avançado']
  };

  const TYPE_MAP: Record<string, string[]> = {
    'Calentamiento': ['Calentamiento', 'Aquecimento'],
    'Aquecimento': ['Calentamiento', 'Aquecimento'],
    'Pase': ['Pase', 'Passe'],
    'Passe': ['Pase', 'Passe'],
    'Regate': ['Regate', 'Drible'],
    'Drible': ['Regate', 'Drible'],
    'Definición': ['Definición', 'Finalização'],
    'Finalização': ['Definición', 'Finalização'],
    'Táctica': ['Táctica', 'Tática'],
    'Tática': ['Táctica', 'Tática'],
    'Físico': ['Físico'],
    'Portero': ['Portero', 'Goleiro'],
    'Goleiro': ['Portero', 'Goleiro']
  };

  const filteredDrills = useMemo(() => {
    return drills.filter(drill => {
      const matchAge = selectedAges.length === 0 || drill.ageCategory.some(age => selectedAges.includes(age));
      
      const matchDiff = selectedDifficulties.length === 0 || selectedDifficulties.some(selDiff => {
        const equivalents = DIFFICULTY_MAP[selDiff] || [selDiff];
        return equivalents.includes(drill.difficulty);
      });

      const matchType = selectedTypes.length === 0 || selectedTypes.some(selType => {
        const equivalents = TYPE_MAP[selType] || [selType];
        return equivalents.includes(drill.type);
      });

      const matchSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          drill.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFav = !showFavoritesOnly || favorites.includes(drill.id);
      
      return matchAge && matchDiff && matchType && matchSearch && matchFav;
    });
  }, [drills, selectedAges, selectedDifficulties, selectedTypes, searchQuery, showFavoritesOnly, favorites]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-[#050a07] font-sans text-slate-200 selection:bg-emerald-500/30 lg:overflow-hidden">
      
      {/* Sidebar Filters */}
      {drillSource === 'descriptive' ? (
        <Sidebar 
          selectedAges={selectedAges} setSelectedAges={setSelectedAges}
          selectedDifficulties={selectedDifficulties} setSelectedDifficulties={setSelectedDifficulties}
          selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes}
          showFavoritesOnly={showFavoritesOnly} setShowFavoritesOnly={setShowFavoritesOnly}
          favoritesCount={favorites.length}
        />
      ) : (
        <div className="w-full lg:w-[340px] flex-shrink-0 bg-[#030604] border-r border-zinc-800/60 lg:h-screen p-8 pb-24 lg:pb-8 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-10 text-emerald-400">
               <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  <img 
                    src="https://i.postimg.cc/HsKz3wQQ/logo-futbol-pro.png" 
                    alt="FútbolPro Logo" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
               </div>
               <h1 className="text-3xl font-display font-bold tracking-tight text-white">Fútbol<span className="text-emerald-500">Pro</span></h1>
            </div>

            <div className="mb-6 p-5 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 shadow-inner">
               <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider mb-2">Biblioteca de Videos</h4>
               <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Estás visualizando el catálogo con más de <strong>1.000 entrenamientos prácticos y ejercicios dinámicos grabados en video</strong>.
               </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Carpetas Incluidas</span>
                <ul className="space-y-1.5 text-xs text-zinc-300 font-medium">
                  <li className="flex items-center gap-2">📂 Calentamiento y Coordinación</li>
                  <li className="flex items-center gap-2">📂 Ejercicios Técnicos de Pase</li>
                  <li className="flex items-center gap-2">📂 Conducción, Regate y Agilidad</li>
                  <li className="flex items-center gap-2">📂 Definición y Tiros a Portería</li>
                  <li className="flex items-center gap-2">📂 Juegos Colectivos y Tácticos</li>
                </ul>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <p className="text-[11px] text-emerald-400 font-semibold leading-relaxed">
                  💡 ¡Guarda el enlace de Drive en tus favoritos para un acceso rápido desde tu móvil!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800/60 hidden lg:block">
            <span className="text-[10px] text-zinc-500 font-mono">Plataforma FútbolPro © 2026</span>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col lg:h-screen lg:overflow-hidden">
        
        {/* Top Header Base */}
        <header className="flex-shrink-0 border-b border-zinc-800/60 bg-[#070c09] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 z-10 relative shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-emerald-500/5 shadow-md">
              <img 
                src="https://i.postimg.cc/HsKz3wQQ/logo-futbol-pro.png" 
                alt="FútbolPro Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                  <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel
                </button>
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                Biblioteca de Ejercicios
                {isSyncing && <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">Sincronizando...</span>}
              </h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                {drillSource === 'descriptive' 
                  ? `Mostrando ${filteredDrills.length} de ${drills.length} ejercicios disponibles`
                  : 'Más de 1.000 entrenamientos prácticos grabados en video'
                }
              </p>
            </div>
          </div>
          
          {drillSource === 'descriptive' && (
            <div className="relative w-full sm:w-96 animate-fade-in">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input 
                type="text" 
                placeholder="Buscar por nombre u objetivo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-zinc-500 text-white shadow-inner font-medium"
              />
            </div>
          )}
        </header>

        {/* Toggle Option between Descriptive and Video Drills */}
        <div className="bg-[#060b08] border-b border-zinc-850 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex bg-zinc-950/80 p-1 rounded-2xl border border-zinc-800/80 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setDrillSource('descriptive')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                drillSource === 'descriptive'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              Ejercicios Descriptivos
            </button>
            <button
              type="button"
              onClick={() => setDrillSource('video')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                drillSource === 'video'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Video className="w-4 h-4" />
              Ejercicios en Video (1000+)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
            <span>{drillSource === 'descriptive' ? 'Filtros avanzados activos en el menú lateral' : 'Accede a la carpeta completa en Google Drive'}</span>
          </div>
        </div>

        {/* Drill Content Grid / Video Workspace */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8 lg:p-8 custom-scrollbar">
          {drillSource === 'descriptive' ? (
            filteredDrills.length > 0 ? (
              <div className="w-full flex-1">
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max"
                >
                  {filteredDrills.slice(0, visibleCount).map((drill) => (
                    <DrillCard 
                      key={drill.id} 
                      drill={drill} 
                      isFavorite={favorites.includes(drill.id)}
                      onToggleFavorite={() => toggleFavorite(drill.id)}
                      onClick={() => setSelectedDrill(drill)} 
                    />
                  ))}
                </div>
                {filteredDrills.length > visibleCount && (
                   <div className="mt-12 mb-8 flex justify-center">
                      <button 
                        onClick={() => setVisibleCount(prev => prev + 60)}
                        className="px-8 py-3.5 bg-zinc-900/80 border border-zinc-800 text-emerald-400 font-bold rounded-xl hover:bg-zinc-800 hover:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-lg flex items-center justify-center font-display tracking-wide"
                      >
                        Cargar Más Ejercicios ({filteredDrills.length - visibleCount} ocultos)
                      </button>
                   </div>
                )}
              </div>
            ) : (
              <div 
                 className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-12"
              >
                 <div className="w-20 h-20 bg-zinc-900/50 text-emerald-500/50 flex items-center justify-center rounded-full mb-6 border border-zinc-800/80">
                    {showFavoritesOnly ? <Star className="w-8 h-8 fill-amber-500 text-amber-500 " /> : <Search className="w-8 h-8" />}
                 </div>
                 <h3 className="text-2xl font-display font-bold text-white mb-2">{showFavoritesOnly ? (favorites.length === 0 ? "Sin ejercicios favoritos" : "Ningún favorito coincide") : "Ningún ejercicio encontrado"}</h3>
                 <p className="text-zinc-400 leading-relaxed">{showFavoritesOnly ? (
                   favorites.length === 0 ? (
                     <>
                       <span className="block mb-6">Aún no has guardado ningún ejercicio. ¡Haz clic en el icono de estrella en los ejercicios para guardarlos en tus favoritos!</span>
                       <button
                         onClick={() => setShowFavoritesOnly(false)}
                         className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold rounded-xl hover:bg-zinc-800 hover:border-emerald-500/35 transition-all text-sm cursor-pointer inline-flex items-center gap-2"
                       >
                         Ver todos los ejercicios
                       </button>
                     </>
                   ) : (
                     <>
                       <span className="block mb-6">Tienes {favorites.length} ejercicio(s) guardado(s) en favoritos, pero ninguno coincide con los filtros seleccionados.</span>
                       <button
                         onClick={() => {
                           setSelectedAges([]);
                           setSelectedDifficulties([]);
                           setSelectedTypes([]);
                           setSearchQuery('');
                         }}
                         className="px-5 py-2.5 bg-amber-500/10 text-amber-400 font-bold rounded-xl border border-amber-500/30 hover:bg-amber-500/20 transition-all text-sm cursor-pointer inline-flex items-center gap-2"
                       >
                         Limpiar Filtros
                       </button>
                     </>
                   )
                 ) : (
                   "Prueba a eliminar algunos filtros o buscar con otros términos para encontrar la sesión ideal."
                 )}</p>
              </div>
            )
          ) : (
            <div className="max-w-4xl mx-auto py-4 space-y-8">
              {/* Hero drive banner */}
              <div className="relative bg-gradient-to-br from-emerald-950/40 via-zinc-900/60 to-zinc-950 border border-emerald-500/20 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      Acceso Exclusivo Vitalicio
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight leading-tight">
                      Super Biblioteca con +1.000 Videos de Entrenamiento
                    </h3>
                    <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-medium">
                      Demostraciones completas y prácticas en video organizadas en carpetas para facilitar la planificación de tus sesiones. ¡Apto para todas las edades!
                    </p>
                  </div>
                  
                  <a 
                    href="https://drive.google.com/drive/folders/18ELoHhNAsPUwroe2Vo2rRde0nrC4FfTx?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 text-xs uppercase tracking-wider font-display text-center"
                  >
                    Abrir Carpeta de Drive
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Grid of Video Folders / Categories */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 font-sans">
                  Carpetas y Categorías Disponibles en Drive
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Calentamiento y Psicomotricidad",
                      desc: "Más de 150 dinámicas de activación, coordinación motora, circuitos con balón y juegos deportivos de iniciación.",
                      badge: "150+ Videos"
                    },
                    {
                      title: "Entrenamientos Técnicos de Pase y Control",
                      desc: "Paredes, pases cortos en parejas, controles orientados, pases largos y situaciones de juego enfocadas en precisión técnica.",
                      badge: "200+ Videos"
                    },
                    {
                      title: "Regate, Conducción y 1 contra 1",
                      desc: "Trabajos de zig-zag, regate bajo presión, fintas, giros, cambios de ritmo y duelos individuales de 1v1.",
                      badge: "250+ Videos"
                    },
                    {
                      title: "Tiros a Portería, Remates de Cabeza y Definición",
                      desc: "Ejercicios de remate al primer toque, centros, remates de cabeza, tiros de media distancia y transiciones rápidas.",
                      badge: "180+ Videos"
                    },
                    {
                      title: "Táctica, Posicionamiento y Juegos Reducidos",
                      desc: "Situaciones de 2v2, 3v3, comodines de apoyo, transiciones defensa-ataque, posesión de balón y compactación.",
                      badge: "120+ Videos"
                    },
                    {
                      title: "Juegos Infantiles y Recreativos",
                      desc: "Ideales para captar la atención de niños más pequeños (Sub-7 a Sub-11), uniendo diversión y aprendizaje del fútbol.",
                      badge: "100+ Videos"
                    }
                  ].map((folder, index) => (
                    <a
                      key={index}
                      href="https://drive.google.com/drive/folders/18ELoHhNAsPUwroe2Vo2rRde0nrC4FfTx?usp=drive_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-zinc-900/45 hover:bg-zinc-900 border border-zinc-800/80 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300 relative hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                            <FolderClosed className="w-5 h-5" />
                          </div>
                          <h5 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">{folder.title}</h5>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-850 text-zinc-400 shrink-0 font-mono">
                          {folder.badge}
                        </span>
                      </div>
                      
                      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                        {folder.desc}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 tracking-wider group-hover:gap-2.5 transition-all">
                        <span>Acceder en Google Drive</span>
                        <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Instructions footer card */}
              <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Play className="w-5 h-5 text-emerald-400" />
                  <h5 className="font-bold text-xs uppercase tracking-widest">Consejos de Uso Rápido</h5>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  ¡Utiliza los videos directamente en el campo o cancha! Puedes abrir las carpetas en el móvil, mostrar las jugadas a tus alumnos antes de iniciar los ejercicios o compartir el video de referencia en el grupo de WhatsApp con los padres y jugadores.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Overlay */}
      <DrillModal 
        drill={selectedDrill} 
        isFavorite={selectedDrill ? favorites.includes(selectedDrill.id) : false}
        onToggleFavorite={() => selectedDrill && toggleFavorite(selectedDrill.id)}
        onClose={() => setSelectedDrill(null)} 
      />
    </div>
  );
}
