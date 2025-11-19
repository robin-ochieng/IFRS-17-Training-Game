import React from 'react';

const LevelUpToast = ({ level }) => {
  if (!level) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-purple-600 text-white px-8 py-4 rounded-full text-2xl font-bold animate-pulse">
        ⭐ LEVEL UP! Level {level} ⭐
      </div>
    </div>
  );
};

export default LevelUpToast;
