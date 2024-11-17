'use client';

import { useEffect } from 'react';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  agentId?: string;
  domain?: string;
  theme?: 'light' | 'dark';
}

export default function DevPage() {
  const config: ChatWidgetProps = {
    agentId: 'e8b64819-7c2c-432f-9f80-05a72bd49787',
    domain: 'http://localhost:3000',
    theme: 'light'
  };

  useEffect(() => {
    // Add Font Awesome CSS
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);

    // Error handling
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PERMISSION_ERROR') {
        console.warn('Permission denied:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div 
        className={styles.chatWidgetContainer}
        data-theme={config.theme}
        style={{ flex: 1 }}
      >
        <iframe
          className={styles.chatWidgetIframe}
          src={`${config.domain}/chat-widget/${config.agentId}`}
          allow="microphone *; camera *"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
