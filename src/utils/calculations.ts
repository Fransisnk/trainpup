// Calculate duration steps with dog-friendly increments
export const calculateDurationSteps = (startDuration: number, endDuration: number): number[] => {
  const steps = [];
  let currentDuration = startDuration;

  while (currentDuration < endDuration) {
    steps.push(currentDuration);

    // Calculate next increment based on current duration
    let increment;
    if (currentDuration < 60) {
      increment = Math.round(currentDuration * 0.6);
    } else if (currentDuration < 300) {
      increment = Math.round(currentDuration * 0.50 / 30) * 30;
    } else if (currentDuration < 1200) {
      increment = Math.round(currentDuration * 0.25 / 60) * 60;
    } else {
      increment = Math.round(currentDuration * 0.10 / 60) * 60;
    }

    // Ensure at least 1 second increment
    increment = Math.max(increment, 1);
    currentDuration += increment;
  }

  // Add the final target duration
  steps.push(endDuration);

  return steps;
};

// Calculate required successes based on duration
export const getRequiredSuccesses = (currentDuration: number): number => {
  if (currentDuration < 60) {
    return 8;
  } else if (currentDuration < 300) {
    return 5;
  } else if (currentDuration < 1200) {
    return 2;
  } else {
    return 1;
  }
};

// Generate random duration from normal distribution
export const normalRandom = (mean: number, sigma: number): number => {
  // Box-Muller transform to generate normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const sample = mean + sigma * z0;
  // Ensure positive duration and round to 1 decimal place
  return Math.max(0.1, Math.round(sample * 10) / 10);
};
