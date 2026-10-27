export type BonusActivity = {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
};

export type BonusContentData = {
  title: string;
  description: string;
  activities: BonusActivity[];
};

// Tactical themes, names, and templates in professional Spanish soccer terminology
const VERBS = [
  "Control orientado bajo",
  "Dominio y control de",
  "Pase rápido y",
  "Conducción con",
  "Definición y remate de",
  "Desmarque en",
  "Presión y marcaje por",
  "Transición rápida para",
  "Cobertura defensiva en",
  "Regate corto en"
];

const ADJECTIVES = [
  "alta intensidad",
  "espacio reducido",
  "presión constante",
  "cambio de dirección",
  "velocidad de reacción",
  "superioridad numérica",
  "inferioridad posicional",
  "bloque bajo",
  "apoyo constante",
  "toma de decisiones rápida"
];

const SETUP_DETAILS = [
  "En un área delimitada de 20x20 metros con cuatro porterías pequeñas en las esquinas directas.",
  "Con dos equipos de 3 jugadores más un comodín neutro que apoya siempre al equipo en posesión.",
  "Estaciones de entrenamiento marcadas con conos de colores, rotando de ejercicio cada 3 minutos.",
  "Utilizando porterías reglamentarias con porteros activos y dos dinámicas de centros desde las bandas.",
  "Cancha delimitada al centro, donde la transición ofensiva debe finalizarse en un máximo de 10 segundos.",
  "Cinco estaciones de agilidad con escaleras de coordinación seguidas de un duelo 1v1 con remate directo a portería.",
  "Espacio reducido con tres miniporterías distribuidas para estimular el cambio de orientación constante.",
  "Grupo dividido en parejas, manteniendo el balón en el aire y buscando rematar tras el tercer toque coordinado."
];

export function getBonusDetail(bonusId: string, itemTitle: string, itemDesc: string): BonusContentData {
  const activities: BonusActivity[] = [];
  const lowerTitle = itemTitle.toLowerCase();

  // ==========================================
  // BÔNUS 1: 100 SESIONES COMPLETAS (10 módulos x 10 sesiones = 100 sesiones)
  // ==========================================
  if (bonusId === 'bonus1') {
    const match = itemTitle.match(/Módulo\s+(\d+)/i);
    const modNum = match ? parseInt(match[1], 10) : 1;
    const modThemes = [
      "Iniciación y Adaptación al Balón",
      "Fundamentos Técnicos Esenciales",
      "Tácticas Colectivas Básicas",
      "Defensa Avanzada y Sólida",
      "Ataque Rápido y Eficaz",
      "Posesión de Balón y Creación",
      "Transiciones Defensivas y Ofensivas",
      "Preparación Física Integrada con Balón",
      "Entrenamiento Moderno de Porteros",
      "Partidos y Situaciones Especiales de Competición"
    ];
    const currentTheme = modThemes[(modNum - 1) % 10];

    const sessionFocuses = [
      "Control Orientado y Perfilación Corporal",
      "Pase de Ruptura y Filtración entre Líneas",
      "Superioridad Numérica en Bandas (2v1)",
      "Compactación y Basculación de Líneas Defensivas",
      "Centros y Remate bajo Presión Defensiva",
      "Circulación de Balón y Atracción del Rival",
      "Reacción Inmediata tras Pérdida (Tras-Pérdida)",
      "Resistencia Específica con Juegos Reducidos (SSG)",
      "Posicionamiento del Portero ante Disparos Cercanos",
      "Estrategia en Saques de Esquina y Segundas Jugadas"
    ];

    for (let i = 1; i <= 10; i++) {
      const focus = sessionFocuses[(i - 1 + modNum) % 10];
      const setup = SETUP_DETAILS[(i + modNum) % SETUP_DETAILS.length];
      activities.push({
        id: `b1-m${modNum}-s${i}`,
        title: `Sesión ${i}: ${focus}`,
        description: `Objetivo principal enfocado en "${currentTheme}". Esta sesión desarrolla competencias técnico-tácticas y físicas integradas. Instrucciones de ejecución: ${setup} El entrenador debe corregir los gestos técnicos, mantener el ritmo dinámico y fomentar la mentalidad competitiva.`,
        duration: `${45 + (i * 3) % 20} min`,
        type: `Sesión Completa | Técnico-Táctica`
      });
    }
    return {
      title: itemTitle,
      description: `Sesiones estructuradas para el módulo de ${currentTheme}.`,
      activities
    };
  }

  // ==========================================
  // BÔNUS 2: CRONOGRAMA ANUAL (12 meses x 4 semanas + Visión Anual)
  // ==========================================
  if (bonusId === 'bonus2') {
    if (lowerTitle.includes('visión') || lowerTitle.includes('macro') || lowerTitle.includes('anual')) {
      const monthsList = [
        "Enero (Pretemporada y Acondicionamiento)", "Febrero (Fundamentos Técnicos)", "Marzo (Organización Táctica)", 
        "Abril (Ataque y Transiciones Rápidas)", "Mayo (Defensa y Presión Alta)", "Junio (Ajustes Competitivos)", 
        "Julio (Mantenimiento Físico y Recreación)", "Agosto (Perfeccionamiento Individual)", "Septiembre (Estrategias de Partido)", 
        "Octubre (Juegos de Presión y Toma de Decisiones)", "Noviembre (Consolidación de Equipo)", "Diciembre (Torneos y Evaluación)"
      ];
      monthsList.forEach((month, idx) => {
        activities.push({
          id: `b2-macro-${idx + 1}`,
          title: `Macrociclo: ${month}`,
          description: `Planificación macroestructural con directrices tácticas para ${month}. Control de cargas, evolución técnica progresiva y preparación física recomendada para todas las categorías formativas.`,
          duration: 'Mes Completo',
          type: 'Visión General'
        });
      });
      return {
        title: itemTitle,
        description: "Estructura general de planificación anual para escuelas y academias de fútbol.",
        activities
      };
    }

    // Single Month selected - generate 4 detailed weeks
    const monthName = itemTitle.replace("Cronograma: ", "").replace("Mes de ", "");
    
    const weeklyFocuses = [
      { t: "Semana 1: Adaptación Funcional y Coordinación", d: "Acondicionamiento técnico general, juegos de posesión dinámica y desplazamientos coordinados con balón." },
      { t: "Semana 2: Principios Tácticos de Fase Ofensiva", d: "Mantenimiento de la posesión, apoyos laterales, paredes y triangulaciones rápidas para superar líneas." },
      { t: "Semana 3: Sistema Defensivo y Coberturas", d: "Basculación defensiva, presión al poseedor del balón y reglas de cobertura y repliegue ordenado." },
      { t: "Semana 4: Situaciones Especiales y Partidos Condicionados", d: "Simulación de escenarios reales (mantener ventaja, remontada con inferioridad numérica) y partido táctico dirigido." }
    ];

    weeklyFocuses.forEach((focus, idx) => {
      activities.push({
        id: `b2-${monthName}-w${idx + 1}`,
        title: focus.t,
        description: `${focus.d} Planificado para 3 sesiones semanales completas con calentamiento temático, parte principal analítica y aplicación global en juego real.`,
        duration: "3 entrenamientos de 60m",
        type: "Planificación Detallada"
      });
    });

    return {
      title: itemTitle,
      description: `Cronograma detallado semanal para el mes de ${monthName}, con instrucciones paso a paso para el cuerpo técnico.`,
      activities
    };
  }

  // ==========================================
  // BÔNUS 3: 500 JUEGOS Y ACTIVIDADES LÚDICAS (5 categorías x 100 juegos = 500 juegos)
  // ==========================================
  if (bonusId === 'bonus3') {
    let prefix = "Rondo";
    let activityType = "Rondo / Posesión";
    if (lowerTitle.includes("relevos") || lowerTitle.includes("carrera") || lowerTitle.includes("estafetas")) {
      prefix = "Carrera de Relevos";
      activityType = "Coordinación & Velocidad";
    } else if (lowerTitle.includes("precisión") || lowerTitle.includes("puntería") || lowerTitle.includes("desafíos")) {
      prefix = "Desafío de Precisión";
      activityType = "Definición & Pase";
    } else if (lowerTitle.includes("minipartidos") || lowerTitle.includes("reducidos") || lowerTitle.includes("mini-juegos")) {
      prefix = "Minipartido Reducido";
      activityType = "Juego Reducido (SSG)";
    } else if (lowerTitle.includes("infantiles") || lowerTitle.includes("lúdicos") || lowerTitle.includes("lúdicas")) {
      prefix = "Actividad Lúdica";
      activityType = "Juego Formativo Sub-7 / Sub-9";
    }

    // Generate exactly 100 unique games dynamically
    for (let i = 1; i <= 100; i++) {
      const verb = VERBS[(i - 1) % VERBS.length];
      const adj = ADJECTIVES[i % ADJECTIVES.length];
      const setup = SETUP_DETAILS[(i * 3) % SETUP_DETAILS.length];
      
      let finalTitle = `${prefix} #${i}: ${verb} con ${adj}`;
      
      if (prefix === "Actividad Lúdica") {
        const ludicNames = ["El Rey de la Pista", "Estatua con Balón", "Semáforo Loco", "Cazadores de Balones", "Atrapa los Petos", "Laberinto de Conos", "El Río Encantado", "Policías y Ladrones de Balón", "La Fortaleza de Conos", "Carrera de Números"];
        finalTitle = `Juego Lúdico #${i}: ${ludicNames[(i - 1) % ludicNames.length]} (Var. ${Math.floor(i / 10) + 1})`;
      } else if (prefix === "Carrera de Relevos") {
        const estafetaNames = ["Zig-Zag en Velocidad", "Salto y Conducción Corta", "Relevo de Pases Dobles", "Circuito de Obstáculos", "Vuelta al Mundo con Pase", "Coordinación y Tiro Rápido", "Relevo de Cambio de Peto", "Círculo de Agilidad"];
        finalTitle = `Relevo #${i}: ${estafetaNames[(i - 1) % estafetaNames.length]} (Nivel ${Math.floor(i / 20) + 1})`;
      } else if (prefix === "Rondo") {
        const formats = ["3v1 Directo", "4v1 con Comodín", "4v2 de Transición Rápida", "5v2 en Bloque Interior", "Rondo de 3 Colores", "6v2 en Espacio Doble", "Rueda de Pases al Primer Toque"];
        finalTitle = `Rondo #${i}: ${formats[(i - 1) % formats.length]} (${verb})`;
      } else if (prefix === "Minipartido Reducido") {
        const formats = ["2v2 con 4 Porterías Pequeñas", "3v3 con Transición de Fondo", "4v4 con Zonas Delimitadas", "3v3 + 2 Comodines Exteriores", "4v4 con Doble Objetivo", "Partido de Línea de Fondo"];
        finalTitle = `Minipartido #${i}: ${formats[(i - 1) % formats.length]} - ${adj}`;
      } else if (prefix === "Desafío de Precisión") {
        const targetNames = ["Derribar los Conos", "Tiro con Rosca a la Escuadra", "Pase Quirúrgico al Hueco", "Lanzamiento a Zona de Puntuación", "Diana de Precisión", "Golpeo de Volea Preciso"];
        finalTitle = `Precisión #${i}: ${targetNames[(i - 1) % targetNames.length]} (${adj})`;
      }

      activities.push({
        id: `b3-game-${i}`,
        title: finalTitle,
        description: `Actividad estructurada del pack de 500 Dinámicas. Detalles de Organización: ${setup} Regla principal: Estimular la toma de decisiones con enfoque táctico de ${verb.toLowerCase()} en ${adj.toLowerCase()}. Ideal para dinamizar entrenamientos y motivar a los jugadores.`,
        duration: `${10 + (i % 3) * 5} min`,
        type: activityType
      });
    }

    return {
      title: itemTitle,
      description: `Aquí tienes los 100 ejercicios y dinámicas detalladas para "${itemTitle}". Explora y aplica cada variante directamente en tus sesiones.`,
      activities
    };
  }

  // ==========================================
  // BÔNUS 4: 100 ENTRENAMIENTOS PARA DÍAS DE LLUVIA (4 categorías x 25 entrenamientos = 100)
  // ==========================================
  if (bonusId === 'bonus4') {
    let focusCategory = "Entrenamiento Físico / Espacio Reducido";
    if (lowerTitle.includes("futsal") || lowerTitle.includes("pabellón") || lowerTitle.includes("indoor")) {
      focusCategory = "Futsal Técnico Indoor";
    } else if (lowerTitle.includes("táctica") || lowerTitle.includes("pizarra") || lowerTitle.includes("teóricas")) {
      focusCategory = "Dinámica Teórica / Pizarra Táctica";
    } else if (lowerTitle.includes("coordinación") || lowerTitle.includes("core") || lowerTitle.includes("prevención")) {
      focusCategory = "Propiocepción & Fortalecimiento del Core";
    }

    for (let i = 1; i <= 25; i++) {
      const verb = VERBS[(i - 1) % VERBS.length];
      const adj = ADJECTIVES[i % ADJECTIVES.length];
      const setup = SETUP_DETAILS[(i * 2) % SETUP_DETAILS.length];

      activities.push({
        id: `b4-rain-${i}`,
        title: `Sesión de Lluvia #${i}: ${focusCategory.includes("Pizarra") ? `Análisis Táctico #${i}` : `${verb} en Espacio Cubierto`}`,
        description: `Entrenamiento adaptado para días de lluvia intensa o espacio bajo techo. Categoría: ${focusCategory}. Organización práctica: ${setup} Diseñado para canchas techadas, vestuarios o gimnasios sin perder la intensidad de la sesión.`,
        duration: `${15 + (i % 4) * 5} min`,
        type: focusCategory
      });
    }

    return {
      title: itemTitle,
      description: `Ejercicios adaptados para días de lluvia con enfoque en "${itemTitle}". Perfectos para espacios cubiertos.`,
      activities
    };
  }

  // Fallback
  activities.push(
    { id: 'fb-1', title: 'Calentamiento Dinámico', description: 'Coordinación motriz con saltos cortos y recepción de balón.', duration: '15 min', type: 'Completo' }
  );
  return { title: itemTitle, description: itemDesc, activities };
}
