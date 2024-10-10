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
  isStreaming: boolean;
  onStreamEnd: () => void;
  onStreamStart: () => void;
}

export function LiveKitEntry({ token, url, isStreaming, onStreamEnd, onStreamStart }: LiveKitEntryProps) {
  const [room, setRoom] = useState<Room | null>(null);

  const handleConnected = useCallback((room: Room) => {
    setRoom(room);
    onStreamStart(); // Notify parent that streaming has started
  }, [onStreamStart]);
//
  const handleDisconnected = useCallback(() => {
    setRoom(null);
    onStreamEnd(); // Notify parent that streaming has ended
  }, [onStreamEnd]);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      connectOptions={{ autoSubscribe: true }}
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
    >
      <ActiveRoom room={room} isStreaming={isStreaming} onStreamEnd={onStreamEnd} />
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