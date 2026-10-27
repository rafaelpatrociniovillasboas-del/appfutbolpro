import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, Phone, Mail, CheckCircle2, Trash2, Clock, Check, ExternalLink, X, HelpCircle, Copy, Zap } from 'lucide-react';
import { useToast } from './Toast';
import { getAthletes, Athlete } from '../lib/athleteStore';

interface CommHistoryItem {
  id: string;
  title: string;
  target: string;
  channel: 'WhatsApp' | 'Email';
  content: string;
  time: string;
  status: 'Enviado';
}

interface DispatchContact {
  name: string;
  role: string;
  phone: string;
  sent: boolean;
}

export function CommunicationModule() {
  const { addToast } = useToast();
  const [msg, setMsg] = useState('');
  const [title, setTitle] = useState('');
  const [targetGroup, setTargetGroup] = useState('Todos los Padres');
  const [channel, setChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  
  // Load and save communication history
  const [history, setHistory] = useState<CommHistoryItem[]>(() => {
    const saved = localStorage.getItem('drillforge_comms_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return [
      { 
        id: '1', 
        title: 'Aviso de Lluvia y Suspensión', 
        target: 'Todos los Padres', 
        channel: 'WhatsApp', 
        content: 'Estimadas familias, debido a las fuertes lluvias y por condiciones de seguridad del campo, las actividades de hoy quedan suspendidas.', 
        time: '01/07/2026, 09:00', 
        status: 'Enviado' 
      },
      { 
        id: '2', 
        title: 'Documentación del Torneo', 
        target: 'Sub-15', 
        channel: 'WhatsApp', 
        content: 'Recordatorio: La fecha límite para enviar el comprobante de inscripción y copia de identificación del jugador para el torneo es mañana.', 
        time: '30/06/2026, 14:30', 
        status: 'Enviado' 
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('drillforge_comms_history', JSON.stringify(history));
  }, [history]);

  // Modal / Dispatch Center State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [currentDispatchList, setCurrentDispatchList] = useState<DispatchContact[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<CommHistoryItem | null>(null);

  // Fetch athletes to populate list dynamically
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  useEffect(() => {
    setAthletes(getAthletes());
  }, []);

  // Determine active categories
  const categories = Array.from(new Set(athletes.map(a => a.category))).filter(Boolean).sort();

  // Handle building the contact list for dispatching
  const handleOpenDispatch = () => {
    if (!msg.trim()) {
      addToast('¡Escribe un mensaje antes de enviar el comunicado!', 'error');
      return;
    }

    const messageTitle = title.trim() || `Comunicado - ${new Date().toLocaleDateString('es-ES')}`;
    let contacts: DispatchContact[] = [];

    if (targetGroup === 'Todos los Padres' || targetGroup === 'Todos os Pais') {
      contacts = athletes
        .filter(a => a.status === 'Ativo')
        .map(a => ({
          name: a.finance?.responsible || `${a.name} (Tutor)`,
          role: `Padre/Madre/Tutor de ${a.name}`,
          phone: a.phone || '',
          sent: false
        }));
    } else if (targetGroup === 'Cuerpo Técnico' || targetGroup === 'Comissão Técnica') {
      contacts = [
        { name: 'Prof. Carlos Alberto', role: 'Segundo Entrenador', phone: '(11) 98888-0011', sent: false },
        { name: 'Prof. Ricardo Santos', role: 'Preparador Físico', phone: '(11) 98888-0022', sent: false },
        { name: 'Dra. Amanda Lima', role: 'Fisioterapeuta', phone: '(11) 98888-0033', sent: false },
      ];
    } else {
      // Category match (e.g. Sub-13, Sub-15)
      contacts = athletes
        .filter(a => a.category === targetGroup && a.status === 'Ativo')
        .map(a => ({
          name: a.finance?.responsible || `${a.name} (Tutor)`,
          role: `Tutor de ${a.name} (${a.category})`,
          phone: a.phone || '',
          sent: false
        }));
    }

    if (contacts.length === 0) {
      addToast(`¡Ningún contacto activo encontrado en el grupo "${targetGroup}"!`, 'error');
      return;
    }

    setCurrentDispatchList(contacts);
    setDispatchModalOpen(true);
  };

  // Helper to construct WhatsApp link for a contact
  const getWhatsAppLink = (contact: DispatchContact) => {
    if (!contact.phone) return '#';
    const cleanPhone = contact.phone.replace(/[^\d]/g, '');
    const intro = `*FÚTBOLPRO - COMUNICADO OFICIAL*\nHola ${contact.name},\n\n`;
    const fullText = intro + msg;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(fullText)}`;
  };

  // Helper to mark a contact as sent
  const handleMarkAsSent = (contactIndex: number) => {
    const contact = currentDispatchList[contactIndex];
    if (!contact.phone) {
      addToast(`¡Este contacto no tiene un número telefónico registrado!`, 'error');
      return;
    }
    const updated = [...currentDispatchList];
    updated[contactIndex].sent = true;
    setCurrentDispatchList(updated);
    addToast(`¡Redirigiendo WhatsApp a ${contact.name}!`, 'success');
  };

  // Send message to the next unsent contact in the queue and advance
  const handleSendNextQueue = () => {
    const nextIdx = currentDispatchList.findIndex(c => !c.sent);
    if (nextIdx === -1) {
      addToast('¡Todos los contactos de esta lista ya han sido enviados!', 'info');
      return;
    }
    const contact = currentDispatchList[nextIdx];
    if (!contact.phone) {
      addToast(`¡El contacto ${contact.name} no tiene teléfono! Saltando...`, 'error');
      const updated = [...currentDispatchList];
      updated[nextIdx].sent = true;
      setCurrentDispatchList(updated);
      return;
    }

    const url = getWhatsAppLink(contact);
    window.open(url, '_blank');

    const updated = [...currentDispatchList];
    updated[nextIdx].sent = true;
    setCurrentDispatchList(updated);
    addToast(`¡Abriendo conversación con ${contact.name}! Avanzando en la cola...`, 'success');
  };

  // Open batch of 5 contacts
  const handleSendBatchOf5 = () => {
    const unsentIndices: number[] = [];
    currentDispatchList.forEach((c, idx) => {
      if (!c.sent && c.phone && unsentIndices.length < 5) {
        unsentIndices.push(idx);
      }
    });

    if (unsentIndices.length === 0) {
      addToast('¡No hay más contactos pendientes con número telefónico!', 'info');
      return;
    }

    const confirmBatch = window.confirm(`Esto abrirá ${unsentIndices.length} pestañas nuevas de WhatsApp Web simultáneamente. El bloqueador de ventanas emergentes de su navegador debe estar DESACTIVADO.\n\n¿Desea continuar?`);
    if (!confirmBatch) return;

    const updated = [...currentDispatchList];
    unsentIndices.forEach(idx => {
      const contact = updated[idx];
      const url = getWhatsAppLink(contact);
      window.open(url, '_blank');
      updated[idx].sent = true;
    });

    setCurrentDispatchList(updated);
    addToast(`¡Iniciando envío por lote a ${unsentIndices.length} contactos!`, 'success');
  };

  // Copy formatted broadcast text
  const handleCopyFormattedMessage = () => {
    const fullText = `*FÚTBOLPRO - COMUNICADO OFICIAL*\n\n${msg}`;
    navigator.clipboard.writeText(fullText)
      .then(() => {
        addToast('¡Mensaje con formato copiado con éxito!', 'success');
      })
      .catch(() => {
        addToast('¡Error al copiar el mensaje!', 'error');
      });
  };

  // Conclude the broadcast and record it in the history list
  const handleConfirmBroadcast = () => {
    const finalTitle = title.trim() || `Comunicado - ${targetGroup}`;
    const newItem: CommHistoryItem = {
      id: Date.now().toString(),
      title: finalTitle,
      target: targetGroup,
      channel: channel,
      content: msg,
      time: new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Enviado'
    };

    setHistory(prev => [newItem, ...prev]);
    setMsg('');
    setTitle('');
    setDispatchModalOpen(false);
    addToast('¡Comunicado completado y guardado en el historial!', 'success');
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar este comunicado del historial?')) {
      setHistory(prev => prev.filter(item => item.id !== id));
      addToast('Comunicado eliminado del historial.', 'info');
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto h-full flex flex-col bg-[#050a07] text-slate-200">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </span>
            Centro de Comunicados
          </h1>
          <p className="text-xs md:text-sm font-medium text-zinc-500 mt-1.5">
            Envía avisos oficiales, recordatorios y circulares directamente a las familias por WhatsApp de forma ágil y segura.
          </p>
        </div>
      </header>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Side: Create New Announcement */}
        <div className="lg:col-span-5 bg-zinc-950/40 border border-zinc-800/80 rounded-3xl p-6 flex flex-col gap-5 h-fit shadow-2xl relative">
          <div className="border-b border-zinc-900 pb-3">
             <h3 className="font-display font-black text-white text-base flex items-center gap-2">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
                Nuevo Comunicado
             </h3>
          </div>

          <div className="space-y-4">
             {/* Title */}
             <div>
               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Asunto / Título</label>
               <input 
                 type="text" 
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium placeholder:text-zinc-600"
                 placeholder="Ej: Entrenamiento suspendido, Reunión de padres..."
               />
             </div>

             {/* Target Group */}
             <div>
               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Destinatarios</label>
               <select 
                 value={targetGroup}
                 onChange={(e) => setTargetGroup(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold cursor-pointer"
               >
                 <option value="Todos los Padres">👥 Todos los Padres / Tutores (General)</option>
                 {categories.map(cat => (
                   <option key={cat} value={cat}>⚽ Categoría {cat}</option>
                 ))}
                 <option value="Cuerpo Técnico">👔 Cuerpo Técnico</option>
               </select>
             </div>

             {/* Channels */}
             <div>
               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Canal de Envío</label>
               <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setChannel('WhatsApp')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      channel === 'WhatsApp'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                     <Phone className="w-3.5 h-3.5" />
                     WhatsApp
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setChannel('Email');
                      addToast('El envío por Email requiere SMTP configurado. ¡Recomendamos el envío por WhatsApp!', 'info');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      channel === 'Email'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                     <Mail className="w-3.5 h-3.5" />
                     Email (SMTP)
                  </button>
               </div>
             </div>

             {/* Message Body */}
             <div>
               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Mensaje Oficial</label>
               <textarea 
                 value={msg}
                 onChange={(e) => setMsg(e.target.value)}
                 rows={6}
                 className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium resize-none placeholder:text-zinc-600 leading-relaxed"
                 placeholder="Escribe aquí las instrucciones o avisos detallados para los tutores..."
               ></textarea>
               <span className="text-[10px] text-zinc-500 text-right block mt-1">
                 Los enlaces se convertirán automáticamente en el chat.
               </span>
             </div>

             {/* Submit */}
             <button 
               type="button"
               onClick={handleOpenDispatch} 
               className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-bold font-display uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/5 transform active:scale-[0.98]"
             >
                <Send className="w-4 h-4"/> 
                Enviar Ahora
             </button>
          </div>
        </div>

        {/* Right Side: Communication History & Details */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-3xl p-6 flex-1 flex flex-col shadow-2xl">
            <div className="border-b border-zinc-900 pb-3 mb-4 flex items-center justify-between">
               <h3 className="font-display font-black text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Historial de Envíos
               </h3>
               <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800 font-mono">
                 {history.length} guardados
               </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {history.length > 0 ? (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedHistoryItem(item)}
                    className={`group border rounded-2xl p-4 transition-all cursor-pointer flex flex-col gap-2 ${
                      selectedHistoryItem?.id === item.id 
                        ? 'bg-emerald-500/5 border-emerald-500/35 shadow-lg' 
                        : 'bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/50 hover:border-zinc-700/80'
                    }`}
                  >
                     <div className="flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                           <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-black text-emerald-400 tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/15">
                             {item.target}
                           </span>
                           <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors pt-1">
                             {item.title}
                           </h4>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] text-zinc-500 font-medium font-mono shrink-0">
                             {item.time}
                           </span>
                           <button 
                             type="button"
                             onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                             className="text-zinc-600 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/5 transition-all"
                             title="Eliminar del Historial"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>

                     <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                       {item.content}
                     </p>

                     <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-900/60 mt-1">
                       <span className="flex items-center gap-1 font-semibold text-emerald-500/80">
                         <Check className="w-3 h-3" /> Enviado por {item.channel}
                       </span>
                       <span className="text-emerald-400/70 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                         Clic para ver completo &rarr;
                       </span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6">
                  <div className="w-14 h-14 bg-zinc-900/60 rounded-full flex items-center justify-center text-zinc-600 border border-zinc-800 mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Ningún comunicado enviado</h4>
                  <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                    La academia no ha emitido comunicados oficiales en este período. ¡Crea un nuevo comunicado en el panel lateral!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Detail Panel */}
          {selectedHistoryItem && (
            <div className="bg-[#030704] border border-emerald-500/10 rounded-3xl p-6 shadow-2xl relative animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                   <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                     Detalle del Envío
                   </span>
                   <h3 className="text-base font-display font-bold text-white">
                     {selectedHistoryItem.title}
                   </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedHistoryItem(null)}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-850 rounded-lg text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl font-medium">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Destinatarios</span>
                    <span className="text-zinc-200">{selectedHistoryItem.target}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Fecha de Envío</span>
                    <span className="text-zinc-200 font-mono">{selectedHistoryItem.time}</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/10 border border-zinc-850 rounded-xl space-y-2">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Contenido Emitido</span>
                  <p className="text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedHistoryItem.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-zinc-500 font-mono">ID del Comunicado: #{selectedHistoryItem.id}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(`Reenvío: ${selectedHistoryItem.title}`);
                      setTargetGroup(selectedHistoryItem.target);
                      setMsg(selectedHistoryItem.content);
                      addToast('¡Comunicado cargado en el editor para reenviar!', 'info');
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-400 font-bold rounded-xl transition-all"
                  >
                    Cargar en el Editor
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DISPATCH CENTER DIALOG OVERLAY */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95dvh]">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between shrink-0">
               <div>
                  <h3 className="text-lg font-display font-black text-white tracking-tight flex items-center gap-2">
                     <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                     Centro de Envío Activo ({channel})
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                     Enviando comunicado a <strong className="text-zinc-300">{targetGroup}</strong> ({currentDispatchList.length} contactos detectados)
                  </p>
               </div>
               <button 
                 type="button"
                 onClick={() => setDispatchModalOpen(false)}
                 className="p-1.5 bg-zinc-900 hover:bg-zinc-850 rounded-xl text-zinc-500 hover:text-white transition-all"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Content list of contacts */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
               <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl mb-4">
                  <span className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Vista Previa del Mensaje</span>
                  <p className="text-xs font-medium text-emerald-300/90 leading-relaxed font-mono whitespace-pre-wrap line-clamp-3">
                     {msg}
                  </p>
               </div>

               {/* ⚡ PANEL DE ENVÍO RÁPIDO EN MASA */}
               <div className="p-5 bg-gradient-to-br from-emerald-950/20 to-zinc-950 border border-emerald-500/30 rounded-2xl mb-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                 
                 <div className="flex items-center gap-2 mb-3">
                   <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                   <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">⚡ Panel de Envío Inteligente</h4>
                 </div>

                 <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-medium">
                   Para evitar bloqueos de WhatsApp y popups simultáneos, usa nuestra <strong className="text-emerald-400">Cola de Auto-Avance</strong> para enviar uno tras otro con un solo clic.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Col 1: Queue Mode */}
                   <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                     <div>
                       <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest block mb-1">Cola de Auto-Avance (Recomendado)</span>
                       {currentDispatchList.findIndex(c => !c.sent) !== -1 ? (
                         (() => {
                           const nextContact = currentDispatchList[currentDispatchList.findIndex(c => !c.sent)];
                           const sentCount = currentDispatchList.filter(c => c.sent).length;
                           return (
                             <div>
                               <div className="text-white text-xs font-bold truncate">Siguiente: <span className="text-emerald-400">{nextContact.name}</span></div>
                               <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">{nextContact.role}</span>
                               <div className="text-[10px] text-zinc-400 font-bold font-mono mt-1">Progreso: {sentCount} de {currentDispatchList.length} enviados</div>
                             </div>
                           );
                         })()
                       ) : (
                         <div className="text-emerald-400 text-xs font-black flex items-center gap-1.5 py-1">
                           <Check className="w-3.5 h-3.5" />
                           ¡Todos los contactos enviados!
                         </div>
                       )}
                     </div>

                     {currentDispatchList.findIndex(c => !c.sent) !== -1 && (
                       <button
                         type="button"
                         onClick={handleSendNextQueue}
                         className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 cursor-pointer"
                       >
                         <Zap className="w-3.5 h-3.5 shrink-0" />
                         Enviar Siguiente en la Cola
                       </button>
                     )}
                   </div>

                   {/* Col 2: Batches & Clipboard */}
                   <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                     <div>
                       <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest block mb-2.5">Envío por Lotes o Copia</span>
                       <div className="space-y-2">
                         <button
                           type="button"
                           onClick={handleSendBatchOf5}
                           className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                         >
                           <span>📦 Abrir Lote de 5 Pestañas</span>
                         </button>
                         <button
                           type="button"
                           onClick={handleCopyFormattedMessage}
                           className="w-full py-1.5 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                         >
                           <Copy className="w-3 h-3 shrink-0" />
                           <span>Copiar Texto Oficial</span>
                         </button>
                       </div>
                     </div>
                     <span className="text-[9px] text-zinc-500 font-medium block leading-tight">
                       💡 ¡También puedes usar Listas de Difusión en tu móvil para llegar a todos al instante!
                     </span>
                   </div>
                 </div>
               </div>

               <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Selecciona un contacto para enviar:</span>
                  
                  {currentDispatchList.map((contact, index) => (
                    <div 
                      key={index}
                      className="bg-zinc-900/50 border border-zinc-850 rounded-xl p-3 flex items-center justify-between gap-4 transition-all"
                    >
                       <div>
                          <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                          <span className="text-[10px] font-medium text-zinc-500 block">{contact.role} • {contact.phone || 'Sin teléfono'}</span>
                       </div>

                       <div className="flex items-center gap-2">
                          {contact.sent ? (
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-sans">
                               <Check className="w-3.5 h-3.5" />
                               Enviado
                            </span>
                          ) : (
                            <a
                               href={getWhatsAppLink(contact)}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={() => handleMarkAsSent(index)}
                               className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 text-center inline-flex items-center"
                             >
                                <Phone className="w-3 h-3 text-current shrink-0" />
                                <span>Enviar</span>
                                <ExternalLink className="w-2.5 h-2.5 text-current shrink-0" />
                             </a>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
               <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>¡Envía los mensajes y luego haz clic para concluir!</span>
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setDispatchModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider"
                  >
                     Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBroadcast}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10"
                  >
                     Concluir y Guardar en Historial
                  </button>
               </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
