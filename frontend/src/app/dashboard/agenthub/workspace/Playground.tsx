import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from '../AgentCards';
import ChatWidget from './ChatWidget';
import { Switch } from "@/components/ui/switch";
import { useState } from 'react';

interface PlaygroundProps {
  selectedAgent: Agent | null;
}

const Playground: React.FC<PlaygroundProps> = ({
  selectedAgent,
}) => {
  const [useTextWidget, setUseTextWidget] = useState(true);
  const textWidgetUrl = process.env.NEXT_PUBLIC_TEXT_WIDGET_URL || 'no-textwidget-url';

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Playground</CardTitle>
        Toggle functionality commented out
        <div className="flex items-center gap-2">
          <span>{useTextWidget ? 'Text Mode' : 'Voice Mode'}</span>
          <Switch
            checked={useTextWidget}
            onCheckedChange={setUseTextWidget}
          />
        </div>
       
      </CardHeader>
      <CardContent className="flex-1 h-[calc(100vh-12rem)] relative">
        {selectedAgent ? (
          <div className="w-full h-full">
            {useTextWidget ? (
              <iframe
                src={`${textWidgetUrl}?agentId=${selectedAgent.id}&apiBaseUrl=${process.env.NEXT_PUBLIC_API_BASE_URL}`}
                className="w-full h-full border-none rounded-lg"
                style={{ minHeight: '100%', display: 'block' }}
                title="Text Widget"
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
