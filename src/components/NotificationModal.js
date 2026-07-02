/**
 * NotificationModal Component
 * A modern, professional notification modal for alerts and messages
 */
import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import ModalPortal from './ui/ModalPortal';

const VARIANTS = {
  success: {
    icon: CheckCircle,
    bgColor: 'from-green-600/20 to-emerald-600/20',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/20',
  },
  error: {
    icon: XCircle,
    bgColor: 'from-red-600/20 to-rose-600/20',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/20',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'from-yellow-600/20 to-orange-600/20',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20',
  },
  info: {
    icon: Info,
    bgColor: 'from-blue-600/20 to-cyan-600/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
};

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  variant = 'info',
  autoClose = false,
  autoCloseDelay = 3000 
}) => {
  const variantStyles = VARIANTS[variant] || VARIANTS.info;
  const IconComponent = variantStyles.icon;

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm max-h-[92dvh] overflow-y-auto animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${variantStyles.bgColor} border-b ${variantStyles.borderColor} px-5 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${variantStyles.iconBg} rounded-lg`}>
                <IconComponent className={`w-5 h-5 ${variantStyles.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-black/20 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default NotificationModal;
