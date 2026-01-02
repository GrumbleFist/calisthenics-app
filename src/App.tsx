import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initializeDatabase } from './db/initDatabase';
import Home from './pages/Home';
import ActiveWorkout from './pages/ActiveWorkout';
import History from './pages/History';
import ExerciseManager from './pages/ExerciseManager';
import StretchManager from './pages/StretchManager';
import Settings from './pages/Settings';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then(() => setIsLoading(false))
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-danger/20 border border-danger rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-danger mb-2">Error</h2>
          <p className="text-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workout" element={<ActiveWorkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/exercises" element={<ExerciseManager />} />
          <Route path="/stretches" element={<StretchManager />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
