import React, { useState, useEffect } from 'react';
import { Download, DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, Wallet, Trash2, X } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useToast } from './Toast';
import { generateFinancePDF } from '../lib/pdf';
import { auth } from '../firebase';
import { isRealCustomUser } from '../lib/athleteStore';
import { useSettings } from '../lib/useSettings';
import { triggerInstantCloudSync } from '../lib/cloudSync';

const initialTransactions = [
  { id: 1, desc: 'Cuotas Sub-15 (Marzo)', date: '04 Mar 2026', amount: 3500.00, type: 'in' },
  { id: 2, desc: 'Alquiler Cancha Central', date: '02 Mar 2026', amount: -1200.00, type: 'out' },
  { id: 3, desc: 'Uniformes Proveedor', date: '28 Feb 2026', amount: -2800.00, type: 'out' },
  { id: 4, desc: 'Cuotas Adulto (Marzo)', date: '25 Feb 2026', amount: 5400.00, type: 'in' },
  { id: 5, desc: 'Tasa Federación (Inscripción)', date: '20 Feb 2026', amount: -600.00, type: 'out' },
];

export function FinanceModule() {
  const settings = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<any>('in');
  const [date, setDate] = useState('');
  
  const getFinanceStorageKey = () => {
    let uid = auth.currentUser?.uid;
    if (!uid && typeof window !== 'undefined') {
      try {
        const guestObj = localStorage.getItem('drillforge_guest_user');
        if (guestObj) {
          const parsed = JSON.parse(guestObj);
          uid = parsed?.uid;
        }
      } catch (e) {
        // ignore
      }
    }
    return uid ? `trainer_finance_transactions_user_${uid}` : 'trainer_finance_transactions';
  };

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadTransactions = () => {
    const key = getFinanceStorageKey();
    let saved = localStorage.getItem(key);

    if (!saved) {
      saved = localStorage.getItem('trainer_finance_transactions') || localStorage.getItem('drillforge_finances');
      if (saved) {
        try {
          localStorage.setItem(key, saved);
        } catch (e) {}
      }
    }

    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading transactions', e);
      }
    } else {
      if (isRealCustomUser()) {
        setTransactions([]);
      } else {
        setTransactions(initialTransactions);
      }
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadTransactions();

    const handleSync = () => loadTransactions();
    window.addEventListener('cloud_sync_completed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cloud_sync_completed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const key = getFinanceStorageKey();
    const serialized = JSON.stringify(transactions);
    localStorage.setItem(key, serialized);
    localStorage.setItem('trainer_finance_transactions', serialized);
    localStorage.setItem('drillforge_finances', serialized);
    triggerInstantCloudSync();
  }, [transactions, isLoaded]);
  
  const { addToast } = useToast();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    let formattedDate = value;
    if (value.length > 2) {
      formattedDate = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length > 4) {
      formattedDate = formattedDate.slice(0, 5) + '/' + formattedDate.slice(5);
    }
    setDate(formattedDate);
  };

  const handleOpenModal = (type: 'in' | 'out') => {
    setModalType(type);
    setDate('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addToast('Movimiento eliminado con éxito.', 'success');
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const desc = fd.get('desc') as string;
    const amountVal = parseFloat(fd.get('amount') as string);
    const date = fd.get('date') as string || new Date().toLocaleDateString('es-ES');

    if (!desc || isNaN(amountVal)) {
      addToast('Completa los campos correctamente.', 'error');
      return;
    }

    const newTx = {
      id: Date.now(),
      desc,
      date,
      amount: modalType === 'in' ? Math.abs(amountVal) : -Math.abs(amountVal),
      type: modalType
    };

    setTransactions(prev => [newTx, ...prev]);
    addToast('¡Movimiento registrado con éxito!', 'success');
    setIsModalOpen(false);
  };

  const totalIn = transactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalBalance = totalIn - totalOut;

  const handleExportPDF = () => {
    generateFinancePDF(transactions, totalBalance);
    addToast('Informe generado con éxito', 'success');
  };

  return (
    <div className="p-6 pb-24 lg:pb-10 lg:p-10 max-w-7xl mx-auto relative h-full overflow-y-auto custom-scrollbar">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Gestión Financiera</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Flujo de caja, cuotas y gastos de la operación.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto mt-4 md:mt-0">
          <button onClick={handleExportPDF} className="flex justify-center items-center gap-2 bg-zinc-900 text-zinc-300 border border-zinc-800 px-4 py-3 md:py-2 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
            <Download className="w-4 h-4" /> Informe PDF
          </button>
          <button onClick={() => handleOpenModal('out')} className="flex justify-center items-center gap-1 sm:gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 sm:px-4 py-3 md:py-2 rounded-xl font-bold hover:bg-rose-500/20 transition-colors text-sm sm:text-base">
            <ArrowDownRight className="w-4 h-4 shrink-0" /> <span className="truncate">Nuevo Gasto</span>
          </button>
          <button onClick={() => handleOpenModal('in')} className="flex justify-center items-center gap-1 sm:gap-2 bg-emerald-500 text-[#050a07] px-2 sm:px-4 py-3 md:py-2 rounded-xl font-bold hover:bg-emerald-400 transition-colors text-sm sm:text-base">
            <ArrowUpRight className="w-4 h-4 shrink-0" /> <span className="truncate">Nuevo Ingreso</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Saldo Actual</p>
          <h3 className={`text-3xl font-display font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{settings.currencyCode} {totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
        </div>
        
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Ingresos</p>
          <h3 className="text-3xl font-display font-bold text-emerald-400 mb-2">{settings.currencyCode} {totalIn.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Gastos</p>
          <h3 className="text-3xl font-display font-bold text-rose-400 mb-2">{settings.currencyCode} {totalOut.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-zinc-500" />
          Últimos Movimientos
        </h3>
        
        <div className="space-y-3">
          {transactions.map((t, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={t.id} 
              className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl hover:bg-zinc-900 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  t.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {t.type === 'in' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-white">{t.desc}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{t.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-right font-display font-bold text-lg ${t.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'in' ? '+' : '-'} {settings.currencyCode} {Math.abs(t.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition-all p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-zinc-500 italic py-4">Ningún movimiento registrado.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              {modalType === 'in' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Descripción</label>
                <input required name="desc" type="text" placeholder="Ej: Cuota mensual..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Monto ({settings.currencyCode})</label>
                  <input required name="amount" type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Fecha (Opcional)</label>
                  <input name="date" type="text" value={date} onChange={handleDateChange} placeholder="DD/MM/AAAA" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-zinc-900 text-white py-2.5 rounded-xl font-bold hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" className={`flex-1 py-2.5 rounded-xl font-bold transition-colors ${
                  modalType === 'in'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}>
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
