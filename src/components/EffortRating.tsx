import type { EffortRating } from '../db/types';

interface Props {
  onRate: (rating: EffortRating) => void;
}

export default function EffortRatingModal({ onRate }: Props) {
  const options: { rating: EffortRating; label: string; emoji: string; color: string }[] = [
    { rating: 1, label: 'Too Easy', emoji: '😎', color: 'bg-success' },
    { rating: 2, label: 'Tough', emoji: '💪', color: 'bg-warning' },
    { rating: 3, label: 'Too Hard', emoji: '😵', color: 'bg-danger' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-text text-center mb-2">
          How did that feel?
        </h2>
        <p className="text-text-muted text-center text-sm mb-6">
          Rate your workout intensity
        </p>

        <div className="space-y-3">
          {options.map(({ rating, label, emoji, color }) => (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              className={`w-full ${color} text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-between transition-transform active:scale-95`}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-lg">{label}</span>
              <span className="text-2xl opacity-50">{rating}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
