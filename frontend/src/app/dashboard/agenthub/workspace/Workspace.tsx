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
import { LANGUAGE_OPTIONS, VOICE_OPTIONS } from './agentSettings';

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
  { value: "prospecting", label: "Prospecting" },
  { value: "question-answer", label: "Question & Answer" },
  { value: "customer-service", label: "Customer Service" },
  { value: "product-recommendation", label: "Product Recommendation" },
];

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
  const [setIsConfigureDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [callTransferConfig, setCallTransferConfig] = useState({
    primaryNumber: selectedAgent?.features?.callTransfer?.primaryNumber || '',
    secondaryNumber: selectedAgent?.features?.callTransfer?.secondaryNumber || '',
  });
  const [appointmentBookingConfig, setAppointmentBookingConfig] = useState({
    nylasApiKey: selectedAgent?.features?.appointmentBooking?.nylasApiKey || '',
  });
  const [formFields, setFormFields] = useState<FormField[]>(
    selectedAgent?.features?.form?.fields || []
  );
  const [prospectSettings, setProspectSettings] = useState<ProspectSettings>({
    notifyOnInterest: selectedAgent?.features?.prospects?.notifyOnInterest || false,
    email: selectedAgent?.features?.prospects?.email || '',
    sms: selectedAgent?.features?.prospects?.sms || '',
    whatsapp: selectedAgent?.features?.prospects?.whatsapp || '',
  });

  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const playVoiceSample = (voiceFile: string) => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
    const newAudioPlayer = new Audio(voiceFile);
    newAudioPlayer.play();
    setAudioPlayer(newAudioPlayer);
  };


  const handleSaveFeatures = async () => {
    if (!selectedAgent || !handleSaveChanges) {
      console.error("Selected agent or handleSaveChanges is not available");
      return;
    }

    // Find the voice provider from VOICE_OPTIONS
    const voiceProvider = selectedAgent.language && selectedAgent.voice
      ? VOICE_OPTIONS[selectedAgent.language]?.find(v => v.id === selectedAgent.voice)?.voiceProvider
      : null;

    const agentToSave = {
      ...selectedAgent,
      voiceProvider, // Add the voice provider
      knowledgeBaseIds: selectedAgent.dataSource?.includes('all')
        ? undefined
        : selectedAgent.knowledgeBaseIds
    };

    console.log('Saving agent with data:', agentToSave);
    await handleSaveChanges(agentToSave);
  };

  // Synchronize local state with selectedAgent when it changes
  useEffect(() => {
    if (selectedAgent) {
      setCallTransferConfig({
        primaryNumber: selectedAgent.features?.callTransfer?.primaryNumber || '',
        secondaryNumber: selectedAgent.features?.callTransfer?.secondaryNumber || '',
      });
      setAppointmentBookingConfig({
        nylasApiKey: selectedAgent.features?.appointmentBooking?.nylasApiKey || '',
      });
      setFormFields(selectedAgent.features?.form?.fields || []);
      setProspectSettings({
        notifyOnInterest: selectedAgent.features?.prospects?.notifyOnInterest || false,
        email: selectedAgent.features?.prospects?.email || '',
        sms: selectedAgent.features?.prospects?.sms || '',
        whatsapp: selectedAgent.features?.prospects?.whatsapp || '',
      });
    }
  }, [selectedAgent]);

  // Add a useEffect to log the knowledge base items when they change
  useEffect(() => {
    console.log('Knowledge Base Items:', knowledgeBaseItems);
  }, [knowledgeBaseItems]);

  const handleDataSourceChange = (items: Array<{ id: string; title: string; data_type: string }>) => {
    if (!selectedAgent) return;
    
    console.log('handleDataSourceChange - items:', items);
    
    setSelectedAgent(prev => {
      const updated = {
        ...prev,
        dataSource: items,
        knowledgeBaseIds: items.some(item => item.id === 'all') 
          ? [] 
          : items.map(item => item.id)
      };
      console.log('Updated agent:', updated);
      return updated;
    });
  };

  // Add this useEffect at the Workspace level
  useEffect(() => {
    if (selectedAgent) {
      // Set the embedded chatbot config at workspace level
      window.embeddedChatbotConfig = {
        agentId: selectedAgent.id,
        domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      }
    }
  }, [selectedAgent]);

  // Add debug log
  useEffect(() => {
    console.log('Workspace Features:', features);
  }, [features]);

  const handleVoiceChange = (voiceId: string) => {
    const selectedLanguage = selectedAgent.language;
    const voiceOption = VOICE_OPTIONS[selectedLanguage].find(v => v.id === voiceId);
    
    setSelectedAgent(prev => ({
      ...prev,
      voice: voiceId,
      voiceProvider: voiceOption?.voiceProvider || null
    }));
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 h-12">
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="edit">Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                      items={knowledgeBaseItems}
                      selectedItems={
                        selectedAgent?.dataSource && Array.isArray(selectedAgent.dataSource)
                          ? selectedAgent.dataSource.map(item => ({
                              id: item.id.toString(),
                              title: item.title,
                              data_type: item.data_type
                            }))
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

                  <AgentFeatures
                    selectedAgent={selectedAgent}
                    setSelectedAgent={setSelectedAgent}
                    handleSaveFeatures={handleSaveFeatures}
                  />

                  {/* Add the Retrain Agent button at the bottom */}
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
      </div>
    );
  };

  export default Workspace;
