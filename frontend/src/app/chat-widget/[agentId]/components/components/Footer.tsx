import React from 'react';
import styles from './ChatWidget.module.css';


const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <a 
          href={`${process.env.NEXT_PUBLIC_FRONTEND_API_BASE_URL}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.footerContent}
        >
          <img 
            src={`${process.env.NEXT_PUBLIC_FRONTEND_API_BASE_URL}/flowon.png`}
            alt="Flowon.AI Logo" 
            className={styles.footerLogo} 
          />
          <span className={styles.footerText}>
            Powered by Flowon.AI
          </span>
        </a>
        {/* <a 
          href="https://flowon.ai/privacy" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.privacyLink}
        >
          Privacy Policy
        </a> */}
      </div>
    </footer>
  );
};

export default Footer;
