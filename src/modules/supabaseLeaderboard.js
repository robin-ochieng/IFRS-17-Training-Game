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