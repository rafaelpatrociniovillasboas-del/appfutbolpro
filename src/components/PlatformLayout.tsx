import React, { useState } from 'react';
import { 
  Library, 
  CalendarDays, 
  Dumbbell, 
  Users, 
  TrendingUp, 
  ClipboardCheck, 
  DollarSign, 
  Coins,
  MessageSquare, 
  UserPlus, 
  Store, 
  LayoutDashboard, 
  Sparkles,
  Menu,
  X,
  CreditCard,
  FileBarChart,
  Bot,
  ShieldAlert,
  Smartphone,
  Lock,
  Unlock,
  Key,
  Settings,
  UserCheck,
  BookOpen,
  Flame,
  Tag,
  ChevronRight,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import * as motion from 'motion/react-client';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { pushUserDataToCloud, getCurrentUserIdentifier } from '../lib/cloudSync';
import { useSettings } from '../lib/useSettings';
import { CurrencyModal } from './CurrencyModal';

export type ModuleId = 
  | 'dashboard' 
  | 'library' 
  | 'planner' 
  | 'builder' 
  | 'crm' 
  | 'evolution' 
  | 'attendance' 
  | 'finance' 
  | 'billing' 
  | 'communication' 
  | 'leads' 
  | 'marketplace'
  | 'personal'
  | 'reports'
  | 'ai'
  | 'logs'
  | 'install'
  | 'tutorial';

interface PlatformLayoutProps {
  children: React.ReactNode;
  activeModule: ModuleId | string;
  onNavigate: (module: ModuleId | string) => void;
  userRole?: 'admin' | 'teacher';
  onChangeRole?: (role: 'admin' | 'teacher') => void;
}

export function PlatformLayout({ 
  children, 
  activeModule, 
  onNavigate,
  userRole = 'admin',
  onChangeRole
}: PlatformLayoutProps) {
  const settings = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  const modules = [
    { id: 'dashboard', label: 'Panel Ejecutivo', icon: LayoutDashboard, category: 'Gestión' },
    { id: 'library', label: 'Biblioteca Inteligente', icon: Library, category: 'Entrenamiento' },
    { id: 'planner', label: 'Planificador de Temporada', icon: CalendarDays, category: 'Entrenamiento' },
    { id: 'builder', label: 'Creador de Entrenamientos', icon: Dumbbell, category: 'Entrenamiento' },
    
    { id: 'crm', label: 'Gestión de Jugadores', icon: Users, category: 'Jugadores' },

    { id: 'finance', label: 'Gestión Financiera', icon: DollarSign, category: 'Administración' },
    { id: 'billing', label: 'Cobro Automático', icon: CreditCard, category: 'Administración' },
    { id: 'currency', label: 'Configurar Moneda', icon: Coins, category: 'Administración' },

    { id: 'ai', label: 'IA Ejecutiva (Copilot)', icon: Bot, category: 'Inteligencia', highlight: true },

    { id: 'install', label: 'Instalar App', icon: Smartphone, category: 'Sistema' },
    { id: 'tutorial', label: 'Tutorial del Entrenador', icon: BookOpen, category: 'Sistema' },
  ];

  const filteredModules = modules;

  const categories = Array.from(new Set(filteredModules.map(m => m.category)));

  const handleNav = (id: string) => {
    if (id === 'currency') {
      setIsCurrencyModalOpen(true);
      setMobileMenuOpen(false);
      return;
    }
    onNavigate(id);
    setMobileMenuOpen(false);
  }

  return (
    <div className="fixed inset-0 flex bg-[#050a07] text-slate-200 overflow-hidden font-sans overscroll-none">
      
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between px-4 z-30">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-left focus:outline-none">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="https://i.postimg.cc/HsKz3wQQ/logo-futbol-pro.png" alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-white">Fútbol<span className="text-emerald-500">Pro</span></span>
        </button>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-zinc-400 hover:text-white">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/60 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 lg:p-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-emerald-500/10 shadow-lg">
              <img src="https://i.postimg.cc/HsKz3wQQ/logo-futbol-pro.png" alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg lg:text-xl text-white leading-none">
                Fútbol<span className="text-emerald-500">Pro</span>
              </h1>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-zinc-800 pb-24 lg:pb-6">
          {/* Highlighted VIP Offers Card - Top of Navigation */}
          <div className="mb-5">
            <button
              onClick={() => handleNav('marketplace')}
              className={cn(
                "w-full text-left p-3 rounded-xl border transition-all duration-300 relative overflow-hidden group cursor-pointer shadow-lg",
                activeModule === 'marketplace'
                  ? "bg-gradient-to-br from-amber-500/20 via-zinc-900 to-amber-950/40 border-amber-400/80 shadow-amber-500/10 ring-1 ring-amber-400/30"
                  : "bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-zinc-950 border-amber-500/30 hover:border-amber-400/70 hover:from-amber-500/15 hover:shadow-amber-500/10 shadow-black/40"
              )}
            >
              {/* Glow Accent Background */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div className="flex items-center justify-between mb-1.5 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-black uppercase font-mono tracking-wider text-amber-400">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                  Ofertas VIP
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border transition-colors shrink-0",
                    activeModule === 'marketplace'
                      ? "bg-amber-500/20 border-amber-400/50 text-amber-300"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400/40"
                  )}>
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-xs font-display font-black tracking-tight leading-tight group-hover:text-amber-300 transition-colors",
                      activeModule === 'marketplace' ? "text-amber-300" : "text-white"
                    )}>
                      Mis Ofertas & Packs
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-medium leading-none mt-0.5">
                      Packs y recursos exclusivos
                    </p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-0.5 shrink-0",
                  activeModule === 'marketplace' && "text-amber-300"
                )} />
              </div>
            </button>
          </div>

          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {filteredModules.filter(m => m.category === category).map((module) => {
                  const Icon = module.icon;
                  const isActive = activeModule === module.id;
                  const isCurrency = module.id === 'currency';
                  return (
                    <button
                      key={module.id}
                      onClick={() => handleNav(module.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer",
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border py-2 px-2.5 border-emerald-500/20" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900",
                        module.highlight && !isActive && "text-emerald-500/70 hover:text-emerald-400"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300", module.highlight && "text-emerald-500", isCurrency && "text-emerald-400")} />
                        <span className="truncate">{module.label}</span>
                      </div>

                      {isCurrency && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
                          <span>{settings.currencyFlag || '🌎'}</span>
                          <span>{settings.currencyIso || 'USD'}</span>
                        </span>
                      )}

                      {module.highlight && (
                        <div className="ml-auto flex items-center justify-center">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legacy Bonuses Section inside Sidebar */}
          <div className="mb-6">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Contenido Extra
            </h3>
            <div className="space-y-1">
                {[
                  { id: 'bonus1', label: '100 Sesiones Listas' },
                  { id: 'bonus2', label: 'Planificación Anual' }
                ].map(bonus => (
                  <button
                    key={bonus.id}
                    onClick={() => handleNav(bonus.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      activeModule === bonus.id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                    )}
                  >
                    <span className="truncate">{bonus.label}</span>
                  </button>
                ))}
            </div>
          </div>
          
          {/* Suporte Widget */}
          <div className="px-3 mb-4 mt-auto">
            <a 
              href="https://api.whatsapp.com/send?phone=5521966225174&text=Ol%C3%A1%2C%20gostaria%20de%20atendimento%20da%20plataforma%20F%C3%BAtbolPro!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/15 rounded-xl group transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Soporte WhatsApp</span>
                <span className="text-xs text-zinc-300 font-bold block truncate">+55 21 96622-5174</span>
              </div>
            </a>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/20 text-emerald-400 font-bold shrink-0">
              {(() => {
                const activeUser = auth.currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('drillforge_guest_user') || 'null') : null);
                return activeUser?.email ? activeUser.email.substring(0, 2).toUpperCase() : 'TR';
              })()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">
                {(() => {
                  const activeUser = auth.currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('drillforge_guest_user') || 'null') : null);
                  return activeUser?.email?.split('@')[0] || 'Entrenador Invitado';
                })()}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {(() => {
                  const activeUser = auth.currentUser || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('drillforge_guest_user') || 'null') : null);
                  return activeUser?.email || 'Modo Offline Activo';
                })()}
              </p>
            </div>
          </div>

          {/* Profile Role Indicator */}
          <div className="pt-2.5 border-t border-zinc-900/60 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Acceso</span>
            <span className="text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Director / Entrenador
            </span>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/20 rounded-xl text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-all text-center cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:w-[calc(100%-18rem)] overflow-y-auto lg:mt-0 mt-16 pb-24 lg:pb-0 scrollbar-thin scrollbar-thumb-zinc-800 bg-[#050a07] overscroll-y-none touch-pan-y">
        {children}
      </main>

      {/* Mobile Navigation Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 flex items-center justify-around px-2 z-30 pb-safe shadow-2xl">
        {[
          { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
          { id: 'crm', label: 'Jugadores', icon: Users },
          { id: 'library', label: 'Entrenamientos', icon: Library },
          { id: 'finance', label: 'Finanzas', icon: DollarSign },
          { id: 'billing', label: 'Mensualidades', icon: CreditCard },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all focus:outline-none",
                isActive ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all mb-0.5",
                isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-transparent text-zinc-500"
              )}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Currency Modal for LATAM selector */}
      <CurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
      />

      {/* Modern, non-blocking state confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl relative"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-white">¿Cerrar sesión en Fútbol<span className="text-emerald-500">Pro</span>?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Toda tu información y entrenamientos guardados permanecerán almacenados de forma segura en este navegador para tu próximo acceso.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const user = getCurrentUserIdentifier();
                    if (user.uid) {
                      await pushUserDataToCloud(user.uid, user.email);
                    }
                  } catch (e) {}
                  localStorage.removeItem('drillforge_guest_user');
                  signOut(auth).then(() => {
                    window.location.reload();
                  }).catch(() => {
                    window.location.reload();
                  });
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Confirmar Cierre
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
