import React from 'react';
import { Handle, Position, NodeProps, NodeTypes } from '@xyflow/react';
import { Database, Phone, PhoneOff, Webhook, Clock, GitFork, Wrench, MessageSquare, Cloud, Play, Flag } from 'lucide-react';
import { CustomNodeProps } from '../types';

// Base node component with consistent styling
const BaseNode = ({ 
  children, 
  selected, 
  topHandle = true, 
  bottomHandle = true,
  className = ""
}: { 
  children: React.ReactNode; 
  selected?: boolean;
  topHandle?: boolean;
  bottomHandle?: boolean;
  className?: string;
}) => (
  <div className={`
    relative
    rounded-lg
    border
    ${selected ? 'border-blue-500' : 'border-gray-200/20'}
    min-w-[200px]
    transition-all
    duration-200
    shadow-sm
    hover:shadow-md
    ${className}
  `}>
    {topHandle && (
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-2 !h-2 !border-2 !border-white"
        style={{ top: -4 }}
      />
    )}
    {children}
    {bottomHandle && (
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-2 !h-2 !border-2 !border-white"
        style={{ bottom: -4 }}
      />
    )}
  </div>
);

// Node content component for consistent internal styling
const NodeContent = ({ icon: Icon, label, description }: { 
  icon: React.ElementType; 
  label: string;
  description?: string;
}) => (
  <div className="p-4">
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{label}</div>
        {description && (
          <div className="text-xs text-white/60 mt-1 truncate">{description}</div>
        )}
      </div>
    </div>
  </div>
);

export const StartNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} topHandle={false} className="bg-emerald-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={Play} label={data.label} description={data.description} />
  </BaseNode>
);

export const DefaultNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-slate-800/90 text-white backdrop-blur-sm">
    <NodeContent icon={MessageSquare} label={data.label} description={data.description} />
  </BaseNode>
);

export const ResponseNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} bottomHandle={false} className="bg-violet-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={Flag} label={data.label} description={data.description} />
  </BaseNode>
);

export const KnowledgeBaseNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-blue-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={Database} label={data.label} description={data.description} />
  </BaseNode>
);

export const TransferCallNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-purple-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={Phone} label={data.label} description={data.description} />
  </BaseNode>
);

export const EndCallNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} bottomHandle={false} className="bg-red-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={PhoneOff} label={data.label} description={data.description} />
  </BaseNode>
);

export const WebhookNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-teal-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={Webhook} label={data.label} description={data.description} />
  </BaseNode>
);

export const WaitNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-amber-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={Clock} label={data.label} description={data.description} />
  </BaseNode>
);

export const TransferPathwayNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode 
    selected={selected} 
    className="bg-indigo-900/90 text-white backdrop-blur-sm border-2 border-white/10 shadow-lg hover:border-white/20"
  >
    <NodeContent 
      icon={GitFork} 
      label={data.label} 
      description={data.description} 
    />
  </BaseNode>
);

export const CustomToolNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode 
    selected={selected} 
    className="bg-cyan-700/90 text-white backdrop-blur-sm border-2 border-white/10 shadow-lg hover:border-white/20"
  >
    <NodeContent 
      icon={Wrench} 
      label={data.label} 
      description={data.description} 
    />
  </BaseNode>
);

export const ButtonNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-orange-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={MessageSquare} label={data.label} description={data.description} />
  </BaseNode>
);

export const SMSNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-pink-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={MessageSquare} label={data.label} description={data.description} />
  </BaseNode>
);

export const AmazonConnectNode: React.FC<CustomNodeProps> = ({ data, selected }) => (
  <BaseNode selected={selected} className="bg-rose-900/90 text-white backdrop-blur-sm">
    <NodeContent icon={Cloud} label={data.label} description={data.description} />
  </BaseNode>
);

export const nodeTypes = {
  start: StartNode,
  default: DefaultNode,
  response: ResponseNode,
  knowledge_base: KnowledgeBaseNode,
  transfer_call: TransferCallNode,
  end_call: EndCallNode,
  webhook: WebhookNode,
  wait: WaitNode,
  transfer_pathway: TransferPathwayNode,
  custom_tool: CustomToolNode,
  button: ButtonNode,
  sms: SMSNode,
  amazon_connect: AmazonConnectNode,
} as unknown as NodeTypes; 