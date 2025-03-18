"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  PhoneCall,
  ArrowRight,
  Info,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TalkToFlowonProps {
  onNext: () => void;
}

// Helper function to get country flag emoji from country code
const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

export default function TalkToFlowon({ onNext }: TalkToFlowonProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId, getToken } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasPhoneNumber, setHasPhoneNumber] = useState<boolean>(true);
  const [showSupportMessage, setShowSupportMessage] = useState<boolean>(false);
  
  // For phone number selection
  const [countryCodes, setCountryCodes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPhoneNumber() {
      try {
        setIsLoading(true);
        setError(null);

        // Get the authentication token
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        // Fetch user's phone number
        const phoneNumberResponse = await fetch(
          `${API_BASE_URL}/guided_setup/phone_number`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (phoneNumberResponse.ok) {
          const phoneNumberData = await phoneNumberResponse.json();
          console.log("User's phone number:", phoneNumberData);

          // Check if user has a phone number
          if (phoneNumberData.success && phoneNumberData.phone_number) {
            // Set the returned phone number
            setPhoneNumber(phoneNumberData.phone_number);
            setHasPhoneNumber(true);
            setIsLoading(false);
            return;
          }
        }

        // If the first request didn't succeed, try again to ensure we've exhausted options
        // This is kept for backwards compatibility, though it's the same endpoint
        const response = await fetch(
          `${API_BASE_URL}/guided_setup/phone_number`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Error fetching phone number:", errorData);
          throw new Error("Failed to fetch phone number");
        }

        const data = await response.json();
        console.log("Guided setup phone number response:", data);

        if (data.success && data.phone_number && data.phone_number !== "(814) 261-0317") {
          setPhoneNumber(data.phone_number);
          setHasPhoneNumber(true);
        } else {
          // No real phone number assigned - show support message instead of claim UI
          console.log("No dedicated phone number assigned, showing support contact message");
          setHasPhoneNumber(false);
          setShowSupportMessage(true);
          // Still set the fallback number for display
          setPhoneNumber("(814) 261-0317");
        }
      } catch (err) {
        console.error("Error fetching Flowon phone number:", err);
        setError("Could not load Flowon phone number. Please contact support.");
        // Fallback to a constant if the API fails
        setPhoneNumber("(814) 261-0317");
        setHasPhoneNumber(false);
        setShowSupportMessage(true);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchCountryCodes() {
      try {
        console.log("Fetching available country codes");
        const response = await fetch(
          `${API_BASE_URL}/twilio/country_codes`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch country codes");
        }
        const data = await response.json();
        console.log("Country codes data:", data);
        
        if (data.countries && Array.isArray(data.countries)) {
          setCountryCodes(data.countries);
        } else {
          console.error("Invalid country codes format:", data);
          setCountryCodes([]);
        }
      } catch (error) {
        console.error("Error fetching country codes:", error);
        setCountryCodes([]);
      }
    }

    fetchPhoneNumber();
  }, [userId, getToken]);

  const handleNumberClaimed = (number: string) => {
    // This would be called after successful claiming of a number
    console.log("Number claimed:", number);
    setPhoneNumber(number);
    setHasPhoneNumber(true);
    setSuccessMessage("Phone number claimed successfully! You can use this number for free for 14 days.");
  };

  const handleNext = () => {
    setSuccessMessage("Great! Let's continue to the final step.");

    // Proceed to next step after a short delay
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-black p-2 rounded-full">
          <PhoneCall className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold">
          {hasPhoneNumber ? "Your Flowon Agent Phone Number" : "Phone Number Required"}
        </h2>
      </div>

      <Alert variant="default" className="border-blue-500">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription>
          {hasPhoneNumber ? (
            "This is your dedicated Flowon agent phone number. You can call this number directly to test your agent, and all call forwarding should be directed to this number. In the next step, we'll show you how to set up call forwarding from your business number to ensure your agent can answer calls seamlessly."
          ) : (
            "A dedicated phone number is required for your Flowon agent to function properly. This number is used for all call interactions with your agent."
          )}
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium text-blue-500">
            {hasPhoneNumber ? "Your Assigned Agent Number" : "Phone Number Not Assigned"}
          </h3>
          <p className="text-sm text-gray-400">
            {hasPhoneNumber ? (
              "This is the number your agent uses. All calls and call forwarding should be directed to this number."
            ) : (
              "You currently don't have a phone number assigned to your Flowon account."
            )}
          </p>
        </div>

        {hasPhoneNumber ? (
          <div className="bg-card rounded-xl p-6 border">
            {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div>
                <div className="flex items-center gap-3 justify-center mb-4">
                  <div className="text-3xl font-bold">
                    {phoneNumber}
                  </div>
                  <CopyToClipboardButton text={phoneNumber || ""} />
                </div>
              </div>
            )}
          </div>
        ) : showSupportMessage ? (
          <div className="bg-card rounded-xl p-6 border">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You don't have a phone number assigned to your account.
              </AlertDescription>
            </Alert>
            <p className="text-center mb-4">
              Please contact <a href="mailto:support@flowon.ai" className="text-blue-500 font-medium">support@flowon.ai</a> to get a phone number assigned to your account.
            </p>
            <p className="text-sm text-gray-500 text-center">
              Our support team will help you set up your dedicated Flowon agent phone number.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between pt-8">
        <div className="text-sm text-gray-400">
          {hasPhoneNumber 
            ? "You can launch or continue training Flowon on the next step" 
            : "You'll need a phone number to proceed with the next steps"}
        </div>
        <Button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={!hasPhoneNumber}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CopyToClipboardButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="hover:bg-muted"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
