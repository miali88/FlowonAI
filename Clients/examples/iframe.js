class ChatWidget {
    constructor(config = {}) {
      this.config = {
        agentId: config.agentId || 'null',
        domain: config.domain || 'http://localhost:5173',
        position: config.position || 'right',
      };
      
      this.init();
      this.setupMessageListener();
    }
  
    init() {
      // Basic styles
      const styles = `
        .chat-widget-container {
          position: fixed;
          ${this.config.position}: 20px;
          bottom: 20px;
          width: 250px;
          height: 100px;
          background: white;
          border-radius: 16px;
          display: block;
          z-index: 9999;
          border: 1px solid #ccc;
        }
  
        .chat-widget-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 16px;
        }
  
        @media (max-width: 640px) {
          .chat-widget-container {
            width: 100%;
            height: 100vh;
            ${this.config.position}: 0;
            bottom: 0;
            border-radius: 16px 16px 0 0;
            border: 1px solid #ccc;
          }
          
          .chat-widget-iframe {
            border-radius: 16px 16px 0 0;
          }
        }
      `;
  
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
  
      // Create container
      this.container = document.createElement('div');
      this.container.className = 'chat-widget-container';
  
      // Create iframe
      this.container.innerHTML = `
        <iframe 
          class="chat-widget-iframe"
          src="${this.config.domain}?agentId=${this.config.agentId}"
          allow="microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          crossorigin="anonymous"
        ></iframe>
      `;
  
      // Add to DOM (only the container)
      document.body.appendChild(this.container);
    }
  
    setupMessageListener() {
      window.addEventListener('message', (event) => {
        console.log('Received message:', event.data);
        console.log('Message origin:', event.origin);
        console.log('Expected domain:', this.config.domain);
  
        if (event.origin !== this.config.domain) {
          console.log('Origin mismatch - message ignored');
          return;
        }
  
        if (event.data.type === 'SHOW_FORM_FIELDS') {
          console.log('Showing form fields - adjusting height to 400px');
          this.container.style.height = '400px';
        }
      });
    }
  }
  
  window.ChatWidget = ChatWidget;