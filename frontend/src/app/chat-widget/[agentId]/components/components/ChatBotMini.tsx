import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import MorphingStreamButton from './MorphingStreamButton';
import LiveKitEntry from './LiveKitEntry';
import { Room, LocalParticipant } from 'livekit-client';
import styles from './ChatWidget.module.css';
import Footer from './Footer';

const API_DOMAIN = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface ChatBotMiniProps {
  agentId: string;
  eventBridge: {
    dispatchHostEvent: (eventName: string, detail: Record<string, unknown>) => void;
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

// Update FormField interface
interface FormField {
  type: string;
  label: string;
}

const ChatBotMini: React.FC<ChatBotMiniProps> = ({
  agentId,
  eventBridge,
  apiBaseUrl = API_DOMAIN,
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
  bypassShowChatInputCondition,
  localParticipant,
  setLocalParticipant,
}) => {
  const [liveKitRoom, setLiveKitRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showChatInput, setShowChatInput] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participantIdentity, setParticipantIdentity] = useState<string | null>(null);
  const [isError, setIsError] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});

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
  }, [liveKitRoom]);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await fetch(`${API_DOMAIN}/conversation/form_fields/${agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch form fields');
        }
        const data = await response.json();
        console.log('Retrieved form fields:', data);
        console.log('Fields array:', data.fields);
        setFormFields(data.fields || []);
      } catch (error) {
        console.error('Error fetching form fields:', error);
      }
    };

    fetchFormFields();
  }, [agentId]);

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
    console.log('ChatBotMini: handleSubmit called', {
      formData,
      roomName,
      showChatInput,
      bypassShowChatInputCondition
    });
    
    if (!bypassShowChatInputCondition && !showChatInput) {
      console.log('ChatBotMini: Form submission blocked: Chat input not shown');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/conversation/chat_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: null,
          room_name: roomName,
          participant_identity: participantIdentity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      console.log('Form submitted successfully:', formData);
      
      // Clear form data after submission
      setFormData({});
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Failed to submit form. Please try again.');
    }
  }, [formData, roomName, showChatInput, bypassShowChatInputCondition, participantIdentity, apiUrl]);

  const handleMuteToggle = useCallback(() => {
    if (localParticipant) {
      const newMuteState = !isMuted;
      localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    }
  }, [localParticipant, isMuted]);

  // Add handler for input changes
  const handleInputChange = useCallback((fieldLabel: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  }, []);

  useEffect(() => {
    console.log('Form visibility conditions:', {
      bypassShowChatInputCondition,
      showChatInput,
      isStreaming
    });
  }, [bypassShowChatInputCondition, showChatInput, isStreaming]);

  return (
    <div data-widget="wrapper" className={styles.mainWrapper}>
      <div className={styles.contentContainer}>
        <div data-widget="chatbox" className={styles.chatboxContainer}>
          <MorphingStreamButton
            onStreamToggle={handleStreamToggle}
            isStreaming={isStreaming}
            isConnecting={isConnecting}
          />
          {(bypassShowChatInputCondition || showChatInput) && isStreaming && (
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              {formFields.map((field, index) => (
                <div key={index} className={styles.formField}>
                  <label htmlFor={field.label}>{field.label}</label>
                  <input
                    type={field.type}
                    id={field.label}
                    value={formData[field.label] || ''}
                    onChange={(e) => handleInputChange(field.label, e.target.value)}
                    required
                  />
                </div>
              ))}
              <button type="submit" className={styles.submitButton}>Submit</button>
            </form>
          )}
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
      </div>
      <Footer />
    </div>
  );
};

export default ChatBotMini;