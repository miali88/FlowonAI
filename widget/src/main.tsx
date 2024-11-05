import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ChatBotMini from './components/ChatBotMini';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import './index.css';

const WIDGET_NAMESPACE = 'FlowonWidget';

// App component moved directly into main.tsx
function App({ agentId, domain, containerId = 'flowon-widget-root' }: {
  agentId: string;
  domain: string;
  containerId?: string;
}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStreamEnd = () => {
    console.log('Stream ended');
  };

  const handleStreamStart = () => {
    console.log('Stream started');
  };

  return (
    <Layout>
      <div
        id={containerId}
        className="flowon-widget-container"
        style={{
          isolation: 'isolate',
          all: 'unset',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      >
        <ErrorBoundary>
          <ChatBotMini
            agentId={agentId}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            isLiveKitActive={isLiveKitActive}
            setIsLiveKitActive={setIsLiveKitActive}
            token={token}
            setToken={setToken}
            url={url}
            setUrl={setUrl}
            isConnecting={isConnecting}
            setIsConnecting={setIsConnecting}
            onStreamEnd={handleStreamEnd}
            onStreamStart={handleStreamStart}
            bypassShowChatInputCondition={true}
            localParticipant={null}
            setLocalParticipant={() => {}}
            userId="test-user-id"
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}

// Function to initialize the widget
const initializeWidget = (containerId: string) => {
  // Prevent multiple initializations
  if ((window as any)[WIDGET_NAMESPACE]?.initialized) {
    console.warn('Widget already initialized');
    return;
  }

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

  // Mark as initialized
  (window as any)[WIDGET_NAMESPACE] = {
    initialized: true,
    initialize: initializeWidget,
    version: process.env.WIDGET_VERSION
  };
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
