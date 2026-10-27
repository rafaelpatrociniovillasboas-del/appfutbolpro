import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, MoreVertical, Edit2, Trash2, X, Download, ClipboardCheck, TrendingUp, FileBarChart, ChevronLeft, ChevronRight, Save, History, Camera, Upload } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useToast } from './Toast';
import { generateAthleteReportPDF } from '../lib/pdf';
import { AttendanceModule } from './AttendanceModule';
import { EvolutionModule } from './EvolutionModule';
import { ReportsModule } from './ReportsModule';
import { getAthletes, addAthlete, updateAthlete, deleteAthlete, Athlete, isActiveStatus } from '../lib/athleteStore';
import { compressImageFile } from '../lib/utils';
import { useSettings } from '../lib/useSettings';

export function CRMModule({ userRole = 'admin' }: { userRole?: 'admin' | 'teacher' }) {
  const settings = useSettings();
  const [activeTab, setActiveTab] = useState<'diretorio' | 'chamada' | 'evolucao' | 'relatorios'>('diretorio');
  const [selectedAthleteDetail, setSelectedAthleteDetail] = useState<Athlete | null>(null);
  const [detailSubTab, setDetailSubTab] = useState<'geral' | 'presencas' | 'avaliacoes'>('geral');
  
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    // Refresh athlete list whenever tab changes or on load or on cloud sync
    const reload = () => setAthletes(getAthletes());
    reload();

    window.addEventListener('cloud_sync_completed', reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener('cloud_sync_completed', reload);
      window.removeEventListener('storage', reload);
    };
  }, [activeTab]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const filtered = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (categoryFilter === 'Todos' || a.category === categoryFilter)
  );

  const handleDelete = (id: number) => {
    const updated = deleteAthlete(id);
    setAthletes(updated);
    addToast('Jugador eliminado con éxito.', 'success');
  };

  const handleOpenModal = (athlete?: any) => {
    setEditingAthlete(athlete || null);
    setPhotoPreview(athlete?.photo && athlete.photo.trim() !== '' ? athlete.photo : null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 280, 280, 0.75);
        setPhotoPreview(compressed);
        addToast('Foto cargada correctamente.', 'success');
      } catch (err) {
        addToast('Error al procesar imagen.', 'error');
      }
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const responsibleName = fd.get('responsibleName') as string || '';
    const phoneValue = fd.get('phone') as string || '+34 600 000 000';

    const baseData = {
      name: fd.get('name') as string,
      category: fd.get('category') as string,
      age: 0,
      position: fd.get('position') as string,
      status: fd.get('status') as 'Ativo' | 'Inativo',
      phone: phoneValue,
      photo: photoPreview ? photoPreview : '',
      birthDate: fd.get('birthDate') as string || undefined,
    };

    if (!baseData.name || !baseData.category || !baseData.position) {
      addToast('Completa los campos obligatorios.', 'error');
      return;
    }

    if (editingAthlete) {
      let currentStatus = editingAthlete.finance?.status || 'Pendente';
      const inputDueDate = fd.get('dueDate') as string || editingAthlete.finance?.dueDate || `10/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
      
      // Auto update status to Atrasado if it was Pendente and past due date
      if (currentStatus === 'Pendente') {
        const parts = inputDueDate.split('/');
        if (parts.length === 3) {
          const dd = parseInt(parts[0], 10);
          const mm = parseInt(parts[1], 10);
          const yy = parseInt(parts[2], 10);
          const now = new Date();
          if (yy < now.getFullYear() || 
             (yy === now.getFullYear() && mm < now.getMonth() + 1) ||
             (yy === now.getFullYear() && mm === now.getMonth() + 1 && now.getDate() > dd)) {
            currentStatus = 'Atrasado';
          }
        }
      }

      const updated = updateAthlete(editingAthlete.id, {
        ...baseData,
        finance: {
          ...editingAthlete.finance,
          responsible: responsibleName || editingAthlete.finance?.responsible || (baseData.name.split(' ')[0] + ' Tutor'),
          amount: fd.get('amount') as string || editingAthlete.finance?.amount || `${settings.currencyCode} 150,00`,
          dueDate: inputDueDate,
          status: currentStatus
        }
      });
      setAthletes(updated);
      if (selectedAthleteDetail && selectedAthleteDetail.id === editingAthlete.id) {
        const found = updated.find(a => a.id === editingAthlete.id);
        if (found) setSelectedAthleteDetail(found);
      }
      addToast('¡Jugador actualizado con éxito!', 'success');
    } else {
      const updated = addAthlete({
        ...baseData,
        responsibleName: responsibleName,
        amount: fd.get('amount') as string || `${settings.currencyCode} 150,00`,
        dueDate: fd.get('dueDate') as string || `10/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
      });
      setAthletes(updated);
      addToast('¡Nuevo jugador registrado!', 'success');
    }
    setIsModalOpen(false);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    e.target.value = v;
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

  return (
    selectedAthleteDetail ? (
      <div className="p-4 sm:p-6 max-w-lg mx-auto bg-[#050a07] text-white min-h-screen pb-24">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setSelectedAthleteDetail(null)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-bold text-sm focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-emerald-500" />
            <span>Jugador</span>
          </button>
          
          <button 
            onClick={() => {
              generateAthleteReportPDF(selectedAthleteDetail);
              addToast(`¡Informe de ${selectedAthleteDetail.name} generado!`, 'success');
            }}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all focus:outline-none"
            title="Guardar Informe PDF"
          >
            <Save className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#0a1810] border-2 border-emerald-500/30 flex items-center justify-center text-2xl font-black text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10 overflow-hidden">
            {selectedAthleteDetail.photo && selectedAthleteDetail.photo.trim() !== '' ? (
              <img src={selectedAthleteDetail.photo} alt={selectedAthleteDetail.name} className="w-full h-full object-cover" />
            ) : (
              selectedAthleteDetail.name.charAt(0)
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{selectedAthleteDetail.name}</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono font-bold tracking-wider uppercase">
            {selectedAthleteDetail.category} • {selectedAthleteDetail.position}
          </p>
          {selectedAthleteDetail.birthDate && (
            <p className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
              Nacimiento: {selectedAthleteDetail.birthDate.split('-').reverse().join('/')}
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 bg-zinc-950 border border-zinc-850 p-1.5 rounded-2xl mb-8">
          {(['geral', 'presencas', 'avaliacoes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailSubTab(tab)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all capitalize focus:outline-none ${
                detailSubTab === tab 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === 'presencas' ? 'Asistencias' : tab === 'avaliacoes' ? 'Evaluaciones' : 'General'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {detailSubTab === 'geral' && (
            <>
              {/* Frequency Radial Widget */}
              <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 font-mono">Asistencia</h3>
                <div className="flex items-center gap-6">
                  {/* Circle progress ring */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-400"
                        strokeWidth="3.5"
                        strokeDasharray="85, 100"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-md font-black text-white">85%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Presentismo</h4>
                    <p className="text-xs text-emerald-400 font-bold mt-1 font-mono flex items-center gap-1">
                      <span>▲</span> +5% este mes
                    </p>
                  </div>
                </div>
              </div>

              {/* Dados do Atleta */}
              <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">Datos del Registro</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Nacimiento</span>
                    <span className="text-zinc-200 font-bold block font-mono text-sm">
                      {selectedAthleteDetail.birthDate 
                        ? selectedAthleteDetail.birthDate.split('-').reverse().join('/') 
                        : 'No registrado'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Contacto (WhatsApp)</span>
                    <span className="text-zinc-200 font-bold block font-mono text-sm">{selectedAthleteDetail.phone || 'No informado'}</span>
                  </div>
                  <div className="space-y-1 col-span-2 border-t border-zinc-900/60 pt-3">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Tutor / Responsable Legal</span>
                    <span className="text-zinc-200 font-bold block text-sm">{selectedAthleteDetail.finance?.responsible || 'No informado'}</span>
                  </div>
                  {userRole !== 'teacher' && (
                    <div className="space-y-1 col-span-2 border-t border-zinc-900/60 pt-3">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Cuota / Día de Vencimiento</span>
                      <span className="text-zinc-200 font-bold block text-sm">
                        {selectedAthleteDetail.finance?.amount || `${settings.currencyCode} 150,00`} • Vence: {selectedAthleteDetail.finance?.dueDate || 'Día 10'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Desempenho Chart */}
              <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">Rendimiento</h3>
                  <span className="text-[10px] text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl">
                    Últimos 4 meses
                  </span>
                </div>

                {/* Styled Sparkline with Dots */}
                <div className="pt-2">
                  <div className="h-28 flex items-end justify-between relative pb-4 px-2 border-b border-zinc-850/60">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.02]">
                      <div className="border-b border-white w-full h-px"></div>
                      <div className="border-b border-white w-full h-px"></div>
                      <div className="border-b border-white w-full h-px"></div>
                    </div>

                    <svg className="absolute inset-0 w-full h-full shrink-0" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <path d="M 10 75 Q 75 35 150 60 T 290 25" stroke="#10b981" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                      <circle cx="10" cy="75" r="4.5" className="fill-emerald-400 stroke-zinc-950 stroke-2" />
                      <circle cx="95" cy="42" r="4.5" className="fill-emerald-400 stroke-zinc-950 stroke-2" />
                      <circle cx="170" cy="58" r="4.5" className="fill-emerald-400 stroke-zinc-950 stroke-2" />
                      <circle cx="290" cy="25" r="4.5" className="fill-emerald-400 stroke-zinc-950 stroke-2" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-500 mt-2.5 px-1 font-mono">
                    <span>Mar</span>
                    <span>Abr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>

              {/* Chevron Link Items */}
              <div className="space-y-2.5">
                {[
                  { label: 'Evaluaciones Técnicas', icon: ClipboardCheck, color: 'text-emerald-400' },
                  { label: 'Historial de Asistencias', icon: History, color: 'text-emerald-400' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.label.includes('Evaluaciones')) {
                          setDetailSubTab('avaliacoes');
                        } else if (item.label.includes('Historial')) {
                          setDetailSubTab('presencas');
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all group focus:outline-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <Icon className="w-4.5 h-4.5 text-emerald-400" />
                        </div>
                        <span className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-all group-hover:translate-x-1" />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {detailSubTab === 'presencas' && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono mb-2">Asistencias Recientes</h3>
              {selectedAthleteDetail.presenceHistory && selectedAthleteDetail.presenceHistory.length > 0 ? (
                selectedAthleteDetail.presenceHistory.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl">
                    <span className="font-bold text-sm text-zinc-200">{h.date}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      h.present 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {h.present ? 'Presente' : 'Ausente'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-800/40 rounded-2xl bg-zinc-900/10 text-zinc-500 text-xs font-semibold">
                  Ningún registro de asistencia encontrado para este jugador.
                </div>
              )}
            </div>
          )}

          {detailSubTab === 'avaliacoes' && (
            <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-mono mb-2">Parámetros Técnicos</h3>
              {[
                { label: 'Velocidad', val: selectedAthleteDetail.ratings?.speed || 75 },
                { label: 'Pase y Control', val: selectedAthleteDetail.ratings?.passing || 85 },
                { label: 'Definición', val: selectedAthleteDetail.ratings?.shooting || 72 },
                { label: 'Agilidad Física', val: selectedAthleteDetail.ratings?.agility || 90 },
                { label: 'Comprensión Táctica', val: selectedAthleteDetail.ratings?.tactics || 70 },
                { label: 'Recuperación Defensiva', val: selectedAthleteDetail.ratings?.tackling || 65 },
              ].map((attr) => (
                <div key={attr.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">{attr.label}</span>
                    <span className="text-emerald-400 font-mono">{attr.val}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 border border-zinc-800/40 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${attr.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="p-3 sm:p-6 lg:p-10 max-w-7xl mx-auto relative h-auto md:h-full flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">Gestión de Jugadores</h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-0.5 sm:mt-1">Directorio, Asistencias, Evolución e Informes.</p>
        </div>
        {activeTab === 'diretorio' && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 bg-emerald-500 text-[#050a07] px-3.5 py-2 rounded-xl text-xs font-black hover:bg-emerald-400 transition-colors focus:outline-none"
          >
            <Plus className="w-4 h-4" /> Nuevo Jugador
          </button>
        )}
      </header>

      {/* Internal Navigation */}
      <div className="flex gap-1 sm:gap-2 border-b border-zinc-800 pb-px mb-4 sm:mb-8 overflow-x-auto scollbar-thin shrink-0">
         <button onClick={() => setActiveTab('diretorio')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'diretorio' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
            <Users className="w-3.5 h-3.5" /> Directorio CRM
         </button>
         <button onClick={() => setActiveTab('chamada')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'chamada' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
            <ClipboardCheck className="w-3.5 h-3.5" /> Asistencias
         </button>
         <button onClick={() => setActiveTab('evolucao')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'evolucao' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
            <TrendingUp className="w-3.5 h-3.5" /> Evolución Técnica
         </button>
         <button onClick={() => setActiveTab('relatorios')} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'relatorios' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
            <FileBarChart className="w-3.5 h-3.5" /> Informes
         </button>
      </div>

      <div className="flex-1 md:min-h-0 md:overflow-y-auto pb-24 lg:pb-0 custom-scrollbar">
        {activeTab === 'diretorio' && (
          <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Buscar jugador por nombre..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 rounded-xl px-3 py-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select 
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none text-sm font-medium"
                >
                  <option value="Todos" className="bg-zinc-900 text-white">Todas las Categorías</option>
                  <option value="Sub-6" className="bg-zinc-900 text-white">Sub-6</option>
                  <option value="Sub-7" className="bg-zinc-900 text-white">Sub-7</option>
                  <option value="Sub-8" className="bg-zinc-900 text-white">Sub-8</option>
                  <option value="Sub-9" className="bg-zinc-900 text-white">Sub-9</option>
                  <option value="Sub-10" className="bg-zinc-900 text-white">Sub-10</option>
                  <option value="Sub-11" className="bg-zinc-900 text-white">Sub-11</option>
                  <option value="Sub-12" className="bg-zinc-900 text-white">Sub-12</option>
                  <option value="Sub-13" className="bg-zinc-900 text-white">Sub-13</option>
                  <option value="Sub-14" className="bg-zinc-900 text-white">Sub-14</option>
                  <option value="Sub-15" className="bg-zinc-900 text-white">Sub-15</option>
                  <option value="Sub-16" className="bg-zinc-900 text-white">Sub-16</option>
                  <option value="Sub-17" className="bg-zinc-900 text-white">Sub-17</option>
                  <option value="Sub-18" className="bg-zinc-900 text-white">Sub-18</option>
                  <option value="Sub-20" className="bg-zinc-900 text-white">Sub-20</option>
                  <option value="Sub-23" className="bg-zinc-900 text-white">Sub-23</option>
                  <option value="Adulto" className="bg-zinc-900 text-white">Adulto</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-900/50 text-zinc-300 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-tl-xl text-left">Nombre del Jugador</th>
                    <th className="px-4 py-3 hidden md:table-cell">Categoría</th>
                    <th className="px-4 py-3 hidden md:table-cell">Posición</th>
                    <th className="px-4 py-3 hidden md:table-cell">Estado</th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right rounded-tr-xl">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtered.map((athlete, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={athlete.id} 
                      className="hover:bg-zinc-900/30 transition-colors"
                    >
                      <td onClick={() => setSelectedAthleteDetail(athlete)} className="px-3 sm:px-4 py-2.5 sm:py-4 font-bold text-white cursor-pointer hover:text-emerald-400 group/name">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0a1810] border border-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-extrabold font-mono flex-shrink-0 overflow-hidden">
                            {athlete.photo && athlete.photo.trim() !== '' ? (
                              <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
                            ) : (
                              athlete.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-100 block transition-colors text-xs sm:text-sm">{athlete.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono font-medium block mt-0.5 md:hidden">
                              {athlete.category} • {athlete.position}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
                          {athlete.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-300 hidden md:table-cell">{athlete.position}</td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`px-2 py-1 flex items-center gap-1.5 w-fit rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          isActiveStatus(athlete.status) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isActiveStatus(athlete.status) ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {isActiveStatus(athlete.status) ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5 sm:py-4 text-right">
                        <div className="flex justify-end gap-1.5 sm:gap-2 text-zinc-500">
                          <button onClick={() => { generateAthleteReportPDF(athlete); addToast('Informe generado', 'success'); }} className="hover:text-emerald-400 transition-colors p-1.5 focus:outline-none" title="Generar PDF"><Download className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenModal(athlete)} className="hover:text-emerald-400 transition-colors p-1.5 focus:outline-none" title="Editar"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(athlete.id)} className="hover:text-rose-400 transition-colors p-1.5 focus:outline-none" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
                        Ningún jugador encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chamada' && <AttendanceModule inline />}
        {activeTab === 'evolucao' && <EvolutionModule inline />}
        {activeTab === 'relatorios' && <ReportsModule inline />}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[85vh] sm:max-h-[88vh] flex flex-col shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white focus:outline-none bg-zinc-900 rounded-full p-1.5 z-30"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-display font-black text-white mb-4 shrink-0 pr-8">
              {editingAthlete ? 'Editar Jugador' : 'Nuevo Jugador'}
            </h2>
            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 pb-4 overscroll-contain touch-pan-y">
                {/* Photo Upload Section */}
                <div className="flex items-center gap-4 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="relative w-14 h-14 rounded-full bg-zinc-800 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center shrink-0">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Foto del jugador" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold text-zinc-300 block">Foto del Jugador (Opcional)</span>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Subir Foto
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                      {photoPreview && (
                        <button type="button" onClick={() => setPhotoPreview(null)} className="text-zinc-500 hover:text-rose-400 text-xs font-bold transition-colors">
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Nombre Completo</label>
                  <input required name="name" defaultValue={editingAthlete?.name} type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Categoría</label>
                    <select required name="category" defaultValue={editingAthlete?.category || 'Sub-15'} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none">
                      <option className="bg-zinc-900 text-white">Sub-6</option>
                      <option className="bg-zinc-900 text-white">Sub-7</option>
                      <option className="bg-zinc-900 text-white">Sub-8</option>
                      <option className="bg-zinc-900 text-white">Sub-9</option>
                      <option className="bg-zinc-900 text-white">Sub-10</option>
                      <option className="bg-zinc-900 text-white">Sub-11</option>
                      <option className="bg-zinc-900 text-white">Sub-12</option>
                      <option className="bg-zinc-900 text-white">Sub-13</option>
                      <option className="bg-zinc-900 text-white">Sub-14</option>
                      <option className="bg-zinc-900 text-white">Sub-15</option>
                      <option className="bg-zinc-900 text-white">Sub-16</option>
                      <option className="bg-zinc-900 text-white">Sub-17</option>
                      <option className="bg-zinc-900 text-white">Sub-18</option>
                      <option className="bg-zinc-900 text-white">Sub-20</option>
                      <option className="bg-zinc-900 text-white">Sub-23</option>
                      <option className="bg-zinc-900 text-white">Adulto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Fecha de Nacimiento</label>
                    <input name="birthDate" defaultValue={editingAthlete?.birthDate} type="date" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Posición</label>
                    <select required name="position" defaultValue={editingAthlete?.position || 'Delantero Centro'} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none">
                      {editingAthlete?.position && !['Portero', 'Lateral Derecho', 'Defensa Central', 'Lateral Izquierdo', 'Mediocentro Defensivo', 'Mediocentro', 'Mediapunta', 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro', 'Polivalente'].includes(editingAthlete.position) && (
                        <option value={editingAthlete.position} className="bg-zinc-900 text-white">{editingAthlete.position}</option>
                      )}
                      <option value="Portero" className="bg-zinc-900 text-white">Portero (POR)</option>
                      <option value="Lateral Derecho" className="bg-zinc-900 text-white">Lateral Derecho (LD)</option>
                      <option value="Defensa Central" className="bg-zinc-900 text-white">Defensa Central (DEF)</option>
                      <option value="Lateral Izquierdo" className="bg-zinc-900 text-white">Lateral Izquierdo (LI)</option>
                      <option value="Mediocentro Defensivo" className="bg-zinc-900 text-white">Mediocentro Defensivo (MCD)</option>
                      <option value="Mediocentro" className="bg-zinc-900 text-white">Mediocentro Organizador (MC)</option>
                      <option value="Mediapunta" className="bg-zinc-900 text-white">Mediapunta (MPO)</option>
                      <option value="Extremo Derecho" className="bg-zinc-900 text-white">Extremo Derecho (ED)</option>
                      <option value="Extremo Izquierdo" className="bg-zinc-900 text-white">Extremo Izquierdo (EI)</option>
                      <option value="Delantero Centro" className="bg-zinc-900 text-white">Delantero Centro (DC)</option>
                      <option value="Polivalente" className="bg-zinc-900 text-white">Polivalente / Comodín</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Estado</label>
                    <select name="status" defaultValue={editingAthlete?.status || 'Ativo'} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none">
                      <option value="Ativo" className="bg-zinc-900 text-white">Activo</option>
                      <option value="Inativo" className="bg-zinc-900 text-white">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Tutor / Responsable</label>
                    <input name="responsibleName" defaultValue={editingAthlete?.finance?.responsible || ''} type="text" placeholder="Ej: Padre o Madre" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Teléfono / WhatsApp</label>
                    <input required name="phone" defaultValue={editingAthlete?.phone || ''} onChange={handlePhoneInput} type="text" placeholder="Ej: +34 600 000 000" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none font-mono" />
                  </div>
                </div>
                {userRole !== 'teacher' && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Cuota</label>
                      <input name="amount" defaultValue={editingAthlete?.finance?.amount || `${settings.currencyCode} 150,00`} onChange={handleAmountInput} onBlur={handleAmountBlur} type="text" placeholder={`Ej: ${settings.currencyCode} 150,00`} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Fecha Vencimiento</label>
                      <input name="dueDate" defaultValue={editingAthlete?.finance?.dueDate || `10/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`} type="text" placeholder="Ej: 10/06/2026" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-none font-mono" />
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-3 pb-1 flex gap-3 shrink-0 border-t border-zinc-800 bg-zinc-950 sticky bottom-0 z-20 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors focus:outline-none text-xs sm:text-sm">Cancelar</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors focus:outline-none text-xs sm:text-sm shadow-lg shadow-emerald-500/20">Guardar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    )
  );
}
