// modules/supabaseLeaderboard.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('URL:', supabaseUrl);  // This will help debug
  console.log('Key exists:', !!supabaseAnonKey);  // This will show true/false
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Submit or update user score
export const submitToLeaderboard = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .upsert({
        user_id: userData.id,
        user_name: userData.name,
        user_email: userData.email || '',
        organization: userData.organization,
        avatar: userData.avatar,
        country: userData.country || 'Unknown',
        score: userData.score,
        level: userData.level,
        achievements: userData.achievements,
        modules_completed: userData.modulesCompleted || 0,
        perfect_modules: userData.perfectModules || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error submitting to leaderboard:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to submit score:', error);
    return { success: false, error };
  }
};

// Submit or update module-specific score
export const submitModuleScore = async (moduleData) => {
  console.log('submitModuleScore called with:', moduleData);
  
  try {
    const submissionData = {
      user_id: moduleData.userId,
      module_id: moduleData.moduleId,
      module_name: moduleData.moduleName,
      user_name: moduleData.userName,
      user_email: moduleData.userEmail || '',
      organization: moduleData.organization,
      avatar: moduleData.avatar,
      country: moduleData.country || 'Unknown',
      score: moduleData.score,
      perfect_completion: moduleData.perfectCompletion || false,
      completion_time: moduleData.completionTime || null,
      updated_at: new Date().toISOString()
    };
    
    console.log('Submitting to Supabase:', submissionData);
    
    const { data, error } = await supabase
      .from('module_leaderboard')
      .upsert(submissionData, {
        onConflict: 'user_id,module_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Supabase error submitting module score:', error);
      return { success: false, error };
    }

    console.log('Module score submitted successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to submit module score:', error);
    return { success: false, error };
  }
};


// Get leaderboard with pagination
export const getLeaderboard = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
};

// Get module-specific leaderboard
export const getModuleLeaderboard = async (moduleId, limit = 100) => {
  console.log(`Loading leaderboard for module ${moduleId}`);
  try {
    const { data, error } = await supabase
      .from('module_leaderboard')
      .select('*')
      .eq('module_id', moduleId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching module leaderboard:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} entries for module ${moduleId}:`, data);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch module leaderboard:', error);
    return [];
  }
};

// Get all module leaderboards summary (top performers for each module)
export const getAllModuleTopPerformers = async (topN = 3) => {
  try {
    const { data, error } = await supabase
      .from('module_leaderboard')
      .select('*')
      .order('module_id', { ascending: true })
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching all module leaderboards:', error);
      return {};
    }

    // Group by module and take top N performers
    const moduleLeaderboards = {};
    data.forEach(entry => {
      if (!moduleLeaderboards[entry.module_id]) {
        moduleLeaderboards[entry.module_id] = [];
      }
      if (moduleLeaderboards[entry.module_id].length < topN) {
        moduleLeaderboards[entry.module_id].push(entry);
      }
    });

    return moduleLeaderboards;
  } catch (error) {
    console.error('Failed to fetch all module leaderboards:', error);
    return {};
  }
};


// Get user's rank
export const getUserRank = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('score', (
        await supabase
          .from('leaderboard')
          .select('score')
          .eq('user_id', userId)
          .single()
      ).data?.score || 0);

    if (error) {
      console.error('Error getting user rank:', error);
      return null;
    }

    return (count || 0) + 1;
  } catch (error) {
    console.error('Failed to get user rank:', error);
    return null;
  }
};

// Get user's rank in a specific module
export const getUserModuleRank = async (userId, moduleId) => {
  try {
    const userScore = await supabase
      .from('module_leaderboard')
      .select('score')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (!userScore.data) return null;

    const { count, error } = await supabase
      .from('module_leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', moduleId)
      .gt('score', userScore.data.score || 0);

    if (error) {
      console.error('Error getting user module rank:', error);
      return null;
    }

    return (count || 0) + 1;
  } catch (error) {
    console.error('Failed to get user module rank:', error);
    return null;
  }
};

// Get user's performance across all modules
export const getUserModulePerformance = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('module_leaderboard')
      .select('*')
      .eq('user_id', userId)
      .order('module_id', { ascending: true });

    if (error) {
      console.error('Error fetching user module performance:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch user module performance:', error);
    return [];
  }
};


// Subscribe to real-time leaderboard updates (optional)
export const subscribeToLeaderboard = (callback) => {
  const subscription = supabase
    .channel('leaderboard-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'leaderboard'
    }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return subscription;
};

// Subscribe to real-time module leaderboard updates
export const subscribeToModuleLeaderboard = (moduleId, callback) => {
  const subscription = supabase
    .channel(`module-leaderboard-${moduleId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'module_leaderboard',
      filter: `module_id=eq.${moduleId}`
    }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return subscription;
};