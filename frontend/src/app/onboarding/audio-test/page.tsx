"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Play, 
  Pause, 
  Volume2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BlobAnimation from "@/app/onboarding/components/BlobAnimation";

export default function AudioTestPage() {
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const [greetingAudioUrl, setGreetingAudioUrl] = useState<string | null>(null);
  const [messageAudioUrl, setMessageAudioUrl] = useState<string | null>(null);
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);
  const [isPlayingMessage, setIsPlayingMessage] = useState(false);
  
  const greetingAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Load audio data from localStorage
    const greetingAudio = localStorage.getItem('flowonAI_greetingAudio');
    const messageAudio = localStorage.getItem('flowonAI_messageAudio');
    
    if (greetingAudio) {
      setGreetingAudioUrl(greetingAudio);
      console.log("Greeting audio loaded from localStorage");
    }
    
    if (messageAudio) {
      setMessageAudioUrl(messageAudio);
      console.log("Message audio loaded from localStorage");
    }
    
    // Clean up blob URLs on component unmount
    return () => {
      if (greetingAudioUrl && greetingAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(greetingAudioUrl);
      }
      
      if (messageAudioUrl && messageAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(messageAudioUrl);
      }
    };
  }, []);

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
      
      // Ensure onended event is registered to reset the play button when audio finishes
      greetingAudioRef.current.onended = () => {
        setIsPlayingGreeting(false);
        console.log("Greeting audio finished playing");
      };
      
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
      
      // Ensure onended event is registered to reset the play button when audio finishes
      messageAudioRef.current.onended = () => {
        setIsPlayingMessage(false);
        console.log("Message audio finished playing");
      };
      
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
  
  const handleContinueToPricing = () => {
    router.push("/onboarding/pricing");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Audio Test Section */}
      <div className="w-1/2 p-10 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-3">Test Your AI Assistant</h1>
            <p className="text-gray-600">
              Listen to how your AI assistant will sound when answering calls. We've generated
              sample audio based on your business information.
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Audio elements for playback */}
          {greetingAudioUrl && (
            <audio 
              ref={greetingAudioRef} 
              src={greetingAudioUrl}
              onError={(e) => console.error("Greeting audio error:", e)} 
              onLoadedData={() => console.log("Greeting audio loaded successfully")}
              onEnded={() => setIsPlayingGreeting(false)}
            />
          )}
          
          {/* Message audio */}
          {messageAudioUrl && (
            <audio 
              ref={messageAudioRef} 
              src={messageAudioUrl}
              onError={(e) => console.error("Message audio error:", e)}
              onLoadedData={() => console.log("Message audio loaded successfully")} 
              onEnded={() => setIsPlayingMessage(false)}
            />
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
                    disabled={!greetingAudioUrl}
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
            </Card>
            
            {/* Message audio card */}
            {messageAudioUrl && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-lg">Sample Response</h3>
                    <p className="text-gray-500 text-sm">
                      How your AI will respond to inquiries
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={playMessageAudio}
                      disabled={!messageAudioUrl}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isPlayingMessage ? 'bg-blue-100' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isPlayingMessage ? (
                        <Pause className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Play className="h-6 w-6 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            )}
            
            <div className="pt-6">
              <Button 
                onClick={handleContinueToPricing} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue to Pricing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Moving Gradient Blob */}
      <div className="w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <BlobAnimation />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-10 z-10">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Listen to Your AI Assistant
          </h2>
          
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
        </div>
      </div>
    </div>
  );
} 