import React, { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DataTableDemo, Agent } from './LibraryTable';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

const ChatHistory: React.FC = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="flex flex-col h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left section (resizable) */}
        <ResizablePanel defaultSize={33} minSize={20}>
          <div className="p-4">
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right section (resizable) */}
        <ResizablePanel defaultSize={67} minSize={30}>
          <div className="p-4">
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatHistory;
