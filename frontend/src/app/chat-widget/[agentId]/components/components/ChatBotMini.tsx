import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import MorphingStreamButton from './MorphingStreamButton';
import LiveKitEntry from './LiveKitEntry';
import { Room, LocalParticipant } from 'livekit-client';
import styles from './ChatWidget.module.css';

const DEFAULT_API_BASE_URL = 'https://app.flowon.ai/api/v1';

interface ChatBotMiniProps {
  agentId: string;
  eventBridge: {
    dispatchHostEvent: (eventName: string, detail: any) => void;
    getLiveKitContainer?: () => Element | null;
  };
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveKitActive: boolean;
  setIsLiveKitActive: React.Dispatch<React.SetStateAction<boolean>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  url: string | null;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  isConnecting: boolean;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  onStreamEnd: () => void;
  onStreamStart: () => void;
  bypassShowChatInputCondition?: boolean;
  localParticipant: LocalParticipant | null;
  setLocalParticipant: React.Dispatch<React.SetStateAction<LocalParticipant | null>>;
  apiBaseUrl?: string;
}

const userId = "visitor";

const ChatBotMini: React.FC<ChatBotMiniProps> = ({
  agentId,
  eventBridge,
  apiBaseUrl = DEFAULT_API_BASE_URL,
  isStreaming,
  setIsStreaming,
  isLiveKitActive,
  setIsLiveKitActive,
  token,
  setToken,
  url,
  setUrl,
  isConnecting,
  setIsConnecting,
  onStreamEnd,
  onStreamStart,
  bypassShowChatInputCondition = false,
  localParticipant,
  setLocalParticipant,
}) => {
  const chatboxRef = useRef<HTMLUListElement>(null);
  const [liveKitRoom, setLiveKitRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showChatInput, setShowChatInput] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [participantIdentity, setParticipantIdentity] = useState<string | null>(null);
  const [isError, setIsError] = useState<string | null>(null);

  const apiUrl = useMemo(() => apiBaseUrl, [apiBaseUrl]);

  useEffect(() => {
    if (liveKitRoom) {
      console.log('LiveKit room set in ChatBotMini:', liveKitRoom.name);
    }
  }, [liveKitRoom]);

  useEffect(() => {
    if (participantIdentity) {
      const eventSource = new EventSource(`${apiUrl}/conversation/events/${participantIdentity}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'show_chat_input') {
          setShowChatInput(true);
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [participantIdentity, apiUrl]);

  useEffect(() => {
    if (!isStreaming) {
      setShowChatInput(false);
    }
  }, [isStreaming]);

  // Add component lifecycle logging
  useEffect(() => {
    console.log('ChatBotMini mounted');
    return () => {
      console.log('ChatBotMini unmounted');
      // Cleanup any active connections
      if (liveKitRoom) {
        liveKitRoom.disconnect();
      }
    };
  }, []);

  const handleStreamToggle = useCallback(async () => {
    setIsError(null); // Reset error state
    if (isStreaming) {
      setIsStreaming(false);
      setIsLiveKitActive(false);
      setLiveKitRoom(null);
      setRoomName(null);
      setShowChatInput(false);
      
      // Add event dispatch for stream end
      eventBridge.dispatchHostEvent('flowon-stream-end', {
        agentId,
        timestamp: new Date().toISOString()
      });
    } else {
      setIsConnecting(true);
      try {
        const response = await fetch(`${apiUrl}/livekit/token?agent_id=${agentId}&user_id=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Add response logging
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
        }
        
        // Try parsing the response text
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error('Invalid response format from server');
        }

        const { accessToken, url: liveKitUrl, roomName } = data;
        setToken(accessToken);
        setUrl(liveKitUrl);
        setRoomName(roomName);
        setIsLiveKitActive(true);
        setIsStreaming(true);

        // Add event dispatch for stream start
        eventBridge.dispatchHostEvent('flowon-stream-start', {
          agentId,
          roomName,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setIsError(errorMessage);
        eventBridge.dispatchHostEvent('flowon-error', {
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsConnecting(false);
      }
    }
  }, [agentId, isStreaming, setIsStreaming, setIsLiveKitActive, setToken, setUrl, setIsConnecting, eventBridge, apiUrl]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bypassShowChatInputCondition && !showChatInput) {
      console.log('Form submission blocked: Chat input not shown');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/conversation/chat_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          contactNumber,
          user_id: null,
          room_name: roomName,
          participant_identity: participantIdentity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      console.log('Form submitted successfully:', { fullName, email, contactNumber });

      // Clear form fields after submission
      setFullName('');
      setEmail('');
      setContactNumber('');
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form. Please try again.');
    }
  }, [fullName, email, contactNumber, roomName, showChatInput, bypassShowChatInputCondition, participantIdentity, apiUrl]);

  const handleMuteToggle = useCallback(() => {
    if (localParticipant) {
      const newMuteState = !isMuted;
      localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    }
  }, [localParticipant, isMuted]);

  return (
    <div data-widget="wrapper">
      <div data-widget="chatbox">
        <MorphingStreamButton
          onStreamToggle={handleStreamToggle}
          isStreaming={isStreaming}
          isConnecting={isConnecting}
        />
        {isLiveKitActive && token && url && roomName && (
          <>
            <LiveKitEntry 
              token={token} 
              url={url} 
              roomName={roomName}
              isStreaming={isStreaming} 
              onStreamEnd={onStreamEnd} 
              onStreamStart={onStreamStart}
              setRoom={setLiveKitRoom}
              setLocalParticipant={setLocalParticipant}
              setParticipantIdentity={setParticipantIdentity}
              options={{
                adaptiveStream: true,
                dynacast: true,
                element: eventBridge.getLiveKitContainer?.() || null
              }}
            />
            {isStreaming && localParticipant && (
              <button
                onClick={handleMuteToggle}
                className={`muteButton ${isMuted ? 'muted' : ''}`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            )}
          </>
        )}
      </div>
      
      {(showChatInput && isStreaming) && (
        <div className={styles.chatInput}>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
            />
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Contact Number (optional)"
            />
            <button type="submit" className="submitBtn">
              Submit
            </button>
          </form>
        </div>
      )}
      
      <footer className={styles.footer}>
        <a 
          href="https://flowon.ai" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.footerContent}
        >
          <img 
            src="/flowon.png" 
            alt="Flowon.AI Logo" 
            className={styles.footerLogo} 
          />
          <span className={styles.footerText}>
            Powered by Flowon.AI
          </span>
        </a>
      </footer>
    </div>
  );
};

export default ChatBotMini;