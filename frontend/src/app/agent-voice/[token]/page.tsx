import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AgentHub from '@/app/dashboard/AgentHub/iframe';

const ChatbotIframePage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      // Validate the token and retrieve the associated agent ID
      fetch(`/api/token/validate?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAgentId(data.agentId);
          } else {
            // Handle invalid token
            console.error('Invalid token');
          }
        })
        .catch(err => {
          console.error('Error validating token:', err);
        });
    }
  }, [token]);

  if (!agentId) {
    return <div>Loading...</div>;
  }

  return <AgentHub selectedAgent={{ id: agentId, /* other agent props */ }} />;
};

export default ChatbotIframePage;
