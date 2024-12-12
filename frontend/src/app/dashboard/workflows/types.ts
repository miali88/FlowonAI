import { Node, Edge, NodeProps } from '@xyflow/react';
import { LucideIcon } from 'lucide-react';

export type Priority = 'low' | 'medium' | 'high';
export type ResponseFormat = 'natural' | 'structured' | 'json';
export type FallbackBehavior = 'retry' | 'skip' | 'alternate';

// Add NodeTypeDefinition interface
export interface NodeTypeDefinition {
  icon: LucideIcon;
  label: string;
  type: NodeType;
}

// Define possible node types/
export type NodeType = 
  | 'start'
  | 'default'
  | 'response'
  | 'knowledge_base'
  | 'transfer_call'
  | 'end_call'
  | 'webhook'
  | 'wait'
  | 'transfer_pathway'
  | 'custom_tool'
  | 'button'
  | 'sms'
  | 'amazon_connect'
  | 'pathway'
  | 'tool'
  | 'amazon'
  | 'authentication'
  | 'decision'
  | 'process';

// Define the data structure that will be stored in the node
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  content: string;
  type: NodeType;
  description: string;
  priority: Priority;
  actions: string;
  staticText: boolean;
  prompt: string;
  systemPrompt: string;
  loopCondition: string;
  isGlobalNode: boolean;
  extractVariables: boolean;
  temperature: number;
  maxTokens: number;
  variables: string[];
  responseFormat: ResponseFormat;
  fallbackBehavior: FallbackBehavior;
  timeoutSeconds: number;
}

// Define the node interface explicitly
export interface WorkflowNode extends Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: BaseNodeData;
  style?: Record<string, unknown>;
  selected?: boolean;
}

// Edge type
export interface EdgeData extends Record<string, unknown> {
  label?: string;
}

export type WorkflowEdge = Edge<EdgeData>;

// Other interfaces
export interface WorkflowPreset {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  name?: string;
  description?: string;
}

export interface Presets {
  [key: string]: WorkflowPreset;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  lastModified: string;
  assignedAgentId?: string;
}

export interface NodeTypeData {
  type: NodeType;
  label: string;
  description: string;
}

// Use WorkflowNode instead of BaseNodeData for NodeProps
export type CustomNodeProps = {
  data: BaseNodeData;
  selected?: boolean;
  id: string;
  type: NodeType;
  position: { x: number; y: number };
};

// Add configurations from interface.ts
export const nodeStyle = {
  padding: '10px',
  borderRadius: '8px',
  minWidth: '150px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  fontSize: '12px',
};

export const edgeStyle = {
  stroke: '#e5e7eb',
  strokeWidth: 2,
  strokeDasharray: '5,5',
};

export const flowStyles = {
  background: '#000',
  width: '100%',
  height: '100%',
};

export const FLOW_CONFIG = {
  defaultEdgeOptions: {
    style: { stroke: '#e5e7eb', strokeWidth: 2 },
    animated: true,
    type: 'smoothstep',
  },
  fitViewOptions: { 
    padding: 0.2,
    minZoom: 0.5,
    maxZoom: 1.5
  },
};

export const LAYOUT_CONFIG = {
  VERTICAL_SPACING: 120,
  HORIZONTAL_SPACING: 300,
  CENTER_X: 400,
};

export const BACKGROUND_CONFIG = {
  variant: 'dots' as const,
  gap: 12,
  size: 1,
  color: '#ffffff10',
};

export const CONTROLS_STYLE = {
  className: "bg-white/10 rounded-lg",
  showInteractive: false,
};

export const MINIMAP_STYLE = {
  nodeColor: '#fff',
  maskColor: '#00000050',
  style: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
};

export const nodeStyles = {
  knowledge_base: { backgroundColor: '#1e3a8a' },
  transfer_call: { backgroundColor: '#581c87' },
  end_call: { backgroundColor: '#7f1d1d' },
  webhook: { backgroundColor: '#064e3b' },
  wait: { backgroundColor: '#854d0e' },
  transfer_pathway: { 
    backgroundColor: '#312e81',
    borderWidth: '2px',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  custom_tool: { 
    backgroundColor: '#0e7490',  // Changed to a distinctive cyan color
    borderWidth: '2px',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  button: { backgroundColor: '#9a3412' },
  sms: { backgroundColor: '#831843' },
  amazon_connect: { backgroundColor: '#78350f' },
}; 

export interface Agent {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}