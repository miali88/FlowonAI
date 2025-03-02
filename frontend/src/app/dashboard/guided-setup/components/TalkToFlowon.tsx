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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TalkToFlowonProps {
  onNext: () => void;
}

export default function TalkToFlowon({ onNext }: TalkToFlowonProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId, getToken } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

        if (data.success && data.phoneNumber) {
          setPhoneNumber(data.phoneNumber);
        } else {
          throw new Error(data.error || "Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching Flowon phone number:", err);
        setError("Could not load Flowon phone number. Using fallback number.");
        // Fallback to a constant if the API fails
        setPhoneNumber("(814) 261-0317");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhoneNumber();
  }, [userId, getToken]);

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
          Call Flowon to test out your agent
        </h2>
      </div>

      <Alert variant="default" className="border-blue-500">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription>
          Call your Flowon number listed below to test out your agent for
          yourself. When you are ready for Flowon to start answering your calls,
          your customers won&apos;t need to call your Flowon number; instead you
          can forward calls from your existing business phone number to ensure a
          seamless customer experience. We&apos;ll walk you through that in the
          next step.
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
          <h3 className="font-medium text-blue-500">Give Flowon a call</h3>
          <p className="text-sm text-gray-400">
            Experience how Flowon handles a call and takes a message.
          </p>
        </div>

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
      </div>

      <div className="flex justify-between pt-8">
        <div className="text-sm text-gray-400">
          You can launch or continue training Flowon on the next step
        </div>
        <Button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-600 text-white"
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
