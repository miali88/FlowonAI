// Modified embed.ts

(() => {
  const WIDGET_NAMESPACE = 'FlowonWidget';
  const DEV_DOMAIN = 'localhost:5173';
  
  const createWidget = () => {
    // Get configuration
    const config = (window as any).embeddedChatbotConfig || {};
    const isDevelopment = true; // Force development mode for testing
    
    const domain = isDevelopment ? DEV_DOMAIN : config.domain;
    const protocol = isDevelopment ? 'http:' : 'https:';
    const { agentId } = config;

    if (!agentId) {
      console.error('Widget Error: agentId is required');
      return;
    }

    // Create widget container
    const container = document.createElement('div');
    container.id = 'flowon-widget-container';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '999999'
    });

    // Create and setup iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'flowon-iframe';
    Object.assign(iframe.style, {
      width: '360px',
      height: '600px',
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
    });

    // Set iframe source
    const mainUrl = new URL('/src/main.tsx', `${protocol}//${domain}`);
    mainUrl.searchParams.set('agentId', agentId);
    iframe.src = mainUrl.toString();

    // Append elements
    container.appendChild(iframe);
    document.body.appendChild(container);
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

  // Expose initialize function globally
  (window as any)[WIDGET_NAMESPACE] = { initialize: createWidget };
})();

export {};