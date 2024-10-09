import { useState, useCallback } from 'react';
import LiveKitEntry from '@/app/dashboard/AgentHub/LiveKitEntry';
import { useUser } from "@clerk/nextjs";
import MorphingStreamButton from '@/app/dashboard/AgentHub/MorphingStreamButton';
import { Agent } from './LibraryTable';
import { AnimatedGridPatternDemo } from '@/components/magicui/AnimatedGridPattern';

interface AgentHubProps {
  selectedAgent: Agent | null;}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AgentHub({ selectedAgent }: AgentHubProps) {
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useUser(); // Get user information

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
      {/* Space for other content like "Create New Agent" and agent cards */}
      <div className="mt-4">
        {/* Add your additional content here */}
      </div>
    </div>
  );
}
