import React, { useCallback, useRef, useState, useEffect } from 'react';
import styles from './ChatBotMini.module.css';
import MorphingStreamButton from './MorphingStreamButton';
import LiveKitEntry from './LiveKitEntry';
import { Room, LocalParticipant } from 'livekit-client';

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ChatBotMiniProps {
  agentId: string;
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
  userId: string | null;
}

const ChatBotMini: React.FC<ChatBotMiniProps> = ({
  agentId,
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
  userId,
}) => {
  console.log('ChatBotMini props:', {
    agentId,
    isStreaming,
    isLiveKitActive,
    token,
    url,
    isConnecting,
    bypassShowChatInputCondition,
    userId
  });

  const chatboxRef = useRef<HTMLUListElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLSpanElement>(null);
  const [liveKitRoom, setLiveKitRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showChatInput, setShowChatInput] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);

  useEffect(() => {
    if (liveKitRoom) {
      console.log('LiveKit room set in ChatBotMini:', liveKitRoom.name);
    }
  }, [liveKitRoom]);

  useEffect(() => {
    if (roomName) {
      const eventSource = new EventSource(`${API_BASE_URL}/conversation/events/${roomName}`);

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
  }, [roomName]);

  const handleStreamToggle = useCallback(async () => {
    if (isStreaming) {
      setIsStreaming(false);
      setIsLiveKitActive(false);
      setLiveKitRoom(null);
      setRoomName(null);
    } else {
      setIsConnecting(true);
      try {
        if (!userId) {
          throw new Error('User not authenticated');
        }
        const response = await fetch(`${API_BASE_URL}/livekit/token?agent_id=${agentId}&user_id=${userId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const responseText = await response.text();
        console.log('Server response:', responseText);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          throw new Error(`Invalid JSON response. Please check the API endpoint and server configuration.`);
        }
        
        console.log('Parsed data:', data);
        
        if (!data.accessToken || !data.url || !data.roomName) {
          throw new Error(`Invalid response structure. Expected accessToken, url, and roomName.`);
        }
        
        setToken(data.accessToken);
        setUrl(data.url);
        setRoomName(data.roomName);
        setIsLiveKitActive(true);
        setIsStreaming(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        alert(`Failed to connect: ${error.message}\n\nPlease check the console for more details and ensure the API server is running correctly.`);
      } finally {
        setIsConnecting(false);
      }
    }
  }, [agentId, isStreaming, setIsStreaming, setIsLiveKitActive, setToken, setUrl, setIsConnecting, userId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Check the feature flag before applying the condition
    if (!bypassShowChatInputCondition && !showChatInput) {
      console.log('Form submission blocked: Chat input not shown');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/conversation/chat_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          contactNumber,
          user_id: userId,
          room_name: roomName,
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
  }, [fullName, email, contactNumber, userId, roomName, showChatInput, bypassShowChatInputCondition]);

  const handleMuteToggle = useCallback(() => {
    if (localParticipant) {
      const newMuteState = !isMuted;
      localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    }
  }, [localParticipant, isMuted]);

  return (
    <div className={`${styles.chatbot} debug-chatbot-mini`}>
      <header className={styles.header}>
        <h2>Flowon</h2>
      </header>
      <div className={`${styles.chatbox} flex items-center justify-center`} ref={chatboxRef}>
        <MorphingStreamButton
          onStreamToggle={handleStreamToggle}
          isStreaming={isStreaming}
          showTextBox={false}
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
            />
            {isStreaming && localParticipant && (
              <button
                onClick={handleMuteToggle}
                className={`${styles.muteButton} ${isMuted ? styles.muted : ''}`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            )}
          </>
        )}
      </div>
      {(showChatInput || bypassShowChatInputCondition) && (
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
            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </form>
        </div>
      )}
      
      {/* Update the footer */}
      <footer className={styles.footer}>
        <img src="/assets/flowon.png" alt="Flowon.AI Logo" className={styles.footerLogo} />
        <span className={styles.footerText}>Powered by Flowon.AI</span>
      </footer>
    </div>
  );
};

export default ChatBotMini;
