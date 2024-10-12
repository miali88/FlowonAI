import React, { useCallback, useRef } from 'react';
import styles from './ChatBotMini.module.css';
import MorphingStreamButton from './MorphingStreamButton';
import LiveKitEntry from './LiveKitEntry';
import { useUser } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  onStreamStart
}) => {
  const chatboxRef = useRef<HTMLUListElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLSpanElement>(null);

  const { user } = useUser();

  const handleStreamToggle = useCallback(async () => {
    if (isStreaming) {
      setIsStreaming(false);
      setIsLiveKitActive(false);
    } else {
      setIsConnecting(true);
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }
        const response = await fetch(`${API_BASE_URL}/livekit/token?agent_id=${agentId}&user_id=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch token');
        }
        const { accessToken, url: liveKitUrl } = await response.json();
        setToken(accessToken);
        setUrl(liveKitUrl);
        setIsLiveKitActive(true);
        setIsStreaming(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        // Handle error (e.g., show an alert)
      } finally {
        setIsConnecting(false);
      }
    }
  }, [agentId, isStreaming, setIsStreaming, setIsLiveKitActive, setToken, setUrl, setIsConnecting, user]);

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
          isConnecting={isConnecting}
        />
        {isLiveKitActive && token && url && (
          <LiveKitEntry 
            token={token} 
            url={url} 
            isStreaming={isStreaming} 
            onStreamEnd={onStreamEnd} 
            onStreamStart={onStreamStart} 
          />
        )}
      </div>
      <div className={styles.chatInput}>
        <textarea
          ref={chatInputRef}
          placeholder="Send a Message"
          spellCheck="false"
          required
        ></textarea>
        <span ref={sendBtnRef} id="send-btn" className={`${styles.materialSymbolsOutlined} material-symbols-outlined`}>send</span>
      </div>
    </div>
  );
};

export default ChatBotMini;
