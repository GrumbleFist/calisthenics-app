import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import type { WorkoutSession, Exercise, Stretch, EffortRating } from '../db/types';
import { getStretchesForWorkout, completeWorkout } from '../utils/workoutLogic';
import { SET_REP_RANGES } from '../db/types';
import RestTimer from '../components/RestTimer';
import EffortRatingModal from '../components/EffortRating';

export default function ActiveWorkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutId = location.state?.workoutId;

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Map<number, Exercise>>(new Map());
  const [stretches, setStretches] = useState<Stretch[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [showStretches, setShowStretches] = useState(false);
  const [showEffortRating, setShowEffortRating] = useState(false);
  const [completedStretches, setCompletedStretches] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!workoutId) {
      navigate('/');
      return;
    }

    const loadWorkout = async () => {
      const workout = await db.workoutSessions.get(workoutId);
      if (!workout) {
        navigate('/');
        return;
      }
      setSession(workout);

      // Load exercise details
      const exerciseIds = [...new Set(workout.sets.map(s => s.exerciseId))];
      const exerciseMap = new Map<number, Exercise>();
      for (const id of exerciseIds) {
        const exercise = await db.exercises.get(id);
        if (exercise) {
          exerciseMap.set(id, exercise);
        }
      }
      setExercises(exerciseMap);

      // Load stretches
      const stretchList = await getStretchesForWorkout(workout.muscleChains);
      setStretches(stretchList);
    };

    loadWorkout();
  }, [workoutId, navigate]);

  const handleSetUpdate = useCallback(async (reps: number | null, weight: number | null) => {
    if (!session) return;

    const updatedSets = [...session.sets];
    updatedSets[currentSetIndex] = {
      ...updatedSets[currentSetIndex],
      actualReps: reps,
      weight: weight,
      completedAt: new Date()
    };

    await db.workoutSessions.update(session.id!, { sets: updatedSets });
    setSession({ ...session, sets: updatedSets });
  }, [session, currentSetIndex]);

  const handleNextSet = () => {
    if (!session) return;
    if (currentSetIndex < session.sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else {
      setShowStretches(true);
    }
  };

  const handlePrevSet = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
    }
  };

  const toggleStretch = (stretchId: number) => {
    const newCompleted = new Set(completedStretches);
    if (newCompleted.has(stretchId)) {
      newCompleted.delete(stretchId);
    } else {
      newCompleted.add(stretchId);
    }
    setCompletedStretches(newCompleted);
  };

  const handleFinishStretches = () => {
    setShowEffortRating(true);
  };

  const handleEffortRating = async (rating: EffortRating) => {
    if (!session) return;
    await completeWorkout(session.id!, rating, [...completedStretches]);
    navigate('/');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentSet = session.sets[currentSetIndex];
  const currentExercise = exercises.get(currentSet.exerciseId);
  const setInfo = SET_REP_RANGES.find(s => s.range === currentSet.targetRepRange);

  if (showEffortRating) {
    return <EffortRatingModal onRate={handleEffortRating} />;
  }

  if (showStretches) {
    return (
      <div className="min-h-screen p-4 pb-24 bg-background">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-text">Cool Down Stretches</h1>
          <p className="text-text-muted text-sm">10 minutes • Tap to mark complete</p>
        </header>

        <div className="space-y-3">
          {stretches.map(stretch => (
            <button
              key={stretch.id}
              onClick={() => toggleStretch(stretch.id!)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                completedStretches.has(stretch.id!)
                  ? 'bg-success/20 border border-success'
                  : 'bg-surface'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-text">{stretch.name}</p>
                  <p className="text-sm text-text-muted">
                    {stretch.position} • {stretch.muscleGroups.join(', ')}
                  </p>
                </div>
                {completedStretches.has(stretch.id!) && (
                  <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleFinishStretches}
          className="fixed bottom-4 left-4 right-4 bg-primary hover:bg-primary-light text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Complete Workout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Progress Bar */}
      <div className="h-1 bg-surface">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentSetIndex + 1) / session.sets.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="p-4 border-b border-surface">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-text-muted"
          >
            ✕
          </button>
          <p className="text-text-muted text-sm">
            Set {currentSetIndex + 1} of {session.sets.length}
          </p>
          <div className="w-6" />
        </div>
      </header>

      {/* Exercise Info */}
      <div className="p-4">
        <div className="bg-surface rounded-xl p-6 mb-4">
          <p className="text-primary text-sm font-medium mb-1">{setInfo?.label}</p>
          <h2 className="text-2xl font-bold text-text mb-2">
            {currentExercise?.name || currentSet.exerciseName}
          </h2>
          <p className="text-text-muted">
            Target: <span className="text-primary font-semibold">{currentSet.targetRepRange} reps</span>
          </p>
        </div>

        {/* Input Card */}
        <SetInputCard
          currentReps={currentSet.actualReps}
          currentWeight={currentSet.weight}
          requiresWeight={currentExercise?.requiresWeight || false}
          onUpdate={handleSetUpdate}
        />

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handlePrevSet}
            disabled={currentSetIndex === 0}
            className="flex-1 bg-surface disabled:opacity-50 text-text font-semibold py-4 rounded-lg"
          >
            Previous
          </button>
          <button
            onClick={handleNextSet}
            className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-4 rounded-lg transition-colors"
          >
            {currentSetIndex === session.sets.length - 1 ? 'Stretches' : 'Next Set'}
          </button>
        </div>
      </div>

      {/* Rest Timer */}
      <RestTimer />
    </div>
  );
}

function SetInputCard({
  currentReps,
  currentWeight,
  requiresWeight,
  onUpdate
}: {
  currentReps: number | null;
  currentWeight: number | null;
  requiresWeight: boolean;
  onUpdate: (reps: number | null, weight: number | null) => void;
}) {
  const [reps, setReps] = useState(currentReps?.toString() || '');
  const [weight, setWeight] = useState(currentWeight?.toString() || '');

  useEffect(() => {
    setReps(currentReps?.toString() || '');
    setWeight(currentWeight?.toString() || '');
  }, [currentReps, currentWeight]);

  const handleRepsChange = (value: string) => {
    setReps(value);
    const numReps = value ? parseInt(value) : null;
    onUpdate(numReps, weight ? parseFloat(weight) : null);
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    const numWeight = value ? parseFloat(value) : null;
    onUpdate(reps ? parseInt(reps) : null, numWeight);
  };

  return (
    <div className="bg-surface rounded-xl p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-text-muted text-sm mb-2">Reps Completed</label>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => handleRepsChange(e.target.value)}
            placeholder="0"
            className="w-full bg-surface-light text-text text-3xl font-bold text-center py-4 rounded-lg border-2 border-transparent focus:border-primary outline-none"
          />
        </div>

        {requiresWeight && (
          <div>
            <label className="block text-text-muted text-sm mb-2">Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder="0"
              className="w-full bg-surface-light text-text text-3xl font-bold text-center py-4 rounded-lg border-2 border-transparent focus:border-primary outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
