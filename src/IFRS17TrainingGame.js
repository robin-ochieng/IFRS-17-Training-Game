//src/IFRS17TrainingGame.js
// IFRS 17 Training Game Component

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Lock, CheckCircle, XCircle, TrendingUp, Award } from 'lucide-react';
import { modules } from './data/IFRS17Modules';
import { achievementsList, getNewAchievements, createAchievementStats } from './modules/achievements';
import { INITIAL_POWER_UPS, consumePowerUp, refreshPowerUps, canUsePowerUp, getPowerUpInfo } from './modules/powerUps';
import { saveGameState, loadGameState, hasSavedGame, clearGameState } from './modules/storageService';
import { getCurrentUser, saveUser } from './modules/userProfile';
import { submitToLeaderboard, getLeaderboard, submitModuleScore,  getModuleLeaderboard, getUserModuleRank} from './modules/supabaseLeaderboard';

// Add onLogout as a prop and remove the problematic import
const IFRS17TrainingGame = ({ onLogout }) => {
  const [currentUser, setCurrentUser] = useState(null);
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
  const [moduleScores, setModuleScores] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState('overall'); // 'overall' or module index
  const [moduleStartTime, setModuleStartTime] = useState(null);
   
  // Load current user on component mount
  // Load current user on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          // Fallback user if no user is found
          setCurrentUser({
            id: 'default-user',
            name: 'Demo User',
            email: 'demo@example.com',
            organization: 'Demo Organization',
            avatar: 'D',
            country: 'Kenya' 
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Use fallback user on error
        setCurrentUser({
          id: 'default-user',
          name: 'Demo User',
          email: 'demo@example.com',
          organization: 'Demo Organization',
          avatar: 'D',
          country: 'Kenya' 
        });
      }
    };
    
    loadUser();
  }, []);

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answerIndex) => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (answeredQuestions[questionKey]?.answered) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === modules[currentModule].questions[currentQuestion].correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setAnsweredQuestions({ 
      ...answeredQuestions, 
      [questionKey]: { answered: true, selectedAnswer: answerIndex, wasCorrect: correct } 
    });

    if (correct) {
      const points = 10 * (combo + 1);
      setScore(score + points);
      setModuleScore(moduleScore + points);
      setStreak(streak + 1);
      setCombo(combo + 1);
      setXp(xp + 25);
      
      if ((streak + 1) % 5 === 0) {
        console.log(`🔥 ${streak + 1} STREAK! Keep going!`);
      }
      
      if (combo >= 5) {
        console.log(`💥 MEGA COMBO x${combo + 1}!`);
      }
      
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

    setTimeout(async () => {
      if (currentQuestion < modules[currentModule].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(false);
        setSelectedAnswer(null);
      } else {
        if (perfectModule) {
          setPerfectModulesCount(prev => prev + 1);
        }        

        // Save module score
        setModuleScores(prev => ({
          ...prev,
          [currentModule]: moduleScore
        }));       

        setShowModuleComplete(true);
        setCompletedModules([...completedModules, currentModule]);
        saveProgress();

        const endTime = new Date();
        const timeTaken = moduleStartTime ? Math.floor((endTime - moduleStartTime) / 1000) : null;
        await submitModuleScore({
          userId: currentUser.id,
          moduleId: currentModule,
          moduleName: modules[currentModule].title,
          userName: currentUser.name,
          userEmail: currentUser.email,
          organization: currentUser.organization,
          avatar: currentUser.avatar,
          country: currentUser.country || 'Unknown',
          score: moduleScore,
          perfectCompletion: perfectModule,
          completionTime: timeTaken // in seconds
        });        

        // Submit to leaderboard if all modules completed
        if (completedModules.length === modules.length - 1) {
          submitUserScore();
        }       
        
        if (currentModule < modules.length - 1 && !unlockedModules.includes(currentModule + 1)) {
          setUnlockedModules([...unlockedModules, currentModule + 1]);
        }
      }
    }, 7000);
  };

  const handlePowerUp = (type) => {
    if (!canUsePowerUp(powerUps, type)) return;
    
    setPowerUps(consumePowerUp(powerUps, type));
    
    switch(type) {
      case 'hint':
        console.log('Hint: Look for the most comprehensive answer that aligns with IFRS 17 principles');
        break;
      case 'eliminate':
        console.log('Eliminate: Two incorrect answers have been removed');
        break;
      case 'skip':
        if (currentQuestion < modules[currentModule].questions.length - 1) {
          const questionKey = `${currentModule}-${currentQuestion}`;
          setAnsweredQuestions({ 
            ...answeredQuestions, 
            [questionKey]: { answered: true, selectedAnswer: null, wasCorrect: false } 
          });
          setPerfectModule(false);
          setCurrentQuestion(currentQuestion + 1);
        }
        break;
      default:
        break;
    }
  };

  const checkAchievementConditions = () => {
    const stats = createAchievementStats({
      score,
      streak,
      level,
      completedModules,
      perfectModulesCount,
      combo
    });
    
    const newAchievements = getNewAchievements(achievements, stats);
    
    if (newAchievements.length > 0) {
      const firstNewAchievement = newAchievements[0];
      setAchievements(prev => [...prev, firstNewAchievement]);
      setShowAchievement(firstNewAchievement);
      setTimeout(() => setShowAchievement(null), 7000);
    }
  };

  const startNewModule = (moduleIndex) => {
    // Clear any previously answered questions for this module
    const updatedAnsweredQuestions = { ...answeredQuestions };
    const moduleQuestionCount = modules[moduleIndex]?.questions?.length || 0;
    
    // Remove any existing answers for this module
    for (let i = 0; i < moduleQuestionCount; i++) {
      delete updatedAnsweredQuestions[`${moduleIndex}-${i}`];
    }
    
    setAnsweredQuestions(updatedAnsweredQuestions);
    setCurrentModule(moduleIndex);
    setCurrentQuestion(0);
    setModuleScore(0);
    setPerfectModule(true);
    setPowerUps(prev => refreshPowerUps(prev));
    setShowFeedback(false);
    setSelectedAnswer(null);
    setModuleStartTime(new Date());
  };

  const submitUserScore = async () => {
    const userData = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      organization: currentUser.organization,
      avatar: currentUser.avatar,
      country: currentUser.country || 'Unknown',
      score: score,
      level: level,
      achievements: achievements.length,
      modulesCompleted: completedModules.length,
      perfectModules: perfectModulesCount
    };
    
    const result = await submitToLeaderboard(userData);
    
    if (result.success) {
      console.log('Score submitted successfully!');
    }
  };

  const loadLeaderboardData = async (view = 'overall') => {
    setIsLoadingLeaderboard(true);
    
    try {
      let leaderboard;

      if (view === 'overall') {
        // Fetch overall leaderboard from Supabase
        leaderboard = await getLeaderboard();
      } else {
        // Fetch module-specific leaderboard
        leaderboard = await getModuleLeaderboard(view);
      }      

      // Add rank and mark current user
      const rankedLeaderboard = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1,
        isCurrentUser: user.user_id === currentUser.id,
        // Map database fields to component fields
        name: user.user_name,
        id: user.user_id
      }));
      
      setLeaderboardData(rankedLeaderboard);
      setLeaderboardView(view);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };  

  useEffect(() => {
    checkAchievementConditions();
  }, [score, streak, level, combo, completedModules]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (answeredQuestions && Object.keys(answeredQuestions).length > 0) {
      saveProgress();
    }
  }, [answeredQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProgress = () => {
    const success = saveGameState({
      currentModule,
      currentQuestion,
      score,
      level,
      xp,
      completedModules,
      answeredQuestions,
      achievements,
      powerUps,
      streak,
      combo,
      perfectModulesCount,
      moduleStartTime: currentModule !== null ? new Date().toISOString() : null 
    });
    
    if (!success) {
      console.error('Failed to save progress');
    }
  };

  const resetProgress = () => {
    if (window.confirm('⚠️ Are you sure you want to reset all progress?\n\nThis will delete:\n• Your score and level\n• All completed modules\n• All achievements\n• All answered questions\n\nThis action cannot be undone!')) {
      clearGameState();
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
      setShowLevelUp(false);
      setShowAchievement(null);
      setModuleStartTime(null);
    }
  };

  // Load progress on mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
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

      // If we're in the middle of a module, set the start time
      if (savedState.currentModule !== null && !savedState.completedModules?.includes(savedState.currentModule)) {
        setModuleStartTime(new Date());
      }
      // Restore achievements      
      const restoredAchievements = achievementsList.filter(a => 
        savedState.achievements?.includes(a.id)
      );
      setAchievements(restoredAchievements);
    }
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.log('Logout function not provided');
    }
  };

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
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser.avatar}
            </div>
            <div>
              <p className="text-white font-semibold text-sm md:text-base">{currentUser.name}</p>
              <p className="text-gray-400 text-xs">{currentUser.organization}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Switch User
          </button>
        </div>
        <div className="mb-6 relative">
          <img 
            src="/kenbright-logo.png" 
            alt="Kenbright Logo" 
            className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 h-10 md:h-12 lg:h-16 w-auto z-10"
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center py-2">
            IFRS 17 Master: Regulatory Training Game
          </h1>
        </div>
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Score</p>
                <p className="text-lg md:text-2xl font-bold text-white">{score.toLocaleString()}</p>
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
          {/* Add Leaderboard Button - ADD THIS SECTION */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                loadLeaderboardData('overall');
                setShowLeaderboard(true);
              }}
            className="group relative bg-black/30 backdrop-blur-sm border border-purple-400/30 hover:border-purple-400 text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
          >
            <Trophy className="w-4 h-4 text-purple-400 group-hover:text-yellow-400 transition-colors" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
              View Leaderboard
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
            </button>
          </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            IFRS 17 Training Modules 
            <span className="text-sm md:text-lg font-normal text-gray-300 ml-2 md:ml-4">
              ({completedModules.length}/{modules.length} completed)
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {modules.map((module, index) => (
              <button
                key={index}
                onClick={() => {
                  if (unlockedModules.includes(index) && !completedModules.includes(index) && index !== currentModule) {
                    startNewModule(index);
                  }
                }}
                disabled={!unlockedModules.includes(index) || completedModules.includes(index) || (index === currentModule && !showModuleComplete)}
                className={`relative p-3 md:p-4 rounded-xl transition-all duration-300 ${
                  completedModules.includes(index)
                    ? 'bg-gradient-to-br from-green-600 to-green-700 transform cursor-not-allowed shadow-lg ring-2 ring-green-400'
                    : index === currentModule && !completedModules.includes(index)
                    ? `bg-gradient-to-br ${module.color} transform scale-105 shadow-xl ring-2 ring-purple-400`
                    : unlockedModules.includes(index)
                    ? `bg-gradient-to-br ${module.color} hover:scale-105 transform cursor-pointer shadow-lg`
                    : 'bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
              >
                {completedModules.includes(index) && (
                  <CheckCircle className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-6 md:h-6 text-white" />
                )}
                {!unlockedModules.includes(index) && (
                  <Lock className="absolute top-1 right-1 md:top-2 md:right-2 w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                )}
                <div className="text-2xl md:text-3xl mb-1 md:mb-2">{module.icon}</div>
                <p className="text-white text-xs md:text-sm font-semibold">{module.title}</p>
                {completedModules.includes(index) && (
                  <p className="text-xs text-green-200 mt-1">Completed!</p>
                )}
                {index === currentModule && !completedModules.includes(index) && (
                  <p className="text-xs text-yellow-200 mt-1">In Progress</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {showAchievement && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-full text-lg font-bold animate-pulse flex items-center gap-3">
              <span className="text-2xl">{showAchievement.icon}</span>
              Achievement Unlocked: {showAchievement.name}!
            </div>
          </div>
        )}

        {showLevelUp && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-purple-600 text-white px-8 py-4 rounded-full text-2xl font-bold animate-pulse">
              ⭐ LEVEL UP! Level {level} ⭐
            </div>
          </div>
        )}

        {showModuleComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl text-center transform scale-110 animate-pulse">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-4">Module Complete! 🎉</h2>
              <p className="text-2xl text-white mb-2">{modules[currentModule].title}</p>
              <p className="text-xl text-yellow-300 mb-4">
                Score: {moduleScore} points
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
                  // Small delay to ensure modal closes before starting new module
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

        {modules[currentModule] && completedModules.length < modules.length && !completedModules.includes(currentModule) && (
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-lg md:text-xl font-bold text-white">
                  {modules[currentModule].title} - Question {currentQuestion + 1}/{modules[currentModule].questions.length}
                </h3>
                <div className="flex gap-2">
                  {Object.entries(powerUps).map(([type, count]) => (
                    <button
                      key={type}
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
                  ))}
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / modules[currentModule].questions.length) * 100}%` }}
                />
              </div>
              
              <div className="flex gap-1 md:gap-2 justify-center mb-6 flex-wrap">
                {modules[currentModule].questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                      answeredQuestions[`${currentModule}-${idx}`]?.answered
                        ? answeredQuestions[`${currentModule}-${idx}`]?.wasCorrect ? 'bg-green-400' : 'bg-red-400'
                        : idx === currentQuestion
                        ? 'bg-purple-400 ring-2 ring-purple-300'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-base md:text-xl text-white mb-6">
                {modules[currentModule].questions[currentQuestion].question}
              </p>
              
              {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && !showFeedback && (
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
              {modules[currentModule].questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && !answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && handleAnswer(index)}
                  disabled={showFeedback || answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 text-sm md:text-base ${
                    answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered
                      ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index
                        ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect
                          ? 'bg-green-500/20 border-green-400 text-green-400'
                          : 'bg-red-500/20 border-red-400 text-red-400'
                        : index === modules[currentModule].questions[currentQuestion].correct
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                      : showFeedback && selectedAnswer === index
                      ? isCorrect
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-red-500/20 border-red-400 text-red-400'
                      : showFeedback && index === modules[currentModule].questions[currentQuestion].correct
                      ? 'bg-green-500/20 border-green-400 text-green-400'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showFeedback && selectedAnswer === index && (
                      isCorrect ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                    {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && (
                      answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index ? (
                        answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect ? 
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" /> : 
                          <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                      ) : index === modules[currentModule].questions[currentQuestion].correct ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                      ) : null
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`mt-6 p-4 rounded-xl ${
                isCorrect ? 'bg-green-500/20 border border-green-400' : 'bg-blue-500/20 border border-blue-400'
              }`}>
                <p className={`${isCorrect ? 'text-green-400' : 'text-blue-400'} font-semibold mb-2 text-sm md:text-base`}>
                  {isCorrect ? `🎉 Excellent! +${10 * (combo)} points` : 'Not quite right, but here\'s the explanation:'}
                  {isCorrect && combo >= 3 && ' 🔥 COMBO!'}
                  {isCorrect && streak >= 5 && ' ⚡ STREAK!'}
                </p>
                <p className="text-gray-300 text-sm md:text-base">
                  {modules[currentModule].questions[currentQuestion].explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {completedModules.length === modules.length && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 mb-6 border border-yellow-400/50 text-center">
            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">🎊 Congratulations! 🎊</h2>
            <p className="text-xl text-white mb-2">You've completed all IFRS 17 Training Modules!</p>
            <p className="text-lg text-yellow-300">Final Score: {score.toLocaleString()} points</p>
            <p className="text-lg text-purple-300">Level: {level} | Achievements: {achievements.length}</p>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Achievements Unlocked</h3>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="text-white font-medium">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/10">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {leaderboardView === 'overall' ? 'Grand Leaderboard' : `${modules[leaderboardView]?.title} Leaderboard`}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Leaderboard Tabs */}
                <div className="mb-6 overflow-x-auto">
                  <div className="flex gap-2 min-w-max pb-2">
                    <button
                      onClick={() => loadLeaderboardData('overall')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        leaderboardView === 'overall'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      🏆 Grand Total
                    </button>
                    <div className="w-px bg-white/20 mx-2"></div>
                    {modules.map((module, index) => (
                      <button
                        key={index}
                        onClick={() => loadLeaderboardData(index)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                          leaderboardView === index
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <span className="text-lg">{module.icon}</span>
                        <span className="hidden md:inline">{module.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading State */}
                {isLoadingLeaderboard ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-white text-lg">Loading leaderboard...</div>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      {leaderboardView === 'overall' 
                        ? 'No scores yet. Be the first to complete the training!'
                        : 'No one has completed this module yet. Be the first!'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Current User Position */}
                    {leaderboardData.find(user => user.isCurrentUser) && (
                      <div className="bg-purple-600/20 border border-purple-400/50 rounded-lg p-4 mb-6">
                        <p className="text-purple-300 text-sm mb-1">Your Position</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-white">
                              #{leaderboardData.find(user => user.isCurrentUser).rank}
                            </span>
                            <span className="text-white font-semibold">{currentUser.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-yellow-400 font-bold">
                              {leaderboardView === 'overall' 
                                ? score.toLocaleString() 
                                : (leaderboardData.find(user => user.isCurrentUser)?.score || 0).toLocaleString()} points
                            </span>
                            {leaderboardView !== 'overall' && leaderboardData.find(user => user.isCurrentUser)?.perfect_completion && (
                              <p className="text-xs text-green-400 mt-1">⭐ Perfect Score</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Leaderboard Table */}
                    <div className="overflow-y-auto max-h-[45vh]">
                      <div className="space-y-2">
                        {leaderboardData.map((user, index) => (
                          <div
                            key={user.id}
                            className={`rounded-lg p-4 transition-all ${
                              user.isCurrentUser
                                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/50'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Rank Badge */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                  user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                                  user.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                                  user.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                  'bg-gray-700 text-gray-300'
                                }`}>
                                  {user.rank <= 3 ? '🏆' : user.rank}
                                </div>
                                
                              {/* User Info */}
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                  user.isCurrentUser ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                }`}>
                                  {user.avatar}
                                </div>
                                <div>
                                  <p className="text-white font-semibold flex items-center gap-2">
                                    {user.name}
                                    {user.isCurrentUser && <span className="text-xs bg-purple-600 px-2 py-1 rounded-full">You</span>}
                                    {leaderboardView !== 'overall' && user.perfect_completion && (
                                      <span className="text-xs bg-green-600 px-2 py-1 rounded-full">Perfect</span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-3 text-sm">
                                    <p className="text-gray-400">{user.organization}</p>
                                    {user.country && (
                                      <>
                                        <span className="text-gray-600">•</span>
                                        <p className="text-gray-400">🌍 {user.country}</p>
                                      </>
                                    )}
                                  </div>
                                </div>
                               </div> 
                              </div>                              
                              {/* Stats */}
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-yellow-400 font-bold text-lg">{user.score.toLocaleString()}</p>
                                  <p className="text-gray-400 text-xs">points</p>
                                </div>
                                {leaderboardView !== 'overall' && user.completion_time && (
                                  <div className="text-center">
                                    <p className="text-cyan-400 font-semibold">{formatTime(user.completion_time)}</p>
                                    <p className="text-gray-500 text-xs">Time</p>
                                  </div>
                                )}
                                {leaderboardView === 'overall' && (
                                  <div className="hidden md:flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="text-purple-400 font-semibold">{user.level}</p>
                                      <p className="text-gray-500 text-xs">Level</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-green-400 font-semibold">{user.achievements}</p>
                                      <p className="text-gray-500 text-xs">Awards</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">Total Players</p>
                        <p className="text-2xl font-bold text-white">{leaderboardData.length}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">Your Percentile</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {leaderboardData.find(u => u.isCurrentUser) 
                            ? `Top ${Math.round((leaderboardData.find(u => u.isCurrentUser)?.rank / leaderboardData.length) * 100)}%`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">
                          {leaderboardView === 'overall' ? 'Points to Next' : 'Module Leader'}
                        </p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {(() => {
                            if (leaderboardView === 'overall') {
                              const currentRank = leaderboardData.find(u => u.isCurrentUser)?.rank;
                              if (!currentRank) return 'N/A';
                              if (currentRank === 1) return '👑';
                              const nextUser = leaderboardData[currentRank - 2];
                              return nextUser ? `+${(nextUser.score - score).toLocaleString()}` : '-';
                            } else {
                              return leaderboardData[0]?.name || '-';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={resetProgress}
            className="bg-gray-800/50 hover:bg-red-600/30 border border-gray-600 hover:border-red-500 text-gray-400 hover:text-red-400 px-6 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            ⚠️ Reset All Progress
          </button>
        </div>
        {/* Professional Footer Section */}
        <footer className="mt-6 mb-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="flex flex-col items-center gap-2 md:gap-4">
              {/* Powered By Section */}
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-gray-300 text-xs md:text-sm font-light">Powered by</span>
                <img 
                  src="/kenbright-logo.png" 
                  alt="Kenbright" 
                  className="h-12 md:h-16 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
                <span className="text-gray-300 text-xs md:text-sm font-light">AI</span>
              </div>
              
              {/* Additional Info */}
              <div className="text-center">
                <p className="text-gray-300 text-xs">
                  © {new Date().getFullYear()} Kenbright. All rights reserved.  
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Version 1.0.0 | IFRS 17 Training Platform
                </p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default IFRS17TrainingGame;