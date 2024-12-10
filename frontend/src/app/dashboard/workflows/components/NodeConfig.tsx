import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ChevronDown } from 'lucide-react';

interface NodeConfigProps {
  isOpen: boolean;
  onClose: () => void;
  node: any;
  onUpdate: (nodeId: string, newData: any) => void;
  onDelete: () => void;
}

interface BaseNodeData {
  label: string;
  content: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actions: string;
  staticText: boolean;
  prompt: string;
  loopCondition: string;
  isGlobalNode: boolean;
  extractVariables: boolean;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  variables: {
    name: string;
    value: string;
  }[];
  responseFormat: 'natural' | 'structured' | 'json';
  fallbackBehavior: 'retry' | 'skip' | 'alternate';
  timeoutSeconds: number;
}

const NODE_TYPES = [
  { value: 'default', label: 'Default Node' },
  { value: 'knowledge', label: 'Knowledge Base' },
  { value: 'transfer', label: 'Transfer Call' },
  { value: 'end', label: 'End Call' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'wait', label: 'Wait for Response' },
  { value: 'vector', label: 'Vector DB' },
  { value: 'pathway', label: 'Transfer Pathway' },
  { value: 'tool', label: 'Custom Tool' },
  { value: 'button', label: 'Press Button' },
  { value: 'sms', label: 'SMS' },
  { value: 'amazon', label: 'Amazon Connect' }
];

export function NodeConfig({ isOpen, onClose, node, onUpdate, onDelete }: NodeConfigProps) {
  const [data, setData] = useState<BaseNodeData>(node.data);

  const handleUpdate = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(node.id, newData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Node Type</Label>
              <Select
                value={node.type}
                onValueChange={(value) => {
                  onUpdate(node.id, { ...data, type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Node Name</Label>
              <Input
                value={data.label}
                onChange={(e) => handleUpdate('label', e.target.value)}
                placeholder="Enter node name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={data.description}
                onChange={(e) => handleUpdate('description', e.target.value)}
                placeholder="Describe the node's purpose"
              />
            </div>
          </div>

          {/* Response Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.staticText}
                onCheckedChange={(checked) => handleUpdate('staticText', checked)}
                id="static-text"
              />
              <Label>Static Text Response</Label>
            </div>

            {!data.staticText && (
              <div className="space-y-2">
                <Label>AI Prompt</Label>
                <Textarea
                  value={data.prompt}
                  onChange={(e) => handleUpdate('prompt', e.target.value)}
                  placeholder="Enter the prompt for AI response"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={data.systemPrompt}
                onChange={(e) => handleUpdate('systemPrompt', e.target.value)}
                placeholder="Enter system-level instructions"
              />
            </div>
          </div>

          {/* Flow Control */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Loop Condition</Label>
              <Input
                value={data.loopCondition}
                onChange={(e) => handleUpdate('loopCondition', e.target.value)}
                placeholder="Condition for node loop"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={data.isGlobalNode}
                onCheckedChange={(checked) => handleUpdate('isGlobalNode', checked)}
              />
              <Label>Global Node</Label>
            </div>
          </div>

          {/* Advanced Settings */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between">
                Advanced Settings
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature ({data.temperature})</Label>
                  <Slider
                    value={[data.temperature]}
                    onValueChange={([value]) => handleUpdate('temperature', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={data.maxTokens}
                    onChange={(e) => handleUpdate('maxTokens', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Response Format</Label>
                  <Select
                    value={data.responseFormat}
                    onValueChange={(value) => handleUpdate('responseFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural Language</SelectItem>
                      <SelectItem value="structured">Structured</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={data.timeoutSeconds}
                    onChange={(e) => handleUpdate('timeoutSeconds', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={onDelete}>
              Delete Node
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 