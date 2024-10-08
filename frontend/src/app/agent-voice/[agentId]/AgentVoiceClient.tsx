'use client';

import { AgentHub } from '@/app/dashboard/AgentHub/iframe';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function AgentVoiceClient() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [agent, setAgent] = useState(null);

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
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent data:', error);
    }
  };

  if (!agent) {
    return <div>Loading...</div>;
  }

  return <AgentHub selectedAgent={agent} />;
}
