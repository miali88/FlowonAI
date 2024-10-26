import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { AgentCards, Agent } from './agenthub/AgentCards';
import Particles from '@/components/ui/particles';

const DashboardContent: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { theme } = useTheme();
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    setColor(theme === 'dark' ? '#ffffff' : '#000000');
  }, [theme]);

  return (
    <div className="relative min-h-screen">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color={color}
        refresh
      />
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
