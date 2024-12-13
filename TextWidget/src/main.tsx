import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TextWidget from './text-widget/TextWidget'

const WIDGET_NAMESPACE = 'FlowonWidget';
const WIDGET_VERSION = '1.0.0';

const initializeWidget = (containerId: string) => {
  try {
    console.debug('Initializing widget...');
    
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    const config = (window as any).embeddedChatbotConfig;
    if (!config?.agentId) {
      throw new Error('Invalid or missing embeddedChatbotConfig: agentId is required');
    }

    createRoot(container).render(
      <StrictMode>
        <TextWidget 
          agentId={config.agentId}
          apiBaseUrl={import.meta.env.VITE_API_BASE_URL || 'please set VITE_API_BASE_URL'}
          suggestedQuestions={[
            "What services do you offer?",
            "How can I get started?",
            "Tell me more about your company",
          ]}
        />
      </StrictMode>
    );

    (window as any)[WIDGET_NAMESPACE] = {
      initialized: true,
      initialize: initializeWidget,
      version: WIDGET_VERSION
    };

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

if (typeof window !== 'undefined') {
  const container = document.getElementById('embedded-chatbot-container');
  if (container && !(window as any)[WIDGET_NAMESPACE]?.initialized) {
    initializeWidget('embedded-chatbot-container');
  }
}
