import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBotMini from './ChatBotMini';
import { Agent } from './AgentCards';

interface WorkspaceProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveChanges: () => Promise<void>;
  handleDeleteAgent: () => Promise<void>;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveKitActive: boolean;
  setIsLiveKitActive: React.Dispatch<React.SetStateAction<boolean>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  url: string | null;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
  isConnecting: boolean;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  handleStreamEnd: () => void;
  handleStreamStart: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveChanges,
  handleDeleteAgent,
  isStreaming,
  setIsStreaming,
  isLiveKitActive,
  setIsLiveKitActive,
  token,
  setToken,
  url,
  setUrl,
  isConnecting,
  setIsConnecting,
  handleStreamEnd,
  handleStreamStart,
}) => {
  const [activeTab, setActiveTab] = useState('preview');

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

  return (
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
            {/* ... (include the embed code sections from the original file) ... */}
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
            {selectedAgent && (
              <ChatBotMini 
                agentId={selectedAgent.id}
                isStreaming={isStreaming}
                setIsStreaming={setIsStreaming}
                isLiveKitActive={isLiveKitActive}
                setIsLiveKitActive={setIsLiveKitActive}
                token={token}
                setToken={setToken}
                url={url}
                setUrl={setUrl}
                isConnecting={isConnecting}
                setIsConnecting={setIsConnecting}
                onStreamEnd={handleStreamEnd}
                onStreamStart={handleStreamStart}
              />
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default Workspace;
