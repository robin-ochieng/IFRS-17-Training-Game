import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, ArrowRight, X } from 'lucide-react';

// Post-module replay of missed questions. Deliberately self-contained:
// no score, XP, combo, timer, power-ups, or persistence.
const ReviewPanel = ({ questions, moduleTitle, onExit }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  if (!questions?.length) return null;

  const current = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;

  const handleNext = () => {
    if (isLast) {
      onExit();
      return;
    }
    setIndex(index + 1);
    setSelected(null);
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-amber-400/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 bg-amber-900/40 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-lg text-sm font-semibold uppercase tracking-wide">
            <BookOpen className="w-4 h-4" />
            Review mode
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white">
            {moduleTitle} - Missed {index + 1}/{questions.length}
          </h3>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <X className="w-4 h-4" />
          Exit review
        </button>
      </div>

      <p className="text-amber-200/70 text-sm mb-4">
        No points, XP, or timer here — just another look at what you missed.
      </p>

      <p className="text-white text-base md:text-lg lg:text-xl font-semibold mb-4">
        {current.question}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {current.options.map((option, optionIndex) => (
          <button
            key={optionIndex}
            type="button"
            onClick={() => !answered && setSelected(optionIndex)}
            disabled={answered}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 text-sm md:text-base text-left ${
              answered && optionIndex === current.correct
                ? 'bg-green-500/20 border-green-400 text-green-400'
                : answered && optionIndex === selected
                ? 'bg-red-500/20 border-red-400 text-red-400'
                : answered
                ? 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {answered && optionIndex === current.correct && (
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              )}
              {answered && optionIndex === selected && optionIndex !== current.correct && (
                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              )}
            </div>
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-6 p-4 rounded-xl bg-blue-500/20 border border-blue-400">
          <p className="text-blue-400 font-semibold mb-2 text-sm md:text-base">
            {selected === current.correct ? '✅ Got it this time!' : 'Explanation:'}
          </p>
          <p className="text-gray-300 text-sm md:text-base">{current.explanation}</p>
          <button
            type="button"
            onClick={handleNext}
            className="mt-4 flex items-center gap-2 bg-amber-600/40 hover:bg-amber-600/60 border border-amber-400/40 text-amber-100 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
          >
            <span>{isLast ? 'Finish review' : 'Next question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewPanel;
