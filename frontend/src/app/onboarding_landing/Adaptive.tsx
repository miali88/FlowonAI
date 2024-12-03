'use client'

import React from 'react';
import { 
    MessageSquare, 
    Brain, 
    Target, 
    LineChart, 
    BrainCircuit, 
    Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Adaptive: React.FC = () => {
    return (
        <section className="py-20 bg-gradient-to-b from-transparent to-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Beyond Simple Questions</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Our AI doesn't just ask questions - it builds genuine understanding through natural conversation, uncovering deeper insights with each interaction
          </p>

          {/* Depth of Understanding Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
              <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Adaptive Dialogue</h3>
              <p className="text-gray-400 mb-6">
                Each response shapes the conversation, creating a unique journey of discovery for every user
              </p>
              <div className="bg-black/40 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  <div className="text-gray-500">Initial: "What are your goals?"</div>
                  <div className="text-blue-400">→ "How do those goals align with your current challenges?"</div>
                  <div className="text-blue-400">→ "What's holding you back from achieving them?"</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
              <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Emotional Intelligence</h3>
              <p className="text-gray-400 mb-6">
                Recognizes subtle cues and adjusts conversation tone to create comfortable, open dialogue
              </p>
              <div className="bg-black/40 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  <div className="text-gray-500">User: "It's been challenging lately..."</div>
                  <div className="text-purple-400">→ Recognizes uncertainty</div>
                  <div className="text-purple-400">→ Offers supportive follow-up</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
              <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Pattern Recognition</h3>
              <p className="text-gray-400 mb-6">
                Identifies underlying patterns and motivations that even users might not be consciously aware of
              </p>
              <div className="bg-black/40 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  <div className="text-gray-500">Analyzes response patterns</div>
                  <div className="text-cyan-400">→ Uncovers hidden preferences</div>
                  <div className="text-cyan-400">→ Predicts future needs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Understanding Showcase */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-zinc-800 mb-16">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-6">Understanding at Scale</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Behavioral Analysis</h4>
                      <p className="text-gray-400">Understands decision-making patterns and underlying motivations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-500/10 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Predictive Insights</h4>
                      <p className="text-gray-400">Anticipates needs and concerns before they're expressed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-cyan-500/10 p-2 rounded-lg">
                      <LineChart className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Trend Analysis</h4>
                      <p className="text-gray-400">Identifies emerging patterns across conversations</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Depth of Understanding</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Surface Level</span>
                        <span className="text-blue-400">100%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-blue-400/50 h-1.5 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Behavioral Patterns</span>
                        <span className="text-purple-400">95%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-purple-400/50 h-1.5 rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-gray-400 mb-6">Ready to understand your customers at a deeper level?</p>
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
              Start Meaningful Conversations
            </Button>
          </div>
        </div>
      </section>
    );
};

export default Adaptive;
