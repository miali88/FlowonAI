import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { CallLog } from './LibraryTable';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";

interface ChatUIProps {
  selectedCall: CallLog | null;
}

const formatTimestamp = (timestamp: string): string => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid date";
  }
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

// Parse the raw transcript into an array of messages
const parseTranscript = (transcript: string): { role: 'ai' | 'user', content: string }[] => {
  if (!transcript) return [];
  
  const lines = transcript.split('\n');
  const messages: { role: 'ai' | 'user', content: string }[] = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.startsWith('AI:')) {
      messages.push({
        role: 'ai',
        content: line.substring(3).trim()
      });
    } else if (line.startsWith('User:')) {
      messages.push({
        role: 'user',
        content: line.substring(5).trim()
      });
    }
  }
  
  return messages;
};

const renderChatBubble = (message: { role: 'ai' | 'user', content: string }, index: number) => {
  const isUser = message.role === 'user';
  return (
    <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          {isUser ? '👤' : <Image src="/assets/flowon.png" alt="Flowon" width={32} height={32} className="object-cover" />}
        </Avatar>
        <div className={`mx-2 py-2 px-4 rounded-lg ${
          isUser 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
};

export const ChatUI: React.FC<ChatUIProps> = ({ selectedCall }) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Log the raw data of the selected call
    console.log("Selected Call Data:", selectedCall);
    
    // Clean up audio player when component unmounts or call changes
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = '';
      }
    };
  }, [selectedCall]);

  const toggleAudio = () => {
    if (!selectedCall?.stereo_recording_url) return;
    
    if (!audioRef) {
      const audio = new Audio(selectedCall.stereo_recording_url);
      audio.onended = () => setAudioPlaying(false);
      audio.onpause = () => setAudioPlaying(false);
      audio.onplay = () => setAudioPlaying(true);
      setAudioRef(audio);
      audio.play();
    } else {
      if (audioPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {selectedCall ? (
        <>
          <h3 className="text-xl font-semibold mb-4">
            Call Details
          </h3>
          
          {/* Call Info Card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Call Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Call ID:</strong> {selectedCall.call_id}</div>
              <div><strong>Duration:</strong> {formatDuration(selectedCall.duration_seconds)}</div>
              <div><strong>Started At:</strong> {formatTimestamp(selectedCall.started_at)}</div>
              <div><strong>Ended At:</strong> {formatTimestamp(selectedCall.ended_at)}</div>
              <div><strong>Phone Number:</strong> {selectedCall.phone_number || "—"}</div>
              <div><strong>Customer Number:</strong> {selectedCall.customer_number || "—"}</div>
              <div><strong>End Reason:</strong> {selectedCall.ended_reason}</div>
              <div><strong>Cost:</strong> ${selectedCall.cost.toFixed(4)}</div>
            </CardContent>
            {selectedCall.stereo_recording_url && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={toggleAudio}
                >
                  {audioPlaying ? <PauseIcon /> : <PlayIcon />}
                  {audioPlaying ? "Pause Recording" : "Play Recording"}
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* AI Summary Card */}
          {selectedCall.summary && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{selectedCall.summary}</p>
              </CardContent>
            </Card>
          )}
          
          <h4 className="font-medium mb-2">Transcript</h4>
          <ScrollArea className="flex-grow space-y-4 border rounded-md p-4">
            {(() => {
              try {
                const messages = parseTranscript(selectedCall.transcript);
                return messages.length > 0 ? (
                  messages.map((message, index) => renderChatBubble(message, index))
                ) : (
                  <p className="text-muted-foreground">No transcript available.</p>
                );
              } catch (error) {
                console.error("Error parsing transcript:", error);
                return <p className="text-red-500">Error parsing transcript data.</p>;
              }
            })()}
          </ScrollArea>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a call to view details</p>
        </div>
      )}
    </div>
  );
};
