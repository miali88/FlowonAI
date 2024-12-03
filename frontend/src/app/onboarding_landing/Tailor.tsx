'use client'

import React from 'react';
import { 
    Code2, 
    Library, 
    Database, 
    GitBranch, 
    Webhook 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

const Tailor: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Tailor Your AI for Smarter Data Collection</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Train FlowonAI to gather exactly the data your industry needs, in the way your customers prefer
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Interactive Preview */}
          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <Code2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white">Customizable AI Behaviors</h3>
            </div>
            
            <div className="space-y-4">
              {/* ... Conversation Style ... */}
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Conversation Style</span>
                  <Switch />
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Professional</Badge>
                  <Badge variant="secondary">Casual</Badge>
                  <Badge variant="secondary">Friendly</Badge>
                </div>
              </div>

              {/* ... Data Validation Rules ... */}
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Data Validation Rules</span>
                  <Switch />
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-zinc-800 text-white">Required Fields</Badge>
                  <Badge variant="secondary" className="bg-zinc-800 text-white">Format Check</Badge>
                  <Badge variant="secondary" className="bg-zinc-800 text-white">Custom Logic</Badge>
                </div>
              </div>

              {/* ... Response Handling ... */}
              <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Response Handling</span>
                  <Switch />
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Auto-Correct</Badge>
                  <Badge variant="secondary">Suggestions</Badge>
                  <Badge variant="secondary">Clarification</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Industry Templates */}
          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <Library className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white">Pre-built Industry Templates</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ... Industry Template Cards ... */}
              {['E-commerce', 'Healthcare', 'Financial', 'Education'].map((industry, index) => (
                <div key={industry} className="bg-black/40 rounded-lg p-4 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer">
                  <h4 className="text-white font-medium mb-2">{industry}</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    {getIndustryFeatures(industry).map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Collection Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Smart Data Storage</h3>
            </div>
            <p className="text-gray-300">
              Automatically organize and categorize collected data for easy analysis and reporting
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Conditional Logic</h3>
            </div>
            <p className="text-gray-300">
              Create dynamic conversations that adapt based on previous responses
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <Webhook className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">API Integration</h3>
            </div>
            <p className="text-gray-300">
              Connect with your existing tools to automate data flow and analysis
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function to get features for each industry
const getIndustryFeatures = (industry: string): string[] => {
  const features = {
    'E-commerce': ['Purchase history analysis', 'Style preferences', 'Size profiling'],
    'Healthcare': ['Medical history', 'Symptom tracking', 'Treatment preferences'],
    'Financial': ['Risk assessment', 'Investment goals', 'Portfolio tracking'],
    'Education': ['Learning style', 'Course preferences', 'Skill assessment']
  };
  return features[industry as keyof typeof features] || [];
};

export default Tailor;
