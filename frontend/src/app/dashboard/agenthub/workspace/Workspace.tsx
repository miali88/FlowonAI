import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "../AgentCards";
import { Play } from "lucide-react";
import { AgentFeatures } from "./AgentFeatures";
import { MultiSelect } from "./multiselect_settings";
import Deploy from "./Deploy";
import Playground from "./Playground";
import {
  LANGUAGE_OPTIONS,
  VOICE_OPTIONS,
  AGENT_PURPOSE_OPTIONS,
} from "./agentSettings";

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

type SupportedLanguages = "en-GB" | "en-US" | "fr" | "de" | "ar" | "nl" | "zh";

interface VoiceOption {
  id: string;
  name: string;
  file: string;
  voiceProvider: string;
}

interface VoiceOptions {
  "en-GB": VoiceOption[];
  "en-US": VoiceOption[];
  fr: VoiceOption[];
  de: VoiceOption[];
  ar: VoiceOption[];
  nl: VoiceOption[];
  zh: VoiceOption[];
}

interface FormField {
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface ProspectSettings {
  notifyOnInterest: boolean;
  email: string;
  sms: string;
  whatsapp: string;
}

interface FeatureConfig {
  enabled: boolean;
  [key: string]: string | number | boolean | FormField[];
}

interface VoiceFeature extends FeatureConfig {
  provider: string;
  id: string;
}

interface FormFeature extends FeatureConfig {
  fields: FormField[];
}

interface ProspectsFeature extends FeatureConfig {
  notifyOnInterest: boolean;
  email: string;
  sms: string;
  whatsapp: string;
}

type Features = {
  voice?: VoiceFeature;
  form?: FormFeature;
  prospects?: ProspectsFeature;
};

interface AgentWithFeatures extends Agent {
  features: Features;
}

interface SelectedAgent extends Omit<Agent, "features"> {
  features: {
    [key: string]: {
      [key: string]: any;
      enabled: boolean;
      number?: string;
    };
  };
}

interface Agent {
  id?: string;
  agentName: string;
  openingLine?: string;
  instructions?: string;
  language?: string;
  voice?: string;
  voiceProvider?: string;
  showSourcesInChat?: boolean;
  dataSource?: Array<{
    id: string;
    title: string;
    data_type: string;
  }>;
  knowledgeBaseIds?: string[];
  features?: {
    [key: string]: {
      enabled: boolean;
      [key: string]: any;
    };
  };
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
  const [activeTab, setActiveTab] = useState("edit");
  const [setIsConfigureDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [appointmentBookingConfig, setAppointmentBookingConfig] = useState({
    nylasApiKey: selectedAgent?.features?.appointmentBooking?.nylasApiKey || "",
  });
  const [formFields, setFormFields] = useState<FormField[]>(
    (selectedAgent?.features?.form?.fields || []) as FormField[]
  );
  const [prospectSettings, setProspectSettings] = useState<ProspectSettings>({
    notifyOnInterest: Boolean(
      selectedAgent?.features?.prospects?.notifyOnInterest
    ),
    email: String(selectedAgent?.features?.prospects?.email || ""),
    sms: String(selectedAgent?.features?.prospects?.sms || ""),
    whatsapp: String(selectedAgent?.features?.prospects?.whatsapp || ""),
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

    const voiceOption =
      selectedAgent.language && selectedAgent.voice
        ? VOICE_OPTIONS[selectedAgent.language]?.find(
            (v) => v.id === selectedAgent.voice
          )
        : null;

    const currentFeatures = agentFeaturesRef.current?.getCurrentState() || {};

    console.log("Current Features:", currentFeatures);

    const agentToSave = {
      ...selectedAgent,
      voiceProvider: voiceOption?.voiceProvider || null,
      features: currentFeatures, // Already cleaned in getCurrentState
      knowledgeBaseIds: selectedAgent.dataSource?.includes("all")
        ? undefined
        : selectedAgent.knowledgeBaseIds,
      showSourcesInChat: selectedAgent.showSourcesInChat,
    };

    console.log("Saving agent with features:", agentToSave);
    await handleSaveChanges(agentToSave);
  };

  // Synchronize local state with selectedAgent when it changes
  useEffect(() => {
    if (selectedAgent) {
      setAppointmentBookingConfig({
        nylasApiKey:
          selectedAgent.features?.appointmentBooking?.nylasApiKey || "",
      });
      setFormFields(selectedAgent.features?.form?.fields || []);
      setProspectSettings({
        notifyOnInterest:
          selectedAgent.features?.prospects?.notifyOnInterest || false,
        email: selectedAgent.features?.prospects?.email || "",
        sms: selectedAgent.features?.prospects?.sms || "",
        whatsapp: selectedAgent.features?.prospects?.whatsapp || "",
      });
    }
  }, [selectedAgent]);

  // Add a useEffect to log the knowledge base items when they change
  useEffect(() => {
    console.log("Knowledge Base Items:", knowledgeBaseItems);
  }, [knowledgeBaseItems]);

  const handleDataSourceChange = (
    items: Array<{ id: string; title: string; data_type: string }>
  ) => {
    if (!selectedAgent) return;

    setSelectedAgent((prev) => {
      if (!prev) return null;
      const updatedAgent: Agent = {
        ...prev,
        dataSource: items,
        knowledgeBaseIds: items.some((item) => item.id === "all")
          ? []
          : items.map((item) => item.id),
      };
      return updatedAgent;
    });
  };

  // Add this useEffect at the Workspace level
  useEffect(() => {
    if (selectedAgent) {
      // Set the embedded chatbot config at workspace level
      window.embeddedChatbotConfig = {
        agentId: selectedAgent.id,
        domain: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
      };
    }
  }, [selectedAgent]);

  // Add debug log
  useEffect(() => {
    console.log("Workspace Features:", features);
  }, [features]);

  const handleVoiceChange = (voiceId: string) => {
    if (!selectedAgent?.language) return;

    const language = selectedAgent.language as SupportedLanguages;
    const voiceOption = (VOICE_OPTIONS as VoiceOptions)[language]?.find(
      (v: VoiceOption) => v.id === voiceId
    );

    setSelectedAgent((prev: Agent | null) => {
      if (!prev) return null;
      const updatedAgent: AgentWithFeatures = {
        ...prev,
        voice: voiceId,
        features: {
          ...prev.features,
          voice: {
            enabled: true,
            provider: voiceOption?.voiceProvider || "",
            id: voiceId,
          },
        },
      };
      return updatedAgent as Agent;
    });
  };

  const handleInputChange = (field: keyof Agent, value: any) => {
    setSelectedAgent((prev) => {
      if (!prev) return null;
      const updatedAgent: Agent = {
        ...prev,
        [field]: value,
      };
      return updatedAgent;
    });
  };

  const handleFormFieldsChange = (fields: FormField[]) => {
    setFormFields(fields);

    setSelectedAgent((prev: Agent | null) => {
      if (!prev) return null;
      const updatedAgent: AgentWithFeatures = {
        ...prev,
        features: {
          ...prev.features,
          form: {
            enabled: true,
            fields,
          },
        },
      };
      return updatedAgent as Agent;
    });
  };

  const handleProspectSettingsChange = (
    field: keyof ProspectSettings,
    value: string | boolean
  ) => {
    setProspectSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSelectedAgent((prev: Agent | null) => {
      if (!prev) return null;

      const updatedFeatures = {
        ...prev.features,
        [field]: {
          enabled: Boolean(value),
        },
      };

      // If it's notifyOnInterest, also update lead_gen
      if (field === "notifyOnInterest") {
        updatedFeatures.lead_gen = {
          ...prev.features?.lead_gen,
          enabled: Boolean(value),
        };
      }

      return {
        ...prev,
        features: updatedFeatures,
      } as Agent;
    });
  };

  const isFormField = (value: any): value is FormField => {
    return typeof value === "object" && "type" in value && "label" in value;
  };

  const isProspectSettings = (value: any): value is ProspectSettings => {
    return typeof value === "object" && "notifyOnInterest" in value;
  };

  const agentFeaturesRef = useRef<{ getCurrentState: () => any }>(null);

  const handleLanguageChange = (value: string) => {
    setSelectedAgent((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        language: value,
      };
    });
  };

  const cleanFeatures = (features: any) => {
    if (!features) return {};

    // Create a new object without prospects and prospecting
    const { prospects, calendar, prospecting, ...cleanedFeatures } = features;

    return cleanedFeatures;
  };

  useEffect(() => {
    if (selectedAgent?.features) {
      // Initialize settings based on backend data
      setProspectSettings({
        notifyOnInterest:
          selectedAgent.features.notifyOnInterest?.enabled || false,
        email: selectedAgent.features.lead_gen?.email || "",
        sms: selectedAgent.features.lead_gen?.sms || "",
        whatsapp: selectedAgent.features.lead_gen?.whatsapp || "",
      });
    }
  }, [selectedAgent]);

  return (
    <div className="flex gap-4">
      <div className="w-2/3">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            console.log("Tab changed to:", value);
            setActiveTab(value);
          }}
          className="w-full"
        >
          <TabsList className="mb-4 h-12">
            <TabsTrigger value="edit">Tune</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
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
                    <Label
                      htmlFor="agentName"
                      className="block text-sm font-medium mb-1"
                    >
                      Agent Name
                    </Label>
                    <Input
                      id="agentName"
                      value={selectedAgent?.agentName || ""}
                      onChange={(e) =>
                        handleInputChange("agentName", e.target.value)
                      }
                    />
                  </div>

                  {/* Data Sources */}
                  <div>
                    <Label
                      htmlFor="dataSource"
                      className="block text-sm font-medium mb-1"
                    >
                      Data Sources
                    </Label>
                    <div className="relative">
                      <MultiSelect
                        items={knowledgeBaseItems}
                        selectedItems={
                          selectedAgent?.dataSource &&
                          Array.isArray(selectedAgent.dataSource)
                            ? selectedAgent.dataSource.map((item) => ({
                                id: item.id.toString(),
                                title: item.title,
                                data_type: item.data_type,
                              }))
                            : []
                        }
                        onChange={handleDataSourceChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showSourcesInChat"
                      checked={selectedAgent?.showSourcesInChat || false}
                      onChange={(e) =>
                        handleInputChange("showSourcesInChat", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label
                      htmlFor="showSourcesInChat"
                      className="text-sm font-medium"
                    >
                      Show sources in chat
                    </Label>
                  </div>

                  {/* Opening Line */}
                  <div>
                    <Label
                      htmlFor="openingLine"
                      className="block text-sm font-medium mb-1"
                    >
                      Opening Line
                    </Label>
                    <Input
                      id="openingLine"
                      value={selectedAgent?.openingLine || ""}
                      onChange={(e) =>
                        handleInputChange("openingLine", e.target.value)
                      }
                    />
                  </div>

                  {/* Commenting out Language Selection
                  <div>
                    <Label htmlFor="language" className="block text-sm font-medium mb-1">Language</Label>
                    <Select 
                      value={selectedAgent?.language || ''}
                      onValueChange={(value: string) => handleLanguageChange(value)}
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
                  */}

                  {/* Commenting out Voice Selection
                  <div>
                    <Label htmlFor="voice" className="block text-sm font-medium mb-1">Voice</Label>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={selectedAgent?.voice}
                        onValueChange={(value) => handleInputChange('voice', value)}
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
                  */}

                  {/* Add the Retrain Agent button at the bottom */}
                  <div className="pt-6">
                    <Button onClick={handleSaveFeatures}>Retrain Agent</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="deploy">
            <Deploy
              selectedAgent={selectedAgent as any}
              setSelectedAgent={setSelectedAgent as any}
              handleSaveChanges={handleSaveChanges as any}
              userInfo={userId as any}
            />
          </TabsContent>
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Agent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentFeatures
                  ref={agentFeaturesRef}
                  selectedAgent={{
                    ...(selectedAgent as unknown as SelectedAgent),
                    features: cleanFeatures(selectedAgent?.features),
                  }}
                  setSelectedAgent={(agent: SelectedAgent) => {
                    setSelectedAgent((prev) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        features: cleanFeatures(agent.features),
                      } as Agent;
                    });
                  }}
                  onSave={handleSaveFeatures}
                />
                <div className="pt-6">
                  <Button onClick={handleSaveFeatures}>Retrain Agent</Button>
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
                  <Label
                    htmlFor="instructions"
                    className="block text-sm font-medium mb-1"
                  >
                    Instructions
                  </Label>
                  <Textarea
                    id="instructions"
                    value={selectedAgent?.instructions || ""}
                    onChange={(e) =>
                      handleInputChange("instructions", e.target.value)
                    }
                    className="min-h-[400px]"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveFeatures}>Retrain Agent</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Agent</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the agent and remove all of its data from our
                          servers.
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
        </Tabs>
      </div>

      <div className="w-1/3">
        <Playground selectedAgent={selectedAgent as any} />
      </div>
    </div>
  );
};

export default Workspace;
