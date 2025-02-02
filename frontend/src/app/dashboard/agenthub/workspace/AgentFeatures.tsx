import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Plus, Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Agent } from "./Workspace"; // Add this import
import { LANGUAGE_OPTIONS, VOICE_OPTIONS } from "./agentSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentFeature {
  id: string;
  enabled: boolean;
  [key: string]: any;
}

interface SelectedAgent extends Agent {
  features: {
    [key: string]: {
      enabled: boolean;
      number?: string;
      language?: string;
      voice?: string;
      [key: string]: any;
    };
  };
  formFields?: FormFields;
}

interface AgentFeaturesProps {
  selectedAgent: SelectedAgent | null;
  setSelectedAgent: (agent: SelectedAgent) => void;
}

// Add these interfaces at the top
interface FormFields {
  fields: {
    name: boolean;
    email: boolean;
    phone: boolean;
    company: boolean;
    jobTitle: boolean;
    custom: string[];
  };
}

// Define the SubFeature interface with optional hasConfiguration
interface SubFeature {
  id: string;
  label: string;
  description: string;
  hasConfiguration?: boolean; // Make this property optional
  defaultConfig?: any;
}

// Update the AGENT_FEATURES object to use SubFeature type
const AGENT_FEATURES = {
  purposes: {
    prospecting: {
      id: "prospecting",
      label: "Lead Generation",
      description: "Present forms to users and collect information",
      subFeatures: {
        notifyOnInterest: {
          id: "notifyOnInterest",
          label: "Notify on Interest",
          description:
            "Your registered email will be used to notify of new leads",
        } as SubFeature,
        configureFields: {
          id: "configureFields",
          label: "Configure fields",
          description: "",
          hasConfiguration: true,
          defaultConfig: {
            fields: {
              name: true,
              email: true,
              phone: false,
              company: false,
              jobTitle: false,
              custom: [],
            },
          },
        } as SubFeature,
      },
    },
    appointmentBooking: {
      id: "appointmentBooking",
      label: "Appointment Booking",
      description:
        "Create an agent that manages your calendar and books appointments",
      subFeatures: {},
    },
    callTransfer: {
      id: "callTransfer",
      label: "Call Transfer",
      description: "Enable the agent to transfer calls to another number",
      subFeatures: {
        transferToNumber: {
          id: "transferToNumber",
          label: "Transfer to Number",
          description:
            "Specify the number to which calls should be transferred, please include the country code",
          hasConfiguration: true,
          defaultConfig: {
            fields: {
              number: "",
              custom: [],
            },
          },
        },
      },
    },
  },
};

// Add feature mapping constant
const FEATURE_ID_MAP = {
  prospecting: "lead_gen",
  appointmentBooking: "app_booking",
  callTransfer: "call_transfer",
} as const;

// Add LocalFeatures interface
interface LocalFeatures {
  [key: string]: {
    enabled: boolean;
    number?: string;
    fields?: any[];
    notifyOnInterest?: boolean;
    email?: string;
    sms?: string;
    whatsapp?: string;
  };
}

export const AgentFeatures = forwardRef<
  { getCurrentState: () => any },
  AgentFeaturesProps
>(({ selectedAgent, setSelectedAgent }, ref) => {
  const [localFeatures, setLocalFeatures] = useState<LocalFeatures>({
    lead_gen: {
      enabled: false,
      notifyOnInterest: false,
    },
    app_booking: {
      enabled: false,
    },
    call_transfer: {
      enabled: false,
      number: "",
    },
  });

  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<string>("");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<FormFields | null>(null);
  const [tempConfig, setTempConfig] = useState<FormFields | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    selectedAgent?.features?.language?.value || "en-GB"
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(
    selectedAgent?.features?.voice?.value || ""
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFeatureToggle = (featureId: string) => {
    const backendId =
      FEATURE_ID_MAP[featureId as keyof typeof FEATURE_ID_MAP] || featureId;

    setLocalFeatures((prev) => ({
      ...prev,
      [backendId]: {
        ...prev[backendId],
        enabled: !prev[backendId]?.enabled,
      },
    }));

    if (setSelectedAgent && selectedAgent) {
      setSelectedAgent({
        ...selectedAgent,
        features: {
          ...selectedAgent.features,
          [backendId]: {
            ...selectedAgent.features[backendId],
            enabled: !selectedAgent.features[backendId]?.enabled,
          },
        },
      });
    }
  };

  // Add this function to check if a feature has configuration options
  const hasConfigurationContent = (featureId: string): boolean => {
    switch (featureId) {
      case "appointmentBooking":
        return true; // If appointment booking has configuration options
      case "callTransfer":
        return true; // If call transfer has configuration options
      // Add other cases as needed
      default:
        return false;
    }
  };

  // Add this function to handle configuration click
  const handleConfigureClick = (featureId: string) => {
    setCurrentFeature(featureId);
    setIsConfigureDialogOpen(true);
  };

  // Add this function to handle configuration
  const handleConfigureInformationCollection = (subFeature: any) => {
    const config = selectedAgent?.formFields || subFeature.defaultConfig;
    setCurrentConfig({
      ...config,
      fields: {
        ...config.fields,
        custom: config.fields.custom || [],
      },
    });
    setConfigDialogOpen(true);
  };

  // Update dialog close handler to save changes only on confirmation
  const handleConfigDialogClose = (save: boolean) => {
    if (save && currentConfig) {
      console.log("Saving configuration:", currentConfig);
      setTempConfig(currentConfig);

      // Log the selected fields
      const selectedFields = Object.entries(currentConfig.fields)
        .filter(([key, value]) => key !== "custom" && value === true)
        .map(([key]) => key);
      console.log("Selected fields:", selectedFields);
    }
    setConfigDialogOpen(false);
    setCurrentConfig(null);
  };

  // Expose the current state to parent
  useImperativeHandle(ref, () => ({
    getCurrentState: () => {
      return {
        app_booking: {
          enabled: localFeatures.app_booking.enabled,
        },
        call_transfer: {
          enabled: localFeatures.call_transfer.enabled,
          number: localFeatures.call_transfer.number,
        },
        lead_gen: {
          enabled: localFeatures.lead_gen.enabled,
          notifyOnInterest: localFeatures.lead_gen.notifyOnInterest,
        },
      };
    },
  }));

  // Update useEffect to sync with selectedAgent.features
  useEffect(() => {
    if (selectedAgent?.features) {
      setLocalFeatures({
        lead_gen: {
          enabled: selectedAgent.features.lead_gen?.enabled || false,
          notifyOnInterest:
            selectedAgent.features.lead_gen?.notifyOnInterest || false,
        },
        app_booking: {
          enabled: selectedAgent.features.app_booking?.enabled || false,
        },
        call_transfer: {
          enabled: selectedAgent.features.call_transfer?.enabled || false,
          number: selectedAgent.features.call_transfer?.number || "",
        },
      });
      setSelectedLanguage(selectedAgent.features.language?.value || "en-GB");
      setSelectedVoice(selectedAgent.features.voice?.value || "");
    }
  }, [selectedAgent?.features]);

  // Update the number input handler
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;

    setLocalFeatures((prev) => ({
      ...prev,
      call_transfer: {
        ...prev.call_transfer,
        enabled: true,
        number: newNumber,
      },
    }));

    if (setSelectedAgent && selectedAgent) {
      setSelectedAgent({
        ...selectedAgent,
        features: {
          ...selectedAgent.features,
          call_transfer: {
            ...selectedAgent.features?.call_transfer,
            enabled: true,
            number: newNumber,
          },
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing features content */}
      <div className="space-y-2">
        {Object.values(AGENT_FEATURES.purposes).map((purpose) => (
          <Accordion
            key={purpose.id}
            type="single"
            collapsible
            value={openItem}
            onValueChange={setOpenItem}
            className="w-full"
          >
            <AccordionItem value={purpose.id} className="border rounded-lg">
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{purpose.label}</h4>
                  <p className="text-xs text-muted-foreground">
                    {purpose.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={
                      FEATURE_ID_MAP[purpose.id as keyof typeof FEATURE_ID_MAP]
                    }
                    checked={
                      localFeatures[
                        FEATURE_ID_MAP[
                          purpose.id as keyof typeof FEATURE_ID_MAP
                        ]
                      ]?.enabled || false
                    }
                    onCheckedChange={() => handleFeatureToggle(purpose.id)}
                  />
                  {Object.keys(purpose.subFeatures).length > 0 &&
                    purpose.id !== "appointmentBooking" && (
                      <AccordionTrigger className="h-4 w-4 p-0" />
                    )}
                </div>
              </div>

              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {purpose.subFeatures &&
                    Object.values(purpose.subFeatures).map(
                      (subFeature: SubFeature) => (
                        <div
                          key={subFeature.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <Label htmlFor={subFeature.id} className="text-sm">
                              {subFeature.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {subFeature.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {purpose.id === "callTransfer" ? (
                              <Input
                                type="tel"
                                placeholder="+1234567890"
                                className="w-48"
                                value={localFeatures.call_transfer.number}
                                onChange={handleNumberChange}
                              />
                            ) : (subFeature as SubFeature).hasConfiguration ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs font-medium bg-background hover:bg-accent hover:text-accent-foreground"
                                onClick={() =>
                                  handleConfigureInformationCollection(
                                    subFeature
                                  )
                                }
                              >
                                Configure
                              </Button>
                            ) : (
                              <Switch
                                id={subFeature.id}
                                checked={
                                  localFeatures[subFeature.id]?.enabled || false
                                }
                                onCheckedChange={() =>
                                  handleFeatureToggle(subFeature.id)
                                }
                              />
                            )}
                          </div>
                        </div>
                      )
                    )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      {/* Language and Voice selectors moved below call transfer */}
      <div className="mt-8 space-y-6 border-t pt-6">
        <div className="space-y-2">
          <Label htmlFor="language-select">Language</Label>
          <Select
            value={selectedLanguage}
            onValueChange={(value) => {
              setSelectedLanguage(value);
              setSelectedVoice(""); // Reset voice when language changes

              if (setSelectedAgent && selectedAgent) {
                setSelectedAgent({
                  ...selectedAgent,
                  features: {
                    ...selectedAgent.features,
                    language: {
                      ...selectedAgent.features.language,
                      enabled: true,
                      value: value,
                    },
                  },
                });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((language) => (
                <SelectItem key={language.id} value={language.id}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice</Label>
          <div className="flex space-x-2">
            <Select
              value={selectedVoice}
              onValueChange={(value) => {
                setSelectedVoice(value);

                if (setSelectedAgent && selectedAgent) {
                  setSelectedAgent({
                    ...selectedAgent,
                    features: {
                      ...selectedAgent.features,
                      voice: {
                        ...selectedAgent.features.voice,
                        enabled: true,
                        value: value,
                      },
                    },
                  });
                }
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
                      // Add event listeners before setting the source
                      audio.addEventListener("ended", () =>
                        setIsPlaying(false)
                      );
                      audio.addEventListener("error", (e) => {
                        console.error("Error playing audio:", e);
                        setIsPlaying(false);
                      });
                      // Remove the /public prefix - files in public are served from root
                      audio.src = selectedVoiceData.file;
                      console.log("Playing audio from:", audio.src);
                      await audio.load();
                      // Play the audio
                      await audio.play();
                    }
                  } catch (error) {
                    console.error("Error playing audio:", error);
                    setIsPlaying(false);
                  }
                }}
              >
                <Play className={`h-4 w-4 ${isPlaying ? "text-muted" : ""}`} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Dialog */}
      {isConfigureDialogOpen && currentFeature && (
        <Dialog
          open={isConfigureDialogOpen}
          onOpenChange={(open) => {
            setIsConfigureDialogOpen(open);
            if (!open) {
              setCurrentFeature(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {currentFeature}</DialogTitle>
              <DialogDescription>
                Configure the settings for this feature
              </DialogDescription>
            </DialogHeader>
            {/* Add your configuration content here */}
            <DialogFooter>
              <Button onClick={() => setIsConfigureDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add the configuration dialog */}
      <Dialog
        open={configDialogOpen}
        onOpenChange={() => handleConfigDialogClose(false)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure Information Collection</DialogTitle>
            <DialogDescription>
              Select which information fields the agent should collect
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              {currentConfig && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="name"
                      checked={currentConfig.fields.name}
                      onCheckedChange={(checked) => {
                        setCurrentConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                fields: {
                                  ...prev.fields,
                                  name: checked as boolean,
                                },
                              }
                            : null
                        );
                      }}
                    />
                    <Label htmlFor="name">Name</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={currentConfig.fields.email}
                      onCheckedChange={(checked) => {
                        setCurrentConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                fields: {
                                  ...prev.fields,
                                  email: checked as boolean,
                                },
                              }
                            : null
                        );
                      }}
                    />
                    <Label htmlFor="email">Email</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phone"
                      checked={currentConfig.fields.phone}
                      onCheckedChange={(checked) => {
                        setCurrentConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                fields: {
                                  ...prev.fields,
                                  phone: checked as boolean,
                                },
                              }
                            : null
                        );
                      }}
                    />
                    <Label htmlFor="phone">Phone Number</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="company"
                      checked={currentConfig.fields.company}
                      onCheckedChange={(checked) => {
                        setCurrentConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                fields: {
                                  ...prev.fields,
                                  company: checked as boolean,
                                },
                              }
                            : null
                        );
                      }}
                    />
                    <Label htmlFor="company">Company</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jobTitle"
                      checked={currentConfig.fields.jobTitle}
                      onCheckedChange={(checked) => {
                        setCurrentConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                fields: {
                                  ...prev.fields,
                                  jobTitle: checked as boolean,
                                },
                              }
                            : null
                        );
                      }}
                    />
                    <Label htmlFor="jobTitle">Job Title</Label>
                  </div>

                  {/* Custom Fields Section */}
                  <div className="mt-4">
                    <Label>Custom Fields</Label>
                    <div className="space-y-2">
                      {currentConfig.fields.custom.map((field, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            value={field}
                            onChange={(e) => {
                              const newCustom = [
                                ...currentConfig.fields.custom,
                              ];
                              newCustom[index] = e.target.value;
                              setCurrentConfig((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      fields: {
                                        ...prev.fields,
                                        custom: newCustom,
                                      },
                                    }
                                  : null
                              );
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCustom =
                                currentConfig.fields.custom.filter(
                                  (_, i) => i !== index
                                );
                              setCurrentConfig((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      fields: {
                                        ...prev.fields,
                                        custom: newCustom,
                                      },
                                    }
                                  : null
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentConfig((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  fields: {
                                    ...prev.fields,
                                    custom: [...prev.fields.custom, ""],
                                  },
                                }
                              : null
                          );
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Field
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleConfigDialogClose(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

AgentFeatures.displayName = "AgentFeatures";

// Also remove any references in the helper functions
function getFeatureDescription(featureId: string | null): string {
  switch (featureId) {
    case "appointmentBooking":
      return "Enable the agent to schedule appointments and manage a calendar.";
    case "prospects":
      return "Be notified when a prospect shows interest.";
    default:
      return "";
  }
}

function getFeatureTitle(featureId: string | null): string {
  switch (featureId) {
    case "appointmentBooking":
      return "Appointment Booking";
    case "prospects":
      return "Prospects";
    default:
      return "";
  }
}
