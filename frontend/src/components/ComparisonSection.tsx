'use client'

import React from 'react';
import { 
  Brain, 
  PhoneCall, 
  Calendar, 
  Globe, 
  TrendingUp, 
  Clock,
  MessageSquare,
  Settings,
  Users,
  Coffee,
  Zap
} from 'lucide-react';

const ComparisonSection = () => {
  const advantages = [
    {
      traditional: {
        title: "Human Limitations",
        description: "Limited by working hours, breaks, and human capacity",
      },
      flowon: {
        title: "Tireless Business Representative",
        description: "24/7 availability with consistent performance and unlimited concurrent conversations",
        icon: <Zap className="w-6 h-6 text-purple-400" />
      }
    },
    {
      traditional: {
        title: "Information Bottlenecks",
        description: "Knowledge limited to individual training and experience",
      },
      flowon: {
        title: "Comprehensive Business Knowledge",
        description: "Complete understanding of your business, products, and processes with perfect recall",
        icon: <Brain className="w-6 h-6 text-blue-400" />
      }
    },
    {
      traditional: {
        title: "Inconsistent Service",
        description: "Quality varies based on workload and individual performance",
      },
      flowon: {
        title: "Standardized Excellence",
        description: "Consistently high-quality interactions regardless of volume or time",
        icon: <TrendingUp className="w-6 h-6 text-green-400" />
      }
    },
    {
      traditional: {
        title: "Single-Task Focus",
        description: "Can only handle one conversation at a time",
      },
      flowon: {
        title: "Unlimited Multitasking",
        description: "Handles multiple complex inquiries simultaneously without quality loss",
        icon: <MessageSquare className="w-6 h-6 text-yellow-400" />
      }
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Beyond Traditional Reception
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Experience the difference between human limitations and AI-powered business representation
          </p>
        </div>

        <div className="space-y-8">
          {advantages.map((advantage, index) => (
            <div 
              key={index}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* Traditional Reception */}
              <div className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-400">
                    {advantage.traditional.title}
                  </h3>
                </div>
                <p className="text-gray-500">
                  {advantage.traditional.description}
                </p>
              </div>

              {/* Flowon Service */}
              <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700 hover:border-purple-500/50 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  {advantage.flowon.icon}
                  <h3 className="text-xl font-semibold text-white">
                    {advantage.flowon.title}
                  </h3>
                </div>
                <p className="text-gray-300">
                  {advantage.flowon.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Benefits Summary */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Intelligent Task Management
            </h3>
            <p className="text-gray-400">
              Handles scheduling, follow-ups, and coordination automatically
            </p>
          </div>

          <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <Globe className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Global Accessibility
            </h3>
            <p className="text-gray-400">
              Multilingual support and 24/7 availability for worldwide business
            </p>
          </div>

          <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <Settings className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Business Adaptability
            </h3>
            <p className="text-gray-400">
              Learns and adapts to your specific business needs and processes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection; 