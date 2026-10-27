import React, { useEffect } from 'react';
import { Drill } from '../types';
import { X, Clock, HelpCircle, AlertCircle, Target, Users, Layers, Star, Plus, Download } from 'lucide-react';
import * as motion from 'motion/react-client';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { generateDrillPDF } from '../lib/pdf';

interface DrillModalProps {
  drill: Drill | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function DrillModal({ drill, onClose, isFavorite, onToggleFavorite }: DrillModalProps) {
  const { addToast } = useToast();

  useEffect(() => {
    if (drill) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [drill]);

  if (!drill) return null;

  const handleExportPDF = () => {
    generateDrillPDF(drill);
    addToast('Ejercicio exportado en PDF.', 'success');
  };

  const handleAddToPlan = () => {
    addToast('Añadido a la planificación de la temporada.', 'success');
  };  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] p-2 sm:p-4 lg:p-6 flex items-center justify-center overflow-hidden">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#030604]/90 backdrop-blur-md"
        />
        
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-3xl bg-[#070c09] rounded-2xl sm:rounded-[2rem] border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.7)] max-h-[85vh] sm:max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar flex flex-col z-10"
        >
          {/* Sticky Close / Favorite Controls */}
          <div className="sticky top-2 right-2 sm:top-4 sm:right-4 z-30 flex justify-end gap-2 px-3 sm:px-6 pt-2 sm:pt-3 pointer-events-none -mb-12 sm:-mb-14">
            <button 
               onClick={onToggleFavorite}
               className="pointer-events-auto p-2 sm:p-2.5 text-zinc-400 hover:text-white bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-800 rounded-full transition-all duration-200 shadow-xl cursor-pointer backdrop-blur-md"
               aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
               title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
             >
              <Star className={cn("h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200", isFavorite ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-zinc-500 hover:text-amber-400")} />
            </button>

            <button 
               onClick={onClose}
               className="pointer-events-auto p-2 sm:p-2.5 text-zinc-400 hover:text-white bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-800 rounded-full transition-all duration-200 shadow-xl cursor-pointer backdrop-blur-md"
               aria-label="Cerrar modal"
             >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Header Section (Unified scroll) */}
          <div className="relative px-4 pt-8 pb-6 sm:px-10 sm:pt-12 sm:pb-10 overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent border-b border-zinc-800/60">
             {/* Abstract background glow */}
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
             
             <div className="relative z-10 pr-12 sm:pr-24">
                 <div className="flex flex-wrap gap-2 mb-3 sm:mb-6">
                    <span className="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800/80 px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {drill.difficulty}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {drill.type}
                    </span>
                 </div>
                 <h2 className="text-xl sm:text-4xl font-display font-bold mb-2 sm:mb-4 tracking-tight text-white leading-tight">{drill.title}</h2>
                 <p className="text-zinc-400 text-xs sm:text-base leading-relaxed max-w-2xl">{drill.description}</p>
                 
                 <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-4 sm:mt-8">
                     <button onClick={handleAddToPlan} className="flex items-center justify-center gap-2 bg-emerald-500 text-[#050a07] px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer text-xs sm:text-base">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Añadir a la Planificación
                     </button>
                     <button onClick={handleExportPDF} className="flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors cursor-pointer text-xs sm:text-base">
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Descargar PDF
                     </button>
                 </div>
             </div>
          </div>

          {/* Body Content Section (Continuous flow) */}
          <div className="w-full bg-[#0a0f0d]/60 px-6 py-8 sm:px-10 sm:py-10 space-y-10">
             {/* Info Row */}
             <div className="flex flex-wrap gap-6 sm:gap-10 border-b border-zinc-800/60 pb-8 sm:pb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner shrink-0">
                        <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Duración</p>
                        <p className="text-sm font-semibold text-zinc-200">{drill.durationMinutes} minutos</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner shrink-0">
                        <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Categorías</p>
                        <p className="text-sm font-semibold text-zinc-200">{drill.ageCategory.join(', ')}</p>
                    </div>
                </div>
             </div>

             {/* Setup */}
             <section>
                 <h3 className="flex items-center gap-3 text-base sm:text-lg font-display font-bold text-white mb-4">
                    <Target className="w-5 h-5 text-emerald-500" /> Organización
                 </h3>
                 <ul className="space-y-3 bg-zinc-900/40 p-5 sm:p-6 rounded-2xl border border-zinc-800/80 shadow-inner">
                    {drill.setup.map((item, i) => (
                      <li key={i} className="text-zinc-300 text-sm sm:text-base flex items-start gap-3 leading-relaxed">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 mt-2 flex-shrink-0" />
                         {item}
                      </li>
                    ))}
                 </ul>
             </section>

             {/* Instructions */}
             <section>
                 <h3 className="flex items-center gap-3 text-base sm:text-lg font-display font-bold text-white mb-5">
                    <HelpCircle className="w-5 h-5 text-emerald-500" /> Ejecución
                 </h3>
                 <ul className="space-y-3 sm:space-y-4">
                     {drill.instructions.map((inst, i) => (
                         <li key={i} className="flex gap-4 text-zinc-300 text-sm sm:text-base leading-relaxed bg-zinc-900/30 p-4 sm:p-5 rounded-2xl border border-zinc-800/50">
                             <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mt-0.5">
                                 {i + 1}
                             </span>
                             <span className="pt-0.5">{inst}</span>
                         </li>
                     ))}
                 </ul>
             </section>

             {/* Coaching Points */}
             <section className="bg-emerald-950/20 border border-emerald-900/30 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/80" />
                 <h3 className="flex items-center gap-3 text-base sm:text-lg font-display font-bold text-emerald-400 mb-4">
                    <AlertCircle className="w-5 h-5 text-emerald-500" /> Puntos Clave de Corrección
                 </h3>
                 <ul className="space-y-3 sm:space-y-4">
                     {drill.coachingPoints.map((point, i) => (
                         <li key={i} className="flex gap-3 text-emerald-100/80 text-sm sm:text-base leading-relaxed">
                            <span className="text-emerald-500 font-black mt-0.5 opacity-60">•</span> {point}
                         </li>
                     ))}
                 </ul>
             </section>

             {/* Variations */}
             {drill.variations && drill.variations.length > 0 && (
                 <section className="bg-zinc-900/40 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-600/50" />
                     <h3 className="flex items-center gap-3 text-base sm:text-lg font-display font-bold text-zinc-300 mb-4">
                        <Layers className="w-5 h-5 text-zinc-500" /> Variaciones
                     </h3>
                     <ul className="space-y-3 sm:space-y-4">
                         {drill.variations.map((varItem, i) => (
                             <li key={i} className="flex gap-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
                                <span className="text-zinc-600 font-black mt-0.5">•</span> {varItem}
                             </li>
                         ))}
                     </ul>
                 </section>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
