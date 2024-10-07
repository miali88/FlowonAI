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
import MorphingStreamButton from '../AgentHub/MorphingStreamButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@clerk/nextjs";

const Lab = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const { userId } = useAuth();

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleSaveChanges = () => {
    // Implement the logic to save changes to the selected agent
    console.log("Saving changes for agent:", selectedAgent);
  };

  const handleStreamToggle = () => {
    setIsStreaming(!isStreaming);
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/livekit/agents/${selectedAgent.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });

      if (response.ok) {
        toast({
          title: "Agent deleted",
          description: `${selectedAgent.agentName} has been successfully deleted.`,
        });
        setSelectedAgent(null);
        // Optionally, refresh the agent list here
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete the agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex flex-col space-y-6">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Select an Agent</h2>
          <AgentCards setSelectedAgent={handleAgentSelect} />
        </div>
        {selectedAgent && (
          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview Agent</TabsTrigger>
              <TabsTrigger value="edit">Settings</TabsTrigger>
              <TabsTrigger value="ui">UI</TabsTrigger>
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
                <div className="flex space-x-2">
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Agent</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the agent
                          and remove all of its data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAgent}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ui">
              <div className="space-y-4">
                <p>UI customization options for the agent will be shown here.</p>
                {/* Add UI customization fields here */}
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div className="space-y-4">
                <MorphingStreamButton
                  onStreamToggle={handleStreamToggle}
                  isStreaming={isStreaming}
                  showTextBox={false}
                />
              </div>
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
