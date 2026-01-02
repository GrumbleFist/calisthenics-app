import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db/database';
import type { Stretch, Position } from '../db/types';

const POSITIONS: Position[] = ['Standing', 'Kneeling', 'Lying Back', 'Lying Front', 'Seated'];

export default function StretchManager() {
  const [stretches, setStretches] = useState<Stretch[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position>('Standing');
  const [editingStretch, setEditingStretch] = useState<Stretch | null>(null);

  useEffect(() => {
    loadStretches();
  }, [selectedPosition]);

  const loadStretches = async () => {
    const data = await db.stretches
      .where('position')
      .equals(selectedPosition)
      .toArray();
    data.sort((a, b) => a.name.localeCompare(b.name));
    setStretches(data);
  };

  const toggleActive = async (stretch: Stretch) => {
    await db.stretches.update(stretch.id!, { active: !stretch.active });
    loadStretches();
  };

  const updateStretch = async (stretch: Stretch) => {
    await db.stretches.update(stretch.id!, {
      name: stretch.name,
      position: stretch.position,
      muscleGroups: stretch.muscleGroups,
      active: stretch.active
    });
    setEditingStretch(null);
    loadStretches();
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <header className="p-4 border-b border-surface sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold text-text mb-4">Stretch Manager</h1>

        {/* Position Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {POSITIONS.map(position => (
            <button
              key={position}
              onClick={() => setSelectedPosition(position)}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedPosition === position
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted'
              }`}
            >
              {position}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-2">
        {stretches.map(stretch => (
          <div
            key={stretch.id}
            className={`bg-surface rounded-lg p-4 ${!stretch.active ? 'opacity-50' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-text">{stretch.name}</p>
                <p className="text-sm text-text-muted">
                  {stretch.muscleGroups.join(', ')}
                </p>
              </div>
              <button
                onClick={() => setEditingStretch(stretch)}
                className="text-primary text-sm"
              >
                Edit
              </button>
            </div>

            <button
              onClick={() => toggleActive(stretch)}
              className={`text-xs px-3 py-1 rounded-full ${
                stretch.active
                  ? 'bg-success/20 text-success'
                  : 'bg-surface-light text-text-muted'
              }`}
            >
              {stretch.active ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingStretch && (
        <EditStretchModal
          stretch={editingStretch}
          onSave={updateStretch}
          onClose={() => setEditingStretch(null)}
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
          <Link to="/stretches" className="flex flex-col items-center text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs mt-1">Stretches</span>
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

function EditStretchModal({
  stretch,
  onSave,
  onClose
}: {
  stretch: Stretch;
  onSave: (stretch: Stretch) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(stretch.name);
  const [position, setPosition] = useState<Position>(stretch.position);
  const [muscleGroups, setMuscleGroups] = useState(stretch.muscleGroups.join(', '));

  const handleSave = () => {
    onSave({
      ...stretch,
      name,
      position,
      muscleGroups: muscleGroups.split(',').map(m => m.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-text mb-4">Edit Stretch</h2>

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
            <label className="block text-text-muted text-sm mb-1">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="w-full bg-surface-light text-text px-4 py-3 rounded-lg"
            >
              {POSITIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-muted text-sm mb-1">Muscle Groups (comma separated)</label>
            <input
              type="text"
              value={muscleGroups}
              onChange={(e) => setMuscleGroups(e.target.value)}
              placeholder="Shoulders, Back, Hips"
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
