import { WorkflowPreset, Priority, ResponseFormat, FallbackBehavior, NodeType, BaseNodeData } from '../types';

const VERTICAL_SPACING = 150;
const HORIZONTAL_SPACING = 350;
const CENTER_X = 500;

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
    // Initial Greeting
    {
      id: 'start',
      type: 'start',
      position: { x: CENTER_X, y: 0 },
      data: {
        ...createBaseNodeData('Start Call', 'start'),
        prompt: 'Greet the caller professionally and identify yourself as a legal assistant from [Law Firm Name]. Ask how you can help them today.',
        description: 'Initial greeting and purpose identification'
      },
      style: nodeStyle
    },

    // Authentication Flow
    {
      id: 'authentication',
      type: 'default',
      position: { x: CENTER_X, y: VERTICAL_SPACING },
      data: {
        ...createBaseNodeData('Caller Authentication', 'default'),
        prompt: 'Ask for the caller\'s name and any existing case number or client ID. For new callers, explain our initial verification process.',
        description: 'Verify caller identity',
        priority: 'high'
      },
      style: nodeStyle
    },

    // Call Classification with Response Options
    {
      id: 'call_category',
      type: 'transfer_pathway',
      position: { x: CENTER_X, y: VERTICAL_SPACING * 2 },
      data: {
        ...createBaseNodeData('Call Category Classification', 'transfer_pathway'),
        prompt: 'Based on the caller\'s response, determine if they are:\n1. A potential new client\n2. An existing client\n3. Calling about administrative matters',
        description: 'Identify caller type and needs'
      },
      style: nodeStyle
    },

    // New Client Branch
    {
      id: 'new_client',
      type: 'default',
      position: { x: CENTER_X - HORIZONTAL_SPACING, y: VERTICAL_SPACING * 3 },
      data: {
        ...createBaseNodeData('New Client Inquiry', 'default'),
        prompt: 'Ask about the nature of their legal matter. Gather key details:\n- Type of legal issue\n- Timeline of events\n- Urgency of the matter\n- Previous legal representation',
        description: 'Initial case assessment',
        priority: 'high'
      },
      style: nodeStyle
    },

    // Conflict Check
    {
      id: 'conflict_check',
      type: 'custom_tool',
      position: { x: CENTER_X - HORIZONTAL_SPACING, y: VERTICAL_SPACING * 4 },
      data: {
        ...createBaseNodeData('Conflict Check', 'custom_tool'),
        prompt: 'Run conflict check using provided information. If clear, proceed to scheduling. If conflict found, explain we cannot proceed and provide referral options.',
        description: 'Verify no conflicts of interest'
      },
      style: nodeStyle
    },

    // Consultation Scheduling
    {
      id: 'consultation_scheduling',
      type: 'custom_tool',
      position: { x: CENTER_X - HORIZONTAL_SPACING, y: VERTICAL_SPACING * 5 },
      data: {
        ...createBaseNodeData('Schedule Consultation', 'custom_tool'),
        prompt: 'Offer available consultation times. Explain:\n- Initial consultation process\n- Duration and cost\n- Required documents\n- Meeting format (in-person/virtual)',
        description: 'Book initial consultation'
      },
      style: nodeStyle
    },

    // Existing Client Support
    {
      id: 'existing_client',
      type: 'default',
      position: { x: CENTER_X, y: VERTICAL_SPACING * 3 },
      data: {
        ...createBaseNodeData('Existing Client Support', 'default'),
        prompt: 'Verify case details and ask about specific needs:\n- Case status update\n- Document request\n- Meeting with attorney\n- Other concerns',
        description: 'Handle current client needs'
      },
      style: nodeStyle
    },

    // Case Management
    {
      id: 'case_management',
      type: 'custom_tool',
      position: { x: CENTER_X, y: VERTICAL_SPACING * 4 },
      data: {
        ...createBaseNodeData('Case Management', 'custom_tool'),
        prompt: 'Access case management system to provide:\n- Current case status\n- Recent updates\n- Upcoming deadlines\n- Pending actions',
        description: 'Provide case updates'
      },
      style: nodeStyle
    },

    // Document Handling
    {
      id: 'document_handling',
      type: 'custom_tool',
      position: { x: CENTER_X, y: VERTICAL_SPACING * 5 },
      data: {
        ...createBaseNodeData('Document Handling', 'custom_tool'),
        prompt: 'Process document requests:\n- Verify authorization\n- Locate requested documents\n- Explain delivery options\n- Confirm delivery preferences',
        description: 'Handle document requests'
      },
      style: nodeStyle
    },

    // Administrative Branch
    {
      id: 'administrative',
      type: 'default',
      position: { x: CENTER_X + HORIZONTAL_SPACING, y: VERTICAL_SPACING * 3 },
      data: {
        ...createBaseNodeData('Administrative Matters', 'default'),
        prompt: 'Handle administrative inquiries:\n- Billing questions\n- Office hours\n- Location information\n- General policies',
        description: 'Address administrative questions'
      },
      style: nodeStyle
    },

    // Documentation
    {
      id: 'documentation',
      type: 'default',
      position: { x: CENTER_X, y: VERTICAL_SPACING * 6 },
      data: {
        ...createBaseNodeData('Call Documentation', 'default'),
        prompt: 'Summarize the call:\n- Key points discussed\n- Actions taken\n- Follow-up needed\n- Next steps',
        description: 'Document call details'
      },
      style: nodeStyle
    },

    // End Call
    {
      id: 'end',
      type: 'end_call',
      position: { x: CENTER_X, y: VERTICAL_SPACING * 7 },
      data: {
        ...createBaseNodeData('End Call', 'end_call'),
        prompt: 'Thank the caller for their time. Confirm any next steps or follow-up actions. Provide relevant contact information if needed.',
        description: 'Conclude call professionally'
      },
      style: nodeStyle
    }
  ],
  edges: [
    // Main flow
    { id: 'e1', source: 'start', target: 'authentication', animated: true, style: edgeStyle },
    { id: 'e2', source: 'authentication', target: 'call_category', animated: true, style: edgeStyle },
    
    // New client branch
    { id: 'e3', source: 'call_category', target: 'new_client', animated: true, style: edgeStyle },
    { id: 'e4', source: 'new_client', target: 'conflict_check', animated: true, style: edgeStyle },
    { id: 'e5', source: 'conflict_check', target: 'consultation_scheduling', animated: true, style: edgeStyle },
    
    // Existing client branch
    { id: 'e6', source: 'call_category', target: 'existing_client', animated: true, style: edgeStyle },
    { id: 'e7', source: 'existing_client', target: 'case_management', animated: true, style: edgeStyle },
    { id: 'e8', source: 'case_management', target: 'document_handling', animated: true, style: edgeStyle },
    
    // Administrative branch
    { id: 'e9', source: 'call_category', target: 'administrative', animated: true, style: edgeStyle },
    { id: 'e10', source: 'administrative', target: 'billing_system', animated: true, style: edgeStyle },
    
    // Converging paths
    { id: 'e11', source: 'consultation_scheduling', target: 'documentation', animated: true, style: edgeStyle },
    { id: 'e12', source: 'document_handling', target: 'documentation', animated: true, style: edgeStyle },
    { id: 'e13', source: 'billing_system', target: 'documentation', animated: true, style: edgeStyle },
    
    // Final connection
    { id: 'e14', source: 'documentation', target: 'end', animated: true, style: edgeStyle }
  ]
}; 