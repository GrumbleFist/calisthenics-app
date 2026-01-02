export type MuscleChain =
  | 'Quads'
  | 'Triceps & Pectorals'
  | 'Abdominals & Obliques'
  | 'Hamstrings & Calves'
  | 'Biceps & Scapula'
  | 'Glutes & Lumbar';

export type Difficulty =
  | 'Novice'
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert'
  | 'Master';

export type Position =
  | 'Standing'
  | 'Kneeling'
  | 'Lying Back'
  | 'Lying Front'
  | 'Seated';

export type WorkoutType = 'Upper1' | 'Lower1' | 'Upper2' | 'Lower2';

export type EffortRating = 1 | 2 | 3; // 1=Too Easy, 2=Tough, 3=Too Hard

export interface Exercise {
  id?: number;
  muscleChain: MuscleChain;
  exerciseClass: string;
  difficulty: Difficulty;
  name: string;
  targetReps: number | null;
  targetWeight: number | null;
  requiresWeight: boolean;
  active: boolean;
}

export interface Stretch {
  id?: number;
  name: string;
  position: Position;
  muscleGroups: string[];
  active: boolean;
}

export interface SetLog {
  setNumber: 1 | 2 | 3 | 4;
  targetRepRange: '5-7' | '10-13' | '15-20' | '20-25';
  exerciseId: number;
  exerciseName: string;
  actualReps: number | null;
  weight: number | null;
  completedAt: Date | null;
}

export interface WorkoutSession {
  id?: number;
  date: Date;
  type: WorkoutType;
  muscleChains: MuscleChain[];
  sets: SetLog[];
  completed: boolean;
  effortRating: EffortRating | null;
  stretchesCompleted: number[];
}

export interface UserProgress {
  id?: number;
  muscleChain: MuscleChain;
  exerciseClass: string;
  currentDifficulty: Difficulty;
  lastWorkoutDate: Date | null;
  lastExerciseClassUsed: Record<WorkoutType, string>;
}

export interface AppSettings {
  id?: number;
  currentWorkoutType: WorkoutType;
  restTimerSeconds: number;
}

export const DIFFICULTY_ORDER: Difficulty[] = [
  'Novice',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master'
];

export const UPPER_MUSCLE_CHAINS: MuscleChain[] = [
  'Triceps & Pectorals',
  'Abdominals & Obliques',
  'Biceps & Scapula'
];

export const LOWER_MUSCLE_CHAINS: MuscleChain[] = [
  'Quads',
  'Hamstrings & Calves',
  'Glutes & Lumbar'
];

export const SET_REP_RANGES: { setNumber: 1 | 2 | 3 | 4; range: '5-7' | '10-13' | '15-20' | '20-25'; label: string }[] = [
  { setNumber: 1, range: '5-7', label: 'Strength' },
  { setNumber: 2, range: '10-13', label: 'Growth' },
  { setNumber: 3, range: '15-20', label: 'Pump' },
  { setNumber: 4, range: '20-25', label: 'Finisher' }
];
