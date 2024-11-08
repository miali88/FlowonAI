import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ColorPicker, DEFAULT_COLOR } from '@/components/ui/color-picker';
import { Slider } from "@/components/ui/slider";
import { LocalParticipant } from "livekit-client";
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const ChatWidget = dynamic(() => import('@/app/chat-widget/[agentId]/components/main'), {
  ssr: false
});

interface UiProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
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

const Ui: React.FC<UiProps> = ({
  selectedAgent,
  setSelectedAgent,
  isStreaming,
  setIsStreaming,
  isLiveKitActive,
  setIsLiveKitActive,
  token,
  setToken,
  url,
  setUrl,
  isConnecting,
  setIsConnecting,
  handleStreamEnd,
  handleStreamStart,
  localParticipant,
  setLocalParticipant,
}) => {
  useEffect(() => {
    if (selectedAgent) {
      window.embeddedChatbotConfig = {
        agentId: selectedAgent.id,
        domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      }
    }
  }, [selectedAgent]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>UI Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          <div className="w-1/2 space-y-6">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <ColorPicker
                value={selectedAgent?.uiConfig?.primaryColor || DEFAULT_COLOR}
                onChange={(color) => setSelectedAgent({
                  ...selectedAgent,
                  uiConfig: { ...selectedAgent?.uiConfig, primaryColor: color }
                })}
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <ColorPicker
                value={selectedAgent?.uiConfig?.secondaryColor || DEFAULT_COLOR}
                onChange={(color) => setSelectedAgent({
                  ...selectedAgent,
                  uiConfig: { ...selectedAgent?.uiConfig, secondaryColor: color }
                })}
              />
            </div>
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Slider
                id="fontSize"
                min={12}
                max={24}
                step={1}
                value={[selectedAgent?.uiConfig?.fontSize || 16]}
                onValueChange={(value) => setSelectedAgent({
                  ...selectedAgent,
                  uiConfig: { ...selectedAgent?.uiConfig, fontSize: value[0] }
                })}
              />
              <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.fontSize || 16}px</span>
            </div>
            <div>
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Slider
                id="borderRadius"
                min={0}
                max={20}
                step={1}
                value={[selectedAgent?.uiConfig?.borderRadius || 4]}
                onValueChange={(value) => setSelectedAgent({
                  ...selectedAgent,
                  uiConfig: { ...selectedAgent?.uiConfig, borderRadius: value[0] }
                })}
              />
              <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.borderRadius || 4}px</span>
            </div>
            <div>
              <Label htmlFor="chatboxHeight">Chatbox Height</Label>
              <Slider
                id="chatboxHeight"
                min={300}
                max={800}
                step={10}
                value={[selectedAgent?.uiConfig?.chatboxHeight || 500]}
                onValueChange={(value) => setSelectedAgent({
                  ...selectedAgent,
                  uiConfig: { ...selectedAgent?.uiConfig, chatboxHeight: value[0] }
                })}
              />
              <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.chatboxHeight || 500}px</span>
            </div>
          </div>
          <div className="w-1/2">
            <div className="border rounded-lg p-4" style={{ height: `${selectedAgent?.uiConfig?.chatboxHeight || 500}px` }}>
              {selectedAgent && (
                <div id="embedded-chatbot-container" className="w-full h-full">
                  <ChatWidget />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

declare global {
  interface Window {
    embeddedChatbotConfig: {
      agentId: string
      domain: string
    }
  }
}

export default Ui;
