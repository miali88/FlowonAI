import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Agent {
  id: string;
  name: string;
}

const SavedAgentsPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Agent 1' },
    { id: '2', name: 'Agent 2' },
    { id: '3', name: 'Agent 3' },
  ]);

  const togglePanel = () => setIsExpanded(!isExpanded);

  return (
    <div className={`fixed bottom-4 left-4 z-50 bg-background border border-border rounded-lg shadow-lg transition-all duration-300 ${isExpanded ? 'w-64 h-64' : 'w-12 h-12'}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={togglePanel}
      >
        {isExpanded ? '×' : '☰'}
      </Button>
      
      {isExpanded && (
        <div className="p-4 h-full">
          <h3 className="text-lg font-semibold mb-2">Saved Agents</h3>
          <ScrollArea className="h-[calc(100%-3rem)]">
            <ul className="space-y-2">
              {agents.map((agent) => (
                <li key={agent.id} className="p-2 bg-secondary rounded">
                  {agent.name}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SavedAgentsPanel;
