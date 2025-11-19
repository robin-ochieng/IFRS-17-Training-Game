import { useState, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { trackGuestEvent, hasGuestCompletedModule1 } from '../modules/guestUserService';
import { signOut, syncAllGameData } from '../modules/supabaseService';

const useGameUIActions = ({
  onShowAuth,
  onLogout,
  userState,
  authUiState,
  moduleCompletionState,
  progressState,
  achievements,
  saveProgress,
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
      return;
    }

    console.log('🔄 Manual sync triggered...');

    try {
      const moduleScores = {};
      const perfectModules = [];

      completedModules.forEach((moduleIndex) => {
        const moduleQuestions = Object.keys(answeredQuestions || {}).filter((key) =>
          key.startsWith(`${moduleIndex}-`),
        );

        const moduleCorrect = moduleQuestions.reduce(
          (total, key) => (answeredQuestions[key].wasCorrect ? total + 1 : total),
          0,
        );

        if (moduleQuestions.length > 0 && moduleCorrect === moduleQuestions.length) {
          perfectModules.push(moduleIndex);
        }

        const denominator = Math.max(completedModules.length, 1);
        moduleScores[moduleIndex] = Math.floor(score / denominator);
      });

      const syncResult = await syncAllGameData(currentUserId, {
        currentModule,
        currentQuestion,
        score,
        level,
        xp,
        completedModules,
        moduleScores,
        perfectModules,
        answeredQuestions,
        achievements: achievements.map((a) => a.id),
        powerUps,
        streak,
        combo,
        perfectModulesCount,
        unlockedModules,
        shuffledQuestions,
      });

      if (syncResult.success) {
        console.log('✅ Manual sync completed successfully');
        if (typeof window !== 'undefined') {
          window.alert?.('Progress synced successfully!');
        }
      } else {
        console.error('❌ Manual sync failed');
        if (typeof window !== 'undefined') {
          window.alert?.('Failed to sync progress. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error during manual sync:', error);
      if (typeof window !== 'undefined') {
        window.alert?.('An error occurred while syncing. Please try again.');
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
