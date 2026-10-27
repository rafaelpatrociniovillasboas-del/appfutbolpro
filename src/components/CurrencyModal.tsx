import React, { useState } from 'react';
import { X, Search, Check, Globe, DollarSign, Sparkles } from 'lucide-react';
import * as motion from 'motion/react-client';
import { LATAM_CURRENCIES, CurrencyOption, updateSettings } from '../lib/settingsStore';
import { useSettings } from '../lib/useSettings';
import { useToast } from './Toast';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CurrencyModal({ isOpen, onClose }: CurrencyModalProps) {
  const settings = useSettings();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = LATAM_CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.includes(search)
  );

  const handleSelect = (curr: CurrencyOption) => {
    updateSettings({
      currencyCode: curr.symbol,
      currencyIso: curr.code,
      currencyName: curr.name,
      currencyFlag: curr.flag,
    });
    addToast(`Moneda actualizada a ${curr.name} (${curr.code})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white leading-tight">
                Configurar Moneda
              </h2>
              <p className="text-xs text-zinc-400">
                Ajusta la moneda de cobros, mensualidades y reportes financieros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-zinc-800/60 bg-zinc-950">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por país, moneda o código (ej. México, COP, Real)..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Currency List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {filtered.map((curr) => {
            const isSelected = settings.currencyIso === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => handleSelect(curr)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl select-none" role="img" aria-label={curr.country}>
                    {curr.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {curr.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                        {curr.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {curr.country} • Símbolo: <strong className="text-zinc-300 font-mono">{curr.symbol}</strong> (ej. {curr.symbol} 150,00)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-sm font-mono font-black px-2.5 py-1 rounded-lg border ${
                    isSelected 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 group-hover:text-white'
                  }`}>
                    {curr.symbol}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No se encontraron monedas para "{search}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-zinc-500">Actual:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span>{settings.currencyFlag || '🇺🇸'}</span>
              <span>{settings.currencyName || 'Dólar'} ({settings.currencyCode || '$'})</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
