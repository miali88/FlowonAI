import React, { useState } from 'react';
import ChatBotMini from './components/ChatBotMini';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

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
    <Layout>
      <div className="App">
        <h1 className="text-2xl font-bold mb-4">ChatBot Mini Test Environment</h1>
        <ErrorBoundary>
          <ChatBotMini
            agentId="a14205e6-4b73-43d0-90f8-ea0a38da0112"
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
            userId="test-user-id"
          />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}

export default App;
