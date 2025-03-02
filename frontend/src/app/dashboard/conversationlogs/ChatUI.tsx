import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { ConversationLog } from './LibraryTable';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChatMessage {
  user_message?: string;
  assistant_message?: string;
}

interface ChatUIProps {
  selectedConversation: ConversationLog | null;
}

// Add this helper function before the ChatUI component
const generateRoomSummary = (fullRoomName: string): string => {
  if (!fullRoomName) return 'Visitor Chat';
  
  // Extract the first part (visitor or agent)
  const match = fullRoomName.match(/^(visitor|agent)/);
  if (match) {
    return match[1] === 'visitor' ? 'Visitor Chat' : 'Agent Chat';
  }
  
  return 'Call'; // Default fallback
};

const renderChatBubble = (message: ChatMessage, index: number) => {
  const isUser = 'user_message' in message;
  const content = isUser ? message.user_message : message.assistant_message;
  return (
    <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          {isUser ? '👤' : <Image src="/assets/flowon.png" alt="Flowon" width={32} height={32} className="object-cover" />}
        </Avatar>
        <div className={`mx-2 py-2 px-4 rounded-lg ${
          isUser 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export const ChatUI: React.FC<ChatUIProps> = ({ selectedConversation }) => {
  useEffect(() => {
    // Log the raw data of the selected conversation
    console.log("Selected Conversation Data:", selectedConversation);
  }, [selectedConversation]);

  return (
    <div className="p-4 h-full flex flex-col">
      {selectedConversation ? (
        <>
          <h3 className="text-xl font-semibold mb-4">
            {generateRoomSummary(selectedConversation.room_name)}
          </h3>
          
          {/* AI Summary Card */}
          {selectedConversation.summary && (
            <Card className="mb-4">
              <CardContent>
                <p>{selectedConversation.summary}</p>
              </CardContent>
            </Card>
          )}
          
          <div className="mb-2">
            <p><strong>Created At:</strong> {new Date(selectedConversation.created_at).toLocaleString()}</p>
          </div>
          <ScrollArea className="flex-grow space-y-4">
            {(() => {
              try {
                const messages = JSON.parse(selectedConversation.transcript);
                return messages.map((message: ChatMessage, index: number) => renderChatBubble(message, index));
              } catch (error) {
                console.error("Error parsing transcript:", error);
                return <p className="text-red-500">Error parsing transcript data.</p>;
              }
            })()}
          </ScrollArea>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a conversation to view details</p>
        </div>
      )}
    </div>
  );
};
