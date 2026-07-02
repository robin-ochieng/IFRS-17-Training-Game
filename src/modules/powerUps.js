// src/modules/powerUps.js
// Power-up definitions and state helpers. Allowance lives in GAME_CONFIG.POWER_UPS.
import { GAME_CONFIG } from '../config/gameConfig';

export const INITIAL_POWER_UPS = { ...GAME_CONFIG.POWER_UPS };

// Check if a power-up can be used
export const canUsePowerUp = (powerUps, type) => {
  return powerUps?.[type] > 0;
};

// Use a power-up (decrease count)
export const consumePowerUp = (powerUps, type) => {
  if (!canUsePowerUp(powerUps, type)) return powerUps;

  return {
    ...powerUps,
    [type]: powerUps[type] - 1
  };
};

// Full allowance at every module start — no carry-over between modules.
export const refreshPowerUps = () => ({ ...GAME_CONFIG.POWER_UPS });

// Saved progress may predate the current power-up set (e.g. contain "skip").
// Keep only known keys, clamp to the allowance, default anything invalid.
export const sanitizePowerUps = (saved) => {
  const clean = { ...GAME_CONFIG.POWER_UPS };
  if (saved && typeof saved === 'object') {
    Object.keys(clean).forEach((type) => {
      const value = saved[type];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        clean[type] = Math.min(value, GAME_CONFIG.POWER_UPS[type]);
      }
    });
  }
  return clean;
};

// Power-up effects
export const POWER_UP_EFFECTS = {
  eliminate: {
    name: 'Eliminate',
    icon: '✂️',
    description: 'Remove two wrong options from the current question'
  },
  hint: {
    name: 'Hint',
    icon: '💡',
    description: 'Ask the AI assistant for a hint about the current question'
  }
};

// Get power-up display info
export const getPowerUpInfo = (type) => {
  return POWER_UP_EFFECTS[type] || null;
};
