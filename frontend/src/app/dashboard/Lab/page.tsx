"use client";

import React, { useState } from 'react';
import { AgentCards } from '../AgentHub/AgentCards';
import { Agent } from '../AgentHub/LibraryTable';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

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
        {selectedAgent && (
          <Tabs defaultValue="edit" className="w-full">
            <TabsList>
              <TabsTrigger value="edit">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview Agent</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agentName" className="block text-sm font-medium mb-1">Agent Name</Label>
                  <Input 
                    id="agentName"
                    value={selectedAgent.agentName} 
                    onChange={(e) => setSelectedAgent({...selectedAgent, agentName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="agentPurpose" className="block text-sm font-medium mb-1">Agent Purpose</Label>
                  <Select 
                    value={selectedAgent.agentPurpose}
                    onValueChange={(value) => setSelectedAgent({...selectedAgent, agentPurpose: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecting">Prospecting</SelectItem>
                      <SelectItem value="question-answer">Question & Answer</SelectItem>
                      <SelectItem value="customer-service">Customer Service</SelectItem>
                      <SelectItem value="product-recommendation">Product Recommendation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dataSource" className="block text-sm font-medium mb-1">Data Source</Label>
                  <Select 
                    value={selectedAgent.dataSource}
                    onValueChange={(value) => setSelectedAgent({...selectedAgent, dataSource: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="tagged">Items with tag...</SelectItem>
                      <SelectItem value="natural-language">Describe using natural language</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedAgent.dataSource === "tagged" && (
                  <div>
                    <Label htmlFor="tag" className="block text-sm font-medium mb-1">Tag</Label>
                    <Input 
                      id="tag"
                      value={selectedAgent.tag || ''} 
                      onChange={(e) => setSelectedAgent({...selectedAgent, tag: e.target.value})}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="openingLine" className="block text-sm font-medium mb-1">Opening Line</Label>
                  <Input 
                    id="openingLine"
                    value={selectedAgent.openingLine || ''} 
                    onChange={(e) => setSelectedAgent({...selectedAgent, openingLine: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="voice" className="block text-sm font-medium mb-1">Voice</Label>
                  <Input 
                    id="voice"
                    value={selectedAgent.voice || ''} 
                    onChange={(e) => setSelectedAgent({...selectedAgent, voice: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="instructions" className="block text-sm font-medium mb-1">Instructions</Label>
                  <Textarea 
                    id="instructions"
                    value={selectedAgent.instructions || ''} 
                    onChange={(e) => setSelectedAgent({...selectedAgent, instructions: e.target.value})}
                  />
                </div>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <p>Preview of the agent will be shown here.</p>
            </TabsContent>
          </Tabs>
        )}
        {!selectedAgent && (
          <p>Select an agent to edit its settings.</p>
        )}
      </div>
    </div>
  );
};

export default Lab;
