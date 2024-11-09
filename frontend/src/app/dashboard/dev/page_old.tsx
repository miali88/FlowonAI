'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Create a params context
const ParamsContext = createContext<{ agentId: string }>({ agentId: '' });

// Import the ChatWidget component
const ChatWidget = dynamic(
  () => import('@/app/chat-widget/[agentId]/components/main'),  // Note: importing main directly
  { ssr: false }
);

function ChatWidgetWrapper() {
  const DEMO_AGENT_ID = 'e8b64819-7c2c-432f-9f80-05a72bd49787';
  
  // Get agentId from URL or fall back to demo ID
  const params = useParams();
  const agentId = params?.agentId as string || DEMO_AGENT_ID;
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    try {
      setDomain(window.location.origin);
      
      window.embeddedChatbotConfig = {
        agentId: agentId,
        domain: window.location.origin,
        version: '1.0.0',
        debug: true
      };
      
      console.log('ChatWidget initialized with:', {
        agentId,
        domain: window.location.origin
      });
    } catch (err) {
      console.error('Error initializing ChatWidget:', err);
      setError(err.message);
    }
  }, [agentId]);

  if (error) return <div>Error: {error}</div>;
  if (!domain) return <div>Loading...</div>;

  return (
    <ParamsContext.Provider value={{ agentId }}>
      <ChatWidget agentId={agentId} domain={domain} />
    </ParamsContext.Provider>
  );
}

function ChatWidgetPreview() {
  return (
    <Card className="w-[400px] h-[80vh] shadow-lg flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm font-medium">Chat Widget Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-0">
        <div id="embedded-chatbot-container" className="absolute inset-0 overflow-hidden">
          <ChatWidgetWrapper />
        </div>
      </CardContent>
    </Card>
  );
}

// Rest of your DevPage component remains the same
export default function DevPage() {
  return (
    <div className="p-8 flex justify-center items-center min-h-screen w-full bg-gray-50">
      <ChatWidgetPreview />
    </div>
  );
}

