class TextChatWidget {
  constructor(config = {}) {
    console.log("TextChatWidget constructor called with config:", config);

    this.config = {
      agentId: config.agentId || "null",
      widgetDomain: config.widgetDomain || "/textwidget",
      iframeDomain: config.iframeDomain || "iframe_domain_not_defined",
      position: config.position || "right",
    };

    this.isExpanded = false;
    this.isMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;
    this.chatUi = null;
    this.agentLogo = null;

    console.log("Initial config:", this.config);

    // Initialize first, then fetch metadata
    this.init();
    this.fetchAgentMetadata();
    this.setupMessageListener();
  }

  async fetchAgentMetadata() {
    console.log("Fetching agent metadata...");
    console.log("Agent ID:", this.config.agentId);
    console.log("Widget Domain:", this.config.widgetDomain);

    try {
      const url = `${this.config.widgetDomain}/api/agent_content/${this.config.agentId}`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("HAHAHAH hhh test:", data);

      if (data.data?.[0]) {
        this.chatUi = {
          primaryColor: data.data[0].chat_ui?.primaryColor || "#000000",
          secondaryColor: data.data[0].chat_ui?.secondaryColor || "#FFFFFF",
        };
        this.agentLogo = data.data[0].agent_logo;

        console.log("Updated chatUi:", this.chatUi);
        console.log("Updated agentLogo:", this.agentLogo);

        // Update the existing button with new styles and logo
        this.updateWidget();
      }
    } catch (error) {
      console.error("Error fetching agent metadata:", error);
    }
  }

  updateWidget() {
    console.log("Updating widget with new styles and logo");

    // Update button styles
    const button = this.container.querySelector(".text-chat-widget-button");
    if (button) {
      button.style.backgroundColor = this.chatUi?.primaryColor || "#000000";
      button.style.color = this.chatUi?.secondaryColor || "#FFFFFF";
    }

    // Update logo
    const chatIcon = this.container.querySelector(
      ".text-chat-widget-icon.chat"
    );
    if (chatIcon && this.agentLogo) {
      chatIcon.innerHTML = `<img src="${this.agentLogo}" alt="Chat Icon">`;
      console.log("Logo updated to:", this.agentLogo);
    } else {
      console.log("Using fallback logo");
      chatIcon.innerHTML = `<img src="${this.config.iframeDomain}/live-chat.png" alt="Live Chat">`;
    }
  }

  init() {
    console.log("Initializing widget...");

    // Basic styles
    const styles = `
      .text-chat-widget-button {
        position: fixed;
        ${this.config.position}: 20px;
        bottom: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 2147483646;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .text-chat-widget-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        overflow: hidden;
      }

      .text-chat-widget-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .text-chat-widget-icon.arrow {
        display: none;
      }

      .text-chat-widget-container.expanded .text-chat-widget-icon.chat {
        display: none;
      }

      .text-chat-widget-container.expanded .text-chat-widget-icon.arrow {
        display: flex;
      }

      // ... rest of your styles ...
    `;

    // Create container with initial collapsed state
    this.container = document.createElement("div");
    this.container.className = "text-chat-widget-container collapsed";

    // Add chat icon and iframe with dynamic logo
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
          <img src="${this.config.iframeDomain}/live-chat.png" alt="Live Chat">
        </div>
        <div class="text-chat-widget-icon arrow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14l5-5 5 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `;

    // Add click handlers
    const chatButton = this.container.querySelector(".text-chat-widget-button");
    chatButton.addEventListener("click", () => this.toggleWidget());

    const closeButton = this.container.querySelector(
      ".text-chat-widget-close-btn"
    );
    closeButton.addEventListener("click", () => this.toggleWidget());

    // Add styles and container to DOM
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(this.container);

    // Add a load event listener to the iframe
    const iframe = this.container.querySelector(".text-chat-widget-iframe");
    iframe.addEventListener("load", () => {
      this.iframeLoaded = true;
      this.injectIframeStyles();
    });

    console.log("Widget initialized");
  }

  toggleWidget() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.container.classList.remove("collapsed");
      this.container.classList.add("expanded");
      if (this.isMobile) {
        // Prevent all scrolling and bouncing effects
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.height = "100%";

        // Store the current scroll position
        this.scrollPosition = window.pageYOffset;
        document.body.style.top = `-${this.scrollPosition}px`;
      }
    } else {
      this.container.classList.remove("expanded");
      this.container.classList.add("collapsed");
      if (this.isMobile) {
        // Restore scrolling and position
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
        document.body.style.top = "";

        // Restore scroll position
        window.scrollTo(0, this.scrollPosition);
      }
    }
  }

  injectIframeStyles() {
    const iframe = this.container.querySelector(".text-chat-widget-iframe");
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
      const styleElement = document.createElement("style");
      styleElement.textContent = styles;
      iframe.contentDocument.head.appendChild(styleElement);
    } catch (e) {
      // If direct injection fails due to same-origin policy, use message passing
      iframe.contentWindow.postMessage(
        {
          type: "INJECT_STYLES",
          styles: styles,
        },
        "*"
      );
    }
  }

  setupMessageListener() {
    window.addEventListener("message", (event) => {
      console.log("Message received:", event.data);

      // If the iframe is requesting style injection
      if (event.data.type === "READY_FOR_STYLES" && this.iframeLoaded) {
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
