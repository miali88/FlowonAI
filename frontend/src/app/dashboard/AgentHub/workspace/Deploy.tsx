import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image';
import { Agent } from '../AgentCards';
import { MultiSelect } from './multiselect_deploy';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeployProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveChanges: (agent: Agent) => Promise<void>;
  userInfo: {
    telephony_numbers?: Record<string, any>;
    [key: string]: any;
  } | null;
}

const Deploy: React.FC<DeployProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveChanges,
  userInfo,
}) => {
  React.useEffect(() => {
    console.log('Deploy component userInfo:', userInfo);
  }, [userInfo]);

  const renderPhoneNumbers = () => {
    if (!userInfo) {
      return <div className="text-sm text-muted-foreground">Loading user information...</div>;
    }

    console.log('Telephony numbers:', userInfo.telephony_numbers);
    
    const phoneNumberItems = Object.entries(userInfo.telephony_numbers || {}).map(([number, details]) => {
      console.log('Creating item for number:', number);
      return {
        id: number,
        title: number,
        data_type: 'phone_number'
      };
    });

    console.log('Phone number items created:', phoneNumberItems);

    return (
      <MultiSelect
        items={phoneNumberItems}
        selectedItems={selectedAgent?.twilioConfig?.phoneNumbers || []}
        onChange={(items) => {
          console.log('MultiSelect onChange called with:', items);
          setSelectedAgent({
            ...selectedAgent,
            twilioConfig: {
              ...selectedAgent?.twilioConfig,
              phoneNumbers: items
            }
          });
        }}
      />
    );
  };

  const iframeCode = `<iframe
src="https://www.flowon.ai/embed/${selectedAgent?.id}"
width="100%"
style="height: 100%; min-height: 700px"
frameborder="0"
></iframe>`;

  const scriptCode = `
    <div id="embedded-chatbot-container"></div>
    <script defer>
      window.embeddedChatbotConfig = {
        agentId: "${selectedAgent?.id}",
        domain: "www.flowonwidget.pages.dev"
      };
    </script>
    <script defer type="module" src="https://79c90be8.flowonwidget.pages.dev/embed.min.js"></script>
`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="website-integration">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                Website Integration
                <span role="img" aria-label="chat">🗨️</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">IFrame Embed</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add this code to embed the agent directly in your website.
                  </p>
                  <div className="relative">
                    <pre className="bg-secondary rounded-md p-4 overflow-x-auto">
                      <code className="text-sm">{iframeCode}</code>
                    </pre>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(iframeCode)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Script Embed</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add this script to your website to enable the chat widget.
                  </p>
                  <div className="relative">
                    <pre className="bg-secondary rounded-md p-4 overflow-x-auto">
                      <code className="text-sm">{scriptCode}</code>
                    </pre>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(scriptCode)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="telephony">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                Telephony Integration
                <div className="flex-grow" />
                <Image 
                  src="/twilio-icon.svg" 
                  alt="Twilio" 
                  width={28} 
                  height={28}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="twilioPhoneNumber">Assigned Number</Label>
                  <div className="space-y-2">
                    {renderPhoneNumbers()}
                  </div>
                </div>
                <Button 
                  className="mt-4"
                  onClick={() => handleSaveChanges(selectedAgent)}
                >
                  Save Twilio Configuration
                </Button>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    After saving your Twilio configuration, your agent will be accessible via phone calls to your Twilio number.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Deploy;
