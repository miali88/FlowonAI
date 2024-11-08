import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from '../../AgentHub/AgentCards';
import { LocalParticipant } from "livekit-client";
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const ChatWidget = dynamic(() => import('@/app/chat-widget/[agentId]/components/main'), {
  ssr: false
});

interface PlaygroundProps {
  selectedAgent: Agent | null;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveKitActive: boolean;
  setIsLiveKitActive: React.Dispatch<React.SetStateAction<boolean>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  url: string | null;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  isConnecting: boolean;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  handleStreamEnd: () => void;
  handleStreamStart: () => void;
  localParticipant: LocalParticipant | null;
  setLocalParticipant: React.Dispatch<React.SetStateAction<LocalParticipant | null>>;
}

const Playground: React.FC<PlaygroundProps> = ({
  selectedAgent,
}) => {
  useEffect(() => {
    if (selectedAgent) {
      // Set the embedded chatbot config
      window.embeddedChatbotConfig = {
        agentId: selectedAgent.id,
        domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      }
    }
  }, [selectedAgent]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat With Agent</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[600px] flex items-center justify-center">
        {selectedAgent && (
          <div id="embedded-chatbot-container" className="w-full max-w-md">
            <ChatWidget />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Add TypeScript declaration if not already present
declare global {
  interface Window {
    embeddedChatbotConfig: {
      agentId: string
      domain: string
    }
  }
}

export default Playground;
