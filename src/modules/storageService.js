// src/modules/storageService.js
import { getUserStorageKey } from './userProfile';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let STORAGE_KEY = 'ifrs17-progress';
let CURRENT_USER_ID = null;

// Add function to set user-specific storage
export const setStorageUser = (userId) => {
  CURRENT_USER_ID = userId;
  STORAGE_KEY = getUserStorageKey(userId);
};

// Save game state to both localStorage and Supabase
export const saveGameState = async (gameState) => {
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
      shuffledQuestions: gameState.shuffledQuestions || {},
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    // Save to Supabase if user is authenticated
    if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user') {
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: CURRENT_USER_ID,
            progress_data: dataToSave,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('Supabase save error:', error);
        } else {
          console.log('✅ Progress saved to Supabase successfully');
        }
      } catch (supabaseError) {
        console.error('Failed to save to Supabase:', supabaseError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
};

// Load game state from Supabase first, fallback to localStorage
export const loadGameState = async () => {
  try {
    // First try to load from Supabase if user is authenticated
    if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user') {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('progress_data')
          .eq('user_id', CURRENT_USER_ID)
          .single();
        
        if (data && data.progress_data && !error) {
          console.log('✅ Progress loaded from Supabase successfully');
          return data.progress_data;
        }
      } catch (supabaseError) {
        console.error('Failed to load from Supabase:', supabaseError);
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const gameState = JSON.parse(saved);
    console.log('📱 Progress loaded from localStorage (fallback)');
    return gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

// Clear saved game state from both localStorage and Supabase
export const clearGameState = async () => {
  try {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear Supabase if user is authenticated
    if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user') {
      try {
        const { error } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', CURRENT_USER_ID);
        
        if (error) {
          console.error('Supabase clear error:', error);
        } else {
          console.log('✅ Progress cleared from Supabase successfully');
        }
      } catch (supabaseError) {
        console.error('Failed to clear from Supabase:', supabaseError);
      }
    }
    
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

