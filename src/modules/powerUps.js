// src/modules/powerUps.js

// Initial power-up configuration
export const INITIAL_POWER_UPS = {
  hint: 5,
  eliminate: 3,
  skip: 2
};

// Power-up refresh amounts when starting new module
export const POWER_UP_REFRESH = {
  hint: 2,
  eliminate: 1,
  skip: 1
};

// Maximum power-up limits
export const POWER_UP_MAX = {
  hint: 5,
  eliminate: 3,
  skip: 2
};

// Check if a power-up can be used
export const canUsePowerUp = (powerUps, type) => {
  return powerUps[type] > 0;
};

// Use a power-up (decrease count)
export const consumePowerUp = (powerUps, type) => {
  if (!canUsePowerUp(powerUps, type)) return powerUps;
  
  return {
    ...powerUps,
    [type]: powerUps[type] - 1
  };
};

// Refresh power-ups when starting a new module
export const refreshPowerUps = (currentPowerUps) => {
  return {
    hint: Math.min(currentPowerUps.hint + POWER_UP_REFRESH.hint, POWER_UP_MAX.hint),
    eliminate: Math.min(currentPowerUps.eliminate + POWER_UP_REFRESH.eliminate, POWER_UP_MAX.eliminate),
    skip: Math.min(currentPowerUps.skip + POWER_UP_REFRESH.skip, POWER_UP_MAX.skip)
  };
};

// Power-up effects
export const POWER_UP_EFFECTS = {
  hint: {
    name: 'Hint',
    icon: '💡',
    description: 'Get a helpful hint about the correct answer',
    action: (currentQuestion, correctAnswer) => {
      // Return hint text based on question
      return `Look for the option that best aligns with IFRS 17 principles`;
    }
  },
  eliminate: {
    name: 'Eliminate',
    icon: '🎯',
    description: 'Remove two incorrect answers',
    action: (options, correctIndex) => {
      // Return indices of options to eliminate (not including correct answer)
      const incorrectIndices = options
        .map((_, index) => index)
        .filter(index => index !== correctIndex);
      
      // Randomly select 2 incorrect options to eliminate
      const toEliminate = [];
      for (let i = 0; i < 2 && i < incorrectIndices.length; i++) {
        const randomIndex = Math.floor(Math.random() * incorrectIndices.length);
        const eliminateIndex = incorrectIndices.splice(randomIndex, 1)[0];
        toEliminate.push(eliminateIndex);
      }
      
      return toEliminate;
    }
  },
  skip: {
    name: 'Skip',
    icon: '⏭️',
    description: 'Skip this question and move to the next',
    action: () => {
      // Skip logic is handled in the main component
      return true;
    }
  }
};

// Get power-up display info
export const getPowerUpInfo = (type) => {
  return POWER_UP_EFFECTS[type] || null;
};