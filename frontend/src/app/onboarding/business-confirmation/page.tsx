"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Globe, 
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import BlobAnimation from "@/app/onboarding/components/BlobAnimation";
import { OnboardingData, SetupData, convertOnboardingToSetupData } from "@/types/businessSetup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function BusinessConfirmationPage() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load onboarding data from localStorage
        const storedData = localStorage.getItem('flowonAI_onboardingData');
        if (!storedData) {
          router.push('/onboarding/business-info');
          return;
        }

        const parsedData = JSON.parse(storedData);
        console.log('Loaded onboarding data:', parsedData);
        setOnboardingData(parsedData);
      } catch (err) {
        console.error('Error loading business data:', err);
        setError('Failed to load business information');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleConfirm = async () => {
    if (!onboardingData) return;
    
    try {
      setIsGeneratingAudio(true);
      setError(null);

      console.log("Generating audio preview...");
      
      // Get session token from localStorage if it exists
      const sessionToken = localStorage.getItem('flowonAI_sessionToken');
      
      // Submit business information for audio preview
      const response = await fetch(`${API_BASE_URL}/guided_setup/onboarding_preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken && { "X-Session-Token": sessionToken })
        },
        body: JSON.stringify(onboardingData)
      });

      // Store new session token if provided
      const newSessionToken = response.headers.get("X-Session-Token");
      if (newSessionToken) {
        localStorage.setItem('flowonAI_sessionToken', newSessionToken);
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        const errorData = await response.text();
        console.error("Error generating audio preview:", errorData);
        throw new Error("Failed to generate audio preview");
      }

      const data = await response.json();
      console.log("Audio preview generated successfully:", data);
      
      // Store the setup data in localStorage for later use during signup
      const setupData: SetupData = convertOnboardingToSetupData(onboardingData);
      localStorage.setItem('flowonAI_setupData', JSON.stringify(setupData));
      
      // Store audio data in localStorage
      if (data.greeting_audio_data_base64) {
        localStorage.setItem('flowonAI_greetingAudio', data.greeting_audio_data_base64);
      }
      
      if (data.message_audio_data_base64) {
        localStorage.setItem('flowonAI_messageAudio', data.message_audio_data_base64);
      }
      
      // Navigate to audio test
      router.push("/onboarding/audio-test");
      
    } catch (err: any) {
      console.error("Error generating audio preview:", err);
      setError(err.message || "Failed to generate audio preview");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleEdit = () => {
    router.push("/onboarding/business-info");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!onboardingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>No business information found. Please start over.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left side - Business Confirmation */}
      <div className="w-full md:w-1/2 p-4 md:p-10 flex flex-col justify-center overflow-y-auto">
        <div className="max-w-lg mx-auto w-full">
          <div className="mb-6 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3">Confirm Your Business</h1>
            <p className="text-gray-600 text-sm md:text-base">
              Please review the information we've gathered about your business.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 md:mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-4 md:mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-semibold break-words">{onboardingData.businessName}</h2>
                {onboardingData.businessDescription && (
                  <p className="text-gray-600 text-sm mt-1 break-words">{onboardingData.businessDescription}</p>
                )}
              </div>

              <div className="space-y-3 mt-4">
                {onboardingData.businessWebsite && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <a href={onboardingData.businessWebsite} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline text-sm md:text-base break-words">
                      {onboardingData.businessWebsite}
                    </a>
                  </div>
                )}

                {onboardingData.businessAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base break-words">{onboardingData.businessAddress}</span>
                  </div>
                )}

                {onboardingData.businessPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">{onboardingData.businessPhone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="w-full sm:flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Edit Information
            </Button>

            <Button
              onClick={handleConfirm}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isGeneratingAudio}
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Voice Preview...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm & Continue
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Moving Gradient Blob - Hidden on mobile */}
      <div className="hidden md:block w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <BlobAnimation />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 md:p-10 z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
            Almost There!
          </h2>
          
          <p className="text-lg md:text-xl text-center max-w-md text-gray-300 mb-6 md:mb-8">
            We'll use this information to create a personalized AI assistant that perfectly represents your business.
          </p>

          <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Accurate Information</h3>
              <p className="text-sm text-gray-300">
                Ensures your AI assistant has the right details
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Brand Consistency</h3>
              <p className="text-sm text-gray-300">
                Maintains your business identity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 