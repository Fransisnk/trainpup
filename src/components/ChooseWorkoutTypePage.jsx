function ChooseWorkoutTypePage({ navigate }) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('main')}
            className="text-blue-600 font-semibold mr-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Choose Workout Type</h1>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('new-workout')}
            className="w-full bg-blue-50 hover:bg-blue-100 border-2 border-blue-600 text-left p-6 rounded-lg transition"
          >
            <h3 className="text-xl font-bold text-blue-800 mb-2">Duration-Based Workout</h3>
            <p className="text-gray-600">Progressive duration training with automatic level increments</p>
          </button>

          <button
            onClick={() => navigate('new-taskset-workout')}
            className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-600 text-left p-6 rounded-lg transition"
          >
            <h3 className="text-xl font-bold text-green-800 mb-2">Task Set Workout</h3>
            <p className="text-gray-600">Protocol-based training with specific tasks to complete</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChooseWorkoutTypePage;
