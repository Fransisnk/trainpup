import type { NavigateFunction, Workout, TaskSetWorkout, DurationWorkout } from '../../types';

interface WorkoutHeaderProps {
  workout: Workout;
  navigate: NavigateFunction;
}

function WorkoutHeader({ workout, navigate }: WorkoutHeaderProps) {
  const isTaskSetWorkout = workout.type === 'taskset';

  let primaryStat: { label: string; value: string; color: string };
  let secondaryStat: { label: string; value: string; color: string };

  if (isTaskSetWorkout) {
    const taskSetWorkout = workout as TaskSetWorkout;
    const currentSet = taskSetWorkout.taskSets[taskSetWorkout.currentLevel];
    const totalTasksInSet = currentSet ? currentSet.tasks.length : 0;
    const completedTasksInSet = taskSetWorkout.currentTaskIndex;

    primaryStat = {
      label: 'Current Set',
      value: `${taskSetWorkout.currentLevel + 1}/${taskSetWorkout.totalLevels}`,
      color: 'green'
    };
    secondaryStat = {
      label: 'Tasks in Set',
      value: `${completedTasksInSet}/${totalTasksInSet}`,
      color: 'blue'
    };
  } else {
    const durationWorkout = workout as DurationWorkout;
    const currentDuration = durationWorkout.durationSteps[durationWorkout.currentLevel] ||
                           durationWorkout.durationSteps[durationWorkout.durationSteps.length - 1];

    primaryStat = {
      label: 'Current Level',
      value: `${durationWorkout.currentLevel + 1}/${durationWorkout.totalLevels}`,
      color: 'blue'
    };
    secondaryStat = {
      label: 'Level Duration',
      value: `${currentDuration}s`,
      color: 'green'
    };
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('training', workout.id)}
          className="text-blue-600 font-semibold mr-4"
        >
          ← Back to Training
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{workout.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`bg-${primaryStat.color}-50 p-4 rounded-lg`}>
          <p className="text-sm text-gray-600">{primaryStat.label}</p>
          <p className={`text-2xl font-bold text-${primaryStat.color}-600`}>{primaryStat.value}</p>
        </div>
        <div className={`bg-${secondaryStat.color}-50 p-4 rounded-lg`}>
          <p className="text-sm text-gray-600">{secondaryStat.label}</p>
          <p className={`text-2xl font-bold text-${secondaryStat.color}-600`}>{secondaryStat.value}</p>
        </div>
      </div>
    </div>
  );
}

export default WorkoutHeader;
