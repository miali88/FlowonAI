'use client'

import React from 'react';
import { 
    FileX, 
    X, 
    Sparkles, 
    Check,
    Brain,
    LineChart,
    Target
} from 'lucide-react';

const Forms: React.FC = () => {
    return (
        <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Beyond Basic Forms: Deep Customer Understanding</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Transform tedious form-filling into engaging conversations that users actually enjoy completing
          </p>

          {/* Comparison Cards */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Traditional Forms */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-xl" />
              <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                    <FileX className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Traditional Forms</h3>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Completion Rate</span>
                      <span className="text-red-400">35%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-red-400/50 h-2 rounded-full" style={{ width: '35%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Users abandon due to form fatigue</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <X className="w-5 h-5 text-red-400" />
                      <span>Generic, one-size-fits-all questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X className="w-5 h-5 text-red-400" />
                      <span>Limited context gathering</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X className="w-5 h-5 text-red-400" />
                      <span>Static, rigid response options</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <X className="w-5 h-5 text-red-400" />
                      <span>No personalization or adaptation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FlowonAI Forms */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">FlowonAI Conversations</h3>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Completion Rate</span>
                      <span className="text-blue-400">85%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-blue-400/50 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Users engage in natural conversation flow</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Check className="w-5 h-5 text-blue-400" />
                      <span>Dynamic, contextual conversations</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Check className="w-5 h-5 text-blue-400" />
                      <span>Rich, qualitative data collection</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Check className="w-5 h-5 text-blue-400" />
                      <span>Adaptive follow-up questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Check className="w-5 h-5 text-blue-400" />
                      <span>Personalized user experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Insights Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Behavioral Insights</h3>
              </div>
              <p className="text-gray-300">
                Understand user preferences and decision-making patterns through natural conversation flow
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Market Intelligence</h3>
              </div>
              <p className="text-gray-300">
                Aggregate insights reveal market trends and opportunities for business growth
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">Predictive Analysis</h3>
              </div>
              <p className="text-gray-300">
                AI-powered insights help forecast customer needs and market evolution
              </p>
            </div>
          </div>

          {/* Data Quality Metrics */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800/50 rounded-xl p-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">3x</div>
                <div className="text-gray-400">More Data Points</div>
                <div className="text-blue-400 text-sm">per user session</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">85%</div>
                <div className="text-gray-400">Completion Rate</div>
                <div className="text-blue-400 text-sm">vs 35% industry average</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">92%</div>
                <div className="text-gray-400">Data Accuracy</div>
                <div className="text-blue-400 text-sm">through AI validation</div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">4.8/5</div>
                <div className="text-gray-400">User Satisfaction</div>
                <div className="text-blue-400 text-sm">engagement score</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
};

export default Forms;