import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Phone,
  PhoneOff,
  Webhook,
  Clock,
  GitFork,
  Wrench,
  MessageSquare,
  Cloud,
  Play,
  Flag
} from 'lucide-react';
import { NodeType, NodeTypeDefinition } from '../types';

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: NodeType) => void;
}

const nodeTypes: NodeTypeDefinition[] = [
  { icon: Play, label: 'Start', type: 'start' },
  { icon: Database, label: 'Knowledge Base', type: 'knowledge_base' },
  { icon: Phone, label: 'Transfer Call', type: 'transfer_call' },
  { icon: PhoneOff, label: 'End Call', type: 'end_call' },
  { icon: Webhook, label: 'Webhook', type: 'webhook' },
  { icon: Clock, label: 'Wait', type: 'wait' },
  { icon: GitFork, label: 'Transfer Pathway', type: 'transfer_pathway' },
  { icon: Wrench, label: 'Custom Tool', type: 'custom_tool' },
  { icon: MessageSquare, label: 'Button', type: 'button' },
  { icon: MessageSquare, label: 'SMS', type: 'sms' },
  { icon: Cloud, label: 'Amazon Connect', type: 'amazon_connect' },
  { icon: Flag, label: 'Response', type: 'response' }
];

export function AddNodeDialog({ isOpen, onClose, onAdd }: AddNodeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <Button
                key={nodeType.type}
                variant="outline"
                className="flex items-center gap-2 h-auto p-4 justify-start"
                onClick={() => {
                  onAdd(nodeType.type);
                  onClose();
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{nodeType.label}</span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
} 