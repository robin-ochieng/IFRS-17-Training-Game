import React from 'react';
import { Award } from 'lucide-react';

const AllModulesCompleteBanner = ({ score, level, achievementsCount }) => {
  return (
    <div className="bg-gradient-to-br from-yellow-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 mb-6 border border-yellow-400/50 text-center">
      <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-white mb-4">🎊 Congratulations! 🎊</h2>
      <p className="text-xl text-white mb-2">
        You've completed all IFRS 17 Training Modules!
      </p>
      <p className="text-lg text-yellow-300">Final Score: {score.toLocaleString()} points</p>
      <p className="text-lg text-purple-300">
        Level: {level} | Achievements: {achievementsCount}
      </p>
    </div>
  );
};

export default AllModulesCompleteBanner;
