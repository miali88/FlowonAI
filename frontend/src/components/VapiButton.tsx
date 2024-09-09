import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Vapi from "@vapi-ai/web";

interface VapiButtonProps {
  apiKey: string;
  assistant: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

const VapiButton: React.FC<VapiButtonProps> = ({ apiKey, assistant, onCallStart, onCallEnd }) => {
  const [state, setState] = useState<'idle' | 'loading' | 'active' | 'speaking'>('idle');
  const [volume, setVolume] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    console.log("VapiButton: Received API Key:", apiKey);
    console.log("VapiButton: Assistant ID:", assistant);
    
    if (!apiKey || !assistant) {
      console.error("VapiButton: API Key or Assistant ID is missing");
      return;
    }

    try {
      // Create a new Vapi instance with the API key
      vapiRef.current = new Vapi({
        apiKey: apiKey
      });
      console.log("VapiButton: Vapi instance created successfully");

      setupListeners();
    } catch (error) {
      console.error("VapiButton: Error creating Vapi instance:", error);
    }

    return () => {
      // Clean up listeners if necessary
      if (vapiRef.current) {
        vapiRef.current.removeAllListeners();
      }
    };
  }, [apiKey, assistant]);

  const setupListeners = () => {
    if (!vapiRef.current) return;

    vapiRef.current.on("call-start", () => {
      setState('active');
      onCallStart?.();
    });

    vapiRef.current.on("call-end", () => {
      setState('idle');
      onCallEnd?.();
    });

    vapiRef.current.on("speech-start", () => {
      setState('speaking');
    });

    vapiRef.current.on("speech-end", () => {
      setState('active');
    });

    vapiRef.current.on("volume-level", (audioLevel: number) => {
      setVolume(Math.floor(audioLevel * 10));
    });
  };

  const toggleCall = () => {
    if (!vapiRef.current) {
      console.error("VapiButton: Vapi instance is not initialized");
      return;
    }

    if (state === 'idle') {
      console.log("VapiButton: Attempting to start call");
      setState('loading');
      vapiRef.current.start({
        assistantId: assistant,
        // Add any other necessary options here
      })
        .then(() => {
          console.log("VapiButton: Call started successfully");
        })
        .catch(error => {
          console.error("VapiButton: Error starting call:", error);
          if (error.response) {
            console.error("VapiButton: Response data:", error.response.data);
            console.error("VapiButton: Response status:", error.response.status);
            console.error("VapiButton: Response headers:", error.response.headers);
          } else if (error.request) {
            console.error("VapiButton: No response received:", error.request);
          } else {
            console.error("VapiButton: Error message:", error.message);
          }
          setState('idle');
        });
    } else {
      console.log("VapiButton: Attempting to stop call");
      vapiRef.current.stop();
      setState('idle');
    }
  };

  return (
    <Button 
      onClick={toggleCall} 
      variant={state === 'idle' ? "default" : "destructive"}
      className={cn(
        "relative overflow-hidden",
        state === 'speaking' && "animate-pulse",
        `vapi-btn-volume-${volume}`
      )}
    >
      {state === 'loading' ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : state === 'idle' ? (
        <Mic className="mr-2 h-4 w-4" />
      ) : (
        <MicOff className="mr-2 h-4 w-4" />
      )}
      {state === 'idle' ? "Start Call" : state === 'loading' ? "Connecting..." : "End Call"}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300 ease-in-out" 
        style={{ width: `${volume * 10}%` }}
      />
    </Button>
  );
};

export default VapiButton;