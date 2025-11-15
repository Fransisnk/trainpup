// Common types for the Dog Training Tracker app

export interface Attempt {
  level: number;
  result: 'success' | 'failure' | 'critical';
  completedAt: string;
  timestamp: number;
  duration?: number;
  targetDuration?: number;
  actualDuration?: number;
  taskIndex?: number;
  task?: string;
}

export interface Task {
  task: string;
  duration?: number;
  note?: string;
}

export interface TaskSet {
  tasks: Task[];
}

export interface TaskSetData {
  protocol: string;
  task_sets: TaskSet[];
}

export interface DurationWorkout {
  id: string;
  name: string;
  type?: 'duration';
  totalLevels: number;
  durationSteps: number[];
  attempts: Attempt[];
  currentLevel: number;
  requiredSuccesses: number;
  createdAt: string;
}

export interface TaskSetWorkout {
  id: string;
  name: string;
  type: 'taskset';
  taskSetName: string;
  taskSets: TaskSet[];
  totalLevels: number;
  currentLevel: number;
  currentTaskIndex: number;
  attempts: Attempt[];
  createdAt: string;
}

export type Workout = DurationWorkout | TaskSetWorkout;

export type PageName = 'main' | 'choose-workout-type' | 'new-workout' | 'new-taskset-workout' | 'workout' | 'training';

export interface NavigateFunction {
  (page: PageName, workoutId?: string | null): void;
}
