import { useState, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { trackGuestEvent, hasGuestCompletedModule1 } from '../modules/guestUserService';
import { signOut, syncAllGameData } from '../modules/supabaseService';
import { sanitizePowerUps } from '../modules/powerUps';

const useGameUIActions = ({
  onShowAuth,
  onLogout,
  userState,
  authUiState,
  moduleCompletionState,
  progressState,
  achievements,
  saveProgress,
  onNotification,
}) => {
  // Internal UI State
  const [showGuide, setShowGuide] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const { isGuest, currentUser } = userState;
  const { setShowAuthModal, setIsAuthenticating } = authUiState;
  const {
    pendingModule1Completion,
    setPendingModule1Completion,
    setShowModuleComplete,
    completedModules,
    setCompletedModules,
  } = moduleCompletionState;
  const {
    currentModule,
    currentQuestion,
    answeredQuestions,
    score,
    level,
    xp,
    powerUps,
    streak,
    combo,
    perfectModulesCount,
    unlockedModules,
    shuffledQuestions,
  } = progressState;

  const currentUserId = currentUser?.id;

  const handleSignIn = useCallback(async () => {
    try {
      setIsAuthenticating(true);
      trackGuestEvent('auth_cta_clicked', { action: 'sign_in' });
      setShowAuthModal(false);
      if (onShowAuth) {
        await onShowAuth('signin');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [onShowAuth, setIsAuthenticating, setShowAuthModal]);

  const handleSignUp = useCallback(async () => {
    try {
      setIsAuthenticating(true);
      trackGuestEvent('auth_cta_clicked', { action: 'sign_up' });
      setShowAuthModal(false);
      if (onShowAuth) {
        await onShowAuth('signup');
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [onShowAuth, setIsAuthenticating, setShowAuthModal]);

  const handleAuthModalClose = useCallback(() => {
    setShowAuthModal(false);

    if (isGuest) {
      trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.GUEST_AUTH_DEFERRED, {
        action: 'dismissed',
        guestId: currentUserId,
        hasCompletedModule1: hasGuestCompletedModule1(),
      });
    }

    if (pendingModule1Completion) {
      setShowModuleComplete(true);
      const newCompletedModules = [...completedModules];
      if (!newCompletedModules.includes(0)) {
        newCompletedModules.push(0);
      }
      setCompletedModules(newCompletedModules);
      setPendingModule1Completion(null);
    }
  }, [
    completedModules,
    currentUserId,
    isGuest,
    pendingModule1Completion,
    setCompletedModules,
    setPendingModule1Completion,
    setShowAuthModal,
    setShowModuleComplete,
  ]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [onLogout]);

  const handleManualSync = useCallback(async () => {
    if (isGuest || !currentUserId) {
      console.log('⚠️ Cannot sync: User not authenticated');
      if (onNotification) {
        onNotification({
          type: 'warning',
          title: 'Sign In Required',
          message: 'Please sign in to sync your progress.'
        });
      }
      return;
    }

    console.log('🔄 Manual sync triggered for user:', currentUserId);

    try {
      const moduleScores = {};
      const perfectModules = [];

      // Only process completed modules if there are any
      if (completedModules && completedModules.length > 0) {
        completedModules.forEach((moduleIndex) => {
          const moduleQuestions = Object.keys(answeredQuestions || {}).filter((key) =>
            key.startsWith(`${moduleIndex}-`),
          );

          const moduleCorrect = moduleQuestions.reduce(
            (total, key) => (answeredQuestions[key]?.wasCorrect ? total + 1 : total),
            0,
          );

          if (moduleQuestions.length > 0 && moduleCorrect === moduleQuestions.length) {
            perfectModules.push(moduleIndex);
          }

          const denominator = Math.max(completedModules.length, 1);
          moduleScores[moduleIndex] = Math.floor(score / denominator);
        });
      }

      console.log('📊 Sync data prepared:', {
        currentModule,
        currentQuestion,
        score,
        level,
        completedModules,
        moduleScores,
      });

      const syncResult = await syncAllGameData(currentUserId, {
        currentModule,
        currentQuestion,
        score,
        level,
        xp,
        completedModules: completedModules || [],
        moduleScores,
        perfectModules,
        answeredQuestions: answeredQuestions || {},
        achievements: achievements.map((a) => a.id),
        powerUps: sanitizePowerUps(powerUps),
        streak: streak || 0,
        combo: combo || 0,
        perfectModulesCount: perfectModulesCount || 0,
        unlockedModules: unlockedModules || [0],
        shuffledQuestions: shuffledQuestions || {},
      });

      if (syncResult.success) {
        console.log('✅ Manual sync completed successfully');
        if (onNotification) {
          onNotification({
            type: 'success',
            title: 'Sync Complete',
            message: 'Your progress has been synced successfully!'
          });
        }
      } else {
        console.error('❌ Manual sync failed:', syncResult.error);
        if (onNotification) {
          onNotification({
            type: 'error',
            title: 'Sync Failed',
            message: syncResult.error || 'Failed to sync progress. Please try again.'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error during manual sync:', error);
      if (onNotification) {
        onNotification({
          type: 'error',
          title: 'Sync Error',
          message: error.message || 'An error occurred while syncing. Please try again.'
        });
      }
    }
  }, [
    achievements,
    answeredQuestions,
    combo,
    completedModules,
    currentModule,
    currentQuestion,
    currentUserId,
    isGuest,
    level,
    onNotification,
    perfectModulesCount,
    powerUps,
    score,
    shuffledQuestions,
    streak,
    unlockedModules,
    xp,
  ]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isGuest && currentUserId && answeredQuestions && Object.keys(answeredQuestions).length > 0) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [answeredQuestions, currentUserId, isGuest, saveProgress]);

  return {
    handleSignIn,
    handleSignUp,
    handleAuthModalClose,
    handleLogout,
    handleManualSync,
    // UI State
    showGuide,
    setShowGuide,
    showLeaderboard,
    setShowLeaderboard,
  };
};

export default useGameUIActions;
