import React, { useState, useEffect } from 'react';
import { Download, FileText, BarChart, Users, DollarSign, Filter, ChevronRight } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useToast } from './Toast';
import { getAthletes, Athlete } from '../lib/athleteStore';
import { 
  generateAthleteReportPDF, 
  generateCategoryAttendancePDF, 
  generateCategoryEvolutionPDF, 
  generateCategoryBillingPDF 
} from '../lib/pdf';

export function ReportsModule({ inline }: { inline?: boolean }) {
  const { addToast } = useToast();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedAthleteId, setSelectedAthleteId] = useState<number>(1);

  useEffect(() => {
    // Fetch live athletes on mount or load
    const reload = () => {
      const fetched = getAthletes();
      setAthletes(fetched);
      if (fetched.length > 0) {
        setSelectedAthleteId(prev => {
          const exists = fetched.find(a => a.id === prev);
          return exists ? exists.id : fetched[0].id;
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

  // Filter athletes matching category
  const filteredAthletes = athletes.filter(a => selectedCategory === 'Todos' || a.category === selectedCategory);
  
  // Find currently selected individual athlete
  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId) || (athletes.length > 0 ? athletes[0] : null);

  const handleDownload = (type: string) => {
    try {
      if (athletes.length === 0) {
        addToast('Ningún jugador registrado para compilar reportes.', 'error');
        return;
      }

      if (type === 'Asistencia Mensual') {
        const categoryList = filteredAthletes;
        if (categoryList.length === 0) {
          addToast(`Ningún jugador activo en la categoría ${selectedCategory}.`, 'info');
          return;
        }
        generateCategoryAttendancePDF(selectedCategory, categoryList);
        addToast(`¡Asistencia Mensual de ${selectedCategory} generada con éxito!`, 'success');
      } 
      
      else if (type === 'Evolución Técnica') {
        const categoryList = filteredAthletes;
        if (categoryList.length === 0) {
          addToast(`Ningún jugador de ${selectedCategory} para compilar promedios de evolución.`, 'info');
          return;
        }
        generateCategoryEvolutionPDF(selectedCategory, categoryList);
        addToast(`¡PDF de Evolución Técnica de la categoría ${selectedCategory} generado!`, 'success');
      } 
      
      else if (type === 'Morosidad') {
        const categoryList = filteredAthletes;
        if (categoryList.length === 0) {
          addToast(`Ninguna deuda pendiente en la categoría ${selectedCategory}.`, 'info');
          return;
        }
        generateCategoryBillingPDF(selectedCategory, categoryList);
        addToast(`¡Reporte de Morosidad del CRM para ${selectedCategory} generado!`, 'success');
      } 
      
      else if (type === 'Ficha del Jugador') {
        if (!selectedAthlete) {
          addToast('Seleccione primero un jugador para generar la ficha técnica.', 'error');
          return;
        }
        generateAthleteReportPDF(selectedAthlete);
        addToast(`¡Ficha técnica individual de ${selectedAthlete.name} generada con éxito!`, 'success');
      }
    } catch (e) {
      console.error(e);
      addToast(`Error al exportar PDF: ${e instanceof Error ? e.message : 'Verifique los logs.'}`, 'error');
    }
  };

  const content = (
    <>
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 ${inline ? 'hidden' : ''}`}>
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Generador de Reportes</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1 font-sans">Extrae plantillas y reportes inteligentes basados en la base de datos del CRM de Jugadores.</p>
        </div>
      </header>

      {inline && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Reportes Integrados CRM</h2>
          <p className="text-sm font-medium text-zinc-500 mt-1 font-sans">Extrae estadísticas y fichas deportivas utilizando datos dinámicos de las sesiones de entrenamiento.</p>
        </div>
      )}

      {/* Selectors panel */}
      <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Filtrar Categoría para Reportes de Plantilla
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="Todos" className="bg-zinc-900 text-white">Todas las Categorías (Consolidado)</option>
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
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Seleccionar Jugador para Ficha Individual
            </label>
            <div className="relative">
              <select
                value={selectedAthleteId}
                onChange={e => setSelectedAthleteId(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
              >
                {athletes.map(a => (
                  <option key={a.id} value={a.id} className="bg-zinc-900 text-white">{a.name} ({a.category})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-auto text-center md:text-right shrink-0">
          <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl px-4 py-2.5 font-bold">
            Live Sync: {filteredAthletes.length} jugadores seleccionados
          </div>
        </div>
      </div>

      {/* Reports Catalog Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
        {[
          { 
            title: 'Asistencia Mensual', 
            desc: `Asistencias de ${selectedCategory} compiladas a partir del pase de lista digital.`, 
            icon: Users, 
            color: 'text-blue-400', 
            bg: 'bg-blue-500/10',
            buttonLabel: `Descargar Asistencia (${selectedCategory})`
          },
          { 
            title: 'Evolución Técnica', 
            desc: `Control promedio de calificaciones y progreso táctico/físico de ${selectedCategory}.`, 
            icon: BarChart, 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-500/10',
            buttonLabel: `Descargar Evolución (${selectedCategory})`
          },
          { 
            title: 'Morosidad', 
            desc: `Estado de morosidad y cobros de ${selectedCategory} actualizados en vivo.`, 
            icon: DollarSign, 
            color: 'text-rose-400', 
            bg: 'bg-rose-500/10',
            buttonLabel: `Descargar Cobros (${selectedCategory})`
          },
          { 
            title: 'Ficha del Jugador', 
            desc: selectedAthlete ? `Genera la ficha técnica completa estructurada de ${selectedAthlete.name}.` : 'Historial biográfico de calificaciones y asistencia individual.', 
            icon: FileText, 
            color: 'text-amber-400', 
            bg: 'bg-amber-500/10',
            buttonLabel: selectedAthlete ? `Descargar Ficha ${selectedAthlete.name.split(' ')[0]}` : 'Generar Ficha'
          },
        ].map((report, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            key={i} 
            className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
          >
            <div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${report.bg}`}>
                <report.icon className={`w-5.5 h-5.5 ${report.color}`} />
              </div>
              <h3 className="font-bold text-white text-md mb-1.5">{report.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 block font-sans min-h-[40px]">{report.desc}</p>
            </div>
            <button 
              onClick={() => handleDownload(report.title)} 
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white py-2 px-3 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-[#050a07]"
            >
              <Download className="w-3.5 h-3.5" /> {report.buttonLabel}
            </button>
          </motion.div>
        ))}
      </div>
    </>
  );

  return inline ? <div>{content}</div> : <div className="p-6 lg:p-10 max-w-7xl mx-auto">{content}</div>;
}
