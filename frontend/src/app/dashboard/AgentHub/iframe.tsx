'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import LiveKitEntry from '@/app/dashboard/AgentHub/LiveKitEntryEntry';
import MorphingStreamButton from '@/app/dashboard/AgentHub/MorphingStreamButtonutton';
import { Agent } from './LibraryTable';
import { AnimatedGridPatternDemo } from '@/components/magicui/AnimatedGridPattern';
import { Loader2, AlertCircle } from 'lucide-react';

interface AgentHubProps {
  selectedAgent: Agent | null;
  embedMode?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AgentHub({ selectedAgent, embedMode = false }: AgentHubProps) {
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!selectedAgent) {
      console.error('No agent selected');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/livekit/token_embed?agent_id=${selectedAgent.id}`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      const { accessToken, url } = await response.json();
      setToken(accessToken);
      setUrl(url);
      setIsLiveKitActive(true);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [selectedAgent]);

  const toggleLiveKit = () => {
    if (isLiveKitActive) {
      setIsLiveKitActive(false);
      setToken(null);
      setUrl(null);
    } else {
      handleConnect();
    }
  };

  return (
    <div className={`flex flex-col ${embedMode ? 'h-full' : 'h-screen'}`}>
      <div className="flex-grow relative">
        <AnimatedGridPatternDemo className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MorphingStreamButton 
            onStreamToggle={toggleLiveKit} 
            isStreaming={isLiveKitActive} 
            showTextBox={false} 
          />
        </div>
        {isLiveKitActive && token && url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LiveKitEntry token={token} url={url} />
          </div>
        )}
      </div>
    </div>
  );
}