import React, { useCallback, useRef, useState, useEffect } from 'react';
import styles from './ChatBotMini.module.css';
import MorphingStreamButton from './MorphingStreamButton';
import LiveKitEntry from './LiveKitEntry';
import { Room, LocalParticipant } from 'livekit-client';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FormField {
  type: string;
  label: string;
  options: any[];
}

interface ChatBotMiniProps {
  agentId: string;
  userId: string;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveKitActive: boolean;
  setIsLiveKitActive: React.Dispatch<React.SetStateAction<boolean>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  url: string | null;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  isConnecting: boolean;
  setIsConnecting: (value: boolean) => void;
  onStreamEnd: () => void;
  onStreamStart: () => void;
  features?: {
    form?: {
      fields: FormField[];
    };
    prospects?: {
      sms: string;
      email: string;
      whatsapp: string;
      notifyOnInterest: boolean;
    };
  };
  bypassShowChatInputCondition?: boolean;
}

const ChatBotMini: React.FC<ChatBotMiniProps> = ({
  agentId,
  userId,
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
  features,
  bypassShowChatInputCondition = false,
}) => {
  const chatboxRef = useRef<HTMLDivElement>(null);
  const [liveKitRoom, setLiveKitRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showChatInput, setShowChatInput] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [participantIdentity, setParticipantIdentity] = useState<string | null>(null);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (liveKitRoom) {
      console.log('🎤 LiveKit Room Status:', {
        name: liveKitRoom.name,
        state: liveKitRoom.state,
        participants: liveKitRoom.participants.size,
        localParticipant: liveKitRoom.localParticipant?.identity,
        audioTracks: liveKitRoom.localParticipant?.audioTracks.size
      });

      // Monitor connection state changes
      liveKitRoom.on('connectionStateChanged', (state) => {
        console.log('🔌 LiveKit Connection State Changed:', state);
      });

      // Monitor participant events
      liveKitRoom.on('participantConnected', (participant) => {
        console.log('👤 Participant Connected:', participant.identity);
      });

      liveKitRoom.on('participantDisconnected', (participant) => {
        console.log('👋 Participant Disconnected:', participant.identity);
      });
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

  useEffect(() => {
    console.log('🔍 Features prop:', features);
    console.log('📝 Form fields:', features?.form?.fields);
  }, [features]);

  useEffect(() => {
    console.log('🔍 Debugging Form Rendering:');
    console.log('Features:', {
      hasFeatures: !!features,
      hasForm: !!features?.form,
      hasFields: !!features?.form?.fields,
      fieldsLength: features?.form?.fields?.length,
      fieldsContent: features?.form?.fields
    });
    
    // Type checking
    if (features?.form?.fields) {
      console.log('Fields type:', Array.isArray(features.form.fields) ? 'array' : typeof features.form.fields);
    }
  }, [features]);

  useEffect(() => {
    console.log('🔍 Features Data:', {
      fullFeatures: features,
      formFields: features?.form?.fields,
      prospects: features?.prospects
    });
  }, [features]);

  const handleStreamToggle = useCallback(async () => {
    if (isStreaming) {
      console.log('🛑 Stopping stream');
      setIsStreaming(false);
      setIsLiveKitActive(false);
      setLiveKitRoom(null);
      setRoomName(null);
    } else {
      console.log('▶️ Starting stream...');
      setIsConnecting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/livekit/token?agent_id=${agentId}&user_id=${userId}`);
        console.log('🎫 Token Response Status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch token');
        }
        const data = await response.json();
        console.log('🔑 LiveKit Connection Data:', {
          hasToken: !!data.accessToken,
          url: data.url,
          roomName: data.roomName
        });
        const { accessToken, url: liveKitUrl, roomName } = data;
        setToken(accessToken);
        setUrl(liveKitUrl);
        setRoomName(roomName);
        setIsLiveKitActive(true);
        setIsStreaming(true);
      } catch (error) {
        console.error('❌ Connection Error:', error);
        // Handle error (e.g., show an alert)
      } finally {
        setIsConnecting(false);
      }
    }
  }, [agentId, isStreaming, setIsStreaming, setIsLiveKitActive, setToken, setUrl, setIsConnecting]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/conversation/chat_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: userId,
          room_name: roomName,
          participant_identity: participantIdentity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      console.log('Form submitted successfully:', formData);

      // Clear form fields after submission
      setFormData({});
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form. Please try again.');
    }
  }, [formData, userId, roomName, participantIdentity]);

  const handleInputChange = useCallback((fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (localParticipant) {
      const newMuteState = !isMuted;
      console.log('🎤 Toggling Microphone:', {
        previousState: isMuted ? 'muted' : 'unmuted',
        newState: newMuteState ? 'muted' : 'unmuted',
        tracks: localParticipant.audioTracks.size
      });
      localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    } else {
      console.warn('⚠️ Cannot toggle mute - no local participant found');
    }
  }, [localParticipant, isMuted]);

  return (
    <div className={styles.chatbot}>
      <header className={styles.header}>
        <h2>Flowon</h2>
      </header>
      <div className={`${styles.chatbox} flex items-center justify-center`} ref={chatboxRef}>
        <MorphingStreamButton
          onStreamToggle={handleStreamToggle}
          isStreaming={isStreaming}
          showTextBox={false}
          isLoading={isConnecting}
        />
        {isLiveKitActive && token && url && roomName && (
          <>
            <LiveKitEntry 
              token={token} 
              url={url} 
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
      
      {features?.form?.fields && features.form.fields.length > 0 && (
        <div className={styles.chatInput}>
          <form onSubmit={handleSubmit}>
            {features.form.fields.map((field, index) => (
              <input
                key={index}
                type={field.type}
                value={formData[field.label] || ''}
                onChange={(e) => handleInputChange(field.label, e.target.value)}
                placeholder={field.label}
                className={styles.formInput}
                aria-label={field.label}
              />
            ))}
            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </form>
        </div>
      )}
      
      <footer className={styles.footer}>
        <img src="/assets/flowon_see_though_v2.png" alt="Flowon.AI Logo" className={styles.footerLogo} />
        <span className={styles.footerText}>Powered by Flowon.AI</span>
      </footer>
    </div>
  );
};

export default ChatBotMini;
