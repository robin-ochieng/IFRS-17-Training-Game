import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Bot } from 'lucide-react';

const ChatbotIcon = ({ onClick, isOpen = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showInitialPulse, setShowInitialPulse] = useState(true);

  // Stop the initial attention pulse after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialPulse(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      {/* Tooltip */}
      {isHovered && !isOpen && (
        <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap">
          <div 
            className="bg-gray-900/95 backdrop-blur-sm text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl border border-white/10"
            style={{
              animation: 'tooltipFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="font-medium">IFRS 17 Assistant</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-gray-900/95 border-r border-b border-white/10 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Outer glow ring - subtle breathing effect */}
      {!isOpen && (
        <div 
          className="absolute inset-[-8px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            animation: 'breathe 3s ease-in-out infinite'
          }}
        />
      )}

      {/* Ripple effect on initial load */}
      {!isOpen && showInitialPulse && (
        <>
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{
              animation: 'ripple 2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{
              animation: 'ripple 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              animationDelay: '1s'
            }}
          />
        </>
      )}

      {/* Main button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={`
          relative
          w-14 h-14 md:w-16 md:h-16
          rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isOpen 
            ? 'bg-gradient-to-br from-rose-500 to-red-600' 
            : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
          }
          ${isHovered && !isPressed ? 'scale-110' : ''}
          ${isPressed ? 'scale-95' : ''}
          focus:outline-none focus:ring-4 focus:ring-blue-500/40
          group
        `}
        style={{
          boxShadow: isOpen 
            ? '0 8px 32px rgba(239, 68, 68, 0.4), 0 4px 16px rgba(0,0,0,0.2)'
            : isHovered 
              ? '0 12px 40px rgba(99, 102, 241, 0.5), 0 4px 16px rgba(0,0,0,0.2)'
              : '0 8px 32px rgba(99, 102, 241, 0.35), 0 4px 16px rgba(0,0,0,0.15)'
        }}
        aria-label={isOpen ? 'Close chat' : 'Open IFRS 17 Assistant'}
      >
        {/* Gradient shine overlay */}
        <div className={`
          absolute inset-0 rounded-full overflow-hidden
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, transparent 100%)'
            }}
          />
        </div>

        {/* Icon container */}
        <div className="relative z-10">
          {isOpen ? (
            <X 
              className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform duration-300" 
              strokeWidth={2.5}
              style={{
                animation: 'iconRotateIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            />
          ) : (
            <MessageCircle 
              className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform duration-300" 
              strokeWidth={2}
              style={{
                animation: isHovered ? 'iconBounce 0.4s ease-out' : 'none'
              }}
            />
          )}
        </div>

        {/* Inner highlight ring */}
        <div className="absolute inset-[3px] rounded-full border border-white/20 pointer-events-none" />
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.5;
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes iconRotateIn {
          from {
            transform: rotate(-90deg) scale(0.8);
            opacity: 0;
          }
          to {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes iconBounce {
          0%, 100% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.15);
          }
          60% {
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatbotIcon;
