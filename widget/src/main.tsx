import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ChatBotMini from './components/ChatBotMini';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
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
      try {
        shadowRef.current = hostRef.current.attachShadow({ mode: 'open' });
        
        // Create wrapper div with class for scoping
        const wrapper = document.createElement('div');
        wrapper.className = 'flowon-widget-wrapper';
        
        // Create and inject styles
        const styles = document.createElement('style');
        
        // Load styles and ensure they're injected before rendering
        import('./styles.css?inline')
          .then(module => {
            // Directly use the imported CSS
            styles.textContent = module.default;
            wrapper.appendChild(styles);
            
            // Create container for React content
            const container = document.createElement('div');
            container.id = 'flowon-shadow-root';
            wrapper.appendChild(container);
            
            // Append wrapper to shadow root
            shadowRef.current?.appendChild(wrapper);

            // Setup event bridge
            const eventBridge = {
              dispatchHostEvent: (eventName: string, detail: any) => {
                const event = new CustomEvent(eventName, {
                  bubbles: true,
                  composed: true,
                  detail
                });
                hostRef.current?.dispatchEvent(event);
              },
              getLiveKitContainer: () => container
            };

            // Render React app only after styles are injected
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
          })
          .catch(error => {
            console.error('Failed to load styles:', error);
            throw error;
          });
      } catch (error) {
        console.error('Failed to attach Shadow DOM:', error);
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
        
        eventBridge.dispatchHostEvent('flowon-error', {
          error: 'Failed to attach Shadow DOM',
          details: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
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
      eventBridge={eventBridge}
    />
  );
}
// Update initializeWidget function
const initializeWidget = (containerId: string) => {
  try {
    console.debug('Initializing widget...');
    
    // Prevent multiple initializations
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

    // Mark as initialized
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

// Add setupGlobalEventListeners function
const setupGlobalEventListeners = () => {
  document.addEventListener('flowon-stream-start', ((e: Event) => {
    console.log('Stream started:', (e as CustomEvent).detail);
  }) as EventListener);

  document.addEventListener('flowon-stream-end', ((e: Event) => {
    console.log('Stream ended:', (e as CustomEvent).detail);
  }) as EventListener);

  document.addEventListener('flowon-error', ((e: Event) => {
    console.error('Flowon error:', (e as CustomEvent).detail);
  }) as EventListener);
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

