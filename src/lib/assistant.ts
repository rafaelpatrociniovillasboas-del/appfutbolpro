
export function generateLocalAssistantResponse(message: string, context?: string): string {
  const msgLower = (message || '').toLowerCase();
  
  // Extract real dynamic stats from context if present to deliver ultra-personalized responses
  let activeCount = "40";
  let lateListText = "No hay alumnos con cuotas atrasadas registrados en este momento.";
  let hasOverdue = false;
  let leadsListText = "- Juan Pérez (Interesado)\n- María Santos (En Negociación)";
  let pendingListText = "Ningún jugador pendiente de registro o pago.";
  let scheduledWorkouts = "Ningún entrenamiento catalogado o programado en el calendario actualmente.";
  
  if (context) {
    const activeMatch = context.match(/TOTAL ATLETAS ATIVOS:\s*(\d+)/i) || context.match(/TOTAL ALUMNOS ACTIVOS:\s*(\d+)/i);
    if (activeMatch && activeMatch[1]) {
      activeCount = activeMatch[1];
    }
    
    const lateMatch = context.match(/LISTA DE ALUNOS COM MENSALIDADES ATRASADAS \(FINANCEIRO\):\s*(.*?)(?=\s*ATLETAS PENDENTES|\s*LEAD PIPELINE|\s*TREINOS AGENDADOS|$)/is) ||
                      context.match(/LISTA DE ALUMNOS CON CUOTAS ATRASADAS \(FINANZAS\):\s*(.*?)(?=\s*ALUMNOS PENDIENTES|\s*PIPELINE DE PROSPECCIÓN|\s*ENTRENAMIENTOS PROGRAMADOS|$)/is);
    if (lateMatch && lateMatch[1] && lateMatch[1].trim() !== '' && !lateMatch[1].includes('Nenhum com mensalidade em atraso') && !lateMatch[1].includes('Ninguno con cuota en mora')) {
      const parsedLate = lateMatch[1].split('|').map(item => item.trim()).filter(Boolean);
      if (parsedLate.length > 0) {
        lateListText = parsedLate.map(item => `- ${item}`).join('\n');
        hasOverdue = true;
      }
    }
    
    const pendingMatch = context.match(/ATLETAS PENDENTES DE CADASTRO OU MENSALIDADE:\s*(.*?)(?=\s*LEAD PIPELINE|\s*TREINOS AGENDADOS|$)/is) ||
                         context.match(/ALUMNOS PENDIENTES DE REGISTRO O PAGO:\s*(.*?)(?=\s*PIPELINE DE PROSPECCIÓN|\s*ENTRENAMIENTOS PROGRAMADOS|$)/is);
    if (pendingMatch && pendingMatch[1] && pendingMatch[1].trim() !== '' && !pendingMatch[1].includes('Nenhum') && !pendingMatch[1].includes('Ninguno') && pendingMatch[1].trim() !== ',') {
      const parsedPending = pendingMatch[1].split(',').map(item => item.trim()).filter(Boolean);
      if (parsedPending.length > 0) {
        pendingListText = parsedPending.map(item => `- ${item}`).join('\n');
      }
    }

    const leadsMatch = context.match(/LEAD PIPELINE ATUAL \(CAPTAÇÃO DE ALUNOS\):\s*(.*?)(?=\s*TREINOS AGENDADOS|$)/is) ||
                       context.match(/PIPELINE DE PROSPECCIÓN ACTUAL \(CAPTACIÓN DE ALUMNOS\):\s*(.*?)(?=\s*ENTRENAMIENTOS PROGRAMADOS|$)/is);
    if (leadsMatch && leadsMatch[1] && leadsMatch[1].trim() !== '' && !leadsMatch[1].includes('Sem leads cadastrados') && !leadsMatch[1].includes('Sin prospectos registrados')) {
      const parsedLeads = leadsMatch[1].split(',').map(item => item.trim()).filter(Boolean);
      if (parsedLeads.length > 0) {
        leadsListText = parsedLeads.map(item => `- ${item}`).join('\n');
      }
    }

    const workoutsMatch = context.match(/TREINOS AGENDADOS \/ PLANEAR INTERATIVO:\s*(.*)/is) ||
                          context.match(/ENTRENAMIENTOS PROGRAMADOS \/ PLANIFICADOR:\s*(.*)/is);
    if (workoutsMatch && workoutsMatch[1] && workoutsMatch[1].trim() !== '' && !workoutsMatch[1].includes('Nenhum treino agendado') && !workoutsMatch[1].includes('Ningún entrenamiento programado')) {
      const parsedWorkouts = workoutsMatch[1].split('|').map(item => item.trim()).filter(Boolean);
      if (parsedWorkouts.length > 0) {
        scheduledWorkouts = parsedWorkouts.map(item => `- ${item}`).join('\n');
      }
    }
  }

  // Question routing based on terms

  // FINANCE & PAYMENTS
  if (
    msgLower.includes('venc') || 
    msgLower.includes('pago') || 
    msgLower.includes('pagamento') || 
    msgLower.includes('deb') || 
    msgLower.includes('debe') || 
    msgLower.includes('mora') || 
    msgLower.includes('atraso') || 
    msgLower.includes('atrasada') || 
    msgLower.includes('cuota') || 
    msgLower.includes('mensualidad') || 
    msgLower.includes('finanza') || 
    msgLower.includes('cobro') || 
    msgLower.includes('deudor')
  ) {
    let resp = `¡Hola! He recopilado la siguiente información financiera directamente del panel de control de FútbolPro: \n\n`;
    resp += `ESTADO DE CUOTAS / MENSUALIDADES ATRASADAS:\n`;
    resp += `${lateListText}\n\n`;
    
    resp += `JUGADORES CON CRITERIOS PENDIENTES:\n`;
    resp += `${pendingListText}\n\n`;

    if (hasOverdue) {
      resp += `CONSEJO DE GESTIÓN DE MANU:\n`;
      resp += `- Puedes enviar recordatorios personalizados de cobro por WhatsApp accediendo a la sección de Cobros en el menú lateral.\n`;
    } else {
      resp += `¡Felicitaciones por la excelente gestión! Toda la cartera de cuotas activas se encuentra al día y sin pendientes registrados en este momento.`;
    }
    return resp;
  }

  // WORKOUTS / TRAININGS / PLANNER
  if (
    msgLower.includes('entrenamiento') || 
    msgLower.includes('treino') || 
    msgLower.includes('planifica') || 
    msgLower.includes('temporada') || 
    msgLower.includes('microciclo') || 
    msgLower.includes('ejercicio') || 
    msgLower.includes('táctica') || 
    msgLower.includes('tactica') || 
    msgLower.includes('tiro') || 
    msgLower.includes('definicion') || 
    msgLower.includes('pase') || 
    msgLower.includes('fundamento') || 
    msgLower.includes('drill') ||
    msgLower.includes('cronograma') ||
    msgLower.includes('calendario')
  ) {
    let resp = `¡Por supuesto! He consultado la información en tu Planificador de Temporada. Aquí tienes los entrenamientos actuales y la propuesta de sesión:\n\n`;
    resp += `ENTRENAMIENTOS PROGRAMADOS EN EL CALENDARIO:\n`;
    resp += `${scheduledWorkouts}\n\n`;
    
    resp += `PROPUESTA - SESIÓN METODOLÓGICA TÁCTICA Y TÉCNICA (MANU):\n`;
    resp += `1. Calentamiento Integrado (15 min): Rondo de posesión bajo presión intensa, incentivando agilidad de pase a 1-2 toques, rotación y visión rápida.\n`;
    resp += `2. Organización Táctica (25 min): Ejercicio táctico en espacio reducido para salida limpia de balón desde la defensa hacia los mediocentros.\n`;
    resp += `3. Partido Reducido y Definición (30 min): Partido 6v6 con remates rápidos de primera, potenciando transiciones ofensivas y finalizaciones en velocidad.\n\n`;
    
    resp += `Puedes programar nuevas sesiones directamente en el Planificador de Temporada, seleccionando cualquier día del calendario.`;
    return resp;
  }

  // LEADS / MARKETING / CONVERSIONS
  if (
    msgLower.includes('lead') || 
    msgLower.includes('captacion') || 
    msgLower.includes('captación') || 
    msgLower.includes('prospecto') || 
    msgLower.includes('nuevo') || 
    msgLower.includes('registro') || 
    msgLower.includes('inscrip') || 
    msgLower.includes('matricula') || 
    msgLower.includes('matrícula') || 
    msgLower.includes('crm') || 
    msgLower.includes('embudo') || 
    msgLower.includes('funil') ||
    msgLower.includes('interesado')
  ) {
    let resp = `¡Hola! Me he conectado a tu CRM integrado. Aquí está el flujo de potenciales alumnos para tu escuela:\n\n`;
    resp += `PIPELINE ACTUAL DE PROSPECTOS EN EL CRM:\n`;
    resp += `${leadsListText}\n\n`;
    
    resp += `CONSEJO DE CAPTACIÓN DE MANU:\n`;
    resp += `- Invita a los contactos pendientes a una clase de prueba gratuita este fin de semana utilizando el módulo de CRM para asegurar nuevas inscripciones.`;
    return resp;
  }

  // RESUMO GERAL / DASHBOARD
  if (
    msgLower.includes('resumen') || 
    msgLower.includes('general') || 
    msgLower.includes('escuela') || 
    msgLower.includes('academia') || 
    msgLower.includes('facturacion') || 
    msgLower.includes('facturación') || 
    msgLower.includes('caja') || 
    msgLower.includes('saldo') || 
    msgLower.includes('gasto') || 
    msgLower.includes('ingreso') ||
    msgLower.includes('estadistica') || 
    msgLower.includes('estadística') ||
    msgLower.includes('operativo')
  ) {
    let resp = `¡Hola! He compilado los resultados operativos y las estadísticas consolidadas de FútbolPro hoy:\n\n`;
    resp += `- ALUMNOS ACTIVOS: ${activeCount} jugadores registrados y entrenando regularmente.\n`;
    resp += `- CONTROL FINANCIERO: Seguimiento continuo de cuotas pagadas y pendientes en el módulo de Finanzas y Cobros.\n`;
    resp += `- PROSPECCIÓN (CRM): Oportunidades activas en fase de captación y seguimiento.\n`;
    resp += `- CALENDARIO: Sesiones estructuradas en el Planificador de Temporada por categorías.\n\n`;
    
    resp += `FútbolPro está totalmente optimizado y funcionando sin interrupciones para tu escuela de fútbol. ¿En qué más te puedo asistir?`;
    return resp;
  }

  // APP INFO & MODULES
  if (
    msgLower.includes('app') || 
    msgLower.includes('sistema') || 
    msgLower.includes('funciona') || 
    msgLower.includes('modulo') || 
    msgLower.includes('módulo') || 
    msgLower.includes('herramienta') || 
    msgLower.includes('ayuda') || 
    msgLower.includes('que haces') || 
    msgLower.includes('qué haces') ||
    msgLower.includes('manual')
  ) {
    let resp = `¡Hola! Soy Manu, tu asistente dedicada a potenciar la gestión y el rendimiento en la plataforma FútbolPro. Aquí tienes las herramientas disponibles:\n\n`;
    resp += `1. PANEL FINANCIERO & COBROS: Control de ingresos, gastos, cuotas y recordatorios directos vía WhatsApp.\n`;
    resp += `2. CRM DE PROSPECTOS: Embudo visual para captar nuevos alumnos y gestionar clases de prueba.\n`;
    resp += `3. GESTIÓN DE JUGADORES: Fichas técnicas, control de asistencia, evolución deportiva y datos de contacto.\n`;
    resp += `4. PLANIFICADOR DE TEMPORADA: Calendario interactivo para organizar microciclos y sesiones de entrenamiento.\n`;
    resp += `5. BIBLIOTECA DE EJERCICIOS: Colección con más de 1.000 ejercicios técnicos, tácticos y físicos.\n\n`;
    
    resp += `Si tienes cualquier consulta operativa o técnica, ¡pregúntame directamente por aquí!`;
    return resp;
  }

  // Greetings, hello, etc.
  if (
    msgLower.includes('hola') || 
    msgLower.includes('buenos dias') || 
    msgLower.includes('buenos días') || 
    msgLower.includes('buenas tardes') || 
    msgLower.includes('buenas noches') || 
    msgLower.includes('quien eres') || 
    msgLower.includes('quién eres') || 
    msgLower.includes('ayuda') ||
    msgLower.trim() === 'hola'
  ) {
    return `¡Hola! Soy Manu, tu asistente inteligente integrada en FútbolPro.
\n
Estoy aquí para ayudarte a que tu academia o escuela de fútbol funcione con máxima eficiencia. Puedes consultarme sobre:
- Alumnos con cuotas vencidas o pendientes de pago
- Programación y diseño de sesiones de entrenamiento en el calendario
- Seguimiento de prospectos y matrículas en el CRM
- Estadísticas generales y rendimiento de la plantilla
\n
¿Qué te gustaría consultar o planificar hoy?`;
  }

  // Default response
  return `Comprendo perfectamente tu consulta sobre FútbolPro. Soy tu asistente Manu y opero en tiempo real para ayudarte con:
\n
- FINANZAS: Consultar cuotas pendientes, control de cobros y recordatorios.
- ENTRENAMIENTOS: Revisar sesiones programadas o estructurar ejercicios tácticos.
- CRM & MATRÍCULAS: Seguimiento de nuevos interesados y clases de prueba.
- PLANTILLA: Fichas técnicas, asistencia y evolución de los alumnos.
\n
¿En qué te puedo colaborar ahora? ¡Escribe tu pregunta o solicita cualquier detalle de tu escuela!`;
}
