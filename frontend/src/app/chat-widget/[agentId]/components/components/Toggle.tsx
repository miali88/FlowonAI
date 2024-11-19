import React from 'react';
import styles from './ChatWidget.module.css';

interface ToggleProps {
  isVoiceMode: boolean;
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ isVoiceMode, onToggle }) => {
  return (
    <div className={styles.toggleContainer}>
      <button 
        className={`${styles.toggleButton} ${isVoiceMode ? styles.active : ''}`}
        onClick={onToggle}
        aria-label={`Switch to ${isVoiceMode ? 'text' : 'voice'} mode`}
      >
        <span className={styles.toggleIcon}>
          {isVoiceMode ? '🎤' : '💬'}
        </span>
        <span className={styles.toggleText}>
          {isVoiceMode ? 'Voice Chat' : 'Text Chat'}
        </span>
      </button>
    </div>
  );
};

export default Toggle;