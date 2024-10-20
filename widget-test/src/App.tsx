import React, { useState } from 'react';
import ChatBotMini from './components/ChatBotMini';

// Mock user object
const mockUser = {
  id: 'mock-user-id',
  // Add other user properties as needed
};

// Mock useUser hook
const useUser = () => ({ user: mockUser });

function App() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStreamEnd = () => {
    console.log('Stream ended');
  };

  const handleStreamStart = () => {
    console.log('Stream started');
  };

  return (
    <div className="App">
      <h1>ChatBot Mini Test Environment</h1>
      <ChatBotMini
        agentId="test-agent-id"
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        isLiveKitActive={isLiveKitActive}
        setIsLiveKitActive={setIsLiveKitActive}
        token={token}
        setToken={setToken}
        url={url}
        setUrl={setUrl}
        isConnecting={isConnecting}
        setIsConnecting={setIsConnecting}
        onStreamEnd={handleStreamEnd}
        onStreamStart={handleStreamStart}
        bypassShowChatInputCondition={true}
        localParticipant={null}
        setLocalParticipant={() => {}}
      />
    </div>
  );
}

export default App;