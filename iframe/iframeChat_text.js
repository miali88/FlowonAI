class ChatWidget {
  constructor(config = {}) {
    this.config = {
      agentId: config.agentId || 'null',
      domain: config.domain || 'http://localhost:5173',
      position: config.position || 'right',
    };
    
    this.isExpanded = false;
    this.init();
    this.setupMessageListener();
  }

  init() {
    // Updated styles to include both collapsed and expanded states
    const styles = `
      .chat-widget-container {
        position: fixed;
        ${this.config.position}: 20px;
        bottom: 20px;
        transition: all 0.3s ease;
        z-index: 9999;
      }

      .chat-widget-container.collapsed {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        cursor: pointer;
        background: #007bff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .chat-widget-container.expanded {
        width: 100%;
        max-width: 400px;
        aspect-ratio: 9/16;
        border-radius: 12px;
        background: white;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
      }

      .chat-widget-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: white;
        font-size: 24px;
      }

      .chat-widget-iframe {
        display: none;
      }

      .expanded .chat-widget-icon {
        display: none;
      }

      .expanded .chat-widget-iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
      }

      @media (max-width: 640px) {
        .chat-widget-container.expanded {
          width: 90%;
          ${this.config.position}: 10px;
          bottom: 10px;
        }
      }
    `;

    // Create container with initial collapsed state
    this.container = document.createElement('div');
    this.container.className = 'chat-widget-container collapsed';
    
    // Add chat icon and iframe
    this.container.innerHTML = `
      <div class="chat-widget-icon">💬</div>
      <iframe 
        class="chat-widget-iframe"
        src="${this.config.domain}?agentId=${this.config.agentId}"
        allow="microphone; camera"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        crossorigin="anonymous"
      ></iframe>
    `;

    // Add click handler
    this.container.addEventListener('click', () => this.toggleWidget());

    // Add styles and container to DOM
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(this.container);
  }

  toggleWidget() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.container.classList.remove('collapsed');
      this.container.classList.add('expanded');
    } else {
      this.container.classList.remove('expanded');
      this.container.classList.add('collapsed');
    }
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Keep the message listener as is, but remove the height adjustments
      // since we're using aspect-ratio now
      console.log('Message received:', event.data);
    });
  }
}

window.ChatWidget = ChatWidget;