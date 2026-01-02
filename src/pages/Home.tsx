import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import type { AppSettings, WorkoutType } from '../db/types';
import { generateWorkout, getMuscleChains } from '../utils/workoutLogic';

const WORKOUT_LABELS: Record<WorkoutType, string> = {
  Upper1: 'Upper #1',
  Lower1: 'Lower #1',
  Upper2: 'Upper #2',
  Lower2: 'Lower #2'
};

export default function Home() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    db.appSettings.toCollection().first().then(s => setSettings(s || null));
  }, []);

  const handleStartWorkout = async () => {
    if (!settings) return;
    setIsGenerating(true);
    try {
      const workout = await generateWorkout(settings.currentWorkoutType);
      navigate('/workout', { state: { workoutId: workout.id } });
    } catch (err) {
      console.error('Failed to generate workout:', err);
      setIsGenerating(false);
    }
  };

  const nextWorkoutType = settings?.currentWorkoutType || 'Upper1';
  const muscleChains = getMuscleChains(nextWorkoutType);

  return (
    <div className="min-h-screen p-4 pb-24">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-2xl font-bold text-text mb-2">Calisthenics</h1>
        <p className="text-text-muted text-sm">Workout Tracker</p>
      </header>

      {/* Next Workout Card */}
      <div className="bg-surface rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">Next Workout</h2>
        <div className="bg-primary/20 rounded-lg p-4 mb-4">
          <p className="text-2xl font-bold text-primary">
            {WORKOUT_LABELS[nextWorkoutType]}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {muscleChains.join(' • ')}
          </p>
        </div>

        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
          <p className="text-warning text-sm">
            Don't Forget to Warm Up with 75% Effort
          </p>
        </div>

        <button
          onClick={handleStartWorkout}
          disabled={isGenerating}
          className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Start Workout'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/history" className="bg-surface rounded-xl p-4">
          <p className="text-text-muted text-sm">History</p>
          <p className="text-xl font-semibold text-text">View All</p>
        </Link>
        <Link to="/exercises" className="bg-surface rounded-xl p-4">
          <p className="text-text-muted text-sm">Exercises</p>
          <p className="text-xl font-semibold text-text">Manage</p>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light">
        <div className="flex justify-around py-3">
          <Link to="/" className="flex flex-col items-center text-primary">
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
          <Link to="/exercises" className="flex flex-col items-center text-text-muted">
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
