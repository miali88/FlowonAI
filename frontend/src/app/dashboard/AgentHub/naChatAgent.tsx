import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Playground } from "@/components/Playground";

interface AIAgentNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AIAgentNavBar: React.FC<AIAgentNavBarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = ["Playground", "Activity", "Analytics", "Publish", "Settings"];

  return (
    <div className="border-b">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          {navItems.map((item) => (
            <TabsTrigger key={item.toLowerCase()} value={item.toLowerCase()} className="text-sm">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

const ChatAgent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('playground');

  return (
    <div className="flex flex-col h-full">
      <AIAgentNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="p-6 flex-1">
        {activeTab === 'playground' ? (
          <Playground />
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4">Chat Agent - {activeTab}</h3>
            <p className="text-muted-foreground mb-6">
              Content for {activeTab} tab.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatAgent;
