# Dog Training Tracker

A progressive web app for tracking dog training progress with duration-based and task-set workouts.

## Project Structure

```
trainpup/
├── src/
│   ├── components/          # React components
│   │   ├── App.jsx         # Main app with routing
│   │   ├── MainPage.jsx    # Workout list page
│   │   ├── ChooseWorkoutTypePage.jsx
│   │   ├── NewWorkoutPage.jsx
│   │   ├── NewTaskSetWorkoutPage.jsx
│   │   ├── WorkoutPage.jsx
│   │   └── TrainingPage.jsx
│   ├── utils/              # Utility functions
│   │   ├── storage.js      # localStorage operations
│   │   ├── calculations.js # Duration & progression logic
│   │   └── taskSets.js     # Task set loading
│   └── main.jsx            # App entry point
├── public/                 # Static assets
│   ├── task_sets/         # Training protocol JSON files
│   ├── manifest.json
│   └── sw.js
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
└── package.json

```

## Development

### Prerequisites
- Node.js 18+ (or 20+ for latest Vite)

### Setup
```bash
npm install
```

### Run locally
```bash
npm run dev
```
Visit http://localhost:5173

### Build for production
```bash
npm run build
```
Output will be in `dist/` folder

### Preview production build
```bash
npm run preview
```

## Deployment

The project uses GitHub Actions for automatic deployment to GitHub Pages.

### Setup GitHub Pages
1. Go to repository Settings > Pages
2. Under "Source", select "GitHub Actions"
3. Push to `main` branch to trigger deployment

### Manual deployment
```bash
npm run build
# Then manually copy dist/ contents to your hosting
```

## Features

- Duration-based training with progressive increments
- Task-set protocol training
- Progress tracking with localStorage
- Mobile-friendly PWA
- Automatic level progression based on consecutive successes
- Timer functionality for timed exercises

## Technologies

- React 18
- Vite 5
- Tailwind CSS (CDN)
- GitHub Actions for CI/CD
