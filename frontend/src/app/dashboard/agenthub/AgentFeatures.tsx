import React, { useState } from 'react';
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

interface AgentFeaturesProps {
  selectedAgent: {
    features: {
      notifyOnInterest: boolean;
      collectWrittenInformation: boolean;
      transferCallToHuman: boolean;
      bookCalendarSlot: boolean;
    };
    agentPurpose: string;
  };
  setSelectedAgent: (agent: any) => void;
  handleSaveFeatures: (features: any) => Promise<void>;
}

interface FormField {
  type: 'text' | 'email' | 'phone' | 'dropdown';
  label: string;
  options: string[];
}

interface ProspectSettings {
  notifyOnInterest: boolean;
  email: string;
  sms: string;
  whatsapp: string;
}

// Add a new interface for purpose-specific features
const PURPOSE_FEATURES = {
  "prospecting": [
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
  "appointment-booking": [
    { 
      id: "bookCalendarSlot", 
      label: "Calendar Integration",
      description: "Give your agent the ability to check calendar availability and book events on your calendar"
    },
    { 
      id: "appointmentBooking", 
      label: "Email Integration",
      description: "Link your email to allow calendar access"
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
      id: "transferCallToHuman", 
      label: "Call Transfer",
      description: "Allow the agent to transfer calls to human operators"
    },
    { 
      id: "callTransfer", 
      label: "Transfer Settings",
      description: "Configure call transfer options and phone numbers"
    }
  ]
};

export const AgentFeatures: React.FC<AgentFeaturesProps> = ({
  selectedAgent,
  setSelectedAgent,
  handleSaveFeatures,
}) => {
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  
  // Feature-specific states
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

  const handleFeatureToggle = (featureId: string) => {
    if (!selectedAgent) return;
    
    const currentFeatures = selectedAgent.features || {};
    const currentFeature = currentFeatures[featureId] || {};
    
    const updatedFeatures = {
      ...currentFeatures,
      [featureId]: {
        ...currentFeature,
        enabled: !currentFeature.enabled,
      }
    };
    
    setSelectedAgent({
      ...selectedAgent,
      features: updatedFeatures
    });
  };

  const handleConfigureFeature = (featureId: string) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    setCurrentFeature(featureId);
    setIsConfigureDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsConfigureDialogOpen(open);
    if (!open) {
      setCurrentFeature(null);
    }
  };

  const handleConfigureDone = () => {
    setIsConfigureDialogOpen(false);
    if (!selectedAgent) return;

    const featureConfigs = {
      callTransfer: callTransferConfig,
      appointmentBooking: appointmentBookingConfig,
      form: { fields: formFields },
      prospects: prospectSettings,
    };

    if (currentFeature) {
      setSelectedAgent({
        ...selectedAgent,
        features: {
          ...selectedAgent.features,
          [currentFeature]: featureConfigs[currentFeature as keyof typeof featureConfigs]
        }
      });
    }
    
    setCurrentFeature(null);
  };

  // Form-specific handlers
  const handleAddFormField = () => {
    // Create a new field with default values
    const newField: FormField = {
      type: 'text',
      label: '',
      options: []
    };

    // Update the agent's form fields
    const updatedFeatures = {
      ...selectedAgent.features,
      form: {
        ...selectedAgent.features?.form,
        enabled: true,
        fields: [...(selectedAgent.features?.form?.fields || []), newField]
      }
    };

    // Update the agent state
    setSelectedAgent({
      ...selectedAgent,
      features: updatedFeatures
    });
  };

  const handleRemoveFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleFormFieldChange = (index: number, field: Partial<FormField>) => {
    const newFields = [...formFields];
    newFields[index] = { ...newFields[index], ...field };
    setFormFields(newFields);
  };

  // Prospect settings handler
  const handleProspectSettingsChange = (field: keyof ProspectSettings, value: string | boolean) => {
    setProspectSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Features List - Now based on agent purpose */}
      {selectedAgent.agentPurpose && PURPOSE_FEATURES[selectedAgent.agentPurpose]?.map((feature) => (
        <div key={feature.id} className="space-y-2">
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
              checked={selectedAgent?.features?.[feature.id]?.enabled || false}
              onCheckedChange={() => handleFeatureToggle(feature.id)}
            />
          </div>
          
          {/* Show configure button for certain features when enabled */}
          {selectedAgent?.features?.[feature.id]?.enabled && 
           (feature.id === 'form' || feature.id === 'callTransfer' || 
            feature.id === 'appointmentBooking' || feature.id === 'prospects') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleConfigureFeature(feature.id)}
            >
              Configure
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      {/* Configuration Dialog */}
      <Dialog 
        open={isConfigureDialogOpen} 
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Configure {getFeatureTitle(currentFeature)}
            </DialogTitle>
            <DialogDescription>
              {getFeatureDescription(currentFeature)}
            </DialogDescription>
          </DialogHeader>

          {/* Feature-specific configuration forms */}
          {renderFeatureConfig()}

          <DialogFooter>
            <Button type="button" onClick={handleConfigureDone}>Done</Button>
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

            {(selectedAgent.features?.form?.fields || []).map((field, index) => (
              <div key={index} className="space-y-2 border p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <Label>Field Type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) => {
                      const updatedFields = [...(selectedAgent.features?.form?.fields || [])];
                      updatedFields[index] = { ...field, type: value as 'text' | 'email' | 'phone' | 'dropdown' };
                      setSelectedAgent({
                        ...selectedAgent,
                        features: {
                          ...selectedAgent.features,
                          form: {
                            ...selectedAgent.features?.form,
                            fields: updatedFields
                          }
                        }
                      });
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
                      const updatedFields = [...(selectedAgent.features?.form?.fields || [])];
                      updatedFields[index] = { ...field, label: e.target.value };
                      setSelectedAgent({
                        ...selectedAgent,
                        features: {
                          ...selectedAgent.features,
                          form: {
                            ...selectedAgent.features?.form,
                            fields: updatedFields
                          }
                        }
                      });
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
                      value={prospectSettings[method as keyof ProspectSettings]}
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
