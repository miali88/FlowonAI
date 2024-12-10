import { WorkflowPreset, Priority, ResponseFormat, FallbackBehavior, NodeType, BaseNodeData } from '../types';

const VERTICAL_SPACING = 120;  // Increased vertical gap between nodes
const HORIZONTAL_SPACING = 300; // Increased horizontal gap between parallel branches
const CENTER_X = 400;          // Center position for the main flow

const nodeStyle = {
  padding: 0,
  border: 'none',
  boxShadow: 'none',
  background: 'transparent',
};

const edgeStyle = {
  stroke: '#e5e7eb',
  strokeWidth: 2,
  strokeDasharray: '5,5',
};

// Helper function to create base node data
const createBaseNodeData = (label: string, type: NodeType): BaseNodeData => ({
  label,
  content: '',
  type,
  description: '',
  priority: 'medium' as Priority,
  status: 'active',
  assignee: '',
  dueDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [],
  attachments: [],
  comments: [],
  customFields: {},
  metadata: {},
  version: 1,
  parentId: null,
  childrenIds: [],
  actions: '',
  staticText: false,
  prompt: '',
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 1000,
  model: 'gpt-3.5-turbo',
  stopSequences: [],
  frequencyPenalty: 0,
  presencePenalty: 0,
  topP: 1,
  variables: [],
  functions: [],
  loopCondition: '',
  isGlobalNode: false,
  extractVariables: false,
  responseFormat: 'natural' as ResponseFormat,
  fallbackBehavior: 'retry' as FallbackBehavior,
  timeoutSeconds: 30
});

export const lawFirmPreset: WorkflowPreset = {
  nodes: [
    // Start node
    { 
      id: 'start', 
      type: 'default', // This could be 'start' if you create a specific start node type
      position: { x: CENTER_X, y: 0 }, 
      data: createBaseNodeData('Start', 'default'),
      style: nodeStyle 
    },
    
    // Authentication node
    { 
      id: 'auth', 
      type: 'default',
      position: { x: CENTER_X, y: VERTICAL_SPACING }, 
      data: {
        ...createBaseNodeData('Authentication', 'default'),
        prompt: 'Verify the user credentials and authorization level...',
        systemPrompt: 'You are a law firm authentication system...',
      },
      style: nodeStyle 
    },
    
    // Categorization node
    { 
      id: 'categorize', 
      type: 'knowledge', // Changed to knowledge type as it's making decisions
      position: { x: CENTER_X, y: VERTICAL_SPACING * 2 }, 
      data: {
        ...createBaseNodeData('Categorize Request', 'knowledge'),
        prompt: 'Analyze the incoming request and categorize it...',
      },
      style: nodeStyle 
    },
    
    // New client intake node
    { 
      id: 'new-client', 
      type: 'default',
      position: { x: CENTER_X - HORIZONTAL_SPACING, y: VERTICAL_SPACING * 3 }, 
      data: {
        ...createBaseNodeData('New Client Intake', 'default'),
        prompt: 'Process new client information...',
      },
      style: nodeStyle 
    },
    
    // Conflict check node
    { 
      id: 'conflict-check', 
      type: 'vector', // Changed to vector type as it's searching a database
      position: { x: CENTER_X - HORIZONTAL_SPACING, y: VERTICAL_SPACING * 4 }, 
      data: {
        ...createBaseNodeData('Conflict Check', 'vector'),
        prompt: 'Review client and case information against existing database...',
      },
      style: nodeStyle 
    },

    // Existing client node
    { 
      id: 'existing-client', 
      type: 'knowledge', // Changed to knowledge type for client handling
      position: { x: CENTER_X, y: VERTICAL_SPACING * 3 }, 
      data: {
        ...createBaseNodeData('Existing Client', 'knowledge'),
        prompt: 'Retrieve existing client information...',
      },
      style: nodeStyle 
    },

    // Case lookup node
    { 
      id: 'case-lookup', 
      type: 'vector', // Changed to vector type for database search
      position: { x: CENTER_X, y: VERTICAL_SPACING * 4 }, 
      data: {
        ...createBaseNodeData('Case Lookup', 'vector'),
        prompt: 'Search and retrieve case details...',
      },
      style: nodeStyle 
    },

    // Administrative node
    { 
      id: 'admin', 
      type: 'pathway', // Changed to pathway type for routing
      position: { x: CENTER_X + HORIZONTAL_SPACING, y: VERTICAL_SPACING * 3 }, 
      data: {
        ...createBaseNodeData('Administrative', 'pathway'),
        prompt: 'Process administrative requests...',
      },
      style: nodeStyle 
    },

    // Billing node
    { 
      id: 'billing', 
      type: 'tool', // Changed to tool type for billing operations
      position: { x: CENTER_X + HORIZONTAL_SPACING, y: VERTICAL_SPACING * 4 }, 
      data: {
        ...createBaseNodeData('Billing', 'tool'),
        prompt: 'Process billing requests...',
      },
      style: nodeStyle 
    },

    // Document action node
    { 
      id: 'document', 
      type: 'webhook', // Changed to webhook type for system integration
      position: { x: CENTER_X, y: VERTICAL_SPACING * 5 }, 
      data: {
        ...createBaseNodeData('Document Action', 'webhook'),
        prompt: 'Document all actions taken...',
      },
      style: nodeStyle 
    },

    // End node
    { 
      id: 'end', 
      type: 'end', // Changed to end type
      position: { x: CENTER_X, y: VERTICAL_SPACING * 6 }, 
      data: createBaseNodeData('End', 'end'),
      style: nodeStyle 
    },
  ],
  edges: [
    // Main flow
    { id: 'e-start-auth', source: 'start', target: 'auth', animated: true, style: edgeStyle },
    { id: 'e-auth-cat', source: 'auth', target: 'categorize', animated: true, style: edgeStyle },
    
    // New client branch
    { id: 'e-cat-new', source: 'categorize', target: 'new-client', animated: true, style: edgeStyle },
    { id: 'e-new-conflict', source: 'new-client', target: 'conflict-check', animated: true, style: edgeStyle },
    { id: 'e-conflict-doc', source: 'conflict-check', target: 'document', animated: true, style: edgeStyle },
    
    // Existing client branch
    { id: 'e-cat-existing', source: 'categorize', target: 'existing-client', animated: true, style: edgeStyle },
    { id: 'e-existing-case', source: 'existing-client', target: 'case-lookup', animated: true, style: edgeStyle },
    { id: 'e-case-doc', source: 'case-lookup', target: 'document', animated: true, style: edgeStyle },
    
    // Administrative branch
    { id: 'e-cat-admin', source: 'categorize', target: 'admin', animated: true, style: edgeStyle },
    { id: 'e-admin-billing', source: 'admin', target: 'billing', animated: true, style: edgeStyle },
    { id: 'e-billing-doc', source: 'billing', target: 'document', animated: true, style: edgeStyle },
    
    // Final step
    { id: 'e-doc-end', source: 'document', target: 'end', animated: true, style: edgeStyle },
  ],
}; 