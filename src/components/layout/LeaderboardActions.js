import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

/**
 * CTA buttons for leaderboard viewing and manual sync.
 */
const LeaderboardActions = ({ isGuest, onShowLeaderboard, onSyncProgress }) => {
  return (
    <div className="mt-4 text-center">
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={onShowLeaderboard}
          className="group relative bg-black/30 backdrop-blur-sm border border-purple-400/30 hover:border-purple-400 text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
        >
          <Trophy className="w-4 h-4 text-purple-400 group-hover:text-yellow-400 transition-colors" />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
            View Leaderboard
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
        </button>

        {!isGuest && (
          <button
            onClick={onSyncProgress}
            className="group relative bg-black/30 backdrop-blur-sm border border-green-400/30 hover:border-green-400 text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
          >
            <TrendingUp className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-semibold">
              Sync Progress
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardActions;
