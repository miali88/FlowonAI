import React from 'react';
import Image from 'next/image';
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
          <Image 
            src={`${process.env.NEXT_PUBLIC_FRONTEND_API_BASE_URL}/flowon_partial.png`}
            alt="Flowon.AI Logo" 
            className={styles.footerLogo}
            width={100}
            height={30}
            priority={true}
            loading="eager"
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
