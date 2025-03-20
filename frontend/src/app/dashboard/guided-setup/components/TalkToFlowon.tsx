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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StripeNumberPurchase from "@/components/StripeNumberPurchase";

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
  const [showPurchaseUI, setShowPurchaseUI] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("US"); // Default to US for now
  
  useEffect(() => {
    async function fetchPhoneNumber() {
      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

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

          if (phoneNumberData.success && phoneNumberData.phone_number) {
            setPhoneNumber(phoneNumberData.phone_number);
            setHasPhoneNumber(true);
            setIsLoading(false);
            return;
          }
        }

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
          console.log("No dedicated phone number assigned, showing purchase UI");
          setHasPhoneNumber(false);
          setShowPurchaseUI(true);
          setPhoneNumber(null);
        }
      } catch (err) {
        console.error("Error fetching Flowon phone number:", err);
        setPhoneNumber(null);
        setHasPhoneNumber(false);
        setShowPurchaseUI(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhoneNumber();
  }, [userId, getToken]);

  const handleNumberPurchased = (number: string) => {
    console.log("Number purchased:", number);
    setPhoneNumber(number);
    setHasPhoneNumber(true);
    setSuccessMessage("Phone number purchased successfully! You can use this number for your Flowon agent.");
  };

  const handleNext = () => {
    setSuccessMessage("Great! Let's continue to the final step.");
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
          {hasPhoneNumber ? "Your Flowon Agent Phone Number" : "Purchase a Phone Number"}
        </h2>
      </div>

      <Alert variant="default" className="border-blue-500">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription>
          {hasPhoneNumber ? (
            "This is your dedicated Flowon agent phone number. You can call this number directly to test your agent, and all call forwarding should be directed to this number. In the next step, we'll show you how to set up call forwarding from your business number to ensure your agent can answer calls seamlessly."
          ) : (
            "To get started with your Flowon agent, you'll need a dedicated phone number. This number will be used for all call interactions with your agent. Purchase a number below to continue."
          )}
        </AlertDescription>
      </Alert>

      {error && error !== "Could not load Flowon phone number. Please try purchasing one below." && (
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
        ) : showPurchaseUI ? (
          <div className="bg-card rounded-xl p-6 border">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{getCountryFlag(selectedCountry)}</span>
                <span className="text-lg font-medium">{selectedCountry}</span>
              </div>
              
              <StripeNumberPurchase
                amount={2}
                twilioNumber=""
                disabled={false}
              />
              
              <p className="text-sm text-gray-500 mt-4">
                * Refundable one-time fee for phone number purchase during trial period.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-between pt-8">
        <div className="text-sm text-gray-400">
          {hasPhoneNumber 
            ? "You can launch or continue training Flowon on the next step" 
            : "Purchase a phone number to proceed with the next steps"}
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
