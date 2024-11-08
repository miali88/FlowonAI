import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from '../../AgentHub/AgentCards';
import { LocalParticipant } from "livekit-client";
import ChatbotMini from './ChatbotMini/ChatBotMini';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat With Agent</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[600px] flex items-center justify-center">
        {!selectedAgent ? (
          <div className="text-gray-500">Please select an agent to start chatting</div>
        ) : (
          <div className="w-96 h-[600px] border rounded-lg overflow-hidden shadow-lg relative">
            <ChatbotMini agent={selectedAgent} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Playground;
