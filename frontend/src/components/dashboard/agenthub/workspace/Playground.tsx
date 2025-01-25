import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "../AgentCards";
import ChatWidget from "./ChatWidget";
import dynamic from "next/dynamic";
import { Switch } from "@/components/ui/switch";
import { useState, Suspense } from "react";

// Dynamically import TextWidget with SSR disabled
const TextWidget = dynamic(() => import("@/app/text-widget/TextWidget"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

interface PlaygroundProps {
  selectedAgent: Agent | null;
}

const Playground: React.FC<PlaygroundProps> = ({ selectedAgent }) => {
  const [useTextWidget, setUseTextWidget] = useState(true);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Playground</CardTitle>
        <div className="flex items-center gap-2">
          <span>{useTextWidget ? "Text Mode" : "Voice Mode"}</span>
          <Switch checked={useTextWidget} onCheckedChange={setUseTextWidget} />
        </div>
      </CardHeader>
      <CardContent className="min-h-[600px] h-full flex items-center justify-center relative">
        {selectedAgent ? (
          <div className="w-full h-full">
            <Suspense fallback={<div>Loading...</div>}>
              {useTextWidget ? (
                <TextWidget
                  agentId={selectedAgent.id}
                  apiBaseUrl={
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:3001"
                  }
                />
              ) : (
                <ChatWidget agentId={selectedAgent.id} theme="light" />
              )}
            </Suspense>
          </div>
        ) : (
          <p>Please select an agent to start chatting</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Playground;
