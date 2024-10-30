import { useEffect } from 'react';

// cursor chat: Integrating Scripts into React Component

interface WidgetProps {
  agentId: string;
  domain: string;
}

export const Widget: React.FC<WidgetProps> = ({ agentId, domain }) => {
  useEffect(() => {
    // Add config script
    window.embeddedChatbotConfig = {
      agentId,
      domain,
    };

    // Create and append the script element
    const script = document.createElement('script');
    script.src = 'dist/embed.min.js';
    script.setAttribute('agentId', agentId);
    script.setAttribute('domain', domain);
    script.defer = true;
    
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, [agentId, domain]);

  return <div id="embedded-chatbot-container" />;
};
