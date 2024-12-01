'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Add this interface near the top of the file, after the imports
interface ChatWidgetProps {
  agentId: string;
  domain: string;
}

// Import the ChatWidget component
const ChatWidget = dynamic<ChatWidgetProps>(
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
        domain: window.location.origin
      };
      
      console.log('ChatWidget initialized with:', {
        agentId,
        domain: window.location.origin
      });
    } catch (err: unknown) {
      console.error('Error initializing ChatWidget:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  }, [agentId]);

  if (error) return <div>Error: {error}</div>;
  if (!domain) return <div>Loading...</div>;

  return (
    <ChatWidget agentId={agentId} domain={domain} />
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

