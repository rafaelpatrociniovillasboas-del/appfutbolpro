import React from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Star, 
  Flame, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { COMPLEMENTARY_PRODUCTS } from '../data/products';
import { cn } from '../lib/utils';

export function MarketplaceModule() {
  const handleOpenCheckout = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-10 lg:p-10 font-sans max-w-7xl mx-auto h-full overflow-y-auto space-y-8">
      {/* Header Banner */}
      <header className="relative bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-zinc-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Recursos VIP para Entrenadores
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
            Mis Ofertas & Packs Oficiales
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
            Metodologías prácticas, vídeos tácticos en HD, rutinas de preparación física y estrategias de captación diseñadas para entrenadores y directores de escuelas.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Pago 100% Seguro en Hotmart
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Zap className="w-4 h-4 text-amber-400" /> Acceso Inmediato
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Garantía Total
            </span>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Catálogo de Ofertas ({COMPLEMENTARY_PRODUCTS.length})
          </h2>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            🔥 Acceso Vitalicio
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPLEMENTARY_PRODUCTS.map((prod) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/40 shadow-black/40"
            >
              {/* Product Image Box - Uncropped with full visibility */}
              <div className="relative bg-zinc-900/90 border-b border-zinc-800/80 p-3 sm:p-4 flex items-center justify-center overflow-hidden">
                <img 
                  src={prod.imageUrl} 
                  alt={prod.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[380px] object-contain rounded-xl shadow-md group-hover:scale-[1.02] transition-transform duration-300"
                />
                
                {prod.badge && (
                  <span className="absolute top-5 left-5 text-zinc-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg font-mono tracking-wider bg-emerald-500">
                    {prod.badge}
                  </span>
                )}

                <span className="absolute top-5 right-5 bg-zinc-950/90 backdrop-blur-md text-zinc-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-zinc-700 shadow-lg">
                  {prod.category}
                </span>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2 pt-1 pb-1">
                    <span className="text-2xl font-display font-black text-emerald-400">
                      {prod.price}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-xs text-zinc-400 line-through font-mono">
                        {prod.originalPrice}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {prod.title}
                  </h3>
                  {prod.subtitle && (
                    <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                      {prod.subtitle}
                    </p>
                  )}
                  
                  {/* Highlights */}
                  <ul className="space-y-1.5 pt-2">
                    {prod.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className={cn(
                          "w-3.5 h-3.5 shrink-0 mt-0.5",
                          prod.featured ? "text-amber-400" : "text-emerald-400"
                        )} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-900 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCheckout(prod.checkoutUrl)}
                    className="flex-1 py-3 px-4 text-zinc-950 font-display font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 uppercase tracking-wider group/btn bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
                  >
                    <span>Comprar Ahora</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => handleOpenCheckout(prod.checkoutUrl)}
                    title="Abrir en Hotmart"
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
