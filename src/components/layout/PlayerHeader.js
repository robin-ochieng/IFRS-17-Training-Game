import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';

/**
 * Displays the player avatar/name plus authentication and guide controls.
 */
const PlayerHeader = ({
  currentUser,
  isGuest,
  onShowGuide,
  onSignIn,
  onSignUp,
  onLogout,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {currentUser?.avatar || currentUser?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-white font-semibold text-sm md:text-base">
            {currentUser?.name || 'Loading...'}
          </p>
          <p className="text-gray-400 text-xs">{currentUser?.organization || ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShowGuide}
          className="hidden sm:flex items-center gap-2 text-white subpixel-antialiased bg-black/40 hover:bg-black/60 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold shadow-sm"
        >
          <span>Game Guide</span>
        </button>
        {isGuest ? (
          <>
            <button
              onClick={onSignIn}
              className="hidden sm:flex items-center gap-2 text-white subpixel-antialiased bg-black/60 hover:bg-black/70 border border-white/30 hover:border-white/50 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold shadow-sm"
            >
              <LogIn className="w-4 h-4" strokeWidth={2.2} />
              <span>Sign In</span>
            </button>
            <button
              onClick={onSignUp}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </>
        ) : (
          <button
            onClick={onLogout}
            className="text-white text-sm transition-colors"
          >
            Switch User
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerHeader;
