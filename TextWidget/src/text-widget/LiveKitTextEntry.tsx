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

export function LiveKitTextEntry({ 
  agentId, 
  apiBaseUrl,
  onRoomConnected 
}: LiveKitTextEntryProps) {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const initializationAttempted = useRef(false);

  // Initialize room connection on mount
  useEffect(() => {
    const getRoomFromStorage = (): RoomDetails | null => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const details = JSON.parse(stored);
          // Verify all required fields are present
          if (details.token && details.url && details.roomName) {
            return details;
          }
        } catch (e) {
          console.error('Failed to parse stored room details');
        }
      }
      return null;
    };

    const initializeRoom = async () => {
      // Prevent multiple initialization attempts
      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      // Check for existing room details
      const storedDetails = getRoomFromStorage();
      if (storedDetails) {
        setToken(storedDetails.token);
        setUrl(storedDetails.url);
        setRoomName(storedDetails.roomName);
        onRoomConnected?.(storedDetails.roomName);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/livekit/token?agent_id=${agentId}&user_id=${userId}&medium=textbot`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.status}`);
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
  }, [agentId, apiBaseUrl]); // Removed onRoomConnected from dependencies

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
}

export default LiveKitTextEntry;