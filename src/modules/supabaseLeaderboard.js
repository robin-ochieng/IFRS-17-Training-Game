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

// Add these updates to your existing supabaseLeaderboard.js file

// Update the submitToLeaderboard function to include gender
export const submitToLeaderboard = async (userData) => {
  try {
    const submissionData = {
      user_id: userData.id,
      user_name: userData.name,
      user_email: userData.email || '',
      organization: userData.organization || 'Independent',
      avatar: userData.avatar || userData.name.charAt(0).toUpperCase(),
      country: userData.country || 'Unknown',
      gender: userData.gender || 'Prefer not to say',
      score: userData.score || 0,
      level: userData.level || 1,
      achievements: userData.achievements || 0,
      modules_completed: userData.modulesCompleted || 0,
      perfect_modules: userData.perfectModules || 0,
      completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('leaderboard')
      .upsert(submissionData);

    if (error) {
      console.error('Error submitting to leaderboard:', error);
      return false;
    }

    console.log('Successfully submitted to leaderboard:', data);
    return true;
  } catch (error) {
    console.error('Failed to submit to leaderboard:', error);
    return false;
  }
};

// Update the submitModuleScore function to include gender
export const submitModuleScore = async (scoreData) => {
  try {
    const submissionData = {
      user_id: scoreData.userId,
      module_id: scoreData.moduleId,
      module_name: scoreData.moduleName,
      user_name: scoreData.userName,
      user_email: scoreData.userEmail || '',
      organization: scoreData.organization || 'Independent',
      avatar: scoreData.avatar || scoreData.userName.charAt(0).toUpperCase(),
      country: scoreData.country || 'Unknown',
      gender: scoreData.gender || 'Prefer not to say',
      score: scoreData.score,
      perfect_completion: scoreData.perfectCompletion || false,
      completion_time: scoreData.completionTime || null,
      completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('module_leaderboard')
      .upsert(submissionData);

    if (error) {
      console.error('Error submitting module score:', error);
      return false;
    }

    console.log('Successfully submitted module score:', data);
    return true;
  } catch (error) {
    console.error('Failed to submit module score:', error);
    return false;
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