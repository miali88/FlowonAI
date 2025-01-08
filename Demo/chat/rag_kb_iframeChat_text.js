class TextChatWidget {
  constructor(config = {}) {
    this.config = {
      agentId: config.agentId || 'null',
      widgetDomain: config.widgetDomain || '/textwidget',
      iframeDomain: config.iframeDomain || 'iframe_domain_not_defined',
      position: config.position || 'right',
    };
    
    this.isExpanded = true;
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    });
    
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(viewport);
    }
    
    this.iframeLoaded = false;
    this.init();
    this.setupMessageListener();
  }

  init() {
    // Updated styles to include both collapsed and expanded states
    const styles = `
      .text-chat-widget-container {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
      }

      .text-chat-widget-container .chat-frame {
        position: relative;
        width: 430px;
        aspect-ratio: 9/16;
        border-radius: 12px;
        background: white;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        opacity: 1;
        visibility: visible;
        bottom: 0;
      }

      .text-chat-widget-button {
        display: none; /* Hide the mini icon */
      }

      .text-chat-widget-iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
      }

      @media (max-width: 768px), (hover: none) {
        .text-chat-widget-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          margin: 0;
          padding: 0;
          transform: none;
        }

        .text-chat-widget-container .chat-frame {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 0;
        }
      }
    `;

    // Create container with initial collapsed state
    this.container = document.createElement('div');
    this.container.className = 'text-chat-widget-container expanded';
    
    // Add chat icon and iframe
    this.container.innerHTML = `
      <div class="chat-frame">
        <iframe 
          class="text-chat-widget-iframe"
          src="${this.config.widgetDomain}/?agentId=${this.config.agentId}"
          allow="microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          crossorigin="anonymous"
        ></iframe>
      </div>
      <div class="text-chat-widget-button">
        <div class="text-chat-widget-icon chat">
          <img src="https://flowon.ai/icons/live-chat.png" alt="Live Chat">
        </div>
        <div class="text-chat-widget-icon arrow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14l5-5 5 5" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `;

    // After appending the container to the DOM, add the click handler
    const chatButton = this.container.querySelector('.text-chat-widget-button');
    chatButton.addEventListener('click', () => this.toggleWidget());

    // Add styles and container to DOM
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(this.container);

    // Add a load event listener to the iframe
    const iframe = this.container.querySelector('.text-chat-widget-iframe');
    iframe.addEventListener('load', () => {
      this.iframeLoaded = true;
      this.injectIframeStyles();
    });
  }

  toggleWidget() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.container.classList.remove('collapsed');
      this.container.classList.add('expanded');
      if (this.isMobile) {
        // Prevent all scrolling and bouncing effects
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        
        // Store the current scroll position
        this.scrollPosition = window.pageYOffset;
        document.body.style.top = `-${this.scrollPosition}px`;
      }
    } else {
      this.container.classList.remove('expanded');
      this.container.classList.add('collapsed');
      if (this.isMobile) {
        // Restore scrolling and position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.top = '';
        
        // Restore scroll position
        window.scrollTo(0, this.scrollPosition);
      }
    }
  }

  injectIframeStyles() {
    const iframe = this.container.querySelector('.text-chat-widget-iframe');
    const styles = `
      ._chatContainer_1dfai_1 {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 0 !important;
      }
    `;

    try {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      iframe.contentDocument.head.appendChild(styleElement);
    } catch (e) {
      // If direct injection fails due to same-origin policy, use message passing
      iframe.contentWindow.postMessage({
        type: 'INJECT_STYLES',
        styles: styles
      }, '*');
    }
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      console.log('Message received:', event.data);
      
      // If the iframe is requesting style injection
      if (event.data.type === 'READY_FOR_STYLES' && this.iframeLoaded) {
        this.injectIframeStyles();
      }
    });
  }
}

window.TextChatWidget = TextChatWidget;
// # prevent caching of iframe file
// location /demo/chat/iframeChat_text.js {
//     expires off;
//     add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
// }