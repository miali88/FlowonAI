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
      primaryNumber?: string;
      secondaryNumber?: string;
    };
    appointmentBooking?: {
      nylasApiKey?: string;
    };
    form?: {
      fields: FormField[];
    };
    prospects?: {
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
}

function Loader() {
  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="loader"></div>
    </div>
  );
}

export function AgentCards({ setSelectedAgent, agents, loading, error }: AgentCardsProps) {
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
                ${selectedAgentId === agent.id ? 'border-2 border-primary shadow-lg scale-[1.02] from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40' : ''}
              `} 
              onClick={() => setSelectedAgent(agent)}
            >
              <CardHeader>
                <CardTitle>{agent.agentName}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-2">{agent.agentPurpose}</p>
                <Badge variant="secondary" className="mr-2">
                  {agent.voice}
                </Badge>
                <Badge variant="outline">{agent.dataSource}</Badge>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                ID: {agent.id}
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
