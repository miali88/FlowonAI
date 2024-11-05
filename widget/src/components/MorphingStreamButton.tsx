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
    <div className="w-full max-w-[300px]">
      <div className="p-6 flex flex-col items-center">
        <button
          onClick={handleClick}
          disabled={isConnecting}
          className={`
            relative overflow-hidden transition-all duration-300 ease-in-out
            ${isStreaming ? 'w-32 bg-blue-500' : 'w-12 bg-white hover:bg-gray-100'}
            h-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
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
          <div
            className={`
              absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out
              ${isStreaming ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}
          >
            <span className="text-white font-medium">Chatting...</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MorphingStreamButton;
