import { Drill, AgeCategory, Difficulty, DrillType } from './types';
import { enrichDynamicDrill } from './lib/drillGenerator';
import generatedDrillsData from './generated_drills.json';

const generatedDrills = generatedDrillsData as Drill[];

export const DRILLS: Drill[] = [
  // --- CALENTAMIENTO (5) ---
  {
    id: 'aq-001',
    title: 'Rondo Clásico 4v1 de Activación',
    description: 'Ejercicio de calentamiento dinámico para estimular la toma de decisiones, la velocidad de pase y el desmarque en corto.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Principiante',
    type: 'Calentamiento',
    durationMinutes: 10,
    setup: [
      'Cuadrado delimitado de 6x6 metros con setas de colores.',
      '4 jugadores colocados en los lados exteriores del cuadrado.',
      '1 defensor en el centro intentando interceptar el balón.'
    ],
    instructions: [
      'Los jugadores exteriores circulan el balón manteniendo la posesión.',
      'El defensor central presiona activamente para cortar el pase.',
      'Quien pierda la posesión o realice un mal pase pasa al centro.',
      'Comenzar con toques libres y evolucionar a máximo 2 toques por jugador.'
    ],
    coachingPoints: [
      'Mantener el cuerpo perfilado hacia el campo para facilitar el pase.',
      'Contacto firme y limpio con el interior del pie.',
      'Los compañeros sin balón deben ofrecer líneas de pase constantes abriendo ángulos.'
    ],
    variations: [
      'Limitar la posesión a máximo 1 o 2 toques obligatorios.',
      'Reducir el espacio a 5x5 metros para aumentar la velocidad de ejecución.'
    ]
  },
  {
    id: 'aq-002',
    title: 'Pilla-Pilla con Conducción y Protección',
    description: 'Calentamiento lúdico que eleva la frecuencia cardíaca mientras se trabaja el control de balón y la visión periférica.',
    ageCategory: ['Sub-7', 'Sub-9', 'Sub-11'],
    difficulty: 'Principiante',
    type: 'Calentamiento',
    durationMinutes: 10,
    setup: [
      'Área amplia delimitada de 20x20 metros.',
      'Cada jugador inicia con un balón en los pies.',
      '2 jugadores sin balón actúan como "cazadores" con peto distintivo.'
    ],
    instructions: [
      'Los jugadores conducen libremente por el espacio protegiendo su balón.',
      'Los cazadores intentan tocar el balón de los compañeros para despejarlo fuera.',
      'Si a un jugador le despejan el balón, debe recuperarlo y hacer 5 toques de control antes de volver a entrar.',
      'El juego continúa rotando a los cazadores cada 3 minutos.'
    ],
    coachingPoints: [
      'Conducir el balón manteniéndolo siempre muy pegado al pie.',
      'Levantar la cabeza periódicamente para escanear el entorno y evitar colisiones.',
      'Usar fintas de cuerpo y cambios de ritmo para zafarse de los cazadores.'
    ],
    variations: [
      'Los cazadores deben robar el balón y marcar gol en miniporterías para salvarse.',
      'Obligatorio conducir únicamente con la pierna menos hábil.'
    ]
  },
  {
    id: 'aq-003',
    title: 'Pases por Parejas y Movilidad Dinámica',
    description: 'Combinación de pase técnico en corto con ejercicios de estiramiento dinámico y movilidad articular.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Principiante',
    type: 'Calentamiento',
    durationMinutes: 12,
    setup: [
      'Dos filas paralelas separadas 5 metros con jugadores emparejados cara a cara.',
      '1 balón por pareja.',
      'Pasillo lateral delimitado para las carreras dinámicas de movilidad.'
    ],
    instructions: [
      'Los jugadores intercambian pases rasos al primer toque.',
      'A la señal del entrenador, la pareja deja el balón controlado.',
      'Salen en carrera suave realizando el ejercicio indicado (skipping, talones a glúteos, aperturas de cadera).',
      'Regresan al puesto inicial en trote suave y reanudan los pases.'
    ],
    coachingPoints: [
      'Mantener precisión y tensión adecuada en cada golpeo de pase.',
      'Evitar frenadas bruscas; priorizar la fluidez en los movimientos articulares.',
      'Coordinar el braceo durante los desplazamientos dinámicos.'
    ],
    variations: [
      'Pases variando el uso de pierna no dominante.',
      'Recepción orientada con el pecho o muslo antes de devolver raso.'
    ]
  },
  {
    id: 'aq-004',
    title: 'Circulación en 3 Zonas con Rotación Continua',
    description: 'Calentamiento progresivo que activa la atención cognitiva, la ocupación racional de espacios y la fluidez de pase.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Intermedio',
    type: 'Calentamiento',
    durationMinutes: 15,
    setup: [
      '3 cuadrados contiguos de 8x8 metros delimitados con conos.',
      '6 jugadores distribuidos en parejas, circulando balones entre los 3 sectores.',
      'Sin oposición defensiva inicial, foco en la movilidad y el ritmo.'
    ],
    instructions: [
      'Ninguna zona puede tener más de dos jugadores simultáneamente.',
      'El balón debe circular entre las tres zonas siguiendo trayectorias triangulares.',
      'Al dar el pase a una zona contigua, el pasador se desplaza inmediatamente para ocupar un sector libre.',
      'Mantener la circulación fluida sin detener el balón.'
    ],
    coachingPoints: [
      'Visualizar el siguiente movimiento antes de recibir el balón.',
      'Comunicación constante entre compañeros para organizar los relevos de zona.',
      'Perfilación corporal óptima para recibir y descargar con el mínimo número de toques.'
    ],
    variations: [
      'Añadir 1 comodín defensivo pasivo en la zona central para dificultar las líneas de pase.',
      'Exigir que cada pase entre zonas se realice con el balón por el aire al primer toque.'
    ]
  },
  {
    id: 'aq-005',
    title: 'Rueda de Activación Técnica y Reflejos',
    description: 'Ativación específica de tren superior, coordinación visomotriz y precisión técnica de control.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15'],
    difficulty: 'Principiante',
    type: 'Calentamiento',
    durationMinutes: 10,
    setup: [
      'Entrenador y asistente en un extremo con varios balones en mano.',
      'Columnas de jugadores a 4 metros de distancia.',
      'Setas delimitando el punto de retroceso y giro.'
    ],
    instructions: [
      'El entrenador lanza el balón a media altura hacia el jugador.',
      'El jugador devuelve de cabeza o de volea suave con el interior del pie.',
      'Tras la devolución, realiza un retroceso rápido rodeando la seta de espaldas.',
      'Vuelve al final de la fila en skipping activo con intensidad moderada.'
    ],
    coachingPoints: [
      'Mantener los ojos abiertos durante todo el contacto con el balón.',
      'Fijar el cuello en los remates de cabeza utilizando la fuerza del core.',
      'Pisar con las puntas de los pies para mantener agilidad y ligereza.'
    ],
    variations: [
      'El entrenador nombra un color y el jugador debe devolver el balón hacia la zona de ese color.',
      'Alternar golpeo de cabeza frontal con golpeo lateral en salto coordinado.'
    ]
  },

  // --- REGATE (5) ---
  {
    id: 'db-001',
    title: 'Zig-Zag con Cambio de Ritmo y Salida Explosiva',
    description: 'Mejora del regate corto, conducción serpenteante y aceleración explosiva tras superar el obstáculo.',
    ageCategory: ['Sub-7', 'Sub-9', 'Sub-11', 'Sub-13'],
    difficulty: 'Principiante',
    type: 'Regate',
    durationMinutes: 15,
    setup: [
      '6 conos alineados en vertical con 1.5 metros de separación.',
      'Pasillo libre de 15 metros al finalizar la hilera de conos.',
      'Zona de frenado delimitada con miniportería o aro final.'
    ],
    instructions: [
      'El jugador conduce el balón sorteando los conos en zig-zag con toques cortos.',
      'Al superar el último cono, realiza un toque largo de escape hacia adelante.',
      'Acelera en sprint máximo controlando el esférico hasta la línea de llegada.',
      'Frena el balón sobre la línea con la suela del pie con control absoluto.'
    ],
    coachingPoints: [
      'Mantener el balón pegado a la bota durante el zig-zag entre conos.',
      'Utilizar alternativamente el exterior y el interior de ambos pies.',
      'Bajar el centro de gravedad en los giros para ganar estabilidad.'
    ],
    variations: [
      'Conducir utilizando exclusivamente la suela del pie en todo el recorrido.',
      'Añadir cronómetro para fomentar la autosuperación y rapidez.'
    ]
  },
  {
    id: 'db-002',
    title: 'Duelo 1v1 en Pasillo Estrecho',
    description: 'Enfrentamiento individual en espacio delimitado para fomentar la valentía y el regate de desborde.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17'],
    difficulty: 'Avanzado',
    type: 'Regate',
    durationMinutes: 20,
    setup: [
      'Pasillo delimitado de 8x15 metros con setas.',
      '1 atacante con balón en un extremo.',
      '1 defensor esperando en la mitad del pasillo.',
      'Línea de meta defendida con una miniportería al fondo.'
    ],
    instructions: [
      'El atacante inicia la conducción hacia el defensor a velocidad controlada.',
      'El defensor temporiza sin lanzarse a lo loco esperando el movimiento del rival.',
      'El atacante debe emplear una finta o cambio de ritmo explosivo para desbordar.',
      'La jugada concluye en gol, robo del defensor o salida del balón por las bandas.'
    ],
    coachingPoints: [
      'Balancear el tronco para engañar al defensor sobre la dirección de salida.',
      'La aceleración tras el regate debe ser inmediata y contundente.',
      'Proteger el balón interponiendo el cuerpo entre el rival y el esférico.'
    ],
    variations: [
      'El atacante tiene un límite de 6 segundos para finalizar la jugada.',
      'Si el defensor roba, puede contraatacar hacia la línea de salida en 4 segundos.'
    ]
  },
  {
    id: 'db-003',
    title: 'Conducción Multidireccional con Estímulos Visuales',
    description: 'Trabajo de regate dinámico y control espacial en entorno denso con cambios de dirección a la orden.',
    ageCategory: ['Sub-9', 'Sub-11', 'Sub-13'],
    difficulty: 'Principiante',
    type: 'Regate',
    durationMinutes: 12,
    setup: [
      'Cuadrado de 20x20 metros con conos dispersos aleatoriamente.',
      'Cada jugador con su propio balón.',
      'El entrenador se sitúa en una esquina con petos de colores en la mano.'
    ],
    instructions: [
      'Regate libre por todo el espacio evitando chocar con compañeros u obstáculos.',
      'El entrenador levanta un color: Peto Rojo = Frenar en seco con la suela; Peto Azul = Recorte hacia atrás; Peto Verde = Cambio de ritmo hacia un espacio libre.',
      'Mantener siempre la cabeza arriba para observar los colores del entrenador.'
    ],
    coachingPoints: [
      'Variar la cadencia de los pasos y la velocidad de conducción.',
      'Visión periférica activa para anticipar cruces con otros compañeros.',
      'Amortiguar el balón con suavidad en cada frenada sin que se escape.'
    ],
    variations: [
      'Regatear utilizando únicamente la pierna no dominante.',
      'Añadir 2 jugadores sin balón que actúan como perseguidores pasivos.'
    ]
  },
  {
    id: 'db-004',
    title: 'Circuito en Ocho (8) de Regate Cerrado',
    description: 'Conducción técnica en trayectorias curvas exigentes simulando situaciones de protección bajo presión.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15'],
    difficulty: 'Intermedio',
    type: 'Regate',
    durationMinutes: 15,
    setup: [
      'Dos conjuntos de conos formando dos círculos adyacentes con forma de "8".',
      'Distancia total del circuito: 10 metros.',
      'Punto de salida central con balones disponibles.'
    ],
    instructions: [
      'El jugador recorre el circuito en "8" alternando giros cerrados a izquierda y derecha.',
      'En las curvas cerradas, utilizar toques suaves con el exterior e interior.',
      'En la recta de cruce central, acelerar a máxima velocidad manteniendo el control.',
      'Completar 3 vueltas completas antes de relevar al siguiente compañero.'
    ],
    coachingPoints: [
      'Acompañar los giros con la rotación de cadera y los brazos abiertos para equilibrarse.',
      'Ajustar la zancada: pasos cortos en las curvas y zancada amplia en las rectas.',
      'No perder el contacto visual con el balón sin agachar la cabeza en exceso.'
    ],
    variations: [
      'Realizar el circuito en sentido inverso conduciendo de espaldas con la suela.',
      'Duelo paralelo: dos jugadores realizan el ocho simultáneamente compitiendo en velocidad.'
    ]
  },
  {
    id: 'db-005',
    title: 'Desborde Lateral 1v1 con Centro y Asistencia',
    description: 'Enfrentamiento en banda para extremos y laterales con objetivo de desbordar y asistir al área.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Regate',
    durationMinutes: 18,
    setup: [
      'Carril lateral delimitado de 10x25 metros en la banda del campo.',
      '1 extremo atacante con balón y 1 lateral defensor esperando en posición baja.',
      '1 delantero y 1 central en el área de penalti para el remate posterior.'
    ],
    instructions: [
      'El extremo encara al lateral buscando superar por banda o recortar hacia adentro.',
      'Tras superar la marca con una finta o cambio de ritmo, ejecuta un centro tenso al área.',
      'El delantero ataca el primer o segundo palo para finalizar.',
      'Rotar posiciones tras cada repetición.'
    ],
    coachingPoints: [
      'Acelerar el cambio de ritmo en el momento justo en que el defensor duda.',
      'Orientar el último toque hacia el espacio libre para armar la pierna de centro.',
      'Levantar la vista antes de centrar para ubicar el desmarque del compañero.'
    ],
    variations: [
      'El extremo puede elegir entre centrar o finalizar él mismo al palo corto.',
      'El lateral puede recuperar y lanzar contraataque directo si intercepta el balón.'
    ]
  },

  // --- DEFINICIÓN (5) ---
  {
    id: 'fn-001',
    title: 'Disparo de Primer Toque desde la Frontal',
    description: 'Entrenamiento de precisión y golpeo rápido sin control previo para remates en la frontal del área.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15', 'Sub-17'],
    difficulty: 'Intermedio',
    type: 'Definición',
    durationMinutes: 20,
    setup: [
      'Portería reglamentaria con portero bajo palos.',
      'Entrenador o pasador en la línea de fondo con abundantes balones.',
      'Fila de rematadores situados en la media luna del área grande.'
    ],
    instructions: [
      'El pasador entrega un balón raso o a media altura hacia la frontal.',
      'El atacante llega en carrera y remata de primeras sin detener el esférico.',
      'Buscar la colocación a los postes laterales evitando disparar al centro.',
      'El rematador sigue la jugada por si hay rechace del portero.'
    ],
    coachingPoints: [
      'Colocar el pie de apoyo firme al lado del balón apuntando hacia la portería.',
      'Inclinar el torso ligeramente hacia adelante para que el disparo no se eleve por encima del larguero.',
      'Tobillo firme y golpeo con el empeine total o interior según la distancia.'
    ],
    variations: [
      'El pase se realiza botando en el suelo para obligar a remate de semivolea.',
      'Incorporar un defensor pasivo que persigue al rematador desde atrás para meter presión.'
    ]
  },
  {
    id: 'fn-002',
    title: 'Pared Ofensiva y Definición Rápida 1-2',
    description: 'Combinación ofensiva de pared corta con el pivote para superar la última línea y definir ante portería.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Intermedio',
    type: 'Definición',
    durationMinutes: 15,
    setup: [
      'Portería grande con guardameta.',
      'Pivote ubicado de espaldas a la portería en la frontal del área.',
      'Fila de mediapuntas a 25 metros de portería.'
    ],
    instructions: [
      'El atacante pasa el balón al pivote y sprinta superando la línea imaginaria.',
      'El pivote descarga de cara con un toque suave al espacio en carrera.',
      'El atacante llega en carrera y define con disparo cruzado y raso.',
      'Rotación tras el disparo: el tirador pasa a ser pivote y el pivote va a la fila.'
    ],
    coachingPoints: [
      'La calidad y peso del pase de devolución determina el éxito del disparo.',
      'Anticipación en la carrera sin caer en fuera de juego.',
      'Mirada rápida a la colocación del portero antes de golpear.'
    ],
    variations: [
      'El portero puede salir a achicar el ángulo si la devolución del pivote queda larga.',
      'El pivote puede girar y rematar él mismo si detecta que el defensor central se abre.'
    ]
  },
  {
    id: 'fn-003',
    title: 'Centro Lateral y Remate al Primer Palo',
    description: 'Dinámica de desmarque de ruptura y remate al primer contacto tras centro tenso desde la banda.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Definición',
    durationMinutes: 20,
    setup: [
      'Portería reglamentaria con portero.',
      'Dos extremos en las bandas con balones preparados.',
      'Pareja de delanteros y pareja de defensas centrales en el área grande.'
    ],
    instructions: [
      'El extremo conduce hasta línea de fondo y pone un centro tenso raso o a media altura.',
      'El delantero más cercano realiza un desmarque agresivo al primer palo para anticipar al central.',
      'El segundo delantero entra al segundo palo para cazar posibles balones pasados o rechaces.',
      'Finalizar con remate de cabeza picado o golpeo al primer toque con la bota.'
    ],
    coachingPoints: [
      'Sincronización milimétrica: el desmarque debe iniciarse cuando el extremo va a golpear.',
      'Atacar el balón con convicción por delante del defensor central.',
      'En remates de cabeza, orientar el testarazo hacia abajo picando el balón en el suelo.'
    ],
    variations: [
      'Los defensores juegan con marcaje real e intenso a partir del tercer intento.',
      'El extremo puede recortar y poner el centro con la pierna cambiada con rosca hacia afuera.'
    ]
  },
  {
    id: 'fn-004',
    title: 'Progresión y Tiro Potente de Media Distancia',
    description: 'Desarrollo de la potencia de golpeo, colocación y confianza en disparos desde fuera del área.',
    ageCategory: ['Sub-13', 'Sub-15', 'Adulto'],
    difficulty: 'Principiante',
    type: 'Definición',
    durationMinutes: 15,
    setup: [
      'Semicírculo de conos a 20-25 metros de la portería.',
      'Portero en la portería y balones en la posición central de salida.'
    ],
    instructions: [
      'El jugador realiza una conducción corta de 3 metros hacia adelante.',
      'Acomoda el balón con un toque lateral abriendo ángulo de disparo.',
      'Golpea con potencia buscando las escuadras o el palo largo del portero.',
      'Recupera el balón tras el tiro y se incorpora a la fila contraria.'
    ],
    coachingPoints: [
      'El último toque de preparación no debe quedar ni muy pegado ni excesivamente lejos del cuerpo.',
      'Acompañar el golpeo con la inercia del cuerpo tras el impacto.',
      'Golpear con el empeine limpio para lograr máxima potencia y trayectoria descendente.'
    ],
    variations: [
      'Disparar obligatoriamente con la pierna menos hábil.',
      'Realizar una pared previa con el entrenador antes de efectuar el tiro.'
    ]
  },
  {
    id: 'fn-005',
    title: 'Penaltis de Precisión y Gestión de la Presión',
    description: 'Perfeccionamiento técnico en penas máximas trabajando la rutina psicológica y la precisión en los ángulos.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Principiante',
    type: 'Definición',
    durationMinutes: 10,
    setup: [
      'Punto de penalti reglamentario a 11 metros de portería.',
      'Portero listo y dos dianas o conos en las esquinas inferiores de la portería.'
    ],
    instructions: [
      'El lanzador coloca el balón con calma y toma su carrera habitual de 3 a 5 pasos.',
      'Realiza una respiración profunda antes de escuchar la orden del silbato.',
      'Ejecuta el penalti con convicción eligiendo un lado definido de antemano.',
      'Competencia por rondas eliminatorias entre los jugadores del equipo.'
    ],
    coachingPoints: [
      'Mantener la decisión de tiro sin dudar a mitad de la carrera.',
      'Pie de apoyo firme junto al balón y mirada fija en el esférico en el momento del impacto.',
      'Ajustar el balón a los postes para dificultar la estirada del guardameta.'
    ],
    variations: [
      'Si el balón entra rozando el poste o por la escuadra, el gol vale doble.',
      'Simular ruido ambiente y presión con los compañeros animando o distrayendo sanamente.'
    ]
  },

  // --- PASE (5) ---
  {
    id: 'ps-001',
    title: 'Triángulo de Pases al Primer Toque',
    description: 'Mejora de la velocidad de circulación, perfilación y precisión en pases triangulares continuos.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Intermedio',
    type: 'Pase',
    durationMinutes: 15,
    setup: [
      '3 conos formando un triángulo equilátero de 6 metros de lado.',
      '3 jugadores situados en los vértices del triángulo con 1 balón.'
    ],
    instructions: [
      'Los jugadores circulan el balón en sentido horario con pases al primer toque.',
      'A la señal del silbato, cambian de inmediato el sentido de circulación en sentido antihorario.',
      'Mantener el balón siempre raso y a gran velocidad.',
      'Aumentar la distancia de los conos tras 5 minutos de ejercicio fluido.'
    ],
    coachingPoints: [
      'Piernas semiflexionadas y peso sobre las punteras para reaccionar al pase.',
      'Perfilación corporal abriendo el ángulo hacia el receptor antes de recibir.',
      'Golpear con la parte interior del pie buscando el pie alejado del compañero.'
    ],
    variations: [
      'Obligatorio realizar control con la pierna contraria antes de pasar.',
      'Añadir 1 defensor pasivo en el centro del triángulo.'
    ]
  },
  {
    id: 'ps-002',
    title: 'Pasillo de Pase Filtrado y Ruptura de Líneas',
    description: 'Entrenamiento de visión táctica y precisión en pases filtrados superando la línea de mediocampo rival.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Pase',
    durationMinutes: 20,
    setup: [
      'Espacio rectangular de 15x30 metros dividido en 3 zonas (Inicio, Intermedia, Final).',
      'Equipo atacante con 4 jugadores en Zona de Inicio y 2 delanteros en Zona Final.',
      '2 mediocentros defensores fijos en la Zona Intermedia.'
    ],
    instructions: [
      'Los 4 atacantes circulan el balón en la Zona de Inicio atrayendo a los defensores.',
      'En cuanto se abra un hueco entre los dos defensores, filtran un pase raso a los delanteros.',
      'Los delanteros reciben, controlan y devuelven el balón para reiniciar el ciclo.',
      'Si los defensores interceptan el balón, suman 1 punto y rotan puestos.'
    ],
    coachingPoints: [
      'Engañar a los defensores con la mirada antes de filtrar el pase.',
      'El pase filtrado debe ser firme, tenso y raso para no ser interceptado.',
      'Los delanteros deben moverse continuamente para crear líneas de pase limpias.'
    ],
    variations: [
      'Permitir que 1 defensor presione en la Zona de Inicio tras 3 pases.',
      'Limitar a un máximo de 3 pases en la Zona de Inicio antes de filtrar obligatoriamente.'
    ]
  },
  {
    id: 'ps-003',
    title: 'Circuito de Pases en Y con Desmarque de Apoyo',
    description: 'Dinámica de circulación con pase vertical, descarga de cara y cambio de orientación a la banda.',
    ageCategory: ['Sub-9', 'Sub-11', 'Sub-13', 'Sub-15'],
    difficulty: 'Intermedio',
    type: 'Pase',
    durationMinutes: 12,
    setup: [
      'Disposición en forma de "Y" con 4 conos y jugadores en cada estación.',
      'Distancia de 10 metros entre el cono base y el cono central de apoyo.'
    ],
    instructions: [
      'Jugador A pasa fuerte y raso a Jugador B (situado en el cono central).',
      'Jugador B descarga de cara al primer toque hacia Jugador A que acompaña la jugada.',
      'Jugador A envía pase largo hacia el extremo Jugador C (ala derecha).',
      'Cada jugador corre a ocupar la posición del compañero al que acaba de pasar.'
    ],
    coachingPoints: [
      'Pase firme al pie de apoyo del compañero para facilitar la devolución.',
      'Acompañar la jugada inmediatamente tras entregar el balón.',
      'Orientar el cuerpo hacia la banda antes de recibir el pase largo.'
    ],
    variations: [
      'Alternar salida por banda izquierda con Jugador D.',
      'Realizar el circuito a 1 solo toque en todas las estaciones.'
    ]
  },
  {
    id: 'ps-004',
    title: 'Juego de Posesión y Conservación 5v5 con Comodines',
    description: 'Juego de posesión en espacio reducido con comodines exteriores para potenciar la amplitud y la conservación.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Pase',
    durationMinutes: 20,
    setup: [
      'Cuadrado de 25x25 metros delimitado con setas.',
      'Dos equipos de 5 jugadores dentro del cuadrado.',
      '2 comodines neutros colocados en las bandas exteriores que juegan con el equipo poseedor.'
    ],
    instructions: [
      'El equipo con balón busca mantener la posesión apoyándose en los comodines.',
      'El equipo defensor presiona para recuperar y pasa a tener la posesión.',
      'Cada 10 pases consecutivos completados por un equipo equivale a 1 gol.',
      'Los comodines juegan a un máximo de 2 toques.'
    ],
    coachingPoints: [
      'Usar la amplitud del campo jugando hacia los comodines exteriores.',
      'Cambiar el ritmo del balón con pases cortos para atraer y pases largos para oxigenar.',
      'Transición inmediata ataque-defensa en el momento de la pérdida.'
    ],
    variations: [
      'Limitar a todos los jugadores a máximo 2 toques por intervención.',
      'Goles solo válidos si el balón pasa por ambos comodines antes de los 10 pases.'
    ]
  },
  {
    id: 'ps-005',
    title: 'Pase en Progresión y Paredes en Velocidad',
    description: 'Automatismo de paredes sucesivas en carrera para superar marcas en velocidad lineal.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15'],
    difficulty: 'Principiante',
    type: 'Pase',
    durationMinutes: 10,
    setup: [
      'Pasillo longitudinal de 30 metros marcado con conos cada 5 metros.',
      'Jugadores organizados en parejas con 1 balón por pareja.'
    ],
    instructions: [
      'La pareja avanza por el pasillo realizando paredes continuas sin detener la carrera.',
      'El jugador con balón entrega en diagonal y acelera superando el cono.',
      'El compañero devuelve el pase en profundidad al espacio libre.',
      'Al llegar al final del pasillo, regresan en trote suave por el exterior.'
    ],
    coachingPoints: [
      'El pase de pared debe ser suave y colocado en la trayectoria de carrera del compañero.',
      'No frenar la carrera: ajustar la velocidad del pase al ritmo de zancada.',
      'Comunicarse con la voz indicando ¡voy! o ¡devuelve!.'
    ],
    variations: [
      'Finalizar con remate a miniportería al llegar al final del pasillo.',
      'Realizar las devoluciones con el exterior del pie.'
    ]
  },

  // --- TÁCTICA (5) ---
  {
    id: 'tt-001',
    title: 'Presión Alta Tras Pérdida (Regla de los 5 Segundos)',
    description: 'Entrenamiento de reacción inmediata y presión en bloque alto durante los primeros 5 segundos tras perder la posesión.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Tática',
    durationMinutes: 20,
    setup: [
      'Medio campo de fútbol delimitado con 1 portería reglamentaria y 2 miniporterías en mediocampo.',
      'Equipo atacante (6 jugadores) vs Equipo defensor (5 jugadores + portero).'
    ],
    instructions: [
      'Los atacantes intentan marcar gol en la portería reglamentaria.',
      'Si el equipo defensor recupera el balón, los 6 atacantes deben presionar con máxima intensidad.',
      'Si los atacantes recuperan el esférico en menos de 5 segundos, tienen opción directa de remate.',
      'Si el equipo defensor supera la presión y anota en las miniporterías, suman doble puntuación.'
    ],
    coachingPoints: [
      'El jugador más cercano a la pérdida debe saltar inmediatamente a acosar al poseedor.',
      'Los compañeros cercanos cierran las líneas de pase inmediatas (cierre del embudo).',
      'No conceder tiempo ni espacio para que el rival levante la cabeza.'
    ],
    variations: [
      'Reducir el tiempo límite de presión a 3 segundos para exigir máxima intensidad.',
      'Incorporar un comodín ofensivo que siempre apoya al equipo que recupera.'
    ]
  },
  {
    id: 'tt-002',
    title: 'Salida de Balón Lavolpiana con Mediocentro',
    description: 'Estructuración táctica de la salida de balón desde atrás incrustando al mediocentro entre los defensas centrales.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Intermedio',
    type: 'Tática',
    durationMinutes: 20,
    setup: [
      'Medio campo con portero, 2 defensas centrales, 2 laterales y 1 mediocentro defensivo.',
      'Oposición de 3 delanteros rivales presionando en bloque alto.'
    ],
    instructions: [
      'El portero inicia el juego en corto con los centrales abiertos a los costados del área grande.',
      'El mediocentro desciende y se incrusta entre los centrales formando una línea de 3.',
      'Los laterales avanzan y ganan altura pegados a las bandas proporcionando amplitud.',
      'Superar la primera línea de presión rival buscando al lateral libre o al interior entre líneas.'
    ],
    coachingPoints: [
      'Los centrales deben esperar bien abiertos para estirar la primera línea de presión rival.',
      'El mediocentro debe ofrecerse en ángulo diagonal, nunca completamente plano de espaldas.',
      'Paciencia en la circulación hasta detectar al hombre libre con ventaja posicional.'
    ],
    variations: [
      'El rival aumenta la presión a 4 atacantes obligando al portero a participar como hombre libre.',
      'Obligatorio conectar con un lateral antes de cruzar la línea de mediocampo.'
    ]
  },
  {
    id: 'tt-003',
    title: 'Transición Ofensiva Rápida 3v2 en Superioridad',
    description: 'Automatismo de contragolpe fulgurante aprovechando la superioridad numérica 3 atacantes contra 2 defensores.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17'],
    difficulty: 'Avanzado',
    type: 'Tática',
    durationMinutes: 15,
    setup: [
      'Medio campo con 1 portería defendida por guardameta.',
      '3 atacantes arrancan desde el círculo central.',
      '2 defensores centrales colocados en la frontal del área.'
    ],
    instructions: [
      'El atacante central conduce fijando a uno de los dos defensores centrales.',
      'Los dos extremos atacan los espacios en diagonal abriendo la defensa.',
      'El poseedor decide si filtrar el pase al extremo desmarcado o finalizar él mismo.',
      'Límite de 8 segundos para finalizar la jugada en remate a portería.'
    ],
    coachingPoints: [
      'El portador debe fijar al central hasta el último instante antes de soltar el pase.',
      'Los extremos deben mantener la amplitud para no facilitar la cobertura de los 2 defensas.',
      'Definir con rapidez sin permitir que la defensa rival se reorganice.'
    ],
    variations: [
      'Un mediocentro defensor corre desde el centro del campo con 3 segundos de retraso para añadir presión.',
      'Si los defensores cortan el balón, tienen 5 segundos para pasar a un comodín en mediocampo.'
    ]
  },
  {
    id: 'tt-004',
    title: 'Basculación Defensiva y Coberturas en Bloque Medio',
    description: 'Sincronización de la línea de 4 defensores para bascular juntos hacia el lado del balón manteniendo la compacidad.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15'],
    difficulty: 'Principiante',
    type: 'Tática',
    durationMinutes: 18,
    setup: [
      'Medio campo dividido longitudinalmente en 3 carriles con conos.',
      'Línea de 4 defensores coordinada.',
      'Equipo atacante de 5 jugadores circulando el balón de banda a banda.'
    ],
    instructions: [
      'Cuando el balón está en la banda derecha, el lateral derecho sale a apretar.',
      'Los centrales y el lateral izquierdo basculan hacia el carril derecho cubriendo espaldas.',
      'Si el rival cambia la orientación hacia la izquierda, toda la línea bascula coordinada.',
      'Ningún defensor puede quedar descolgado rompiendo la línea defensiva.'
    ],
    coachingPoints: [
      'El central más cercano lidera la línea con órdenes verbales: ¡bascula!, ¡arriba!, ¡salimos!.',
      'Mantener distancias de 8 a 10 metros entre cada miembro de la línea defensiva.',
      'Perfilación corporal en diagonal que permita ver el balón y la llegada de rivales a la espalda.'
    ],
    variations: [
      'Los atacantes intentan filtrar pases al hueco para forzar el fuera de juego sincronizado.',
      'Añadir 1 mediocentro que realiza coberturas por delante de la línea defensiva.'
    ]
  },
  {
    id: 'tt-005',
    title: 'Doble Marcaje y Ayudas Defensivas en Banda',
    description: 'Coordinación entre lateral y extremo para realizar 2v1 defensivo ante el extremo rival peligroso.',
    ageCategory: ['Sub-15', 'Sub-17'],
    difficulty: 'Intermedio',
    type: 'Tática',
    durationMinutes: 20,
    setup: [
      'Zona lateral de 15x20 metros en banda.',
      'Extremo rival con balón y lateral rival que se desdobla por fuera.',
      'Lateral defensor y extremo defensor encargados de frenar el avance.'
    ],
    instructions: [
      'El lateral defensor temporiza frenando el avance interior del extremo con balón.',
      'El extremo defensor repliega en sprint para doblar el marcaje por la espalda del poseedor.',
      'Cerrar las opciones de centro o tiro forzando al rival a recular o perder el balón.',
      'Tras el robo, salir jugando rápido hacia el centro del campo.'
    ],
    coachingPoints: [
      'El lateral no debe lanzarse; su misión es fijar y temporizar hasta que llegue la ayuda.',
      'El jugador que ayuda llega en velocidad con ángulo cerrado para no cometer falta.',
      'Comunicación constante entre lateral y extremo avisando la llegada del desdoblamiento.'
    ],
    variations: [
      'El lateral atacante puede meterse por dentro simulando ser mediapunta.',
      'Si recuperan en banda, tienen 6 segundos para cruzar la línea central con pase largo.'
    ]
  },

  // --- FÍSICO (5) ---
  {
    id: 'fs-001',
    title: 'Circuito de Fuerza Explosiva y Sprints Intermitentes',
    description: 'Desarrollo de la potencia anaeróbica aláctica mediante saltos pliométricos y arrancadas cortas.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Físico',
    durationMinutes: 15,
    setup: [
      '4 estaciones de trabajo separadas 10 metros en el campo.',
      'Estación 1: Vallas bajas; Estación 2: Escalera de agilidad; Estación 3: Picas de slalom; Estación 4: Zona de sprint de 15m.'
    ],
    instructions: [
      'Estación 1: 4 saltos a pies juntos sobre vallas bajas amortiguando con rodillas.',
      'Estación 2: Skipping rápido a un apoyo por hueco en la escalera.',
      'Estación 3: Slalom en zig-zag explosivo entre picas.',
      'Estación 4: Sprint al 100% de intensidad durante 15 metros hasta la línea final.',
      'Recuperación activa caminando en el retorno al punto de inicio (1 minuto de descanso).'
    ],
    coachingPoints: [
      'Mantener el tronco firme y ligeramente inclinado en las fases de aceleración.',
      'Braceo enérgico a 90 grados sincronizado con la frecuencia de zancada.',
      'Amortiguar suavemente los saltos sobre la parte anterior del pie protegiendo articulaciones.'
    ],
    variations: [
      'Añadir control y remate a portería al finalizar el sprint de la Estación 4.',
      'Realizar las series en parejas competitivas en hileras paralelas.'
    ]
  },
  {
    id: 'fs-002',
    title: 'Pliometría en Vallas y Aceleración con Freno',
    description: 'Mejora del salto vertical, reactividad muscular y capacidad de desaceleración y frenado excéntrico.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Físico',
    durationMinutes: 20,
    setup: [
      'Hilera de 5 vallas de 30 cm de altura separadas 1 metro.',
      'Conos de frenada situados a 5, 10 y 15 metros tras las vallas.'
    ],
    instructions: [
      'Realizar saltos continuos a pies juntos sobre las vallas sin pausas intermedias en el suelo.',
      'Inmediatamente tras la última valla, salir en aceleración explosiva hacia el primer cono.',
      'Frenar en seco bajando el centro de gravedad, tocar el cono con la mano y sprintar al siguiente.',
      '4 series de 3 repeticiones con descanso completo entre series.'
    ],
    coachingPoints: [
      'Tiempo de contacto con el suelo mínimo en cada salto (reactividad elástica).',
      'En la frenada, abrir la base de sustentación y flexionar rodillas para evitar lesiones.',
      'Focalizar la respiración profunda durante los periodos de recuperación.'
    ],
    variations: [
      'Saltos laterales alternando perfiles sobre las vallas.',
      'Recepción de balón aéreo tras el último salto antes de iniciar el sprint.'
    ]
  },
  {
    id: 'fs-003',
    title: 'Resistencia con Tracción y Goma Elástica',
    description: 'Desarrollo de la fuerza de propulsión y potencia de piernas mediante carreras con sobrecarga elástica.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Intermedio',
    type: 'Físico',
    durationMinutes: 15,
    setup: [
      'Arnés o cinturón elástico de resistencia enganchado a la cintura.',
      'Parejas de futbolistas: 1 ejecuta la tracción y 1 sujeta el elástico como freno.',
      'Pasillo recto de 15 metros marcado con conos.'
    ],
    instructions: [
      'El atleta arranca con zancada potente venciendo la resistencia elástica del compañero.',
      'Completar 10 metros de tracción a máxima intensidad empujando contra el suelo.',
      'Al llegar al cono de 10 metros, el compañero suelta el arnés y el atleta vuela en sprint libre 5 metros.',
      'Rotar los roles en la pareja tras cada pasada (5 repeticiones por jugador).'
    ],
    coachingPoints: [
      'Empuje potente desde los glúteos y cuádriceps clavando las punteras en el césped.',
      'Mantener la mirada hacia adelante sin agachar la cabeza.',
      'El compañero que sujeta debe mantener tensión constante sin tirones bruscos.'
    ],
    variations: [
      'Desplazamientos laterales con elástico para fortalecer adductores y glúteo medio.',
      'Tracción hacia atrás en carrera de espaldas para fortalecimiento de isquiotibiales.'
    ]
  },
  {
    id: 'fs-004',
    title: 'Arrancadas Cortas de Reacción y Agilidad 5m',
    description: 'Mejora del tiempo de reacción y velocidad pura en distancias cortas típicas de partidos de fútbol.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15'],
    difficulty: 'Principiante',
    type: 'Físico',
    durationMinutes: 10,
    setup: [
      'Línea de salida con conos numerados del 1 al 4 a 5 metros de distancia en abanico.',
      'Grupos de 3 jugadores listos en la línea de salida.'
    ],
    instructions: [
      'Los atletas comienzan en posición variada (sentados, tumbados boca abajo o de espaldas).',
      'El entrenador grita un número de cono ("¡DOS!").',
      'Los jugadores se incorporan a máxima velocidad y sprintan rodeando el cono indicado.',
      'El primero en cruzar la línea de meta gana la ronda.'
    ],
    coachingPoints: [
      'Levantarse en un solo movimiento explosivo utilizando el impulso de los brazos.',
      'Pasos cortos y muy rápidos en los primeros 3 metros para alcanzar velocidad punta.',
      'Inclinación del cuerpo hacia el interior de la curva al rodear el cono.'
    ],
    variations: [
      'El estímulo se da mediante colores de setas levantadas en silencio (estímulo puramente visual).',
      'El jugador debe conducir un balón durante la arrancada.'
    ]
  },
  {
    id: 'fs-005',
    title: 'Test de Resistencia Intermitente Específica (Yo-Yo Adaptado)',
    description: 'Acondicionamiento aeróbico-anaeróbico mediante carreras de ida y vuelta con descansos activos controlados.',
    ageCategory: ['Sub-15', 'Sub-17'],
    difficulty: 'Avanzado',
    type: 'Físico',
    durationMinutes: 20,
    setup: [
      'Pistas de 20 metros delimitadas con conos para cada jugador.',
      'Zona de recuperación activa de 5 metros detrás de la línea de salida.'
    ],
    instructions: [
      'Carrera de 20 metros ida y 20 metros vuelta al ritmo marcado por el silbato.',
      '5 segundos de recuperación activa caminando en la zona trasera tras cada repetición.',
      'La velocidad y cadencia de las señales aumenta progresivamente cada 2 minutos.',
      'El ejercicio concluye cuando el jugador no puede mantener el ritmo establecido.'
    ],
    coachingPoints: [
      'Dosificar la energía en los primeros niveles sin acelerar en exceso.',
      'Pisar exactamente sobre la línea de 20 metros antes de girar.',
      'Girar alternando la pierna de freno en cada vuelta para equilibrar la fatiga muscular.'
    ],
    variations: [
      'Realizar las series con balón en los pies en los niveles iniciales.',
      'Medir la frecuencia cardíaca al finalizar para control de cargas.'
    ]
  },

  // --- PORTERO (5) ---
  {
    id: 'gl-001',
    title: 'Blocaje Raso con Caída Lateral y Cobertura Corporal',
    description: 'Técnica de caída lateral segura y blocaje en dos tiempos para tiros rasos ajustados a los palos.',
    ageCategory: ['Sub-13', 'Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Intermedio',
    type: 'Portero',
    durationMinutes: 15,
    setup: [
      'Portería con portero situado en el centro de la línea de gol.',
      'Entrenador de porteros a 10 metros en la frontal con 10 balones.',
      'Colchoneta o césped blando en los laterales para amortiguar el impacto.'
    ],
    instructions: [
      'El portero inicia en posición básica con las piernas semiflexionadas y manos abiertas.',
      'El entrenador golpea un balón raso con bote tenso hacia el palo izquierdo.',
      'El portero da un paso de aproximación lateral y se estira colocando las manos detrás del balón.',
      'Bloca el balón pegándolo al pecho con el cuerpo de barrera e inmediatamente se levanta.'
    ],
    coachingPoints: [
      'No lanzarse de barriga ni de espaldas; la caída debe ser sobre el costado lateral del cuerpo.',
      'Las manos forman una cuchara o copa envolviendo el esférico para evitar rechaces.',
      'El pie más cercano al balón impulsa con fuerza lateral.'
    ],
    variations: [
      'Disparos alternados a izquierda y derecha sin tiempo de pausa entre repeticiones.',
      'El entrenador amaga el tiro para evaluar la estabilidad del guardameta.'
    ]
  },
  {
    id: 'gl-002',
    title: 'Salida Aérea en Centros y Blocaje en Punto Más Alto',
    description: 'Dominio del área pequeña, lectura de trayectorias aéreas y seguridad en balones colgados.',
    ageCategory: ['Sub-15', 'Sub-17'],
    difficulty: 'Avanzado',
    type: 'Portero',
    durationMinutes: 20,
    setup: [
      'Portería reglamentaria con siluetas o muñecos colocados en el área de penalti.',
      'Pasador en la banda derecha y pasador en la banda izquierda con balones colgados.'
    ],
    instructions: [
      'El pasador ejecuta un centro bombeado hacia el corazón del área pequeña.',
      'El portero evalúa la parábola, grita ¡MÍA! con autoridad y sale en carrera.',
      'Salta batiendo con una sola pierna y elevando la rodilla de protección.',
      'Atrapa el balón con las dos manos en el punto más alto de su trayectoria.'
    ],
    coachingPoints: [
      'Grito potente ¡MÍA! para coordinarse con los defensas centrales y evitar choques.',
      'Manos en forma de "W" detrás del esférico con dedos firmes pero elásticos.',
      'Elevar la rodilla opuesta al salto como elemento de impulso y protección corporal.'
    ],
    variations: [
      'Añadir 1 delantero que salta a disputar el balón aéreo de forma leal.',
      'Si no es posible atrapar, despejar de puños hacia las bandas laterales.'
    ]
  },
  {
    id: 'gl-003',
    title: 'Reacción Refleja a Doble Parada a Bocajarro',
    description: 'Velocidad de reacción, capacidad de levantarse rápido (second effort) y reflejos bajo palos.',
    ageCategory: ['Sub-13', 'Sub-15', 'Adulto'],
    difficulty: 'Intermedio',
    type: 'Portero',
    durationMinutes: 15,
    setup: [
      'Portería pequeña o reglamentaria con guardameta en posición activa.',
      'Entrenador con balones a 6 metros en la frontal y un rematador al rebote a 4 metros.'
    ],
    instructions: [
      'El entrenador ejecuta un disparo fuerte a media altura.',
      'El portero realiza la primera parada desviando el balón hacia un lado.',
      'Inmediatamente se incorpora con máxima agilidad para atajar el segundo remate a quemarropa del rematador.',
      'Completar series de 5 dobles intervenciones con descanso de 1 minuto.'
    ],
    coachingPoints: [
      'Utilizar las manos y el impulso del core para reincorporarse en fracción de segundo.',
      'Mantener la mirada siempre fija en el balón sin desentenderse de la segunda jugada.',
      'Hacerse grande abriendo brazos y piernas para tapar el máximo ángulo posible.'
    ],
    variations: [
      'Utilizar pelotas de tenis o balones de reacción impredecible en el primer golpeo.',
      'El segundo disparo puede venir de cualquiera de los dos costados.'
    ]
  },
  {
    id: 'gl-004',
    title: 'Mano a Mano 1v1 y Achique de Espacios',
    description: 'Técnica de reducción de espacios, temporización y bloqueo en cruz en situaciones de mano a mano.',
    ageCategory: ['Sub-11', 'Sub-13', 'Sub-15', 'Sub-17'],
    difficulty: 'Principiante',
    type: 'Portero',
    durationMinutes: 10,
    setup: [
      'Área grande con portero y fila de delanteros en la media luna con balones.'
    ],
    instructions: [
      'El delantero arranca en conducción encarando al portero en velocidad.',
      'El portero sale achicando el ángulo a pasos rápidos y cortos.',
      'A 2 metros del atacante, el portero se planta en posición de cruz (bloqueo rodilla al suelo y brazos abiertos).',
      'Aguanta sin tirarse antes de tiempo obligando al delantero a tomar la decisión.'
    ],
    coachingPoints: [
      'No lanzarse al suelo antes de que el delantero toque el balón hacia adelante.',
      'Mantener el cuerpo erguido en la cruz para cubrir tanto el disparo raso como el tiro picado.',
      'Manos bajas protegiendo el espacio entre las piernas (caño).'
    ],
    variations: [
      'El delantero tiene un límite de 4 segundos para finalizar la jugada.',
      'Si el portero atrapa el balón, lanza un contragolpe con la mano hacia una miniportería.'
    ]
  },
  {
    id: 'gl-005',
    title: 'Juego de Pies y Saque Rápido de Contragolpe',
    description: 'Participación del portero en la circulación con los pies y precisión en saques de contraataque.',
    ageCategory: ['Sub-15', 'Sub-17', 'Adulto'],
    difficulty: 'Avanzado',
    type: 'Portero',
    durationMinutes: 20,
    setup: [
      'Portería reglamentaria con el portero situado en la frontal del área pequeña.',
      '2 defensas centrales pasando balones comprometidos hacia atrás.',
      '2 miniporterías en las bandas del centro del campo como objetivos de saque.'
    ],
    instructions: [
      'El central hace una cesión hacia atrás al portero con presión de un atacante.',
      'El portero realiza control orientado con la pierna derecha y cambia de perfil.',
      'Ejecuta un pase largo raso o saque de volea milimétrico hacia las miniporterías de banda.',
      'Alternar cesiones hacia la pierna derecha y pierna izquierda.'
    ],
    coachingPoints: [
      'El control orientado debe sacar el balón de la trayectoria de la portería (seguridad ante fallos).',
      'Cabeza levantada antes de recibir para identificar al compañero desmarcado.',
      'Golpeo tenso con el empeine para que el contraataque llegue con máxima velocidad.'
    ],
    variations: [
      'La presión del atacante es real y busca robar si el portero demora más de 2 toques.',
      'Saques con la mano en trayectoria tensa hacia un compañero en carrera.'
    ]
  }
];

export const ALL_DRILLS = [...DRILLS, ...generatedDrills].map(enrichDynamicDrill);
