import type { Workout } from '../../types';

interface WorkoutPastAttemptsProps {
  workout: Workout;
}

function WorkoutPastAttempts({ workout }: WorkoutPastAttemptsProps) {
  if (!workout.attempts || workout.attempts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Past Attempts</h2>
      <div className="space-y-2">
        {workout.attempts.slice().reverse().map((attempt, index) => (
          <div key={index} className="border-b border-gray-200 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="text-sm text-gray-600">
                  {new Date(attempt.completedAt).toLocaleDateString()} {new Date(attempt.completedAt).toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500">
                  Level {attempt.level + 1}
                  {attempt.taskIndex !== undefined && `, Task ${attempt.taskIndex + 1}`}
                  {attempt.duration && ` - Target: ${attempt.duration}s`}
                  {attempt.actualDuration && ` | Actual: ${attempt.actualDuration}s`}
                </div>
                {attempt.task && (
                  <div className="text-sm text-gray-700 mt-1">
                    {attempt.task}
                  </div>
                )}
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
  );
}

export default WorkoutPastAttempts;
