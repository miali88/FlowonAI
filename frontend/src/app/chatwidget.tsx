'use client';

import { useEffect, useState } from 'react';

interface ChatWidgetProps {
  agentId: string;
  domain?: string;
  position?: 'left' | 'right';
  buttonIcon?: string;
  theme?: 'light' | 'dark';
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  agentId,
  domain = 'http://localhost:3000',
  position = 'right',
  buttonIcon = '<i class="fa-solid fa-microphone-lines"></i>',
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Add Font Awesome CSS
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);

    // Add error handling
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PERMISSION_ERROR') {
        console.warn('Permission denied:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      <style jsx>{`
        // ... existing styles ... (copy all CSS from the original file)
      `}</style>

      <div 
        className="chat-widget-button" 
        onClick={toggleChat}
        dangerouslySetInnerHTML={{ 
          __html: isOpen ? '<i class="fa-solid fa-xmark"></i>' : buttonIcon 
        }}
        style={{ animation: isOpen ? 'none' : 'pulse 2s infinite' }}
      />

      <div 
        className="chat-widget-container" 
        style={{ display: isOpen ? 'block' : 'none' }}
        data-theme={theme}
      >
        <iframe 
          className="chat-widget-iframe"
          src={`${domain}/chat-widget/${agentId}`}
          allow="microphone *; camera *"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </>
  );
};