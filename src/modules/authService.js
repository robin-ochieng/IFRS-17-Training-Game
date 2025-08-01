// src/modules/authService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage keys
const CURRENT_USER_KEY = 'ifrs17_current_user';
const AUTH_TOKEN_KEY = 'ifrs17_auth_token';

// Simple password hashing (for demonstration - in production, use proper bcrypt on server)
const hashPassword = (password) => {
  // This is a simple hash for demonstration. In production, handle this server-side
  return btoa(password);
};

// Verify password
const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

// Sign up a new user
export const signUpUser = async ({ email, password, name, organization, country, gender }) => {
  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Create user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const avatar = name.charAt(0).toUpperCase();
    const passwordHash = hashPassword(password);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email,
        password_hash: passwordHash,
        name,
        organization,
        country,
        gender,
        avatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to create account. Please try again.');
    }

    // Set current user in session
    setCurrentUserSession(newUser);

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in an existing user
export const signInUser = async (email, password) => {
  try {
    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Set current user in session
    setCurrentUserSession(user);

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Get current user from session
export const getCurrentAuthUser = () => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Set current user in session
export const setCurrentUserSession = (user) => {
  try {
    if (user) {
      // Remove password_hash if present
      const { password_hash, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem(AUTH_TOKEN_KEY, user.id); // Simple token for now
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Sign out current user
export const signOut = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentAuthUser();
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!(user && token);
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update profile');
    }

    // Update local session
    const currentUser = getCurrentAuthUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUserSession({ ...currentUser, ...data });
    }

    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get user to verify current password
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password_hash)) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const newPasswordHash = hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update password');
    }

    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};