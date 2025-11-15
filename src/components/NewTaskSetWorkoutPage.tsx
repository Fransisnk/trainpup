import { useState } from 'react';
import { storage } from '../utils/storage';
import { loadTaskSetFromJSON } from '../utils/taskSets';
import type { NavigateFunction, TaskSetData, TaskSetWorkout } from '../types';

interface NewTaskSetWorkoutPageProps {
  navigate: NavigateFunction;
}

function NewTaskSetWorkoutPage({ navigate }: NewTaskSetWorkoutPageProps) {
  const [selectedTaskSet, setSelectedTaskSet] = useState<string | null>(null);
  const [taskSetData, setTaskSetData] = useState<TaskSetData | null>(null);
  const [availableTaskSets] = useState(['relaxation']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTaskSet = async (filename: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadTaskSetFromJSON(filename);
      if (data) {
        setTaskSetData(data);
        setSelectedTaskSet(filename);
      } else {
        setError('Failed to load task set. Make sure the file exists.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Error loading task set: ' + errorMessage);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWorkout = () => {
    if (!taskSetData) {
      alert('Please select a task set');
      return;
    }

    const newWorkout: TaskSetWorkout = {
      id: Date.now().toString(),
      name: taskSetData.protocol,
      type: 'taskset' as const,
      taskSetName: selectedTaskSet!,
      taskSets: taskSetData.task_sets,
      totalLevels: taskSetData.task_sets.length,
      currentLevel: 0,
      currentTaskIndex: 0,
      attempts: [],
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
            onClick={() => navigate('choose-workout-type')}
            className="text-blue-600 font-semibold mr-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create Task Set Workout</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Task Set
            </label>
            <div className="space-y-2">
              {availableTaskSets.map(taskSetName => (
                <button
                  key={taskSetName}
                  onClick={() => loadTaskSet(taskSetName)}
                  disabled={loading}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedTaskSet === taskSetName
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 hover:border-green-400 bg-white'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <h3 className="font-semibold text-gray-800 capitalize">
                    {taskSetName} {loading && selectedTaskSet === taskSetName ? '(Loading...)' : ''}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {taskSetData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Protocol Details</h3>
              <p className="text-sm text-gray-700 mb-2">{taskSetData.protocol}</p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{taskSetData.task_sets.length}</span> sets with{' '}
                <span className="font-semibold">
                  {taskSetData.task_sets.reduce((sum, set) => sum + set.tasks.length, 0)}
                </span>{' '}
                total tasks
              </p>
            </div>
          )}

          <button
            onClick={createWorkout}
            disabled={!taskSetData || loading}
            className={`w-full py-3 rounded-lg font-semibold shadow-md transition mt-6 ${
              taskSetData && !loading
                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Workout
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewTaskSetWorkoutPage;
