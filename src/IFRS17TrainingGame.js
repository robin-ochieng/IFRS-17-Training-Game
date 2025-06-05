import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Lock, CheckCircle, XCircle, TrendingUp, Award } from 'lucide-react';
import { modules } from './data/IFRS17Modules';
import { achievementsList, getNewAchievements, createAchievementStats } from './modules/achievements';
import { INITIAL_POWER_UPS, consumePowerUp, refreshPowerUps, canUsePowerUp, getPowerUpInfo } from './modules/powerUps';
import { saveGameState, loadGameState, hasSavedGame, clearGameState } from './modules/storageService';


const IFRS17TrainingGame = () => {
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
        setTimeout(() => setShowLevelUp(false), 2500);
      }
    } else {
      setStreak(0);
      setCombo(0);
      setPerfectModule(false);
    }


    setTimeout(() => {
      if (currentQuestion < modules[currentModule].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(false);
        setSelectedAnswer(null);
      } else {
        if (perfectModule) {
          setPerfectModulesCount(prev => prev + 1);
        }        
        setShowModuleComplete(true);
        setCompletedModules([...completedModules, currentModule]);
        saveProgress();
        
        if (currentModule < modules.length - 1 && !unlockedModules.includes(currentModule + 1)) {
          setUnlockedModules([...unlockedModules, currentModule + 1]);
        }
      }
    }, 2500);
  };

  const handlePowerUp = (type) => {
    if (!canUsePowerUp(powerUps, type)) return;
    
    setPowerUps(consumePowerUp(powerUps, type));
    
    switch(type) {
      case 'hint':
        // TODO: Implement hint display logic
        console.log('Hint: Look for the most comprehensive answer that aligns with IFRS 17 principles');
        break;
      case 'eliminate':
        // TODO: Implement eliminate logic to disable 2 wrong answers
        console.log('Eliminate: Two incorrect answers have been removed');
        break;
      case 'skip':
        if (currentQuestion < modules[currentModule].questions.length - 1) {
          const questionKey = `${currentModule}-${currentQuestion}`;
          setAnsweredQuestions({ 
            ...answeredQuestions, 
            [questionKey]: { answered: true, selectedAnswer: null, wasCorrect: false } 
          });
          setPerfectModule(false); // Skipping means not perfect
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
      setTimeout(() => setShowAchievement(null), 2500);
    }
  };
  const startNewModule = (moduleIndex) => {
    setCurrentModule(moduleIndex);
    setCurrentQuestion(0);
    setModuleScore(0);
    setPerfectModule(true);
    // Refresh some power-ups
    setPowerUps(prev => refreshPowerUps(prev));
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
      perfectModulesCount
    });
    
    if (!success) {
      console.error('Failed to save progress');
    }
  };

  const resetProgress = () => {
    if (window.confirm('⚠️ Are you sure you want to reset all progress?\n\nThis will delete:\n• Your score and level\n• All completed modules\n• All achievements\n• All answered questions\n\nThis action cannot be undone!')) {
      clearGameState();
      // Reset all state to initial values
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
      
      // Restore achievements by ID
      const restoredAchievements = achievementsList.filter(a => 
        savedState.achievements?.includes(a.id)
      );
      setAchievements(restoredAchievements);
    }
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-6">
          <img 
            src="/kenbright-logo.png" 
            alt="Kenbright Logo" 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-20 w-auto"
          />
          <h1 className="text-3xl font-bold text-white text-center py-2">IFRS 17 Master: Regulatory Training Game</h1>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Score</p>
                <p className="text-2xl font-bold text-white">{score.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="text-orange-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Streak</p>
                <p className="text-2xl font-bold text-white">{streak}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="text-purple-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Level {level}</p>
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                    style={{ width: `${(xp / (level * 100)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Combo</p>
                <p className="text-2xl font-bold text-white">x{combo + 1}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            IFRS 17 Training Modules 
            <span className="text-lg font-normal text-gray-300 ml-4">
              ({completedModules.length}/{modules.length} completed)
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {modules.map((module, index) => (
              <button
                key={index}
                onClick={() => {
                  if (unlockedModules.includes(index) && !completedModules.includes(index) && index !== currentModule) {
                    startNewModule(index);
                  }
                }}
                disabled={!unlockedModules.includes(index) || completedModules.includes(index) || (index === currentModule && !showModuleComplete)}
                className={`relative p-4 rounded-xl transition-all duration-300 ${
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
                  <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-white" />
                )}
                {!unlockedModules.includes(index) && (
                  <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-500" />
                )}
                <div className="text-3xl mb-2">{module.icon}</div>
                <p className="text-white text-sm font-semibold">{module.title}</p>
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
                    startNewModule(currentModule + 1);
                    setShowModuleComplete(false);
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {modules[currentModule].title} - Question {currentQuestion + 1}/{modules[currentModule].questions.length}
                </h3>
                <div className="flex gap-2">
                  {Object.entries(powerUps).map(([type, count]) => (
                    <button
                      key={type}
                      onClick={() => handlePowerUp(type)}
                      disabled={count === 0}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
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
              
              <div className="flex gap-2 justify-center mb-6">
                {modules[currentModule].questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      answeredQuestions[`${currentModule}-${idx}`]?.answered
                        ? answeredQuestions[`${currentModule}-${idx}`]?.wasCorrect ? 'bg-green-400' : 'bg-red-400'
                        : idx === currentQuestion
                        ? 'bg-purple-400 ring-2 ring-purple-300'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-xl text-white mb-6">
                {modules[currentModule].questions[currentQuestion].question}
              </p>
              
              {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && !showFeedback && (
                <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-center">
                    ⚠️ You've already answered this question, Use the Next button to progress to the next question.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules[currentModule].questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && !answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && handleAnswer(index)}
                  disabled={showFeedback || answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
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
                      isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
                    )}
                    {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && (
                      answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index ? (
                        answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect ? 
                          <CheckCircle className="w-5 h-5 text-green-400" /> : 
                          <XCircle className="w-5 h-5 text-red-400" />
                      ) : index === modules[currentModule].questions[currentQuestion].correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
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
                <p className={`${isCorrect ? 'text-green-400' : 'text-blue-400'} font-semibold mb-2`}>
                  {isCorrect ? `🎉 Excellent! +${10 * (combo)} points` : 'Not quite right, but here\'s the explanation:'}
                  {isCorrect && combo >= 3 && ' 🔥 COMBO!'}
                  {isCorrect && streak >= 5 && ' ⚡ STREAK!'}
                </p>
                <p className="text-gray-300">
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
        <div className="mt-6 text-center">
          <button
            onClick={resetProgress}
            className="bg-gray-800/50 hover:bg-red-600/30 border border-gray-600 hover:border-red-500 text-gray-400 hover:text-red-400 px-6 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            ⚠️ Reset All Progress
          </button>
        </div>
        {/* Professional Footer Section */}
        <footer className="mt-12 mb-8">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col items-center gap-4">
              {/* Powered By Section */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm font-light">Powered by</span>
                <img 
                  src="/kenbright-logo.png" 
                  alt="Kenbright" 
                  className="h-16 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
                <span className="text-gray-400 text-sm font-light">AI</span>
              </div>
              
              {/* Additional Info */}
              <div className="text-center">
                <p className="text-gray-500 text-xs">
                  © {new Date().getFullYear()} Kenbright. All rights reserved.  
                </p>
                <p className="text-gray-600 text-xs mt-1">
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