import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Function to initialize the widget
const initializeWidget = () => {
  // Prevent multiple initializations
  if (document.getElementById('embedded-chatbot-container')) {
    console.warn('Widget already initialized');
    return;
  }

  const config = (window as any).embeddedChatbotConfig;
  if (!config || !config.agentId || !config.domain) {
    console.error('EmbeddedChatbotConfig is missing or incomplete.');
    return;
  }

  const container = document.createElement('div');
  container.id = 'embedded-chatbot-container';
  
  // Add isolation attributes
  container.setAttribute('data-widget', 'flowon-chatbot');
  container.style.isolation = 'isolate';
  
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
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
