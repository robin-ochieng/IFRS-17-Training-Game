// src/components/AuthenticationModal.js
import React from 'react';
import { X, LogIn, UserPlus, Trophy, Star, Zap, Sparkles } from 'lucide-react';

const AuthenticationModal = ({ 
  isOpen, 
  onClose, 
  onSignIn, 
  onSignUp, 
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl w-full max-w-lg mx-4 sm:mx-auto p-6 sm:p-10 border border-white/20 shadow-2xl shadow-purple-500/10">
        {/* Decorative glow effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Content */}
        <div className="text-center relative z-10">
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src="/kenbright-logo.png"
                alt="Kenbright Logo"
                className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            
            {/* Title with sparkle effect */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Unlock All Modules!
              </h2>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
            </div>
            
            <p className="text-gray-300 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
              Great job completing Module 1! Sign up to continue to Module 2 and save your progress.
            </p>
          </div>

          {/* Benefits Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left border border-white/10">
            <h3 className="text-white font-semibold mb-4 text-sm sm:text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              With an account you get:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <span>Access to all 9 training modules</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-purple-400" />
                </div>
                <span>Compete on global leaderboard</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <span>Track achievements & progress</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-green-400" />
                </div>
                <span>Sync progress across devices</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={onSignUp}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up for Free
            </button>
            
            <button
              onClick={onSignIn}
              disabled={isLoading}
              className="w-full text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 font-semibold py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              <LogIn className="w-5 h-5" strokeWidth={2.2} />
              Already have an account? Sign In
            </button>
            
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full text-gray-500 hover:text-gray-300 transition-colors py-2 disabled:opacity-50 text-xs sm:text-sm"
            >
              Remind Me Later (Module 2 stays locked)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationModal;