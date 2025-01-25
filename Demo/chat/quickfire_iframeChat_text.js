class TextChatWidget {
  constructor(config = {}) {
    this.config = {
      agentId: config.agentId || 'null',
      widgetDomain: config.widgetDomain || '/textwidget',
      iframeDomain: config.iframeDomain || 'iframe_domain_not_defined',
      position: config.position || 'right',
    };
    
    this.isExpanded = false;
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
        ${this.config.position}: 20px;
        bottom: 50px;
        z-index: 9999;
      }

      .text-chat-widget-container .chat-frame {
        position: absolute;
        bottom: 90px;
        ${this.config.position}: 0;
        width: 430px;
        aspect-ratio: 9/16;
        border-radius: 12px;
        background: white;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .text-chat-widget-container.expanded .chat-frame {
        opacity: 1;
        visibility: visible;
      }

      .text-chat-widget-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        transition: background 0.3s ease;
      }

      .expanded .text-chat-widget-button {
        background: white;
      }

      .text-chat-widget-icon {
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
      }

      .text-chat-widget-icon.chat {
        display: block;
      }

      .text-chat-widget-icon.arrow {
        display: none;
        transform: rotate(180deg);
      }

      .expanded .text-chat-widget-icon.chat {
        display: none;
      }

      .expanded .text-chat-widget-icon.arrow {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .text-chat-widget-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: none;
      }

      .text-chat-widget-iframe {
        display: none;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
        margin: 0;
        padding: 0;
      }

      .expanded .text-chat-widget-iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
      }

      @media (max-width: 640px) {
        .text-chat-widget-container.expanded {
          width: 90%;
          ${this.config.position}: 10px;
          bottom: 10px;
        }
      }

      /* New Mobile Styles */
      @media (max-width: 768px), (hover: none) {
        .text-chat-widget-container {
          ${this.config.position}: 10px;
          bottom: calc(20px + env(safe-area-inset-bottom));
        }

        .text-chat-widget-button {
          width: 50px;
          height: 50px;
          padding: 8px;
        }

        .text-chat-widget-container.expanded {
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
          ${this.config.position}: 0;
          padding-bottom: env(safe-area-inset-bottom);
          padding-top: env(safe-area-inset-top);
          z-index: 2147483647;
        }

        .text-chat-widget-container.expanded .chat-frame {
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
          transform: none;
          z-index: 2147483647;
        }

        .text-chat-widget-container.expanded .text-chat-widget-iframe {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 0;
          transform: none;
          z-index: 2147483647;
        }

        .text-chat-widget-container .close-button {
          display: none;
        }

        .text-chat-widget-container.expanded .close-button {
          display: none;
        }
      }

      /* Base close button styles */
      .text-chat-widget-close-btn {
        display: none;  /* Hidden by default */
        position: fixed;  /* Always fixed position */
        top: 20px;
        right: 20px;
        width: 40px;  /* Slightly larger for better touch target */
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
        border: none;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
      }

      /* Remove any conflicting mobile styles elsewhere */
      @media (max-width: 768px), (hover: none) {
        .text-chat-widget-container.expanded .text-chat-widget-close-btn {
          display: flex !important;  /* Force display on mobile */
        }

        /* Ensure iframe is below the close button */
        .text-chat-widget-container.expanded .chat-frame,
        .text-chat-widget-container.expanded .text-chat-widget-iframe {
          z-index: 2147483646;
        }
      }

      /* Remove any other close button related styles in other media queries */

      .text-chat-widget-close-btn:hover {
        background: rgba(0, 0, 0, 0.2);
      }

      .text-chat-widget-close-btn svg {
        width: 16px;
        height: 16px;
      }
    `;

    // Create container with initial collapsed state
    this.container = document.createElement('div');
    this.container.className = 'text-chat-widget-container collapsed';
    
    // Add chat icon and iframe
    this.container.innerHTML = `
      <div class="chat-frame">
        <button class="text-chat-widget-close-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
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

    // Add click handler for close button
    const closeButton = this.container.querySelector('.text-chat-widget-close-btn');
    closeButton.addEventListener('click', () => this.toggleWidget());

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