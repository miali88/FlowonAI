class ChatWidget {
  constructor(config = {}) {
    if (window.self !== window.top) {
      return; // Exit if we're inside an iframe
    }

    // Add Font Awesome CSS
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);


    this.config = {
      agentId: config.agentId || 'null',
      domain: config.domain || 'http://localhost:3001',
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
        bottom: 100px;
        width: 55px;
        height: 55px;
        border-radius: 50%;
        background-color: rgba(108, 117, 125, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 9999;
        border: 1px solid rgba(255, 255, 255, 0.18);
        animation: ${this.isOpen ? 'none' : 'pulse 2s infinite'};
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }
        50% {
          transform: scale(1.1);
          box-shadow: 0 0 25px rgba(108, 117, 125, 0.5);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }
      }

      .chat-widget-button:hover {
        transform: scale(1.3) !important;
        animation: none;
      }

      .chat-widget-icon {
        width: 50px;
        height: 50px;
        color: white;
        font-size: 35px;
      }

      i.fa-solid.fa-microphone-lines,
      i.fa-solid.fa-xmark {
        color: white;
      }

      .chat-widget-container {
        position: fixed;
        ${this.config.position}: 20px;
        bottom: 170px;
        width: 450px;
        height: 600px;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        display: none;
        z-index: 9999;
        overflow: hidden;
      }

      .chat-widget-header {
        padding: 15px;
        background: linear-gradient(135deg, 
          rgba(0, 0, 0, 0.6), 
          rgba(51, 51, 51, 0.6), 
          rgba(128, 128, 128, 0.6)
        );
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        height: 60px;
        box-sizing: border-box;
      }

      .chat-widget-iframe {
        width: 100%;
        height: calc(100% - 60px);
        border: none;
        display: block;
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
        background: rgba(31, 41, 55, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.12);
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

    // Create header and iframe with correct permissions
    this.container.innerHTML = `
      <div class="chat-widget-header">
        <span>Flowon</span>
      </div>
      <iframe 
        class="chat-widget-iframe"
        src="${this.config.domain}/${this.config.apiBase}/${this.config.agentId}/index.html"
        allow="microphone *; camera *"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      ></iframe>
    `;

    // Add event listeners
    this.button.addEventListener('click', () => this.toggleChat());

    // Append elements to DOM
    document.body.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container.style.display = this.isOpen ? 'block' : 'none';
    
    // Toggle button icon between microphone and X
    this.button.innerHTML = this.isOpen 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : this.config.buttonIcon;
    
    // Toggle animation
    this.button.style.animation = this.isOpen ? 'none' : 'pulse 2s infinite';
  }
}

// Make it globally available
window.ChatWidget = ChatWidget;