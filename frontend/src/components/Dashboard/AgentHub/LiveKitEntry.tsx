'use client';

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { useState, useEffect } from "react";

interface LiveKitEntryProps {
  token: string;
  url: string;
}

export function LiveKitEntry({ token, url }: LiveKitEntryProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      connectOptions={{autoSubscribe: true}}
    >
      <ActiveRoom />
    </LiveKitRoom>
  );
}

const ActiveRoom = () => {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (connectionState === 'connected') {
      setIsConnected(true);
    }
  }, [connectionState]);

  useEffect(() => {
    if (isConnected && localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [isConnected, localParticipant]);

  return (
    <>
      <RoomAudioRenderer />
      <div>Audio Enabled: {localParticipant?.isMicrophoneEnabled ? 'Unmuted' : 'Muted'}</div>
    </>
  );
};

export default LiveKitEntry;
