(function() {
  "use strict";

  class ChatWidget {
    constructor(options = {}) {
      this.config = {
        agentId: options.agentId || "null",
        domain: options.domain || "http://localhost:3001",
        position: options.position || "right"
      };
      this.isOpen = false;
      this.init();
    }

    init() {
      // Create and append styles
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
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
          transform: scale(1);
          animation: pulse 2s infinite;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .chat-widget-icon {
          width: 24px;
          height: 24px;
        }

        .chat-widget-close-icon {
          display: none;
          font-size: 24px;
          font-weight: bold;
        }

        .chat-widget-button-active .chat-widget-mic-icon {
          display: none;
        }

        .chat-widget-button-active .chat-widget-close-icon {
          display: block;
        }

        .chat-widget-button-active {
          animation: none !important;
          transform: scale(1) !important;
          box-shadow: none !important;
        }

        .chat-widget-button:hover:not(.chat-widget-button-active) {
          transform: scale(1.1);
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
          }
        }

        .chat-widget-container {
          position: fixed;
          ${this.config.position}: 20px;
          bottom: 80px;
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 10px;
          display: none;
          z-index: 9999;
        }

        .chat-widget-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 10px;
        }

        @media (max-width: 640px) {
          .chat-widget-container {
            width: 100%;
            height: 100vh;
            ${this.config.position}: 0;
            bottom: 0;
            border-radius: 10px 10px 0 0;
          }
          
          .chat-widget-iframe {
            border-radius: 10px 10px 0 0;
          }
        }
      `;
      const styleElement = document.createElement("style");
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);

      // Create button and container elements
      this.button = document.createElement("div");
      this.button.className = "chat-widget-button";
      this.button.innerHTML = `
        <svg class="chat-widget-icon chat-widget-mic-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <svg class="chat-widget-icon chat-widget-close-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      `;

      this.container = document.createElement("div");
      this.container.className = "chat-widget-container";
      this.container.innerHTML = `
        <iframe 
          class="chat-widget-iframe"
          src="${this.config.domain}/chat-widget/${this.config.agentId}"
          allow="microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms"
        ></iframe>
      `;

      // Use arrow function to preserve 'this' context
      this.button.addEventListener("click", () => this.toggleChat());

      document.body.appendChild(this.button);
      document.body.appendChild(this.container);
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.container.style.display = this.isOpen ? "block" : "none";
      if (this.isOpen) {
        this.button.classList.add("chat-widget-button-active");
      } else {
        this.button.classList.remove("chat-widget-button-active");
      }
    }
  }

  window.ChatWidget = ChatWidget;
})();