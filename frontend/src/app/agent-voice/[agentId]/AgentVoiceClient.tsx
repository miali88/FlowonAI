'use client';

import { AgentHub } from '@/app/dashboard/agenthub/iframe';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import "@/components/loading.css";
  }
}";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

type Agent = {
  id: string;
  name?: string;
  content?: string;
  // Add other specific properties you expect from the API
  [key: string]: string | undefined;  // Allow string properties while maintaining type safety
};

function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="loader"></div>
    </div>
  );
}

export default function AgentVoiceClient() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (agentId) {
      fetchAgentData(agentId);
    }
  }, [agentId]);

  const fetchAgentData = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/livekit/agent_content/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent data');
      }
      const data = await response.json();
      setAgent({ id, ...data });  // Ensure the id is included in the agent object
    } catch (error) {
      console.error('Error fetching agent data:', error);
    }
  };

  if (!agent) {
    return <Loader />;
  }

  return <AgentHub selectedAgent={agent} embedMode={true} />;
}
