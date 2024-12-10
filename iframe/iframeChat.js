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
          width: 80%;
          max-width: 300px;
          height: 100px;
          ${this.config.position}: 10px;
          bottom: 10px;
          border-radius: 16px;
        }
        
        .chat-widget-iframe {
          border-radius: 16px;
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
      const expectedDomain = window.location.origin;
      console.log('Received message:', event.data);
      console.log('Message origin:', event.origin);
      console.log('Expected domain:', expectedDomain);

      // TODO: should we check the origin?
      // if (event.origin !== expectedDomain) {
      //   console.log('Origin mismatch - message ignored');
      //   return;
      // }

      if (event.data.type === 'SHOW_FORM_FIELDS') {
        console.log('Showing form fields - adjusting height to 400px');
        this.container.style.height = '400px';
        this.container.style.width = '350px';

      } else if (event.data.type === 'HIDE_FORM_FIELDS') {
        console.log('Hiding form fields - adjusting height to 100px');
        this.container.style.height = '100px';
        this.container.style.width = '250px';
      } else {
        console.log('Message type not recognized:', event.data.type);
      }
    });
  }
}

window.ChatWidget = ChatWidget;