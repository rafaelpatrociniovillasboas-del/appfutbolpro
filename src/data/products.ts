export interface ComplementaryProduct {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  checkoutUrl: string;
  description: string;
  highlights: string[];
  category: string;
  featured?: boolean;
}

export const COMPLEMENTARY_PRODUCTS: ComplementaryProduct[] = [
  {
    id: 'prod-futsal-500-videos',
    title: '⚽ 500 entrenamientos de fútbol sala en vídeo',
    subtitle: 'Ejercicios tácticos y técnicos en alta definición listos para aplicar',
    badge: 'Más Vendido 🔥',
    price: 'US$ 4,90',
    originalPrice: 'US$ 29,90',
    imageUrl: 'https://i.postimg.cc/zf0Qrp8F/Chat-GPT-Image-24-de-ago-de-2026-18-45-24.png',
    checkoutUrl: 'https://pay.hotmart.com/Y107253272E',
    description: 'Colección definitiva de más de 500 ejercicios prácticos en vídeo para fútbol sala. Metodología profesional explicada paso a paso para todas las etapas formativas y competitivas.',
    highlights: [
      'Más de 500 sesiones completas grabadas en vídeo',
      'Pases, regates, transiciones rápidas y jugadas ensayadas',
      'Acceso inmediato y vitalicio a través de Hotmart',
      'Compatible con móvil, tablet y ordenador'
    ],
    category: 'Fútbol Sala'
  },
  {
    id: 'prod-llena-tu-escuela',
    title: '🎯 LLENA TU ESCUELA DE NUEVOS ALUMNOS',
    subtitle: 'Estrategias probadas para captar y fidelizar alumnos en tu academia',
    badge: 'Captación & Crecimiento 🎯',
    price: 'US$ 6,90',
    originalPrice: 'US$ 39,90',
    imageUrl: 'https://i.postimg.cc/Y0RNG2qz/Chat-GPT-Image-24-de-ago-de-2026-19-02-20.png',
    checkoutUrl: 'https://pay.hotmart.com/L107253721Y',
    description: 'Guía práctica y embudos de atracción para llenar las clases de tu escuela deportiva, aumentar la retención de jugadores y multiplicar inscripciones mes a mes.',
    highlights: [
      'Estrategias de atracción orgánica y campañas locales efectivas',
      'Guiones de comunicación para padres y cierre de matrículas',
      'Modelos de clases de prueba con alta tasa de conversión',
      'Técnicas de fidelización para evitar bajas a mitad de temporada'
    ],
    category: 'Gestión & Marketing'
  },
  {
    id: 'prod-protocolo-movilidad',
    title: '🛡️ PROTOCOLO DE MOVILIDAD Y PREVENCIÓN',
    subtitle: 'Rutinas esenciales para prevenir lesiones y mejorar la agilidad',
    badge: 'Salud & Rendimiento 🛡️',
    price: 'US$ 5,90',
    originalPrice: 'US$ 34,90',
    imageUrl: 'https://i.postimg.cc/kXh8kpVJ/Chat-GPT-Image-24-de-ago-de-2026-19-06-24.png',
    checkoutUrl: 'https://pay.hotmart.com/D107254059J',
    description: 'Protocolos estructurados de calentamiento dinámico, movilidad articular y ejercicios preventivos para proteger a tus jugadores y elevar su rendimiento físico en la pista y campo.',
    highlights: [
      'Rutinas pre-entrenamiento y activación neuromuscular rápida',
      'Prevención de lesiones en rodilla, tobillo y aductores',
      'Ejercicios de flexibilidad dinámica para todas las edades',
      'Fácil aplicación en los primeros 10-15 minutos de sesión'
    ],
    category: 'Preparación Física'
  },
  {
    id: 'prod-crea-explica-jugadas',
    title: '⚡ CREA Y EXPLICA TUS JUGADAS EN MINUTOS',
    subtitle: 'Domina la comunicación táctica y el diseño de jugadas ensayadas',
    badge: 'Pizarrón & Táctica ⚡',
    price: 'US$ 4,90',
    originalPrice: 'US$ 27,90',
    imageUrl: 'https://i.postimg.cc/N0vytqQs/Chat-GPT-Image-24-de-ago-de-2026-19-09-24.png',
    checkoutUrl: 'https://pay.hotmart.com/L107254238M',
    description: 'Metodología clara y visual para diseñar, diagramar y transmitir conceptos tácticos a tus alumnos con máxima claridad y rapidez, logrando que ejecuten con confianza.',
    highlights: [
      'Sistemas de ataque posicional, contragolpes y presión alta',
      'Jugadas a balón parado (córners, faltas, saques de banda)',
      'Técnicas de comunicación para que los jugadores entiendan al instante',
      'Diagramas tácticos listos para aplicar y compartir'
    ],
    category: 'Táctica & Estrategia'
  },
  {
    id: 'prod-mega-pack-40-off',
    title: '🔥 ¡NO LO PIENSES! LLÉVATE TODO CON 40% OFF',
    subtitle: 'El Combo Definitivo con todos los materiales y recursos VIP con 40% de descuento',
    badge: 'OFERTA ESPECIAL COMBO 💥',
    price: 'US$ 13,90',
    originalPrice: 'US$ 67,00',
    imageUrl: 'https://i.postimg.cc/PrBJbspK/Chat-GPT-Image-25-de-ago-de-2026-05-34-07.png',
    checkoutUrl: 'https://pay.hotmart.com/J107254768Q',
    description: 'Acceso total a la biblioteca completa: 500 entrenamientos en vídeo, sistema de captación de alumnos, protocolo de movilidad/prevención y método de diseño táctico con un 40% de descuento.',
    highlights: [
      'Acceso completo a los 4 cursos y packs en un solo pago',
      'Ahorro directo de más del 40% vs compra individual',
      'Acceso inmediato y vitalicio a todo el material en Hotmart',
      'Metodología integral: técnica, táctica, física y gestión'
    ],
    category: 'Mega Pack VIP',
    featured: true
  }
];
