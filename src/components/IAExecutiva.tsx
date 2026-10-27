import React, { useState } from 'react';
import * as motion from 'motion/react-client';
import { Bot, Send, Sparkles, User, BrainCircuit } from 'lucide-react';
import { getAthletes } from '../lib/athleteStore';
import { generateLocalAssistantResponse } from '../lib/assistant';
import { useSettings } from '../lib/useSettings';

export function IAExecutiva() {
  const settings = useSettings();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy Manu, tu asistente en FútbolPro. ¿Cómo puedo ayudarte con tu escuela hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent, presetInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetInput || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    // Gather dynamic app state context
    const currentAthletes = getAthletes();
    const latePaymentAthletes = currentAthletes.filter(a => a.finance?.status === 'Atrasado' || a.finance?.status === 'Atrasado/Pendiente');
    const lazyLateList = latePaymentAthletes.map(a => `${a.name} (${a.category} - Responsable: ${a.finance?.responsible || 'N/A'}, Tel: ${a.phone || 'N/A'}, Deuda: ${a.finance?.amount || `${settings.currencyCode} 150`})`);
    
    const rawLeads = localStorage.getItem('drillforge_leads_v1');
    let leadsOverviewList = "Juan Pérez (Interesado), María Santos (En Negociación)";
    if (rawLeads) {
      try {
        const parsed = JSON.parse(rawLeads);
        leadsOverviewList = parsed.map((l: any) => `${l.name} (Etapa: ${l.stage === 'interessado' || l.stage === 'interesado' ? 'Interesado' : l.stage === 'negociacao' || l.stage === 'negociacion' ? 'En Negociación' : 'Inscrito'}, Tel: ${l.phone || 'N/A'})`).join(', ');
      } catch (_) {}
    }

    // Fetch calendar events dynamically to give Manu offline access
    let guestUid = '';
    try {
      const guestObj = localStorage.getItem('drillforge_guest_user');
      if (guestObj) {
        const parsed = JSON.parse(guestObj);
        guestUid = parsed?.uid || '';
      }
    } catch (_) {}
    const calendarKey = guestUid ? `trainer_calendar_events_user_${guestUid}` : 'trainer_calendar_events';
    const rawEvents = localStorage.getItem(calendarKey);
    let eventsSummary = 'Ningún entrenamiento programado';
    if (rawEvents) {
      try {
        const parsedEvts = JSON.parse(rawEvents);
        if (Array.isArray(parsedEvts) && parsedEvts.length > 0) {
          eventsSummary = parsedEvts.map((e: any) => `${e.title} el día ${e.dateStr} a las ${e.time || 'N/A'} (Categoría: ${e.category || 'General'})`).join(' | ');
        }
      } catch (_) {}
    }

    const compositeContext = `
      DATOS DE HOY DE FÚTBOLPRO:
      - TOTAL ALUMNOS ACTIVOS: ${currentAthletes.filter(a => a.status === 'Ativo' || a.status === 'Activo').length}
      - LISTA DE ALUMNOS CON CUOTAS ATRASADAS (FINANZAS): ${lazyLateList.join(' | ') || 'Ninguno con cuota en mora'}
      - ALUMNOS PENDIENTES DE REGISTRO O PAGO: ${currentAthletes.filter(a => a.finance?.status === 'Pendente' || a.finance?.status === 'Pendiente').map(a => a.name).join(', ')}
      - PIPELINE DE PROSPECCIÓN ACTUAL (CAPTACIÓN DE ALUMNOS): ${leadsOverviewList || 'Sin prospectos registrados'}
      - ENTRENAMIENTOS PROGRAMADOS / PLANIFICADOR: ${eventsSummary}
    `;

    // Helper function to call the assistant locally
    const getLocalResponse = (message: string, context: string) => {
      return generateLocalAssistantResponse(message, context);
    };

    const responseText = getLocalResponse(textToSend, compositeContext);
    
    const cleanReply = responseText.replace(/\*/g, '');
    setMessages([...newMessages, { role: 'assistant', text: cleanReply }]);
    setIsLoading(false);
  };

  const handleSuggestion = (s: string) => {
    handleSend(undefined, s);
  };

  const suggestions = [
    "¿Qué alumnos tienen cuotas pendientes o en mora?",
    "¿Quién tiene pagos atrasados en el registro?",
    "Crea un plan rápido de entrenamiento de definición y tiro",
    "¿Cuántos prospectos tenemos en el embudo de captación?",
    "Dame un resumen general de la escuela"
  ];

  return (
    <div className="flex flex-col h-full bg-[#050a07] max-w-5xl mx-auto border-x border-zinc-800/50">
      <header className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white tracking-tight flex items-center gap-1.5">
            Manu <Sparkles className="w-3 h-3 text-amber-400" />
          </h1>
          <p className="text-xs font-medium text-zinc-500">Tu asistente personal</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-emerald-500" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-zinc-950/80 border-t border-zinc-800 shrink-0">
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide md:flex-wrap">
            {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSuggestion(s)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full text-[11px] font-bold tracking-wide hover:bg-zinc-800 hover:text-emerald-400 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                    {s}
                </button>
            ))}
        </div>
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="¿Cómo puedo ayudar a tu equipo hoy?"
            className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 w-12 bg-emerald-500 rounded-xl flex items-center justify-center text-[#050a07] disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
