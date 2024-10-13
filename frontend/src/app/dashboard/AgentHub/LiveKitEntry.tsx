'use client';

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { Room } from 'livekit-client';
import { useState, useEffect, useCallback } from "react";

interface LiveKitEntryProps {
  token: string;
  url: string;
  roomName: string;
  isStreaming: boolean;
  onStreamEnd: () => void;
  onStreamStart: () => void;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
}

export function LiveKitEntry({ token, url, roomName, isStreaming, onStreamEnd, onStreamStart, setRoom }: LiveKitEntryProps) {
  const [localRoom, setLocalRoom] = useState<Room | null>(null);

  const handleConnected = useCallback((room: Room) => {
    setLocalRoom(room);
    setRoom(room);  // Update the room in the parent component
    onStreamStart(); // Notify parent that streaming has started
  }, [onStreamStart, setRoom]);

  const handleDisconnected = useCallback(() => {
    setLocalRoom(null);
    setRoom(null);  // Update the room in the parent component
    onStreamEnd(); // Notify parent that streaming has ended
  }, [onStreamEnd, setRoom]);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      roomName={roomName}
      connectOptions={{ autoSubscribe: true }}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
    >
      <ActiveRoom room={localRoom} isStreaming={isStreaming} onStreamEnd={onStreamEnd} />
    </LiveKitRoom>
  );
}

const ActiveRoom = ({ room, isStreaming, onStreamEnd }: { room: Room | null, isStreaming: boolean, onStreamEnd: () => void }) => {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (connectionState === 'connected') {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connectionState]);

  useEffect(() => {
    if (isConnected && localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [isConnected, localParticipant]);

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
