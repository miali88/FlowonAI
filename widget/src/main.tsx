import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ChatBotMini from './components/ChatBotMini';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
// import './index.css';
import './styles.css';

const WIDGET_NAMESPACE = 'FlowonWidget';

// Add new ShadowContainer component
const ShadowContainer: React.FC<{
  agentId: string;
  domain: string;
}> = ({ agentId, domain }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: 'open' });
      
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = new URL('./styles.css', import.meta.url).href;
      shadowRef.current.appendChild(linkElement);

      const container = document.createElement('div');
      container.id = 'flowon-shadow-root';
      shadowRef.current.appendChild(container);

      const eventBridge = {
        dispatchHostEvent: (eventName: string, detail: any) => {
          const event = new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            detail
          });
          hostRef.current?.dispatchEvent(event);
        }
      };

      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <Layout>
            <ErrorBoundary>
              <WidgetContent 
                agentId={agentId} 
                domain={domain}
                eventBridge={eventBridge}
              />
            </ErrorBoundary>
          </Layout>
        </React.StrictMode>
      );
    }
  }, [agentId, domain]);

  return <div ref={hostRef} className="flowon-widget-root" />;
};

// Replace App with WidgetContent
interface WidgetContentProps {
  agentId: string;
  domain: string;
  eventBridge: {
    dispatchHostEvent: (eventName: string, detail: any) => void;
  };
}

function WidgetContent({ agentId, domain, eventBridge }: WidgetContentProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStreamEnd = () => {
    console.log('Stream ended');
    eventBridge.dispatchHostEvent('flowon-stream-end', {
      agentId,
      timestamp: new Date().toISOString()
    });
  };

  const handleStreamStart = () => {
    console.log('Stream started');
    eventBridge.dispatchHostEvent('flowon-stream-start', {
      agentId,
      timestamp: new Date().toISOString()
    });
  };

  return (
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
      eventBridge={eventBridge}
    />
  );
}

// Update initializeWidget function
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
      <ShadowContainer 
        agentId={config.agentId} 
        domain={config.domain} 
      />
    </React.StrictMode>
  );

  // Mark as initialized
  (window as any)[WIDGET_NAMESPACE] = {
    initialized: true,
    initialize: initializeWidget,
    version: process.env.WIDGET_VERSION
  };

  setupGlobalEventListeners();
};

// Add setupGlobalEventListeners function
const setupGlobalEventListeners = () => {
  document.addEventListener('flowon-stream-start', (e: CustomEvent) => {
    console.log('Stream started:', e.detail);
  });

  document.addEventListener('flowon-stream-end', (e: CustomEvent) => {
    console.log('Stream ended:', e.detail);
  });

  document.addEventListener('flowon-error', (e: CustomEvent) => {
    console.error('Flowon error:', e.detail);
  });
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
