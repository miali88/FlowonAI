"use client";

import React, { useState, useCallback } from 'react';
import { AgentCards, Agent } from './AgentCards';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogDemo } from './NewAgent';
import ChatBotMini from './ChatBotMini';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Lab = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState('');
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('preview');
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useUser();

  const iframeCode = `<iframe
src="https://www.flowon.ai/embed/${selectedAgent?.id}"
width="100%"
style="height: 100%; min-height: 700px"
frameborder="0"
></iframe>`;

  const scriptCode = `<script>
window.embeddedAgentConfig = {
  agentId: "${selectedAgent?.id}",
  domain: "www.flowon.ai"
}
</script>
<script
src="https://flowon.ai/embed.min.js"
agentId="${selectedAgent?.id}"
domain="www.flowon.ai"
defer
></script>`;

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleSaveChanges = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/livekit/agents/${selectedAgent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          agentName: selectedAgent.agentName,
          agentPurpose: selectedAgent.agentPurpose,
          dataSource: selectedAgent.dataSource,
          tag: selectedAgent.tag,
          openingLine: selectedAgent.openingLine,
          voice: selectedAgent.voice,
          instructions: selectedAgent.instructions,
        }),
      });

      if (response.ok) {
        setAlertDialogMessage('Agent updated successfully.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      setAlertDialogMessage(error instanceof Error ? error.message : "Failed to update the agent. Please try again.");
    } finally {
      setAlertDialogOpen(true);
    }
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
        setAlertDialogMessage(`${selectedAgent.agentName} has been successfully deleted. Refresh the page to see the change.`);
        setSelectedAgent(null);
        // Optionally, refresh the agent list here
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      setAlertDialogMessage(error instanceof Error ? error.message : "Failed to delete the agent. Please try again.");
    } finally {
      setAlertDialogOpen(true);
    }
  };

  const handleConnect = useCallback(async () => {
    if (!selectedAgent || !user) {
      console.error('No agent selected or user not authenticated');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/livekit/token?agent_id=${selectedAgent.id}&user_id=${user.id}`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      const { accessToken, url } = await response.json();
      setToken(accessToken);
      setUrl(url);
      setIsLiveKitActive(true);
      setIsStreaming(true);
    } catch (error) {
      console.error('Failed to connect:', error);
      setAlertDialogMessage('Failed to connect to the stream. Please try again.');
      setAlertDialogOpen(true);
    } finally {
      setIsConnecting(false);
    }
  }, [selectedAgent, user]);

  const handleStreamToggle = useCallback(async () => {
    if (isStreaming) {
      // If currently streaming, initiate disconnection
      setIsConnecting(true);
      setIsStreaming(false);
      setIsLiveKitActive(false);
    } else {
      // If not streaming, initiate connection
      setIsConnecting(true);
      try {
        await handleConnect();
        setIsStreaming(true);
        setIsLiveKitActive(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        setAlertDialogMessage('Failed to connect to the stream. Please try again.');
        setAlertDialogOpen(true);
      } finally {
        setIsConnecting(false);
      }
    }
  }, [isStreaming, handleConnect]);

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    setIsConnecting(false);
  }, []);

  const handleStreamStart = useCallback(() => {
    setIsConnecting(false);
  }, []);

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex flex-col space-y-6">
        <div className="w-full flex flex-col items-start space-y-4">
          <DialogDemo />
          <AgentCards setSelectedAgent={handleAgentSelect} />
        </div>
        {selectedAgent && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Playground</TabsTrigger>
              <TabsTrigger value="edit">Settings</TabsTrigger>
              <TabsTrigger value="ui">UI</TabsTrigger>
              <TabsTrigger value="embed">Embed</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
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
                    className="min-h-[400px]"
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
            <TabsContent value="embed">
              <Card>
                <CardHeader>
                  <CardTitle>Embed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>To add the agent anywhere on your website, add this iframe to your HTML code:</p>
                  <div className="bg-gray-100 p-4 rounded-md my-2">
                    <pre className="whitespace-pre-wrap break-all">{iframeCode}</pre>
                  </div>
                  <Button onClick={() => navigator.clipboard.writeText(iframeCode)}>Copy Iframe</Button>
                  <p className="mt-4">To add a chat bubble to the bottom right of your website, add this script tag to your HTML:</p>
                  <div className="bg-gray-100 p-4 rounded-md my-2">
                    <pre className="whitespace-pre-wrap break-all">{scriptCode}</pre>
                  </div>
                  <Button onClick={() => navigator.clipboard.writeText(scriptCode)}>Copy Script</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="share">
              <Card>
                <CardHeader>
                  <CardTitle>Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Share options for your agent will be shown here.</p>
                  {/* Add share options here */}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preview">
              <div className="relative h-[600px] w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChatBotMini />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        {!selectedAgent && (
          <p>Select or create an agent to get started.</p>
        )}
      </div>
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Lab;