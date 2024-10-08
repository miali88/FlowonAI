import { useState, useCallback, useRef, useEffect } from 'react';
import LiveKitEntry from '@/app/dashboard/AgentHub/LiveKitEntry';
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import MorphingStreamButton from '@/app/dashboard/AgentHub/MorphingStreamButton';
import { MagicCardDemo } from '@/components/magicui/MagicCardDemo';
import { CarouselSpacing } from '@/components/shadcn/Carousel';
import { Agent } from './LibraryTable';
//import { Agent } from './LibraryTable';
import { AgentCards } from './AgentCards';

import { AnimatedGridPatternDemo } from '@/components/magicui/AnimatedGridPattern';
import { Spinner } from '@/components/ui/spinner'; // Assuming you have a Spinner component

interface AgentHubProps {
  selectedAgent: Agent | null;}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEV_MODE = process.env.NODE_ENV === 'development';
const BASE_URL = DEV_MODE ? 'https://localhost:3000' : 'https://flowon.ai';

export function AgentHub({ selectedAgent }: AgentHubProps) {
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useUser(); // Get user information
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
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/content?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent content');
      }

      const htmlContent = await response.text();
      
      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setIframeUrl(url);
    } catch (error) {
      console.error('Error fetching agent content:', error);
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
              {iframeLoading && <Spinner />}
              {iframeError && <div className="text-red-500">{iframeError}</div>}
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
      {/* Space for other content like "Create New Agent" and agent cards */}
      <div className="mt-4">
        {/* Add your additional content here */}
      </div>
    </div>
  );
}