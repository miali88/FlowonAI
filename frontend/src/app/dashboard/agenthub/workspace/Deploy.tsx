import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { Agent as BaseAgent } from "../AgentCards";
import { MultiSelect } from "./multiselect_deploy";
import { useEffect, useState } from "react";
import MicIcon from "./MicIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define a type for telephony number details
interface TelephonyNumberDetails {
  friendly_name?: string;
  phone_number: string;
  capabilities: {
    voice?: boolean;
    SMS?: boolean;
    MMS?: boolean;
  };
}

// Add type for MultiSelect items
interface MultiSelectItem {
  id: string;
  title: string;
  data_type: string;
}

interface Agent extends BaseAgent {
  twilioConfig?: {
    phoneNumbers: MultiSelectItem[];
  };
}

interface DeployProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveChanges: (agent: Agent) => Promise<void>;
  userInfo: {
    telephony_numbers?: Record<string, TelephonyNumberDetails>;
    [key: string]: unknown;
  } | null;
}

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
}

const Deploy: React.FC<DeployProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveChanges,
  userInfo,
}) => {
  const [countryCodes, setCountryCodes] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>("");
  const [showPhoneFields, setShowPhoneFields] = useState(false);

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/twilio/country_codes`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch country codes");
        }
        const data = await response.json();
        setCountryCodes(Object.values(data).flat());
      } catch (error) {
        console.error("Error fetching country codes:", error);
      }
    };

    fetchCountryCodes();
  }, []);

  const fetchAvailableNumbers = async (countryCode: string) => {
    setIsLoadingNumbers(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/twilio/available_numbers/${countryCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available numbers");
      }

      const data = await response.json();
      // The backend returns { numbers: { available: string[] } }
      setAvailableNumbers(data.numbers.available || []);
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      setAvailableNumbers([]);
    } finally {
      setIsLoadingNumbers(false);
    }
  };

  // Update the country selection handler to fetch numbers
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    if (value) {
      fetchAvailableNumbers(value);
    } else {
      setAvailableNumbers([]);
    }
  };

  useEffect(() => {
    console.log("Selected Agent:", selectedAgent);
  }, [selectedAgent]);

  const renderPhoneNumberFields = () => {
    return (
      <div className="space-y-4 max-w-sm">
        <div className="mx-2">
          <Label>Country Code</Label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select country code" />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCountry && (
          <div className="mx-2">
            <Label>Available Phone Numbers</Label>
            <Select
              disabled={isLoadingNumbers}
              value={selectedPhoneNumber}
              onValueChange={setSelectedPhoneNumber}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue
                  placeholder={
                    isLoadingNumbers ? "Loading..." : "Select a number"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableNumbers.map((number) => (
                  <SelectItem key={number} value={number}>
                    {number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          className="w-[200px] mx-2"
          onClick={() => selectedAgent && handleSaveChanges(selectedAgent)}
          disabled={
            !selectedCountry ||
            !selectedAgent?.twilioConfig?.phoneNumbers?.[0]?.id
          }
        >
          Purchase
        </Button>
      </div>
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

  const textChatScriptCode = `
<script>
	window.chatConfig = {
        agentId: "${selectedAgent?.id}",
        widgetDomain: 'https://flowon.ai/textwidget',
        iframeDomain: 'https://03dfb8f6.flowonchatwidget.pages.dev/'
		};
	const scriptEl = document.createElement('script');
	scriptEl.src = "https://03dfb8f6.flowonchatwidget.pages.dev/iframeChat_text.min.js"
	document.body.appendChild(scriptEl);  
	scriptEl.onload = function() {new TextChatWidget(window.chatConfig)};
</script>
`;

  const renderDeploymentOptions = () => {
    if (!selectedAgent) return null;

    switch (selectedAgent.agentPurpose) {
      case "telephone-agent":
        return (
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
              <div className="space-y-4">{renderPhoneNumberFields()}</div>
            </AccordionContent>
          </AccordionItem>
        );
      case "feedback-widget":
        return (
          <AccordionItem value="feedback-widget">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                Feedback Widget
                <Image
                  src="/icons/feedback.png"
                  alt="Feedback"
                  width={24}
                  height={24}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Script Embed</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add this script to your website to enable the feedback
                    widget.
                  </p>
                  <div className="relative">
                    <pre className="bg-secondary rounded-md p-4 overflow-x-auto">
                      <code className="text-sm">{textChatScriptCode}</code>
                    </pre>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        navigator.clipboard.writeText(textChatScriptCode)
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      case "voice-web-agent":
        return (
          <AccordionItem value="website-integration">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                Voice Agent
                <MicIcon size={24} />
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
        );
      case "text-chatbot-agent":
        return (
          <AccordionItem value="text-chat">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                Text Chat Agent
                <Image
                  src="/icons/live-chat.png"
                  alt="Chat"
                  width={24}
                  height={24}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Script Embed</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add this script to your website to enable the text chat
                    widget.
                  </p>
                  <div className="relative">
                    <pre className="bg-secondary rounded-md p-4 overflow-x-auto">
                      <code className="text-sm">{textChatScriptCode}</code>
                    </pre>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        navigator.clipboard.writeText(textChatScriptCode)
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      default:
        return null;
    }
  };

  const getDefaultAccordionValue = (agentPurpose?: string) => {
    switch (agentPurpose) {
      case "telephone-agent":
        return "telephony";
      case "feedback-widget":
        return "feedback-widget";
      case "voice-web-agent":
        return "website-integration";
      case "text-chatbot-agent":
        return "text-chat";
      default:
        return undefined;
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        <Accordion
          type="single"
          defaultValue={getDefaultAccordionValue(selectedAgent?.agentPurpose)}
          collapsible={false}
          className="w-full"
        >
          {renderDeploymentOptions()}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Deploy;
