import React from 'react';
import { Trophy, Star, Sparkles, ArrowRight, Award, Clock } from 'lucide-react';

const ModuleCompleteModal = ({
  isOpen,
  moduleTitle,
  score,
  perfectModule,
  completionTime,
  hasNextModule,
  onStartNext,
  onClose,
}) => {
  if (!isOpen) return null;

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md mx-auto">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        
        {/* Main card */}
        <div className="relative bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500" />
          
          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Trophy icon with glow */}
            <div className="relative flex justify-center mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
              </div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 transform rotate-3">
                <Trophy className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Module Complete!
                </h2>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-lg sm:text-xl text-gray-300 font-medium">{moduleTitle}</p>
            </div>

            {/* Stats display */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10 space-y-3">
              {/* Score */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Your Score</span>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    {score}
                  </span>
                  <span className="text-gray-400 text-sm">pts</span>
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-white/10" />
              
              {/* Time taken */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Time Taken</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {formatTime(completionTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Perfect module badge */}
            {perfectModule && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
                  <div className="flex items-center justify-center gap-3">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg sm:text-xl font-bold text-yellow-400">
                      PERFECT MODULE!
                    </span>
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-center text-yellow-400/70 text-sm mt-1">
                    All questions answered correctly
                  </p>
                </div>
              </div>
            )}

            {/* Next steps message */}
            <p className="text-center text-gray-400 text-sm sm:text-base mb-6">
              {hasNextModule
                ? "Ready to continue your IFRS 17 journey?"
                : "🎊 Congratulations! You've mastered all modules!"}
            </p>

            {/* Action button */}
            {hasNextModule ? (
              <button
                onClick={onStartNext}
                className="w-full group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Next Module</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full group relative bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Trophy className="w-5 h-5" />
                <span>View Final Results</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCompleteModal;
