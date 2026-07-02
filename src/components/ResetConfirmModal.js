/**
 * ResetConfirmModal Component
 * A modern, professional confirmation modal for resetting game progress
 */
import React from 'react';
import { AlertTriangle, X, Trash2, XCircle } from 'lucide-react';
import ModalPortal from './ui/ModalPortal';

const ResetConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[92dvh] overflow-y-auto animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Reset progress confirmation"
      >
        {/* Header with warning color */}
        <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Reset Progress</h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-gray-300 mb-4">
            Are you sure you want to reset all your progress? This action will permanently delete:
          </p>
          
          <ul className="space-y-2 mb-5">
            <li className="flex items-center gap-2 text-gray-400">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>Your score and level</span>
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>All completed modules</span>
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>All achievements</span>
            </li>
            <li className="flex items-center gap-2 text-gray-400">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>All answered questions</span>
            </li>
          </ul>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="px-6 py-4 bg-black/20 border-t border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-red-500/25"
          >
            <Trash2 className="w-4 h-4" />
            Reset Progress
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default ResetConfirmModal;
