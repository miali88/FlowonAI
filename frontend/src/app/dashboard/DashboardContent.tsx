import React, { useState } from 'react';
import { AgentCards, Agent } from './AgentHub/AgentCards';

const DashboardContent: React.FC = () => {
  const [setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="relative w-full h-full min-h-screen">
      <div className="relative z-10">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select, or create a new agent</h2>
        </div>
        <AgentCards setSelectedAgent={setSelectedAgent} />
      </div>
    </div>
  );
};

export default DashboardContent;
