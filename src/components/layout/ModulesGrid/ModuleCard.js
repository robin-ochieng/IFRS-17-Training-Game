import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';

const ModuleCard = ({
  module,
  index,
  isCompleted,
  isCurrent,
  isLocked,
  isGuest,
  onClick,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative p-3 md:p-4 rounded-xl transition-all duration-300 ${
        isCompleted
          ? 'bg-gradient-to-br from-green-600 to-green-700 transform cursor-not-allowed shadow-lg ring-2 ring-green-400'
          : isCurrent
          ? `bg-gradient-to-br ${module.color} transform scale-105 shadow-xl ring-2 ring-purple-400`
          : (!isLocked || isGuest)
          ? `bg-gradient-to-br ${module.color} hover:scale-105 transform cursor-pointer shadow-lg`
          : 'bg-gray-800 opacity-50 cursor-pointer hover:opacity-70'
      }`}
    >
      {isCompleted && (
        <CheckCircle className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-6 md:h-6 text-white" />
      )}
      {(isLocked || (isGuest && index > 0)) && (
        <Lock className="absolute top-1 right-1 md:top-2 md:right-2 w-3 h-3 md:w-4 md:h-4 text-gray-300" />
      )}
      <div className="text-2xl md:text-3xl mb-1 md:mb-2">{module.icon}</div>
      <p className="text-white text-xs md:text-sm font-semibold">
        {module.title}
      </p>
      {isCompleted && (
        <p className="text-xs text-green-200 mt-1">Completed!</p>
      )}
      {isCurrent && (
        <p className="text-xs text-yellow-200 mt-1">In Progress</p>
      )}
      {isGuest && index > 0 && (
        <p className="text-xs text-gray-300 mt-1">Sign up to unlock</p>
      )}
    </button>
  );
};

export default ModuleCard;
