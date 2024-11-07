'use client'

import React from "react";
import { Mic } from 'lucide-react';
import styles from "./ChatWidget.module.css";

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
  return (
    <div className={styles.streamButtonContainer}>
      <button
        onClick={onStreamToggle}
        disabled={isConnecting}
        className={`
          relative overflow-hidden transition-all duration-300 ease-in-out
          w-12 h-12 rounded-full
          ${isStreaming ? 'bg-blue-500/30' : 'bg-white/30'}
          shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          backdrop-blur-md border border-white/20
          hover:bg-white/40
          flex items-center justify-center
        `}
      >
        <Mic className={`w-6 h-6 text-gray-700 transition-all duration-300 ${isStreaming ? 'opacity-50' : 'opacity-100'}`} />
      </button>
      {isStreaming && (
        <span className="text-sm font-medium text-gray-700">Chatting...</span>
      )}
    </div>
  );
};

export default MorphingStreamButton;
