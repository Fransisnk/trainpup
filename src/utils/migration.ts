import { getRequiredSuccesses } from './calculations';
import type { Workout, DurationWorkout, TaskSetWorkout, TaskSet } from '../types';

// Type guard to check if workout has old structure
interface OldDurationWorkout {
  id: string;
  name: string;
  type?: string;
  totalLevels: number;
  currentLevel: number;
  attempts: any[];
  createdAt: string;
  durationSteps?: number[];
  requiredSuccesses?: number;
}

interface OldTaskSetWorkout {
  id: string;
  name: string;
  type?: string;
  totalLevels: number;
  currentLevel: number;
  attempts: any[];
  createdAt: string;
  taskSetName?: string;
  taskSets?: TaskSet[];
  currentTaskIndex?: number;
}

/**
 * Migrates a workout from the old structure to the new unified structure
 * Old DurationWorkout: { durationSteps, requiredSuccesses }
 * New DurationWorkout: { taskSets with quantity in tasks }
 */
export function migrateWorkout(workout: any): Workout {
  // Check if it's already in the new format
  if (workout.taskSets && workout.taskSetName !== undefined && workout.currentTaskIndex !== undefined) {
    // Already migrated or in new format
    return workout as Workout;
  }

  // Handle old duration workout
  if (workout.durationSteps && Array.isArray(workout.durationSteps)) {
    const oldWorkout = workout as OldDurationWorkout;

    // Create task sets from duration steps
    const taskSets: TaskSet[] = oldWorkout.durationSteps.map((duration) => ({
      tasks: [{
        task: oldWorkout.name,
        duration: duration,
        quantity: getRequiredSuccesses(duration)
      }]
    }));

    const migratedWorkout: DurationWorkout = {
      id: oldWorkout.id,
      name: oldWorkout.name,
      type: 'duration' as const,
      totalLevels: oldWorkout.totalLevels,
      currentLevel: oldWorkout.currentLevel,
      attempts: oldWorkout.attempts,
      createdAt: oldWorkout.createdAt,
      taskSets,
      taskSetName: 'duration',
      currentTaskIndex: 0
    };

    return migratedWorkout;
  }

  // Handle old taskset workout (ensure all required fields exist)
  if (workout.type === 'taskset' || workout.taskSets) {
    const oldWorkout = workout as OldTaskSetWorkout;

    const migratedWorkout: TaskSetWorkout = {
      id: oldWorkout.id,
      name: oldWorkout.name,
      type: 'taskset' as const,
      totalLevels: oldWorkout.totalLevels,
      currentLevel: oldWorkout.currentLevel,
      attempts: oldWorkout.attempts,
      createdAt: oldWorkout.createdAt,
      taskSets: oldWorkout.taskSets || [],
      taskSetName: oldWorkout.taskSetName || 'unknown',
      currentTaskIndex: oldWorkout.currentTaskIndex ?? 0
    };

    return migratedWorkout;
  }

  // If we can't determine the type, return as-is (shouldn't happen)
  console.warn('Unable to migrate workout, returning as-is:', workout);
  return workout as Workout;
}

/**
 * Migrates all workouts in localStorage to the new structure
 * Call this function once to migrate existing data
 */
export function migrateAllWorkouts(): void {
  try {
    const workoutsJson = localStorage.getItem('workouts');
    if (!workoutsJson) {
      console.log('No workouts to migrate');
      return;
    }

    const workouts = JSON.parse(workoutsJson);
    if (!Array.isArray(workouts)) {
      console.warn('Workouts is not an array');
      return;
    }

    const migratedWorkouts = workouts.map(migrateWorkout);
    localStorage.setItem('workouts', JSON.stringify(migratedWorkouts));

    console.log(`Successfully migrated ${migratedWorkouts.length} workout(s)`);
  } catch (error) {
    console.error('Error migrating workouts:', error);
  }
}
