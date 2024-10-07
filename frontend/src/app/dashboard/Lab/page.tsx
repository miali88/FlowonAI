"use client";

import React, { useState } from 'react';
import { AgentCards } from '../AgentHub/AgentCards';
import { Agent } from '../AgentHub/LibraryTable';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Lab = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleSaveChanges = () => {
    // Implement the logic to save changes to the selected agent
    console.log("Saving changes for agent:", selectedAgent);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-2xl font-bold mb-6">Agent Lab</h1>
      <div className="flex flex-col space-y-6">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Select an Agent</h2>
          <AgentCards setSelectedAgent={handleAgentSelect} />
        </div>
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Edit Agent Settings</h2>
          {selectedAgent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Agent Name</label>
                <Input 
                  value={selectedAgent.agentName} 
                  onChange={(e) => setSelectedAgent({...selectedAgent, agentName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Agent Purpose</label>
                <Textarea 
                  value={selectedAgent.agentPurpose} 
                  onChange={(e) => setSelectedAgent({...selectedAgent, agentPurpose: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voice</label>
                <Select 
                  value={selectedAgent.voice}
                  onValueChange={(value) => setSelectedAgent({...selectedAgent, voice: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Source</label>
                <Input 
                  value={selectedAgent.dataSource} 
                  onChange={(e) => setSelectedAgent({...selectedAgent, dataSource: e.target.value})}
                />
              </div>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          ) : (
            <p>Select an agent to edit its settings.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lab;
