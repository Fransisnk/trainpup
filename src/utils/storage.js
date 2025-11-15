// Utility functions for localStorage
export const storage = {
  getWorkouts: () => JSON.parse(localStorage.getItem('workouts') || '[]'),
  saveWorkouts: (workouts) => localStorage.setItem('workouts', JSON.stringify(workouts)),
  getWorkout: (id) => storage.getWorkouts().find(w => w.id === id),
  updateWorkout: (id, updates) => {
    const workouts = storage.getWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index !== -1) {
      workouts[index] = { ...workouts[index], ...updates };
      storage.saveWorkouts(workouts);
    }
  },
  getTaskSets: () => JSON.parse(localStorage.getItem('taskSets') || '{}'),
  saveTaskSet: (name, data) => {
    const taskSets = storage.getTaskSets();
    taskSets[name] = data;
    localStorage.setItem('taskSets', JSON.stringify(taskSets));
  }
};
