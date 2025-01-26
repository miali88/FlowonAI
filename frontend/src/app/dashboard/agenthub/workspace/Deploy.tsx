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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import StripeNumberPurchase from "@/components/StripeNumberPurchase";
import { useAuth } from "@clerk/nextjs";

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
  userId: string;
}

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
}

// Add interface for the new response format
interface TwilioNumbers {
  local?: { monthly_cost: number; numbers: string[] };
  toll_free?: { monthly_cost: number; numbers: string[] };
  mobile?: { monthly_cost: number; numbers: string[] };
}

interface AvailableNumbersResponse {
  numbers: TwilioNumbers;
}

// Update interface for user numbers response
interface UserNumber {
  created_at: string;
  phone_number: string;
  owner_user_id: string;
  area_code: string | null;
  account_sid: string;
  number_sid: string;
  assigned_agent_id: string | null;
  assigned_agent_name: string | null;
}

interface UserNumbersResponse {
  numbers: UserNumber[];
}

interface NumberCost {
  monthly_cost: number;
  numbers: string[];
}

interface AvailableNumbersResponse {
  numbers: {
    local?: {
      monthly_cost: number;
      numbers: string[];
    };
    toll_free?: {
      monthly_cost: number;
      numbers: string[];
    };
    mobile?: {
      monthly_cost: number;
      numbers: string[];
    };
  };
}

const Deploy: React.FC<DeployProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveChanges,
  userInfo,
  userId: propUserId,
}) => {
  const { userId: clerkUserId } = useAuth();
  console.log("Deploy Component - propUserId:", propUserId);
  console.log("Deploy Component - clerkUserId:", clerkUserId);
  const [countryCodes, setCountryCodes] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [availableNumbers, setAvailableNumbers] = useState<TwilioNumbers>({});
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>("");
  const [showPhoneFields, setShowPhoneFields] = useState(false);
  const [userNumbers, setUserNumbers] = useState<UserNumber[]>([]);
  const [isLoadingUserNumbers, setIsLoadingUserNumbers] = useState(false);
  const [selectedNumberCost, setSelectedNumberCost] = useState<number>(0);
  const [selectedExistingNumber, setSelectedExistingNumber] = useState<string>(
    selectedAgent?.assigned_telephone || ""
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssignSuccess, setIsAssignSuccess] = useState(false);
  const [initialNumber, setInitialNumber] = useState<string>(
    selectedAgent?.assigned_telephone
  );

  console.log("Deploy - Full selectedAgent:", selectedAgent);
  console.log(
    "Deploy - assigned_telephone:",
    selectedAgent?.assigned_telephone
  );

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

      const data: AvailableNumbersResponse = await response.json();
      setAvailableNumbers(data.numbers);
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      setAvailableNumbers({});
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
      setAvailableNumbers({});
    }
  };

  useEffect(() => {
    console.log("Selected Agent:", selectedAgent);
  }, [selectedAgent]);

  // Update the useEffect for fetching user numbers
  useEffect(() => {
    const fetchUserNumbers = async () => {
      setIsLoadingUserNumbers(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/twilio/user_numbers`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-user-id": clerkUserId || "",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user numbers");
        }

        const data: UserNumbersResponse = await response.json();
        // Store the full number objects instead of just the phone numbers
        setUserNumbers(data.numbers);
      } catch (error) {
        console.error("Error fetching user numbers:", error);
        setUserNumbers([]);
      } finally {
        setIsLoadingUserNumbers(false);
      }
    };

    if (clerkUserId) {
      fetchUserNumbers();
    }
  }, [clerkUserId]);

  // Update useEffect to handle changes to selectedAgent and set initial number
  useEffect(() => {
    if (selectedAgent?.assigned_telephone) {
      setSelectedExistingNumber(selectedAgent.assigned_telephone);
      setInitialNumber(selectedAgent.assigned_telephone);
    }
  }, [selectedAgent]);

  const handlePhoneNumberSelection = (value: string, cost: number) => {
    if (selectedAgent) {
      setSelectedAgent({
        ...selectedAgent,
        twilioConfig: {
          ...selectedAgent.twilioConfig,
          phoneNumbers: [
            {
              id: value,
              title: value,
              data_type: "phone_number",
            },
          ],
        },
      });
      setSelectedNumberCost(cost);
    }
  };

  const handleAssignNumber = async () => {
    if (!selectedAgent?.id) return;

    setIsAssigning(true);
    setIsAssignSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/livekit/agents/${selectedAgent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": selectedAgent?.userId || "",
          },
          body: JSON.stringify({
            assigned_telephone: selectedExistingNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign number");
      }

      // Update the local state after successful assignment
      setSelectedAgent((prev) =>
        prev
          ? {
              ...prev,
              assigned_telephone: selectedExistingNumber,
            }
          : null
      );

      setIsAssignSuccess(true);
      setInitialNumber(selectedExistingNumber);
    } catch (error) {
      console.error("Error assigning number:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const renderPhoneNumberFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Country Code</Label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[200px] mx-2">
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
          <div>
            <Label>Available Phone Numbers</Label>
            <Select
              disabled={isLoadingNumbers}
              value={selectedAgent?.twilioConfig?.phoneNumbers?.[0]?.id || ""}
              onValueChange={(value) => {
                // Find the cost for the selected number
                let cost = 0;
                if (availableNumbers.local?.numbers.includes(value)) {
                  cost = availableNumbers.local.monthly_cost;
                } else if (
                  availableNumbers.toll_free?.numbers.includes(value)
                ) {
                  cost = availableNumbers.toll_free.monthly_cost;
                } else if (availableNumbers.mobile?.numbers.includes(value)) {
                  cost = availableNumbers.mobile.monthly_cost;
                }
                handlePhoneNumberSelection(value, cost);
              }}
            >
              <SelectTrigger className="w-[200px] mx-2">
                <SelectValue
                  placeholder={
                    isLoadingNumbers ? "Loading..." : "Select phone number"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableNumbers.local &&
                  availableNumbers.local.numbers.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Local Numbers</SelectLabel>
                      {availableNumbers.local.numbers.map((number) => (
                        <SelectItem key={number} value={number}>
                          {number}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                {availableNumbers.toll_free &&
                  availableNumbers.toll_free.numbers.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Toll Free Numbers</SelectLabel>
                      {availableNumbers.toll_free.numbers.map((number) => (
                        <SelectItem key={number} value={number}>
                          {number}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                {availableNumbers.mobile &&
                  availableNumbers.mobile.numbers.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Mobile Numbers</SelectLabel>
                      {availableNumbers.mobile.numbers.map((number) => (
                        <SelectItem key={number} value={number}>
                          {number}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
              </SelectContent>
            </Select>
          </div>
        )}

        <StripeNumberPurchase
          amount={selectedNumberCost}
          disabled={
            !selectedCountry ||
            !selectedAgent?.twilioConfig?.phoneNumbers?.[0]?.id
          }
        />
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
              <div className="flex">
                {/* Left Section - Purchase Process */}
                <div className="w-1/2">{renderPhoneNumberFields()}</div>

                {/* Right Section - Existing Numbers */}
                <div className="w-1/2">
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Assign a Number
                    </h3>
                    {isLoadingUserNumbers ? (
                      <div className="text-sm text-muted-foreground">
                        Loading...
                      </div>
                    ) : userNumbers.length > 0 ? (
                      <div className="space-y-4 w-64">
                        <Select
                          value={selectedExistingNumber}
                          onValueChange={(value) => {
                            setSelectedExistingNumber(value);
                            setIsAssignSuccess(false);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a number" />
                          </SelectTrigger>
                          <SelectContent>
                            {userNumbers.map((number) => (
                              <SelectItem
                                key={number.phone_number}
                                value={number.phone_number}
                                disabled={!!number.assigned_agent_id}
                                className={
                                  number.assigned_agent_id
                                    ? "text-muted-foreground"
                                    : ""
                                }
                              >
                                {number.phone_number}
                                {number.assigned_agent_id && (
                                  <span className="mx-3">
                                    Assigned to {number.assigned_agent_name}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderAssignButton()}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No phone numbers found
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

  const renderAssignButton = () => {
    const isDisabled =
      !selectedExistingNumber || selectedExistingNumber === initialNumber;

    if (isAssigning) {
      return (
        <Button className="w-64" disabled>
          Assigning...
        </Button>
      );
    }

    if (isAssignSuccess || selectedExistingNumber === initialNumber) {
      return (
        <Button className="w-64" variant="secondary" disabled>
          ✓ Assigned
        </Button>
      );
    }

    return (
      <Button
        className="w-64"
        disabled={isDisabled}
        onClick={handleAssignNumber}
      >
        Assign Number
      </Button>
    );
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
