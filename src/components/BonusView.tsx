import { ArrowLeft, ArrowRight, FileText, Calendar, Gamepad2, CloudRain, Lock, Search, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import * as motion from 'motion/react-client';
import { ReactNode, FC, useState, useEffect } from 'react';
import { getBonusDetail, BonusContentData } from '../bonusData';

const BONUS_IMAGES: Record<string, string> = {
  bonus1: 'https://i.postimg.cc/wjJTcWvs/Bonus-01-site.png',
  bonus2: 'https://i.postimg.cc/k5q9Nqzj/planejamento-anual.png',
  bonus3: 'https://i.postimg.cc/4drX9VGg/bonus-brincadeiras-jogos.png',
  bonus4: 'https://i.postimg.cc/7L5vnhmk/treino-diade-chuva.png',
};

type BonusProps = {
  id: string;
  title: string;
  onBack: () => void;
};

export function BonusView({ id, title, onBack }: BonusProps) {
  const [selectedItem, setSelectedItem] = useState<{ title: string; description: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination and search whenever selection changes
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [selectedItem]);

  const renderContent = () => {
    switch (id) {
      case 'bonus1':
        return <Bonus1Content onSelect={setSelectedItem} />;
      case 'bonus2':
        return <Bonus2Content onSelect={setSelectedItem} />;
      case 'bonus3':
        return <Bonus3Content onSelect={setSelectedItem} />;
      case 'bonus4':
        return <Bonus4Content onSelect={setSelectedItem} />;
      default:
        return (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center mt-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
               <Lock className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">{title}</h2>
            <p className="text-zinc-400 text-lg max-w-lg mb-8">
               Este bonus se está preparando. ¡Mantente atento a tus notificaciones!
            </p>
          </div>
        );
    }
  };

  if (selectedItem) {
    const details = getBonusDetail(id, selectedItem.title, selectedItem.description);
    
    // Filter activities by search term
    const filteredActivities = details.activities.filter(act => 
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const itemsPerPage = 8;
    const totalItems = filteredActivities.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
      <div className="min-h-screen bg-[#050a07] text-slate-200 font-sans p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header Back Button */}
          <button 
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Módulos
          </button>

          {/* Main Title & Description */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 lg:p-10 shadow-2xl mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8 mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Contenido Disponible ({details.activities.length} Actividades)
                </span>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mt-3 mb-2">{details.title}</h2>
                <p className="text-zinc-400 text-base lg:text-lg leading-relaxed max-w-2xl">{details.description}</p>
              </div>
            </div>

            {/* Search Bar Segment */}
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 h-5 text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Busca por palabras clave o conceptos (ej: Calentamiento, Pase, Defensa)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset page to 1 on searching
                }}
                className="block w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
              />
            </div>

            {/* Pagination / Count Top Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 text-xs text-zinc-400 font-medium">
              <span>
                Mostrando <strong className="text-zinc-200">{filteredActivities.length > 0 ? startIndex + 1 : 0}</strong> a{' '}
                <strong className="text-zinc-200">{Math.min(startIndex + itemsPerPage, filteredActivities.length)}</strong> de{' '}
                <strong className="text-zinc-200">{filteredActivities.length}</strong> {filteredActivities.length === 1 ? 'actividad disponible' : 'actividades encontradas'}
              </span>
              {totalPages > 1 && (
                <span className="text-emerald-400">Página {currentPage} de {totalPages}</span>
              )}
            </div>

            {/* Activities List */}
            <div className="space-y-4">
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity, idx) => {
                  // Generate visual card identifier index
                  const displayId = activity.id.includes('-') 
                    ? activity.id.split('-').pop()?.replace('s', '').replace('game', '').replace('rain', '') 
                    : activity.id;

                  return (
                    <motion.div 
                      key={activity.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-zinc-900 hover:bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/30 transition-all rounded-2xl p-6 flex flex-col gap-4 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center shrink-0">
                            #{displayId}
                          </span>
                          <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {activity.title}
                          </h3>
                        </div>
                        <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full shrink-0">
                          {activity.type}
                        </span>
                      </div>

                      <p className="text-zinc-300 text-sm md:text-base leading-relaxed pl-1">
                        {activity.description}
                      </p>

                      <div className="flex items-center gap-4 pl-1 border-t border-zinc-800/60 pt-3 text-xs text-zinc-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Tiempo/Enfoque: <strong className="text-zinc-300">{activity.duration}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-500/70" />
                          <span className="text-zinc-500">Formato: <strong className="text-zinc-300">Práctico e Interactivo</strong></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-12 border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl text-center text-zinc-500">
                  Ningún resultado encontrado para la búsqueda "{searchTerm}". Intenta con otra palabra clave.
                </div>
              )}
            </div>

            {/* Pagination Controls Segment */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-zinc-900">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400 hover:border-zinc-700 transition-all font-medium flex items-center gap-1 text-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }).map((_, pageIdx) => {
                    const pageNum = pageIdx + 1;
                    // Max visible pages logic
                    if (totalPages > 6 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={pageNum} className="text-zinc-600 px-1">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400 hover:border-zinc-700 transition-all font-medium flex items-center gap-1 text-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const bannerImage = BONUS_IMAGES[id];

  return (
    <div className="min-h-screen bg-[#050a07] text-slate-200 font-sans p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
         <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 font-medium"
         >
            <ArrowLeft className="w-5 h-5" />
            Volver al Panel
         </button>
         
         <div className="flex flex-col md:flex-row gap-6 items-center bg-zinc-950 border border-zinc-800 rounded-3xl p-6 lg:p-8 mb-10 shadow-xl">
           {bannerImage && (
             <div className="w-full md:w-60 aspect-[16/10] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shrink-0">
               <img 
                 src={bannerImage} 
                 alt={title} 
                 className="w-full h-full object-cover" 
                 referrerPolicy="no-referrer"
               />
             </div>
           )}
           <div className="flex-1 text-center md:text-left">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Contenido Extra Disponible
              </span>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-white tracking-tight mt-3 mb-2">{title}</h1>
              <p className="text-zinc-400 text-sm lg:text-base leading-relaxed">
                Aprovecha todos los materiales estructurados y entrenamientos exclusivos listos para potenciar el rendimiento de tus equipos.
              </p>
           </div>
         </div>

         {renderContent()}
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  delay: number;
  onClick?: () => void;
};

const SectionCard: FC<SectionCardProps> = ({ title, description, icon, delay, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 rounded-2xl p-6 transition-all duration-300 flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-950 border border-zinc-700 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{title}</h3>
          <p className="text-zinc-400 text-sm hidden sm:block">{description}</p>
        </div>
      </div>
      <div className="shrink-0 w-10 h-10 bg-zinc-800 group-hover:bg-emerald-600 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors shadow-lg">
        <ArrowRight className="w-5 h-5" />
      </div>
    </motion.div>
  );
}

function Bonus1Content({ onSelect }: { onSelect: (item: {title: string, description: string}) => void }) {
  const modules = Array.from({ length: 10 }).map((_, i) => ({
    title: `Módulo ${i + 1}: ${['Iniciación', 'Fundamentos', 'Tácticas Básicas', 'Defensa Sólida', 'Ataque Rápido', 'Posesión de Balón', 'Transiciones', 'Físico con Balón', 'Porteros', 'Partidos Especiales'][i]}`,
    description: '10 sesiones completas, estructuradas desde el calentamiento hasta el partido final.',
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {modules.map((mod, i) => (
        <SectionCard 
          key={i} 
          delay={i * 0.05} 
          title={mod.title} 
          description={mod.description} 
          icon={<FileText className="w-6 h-6 text-emerald-500" />} 
          onClick={() => onSelect(mod)}
        />
      ))}
    </div>
  );
}

function Bonus2Content({ onSelect }: { onSelect: (item: {title: string, description: string}) => void }) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  return (
    <div>
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/10 border border-indigo-500/20 rounded-2xl p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
         <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Calendar className="w-10 h-10 text-indigo-400" />
         </div>
         <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">Visión General de la Planificación</h3>
            <p className="text-indigo-200/70 mb-4">Accede a la introducción y al cronograma anual táctico, técnico y físico macrociclo de toda la temporada.</p>
            <button 
              onClick={() => onSelect({ title: 'Visión Macro Anual', description: 'El cronograma anual táctico, técnico y físico detallado semana a semana para todas las categorías.' })}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors inline-flex"
            >
              <ArrowRight className="w-5 h-5" />
              Acceder a la Visión Anual
            </button>
         </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-4">Planificación por Mes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((m, i) => (
          <SectionCard 
            key={i} 
            delay={i * 0.03} 
            title={`Mes de ${m}`} 
            description="Sesiones y objetivos de entrenamiento del mes." 
            icon={<Calendar className="w-6 h-6 text-indigo-400" />} 
            onClick={() => onSelect({ title: `Cronograma: ${m}`, description: `Mesociclo y detalle de las semanas del mes de ${m}.` })}
          />
        ))}
      </div>
    </div>
  );
}

function Bonus3Content({ onSelect }: { onSelect: (item: {title: string, description: string}) => void }) {
  const packs = [
    { title: 'Rondos y Dinámicas Divertidas', desc: '100 juegos y variantes para calentamientos lúdicos con balón.' },
    { title: 'Carreras de Relevos y Agilidad', desc: '100 dinámicas competitivas para desarrollo psicomotriz y físico.' },
    { title: 'Desafíos de Precisión y Puntería', desc: '100 actividades gamificadas para dominar el pase y la definición.' },
    { title: 'Minipartidos Reducidos (2v2 a 4v4)', desc: '100 juegos reducidos con reglas adaptadas para pensar el juego.' },
    { title: 'Juegos Infantiles y Lúdicos', desc: '100 juegos para los más pequeños (Sub-7), centrados en diversión y motricidad.' },
  ];

  return (
    <div className="space-y-4">
      {packs.map((pack, i) => (
        <SectionCard 
          key={i} 
          delay={i * 0.05} 
          title={pack.title} 
          description={pack.desc} 
          icon={<Gamepad2 className="w-6 h-6 text-orange-500" />} 
          onClick={() => onSelect({ title: pack.title, description: pack.desc })}
        />
      ))}
    </div>
  );
}

function Bonus4Content({ onSelect }: { onSelect: (item: {title: string, description: string}) => void }) {
  const modules = [
    { title: 'Entrenamientos en Espacio Reducido', desc: 'Sesiones físicas y técnicas intensas en espacios limitados o bajo techo.' },
    { title: 'Futsal Adaptado', desc: 'Cómo adaptar rápidamente el entrenamiento de campo al pabellón indoor.' },
    { title: 'Pizarra y Táctica Práctica', desc: 'Dinámicas interactivas y charlas tácticas para vestuario o aula.' },
    { title: 'Coordinación, Core y Prevención', desc: 'Series de fortalecimiento del core y propiocepción sin necesidad de campo grande.' },
  ];

  return (
    <div className="space-y-4">
      {modules.map((mod, i) => (
        <SectionCard 
          key={i} 
          delay={i * 0.05} 
          title={mod.title} 
          description={mod.desc} 
          icon={<CloudRain className="w-6 h-6 text-teal-400" />} 
          onClick={() => onSelect({ title: mod.title, description: mod.desc })}
        />
      ))}
    </div>
  );
}
