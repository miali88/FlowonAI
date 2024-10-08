'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AgentVoicePage() {
  const { agentId } = useParams();
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    async function fetchAgentContent() {
      try {
        const response = await fetch(`/api/agent-content?agentId=${agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch agent content');
        }
        const htmlContent = await response.text();
        setContent(htmlContent);
      } catch (error) {
        console.error('Error fetching agent content:', error);
        setContent('<p>Error loading agent content</p>');
      }
    }

    if (agentId) {
      fetchAgentContent();
    }
  }, [agentId]);

  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}
