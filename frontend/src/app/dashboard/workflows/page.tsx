'use client';

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { NodeConfig } from './components/NodeConfig';
import { NodePalette } from './components/NodePalette';
import { AddNodeDialog } from './components/AddNodeDialog';
import { NewWorkflowDialog } from './components/NewWorkflowDialog';
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input";
import { 
  WorkflowNode, 
  WorkflowEdge, 
  BaseNodeData, 
  SavedWorkflow, 
  WorkflowPreset, 
  Presets,
  NodeTypeData,
  NodeType,
  Priority,
  ResponseFormat,
  nodeStyle,
  edgeStyle,
  flowStyles,
  FLOW_CONFIG,
  BACKGROUND_CONFIG,
  CONTROLS_STYLE,
  MINIMAP_STYLE,
  LAYOUT_CONFIG,
  Agent,
} from './types';
import { nodeTypes } from './components/CustomNodes';
import { presets, lawFirmPreset } from './presets/index';
import { AgentSelect } from './components/AgentSelect';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/workflows`;

async function fetchWorkflows() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch workflows');
  return response.json();
}

async function saveWorkflowToBackend(workflow: SavedWorkflow) {
  const url = workflow.id ? `${API_BASE}/${workflow.id}` : API_BASE;
  console.log('Making API request to:', url);
  
  try {
    const response = await fetch(url, {
      method: workflow.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        assignedAgentId: workflow.assignedAgentId,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to save workflow: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Server response:', data);
    return data;
  } catch (error) {
    console.error('Network or parsing error:', error);
    throw error;
  }
}

async function deleteWorkflowFromBackend(workflowId: string) {
  const response = await fetch(`${API_BASE}/${workflowId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to delete workflow');
}

export default function WorkflowsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(lawFirmPreset.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(lawFirmPreset.edges);
  
  const [showEditor, setShowEditor] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>(() => {
    // Load saved workflows from localStorage on component mount
    const saved = localStorage.getItem('workflows');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentWorkflow, setCurrentWorkflow] = useState<SavedWorkflow | null>(null);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>([]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: edgeStyle,
    }, eds)),
    [setEdges]
  );

  const loadPreset = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      setNodes(preset.nodes);
      setEdges(preset.edges);
      setShowEditor(true);
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: WorkflowNode) => {
    setSelectedNode(node);
    setIsEditing(true);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            type: newData.type || node.type,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onDragStart = useCallback((event: React.DragEvent, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = document.querySelector('.react-flow-wrapper')?.getBoundingClientRect();
      const type = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: WorkflowNode = {
        id: `${type.type}-${Date.now()}`,
        type: type.type,
        position,
        data: {
          label: type.label,
          content: '',
          type: type.type,
          description: type.description,
          priority: 'medium',
          actions: '',
          staticText: false,
          prompt: '',
          systemPrompt: '',
          loopCondition: '',
          isGlobalNode: false,
          extractVariables: false,
          temperature: 0.7,
          maxTokens: 1000,
          variables: [],
          responseFormat: 'natural',
          fallbackBehavior: 'retry',
          timeoutSeconds: 30
        },
        style: nodeStyle,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleAddNode = useCallback((nodeType: NodeType) => {
    console.log('Adding node of type:', nodeType);
    
    const position = { x: 100, y: 100 };
    
    const nodeData: BaseNodeData = {
      label: nodeType.split('_').map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      content: '',
      type: nodeType,
      description: '',
      priority: 'medium',
      actions: '',
      staticText: false,
      prompt: '',
      systemPrompt: '',
      loopCondition: '',
      isGlobalNode: false,
      extractVariables: false,
      temperature: 0.7,
      maxTokens: 1000,
      variables: [],
      responseFormat: 'natural',
      fallbackBehavior: 'retry',
      timeoutSeconds: 30
    };

    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: nodeData,
      style: nodeStyle,
    };

    console.log('Created node:', newNode);
    setNodes((nds) => nds.concat(newNode));
    setShowAddNode(false);
  }, [setNodes]);

  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    setNodes((nds) => nds.filter((node) => !nodesToDelete.some((n) => n.id === node.id)));
    // Also delete connected edges
    setEdges((eds) => eds.filter((edge) => !nodesToDelete.some((node) => 
      edge.source === node.id || edge.target === node.id
    )));
  }, [setNodes, setEdges]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
    setIsEditing(false);
  }, [setNodes, setEdges]);

  const handleCreateEmpty = useCallback(() => {
    const newWorkflow: SavedWorkflow = {
      id: uuidv4(),
      name: 'New Workflow',
      nodes: [],
      edges: [],
      lastModified: new Date().toISOString(),
    };
    
    setCurrentWorkflow(newWorkflow);
    setWorkflowName('New Workflow');
    setNodes([]);
    setEdges([]);
    setShowEditor(true);
    setShowNewWorkflowDialog(false);
  }, []);

  const handleSelectPreset = useCallback((presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      const newWorkflow: SavedWorkflow = {
        id: uuidv4(),
        name: presetName,
        nodes: preset.nodes,
        edges: preset.edges,
        lastModified: new Date().toISOString(),
      };
      
      setCurrentWorkflow(newWorkflow);
      setWorkflowName(presetName);
      setNodes(preset.nodes);
      setEdges(preset.edges);
      setShowEditor(true);
    }
    setShowNewWorkflowDialog(false);
  }, []);

  // Save current workflow (INSERT)
  const saveWorkflow = useCallback(async () => {
    console.log('Save Workflow button clicked');

    if (!workflowName) {
      console.log('Cannot save: missing workflow name');
      return;
    }

    const newWorkflow: SavedWorkflow = {
      id: uuidv4(), // Generate new ID for new workflow
      name: workflowName,
      nodes,
      edges,
      lastModified: new Date().toISOString(),
      assignedAgentId: null,
    };

    console.log('Attempting to save new workflow:', newWorkflow);

    try {
      const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkflow),
      });

      if (!response.ok) {
        throw new Error(`Failed to save workflow: ${await response.text()}`);
      }

      const savedWorkflow = await response.json();
      console.log('Workflow saved successfully:', savedWorkflow);
      
      setCurrentWorkflow(savedWorkflow);
      setWorkflows(prev => [...prev, savedWorkflow]);
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  }, [workflowName, nodes, edges, API_BASE]);

  // Update existing workflow (UPDATE)
  const updateWorkflow = useCallback(async () => {
    console.log('Back to Workflows clicked - updating workflow');

    if (!currentWorkflow) {
      setShowEditor(false);
      return;
    }

    try {
      const updatedWorkflow: SavedWorkflow = {
        id: currentWorkflow.id,
        name: workflowName,
        nodes,
        edges,
        lastModified: new Date().toISOString(),
        assignedAgentId: currentWorkflow.assignedAgentId,
      };

      const response = await fetch(`${API_BASE}/${currentWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkflow),
      });

      if (!response.ok) {
        throw new Error(`Failed to update workflow: ${await response.text()}`);
      }

      const savedWorkflow = await response.json();
      setWorkflows(prev => 
        prev.map(w => w.id === savedWorkflow.id ? savedWorkflow : w)
      );
    } catch (error) {
      console.error('Error updating workflow:', error);
    }

    setShowEditor(false);
  }, [currentWorkflow, workflowName, nodes, edges, API_BASE]);

  const deleteWorkflow = useCallback(async (workflowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await deleteWorkflowFromBackend(workflowId);
      setWorkflows(prevWorkflows => 
        prevWorkflows.filter(w => w.id !== workflowId)
      );
    } catch (error) {
      console.error('Error deleting workflow:', error);
      // TODO: Show error notification to user
    }
  }, []);

  const handleAgentAssignment = useCallback((agentId: string) => {
    if (!currentWorkflow) return;
    
    setCurrentWorkflow(prev => ({
      ...prev!,
      assignedAgentId: agentId
    }));
  }, [currentWorkflow]);

  useEffect(() => {
    console.log('Current nodes:', nodes);
  }, [nodes]);

  useEffect(() => {
    // Fetch agents from your backend
    const fetchAgents = async () => {
      // Replace this with your actual API call
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
    };
    
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchWorkflows()
      .then(setWorkflows)
      .catch(error => console.error('Error loading workflows:', error));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowNewWorkflowDialog(true)}
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <NewWorkflowDialog
        isOpen={showNewWorkflowDialog}
        onClose={() => setShowNewWorkflowDialog(false)}
        onCreateEmpty={handleCreateEmpty}
        onSelectPreset={handleSelectPreset}
      />
      
      {showEditor ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={updateWorkflow}  // Use updateWorkflow for Back button
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Workflows
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-[200px]"
                placeholder="Workflow Name"
              />
              <AgentSelect
                agents={agents}
                selectedAgentId={currentWorkflow?.assignedAgentId}
                onSelect={handleAgentAssignment}
              />
              <Button onClick={saveWorkflow}>  {/* Use saveWorkflow for Save button */}
                Save Workflow
              </Button>
            </div>
          </div>
          
          <div className="h-[600px] border rounded-lg overflow-hidden relative bg-black">
            <div className="absolute left-4 top-4 z-10">
              <Button
                size="sm"
                onClick={() => setShowAddNode(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Node
              </Button>
            </div>

            <ReactFlow<WorkflowNode, WorkflowEdge>
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodesDelete={onNodesDelete}
              deleteKeyCode={['Backspace', 'Delete']}
              nodeTypes={nodeTypes}
              fitView
              style={{
                backgroundColor: '#000000',
              }}
              defaultEdgeOptions={{
                style: { 
                  stroke: '#ffffff',
                  strokeWidth: 1,
                },
                animated: true,
                type: 'smoothstep',
              }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={12}
                size={1}
                color="#333333"
              />
              <Controls className="text-white" />
              <MiniMap 
                style={{ backgroundColor: '#333333' }}
                nodeColor="#ffffff"
              />
            </ReactFlow>

            <AddNodeDialog
              isOpen={showAddNode}
              onClose={() => setShowAddNode(false)}
              onAdd={handleAddNode}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="border rounded-lg p-4 hover:border-primary cursor-pointer group relative"
              onClick={() => {
                setCurrentWorkflow(workflow);
                setWorkflowName(workflow.name);
                setNodes(workflow.nodes);
                setEdges(workflow.edges);
                setShowEditor(true);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{workflow.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last modified: {new Date(workflow.lastModified).toLocaleDateString()}
                  </p>
                  {workflow.assignedAgentId && (
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {agents.find(a => a.id === workflow.assignedAgentId)?.name}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => deleteWorkflow(workflow.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedNode && (
        <NodeConfig
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setSelectedNode(null);
          }}
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onDelete={() => handleDeleteNode(selectedNode.id)}
        />
      )}
    </div>
  );
} 