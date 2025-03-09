"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  ArrowRight, 
  Info, 
  Building2, 
  Globe, 
  CheckCircle2, 
  Play, 
  Pause, 
  VolumeX,
  Volume2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAudioTest, setShowAudioTest] = useState(false);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [greetingAudioUrl, setGreetingAudioUrl] = useState<string | null>(null);
  const [messageAudioUrl, setMessageAudioUrl] = useState<string | null>(null);
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);
  const [isPlayingMessage, setIsPlayingMessage] = useState(false);
  const [greetingError, setGreetingError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  
  const greetingAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const router = useRouter();
  const { userId, getToken } = useAuth();

  useEffect(() => {
    // Set up audio event listeners
    if (greetingAudioRef.current) {
      greetingAudioRef.current.onended = () => setIsPlayingGreeting(false);
    }
    
    if (messageAudioRef.current) {
      messageAudioRef.current.onended = () => setIsPlayingMessage(false);
    }
  }, [greetingAudioUrl, messageAudioUrl]);

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

      console.log("Submitting business information...");
      
      // Submit business information
      const response = await fetch(`${API_BASE_URL}/guided_setup/quick_setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          trainingSources: {
            businessWebsite: businessWebsite
          },
          businessInformation: {
            businessName: businessName,
            businessOverview: businessDescription,
            primaryBusinessAddress: "",
            primaryBusinessPhone: "",
            coreServices: [],
            businessHours: {}
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error submitting business info:", errorData);
        throw new Error("Failed to submit business information");
      }

      const data = await response.json();
      
      console.log("Business information submitted successfully:", data);
      setSuccessMessage("Business information saved successfully!");
      
      // Show audio test section instead of redirecting
      setShowAudioTest(true);
      
      // Load audio samples
      loadGreetingAudio();
      loadMessageAudio();
      
    } catch (err: any) {
      console.error("Error in onboarding submission:", err);
      setError(err.message || "Failed to submit business information");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const loadGreetingAudio = async () => {
    try {
      setIsLoadingGreeting(true);
      setGreetingError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      console.log("Fetching greeting audio sample...");
      
      // Example endpoint - replace with your actual endpoint
      const response = await fetch(`${API_BASE_URL}/audio/generate_greeting`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to load greeting audio");
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setGreetingAudioUrl(audioUrl);
      
    } catch (err: any) {
      console.error("Error loading greeting audio:", err);
      setGreetingError(err.message || "Failed to load greeting audio");
    } finally {
      setIsLoadingGreeting(false);
    }
  };
  
  const loadMessageAudio = async () => {
    try {
      setIsLoadingMessage(true);
      setMessageError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      
      console.log("Fetching message-taking audio sample...");
      
      // Example endpoint - replace with your actual endpoint
      const response = await fetch(`${API_BASE_URL}/audio/generate_message`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to load message audio");
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setMessageAudioUrl(audioUrl);
      
    } catch (err: any) {
      console.error("Error loading message audio:", err);
      setMessageError(err.message || "Failed to load message audio");
    } finally {
      setIsLoadingMessage(false);
    }
  };
  
  const playGreetingAudio = () => {
    if (greetingAudioRef.current) {
      if (isPlayingGreeting) {
        greetingAudioRef.current.pause();
        setIsPlayingGreeting(false);
      } else {
        // Pause message audio if playing
        if (isPlayingMessage && messageAudioRef.current) {
          messageAudioRef.current.pause();
          setIsPlayingMessage(false);
        }
        
        greetingAudioRef.current.play();
        setIsPlayingGreeting(true);
      }
    }
  };
  
  const playMessageAudio = () => {
    if (messageAudioRef.current) {
      if (isPlayingMessage) {
        messageAudioRef.current.pause();
        setIsPlayingMessage(false);
      } else {
        // Pause greeting audio if playing
        if (isPlayingGreeting && greetingAudioRef.current) {
          greetingAudioRef.current.pause();
          setIsPlayingGreeting(false);
        }
        
        messageAudioRef.current.play();
        setIsPlayingMessage(true);
      }
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
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your Business Name"
                      className="flex-1"
                      required
                    />
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
                
                <div className="space-y-2">
                  <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
                    Business Description
                  </label>
                  <Textarea
                    id="businessDescription"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Tell us about your business, products, services, and what makes you unique..."
                    className="h-32"
                    required
                  />
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
                        Saving...
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
                      {isLoadingGreeting ? (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        </div>
                      ) : greetingError ? (
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <VolumeX className="h-6 w-6 text-red-600" />
                        </div>
                      ) : (
                        <button
                          onClick={playGreetingAudio}
                          className={`w-12 h-12 rounded-full ${isPlayingGreeting ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center transition-colors`}
                        >
                          {isPlayingGreeting ? (
                            <Pause className={`h-6 w-6 ${isPlayingGreeting ? 'text-white' : 'text-blue-600'}`} />
                          ) : (
                            <Play className="h-6 w-6 text-blue-600 ml-1" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {greetingError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{greetingError}</AlertDescription>
                    </Alert>
                  )}
                  
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
                      {isLoadingMessage ? (
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                        </div>
                      ) : messageError ? (
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <VolumeX className="h-6 w-6 text-red-600" />
                        </div>
                      ) : (
                        <button
                          onClick={playMessageAudio}
                          className={`w-12 h-12 rounded-full ${isPlayingMessage ? 'bg-purple-600' : 'bg-purple-100'} flex items-center justify-center transition-colors`}
                        >
                          {isPlayingMessage ? (
                            <Pause className={`h-6 w-6 ${isPlayingMessage ? 'text-white' : 'text-purple-600'}`} />
                          ) : (
                            <Play className="h-6 w-6 text-purple-600 ml-1" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {messageError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{messageError}</AlertDescription>
                    </Alert>
                  )}
                  
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
