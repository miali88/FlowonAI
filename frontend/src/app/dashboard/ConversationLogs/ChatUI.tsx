import React, { useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { ConversationLog } from './LibraryTable';

interface ChatUIProps {
  selectedConversation: ConversationLog | null;
}

const renderChatBubble = (message: { [key: string]: string }, index: number) => {
  const isUser = 'user_message' in message;
  const content = isUser ? message.user_message : message.assistant_message;
  return (
    <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          {isUser ? '👤' : <img src="/assets/flowon.png" alt="Flowon" className="w-full h-full object-cover" />}
        </Avatar>
        <div className={`mx-2 py-2 px-4 rounded-lg ${isUser ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
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
          <h3 className="text-xl font-semibold mb-4">{selectedConversation.room_name}</h3>
          <div className="mb-2">
            <p><strong>Job ID:</strong> {selectedConversation.job_id}</p>
            <p><strong>Created At:</strong> {new Date(selectedConversation.created_at).toLocaleString()}</p>
          </div>
          <ScrollArea className="flex-grow space-y-4">
            {(() => {
              try {
                const messages = JSON.parse(selectedConversation.transcript);
                return messages.map((message: any, index: number) => renderChatBubble(message, index));
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
