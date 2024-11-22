import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ChatBotMini from './components/ChatBotMini';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import styles from './components/ChatWidget.module.css';

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
        
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(`
          :host {
            all: initial;
            display: block;
            width: 100%;
            height: 100%;
          }
          
          .${styles.widgetWrapper} {
            all: initial;
            font-family: system-ui, -apple-system, sans-serif;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .${styles.chatContainer} {
            width: 100%;
            height: 100vh;
            background: var(--widget-bg-color);
            border: 1px solid var(--widget-border-color);
            border-radius: var(--widget-radius);
            box-shadow: 0 8px 32px var(--widget-shadow-color);
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .${styles.footer} {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            padding: 0 16px;
            background: var(--widget-bg-color);
            border-top: 1px solid var(--widget-border-color);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
          }
          
          .${styles.footerLogo} {
            width: 24px;
            height: 24px;
            object-fit: contain;
          }
          
          .${styles.footerText} {
            color: var(--widget-text-color);
            font-size: 14px;
            margin-left: 8px;
            font-family: var(--widget-font-family);
          }
          
          .${styles.streamButtonContainer} {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            position: absolute;
            top: 60%;
            left: 50%;
            transform: translateX(-50%);
            z-index: 5;
          }
          
          .${styles.streamButtonContainer} button {
            position: relative;
            width: 84px;
            height: 84px;
            border-radius: 50%;
            background: linear-gradient(
              45deg,
              rgba(19, 100, 246, 0.6),
              rgba(147, 51, 234, 0.6),
              rgba(236, 12, 153, 0.6)
            );
            background-size: 300% 300%;
            animation: gradientMove 5s ease infinite;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 300ms ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(31, 41, 55, 0.2);
          }
          
          @keyframes gradientMove {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          .${styles.streamButtonContainer} button:hover {
            background: rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
          }
          
          .${styles.streamButtonContainer} button:focus {
            outline: none;
            ring: 2px solid rgba(59, 130, 246, 0.5);
          }
          
          .${styles.streamButtonContainer} button svg {
            width: 40px;
            height: 40px;
            color: white;
            transition: all 300ms ease-in-out;
          }
          
          .${styles.streamButtonContainer} button[disabled] {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .${styles.streamButtonContainer} button.streaming {
            background: rgba(59, 130, 246, 0.3);
          }
          
          .${styles.streamButtonContainer} button.streaming svg {
            opacity: 0.5;
          }
          
          .${styles.streamButtonRing} {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.2);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
          
          .${styles.footerContent} {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: inherit;
          }
          
          .${styles.formContainer} {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 20px;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .${styles.formField} {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .${styles.formField} label {
            font-size: 14px;
            font-weight: 500;
            color: var(--widget-text-color, #1f2937);
          }
          
          .${styles.formField} input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--widget-border-color, rgba(0, 0, 0, 0.1));
            border-radius: 6px;
            font-size: 14px;
            background: var(--widget-bg-color, #ffffff);
            color: var(--widget-text-color, #1f2937);
          }
          
          .${styles.formField} input:focus {
            outline: none;
            border-color: var(--widget-accent-color, #000000);
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          }
          
          .${styles.submitButton} {
            background: var(--widget-accent-color, #000000);
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            max-width: 200px;
          }
          
          .${styles.submitButton}:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          
          .${styles.submitButton}:active {
            transform: translateY(0);
          }
          
          .privacy-link {
            font-size: 12px;
            color: var(--widget-text-color);
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.2s ease;
          }
          
          .privacy-link:hover {
            opacity: 1;
          }
        `);
        shadowRef.current.adoptedStyleSheets = [styleSheet];
        
        const wrapper = document.createElement('div');
        wrapper.className = `${styles.widgetTheme} ${styles.widgetWrapper}`;
        wrapper.style.cssText = `
          --widget-font-family: system-ui, -apple-system, sans-serif;
          --widget-bg-color: #C0C0C0;
          --widget-border-color: #e0e0e0;
          --widget-shadow-color: rgba(0, 0, 0, 0.1);
          --widget-text-color: #333;
          --widget-accent-color: #333;
          --widget-radius: 0px;
          --widget-padding: 20px;
          display: block;
          width: 100%;
          height: 100%;
          background: #C0C0C0;
        `;
        
        const container = document.createElement('div');
        container.id = 'flowon-shadow-root';
        container.style.cssText = `
          display: block;
          width: 100%;
          height: 100%;
        `;
        
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
      bypassShowChatInputCondition={false}
      localParticipant={null}
      setLocalParticipant={() => {}}
      eventBridge={eventBridge}
    />
  );
}

const initializeWidget = (containerId: string) => {
  try {
    console.debug('Initializing widget...');
    
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

const MainWidget = () => {
  useEffect(() => {
    if (!(window as any)[WIDGET_NAMESPACE]?.initialized) {
      initializeWidget('embedded-chatbot-container');
    }
  }, []);

  return null;
};

export default MainWidget;
