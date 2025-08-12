// IFRS17TrainingGame.js - Updated with deferred authentication
import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Star, Zap, Lock, CheckCircle, XCircle, TrendingUp, 
  Award, Clock, LogIn, UserPlus 
} from 'lucide-react';
import { modules } from './data/IFRS17Modules';
import { 
  achievementsList, 
  getNewAchievements, 
  createAchievementStats, 
  getGenderBasedAchievementName, 
  getGenderBasedAchievementIcon 
} from './modules/achievements';
import { 
  INITIAL_POWER_UPS, 
  consumePowerUp, 
  refreshPowerUps, 
  canUsePowerUp, 
  getPowerUpInfo 
} from './modules/powerUps';
import { 
  createGuestUser, 
  getGuestUser, 
  saveGuestProgress, 
  getGuestProgress,
  trackGuestEvent,
  migrateGuestToAuthenticatedUser,
  hasGuestCompletedModule1,
  getGuestModule1Completion
} from './modules/guestUserService';
import { GAME_CONFIG } from './config/gameConfig';
import AuthenticationModal from './components/AuthenticationModal';
import LeaderboardModal from './modules/LeaderboardModal';

// Import new Supabase service functions
import {
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
  submitModuleScore,
  getOverallLeaderboard,
  getModuleLeaderboard,
  syncAllGameData,
  testConnection
} from './modules/supabaseService';

import { saveGameState, loadGameState, setStorageUser } from './modules/storageService';


const IFRS17TrainingGame = ({ currentUser: propsUser, onLogout, onShowAuth }) => {
  // User state - Always start in guest mode unless authenticated user is provided
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingModule1Completion, setPendingModule1Completion] = useState(null);
  
  // Game state
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [unlockedModules, setUnlockedModules] = useState([0]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState(INITIAL_POWER_UPS);
  const [completedModules, setCompletedModules] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [moduleScore, setModuleScore] = useState(0);
  const [perfectModule, setPerfectModule] = useState(true);
  const [perfectModulesCount, setPerfectModulesCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [moduleStartTime, setModuleStartTime] = useState(null);
  const [completedModuleScore, setCompletedModuleScore] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState({});
  const [currentTime, setCurrentTime] = useState(0);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const timerInterval = useRef(null);
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get shuffled questions for a module
  const getShuffledQuestions = (moduleIndex) => {
    if (!shuffledQuestions[moduleIndex]) {
      const originalQuestions = modules[moduleIndex].questions;
      const shuffled = shuffleArray(originalQuestions.map((q, index) => ({ 
        ...q, 
        originalIndex: index 
      })));
      setShuffledQuestions(prev => ({
        ...prev,
        [moduleIndex]: shuffled
      }));
      return shuffled;
    }
    return shuffledQuestions[moduleIndex];
  };
  
  // Handle user prop changes (authentication state changes)
  useEffect(() => {
    console.log('User prop effect triggered:', { propsUser, currentUserId: currentUser?.id });
    
    if (propsUser && propsUser !== currentUser && !propsUser.isGuest) {
      console.log('Authenticated user provided, transitioning from guest:', propsUser);
      setCurrentUser(propsUser);
      setIsGuest(false);
      setStorageUser(propsUser.id);
      
      // Handle guest progress migration
      handleGuestToAuthenticatedTransition(propsUser);
      
    } else if (!propsUser && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true)) {
      // No authenticated user provided and deferred auth is enabled - initialize guest mode
      // Default to true if config is not loaded
      initializeGuestMode();
    }
  }, [propsUser]);

  // Initialize guest mode for deferred authentication
  const initializeGuestMode = () => {
    console.log('🎮 Initializing guest mode for deferred authentication');
    
    try {
      let guestUser = getGuestUser();
      if (!guestUser) {
        guestUser = createGuestUser();
        console.log('📝 Created new guest user:', guestUser.id);
      } else {
        console.log('🔄 Loading existing guest user:', guestUser.id);
        trackGuestEvent('guest_user_loaded', { guestId: guestUser.id });
      }
      
      setCurrentUser(guestUser);
      setIsGuest(true);
      setStorageUser(guestUser.id);
      
      // Load guest progress
      loadGuestProgressData();
    } catch (error) {
      console.error('❌ Error initializing guest mode:', error);
      
      // Fallback: create minimal guest user
      const fallbackGuest = {
        id: `guest_fallback_${Date.now()}`,
        name: 'Guest User',
        avatar: 'G',
        isGuest: true
      };
      
      setCurrentUser(fallbackGuest);
      setIsGuest(true);
      
      trackGuestEvent('guest_initialization_error', { 
        error: error.message,
        fallbackUsed: true
      });
    }
  };

  // Handle transition from guest to authenticated user
  const handleGuestToAuthenticatedTransition = async (authenticatedUser) => {
    console.log('🔄 Handling guest to authenticated user transition');
    
    try {
      // Attempt to migrate guest progress
      const migrationResult = await migrateGuestToAuthenticatedUser(
        authenticatedUser,
        { saveGameState, setStorageUser }
      );
      
      if (migrationResult.success) {
        console.log('✅ Guest progress successfully migrated');
        
        // Apply migrated progress to current state
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
          setPowerUps(mergedProgress.powerUps || INITIAL_POWER_UPS);
          setShuffledQuestions(mergedProgress.shuffledQuestions || {});
          
          // Restore achievements
          const restoredAchievements = achievementsList.filter(a => 
            mergedProgress.achievements?.includes(a.id)
          );
          setAchievements(restoredAchievements);
        }
        
        // Clear any pending module completion since it's now merged
        setPendingModule1Completion(null);
        
      } else {
        console.log('⚠️ No guest progress to migrate, loading authenticated user progress');
        // Load authenticated user progress from database
        loadUserProgress(authenticatedUser.id);
      }
    } catch (error) {
      console.error('❌ Error during guest to authenticated transition:', error);
      // Fallback: load authenticated user progress
      loadUserProgress(authenticatedUser.id);
    }
  };

  // Load current user on component mount (deferred auth logic)
  useEffect(() => {
    // If authenticated user is provided as prop, handle it in the prop effect
    if (propsUser && !propsUser.isGuest) {
      return;
    }
    
    // For deferred authentication, always start in guest mode
    if ((GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true) && !propsUser) {
      initializeGuestMode();
      return;
    }
    
    // Legacy behavior: try to load authenticated user (fallback)
    const loadUser = async () => {
      try {
        const authenticatedUser = await getCurrentUser();
        
        if (authenticatedUser && !authenticatedUser.isGuest) {
          setCurrentUser(authenticatedUser);
          setIsGuest(false);
          setStorageUser(authenticatedUser.id);
          trackGuestEvent('authenticated_user_loaded', { userId: authenticatedUser.id });
          
          // Load saved progress from database
          loadUserProgress(authenticatedUser.id);
        } else {
          // Fall back to guest mode
          initializeGuestMode();
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Fall back to guest mode
        initializeGuestMode();
      }
    };
    
    loadUser();
  }, []); // Only run once on mount

  // Load user progress from database
  const loadUserProgress = async (userId) => {
    try {
      const savedProgress = await loadGameProgress(userId);
      
      if (savedProgress) {
        // Restore game state from database
        setCurrentModule(savedProgress.current_module || 0);
        setCurrentQuestion(savedProgress.current_question || 0);
        setScore(savedProgress.total_score || 0);
        setLevel(savedProgress.level || 1);
        setXp(savedProgress.xp || 0);
        setStreak(savedProgress.streak || 0);
        setCombo(savedProgress.combo || 0);
        setPerfectModulesCount(savedProgress.perfect_modules_count || 0);
        setCompletedModules(savedProgress.completed_modules || []);
        setUnlockedModules(savedProgress.unlocked_modules || [0]);
        setAnsweredQuestions(savedProgress.answered_questions || {});
        setPowerUps(savedProgress.power_ups || INITIAL_POWER_UPS);
        setShuffledQuestions(savedProgress.shuffled_questions || {});
        
        // Restore achievements
        const restoredAchievements = achievementsList.filter(a => 
          savedProgress.achievements?.includes(a.id)
        );
        setAchievements(restoredAchievements);
        
        console.log('✅ Progress loaded from database');
      } else {
        // No saved progress for authenticated user - set up default state with all modules unlocked
        console.log('No saved progress found for authenticated user, unlocking modules');
        
        // For authenticated users, unlock modules based on their completion status
        // If they have pending module 1 completion, make sure they have access to module 2
        const defaultUnlocked = [0]; // Always have module 0 unlocked
        if (pendingModule1Completion) {
          defaultUnlocked.push(1); // Unlock module 2 if they completed module 1
        }
        
        setUnlockedModules(defaultUnlocked);
        setCompletedModules(pendingModule1Completion ? [0] : []);
      }
    } catch (error) {
      console.error('❌ Error loading progress:', error);
      
      // On error, ensure authenticated users have basic access
      setUnlockedModules([0, 1]); // At minimum, unlock modules 0 and 1 for authenticated users
    }
  };

  // Load guest progress from localStorage
  const loadGuestProgressData = () => {
    try {
      const savedState = getGuestProgress();
      
      if (savedState) {
        console.log('📂 Loading guest progress from localStorage');
        
        // Restore game state with fallbacks
        setCurrentModule(savedState.currentModule || 0);
        setCurrentQuestion(savedState.currentQuestion || 0);
        setScore(savedState.score || 0);
        setLevel(savedState.level || 1);
        setXp(savedState.xp || 0);
        setCompletedModules(savedState.completedModules || []);
        setAnsweredQuestions(savedState.answeredQuestions || {});
        setPowerUps(savedState.powerUps || INITIAL_POWER_UPS);
        setStreak(savedState.streak || 0);
        setCombo(savedState.combo || 0);
        setPerfectModulesCount(savedState.perfectModulesCount || 0);
        setShuffledQuestions(savedState.shuffledQuestions || {});
        
        // For guest users, only unlock Module 1 by default
        const guestUnlockedModules = [0];
        setUnlockedModules(guestUnlockedModules);
        
        // Restore achievements safely
        try {
          const restoredAchievements = achievementsList.filter(a => 
            savedState.achievements?.includes(a.id)
          );
          setAchievements(restoredAchievements);
        } catch (achievementError) {
          console.warn('⚠️ Error restoring achievements:', achievementError);
          setAchievements([]);
        }
        
        console.log('✅ Guest progress loaded successfully');
      } else {
        console.log('📭 No existing guest progress found, starting fresh');
        // Ensure fresh guest state
        setUnlockedModules([0]); // Only Module 1 unlocked for guests
        setCompletedModules([]);
      }
    } catch (error) {
      console.error('❌ Error loading guest progress:', error);
      
      // Fallback to safe defaults
      setCurrentModule(0);
      setCurrentQuestion(0);
      setScore(0);
      setLevel(1);
      setXp(0);
      setUnlockedModules([0]);
      setCompletedModules([]);
      setAnsweredQuestions({});
      setPowerUps(INITIAL_POWER_UPS);
      setAchievements([]);
      
      trackGuestEvent('guest_progress_load_error', { 
        error: error.message 
      });
    }
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer useEffect
  useEffect(() => {
    if (moduleStartTime && !completedModules.includes(currentModule)) {
      const interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - moduleStartTime) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
      
      timerInterval.current = interval;
      
      return () => {
        clearInterval(interval);
        timerInterval.current = null;
      };
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      setCurrentTime(0);
    }
  }, [moduleStartTime, currentModule, completedModules]);

  // Initialize timer for fresh starts
  useEffect(() => {
    if (currentUser && currentModule !== null && 
        !completedModules.includes(currentModule) && !moduleStartTime) {
      setModuleStartTime(new Date());
      setCurrentTime(0);
    }
  }, [currentUser, currentModule, completedModules, moduleStartTime]);

  // Get achievement display data
  const getAchievementDisplayData = (achievement) => {
    const originalAchievement = achievementsList.find(a => a.id === achievement.id);
    if (originalAchievement?.genderBased && currentUser?.gender) {
      return {
        ...achievement,
        name: getGenderBasedAchievementName(originalAchievement, currentUser.gender),
        icon: getGenderBasedAchievementIcon(originalAchievement, currentUser.gender)
      };
    }
    return achievement;
  };

  // Handle answer selection
  const handleAnswer = (answerIndex) => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (answeredQuestions[questionKey]?.answered) return;
    
    setSelectedAnswer(answerIndex);
    const currentModuleQuestions = getShuffledQuestions(currentModule);
    const currentQuestionData = currentModuleQuestions[currentQuestion];
    const correct = answerIndex === currentQuestionData.correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Track answered question
    const updatedAnsweredQuestions = { 
      ...answeredQuestions, 
      [questionKey]: { 
        answered: true, 
        selectedAnswer: answerIndex, 
        wasCorrect: correct 
      } 
    };
    setAnsweredQuestions(updatedAnsweredQuestions);

    if (correct) {
      const points = 10 * (combo + 1);
      setScore(score + points);
      setModuleScore(prev => prev + points);
      setStreak(streak + 1);
      setCombo(combo + 1);
      setXp(xp + 25);
      
      if (xp + 25 >= level * 100) {
        setLevel(level + 1);
        setXp((xp + 25) % (level * 100));
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 7000);
      }
    } else {
      setStreak(0);
      setCombo(0);
      setPerfectModule(false);
    }

    // Save progress after each answer
    saveProgress();

    setTimeout(async () => {
      if (currentQuestion < currentModuleQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(false);
        setSelectedAnswer(null);
      } else {
        // Module complete
        await handleModuleCompletion(correct);
      }
    }, 7000);
  };

  // Handle module completion
  const handleModuleCompletion = async (lastAnswerCorrect) => {
    // Calculate final module score
    const finalModuleScore = lastAnswerCorrect 
      ? moduleScore + (10 * (combo + 1)) 
      : moduleScore;
    
    setCompletedModuleScore(finalModuleScore);

    if (perfectModule) {
      setPerfectModulesCount(prev => prev + 1);
    }

    // Calculate completion time
    const endTime = new Date();
    const timeTaken = moduleStartTime 
      ? Math.floor((endTime - moduleStartTime) / 1000) 
      : null;
    
    // Calculate questions correct
    const moduleQuestionKeys = Object.keys(answeredQuestions).filter(
      key => key.startsWith(`${currentModule}-`)
    );
    const questionsCorrect = moduleQuestionKeys.filter(
      key => answeredQuestions[key].wasCorrect
    ).length;

    // Track module completion
    if (isGuest) {
      trackGuestEvent('module_completed', {
        score: finalModuleScore,
        perfect: perfectModule,
        timeSeconds: timeTaken,
        moduleIndex: currentModule
      });
    }

    // Handle Module 1 completion for guest users with deferred authentication
    if (isGuest && currentModule === 0 && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true)) {
      console.log('🎯 Module 1 completed by guest user - triggering deferred auth');
      
      setPendingModule1Completion({
        score: finalModuleScore,
        perfect: perfectModule,
        timeTaken: timeTaken
      });
      
      // Save guest progress including Module 1 completion
      const updatedCompletedModules = [...completedModules, currentModule];
      await saveGuestProgress({
        currentModule,
        currentQuestion,
        score,
        level,
        xp,
        completedModules: updatedCompletedModules,
        answeredQuestions,
        achievements: achievements.map(a => a.id),
        powerUps,
        streak,
        combo,
        perfectModulesCount: perfectModule ? perfectModulesCount + 1 : perfectModulesCount,
        shuffledQuestions,
        moduleScore: finalModuleScore,
        perfectModule,
        timeTaken
      });
      
      // Update local state to show Module 1 as completed
      setCompletedModules(updatedCompletedModules);
      
      // Track Module 1 completion by guest
      trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.MODULE1_COMPLETED_GUEST, {
        score: finalModuleScore,
        perfect: perfectModule,
        timeSeconds: timeTaken,
        guestId: currentUser?.id
      });
      
      // Show the module completion screen first, then auth modal
      setShowModuleComplete(true);
      
      // Delay showing auth modal to let user see their results
      setTimeout(() => {
        setShowAuthModal(true);
        trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.AUTH_PROMPT_SHOWN_AFTER_MODULE1, { 
          trigger: 'module_1_completion',
          guestId: currentUser?.id
        });
      }, 3000); // 3 second delay
      
      return;
    }

    // For authenticated users, submit to database
    if (!isGuest && currentUser?.id) {
      console.log(`🎯 Submitting Module ${currentModule} score...`);
      
      try {
        // Submit module score
        const moduleResult = await submitModuleScore(currentUser.id, {
          moduleId: currentModule,
          moduleName: modules[currentModule].title,
          score: finalModuleScore,
          perfectCompletion: perfectModule,
          completionTime: timeTaken,
          questionsAnswered: moduleQuestionKeys.length,
          questionsCorrect: questionsCorrect
        });

        if (moduleResult.success) {
          console.log(`✅ Module ${currentModule} score submitted successfully!`);
        }
        
        // Update completed modules
        const newCompletedModules = [...completedModules, currentModule];
        setCompletedModules(newCompletedModules);
        
        // Save overall progress
        await saveProgress();
        
      } catch (error) {
        console.error(`❌ Error submitting module score:`, error);
      }
    }

    setShowModuleComplete(true);
    setCompletedModules([...completedModules, currentModule]);
    
    if (currentModule < modules.length - 1 && 
        !unlockedModules.includes(currentModule + 1)) {
      setUnlockedModules([...unlockedModules, currentModule + 1]);
    }
  };
  
  // Handle power-up usage
  const handlePowerUp = (type) => {
    if (!canUsePowerUp(powerUps, type)) return;
    
    setPowerUps(consumePowerUp(powerUps, type));
    
    if (type === 'skip') {
      if (currentQuestion < modules[currentModule].questions.length - 1) {
        const questionKey = `${currentModule}-${currentQuestion}`;
        setAnsweredQuestions({ 
          ...answeredQuestions, 
          [questionKey]: { 
            answered: true, 
            selectedAnswer: null, 
            wasCorrect: false 
          } 
        });
        setPerfectModule(false);
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  // Check achievement conditions
  const checkAchievementConditions = () => {
    const stats = createAchievementStats({
      score,
      streak,
      level,
      completedModules,
      perfectModulesCount,
      combo
    });
    
    const newAchievements = getNewAchievements(
      achievements, 
      stats, 
      currentUser?.gender
    );
    
    if (newAchievements.length > 0) {
      const firstNewAchievement = newAchievements[0];
      setAchievements(prev => [...prev, firstNewAchievement]);
      setShowAchievement(firstNewAchievement);
      setTimeout(() => setShowAchievement(null), 7000);
    }
  };

  // Start new module with deferred authentication checks
  const startNewModule = (moduleIndex) => {
    // Enforce deferred authentication: prevent access to Module 2+ for guest users
    if (isGuest && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true) && 
        !(GAME_CONFIG?.MODULE_ACCESS?.GUEST_ACCESSIBLE_MODULES ?? [0]).includes(moduleIndex)) {
      
      console.log(`🔒 Guest user attempting to access Module ${moduleIndex + 1}, showing auth modal`);
      setShowAuthModal(true);
      trackGuestEvent('auth_modal_triggered', { 
        trigger: 'module_access_attempt', 
        moduleIndex,
        guestId: currentUser?.id
      });
      return;
    }

    console.log(`🎮 Starting Module ${moduleIndex + 1}`);

    // Clear any previously answered questions for this module
    const updatedAnsweredQuestions = { ...answeredQuestions };
    const moduleQuestionCount = modules[moduleIndex]?.questions?.length || 0;
    
    for (let i = 0; i < moduleQuestionCount; i++) {
      delete updatedAnsweredQuestions[`${moduleIndex}-${i}`];
    }
    
    // Generate new shuffled questions
    const originalQuestions = modules[moduleIndex].questions;
    const shuffled = shuffleArray(originalQuestions.map((q, index) => ({ 
      ...q, 
      originalIndex: index 
    })));
    setShuffledQuestions(prev => ({
      ...prev,
      [moduleIndex]: shuffled
    }));
    
    setAnsweredQuestions(updatedAnsweredQuestions);
    setCurrentModule(moduleIndex);
    setCurrentQuestion(0);
    setModuleScore(0);
    setPerfectModule(true);
    setPowerUps(prev => refreshPowerUps(prev));
    setShowFeedback(false);
    setSelectedAnswer(null);
    setModuleStartTime(new Date());
    setCurrentTime(0);

    // Track module start
    if (isGuest) {
      trackGuestEvent('module_started', { 
        moduleIndex,
        guestId: currentUser?.id
      });
    }
  };

  // Save progress (unified for both guest and authenticated users)
  const saveProgress = async () => {
    if (isSavingProgress) return; // Prevent concurrent saves
    
    setIsSavingProgress(true);
    
    const progressData = {
      currentModule: currentModule,
      currentQuestion: currentQuestion,
      score: score,
      level: level,
      xp: xp,
      streak: streak,
      combo: combo,
      perfectModulesCount: perfectModulesCount,
      completedModules: completedModules,
      unlockedModules: unlockedModules,
      answeredQuestions: answeredQuestions,
      achievements: achievements.map(a => a.id),
      powerUps: powerUps,
      shuffledQuestions: shuffledQuestions
    };

    let success = false;
    
    try {
      if (isGuest) {
        // Save guest progress to localStorage
        success = saveGuestProgress(progressData);
        console.log('💾 Guest progress saved to localStorage');
      } else if (currentUser?.id) {
        // Save authenticated user progress to database
        const result = await saveGameProgress(currentUser.id, progressData);
        success = result.success;
        if (success) {
          console.log('✅ Progress saved to database');
        }
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    } finally {
      setIsSavingProgress(false);
    }
    
    return success;
  };

  // Reset progress
  const resetProgress = async () => {
    if (window.confirm(
      '⚠️ Are you sure you want to reset all progress?\n\n' +
      'This will delete:\n' +
      '• Your score and level\n' +
      '• All completed modules\n' +
      '• All achievements\n' +
      '• All answered questions\n\n' +
      'This action cannot be undone!'
    )) {
      try {
        if (!isGuest && currentUser?.id) {
          await clearGameProgress(currentUser.id);
        }
        
        // Reset all state
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
        setAchievements([]);
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
        setShowAchievement(null);
        setModuleStartTime(null);
        setShuffledQuestions({});
        setCurrentTime(0);
        
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        
        console.log('✅ Progress reset successfully');
      } catch (error) {
        console.error('❌ Error resetting progress:', error);
      }
    }
  };

  // Update these functions in IFRS17TrainingGame.js
  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      trackGuestEvent('auth_cta_clicked', { action: 'sign_in' });
      
      // Close the modal and let App.js handle showing AuthScreen
      setShowAuthModal(false);
      if (onShowAuth) {
        await onShowAuth('signin');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setIsAuthenticating(true);
      trackGuestEvent('auth_cta_clicked', { action: 'sign_up' });
      
      // Close the modal and let App.js handle showing AuthScreen
      setShowAuthModal(false);
      if (onShowAuth) {
        await onShowAuth('signup');
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    if (isGuest) {
      trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.GUEST_AUTH_DEFERRED, { 
        action: 'dismissed',
        guestId: currentUser?.id,
        hasCompletedModule1: hasGuestCompletedModule1()
      });
    }
    
    // If there's a pending module 1 completion, show the completion screen
    if (pendingModule1Completion) {
      console.log('🎉 Showing Module 1 completion screen after auth modal close');
      setShowModuleComplete(true);
      
      // Update completed modules to show Module 1 as completed
      const newCompletedModules = [...completedModules];
      if (!newCompletedModules.includes(0)) {
        newCompletedModules.push(0);
      }
      setCompletedModules(newCompletedModules);
      
      // Note: We don't unlock Module 2 for guest users - that only happens after auth
      setPendingModule1Completion(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sync all data (for manual sync button)
  const handleManualSync = async () => {
    if (isGuest || !currentUser?.id) {
      console.log('⚠️ Cannot sync: User not authenticated');
      return;
    }
    
    console.log('🔄 Manual sync triggered...');
    
    try {
      // Prepare module scores
      const moduleScores = {};
      const perfectModules = [];
      
      completedModules.forEach(moduleIndex => {
        // Calculate score for each module (you might want to track this separately)
        const moduleQuestions = Object.keys(answeredQuestions).filter(
          key => key.startsWith(`${moduleIndex}-`)
        );
        
        let moduleCorrect = 0;
        moduleQuestions.forEach(key => {
          if (answeredQuestions[key].wasCorrect) moduleCorrect++;
        });
        
        const isPerfect = moduleCorrect === moduleQuestions.length;
        if (isPerfect) perfectModules.push(moduleIndex);
        
        // Estimate module score (you should track actual module scores)
        moduleScores[moduleIndex] = Math.floor(score / completedModules.length);
      });
      
      // Sync all game data
      const syncResult = await syncAllGameData(currentUser.id, {
        currentModule,
        currentQuestion,
        score,
        level,
        xp,
        completedModules,
        moduleScores,
        perfectModules,
        answeredQuestions,
        achievements: achievements.map(a => a.id),
        powerUps,
        streak,
        combo,
        perfectModulesCount,
        unlockedModules,
        shuffledQuestions
      });
      
      if (syncResult.success) {
        console.log('✅ Manual sync completed successfully');
        alert('Progress synced successfully!');
      } else {
        console.error('❌ Manual sync failed');
        alert('Failed to sync progress. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error during manual sync:', error);
      alert('An error occurred while syncing. Please try again.');
    }
  };

  // Check achievements on state changes
  useEffect(() => {
    checkAchievementConditions();
  }, [score, streak, level, combo, completedModules]);

  // Auto-save progress periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isGuest && currentUser?.id && answeredQuestions && 
          Object.keys(answeredQuestions).length > 0) {
        saveProgress();
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [isGuest, currentUser, answeredQuestions]);

  // Don't render until currentUser is loaded
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser.avatar || currentUser.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm md:text-base">
                {currentUser?.name || 'Loading...'}
              </p>
              <p className="text-gray-400 text-xs">{currentUser?.organization || ''}</p>
            </div>
          </div>
          
          {/* Auth CTAs */}
          <div className="flex items-center gap-2">
            {isGuest ? (
              <>
                <button
                  onClick={handleSignIn}
                  className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-all text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={handleSignUp}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Switch User
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 relative">
          <img 
            src="/kenbright-logo.png" 
            alt="Kenbright Logo" 
            className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 h-10 md:h-16 lg:h-20 w-auto z-10"
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center py-2">
            IFRS 17 Quest and Concur: Regulatory Training Game
          </h1>
        </div>

        {/* Stats Dashboard */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Score</p>
                <p className="text-lg md:text-2xl font-bold text-white">
                  {score.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="text-orange-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Streak</p>
                <p className="text-lg md:text-2xl font-bold text-white">{streak}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Level {level}</p>
                <div className="w-20 md:w-32 h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                    style={{ width: `${(xp / (level * 100)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Combo</p>
                <p className="text-lg md:text-2xl font-bold text-white">x{combo + 1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Actions */}
        <div className="mt-4 text-center">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="group relative bg-black/30 backdrop-blur-sm border border-purple-400/30 hover:border-purple-400 text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
            >
              <Trophy className="w-4 h-4 text-purple-400 group-hover:text-yellow-400 transition-colors" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                View Leaderboard
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
            </button>
            
            {!isGuest && (
              <button
                onClick={handleManualSync}
                className="group relative bg-black/30 backdrop-blur-sm border border-green-400/30 hover:border-green-400 text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
              >
                <TrendingUp className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-semibold">
                  Sync Progress
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
              </button>
            )}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-8 mt-6">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            IFRS 17 Training Modules 
            <span className="text-sm md:text-lg font-normal text-gray-300 ml-2 md:ml-4">
              ({completedModules.length}/{modules.length} completed)
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {modules.map((module, index) => {
              const isLocked = !unlockedModules.includes(index) || (isGuest && index > 0);
              const isCompleted = completedModules.includes(index);
              const isCurrent = index === currentModule && !completedModules.includes(index);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (isGuest && index > 0) {
                      setShowAuthModal(true);
                      trackGuestEvent('auth_modal_triggered', { 
                        trigger: 'module_click', 
                        moduleIndex: index 
                      });
                    } else if (unlockedModules.includes(index) && 
                        !completedModules.includes(index) && 
                        index !== currentModule) {
                      startNewModule(index);
                    }
                  }}
                  disabled={(isLocked && !isGuest) || 
                           completedModules.includes(index) || 
                           (index === currentModule && !showModuleComplete)}
                  className={`relative p-3 md:p-4 rounded-xl transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-600 to-green-700 transform cursor-not-allowed shadow-lg ring-2 ring-green-400'
                      : isCurrent
                      ? `bg-gradient-to-br ${module.color} transform scale-105 shadow-xl ring-2 ring-purple-400`
                      : (unlockedModules.includes(index) && !(isGuest && index > 0))
                      ? `bg-gradient-to-br ${module.color} hover:scale-105 transform cursor-pointer shadow-lg`
                      : 'bg-gray-800 opacity-50 cursor-pointer hover:opacity-70'
                  }`}
                >
                  {isCompleted && (
                    <CheckCircle className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-6 md:h-6 text-white" />
                  )}
                  {(isLocked || (isGuest && index > 0)) && (
                    <Lock className="absolute top-1 right-1 md:top-2 md:right-2 w-3 h-3 md:w-4 md:h-4 text-gray-300" />
                  )}
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">{module.icon}</div>
                  <p className="text-white text-xs md:text-sm font-semibold">
                    {module.title}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-green-200 mt-1">Completed!</p>
                  )}
                  {isCurrent && (
                    <p className="text-xs text-yellow-200 mt-1">In Progress</p>
                  )}
                  {isGuest && index > 0 && (
                    <p className="text-xs text-gray-300 mt-1">Sign up to unlock</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievement Notification */}
        {showAchievement && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-full text-lg font-bold animate-pulse flex items-center gap-3">
              <span className="text-2xl">{showAchievement.icon}</span>
              Achievement Unlocked: {showAchievement.name}!
            </div>
          </div>
        )}

        {/* Level Up Notification */}
        {showLevelUp && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-purple-600 text-white px-8 py-4 rounded-full text-2xl font-bold animate-pulse">
              ⭐ LEVEL UP! Level {level} ⭐
            </div>
          </div>
        )}

        {/* Module Complete Modal */}
        {showModuleComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl text-center transform scale-110 animate-pulse">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Module Complete! 🎉
              </h2>
              <p className="text-2xl text-white mb-2">
                {modules[currentModule].title}
              </p>
              <p className="text-xl text-yellow-300 mb-4">
                Score: {completedModuleScore} points
              </p>
              {perfectModule && (
                <p className="text-2xl text-yellow-400 font-bold mb-4 animate-pulse">
                  ⭐ PERFECT MODULE! ⭐
                </p>
              )}
              <p className="text-lg text-white mb-4">
                {currentModule < modules.length - 1 
                  ? "Get ready for the next module..." 
                  : "Congratulations! You've completed all modules!"}
              </p>
              {currentModule < modules.length - 1 ? (
                <button
                  onClick={() => {
                    setShowModuleComplete(false);
                    setTimeout(() => {
                      startNewModule(currentModule + 1);
                    }, 100);
                  }}
                  className="mt-4 px-6 py-3 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  Start Next Module →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowModuleComplete(false);
                  }}
                  className="mt-4 px-6 py-3 bg-yellow-400 text-purple-900 rounded-full font-bold hover:bg-yellow-300 transition-all transform hover:scale-105"
                >
                  View Final Results 🏆
                </button>
              )}
            </div>
          </div>
        )}

        {/* Question Display (rest of your game UI remains the same) */}
        {modules[currentModule] && completedModules.length < modules.length && 
         !completedModules.includes(currentModule) && (
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-lg md:text-xl font-bold text-white">
                  {modules[currentModule].title} - Question {currentQuestion + 1}/
                  {getShuffledQuestions(currentModule).length}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-400/30">
                    <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-blue-400 font-mono text-sm md:text-base font-semibold">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {Object.entries(powerUps).map(([type, count]) => (
                      <div key={type} className="relative group">
                        <button
                          onClick={() => handlePowerUp(type)}
                          disabled={count === 0}
                          className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1 ${
                            count > 0 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {getPowerUpInfo(type)?.icon}
                          {count}
                        </button>
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-50">
                          <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs whitespace-nowrap border border-white/20">
                            <div className="font-semibold">
                              {getPowerUpInfo(type)?.name}
                            </div>
                            <div className="text-gray-300 mt-1">
                              {getPowerUpInfo(type)?.description}
                            </div>
                            <div className="text-xs text-purple-300 mt-1">
                              {count > 0 ? `${count} remaining` : 'None left'}
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-white/20"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                  style={{ 
                    width: `${((currentQuestion + 1) / getShuffledQuestions(currentModule).length) * 100}%` 
                  }}
                />
              </div>
              
              <div className="flex gap-1 md:gap-2 justify-center mb-6 flex-wrap">
                {getShuffledQuestions(currentModule).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                      answeredQuestions[`${currentModule}-${idx}`]?.answered
                        ? answeredQuestions[`${currentModule}-${idx}`]?.wasCorrect 
                          ? 'bg-green-400' 
                          : 'bg-red-400'
                        : idx === currentQuestion
                        ? 'bg-purple-400 ring-2 ring-purple-300'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-base md:text-xl text-white mb-6">
                {getShuffledQuestions(currentModule)[currentQuestion]?.question}
              </p>
              
              {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && 
               !showFeedback && (
                <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-center text-sm md:text-base mb-2">
                    ⚠️ You've already answered this question.
                  </p>
                  {currentQuestion < modules[currentModule].questions.length - 1 && (
                    <button
                      onClick={() => {
                        setCurrentQuestion(currentQuestion + 1);
                        setShowFeedback(false);
                        setSelectedAnswer(null);
                      }}
                      className="mx-auto block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-colors"
                    >
                      Next Question →
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getShuffledQuestions(currentModule)[currentQuestion]?.options.map(
                (option, index) => (
                <button
                  key={index}
                  onClick={() => 
                    !showFeedback && 
                    !answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && 
                    handleAnswer(index)
                  }
                  disabled={
                    showFeedback || 
                    answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered
                  }
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 text-sm md:text-base ${
                    answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered
                      ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index
                        ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect
                          ? 'bg-green-500/20 border-green-400 text-green-400'
                          : 'bg-red-500/20 border-red-400 text-red-400'
                        : index === getShuffledQuestions(currentModule)[currentQuestion]?.correct
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                      : showFeedback && selectedAnswer === index
                      ? isCorrect
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-red-500/20 border-red-400 text-red-400'
                      : showFeedback && index === getShuffledQuestions(currentModule)[currentQuestion]?.correct
                      ? 'bg-green-500/20 border-green-400 text-green-400'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showFeedback && selectedAnswer === index && (
                      isCorrect ? 
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : 
                        <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                    {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && (
                      answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index ? (
                        answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect ? 
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" /> : 
                          <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                      ) : index === getShuffledQuestions(currentModule)[currentQuestion]?.correct ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                      ) : null
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`mt-6 p-4 rounded-xl ${
                isCorrect 
                  ? 'bg-green-500/20 border border-green-400' 
                  : 'bg-blue-500/20 border border-blue-400'
              }`}>
                <p className={`${
                  isCorrect ? 'text-green-400' : 'text-blue-400'
                } font-semibold mb-2 text-sm md:text-base`}>
                  {isCorrect 
                    ? `🎉 Excellent! +${10 * (combo)} points` 
                    : 'Not quite right, but here\'s the explanation:'}
                  {isCorrect && combo >= 3 && ' 🔥 COMBO!'}
                  {isCorrect && streak >= 5 && ' ⚡ STREAK!'}
                </p>
                <p className="text-gray-300 text-sm md:text-base">
                  {getShuffledQuestions(currentModule)[currentQuestion]?.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* All Modules Complete */}
        {completedModules.length === modules.length && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 mb-6 border border-yellow-400/50 text-center">
            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              🎊 Congratulations! 🎊
            </h2>
            <p className="text-xl text-white mb-2">
              You've completed all IFRS 17 Training Modules!
            </p>
            <p className="text-lg text-yellow-300">
              Final Score: {score.toLocaleString()} points
            </p>
            <p className="text-lg text-purple-300">
              Level: {level} | Achievements: {achievements.length}
            </p>
          </div>
        )}

        {/* Achievements Display */}
        {achievements.length > 0 && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Achievements Unlocked
            </h3>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => {
                const displayData = getAchievementDisplayData(achievement);
                return (
                  <div 
                    key={achievement.id} 
                    className="bg-white/10 rounded-lg p-3 flex items-center gap-2"
                  >
                    <span className="text-2xl">{displayData.icon}</span>
                    <span className="text-white font-medium">{displayData.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          currentUser={currentUser}
          modules={modules}
          userScore={score}
          userLevel={level}
          userAchievements={achievements.length}
          userCompletedModules={completedModules}
        />

        {/* Reset Progress Button */}
        <div className="mt-6 text-center">
          <button
            onClick={resetProgress}
            className="bg-gray-800/50 hover:bg-red-600/30 border border-gray-600 hover:border-red-500 text-gray-400 hover:text-red-400 px-6 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            ⚠️ Reset All Progress
          </button>
        </div>

        {/* Saving Indicator */}
        {isSavingProgress && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Saving progress...</span>
          </div>
        )}

        <div className="mt-6 mb-4">
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col items-center justify-center space-y-4">
              <span className="text-sm text-gray-300 font-medium tracking-wide">Endorsed by</span>
              
              <div className="relative group">
                {/* Optional glow ring */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/30 group-hover:ring-purple-400/40 transition-all duration-500 pointer-events-none"></div>
                
                {/* Logo Container */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 transition-transform duration-300 transform hover:scale-105 border border-white/20 shadow-md">
                  <div className="flex flex-col items-center space-y-2">
                    <img 
                      src="/IRA logo.png" 
                      alt="IRA Logo" 
                      className="h-14 w-auto object-contain brightness-110 contrast-125 drop-shadow-lg transition-all duration-300 hover:brightness-125"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <footer className="mt-6 mb-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="flex flex-col items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-gray-300 text-xs md:text-sm font-light">
                  Powered by Kenbright AI
                </span>
              </div>
              <div className="text-center">
                <p className="text-gray-300 text-xs">
                  © {new Date().getFullYear()} Kenbright. All rights reserved.  
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Version 3.0.0 | IFRS 17 Training Platform
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Authentication Modal */}
        <AuthenticationModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          isLoading={isAuthenticating}
        />
      </div>
    </div>
  );
};

export default IFRS17TrainingGame;