"use client";

import { useState, useEffect, useCallback } from "react";
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
import { PurchaseNumber } from "@/components/dashboard/agenthub/workspace/PurchaseNumber";

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
        console.log("Phone number response:", data);

        if (data.success && data.phoneNumber && data.phoneNumber !== "(814) 261-0317") {
          setPhoneNumber(data.phoneNumber);
          setHasPhoneNumber(true);
        } else {
          // No real phone number assigned - show claim UI
          console.log("No dedicated phone number assigned, showing claim UI");
          setHasPhoneNumber(false);
          // Still set the fallback number for display
          setPhoneNumber("(814) 261-0317");
          
          // Fetch country codes for number selection UI
          fetchCountryCodes();
        }
      } catch (err) {
        console.error("Error fetching Flowon phone number:", err);
        setError("Could not load Flowon phone number. Using fallback number.");
        // Fallback to a constant if the API fails
        setPhoneNumber("(814) 261-0317");
        setHasPhoneNumber(false);
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
          {hasPhoneNumber ? "Call Flowon to test out your agent" : "Claim your free trial phone number"}
        </h2>
      </div>

      <Alert variant="default" className="border-blue-500">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription>
          {hasPhoneNumber ? (
            "Call your Flowon number listed below to test out your agent for yourself. When you are ready for Flowon to start answering your calls, your customers won't need to call your Flowon number; instead you can forward calls from your existing business phone number to ensure a seamless customer experience. We'll walk you through that in the next step."
          ) : (
            "To get started with Flowon, you'll need a dedicated phone number for your agent. You can claim a free trial number now and use it for 14 days. After the trial period, you can choose to keep the number for a monthly fee."
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
            {hasPhoneNumber ? "Give Flowon a call" : "Claim your free 14-day trial number"}
          </h3>
          <p className="text-sm text-gray-400">
            {hasPhoneNumber ? (
              "Experience how Flowon handles a call and takes a message."
            ) : (
              "Select a phone number to use for free during your 14-day trial period. After the trial, you can choose to keep the number for $5/month."
            )}
          </p>
        </div>

        {hasPhoneNumber ? (
          <div className="bg-card rounded-xl p-6 flex justify-center items-center min-h-[80px] border">
            {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">
                  {phoneNumber}
                </div>
                <CopyToClipboardButton text={phoneNumber || ""} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-6 border">
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
              <p><strong>Free Trial:</strong> Select and claim a phone number to use free for 14 days.</p>
              <p className="mt-1">After your trial period ends, you can keep this number for $5/month.</p>
            </div>
            <PurchaseNumber 
              countries={countryCodes} 
              onNumberPurchased={handleNumberClaimed} 
            />
          </div>
        )}
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
