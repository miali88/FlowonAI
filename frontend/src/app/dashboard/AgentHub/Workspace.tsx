import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBotMini from './ChatBotMini';
import { Agent } from './AgentCards';
import { ChevronRight, Plus, Trash2, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ColorPicker, DEFAULT_COLOR } from '@/components/ui/color-picker';
import { Checkbox } from "@/components/ui/checkbox";
import { AgentFeatures } from './AgentFeatures';
import { Separator } from "@/components/ui/separator";
import { MultiSelect } from '@/components/multiselect';

interface WorkspaceProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveChanges: (agent: Agent) => Promise<void>;
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
  localParticipant: LocalParticipant | null;
  setLocalParticipant: React.Dispatch<React.SetStateAction<LocalParticipant | null>>;
  knowledgeBaseItems: Array<{
    id: string;
    title: string;
    data_type: string;
  }>;
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

// Add this constant at the top of the file, after the imports
const VOICE_OPTIONS = {
  "en-GB": [
    { id: "95856005-0332-41b0-935f-352e296aa0df", name: "Alex K", file: "/voices/AlexK.wav" },
    { id: "79a125e8-cd45-4c13-8a67-188112f4dd22", name: "Beatrice W", file: "/voices/BeatriceW.wav" },
    { id: "a01c369f-6d2d-4185-bc20-b32c225eab70", name: "Felicity A", file: "/voices/FelicityA.wav" },
  ],
  "en-US": [
    { id: "e00d0e4c-a5c8-443f-a8a3-473eb9a62355", name: "US Voice 1", file: "/voices/USVoice1.wav" },
    { id: "d46abd1d-2d02-43e8-819f-51fb652c1c61", name: "US Voice 2", file: "/voices/USVoice2.wav" },
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
  localParticipant,
  setLocalParticipant,
  knowledgeBaseItems,
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
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

  const iframeCode = `<iframe
src="https://www.flowon.ai/embed/${selectedAgent?.id}"
width="100%"
style="height: 100%; min-height: 700px"
frameborder="0"
></iframe>`;

  const scriptCode = `
    <div id="embedded-chatbot-container"></div>
    <script defer>
      window.embeddedChatbotConfig = {
        agentId: "${selectedAgent?.id}",
        domain: "www.flowonwidget.pages.dev"
      };
    </script>
    <script defer type="module" src="https://79c90be8.flowonwidget.pages.dev/embed.min.js"></script>
`;

  const handleConfigureFeature = (featureId: string) => {
    setCurrentFeature(featureId);
    setIsConfigureDialogOpen(true);
  };

  const handleCallTransferConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCallTransferConfig({
      ...callTransferConfig,
      [e.target.id]: e.target.value,
    });
  };

  const handleAppointmentBookingConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentBookingConfig({
      ...appointmentBookingConfig,
      [e.target.id]: e.target.value,
    });
  };

  const handleConfigureDone = () => {
    setIsConfigureDialogOpen(false);
    if (currentFeature === 'callTransfer') {
      setSelectedAgent(prevAgent => ({
        ...prevAgent,
        features: {
          ...prevAgent?.features,
          callTransfer: { ...callTransferConfig }
        }
      }));
    } else if (currentFeature === 'appointmentBooking') {
      setSelectedAgent(prevAgent => ({
        ...prevAgent,
        features: {
          ...prevAgent?.features,
          appointmentBooking: { ...appointmentBookingConfig }
        }
      }));
    } else if (currentFeature === 'form') {
      setSelectedAgent(prevAgent => ({
        ...prevAgent,
        features: {
          ...prevAgent?.features,
          form: { fields: [...formFields] }
        }
      }));
    } else if (currentFeature === 'prospects') {
      setSelectedAgent(prevAgent => ({
        ...prevAgent,
        features: {
          ...prevAgent?.features,
          prospects: { ...prospectSettings }
        }
      }));
    }
    setCurrentFeature(null); // Reset current feature
  };

  const handleAddFormField = () => {
    setFormFields([...formFields, { type: 'text', label: '', options: [] }]);
  };

  const handleRemoveFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleFormFieldChange = (index: number, field: Partial<FormField>) => {
    const newFields = [...formFields];
    newFields[index] = { ...newFields[index], ...field };
    setFormFields(newFields);
  };

  const handleProspectSettingsChange = (field: keyof ProspectSettings, value: string | boolean) => {
    setProspectSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    setSelectedAgent(prevAgent => ({
      ...prevAgent,
      features: {
        ...prevAgent?.features,
        [featureId]: checked ? {} : undefined
      }
    }));
  };

  const handleSaveFeatures = async () => {
    if (selectedAgent) {
      console.log('Before save - Selected Agent State:', {
        dataSource: selectedAgent.dataSource,
        knowledgeBaseIds: selectedAgent.knowledgeBaseIds,
      });

      const agentToSave = {
        ...selectedAgent,
        knowledgeBaseIds: selectedAgent.dataSource?.includes('all')
          ? undefined
          : selectedAgent.knowledgeBaseIds
      };

      console.log('Saving agent with data:', agentToSave);

      try {
        await handleSaveChanges(agentToSave);
        console.log("Features saved successfully");
      } catch (error) {
        console.error("Failed to save features:", error);
      }
    }
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

  // The MultiSelect component looks correct, but let's add some logging
  const handleDataSourceChange = (items: Array<{ id: string; title: string; data_type: string }>) => {
    if (!selectedAgent) return;
    
    console.log('Selected items:', items);
    
    // If "All" is selected
    if (items.some(item => item.id === 'all')) {
      setSelectedAgent({
        ...selectedAgent,
        dataSource: ['all'],
        knowledgeBaseIds: [], // Clear specific selections when "all" is chosen
      });
    } 
    // If specific items are selected
    else {
      setSelectedAgent({
        ...selectedAgent,
        dataSource: items.map(item => item), // Send the actual selected item IDs
        knowledgeBaseIds: items.map(item => item.id),
      });
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 h-12">
        <TabsTrigger value="preview">Playground</TabsTrigger>
        <TabsTrigger value="edit">Settings</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="ui">UI</TabsTrigger>
        <TabsTrigger value="embed">Embed</TabsTrigger>
        <TabsTrigger value="share">Share</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Card>
          <CardHeader>
            <CardTitle>Agent Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentName" className="block text-sm font-medium mb-1">Agent Name</Label>
                <Input 
                  id="agentName"
                  value={selectedAgent?.agentName || ''} 
                  onChange={(e) => setSelectedAgent({...selectedAgent, agentName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="agentPurpose" className="block text-sm font-medium mb-1">Agent Skills</Label>
                <Select 
                  value={selectedAgent?.agentPurpose?.length ? "multiple" : ""}
                  onValueChange={() => {}}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {Array.isArray(selectedAgent?.agentPurpose) && selectedAgent.agentPurpose.length > 0
                        ? selectedAgent.agentPurpose
                            .map(value => AGENT_PURPOSES.find(p => p.value === value)?.label)
                            .join(', ')
                        : "Select agent skills"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_PURPOSES.map((purpose) => (
                      <SelectItem key={purpose.value} value={purpose.value}>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`checkbox-${purpose.value}`}
                            checked={Array.isArray(selectedAgent?.agentPurpose) && selectedAgent?.agentPurpose?.includes(purpose.value)}
                            onCheckedChange={(checked) => {
                              if (!selectedAgent) return;
                              
                              const currentPurposes = Array.isArray(selectedAgent.agentPurpose) 
                                ? [...selectedAgent.agentPurpose] 
                                : [];
                              
                              const newPurposes = checked
                                ? [...currentPurposes, purpose.value]
                                : currentPurposes.filter(p => p !== purpose.value);
                              
                              setSelectedAgent({
                                ...selectedAgent,
                                agentPurpose: newPurposes
                              });
                            }}
                          />
                          <label 
                            htmlFor={`checkbox-${purpose.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {purpose.label}
                          </label>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dataSource" className="block text-sm font-medium mb-1">Data Sources</Label>
                <MultiSelect 
                  items={[
                    { id: 'all', title: 'All Knowledge Base Items', data_type: 'all' },
                    ...knowledgeBaseItems
                  ]}
                  selectedItems={
                    selectedAgent?.dataSource?.includes('all') 
                      ? [{ id: 'all', title: 'All Knowledge Base Items', data_type: 'all' }]
                      : knowledgeBaseItems.filter(item => 
                          selectedAgent?.knowledgeBaseIds?.includes(item.id)
                        )
                  }
                  onChange={handleDataSourceChange}
                />
              </div>
              <div>
                <Label htmlFor="openingLine" className="block text-sm font-medium mb-1">Opening Line</Label>
                <Input 
                  id="openingLine"
                  value={selectedAgent?.openingLine || ''} 
                  onChange={(e) => setSelectedAgent({...selectedAgent, openingLine: e.target.value})}
                />
              </div>
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
              {/* Add a divider before features */}
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
      <TabsContent value="ui">
        <Card>
          <CardHeader>
            <CardTitle>UI Customization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="w-1/2 space-y-6">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <ColorPicker
                    value={selectedAgent?.uiConfig?.primaryColor || DEFAULT_COLOR}
                    onChange={(color) => setSelectedAgent({
                      ...selectedAgent,
                      uiConfig: { ...selectedAgent?.uiConfig, primaryColor: color }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <ColorPicker
                    value={selectedAgent?.uiConfig?.secondaryColor || DEFAULT_COLOR}
                    onChange={(color) => setSelectedAgent({
                      ...selectedAgent,
                      uiConfig: { ...selectedAgent?.uiConfig, secondaryColor: color }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Slider
                    id="fontSize"
                    min={12}
                    max={24}
                    step={1}
                    value={[selectedAgent?.uiConfig?.fontSize || 16]}
                    onValueChange={(value) => setSelectedAgent({
                      ...selectedAgent,
                      uiConfig: { ...selectedAgent?.uiConfig, fontSize: value[0] }
                    })}
                  />
                  <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.fontSize || 16}px</span>
                </div>
                <div>
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Slider
                    id="borderRadius"
                    min={0}
                    max={20}
                    step={1}
                    value={[selectedAgent?.uiConfig?.borderRadius || 4]}
                    onValueChange={(value) => setSelectedAgent({
                      ...selectedAgent,
                      uiConfig: { ...selectedAgent?.uiConfig, borderRadius: value[0] }
                    })}
                  />
                  <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.borderRadius || 4}px</span>
                </div>
                <div>
                  <Label htmlFor="chatboxHeight">Chatbox Height</Label>
                  <Slider
                    id="chatboxHeight"
                    min={300}
                    max={800}
                    step={10}
                    value={[selectedAgent?.uiConfig?.chatboxHeight || 500]}
                    onValueChange={(value) => setSelectedAgent({
                      ...selectedAgent,
                      uiConfig: { ...selectedAgent?.uiConfig, chatboxHeight: value[0] }
                    })}
                  />
                  <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.chatboxHeight || 500}px</span>
                </div>
              </div>
              <div className="w-1/2">
                <div className="border rounded-lg p-4" style={{ height: `${selectedAgent?.uiConfig?.chatboxHeight || 500}px` }}>
                  <ChatBotMini
                    agentId={selectedAgent?.id || ''}
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
                    bypassShowChatInputCondition={true}
                    localParticipant={localParticipant}
                    setLocalParticipant={setLocalParticipant}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="embed">
        <Card>
          <CardHeader>
            <CardTitle>Embed Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">IFrame Embed</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add this code to embed the agent directly in your website.
                </p>
                <div className="relative">
                  <pre className="bg-secondary rounded-md p-4 overflow-x-auto">
                    <code className="text-sm">{iframeCode}</code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => navigator.clipboard.writeText(iframeCode)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Script Embed</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add this script to your website to enable the chat widget.
                </p>
                <div className="relative">
                  <pre className="bg-secondary rounded-md p-4 overflow-x-auto">
                    <code className="text-sm">{scriptCode}</code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => navigator.clipboard.writeText(scriptCode)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Agent Preview</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[600px] flex items-center justify-center">
            {selectedAgent && (
              <div className="w-full max-w-md">
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
                  localParticipant={localParticipant}
                  setLocalParticipant={setLocalParticipant}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
};

export default Workspace;
