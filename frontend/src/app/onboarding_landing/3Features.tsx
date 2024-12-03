'use client'

import React from 'react';
import { MessageSquare, UserCircle, BarChart } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="rounded-lg bg-zinc-900/50 backdrop-blur-xl p-6 mb-4 border border-zinc-800 flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-white/80" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Natural Conversations</h3>
            <p className="text-gray-300">
              No more rigid forms. Our AI understands context and responds naturally.
            </p>
          </div>
          <div className="text-center">
            <div className="rounded-lg bg-zinc-900/50 backdrop-blur-xl p-6 mb-4 border border-zinc-800 flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-white/80" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Personalized Experience</h3>
            <p className="text-gray-300">
              Every interaction is tailored to your unique needs and preferences.
            </p>
          </div>
          <div className="text-center">
            <div className="rounded-lg bg-zinc-900/50 backdrop-blur-xl p-6 mb-4 border border-zinc-800 flex items-center justify-center">
              <BarChart className="w-12 h-12 text-white/80" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Instant Insights</h3>
            <p className="text-gray-300">
              Get meaningful data and analytics from every conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
