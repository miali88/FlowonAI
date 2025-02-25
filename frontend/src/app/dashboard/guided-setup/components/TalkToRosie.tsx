"use client";

import { useState, useEffect } from "react";
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

interface TalkToRosieProps {
  onNext: () => void;
}

export default function TalkToRosie({ onNext }: TalkToRosieProps) {
  const [rosiePhoneNumber, setRosiePhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhoneNumber() {
      try {
        setIsLoading(true);
        // Use the API_BASE_URL environment variable
        const response = await fetch(
          `${API_BASE_URL}/guided-setup/phone-number`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch phone number");
        }

        const data = await response.json();

        if (data.success && data.phoneNumber) {
          setRosiePhoneNumber(data.phoneNumber);
        } else {
          throw new Error(data.error || "Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching Rosie phone number:", err);
        setError("Could not load Rosie phone number. Using fallback number.");
        // Fallback to a constant if the API fails
        setRosiePhoneNumber("(814) 261-0317");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhoneNumber();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-black p-2 rounded-full">
          <PhoneCall className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold">
          Call Rosie to test out your agent
        </h2>
      </div>

      <Alert variant="default" className="bg-black border-blue-500">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-white">
          Call your Rosie number listed below to test out your agent for
          yourself. When you are ready for Rosie to start answering your calls,
          your customers won&apos;t need to call your Rosie number; instead you
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

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium text-blue-500">Give Rosie a call</h3>
          <p className="text-sm text-gray-400">
            Experience how Rosie handles a call and takes a message.
          </p>
        </div>

        <div className="bg-black rounded-xl p-6 flex justify-center items-center min-h-[80px]">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-white">
                {rosiePhoneNumber}
              </div>
              <CopyToClipboardButton text={rosiePhoneNumber || ""} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <div className="text-sm text-gray-400">
          You can launch or continue training Rosie on the next step
        </div>
        <Button
          onClick={onNext}
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
            className="text-white hover:bg-white/10"
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
