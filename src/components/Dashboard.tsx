import { Play, Package, ArrowRight, Video, Calendar, Monitor, CloudRain, Phone, MessageSquare } from 'lucide-react';
import * as motion from 'motion/react-client';
import { ReactNode } from 'react';

type DashboardProps = {
  onNavigate: (view: 'drills' | 'bonus1' | 'bonus2') => void;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#050a07] text-slate-200 font-sans p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 border-b border-zinc-800/60 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-emerald-500/10 shadow-lg">
              <img 
                src="https://i.postimg.cc/HsKz3wQQ/logo-futbol-pro.png" 
                alt="FútbolPro Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PANEL</span>
                <span className="text-zinc-500 text-[10px] font-mono">v1.2.0</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight mt-0.5">
                Fútbol<span className="text-emerald-500">Pro</span>
              </h1>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Área del Alumno</span>
            <p className="text-zinc-300 font-medium text-base mt-0.5">¡Bienvenido(a)! Toca para acceder a las sesiones.</p>
          </div>
        </header>

        <section className="mb-16">
          <h2 className="text-xs tracking-widest uppercase text-emerald-500 font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Producto Principal
          </h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onNavigate('drills')}
            className="group cursor-pointer bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-emerald-500/20 hover:border-emerald-500/50 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden transition-all duration-300"
          >
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-80 aspect-[16/10] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/80 shrink-0 shadow-lg">
                <img 
                  src="https://i.postimg.cc/nr2QZpgv/capa-principal-biblioteca.png" 
                  alt="Biblioteca General de Entrenamientos" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 inline-block mb-3.5">
                  Acceso Vitalicio Habilitado
                </span>
                <h3 className="text-3xl font-display font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">1000 Entrenamientos Profesionales</h3>
                <p className="text-zinc-400 text-base lg:text-lg leading-relaxed max-w-2xl">
                  Nuestra biblioteca completa con 1000 ejercicios enfocados en calentamiento, regate, pase, finalización y mucho más. Usa los filtros inteligentes para encontrar el entrenamiento ideal para tu sesión de hoy.
                </p>
                <div className="mt-5 flex items-center gap-2 text-zinc-500 group-hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-widest">
                  Entrar en la Biblioteca <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="shrink-0 hidden lg:block">
                <div className="w-14 h-14 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center transition-colors shadow-lg shadow-emerald-950">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section>
          <h2 className="text-xs tracking-widest uppercase text-emerald-500 font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Tus Bonos Exclusivos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <BonusCard 
              index={0}
              icon={<Video className="w-4 h-4 text-emerald-400" />}
              image="https://i.postimg.cc/wjJTcWvs/Bonus-01-site.png"
              title="100 Sesiones de Entrenamiento Listas"
              description="Sesiones completas y estructuradas desde el calentamiento hasta el partido, listas para aplicar."
              onClick={() => onNavigate('bonus1')}
            />
            
            <BonusCard 
              index={1}
              icon={<Calendar className="w-4 h-4 text-emerald-400" />}
              image="https://i.postimg.cc/k5q9Nqzj/planejamento-anual.png"
              title="Planificación Anual para Academias"
              description="Un cronograma completo de qué entrenar cada semana del año para las categorías formativas."
              onClick={() => onNavigate('bonus2')}
            />
            
          </div>
        </section>

        {/* Canal de Atención (Soporte WhatsApp) */}
        <section className="mt-16 pt-8 border-t border-zinc-850">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-emerald-950/20 to-zinc-950/80 border border-emerald-500/10 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Soporte Directo</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] text-emerald-400 font-medium">En Línea</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mt-1.5">Canal de Atención en WhatsApp</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mt-1 max-w-xl">
                  ¿Dudas con entrenamientos, bonos, pagos o problemas de acceso? Contacta a nuestro equipo de soporte por WhatsApp: <strong className="text-white">+55 (21) 96622-5174</strong>
                </p>
              </div>
            </div>
            
            <a 
              href="https://api.whatsapp.com/send?phone=5521966225174&text=Hola%2C%20quisiera%20atenci%C3%B3n%20sobre%20la%20plataforma%20F%C3%BAtbolPro!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer"
            >
              Contactar en WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function BonusCard({ title, description, icon, image, onClick, index }: { title: string, description: string, icon: ReactNode, image: string, onClick: () => void, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + (index * 0.05) }}
      onClick={onClick}
      className="group cursor-pointer bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300 flex flex-col h-full hover:bg-zinc-900/30"
    >
      <div className="relative aspect-[16/9] w-full bg-zinc-900 rounded-xl overflow-hidden mb-4 border border-zinc-800 grid place-items-stretch">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 w-8 h-8 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-lg flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-zinc-400 text-sm flex-1 leading-relaxed">{description}</p>
      
      <div className="mt-5 flex items-center text-zinc-500 group-hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-widest pt-4 border-t border-zinc-900">
        Acceder al bono <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}
