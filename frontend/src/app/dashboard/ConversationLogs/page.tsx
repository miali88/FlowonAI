"use client";

import React, { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { DataTableDemo, ConversationLog } from './LibraryTable';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatUI } from './ChatUI';

const ChatHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<ConversationLog | null>(null);

  return (
    <div className="flex flex-col h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left section (resizable) */}
        <ResizablePanel defaultSize={70} minSize={20}>
          <div className="p-4">
            <div className="mb-4">
              <Input 
                placeholder="Search chat history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <DataTableDemo setSelectedConversation={setSelectedConversation} />
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right section (resizable) */}
        <ResizablePanel defaultSize={30} minSize={30}>
          <ChatUI selectedConversation={selectedConversation} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatHistory;
