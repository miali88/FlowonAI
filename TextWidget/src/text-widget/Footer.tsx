import styles from './TextWidget.module.css';

const Footer = () => {
  return (
    <div className={styles.footer}>
      <a 
        href="https://flowon.ai" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.footerLink}
      >
        <span className={styles.footerText}>powered by Flowon.AI</span>
        <img src="/flowon.png" alt="Flowon.AI Logo" className={styles.footerLogo} />
      </a>
    </div>
  );
};

export default Footer;
