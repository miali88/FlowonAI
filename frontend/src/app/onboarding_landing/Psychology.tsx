'use client'

import React from 'react';
import { Brain, HeartPulse, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Psychology: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">The Psychology of Engagement</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Discover why conversations create deeper connections and yield more authentic insights than traditional forms
        </p>

        {/* Psychology Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* ... existing cards ... */}
        </div>

        {/* Psychology Deep Dive */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* ... existing deep dive content ... */}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">Experience the power of conversation-driven engagement</p>
          <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
            Start Meaningful Conversations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Psychology;
