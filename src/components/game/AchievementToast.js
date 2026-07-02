import React from 'react';
import ModalPortal from '../ui/ModalPortal';

const AchievementToast = ({ achievement }) => {
  if (!achievement) return null;

  return (
    <ModalPortal lockScroll={false}>
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-max max-w-[calc(100vw-2rem)]">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full text-sm sm:text-lg font-bold animate-pulse flex items-center gap-3">
          <span className="text-xl sm:text-2xl">{achievement.icon}</span>
          Achievement Unlocked: {achievement.name}!
        </div>
      </div>
    </ModalPortal>
  );
};

export default AchievementToast;
