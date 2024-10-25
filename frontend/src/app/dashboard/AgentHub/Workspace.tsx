import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBotMini from './ChatBotMini_backup';
import { Agent } from './AgentCards';
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Plus, Trash2, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ColorPicker, DEFAULT_COLOR } from '@/components/ui/color-picker';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      try {
        await handleSaveChanges(selectedAgent);
        // Optionally, show a success message here
        console.log("Features saved successfully");
      } catch (error) {
        console.error("Failed to save features:", error);
        // Optionally, show an error message here
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
                <Label htmlFor="dataSource" className="block text-sm font-medium mb-1">Data Source</Label>
                <Select 
                  value={selectedAgent?.dataSource || ''}
                  onValueChange={(value) => {
                    if (!selectedAgent) return;
                    setSelectedAgent({
                      ...selectedAgent,
                      dataSource: value,
                      // Only clear the tag if switching away from 'tagged'
                      tag: value === 'tagged' ? selectedAgent.tag : undefined
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedAgent?.dataSource === 'tagged' 
                        ? `Tagged: ${selectedAgent.tag}` 
                        : selectedAgent?.dataSource || 'Select data source'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="tagged">Items with tag...</SelectItem>
                    <SelectItem value="natural-language">Describe using natural language</SelectItem>
                  </SelectContent>
                </Select>
                {selectedAgent?.dataSource === "natural-language" && (
                  <p className="text-sm text-muted-foreground mt-1">Feature coming soon</p>
                )}
              </div>
              {/* Show tag input only when dataSource is "tagged" */}
              {selectedAgent?.dataSource === "tagged" && (
                <div>
                  <Label htmlFor="tag" className="block text-sm font-medium mb-1">Tag</Label>
                  <Input 
                    id="tag"
                    placeholder="Enter tag..."
                    value={selectedAgent.tag || ''} 
                    onChange={(e) => setSelectedAgent({
                      ...selectedAgent,
                      tag: e.target.value
                    })}
                  />
                </div>
              )}
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

              {/* Relocated features section */}
              <div className="space-y-6">
                {[
                  { id: "prospects", label: "Notify you on interest" },
                  { id: "form", label: "Collect written information" },
                  { id: "callTransfer", label: "Transfer call to a human" },
                  { id: "appointmentBooking", label: "Book calendar slot" },
                ].map((feature) => (
                  <div key={feature.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={feature.id}>{feature.label}</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={feature.id}
                          checked={!!selectedAgent?.features?.[feature.id]}
                          onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                        />
                        {selectedAgent?.features?.[feature.id] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfigureFeature(feature.id)}
                          >
                            Configure <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {selectedAgent?.features?.[feature.id] && (
                      <p className="text-sm text-muted-foreground">
                        {getFeatureDescription(feature.id)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={() => selectedAgent && handleSaveChanges(selectedAgent)}>
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
          <div className="absolute inset-0 flex items-center justify-center p-4">
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
                />
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Configuration Dialog */}
      <Dialog open={isConfigureDialogOpen} onOpenChange={setIsConfigureDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Configure {getFeatureTitle(currentFeature)}
            </DialogTitle>
            <DialogDescription>
              {getFeatureDescription(currentFeature)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {currentFeature === 'callTransfer' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="primaryNumber" className="text-right">
                    Primary Number
                  </Label>
                  <Input
                    id="primaryNumber"
                    value={callTransferConfig.primaryNumber}
                    onChange={handleCallTransferConfigChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="secondaryNumber" className="text-right">
                    Secondary Number
                  </Label>
                  <Input
                    id="secondaryNumber"
                    value={callTransferConfig.secondaryNumber}
                    onChange={handleCallTransferConfigChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
            {currentFeature === 'appointmentBooking' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nylasApiKey" className="text-right">
                    Nylas API Key
                  </Label>
                  <Input
                    id="nylasApiKey"
                    value={appointmentBookingConfig.nylasApiKey}
                    onChange={handleAppointmentBookingConfigChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
            {currentFeature === 'form' && (
              <>
                <Accordion type="single" collapsible>
                  <AccordionItem value="info">
                    <AccordionTrigger>how to use</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">
                        Forms should only be used to collect personal data that requires exact spelling. All other types of information will be automatically extracted. The agent will:
                      </p>
                      <ul>
                        <li>- Request and verify this information from the caller</li>
                        <li>- Let the AI system capture other relevant details from the conversation</li>
                        <li>- Qualify a caller as a lead</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {formFields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Select
                        value={field.type}
                        onValueChange={(value) => handleFormFieldChange(index, { type: value })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFormField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Enter placeholder text here"
                      value={field.label}
                      onChange={(e) => handleFormFieldChange(index, { label: e.target.value })}
                      className="italic"
                    />
                    {field.type === 'dropdown' && (
                      <Textarea
                        placeholder="Enter options (one per line)"
                        value={field.options.join('\n')}
                        onChange={(e) => handleFormFieldChange(index, { options: e.target.value.split('\n') })}
                      />
                    )}
                  </div>
                ))}
                <Button onClick={handleAddFormField} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Field
                </Button>
              </>
            )}
            {currentFeature === 'prospects' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyOnInterest"
                    checked={prospectSettings.notifyOnInterest}
                    onCheckedChange={(checked) => handleProspectSettingsChange('notifyOnInterest', checked)}
                  />
                  <Label htmlFor="notifyOnInterest">Notify when a prospect shows interest</Label>
                </div>
                
                {prospectSettings.notifyOnInterest && (
                  <div className="space-y-4 mt-4">
                    <Label>Notification Methods</Label>
                    {['email', 'sms', 'whatsapp'].map((method) => (
                      <div key={method} className="space-y-2">
                        <Label htmlFor={`notify-${method}`}>{method.charAt(0).toUpperCase() + method.slice(1)}</Label>
                        <Input
                          id={`notify-${method}`}
                          placeholder={`Enter ${method} details`}
                          value={prospectSettings[method as keyof ProspectSettings]}
                          onChange={(e) => handleProspectSettingsChange(method as keyof ProspectSettings, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleConfigureDone}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Tabs>
  );
};

export default Workspace;
function handleConfigureFeature(featureId: string) {
  // Implement the logic to open a modal or expandable section for configuration
  console.log(`Configure ${featureId}`);
}

function getFeatureDescription(featureId: string): string {
  switch (featureId) {
    case "callTransfer":
      return "Allow the agent to transfer calls to human operators.";
    case "appointmentBooking":
      return "Enable the agent to schedule appointments and manage a calendar.";
    case "form":
      return "Let the agent collect structured data through customizable forms.";
    case "prospects":
      return "Be notified when a prospect shows interest.";
    default:
      return "";
  }
}

interface FormField {
  type: 'text' | 'email' | 'phone' | 'dropdown';
  label: string;
  options: string[];
}

function getFeatureTitle(featureId: string | null): string {
  switch (featureId) {
    case "callTransfer":
      return "Call Transfer";
    case "appointmentBooking":
      return "Appointment Booking";
    case "form":
      return "Custom Form";
    case "prospects":
      return "Prospects";
    default:
      return "";
  }
}

