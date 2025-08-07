// supabaseService.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// USER AUTHENTICATION & MANAGEMENT
// ============================================

/**
 * Sign up a new user
 */
export const signUp = async (email, password, userData) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name: userData.name,
        avatar: userData.avatar || userData.name.charAt(0).toUpperCase(),
        organization: userData.organization,
        country: userData.country,
        gender: userData.gender
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    return { success: true, user: profile };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return { success: true, user: profile, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return profile;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// ============================================
// GAME PROGRESS MANAGEMENT
// ============================================

/**
 * Save complete game progress
 */
export const saveGameProgress = async (userId, progressData) => {
  try {
    console.log('💾 Saving game progress for user:', userId);
    
    const { data, error } = await supabase.rpc('save_game_progress', {
      p_user_id: userId,
      p_progress: progressData
    });

    if (error) throw error;

    console.log('✅ Game progress saved successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Save game progress error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load game progress for a user
 */
export const loadGameProgress = async (userId) => {
  try {
    console.log('📥 Loading game progress for user:', userId);
    
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    console.log('✅ Game progress loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ Load game progress error:', error);
    return null;
  }
};

/**
 * Clear/reset game progress
 */
export const clearGameProgress = async (userId) => {
  try {
    console.log('🗑️ Clearing game progress for user:', userId);
    
    // Delete game progress
    const { error: progressError } = await supabase
      .from('game_progress')
      .delete()
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Delete module completions
    const { error: modulesError } = await supabase
      .from('module_completions')
      .delete()
      .eq('user_id', userId);

    if (modulesError) throw modulesError;

    console.log('✅ Game progress cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Clear game progress error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// MODULE COMPLETION & SCORING
// ============================================

/**
 * Submit a module completion score
 */
export const submitModuleScore = async (userId, moduleData) => {
  try {
    console.log('📊 Submitting module score:', moduleData);
    
    const { data, error } = await supabase.rpc('submit_module_score', {
      p_user_id: userId,
      p_module_id: moduleData.moduleId,
      p_module_name: moduleData.moduleName,
      p_score: moduleData.score,
      p_perfect: moduleData.perfectCompletion || false,
      p_time: moduleData.completionTime || null,
      p_questions_answered: moduleData.questionsAnswered || null,
      p_questions_correct: moduleData.questionsCorrect || null
    });

    if (error) throw error;

    console.log('✅ Module score submitted successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Submit module score error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get module completions for a user
 */
export const getUserModuleCompletions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('module_completions')
      .select('*')
      .eq('user_id', userId)
      .order('module_id', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Get user module completions error:', error);
    return [];
  }
};

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

/**
 * Get overall leaderboard with user position
 */
export const getOverallLeaderboard = async (userId = null, limit = 50) => {
  try {
    console.log('🏆 Fetching overall leaderboard...');
    
    if (userId) {
      // Use the function to get leaderboard with user position
      const { data, error } = await supabase.rpc('get_leaderboard_with_position', {
        p_user_id: userId,
        p_limit: limit
      });

      if (error) throw error;

      console.log('✅ Overall leaderboard fetched with user position');
      return {
        leaderboard: data.leaderboard || [],
        userPosition: data.userPosition || null
      };
    } else {
      // Just get the leaderboard
      const { data, error } = await supabase
        .from('overall_leaderboard')
        .select('*')
        .limit(limit);

      if (error) throw error;

      console.log('✅ Overall leaderboard fetched');
      return {
        leaderboard: data || [],
        userPosition: null
      };
    }
  } catch (error) {
    console.error('❌ Get overall leaderboard error:', error);
    return { leaderboard: [], userPosition: null };
  }
};

/**
 * Get module-specific leaderboard
 */
export const getModuleLeaderboard = async (moduleId, userId = null, limit = 50) => {
  try {
    console.log(`🎯 Fetching leaderboard for module ${moduleId}...`);
    
    const { data, error } = await supabase
      .from('module_leaderboard')
      .select('*')
      .eq('module_id', moduleId)
      .order('score', { ascending: false })
      .order('completion_time', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Add current user flag
    const processedData = (data || []).map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: userId ? entry.user_id === userId : false
    }));

    // Find user position if not in top results
    let userPosition = null;
    if (userId && !processedData.find(e => e.user_id === userId)) {
      const { data: userEntry, error: userError } = await supabase
        .from('module_leaderboard')
        .select('*')
        .eq('module_id', moduleId)
        .eq('user_id', userId)
        .single();

      if (!userError && userEntry) {
        // Calculate rank
        const { count } = await supabase
          .from('module_leaderboard')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', moduleId)
          .or(`score.gt.${userEntry.score},and(score.eq.${userEntry.score},completion_time.lt.${userEntry.completion_time})`);

        userPosition = {
          ...userEntry,
          rank: (count || 0) + 1,
          isCurrentUser: true
        };
      }
    }

    console.log(`✅ Module ${moduleId} leaderboard fetched`);
    return {
      leaderboard: processedData,
      userPosition
    };
  } catch (error) {
    console.error(`❌ Get module ${moduleId} leaderboard error:`, error);
    return { leaderboard: [], userPosition: null };
  }
};

/**
 * Get user's rank in overall leaderboard
 */
export const getUserRank = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('overall_leaderboard')
      .select('rank')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data?.rank || null;
  } catch (error) {
    console.error('Get user rank error:', error);
    return null;
  }
};

/**
 * Get leaderboard statistics
 */
export const getLeaderboardStats = async () => {
  try {
    // Get total players
    const { count: totalPlayers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active players (played in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activePlayers } = await supabase
      .from('game_progress')
      .select('*', { count: 'exact', head: true })
      .gte('last_saved', thirtyDaysAgo.toISOString());

    // Get total modules completed
    const { count: totalCompletions } = await supabase
      .from('module_completions')
      .select('*', { count: 'exact', head: true });

    // Get perfect completions
    const { count: perfectCompletions } = await supabase
      .from('module_completions')
      .select('*', { count: 'exact', head: true })
      .eq('perfect_completion', true);

    return {
      totalPlayers: totalPlayers || 0,
      activePlayers: activePlayers || 0,
      totalCompletions: totalCompletions || 0,
      perfectCompletions: perfectCompletions || 0,
      averageCompletionRate: totalPlayers > 0 
        ? Math.round((totalCompletions / (totalPlayers * 5)) * 100) // Assuming 5 modules
        : 0
    };
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    return {
      totalPlayers: 0,
      activePlayers: 0,
      totalCompletions: 0,
      perfectCompletions: 0,
      averageCompletionRate: 0
    };
  }
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to leaderboard changes
 */
export const subscribeToLeaderboard = (callback) => {
  const subscription = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_progress'
      },
      (payload) => {
        console.log('Leaderboard update:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from leaderboard changes
 */
export const unsubscribeFromLeaderboard = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    console.log('✅ Connection test successful');
    return { success: true, count: data };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user exists
 */
export const checkUserExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Check user exists error:', error);
    return false;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Sync all game data (for migrations or recovery)
 */
export const syncAllGameData = async (userId, gameState) => {
  try {
    console.log('🔄 Syncing all game data...');
    
    // Save game progress
    const progressResult = await saveGameProgress(userId, gameState);
    if (!progressResult.success) throw new Error(progressResult.error);

    // Submit scores for all completed modules
    for (const moduleIndex of gameState.completedModules || []) {
      // Calculate module-specific data
      const moduleQuestions = gameState.answeredQuestions || {};
      let moduleCorrect = 0;
      let moduleAnswered = 0;
      
      Object.keys(moduleQuestions).forEach(key => {
        if (key.startsWith(`${moduleIndex}-`)) {
          moduleAnswered++;
          if (moduleQuestions[key].wasCorrect) moduleCorrect++;
        }
      });

      await submitModuleScore(userId, {
        moduleId: moduleIndex,
        moduleName: `Module ${moduleIndex + 1}`, // You should pass actual module names
        score: gameState.moduleScores?.[moduleIndex] || 0,
        perfectCompletion: gameState.perfectModules?.includes(moduleIndex) || false,
        questionsAnswered: moduleAnswered,
        questionsCorrect: moduleCorrect
      });
    }

    console.log('✅ All game data synced successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Sync all game data error:', error);
    return { success: false, error: error.message };
  }
};

export default supabase;