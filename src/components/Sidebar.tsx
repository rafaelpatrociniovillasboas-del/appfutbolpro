import React from 'react';
import { AgeCategory, Difficulty, DrillType } from '../types';
import { cn } from '../lib/utils';
import { Filter, Users, Signal, LayoutTemplate, Star } from 'lucide-react';

interface SidebarProps {
  selectedAges: AgeCategory[];
  setSelectedAges: (ages: AgeCategory[]) => void;
  selectedDifficulties: Difficulty[];
  setSelectedDifficulties: (diffs: Difficulty[]) => void;
  selectedTypes: DrillType[];
  setSelectedTypes: (types: DrillType[]) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  favoritesCount: number;
}

const AGE_OPTIONS: AgeCategory[] = ['Sub-7', 'Sub-9', 'Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Sub-20', 'Sub-23', 'Adulto'];
const DIFFICULTY_OPTIONS: { label: string; value: Difficulty; equivalents: string[] }[] = [
  { label: 'Principiante', value: 'Principiante', equivalents: ['Principiante', 'Iniciante'] },
  { label: 'Intermedio', value: 'Intermedio', equivalents: ['Intermedio', 'Intermediário'] },
  { label: 'Avanzado', value: 'Avanzado', equivalents: ['Avanzado', 'Avançado'] },
];
const TYPE_OPTIONS: { label: string; value: DrillType; equivalents: string[] }[] = [
  { label: 'Calentamiento', value: 'Calentamiento', equivalents: ['Calentamiento', 'Aquecimento'] },
  { label: 'Pase', value: 'Pase', equivalents: ['Pase', 'Passe'] },
  { label: 'Regate', value: 'Regate', equivalents: ['Regate', 'Drible'] },
  { label: 'Definición', value: 'Definición', equivalents: ['Definición', 'Finalização'] },
  { label: 'Táctica', value: 'Táctica', equivalents: ['Táctica', 'Tática'] },
  { label: 'Físico', value: 'Físico', equivalents: ['Físico'] },
  { label: 'Portero', value: 'Portero', equivalents: ['Portero', 'Goleiro'] },
];

export function Sidebar({
  selectedAges, setSelectedAges,
  selectedDifficulties, setSelectedDifficulties,
  selectedTypes, setSelectedTypes,
  showFavoritesOnly, setShowFavoritesOnly,
  favoritesCount
}: SidebarProps) {
  
  const toggleArray = <T,>(arr: T[], item: T, setter: (val: T[]) => void) => {
    if (arr.includes(item)) setter(arr.filter(i => i !== item));
    else setter([...arr, item]);
  };

  const FilterSection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="mb-10">
      <h3 className="flex items-center gap-2 text-xs font-bold text-zinc-500 mb-4 tracking-widest uppercase font-sans">
        <Icon className="w-4 h-4 text-emerald-500/70" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {children}
      </div>
    </div>
  );

  const FilterButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode, key?: React.Key }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
        active 
          ? "bg-emerald-600/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
          : "bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:border-emerald-500/30 hover:bg-zinc-800 hover:text-emerald-300"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full lg:w-[340px] flex-shrink-0 bg-[#030604] border-r border-zinc-800/60 lg:h-screen p-8 pb-24 lg:pb-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-10 text-emerald-500">
         <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            <img 
              src="https://i.postimg.cc/HsKz3wQQ/logo-futbol-pro.png" 
              alt="FútbolPro Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
         </div>
         <h1 className="text-2xl font-display font-bold tracking-tight text-white">Fútbol<span className="text-emerald-500">Pro</span></h1>
      </div>

      <div className="mb-8 p-5 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 shadow-inner">
         <p className="text-sm text-zinc-400 leading-relaxed font-medium">
            Selecciona múltiples filtros para encontrar la actividad perfecta para tu sesión de entrenamiento.
         </p>
      </div>

      <div className="mb-10">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowFavoritesOnly(!showFavoritesOnly);
          }}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all duration-300 border cursor-pointer",
            showFavoritesOnly
              ? "bg-amber-500/10 border-amber-500/45 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              : "bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:border-amber-500/30 hover:bg-zinc-850 hover:text-amber-300"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Star className={cn("w-5 h-5 transition-transform duration-300", showFavoritesOnly ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]" : "text-zinc-500")} />
            <span>Mis Favoritos</span>
          </div>
          <span className={cn(
            "text-xs px-2.5 py-0.5 rounded-full font-mono font-bold",
            showFavoritesOnly ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500"
          )}>
            {favoritesCount}
          </span>
        </button>
      </div>

      <FilterSection title="Categoría (Edad)" icon={Users}>
        {AGE_OPTIONS.map(age => (
          <FilterButton 
            key={age} 
            active={selectedAges.includes(age)} 
            onClick={() => toggleArray(selectedAges, age, setSelectedAges)}
          >
            {age}
          </FilterButton>
        ))}
      </FilterSection>

      <FilterSection title="Dificultad Técnica" icon={Signal}>
        {DIFFICULTY_OPTIONS.map(diff => (
          <FilterButton 
            key={diff.value} 
            active={selectedDifficulties.includes(diff.value)} 
            onClick={() => toggleArray(selectedDifficulties, diff.value, setSelectedDifficulties)}
          >
            {diff.label}
          </FilterButton>
        ))}
      </FilterSection>

      <FilterSection title="Enfoque del Ejercicio" icon={Filter}>
        {TYPE_OPTIONS.map(type => (
          <FilterButton 
            key={type.value} 
            active={selectedTypes.includes(type.value)} 
            onClick={() => toggleArray(selectedTypes, type.value, setSelectedTypes)}
          >
            {type.label}
          </FilterButton>
        ))}
      </FilterSection>

      {/* Clear Filters */}
      {(selectedAges.length > 0 || selectedDifficulties.length > 0 || selectedTypes.length > 0 || showFavoritesOnly) && (
          <button 
             type="button"
             onClick={(e) => {
                 e.preventDefault();
                 setSelectedAges([]);
                 setSelectedDifficulties([]);
                 setSelectedTypes([]);
                 setShowFavoritesOnly(false);
             }}
             className="w-full py-3.5 mt-4 text-sm font-bold text-zinc-400 bg-zinc-900/50 border border-zinc-800/80 rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer"
          >
              Limpiar Filtros
          </button>
      )}

    </div>
  );
}
