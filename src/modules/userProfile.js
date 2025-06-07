// src/modules/userProfile.js

// Storage key constants
const USERS_KEY = 'ifrs17_users';
const CURRENT_USER_KEY = 'ifrs17_current_user';

// Get all users from storage
export const getAllUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// Save all users to storage
const saveAllUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Create a new user profile
export const createUserProfile = (name, email = '', organization = '') => {
  const avatar = name.charAt(0).toUpperCase();
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    email,
    organization,
    avatar,
    createdAt: new Date().toISOString()
  };
  return newUser;
};

// Save a new user
export const saveUser = (user) => {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveAllUsers(users);
};

// Set the current user
export const setCurrentUser = (userId) => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Get the current user
export const getCurrentUser = () => {
  try {
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUserId) return null;
    
    const users = getAllUsers();
    return users.find(user => user.id === currentUserId) || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get user-specific storage key (for game state)
export const getUserStorageKey = (baseKey) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return baseKey;
  return `${baseKey}_${currentUser.id}`;
};

// Clear current user (for logout)
export const clearCurrentUser = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

// Delete a user profile
export const deleteUser = (userId) => {
  const users = getAllUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  saveAllUsers(filteredUsers);
  
  // If the deleted user was the current user, clear the current user
  const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
  if (currentUserId === userId) {
    clearCurrentUser();
  }
};

// Update user profile
export const updateUser = (userId, updates) => {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex >= 0) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveAllUsers(users);
  }
};

// Legacy support - keeping these exports for backward compatibility
export const user = {
  id: 'default-user',
  name: 'Demo User',
  email: 'demo@example.com',
  organization: 'Demo Organization',
  avatar: 'D'
};

export const getCurrentUserData = () => {
  return getCurrentUser() || user;
};