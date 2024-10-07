import { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Agent } from '../LibraryTable'; // Adjust the import path as necessary
import { AgentCards } from '../AgentCards'; // Adjust the import path as necessary

interface LabProps {
  selectedAgent: Agent | null;
}

export function Lab({ selectedAgent }: LabProps) {
  const { user } = useUser(); // Get user information

  return (
    <div className="flex flex-col h-full">
      <div className="menubar">
        {/* Add your menubar content here */}
        <Button>Menu Item 1</Button>
        <Button>Menu Item 2</Button>
        {/* Add more menu items as needed */}
      </div>
      <div className="flex-grow relative">
        <h1>Lab</h1>
        {selectedAgent ? (
          <div>
            <h2>Selected Agent: {selectedAgent.name}</h2>
            {/* Add more content related to the selected agent */}
          </div>
        ) : (
          <p>No agent selected</p>
        )}
      </div>
    </div>
  );
}
