import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from 'lucide-react';

interface WorkflowPreset {
  name: string;
  description: string;
}

const presets: WorkflowPreset[] = [
  {
    name: "Law Firm Call Handling",
    description: "Comprehensive workflow for managing law firm call interactions and routing."
  },
  // Add more presets here
];

interface NewWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEmpty: () => void;
  onSelectPreset: (presetName: string) => void;
}

export function NewWorkflowDialog({ 
  isOpen, 
  onClose, 
  onCreateEmpty, 
  onSelectPreset 
}: NewWorkflowDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center gap-2"
            onClick={onCreateEmpty}
          >
            <Plus className="h-6 w-6" />
            <div>
              <div className="font-semibold">Start from Scratch</div>
              <div className="text-sm text-muted-foreground">Create a new empty workflow</div>
            </div>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or choose a preset
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => onSelectPreset(preset.name)}
              >
                <FileText className="h-6 w-6" />
                <div>
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-sm text-muted-foreground">{preset.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 