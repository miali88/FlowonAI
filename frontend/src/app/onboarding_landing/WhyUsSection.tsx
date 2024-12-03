'use client'

import React from 'react';
import { 
    Zap, 
    Brain, 
    Fingerprint, 
    LineChart, 
    Shield, 
    Wrench 
} from 'lucide-react';

const WhyUsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Why Choose FlowonAI?</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Transform your user onboarding experience with our cutting-edge AI solution
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature cards */}
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-purple-400" />}
            gradientFrom="purple-500/10"
            gradientTo="blue-500/10"
            title="Lightning Fast Setup"
            description="Get up and running in minutes, not days. Our no-code solution makes integration seamless."
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6 text-blue-400" />}
            gradientFrom="blue-500/10"
            gradientTo="cyan-500/10"
            title="AI-Powered Intelligence"
            description="Advanced natural language processing ensures smooth, context-aware conversations."
          />
          <FeatureCard
            icon={<Fingerprint className="w-6 h-6 text-cyan-400" />}
            gradientFrom="cyan-500/10"
            gradientTo="teal-500/10"
            title="Personalized Experience"
            description="Each interaction is tailored to your users' needs and preferences."
          />
          <FeatureCard
            icon={<LineChart className="w-6 h-6 text-teal-400" />}
            gradientFrom="teal-500/10"
            gradientTo="green-500/10"
            title="Detailed Analytics"
            description="Track completion rates, user engagement, and optimize your onboarding flow."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-green-400" />}
            gradientFrom="green-500/10"
            gradientTo="emerald-500/10"
            title="Enterprise-Ready"
            description="Built with security and scalability in mind to handle any size operation."
          />
          <FeatureCard
            icon={<Wrench className="w-6 h-6 text-emerald-400" />}
            gradientFrom="emerald-500/10"
            gradientTo="purple-500/10"
            title="Full Customization"
            description="Adapt the onboarding flow to match your brand and specific requirements."
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  gradientFrom,
  gradientTo,
  title,
  description
}) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
      <div className={`bg-gradient-to-br from-${gradientFrom} to-${gradientTo} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default WhyUsSection;
