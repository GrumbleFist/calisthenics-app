import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db/database';
import type { Exercise, MuscleChain, Difficulty } from '../db/types';
import { DIFFICULTY_ORDER } from '../db/types';

const MUSCLE_CHAINS: MuscleChain[] = [
  'Quads',
  'Triceps & Pectorals',
  'Abdominals & Obliques',
  'Hamstrings & Calves',
  'Biceps & Scapula',
  'Glutes & Lumbar'
];

export default function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedChain, setSelectedChain] = useState<MuscleChain>('Quads');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, [selectedChain]);

  const loadExercises = async () => {
    const data = await db.exercises
      .where('muscleChain')
      .equals(selectedChain)
      .toArray();
    // Sort by exercise class then difficulty
    data.sort((a, b) => {
      if (a.exerciseClass !== b.exerciseClass) {
        return a.exerciseClass.localeCompare(b.exerciseClass);
      }
      return DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty);
    });
    setExercises(data);
  };

  const toggleActive = async (exercise: Exercise) => {
    await db.exercises.update(exercise.id!, { active: !exercise.active });
    loadExercises();
  };

  const toggleRequiresWeight = async (exercise: Exercise) => {
    await db.exercises.update(exercise.id!, { requiresWeight: !exercise.requiresWeight });
    loadExercises();
  };

  const updateExercise = async (exercise: Exercise) => {
    await db.exercises.update(exercise.id!, exercise);
    setEditingExercise(null);
    loadExercises();
  };

  const groupedExercises = exercises.reduce((acc, ex) => {
    if (!acc[ex.exerciseClass]) {
      acc[ex.exerciseClass] = [];
    }
    acc[ex.exerciseClass].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="min-h-screen pb-24 bg-background">
      <header className="p-4 border-b border-surface sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold text-text mb-4">Exercise Manager</h1>

        {/* Muscle Chain Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {MUSCLE_CHAINS.map(chain => (
            <button
              key={chain}
              onClick={() => setSelectedChain(chain)}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedChain === chain
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted'
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-6">
        {Object.entries(groupedExercises).map(([className, classExercises]) => (
          <div key={className}>
            <h3 className="text-lg font-semibold text-text mb-3">{className}</h3>
            <div className="space-y-2">
              {classExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className={`bg-surface rounded-lg p-4 ${!exercise.active ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-text">{exercise.name}</p>
                      <p className="text-sm text-text-muted">{exercise.difficulty}</p>
                    </div>
                    <button
                      onClick={() => setEditingExercise(exercise)}
                      className="text-primary text-sm"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => toggleActive(exercise)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        exercise.active
                          ? 'bg-success/20 text-success'
                          : 'bg-surface-light text-text-muted'
                      }`}
                    >
                      {exercise.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => toggleRequiresWeight(exercise)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        exercise.requiresWeight
                          ? 'bg-primary/20 text-primary'
                          : 'bg-surface-light text-text-muted'
                      }`}
                    >
                      {exercise.requiresWeight ? 'Weighted' : 'Bodyweight'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingExercise && (
        <EditExerciseModal
          exercise={editingExercise}
          onSave={updateExercise}
          onClose={() => setEditingExercise(null)}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light">
        <div className="flex justify-around py-3">
          <Link to="/" className="flex flex-col items-center text-text-muted">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center text-text-muted">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link to="/exercises" className="flex flex-col items-center text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs mt-1">Exercises</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center text-text-muted">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

function EditExerciseModal({
  exercise,
  onSave,
  onClose
}: {
  exercise: Exercise;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(exercise.name);
  const [difficulty, setDifficulty] = useState<Difficulty>(exercise.difficulty);
  const [targetReps, setTargetReps] = useState(exercise.targetReps?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(exercise.targetWeight?.toString() || '');

  const handleSave = () => {
    onSave({
      ...exercise,
      name,
      difficulty,
      targetReps: targetReps ? parseInt(targetReps) : null,
      targetWeight: targetWeight ? parseFloat(targetWeight) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-text mb-4">Edit Exercise</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-text-muted text-sm mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-light text-text px-4 py-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full bg-surface-light text-text px-4 py-3 rounded-lg"
            >
              {DIFFICULTY_ORDER.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">Target Reps</label>
            <input
              type="number"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="Optional"
              className="w-full bg-surface-light text-text px-4 py-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">Target Weight (kg)</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="Optional"
              className="w-full bg-surface-light text-text px-4 py-3 rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-surface-light text-text font-semibold py-3 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
