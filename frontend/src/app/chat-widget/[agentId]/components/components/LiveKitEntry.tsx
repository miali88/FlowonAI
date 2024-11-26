import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { Room, LocalParticipant } from 'livekit-client';
import { useState, useEffect, useCallback } from "react";

interface LiveKitEntryProps {
  token: string;
  url: string;
  isStreaming: boolean;
  options: {
    element?: Element;
    adaptiveStream?: boolean;
    dynacast?: boolean;
    // ... other options can be added here
  };
  onStreamEnd: () => void;
  onStreamStart: () => void;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  setLocalParticipant: React.Dispatch<React.SetStateAction<LocalParticipant | null>>;
  setParticipantIdentity: React.Dispatch<React.SetStateAction<string | null>>;
}

export function LiveKitEntry({ 
  token, 
  url, 
  isStreaming,
  options,
  onStreamEnd, 
  onStreamStart, 
  setRoom, 
  setLocalParticipant,
  setParticipantIdentity
}: LiveKitEntryProps) {
  const [localRoom, setLocalRoom] = useState<Room | null>(null);

  const handleConnected = useCallback(() => {
    if (!localRoom) return;
    setRoom(localRoom);
    onStreamStart();
  }, [localRoom, onStreamStart, setRoom]);

  const handleDisconnected = useCallback(() => {
    setLocalRoom(null);
    setRoom(null);
    onStreamEnd();
  }, [onStreamEnd, setRoom]);

  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect={isStreaming}
      options={{
        ...options,
        adaptiveStream: true,
        dynacast: true,
      }}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
    >
      <ActiveRoom 
        room={localRoom} 
        isStreaming={isStreaming} 
        onStreamEnd={onStreamEnd} 
        setLocalParticipant={setLocalParticipant}
        setParticipantIdentity={setParticipantIdentity}
      />
    </LiveKitRoom>
  );
}

const ActiveRoom = ({ 
  room, 
  isStreaming, 
  onStreamEnd,
  setLocalParticipant,
  setParticipantIdentity
}: { 
  room: Room | null, 
  isStreaming: boolean, 
  onStreamEnd: () => void,
  setLocalParticipant: React.Dispatch<React.SetStateAction<LocalParticipant | null>>,
  setParticipantIdentity: React.Dispatch<React.SetStateAction<string | null>>
}) => {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (connectionState === 'connected' && localParticipant) {
      setIsConnected(true);
      console.log('Participant connected with identity:', localParticipant.identity);
      console.log('Connection State:', connectionState);
      console.log('Local Participant:', localParticipant);
      setParticipantIdentity(localParticipant.identity);
    } else {
      setIsConnected(false);
    }
  }, [connectionState, localParticipant, setParticipantIdentity]);

  useEffect(() => {
    if (isConnected && localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
      setLocalParticipant(localParticipant);
    }
  }, [isConnected, localParticipant, setLocalParticipant]);

  useEffect(() => {
    if (!isStreaming && room) {
      room.disconnect();
      onStreamEnd();
    }
  }, [isStreaming, room, onStreamEnd]);

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <>
      <RoomAudioRenderer />
      {/* <div>Audio Enabled: {localParticipant?.isMicrophoneEnabled ? 'Unmuted' : 'Muted'}</div> */}
    </>
  );
};

export default LiveKitEntry;