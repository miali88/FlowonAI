import { useEffect, useState, useCallback, useRef } from "react";
import { Room } from 'livekit-client';
import { LiveKitRoom } from '@livekit/components-react';

interface LiveKitTextEntryProps {
  agentId: string;
  apiBaseUrl: string;
  onRoomConnected?: (roomName: string) => void;
}

interface RoomDetails {
  token: string;
  url: string;
  roomName: string;
}

const STORAGE_KEY = 'livekit_room_details';
const userId = "visitor";

const LiveKitTextEntry: React.FC<LiveKitTextEntryProps> = ({ 
  agentId, 
  apiBaseUrl, 
  onRoomConnected 
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const initializationAttempted = useRef(false);

  // Add validation for required props
  useEffect(() => {
    if (!apiBaseUrl) {
      console.error('API Base URL is required');
      return;
    }
    if (!agentId) {
      console.error('Agent ID is required');
      return;
    }

    const initializeRoom = async () => {
      // Prevent multiple initialization attempts
      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      try {
        console.log('Initializing room with:', {
          apiBaseUrl,
          agentId
        });

        const response = await fetch(
          `${apiBaseUrl}/livekit/token?agent_id=${agentId}&user_id=${userId}&medium=textbot`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const { accessToken, url: liveKitUrl, roomName: newRoomName } = data;
        
        // Store room details in session storage
        const roomDetails: RoomDetails = {
          token: accessToken,
          url: liveKitUrl,
          roomName: newRoomName
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(roomDetails));
        
        setToken(accessToken);
        setUrl(liveKitUrl);
        setRoomName(newRoomName);
        onRoomConnected?.(newRoomName);
      } catch (error) {
        console.error('Failed to initialize LiveKit room:', error);
        initializationAttempted.current = false; // Allow retry on error
      }
    };

    initializeRoom();

    // Cleanup function
    return () => {
      // Optional: Clear storage on unmount if needed
      // sessionStorage.removeItem(STORAGE_KEY);
    };
  }, [agentId, apiBaseUrl]);

  const handleConnected = useCallback((room: Room) => {
    console.log('Connected to LiveKit room:', room.name);
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('Disconnected from LiveKit room');
    // Optionally clear storage on disconnect
    // sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  if (!token || !url || !roomName) {
    return null;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      name={roomName}
      connectOptions={{
        autoSubscribe: true,
      }}
      options={{
        adaptiveStream: false,
        dynacast: false,
      }}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
    />
  );
};

export default LiveKitTextEntry;