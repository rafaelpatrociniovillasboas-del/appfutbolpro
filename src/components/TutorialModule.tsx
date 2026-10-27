import React, { useState } from 'react';
import { 
  BookOpen, 
  Dumbbell, 
  Users, 
  CreditCard, 
  Bot, 
  Smartphone, 
  ArrowRight, 
  ChevronDown, 
  Check, 
  Sparkles,
  Printer,
  ShieldCheck,
  PlayCircle
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { ModuleId } from './PlatformLayout';

interface TutorialModuleProps {
  onNavigate?: (module: ModuleId | string) => void;
}

export function TutorialModule({ onNavigate }: TutorialModuleProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      number: '1',
      title: 'Elige o Crea tus Entrenamientos',
      summary: 'Accede a ejercicios listos con pizarra táctica o crea tu propia sesión en minutos.',
      icon: Dumbbell,
      badge: 'Biblioteca & Planificador',
      targetModule: 'library',
      buttonText: 'Ir a Entrenamientos',
      items: [
        'Explora cientos de ejercicios clasificados por categoría (Técnica, Táctica, Físico) y edad.',
        'Mira el diagrama de la cancha con la ubicación exacta de conos, balones y jugadores.',
        'Presiona "Imprimir / PDF" para llevar la sesión lista a la cancha de fútbol.'
      ]
    },
    {
      number: '2',
      title: 'Registra tus Alumnos y Pasa Lista',
      summary: 'Lleva el control de asistencia con 1 toque en tu teléfono al inicio de cada clase.',
      icon: Users,
      badge: 'Alumnos & Asistencia',
      targetModule: 'crm',
      buttonText: 'Ir a Alumnos',
      items: [
        'Añade a tus alumnos con su foto, posición, edad y contacto del padre o tutor.',
        'En la pestaña "Asistencia", toca en "Presente" o "Ausente" para marcar la lista del día.',
        'El sistema guarda el historial de asistencia automáticamente para cada jugador.'
      ]
    },
    {
      number: '3',
      title: 'Envía Cobros por WhatsApp con 1 Clic',
      summary: 'Controla las mensualidades y envía recordatorios amables a los padres sin perder tiempo.',
      icon: CreditCard,
      badge: 'Cobros & Mensualidades',
      targetModule: 'billing',
      buttonText: 'Ir a Cobros',
      items: [
        'Revisa qué alumnos tienen la cuota al día y quiénes están pendientes de pago.',
        'Toca el botón verde de WhatsApp para enviar un mensaje de cobro ya redactado.',
        'Registra los pagos recibidos para mantener tus finanzas transparentes y ordenadas.'
      ]
    },
    {
      number: '4',
      title: 'Consulta a tu IA Copilot en Cualquier Momento',
      summary: 'Tu asistente táctico personal para diseñar ejercicios personalizados o resolver dudas.',
      icon: Bot,
      badge: 'Inteligencia Artificial',
      targetModule: 'ai',
      buttonText: 'Abrir IA Copilot',
      items: [
        'Pídele: "Dame un entrenamiento de 45 minutos para niños Sub-10 enfocado en pases".',
        'Consulta consejos para mejorar la disciplina o motivación del equipo.',
        'Genera variantes de ejercicios al instante adaptadas a la cantidad de jugadores que asistieron.'
      ]
    }
  ];

  const faqs = [
    {
      q: '¿Cómo instalo la aplicación en mi teléfono móvil?',
      a: 'Haz clic en "Instalar App" en el menú lateral. En Android con Chrome, toca los 3 puntos y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio". En iPhone con Safari, toca el botón Compartir y elige "Añadir a la pantalla de inicio".'
    },
    {
      q: '¿Cómo paso lista rápidamente en el campo de entrenamiento?',
      a: 'Entra a la sección "Alumnos", selecciona la pestaña "Control de Asistencia", elige la fecha o sesión y simplemente toca el botón verde para los presentes. Solo te tomará 30 segundos.'
    },
    {
      q: '¿Puedo imprimir las fichas de entrenamiento para llevarlas en papel?',
      a: 'Sí. Tanto en la "Biblioteca de Ejercicios" como en el "Planificador", encontrarás un botón de "Imprimir / PDF" que genera una hoja limpia y profesional con la pizarra y los tiempos de cada fase.'
    },
    {
      q: '¿Los datos de mis alumnos y pagos están seguros?',
      a: 'Totalmente. Toda tu información se almacena de forma privada y encriptada en la nube con Firebase, vinculada únicamente a tu cuenta de entrenador.'
    }
  ];

  return (
    <div className="p-6 pb-24 lg:pb-12 lg:p-10 font-sans max-w-5xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guía Rápida del Entrenador</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
          Aprende a usar FútbolPro en 4 pasos
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          Todo lo que necesitas saber para planificar tus sesiones, gestionar a tus alumnos y organizar tus cobros de forma fácil y rápida.
        </p>
      </div>

      {/* 4 Core Steps - Clean, visual cards */}
      <div className="space-y-4 mb-12">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 sm:p-6 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                {/* Left: Number + Content */}
                <div className="flex items-start gap-4">
                  {/* Step Number Badge */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-lg shrink-0">
                    {step.number}
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {step.title}
                        </h2>
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          {step.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                        {step.summary}
                      </p>
                    </div>

                    {/* Step item bullets */}
                    <ul className="space-y-1.5 pt-1">
                      {step.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Quick Action Button */}
                {onNavigate && (
                  <div className="md:self-center shrink-0 pt-2 md:pt-0">
                    <button
                      type="button"
                      onClick={() => onNavigate(step.targetModule)}
                      className="w-full md:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-200 hover:border-emerald-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer shadow-sm group"
                    >
                      <Icon className="w-4 h-4 text-emerald-400 group-hover:text-black transition-colors" />
                      <span>{step.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Section - Clean and Simple */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Preguntas Frecuentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-zinc-400 border-t border-zinc-800/60 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support & Install Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">¿Tienes la app instalada en tu celular?</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Úsala en la cancha como una aplicación nativa con acceso rápido.</p>
          </div>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('install')}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <span>Ver instrucciones de instalación</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
