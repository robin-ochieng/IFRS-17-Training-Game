import React from 'react';
import { Clock, CheckCircle, XCircle, MessageCircleQuestion } from 'lucide-react';

const QuestionPanel = ({
  moduleTitle,
  questions,
  currentModule,
  currentQuestionIndex,
  timerState,
  currentTime,
  formatTime,
  correctCount,
  wrongCount,
  answeredQuestions,
  showFeedback,
  selectedAnswer,
  isCorrect,
  combo,
  streak,
  onAnswer,
  onAskHelp,
}) => {
  if (!questions?.length) return null;

  const questionKey = `${currentModule}-${currentQuestionIndex}`;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-lg md:text-xl font-bold text-white">
            {moduleTitle} - Question {currentQuestionIndex + 1}/{totalQuestions}
          </h3>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 backdrop-blur-sm rounded-lg px-3 py-2 border transition-all ${
                timerState === 'idle'
                  ? 'bg-gray-700/30 border-gray-500/30 text-gray-400'
                  : timerState === 'running'
                  ? 'bg-blue-900/30 border-blue-400/30 text-blue-400'
                  : 'bg-green-900/30 border-green-400/30 text-green-400'
              }`}>
              <Clock className={`w-4 h-4 ${timerState === 'running' ? 'animate-pulse' : ''}`} />
              <span className="font-mono text-sm md:text-base font-semibold">
                {timerState === 'idle' ? '0:00' : formatTime(currentTime)}
              </span>
              {timerState === 'idle' && (
                <span className="text-xs opacity-75 ml-1">(starts on first answer)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-900/30 border border-green-400/30 text-green-300 px-3 py-2 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs md:text-sm font-semibold">Correct: {correctCount}</span>
              </div>
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg backdrop-blur-sm">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs md:text-sm font-semibold">Wrong: {wrongCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-white text-base md:text-lg lg:text-xl font-semibold flex-1">
            {currentQuestion?.question}
          </p>
          {/* Help Button - Opens chatbot with question context */}
          {onAskHelp && !answeredQuestions[questionKey]?.answered && (
            <button
              onClick={onAskHelp}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 hover:border-blue-400/50 rounded-lg text-blue-300 hover:text-blue-200 transition-all duration-200 text-sm shrink-0 group"
              title="Get help with this question from the AI assistant"
            >
              <MessageCircleQuestion className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Need help?</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion?.options.map((option, index) => (
          <button
            key={index}
            onClick={() =>
              !showFeedback &&
              !answeredQuestions[questionKey]?.answered &&
              onAnswer(index)
            }
            disabled={
              showFeedback ||
              answeredQuestions[questionKey]?.answered
            }
            className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 text-sm md:text-base ${
              answeredQuestions[questionKey]?.answered
                ? answeredQuestions[questionKey]?.selectedAnswer === index
                  ? answeredQuestions[questionKey]?.wasCorrect
                    ? 'bg-green-500/20 border-green-400 text-green-400'
                    : 'bg-red-500/20 border-red-400 text-red-400'
                  : index === currentQuestion?.correct
                  ? 'bg-green-500/20 border-green-400 text-green-400'
                  : 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                : showFeedback && selectedAnswer === index
                ? isCorrect
                  ? 'bg-green-500/20 border-green-400 text-green-400'
                  : 'bg-red-500/20 border-red-400 text-red-400'
                : showFeedback && index === currentQuestion?.correct
                ? 'bg-green-500/20 border-green-400 text-green-400'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {showFeedback && selectedAnswer === index && (
                isCorrect ? (
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                )
              )}
              {answeredQuestions[questionKey]?.answered && (
                answeredQuestions[questionKey]?.selectedAnswer === index ? (
                  answeredQuestions[questionKey]?.wasCorrect ? (
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                  )
                ) : index === currentQuestion?.correct ? (
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                ) : null
              )}
            </div>
          </button>
        ))}
      </div>

      {showFeedback && (
        <div
          className={`mt-6 p-4 rounded-xl ${
            isCorrect
              ? 'bg-green-500/20 border border-green-400'
              : 'bg-blue-500/20 border border-blue-400'
          }`}
        >
          <p
            className={`${
              isCorrect ? 'text-green-400' : 'text-blue-400'
            } font-semibold mb-2 text-sm md:text-base`}
          >
            {isCorrect
              ? `🎉 Excellent! +${10 * combo} points`
              : "Not quite right, but here's the explanation:"}
            {isCorrect && combo >= 3 && ' 🔥 COMBO!'}
            {isCorrect && streak >= 5 && ' ⚡ STREAK!'}
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            {currentQuestion?.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;
