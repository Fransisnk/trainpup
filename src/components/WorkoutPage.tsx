import { useState } from 'react';
import { storage } from '../utils/storage';
import type { NavigateFunction, Workout } from '../types';
import WorkoutHeader from './sub_components/WorkoutHeader';
import WorkoutPastAttempts from './sub_components/WorkoutPastAttempts';
import WorkoutUpcomingTasks from './sub_components/WorkoutUpcomingTasks';

interface WorkoutPageProps {
  navigate: NavigateFunction;
  workoutId: string | null;
}

function WorkoutPage({ navigate, workoutId }: WorkoutPageProps) {
  const [workout] = useState<Workout | undefined>(workoutId ? storage.getWorkout(workoutId) : undefined);

  if (!workout) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-600">Workout not found</p>
          <button
            onClick={() => navigate('main')}
            className="mt-4 text-blue-600 font-semibold"
          >
            ← Back to Main
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <WorkoutHeader workout={workout} navigate={navigate} />
      <WorkoutPastAttempts workout={workout} />
      <WorkoutUpcomingTasks workout={workout} />
    </div>
  );
}

export default WorkoutPage;
