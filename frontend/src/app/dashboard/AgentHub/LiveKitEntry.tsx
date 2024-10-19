'use client';

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { Room, LocalParticipant } from 'livekit-client';
import { useState, useEffect, useCallback } from "react";
import { ReactElement } from 'react';

interface LiveKitRoomProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  // ... other props ...
  children: ReactElement | ReactElement[];
}

interface LiveKitEntryProps {
  token: string;
  url: string;
  roomName: string;
  isStreaming: boolean;
  onStreamEnd: () => void;
  onStreamStart: () => void;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  setLocalParticipant: React.Dispatch<React.SetStateAction<LocalParticipant | null>>;
}

const LiveKitEntry: React.FC<LiveKitEntryProps> = ({ token, url, roomName, isStreaming, onStreamEnd, onStreamStart, setRoom, setLocalParticipant }) => {
  const [localRoom, setLocalRoom] = useState<Room | null>(null);

  const handleConnected = useCallback(() => {
    if (localRoom) {
      setRoom(localRoom);
      onStreamStart();
    }
  }, [localRoom, onStreamStart, setRoom]);

  const handleDisconnected = useCallback(() => {
    setLocalRoom(null);
    setRoom(null);
    onStreamEnd();
  }, [onStreamEnd, setRoom]);

  return (
    <div>
      {token && url && roomName ? (
        <LiveKitRoom
          token={token}
          serverUrl={url}
          connect={true}
          connectOptions={{ autoSubscribe: true }}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
        >
          <ActiveRoom
            room={localRoom}
            isStreaming={isStreaming}
            onStreamEnd={onStreamEnd}
            setLocalParticipant={setLocalParticipant}
          />
        </LiveKitRoom>
      ) : null}
    </div>
  );
};

const ActiveRoom = ({ 
  room, 
  isStreaming, 
  onStreamEnd,
  setLocalParticipant
}: { 
  room: Room | null, 
  isStreaming: boolean, 
  onStreamEnd: () => void,
  setLocalParticipant: React.Dispatch<React.SetStateAction<LocalParticipant | null>>
}) => {
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
