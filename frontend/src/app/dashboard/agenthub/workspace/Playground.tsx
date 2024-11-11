import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from '../AgentCards';
import ChatWidget from './ChatWidget';

interface PlaygroundProps {
  selectedAgent: Agent | null;
}

const Playground: React.FC<PlaygroundProps> = ({
  selectedAgent,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat With Agent</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[600px] h-full flex items-center justify-center relative">
        {selectedAgent ? (
          <div className="w-full h-full">
            <ChatWidget 
              agentId={selectedAgent.id}
              theme="light"
            />
          </div>
        ) : (
          <p>Please select an agent to start chatting</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Playground;
