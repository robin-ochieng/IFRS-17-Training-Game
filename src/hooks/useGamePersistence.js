import { useEffect, useRef, useCallback } from 'react';
import {
  createGuestUser,
  getGuestUser,
  saveGuestProgress,
  getGuestProgress,
  trackGuestEvent,
  migrateGuestToAuthenticatedUser,
} from '../modules/guestUserService';
import { INITIAL_POWER_UPS, sanitizePowerUps } from '../modules/powerUps';
import {
  saveGameState,
  setStorageUser,
  setLastLocation,
  getLastLocation,
} from '../modules/storageService';
import {
  getUserProfileLastLocation,
  updateUserProfileLastLocation,
} from '../modules/supabaseService';
import {
  getCurrentUser,
  clearGameProgress,
  loadGameProgress,
} from '../modules/supabaseService';
import { GAME_CONFIG } from '../config/gameConfig';

const useGamePersistence = ({
  modules,
  propsUser,
  achievementState,
  gameState,
  uiState,
  timers,
  userState,
  navigateToModule,
}) => {
  const hasTriedResumeRef = useRef(false);
  const guestInitializedRef = useRef(false);

  const {
    currentUser,
    setCurrentUser,
    isGuest,
    setIsGuest,
    isSavingProgress,
    setIsSavingProgress,
    isBootingResume,
    setIsBootingResume,
  } = userState;

  const {
    achievements = [],
    restoreAchievements,
    resetAchievements,
  } = achievementState;

  const {
    currentModule,
    setCurrentModule,
    currentQuestion,
    setCurrentQuestion,
    score,
    setScore,
    level,
    setLevel,
    xp,
    setXp,
    streak,
    setStreak,
    combo,
    setCombo,
    powerUps,
    setPowerUps,
    completedModules,
    setCompletedModules,
    answeredQuestions,
    setAnsweredQuestions,
    unlockedModules,
    setUnlockedModules,
    setPerfectModule,
    perfectModulesCount,
    setPerfectModulesCount,
    setShowModuleComplete,
    setModuleScore,
    setCompletedModuleScore,
    setShowFeedback,
    setSelectedAnswer,
    setIsCorrect,
    setShowLevelUp,
    shuffledQuestions,
    setShuffledQuestions,
    moduleCompletionTimes,
    setModuleCompletionTimes,
  } = gameState;

  const { setPendingModule1Completion } = uiState;
  const { resetTimer } = timers;

  const persistLastLocation = useCallback(async ({ moduleId, questionIndex }) => {
    try {
      if (isGuest) {
        setLastLocation({ moduleId, questionIndex });
      } else if (currentUser?.id) {
        await updateUserProfileLastLocation(currentUser.id, { moduleId, questionIndex });
      }
    } catch (error) {
      console.warn('persistLastLocation failed:', error);
    }
  }, [isGuest, currentUser]);

  const tryResumeLastLocation = useCallback(async () => {
    try {
      let lastLoc = null;
      if (!isGuest && currentUser?.id) {
        lastLoc = await getUserProfileLastLocation(currentUser.id);
      } else {
        lastLoc = getLastLocation();
      }

      if (!lastLoc) {
        return;
      }

      const desiredModule = lastLoc.moduleId ?? 0;
      const desiredQ = lastLoc.questionIndex ?? 0;

      const highestUnlocked = (unlockedModules && unlockedModules.length > 0)
        ? Math.max(...unlockedModules)
        : 0;
      const isUnlocked = unlockedModules?.includes(desiredModule);

      if (!isUnlocked && !isGuest) {
        const range = Array.from({ length: desiredModule + 1 }, (_, i) => i);
        setUnlockedModules(prev => Array.from(new Set([...(prev || [0]), ...range])));
      }

      const targetModule = (!isUnlocked && isGuest) ? highestUnlocked : desiredModule;
      const totalQ = modules[targetModule]?.questions?.length || 0;
      const clampedQ = Math.max(0, Math.min(desiredQ, Math.max(0, totalQ - 1)));

      navigateToModule(targetModule, clampedQ);
    } catch (error) {
      console.warn('Failed to apply resume location:', error);
    }
  }, [currentUser, isGuest, modules, navigateToModule, unlockedModules, setUnlockedModules]);

  const queueResumeCheck = useCallback(() => {
    if (hasTriedResumeRef.current) return;
    hasTriedResumeRef.current = true;
    setTimeout(async () => {
      await tryResumeLastLocation();
      setIsBootingResume(false);
    }, 50);
  }, [setIsBootingResume, tryResumeLastLocation]);

  const syncLastLocationOnLogin = useCallback(async (userId) => {
    try {
      const local = getLastLocation();
      const cloud = await getUserProfileLastLocation(userId);
      const localTs = local?.ts ? Date.parse(local.ts) : 0;
      const cloudTs = cloud?.ts ? Date.parse(cloud.ts) : 0;
      if (local && (!cloud || localTs > cloudTs)) {
        await updateUserProfileLastLocation(
          userId,
          { moduleId: local.moduleId ?? 0, questionIndex: local.questionIndex ?? 0 }
        );
      }
    } catch (error) {
      console.warn('syncLastLocationOnLogin failed:', error);
    }
  }, []);

  const loadGuestProgressData = useCallback(() => {
    try {
      const savedState = getGuestProgress();

      if (savedState) {
        setCurrentModule(savedState.currentModule ?? 0);
        setCurrentQuestion(savedState.currentQuestion ?? 0);
        setScore(savedState.score || 0);
        setLevel(savedState.level || 1);
        setXp(savedState.xp || 0);
        setCompletedModules(
          Array.isArray(savedState.completedModules)
            ? Array.from(new Set(savedState.completedModules.filter((m) => Number.isInteger(m) && m >= 0)))
            : []
        );
        setAnsweredQuestions(savedState.answeredQuestions || {});
        setPowerUps(sanitizePowerUps(savedState.powerUps));
        setStreak(savedState.streak || 0);
        setCombo(savedState.combo || 0);
        setPerfectModulesCount(savedState.perfectModulesCount || 0);
        setShuffledQuestions(savedState.shuffledQuestions || {});

        const restoredModule = savedState.currentModule ?? 0;
        const restoredCompleted = Array.isArray(savedState.completedModules)
          ? savedState.completedModules
          : [];
        const restoredUnlocked = Array.isArray(savedState.unlockedModules)
          ? savedState.unlockedModules
          : [];

        const impliedUnlockMax = Math.max(
          restoredModule,
          ...restoredCompleted.map((m) => m + 1),
          0
        );
        const computedUnlocks = new Set([0, restoredModule, ...restoredCompleted]);
        restoredUnlocked.forEach((m) => computedUnlocks.add(m));
        for (let i = 0; i <= impliedUnlockMax; i += 1) {
          computedUnlocks.add(i);
        }
        const normalizedUnlocks = Array.from(computedUnlocks)
          .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < modules.length)
          .sort((a, b) => a - b);
        setUnlockedModules(normalizedUnlocks.length ? normalizedUnlocks : [0]);

        try {
          restoreAchievements(savedState.achievements);
        } catch (error) {
          resetAchievements();
        }
      } else {
        setUnlockedModules([0]);
        setCompletedModules([]);
      }
    } catch (error) {
      setCurrentModule(0);
      setCurrentQuestion(0);
      setScore(0);
      setLevel(1);
      setXp(0);
      setUnlockedModules([0]);
      setCompletedModules([]);
      setAnsweredQuestions({});
      setPowerUps(INITIAL_POWER_UPS);
      resetAchievements();

      trackGuestEvent('guest_progress_load_error', {
        error: error.message,
      });
    }
  }, [modules.length, resetAchievements, restoreAchievements, setAnsweredQuestions, setCombo, setCompletedModules, setCurrentModule, setCurrentQuestion, setLevel, setPerfectModulesCount, setPowerUps, setScore, setShuffledQuestions, setStreak, setUnlockedModules, setXp]);

  const initializeGuestMode = useCallback(() => {
    // Prevent re-initialization during active gameplay
    if (guestInitializedRef.current) {
      return;
    }

    try {
      let guestUser = getGuestUser();
      if (!guestUser) {
        guestUser = createGuestUser();
      } else {
        trackGuestEvent('guest_user_loaded', { guestId: guestUser.id });
      }

      setCurrentUser(guestUser);
      setIsGuest(true);
      setStorageUser(guestUser.id);

      guestInitializedRef.current = true;
      loadGuestProgressData();
      queueResumeCheck();
    } catch (error) {
      const fallbackGuest = {
        id: `guest_fallback_${Date.now()}`,
        name: 'Guest User',
        avatar: 'G',
        isGuest: true,
      };
      setCurrentUser(fallbackGuest);
      setIsGuest(true);

      trackGuestEvent('guest_initialization_error', {
        error: error.message,
        fallbackUsed: true,
      });
    }
  }, [loadGuestProgressData, queueResumeCheck, setCurrentUser, setIsGuest]);

  const loadUserProgress = useCallback(async (userId) => {
    try {
      // Use the robust loadGameProgress from supabaseService which reads from game_progress table
      const data = await loadGameProgress(userId);

      if (!data) {
        // Fallback to defaults if no data found
        setUnlockedModules([0, 1]);
        setCompletedModules([]);
        setCurrentModule(0);
        setCurrentQuestion(0);
        setScore(0);
        setStreak(0);
        setCombo(1);
        setLevel(1);
        setXp(0);
        setAnsweredQuestions({});
        setPowerUps(INITIAL_POWER_UPS);
        queueResumeCheck();
        return;
      }

      // Map snake_case DB columns to camelCase state
      setScore(data.total_score ?? 0);
      setStreak(data.streak ?? 0);
      setCombo(data.combo ?? 1);
      setLevel(data.level ?? 1);
      setXp(data.xp ?? 0);
      setPerfectModulesCount(data.perfect_modules_count ?? 0);
      
      setCompletedModules(Array.isArray(data.completed_modules) ? data.completed_modules : []);
      setUnlockedModules(Array.isArray(data.unlocked_modules) ? data.unlocked_modules : [0, 1]);
      
      setCurrentModule(data.current_module ?? 0);
      setCurrentQuestion(data.current_question ?? 0);
      
      setAnsweredQuestions(data.answered_questions || {});
      setPowerUps(sanitizePowerUps(data.power_ups));
      setShuffledQuestions(data.shuffled_questions || {});
      setModuleCompletionTimes(data.module_completion_times || {});

      if (data.achievements && Array.isArray(data.achievements)) {
        restoreAchievements(data.achievements);
      }

      queueResumeCheck();
    } catch (error) {
      console.error('Error loading user progress:', error);
      // Fallback on error
      setUnlockedModules([0, 1]);
      setCompletedModules([]);
      setCurrentModule(0);
      setCurrentQuestion(0);
      setScore(0);
      setStreak(0);
      setCombo(1);
      queueResumeCheck();
    }
  }, [
    queueResumeCheck, 
    restoreAchievements, 
    setAnsweredQuestions, 
    setCombo, 
    setCompletedModules, 
    setCurrentModule, 
    setCurrentQuestion, 
    setLevel, 
    setPerfectModulesCount, 
    setPowerUps, 
    setScore, 
    setShuffledQuestions, 
    setStreak, 
    setUnlockedModules, 
    setXp,
    setModuleCompletionTimes
  ]);

  const handleGuestToAuthenticatedTransition = useCallback(async (authenticatedUser) => {
    try {
      const migrationResult = await migrateGuestToAuthenticatedUser(authenticatedUser, {
        saveGameState,
        setStorageUser,
      });

      if (migrationResult.success) {
        const mergedProgress = migrationResult.mergedProgress;
        if (mergedProgress) {
          setCurrentModule(mergedProgress.currentModule || 0);
          setCurrentQuestion(mergedProgress.currentQuestion || 0);
          setScore(mergedProgress.score || 0);
          setLevel(mergedProgress.level || 1);
          setXp(mergedProgress.xp || 0);
          setStreak(mergedProgress.streak || 0);
          setCombo(mergedProgress.combo || 0);
          setPerfectModulesCount(mergedProgress.perfectModulesCount || 0);
          setCompletedModules(mergedProgress.completedModules || []);
          setUnlockedModules(mergedProgress.unlockedModules || [0, 1]);
          setAnsweredQuestions(mergedProgress.answeredQuestions || {});
          setPowerUps(sanitizePowerUps(mergedProgress.powerUps));
          setShuffledQuestions(mergedProgress.shuffledQuestions || {});
          setModuleCompletionTimes(mergedProgress.moduleCompletionTimes || {});
          restoreAchievements(mergedProgress.achievements);
        }

        setPendingModule1Completion(null);
        await syncLastLocationOnLogin(authenticatedUser.id);
        queueResumeCheck();
      } else {
        await loadUserProgress(authenticatedUser.id);
        await syncLastLocationOnLogin(authenticatedUser.id);
        queueResumeCheck();
      }
    } catch (error) {
      await loadUserProgress(authenticatedUser.id);
      await syncLastLocationOnLogin(authenticatedUser.id);
      queueResumeCheck();
    }
  }, [loadUserProgress, queueResumeCheck, restoreAchievements, setAnsweredQuestions, setCombo, setCompletedModules, setCurrentModule, setCurrentQuestion, setLevel, setPendingModule1Completion, setPowerUps, setPerfectModulesCount, setScore, setShuffledQuestions, setStreak, setUnlockedModules, setXp, syncLastLocationOnLogin, setModuleCompletionTimes]);

  const saveProgress = useCallback(async (overrides = {}) => {
    if (isSavingProgress) return false;

    setIsSavingProgress(true);

    const progressData = {
      currentModule,
      currentQuestion,
      score,
      level,
      xp,
      streak,
      combo,
      perfectModulesCount,
      completedModules,
      unlockedModules,
      answeredQuestions,
      achievements: achievements.map((a) => a.id),
      powerUps,
      shuffledQuestions,
      moduleCompletionTimes,
      ...overrides,
    };

    let success = false;

    try {
      if (isGuest) {
        success = saveGuestProgress(progressData);
      } else if (currentUser?.id) {
        setStorageUser(currentUser.id);
        success = await saveGameState(progressData);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSavingProgress(false);
    }

    return success;
  }, [achievements, answeredQuestions, combo, completedModules, currentModule, currentQuestion, currentUser, isGuest, isSavingProgress, level, perfectModulesCount, powerUps, score, setIsSavingProgress, shuffledQuestions, streak, unlockedModules, xp, moduleCompletionTimes]);

  const resetProgress = useCallback(async () => {
    try {
      if (!isGuest && currentUser?.id) {
        await clearGameProgress(currentUser.id);
      }

      setCurrentModule(0);
      setCurrentQuestion(0);
      setScore(0);
      setStreak(0);
      setLevel(1);
      setXp(0);
      setUnlockedModules([0]);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setIsCorrect(false);
      setCombo(0);
      setPowerUps(INITIAL_POWER_UPS);
      setCompletedModules([]);
      setAnsweredQuestions({});
      setShowModuleComplete(false);
      setModuleScore(0);
      setPerfectModule(true);
      setPerfectModulesCount(0);
      setCompletedModuleScore(0);
      setShowLevelUp(false);
      resetAchievements();
      setShuffledQuestions({});
      resetTimer();
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [currentUser, isGuest, resetAchievements, resetTimer, setAnsweredQuestions, setCombo, setCompletedModules, setCompletedModuleScore, setCurrentModule, setCurrentQuestion, setIsCorrect, setLevel, setModuleScore, setPerfectModule, setPerfectModulesCount, setPowerUps, setScore, setSelectedAnswer, setShowFeedback, setShowLevelUp, setShowModuleComplete, setShuffledQuestions, setStreak, setUnlockedModules, setXp]);

  useEffect(() => {
    if (propsUser && propsUser !== currentUser && !propsUser.isGuest) {
      setCurrentUser(propsUser);
      setIsGuest(false);
      setStorageUser(propsUser.id);
      hasTriedResumeRef.current = false;
      handleGuestToAuthenticatedTransition(propsUser);
    } else if (!propsUser && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true)) {
      initializeGuestMode();
    }
  }, [currentUser, handleGuestToAuthenticatedTransition, initializeGuestMode, propsUser, setIsGuest, setCurrentUser]);

  useEffect(() => {
    if (propsUser && !propsUser.isGuest) {
      return;
    }

    if ((GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true) && !propsUser) {
      initializeGuestMode();
      return;
    }

    const loadUser = async () => {
      try {
        const authenticatedUser = await getCurrentUser();
        if (authenticatedUser && !authenticatedUser.isGuest) {
          setCurrentUser(authenticatedUser);
          setIsGuest(false);
          setStorageUser(authenticatedUser.id);
          trackGuestEvent('authenticated_user_loaded', { userId: authenticatedUser.id });
          loadUserProgress(authenticatedUser.id);
        } else {
          initializeGuestMode();
        }
      } catch (error) {
        initializeGuestMode();
      }
    };

    loadUser();
  }, [initializeGuestMode, loadUserProgress, propsUser, setCurrentUser, setIsGuest]);

  return {
    currentUser,
    isGuest,
    isBootingResume,
    isSavingProgress,
    persistLastLocation,
    saveProgress,
    resetProgress,
  };
};

export default useGamePersistence;
