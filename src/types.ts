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
  quantity?: number;
  tags?: string[];
}

export interface TaskSet {
  tasks: Task[];
}

export interface TaskSetData {
  protocol: string;
  task_sets: TaskSet[];
}

export interface WorkoutInterface {
  id: string;
  name: string;
  type?: string;
  totalLevels: number;
  currentLevel: number;
  attempts: Attempt[];
  createdAt: string;
  taskSets: TaskSet[];
  taskSetName: string;
  currentTaskIndex: number;
}

export interface DurationWorkout extends WorkoutInterface{
  type?: 'duration';
}

export interface TaskSetWorkout extends WorkoutInterface{
  type?: 'taskset';
}

export type Workout = DurationWorkout | TaskSetWorkout;

export type PageName = 'main' | 'choose-workout-type' | 'new-workout' | 'new-taskset-workout' | 'workout' | 'training';

export interface NavigateFunction {
  (page: PageName, workoutId?: string | null): void;
}
