import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from '../AgentCards';
import ChatWidget from './ChatWidget';
import TextWidget from '@/app/text-widget/[agentId]/TextWidget';
import { Switch } from "@/components/ui/switch";
import { useState } from 'react';

interface PlaygroundProps {
  selectedAgent: Agent | null;
}

const Playground: React.FC<PlaygroundProps> = ({
  selectedAgent,
}) => {
  const [useTextWidget, setUseTextWidget] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chat With Agent</CardTitle>
        <div className="flex items-center gap-2">
          <span>Text Mode</span>
          <Switch
            checked={useTextWidget}
            onCheckedChange={setUseTextWidget}
          />
        </div>
      </CardHeader>
      <CardContent className="min-h-[600px] h-full flex items-center justify-center relative">
        {selectedAgent ? (
          <div className="w-full h-full">
            {useTextWidget ? (
              <TextWidget 
                agentId={selectedAgent.id}
                apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}
              />
            ) : (
              <ChatWidget 
                agentId={selectedAgent.id}
                theme="light"
              />
            )}
          </div>
        ) : (
          <p>Please select an agent to start chatting</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Playground;
