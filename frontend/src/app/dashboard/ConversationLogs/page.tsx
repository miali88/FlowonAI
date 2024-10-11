import React, { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DataTableDemo, Agent } from './LibraryTable';

const ChatHistory: React.FC = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-full">
        {/* Left section (1/3 width) */}
        <div className="w-1/3 p-4 border-r">
          <div className="mb-4">
            <Input 
              placeholder="Search chat history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <DataTableDemo setSelectedAgent={setSelectedAgent} />
          </ScrollArea>
        </div>

        {/* Right section (2/3 width) */}
        <div className="w-2/3 p-4">
          {selectedAgent ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">{selectedAgent.agentName}</h3>
              <ScrollArea className="h-[calc(100vh-250px)]">
                <p><strong>Purpose:</strong> {selectedAgent.agentPurpose}</p>
                <p><strong>Voice:</strong> {selectedAgent.voice}</p>
                <p><strong>Data Source:</strong> {selectedAgent.dataSource}</p>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
