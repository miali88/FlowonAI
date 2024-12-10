import React from 'react';
import { Button } from "@/components/ui/button";

interface NodeType {
  type: string;
  label: string;
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start of a workflow'
  },
  {
    type: 'action',
    label: 'Action',
    description: 'Perform a specific task'
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on conditions'
  },
  {
    type: 'output',
    label: 'Output',
    description: 'End of a workflow branch'
  }
];

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="absolute left-4 top-4 bg-background border rounded-lg p-4 w-64 space-y-2">
      <h3 className="font-semibold mb-4">Add Node</h3>
      {nodeTypes.map((nodeType) => (
        <div
          key={nodeType.type}
          draggable
          onDragStart={(event) => onDragStart(event, nodeType)}
          className="border rounded-md p-3 cursor-move hover:border-primary transition-colors bg-white"
        >
          <div className="font-medium text-sm">{nodeType.label}</div>
          <div className="text-xs text-muted-foreground">{nodeType.description}</div>
        </div>
      ))}
    </div>
  );
}