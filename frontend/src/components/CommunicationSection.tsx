'use client'

import React from 'react';
import { 
  Brain, 
  MessageCircle, 
  Layers, 
  Zap, 
  Network,
  BookOpen,
  RefreshCcw,
  Settings
} from 'lucide-react';

const CommunicationSection = () => {
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      title: "Business Knowledge Integration",
      description: "Flowon learns your business inside and out - from processes and policies to product details and pricing structures.",
      points: [
        "Understands your unique business logic",
        "Adapts to your company policies",
        "Learns from historical interactions"
      ]
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-blue-400" />,
      title: "Voice of Your Business",
      description: "Communicates with your brand's personality while maintaining professionalism and expertise.",
      points: [
        "Matches your brand tone",
        "Maintains consistent messaging",
        "Represents your values"
      ]
    },
    {
      icon: <Layers className="w-12 h-12 text-green-400" />,
      title: "Comprehensive Understanding",
      description: "Goes beyond basic responses by truly understanding your business context and customer needs.",
      points: [
        "Deep context awareness",
        "Situation-specific responses",
        "Nuanced communication"
      ]
    }
  ];

  const capabilities = [
    {
      icon: <Network className="w-6 h-6 text-blue-400" />,
      title: "Seamless Integration",
      description: "Connects with all your business systems and communication channels"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-green-400" />,
      title: "Knowledge Retention",
      description: "Continuously learns and retains information about your business"
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-purple-400" />,
      title: "Adaptive Learning",
      description: "Evolves with your business and improves over time"
    },
    {
      icon: <Settings className="w-6 h-6 text-yellow-400" />,
      title: "Custom Configuration",
      description: "Tailored to your specific business requirements"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Business, Amplified
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Flowon becomes the intelligent communication layer that gives your business a voice
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
              <div className="relative bg-zinc-900/50 backdrop-blur-xl p-8 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-400">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Communication Flow Visualization */}
        <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-white mb-2">
              Intelligent Communication Layer
            </h3>
            <p className="text-gray-400">
              Flowon sits between your business and your customers, providing intelligent, context-aware communication
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-block p-3 bg-zinc-800/50 rounded-xl mb-4">
                  {capability.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {capability.title}
                </h4>
                <p className="text-gray-400 text-sm">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-2xl text-white mb-6">
            Ready to give your business an intelligent voice?
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all">
            Start Building Your Communication Layer
          </button>
        </div>
      </div>
    </section>
  );
};

export default CommunicationSection; 