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
        bottom: 50px;
        z-index: 9999;
      }

      .chat-widget-container .chat-frame {
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
        transition: opacity 0.3s ease;
      }

      .chat-widget-container.expanded .chat-frame {
        opacity: 1;
        visibility: visible;
      }

      .chat-widget-button {
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
      }

      .chat-widget-icon {
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
      }

      .chat-widget-icon.chat {
        display: block;
      }

      .chat-widget-icon.arrow {
        display: none;
        transform: rotate(180deg);
      }

      .expanded .chat-widget-icon.chat {
        display: none;
      }

      .expanded .chat-widget-icon.arrow {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chat-widget-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .chat-widget-iframe {
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
      <div class="chat-frame">
        <iframe 
          class="chat-widget-iframe"
          src="${this.config.domain}?agentId=${this.config.agentId}"
          allow="microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          crossorigin="anonymous"
        ></iframe>
      </div>
      <div class="chat-widget-button">
        <div class="chat-widget-icon chat">
          <img src="/live-chat.png" alt="Live Chat">
        </div>
        <div class="chat-widget-icon arrow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14l5-5 5 5" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
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