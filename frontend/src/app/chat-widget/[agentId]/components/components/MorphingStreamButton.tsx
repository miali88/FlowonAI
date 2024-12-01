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
      <div className={styles.streamButton}>
        {isStreaming && <div className={styles.streamButtonRing} />}
        <button
          onClick={onStreamToggle}
          disabled={isConnecting}
          className={`${isStreaming ? 'streaming' : ''} gradient-button`}
          aria-label="Toggle stream"
        >
          <Mic />
        </button>
      </div>
      {isStreaming && (
        <span style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>Chatting...</span>
      )}
    </div>
  );
};

export default MorphingStreamButton;
