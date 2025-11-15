import { useState } from 'react';
import MainPage from './MainPage';
import ChooseWorkoutTypePage from './ChooseWorkoutTypePage';
import NewWorkoutPage from './NewWorkoutPage';
import NewTaskSetWorkoutPage from './NewTaskSetWorkoutPage';
import WorkoutPage from './WorkoutPage';
import TrainingPage from './TrainingPage';
import type { PageName } from '../types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageName>('main');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const navigate = (page: PageName, workoutId: string | null = null) => {
    setCurrentPage(page);
    setSelectedWorkoutId(workoutId);
  };

  return (
    <div className="min-h-screen pb-20">
      {currentPage === 'main' && <MainPage navigate={navigate} />}
      {currentPage === 'choose-workout-type' && <ChooseWorkoutTypePage navigate={navigate} />}
      {currentPage === 'new-workout' && <NewWorkoutPage navigate={navigate} />}
      {currentPage === 'new-taskset-workout' && <NewTaskSetWorkoutPage navigate={navigate} />}
      {currentPage === 'workout' && <WorkoutPage navigate={navigate} workoutId={selectedWorkoutId} />}
      {currentPage === 'training' && <TrainingPage navigate={navigate} workoutId={selectedWorkoutId} />}
    </div>
  );
}

export default App;
