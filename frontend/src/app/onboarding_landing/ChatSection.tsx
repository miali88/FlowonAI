'use client'

import React from 'react';
import ChatWidget from '@/app/dashboard/agenthub/workspace/ChatWidget';

const ChatSection: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Onboarding Agent</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Experience our AI-powered onboarding assistant in action. Try it out below!
        </p>
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8">
          <ChatWidget agentId="your-default-agent-id" />
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
