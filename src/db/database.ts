import Dexie, { type EntityTable } from 'dexie';
import type { Exercise, Stretch, WorkoutSession, UserProgress, AppSettings } from './types';

const db = new Dexie('CalisthenicsDB') as Dexie & {
  exercises: EntityTable<Exercise, 'id'>;
  stretches: EntityTable<Stretch, 'id'>;
  workoutSessions: EntityTable<WorkoutSession, 'id'>;
  userProgress: EntityTable<UserProgress, 'id'>;
  appSettings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  exercises: '++id, muscleChain, exerciseClass, difficulty, active',
  stretches: '++id, position, active',
  workoutSessions: '++id, date, type, completed',
  userProgress: '++id, muscleChain, exerciseClass',
  appSettings: '++id'
});

export { db };
