import React from 'react';

const AchievementsList = ({ achievements }) => {
  if (!achievements?.length) return null;

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Achievements Unlocked</h3>
      <div className="flex flex-wrap gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-white/10 rounded-lg p-3 flex items-center gap-2"
          >
            <span className="text-2xl">{achievement.icon}</span>
            <span className="text-white font-medium">{achievement.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsList;
