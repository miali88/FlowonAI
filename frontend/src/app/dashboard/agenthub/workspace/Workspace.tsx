import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from '../AgentCards';
import { Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AgentFeatures } from '../AgentFeatures';
import { MultiSelect } from './multiselect_settings';
import Deploy from './Deploy';
import Playground from './Playground';
import Ui from './Ui';

interface WorkspaceProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveChanges: (agent: Agent) => Promise<void>;
  handleDeleteAgent: () => Promise<void>;
  knowledgeBaseItems: Array<{
    id: string;
    title: string;
    data_type: string;
  }>;
  userId: string | null;
  features?: {
    form?: {
      fields: Array<{
        type: string;
        label: string;
        options: any[];
      }>;
    };
    prospects?: {
      sms: string;
      email: string;
      whatsapp: string;
      notifyOnInterest: boolean;
    };
  };
}

interface ProspectSettings {
  notifyOnInterest: boolean;
  email: string;
  sms: string;
  whatsapp: string;
}

// Add this type definition near your other interfaces
interface AgentPurpose {
  value: string;
  label: string;
}

// Add this constant with your available skills
const AGENT_PURPOSES: AgentPurpose[] = [
  { value: "lead-generation", label: "Lead Generation & Prospecting" },
  { value: "prospecting", label: "Prospecting" },
  { value: "question-answer", label: "Question & Answer" },
  { value: "customer-service", label: "Customer Service" },
  { value: "appointment-booking", label: "Appointment Booking" },
  { value: "product-recommendation", label: "Product Recommendation" },
];

// Add this constant at the top of the file, after the imports
const VOICE_OPTIONS = {
  "en-GB": [
    { id: "alex", name: "Alex K", file: "/voices/AlexK.wav" },
    { id: "beatrice", name: "Beatrice W", file: "/voices/BeatriceW.wav" },
    { id: "felicity", name: "Felicity A", file: "/voices/FelicityA.wav" },
  ],
  "en-US": [
    { id: "us1", name: "US Voice 1", file: "/voices/USVoice1.wav" },
    { id: "us2", name: "US Voice 2", file: "/voices/USVoice2.wav" },
  ],
  "fr": [
    { id: "ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3", name: "Male", file: "/voices/cartesia_french1.wav" },
    { id: "a249eaff-1e96-4d2c-b23b-12efa4f66f41", name: "Female", file: "/voices/cartesia_french2.wav" },
  ],
  "de": [{ id: "de-voice1", name: "German Voice 1", file: "/voices/cartesia_german1.wav" }],
  "ar": [{ id: "ar-voice1", name: "Arabic Voice 1", file: "/voices/cartesia_arabic1.wav" }],
  "nl": [{ id: "nl-voice1", name: "Dutch Voice 1", file: "/voices/cartesia_dutch1.wav" }],
  "zh": [{ id: "zh-voice1", name: "Mandarin Voice 1", file: "/voices/cartesia_mandarin1.wav" }],
};

// Update the Agent interface near the top of the file
interface Agent {
  id?: string;
  agentName?: string;
  agentPurpose: string;
  features: {
    notifyOnInterest?: boolean;
    collectWrittenInformation?: boolean;
    transferCallToHuman?: boolean;
    bookCalendarSlot?: boolean;
    prospects?: boolean;
    form?: boolean;
    callTransfer?: boolean;
    appointmentBooking?: boolean;
  };
  // ... other properties
}

const Workspace: React.FC<WorkspaceProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveChanges,
  handleDeleteAgent,
  knowledgeBaseItems,
  userId,
  features,
}) => {
  const [activeTab, setActiveTab] = useState('playground');
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const handleDataSourceChange = (selectedItems: typeof knowledgeBaseItems) => {
    if (!selectedAgent) return;
    
    const selectedIds = selectedItems.map(item => item.id);
    setSelectedAgent({
      ...selectedAgent,
      dataSource: selectedIds
    });
  };

  const handleSaveFeatures = async (features: any) => {
    if (!selectedAgent) return;
    
    try {
      const updatedAgent = {
        ...selectedAgent,
        features
      };
      await handleSaveChanges(updatedAgent);
    } catch (error) {
      console.error('Error saving features:', error);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 h-12">
        <TabsTrigger value="playground">Playground</TabsTrigger>
        <TabsTrigger value="edit">Settings</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        {/* <TabsTrigger value="ui">UI</TabsTrigger> */}
        <TabsTrigger value="deploy">Deploy</TabsTrigger>
        <TabsTrigger value="share">Share</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Card>
          <CardHeader>
            <CardTitle>Agent Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Basic Settings */}
              <div>
                <Label htmlFor="agentName" className="block text-sm font-medium mb-1">Agent Name</Label>
                <Input 
                  id="agentName"
                  value={selectedAgent?.agentName || ''} 
                  onChange={(e) => setSelectedAgent({...selectedAgent, agentName: e.target.value})}
                />
              </div>

              {/* Agent Skills */}
              <div>
                <Label htmlFor="agentPurpose" className="block text-sm font-medium mb-1">Agent Purpose</Label>
                <Select 
                  value={selectedAgent?.agentPurpose || ""}
                  onValueChange={(value) => {
                    if (!selectedAgent) return;
                    setSelectedAgent({
                      ...selectedAgent,
                      agentPurpose: value  // Set single purpose instead of array
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select agent purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_PURPOSES.map((purpose) => (
                      <SelectItem key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Sources */}
              <div>
                <Label htmlFor="dataSource" className="block text-sm font-medium mb-1">Data Sources</Label>
                <div className="relative">
                  <MultiSelect 
                    items={[
                      { id: 'all', title: 'All Knowledge Base Items', data_type: 'all' },
                      ...knowledgeBaseItems
                    ]}
                    selectedItems={
                      selectedAgent?.dataSource 
                        ? (selectedAgent.dataSource.includes('all')
                            ? [{ id: 'all', title: 'All Knowledge Base Items', data_type: 'all' }]
                            : knowledgeBaseItems.filter(item => 
                                selectedAgent.dataSource.includes(item.id.toString())
                              ))
                        : []
                    }
                    onChange={handleDataSourceChange}
                  />
                </div>
              </div>

              {/* Opening Line */}
              <div>
                <Label htmlFor="openingLine" className="block text-sm font-medium mb-1">Opening Line</Label>
                <Input 
                  id="openingLine"
                  value={selectedAgent?.openingLine || ''} 
                  onChange={(e) => setSelectedAgent({...selectedAgent, openingLine: e.target.value})}
                />
              </div>

              {/* Language Selection */}
              <div>
                <Label htmlFor="language" className="block text-sm font-medium mb-1">Language</Label>
                <Select 
                  value={selectedAgent?.language}
                  onValueChange={(value) => setSelectedAgent({...selectedAgent, language: value, voice: ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-GB">English GB</SelectItem>
                    <SelectItem value="en-US">English US</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="nl">Dutch</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Selection */}
              <div>
                <Label htmlFor="voice" className="block text-sm font-medium mb-1">Voice</Label>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={selectedAgent?.voice}
                    onValueChange={(value) => setSelectedAgent({...selectedAgent, voice: value})}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAgent?.language && VOICE_OPTIONS[selectedAgent.language as keyof typeof VOICE_OPTIONS]?.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const voiceFile = VOICE_OPTIONS[selectedAgent?.language as keyof typeof VOICE_OPTIONS]?.find(v => v.id === selectedAgent?.voice)?.file;
                      if (voiceFile) playVoiceSample(voiceFile);
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Features Section */}
              <div className="my-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Features</span>
                  </div>
                </div>
              </div>

              {/* Agent Features Component */}
              <AgentFeatures
                selectedAgent={selectedAgent}
                setSelectedAgent={(agent) => {
                  if (!agent || !selectedAgent) return;
                  setSelectedAgent({
                    ...selectedAgent,
                    features: agent.features
                  });
                }}
                handleSaveFeatures={handleSaveFeatures}
              />

              {/* Retrain Button */}
              <div className="pt-6">
                <Button onClick={handleSaveFeatures}>
                  Retrain Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="advanced">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="instructions" className="block text-sm font-medium mb-1">Instructions</Label>
              <Textarea 
                id="instructions"
                value={selectedAgent?.instructions || ''} 
                onChange={(e) => setSelectedAgent({...selectedAgent, instructions: e.target.value})}
                className="min-h-[400px]"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveFeatures}>
                Retrain Agent
              </Button>
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
          </CardContent>
        </Card>
      </TabsContent>
      {/* <TabsContent value="ui">
        <Ui
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
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
          handleStreamEnd={handleStreamEnd}
          handleStreamStart={handleStreamStart}
          localParticipant={localParticipant}
          setLocalParticipant={setLocalParticipant}
        />
      </TabsContent> */}
      <TabsContent value="deploy">
        <Deploy 
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          handleSaveChanges={handleSaveChanges}
        />
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
      <TabsContent value="playground">
        <Playground 
          selectedAgent={selectedAgent}
        />
      </TabsContent>
    </Tabs>
  );
};

export default Workspace;
