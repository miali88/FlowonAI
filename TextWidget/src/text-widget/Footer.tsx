import styles from './TextWidget.module.css';

const Footer = () => {
  return (
    <div className={styles.footer}>
      <span className={styles.footerText}>powered by</span>
      <img src="/flowon.png" alt="Flowon.AI Logo" className={styles.footerLogo} />
    </div>
  );
};

export default Footer;
