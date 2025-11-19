import { useMemo } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { refreshPowerUps } from '../modules/powerUps';
import { saveGuestProgress, trackGuestEvent } from '../modules/guestUserService';
import { submitModuleScore } from '../modules/supabaseService';

const shuffleArray = (array = []) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const useQuestionFlow = ({
  modules,
  userState,
  gameState,
  achievementsState,
  persistenceApi,
  timerApi,
  uiState,
}) => {
  const { isGuest, currentUser } = userState;
  const { achievements } = achievementsState;
  const { saveProgress, persistLastLocation } = persistenceApi;
  const {
    timerState,
    startTimer,
    stopTimer,
    resetTimer,
    currentTime,
    elapsedTime,
  } = timerApi;
  const { setShowAuthModal, setPendingModule1Completion } = uiState;

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
    perfectModule,
    setPerfectModule,
    perfectModulesCount,
    setPerfectModulesCount,
    setShowModuleComplete,
    moduleScore,
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

  const getShuffledQuestions = (moduleIndex) => {
    const moduleDef = modules[moduleIndex];
    if (!moduleDef) {
      return [];
    }

    if (shuffledQuestions[moduleIndex]) {
      return shuffledQuestions[moduleIndex];
    }

    const originalQuestions = moduleDef.questions || [];
    const prepared = shuffleArray(
      originalQuestions.map((q, index) => ({
        ...q,
        originalIndex: index,
      })),
    );

    setShuffledQuestions((prev) => ({
      ...prev,
      [moduleIndex]: prepared,
    }));

    return prepared;
  };

  const getTotalQuestions = () => {
    return getShuffledQuestions(currentModule)?.length || 0;
  };

  const { correctCount, wrongCount } = useMemo(() => {
    const moduleKeys = Object.keys(answeredQuestions).filter((key) =>
      key.startsWith(`${currentModule}-`),
    );
    const correct = moduleKeys.filter((key) => answeredQuestions[key].wasCorrect).length;
    return {
      correctCount: correct,
      wrongCount: moduleKeys.length - correct,
    };
  }, [answeredQuestions, currentModule]);

  const handleModuleCompletion = async (lastAnswerCorrect) => {
    const finalModuleScore = lastAnswerCorrect
      ? moduleScore + 10 * (combo + 1)
      : moduleScore;

    setCompletedModuleScore(finalModuleScore);

    if (perfectModule) {
      setPerfectModulesCount((prev) => prev + 1);
    }

    const timeTaken = elapsedTime || currentTime || 0;

    // Update module completion times
    const updatedModuleCompletionTimes = {
      ...moduleCompletionTimes,
      [currentModule]: timeTaken
    };
    setModuleCompletionTimes(updatedModuleCompletionTimes);

    const moduleQuestionKeys = Object.keys(answeredQuestions).filter((key) =>
      key.startsWith(`${currentModule}-`),
    );
    const questionsCorrect = moduleQuestionKeys.filter(
      (key) => answeredQuestions[key].wasCorrect,
    ).length;

    if (isGuest) {
      trackGuestEvent('module_completed', {
        score: finalModuleScore,
        perfect: perfectModule,
        timeSeconds: timeTaken,
        moduleIndex: currentModule,
      });
    }

    if (isGuest && currentModule === 0 && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true)) {
      setPendingModule1Completion({
        score: finalModuleScore,
        perfect: perfectModule,
        timeTaken,
      });

      const updatedCompletedModules = [...completedModules, currentModule];
      await saveGuestProgress({
        currentModule,
        currentQuestion,
        score,
        level,
        xp,
        completedModules: updatedCompletedModules,
        answeredQuestions,
        achievements: achievements.map((a) => a.id),
        powerUps,
        streak,
        combo,
        perfectModulesCount: perfectModule ? perfectModulesCount + 1 : perfectModulesCount,
        shuffledQuestions,
        moduleScore: finalModuleScore,
        perfectModule,
        timeTaken,
        moduleCompletionTimes: updatedModuleCompletionTimes,
      });

      setCompletedModules(updatedCompletedModules);

      trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.MODULE1_COMPLETED_GUEST, {
        score: finalModuleScore,
        perfect: perfectModule,
        timeSeconds: timeTaken,
        guestId: currentUser?.id,
      });

      setShowModuleComplete(true);

      setTimeout(() => {
        setShowAuthModal(true);
        trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.AUTH_PROMPT_SHOWN_AFTER_MODULE1, {
          trigger: 'module_1_completion',
          guestId: currentUser?.id,
        });
      }, 3000);

      return;
    }

    // Calculate new state values
    const newCompletedModules = [...new Set([...completedModules, currentModule])];
    let newUnlockedModules = [...unlockedModules];
    if (
      currentModule < modules.length - 1 &&
      !unlockedModules.includes(currentModule + 1)
    ) {
      newUnlockedModules = [...unlockedModules, currentModule + 1];
    }

    if (!isGuest && currentUser?.id) {
      try {
        await submitModuleScore(currentUser.id, {
          moduleId: currentModule,
          moduleName: modules[currentModule].title,
          score: finalModuleScore,
          perfectCompletion: perfectModule,
          completionTime: timeTaken,
          questionsAnswered: moduleQuestionKeys.length,
          questionsCorrect,
        });
      } catch (error) {
        console.error('Error submitting module score:', error);
      }
    }

    // Update state
    setCompletedModules(newCompletedModules);
    setUnlockedModules(newUnlockedModules);
    setShowModuleComplete(true);

    // Calculate next module for persistence
    const nextModule =
      newUnlockedModules.includes(currentModule + 1) || currentModule + 1 < modules.length
        ? currentModule + 1
        : currentModule;
    const targetModule = newUnlockedModules.includes(nextModule)
      ? nextModule
      : Math.max(...newUnlockedModules);

    // Save progress with overrides including the NEXT module
    await saveProgress({
      completedModules: newCompletedModules,
      unlockedModules: newUnlockedModules,
      perfectModulesCount: perfectModule ? perfectModulesCount + 1 : perfectModulesCount,
      moduleCompletionTimes: updatedModuleCompletionTimes,
      currentModule: targetModule,
      currentQuestion: 0
    });

    await persistLastLocation({ moduleId: targetModule, questionIndex: 0 });
  };

  const handleAnswer = (answerIndex) => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (answeredQuestions[questionKey]?.answered) return;

    if (timerState === 'idle' && currentQuestion === 0) {
      startTimer();
    }

    setSelectedAnswer(answerIndex);
    const currentModuleQuestions = getShuffledQuestions(currentModule);
    const currentQuestionData = currentModuleQuestions[currentQuestion];
    const correct = answerIndex === currentQuestionData.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    const updatedAnsweredQuestions = {
      ...answeredQuestions,
      [questionKey]: {
        answered: true,
        selectedAnswer: answerIndex,
        wasCorrect: correct,
      },
    };
    setAnsweredQuestions(updatedAnsweredQuestions);

    // Calculate new stats for immediate saving
    let newScore = score;
    let newStreak = streak;
    let newCombo = combo;
    let newXp = xp;
    let newLevel = level;

    if (correct) {
      const points = 10 * (combo + 1);
      newScore = score + points;
      newStreak = streak + 1;
      newCombo = combo + 1;
      newXp = xp + 25;

      setScore(newScore);
      setModuleScore((prev) => prev + points);
      setStreak(newStreak);
      setCombo(newCombo);
      
      // Level up logic
      if (newXp >= level * 100) {
        newLevel = level + 1;
        newXp = newXp % (level * 100);
        setLevel(newLevel);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 7000);
      }
      setXp(newXp);
    } else {
      newStreak = 0;
      newCombo = 0;
      setStreak(0);
      setCombo(0);
      setPerfectModule(false);
    }

    // Save progress with the new calculated values
    saveProgress({
      answeredQuestions: updatedAnsweredQuestions,
      score: newScore,
      streak: newStreak,
      combo: newCombo,
      xp: newXp,
      level: newLevel
    });

    const totalQuestions = getTotalQuestions();
    const isLastQuestion = currentQuestion === totalQuestions - 1;

    if (isLastQuestion) {
      stopTimer();
    }

    setTimeout(async () => {
      if (currentQuestion < currentModuleQuestions.length - 1) {
        const nextQ = currentQuestion + 1;
        setCurrentQuestion(nextQ);
        persistLastLocation({ moduleId: currentModule, questionIndex: nextQ });
        setShowFeedback(false);
        setSelectedAnswer(null);
      } else {
        await handleModuleCompletion(correct);
      }
    }, 7000);
  };

  const startNewModule = (moduleIndex) => {
    if (
      isGuest &&
      (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true) &&
      !(GAME_CONFIG?.MODULE_ACCESS?.GUEST_ACCESSIBLE_MODULES ?? [0]).includes(moduleIndex)
    ) {
      setShowAuthModal(true);
      trackGuestEvent('auth_modal_triggered', {
        trigger: 'module_access_attempt',
        moduleIndex,
        guestId: currentUser?.id,
      });
      return;
    }

    const updatedAnsweredQuestions = { ...answeredQuestions };
    const moduleQuestionCount = modules[moduleIndex]?.questions?.length || 0;

    for (let i = 0; i < moduleQuestionCount; i += 1) {
      delete updatedAnsweredQuestions[`${moduleIndex}-${i}`];
    }

    const originalQuestions = modules[moduleIndex].questions;
    const shuffled = shuffleArray(
      originalQuestions.map((q, index) => ({
        ...q,
        originalIndex: index,
      })),
    );
    setShuffledQuestions((prev) => ({
      ...prev,
      [moduleIndex]: shuffled,
    }));

    setAnsweredQuestions(updatedAnsweredQuestions);
    setCurrentModule(moduleIndex);
    setCurrentQuestion(0);
    setModuleScore(0);
    setPerfectModule(true);
    setPowerUps((prev) => refreshPowerUps(prev));
    setShowFeedback(false);
    setSelectedAnswer(null);

    resetTimer();

    persistLastLocation({ moduleId: moduleIndex, questionIndex: 0 });

    if (isGuest) {
      trackGuestEvent('module_started', {
        moduleIndex,
        guestId: currentUser?.id,
      });
    }
  };

  const handleLockedModuleSelect = (moduleIndex) => {
    setShowAuthModal(true);
    trackGuestEvent('auth_modal_triggered', {
      trigger: 'module_click',
      moduleIndex,
    });
  };

  return {
    handleAnswer,
    startNewModule,
    handleLockedModuleSelect,
    getShuffledQuestions,
    getTotalQuestions,
    correctCount,
    wrongCount,
  };
};

export default useQuestionFlow;
