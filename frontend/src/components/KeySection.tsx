'use client'

import React from 'react';
import { MessageSquare, Clock, Settings, UserCircle } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="group relative h-full">
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all" />
    <div className="relative h-full bg-zinc-800/50 backdrop-blur-lg rounded-xl p-6 border border-zinc-700 hover:border-green-500/50 transition-all flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-400">{description}</p>
    </div>
  </div>
);

export const KeySection = () => {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-green-400" />,
      title: "24/7 Availability",
      description: "Access to information and services at any time."
    },
    {
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
      title: "Instant Responses",
      description: "No waiting in queues for basic information or simple requests."
    },
    {
      icon: <Settings className="w-6 h-6 text-orange-400" />,
      title: "Autonomous Inquiry Management",
      description: "Handles routine inquiries seamlessly."
    },
    {
      icon: <UserCircle className="w-6 h-6 text-red-400" />,
      title: "Seamless Integration",
      description: "Integrates with existing business workflows effortlessly."
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Intelligent Customer Service Automation</h2>
        <p className="text-center mb-8 text-gray-300">
          Discover how Flowon transforms customer interactions through voice-based AI.
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
