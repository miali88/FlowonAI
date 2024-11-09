import React from 'react';
import styles from './ChatWidget.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <a 
        href="https://flowon.ai" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.footerContent}
      >
        <img 
          src="https://flowon.ai/logo.png" 
          alt="Flowon.AI Logo" 
          className={styles.footerLogo} 
        />
        <span className={styles.footerText}>
          Powered by Flowon.AI
        </span>
      </a>
    </footer>
  );
};

export default Footer;
