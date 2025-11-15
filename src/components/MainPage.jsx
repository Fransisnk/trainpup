import { useState } from 'react';
import { storage } from '../utils/storage';

function MainPage({ navigate }) {
  const [workouts, setWorkouts] = useState(storage.getWorkouts());

  const deleteWorkout = (id) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      const updatedWorkouts = workouts.filter(w => w.id !== id);
      storage.saveWorkouts(updatedWorkouts);
      setWorkouts(updatedWorkouts);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🐕 Dog Training Tracker</h1>
        <p className="text-gray-600">Track your training progress</p>
      </div>

      <button
        onClick={() => navigate('choose-workout-type')}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold mb-6 shadow-md hover:bg-blue-700 transition"
      >
        + Create New Workout
      </button>

      <div className="space-y-3">
        {workouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No workouts yet. Create your first one!
          </div>
        ) : (
          workouts.map(workout => (
            <div key={workout.id} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate('training', workout.id)}
              >
                <h3 className="text-lg font-semibold text-gray-800">{workout.name}</h3>
                <p className="text-sm text-gray-600">
                  Level {workout.currentLevel + 1} / {workout.totalLevels}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWorkout(workout.id);
                }}
                className="ml-4 text-red-600 hover:text-red-800 font-semibold px-3 py-1"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MainPage;
