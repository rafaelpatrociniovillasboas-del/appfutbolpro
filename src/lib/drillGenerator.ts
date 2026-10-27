import { Drill, AgeCategory, Difficulty, DrillType } from '../types';

// Simple deterministic PRNG based on a seed string
function createSeededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function() {
    h = (h + 0x9e3779b9) | 0;
    let z = h;
    z ^= z >>> 16;
    z = Math.imul(z, 0x21f0aa7f);
    z ^= z >>> 15;
    z = Math.imul(z, 0x735a2d97);
    z ^= z >>> 15;
    return (z >>> 0) / 4294967296;
  };
}

function selectRandom<T>(arr: T[], randomFunc: () => number): T {
  return arr[Math.floor(randomFunc() * arr.length)];
}

function selectNUnique<T>(arr: T[], n: number, randomFunc: () => number): T[] {
  const temp = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && temp.length > 0; i++) {
    const idx = Math.floor(randomFunc() * temp.length);
    result.push(temp.splice(idx, 1)[0]);
  }
  return result;
}

// Professional Spanish coaching tips and concepts
const GENERAL_COACHES = [
  "perfilación corporal óptima para facilitar el control y orientación del balón",
  "comunicación verbal inmediata al detectar el desmarque del compañero",
  "proteger la posesión utilizando el antebrazo y cuerpo como escudo",
  "escanear el espacio libre antes de recibir el pase",
  "conducir manteniendo el balón cerca del pie con toques suaves y precisos",
  "toma de decisiones rápida bajo situaciones de alta presión defensiva",
  "mantener la vista focalizada en el momento del impacto con el esférico",
  "desplazamientos con apoyos cortos y reactivos en puntas de pie",
  "acelerar y cambiar de ritmo inmediatamente tras el giro corporal"
];

const VOCABULARY: Record<string, {
  setups: string[];
  instructions: string[];
  coachingPoints: string[];
  variations: string[];
}> = {
  'Calentamiento': {
    setups: [
      "Delimitar un círculo de {X} metros de radio con conos en el centro del campo.",
      "Disponer {N} conos formando un pasillo dinámico de {X} metros.",
      "Crear {N} pequeñas estaciones de movilidad con setas en forma de estrella.",
      "Estructurar un cuadrado de {X}x{X} metros utilizando picas en los vértices.",
      "Delimitar dos líneas paralelas distantes {D} metros para desplazamientos suaves.",
      "Marcar una zona de {X}x{Y} metros libre de obstáculos para activación motriz.",
      "Montar {N} escaleras de coordinación paralelas con picas intermedias."
    ],
    instructions: [
      "Los jugadores alternan carrera con elevación de rodillas y braceo coordinado.",
      "Realizar desplazamientos laterales rápidos hacia el cono central y repliegue suave.",
      "Conducir el balón en zig-zag tocándolo suavemente con el empeine.",
      "Al escuchar la señal del entrenador, acelerar en sprint progresivo {D} metros.",
      "Pases cortos por parejas mientras se desplazan libremente por el espacio marcado.",
      "Intercambiar toques de control con muslo y pecho antes de devolver el pase raso.",
      "Saltos coordinados sobre vallas bajas seguidos de aceleración corta controlada.",
      "Saltos rítmicos antes de recibir y devolver el balón al primer toque.",
      "Carrera progresiva continua con desaceleración gradual en los últimos conos."
    ],
    coachingPoints: [
      "Mantener la espalda erguida y peso sobre las puntas de los pies para reaccionar rápido.",
      "Priorizar la calidad del calentamiento dinámico antes de forzar velocidades máximas.",
      "Cabeza levantada y rodillas alineadas en la dirección de desplazamiento.",
      "Coordinación fluida de brazos con el ritmo de carrera y zancada.",
      "Amortiguar suavemente el aterrizaje tras cada salto para proteger las articulaciones."
    ],
    variations: [
      "Introducir disputa aérea suave de cabeza entre parejas en cada cono.",
      "Sustituir las rectas por zig-zag dinámico con cambios de ritmo.",
      "Añadir 5 flexiones o activación de core al finalizar cada serie."
    ]
  },
  'Pase': {
    setups: [
      "Montar dos filas paralelas separadas {D} metros con conos marcadores.",
      "Formar un triángulo de pase continuo de {X} metros con setas numeradas.",
      "Crear un cuadrado reducido de {X}x{Y} metros con miniporterías en extremos.",
      "Posicionar 2 comodines exteriores de apoyo en las bandas del área de juego.",
      "Diseñar un rombo de {X} metros con setas para practicar pases y triangulaciones.",
      "Establecer un pasillo vertical estrecho de {X}x{Y} metros con siluetas defensivas."
    ],
    instructions: [
      "Golpear el balón con el interior del pie buscando el pie dominante del receptor.",
      "Moverse inmediatamente tras el pase para ofrecer una nueva línea de pase limpia.",
      "El pivote realiza control orientado y descarga de cara para la entrada en velocidad.",
      "Efectuar pases precisos al primer toque cruzando la zona sin retener el balón.",
      "Cambio de orientación rápido buscando al compañero alejado en banda contraria.",
      "Tocar, girar sobre el apoyo y filtrar pase raso a la espalda de la línea defensiva.",
      "Pase y desdoblamiento por detrás de la silueta simulando una pared ofensiva.",
      "Control con la suela orientado preparando el pase con el exterior o empeine.",
      "Pases aéreos picados de media distancia buscando superar la barrera intermedia."
    ],
    coachingPoints: [
      "El pie de apoyo debe colocarse firme junto al balón apuntando al receptor.",
      "Dosificar la potencia del pase para que llegue limpio y fácil de controlar.",
      "Rotar la cadera de forma fluida durante el contacto con el interior del pie.",
      "Pedir el balón con voz y señal visual antes de recibir.",
      "Perfilación corporal previa: saber a quién pasar antes de que llegue el balón."
    ],
    variations: [
      "Obligatorio utilizar exclusivamente la pierna menos hábil para control y pase.",
      "Añadir 1 defensor activo que presiona y busca interceptar para contraatacar.",
      "Limitar el juego a 1 solo toque por jugador de forma obligatoria."
    ]
  },
  'Regate': {
    setups: [
      "Colocar {N} picas formando un circuito de zig-zag de alta agilidad.",
      "Delimitar un espacio de {X}x{Y} metros ideal para duelos 1 contra 1.",
      "Instalar una estación central con conos y dos zonas de salida en diagonal.",
      "Colocar dos muñecos o siluetas simulando centrales que cierran el pasillo.",
      "Montar {N} puertas de conos por las que el jugador debe cruzar conduciendo.",
      "Trazar una línea recta de {X} metros para sprints y fintas en velocidad."
    ],
    instructions: [
      "Conducción rápida manteniendo el esférico pegado a la bota.",
      "Encarar la silueta ejecutando una bicicleta o finta con cambio de ritmo explosivo.",
      "Amortiguar el balón, simular freno y salir en aceleración hacia la derecha.",
      "Utilizar recortes sucesivos combinando suela y exterior del pie.",
      "Fintas de cuerpo y balanceo de tronco para desequilibrar al defensor en el 1v1.",
      "Conducir con velocidad, amagar el pase y recortar en ángulo de 90 grados.",
      "Ruleta o giro protegido con la suela al notar el acoso defensivo lateral.",
      "Superar al rival mediante un autopase rápido o regate elástico hacia banda.",
      "Desbordar al muñeco marcador y sprintar {D} metros hacia portería."
    ],
    coachingPoints: [
      "Bajar el centro de gravedad flexionando rodillas para cambiar de dirección con agilidad.",
      "El regate debe realizarse en velocidad explosiva aprovechando el desequilibrio rival.",
      "Mirada fija en la posición del defensor para detectar cuándo ataca el balón.",
      "El balón debe quedar bajo control inmediato tras el cambio de dirección.",
      "Usar el cuerpo y los brazos de forma reglamentaria como escudo ante el marcador."
    ],
    variations: [
      "Límite de {D} segundos para superar al defensor y rematar a portería.",
      "Permitir regates usando únicamente la suela del pie.",
      "Si el defensor recupera el balón, se convierte de inmediato en atacante."
    ]
  },
  'Definición': {
    setups: [
      "Colocar {N} picas al borde del área grande con el portero bajo palos.",
      "Marcar un carril de centro de {X} metros en la banda derecha del campo.",
      "Ubicar un jugador de apoyo o pivote en la frontal del área de espaldas a gol.",
      "Colocar dos miniporterías o dianas en las escuadras de la portería.",
      "Montar una barrera de entrenamiento simulando defensores en tiro libre.",
      "Delimitar {N} puntos de disparo numerados para recibir pases sorpresa."
    ],
    instructions: [
      "Recibir el pase diagonal desde la banda y rematar al primer toque a portería.",
      "Desmarque de ruptura al primer palo para anticipar al central y disparar.",
      "Control orientado sacando el balón del radio del defensor y disparo raso cruzado.",
      "Atacar el centro aéreo cabeceando con fuerza hacia abajo picando el balón.",
      "Recibir de espaldas, girar sobre el pie de apoyo y golpear con el empeine total.",
      "Remates consecutivos tras superar un circuito corto de conos.",
      "Seguir la jugada al rebote con máxima convicción para remate de segunda jugada.",
      "Bajar el balón con el pecho y conectar una volea potente antes de que caiga.",
      "Ejecutar tiros libres con rosca buscando superar la barrera a media altura."
    ],
    coachingPoints: [
      "Inclinar el cuerpo ligeramente sobre el balón para evitar que el disparo se eleve.",
      "El pie de apoyo debe apuntar directamente hacia el poste o escuadra objetivo.",
      "Tobillo bloqueado y firmeza en el golpeo para transferir toda la potencia.",
      "Mirar de reojo la posición del portero antes de ajustar el disparo al palo alejado.",
      "Atacar el balón de cabeza con los ojos abiertos y cuello firme."
    ],
    variations: [
      "Gol de primeras o al palo corto vale doble puntuación.",
      "Obligatorio rematar con la pierna menos hábil.",
      "El disparo debe realizarse tras superar un duelo 1v1 previo."
    ]
  },
  'Táctica': {
    setups: [
      "Medio campo delimitado con líneas de compactación y zonas de presión.",
      "División del terreno en 3 carriles longitudinales marcados con setas.",
      "Cuadrantes en el área grande para ensayar basculación y coberturas.",
      "Dos zonas laterales exclusivas para incorporaciones de los extremos.",
      "Portería reglamentaria más 2 miniporterías en las bandas para salidas rápidas.",
      "Juego reducido en superioridad numérica 3v2 más comodines de apoyo."
    ],
    instructions: [
      "Coordinar la basculación defensiva en bloque medio siguiendo el balón.",
      "Transición ofensiva rápida con pase vertical directo al delantero centro.",
      "Cerrar líneas interiores obligando al rival a jugar por fuera.",
      "El mediocentro defensivo cubre la subida ofensiva del lateral.",
      "Pases de seguridad hacia atrás para cambiar el sentido del ataque con paciencia.",
      "Tirar la línea de fuera de juego sincronizada a la voz del central líder.",
      "Generar triángulos de pase en banda entre lateral, interior y extremo.",
      "Presión tras pérdida intensa en los primeros 5 segundos tras perder el esférico.",
      "Reorganizar el bloque defensivo inmediatamente si el rival supera la primera línea."
    ],
    coachingPoints: [
      "Distancias cortas entre líneas defensivas y mediocampo ({D} metros de separación).",
      "Comunicación continua con órdenes claras: ¡salimos!, ¡bascula!, ¡apoya!",
      "Ocupar los pasillos interiores para forzar la circulación rival a zonas de menor peligro.",
      "La transición defensa-ataque debe ejecutarse con máxima velocidad en {D} segundos.",
      "Reconocer el momento idóneo para saltar a la presión alta con todo el bloque."
    ],
    variations: [
      "Si el equipo defensor recupera y marca en miniportería en menos de 8 seg, vale doble.",
      "Máximo 2 toques por jugador para el equipo atacante para acelerar la circulación.",
      "El delantero centro solo puede jugar a 1 toque de cara."
    ]
  },
  'Físico': {
    setups: [
      "Circuito en circuito con {N} estaciones combinadas de pliometría y fuerza.",
      "Pistas de sprint de {D} metros con vallas de salto bajo y setas de agilidad.",
      "Zona de tracción con gomas elásticas y conos para cambios de dirección.",
      "Hexágono de aceleración y frenada rápida con conos numerados.",
      "Pasillo de velocidad con escaleras de coordinación y saltos reactivos."
    ],
    instructions: [
      "Realizar skipping alto a máxima frecuencia en la escalera de coordinación.",
      "Saltos a pies juntos sobre vallas pliométricas amortiguando la caída.",
      "Acelerar en sprint al 100% de intensidad durante {D} metros.",
      "Desplazamientos laterales defensivos tocando la base de cada cono.",
      "Burpees combinados con salto vertical y aceleración al centro del campo.",
      "Tracción con goma elástica en arrancadas cortas de potencia.",
      "Trote suave regenerativo de vuelta a la salida controlando la respiración.",
      "Cambios de dirección bruscos ante la señal visual del preparador físico.",
      "Series de carreras de ida y vuelta (suicidios) en distancias progresivas."
    ],
    coachingPoints: [
      "Tronco ligeramente inclinado hacia adelante en arrancadas explosivas.",
      "Flexión de rodillas adecuada para amortiguar el impacto en cada salto.",
      "Braceo activo a 90 grados para impulsar la velocidad del sprint.",
      "Apoyo reactivo de metatarsos contra el suelo con máxima rapidez.",
      "Control de la respiración: inhalar por la nariz y exhalar por la boca."
    ],
    variations: [
      "Añadir control y pase de balón al final del circuito de esfuerzo.",
      "Aumentar 5 metros la distancia de sprint reduciendo el descanso.",
      "Realizar el circuito en parejas competitivas paralelas."
    ]
  },
  'Portero': {
    setups: [
      "Colocar {N} setas delimitando el arco de acción directa del guardameta.",
      "Marcar esquinas de la portería con cintas para ejercicios de precisión.",
      "Instalar dos escaleras de coordinación en los laterales de la portería.",
      "Disponer de balones de diferentes tamaños (tenis, fútbol sala y oficiales).",
      "Colocar siluetas o muñecos en el área pequeña para dificultar la visión.",
      "Rampa de rebote para tiros rápidos a 4 metros de la línea de gol."
    ],
    instructions: [
      "Posición básica de espera con peso en punteras y manos abiertas preparadas.",
      "Bordeo de silueta en pasos laterales y desvío de tiro sorpresa a mano cambiada.",
      "Blocaje de balón raso con caída lateral controlada y protección corporal.",
      "Salida por alto para interceptar centro aéreo con rodilla de protección arriba.",
      "Reflejos ante remates a quemarropa con estirada rápida y mano firme.",
      "Tocar el poste opuesto y recuperar posición central para atajar el rechace.",
      "Saque rápido de volea o con la mano para iniciar el contragolpe.",
      "Saltos laterales de valla seguidos de parada a disparo a la escuadra.",
      "Blocaje en dos tiempos de tiro libre potente ajustado al palo."
    ],
    coachingPoints: [
      "Manos en forma de W detrás del balón en balones aéreos frontales para evitar rechaces.",
      "Rodillas semiflexionadas y no cruzar los pies en los desplazamientos laterales.",
      "Voz potente ¡MÍA! al salir a por balones aéreos para avisar a la defensa.",
      "Desviar siempre el balón hacia las bandas, nunca al centro del área.",
      "Levantarse inmediatamente tras la parada listo para una segunda acción."
    ],
    variations: [
      "Usar pelotas de tenis para entrenar reflejos y velocidad de reacción.",
      "Doble parada consecutiva: primer tiro lejano y segundo remate a bocajarro.",
      "Disparos con desvío sorpresa tras rozar en siluetas intermedias."
    ]
  }
};

// Aliases for Portuguese / synonyms
VOCABULARY['Aquecimento'] = VOCABULARY['Calentamiento'];
VOCABULARY['Passe'] = VOCABULARY['Pase'];
VOCABULARY['Drible'] = VOCABULARY['Regate'];
VOCABULARY['Finalização'] = VOCABULARY['Definición'];
VOCABULARY['Finalización'] = VOCABULARY['Definición'];
VOCABULARY['Tática'] = VOCABULARY['Táctica'];
VOCABULARY['Goleiro'] = VOCABULARY['Portero'];
VOCABULARY['Arquero'] = VOCABULARY['Portero'];

/**
 * Procedurally populates details for standard generated drills in Spanish.
 */
export function enrichDynamicDrill(drill: Drill): Drill {
  const isGenerated = drill.id.startsWith('gerado-') || drill.id.startsWith('gen-') || drill.title.includes('#');
  if (!isGenerated) {
    return drill;
  }

  const cleanTitle = drill.title.replace(/#\d+/, '').trim();
  const rand = createSeededRandom(drill.id + cleanTitle);

  let mainAction = cleanTitle;
  let modifier = "";
  
  const prepositions = [" con ", " en ", " para ", " bajo ", " de ", " en parejas ", " en tríos ", " al ", " sin "];
  for (const prep of prepositions) {
    if (cleanTitle.toLowerCase().includes(prep)) {
      const idx = cleanTitle.toLowerCase().indexOf(prep);
      mainAction = cleanTitle.substring(0, idx).trim();
      modifier = cleanTitle.substring(idx).trim();
      break;
    }
  }

  const typeKey = (drill.type as string);
  const vocab = VOCABULARY[typeKey] || VOCABULARY['Calentamiento'];

  // 1. Generate unique Spanish Description
  const descriptions = [
    `Ejercicio de alto rendimiento enfocado en la mejora de ${drill.type.toLowerCase()} con énfasis en ${mainAction}. Diseñado para desarrollar la agilidad, lectura de juego y toma de decisiones, ideal ${modifier || 'en situaciones de intensidad real'}.`,
    `Sesión centrada en optimizar el tiempo de reacción y la calidad técnica en ${mainAction}. Excelente propuesta para potenciar fundamentos de ${drill.type.toLowerCase()} con dinámicas de juego competitivas ${modifier || 'a ritmo dinámico'}.`,
    `Dinámica estructurada para perfeccionar la inteligencia táctico-técnica en ${drill.type.toLowerCase()} mediante ${mainAction}. Ideal para sesiones de entrenamiento formativo con foco en ${modifier || 'juego colectivo'}.`,
    `Entrenamiento diseñado para el desarrollo continuo de ${drill.type.toLowerCase()} aplicando la técnica de ${mainAction}. Enfatiza la toma de decisiones rápida y la ejecución precisa ${modifier || 'en espacios delimitados'}.`
  ];
  const description = selectRandom(descriptions, rand);

  // 2. Generate unique Setup
  const xVal = selectRandom(["5", "10", "15", "20", "25", "30"], rand);
  const yVal = selectRandom(["5", "10", "15", "20", "25"], rand);
  const dVal = selectRandom(["2", "3", "4", "5", "8", "10"], rand);
  const nVal = selectRandom(["3", "4", "5", "6"], rand);

  const rawSetupTemplates = selectNUnique(vocab.setups, 3, rand);
  const setup = rawSetupTemplates.map(tpl => 
    tpl.replace(/{X}/g, xVal)
       .replace(/{Y}/g, yVal)
       .replace(/{D}/g, dVal)
       .replace(/{N}/g, nVal)
  );

  // 3. Generate unique Instructions
  const rawInstructionTemplates = selectNUnique(vocab.instructions, 4, rand);
  const instructions = rawInstructionTemplates.map((tpl, index) => {
    let text = tpl.replace(/{X}/g, xVal)
                  .replace(/{Y}/g, yVal)
                  .replace(/{D}/g, dVal)
                  .replace(/{N}/g, nVal);
    
    if (index === 0) {
      text = `Comenzar el ejercicio enfocándose en la correcta ejecución de ${mainAction}. ` + text;
    } else if (index === 2 && modifier) {
      text = text + ` Asegurando la aplicación directa del objetivo de trabajar ${modifier}.`;
    }
    return text;
  });

  // 4. Generate unique Coaching Points
  const rawCPTemplates = selectNUnique(vocab.coachingPoints, 3, rand);
  const generalCP = selectNUnique(GENERAL_COACHES, 1, rand)[0];
  const coachingPoints = [
    ...rawCPTemplates.map(tpl => 
      tpl.replace(/{X}/g, xVal)
         .replace(/{Y}/g, yVal)
         .replace(/{D}/g, dVal)
         .replace(/{N}/g, nVal)
    ),
    `Asegurar que los jugadores comprendan la transición e intención táctica de ${mainAction}.`,
    `Detalle técnico clave: ${generalCP}.`
  ];

  // 5. Generate unique Variations
  const rawVariationTemplates = selectNUnique(vocab.variations, 2, rand);
  const variations = rawVariationTemplates.map(tpl => 
    tpl.replace(/{X}/g, xVal)
       .replace(/{Y}/g, yVal)
       .replace(/{D}/g, dVal)
       .replace(/{N}/g, nVal)
  );

  return {
    ...drill,
    title: drill.title,
    description,
    setup,
    instructions,
    coachingPoints,
    variations
  };
}
