'use client'

import React from 'react';
import { 
    MessageSquare, 
    Brain, 
    FileX,
    BrainCircuit,
    LineChart,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button'

const Future: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">The Future of Customer Understanding</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Move beyond static forms into an era of dynamic, AI-powered conversations that truly understand your customers
        </p>

        {/* Evolution Timeline */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
              <div className="text-red-400 text-sm font-medium mb-4">PAST</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Static Forms</h3>
              <div className="space-y-4">
                <p className="text-gray-300">One-way data collection with no context</p>
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileX className="w-5 h-5 text-red-400" />
                    <span className="text-gray-400">Generic Questions</span>
                  </div>
                  <div className="pl-7 text-sm text-gray-500">
                    "What is your budget?"
                    <br />
                    "How many employees?"
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
              <div className="text-blue-400 text-sm font-medium mb-4">PRESENT</div>
              <h3 className="text-2xl font-semibold text-white mb-4">AI Conversations</h3>
              <div className="space-y-4">
                <p className="text-gray-300">Interactive dialogue with contextual understanding</p>
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400">Natural Dialogue</span>
                  </div>
                  <div className="pl-7 text-sm text-gray-500">
                    "Tell me about your current challenges..."
                    <br />
                    "How would that impact your team?"
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-purple-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
              <div className="text-purple-400 text-sm font-medium mb-4">FUTURE</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Predictive Intelligence</h3>
              <div className="space-y-4">
                <p className="text-gray-300">Anticipating needs through deep understanding</p>
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400">Proactive Insights</span>
                  </div>
                  <div className="pl-7 text-sm text-gray-500">
                    "Based on your growth, you might need..."
                    <br />
                    "We've noticed a trend in your industry..."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white">Why Conversations Matter</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Natural Information Flow</h4>
                  <p className="text-gray-400">Users share more when they&apos;re engaged in a conversation rather than filling out fields</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Contextual Understanding</h4>
                  <p className="text-gray-400">AI remembers previous responses and asks relevant follow-up questions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <LineChart className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Deeper Insights</h4>
                  <p className="text-gray-400">Uncover hidden opportunities and patterns in customer responses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Showcase */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-zinc-800">
            <h3 className="text-2xl font-semibold text-white mb-6">The Impact</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-4xl font-bold text-white mb-2">87%</div>
                <div className="text-gray-400">Users prefer conversational interfaces</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">3.5x</div>
                <div className="text-gray-400">More detailed responses</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">92%</div>
                <div className="text-gray-400">Higher completion rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">2x</div>
                <div className="text-gray-400">Faster market insights</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
            Join the Future of Customer Understanding
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Future;
