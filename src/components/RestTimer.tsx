import { useState, useEffect, useCallback } from 'react';

export default function RestTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setTimeLeft(90);
      setIsRunning(true);
    }
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((90 - timeLeft) / 90) * 100;

  return (
    <button
      onClick={toggleTimer}
      className="fixed bottom-4 right-4 w-20 h-20 rounded-full bg-surface shadow-lg flex items-center justify-center"
    >
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-surface-light"
        />
        {isRunning && (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
            className="text-primary transition-all duration-1000"
          />
        )}
      </svg>
      <div className="relative text-center">
        {isRunning ? (
          <span className="text-lg font-bold text-primary">{formatTime(timeLeft)}</span>
        ) : (
          <div>
            <svg className="w-6 h-6 text-text-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-text-muted">90s</span>
          </div>
        )}
      </div>
    </button>
  );
}
