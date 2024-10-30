"use client";

import { useEffect } from 'react';

interface WidgetProps {
  agentId: string;
  domain: string;
}

export const Widget: React.FC<WidgetProps> = ({ agentId, domain }) => {
  useEffect(() => {
    // Add config script
    const configScript = document.createElement('script');
    configScript.text = `window.embeddedChatbotConfig = {
      agentId: "${agentId}",
      domain: "${domain}"
    }`;
    document.body.appendChild(configScript);

    // Create and append the embed script
    const embedScript = document.createElement('script');
    embedScript.src = './embed.min.js';
    embedScript.setAttribute('agentId', agentId);
    embedScript.setAttribute('domain', domain);
    embedScript.defer = true;
    document.body.appendChild(embedScript);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(configScript);
      document.body.removeChild(embedScript);
    };
  }, [agentId, domain]);

  return <div id="embedded-chatbot-container" />;
};
