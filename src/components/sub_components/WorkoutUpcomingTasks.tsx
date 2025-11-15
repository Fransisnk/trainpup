import type { Workout, TaskSetWorkout, DurationWorkout } from '../../types';

interface WorkoutUpcomingTasksProps {
  workout: Workout;
}

function WorkoutUpcomingTasks({ workout }: WorkoutUpcomingTasksProps) {
  const isTaskSetWorkout = workout.type === 'taskset';

  if (isTaskSetWorkout) {
    const taskSetWorkout = workout as TaskSetWorkout;
    const currentSet = taskSetWorkout.taskSets[taskSetWorkout.currentLevel];

    if (!currentSet) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tasks</h2>
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
      </div>
    );
  } else {
    const durationWorkout = workout as DurationWorkout;

    return (
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
    );
  }
}

export default WorkoutUpcomingTasks;
