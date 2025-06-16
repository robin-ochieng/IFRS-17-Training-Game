// src/modules/supabaseUserService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage key for current user (keeping this in localStorage for session management)
const CURRENT_USER_KEY = 'ifrs17_current_user';
const MIGRATION_KEY = 'ifrs17_users_migrated';

// Get all users from Supabase
export const getAllUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

// Create a new user in Supabase
export const createUserInSupabase = async (name, email = '', organization = '', country = '') => {
  const avatar = name.charAt(0).toUpperCase();
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    email,
    organization,
    avatar,
    country,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to create user:', error);
    return null;
  }
};

// Update user in Supabase
export const updateUserInSupabase = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user in Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to update user:', error);
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
      console.error('Error deleting user from Supabase:', error);
      return false;
    }

    // Clear current user if it's the deleted user
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserId === userId) {
      localStorage.removeItem(CURRENT_USER_KEY);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    return false;
  }
};

// Get current user from Supabase
export const getCurrentUserFromSupabase = async () => {
  try {
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUserId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (error) {
      console.error('Error fetching current user:', error);
      return null;
    }

    // Update last login
    if (data) {
      await updateUserInSupabase(data.id, { last_login: new Date().toISOString() });
    }

    return data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Set current user (still using localStorage for session)
export const setCurrentUserInSession = (userId) => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Clear current user session
export const clearCurrentUserSession = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

// Migrate users from localStorage to Supabase
export const migrateUsersToSupabase = async () => {
  // Check if migration has already been done
  const migrated = localStorage.getItem(MIGRATION_KEY);
  if (migrated === 'true') {
    return { success: true, message: 'Users already migrated' };
  }

  try {
    // Get users from localStorage
    const USERS_KEY = 'ifrs17_users';
    const localUsers = localStorage.getItem(USERS_KEY);
    
    if (!localUsers) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      return { success: true, message: 'No users to migrate' };
    }

    const users = JSON.parse(localUsers);
    
    if (users.length === 0) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      return { success: true, message: 'No users to migrate' };
    }

    // Migrate each user to Supabase
    const migrationResults = await Promise.all(
      users.map(async (user) => {
        try {
          // Check if user already exists in Supabase
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (existingUser) {
            return { userId: user.id, status: 'already_exists' };
          }

          // Insert user into Supabase
          const { data, error } = await supabase
            .from('users')
            .insert([{
              ...user,
              created_at: user.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) {
            console.error(`Error migrating user ${user.id}:`, error);
            return { userId: user.id, status: 'error', error };
          }

          return { userId: user.id, status: 'migrated' };
        } catch (error) {
          console.error(`Failed to migrate user ${user.id}:`, error);
          return { userId: user.id, status: 'error', error };
        }
      })
    );

    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    
    // Optionally, remove the old localStorage data
    // localStorage.removeItem(USERS_KEY);

    const migratedCount = migrationResults.filter(r => r.status === 'migrated').length;
    const existingCount = migrationResults.filter(r => r.status === 'already_exists').length;
    const errorCount = migrationResults.filter(r => r.status === 'error').length;

    return {
      success: true,
      message: `Migration complete: ${migratedCount} migrated, ${existingCount} already existed, ${errorCount} errors`,
      results: migrationResults
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: 'Migration failed',
      error
    };
  }
};

// Subscribe to user changes (real-time)
export const subscribeToUserChanges = (callback) => {
  const subscription = supabase
    .channel('users-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users'
    }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return subscription;
};