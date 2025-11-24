import type { TaskSetData } from '../types';

// Get all available task set names by discovering JSON files in task_sets directory
export const getAvailableTaskSets = (): string[] => {
  // Use Vite's import.meta.glob to discover all JSON files at build time
  const taskSetFiles = import.meta.glob('/public/task_sets/*.json', { eager: false });

  // Extract filenames without path and extension
  const taskSetNames = Object.keys(taskSetFiles).map(path => {
    const filename = path.split('/').pop() || '';
    return filename.replace('.json', '');
  });

  return taskSetNames;
};

// Load task sets from JSON
export const loadTaskSetFromJSON = async (filename: string): Promise<TaskSetData | null> => {
  try {
    const response = await fetch(`task_sets/${filename}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading task set:', error);
    return null;
  }
};
