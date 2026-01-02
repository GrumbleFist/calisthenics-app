import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db/database';
import type { AppSettings, WorkoutType } from '../db/types';
import { resetDatabase } from '../db/initDatabase';

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
  { value: 'Upper1', label: 'Upper #1' },
  { value: 'Lower1', label: 'Lower #1' },
  { value: 'Upper2', label: 'Upper #2' },
  { value: 'Lower2', label: 'Lower #2' }
];

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    db.appSettings.toCollection().first().then(s => setSettings(s || null));
  }, []);

  const updateWorkoutType = async (type: WorkoutType) => {
    if (!settings) return;
    await db.appSettings.update(settings.id!, { currentWorkoutType: type });
    setSettings({ ...settings, currentWorkoutType: type });
  };

  const handleReset = async () => {
    setIsResetting(true);
    await resetDatabase();
    setIsResetting(false);
    setShowResetConfirm(false);
    const newSettings = await db.appSettings.toCollection().first();
    setSettings(newSettings || null);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <header className="p-4 border-b border-surface">
        <h1 className="text-xl font-bold text-text">Settings</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Next Workout Type */}
        <div className="bg-surface rounded-xl p-4">
          <h3 className="font-semibold text-text mb-3">Next Workout</h3>
          <p className="text-sm text-text-muted mb-3">
            Manually set which workout comes next
          </p>
          <div className="grid grid-cols-2 gap-2">
            {WORKOUT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateWorkoutType(value)}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  settings?.currentWorkoutType === value
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-text-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="bg-surface rounded-xl overflow-hidden">
          <Link
            to="/exercises"
            className="flex justify-between items-center p-4 border-b border-surface-light"
          >
            <span className="text-text">Manage Exercises</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            to="/stretches"
            className="flex justify-between items-center p-4"
          >
            <span className="text-text">Manage Stretches</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Danger Zone */}
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4">
          <h3 className="font-semibold text-danger mb-2">Danger Zone</h3>
          <p className="text-sm text-text-muted mb-4">
            Reset all data to defaults. This will delete all workout history and progress.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-danger text-white font-semibold py-2 px-4 rounded-lg"
          >
            Reset All Data
          </button>
        </div>

        {/* App Info */}
        <div className="text-center text-text-muted text-sm">
          <p>Calisthenics Workout Tracker</p>
          <p>Version 1.0.0</p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-text mb-2">Reset All Data?</h2>
            <p className="text-text-muted mb-6">
              This will delete all your workout history, progress, and custom settings.
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="flex-1 bg-surface-light text-text font-semibold py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 bg-danger text-white font-semibold py-3 rounded-lg"
              >
                {isResetting ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
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
          <Link to="/exercises" className="flex flex-col items-center text-text-muted">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs mt-1">Exercises</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center text-primary">
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
