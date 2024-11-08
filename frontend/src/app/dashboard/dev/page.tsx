'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface JoinCallProps {
  onJoin: (roomName: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface GeoData {
  country: string;
  country_code: string;
}

function JoinExistingCall({ onJoin }: JoinCallProps) {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [countryCode, setCountryCode] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Fetch geolocation data when component mounts
    const fetchGeoData = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch location data');
        const data: GeoData = await response.json();
        setCountryCode(data.country_code);
      } catch (err) {
        console.error('Error fetching location:', err);
      }
    };

    fetchGeoData();
  }, []);

  const handleJoinRoom = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/livekit/join-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          room_name: roomName,
          country_code: countryCode // Include country code in the request
        }),
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
      {countryCode && (
        <p className="text-sm text-gray-600">Connecting from: {countryCode}</p>
      )}
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

function ChatWidgetPreview() {
  return (
    <div className="w-96 h-[600px] border rounded-lg overflow-hidden shadow-lg">
      <iframe
        src="/chat-widget/test-agent-id"
        className="w-full h-full border-0"
        title="Chat Widget Preview"
      />
    </div>
  );
}

export default function DevPage() {
  const handleJoin = (roomName: string) => {
    // Handle join logic here if needed
  };

  return (
    <div className="p-8 flex gap-8">
      <JoinExistingCall onJoin={handleJoin} />
      <ChatWidgetPreview />
    </div>
  );
}