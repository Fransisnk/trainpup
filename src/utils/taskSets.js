import { storage } from './storage';

// Load task sets from JSON
export const loadTaskSetFromJSON = async (filename) => {
  try {
    const response = await fetch(`task_sets/${filename}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    storage.saveTaskSet(filename, data);
    return data;
  } catch (error) {
    console.error('Error loading task set:', error);
    return null;
  }
};
