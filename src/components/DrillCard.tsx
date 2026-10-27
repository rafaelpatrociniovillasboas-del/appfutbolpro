import React from 'react';
import { Drill } from '../types';
import { Clock, Tag, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import * as motion from 'motion/react-client';

interface DrillCardProps {
  drill: Drill;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  key?: React.Key;
}

export function DrillCard({ drill, onClick, isFavorite, onToggleFavorite }: DrillCardProps) {
  
  const difficultyColors: Record<string, string> = {
    'Iniciante': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Principiante': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Intermediário': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Intermedio': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Avançado': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Avanzado': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer group relative flex flex-col items-start justify-between rounded-3xl border border-zinc-800/80 bg-[#070c09] shadow-lg transition-all hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)] h-full overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.03] before:to-transparent before:pointer-events-none"
      )}
    >
      <div className="p-7 w-full flex flex-col flex-1 relative z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-6 right-6 z-20 w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 hover:border-amber-500/40 hover:bg-zinc-800/80 transition-all duration-300 shadow-md group/star cursor-pointer"
          title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Star 
            className={cn(
              "w-4.5 h-4.5 transition-all duration-300", 
              isFavorite 
                ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.45)]" 
                : "text-zinc-500 group-hover/star:text-amber-400 group-hover/star:scale-110"
            )} 
          />
        </button>

        <div className="flex flex-wrap gap-2.5 justify-between items-start mb-5 pr-10">
          <span className={cn(
            "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold border flex-shrink-0",
            difficultyColors[drill.difficulty]
          )}>
            {drill.difficulty}
          </span>
          <span className="inline-flex items-center rounded-lg bg-zinc-900 border border-zinc-850 px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold text-zinc-400 flex-shrink-0">
            {drill.type}
          </span>
        </div>
        <h3 className="text-xl font-display font-bold text-white leading-tight mb-3 group-hover:text-emerald-400 transition-colors block w-full">
          {drill.title}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-3 mb-6 leading-relaxed">
          {drill.description}
        </p>

        <div className="mt-auto flex items-center gap-4 text-xs font-medium text-zinc-500 w-full pt-5 border-t border-zinc-800/60">
          <div className="flex items-center gap-1.5 flex-shrink-0 bg-zinc-900/50 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-emerald-500/70" />
            {drill.durationMinutes} min
          </div>
          <div className="flex flex-wrap gap-1.5">
             {drill.ageCategory.slice(0, 2).map(cat => (
               <span key={cat} className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider bg-zinc-900 border border-zinc-800 rounded-md px-1.5 py-0.5">
                 {cat}
               </span>
             ))}
             {drill.ageCategory.length > 2 && (
               <span className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider bg-zinc-900 border border-zinc-800 rounded-md px-1.5 py-0.5">
                 +{drill.ageCategory.length - 2}
               </span>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
