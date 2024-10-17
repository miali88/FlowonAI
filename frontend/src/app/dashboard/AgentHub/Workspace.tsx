import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBotMini from './ChatBotMini';
import { Agent } from './AgentCards';
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WorkspaceProps {
  selectedAgent: Agent | null;
  setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
  handleSaveChanges: () => Promise<void>;
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
    primaryNumber: '',
    secondaryNumber: '',
  });
  const [appointmentBookingConfig, setAppointmentBookingConfig] = useState({
    nylasApiKey: '',
  });
  const [formFields, setFormFields] = useState<FormField[]>([]);

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

  const handleSaveConfig = () => {
    if (currentFeature === 'callTransfer') {
      setSelectedAgent({
        ...selectedAgent,
        features: {
          ...selectedAgent?.features,
          callTransfer: {
            ...selectedAgent?.features?.callTransfer,
            ...callTransferConfig,
          },
        },
      });
    } else if (currentFeature === 'appointmentBooking') {
      setSelectedAgent({
        ...selectedAgent,
        features: {
          ...selectedAgent?.features,
          appointmentBooking: {
            ...selectedAgent?.features?.appointmentBooking,
            ...appointmentBookingConfig,
          },
        },
      });
    } else if (currentFeature === 'form') {
      setSelectedAgent({
        ...selectedAgent,
        features: {
          ...selectedAgent?.features,
          form: {
            ...selectedAgent?.features?.form,
            fields: formFields,
          },
        },
      });
    }
    setIsConfigureDialogOpen(false);
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 h-12">
        <TabsTrigger value="preview">Playground</TabsTrigger>
        <TabsTrigger value="edit">Settings</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="ui">UI</TabsTrigger>
        <TabsTrigger value="embed">Embed</TabsTrigger>
        <TabsTrigger value="share">Share</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
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
            <Label htmlFor="agentPurpose" className="block text-sm font-medium mb-1">Agent Purpose</Label>
            <Select 
            value={selectedAgent?.agentPurpose}
            onValueChange={(value) => setSelectedAgent({...selectedAgent, agentPurpose: value})}
            >
            <SelectTrigger>
                <SelectValue placeholder="Select agent purpose" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="prospecting">Prospecting</SelectItem>
                <SelectItem value="question-answer">Question & Answer</SelectItem>
                <SelectItem value="customer-service">Customer Service</SelectItem>
                <SelectItem value="product-recommendation">Product Recommendation</SelectItem>
            </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="dataSource" className="block text-sm font-medium mb-1">Data Source</Label>
            <Select 
            value={selectedAgent?.dataSource}
            onValueChange={(value) => setSelectedAgent({...selectedAgent, dataSource: value})}
            >
            <SelectTrigger>
                <SelectValue placeholder="Select data source" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="tagged">Items with tag...</SelectItem>
                <SelectItem value="natural-language">Describe using natural language</SelectItem>
            </SelectContent>
            </Select>
        </div>
        {selectedAgent?.dataSource === "tagged" && (
            <div>
            <Label htmlFor="tag" className="block text-sm font-medium mb-1">Tag</Label>
            <Input 
                id="tag"
                value={selectedAgent.tag || ''} 
                onChange={(e) => setSelectedAgent({...selectedAgent, tag: e.target.value})}
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
            <Label htmlFor="voice" className="block text-sm font-medium mb-1">Voice</Label>
            <Input 
            id="voice"
            value={selectedAgent?.voice || ''} 
            onChange={(e) => setSelectedAgent({...selectedAgent, voice: e.target.value})}
            />
        </div>
        <div>
            <Label htmlFor="instructions" className="block text-sm font-medium mb-1">Instructions</Label>
            <Textarea 
            id="instructions"
            value={selectedAgent?.instructions || ''} 
            onChange={(e) => setSelectedAgent({...selectedAgent, instructions: e.target.value})}
            className="min-h-[400px]"
            />
        </div>
        <div className="flex space-x-2">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
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
        </div>
      </TabsContent>
      <TabsContent value="ui">
        <div className="space-y-4">
          <p>UI customization options for the agent will be shown here.</p>
          {/* Add UI customization fields here */}
        </div>
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
      <TabsContent value="features">
        <Card>
          <CardHeader>
            <CardTitle>Additional Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { id: "callTransfer", label: "Call Transfer" },
                { id: "appointmentBooking", label: "Appointment Booking" },
                { id: "form", label: "Form" },
              ].map((feature) => (
                <div key={feature.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={feature.id}>{feature.label}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={feature.id}
                        checked={selectedAgent?.features?.[feature.id] || false}
                        onCheckedChange={(checked) => 
                          setSelectedAgent({
                            ...selectedAgent, 
                            features: {...selectedAgent?.features, [feature.id]: checked}
                          })
                        }
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
          </CardContent>
        </Card>
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
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSaveConfig}>Save changes</Button>
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
      return "Let the agent collect structured data through customisable forms.";
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
    default:
      return "";
  }
}
