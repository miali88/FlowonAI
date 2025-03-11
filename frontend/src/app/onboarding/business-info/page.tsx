"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  ArrowRight, 
  Info, 
  Building2, 
  Globe, 
  CheckCircle2,
  // Languages - commented out as we're hiding language selection UI
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AutoSearchPlacesInput from "@/app/dashboard/guided-setup/components/AutoSearchPlacesInput";
import BlobAnimation from "@/app/onboarding/components/BlobAnimation";
// Import Select components but comment them out as we're hiding language selection UI
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Map of country codes to languages
const COUNTRY_TO_LANGUAGE = {
  // Europe
  'GB': 'en-GB', // United Kingdom
  'IE': 'en', // Ireland
  'US': 'en-US', // United States
  'CA': 'en-US', // Canada (could also be 'fr' in Quebec)
  'AU': 'en', // Australia
  'NZ': 'en', // New Zealand
  'FR': 'fr', // France
  'ES': 'es', // Spain
  'PT': 'pt', // Portugal
  'IT': 'it', // Italy
  'DE': 'de', // Germany
  'AT': 'de', // Austria
  'CH': 'de', // Switzerland (could also be 'fr', 'it')
  'NL': 'nl', // Netherlands
  'BE': 'nl', // Belgium (could also be 'fr')
  'SE': 'sv', // Sweden
  'NO': 'no', // Norway
  'DK': 'da', // Denmark
  'FI': 'fi', // Finland
  'RU': 'ru', // Russia
  'PL': 'pl', // Poland
  'CZ': 'cs', // Czech Republic
  'GR': 'el', // Greece
  'TR': 'tr', // Turkey
  // Asia
  'CN': 'zh', // China
  'JP': 'ja', // Japan
  'KR': 'ko', // South Korea
  'IN': 'hi', // India (many languages)
  'TH': 'th', // Thailand
  'VN': 'vi', // Vietnam
  // Middle East
  'SA': 'ar', // Saudi Arabia
  'AE': 'ar', // United Arab Emirates
  'IL': 'he', // Israel
  'IQ': 'ar', // Iraq

  // Latin America
  'MX': 'es', // Mexico
  'BR': 'pt', // Brazil
  'AR': 'es', // Argentina
  'CL': 'es', // Chile
  'CO': 'es', // Colombia
  'PE': 'es', // Peru
};

// List of supported languages - keep for future use but not currently displayed in UI
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  // { code: 'es', name: 'Spanish' },
  // { code: 'fr', name: 'French' },
  // { code: 'de', name: 'German' },
  // { code: 'pt', name: 'Portuguese' },
  // { code: 'it', name: 'Italian' },
  // { code: 'ar', name: 'Arabic' },
];

// Default to English (US) if no match is found
const DEFAULT_LANGUAGE = 'en-US';

export default function BusinessInfoPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  // Keep agentLanguage state for internal use, even though UI is hidden
  const [agentLanguage, setAgentLanguage] = useState(DEFAULT_LANGUAGE);
  const [countryCode, setCountryCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const { getToken } = useAuth();

  const handlePlaceSelect = (placeData: any) => {
    console.log("Place data selected:", placeData);
    
    // Update the business name
    setBusinessName(placeData.name || "");
    
    // Extract website if available
    if (placeData.website) {
      setBusinessWebsite(placeData.website);
    }
    
    // Extract address if available
    if (placeData.formatted_address) {
      setBusinessAddress(placeData.formatted_address);
    }
    
    // Extract phone if available
    if (placeData.formatted_phone_number) {
      setBusinessPhone(placeData.formatted_phone_number);
    }
    
    // Detect country from address components
    if (placeData.address_components) {
      const countryComponent = placeData.address_components.find(
        (component: any) => component.types.includes('country')
      );
      
      if (countryComponent) {
        const countryCode = countryComponent.short_name;
        console.log("Detected country code:", countryCode);
        setCountryCode(countryCode);
        
        // Set default language based on country
        const detectedLanguage = COUNTRY_TO_LANGUAGE[countryCode as keyof typeof COUNTRY_TO_LANGUAGE] || DEFAULT_LANGUAGE;
        console.log(`Setting default language to ${detectedLanguage} based on country ${countryCode}`);
        setAgentLanguage(detectedLanguage);
      }
    }

    // Set a success message
    setSuccessMessage("Business information populated! Please review and make any adjustments before continuing.");
    
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get the authentication token
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      console.log("Submitting business information for preview...");
      console.log("Agent language:", agentLanguage);
      
      // Submit business information for audio preview
      const response = await fetch(`${API_BASE_URL}/guided_setup/onboarding_preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: businessName,
          businessDescription: businessDescription,
          businessWebsite: businessWebsite,
          businessAddress: businessAddress,
          businessPhone: businessPhone,
          agentLanguage: agentLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error generating audio preview:", errorData);
        throw new Error("Failed to generate audio preview");
      }

      const data = await response.json();
      console.log("Audio preview generated successfully:", data);
      
      // Save the onboarding data to the backend
      console.log("Saving onboarding data to the backend...");
      const saveResponse = await fetch(`${API_BASE_URL}/guided_setup/save_onboarding_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: businessName,
          businessDescription: businessDescription,
          businessWebsite: businessWebsite,
          businessAddress: businessAddress,
          businessPhone: businessPhone,
          agentLanguage: agentLanguage
        })
      });
      
      if (!saveResponse.ok) {
        const saveErrorData = await saveResponse.text();
        console.error("Error saving onboarding data:", saveErrorData);
        // Continue anyway since this is not critical for the audio test
        console.warn("Continuing to next step despite error saving onboarding data");
      } else {
        console.log("Onboarding data saved successfully");
      }
      
      // Store data in localStorage for the next step
      localStorage.setItem('flowonAI_businessInfo', JSON.stringify({
        businessName,
        businessWebsite,
        businessDescription,
        businessAddress,
        businessPhone,
        agentLanguage,
        countryCode
      }));
      
      // Store audio data in localStorage
      if (data.greeting_audio_data_base64) {
        localStorage.setItem('flowonAI_greetingAudio', data.greeting_audio_data_base64);
      }
      
      if (data.message_audio_data_base64) {
        localStorage.setItem('flowonAI_messageAudio', data.message_audio_data_base64);
      }
      
      // Navigate to the next step
      router.push("/onboarding/audio-test");
      
    } catch (err: any) {
      console.error("Error in onboarding submission:", err);
      setError(err.message || "Failed to generate audio preview");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Business Info Form */}
      <div className="w-1/2 p-10 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome to Flowon AI</h1>
            <p className="text-gray-600">
              Let's get started by setting up your business information. This will help us
              create an AI assistant that truly represents your brand.
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex-1">
                  <AutoSearchPlacesInput
                    value={businessName}
                    onChange={setBusinessName}
                    onPlaceSelect={handlePlaceSelect}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700">
                Business Website
              </label>
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-gray-400 mr-2" />
                <Input
                  id="businessWebsite"
                  value={businessWebsite}
                  onChange={(e) => setBusinessWebsite(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">
                Your website will be used to train your AI on your business information.
              </p>
            </div>
            
            {/* Agent language selection UI - commented out per roadmap plan
            <div className="space-y-2">
              <label htmlFor="agentLanguage" className="block text-sm font-medium text-gray-700">
                Default Agent Language
              </label>
              <div className="flex items-center">
                <Languages className="w-5 h-5 text-gray-400 mr-2" />
                <Select value={agentLanguage} onValueChange={setAgentLanguage}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {countryCode && (
                <p className="text-xs text-gray-500">
                  Automatically detected based on your business location ({countryCode}).
                </p>
              )}
              <p className="text-xs text-gray-500">
                This is the default greeting language the agent will use. However, the agent can detect and adapt to the language of the caller during conversations.
              </p>
            </div>
            */}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Voice Preview...
                  </>
                ) : (
                  <>
                    Continue to Audio Test <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-1">
              <Info className="h-4 w-4" />
              <span>
                You'll complete the full setup in the next steps
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Moving Gradient Blob */}
      <div className="w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <BlobAnimation />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10 z-10">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Transform Your Business Communication
          </h2>
          
          <p className="text-xl text-center max-w-md text-gray-300 mb-8">
            Flowon AI handles your calls, messages, and inquiries with the perfect blend
            of personality and professionalism.
          </p>
          <div className="grid grid-cols-2 gap-6 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <h3 className="font-semibold mb-2">24/7 Availability</h3>
              <p className="text-sm text-gray-300">
                Never miss a customer inquiry again
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Human-like Experience</h3>
              <p className="text-sm text-gray-300">
                Natural conversations that feel personal
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Business Intelligence</h3>
              <p className="text-sm text-gray-300">
                Trained specifically on your business
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Seamless Integration</h3>
              <p className="text-sm text-gray-300">
                Works with your existing systems
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 