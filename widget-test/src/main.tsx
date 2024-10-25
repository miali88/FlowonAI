import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to initialize the widget
const initializeWidget = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const config = (window as any).embeddedChatbotConfig;
  if (!config || !config.agentId || !config.domain) {
    console.error('EmbeddedChatbotConfig is missing or incomplete.');
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App agentId={config.agentId} domain={config.domain} />
    </React.StrictMode>
  );
};

// Initialize the widget after the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initializeWidget('embedded-chatbot-container'));
} else {
  initializeWidget('embedded-chatbot-container');
};

// Expose any necessary methods globally if needed
(window as any).EmbeddedChatbot = {
  initialize: initializeWidget,
};
