import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Phone,
  FileText, 
  PhoneForwarded,
  PhoneOff,
  Webhook,
  Clock,
  Database,
  GitBranch,
  Wrench,
  MousePointer,
  MessageSquare,
  Cloud,
  LucideIcon
} from 'lucide-react';
import { NodeType, NodeTypeDefinition } from '../types';

const nodeTypes: NodeTypeDefinition[] = [
  { icon: Phone, label: 'Default Node', type: 'default' },
  { icon: FileText, label: 'Knowledge Base', type: 'knowledge' },
  { icon: PhoneForwarded, label: 'Transfer Call', type: 'transfer' },
  { icon: PhoneOff, label: 'End Call', type: 'end' },
  { icon: Webhook, label: 'Webhook', type: 'webhook' },
  { icon: Clock, label: 'Wait for Response', type: 'wait' },
  { icon: Database, label: 'Vector DB', type: 'vector' },
  { icon: GitBranch, label: 'Transfer Pathway', type: 'pathway' },
  { icon: Wrench, label: 'Custom Tool', type: 'tool' },
  { icon: MousePointer, label: 'Press Button', type: 'button' },
  { icon: MessageSquare, label: 'SMS', type: 'sms' },
  { icon: Cloud, label: 'Amazon Connect', type: 'amazon' },
];

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nodeType: NodeType) => void;
}

export function AddNodeDialog({ isOpen, onClose, onAdd }: AddNodeDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNodes = nodeTypes.filter(node => 
    node.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Node</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Node"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {filteredNodes.map((node) => (
            <button
              key={node.type}
              className="flex flex-col items-center justify-center p-6 border rounded-lg hover:border-primary transition-colors text-center"
              onClick={() => onAdd(node.type as NodeType)}
            >
              <node.icon className="h-6 w-6 mb-2" />
              <span className="text-sm">{node.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 