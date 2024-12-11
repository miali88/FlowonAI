import React from 'react';
import styles from './ChatWidget.module.css';


const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <a 
          href={`${import.meta.env.VITE_FRONTEND_API_BASE_URL}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.footerContent}
        >
          <img 
            src={`${import.meta.env.VITE_FRONTEND_API_BASE_URL}/flowon_partial.png`}
            alt="Flowon.AI Logo" 
            className={styles.footerLogo} 
          />
          <span className={styles.footerText}>
            Powered by Flowon.AI
          </span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
