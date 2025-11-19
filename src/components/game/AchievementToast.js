import React from 'react';

const AchievementToast = ({ achievement }) => {
  if (!achievement) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-full text-lg font-bold animate-pulse flex items-center gap-3">
        <span className="text-2xl">{achievement.icon}</span>
        Achievement Unlocked: {achievement.name}!
      </div>
    </div>
  );
};

export default AchievementToast;
