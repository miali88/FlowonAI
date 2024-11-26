export interface ChatbotConfig {
    domain?: string;
    agentId: string;
  }
  
  declare global {
    const embeddedChatbotConfig: ChatbotConfig | undefined;
    interface Window {
      FlowonWidget: FlowonWidget;
    }
  }
  
  export interface FlowonWidget {
    initialized: boolean;
    initialize: (containerId?: string) => void;
    version: string | undefined;
  }