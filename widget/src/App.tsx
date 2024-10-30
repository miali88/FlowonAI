import React, { useState } from 'react';
import ChatBotMini from './components/ChatBotMini';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

interface AppProps {
  agentId: string;
  domain: string;
}

function App({ agentId, domain }: AppProps) {
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
      <div id="flowon-widget-root" className="flowon-isolate">
        <ErrorBoundary>
          <ChatBotMini
            agentId={agentId}
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