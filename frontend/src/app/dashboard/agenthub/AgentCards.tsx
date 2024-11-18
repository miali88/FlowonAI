import * as React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import "@/components/loading.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Update the glassStyles to achieve a darker, greyer, and more transparent look
const glassStyles = `
  relative
  bg-gray-700 bg-opacity-15
  dark:bg-gray-900 dark:bg-opacity-15
  backdrop-blur-lg saturate-220
  border border-gray-600 border-opacity-15
  dark:border-gray-800 dark:border-opacity-15
  shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
  transition-all duration-300
  hover:bg-opacity-50
  dark:hover:bg-opacity-50
  hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]
`;

// Move the Agent type definition here
export interface Agent {
  id: string;
  agentName: string;
  agentPurpose: string;
  dataSource: string;
  tag?: string;
  openingLine: string;
  language: string;
  voice: string;
  instructions: string;
  uiConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: number;
    borderRadius?: number;
    chatboxHeight?: number;
  };
  features?: {
    callTransfer?: {
      enabled?: boolean;
      primaryNumber?: string;
      secondaryNumber?: string;
    };
    appointmentBooking?: {
      enabled?: boolean;
      nylasApiKey?: string;
    };
    form?: {
      enabled?: boolean;
      fields: FormField[];
    };
    prospects?: {
      enabled?: boolean;
      notifyOnInterest: boolean;
      email: string;
      sms: string;
      whatsapp: string;
    };
  };
}

interface FormField {
  type: 'text' | 'email' | 'phone' | 'dropdown';
  label: string;
  options: string[];
}

interface AgentCardsProps {
  setSelectedAgent: (agent: Agent) => void;
  agents: Agent[];
  loading: boolean;
  error: string | null;
  refreshAgents?: () => void;
}

function Loader() {
  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="loader"></div>
    </div>
  );
}

const formatPurpose = (purpose: string) => {
  return purpose
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatVoice = (voice: string) => {
  // If it's a UUID format, return a friendly name
  if (voice.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
    return "AI Voice";
  }
  // If it's voice1/all format
  if (voice === "voice1") return "Voice 1";
  if (voice === "all") return "All Voices";
  return voice;
};

const formatDataSource = (dataSource: string) => {
  try {
    // First check if it's just "all" by itself
    if (dataSource === "all") return "All Sources";
    
    // Try to parse as JSON
    const parsed = JSON.parse(dataSource);
    
    // If it's an array with objects containing title
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return "No Source";
      if (parsed.some(item => item.id === 'kb_all' || item.id === 'all')) return "All Sources";
      
      // Get just the first source if there are multiple
      const firstSource = parsed[0].title;
      const remainingCount = parsed.length - 1;
      
      // Simplify the URL if it's a web source
      const displayTitle = firstSource.replace(/(https?:\/\/)?(www\.)?/i, '').split('/')[0];
      
      return remainingCount > 0 
        ? `${displayTitle} +${remainingCount}` 
        : displayTitle;
    }
    
    // If it's just a string
    return dataSource === 'kb_all' ? 'All Sources' : dataSource || "No Source";
  } catch {
    // If it's not JSON and just a plain string
    if (dataSource === "all" || dataSource === "kb_all") return "All Sources";
    return dataSource || "No Source";
  }
};

export function AgentCards({ setSelectedAgent, agents, loading, error, refreshAgents }: AgentCardsProps) {
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [searchTerm] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    const filtered = agents.filter(agent =>
      agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentPurpose.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAgents(filtered)
  }, [searchTerm, agents])

  useEffect(() => {
    refreshAgents?.();
  }, [refreshAgents]);

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <h2 className="text-xl font-semibold mb-4">Select, or create a new agent</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="relative h-full">
            <Card 
              className={`
                ${glassStyles}
                cursor-pointer
                h-full flex flex-col
                ${selectedAgentId === agent.id ? 'border-2 border-primary shadow-lg scale-[1.02]' : ''}
              `} 
              onClick={() => setSelectedAgent(agent)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl font-bold">{agent.agentName}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                <p className="text-base font-medium text-gray-600">
                  {formatPurpose(agent.agentPurpose)}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    {formatVoice(agent.voice)}
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    {formatDataSource(agent.dataSource)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
