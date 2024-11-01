import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ChatBotMini from './components/ChatBotMini';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import styles from './styles.css?inline';

const WIDGET_NAMESPACE = 'FlowonWidget';

const ShadowContainer: React.FC<{
  agentId: string;
  domain: string;
}> = ({ agentId, domain }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !shadowRef.current) {
      try {
        shadowRef.current = hostRef.current.attachShadow({ mode: 'open' });
        
        const wrapper = document.createElement('div');
        wrapper.className = 'flowon-widget-wrapper';
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadowRef.current.adoptedStyleSheets = [styleSheet];
        
        const container = document.createElement('div');
        container.id = 'flowon-shadow-root';
        wrapper.appendChild(container);
        
        shadowRef.current.appendChild(wrapper);

        const eventBridge = {
          dispatchHostEvent: <T extends object>(eventName: string, detail: T) => {
            const event = new CustomEvent(eventName, {
              bubbles: true,
              composed: true,
              detail
            });
            hostRef.current?.dispatchEvent(event);
          },
          getLiveKitContainer: () => container
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
      } catch (error) {
        console.error('Failed to attach Shadow DOM:', error);
        const eventBridge = {
          dispatchHostEvent: <T extends object>(eventName: string, detail: T) => {
            const event = new CustomEvent(eventName, {
              bubbles: true,
              composed: true,
              detail
            });
            hostRef.current?.dispatchEvent(event);
          }
        };
        
        eventBridge.dispatchHostEvent('flowon-error', {
          error: 'Failed to attach Shadow DOM',
          details: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    }

    return () => {
      if (shadowRef.current) {
      }
    };
  }, [agentId, domain]);

  return <div ref={hostRef} className="flowon-widget-root" />;
};

interface StreamEvent {
  agentId: string;
  timestamp: string;
}

interface WidgetContentProps {
  agentId: string;
  domain: string;
  eventBridge: {
    dispatchHostEvent: <T extends object>(eventName: string, detail: T) => void;
  };
}

function WidgetContent({ agentId, domain, eventBridge }: WidgetContentProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStreamEnd = () => {
    const eventDetail: StreamEvent = {
      agentId,
      timestamp: new Date().toISOString()
    };
    console.log('Stream ended');
    eventBridge.dispatchHostEvent('flowon-stream-end', eventDetail);
  };

  const handleStreamStart = () => {
    const eventDetail: StreamEvent = {
      agentId,
      timestamp: new Date().toISOString()
    };
    console.log('Stream started');
    eventBridge.dispatchHostEvent('flowon-stream-start', eventDetail);
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
      eventBridge={eventBridge}
    />
  );
}

const initializeWidget = (containerId: string) => {
  try {
    console.debug('Initializing widget...');
    
    if ((window as any)[WIDGET_NAMESPACE]?.initialized) {
      throw new Error('Widget already initialized');
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    const config = (window as any).embeddedChatbotConfig;
    if (!config?.agentId || !config?.domain) {
      throw new Error('Invalid or missing embeddedChatbotConfig');
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

    (window as any)[WIDGET_NAMESPACE] = {
      initialized: true,
      initialize: initializeWidget,
      version: process.env.WIDGET_VERSION
    };

    setupGlobalEventListeners();
    console.debug('Widget initialized successfully');
  } catch (error) {
    console.error('Widget initialization failed:', error);
    document.dispatchEvent(new CustomEvent('flowon-error', {
      bubbles: true,
      composed: true,
      detail: {
        error: 'Widget initialization failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }));
  }
};

const setupGlobalEventListeners = () => {
  document.addEventListener('flowon-stream-start', ((e: CustomEvent<StreamEvent>) => {
    console.log('Stream started:', e.detail);
  }) as EventListener);

  document.addEventListener('flowon-stream-end', ((e: CustomEvent<StreamEvent>) => {
    console.log('Stream ended:', e.detail);
  }) as EventListener);

  document.addEventListener('flowon-error', ((e: CustomEvent<{
    error: string;
    details: string;
    timestamp: string;
  }>) => {
    console.error('Flowon error:', e.detail);
  }) as EventListener);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => 
    initializeWidget('embedded-chatbot-container')
  );
} else {
  initializeWidget('embedded-chatbot-container');
}

(window as any).EmbeddedChatbot = {
  initialize: initializeWidget,
};

