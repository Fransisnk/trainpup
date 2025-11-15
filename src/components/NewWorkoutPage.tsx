import { useState } from 'react';
import { storage } from '../utils/storage';
import { calculateDurationSteps, getRequiredSuccesses } from '../utils/calculations';
import type { NavigateFunction, DurationWorkout } from '../types';

interface NewWorkoutPageProps {
  navigate: NavigateFunction;
}

function NewWorkoutPage({ navigate }: NewWorkoutPageProps) {
  const [name, setName] = useState('');
  const [startDuration, setStartDuration] = useState(5);
  const [endDuration, setEndDuration] = useState(60);

  // Calculate number of levels based on the progressive increment algorithm
  const durationSteps = calculateDurationSteps(startDuration, endDuration);
  const numLevels = durationSteps.length;

  const createWorkout = () => {
    if (!name.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (startDuration >= endDuration) {
      alert('Start duration must be less than end duration');
      return;
    }

    const newWorkout: DurationWorkout = {
      id: Date.now().toString(),
      name: name.trim(),
      totalLevels: numLevels,
      durationSteps,
      attempts: [],
      currentLevel: 0,
      requiredSuccesses: getRequiredSuccesses(startDuration),
      createdAt: new Date().toISOString()
    };

    const workouts = storage.getWorkouts();
    workouts.push(newWorkout);
    storage.saveWorkouts(workouts);

    navigate('main');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('main')}
            className="text-blue-600 font-semibold mr-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create New Workout</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Workout Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Stay Command Training"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Duration (seconds)
            </label>
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => setStartDuration(Math.max(1, startDuration - 1))}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="60"
                value={startDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setStartDuration(Math.min(60, Math.max(1, val)));
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setStartDuration(Math.min(60, startDuration + 1))}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                +
              </button>
              <span className="text-gray-600 text-sm">seconds</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={startDuration}
              onChange={(e) => setStartDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Duration
            </label>
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => {
                  const decrement = endDuration <= 60 ? 1 : endDuration <= 300 ? 5 : endDuration <= 1200 ? 30 : 60;
                  setEndDuration(Math.max(10, endDuration - decrement));
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                -
              </button>
              <input
                type="number"
                min="10"
                max="7200"
                value={endDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 10;
                  setEndDuration(Math.min(7200, Math.max(10, val)));
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  const increment = endDuration < 60 ? 1 : endDuration < 300 ? 5 : endDuration < 1200 ? 30 : 60;
                  setEndDuration(Math.min(7200, endDuration + increment));
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                +
              </button>
              <span className="text-gray-600 text-sm">
                {endDuration >= 60 ? `(${Math.floor(endDuration / 60)}m ${endDuration % 60}s)` : 'seconds'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              value={(() => {
                // Non-linear scaling: convert endDuration to slider position
                if (endDuration <= 60) return endDuration * 4; // 0-240: maps 10-60s (gives more precision)
                if (endDuration <= 300) return 240 + (endDuration - 60) * 1.5; // 240-600: maps 60-300s
                if (endDuration <= 1200) return 600 + (endDuration - 300) / 3; // 600-900: maps 300-1200s
                return 900 + (endDuration - 1200) / 60; // 900-1000: maps 1200-7200s
              })()}
              onChange={(e) => {
                const sliderVal = parseInt(e.target.value);
                let duration;
                if (sliderVal <= 240) duration = Math.round(sliderVal / 4);
                else if (sliderVal <= 600) duration = Math.round(60 + (sliderVal - 240) / 1.5);
                else if (sliderVal <= 900) duration = Math.round(300 + (sliderVal - 600) * 3);
                else duration = Math.round(1200 + (sliderVal - 900) * 60);
                setEndDuration(Math.min(7200, Math.max(10, duration)));
              }}
              className="w-full"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              Duration will increase from <span className="font-semibold">{startDuration}s</span> to{' '}
              <span className="font-semibold">{endDuration >= 60 ? `${Math.floor(endDuration / 60)}m ${endDuration % 60}s` : `${endDuration}s`}</span>
            </p>
            <p className="text-sm text-gray-700">
              This will create <span className="font-semibold">{numLevels}</span> levels with dog-friendly progressive increments
            </p>
          </div>

          <button
            onClick={createWorkout}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition mt-6"
          >
            Create Workout
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewWorkoutPage;
