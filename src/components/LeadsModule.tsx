import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Copy, 
  ArrowRight, 
  ArrowLeft,
  Trash2, 
  Edit2, 
  X, 
  ClipboardCheck, 
  TrendingUp, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useToast } from './Toast';
import { triggerInstantCloudSync } from '../lib/cloudSync';

interface Lead {
  id: string;
  name: string;
  phone: string;
  stage: 'interessado' | 'negociacao' | 'matriculado';
  notes: string;
  source: string;
  dateAdded: string;
}

const DEFAULT_LEADS: Lead[] = [
  { id: 'l1', name: 'Álvaro Suárez', phone: '+54 9 11 6111-2233', stage: 'interessado', notes: 'El padre quiere lunes y miércoles. Le gusta jugar de lateral.', source: 'Anuncio Instagram', dateAdded: '03/06/2026' },
  { id: 'l2', name: 'Rodrigo Medina', phone: '+54 9 11 6122-3344', stage: 'interessado', notes: 'Interesado en la categoría Sub-11. Requiere evaluación física inicial.', source: 'Recomendación', dateAdded: '04/06/2026' },
  { id: 'l3', name: 'Gustavo Santos', phone: '+54 9 11 6133-4455', stage: 'negociacao', notes: 'Hizo la clase de prueba y le gustó mucho. Conversando sobre planes trimestrales.', source: 'Volante en el Barrio', dateAdded: '01/06/2026' },
  { id: 'l4', name: 'Enrique Álvarez', phone: '+54 9 11 6144-5566', stage: 'negociacao', notes: 'Hablamos por WhatsApp, envió el comprobante de domicilio. Solo falta el pago.', source: 'Google Maps', dateAdded: '02/06/2026' },
  { id: 'l5', name: 'Arturo Olivera', phone: '+54 9 11 6155-6677', stage: 'matriculado', notes: 'Inscripción realizada. Ya agregado al directorio Sub-15.', source: 'Anuncio Facebook', dateAdded: '30/05/2026' },
  { id: 'l6', name: 'David Ferreyra', phone: '+54 9 11 6166-7788', stage: 'matriculado', notes: 'Hizo la inscripción anual. Kit de uniforme ya entregado.', source: 'Anuncio Instagram', dateAdded: '29/05/2026' }
];

export function LeadsModule() {
  const { addToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form states
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadStage, setLeadStage] = useState<'interessado' | 'negociacao' | 'matriculado'>('interessado');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadSource, setLeadSource] = useState('Anúncio Instagram');

  const loadLeads = () => {
    const saved = localStorage.getItem('drillforge_leads_v1');
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
      } catch (e) {
        setLeads(DEFAULT_LEADS);
      }
    } else {
      setLeads(DEFAULT_LEADS);
      localStorage.setItem('drillforge_leads_v1', JSON.stringify(DEFAULT_LEADS));
    }
  };

  useEffect(() => {
    loadLeads();

    const handleSync = () => loadLeads();
    window.addEventListener('cloud_sync_completed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('cloud_sync_completed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const saveLeadsToStorage = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem('drillforge_leads_v1', JSON.stringify(updatedLeads));
    triggerInstantCloudSync();
  };

  const handleOpenAddModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setLeadName(lead.name);
      setLeadPhone(lead.phone);
      setLeadStage(lead.stage);
      setLeadNotes(lead.notes);
      setLeadSource(lead.source);
    } else {
      setEditingLead(null);
      setLeadName('');
      setLeadPhone('');
      setLeadStage('interessado');
      setLeadNotes('');
      setLeadSource('Anúncio Instagram');
    }
    setIsModalOpen(true);
  };

  const handleSaveLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) {
      addToast('Nome é obrigatório!', 'error');
      return;
    }

    if (editingLead) {
      const updated = leads.map(l => l.id === editingLead.id ? {
        ...l,
        name: leadName.trim(),
        phone: leadPhone.trim() || '(11) 99999-0000',
        stage: leadStage,
        notes: leadNotes.trim(),
        source: leadSource
      } : l);
      saveLeadsToStorage(updated);
      addToast(`Lead ${leadName} atualizado com sucesso!`, 'success');
    } else {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        name: leadName.trim(),
        phone: leadPhone.trim() || '(11) 99999-0000',
        stage: leadStage,
        notes: leadNotes.trim(),
        source: leadSource,
        dateAdded: new Date().toLocaleDateString('pt-BR')
      };
      saveLeadsToStorage([...leads, newLead]);
      addToast(`Novo lead ${leadName} adicionado ao funil!`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleDeleteLead = (id: string, name: string) => {
    const filtered = leads.filter(l => l.id !== id);
    saveLeadsToStorage(filtered);
    addToast(`Lead ${name} removido do funil.`, 'info');
  };

  const shiftLeadStage = (leadId: string, direction: 'forward' | 'backward') => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    let nextStage: 'interessado' | 'negociacao' | 'matriculado' = lead.stage;
    if (direction === 'forward') {
      if (lead.stage === 'interessado') nextStage = 'negociacao';
      else if (lead.stage === 'negociacao') nextStage = 'matriculado';
    } else {
      if (lead.stage === 'matriculado') nextStage = 'negociacao';
      else if (lead.stage === 'negociacao') nextStage = 'interessado';
    }

    const updated = leads.map(l => l.id === leadId ? { ...l, stage: nextStage } : l);
    saveLeadsToStorage(updated);
    addToast(`${lead.name} movido para: ${nextStage === 'interessado' ? 'Interessados' : nextStage === 'negociacao' ? 'Em Negociação' : 'Matriculado! 🎉'}`, 'success');
  };

  const sendWhatsappStart = (lead: Lead) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const msg = `¡Hola ${lead.name}! Te escribo de la escuela de fútbol FútbolPro. Me gustaría dar seguimiento a tu consulta por cupos y entrenamientos. ¿Cómo te podemos ayudar hoy?`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Stage filters
  const interestedLeads = leads.filter(l => l.stage === 'interessado');
  const negotiationLeads = leads.filter(l => l.stage === 'negociacao');
  const registeredLeads = leads.filter(l => l.stage === 'matriculado');

  // Conversion calculations
  const conversionRate = leads.length > 0 ? ((registeredLeads.length / leads.length) * 100).toFixed(0) : '0';

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Top Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">
            Captação de <span className="text-emerald-500">Alunos</span> (Funil)
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Cadastre novos interessados, registre notas táticas ou financeiras e movimente de forma interativa até a matrícula final.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/parents-portal');
              addToast('Link público de reserva de vagas copiado!', 'success');
            }}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white px-4.5 py-2.5 rounded-xl font-bold hover:bg-zinc-800 transition-all text-xs"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            Copiar Link de Matrícula
          </button>
          
          <button 
            onClick={() => handleOpenAddModal()} 
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4.5 py-2.5 rounded-xl font-bold transition-all text-xs shadow-lg shadow-emerald-500/10"
          >
            <UserPlus className="w-4 h-4 text-black shrink-0" />
            Novo Registro de Lead (Estudante)
          </button>
        </div>
      </header>

      {/* Metrics board summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Total no Pipeline</span>
            <p className="text-xl font-display font-black text-white mt-0.5">{leads.length} Contatos</p>
          </div>
          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Em Prospecção</span>
            <p className="text-xl font-display font-black text-amber-400 mt-0.5">{interestedLeads.length + negotiationLeads.length} Alunos</p>
          </div>
          <div className="p-2.5 bg-zinc-905 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Matrículas Fechadas</span>
            <p className="text-xl font-display font-black text-emerald-400 mt-0.5">{registeredLeads.length} Atletas</p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Taxa de Conversão</span>
            <p className="text-xl font-display font-black text-indigo-400 mt-0.5">{conversionRate}%</p>
          </div>
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Interactive Funnel Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: Interessados */}
        <div className="bg-zinc-950/50 border border-zinc-850 rounded-2xl p-5 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">1. Interessados</h3>
            </div>
            <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold text-zinc-400">
              {interestedLeads.length}
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[600px] pr-1.5 custom-scrollbar">
            {interestedLeads.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-center text-zinc-600 font-mono text-xs border-2 border-dashed border-zinc-900/50 rounded-xl bg-zinc-900/10">
                Nenhum lead nesta etapa
              </div>
            ) : (
              interestedLeads.map(lead => renderLeadCard(lead))
            )}
          </div>
        </div>

        {/* COLUMN 2: Em Negociação */}
        <div className="bg-zinc-950/50 border border-zinc-850 rounded-2xl p-5 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">2. Em Negociação</h3>
            </div>
            <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold text-zinc-400">
              {negotiationLeads.length}
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[600px] pr-1.5 custom-scrollbar">
            {negotiationLeads.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-center text-zinc-600 font-mono text-xs border-2 border-dashed border-zinc-900/50 rounded-xl bg-zinc-900/10">
                Nenhum lead nesta etapa
              </div>
            ) : (
              negotiationLeads.map(lead => renderLeadCard(lead))
            )}
          </div>
        </div>

        {/* COLUMN 3: Matriculados */}
        <div className="bg-zinc-950/50 border border-zinc-850 rounded-2xl p-5 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">3. Matriculados 🎉</h3>
            </div>
            <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold text-zinc-400">
              {registeredLeads.length}
            </span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[600px] pr-1.5 custom-scrollbar">
            {registeredLeads.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-center text-zinc-600 font-mono text-xs border-2 border-dashed border-zinc-900/50 rounded-xl bg-zinc-900/10">
                Nenhum lead nesta etapa
              </div>
            ) : (
              registeredLeads.map(lead => renderLeadCard(lead))
            )}
          </div>
        </div>

      </div>

      {/* RENDER LEAD CARD HELPER PATTERN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-100 bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl"
          >
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-display font-bold text-lg text-white mb-6">
              {editingLead ? '✏️ Editar Candidato / Lead' : '⭐️ Novo Registro de Candidato (Lead)'}
            </h3>

            <form onSubmit={handleSaveLeadSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Nome do Aluno / Responsável</label>
                <input 
                  type="text" 
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Ex: João da Silva Santos"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">WhatsApp / Celular</label>
                  <input 
                    type="text" 
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Canal de Origem</label>
                  <select 
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option>Anúncio Instagram</option>
                    <option>Anúncio Facebook</option>
                    <option>Google Maps</option>
                    <option>Indicação Orgânica</option>
                    <option>Panfleto no Bairro</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Estágio Inicial do Funil</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'interessado', label: 'Interessado' },
                    { id: 'negociacao', label: 'Negociação' },
                    { id: 'matriculado', label: 'Matriculado' }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLeadStage(option.id as any)}
                      className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border text-center transition-all ${
                        leadStage === option.id 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Anotações / Requisitos Especiais</label>
                <textarea 
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Ex: Quer fazer teste na categoria sub-13, pai busca facilidades de parcelamento administrativo..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 font-normal"
                />
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold font-sans transition-all border border-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-emerald-500/15"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );

  function renderLeadCard(lead: Lead) {
    return (
      <motion.div 
        key={lead.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-md hover:border-zinc-700 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-display font-extrabold text-sm text-white group-hover:text-emerald-400 leading-tight">
              {lead.name}
            </h4>
            <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 bg-zinc-950 border border-zinc-800/80 px-1.5 py-0.5 rounded mt-1.5 inline-block">
              {lead.source}
            </span>
          </div>

          <div className="flex gap-1.5 shrink-0 text-zinc-500">
            <button 
              onClick={() => handleOpenAddModal(lead)}
              className="p-1 hover:text-white transition-colors"
              title="Editar Lead"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleDeleteLead(lead.id, lead.name)}
              className="p-1 hover:text-rose-400 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {lead.notes && (
          <p className="text-xs text-zinc-400 leading-relaxed bg-[#050a07]/50 border border-zinc-850 p-2.5 rounded-lg">
            {lead.notes}
          </p>
        )}

        {/* Quick contact trigger options */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-850 pt-2.5 mt-2">
          <button 
            onClick={() => sendWhatsappStart(lead)}
            className="flex items-center gap-1 hover:text-emerald-400 uppercase font-black text-[10px] tracking-wider text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            Contatar {lead.phone}
          </button>
          
          <span className="font-mono text-[9px] text-zinc-500">
            Adicionado {lead.dateAdded}
          </span>
        </div>

        {/* Pipeline side arrows for rapid movement */}
        <div className="flex gap-1 pt-1 justify-end border-t border-dashed border-zinc-850/50">
          {lead.stage !== 'interessado' && (
            <button
              onClick={() => shiftLeadStage(lead.id, 'backward')}
              className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg flex items-center justify-center gap-1.5 text-[8.5px] uppercase font-black transition-all"
              title="Mover para esquerda"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}

          {lead.stage !== 'matriculado' && (
            <button
              onClick={() => shiftLeadStage(lead.id, 'forward')}
              className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/20 text-zinc-400 hover:text-emerald-400 rounded-lg flex items-center justify-center gap-1.5 text-[8.5px] uppercase font-black transition-all"
              title="Mover para direita"
            >
              Avançar
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }
}
