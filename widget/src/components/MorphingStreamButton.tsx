'use client'

import React from "react";
import { Mic } from 'lucide-react';

interface MorphingStreamButtonProps {
  onStreamToggle: () => void;
  isStreaming: boolean;
  isConnecting: boolean;
}

const MorphingStreamButton: React.FC<MorphingStreamButtonProps> = ({ 
  onStreamToggle, 
  isConnecting,
  isStreaming 
}) => {
  const handleClick = () => {
    onStreamToggle();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`
        relative overflow-hidden transition-all duration-300 ease-in-out
        ${isStreaming ? 'w-12 bg-blue-500/30' : 'w-12 bg-white/30'}
        h-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        backdrop-blur-md border border-white/20
        hover:bg-white/40
        flex items-center justify-center
      `}
    >
      <div
        className={`
          absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out
          ${isStreaming ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
        `}
      >
        <Mic className="w-6 h-6 text-gray-700" />
      </div>
      {isStreaming && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-sm font-medium text-gray-700">Chatting...</span>
        </div>
      )}
    </button>
  );
};

export default MorphingStreamButton;
