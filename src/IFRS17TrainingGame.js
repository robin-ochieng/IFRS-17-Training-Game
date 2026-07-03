// IFRS17TrainingGame.js - Updated with deferred authentication
import React, { useState, useCallback } from 'react';
import { modules } from './data/IFRS17Modules';
import {
  INITIAL_POWER_UPS,
  canUsePowerUp,
  consumePowerUp,
} from './modules/powerUps';
import { pickEliminatedOptions, getMissedQuestions } from './modules/questionUtils';
import AuthenticationModal from './components/AuthenticationModal';
import LeaderboardModal from './modules/LeaderboardModal';
import GameGuideFAQ from './components/GameGuideFAQ';
import PlayerHeader from './components/layout/PlayerHeader';
import StatsDashboard from './components/layout/StatsDashboard';
import LeaderboardActions from './components/layout/LeaderboardActions';
import ModulesGrid from './components/layout/ModulesGrid';
import GameFooter from './components/layout/GameFooter';
import SavingIndicator from './components/layout/SavingIndicator';
import AchievementToast from './components/game/AchievementToast';
import LevelUpToast from './components/game/LevelUpToast';
import ModuleCompleteModal from './components/game/ModuleCompleteModal';
import AllModulesCompleteBanner from './components/game/AllModulesCompleteBanner';
import AchievementsList from './components/game/AchievementsList';
import QuestionPanel from './components/game/QuestionPanel/QuestionPanel';
import ReviewPanel from './components/game/ReviewPanel';
import ChatbotIcon from './components/ChatbotIcon';
import ChatPanel from './components/ChatPanel';
import ResetConfirmModal from './components/ResetConfirmModal';
import NotificationModal from './components/NotificationModal';
import useModuleTimer from './hooks/useModuleTimer';
import useAchievements from './hooks/useAchievements';

// Import new Supabase service functions
import useGamePersistence from './hooks/useGamePersistence';
import useQuestionFlow from './hooks/useQuestionFlow';
import useGameUIActions from './hooks/useGameUIActions';

const TOTAL_MODULES = modules.length;


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
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState(INITIAL_POWER_UPS);
  const [completedModules, setCompletedModules] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [moduleScore, setModuleScore] = useState(0);
  const [perfectModule, setPerfectModule] = useState(true);
  const [perfectModulesCount, setPerfectModulesCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const {
    achievements,
    showAchievement,
    restoreAchievements,
    resetAchievements,
    getAchievementDisplayData,
  } = useAchievements({
    score,
    streak,
    level,
    combo,
    completedModules,
    perfectModulesCount,
    currentUser,
  });
  const [completedModuleScore, setCompletedModuleScore] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState({});
  const [moduleCompletionTimes, setModuleCompletionTimes] = useState({});
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isBootingResume, setIsBootingResume] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState({}); // { "module-question": [i, j] }
  const [hintUsedQuestions, setHintUsedQuestions] = useState({}); // { "module-question": true }
  const [reviewQuestions, setReviewQuestions] = useState(null);
  const [pendingChatMessage, setPendingChatMessage] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const isCurrentModuleCompleted = completedModules.includes(currentModule);

  // Handler for notifications from hooks
  const handleNotification = useCallback(({ type, title, message }) => {
    setNotification({ isOpen: true, type, title, message });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  const navigateToModule = useCallback((moduleIndex, questionIndex = 0) => {
    if (moduleIndex < 0 || moduleIndex >= TOTAL_MODULES) return;
    setCurrentModule(moduleIndex);
    setCurrentQuestion(questionIndex);
    setShowFeedback(false);
    setSelectedAnswer(null);
  }, []);

  const {
    timerState,
    currentTime,
    elapsedTime,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  } = useModuleTimer({
    currentModule,
    currentUser,
    isModuleCompleted: isCurrentModuleCompleted,
  });

  const achievementState = {
    achievements,
    restoreAchievements,
    resetAchievements,
  };

  const gameState = {
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
  };

  const uiState = {
    setPendingModule1Completion,
    setShowAuthModal,
  };

  const timers = { resetTimer };

  const userState = {
    currentUser,
    setCurrentUser,
    isGuest,
    setIsGuest,
    isSavingProgress,
    setIsSavingProgress,
    isBootingResume,
    setIsBootingResume,
  };

  const {
    persistLastLocation,
    saveProgress,
    resetProgress,
  } = useGamePersistence({
    modules,
    propsUser,
    achievementState,
    gameState,
    uiState,
    timers,
    userState,
    navigateToModule,
  });

  const {
    handleAnswer,
    startNewModule,
    handleLockedModuleSelect,
    getShuffledQuestions,
    correctCount,
    wrongCount,
  } = useQuestionFlow({
    modules,
    userState: { isGuest, currentUser },
    gameState,
    achievementsState: { achievements },
    persistenceApi: { saveProgress, persistLastLocation },
    timerApi: {
      timerState,
      startTimer,
      stopTimer,
      resetTimer,
      currentTime,
      elapsedTime,
    },
    uiState: { setShowAuthModal, setPendingModule1Completion },
  });

  const missedInCurrentModule = getMissedQuestions(
    shuffledQuestions[currentModule] || [],
    answeredQuestions,
    currentModule,
  );

  const HINT_MESSAGE = 'Give me a hint for this question, without revealing the answer.';

  const handleUseEliminate = useCallback(() => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (!canUsePowerUp(powerUps, 'eliminate')) return;
    if (eliminatedOptions[questionKey] || answeredQuestions[questionKey]?.answered) return;
    const questionData = getShuffledQuestions(currentModule)[currentQuestion];
    if (!questionData) return;
    setEliminatedOptions((prev) => ({
      ...prev,
      [questionKey]: pickEliminatedOptions(questionData),
    }));
    setPowerUps((prev) => consumePowerUp(prev, 'eliminate'));
  }, [currentModule, currentQuestion, powerUps, eliminatedOptions, answeredQuestions, getShuffledQuestions]);

  const handleUseHint = useCallback(() => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (!canUsePowerUp(powerUps, 'hint')) return;
    if (hintUsedQuestions[questionKey] || answeredQuestions[questionKey]?.answered) return;
    setHintUsedQuestions((prev) => ({ ...prev, [questionKey]: true }));
    setPowerUps((prev) => consumePowerUp(prev, 'hint'));
    setPendingChatMessage({ text: HINT_MESSAGE, id: Date.now() });
    setIsChatOpen(true);
  }, [currentModule, currentQuestion, powerUps, hintUsedQuestions, answeredQuestions]);

  const launchModule = useCallback((moduleIndex) => {
    setEliminatedOptions({});
    setHintUsedQuestions({});
    setReviewQuestions(null);
    startNewModule(moduleIndex);
  }, [startNewModule]);

  const {
    handleSignIn,
    handleSignUp,
    handleAuthModalClose,
    handleLogout,
    handleManualSync,
    showGuide,
    setShowGuide,
    showLeaderboard,
    setShowLeaderboard,
  } = useGameUIActions({
    onShowAuth,
    onLogout,
    userState: { isGuest, currentUser },
    authUiState: { setShowAuthModal, setIsAuthenticating },
    moduleCompletionState: {
      pendingModule1Completion,
      setPendingModule1Completion,
      setShowModuleComplete,
      completedModules,
      setCompletedModules,
    },
    progressState: {
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
    },
    achievements,
    saveProgress,
    onNotification: handleNotification,
  });

  // Don't render until currentUser is loaded
  if (!currentUser || isBootingResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">{currentUser ? 'Resuming your session…' : 'Loading user data...'}</div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen p-4 bg-black/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <PlayerHeader
          currentUser={currentUser}
          isGuest={isGuest}
          onShowGuide={() => setShowGuide(true)}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onLogout={handleLogout}
        />

        {/* Title */}
        <div className="mb-6 relative">
          <img 
            src="/kenbright-logo.png" 
            alt="Kenbright Logo" 
            className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 h-10 md:h-16 lg:h-20 w-auto z-10"
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center py-2">
            IFRS 17 Quest and Concur: Regulatory Training Game
          </h1>
        </div>

        {/* Stats Dashboard */}
        <StatsDashboard
          score={score}
          streak={streak}
          level={level}
          xp={xp}
          combo={combo}
        />

        {/* Leaderboard Actions */}
        <LeaderboardActions
          isGuest={isGuest}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onSyncProgress={handleManualSync}
        />

        {/* Modules Grid */}
        <ModulesGrid
          modules={modules}
          currentModule={currentModule}
          completedModules={completedModules}
          unlockedModules={unlockedModules}
          isGuest={isGuest}
          showModuleComplete={showModuleComplete}
          onModuleSelect={launchModule}
          onLockedModuleSelect={handleLockedModuleSelect}
        />

        {/* Achievement Notification */}
        <AchievementToast achievement={showAchievement} />

        {/* Level Up Notification */}
        {showLevelUp && <LevelUpToast level={level} />}

        {/* Module Complete Modal */}
        <ModuleCompleteModal
          isOpen={showModuleComplete}
          moduleTitle={modules[currentModule]?.title}
          score={completedModuleScore}
          perfectModule={perfectModule}
          completionTime={elapsedTime}
          hasNextModule={currentModule < modules.length - 1}
          missedCount={missedInCurrentModule.length}
          onReviewMissed={() => {
            setShowModuleComplete(false);
            setReviewQuestions(missedInCurrentModule);
          }}
          onStartNext={() => {
            setShowModuleComplete(false);
            setTimeout(() => {
              launchModule(currentModule + 1);
            }, 100);
          }}
          onClose={() => setShowModuleComplete(false)}
        />

        {/* Question Display */}
        {modules[currentModule] && completedModules.length < modules.length &&
         !completedModules.includes(currentModule) && (
          <QuestionPanel
            moduleTitle={modules[currentModule]?.title}
            questions={getShuffledQuestions(currentModule)}
            currentModule={currentModule}
            currentQuestionIndex={currentQuestion}
            timerState={timerState}
            currentTime={currentTime}
            formatTime={formatTime}
            correctCount={correctCount}
            wrongCount={wrongCount}
            answeredQuestions={answeredQuestions}
            showFeedback={showFeedback}
            selectedAnswer={selectedAnswer}
            isCorrect={isCorrect}
            combo={combo}
            streak={streak}
            onAnswer={handleAnswer}
            onAskHelp={() => setIsChatOpen(true)}
            powerUps={powerUps}
            eliminatedOptions={eliminatedOptions[`${currentModule}-${currentQuestion}`]}
            hintUsed={!!hintUsedQuestions[`${currentModule}-${currentQuestion}`]}
            onUseEliminate={handleUseEliminate}
            onUseHint={handleUseHint}
          />
        )}

        {/* Review of missed questions (post module completion) */}
        {reviewQuestions && (
          <ReviewPanel
            questions={reviewQuestions}
            moduleTitle={modules[currentModule]?.title}
            onExit={() => {
              setReviewQuestions(null);
              setShowModuleComplete(true);
            }}
          />
        )}

        {/* All Modules Complete */}
        {completedModules.length === modules.length && (
          <AllModulesCompleteBanner
            score={score}
            level={level}
            achievementsCount={achievements.length}
          />
        )}

        {/* Achievements Display */}
        {achievements.length > 0 && (
          <AchievementsList
            achievements={achievements.map(getAchievementDisplayData)}
          />
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
            onClick={() => setShowResetModal(true)}
            className="bg-gray-800/50 hover:bg-red-600/30 border border-gray-600 hover:border-red-500 text-gray-400 hover:text-red-400 px-6 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            ⚠️ Reset All Progress
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        <ResetConfirmModal
          isOpen={showResetModal}
          onConfirm={() => {
            setEliminatedOptions({});
            setHintUsedQuestions({});
            setPendingChatMessage(null);
            resetProgress();
            setShowResetModal(false);
          }}
          onCancel={() => setShowResetModal(false)}
        />

        {/* Notification Modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={closeNotification}
          title={notification.title}
          message={notification.message}
          variant={notification.type}
        />

      <div className="mt-6 mb-4">
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
          <div className="flex flex-col items-center justify-center space-y-4">
            <span className="text-sm text-gray-300 font-medium tracking-wide">Developed for</span>

            {/* Logos Row */}
            <div className="flex flex-row items-center justify-center gap-6">

              {/* IRA Logo */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/30 group-hover:ring-purple-400/40 transition-all duration-500 pointer-events-none"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 transition-transform duration-300 transform hover:scale-105 border border-white/20 shadow-md">
                  <img 
                    src="/IRA logo.png" 
                    alt="IRA Logo" 
                    className="h-14 w-auto object-contain brightness-110 contrast-125 drop-shadow-lg transition-all duration-300 hover:brightness-125"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>

              {/* NBFIRA Logo */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/30 group-hover:ring-purple-400/40 transition-all duration-500 pointer-events-none"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 transition-transform duration-300 transform hover:scale-105 border border-white/20 shadow-md">
                  <img 
                    src="/Nbfira_logo.png" 
                    alt="NBFIRA Logo" 
                    className="h-14 w-auto object-contain brightness-110 contrast-125 drop-shadow-lg transition-all duration-300 hover:brightness-125"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

        {/* Saving Indicator */}
        <SavingIndicator isSaving={isSavingProgress} />

  {/* Removed the "Developed for" section as requested */}



        <GameFooter onShowGuide={() => setShowGuide(true)} />

        {/* Authentication Modal */}
  <AuthenticationModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          isLoading={isAuthenticating}
        />
  <GameGuideFAQ isOpen={showGuide} onClose={() => setShowGuide(false)} />
      </div>
    </div>
    
    {/* Chatbot - Rendered outside main container for proper fixed positioning */}
    <ChatbotIcon 
      onClick={() => setIsChatOpen(!isChatOpen)}
      isOpen={isChatOpen}
    />
    
    <ChatPanel 
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
      userName={currentUser?.name}
      gameContext={{
        currentModuleIndex: currentModule,
        currentModuleTitle: modules[currentModule]?.title,
        currentModuleIcon: modules[currentModule]?.icon,
        currentQuestionIndex: currentQuestion,
        currentQuestionText: modules[currentModule]?.questions[currentQuestion]?.question,
        currentQuestionOptions: modules[currentModule]?.questions[currentQuestion]?.options,
        currentQuestionExplanation: modules[currentModule]?.questions[currentQuestion]?.explanation,
        isModuleCompleted: completedModules.includes(currentModule),
        completedModules: completedModules.map(idx => modules[idx]?.title).filter(Boolean),
        userLevel: level,
        totalScore: score
      }}
      pendingMessage={pendingChatMessage}
      onPendingMessageConsumed={() => setPendingChatMessage(null)}
    />
  </>
  );
};

export default IFRS17TrainingGame;