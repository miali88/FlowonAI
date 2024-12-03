'use client'

import React from 'react';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  Shield, 
  Smile, 
  LineChart,
  Headphones,
  Sparkles
} from 'lucide-react';

const benefits = [
  {
    icon: <Clock className="w-6 h-6 text-blue-400" />,
    title: "24/7 Availability",
    description: "Provide instant support around the clock without increasing overhead costs",
    stat: "100%",
    statLabel: "Uptime"
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-green-400" />,
    title: "Increased Efficiency",
    description: "Reduce response times and handle multiple inquiries simultaneously",
    stat: "85%",
    statLabel: "Faster Resolution"
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Scalable Support",
    description: "Effortlessly handle growing customer bases without compromising quality",
    stat: "10x",
    statLabel: "Capacity"
  },
  {
    icon: <Shield className="w-6 h-6 text-red-400" />,
    title: "Consistent Quality",
    description: "Deliver reliable, accurate responses every time with AI precision",
    stat: "99%",
    statLabel: "Accuracy"
  },
  {
    icon: <Smile className="w-6 h-6 text-yellow-400" />,
    title: "Enhanced Experience",
    description: "Provide personalized interactions that improve customer satisfaction",
    stat: "92%",
    statLabel: "Satisfaction"
  },
  {
    icon: <LineChart className="w-6 h-6 text-cyan-400" />,
    title: "Data Insights",
    description: "Gain valuable insights from every interaction to improve your service",
    stat: "2x",
    statLabel: "Better Insights"
  },
  {
    icon: <Headphones className="w-6 h-6 text-orange-400" />,
    title: "Multichannel Support",
    description: "Connect with customers through voice, chat, or messaging platforms",
    stat: "All",
    statLabel: "Channels"
  },
  {
    icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
    title: "Cost Reduction",
    description: "Lower operational costs while maintaining high-quality service",
    stat: "60%",
    statLabel: "Cost Savings"
  }
];

export const BenefitsSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Why Choose Flowon?
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Transform your customer service with AI-powered automation that delivers real results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-zinc-900/50 backdrop-blur-xl p-6 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                {benefit.icon}
                <h3 className="text-lg font-semibold text-white">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                {benefit.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {benefit.stat}
                </span>
                <span className="text-sm text-gray-400">
                  {benefit.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 