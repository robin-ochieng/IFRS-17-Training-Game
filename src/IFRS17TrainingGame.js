import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Lock, CheckCircle, XCircle, TrendingUp, Award, Target, Brain } from 'lucide-react';

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
  const [powerUps, setPowerUps] = useState({ hint: 3, eliminate: 2, skip: 1 });

  const modules = [
    {
      title: "IFRS 17 Fundamentals",
      icon: "📚",
      color: "from-blue-500 to-blue-600",
      questions: [
        {
          question: "What is the primary objective of IFRS 17?",
          options: [
            "To increase insurance premiums",
            "To provide transparent and comparable information about insurance contracts",
            "To reduce regulatory oversight",
            "To simplify tax calculations"
          ],
          correct: 1,
          explanation: "IFRS 17 aims to ensure consistent, transparent reporting of insurance contracts globally."
        },
        {
          question: "When did IFRS 17 become effective?",
          options: [
            "January 1, 2021",
            "January 1, 2022",
            "January 1, 2023",
            "January 1, 2024"
          ],
          correct: 2,
          explanation: "IFRS 17 became effective on January 1, 2023, replacing IFRS 4."
        },
        {
          question: "Which statement best describes the Building Block Approach (BBA)?",
          options: [
            "A simplified approach for all contracts",
            "The default measurement model with four building blocks",
            "Only for short-term contracts",
            "Exclusively for life insurance"
          ],
          correct: 1,
          explanation: "BBA is the general measurement model using fulfilment cash flows and CSM."
        }
      ]
    },
    {
      title: "Scope & Recognition",
      icon: "🎯",
      color: "from-purple-500 to-purple-600",
      questions: [
        {
          question: "Which contracts are within the scope of IFRS 17?",
          options: [
            "Only life insurance contracts",
            "Insurance contracts, reinsurance contracts, and investment contracts with DPF",
            "Only property and casualty insurance",
            "Banking products only"
          ],
          correct: 1,
          explanation: "IFRS 17 covers insurance contracts issued, reinsurance held, and investment contracts with discretionary participation features."
        },
        {
          question: "When should an insurance contract be recognized?",
          options: [
            "When the contract is signed",
            "At the beginning of coverage period, when first payment is due, or when onerous",
            "Only when claims are made",
            "At the end of the coverage period"
          ],
          correct: 1,
          explanation: "Recognition occurs at the earliest of: coverage beginning, first payment due, or when a group becomes onerous."
        },
        {
          question: "What is a 'portfolio' under IFRS 17?",
          options: [
            "All contracts in the company",
            "Contracts subject to similar risks and managed together",
            "Only profitable contracts",
            "Contracts from the same year"
          ],
          correct: 1,
          explanation: "A portfolio comprises contracts with similar risks that are managed together."
        }
      ]
    },
    {
      title: "Level of Aggregation",
      icon: "📊",
      color: "from-green-500 to-green-600",
      questions: [
        {
          question: "What are the three categories for grouping contracts?",
          options: [
            "Small, medium, large",
            "Onerous, profitable at inception, and remaining contracts",
            "Short-term, medium-term, long-term",
            "Direct, reinsurance, investment"
          ],
          correct: 1,
          explanation: "IFRS 17 requires grouping into: onerous at inception, no significant possibility of becoming onerous, and remaining contracts."
        },
        {
          question: "What is the maximum span of cohorts (annual periods)?",
          options: [
            "6 months",
            "1 year",
            "2 years",
            "5 years"
          ],
          correct: 1,
          explanation: "Groups cannot include contracts issued more than one year apart."
        },
        {
          question: "Can profitable and onerous contracts be grouped together?",
          options: [
            "Yes, always",
            "No, they must be in separate groups",
            "Only for reinsurance",
            "Only for short-term contracts"
          ],
          correct: 1,
          explanation: "Profitable and onerous contracts must be in separate groups to prevent offsetting."
        }
      ]
    },
    {
      title: "Measurement Models",
      icon: "📏",
      color: "from-red-500 to-red-600",
      questions: [
        {
          question: "What does PAA stand for?",
          options: [
            "Premium Allocation Approach",
            "Profit Allocation Approach",
            "Portfolio Aggregation Approach",
            "Periodic Adjustment Approach"
          ],
          correct: 0,
          explanation: "PAA is the Premium Allocation Approach, a simplified model for short-duration contracts."
        },
        {
          question: "When can the Variable Fee Approach (VFA) be used?",
          options: [
            "For all contracts",
            "Only for contracts with direct participation features",
            "For short-term contracts only",
            "For reinsurance contracts"
          ],
          correct: 1,
          explanation: "VFA is used for contracts with direct participation features where policyholders share in investment returns."
        },
        {
          question: "What are the building blocks of the BBA?",
          options: [
            "Premium, claims, expenses, profit",
            "Present value of future cash flows, risk adjustment, CSM, and time value of money",
            "Assets, liabilities, equity, revenue",
            "Gross premium, net premium, claims, reserves"
          ],
          correct: 1,
          explanation: "BBA consists of: fulfilment cash flows (PV + risk adjustment) and contractual service margin."
        }
      ]
    },
    {
      title: "Contract Boundaries",
      icon: "🔒",
      color: "from-yellow-500 to-yellow-600",
      questions: [
        {
          question: "What determines the contract boundary?",
          options: [
            "The contract's legal termination date",
            "When the entity can compel payment or has substantive obligation to provide services",
            "Always one year from inception",
            "The policyholder's retirement age"
          ],
          correct: 1,
          explanation: "Contract boundary exists while the entity can compel payment or has a substantive obligation to provide coverage."
        },
        {
          question: "Are future renewals included within contract boundary?",
          options: [
            "Always included",
            "Never included",
            "Only if entity cannot reprice or reject the risk",
            "Only for life insurance"
          ],
          correct: 2,
          explanation: "Renewals are included only when the insurer cannot reassess risks and reprice accordingly."
        },
        {
          question: "How do contract boundaries affect measurement?",
          options: [
            "They don't affect measurement",
            "They determine which cash flows to include in measurement",
            "They only affect disclosure",
            "They only matter for PAA"
          ],
          correct: 1,
          explanation: "Contract boundaries determine which future cash flows are included in the measurement of insurance contracts."
        }
      ]
    },
    {
      title: "Initial Recognition",
      icon: "🚀",
      color: "from-indigo-500 to-indigo-600",
      questions: [
        {
          question: "What is the Contractual Service Margin (CSM)?",
          options: [
            "The expected loss on a contract",
            "The unearned profit to be recognized over coverage period",
            "The risk adjustment only",
            "The present value of premiums"
          ],
          correct: 1,
          explanation: "CSM represents unearned profit that will be recognized as services are provided."
        },
        {
          question: "What happens if a contract is onerous at initial recognition?",
          options: [
            "CSM is created",
            "Loss is deferred",
            "Loss is recognized immediately in P&L",
            "Contract is cancelled"
          ],
          correct: 2,
          explanation: "For onerous contracts, the loss (negative CSM) is recognized immediately in profit or loss."
        },
        {
          question: "What discount rate should be used for initial measurement?",
          options: [
            "Always risk-free rate",
            "Current rates at initial recognition",
            "Historical average rates",
            "Bank lending rate"
          ],
          correct: 1,
          explanation: "Discount rates at initial recognition reflect the characteristics of the cash flows and market conditions."
        }
      ]
    },
    {
      title: "Subsequent Measurement",
      icon: "🔄",
      color: "from-pink-500 to-pink-600",
      questions: [
        {
          question: "How is CSM adjusted in subsequent periods?",
          options: [
            "It remains constant",
            "Only for interest accretion",
            "For changes in fulfilment cash flows related to future service",
            "It's written off immediately"
          ],
          correct: 2,
          explanation: "CSM is adjusted for changes in estimates of future service, interest accretion, and currency changes."
        },
        {
          question: "What is 'unlocking' the CSM?",
          options: [
            "Releasing all CSM immediately",
            "Adjusting CSM for changes in future service estimates",
            "Converting CSM to cash",
            "Transferring CSM between groups"
          ],
          correct: 1,
          explanation: "Unlocking means adjusting CSM for changes in fulfilment cash flows related to future service."
        },
        {
          question: "How are experience adjustments treated?",
          options: [
            "Always adjust CSM",
            "Current period differences go to P&L immediately",
            "Deferred to future periods",
            "Ignored in measurement"
          ],
          correct: 1,
          explanation: "Experience adjustments (actual vs expected) for current period are recognized in P&L immediately."
        }
      ]
    },
    {
      title: "Onerous Contracts",
      icon: "⚠️",
      color: "from-orange-500 to-orange-600",
      questions: [
        {
          question: "When is a loss component established?",
          options: [
            "When contracts are profitable",
            "When fulfilment cash flows exceed carrying amount",
            "Only at initial recognition",
            "Never under IFRS 17"
          ],
          correct: 1,
          explanation: "A loss component is established when a group becomes onerous (fulfilment cash flows > carrying amount)."
        },
        {
          question: "How are subsequent changes to loss component allocated?",
          options: [
            "All to CSM",
            "Systematically between loss component and LRC excluding loss component",
            "All to P&L",
            "Deferred indefinitely"
          ],
          correct: 1,
          explanation: "Changes are allocated systematically based on the proportion of loss component to total LRC."
        },
        {
          question: "Can a loss component be reversed?",
          options: [
            "Never",
            "Yes, if the contract becomes profitable",
            "Only for reinsurance",
            "Only under PAA"
          ],
          correct: 1,
          explanation: "Loss components can be reversed if favorable changes make the contracts no longer onerous."
        }
      ]
    },
    {
      title: "Presentation & Disclosure",
      icon: "📋",
      color: "from-teal-500 to-teal-600",
      questions: [
        {
          question: "How should insurance revenue be presented?",
          options: [
            "Equal to premiums received",
            "Based on services provided in the period",
            "Only when claims are paid",
            "At contract inception"
          ],
          correct: 1,
          explanation: "Insurance revenue reflects services provided, not cash premiums received."
        },
        {
          question: "What must be separately disclosed on the balance sheet?",
          options: [
            "Only total insurance liabilities",
            "Portfolios in asset positions separately from those in liability positions",
            "Combined with other liabilities",
            "Only profitable contracts"
          ],
          correct: 1,
          explanation: "Portfolios in asset positions must be presented separately from those in liability positions."
        },
        {
          question: "Which reconciliation is required in the notes?",
          options: [
            "Only opening to closing equity",
            "Opening to closing balances of insurance contract liabilities",
            "Only premium reconciliation",
            "No reconciliations required"
          ],
          correct: 1,
          explanation: "Detailed reconciliations from opening to closing balances are required for transparency."
        }
      ]
    },
    {
      title: "Transition Requirements",
      icon: "🔀",
      color: "from-cyan-500 to-cyan-600",
      questions: [
        {
          question: "What are the three transition approaches?",
          options: [
            "Simple, medium, complex",
            "Full retrospective, modified retrospective, fair value",
            "Current value, historical cost, market value",
            "Prospective only"
          ],
          correct: 1,
          explanation: "IFRS 17 allows: full retrospective (if practicable), modified retrospective, or fair value approach."
        },
        {
          question: "When is the fair value approach permitted?",
          options: [
            "Always preferred",
            "When full retrospective is impracticable and for modified retrospective",
            "Never allowed",
            "Only for new contracts"
          ],
          correct: 1,
          explanation: "Fair value approach can be used when full retrospective is impracticable."
        },
        {
          question: "What is the transition CSM under fair value approach?",
          options: [
            "Zero",
            "Historical CSM",
            "Fair value less fulfilment cash flows at transition",
            "Premium received"
          ],
          correct: 2,
          explanation: "Under fair value, CSM equals fair value of contracts less fulfilment cash flows at transition date."
        }
      ]
    }
  ];

  const achievementsList = [
    { id: 1, name: "First Steps", icon: "🎯", condition: (stats) => stats.score >= 10 },
    { id: 2, name: "Quick Learner", icon: "⚡", condition: (stats) => stats.streak >= 3 },
    { id: 3, name: "Module Master", icon: "🏆", condition: (stats) => stats.modulesCompleted >= 1 },
    { id: 4, name: "IFRS Expert", icon: "🎓", condition: (stats) => stats.level >= 5 },
    { id: 5, name: "Perfect Score", icon: "💯", condition: (stats) => stats.perfectModules >= 1 },
    { id: 6, name: "Combo King", icon: "🔥", condition: (stats) => stats.maxCombo >= 5 },
    { id: 7, name: "Knowledge Seeker", icon: "📚", condition: (stats) => stats.modulesCompleted >= 5 },
    { id: 8, name: "Unstoppable", icon: "💪", condition: (stats) => stats.streak >= 10 },
  ];

  useEffect(() => {
    const stats = {
      score,
      streak,
      level,
      modulesCompleted: unlockedModules.length - 1,
      perfectModules: 0,
      maxCombo: combo
    };
    
    const newAchievements = achievementsList.filter(a => 
      !achievements.find(ua => ua.id === a.id) && a.condition(stats)
    );
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
    }
  }, [score, streak, level, combo, unlockedModules]);

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === modules[currentModule].questions[currentQuestion].correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = 10 * (combo + 1);
      setScore(score + points);
      setStreak(streak + 1);
      setCombo(combo + 1);
      setXp(xp + 25);
      
      if (xp + 25 >= level * 100) {
        setLevel(level + 1);
        setXp((xp + 25) % (level * 100));
      }
    } else {
      setStreak(0);
      setCombo(0);
    }

    setTimeout(() => {
      if (currentQuestion < modules[currentModule].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        if (currentModule < modules.length - 1 && !unlockedModules.includes(currentModule + 1)) {
          setUnlockedModules([...unlockedModules, currentModule + 1]);
        }
      }
      setShowFeedback(false);
      setSelectedAnswer(null);
    }, 2500);
  };

  const handlePowerUp = (type) => {
    if (powerUps[type] <= 0) return;
    
    setPowerUps({ ...powerUps, [type]: powerUps[type] - 1 });
    
    switch(type) {
      case 'hint':
        // Highlight correct answer briefly
        break;
      case 'eliminate':
        // Remove two wrong answers
        break;
      case 'skip':
        if (currentQuestion < modules[currentModule].questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Stats */}
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

        {/* Module Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">IFRS 17 Training Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {modules.map((module, index) => (
              <button
                key={index}
                onClick={() => {
                  if (unlockedModules.includes(index)) {
                    setCurrentModule(index);
                    setCurrentQuestion(0);
                  }
                }}
                disabled={!unlockedModules.includes(index)}
                className={`relative p-4 rounded-xl transition-all duration-300 ${
                  unlockedModules.includes(index)
                    ? `bg-gradient-to-br ${module.color} hover:scale-105 transform cursor-pointer shadow-lg`
                    : 'bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
              >
                {!unlockedModules.includes(index) && (
                  <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-500" />
                )}
                <div className="text-3xl mb-2">{module.icon}</div>
                <p className="text-white text-sm font-semibold">{module.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
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
                    {type === 'hint' && '💡'} 
                    {type === 'eliminate' && '🎯'} 
                    {type === 'skip' && '⏭️'} 
                    {count}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / modules[currentModule].questions.length) * 100}%` }}
              />
            </div>
            
            <p className="text-xl text-white mb-6">
              {modules[currentModule].questions[currentQuestion].question}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules[currentModule].questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && handleAnswer(index)}
                disabled={showFeedback}
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
                  showFeedback && selectedAnswer === index
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
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`mt-6 p-4 rounded-xl ${
              isCorrect ? 'bg-green-500/20 border border-green-400' : 'bg-blue-500/20 border border-blue-400'
            }`}>
              <p className={`${isCorrect ? 'text-green-400' : 'text-blue-400'} font-semibold mb-2`}>
                {isCorrect ? `Excellent! +${10 * (combo)} points` : 'Not quite right, but here\'s the explanation:'}
              </p>
              <p className="text-gray-300">
                {modules[currentModule].questions[currentQuestion].explanation}
              </p>
            </div>
          )}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mt-6 bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
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
      </div>
    </div>
  );
};

export default IFRS17TrainingGame;