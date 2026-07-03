import React from 'react';
import { Lightbulb, Scissors } from 'lucide-react';

const buttonClass = (disabled) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
    disabled
      ? 'bg-gray-800/40 border-gray-600/40 text-gray-500 cursor-not-allowed'
      : 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-400/30 hover:border-purple-400/50 text-purple-200'
  }`;

const PowerUpBar = ({ powerUps, onUseEliminate, onUseHint, eliminateDisabled, hintDisabled }) => (
  <div className="flex items-center gap-2 mb-4 flex-wrap">
    <span className="text-xs text-gray-400 uppercase tracking-wide">Power-ups</span>
    <button
      type="button"
      onClick={onUseEliminate}
      disabled={eliminateDisabled}
      title="Remove two wrong options from this question"
      className={buttonClass(eliminateDisabled)}
    >
      <Scissors className="w-4 h-4" />
      <span>Eliminate</span>
      <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-xs">{powerUps?.eliminate ?? 0}</span>
    </button>
    <button
      type="button"
      onClick={onUseHint}
      disabled={hintDisabled}
      title="Ask the AI assistant for a hint (won't reveal the answer)"
      className={buttonClass(hintDisabled)}
    >
      <Lightbulb className="w-4 h-4" />
      <span>Hint</span>
      <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-xs">{powerUps?.hint ?? 0}</span>
    </button>
  </div>
);

export default PowerUpBar;
