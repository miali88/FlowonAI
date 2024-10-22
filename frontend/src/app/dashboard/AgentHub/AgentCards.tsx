import * as React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/ui/border-beam";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

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
  setSelectedAgent: (agent: Agent) => void
}

export function AgentCards({ setSelectedAgent }: AgentCardsProps) {
  const { user } = useUser()
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedAgentId(agent.id);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          setError('User not authenticated')
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_BASE_URL}/livekit/agents`, {
          headers: {
            'x-user-id': user.id
          }
        })
        setAgents(response.data.data)
        setFilteredAgents(response.data.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch data')
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    const filtered = agents.filter(agent =>
      agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentPurpose.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAgents(filtered)
  }, [searchTerm, agents])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="relative">
            <Card 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedAgentId === agent.id ? 'border-transparent' : ''
              }`} 
              onClick={() => handleAgentSelect(agent)}
            >
              <CardHeader>
                <CardTitle>{agent.agentName}</CardTitle>
              </CardHeader>
              <CardContent>
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
            {selectedAgentId === agent.id && <BorderBeam />}
          </div>
        ))}
      </div>
    </div>
  )
}
