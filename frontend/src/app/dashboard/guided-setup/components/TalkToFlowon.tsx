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
  const [isPhonePurchaseLoading, setIsPhonePurchaseLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('US'); // Default to US initially

  // Function to determine country code from address
  const getCountryCodeFromAddress = (address: string): string => {
    // Common country indicators in addresses
    const countryIndicators = {
      'UK': 'GB',
      'United Kingdom': 'GB',
      'England': 'GB',
      'Scotland': 'GB',
      'Wales': 'GB',
      'Northern Ireland': 'GB',
      'USA': 'US',
      'United States': 'US',
      'Canada': 'CA',
      'Australia': 'AU',
      // Add more mappings as needed
    };

    const upperAddress = address.toUpperCase();
    for (const [indicator, code] of Object.entries(countryIndicators)) {
      if (upperAddress.includes(indicator.toUpperCase())) {
        return code;
      }
    }
    return 'US'; // Default fallback
  };

  // Fetch setup data and phone number
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        // First try to get setup data to determine country
        const setupResponse = await fetch(
          `${API_BASE_URL}/guided_setup/setup_data`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (setupResponse.ok) {
          const setupData = await setupResponse.json();
          console.log("Loaded setup data:", setupData);

          if (setupData.success && setupData.setupData?.businessInformation?.primaryBusinessAddress) {
            const detectedCountryCode = getCountryCodeFromAddress(setupData.setupData.businessInformation.primaryBusinessAddress);
            console.log("Detected country code from address:", detectedCountryCode);
            setCountryCode(detectedCountryCode);
          } else {
            // Fallback to localStorage
            const businessInfoString = localStorage.getItem('flowonAI_businessInfo');
            if (businessInfoString) {
              try {
                const businessInfo = JSON.parse(businessInfoString);
                if (businessInfo.countryCode) {
                  console.log("Using country code from localStorage:", businessInfo.countryCode);
                  setCountryCode(businessInfo.countryCode);
                }
              } catch (err) {
                console.error('Error parsing business info from localStorage:', err);
              }
            }
          }
        }

        // Then fetch phone number
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

        // If we get here, no phone number was found
        console.log("No dedicated phone number assigned, showing purchase UI");
        setHasPhoneNumber(false);
        setShowPurchaseUI(true);
        setPhoneNumber(null);

      } catch (err) {
        console.error("Error fetching data:", err);
        setPhoneNumber(null);
        setHasPhoneNumber(false);
        setShowPurchaseUI(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, getToken]);

  const handlePurchasePhoneNumber = async () => {
    try {
      setIsPhonePurchaseLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log(`Requesting phone number purchase for country code: ${countryCode}`);
      
      const phoneResponse = await fetch(
        `${API_BASE_URL}/twilio/purchase_phone_number?country_code=${encodeURIComponent(countryCode)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!phoneResponse.ok) {
        const errorData = await phoneResponse.json().catch(e => ({ error: `Failed to parse error response: ${e.message}` }));
        console.error('Failed to purchase phone number:', errorData);
        throw new Error(errorData.error || 'Failed to purchase phone number');
      }

      const phoneResult = await phoneResponse.json();
      console.log('Phone number purchased:', phoneResult);

      if (phoneResult.phone_number) {
        setPhoneNumber(phoneResult.phone_number);
        setHasPhoneNumber(true);
        setShowPurchaseUI(false);
        setSuccessMessage("Phone number successfully purchased!");
        localStorage.setItem('flowonAI_phoneNumber', phoneResult.phone_number);
      } else {
        throw new Error('No phone number received from server');
      }
    } catch (err: any) {
      console.error('Error purchasing phone number:', err);
      setError(err.message || 'Failed to purchase phone number. Please try again.');
    } finally {
      setIsPhonePurchaseLoading(false);
    }
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
          {hasPhoneNumber ? "Your Flowon Agent Phone Number" : "Assign a Phone Number to your Flowon Agent"}
        </h2>
      </div>

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
              <div className="text-center mb-6">
                <p className="text-lg font-medium mb-2">To get your agent up and running, you'll need a phone number</p>
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handlePurchasePhoneNumber}
                  disabled={isPhonePurchaseLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isPhonePurchaseLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Purchasing Number...
                    </>
                  ) : (
                    <>
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Request Phone Number
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                * A phone number will be assigned based on your business location
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
