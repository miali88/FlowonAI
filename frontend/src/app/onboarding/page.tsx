"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  ArrowRight, 
  Info, 
  Building2, 
  Globe, 
  CheckCircle2, 
  Play, 
  Pause, 
  Volume2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AutoSearchPlacesInput from "@/app/dashboard/guided-setup/components/AutoSearchPlacesInput";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAudioTest, setShowAudioTest] = useState(false);
  
  // Audio state
  const [greetingAudioUrl, setGreetingAudioUrl] = useState<string | null>(null);
  const [messageAudioUrl, setMessageAudioUrl] = useState<string | null>(null);
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);
  const [isPlayingMessage, setIsPlayingMessage] = useState(false);
  
  const greetingAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const router = useRouter();
  const { userId, getToken } = useAuth();

  useEffect(() => {
    // Hidden audio elements for playback
    if (greetingAudioUrl && !greetingAudioRef.current) {
      const audio = new Audio(greetingAudioUrl);
      audio.addEventListener('ended', () => {
        setIsPlayingGreeting(false);
      });
      greetingAudioRef.current = audio;
    }

    if (messageAudioUrl && !messageAudioRef.current) {
      const audio = new Audio(messageAudioUrl);
      audio.addEventListener('ended', () => {
        setIsPlayingMessage(false);
      });
      messageAudioRef.current = audio;
    }

    // Cleanup function
    return () => {
      if (greetingAudioRef.current) {
        greetingAudioRef.current.pause();
        greetingAudioRef.current.removeEventListener('ended', () => {
          setIsPlayingGreeting(false);
        });
      }
      
      if (messageAudioRef.current) {
        messageAudioRef.current.pause();
        messageAudioRef.current.removeEventListener('ended', () => {
          setIsPlayingMessage(false);
        });
      }
    };
  }, [greetingAudioUrl, messageAudioUrl]);

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
    
    // Could also extract and use business description if needed
    // You could also extract and use business hours if needed
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
          businessPhone: businessPhone
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error generating audio preview:", errorData);
        throw new Error("Failed to generate audio preview");
      }

      const data = await response.json();
      
      console.log("Audio preview generated successfully:", data);
      
      // Show audio test section
      setShowAudioTest(true);
      
      // Set the audio URLs from the response
      if (data.greeting_audio_url) {
        setGreetingAudioUrl(data.greeting_audio_url);
      }
      
      if (data.message_audio_url) {
        setMessageAudioUrl(data.message_audio_url);
      }
      
      setSuccessMessage("Audio preview generated successfully!");
      
    } catch (err: any) {
      console.error("Error in onboarding submission:", err);
      setError(err.message || "Failed to generate audio preview");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const playGreetingAudio = () => {
    if (!greetingAudioRef.current) return;
    
    if (isPlayingGreeting) {
      // Pause if already playing
      greetingAudioRef.current.pause();
      setIsPlayingGreeting(false);
    } else {
      // Pause message audio if playing
      if (isPlayingMessage && messageAudioRef.current) {
        messageAudioRef.current.pause();
        setIsPlayingMessage(false);
      }
      
      // Play greeting audio
      greetingAudioRef.current.play()
        .then(() => {
          setIsPlayingGreeting(true);
        })
        .catch((err) => {
          console.error("Error playing greeting audio:", err);
          setError("Failed to play audio. Please try again.");
        });
    }
  };
  
  const playMessageAudio = () => {
    if (!messageAudioRef.current) return;
    
    if (isPlayingMessage) {
      // Pause if already playing
      messageAudioRef.current.pause();
      setIsPlayingMessage(false);
    } else {
      // Pause greeting audio if playing
      if (isPlayingGreeting && greetingAudioRef.current) {
        greetingAudioRef.current.pause();
        setIsPlayingGreeting(false);
      }
      
      // Play message audio
      messageAudioRef.current.play()
        .then(() => {
          setIsPlayingMessage(true);
        })
        .catch((err) => {
          console.error("Error playing message audio:", err);
          setError("Failed to play audio. Please try again.");
        });
    }
  };
  
  const handleContinueToSetup = () => {
    router.push("/dashboard/guided-setup");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Business Sources Section or Audio Test */}
      <div className="w-1/2 p-10 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          {!showAudioTest ? (
            // Initial form
            <>
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
                        Generate Voice Preview <ArrowRight className="ml-2 h-4 w-4" />
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
            </>
          ) : (
            // Audio testing section
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">Test Your AI Assistant</h1>
                <p className="text-gray-600">
                  Listen to how your AI assistant will sound when answering calls. We've generated
                  sample audio based on your business information.
                </p>
              </div>
              
              {/* Hidden audio elements */}
              {greetingAudioUrl && (
                <audio ref={greetingAudioRef} src={greetingAudioUrl} />
              )}
              
              {messageAudioUrl && (
                <audio ref={messageAudioRef} src={messageAudioUrl} />
              )}
              
              <div className="space-y-8">
                {/* Greeting audio card */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">Greeting</h3>
                      <p className="text-gray-500 text-sm">
                        How your AI will greet callers
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <button
                        onClick={playGreetingAudio}
                        disabled={!greetingAudioUrl || isPlayingGreeting}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isPlayingGreeting ? 'bg-blue-100' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isPlayingGreeting ? (
                          <Pause className="h-6 w-6 text-blue-600" />
                        ) : (
                          <Play className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-gray-700 italic">
                      "Hello, thank you for calling {businessName}. This is Flowon, your AI assistant. How may I help you today?"
                    </p>
                  </div>
                </Card>
                
                {/* Message taking audio card */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">Message Taking</h3>
                      <p className="text-gray-500 text-sm">
                        How your AI will take messages
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <button
                        onClick={playMessageAudio}
                        disabled={!messageAudioUrl || isPlayingMessage}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isPlayingMessage ? 'bg-purple-100' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {isPlayingMessage ? (
                          <Pause className="h-6 w-6 text-purple-600" />
                        ) : (
                          <Play className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-gray-700 italic">
                      "I'd be happy to take a message. May I have your name and the best number to reach you? Also, could you briefly tell me what your message is about?"
                    </p>
                  </div>
                </Card>
                
                <div className="pt-6">
                  <Button 
                    onClick={handleContinueToSetup} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Guided Setup <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Right side - Moving Gradient Blob */}
      <div className="w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <BlobAnimation />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10 z-10">
          <h2 className="text-3xl font-bold mb-6 text-center">
            {showAudioTest ? "Listen to Your AI Assistant" : "Transform Your Business Communication"}
          </h2>
          
          {showAudioTest ? (
            <>
              <p className="text-xl text-center max-w-md text-gray-300 mb-8">
                Your AI assistant uses natural language processing to create a voice that represents your brand.
              </p>
              
              <div className="grid grid-cols-1 gap-6 max-w-md">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Natural Voice</h3>
                  <p className="text-sm text-gray-300">
                    AI-generated voice that sounds natural and professional
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Customizable Tone</h3>
                  <p className="text-sm text-gray-300">
                    Adjust the tone to match your brand's personality
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-semibold">High-Quality Audio</h3>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    Crystal clear voice quality for professional calls
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Animation component for the moving gradient blob
function BlobAnimation() {
  useEffect(() => {
    // Create animation for the blobs using CSS variables
    const blobs = document.querySelectorAll('.blob');
    
    blobs.forEach((blob) => {
      // Randomize initial positions
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      
      blob.animate(
        [
          { transform: `translate(${randomX}px, ${randomY}px) scale(1)` },
          { transform: `translate(${randomX + 50}px, ${randomY - 50}px) scale(1.1)` },
          { transform: `translate(${randomX - 30}px, ${randomY + 40}px) scale(0.9)` },
          { transform: `translate(${randomX + 20}px, ${randomY + 30}px) scale(1.05)` },
          { transform: `translate(${randomX}px, ${randomY}px) scale(1)` },
        ],
        {
          duration: 15000 + Math.random() * 10000, // Random duration between 15-25s
          iterations: Infinity,
          easing: 'ease-in-out'
        }
      );
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>
      
      {/* Cyan blob */}
      <div className="blob absolute w-96 h-96 rounded-full bg-cyan-500 opacity-30 blur-3xl top-1/4 -left-20 z-0"></div>
      
      {/* Smaller cyan blob */}
      <div className="blob absolute w-64 h-64 rounded-full bg-cyan-400 opacity-20 blur-2xl bottom-1/3 right-20 z-0"></div>
      
      {/* Purple blob */}
      <div className="blob absolute w-96 h-96 rounded-full bg-purple-600 opacity-30 blur-3xl -bottom-20 right-1/4 z-0"></div>
      
      {/* Smaller purple blob */}
      <div className="blob absolute w-72 h-72 rounded-full bg-purple-500 opacity-20 blur-2xl top-20 right-1/3 z-0"></div>
      
      {/* Mixed color blob */}
      <div className="blob absolute w-80 h-80 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-25 blur-3xl top-1/2 left-1/3 z-0"></div>
    </div>
  );
}
