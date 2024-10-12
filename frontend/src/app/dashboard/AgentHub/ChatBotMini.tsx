import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ChatBotMini.module.css';
import MorphingStreamButton from './MorphingStreamButton';
import LiveKitEntry from './LiveKitEntry';
import { useAuth, useUser } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ChatBotMini: React.FC = () => {
  const chatboxRef = useRef<HTMLUListElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLSpanElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const { userId } = useAuth();
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
        const response = await fetch(`${API_BASE_URL}/livekit/token?agent_id=YOUR_AGENT_ID&user_id=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch token');
        }
        const { accessToken, url } = await response.json();
        setToken(accessToken);
        setUrl(url);
        setIsLiveKitActive(true);
        setIsStreaming(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        // Handle error (e.g., show an alert)
      } finally {
        setIsConnecting(false);
      }
    }
  }, [isStreaming, user]);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    setIsLiveKitActive(false);
  }, []);

  const handleStreamStart = useCallback(() => {
    setIsStreaming(true);
  }, []);

  useEffect(() => {
    // This effect will run once the component is mounted
    const chatInput = chatInputRef.current;
    const sendChatBtn = sendBtnRef.current;
    const chatbox = chatboxRef.current;

    if (chatInput && sendChatBtn && chatbox) {
      // Here, you can add the logic from script.js
      // For example:
      // const handleChat = () => { ... };
      // chatInput.addEventListener("input", () => { ... });
      // sendChatBtn.addEventListener("click", handleChat);
      // ... other event listeners and functions
    }

    // Clean up function
    return () => {
      // Remove event listeners if needed
    };
  }, []);

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
            onStreamEnd={handleStreamEnd} 
            onStreamStart={handleStreamStart} 
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
