import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { LANGUAGE_OPTIONS } from "./agentSettings";

import { Play } from "lucide-react";

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
import { AgentFeatures } from "./AgentFeatures";
import { MultiSelect } from "./multiselect_settings";
import Deploy from "./Deploy";
import Playground from "./Playground";
import { VOICE_OPTIONS } from "./agentSettings";
import Ui from "./Ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const api_base_url =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export interface Agent {
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
  features: {
    [key: string]: {
      [key: string]: any;
      enabled: boolean;
      number?: string;
    };
  };
  assigned_telephone?: string;
  agentPurpose?: string;
}

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

interface FormField {
  type: string;
  label: string;
  required?: boolean;
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
  [key: string]: string | number | boolean | FormField[] | undefined;
}

interface VoiceFeature extends FeatureConfig {
  provider?: string;
  id?: string;
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

interface SelectedAgent extends Agent {
  features: {
    [key: string]: {
      [key: string]: any;
      enabled: boolean;
      number?: string;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [appointmentBookingConfig, setAppointmentBookingConfig] = useState({
    nylasApiKey: selectedAgent?.features?.appointmentBooking?.nylasApiKey || "",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formFields, setFormFields] = useState<FormField[]>(
    (selectedAgent?.features?.form?.fields || []) as FormField[]
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prospectSettings, setProspectSettings] = useState<ProspectSettings>({
    notifyOnInterest: Boolean(
      selectedAgent?.features?.prospects?.notifyOnInterest
    ),
    email: String(selectedAgent?.features?.prospects?.email || ""),
    sms: String(selectedAgent?.features?.prospects?.sms || ""),
    whatsapp: String(selectedAgent?.features?.prospects?.whatsapp || ""),
  });

  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    selectedAgent?.language || "en-GB"
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(
    selectedAgent?.voice || ""
  );
  const [isPlaying, setIsPlaying] = useState(false);

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
    const voiceOption =
      selectedAgent?.language && selectedAgent.voice
        ? VOICE_OPTIONS[
            selectedAgent.language as keyof typeof VOICE_OPTIONS
          ]?.find((v) => v.id === selectedAgent.voice)
        : null;

    const currentFeatures = agentFeaturesRef.current?.getCurrentState() || {};

    console.log("Current Features:", currentFeatures);

    const agentToSave = {
      ...selectedAgent,
      assigned_telephone: selectedAgent.assigned_telephone,
      voiceProvider: voiceOption?.voiceProvider || undefined,
      features: currentFeatures,
      knowledgeBaseIds:
        Array.isArray(selectedAgent.dataSource) &&
        selectedAgent.dataSource.some(
          (item: { id: string }) => item.id === "all"
        )
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

  const handleDataSourceChange = (
    items: Array<{ id: string; title: string; data_type: string }>
  ) => {
    if (!selectedAgent) return;

    setSelectedAgent((prev: Agent | null) => {
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
        agentId: selectedAgent.id || "", // Provide empty string as fallback
        domain: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
      };
    }
  }, [selectedAgent]);

  // Add debug log
  useEffect(() => {
    console.log("Workspace Features:", features);
  }, [features]);

  const handleInputChange = (field: keyof Agent, value: any) => {
    setSelectedAgent((prev: Agent | null) => {
      if (!prev) return null;
      const updatedAgent: Agent = {
        ...prev,
        [field]: value,
      };
      return updatedAgent;
    });
  };

  const agentFeaturesRef = useRef<{ getCurrentState: () => any }>(null);

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

  const handleGeneratePrompt = () => {
    // TODO: Add API call to generate prompt
    if (selectedAgent && promptInput) {
      handleInputChange(
        "instructions",
        `I want an AI agent that ${promptInput}`
      );
    }
  };

  return (
    <div className="flex gap-6">
      <div className={`${activeTab === "ui" ? "w-full" : "w-2/3"}`}>
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
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="ui">UI</TabsTrigger>
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
                          typeof selectedAgent?.dataSource === "string" &&
                          selectedAgent.dataSource.trim().startsWith("[")
                            ? JSON.parse(selectedAgent.dataSource)
                            : Array.isArray(selectedAgent?.dataSource)
                            ? selectedAgent.dataSource
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

                  {/* Language Selection */}
                  {selectedAgent?.agentPurpose &&
                    (selectedAgent.agentPurpose === "telephone-agent" ||
                      selectedAgent.agentPurpose === "voice-web-agent") && (
                      <>
                        <div>
                          <Label htmlFor="language-select">Language</Label>
                          <Select
                            value={selectedLanguage}
                            onValueChange={(value) => {
                              setSelectedLanguage(value);
                              setSelectedVoice(""); // Reset voice when language changes
                              handleInputChange("language", value);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGE_OPTIONS.map((language) => (
                                <SelectItem
                                  key={language.id}
                                  value={language.id}
                                >
                                  {language.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Voice Selection */}
                        <div>
                          <Label htmlFor="voice-select">Voice</Label>
                          <div className="flex space-x-2">
                            <Select
                              value={selectedVoice}
                              onValueChange={(value) => {
                                setSelectedVoice(value);
                                handleInputChange("voice", value);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select voice" />
                              </SelectTrigger>
                              <SelectContent>
                                {VOICE_OPTIONS[
                                  selectedLanguage as keyof typeof VOICE_OPTIONS
                                ]?.map((voice) => (
                                  <SelectItem key={voice.id} value={voice.id}>
                                    {voice.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {selectedVoice && (
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={isPlaying}
                                onClick={async () => {
                                  try {
                                    const selectedVoiceData = VOICE_OPTIONS[
                                      selectedLanguage as keyof typeof VOICE_OPTIONS
                                    ]?.find((v) => v.id === selectedVoice);
                                    if (selectedVoiceData) {
                                      setIsPlaying(true);
                                      const audio = new Audio();
                                      audio.addEventListener("ended", () =>
                                        setIsPlaying(false)
                                      );
                                      audio.addEventListener("error", (e) => {
                                        console.error(
                                          "Error playing audio:",
                                          e
                                        );
                                        setIsPlaying(false);
                                      });
                                      audio.src = selectedVoiceData.file;
                                      await audio.load();
                                      await audio.play();
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error playing audio:",
                                      error
                                    );
                                    setIsPlaying(false);
                                  }
                                }}
                              >
                                <Play
                                  className={`h-4 w-4 ${
                                    isPlaying ? "text-muted" : ""
                                  }`}
                                />
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}

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
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
            />
          </TabsContent>
          <TabsContent value="ui">
            <Ui
              selectedAgent={selectedAgent as Agent}
              setSelectedAgent={setSelectedAgent}
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
                  selectedAgent={
                    {
                      ...selectedAgent,
                      features: cleanFeatures(selectedAgent?.features),
                    } as SelectedAgent
                  }
                  setSelectedAgent={(agent: SelectedAgent) => {
                    setSelectedAgent((prev: SelectedAgent | null) => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        features: cleanFeatures(agent.features),
                      } as Agent;
                    });
                  }}
                />
                <div className="pt-6">
                  <Button onClick={handleSaveFeatures}>Retrain Agent</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="prompt">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <Label
                      htmlFor="instructions"
                      className="block text-sm font-medium"
                    >
                      Instructions
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-sm bg-white text-black"
                        >
                          ✨create one for me✨
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Instructions</DialogTitle>
                          <DialogDescription>
                            Describe what you want your AI agent to do. For
                            example: &ldquo;an agent for my restaurant business
                            that can take orders, provide menu items...&rdquo;
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={promptInput}
                            onChange={(e) => setPromptInput(e.target.value)}
                            placeholder="I want an agent that..."
                            className="min-h-[100px]"
                          />
                          <Button
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `${api_base_url}/agents/completion`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      prompt: promptInput,
                                    }),
                                  }
                                );

                                if (!response.ok) {
                                  throw new Error(
                                    "Failed to generate instructions"
                                  );
                                }

                                const data = await response.json();
                                setSelectedAgent(
                                  (prev: SelectedAgent | null) => {
                                    if (!prev) return null;
                                    return {
                                      ...prev,
                                      instructions: data.instructions,
                                    };
                                  }
                                );
                                setPromptInput(""); // Clear the prompt input
                              } catch (error) {
                                console.error(
                                  "Error generating instructions:",
                                  error
                                );
                                // You might want to show an error toast here
                              }
                            }}
                          >
                            Generate Instructions
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Textarea
                    id="instructions"
                    value={selectedAgent?.instructions || ""}
                    onChange={(e) =>
                      setSelectedAgent((prev: SelectedAgent | null) => {
                        if (!prev) return null;
                        return { ...prev, instructions: e.target.value };
                      })
                    }
                    placeholder="Enter instructions for your agent..."
                    className="min-h-[200px]"
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

      {activeTab !== "ui" && (
        <div className="w-1/3">
          <Playground selectedAgent={selectedAgent as any} />
        </div>
      )}
    </div>
  );
};

export default Workspace;
