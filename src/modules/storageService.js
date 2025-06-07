// src/modules/storageService.js
import { getUserStorageKey } from './userProfile';

let STORAGE_KEY = 'ifrs17-progress';

// Add function to set user-specific storage
export const setStorageUser = (userId) => {
  STORAGE_KEY = getUserStorageKey(userId);
};

// Save game state to localStorage
export const saveGameState = (gameState) => {
  try {
    const dataToSave = {
      currentModule: gameState.currentModule,
      currentQuestion: gameState.currentQuestion,
      score: gameState.score,
      level: gameState.level,
      xp: gameState.xp,
      completedModules: gameState.completedModules,
      answeredQuestions: gameState.answeredQuestions,
      achievements: gameState.achievements.map(a => a.id),
      powerUps: gameState.powerUps,
      streak: gameState.streak,
      combo: gameState.combo,
      perfectModulesCount: gameState.perfectModulesCount,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
};

// Load game state from localStorage
export const loadGameState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const gameState = JSON.parse(saved);
    return gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

// Clear saved game state
export const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear game state:', error);
    return false;
  }
};

// Check if saved game exists
export const hasSavedGame = () => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};

// Get save game metadata (without loading full state)
export const getSaveMetadata = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const gameState = JSON.parse(saved);
    return {
      score: gameState.score,
      level: gameState.level,
      completedModules: gameState.completedModules?.length || 0,
      timestamp: gameState.timestamp,
      totalModules: 10 // You can make this dynamic
    };
  } catch (error) {
    console.error('Failed to get save metadata:', error);
    return null;
  }
};

// Export game progress as JSON (for backup)
export const exportProgress = (gameState) => {
  const dataToExport = {
    gameVersion: '1.0.0',
    exportDate: new Date().toISOString(),
    gameState: {
      currentModule: gameState.currentModule,
      currentQuestion: gameState.currentQuestion,
      score: gameState.score,
      level: gameState.level,
      xp: gameState.xp,
      completedModules: gameState.completedModules,
      answeredQuestions: gameState.answeredQuestions,
      achievements: gameState.achievements.map(a => a.id),
      powerUps: gameState.powerUps,
      streak: gameState.streak,
      combo: gameState.combo,
      perfectModulesCount: gameState.perfectModulesCount
    }
  };
  
  return JSON.stringify(dataToExport, null, 2);
};

// Import game progress from JSON
export const importProgress = (jsonString) => {
  try {
    const imported = JSON.parse(jsonString);
    if (imported.gameState) {
      return imported.gameState;
    }
    return null;
  } catch (error) {
    console.error('Failed to import progress:', error);
    return null;
  }
};

