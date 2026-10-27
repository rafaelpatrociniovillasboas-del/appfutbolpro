export type AgeCategory = 'Sub-6' | 'Sub-7' | 'Sub-8' | 'Sub-9' | 'Sub-10' | 'Sub-11' | 'Sub-12' | 'Sub-13' | 'Sub-14' | 'Sub-15' | 'Sub-16' | 'Sub-17' | 'Sub-18' | 'Sub-20' | 'Sub-23' | 'Adulto';
export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado' | 'Iniciante' | 'Intermediário' | 'Avançado';
export type DrillType = 'Calentamiento' | 'Pase' | 'Regate' | 'Definición' | 'Finalización' | 'Táctica' | 'Físico' | 'Arquero' | 'Portero' | 'Aquecimento' | 'Passe' | 'Drible' | 'Finalização' | 'Tática' | 'Goleiro';

export interface Drill {
  id: string;
  title: string;
  description: string;
  ageCategory: AgeCategory[];
  difficulty: Difficulty;
  type: DrillType;
  durationMinutes: number;
  setup: string[];
  instructions: string[];
  coachingPoints: string[];
  variations: string[];
}
