import React from 'react';
import { Trophy, Zap, Star, TrendingUp } from 'lucide-react';

/**
 * Summary bar for score, streak, level, and combo.
 */
const StatsDashboard = ({ score, streak, level, xp, combo }) => {
  const levelProgress = (xp / (level * 100)) * 100;

  return (
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
                style={{ width: `${Math.max(0, Math.min(levelProgress, 100))}%` }}
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
  );
};

export default StatsDashboard;
