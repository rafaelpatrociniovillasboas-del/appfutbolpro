import fs from 'fs';

const types = ['Calentamiento', 'Regate', 'Definición', 'Pase', 'Táctica', 'Físico', 'Portero'];
const difficulties = ['Principiante', 'Intermedio', 'Avanzado'];
const ageCategoriesList = ['Sub-7', 'Sub-9', 'Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Adulto'];

const actionsMap = {
  'Calentamiento': ['Rondo 4v1', 'Pilla-Pilla con Balón', 'Control y Conducción Libre', 'Rueda de Pases Rápida', 'Movilidad y Estiramiento Activo', 'Pase Rápido por Parejas', 'Toques en Círculo', 'Carrera en Zig-Zag', 'Pasillo de Pases Dinámico', 'Intercambio de Posiciones'],
  'Regate': ['Duelo 1v1 en Banda', 'Regate en Espacio Reducido', 'Aceleración con Finta', 'Zig-Zag entre Cones', 'Protección de Balón', 'Bicicleta y Disparo', 'Desborde 2v1', 'Conducción en Círculo', 'Desmarque y Salida', '1v1 de Espaldas'],
  'Definición': ['Tiro a Puerta Tras Conducción', 'Remate al Primer Toque', 'Cabezazo tras Centro Lateral', 'Tiro Raso al Palo Largo', 'Golpeo de Volea', 'Penalti con Presión', 'Definición tras Regate', 'Remate a la Escuadra', 'Pivote y Disparo a la Media Vuelta', 'Circuito de Remates'],
  'Pase': ['Pared Rápida al Primer Toque', 'Pase Filtrado al Espacio', 'Cambio de Orientación Largo', 'Triangulación Ofensiva', 'Pase al Espacio Libre', 'Pase Rompiendo Líneas', 'Rueda de Pases Continua', 'Juego de Apoyo en Corto', 'Pase Picado', 'Circulación Rápida de Balón'],
  'Táctica': ['Ataque vs Defensa Organizada', 'Partido en Medio Campo', 'Transición Ofensiva Rápida', 'Compactación Defensiva en Bloque', 'Presión Alta Tras Pérdida', 'Saque de Esquina Ensayado', 'Línea de Fuera de Juego', 'Doble Marcaje en Banda', 'Repliegue y Contragolpe', 'Basculación Defensiva'],
  'Físico': ['Sprint de 10 Metros con Freno', 'Resistencia Intermitente', 'Velocidad Explosiva', 'Circuito de Saltos Pliométricos', 'Potencia en Arrancada', 'Desplazamiento Lateral Defensivo', 'Circuito de Fuerza y Agilidad', 'Agilidad con Setas y Vallas', 'Aceleraciones Cortas', 'Tracción con Resistencia'],
  'Portero': ['Estirada a Mano Cambiada', 'Parada de Balón Raso', 'Salida por Alto en Centros', 'Juego de Pies y Salida', 'Desplazamientos Rápidos Bajo Palos', 'Agilidad con Doble Balón', 'Saque Rápido de Contragolpe', 'Mano a Mano 1v1', 'Blocaje Aéreo Seguro', 'Desvío a Córner']
};

const contexts = ['en Campo Reducido', 'con Oposición Real', 'en Alta Intensidad', 'con Foco en la Precisión', 'para Activación', 'con Miniporterías', 'por Parejas', 'en Tríos', 'con Comodín Ofensivo', 'con Portero Activo'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomAges(type, diff) {
  let possible = [...ageCategoriesList];
  if (diff === 'Avanzado') possible = possible.filter(a => !['Sub-7', 'Sub-9'].includes(a));
  if (diff === 'Principiante') possible = possible.filter(a => !['Adulto', 'Sub-17'].includes(a));
  
  if (possible.length === 0) possible = ['Sub-11', 'Sub-13'];
  
  const count = Math.floor(Math.random() * 2) + 1;
  const ages = new Set();
  for(let i = 0; i < count; i++) {
    ages.add(getRandomItem(possible));
  }
  return Array.from(ages).sort((a, b) => ageCategoriesList.indexOf(a) - ageCategoriesList.indexOf(b));
}

const drills = [];
for (let i = 1; i <= 1000; i++) {
  const type = getRandomItem(types);
  const difficulty = getRandomItem(difficulties);
  const ageCategory = getRandomAges(type, difficulty);
  
  const action = getRandomItem(actionsMap[type]);
  const context = getRandomItem(contexts);
  const title = `${action} ${context} #${i}`;
  
  let description = `Entrenamiento enfocado en ${type.toLowerCase()} para perfeccionar la técnica y táctica individual. El ejercicio "${action}" se realiza de forma adaptada ("${context}") para maximizar el rendimiento en partido oficial.`;
  
  drills.push({
    id: `gerado-${i.toString().padStart(4, '0')}`,
    title: title,
    description: description,
    ageCategory: ageCategory,
    difficulty: difficulty,
    type: type,
    durationMinutes: Math.floor(Math.random() * 15) + 10,
    setup: [
      'Delimitar la zona de trabajo con setas de colores.',
      'Distribuir a los futbolistas en grupos reducidos.',
      'El entrenador da la señal de inicio con silbato.'
    ],
    instructions: [
      'Tocar el balón de primeras si llega la presión defensiva.',
      'Quien pierda la posesión pasa al centro a recuperar.',
      'Mantener alta intensidad y velocidad en la circulación.',
      'Buscar remate a portería en cuanto se abra la línea de tiro.'
    ],
    coachingPoints: [
      'Levantar la cabeza y escanear el entorno antes de recibir.',
      'Comunicarse verbalmente pidiendo el balón de cara.',
      'Ofrecer apoyo constante al compañero con balón.'
    ],
    variations: [
      'Limitar a un máximo de 2 toques por jugador.',
      'El gol con la pierna menos hábil vale doble.'
    ]
  });
}

fs.writeFileSync('src/generated_drills.json', JSON.stringify(drills, null, 2));
console.log('Successfully generated 1000 drills in Spanish into src/generated_drills.json');
