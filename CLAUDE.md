# Calisthenics Workout Tracker - Project Context

## Overview
Offline-first PWA for tracking calisthenics workouts using a 4-day Upper/Lower split with drop sets.

## Tech Stack
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS v4 (dark mode default)
- **Database**: Dexie.js (IndexedDB wrapper) for offline storage
- **PWA**: vite-plugin-pwa with Workbox
- **Hosting**: GitHub Pages (https://grumblefist.github.io/calisthenics-app/)

## Workout Philosophy (Science-Based)

### 4-Day Upper/Lower Split
- Day 1: Upper #1 (Triceps & Pectorals, Abdominals & Obliques, Biceps & Scapula)
- Day 2: Lower #1 (Quads, Hamstrings & Calves, Glutes & Lumbar)
- Day 3: Upper #2 (same muscle chains, DIFFERENT exercise classes)
- Day 4: Lower #2 (same muscle chains, DIFFERENT exercise classes)

### Drop Set Protocol (per exercise)
| Set | Rep Range | Purpose |
|-----|-----------|---------|
| 1 | 5-7 | Strength |
| 2 | 10-13 | Growth (Hypertrophy) |
| 3 | 15-20 | Pump (Metabolic) |
| 4 | 20-25 | Finisher |

### Calisthenics vs Weighted Drop Sets
- **Calisthenics**: Reduce difficulty each set (e.g., Archer Push Up → Arrow → Full → Kneeling)
- **Weighted**: Same exercise, reduce weight each set

### Variety Rule
Exercise classes cannot repeat between paired sessions (Upper #1 vs Upper #2).

## Data Sources
- Exercises imported from: `C:\Users\MarkLaptop\Calithenics App\Calisthenics Workout Spreedsheet.xlsx`
- Stretches imported from: `C:\Users\MarkLaptop\Calithenics App\Stretches_by_Position_and_Muscle.xlsx`
- Data converted to JSON at: `src/data/exercises.json` and `src/data/stretches.json`

## Key Features
1. **Workout Generation**: Auto-generates workouts with variety constraints
2. **Drop Sets**: 4 consecutive difficulty levels for calisthenics
3. **Rest Timer**: 90-second countdown button (bottom right during workout)
4. **Warm-up Reminder**: "Don't Forget to Warm Up with 75% Effort"
5. **Effort Rating**: Post-workout 1-3 scale (Too Easy / Tough / Too Hard)
6. **Stretches**: Matched to muscles worked, 1 per position (Standing/Kneeling/Lying Back/Lying Front/Seated)
7. **Exercise Manager**: Toggle active/inactive, weighted/bodyweight, edit difficulty
8. **Stretch Manager**: Edit stretches, toggle active
9. **History**: View past workouts, export to CSV

## Exercise Data Model
```typescript
Exercise:
  - muscleChain: Quads | Triceps & Pectorals | Abdominals & Obliques | etc.
  - exerciseClass: e.g., Squat, Lunge, Push Up, Dips
  - difficulty: Novice | Beginner | Intermediate | Advanced | Expert | Master
  - name: string
  - targetReps: number | null
  - targetWeight: number | null
  - requiresWeight: boolean (shows weight input if true)
  - active: boolean (excluded from workouts if false)
```

## File Structure
```
src/
├── db/
│   ├── database.ts    # Dexie IndexedDB setup
│   ├── initDatabase.ts # Seed data on first launch
│   └── types.ts       # TypeScript types
├── pages/
│   ├── Home.tsx           # Start workout
│   ├── ActiveWorkout.tsx  # Workout flow with sets
│   ├── History.tsx        # Past workouts + CSV export
│   ├── ExerciseManager.tsx
│   ├── StretchManager.tsx
│   └── Settings.tsx
├── components/
│   ├── RestTimer.tsx      # 90-second countdown
│   └── EffortRating.tsx   # Post-workout modal
├── utils/
│   └── workoutLogic.ts    # Workout generation, stretch selection
└── data/
    ├── exercises.json     # 99 exercises
    └── stretches.json     # 128 stretches
```

## GitHub Pages Deployment
- Workflow: `.github/workflows/deploy.yml`
- Base path configured in `vite.config.ts`: `/calisthenics-app/`
- Router basename in `App.tsx`: `/calisthenics-app`

## User's Additional Exercises (Added at Intermediate difficulty)
- High-Bar Back Squat, Goblet Squat (Quads)
- Low Incline DB Press, DB Fly, Seated DB Shoulder Press, Decline Barbell Press (Triceps & Pectorals)
- Seated Calf Raise (Hamstrings & Calves)
- DB Lateral Raise, Neutral-Grip Pullup, Helms Row, Single-Arm DB Row, Machine Pulldown, Hammer Curl, Bent-Over Reverse DB Fly (Biceps & Scapula)

## Future Considerations
- Progression system: Track when user hits targets, suggest advancement
- The user prefers science-based fitness over social media/influencer advice
