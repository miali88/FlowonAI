import React, { useState, useEffect } from 'react';
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
import { Agent } from './AgentCards';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  handleSaveFeatures: (features: any) => Promise<void>;
}

// First, let's define our purpose types explicitly
const PURPOSE_FEATURES = {
  "lead-generation": [
    { 
      id: "notifyOnInterest", 
      label: "Notify you on interest",
      description: "Get notified when prospects show interest in your product or service"
    },
    { 
      id: "form", 
      label: "Collect written information",
      description: "Specify what information you want to collect from prospects"
    }
  ],
  "prospecting": [
    { 
      id: "prospects", 
      label: "Prospect Management",
      description: "Manage and track prospects"
    }
  ],
  "question-answer": [
    { 
      id: "collectWrittenInformation", 
      label: "Information Collection",
      description: "Allow the agent to collect and store important information from conversations"
    }
  ],
  "customer-service": [
    { 
      id: "callTransfer", 
      label: "Call Transfer",
      description: "Allow the agent to transfer calls to human operators"
    }
  ],
  "appointment-booking": [
    { 
      id: "appointmentBooking", 
      label: "Calendar Integration",
      description: "Give your agent the ability to check calendar availability and book appointments"
    }
  ],
  "product-recommendation": [
    { 
      id: "collectWrittenInformation", 
      label: "Information Collection",
      description: "Allow the agent to collect product preferences"
    }
  ]
};

// Add this with the other interfaces at the top of the file
interface ProspectSettings {
  notifyOnInterest: boolean;
  email: string;
  sms: string;
  whatsapp: string;
}

export const AgentFeatures: React.FC<AgentFeaturesProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveFeatures,
}) => {
  // Simplified state
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);

  // Add local state to manage form fields
  const [localFeatures, setLocalFeatures] = useState(selectedAgent?.features || {});

  // Update local state when props change
  useEffect(() => {
    setLocalFeatures(selectedAgent?.features || {});
  }, [selectedAgent?.features]);

  const handleFeatureToggle = async (featureId: string) => {
    const currentFeature = localFeatures[featureId];
    const updatedFeatures = {
      ...localFeatures,
      [featureId]: {
        ...currentFeature,
        enabled: !currentFeature?.enabled
      }
    };

    // Update local state first
    setLocalFeatures(updatedFeatures);
    
    // If we're enabling a feature, open the configuration dialog
    if (!currentFeature?.enabled) {
      setCurrentFeature(featureId);
      setIsConfigureDialogOpen(true);
    }
    
    // Notify parent
    await handleSaveFeatures(updatedFeatures);
  };

  // When updating form fields, use local state first
  const handleFormFieldUpdate = (index: number, updates: any) => {
    const updatedFields = [...(localFeatures?.form?.fields || [])];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    
    const updatedFeatures = {
      ...localFeatures,
      form: {
        ...localFeatures?.form,
        fields: updatedFields
      }
    };

    // Update local state
    setLocalFeatures(updatedFeatures);
    // Then notify parent
    handleSaveFeatures(updatedFeatures);
  };

  const getFeaturesByPurposes = () => {
    const availableFeatures: any[] = [];
    const agentPurpose = selectedAgent?.agentPurpose;
    
    console.log('Current agent purpose:', agentPurpose); // Debug log
    console.log('Available features for purpose:', PURPOSE_FEATURES[agentPurpose as keyof typeof PURPOSE_FEATURES]); // Debug log
    
    if (agentPurpose) {
      const features = PURPOSE_FEATURES[agentPurpose as keyof typeof PURPOSE_FEATURES] || [];
      features.forEach(feature => {
        if (!availableFeatures.find(f => f.id === feature.id)) {
          availableFeatures.push(feature);
        }
      });
    }
    
    return availableFeatures;
  };

  // Add these state declarations at the beginning of the component
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

  // Add the FormField interface
  interface FormField {
    type: 'text' | 'email' | 'phone' | 'dropdown';
    label: string;
    options: string[];
  }

  // Add the handleAddFormField function
  const handleAddFormField = () => {
    const newField: FormField = {
      type: 'text',
      label: '',
      options: []
    };

    if (!selectedAgent) return;

    const updatedFeatures = {
      ...selectedAgent.features,
      form: {
        ...selectedAgent.features?.form,
        enabled: true,
        fields: [...(selectedAgent.features?.form?.fields || []), newField]
      }
    };

    setSelectedAgent({
      ...selectedAgent,
      features: updatedFeatures
    });
  };

  const handleProspectSettingsChange = (key: keyof ProspectSettings, value: any) => {
    setProspectSettings(prev => ({ ...prev, [key]: value }));
    
    const updatedFeatures = {
      ...localFeatures,
      prospects: {
        ...localFeatures.prospects,
        [key]: value
      }
    };
    handleSaveFeatures(updatedFeatures);
  };

  // Add this helper function to determine if a feature needs configuration
  const needsConfiguration = (featureId: string) => {
    return !['collectWrittenInformation'].includes(featureId);
  };

  return (
    <div className="space-y-6">
      {getFeaturesByPurposes().map((feature) => (
        <div key={feature.id} className="space-y-2 border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={feature.id} className="block text-sm font-medium">
                {feature.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Switch
              id={feature.id}
              checked={localFeatures[feature.id]?.enabled || false}
              onCheckedChange={() => handleFeatureToggle(feature.id)}
            />
          </div>

          {/* Only show Configure button if feature is enabled AND needs configuration */}
          {localFeatures[feature.id]?.enabled && needsConfiguration(feature.id) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentFeature(feature.id);
                setIsConfigureDialogOpen(true);
              }}
            >
              Configure
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      {/* Make sure Dialog stays open when feature is enabled */}
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
            <DialogTitle>{getFeatureTitle(currentFeature)}</DialogTitle>
            <DialogDescription>
              {getFeatureDescription(currentFeature)}
            </DialogDescription>
          </DialogHeader>
          {renderFeatureConfig()}
          <DialogFooter>
            <Button onClick={() => setIsConfigureDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Helper function to render feature-specific configuration
  function renderFeatureConfig() {
    switch (currentFeature) {
      case 'callTransfer':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryNumber" className="text-right">
                Primary Number
              </Label>
              <Input
                id="primaryNumber"
                value={callTransferConfig.primaryNumber}
                onChange={(e) => setCallTransferConfig(prev => ({
                  ...prev,
                  primaryNumber: e.target.value
                }))}
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
                onChange={(e) => setCallTransferConfig(prev => ({
                  ...prev,
                  secondaryNumber: e.target.value
                }))}
                className="col-span-3"
              />
            </div>
          </div>
        );

      case 'appointmentBooking':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nylasApiKey" className="text-right">
                Nylas API Key
              </Label>
              <Input
                id="nylasApiKey"
                value={appointmentBookingConfig.nylasApiKey}
                onChange={(e) => setAppointmentBookingConfig(prev => ({
                  ...prev,
                  nylasApiKey: e.target.value
                }))}
                className="col-span-3"
              />
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="grid gap-4 py-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="info">
                <AccordionTrigger>how to use</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">
                    Forms should only be used to collect personal data that requires exact spelling. 
                    All other types of information will be automatically extracted. The agent will:
                  </p>
                  <ul>
                    <li>- Request and verify this information from the caller</li>
                    <li>- Let the AI system capture other relevant details from the conversation</li>
                    <li>- Qualify a caller as a lead</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {(localFeatures?.form?.fields || []).map((field: FormField, index: number) => (
              <div key={index} className="space-y-2 border p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => {
                      handleFormFieldUpdate(index, { type: value as 'text' | 'email' | 'phone' | 'dropdown' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Field Label"
                    value={field.label}
                    onChange={(e) => {
                      handleFormFieldUpdate(index, { label: e.target.value });
                    }}
                  />
                </div>
              </div>
            ))}

            <Button 
              onClick={handleAddFormField} 
              className="w-full"
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </div>
        );

      case 'prospects':
        return (
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifyOnInterest"
                checked={prospectSettings.notifyOnInterest}
                onCheckedChange={(checked) => 
                  handleProspectSettingsChange('notifyOnInterest', checked as boolean)
                }
              />
              <Label htmlFor="notifyOnInterest">
                Notify when a prospect shows interest
              </Label>
            </div>
            
            {prospectSettings.notifyOnInterest && (
              <div className="space-y-4 mt-4">
                <Label>Notification Methods</Label>
                {['email', 'sms', 'whatsapp'].map((method) => (
                  <div key={method} className="space-y-2">
                    <Label htmlFor={`notify-${method}`}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Label>
                    <Input
                      id={`notify-${method}`}
                      placeholder={`Enter ${method} details`}
                      value={prospectSettings[method as keyof Omit<ProspectSettings, 'notifyOnInterest'>]}
                      onChange={(e) => handleProspectSettingsChange(
                        method as keyof ProspectSettings, 
                        e.target.value
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }
};

// Helper functions for feature descriptions and titles
function getFeatureDescription(featureId: string | null): string {
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
