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

interface AgentFeaturesProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveFeatures: () => Promise<void>;
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

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    setSelectedAgent(prevAgent => ({
      ...prevAgent,
      features: {
        ...prevAgent?.features,
        [featureId]: checked ? {} : undefined
      }
    }));
  };

  const handleConfigureFeature = (featureId: string) => {
    setCurrentFeature(featureId);
    setIsConfigureDialogOpen(true);
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

  // Prospect settings handler
  const handleProspectSettingsChange = (field: keyof ProspectSettings, value: string | boolean) => {
    setProspectSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Features List */}
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

            {formFields.map((field, index) => (
              <div key={index} className="space-y-2">
                {/* Form field configuration UI */}
                {/* ... (Keep existing form field UI) ... */}
              </div>
            ))}
            <Button onClick={handleAddFormField} className="w-full">
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
