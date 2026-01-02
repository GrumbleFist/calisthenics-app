import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db/database';
import type { WorkoutSession, WorkoutType } from '../db/types';

const WORKOUT_LABELS: Record<WorkoutType, string> = {
  Upper1: 'Upper #1',
  Lower1: 'Lower #1',
  Upper2: 'Upper #2',
  Lower2: 'Lower #2'
};

const EFFORT_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Too Easy', color: 'text-success' },
  2: { label: 'Tough', color: 'text-warning' },
  3: { label: 'Too Hard', color: 'text-danger' }
};

export default function History() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    db.workoutSessions
      .orderBy('date')
      .reverse()
      .toArray()
      .then(setSessions);
  }, []);

  const exportToCSV = () => {
    const headers = ['Date', 'Workout Type', 'Effort Rating', 'Exercise', 'Set', 'Reps', 'Weight'];
    const rows: string[][] = [];

    for (const session of sessions) {
      for (const set of session.sets) {
        rows.push([
          new Date(session.date).toLocaleDateString(),
          WORKOUT_LABELS[session.type],
          session.effortRating ? EFFORT_LABELS[session.effortRating].label : '',
          set.exerciseName,
          set.setNumber.toString(),
          set.actualReps?.toString() || '',
          set.weight?.toString() || ''
        ]);
      }
    }

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-4 pb-24 bg-background">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-text">Workout History</h1>
        <button
          onClick={exportToCSV}
          className="bg-surface px-4 py-2 rounded-lg text-text-muted text-sm"
        >
          Export CSV
        </button>
      </header>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">No workouts yet</p>
          <Link to="/" className="text-primary mt-2 block">
            Start your first workout
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-surface rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-text">
                    {WORKOUT_LABELS[session.type]}
                  </p>
                  <p className="text-sm text-text-muted">
                    {formatDate(session.date)}
                  </p>
                </div>
                {session.effortRating && (
                  <span className={`text-sm font-medium ${EFFORT_LABELS[session.effortRating].color}`}>
                    {EFFORT_LABELS[session.effortRating].label}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {/* Group sets by exercise */}
                {Array.from(new Set(session.sets.map(s => s.exerciseName))).map(exerciseName => {
                  const exerciseSets = session.sets.filter(s => s.exerciseName === exerciseName);
                  return (
                    <div key={exerciseName} className="bg-surface-light rounded-lg p-3">
                      <p className="text-sm font-medium text-text mb-1">{exerciseName}</p>
                      <div className="flex gap-2 flex-wrap">
                        {exerciseSets.map((set, idx) => (
                          <span key={idx} className="text-xs text-text-muted bg-background px-2 py-1 rounded">
                            {set.actualReps || '-'} reps
                            {set.weight ? ` @ ${set.weight}kg` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
          <Link to="/history" className="flex flex-col items-center text-primary">
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
