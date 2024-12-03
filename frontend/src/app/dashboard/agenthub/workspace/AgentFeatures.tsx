import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Plus } from "lucide-react";
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

interface AgentFeature {
  id: string;
  enabled: boolean;
  [key: string]: any;
}

interface SelectedAgent {
  id: string;
  features: {
    [key: string]: AgentFeature;
  };
  agentPurposes: string[];
}

interface AgentFeaturesProps {
  selectedAgent: {
    features: string[];
    formFields?: FormFields;
  } | null;
  setSelectedAgent: (agent: any) => void;
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

// Update the AGENT_FEATURES object to include configuration
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
          description: "Your registered email will be used to notify of new leads",
        },
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
              custom: []
            }
          }
        }
      }
    },
    appointmentBooking: {
      id: "appointmentBooking",
      label: "Appointment Booking",
      description: "Create an agent that manages your calendar and books appointments",
      subFeatures: {
        calendar: {
          id: "calendar",
          label: "Calendar Management",
          description: "Manage and schedule appointments"
        }
      }
    },
    callTransfer: {
      id: "callTransfer",
      label: "Call Transfer",
      description: "Enable the agent to transfer calls to another number",
      subFeatures: {
        transferToNumber: {
          id: "transferToNumber",
          label: "Transfer to Number",
          description: "Specify the number to which calls should be transferred, please include the country code",
          hasConfiguration: true,
          defaultConfig: {
            fields: {
              number: "",
              custom: []
            }
          }
        }
      }
    }
  }
};

// Add feature mapping constant
const FEATURE_ID_MAP = {
  'prospecting': 'lead_gen',
  'appointmentBooking': 'app_booking',
  'callTransfer': 'call_transfer'
};

export const AgentFeatures = forwardRef<
  { getCurrentState: () => any },
  AgentFeaturesProps
>(({ selectedAgent, setSelectedAgent }, ref) => {
  const [localFeatures, setLocalFeatures] = useState({
    callTransfer: {
      enabled: selectedAgent?.features?.callTransfer?.enabled || false,
      number: selectedAgent?.features?.callTransfer?.number || '',
    },
    appointmentBooking: {
      enabled: false,
    },
    form: {
      enabled: false,
      fields: [],
    },
    prospects: {
      enabled: false,
      notifyOnInterest: false,
      email: '',
      sms: '',
      whatsapp: '',
    }
  });

  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<FormFields | null>(null);
  const [tempConfig, setTempConfig] = useState<FormFields | null>(null);

  const handleFeatureToggle = (featureId: string) => {
    setLocalFeatures(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        enabled: !prev[featureId]?.enabled || false
      }
    }));

    if (setSelectedAgent && selectedAgent) {
      const updatedFeatures = {
        ...selectedAgent.features,
        [featureId]: {
          ...selectedAgent.features?.[featureId],
          enabled: !localFeatures[featureId]?.enabled || false,
          number: localFeatures[featureId]?.number
        }
      };
      setSelectedAgent({
        ...selectedAgent,
        features: updatedFeatures
      });
    }
  };

  // Add this function to check if a feature has configuration options
  const hasConfigurationContent = (featureId: string): boolean => {
    switch (featureId) {
      case "prospecting":
        return true; // If prospecting has configuration options
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
        custom: config.fields.custom || []
      }
    });
    setConfigDialogOpen(true);
  };

  // Update dialog close handler to save changes only on confirmation
  const handleConfigDialogClose = (save: boolean) => {
    if (save && currentConfig) {
      console.log('Saving configuration:', currentConfig);
      setTempConfig(currentConfig);
      
      // Log the selected fields
      const selectedFields = Object.entries(currentConfig.fields)
        .filter(([key, value]) => key !== 'custom' && value === true)
        .map(([key]) => key);
      console.log('Selected fields:', selectedFields);
    }
    setConfigDialogOpen(false);
    setCurrentConfig(null);
  };

  // Expose the current state to parent
  useImperativeHandle(ref, () => ({
    getCurrentState: () => {
      // Only include enabled features with their configurations
      const enabledFeatures = Object.entries(localFeatures).reduce((acc, [key, value]) => {
        if (value.enabled) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      return enabledFeatures;
    }
  }));

  // Add effect to sync with parent
  useEffect(() => {
    if (selectedAgent?.features?.callTransfer) {
      setLocalFeatures(prev => ({
        ...prev,
        callTransfer: {
          ...prev.callTransfer,
          number: selectedAgent.features.callTransfer.number || '',
          enabled: selectedAgent.features.callTransfer.enabled || false
        }
      }));
    }
  }, [selectedAgent?.features?.callTransfer]);

  // Update the number input handler
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    
    setLocalFeatures(prev => ({
      ...prev,
      callTransfer: {
        ...prev.callTransfer,
        enabled: true,
        number: newNumber
      }
    }));

    if (setSelectedAgent && selectedAgent) {
      setSelectedAgent({
        ...selectedAgent,
        features: {
          ...selectedAgent.features,
          callTransfer: {
            ...selectedAgent.features?.callTransfer,
            enabled: true,
            number: newNumber
          }
        }
      });
    }
  };

  return (
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
                  id={purpose.id}
                  checked={localFeatures[purpose.id]?.enabled || false}
                  onCheckedChange={() => handleFeatureToggle(purpose.id)}
                />
                <AccordionTrigger className="h-4 w-4 p-0" />
              </div>
            </div>

            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {purpose.subFeatures && Object.values(purpose.subFeatures).map((subFeature) => (
                  <div key={subFeature.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor={subFeature.id} className="text-sm">
                        {subFeature.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {subFeature.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {purpose.id === 'callTransfer' ? (
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          className="w-48"
                          value={localFeatures.callTransfer.number}
                          onChange={handleNumberChange}
                        />
                      ) : subFeature.hasConfiguration ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-3 text-xs font-medium bg-background hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleConfigureInformationCollection(subFeature)}
                        >
                          Configure
                        </Button>
                      ) : (
                        <Switch
                          id={subFeature.id}
                          checked={localFeatures[subFeature.id]?.enabled || false}
                          onCheckedChange={() => handleFeatureToggle(subFeature.id)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

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
      <Dialog open={configDialogOpen} onOpenChange={() => handleConfigDialogClose(false)}>
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
                        setCurrentConfig(prev => prev ? {
                          ...prev,
                          fields: { ...prev.fields, name: checked as boolean }
                        } : null);
                      }}
                    />
                    <Label htmlFor="name">Name</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={currentConfig.fields.email}
                      onCheckedChange={(checked) => {
                        setCurrentConfig(prev => prev ? {
                          ...prev,
                          fields: { ...prev.fields, email: checked as boolean }
                        } : null);
                      }}
                    />
                    <Label htmlFor="email">Email</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phone"
                      checked={currentConfig.fields.phone}
                      onCheckedChange={(checked) => {
                        setCurrentConfig(prev => prev ? {
                          ...prev,
                          fields: { ...prev.fields, phone: checked as boolean }
                        } : null);
                      }}
                    />
                    <Label htmlFor="phone">Phone Number</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="company"
                      checked={currentConfig.fields.company}
                      onCheckedChange={(checked) => {
                        setCurrentConfig(prev => prev ? {
                          ...prev,
                          fields: { ...prev.fields, company: checked as boolean }
                        } : null);
                      }}
                    />
                    <Label htmlFor="company">Company</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jobTitle"
                      checked={currentConfig.fields.jobTitle}
                      onCheckedChange={(checked) => {
                        setCurrentConfig(prev => prev ? {
                          ...prev,
                          fields: { ...prev.fields, jobTitle: checked as boolean }
                        } : null);
                      }}
                    />
                    <Label htmlFor="jobTitle">Job Title</Label>
                  </div>

                  {/* Custom Fields Section */}
                  <div className="mt-4">
                    <Label>Custom Fields</Label>
                    <div className="space-y-2">
                      {currentConfig.fields.custom.map((field, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={field}
                            onChange={(e) => {
                              const newCustom = [...currentConfig.fields.custom];
                              newCustom[index] = e.target.value;
                              setCurrentConfig(prev => prev ? {
                                ...prev,
                                fields: { ...prev.fields, custom: newCustom }
                              } : null);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCustom = currentConfig.fields.custom.filter((_, i) => i !== index);
                              setCurrentConfig(prev => prev ? {
                                ...prev,
                                fields: { ...prev.fields, custom: newCustom }
                              } : null);
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
                          setCurrentConfig(prev => prev ? {
                            ...prev,
                            fields: {
                              ...prev.fields,
                              custom: [...prev.fields.custom, '']
                            }
                          } : null);
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
