import React from 'react';
import { Trophy } from 'lucide-react';

const ModuleCompleteModal = ({
  isOpen,
  moduleTitle,
  score,
  perfectModule,
  hasNextModule,
  onStartNext,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl text-center transform scale-110 animate-pulse">
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-4xl font-bold text-white mb-4">
          Module Complete! 🎉
        </h2>
        <p className="text-2xl text-white mb-2">{moduleTitle}</p>
        <p className="text-xl text-yellow-300 mb-4">Score: {score} points</p>
        {perfectModule && (
          <p className="text-2xl text-yellow-400 font-bold mb-4 animate-pulse">
            ⭐ PERFECT MODULE! ⭐
          </p>
        )}
        <p className="text-lg text-white mb-4">
          {hasNextModule
            ? "Get ready for the next module..."
            : "Congratulations! You've completed all modules!"}
        </p>
        {hasNextModule ? (
          <button
            onClick={onStartNext}
            className="mt-4 px-6 py-3 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Start Next Module →
          </button>
        ) : (
          <button
            onClick={onClose}
            className="mt-4 px-6 py-3 bg-yellow-400 text-purple-900 rounded-full font-bold hover:bg-yellow-300 transition-all transform hover:scale-105"
          >
            View Final Results 🏆
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleCompleteModal;
