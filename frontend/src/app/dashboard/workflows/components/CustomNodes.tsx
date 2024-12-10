import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Phone, 
  Database, 
  Webhook as WebhookIcon, 
  Clock, 
  GitFork, 
  Wrench, 
  MessageSquare,
  BookOpen,
  PhoneForwarded,
  PhoneOff,
  Square,
  MessageCircle,
  Play,
  Flag
} from 'lucide-react';

type NodeData = {
  label: string;
  content?: string;
};

type CustomNodeProps = {
  data: NodeData;
  selected?: boolean;
};

const BaseNode = ({ 
  children, 
  selected, 
  topHandle = true, 
  bottomHandle = true 
}: { 
  children: React.ReactNode; 
  selected?: boolean;
  topHandle?: boolean;
  bottomHandle?: boolean;
}) => (
  <div className={`
    relative
    bg-white
    rounded-lg
    border
    ${selected ? 'border-blue-500' : 'border-gray-200'}
    min-w-[200px]
    transition-all
    duration-200
    shadow-sm
    hover:shadow-md
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

const NodeContent = ({ icon: Icon, label, type, color = "blue" }: { 
  icon: any; 
  label: string; 
  type: string;
  color?: string;
}) => (
  <div className="p-3 space-y-2">
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded bg-${color}-50 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${color}-500`} />
      </div>
      <span className="font-medium text-gray-700">{label}</span>
      <span className="ml-auto text-gray-400 text-xs">{type}</span>
    </div>
  </div>
);

export const DefaultNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={MessageSquare} 
      label={data.label} 
      type="Default"
      color="blue"
    />
  </BaseNode>
);

export const KnowledgeBaseNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={BookOpen} 
      label={data.label} 
      type="Knowledge Base"
      color="purple"
    />
  </BaseNode>
);

export const TransferCallNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={PhoneForwarded} 
      label={data.label} 
      type="Transfer Call"
      color="green"
    />
  </BaseNode>
);

export const EndCallNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected} bottomHandle={false}>
    <NodeContent 
      icon={PhoneOff} 
      label={data.label} 
      type="End Call"
      color="red"
    />
  </BaseNode>
);

export const WebhookNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={WebhookIcon} 
      label={data.label} 
      type="Webhook"
      color="orange"
    />
  </BaseNode>
);

export const WaitForResponseNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={Clock} 
      label={data.label} 
      type="Wait"
      color="yellow"
    />
  </BaseNode>
);

export const VectorDBNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={Database} 
      label={data.label} 
      type="Vector DB"
      color="indigo"
    />
  </BaseNode>
);

export const TransferPathwayNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={GitFork} 
      label={data.label} 
      type="Transfer"
      color="cyan"
    />
  </BaseNode>
);

export const CustomToolNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={Wrench} 
      label={data.label} 
      type="Custom Tool"
      color="pink"
    />
  </BaseNode>
);

export const PressButtonNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={Square} 
      label={data.label} 
      type="Button"
      color="emerald"
    />
  </BaseNode>
);

export const SMSNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={MessageCircle} 
      label={data.label} 
      type="SMS"
      color="violet"
    />
  </BaseNode>
);

export const AmazonConnectNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected}>
    <NodeContent 
      icon={Phone} 
      label={data.label} 
      type="Amazon Connect"
      color="amber"
    />
  </BaseNode>
);

export const StartNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected} topHandle={false}>
    <NodeContent 
      icon={Play} 
      label={data.label || "Start"} 
      type="Start"
      color="green"
    />
  </BaseNode>
);

export const ResponseNode = ({ data, selected }: CustomNodeProps) => (
  <BaseNode selected={selected} bottomHandle={false}>
    <NodeContent 
      icon={Flag} 
      label={data.label || "Response"} 
      type="Response"
      color="purple"
    />
  </BaseNode>
);

export const nodeTypes = {
  start: StartNode,
  response: ResponseNode,
  default: DefaultNode,
  knowledge_base: KnowledgeBaseNode,
  transfer_call: TransferCallNode,
  end_call: EndCallNode,
  webhook: WebhookNode,
  wait_for_response: WaitForResponseNode,
  vector_db: VectorDBNode,
  transfer_pathway: TransferPathwayNode,
  custom_tool: CustomToolNode,
  press_button: PressButtonNode,
  sms: SMSNode,
  amazon_connect: AmazonConnectNode,
}; 