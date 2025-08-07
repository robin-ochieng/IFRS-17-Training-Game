//src/modules/guestUserService.js
// Guest User Service for Delayed Authentication

const GUEST_USER_KEY = 'ifrs17_guest_user';
const GUEST_PROGRESS_KEY = 'ifrs17_guest_progress';

export const createGuestUser = () => {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const guestUser = {
    id: guestId,
    name: 'Guest User',
    email: null,
    organization: 'Evaluating IFRS 17',
    avatar: 'G',
    country: 'Unknown',
    isGuest: true,
    sessionStart: new Date().toISOString()
  };
  
  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
};

export const getGuestUser = () => {
  try {
    const guestData = localStorage.getItem(GUEST_USER_KEY);
    return guestData ? JSON.parse(guestData) : null;
  } catch (error) {
    console.error('Error retrieving guest user:', error);
    return null;
  }
};

export const saveGuestProgress = (progressData) => {
  try {
    const timestamp = new Date().toISOString();
    const guestProgress = {
      ...progressData,
      lastUpdated: timestamp,
      isGuestData: true
    };
    localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(guestProgress));
    return true;
  } catch (error) {
    console.error('Error saving guest progress:', error);
    return false;
  }
};

export const getGuestProgress = () => {
  try {
    const progressData = localStorage.getItem(GUEST_PROGRESS_KEY);
    return progressData ? JSON.parse(progressData) : null;
  } catch (error) {
    console.error('Error retrieving guest progress:', error);
    return null;
  }
};

export const clearGuestData = () => {
  try {
    localStorage.removeItem(GUEST_USER_KEY);
    localStorage.removeItem(GUEST_PROGRESS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing guest data:', error);
    return false;
  }
};

export const migrateGuestToAuthenticatedUser = async (authenticatedUser, gameStateService) => {
  try {
    const guestProgress = getGuestProgress();
    
    if (guestProgress && authenticatedUser) {
      // Set storage user for authenticated user
      gameStateService.setStorageUser(authenticatedUser.id);
      
      // Save the guest progress as authenticated user progress
      const success = await gameStateService.saveGameState({
        ...guestProgress,
        migratedFromGuest: true,
        migrationTimestamp: new Date().toISOString()
      });
      
      if (success) {
        // Clear guest data after successful migration
        clearGuestData();
        console.log('✅ Successfully migrated guest progress to authenticated user');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error migrating guest progress:', error);
    return false;
  }
};

// Analytics tracking functions
export const trackGuestEvent = (eventName, data = {}) => {
  try {
    const guestUser = getGuestUser();
    const event = {
      timestamp: new Date().toISOString(),
      event: eventName,
      guestId: guestUser?.id || 'unknown',
      sessionStart: guestUser?.sessionStart,
      ...data
    };
    
    // Store analytics data locally for now
    const analyticsKey = 'ifrs17_guest_analytics';
    const existingAnalytics = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
    existingAnalytics.push(event);
    
    // Keep only last 100 events to prevent storage bloat
    if (existingAnalytics.length > 100) {
      existingAnalytics.splice(0, existingAnalytics.length - 100);
    }
    
    localStorage.setItem(analyticsKey, JSON.stringify(existingAnalytics));
    
    console.log(`📊 Guest Analytics: ${eventName}`, event);
  } catch (error) {
    console.error('Error tracking guest event:', error);
  }
};

export const getGuestAnalytics = () => {
  try {
    const analyticsKey = 'ifrs17_guest_analytics';
    return JSON.parse(localStorage.getItem(analyticsKey) || '[]');
  } catch (error) {
    console.error('Error retrieving guest analytics:', error);
    return [];
  }
};
