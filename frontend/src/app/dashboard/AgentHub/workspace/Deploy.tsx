import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image';
import { Agent } from '../AgentCards';

interface DeployProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveChanges: (agent: Agent) => Promise<void>;
}

const Deploy: React.FC<DeployProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveChanges,
}) => {
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
                  <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
                  <Input
                    id="twilioAccountSid"
                    placeholder="Enter your Twilio Account SID"
                    value={selectedAgent?.twilioConfig?.accountSid || ''}
                    onChange={(e) => setSelectedAgent({
                      ...selectedAgent,
                      twilioConfig: {
                        ...selectedAgent?.twilioConfig,
                        accountSid: e.target.value
                      }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
                  <Input
                    id="twilioAuthToken"
                    type="password"
                    placeholder="Enter your Twilio Auth Token"
                    value={selectedAgent?.twilioConfig?.authToken || ''}
                    onChange={(e) => setSelectedAgent({
                      ...selectedAgent,
                      twilioConfig: {
                        ...selectedAgent?.twilioConfig,
                        authToken: e.target.value
                      }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
                  <Input
                    id="twilioPhoneNumber"
                    placeholder="+1234567890"
                    value={selectedAgent?.twilioConfig?.phoneNumber || ''}
                    onChange={(e) => setSelectedAgent({
                      ...selectedAgent,
                      twilioConfig: {
                        ...selectedAgent?.twilioConfig,
                        phoneNumber: e.target.value
                      }
                    })}
                  />
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
                  <div>
                    <Label className="text-sm font-medium">Webhook URL</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Configure this URL in your Twilio Voice webhook settings:
                    </p>
                    <div className="relative">
                      <pre className="bg-secondary rounded-md p-4 overflow-x-auto">
                        <code className="text-sm">
                          {`https://api.flowon.ai/twilio/voice/${selectedAgent?.id}`}
                        </code>
                      </pre>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => navigator.clipboard.writeText(
                          `https://api.flowon.ai/twilio/voice/${selectedAgent?.id}`
                        )}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
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
