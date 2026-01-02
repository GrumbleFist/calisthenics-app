import { db } from './database';
import type { Exercise, Stretch, AppSettings, UserProgress, MuscleChain } from './types';
import exercisesData from '../data/exercises.json';
import stretchesData from '../data/stretches.json';

export async function initializeDatabase(): Promise<void> {
  const exerciseCount = await db.exercises.count();

  if (exerciseCount === 0) {
    console.log('Initializing database with default data...');

    // Add exercises
    await db.exercises.bulkAdd(exercisesData as Exercise[]);

    // Add stretches
    await db.stretches.bulkAdd(stretchesData as Stretch[]);

    // Initialize app settings
    const settings: AppSettings = {
      currentWorkoutType: 'Upper1',
      restTimerSeconds: 90
    };
    await db.appSettings.add(settings);

    // Initialize user progress for each muscle chain / exercise class combination
    const muscleChains: MuscleChain[] = [
      'Quads',
      'Triceps & Pectorals',
      'Abdominals & Obliques',
      'Hamstrings & Calves',
      'Biceps & Scapula',
      'Glutes & Lumbar'
    ];

    for (const chain of muscleChains) {
      const exercises = await db.exercises
        .where('muscleChain')
        .equals(chain)
        .toArray();

      const exerciseClasses = [...new Set(exercises.map(e => e.exerciseClass))];

      for (const exerciseClass of exerciseClasses) {
        const progress: UserProgress = {
          muscleChain: chain,
          exerciseClass,
          currentDifficulty: 'Intermediate',
          lastWorkoutDate: null,
          lastExerciseClassUsed: {
            Upper1: '',
            Lower1: '',
            Upper2: '',
            Lower2: ''
          }
        };
        await db.userProgress.add(progress);
      }
    }

    console.log('Database initialized successfully');
  }
}

export async function resetDatabase(): Promise<void> {
  await db.exercises.clear();
  await db.stretches.clear();
  await db.workoutSessions.clear();
  await db.userProgress.clear();
  await db.appSettings.clear();
  await initializeDatabase();
}
