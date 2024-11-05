class ChatWidget {
  constructor(config = {}) {
    if (window.self !== window.top) {
      return; // Exit if we're inside an iframe
    }

    this.config = {
      chatbotId: config.chatbotId || 'default',
      buttonColor: config.buttonColor || '#2563eb',
      theme: config.theme || 'light',
      position: config.position || 'right',
      buttonIcon: config.buttonIcon || '<i class="fa-solid fa-microphone-lines"></i>',
    };
    
    this.isOpen = false;
    this.init();

    // Add error handling
    window.addEventListener('message', (event) => {
      if (event.data.type === 'PERMISSION_ERROR') {
        console.warn('Permission denied:', event.data.error);
        // Handle the error appropriately
      }
    });
  }

  init() {
    // Create iframe and inject styles
    const styles = `
      .chat-widget-button {
        position: fixed;
        ${this.config.position}: 20px;
        bottom: 20px;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        background-color: ${this.config.buttonColor};
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
        z-index: 9999;
      }

      .chat-widget-button:hover {
        transform: scale(1.5) !important;
      }

      .chat-widget-icon {
        width: 50px;
        height: 50px;
        color: white;
        font-size: 35px;
      }

      .chat-widget-container {
        position: fixed;
        ${this.config.position}: 20px;
        bottom: 90px;
        width: 450px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
        display: none;
        z-index: 9999;
        overflow: hidden;
      }

      .chat-widget-header {
        padding: 15px;
        background: linear-gradient(135deg, #000000, #333333, #808080);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .chat-widget-close {
        cursor: pointer;
        font-size: 40px;
      }

      .chat-widget-iframe {
        width: 100%;
        height: calc(100% - 50px);
        border: none;
      }

      @media (max-width: 640px) {
        .chat-widget-container {
          width: 100%;
          height: 100%;
          ${this.config.position}: 0;
          bottom: 0;
          border-radius: 0;
        }
      }

      [data-theme="dark"] .chat-widget-container {
        background: #1f2937;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create button
    this.button = document.createElement('div');
    this.button.className = 'chat-widget-button';
    this.button.innerHTML = this.config.buttonIcon;
    
    // Create iframe chat container
    this.container = document.createElement('div');
    this.container.className = 'chat-widget-container';
    if (this.config.theme === 'dark') {
      this.container.setAttribute('data-theme', 'dark');
    }

    // Create header and iframe with permissions
    this.container.innerHTML = `
      <div class="chat-widget-header">
        <span>Chat</span>
        <span class="chat-widget-close">×</span>
      </div>
      <iframe 
        class="chat-widget-iframe"
        src="http://localhost:3001"
        allow="microphone; camera; display-capture"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      ></iframe>
    `;

    // Add event listeners
    this.button.addEventListener('click', () => this.toggleChat());
    this.container.querySelector('.chat-widget-close')
      .addEventListener('click', () => this.toggleChat());

    // Append elements to DOM
    document.body.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container.style.display = this.isOpen ? 'block' : 'none';
  }
}

// Make it globally available
window.ChatWidget = ChatWidget; 