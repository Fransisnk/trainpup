import { useState } from 'react';
import { storage } from '../utils/storage';
import type { NavigateFunction, Workout, TaskSetWorkout, DurationWorkout } from '../types';

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

  const isTaskSetWorkout = workout.type === 'taskset';
  const currentDuration = !isTaskSetWorkout && 'durationSteps' in workout
    ? (workout.durationSteps[workout.currentLevel] || workout.durationSteps[workout.durationSteps.length - 1])
    : 0;

  // Task-set workout details page
  if (isTaskSetWorkout) {
    const taskSetWorkout = workout as TaskSetWorkout;
    const currentSet = taskSetWorkout.taskSets[taskSetWorkout.currentLevel];
    const totalTasksInSet = currentSet ? currentSet.tasks.length : 0;
    const completedTasksInSet = taskSetWorkout.currentTaskIndex;

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('training', workoutId)}
              className="text-blue-600 font-semibold mr-4"
            >
              ← Back to Training
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{taskSetWorkout.name}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Current Set</p>
              <p className="text-2xl font-bold text-green-600">{taskSetWorkout.currentLevel + 1}/{taskSetWorkout.totalLevels}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tasks in Set</p>
              <p className="text-2xl font-bold text-blue-600">{completedTasksInSet}/{totalTasksInSet}</p>
            </div>
          </div>
        </div>

        {taskSetWorkout.attempts && taskSetWorkout.attempts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Past Attempts</h2>
            <div className="space-y-2">
              {taskSetWorkout.attempts.slice().reverse().map((attempt, index) => (
                <div key={index} className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">
                        {new Date(attempt.completedAt).toLocaleDateString()} {new Date(attempt.completedAt).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Set {attempt.level + 1}, Task {(attempt.taskIndex || 0) + 1}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {attempt.task}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${
                      attempt.result === 'success' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {attempt.result === 'success' ? '✓' : '~'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tasks</h2>
          {currentSet && (
            <div className="space-y-2">
              {currentSet.tasks.slice(taskSetWorkout.currentTaskIndex, taskSetWorkout.currentTaskIndex + 5).map((task, index) => (
                <div key={index} className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {task.task}
                    </span>
                    {task.duration && (
                      <span className="text-xs font-semibold text-green-600">
                        {task.duration}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Duration-based workout details page
  const durationWorkout = workout as DurationWorkout;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('training', workoutId)}
            className="text-blue-600 font-semibold mr-4"
          >
            ← Back to Training
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{durationWorkout.name}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Current Level</p>
            <p className="text-2xl font-bold text-blue-600">{durationWorkout.currentLevel + 1}/{durationWorkout.totalLevels}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Level Duration</p>
            <p className="text-2xl font-bold text-green-600">{currentDuration}s</p>
          </div>
        </div>
      </div>

      {durationWorkout.attempts && durationWorkout.attempts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Past Attempts</h2>
          <div className="space-y-2">
            {durationWorkout.attempts.slice().reverse().map((attempt, index) => (
              <div key={index} className="border-b border-gray-200 pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">
                      {new Date(attempt.completedAt).toLocaleDateString()} {new Date(attempt.completedAt).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Level {attempt.level + 1} - Target: {attempt.duration}s
                      {attempt.actualDuration && ` | Actual: ${attempt.actualDuration}s`}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    attempt.result === 'success' ? 'text-green-600' :
                    attempt.result === 'failure' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {attempt.result === 'success' ? '✓' : attempt.result === 'failure' ? '~' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Levels</h2>
        <div className="space-y-2">
          {durationWorkout.durationSteps.slice(durationWorkout.currentLevel, durationWorkout.currentLevel + 5).map((duration, index) => (
            <div key={index} className="border-b border-gray-200 pb-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Level {durationWorkout.currentLevel + index + 1}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {duration}s
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkoutPage;
