'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import LiveKitEntry from '@/app/dashboard/AgentHub/LiveKitEntry';
import { useUser } from "@clerk/nextjs";
import MorphingStreamButton from '@/app/dashboard/AgentHub/MorphingStreamButton';
import { Agent } from './LibraryTable';

import { AnimatedGridPatternDemo } from '@/components/magicui/AnimatedGridPattern';
import { Loader2, AlertCircle } from 'lucide-react';

interface AgentHubProps {
  selectedAgent: Agent | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEV_MODE = process.env.NODE_ENV === 'development';
const BASE_URL = DEV_MODE ? 'https://localhost:3000' : 'https://flowon.ai';

export function AgentHub({ selectedAgent }: AgentHubProps) {
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useUser();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAgent && user) {
      fetchAgentContent(selectedAgent.id, user.id);
    }
  }, [selectedAgent, user]);

  const fetchAgentContent = async (agentId: string, userId: string) => {
    setIframeLoading(true);
    setIframeError(null);
    try {
      const url = `/api/agent-content?agentId=${agentId}&userId=${userId}`;
      setIframeUrl(url);
    } catch (error) {
      console.error('Error setting agent content URL:', error);
      setIframeError('Failed to load agent content');
    } finally {
      setIframeLoading(false);
    }
  };

  const handleConnect = useCallback(async () => {
    if (!selectedAgent) {
      console.error('No agent selected');
      return;
    }
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/livekit/token?agent_id=${selectedAgent.id}&user_id=${user.id}`, { 
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
  }, [selectedAgent, user]);

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
    <div className="flex flex-col h-full">
      <div className="flex-grow relative">
        <AnimatedGridPatternDemo className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          {iframeUrl ? (
            <>
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                  <Loader2 className="h-8 w-8 animate-spin" /> {/* Spinner */}
                </div>
              )}
              {iframeError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75">
                  <div className="text-red-500 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    {iframeError}
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                className={`w-full h-full border-0 ${iframeLoading ? 'hidden' : ''}`}
                title="Agent Content"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setIframeError('Failed to load agent content');
                }}
                sandbox="allow-scripts allow-same-origin"
              />
            </>
          ) : (
            <MorphingStreamButton 
              onStreamToggle={toggleLiveKit} 
              isStreaming={isLiveKitActive} 
              showTextBox={false} 
            />
          )}
        </div>
        {isLiveKitActive && token && url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LiveKitEntry token={token} url={url} />
          </div>
        )}
      </div>
      {/* Additional Content */}
      <div className="mt-4">
        {/* Add your additional content here */}
      </div>
    </div>
  );
}