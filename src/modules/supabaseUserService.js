// src/modules/supabaseUserService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage key constants
const CURRENT_USER_KEY = 'ifrs17_current_user';
const USERS_KEY = 'ifrs17_users';

// Get all users from Supabase
export const getAllUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsersFromSupabase:', error);
    return [];
  }
};

// Create a new user in Supabase - Updated to include gender
export const createUserInSupabase = async (name, email, organization, country, gender = 'Prefer not to say') => {
  try {
    const avatar = name.charAt(0).toUpperCase();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        name,
        email,
        organization: organization || 'Independent',
        country: country || 'Unknown',
        gender: gender || 'Prefer not to say',
        avatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserInSupabase:', error);
    return null;
  }
};

// Update user in Supabase - Updated to handle all fields including gender
export const updateUserInSupabase = async (userId, updates) => {
  try {
    // Ensure we don't accidentally update password_hash through this method
    const { password_hash, ...safeUpdates } = updates;
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserInSupabase:', error);
    return null;
  }
};

// Delete user from Supabase
export const deleteUserFromSupabase = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    // Also delete from sessions if exists
    await supabase
      .from('current_sessions')
      .delete()
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Error in deleteUserFromSupabase:', error);
    return false;
  }
};

// Get current user from session
export const getCurrentUserFromSupabase = async () => {
  try {
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUserId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (error || !data) {
      console.error('Error fetching current user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUserFromSupabase:', error);
    return null;
  }
};

// Set current user in session
export const setCurrentUserInSession = (userId) => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
    
    // Update last activity in Supabase
    supabase
      .from('current_sessions')
      .upsert({
        user_id: userId,
        last_activity: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) console.error('Error updating session:', error);
      });
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Clear current user session
export const clearCurrentUserSession = () => {
  try {
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    
    if (currentUserId) {
      // Remove from sessions table
      supabase
        .from('current_sessions')
        .delete()
        .eq('user_id', currentUserId)
        .then(({ error }) => {
          if (error) console.error('Error clearing session:', error);
        });
    }
    
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

// Migrate users from localStorage to Supabase
export const migrateUsersToSupabase = async () => {
  try {
    const localUsers = localStorage.getItem(USERS_KEY);
    if (!localUsers) return;

    const users = JSON.parse(localUsers);
    if (!Array.isArray(users) || users.length === 0) return;

    // Check which users already exist
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id');

    const existingIds = new Set(existingUsers?.map(u => u.id) || []);

    // Filter out users that already exist
    const usersToMigrate = users.filter(user => !existingIds.has(user.id));

    if (usersToMigrate.length === 0) return;

    // Prepare users for insertion with all required fields
    const preparedUsers = usersToMigrate.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email || '',
      organization: user.organization || 'Independent',
      country: user.country || 'Unknown',
      gender: user.gender || 'Prefer not to say',
      avatar: user.avatar || user.name.charAt(0).toUpperCase(),
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert users in batches
    const batchSize = 10;
    for (let i = 0; i < preparedUsers.length; i += batchSize) {
      const batch = preparedUsers.slice(i, i + batchSize);
      const { error } = await supabase
        .from('users')
        .insert(batch);

      if (error) {
        console.error('Error migrating batch:', error);
      }
    }

    console.log(`Successfully migrated ${preparedUsers.length} users to Supabase`);
  } catch (error) {
    console.error('Error during migration:', error);
  }
};