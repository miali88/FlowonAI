'use client'

import React from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Story: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Data That Tells a Story</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Transform fragmented responses into coherent narratives that reveal the complete picture of your customers&apos; journey
        </p>

        {/* Story Building Visualization */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
            <h3 className="text-2xl font-semibold text-white mb-6">From Conversations to Insights</h3>
            <div className="space-y-6">
              <div className="space-y-6">
                {/* Timeline items */}
                {[
                  { color: 'blue', title: 'Initial Interaction', desc: 'Gathering context and understanding primary needs' },
                  { color: 'purple', title: 'Deep Discovery', desc: 'Uncovering underlying motivations and challenges' },
                  { color: 'cyan', title: 'Pattern Recognition', desc: 'Connecting dots across multiple interactions' },
                  { color: 'green', title: 'Actionable Narrative', desc: 'Complete understanding that drives decision-making' }
                ].map((item, index, arr) => (
                  <div 
                    key={item.title}
                    className={`relative pl-8 ${index !== arr.length - 1 ? `border-l-2 border-${item.color}-500/30` : ''}`}
                  >
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-zinc-900 z-10">
                      <div className={`w-full h-full rounded-full bg-${item.color}-500/20 border-2 border-${item.color}-400`}></div>
                    </div>
                    <h4 className={`text-${item.color}-400 font-medium mb-2`}>{item.title}</h4>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="text-white font-medium">Narrative Intelligence</h4>
              </div>
              <p className="text-gray-400 mb-4">
                Our AI doesn&apos;t just collect data points - it weaves them into meaningful stories that reveal the full context of customer needs
              </p>
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-gray-500">Traditional Data:</div>
                <div className="text-blue-400 text-sm">&quot;Budget: $50k, Team: 20 people&quot;</div>
                <div className="text-sm text-gray-500 mt-3">Story-Driven Insight:</div>
                <div className="text-blue-400 text-sm">&quot;Growing startup prioritizing efficiency, looking to scale operations while maintaining team agility&quot;</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="text-white font-medium">Contextual Understanding</h4>
              </div>
              <p className="text-gray-400">
                Every response adds depth to the narrative, creating a comprehensive view of your customer&apos;s world
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
            Start Building Your Customer Story
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Story;
