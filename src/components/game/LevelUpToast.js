import React from 'react';
import ModalPortal from '../ui/ModalPortal';

const LevelUpToast = ({ level }) => {
  if (!level) return null;

  return (
    <ModalPortal lockScroll={false}>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-max max-w-[calc(100vw-2rem)]">
        <div className="bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg sm:text-2xl font-bold animate-pulse text-center">
          ⭐ LEVEL UP! Level {level} ⭐
        </div>
      </div>
    </ModalPortal>
  );
};

export default LevelUpToast;
