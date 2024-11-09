import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from '../../AgentHub/AgentCards';
import { LocalParticipant } from "livekit-client";
import ChatWidget from './ChatWidget';

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
    <Card className="h-[800px]">
      <CardHeader>
        <CardTitle>Chat With Agent</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] flex items-center justify-center relative">
        {selectedAgent ? (
          <div className="w-full h-full flex justify-center">
            <div className="w-full max-w-[800px] h-full">
              <ChatWidget 
                agentId={selectedAgent.id}
                theme="light"
              />
            </div>
          </div>
        ) : (
          <p>Please select an agent to start chatting</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Playground;
