import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { getRequiredSuccesses, normalRandom } from '../utils/calculations';

function TrainingPage({ navigate, workoutId }) {
  const [workout, setWorkout] = useState(storage.getWorkout(workoutId));
  const [timerState, setTimerState] = useState('ready');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [actualDuration, setActualDuration] = useState(null);

  // Check if this is a task-set workout
  const isTaskSetWorkout = workout && workout.type === 'taskset';

  // Calculate consecutive successes from stored attempts
  const calculateConsecutiveSuccesses = (workout) => {
    if (!workout || !workout.attempts || workout.attempts.length === 0) {
      return 0;
    }

    // Get attempts for the current level
    const currentLevelAttempts = workout.attempts.filter(a => a.level === workout.currentLevel);

    if (currentLevelAttempts.length === 0) {
      return 0;
    }

    // Count consecutive successes from the end
    let count = 0;
    for (let i = currentLevelAttempts.length - 1; i >= 0; i--) {
      if (currentLevelAttempts[i].result === 'success') {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const [consecutiveSuccesses, setConsecutiveSuccesses] = useState(() =>
    calculateConsecutiveSuccesses(storage.getWorkout(workoutId))
  );

  useEffect(() => {
    if (workout && workout.type !== 'taskset') {
      const currentDuration = workout.durationSteps[workout.currentLevel] || workout.durationSteps[workout.durationSteps.length - 1];
      setTimeRemaining(currentDuration);
      // Update consecutive successes when workout changes
      setConsecutiveSuccesses(calculateConsecutiveSuccesses(workout));
    }
  }, [workout]);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const startTimer = () => {
    setTimerState('running');
    const currentDuration = workout.durationSteps[workout.currentLevel] || workout.durationSteps[workout.durationSteps.length - 1];

    // Generate actual duration from normal distribution (mean = duration, sigma = 10% of duration)
    const sigma = currentDuration * 0.1;
    const randomDuration = Math.round(normalRandom(currentDuration, sigma));
    setActualDuration(randomDuration);
    setTimeRemaining(randomDuration);

    const id = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setTimerState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  };

  const recordTaskCompletion = (result) => {
    const updatedWorkout = { ...workout };
    const currentSet = updatedWorkout.taskSets[updatedWorkout.currentLevel];
    const currentTask = currentSet.tasks[updatedWorkout.currentTaskIndex];

    const attempt = {
      level: updatedWorkout.currentLevel,
      taskIndex: updatedWorkout.currentTaskIndex,
      task: currentTask.task,
      result,
      completedAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    if (!updatedWorkout.attempts) {
      updatedWorkout.attempts = [];
    }
    updatedWorkout.attempts.push(attempt);

    // For task sets: only success moves forward, failure stays on same task
    if (result === 'success') {
      // Move to next task
      updatedWorkout.currentTaskIndex += 1;

      // Check if we completed all tasks in current set
      if (updatedWorkout.currentTaskIndex >= currentSet.tasks.length) {
        // Move to next set (level)
        updatedWorkout.currentLevel = Math.min(
          updatedWorkout.currentLevel + 1,
          updatedWorkout.taskSets.length - 1
        );
        updatedWorkout.currentTaskIndex = 0;
      }
    }
    // For failure, we stay on the same task (no reset, just try again)

    storage.updateWorkout(workoutId, updatedWorkout);
    setWorkout(updatedWorkout);
  };

  const recordResult = (result) => {
    // Stop the timer if it's running
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    const currentDuration = workout.durationSteps[workout.currentLevel] || workout.durationSteps[workout.durationSteps.length - 1];

    // Use the actual duration that was set when timer started
    const durationToRecord = actualDuration || currentDuration;

    const attempt = {
      targetDuration: currentDuration,
      actualDuration: durationToRecord,
      duration: currentDuration, // Keep for backward compatibility
      level: workout.currentLevel,
      result,
      completedAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    const updatedWorkout = { ...workout };
    if (!updatedWorkout.attempts) {
      updatedWorkout.attempts = [];
    }
    updatedWorkout.attempts.push(attempt);

    let newConsecutiveSuccesses = consecutiveSuccesses;

    // Update level based on result
    if (result === 'success') {
      newConsecutiveSuccesses += 1;
      setConsecutiveSuccesses(newConsecutiveSuccesses);

      if (newConsecutiveSuccesses >= updatedWorkout.requiredSuccesses) {
        // Level up!
        updatedWorkout.currentLevel = Math.min(
          updatedWorkout.currentLevel + 1,
          updatedWorkout.durationSteps.length - 1
        );
        // Calculate required successes for the new level
        const newLevelDuration = updatedWorkout.durationSteps[updatedWorkout.currentLevel];
        updatedWorkout.requiredSuccesses = getRequiredSuccesses(newLevelDuration);
        setConsecutiveSuccesses(0);
        newConsecutiveSuccesses = 0;
      }
    } else if (result === 'critical') {
      // Level down on critical failure
      updatedWorkout.currentLevel = Math.max(
        updatedWorkout.currentLevel - 1,
        0
      );
      // Recalculate required successes for the new level
      const newLevelDuration = updatedWorkout.durationSteps[updatedWorkout.currentLevel];
      updatedWorkout.requiredSuccesses = getRequiredSuccesses(newLevelDuration);
      setConsecutiveSuccesses(0);
      newConsecutiveSuccesses = 0;
    } else if (result === 'failure') {
      // Reset consecutive successes on regular failure
      setConsecutiveSuccesses(0);
      newConsecutiveSuccesses = 0;
    }

    storage.updateWorkout(workoutId, updatedWorkout);
    setWorkout(updatedWorkout);
    setTimerState('ready');
    setActualDuration(null); // Reset for next attempt

    const newDuration = updatedWorkout.durationSteps[updatedWorkout.currentLevel] || updatedWorkout.durationSteps[updatedWorkout.durationSteps.length - 1];
    setTimeRemaining(newDuration);
  };

  // Handle missing workout
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

  // Get current task info for task-set workouts
  let currentTask = null;
  let currentSet = null;
  let totalTasksInSet = 0;
  if (isTaskSetWorkout && workout.taskSets && workout.taskSets[workout.currentLevel]) {
    currentSet = workout.taskSets[workout.currentLevel];
    totalTasksInSet = currentSet.tasks.length;
    currentTask = currentSet.tasks[workout.currentTaskIndex] || null;
  }

  const currentDuration = !isTaskSetWorkout
    ? (workout.durationSteps[workout.currentLevel] || workout.durationSteps[workout.durationSteps.length - 1])
    : 0;

  // Render task-set workout UI
  if (isTaskSetWorkout) {
    const hasTimer = currentTask && currentTask.duration;

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('main')}
                className="text-blue-600 font-semibold mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{workout.name}</h1>
            </div>
            <button
              onClick={() => navigate('workout', workoutId)}
              className="text-blue-600 font-semibold text-sm"
            >
              View Details
            </button>
          </div>

          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Set</p>
                <p className="text-4xl font-bold text-green-600">{workout.currentLevel + 1}/{workout.totalLevels}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Task Progress</p>
                <p className="text-4xl font-bold text-blue-600">{workout.currentTaskIndex + 1}/{totalTasksInSet}</p>
              </div>
            </div>
          </div>

          {currentTask && (
            <div className="mb-6">
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Current Task:</h3>
                <p className="text-xl font-semibold text-gray-800 mb-3">{currentTask.task}</p>
                {currentTask.note && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-3">
                    <p className="text-sm text-gray-700"><span className="font-semibold">Note:</span> {currentTask.note}</p>
                  </div>
                )}
              </div>

              {hasTimer && (
                <div className="mb-4">
                  <div className={`text-center py-12 rounded-lg mb-4 ${
                    timerState === 'running' ? 'bg-green-100' :
                    timerState === 'finished' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <p className="text-6xl font-bold text-gray-800">{timeRemaining}s</p>
                    <p className="text-sm text-gray-600 mt-2">Target: {currentTask.duration}s</p>
                  </div>

                  {timerState === 'ready' && (
                    <button
                      onClick={() => {
                        setTimerState('running');
                        setTimeRemaining(currentTask.duration);
                        const id = setInterval(() => {
                          setTimeRemaining(prev => {
                            if (prev <= 1) {
                              clearInterval(id);
                              setTimerState('finished');
                              return 0;
                            }
                            return prev - 1;
                          });
                        }, 1000);
                        setIntervalId(id);
                      }}
                      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
                    >
                      Start Timer
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-center font-semibold text-gray-700 mb-3">
                  {hasTimer && timerState === 'ready' ? 'Or record result without timer:' : 'Did your dog complete this task?'}
                </p>
                <button
                  onClick={() => {
                    if (intervalId) {
                      clearInterval(intervalId);
                      setIntervalId(null);
                    }
                    setTimerState('ready');
                    recordTaskCompletion('success');
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
                >
                  ✓ Success - Next Task
                </button>
                <button
                  onClick={() => {
                    if (intervalId) {
                      clearInterval(intervalId);
                      setIntervalId(null);
                    }
                    setTimerState('ready');
                    recordTaskCompletion('failure');
                  }}
                  className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-yellow-700 transition"
                >
                  ~ Try Again
                </button>
              </div>
            </div>
          )}

          {!currentTask && (
            <div className="bg-green-100 p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h2>
              <p className="text-gray-700">You've completed all tasks in this workout!</p>
            </div>
          )}

          {workout.attempts && workout.attempts.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Attempts</h3>
              <div className="flex flex-wrap gap-2">
                {workout.attempts.slice(-10).reverse().map((attempt, index) => {
                  const attemptDate = new Date(attempt.completedAt);
                  const tooltipText = `${attemptDate.toLocaleDateString()} ${attemptDate.toLocaleTimeString()}\nSet ${attempt.level + 1}, Task ${attempt.taskIndex + 1}`;

                  return (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        attempt.result === 'success' ? 'bg-green-200 text-green-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}
                      title={tooltipText}
                    >
                      {attempt.result === 'success' ? '✓' : '~'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render duration-based workout UI
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('main')}
              className="text-blue-600 font-semibold mr-4"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{workout.name}</h1>
          </div>
          <button
            onClick={() => navigate('workout', workoutId)}
            className="text-blue-600 font-semibold text-sm"
          >
            View Details
          </button>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Level</p>
              <p className="text-4xl font-bold text-blue-600">{workout.currentLevel + 1}/{workout.totalLevels}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-4xl font-bold text-green-600">{currentDuration}s</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-50 p-3 rounded">
            <p className="text-sm text-gray-700">
              Consecutive Successes: <span className="font-semibold text-green-700">{consecutiveSuccesses}/{workout.requiredSuccesses}</span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className={`text-center py-12 rounded-lg mb-4 ${
            timerState === 'running' ? 'bg-green-100' :
            timerState === 'finished' ? 'bg-yellow-100' : 'bg-gray-100'
          }`}>
            <p className="text-6xl font-bold text-gray-800">{timeRemaining}s</p>
          </div>

          {timerState === 'ready' && (
            <button
              onClick={startTimer}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
            >
              Start Attempt
            </button>
          )}

          {(timerState === 'running' || timerState === 'finished') && (
            <div className="space-y-2">
              <p className="text-center font-semibold text-gray-700 mb-3">
                {timerState === 'running' ? 'Timer running - record result anytime:' : 'How did your dog do?'}
              </p>
              <button
                onClick={() => recordResult('success')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
              >
                ✓ Success
              </button>
              <button
                onClick={() => recordResult('failure')}
                className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-yellow-700 transition"
              >
                ~ Failure (resets progress)
              </button>
              <button
                onClick={() => recordResult('critical')}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition"
              >
                ✗ Critical Failure (level down)
              </button>
            </div>
          )}
        </div>

        {workout.attempts && workout.attempts.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Recent Attempts</h3>
            <div className="flex flex-wrap gap-2">
              {workout.attempts.slice(-10).reverse().map((attempt, index) => {
                const attemptDate = new Date(attempt.completedAt);
                const tooltipText = `${attemptDate.toLocaleDateString()} ${attemptDate.toLocaleTimeString()}\nLevel ${attempt.level + 1}\nTarget: ${attempt.duration}s${attempt.actualDuration ? `\nActual: ${attempt.actualDuration}s` : ''}`;

                return (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      attempt.result === 'success' ? 'bg-green-200 text-green-800' :
                      attempt.result === 'failure' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}
                    title={tooltipText}
                  >
                    {attempt.result === 'success' ? '✓' : attempt.result === 'failure' ? '~' : '✗'}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainingPage;
