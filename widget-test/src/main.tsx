import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to initialize the widget
const initializeWidget = () => {
  const config = (window as any).embeddedChatbotConfig;
  if (!config || !config.agentId || !config.domain) {
    console.error('EmbeddedChatbotConfig is missing or incomplete.');
    return;
  }

  const container = document.createElement('div');
  container.id = 'embedded-chatbot-container';
  document.body.appendChild(container);

  createRoot(container).render(
    <React.StrictMode>
      <App agentId={config.agentId} domain={config.domain} />
    </React.StrictMode>
  );
};

// Initialize the widget after the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
};

// Expose any necessary methods globally if needed
(window as any).EmbeddedChatbot = {
  initialize: initializeWidget,
};
