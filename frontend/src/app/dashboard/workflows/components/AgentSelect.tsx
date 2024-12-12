import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Agent {
  id: string;
  name: string;
}

interface AgentSelectProps {
  agents: Agent[];
  selectedAgentId?: string;
  onSelect: (agentId: string) => void;
}

export function AgentSelect({ agents, selectedAgentId, onSelect }: AgentSelectProps) {
  return (
    <Select value={selectedAgentId || "none"} onValueChange={onSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Assign to agent..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            {agent.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
