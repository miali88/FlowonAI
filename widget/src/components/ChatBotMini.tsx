/* VERSION 2.0.0 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import styles from './ChatBotMini.module.css';
import MorphingStreamButton from './MorphingStreamButton';
import LiveKitEntry from './LiveKitEntry';
import { Room, LocalParticipant } from 'livekit-client';

const API_BASE_URL = 'https://flowon.ai/api/v1';
console.log('API_BASE_URL:', API_BASE_URL); // Add this line temporarily

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
}

const userId = "donkeykong";

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
}) => {
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
  const [participantIdentity, setParticipantIdentity] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const minimizeTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (liveKitRoom) {
      console.log('LiveKit room set in ChatBotMini:', liveKitRoom.name);
    }
  }, [liveKitRoom]);

  useEffect(() => {
    if (participantIdentity) {
      const eventSource = new EventSource(`${API_BASE_URL}/conversation/events/${participantIdentity}`);

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
  }, [participantIdentity]);

  const handleStreamToggle = useCallback(async () => {
    if (isStreaming) {
      setIsStreaming(false);
      setIsLiveKitActive(false);
      setLiveKitRoom(null);
      setRoomName(null);
    } else {
      setIsConnecting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/livekit/token?agent_id=${agentId}&user_id=${userId}`, {
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
      } catch (error) {
        console.error('Failed to connect:', error);
        // Add user-friendly error handling
        alert('Failed to connect to the streaming service. Please try again later.');
      } finally {
        setIsConnecting(false);
      }
    }
  }, [agentId, isStreaming, setIsStreaming, setIsLiveKitActive, setToken, setUrl, setIsConnecting]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
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
  }, [fullName, email, contactNumber, roomName, showChatInput, bypassShowChatInputCondition, participantIdentity]);

  const handleMuteToggle = useCallback(() => {
    if (localParticipant) {
      const newMuteState = !isMuted;
      localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    }
  }, [localParticipant, isMuted]);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimizing(true);
    
    minimizeTimer.current = setTimeout(() => {
      setIsExpanded(false);
      setIsMinimizing(false);
    }, 300); // Match the CSS transition duration
  };

  useEffect(() => {
    return () => {
      if (minimizeTimer.current) {
        clearTimeout(minimizeTimer.current);
      }
    };
  }, []);

  return (
    <div 
      className={`${styles.chatbot} 
        ${isExpanded ? styles.expanded : styles.minimized}
        ${isMinimizing ? styles.minimizing : ''}`}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {isExpanded ? (
        <>
          <header className={styles.header}>
            <h2>Flowon</h2>
            <button 
              className={styles.closeButton}
              onClick={handleMinimize}
            >
              ×
            </button>
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
                  setParticipantIdentity={setParticipantIdentity}
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
            <img src="/flowon_see_though_v2.png" alt="Flowon.AI Logo" className={styles.footerLogo} />
            <span className={styles.footerText}>Powered by Flowon.AI</span>
          </footer>
        </>
      ) : (
        <div className={styles.minimizedContent}>
          <img 
            src="/flowon_see_though_v2.png"
            alt="Flowon" 
            className={styles.minimizedLogo}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBotMini;