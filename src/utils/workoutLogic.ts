import { db } from '../db/database';
import type {
  Exercise,
  MuscleChain,
  WorkoutType,
  Difficulty,
  SetLog,
  WorkoutSession,
  Stretch
} from '../db/types';
import {
  UPPER_MUSCLE_CHAINS,
  LOWER_MUSCLE_CHAINS,
  DIFFICULTY_ORDER,
  SET_REP_RANGES
} from '../db/types';

export function getMuscleChains(workoutType: WorkoutType): MuscleChain[] {
  if (workoutType === 'Upper1' || workoutType === 'Upper2') {
    return UPPER_MUSCLE_CHAINS;
  }
  return LOWER_MUSCLE_CHAINS;
}

export function getNextWorkoutType(current: WorkoutType): WorkoutType {
  const order: WorkoutType[] = ['Upper1', 'Lower1', 'Upper2', 'Lower2'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

export function getPairedWorkoutType(workoutType: WorkoutType): WorkoutType {
  const pairs: Record<WorkoutType, WorkoutType> = {
    Upper1: 'Upper2',
    Upper2: 'Upper1',
    Lower1: 'Lower2',
    Lower2: 'Lower1'
  };
  return pairs[workoutType];
}

export async function selectExerciseClass(
  muscleChain: MuscleChain,
  workoutType: WorkoutType
): Promise<string> {
  // Get all active exercise classes for this muscle chain
  const exercises = await db.exercises
    .where('muscleChain')
    .equals(muscleChain)
    .and(e => e.active)
    .toArray();

  const exerciseClasses = [...new Set(exercises.map(e => e.exerciseClass))];

  if (exerciseClasses.length === 0) {
    throw new Error(`No active exercises for ${muscleChain}`);
  }

  if (exerciseClasses.length === 1) {
    return exerciseClasses[0];
  }

  // Get what was used in the paired workout
  const pairedType = getPairedWorkoutType(workoutType);
  const progress = await db.userProgress
    .where('muscleChain')
    .equals(muscleChain)
    .toArray();

  const usedInPaired = new Set<string>();
  for (const p of progress) {
    const lastUsed = p.lastExerciseClassUsed[pairedType];
    if (lastUsed) {
      usedInPaired.add(lastUsed);
    }
  }

  // Filter out classes used in paired workout
  let available = exerciseClasses.filter(c => !usedInPaired.has(c));

  // If all were used, pick randomly from all
  if (available.length === 0) {
    available = exerciseClasses;
  }

  // Pick randomly from available
  return available[Math.floor(Math.random() * available.length)];
}

export function getDropSetExercises(
  exercises: Exercise[],
  currentDifficulty: Difficulty
): Exercise[] {
  const difficultyIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);
  const result: Exercise[] = [];

  // Get 4 consecutive difficulty levels going DOWN
  for (let i = 0; i < 4; i++) {
    const targetDiffIndex = difficultyIndex - i;
    if (targetDiffIndex >= 0) {
      const targetDiff = DIFFICULTY_ORDER[targetDiffIndex];
      const exercise = exercises.find(e => e.difficulty === targetDiff && e.active);
      if (exercise) {
        result.push(exercise);
      }
    }
  }

  // If we don't have 4 exercises, fill from the bottom
  while (result.length < 4 && result.length < exercises.filter(e => e.active).length) {
    const activeExercises = exercises.filter(e => e.active && !result.includes(e));
    if (activeExercises.length > 0) {
      // Sort by difficulty (easiest first) and add
      activeExercises.sort((a, b) =>
        DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty)
      );
      result.push(activeExercises[0]);
    } else {
      break;
    }
  }

  return result;
}

export async function generateWorkout(workoutType: WorkoutType): Promise<WorkoutSession> {
  const muscleChains = getMuscleChains(workoutType);
  const sets: SetLog[] = [];

  for (const muscleChain of muscleChains) {
    // Select exercise class for this muscle chain
    const exerciseClass = await selectExerciseClass(muscleChain, workoutType);

    // Get current difficulty for this exercise class
    const progress = await db.userProgress
      .where('muscleChain')
      .equals(muscleChain)
      .and(p => p.exerciseClass === exerciseClass)
      .first();

    const currentDifficulty = progress?.currentDifficulty || 'Intermediate';

    // Get all exercises for this class
    const exercises = await db.exercises
      .where('muscleChain')
      .equals(muscleChain)
      .and(e => e.exerciseClass === exerciseClass)
      .toArray();

    // Get drop set exercises
    const dropSetExercises = getDropSetExercises(exercises, currentDifficulty);

    // Create sets
    for (let i = 0; i < Math.min(4, dropSetExercises.length); i++) {
      const exercise = dropSetExercises[i];
      const setInfo = SET_REP_RANGES[i];

      sets.push({
        setNumber: setInfo.setNumber,
        targetRepRange: setInfo.range,
        exerciseId: exercise.id!,
        exerciseName: exercise.name,
        actualReps: null,
        weight: null,
        completedAt: null
      });
    }

    // Update last used exercise class for this workout type
    if (progress) {
      const newLastUsed = { ...progress.lastExerciseClassUsed };
      newLastUsed[workoutType] = exerciseClass;
      await db.userProgress.update(progress.id!, {
        lastExerciseClassUsed: newLastUsed
      });
    }
  }

  const session: WorkoutSession = {
    date: new Date(),
    type: workoutType,
    muscleChains,
    sets,
    completed: false,
    effortRating: null,
    stretchesCompleted: []
  };

  const id = await db.workoutSessions.add(session);
  session.id = id;

  return session;
}

export async function getStretchesForWorkout(muscleChains: MuscleChain[]): Promise<Stretch[]> {
  // Map muscle chains to stretch muscle groups
  const muscleGroupMap: Record<MuscleChain, string[]> = {
    'Quads': ['Quadriceps', 'Hip Flexors', 'Hips'],
    'Triceps & Pectorals': ['Triceps', 'Chest', 'Shoulders'],
    'Abdominals & Obliques': ['Hip Flexors', 'Back', 'Spine'],
    'Hamstrings & Calves': ['Hamstrings', 'Calves', 'Ankles'],
    'Biceps & Scapula': ['Biceps', 'Shoulders', 'Back', 'Lats'],
    'Glutes & Lumbar': ['Glutes', 'Back', 'Hips']
  };

  const targetMuscleGroups = new Set<string>();
  for (const chain of muscleChains) {
    for (const group of muscleGroupMap[chain]) {
      targetMuscleGroups.add(group);
    }
  }

  // Get all active stretches that target these muscle groups
  const allStretches = await db.stretches
    .filter(s => s.active)
    .toArray();

  const matchingStretches = allStretches.filter(stretch =>
    stretch.muscleGroups.some(mg => targetMuscleGroups.has(mg))
  );

  // Group by position
  const positions = ['Standing', 'Kneeling', 'Lying Back', 'Lying Front', 'Seated'];
  const selected: Stretch[] = [];

  for (const position of positions) {
    const positionStretches = matchingStretches.filter(s => s.position === position);
    if (positionStretches.length > 0) {
      // Prioritize multi-muscle stretches
      positionStretches.sort((a, b) => b.muscleGroups.length - a.muscleGroups.length);
      // Pick one randomly from top 3
      const topStretches = positionStretches.slice(0, 3);
      selected.push(topStretches[Math.floor(Math.random() * topStretches.length)]);
    }
  }

  return selected;
}

export async function completeWorkout(
  sessionId: number,
  effortRating: 1 | 2 | 3,
  stretchesCompleted: number[]
): Promise<void> {
  await db.workoutSessions.update(sessionId, {
    completed: true,
    effortRating,
    stretchesCompleted
  });

  // Update settings to next workout type
  const settings = await db.appSettings.toCollection().first();
  if (settings) {
    const nextType = getNextWorkoutType(settings.currentWorkoutType);
    await db.appSettings.update(settings.id!, {
      currentWorkoutType: nextType
    });
  }
}
