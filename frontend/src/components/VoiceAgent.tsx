import { useState, useCallback } from 'react';
import MorphingStreamButton from '@/components/MorphingStreamButton';
import LiveKitEntry from '@/components/LiveKitEntry';

export function VoiceAgent() {
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { accessToken, url } = await fetch('/api/token').then(res => res.json());
      setToken(accessToken);
      setUrl(url);
      setIsLiveKitActive(true);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

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
    <div className="flex flex-col items-center justify-center w-full">
      <h3 className="text-xl font-semibold mb-4">Voice Agent</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-2xl">
        Experience our Voice Agent feature. Click the button below to start a conversation with our AI assistant.
      </p>
      <MorphingStreamButton 
        onStreamToggle={toggleLiveKit}
        isStreaming={isLiveKitActive}
      />
      {isLiveKitActive && token && url && (
        <div className="mt-6 w-full max-w-md">
          <LiveKitEntry token={token} url={url} />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Voice agent is active. Speak into your microphone to interact with the AI.
          </p>
        </div>
      )}
    </div>
  );
}

export default VoiceAgent;
