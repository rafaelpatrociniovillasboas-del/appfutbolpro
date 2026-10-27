import React, { useState } from 'react';
import { Smartphone, Chrome, Apple, Share, Plus, BookOpen, ArrowRight } from 'lucide-react';

interface InstallAppModuleProps {
  onNavigate?: (module: string) => void;
}

export function InstallAppModule({ onNavigate }: InstallAppModuleProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios-safari' | 'ios-chrome'>('android');

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Instalar App en el Móvil</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Sigue el paso a paso para añadir FútbolPro a la pantalla de inicio de tu dispositivo y usarlo como una app nativa.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8 shadow-xl">
        <div className="flex overflow-x-auto border-b border-zinc-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 min-w-[150px] py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'android' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Android (Chrome)
          </button>
          <button
            onClick={() => setActiveTab('ios-safari')}
            className={`flex-1 min-w-[150px] py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'ios-safari' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800/50'
            }`}
          >
            <Apple className="w-4 h-4" />
            iPhone (Safari)
          </button>
          <button
            onClick={() => setActiveTab('ios-chrome')}
            className={`flex-1 min-w-[150px] py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'ios-chrome' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800/50'
            }`}
          >
            <Chrome className="w-4 h-4" />
            iPhone (Chrome)
          </button>
        </div>

        <div className="p-6 md:p-8 bg-zinc-950/20">
          {activeTab === 'android' && (
            <div className="space-y-6 sm:px-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-zinc-800 pb-4">
                <Chrome className="w-6 h-6 text-emerald-500" />
                Google Chrome en Android
              </h2>
              <ol className="space-y-5">
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">1</div>
                  <div className="pt-1">Abre <strong>Google Chrome</strong> en tu móvil.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">2</div>
                  <div className="pt-1">Accede a la página de la aplicación que deseas añadir a la pantalla de inicio.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">3</div>
                  <div className="pt-1">Toca el icono de <strong>tres puntos</strong> en la esquina superior derecha del navegador.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">4</div>
                  <div className="pt-1">En el menú desplegable, pulsa en <strong>"Añadir a la pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong>.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">5</div>
                  <div className="pt-1">Si lo deseas, renombra el acceso directo y pulsa en <strong>"Añadir"</strong> para finalizar.</div>
                </li>
              </ol>
              <div className="mt-8 flex items-center justify-center bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                <img 
                  src="https://i.postimg.cc/y8C0jkHc/tela-inicial-google-chrome.png" 
                  alt="Demostración Chrome Android" 
                  className="rounded-xl shadow-xl shadow-black/50 max-w-full h-auto max-h-[500px] object-contain border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {activeTab === 'ios-safari' && (
            <div className="space-y-6 sm:px-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-zinc-800 pb-4">
                <Apple className="w-6 h-6 text-emerald-500" />
                Safari en iPhone / iPad
              </h2>
              <ol className="space-y-5">
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">1</div>
                  <div className="pt-1">Abre el navegador <strong>Safari</strong> en tu dispositivo.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">2</div>
                  <div className="pt-1">Accede a FútbolPro desde el enlace de tu escuela.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">3</div>
                  <div className="pt-1">En la barra inferior, toca el botón de <strong>Compartir</strong> <Share className="inline w-4 h-4 mx-1 align-sub text-emerald-500" /> (icono cuadrado con flecha hacia arriba).</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">4</div>
                  <div className="pt-1">Desplaza la lista de opciones hacia abajo y selecciona <strong>"Añadir a la pantalla de inicio"</strong> <Plus className="inline w-4 h-4 mx-1 align-sub text-emerald-500" />.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">5</div>
                  <div className="pt-1">Define el nombre para el icono y pulsa <strong>"Añadir"</strong> en la esquina superior derecha.</div>
                </li>
              </ol>
              <div className="mt-8 flex items-center justify-center bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                <img 
                  src="https://i.postimg.cc/N0hC1gNS/imagem-salvar-app-iphone.jpg" 
                  alt="Demostración Safari iPhone" 
                  className="rounded-xl shadow-xl shadow-black/50 max-w-full h-auto max-h-[500px] object-contain border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {activeTab === 'ios-chrome' && (
            <div className="space-y-6 sm:px-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-zinc-800 pb-4">
                <Chrome className="w-6 h-6 text-emerald-500" />
                Google Chrome en iPhone
              </h2>
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-sm text-emerald-200/80 mb-6 font-medium">
                Si prefieres utilizar Google Chrome en iPhone, el acceso directo se configura a través de la app Atajos de iOS:
              </div>
              <ol className="space-y-5">
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">1</div>
                  <div className="pt-1">Abre <strong>Google Chrome</strong> en el iPhone.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">2</div>
                  <div className="pt-1">Accede a FútbolPro y copia el enlace (URL) de la barra de direcciones.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">3</div>
                  <div className="pt-1">Abre la app <strong>Atajos</strong> (nativa de iOS) y pulsa en el botón "+" para crear un nuevo atajo.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">4</div>
                  <div className="pt-1">Añade la acción <strong>"Abrir URLs en Chrome"</strong> pegando el enlace copiado.</div>
                </li>
                <li className="flex gap-4 text-zinc-300 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20">5</div>
                  <div className="pt-1">En los ajustes del atajo, selecciona <strong>"Añadir a pantalla de inicio"</strong>, elige el nombre y confirma.</div>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Direct Link to Tutorial */}
      {onNavigate && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">¿Quieres aprender a usar la app en 3 minutos?</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Accede al Tutorial del Entrenador con guías paso a paso y preguntas frecuentes.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('tutorial')}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <span>Ver Tutorial del Entrenador</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default InstallAppModule;
