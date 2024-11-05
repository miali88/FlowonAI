'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface JoinCallProps {
  onJoin: (roomName: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function JoinExistingCall({ onJoin }: JoinCallProps) {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoinRoom = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/livekit/join-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_name: roomName }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const data = await response.json();
      onJoin(data.room_name);
      router.push(`/call/${data.room_name}`);
    } catch (err) {
      setError('Unable to join call. Please check the room name and try again.');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold">Join Existing Call</h2>
      <input
        type="text"
        placeholder="Enter Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="p-2 border rounded"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleJoinRoom}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Join Call
      </button>
    </div>
  );
}

export default function DevPage() {
  const handleJoin = (roomName: string) => {
    // Handle join logic here if needed
  };

  return (
    <div>
      <JoinExistingCall onJoin={handleJoin} />
    </div>
  );
}