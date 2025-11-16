import type { Workout, TaskSetData } from '../types';
import { migrateWorkout } from './migration';

// Utility functions for localStorage
export const storage = {
  getWorkouts: (): Workout[] => {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    // Auto-migrate old workouts on load
    return workouts.map((workout: any) => migrateWorkout(workout));
  },
  saveWorkouts: (workouts: Workout[]): void => localStorage.setItem('workouts', JSON.stringify(workouts)),
  getWorkout: (id: string): Workout | undefined => storage.getWorkouts().find(w => w.id === id),
  updateWorkout: (id: string, updates: Partial<Workout>): void => {
    const workouts = storage.getWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index !== -1) {
      workouts[index] = { ...workouts[index], ...updates } as Workout;
      storage.saveWorkouts(workouts);
    }
  },
  getTaskSets: (): Record<string, TaskSetData> => JSON.parse(localStorage.getItem('taskSets') || '{}'),
  saveTaskSet: (name: string, data: TaskSetData): void => {
    const taskSets = storage.getTaskSets();
    taskSets[name] = data;
    localStorage.setItem('taskSets', JSON.stringify(taskSets));
  }
};
