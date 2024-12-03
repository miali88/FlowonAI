'use client'

import React from 'react';
import { 
  Brain, 
  Target, 
  Building2,
  Sparkles
} from 'lucide-react';
import { Timeline } from "@/components/ui/timeline";

const PsychologySection = () => {
  const timelineData = [
    {
      title: "Business Understanding",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Business Context</h3>
          </div>
          <p className="text-gray-300 text-sm mb-6">
            Customers feel more confident when interacting with an AI that truly understands your business
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Industry Knowledge</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Deep understanding of your specific industry and market dynamics
              </p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Product Expertise</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Comprehensive knowledge of your products and services
              </p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Process Awareness</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Understanding of your business workflows and procedures
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Lead Conversion",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Strategic Communication</h3>
          </div>
          <p className="text-gray-300 text-sm mb-6">
            Strategic communication that guides potential customers through your sales funnel
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Engagement Timing</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Interacts with leads when they're most receptive
              </p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Value Communication</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Effectively communicates your unique value proposition
              </p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Objection Handling</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Intelligently addresses common customer concerns
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Cognitive Flow",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Natural Progression</h3>
          </div>
          <p className="text-gray-300 text-sm mb-6">
            Creates a natural progression in business conversations that leads to better outcomes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Information Structure</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Presents business information in an easily digestible way
              </p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Decision Facilitation</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Helps customers make informed business decisions
              </p>
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-white font-medium">Relationship Building</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Develops strong business relationships through meaningful dialogue
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">
            The Psychology of Business Interaction
          </h2>
          <p className="text-gray-300 text-xl">
            How Flowon creates meaningful business connections and drives conversions
          </p>
        </div>
        
        <Timeline data={timelineData} />
      </div>
    </section>
  );
};

export default PsychologySection; 