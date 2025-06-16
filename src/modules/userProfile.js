// src/modules/userProfile.js
import {
  getAllUsersFromSupabase,
  createUserInSupabase,
  updateUserInSupabase,
  deleteUserFromSupabase,
  getCurrentUserFromSupabase,
  setCurrentUserInSession,
  clearCurrentUserSession,
  migrateUsersToSupabase
} from './supabaseUserService';

// Storage key constants (for backward compatibility)
const USERS_KEY = 'ifrs17_users';
const CURRENT_USER_KEY = 'ifrs17_current_user';

// Initialize migration on module load
let migrationPromise = null;
const ensureMigration = async () => {
  if (!migrationPromise) {
    migrationPromise = migrateUsersToSupabase();
  }
  return migrationPromise;
};

// Get all users - now from Supabase
export const getAllUsers = async () => {
  try {
    // Ensure migration has happened
    await ensureMigration();
    
    // Get users from Supabase
    const users = await getAllUsersFromSupabase();
    return users;
  } catch (error) {
    console.error('Error loading users:', error);
    // Fallback to localStorage if Supabase fails
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (localError) {
      console.error('Error loading users from localStorage:', localError);
      return [];
    }
  }
};

// Create a new user profile - now in Supabase
export const createUserProfile = async (name, email = '', organization = '', country = '') => {
  try {
    const newUser = await createUserInSupabase(name, email, organization, country);
    if (newUser) {
      return newUser;
    }
    
    // Fallback to local creation if Supabase fails
    const avatar = name.charAt(0).toUpperCase();
    return {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      organization,
      avatar,
      country,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating user:', error);
    // Fallback to local creation
    const avatar = name.charAt(0).toUpperCase();
    return {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      organization,
      avatar,
      country,
      createdAt: new Date().toISOString()
    };
  }
};

// Save a user - now to Supabase
export const saveUser = async (user) => {
  try {
    // Try to update first (in case user exists)
    let savedUser = await updateUserInSupabase(user.id, user);
    
    // If update returns null, try to create
    if (!savedUser) {
      savedUser = await createUserInSupabase(
        user.name,
        user.email,
        user.organization,
        user.country
      );
    }
    
    // Also save to localStorage as backup
    const users = await getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return savedUser || user;
  } catch (error) {
    console.error('Error saving user:', error);
    // Fallback to localStorage only
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return user;
  }
};

// Set the current user
export const setCurrentUser = (userId) => {
  setCurrentUserInSession(userId);
};

// Get the current user - now from Supabase
export const getCurrentUser = async () => {
  try {
    const user = await getCurrentUserFromSupabase();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    // Fallback to localStorage
    try {
      const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
      if (!currentUserId) return null;
      
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return users.find(user => user.id === currentUserId) || null;
    } catch (localError) {
      console.error('Error getting current user from localStorage:', localError);
      return null;
    }
  }
};

// Get user-specific storage key (for game state)
export const getUserStorageKey = async (baseKey) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return baseKey;
  return `${baseKey}_${currentUser.id}`;
};

// Clear current user (for logout)
export const clearCurrentUser = () => {
  clearCurrentUserSession();
};

// Delete a user profile - now from Supabase
export const deleteUser = async (userId) => {
  try {
    const success = await deleteUserFromSupabase(userId);
    
    // Also remove from localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    
    return success;
  } catch (error) {
    console.error('Error deleting user:', error);
    // Fallback to localStorage only
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    
    // If the deleted user was the current user, clear the current user
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserId === userId) {
      clearCurrentUser();
    }
    
    return true;
  }
};

// Update user profile - now in Supabase
export const updateUser = async (userId, updates) => {
  try {
    const updatedUser = await updateUserInSupabase(userId, updates);
    
    // Also update in localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    // Fallback to localStorage only
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return users[userIndex];
    }
    
    return null;
  }
};

// Legacy support - keeping these exports for backward compatibility
export const user = {
  id: 'default-user',
  name: 'Demo User',
  email: 'demo@example.com',
  organization: 'Demo Organization',
  avatar: 'D',
  country: 'Kenya'
};

export const getCurrentUserData = async () => {
  const currentUser = await getCurrentUser();
  return currentUser || user;
};