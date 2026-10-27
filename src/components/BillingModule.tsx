import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  Copy, 
  ExternalLink,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Search,
  Check,
  X,
  Plus,
  HelpCircle,
  Edit2,
  QrCode
} from 'lucide-react';
import { useToast } from './Toast';
import { getAthletes, updateAthlete, Athlete } from '../lib/athleteStore';
import * as motion from 'motion/react-client';
import { useSettings } from '../lib/useSettings';
import { triggerInstantCloudSync } from '../lib/cloudSync';

export function BillingModule() {
  const { addToast } = useToast();
  const settings = useSettings();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  const [activeTriggerAthlete, setActiveTriggerAthlete] = useState<Athlete | null>(null);
  const [isCoping, setIsCoping] = useState(false);
  const [editingFinanceAthlete, setEditingFinanceAthlete] = useState<Athlete | null>(null);
  
  // Refresh athletes list from centralized store
  const loadData = () => {
    setAthletes(getAthletes());
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    let clean = v.replace(settings.currencyCode, '').replace(/[^\d.,]/g, '').replace(/^[,.]+/, '').trim();
    if (clean === '') {
      e.target.value = '';
      return;
    }
    let numeric = clean.replace(/[^0-9,.]/g, '');
    e.target.value = `${settings.currencyCode} ${numeric}`;
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let v = e.target.value;
    let clean = v.replace(settings.currencyCode, '').replace(/[^\d.,]/g, '').replace(/^[,.]+/, '').trim();
    if (!clean) return;
    
    clean = clean.replace(/\./g, ',');
    
    if (!clean.includes(',')) {
      clean = `${clean},00`;
    } else {
      const parts = clean.split(',');
      if (parts[1] === '') {
        clean = `${parts[0]},00`;
      } else if (parts[1].length === 1) {
        clean = `${parts[0]},${parts[1]}0`;
      } else if (parts[1].length > 2) {
        clean = `${parts[0]},${parts[1].substring(0, 2)}`;
      }
    }
    e.target.value = `${settings.currencyCode} ${clean}`;
  };

  const parseAmount = (amtStr: string): number => {
    if (!amtStr) return 0;
    let clean = amtStr.replace(settings.currencyCode, '').replace(/[^\d.,]/g, '').replace(/^[,.]+/, '').trim();
    if (!clean) return 0;
    
    if (clean.includes(',')) {
      clean = clean.replace(/\./g, '');
      clean = clean.replace(',', '.');
    } else {
      const lastDotIndex = clean.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        const afterDot = clean.substring(lastDotIndex + 1);
        if (afterDot.length === 3) {
          clean = clean.replace(/\./g, '');
        }
      }
    }
    
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    loadData();

    window.addEventListener('cloud_sync_completed', loadData);
    window.addEventListener('storage', loadData);
    window.addEventListener('settings_updated', loadData);
    return () => {
      window.removeEventListener('cloud_sync_completed', loadData);
      window.removeEventListener('storage', loadData);
      window.removeEventListener('settings_updated', loadData);
    };
  }, []);

  // Dynamic variable replacement helper for messages
  const renderMessageText = (athlete?: Athlete | null) => {
    let msg = "¡Hola, {responsavel}! Recordatorio de la academia FútbolPro: la cuota de {atleta} ({valor}) vence el {vencimento}. Agradecemos su apoyo y confianza.";
    const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long' });
    const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
    
    const athleteName = athlete?.name || 'Mateo Silva';
    const responsibleName = athlete?.finance?.responsible || athlete?.name || 'Carlos Silva';
    const dueDate = athlete?.finance?.dueDate || '10/06/2026';
    const amount = athlete?.finance?.amount || `${settings.currencyCode} 150,00`;
    const status = athlete?.finance?.status === 'Pago' ? 'Pagado' : athlete?.finance?.status === 'Atrasado' ? 'Atrasado' : 'Pendiente';

    msg = msg.replace(/{atleta}/gi, athleteName);
    msg = msg.replace(/{responsavel}/gi, responsibleName);
    msg = msg.replace(/{vencimento}/gi, dueDate);
    msg = msg.replace(/{valor}/gi, amount);
    msg = msg.replace(/{academia}/gi, 'FútbolPro');
    msg = msg.replace(/{mes}/gi, capitalizedMonth);
    msg = msg.replace(/{status}/gi, status);
    return msg;
  };

  const handleStatusChange = (athleteId: number, newStatus: 'Pago' | 'Atrasado' | 'Pendente') => {
    const athlete = athletes.find(a => a.id === athleteId);
    if (athlete) {
      const updatedFinance = {
        ...athlete.finance,
        status: newStatus
      };
      updateAthlete(athleteId, { finance: updatedFinance });
      const statusLabel = newStatus === 'Pago' ? 'Pagado' : newStatus === 'Atrasado' ? 'Atrasado' : 'Pendiente';
      addToast(`Estado de ${athlete.name} cambiado a ${statusLabel}.`, 'info');
      loadData();
    }
  };

  const sanitizePhoneForWhatsapp = (phone: string) => {
    return phone ? phone.replace(/\D/g, '') : '';
  };

  const handleSendWhatsapp = (athlete: Athlete) => {
    const text = renderMessageText(athlete);
    const phone = sanitizePhoneForWhatsapp(athlete.phone);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    addToast(`¡Enviando cobro de ${athlete.name} por WhatsApp!`, 'success');
    setActiveTriggerAthlete(null);
  };

  const handleCopyMessage = (athlete: Athlete) => {
    const text = renderMessageText(athlete);
    navigator.clipboard.writeText(text);
    setIsCoping(true);
    addToast('Mensaje copiado al portapapeles', 'success');
    setTimeout(() => setIsCoping(false), 2000);
  };

  // Filter athletes and their respective sub-billing info
  const filteredAthletes = athletes.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.finance?.responsible && a.finance.responsible.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const statusLabel = a.finance?.status || 'Pendente';
    const matchesStatus = selectedStatus === 'Todos' || statusLabel === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate detailed financial KPIs based on registered records
  const totalLateCount = athletes.filter(a => a.finance?.status === 'Atrasado').length;
  const totalPendingCount = athletes.filter(a => a.finance?.status === 'Pendente').length;
  
  const totalAmountPending = athletes.filter(a => a.finance?.status !== 'Pago').reduce((acc, curr) => {
    return acc + parseAmount(curr.finance?.amount || '');
  }, 0);

  const handleSendBulkReminders = () => {
    const targets = athletes.filter(a => a.finance?.status !== 'Pago');
    if (targets.length === 0) {
      addToast('¡Excelente! No hay cuotas pendientes ni atrasadas por recordar hoy.', 'success');
      return;
    }
    
    // Suggest the first target to guide user sequentially through sending
    addToast(`Iniciando panel de avisos para ${targets.length} tutores/responsables.`, 'info');
    setActiveTriggerAthlete(targets[0]);
  };

  return (
    <div className="p-6 pb-24 lg:pb-10 lg:p-10 max-w-7xl mx-auto space-y-8 h-full overflow-y-auto custom-scrollbar">
      {/* Title & Top Options */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">
            Cobro <span className="text-emerald-500">Automático</span>
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Gestiona cobros y envía recordatorios directos por WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button 
            type="button"
            onClick={handleSendBulkReminders}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-xl font-bold transition-all text-xs shadow-lg shadow-emerald-500/10 focus:outline-none cursor-pointer"
          >
            <Send className="w-4 h-4" /> 
            Notificar Pendientes ({totalLateCount + totalPendingCount})
          </button>
        </div>
      </header>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold">Cuotas Atrasadas</span>
            <p className="text-3xl font-display font-black text-white">{totalLateCount} Jugadores</p>
            <p className="text-xs text-rose-400 font-bold">Requieren atención inmediata</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold">Cobros Pendientes</span>
            <p className="text-3xl font-display font-black text-white">{totalPendingCount} Jugadores</p>
            <p className="text-xs text-amber-400 font-bold">Cuotas para el vencimiento actual</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono font-bold">Previsión por Cobrar</span>
            <p className="text-3xl font-display font-black text-emerald-400">{settings.currencyCode} {totalAmountPending.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-zinc-400">Proyección total a recibir</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Billing Table and Search */}
      <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl overflow-hidden p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Searching */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Buscar jugador o tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white"
            />
          </div>

          {/* Filtering controls */}
          <div className="flex gap-2.5">
            {[
              { key: 'Todos', label: 'Todos' },
              { key: 'Pago', label: 'Pagado' },
              { key: 'Pendente', label: 'Pendiente' },
              { key: 'Atrasado', label: 'Atrasado' }
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedStatus(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  selectedStatus === key 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-zinc-900/30 text-zinc-400 border-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table representation for Desktop, Cards for Mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-400">
            <thead className="bg-zinc-900/40 text-zinc-300 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Jugador / Tutor</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500 font-mono text-xs">
                    Ningún registro financiero encontrado con estos criterios.
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((athlete) => {
                  const finance = athlete.finance || {
                    responsible: athlete.name,
                    dueDate: '10/06/2026',
                    amount: `${settings.currencyCode} 150,00`,
                    status: 'Pendente'
                  };

                  return (
                    <tr key={athlete.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                            {athlete.photo ? (
                              <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
                            ) : (
                              athlete.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{athlete.name}</p>
                            <p className="text-[10px] text-zinc-500">Tutor: {finance.responsible || 'No informado'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">{athlete.phone || 'Sin número'}</td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">{finance.dueDate || '10/06/2026'}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400">{finance.amount || `${settings.currencyCode} 150,00`}</td>
                      <td className="px-4 py-3.5">
                        <select 
                          value={finance.status || 'Pendente'}
                          onChange={(e) => handleStatusChange(athlete.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-transparent cursor-pointer focus:outline-none ${
                            finance.status === 'Pago'
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                              : finance.status === 'Atrasado'
                              ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                              : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          }`}
                        >
                          <option value="Pago" className="bg-zinc-900 text-white">Pagado</option>
                          <option value="Pendente" className="bg-zinc-900 text-white">Pendiente</option>
                          <option value="Atrasado" className="bg-zinc-900 text-white">Atrasado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFinanceAthlete(athlete)}
                            title="Editar Datos Financieros"
                            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTriggerAthlete(athlete)}
                            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Cobrar WhatsApp</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards Layout */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredAthletes.map(athlete => {
            const finance = athlete.finance || {
              responsible: athlete.name,
              dueDate: '10/06/2026',
              amount: `${settings.currencyCode} 150,00`,
              status: 'Pendente'
            };

            return (
              <div key={athlete.id} className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                      {athlete.photo ? (
                        <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
                      ) : (
                        athlete.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{athlete.name}</h4>
                      <p className="text-xs text-zinc-500">Tutor: {finance.responsible || 'No informado'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingFinanceAthlete(athlete)}
                    className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-zinc-800/60 font-mono">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block font-sans">Vencimiento</span>
                    <span className="text-zinc-300 font-bold">{finance.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block font-sans">Monto</span>
                    <span className="text-emerald-400 font-bold">{finance.amount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <select 
                    value={finance.status || 'Pendente'}
                    onChange={(e) => handleStatusChange(athlete.id, e.target.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border bg-transparent cursor-pointer focus:outline-none ${
                      finance.status === 'Pago'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : finance.status === 'Atrasado'
                        ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                        : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    <option value="Pago" className="bg-zinc-900 text-white">Pagado</option>
                    <option value="Pendente" className="bg-zinc-900 text-white">Pendiente</option>
                    <option value="Atrasado" className="bg-zinc-900 text-white">Atrasado</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setActiveTriggerAthlete(athlete)}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Cobrar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Disparo Rápido de Cobro Individual */}
      {activeTriggerAthlete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Enviar Notificación de Cobro ⚡</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-1">
                  Revisa los datos de contacto y el mensaje que se enviará al tutor/responsable.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTriggerAthlete(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats check */}
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 font-bold font-mono">Destinatario</span>
                <p className="text-white text-xs font-bold mt-0.5">{activeTriggerAthlete.finance?.responsible || activeTriggerAthlete.name}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{activeTriggerAthlete.phone || 'Sin número registrado'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-500 font-bold font-mono">Monto Total</span>
                <p className="text-emerald-400 text-sm font-black mt-0.5">{activeTriggerAthlete.finance?.amount || `${settings.currencyCode} 150,00`}</p>
                <p className="text-rose-400 text-[10px] font-bold mt-0.5 uppercase tracking-wider">
                  ⚠️ Estado: {activeTriggerAthlete.finance?.status === 'Pago' ? 'Pagado' : activeTriggerAthlete.finance?.status === 'Atrasado' ? 'Atrasado' : 'Pendiente'}
                </p>
              </div>
            </div>

            {/* Message preview block */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase text-zinc-500 font-bold font-mono">Vista Previa del Mensaje</span>
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 text-xs font-mono text-zinc-300 leading-relaxed relative">
                {renderMessageText(activeTriggerAthlete)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => handleCopyMessage(activeTriggerAthlete)}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-black text-zinc-300 hover:text-white transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCoping ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                {isCoping ? '¡Mensaje Copiado!' : 'Copiar Texto'}
              </button>
              
              <button
                type="button"
                onClick={() => handleSendWhatsapp(activeTriggerAthlete)}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-black text-black transition-all focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir WhatsApp Direct
              </button>
            </div>
            
            <div className="text-[11px] text-zinc-500 text-center leading-normal">
              El botón <strong className="text-zinc-400">WhatsApp Direct</strong> abrirá la aplicación oficial enviando el texto redactado al responsable.
            </div>
          </motion.div>
        </div>
      )}

      {/* Editar Dados Financeiros Modal */}
      {editingFinanceAthlete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Editar Datos Financieros 💳</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-normal">
                  Actualiza el monto y vencimiento de {editingFinanceAthlete.name}.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingFinanceAthlete(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const amount = fd.get('amount') as string || `${settings.currencyCode} 150,00`;
              const dueDate = fd.get('dueDate') as string || '10/06/2026';
              const responsible = fd.get('responsible') as string || editingFinanceAthlete.name;
              const status = fd.get('status') as any || editingFinanceAthlete.finance?.status || 'Pendente';

              const updatedFinance = {
                responsible,
                amount,
                dueDate,
                status
              };

              updateAthlete(editingFinanceAthlete.id, { finance: updatedFinance });
              addToast(`¡Datos financieros de ${editingFinanceAthlete.name} actualizados con éxito!`, 'success');
              setEditingFinanceAthlete(null);
              loadData();
            }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Nombre del Tutor / Responsable</label>
                <input required name="responsible" defaultValue={editingFinanceAthlete.finance?.responsible || editingFinanceAthlete.name} type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Monto de la Cuota</label>
                  <input required name="amount" defaultValue={editingFinanceAthlete.finance?.amount || `${settings.currencyCode} 150,00`} onChange={handleAmountInput} onBlur={handleAmountBlur} type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Fecha de Vencimiento</label>
                  <input required name="dueDate" defaultValue={editingFinanceAthlete.finance?.dueDate || '10/06/2026'} type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Estado de Pago</label>
                <select name="status" defaultValue={editingFinanceAthlete.finance?.status || 'Pendente'} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none">
                  <option value="Pago" className="bg-zinc-900 text-white animate-none">Pagado</option>
                  <option value="Pendente" className="bg-zinc-900 text-white animate-none">Pendiente</option>
                  <option value="Atrasado" className="bg-zinc-900 text-white animate-none">Atrasado</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingFinanceAthlete(null)} className="flex-1 bg-zinc-900 text-white py-2.5 rounded-xl font-bold hover:bg-zinc-800 transition-colors text-xs cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-black py-2.5 rounded-xl font-bold hover:bg-emerald-400 transition-colors text-xs cursor-pointer">Guardar Cambios</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
