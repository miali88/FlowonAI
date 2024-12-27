import styles from './TextWidget.module.css';
import flowonLogo from '/src/assets/flowon.png'

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
        <img 
          src={flowonLogo} 
          alt="Flowon.AI Logo" 
          className={styles.footerLogo} 
        />
      </a>
    </div>
  );
};

export default Footer;
