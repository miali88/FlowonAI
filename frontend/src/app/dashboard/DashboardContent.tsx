import React, { useState } from 'react';
import { AgentCards, Agent } from './AgentHub/AgentCards';

const DashboardContent: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
        <p>This is where you can add your main dashboard content, such as:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Overview statistics</li>
          <li>Recent activity</li>
          <li>Quick access to important features</li>
          <li>Notifications or alerts</li>
        </ul>
      </div>
      <AgentCards setSelectedAgent={setSelectedAgent} />
    </div>
  );
};

export default DashboardContent;
