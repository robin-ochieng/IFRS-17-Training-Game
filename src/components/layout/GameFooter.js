import React from 'react';

const GameFooter = ({ onShowGuide }) => {
  return (
    <footer className="mt-6 mb-4">
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex flex-col items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-gray-300 text-xs md:text-sm font-light">
              Powered by Kenbright AI
            </span>
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-xs">
              © {new Date().getFullYear()} Kenbright. All rights reserved.
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Version 3.0.0 | IFRS 17 Training Platform
            </p>
            <button
              onClick={onShowGuide}
              className="mt-2 inline-flex items-center gap-2 text-xs md:text-sm text-purple-300 hover:text-purple-200 underline underline-offset-2"
            >
              Read the Game Guide & FAQ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GameFooter;
