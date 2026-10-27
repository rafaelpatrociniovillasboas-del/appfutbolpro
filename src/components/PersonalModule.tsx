import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Calendar, 
  Plus, 
  TrendingUp, 
  Clock, 
  Check, 
  Trash2, 
  X, 
  Activity, 
  ShieldCheck, 
  Award,
  ChevronRight,
  User,
  Heart,
  Scale
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useToast } from './Toast';

interface PersonalClient {
  id: string;
  name: string;
  packageTotal: number;
  packageRemaining: number;
  weight: number; // kg
  height: number; // cm
  bodyFatPercent: number; // %
  muscleMassPercent: number; // %
  lastEvaluation: string;
}

interface PersonalSession {
  id: string;
  clientName: string;
  date: string;
  time: string;
  objective: string;
  isCompleted: boolean;
}

const DEFAULT_CLIENTS: PersonalClient[] = [
  { id: 'pc1', name: 'Alvaro Souza', packageTotal: 10, packageRemaining: 7, weight: 78.5, height: 178, bodyFatPercent: 14.5, muscleMassPercent: 44.2, lastEvaluation: '01/06/2026' },
  { id: 'pc2', name: 'Rodrigo Mello', packageTotal: 12, packageRemaining: 4, weight: 82.1, height: 182, bodyFatPercent: 16.8, muscleMassPercent: 42.1, lastEvaluation: '03/06/2026' },
  { id: 'pc3', name: 'Carlos Henrique', packageTotal: 8, packageRemaining: 8, weight: 71.3, height: 175, bodyFatPercent: 11.2, muscleMassPercent: 47.5, lastEvaluation: '04/06/2026' }
];

const DEFAULT_SESSIONS: PersonalSession[] = [
  { id: 'ps1', clientName: 'Alvaro Souza', date: '2026-06-05', time: '08:00', objective: 'Aceleração Lateral e Resistência Física', isCompleted: false },
  { id: 'ps2', clientName: 'Rodrigo Mello', date: '2026-06-05', time: '10:30', objective: 'Posicionamento do corpo e passes curtos', isCompleted: false },
  { id: 'ps3', clientName: 'Carlos Henrique', date: '2026-06-06', time: '14:00', objective: 'Finalização Direta e Cabeceio sob impacto', isCompleted: false }
];

export function PersonalModule() {
  const { addToast } = useToast();
  const [clients, setClients] = useState<PersonalClient[]>([]);
  const [sessions, setSessions] = useState<PersonalSession[]>([]);
  const [activeTab, setActiveTab] = useState<'clientes' | 'agenda'>('clientes');

  // Modal forms
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Client form states
  const [clientName, setClientName] = useState('');
  const [clientPackage, setClientPackage] = useState('10');
  const [clientWeight, setClientWeight] = useState('75');
  const [clientHeight, setClientHeight] = useState('180');
  const [clientBF, setClientBF] = useState('14');
  const [clientMM, setClientMM] = useState('43');

  // Session form states
  const [sessionClientName, setSessionClientName] = useState('');
  const [sessionDate, setSessionDate] = useState('2026-06-05');
  const [sessionTime, setSessionTime] = useState('09:00');
  const [sessionObjective, setSessionObjective] = useState('');

  useEffect(() => {
    const savedClients = localStorage.getItem('drillforge_p_clients');
    const savedSessions = localStorage.getItem('drillforge_p_sessions');
    
    if (savedClients) setClients(JSON.parse(savedClients));
    else {
      setClients(DEFAULT_CLIENTS);
      localStorage.setItem('drillforge_p_clients', JSON.stringify(DEFAULT_CLIENTS));
    }

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    else {
      setSessions(DEFAULT_SESSIONS);
      localStorage.setItem('drillforge_p_sessions', JSON.stringify(DEFAULT_SESSIONS));
    }
  }, []);

  const saveClients = (newClients: PersonalClient[]) => {
    setClients(newClients);
    localStorage.setItem('drillforge_p_clients', JSON.stringify(newClients));
  };

  const saveSessions = (newSessions: PersonalSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('drillforge_p_sessions', JSON.stringify(newSessions));
  };

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      addToast('Nome é obrigatório!', 'error');
      return;
    }

    const newClient: PersonalClient = {
      id: `pc-${Date.now()}`,
      name: clientName.trim(),
      packageTotal: Number(clientPackage) || 10,
      packageRemaining: Number(clientPackage) || 10,
      weight: Number(clientWeight) || 75,
      height: Number(clientHeight) || 178,
      bodyFatPercent: Number(clientBF) || 14,
      muscleMassPercent: Number(clientMM) || 44,
      lastEvaluation: new Date().toLocaleDateString('pt-BR')
    };

    saveClients([...clients, newClient]);
    addToast(`Cliente ${clientName} cadastrado com sucesso!`, 'success');
    setIsClientModalOpen(false);
    
    // reset
    setClientName('');
  };

  const handleAddSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionClientName) {
      addToast('Selecione um cliente!', 'error');
      return;
    }

    const newSession: PersonalSession = {
      id: `ps-${Date.now()}`,
      clientName: sessionClientName,
      date: sessionDate,
      time: sessionTime,
      objective: sessionObjective.trim() || 'Aperfeiçoamento Técnico Geral',
      isCompleted: false
    };

    saveSessions([...sessions, newSession]);
    addToast('Treino 1v1 agendado com sucesso!', 'success');
    setIsSessionModalOpen(false);
    setSessionObjective('');
  };

  const handleConsumeSession = (clientId: string) => {
    const updated = clients.map(c => {
      if (c.id === clientId) {
        if (c.packageRemaining <= 0) {
          addToast(`O cliente ${c.name} esgotou o saldo de treinos do pacote!`, 'error');
          return c;
        }
        addToast(`Aula contabilizada para ${c.name}. Saldo: ${c.packageRemaining - 1}/${c.packageTotal} restante.`, 'success');
        return { ...c, packageRemaining: c.packageRemaining - 1 };
      }
      return c;
    });
    saveClients(updated);
  };

  const handleAddSessionCredits = (clientId: string, count: number) => {
    const updated = clients.map(c => {
      if (c.id === clientId) {
        addToast(`Renovado pacote de ${c.name}: +${count} créditos adicionados.`, 'success');
        return { 
          ...c, 
          packageTotal: c.packageTotal + count, 
          packageRemaining: c.packageRemaining + count 
        };
      }
      return c;
    });
    saveClients(updated);
  };

  const handleMarkSessionCompleted = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Try to decrement client credits from package if client matches
    const matchedClient = clients.find(c => c.name.toLowerCase() === session.clientName.toLowerCase());
    
    const updated = sessions.map(s => s.id === sessionId ? { ...s, isCompleted: true } : s);
    saveSessions(updated);
    
    if (matchedClient) {
      handleConsumeSession(matchedClient.id);
    } else {
      addToast('Sessão marcada como concluída!', 'info');
    }
  };

  const handleDeleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    saveSessions(filtered);
    addToast('Agendamento cancelado.', 'info');
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header Info */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight uppercase">
            Painel <span className="text-emerald-500">Personal Trainer</span> OS
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Gargalhos resolvidos: controle físico de avaliações corporais avançadas, agendamentos 1v1 dinâmicos e controle rigoroso de saldo de pacotes.
          </p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'clientes' ? (
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4.5 py-2.5 rounded-xl font-bold transition-all text-xs shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              Novo Aluno Particular
            </button>
          ) : (
            <button
              onClick={() => {
                if (clients.length === 0) {
                  addToast('Cadastre ao menos um aluno particular primeiro!', 'error');
                  return;
                }
                setSessionClientName(clients[0].name);
                setIsSessionModalOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4.5 py-2.5 rounded-xl font-bold transition-all text-xs shadow-lg shadow-emerald-500/10"
            >
              <Calendar className="w-4 h-4" />
              Agendar Treino Particular (1v1)
            </button>
          )}
        </div>
      </header>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-850 gap-6">
        <button
          onClick={() => setActiveTab('clientes')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider relative transition-all ${
            activeTab === 'clientes' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {activeTab === 'clientes' && (
            <motion.div layoutId="personalActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
          📋 Meus Clientes ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab('agenda')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider relative transition-all ${
            activeTab === 'agenda' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {activeTab === 'agenda' && (
            <motion.div layoutId="personalActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
          ⌚ Agenda das Próximas Sessões ({sessions.filter(s => !s.isCompleted).length})
        </button>
      </div>

      {activeTab === 'clientes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {clients.length === 0 ? (
            <div className="col-span-1 lg:col-span-3 text-center p-12 bg-zinc-950/40 border border-zinc-850 rounded-2xl text-zinc-500 space-y-4">
              <Scale className="w-12 h-12 mx-auto text-zinc-650" />
              <h3 className="font-display font-bold text-white text-md">Nenhum aluno de Personal cadastrado</h3>
              <p className="text-xs max-w-sm mx-auto">Comece adicionando alunos para controlar avaliações de bioimpedância e saldos de créditos de treinos.</p>
            </div>
          ) : (
            clients.map(client => (
              <div key={client.id} className="bg-zinc-950/40 border border-zinc-850 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-extrabold text-white text-md">{client.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-semibold font-mono">Cadastrado: {client.lastEvaluation}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase font-mono tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md">
                      Particular
                    </span>
                  </div>

                  {/* Sessions left tracker tracker */}
                  <div className="mt-4 bg-[#050a07] border border-zinc-850 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest font-mono">Créditos Disponíveis</span>
                      <p className="text-md font-display font-black text-white mt-0.5">{client.packageRemaining} de {client.packageTotal} aulas</p>
                    </div>
                    <button
                      onClick={() => handleConsumeSession(client.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider"
                    >
                      Check-In
                    </button>
                  </div>

                  {/* Physical Bioimpedance Parameters */}
                  <div className="mt-4.5 space-y-3.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block font-mono">Última Avaliação Física</span>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900 transition-colors hover:border-zinc-800">
                        <span className="text-[9px] text-zinc-500 font-semibold uppercase block leading-none">Peso / Altura</span>
                        <p className="text-xs font-bold text-zinc-300 mt-1">{client.weight} kg @ {client.height} cm</p>
                      </div>
                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900 transition-colors hover:border-zinc-800">
                        <span className="text-[9px] text-zinc-500 font-semibold uppercase block leading-none">Gordura Corporal</span>
                        <p className="text-xs font-bold text-amber-500 mt-1">{client.bodyFatPercent}% BF</p>
                      </div>
                      <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900 transition-colors hover:border-zinc-800 col-span-2 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] text-zinc-500 font-semibold uppercase block leading-none">Massa Muscular</span>
                          <p className="text-xs font-bold text-emerald-400 mt-1">{client.muscleMassPercent}% MM</p>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-400 font-mono">Atleta Saudável ✓</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-zinc-900">
                  <button
                    onClick={() => handleAddSessionCredits(client.id, 5)}
                    className="flex-1 py-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-850 rounded-xl text-[10px] font-bold transition-all text-center font-mono uppercase"
                  >
                    +5 Créditos
                  </button>
                  <button
                    onClick={() => handleAddSessionCredits(client.id, 10)}
                    className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/20 text-emerald-500 hover:text-emerald-400 rounded-xl text-[10px] font-bold transition-all text-center font-mono uppercase"
                  >
                    Renovar Pacote
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* SESSIONS TAB SCHEDULES */
        <div className="space-y-4">
          <div className="bg-zinc-950/50 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-zinc-900/30 border-b border-zinc-850 flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">🗓️ Sessões Reservadas</h3>
              <span className="bg-zinc-900 text-zinc-500 px-3 py-0.5 rounded text-xs font-bold">1v1 Personal Ativo</span>
            </div>

            <div className="divide-y divide-zinc-900">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">Agenda livre de treinos no momento</div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${session.isCompleted ? 'bg-zinc-950/20 opacity-50' : 'bg-transparent'}`}>
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-extrabold text-sm text-zinc-200">{session.clientName}</span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono font-bold">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{session.date} - {session.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400">Objetivo Técnico: {session.objective}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
                      {session.isCompleted ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-bold uppercase flex items-center gap-1.5">
                          <Check className="w-3 h-3" /> Realizado & Integrado
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleMarkSessionCompleted(session.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                          >
                            Concluir Prática
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW CLIENT DIALOG */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4"
          >
            <button onClick={() => setIsClientModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-white">📋 Novo Aluno Particular (Personal)</h3>
            
            <form onSubmit={handleAddClientSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Nome do Aluno</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Heitor Silva"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Créditos Iniciais / Aulas</label>
                  <input
                    type="number"
                    value={clientPackage}
                    onChange={(e) => setClientPackage(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Altura do Aluno (cm)</label>
                  <input
                    type="number"
                    value={clientHeight}
                    onChange={(e) => setClientHeight(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={clientWeight}
                    onChange={(e) => setClientWeight(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Gordura %</label>
                  <input
                    type="number"
                    value={clientBF}
                    onChange={(e) => setClientBF(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Músculo %</label>
                  <input
                    type="number"
                    value={clientMM}
                    onChange={(e) => setClientMM(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* NEW SESSION DIALOG */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl space-y-4"
          >
            <button onClick={() => setIsSessionModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-white">🗓️ Reservar Sessão Particular (1v1)</h3>

            <form onSubmit={handleAddSessionSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Escolha o Aluno</label>
                <select
                  value={sessionClientName}
                  onChange={(e) => setSessionClientName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300"
                >
                  {clients.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Data</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Horário</label>
                  <input
                    type="time"
                    required
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Foco / Objetivo de Hoje</label>
                <input
                  type="text"
                  value={sessionObjective}
                  onChange={(e) => setSessionObjective(e.target.value)}
                  placeholder="Ex: Treino forte de arrancada e finalização"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
