'use client';

import { useEffect } from 'react';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  agentId: string;
  domain?: string;
  theme?: 'light' | 'dark';
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  agentId, 
  domain = process.env.NEXT_PUBLIC_FRONTEND_API_BASE_URL || 'http://localhost:3000', 
  theme = 'light' 
}) => {
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
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div 
        className={styles.chatWidgetContainer}
        data-theme={theme}
      >
        <iframe
          className={styles.chatWidgetIframe}
          src={`${domain}/chat-widget/${agentId}`}
          allow="microphone *; camera *"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
};

export default ChatWidget;
