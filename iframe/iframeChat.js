class ChatWidget {
  constructor(config = {}) {
    this.config = {
      agentId: config.agentId || 'null',
      domain: config.domain || 'http://localhost:3001',
      position: config.position || 'right',
    };
    
    this.isOpen = false;
    this.init();
  }

  init() {
    // Basic styles
    const styles = `
      .chat-widget-button {
        position: fixed;
        ${this.config.position}: 20px;
        bottom: 20px;
        width: 50px;
        height: 50px;
        background: #8b5cf6;
        border-radius: 50%;
        cursor: pointer;
        z-index: 9999;
      }

      .chat-widget-container {
        position: fixed;
        ${this.config.position}: 20px;
        bottom: 80px;
        width: 400px;
        height: 500px;
        background: white;
        border-radius: 10px;
        display: none;
        z-index: 9999;
      }

      .chat-widget-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }

      @media (max-width: 640px) {
        .chat-widget-container {
          width: 100%;
          height: 100vh;
          ${this.config.position}: 0;
          bottom: 0;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create button
    this.button = document.createElement('div');
    this.button.className = 'chat-widget-button';
    
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'chat-widget-container';

    // Create iframe
    this.container.innerHTML = `
      <iframe 
        class="chat-widget-iframe"
        src="${this.config.domain}/chat-widget/${this.config.agentId}"
        allow="microphone; camera"
        sandbox="allow-same-origin allow-scripts allow-forms"
      ></iframe>
    `;

    // Add click handler
    this.button.addEventListener('click', () => this.toggleChat());

    // Add to DOM
    document.body.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.container.style.display = this.isOpen ? 'block' : 'none';
  }
}

window.ChatWidget = ChatWidget;