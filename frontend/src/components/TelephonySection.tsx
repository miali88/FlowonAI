'use client'

import React from 'react';
import { 
  Phone, 
  PhoneIncoming,
  Languages,
  Timer,
  Zap,
  Mic,
  MessageSquareQuote
} from 'lucide-react';

const TELEPHONY_FEATURES = [
  {
    icon: 'phone-incoming',
    title: "Instant Call Handling",
    description: "Automatically answers and manages incoming calls with zero wait time",
  },
  {
    icon: 'languages',
    title: "Natural Conversations",
    description: "Engages in human-like dialogue with context awareness and understanding",
  },
  {
    icon: 'timer',
    title: "24/7 Availability",
    description: "Never miss a call with round-the-clock automated response",
  }
] as const;

const IconWrapper = React.memo(({ name, className }: { name: string, className: string }) => {
  const icons = {
    'phone-incoming': PhoneIncoming,
    'languages': Languages,
    'timer': Timer,
  };
  const Icon = icons[name as keyof typeof icons];
  return <Icon className={className} />;
});

const FeatureCard = React.memo(({ feature }: { feature: typeof TELEPHONY_FEATURES[number] }) => (
  <div className="bg-zinc-800/20 rounded-xl p-4 hover:bg-zinc-800/30 transition-all">
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 p-2 bg-zinc-800 rounded-lg">
        <IconWrapper name={feature.icon} className="w-6 h-6 text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          {feature.title}
        </h3>
        <p className="text-gray-400 text-sm">
          {feature.description}
        </p>
      </div>
    </div>
  </div>
));

const TelephonySection = React.memo(() => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Dedicated business phone number
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Enterprise-grade voice integration with industry-leading reliability
          </p>
        </div>

        {/* Main Feature Display */}
        <div className="relative mb-20">
          <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Left side - Visual */}
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-zinc-900/50 relative overflow-hidden border border-zinc-800/50">
                  {/* Simple Connection Line */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#F22F46] to-transparent" />
                  </div>

                  {/* Icons */}
                  <div className="absolute inset-0 flex items-center justify-between px-16">
                    <div className="bg-zinc-800/80 p-4 rounded-2xl backdrop-blur-sm border border-zinc-700/50">
                      <Phone className="w-10 h-10 text-blue-400" />
                    </div>
                    <div className="bg-zinc-800/80 p-4 rounded-2xl backdrop-blur-sm border border-zinc-700/50">
                      <svg className="w-10 h-10" viewBox="0 0 100 100" fill="#F22F46">
                        <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 88.9C28.4 88.9 11.1 71.6 11.1 50S28.4 11.1 50 11.1 88.9 28.4 88.9 50 71.6 88.9 50 88.9z"/>
                        <path d="M50 27.8c-12.3 0-22.2 9.9-22.2 22.2S37.7 72.2 50 72.2 72.2 62.3 72.2 50 62.3 27.8 50 27.8zm0 33.3c-6.1 0-11.1-5-11.1-11.1s5-11.1 11.1-11.1 11.1 5 11.1 11.1-5 11.1-11.1 11.1z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Features */}
              <div className="space-y-6">
                {TELEPHONY_FEATURES.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Benefits */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/30 rounded-xl p-6 hover:bg-zinc-800/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-[#F22F46]" />
              <h3 className="text-lg font-semibold text-white">Quick Setup</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Connect your Twilio number and start handling calls in minutes
            </p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-6 hover:bg-zinc-800/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Mic className="w-6 h-6 text-[#F22F46]" />
              <h3 className="text-lg font-semibold text-white">Voice Quality</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Crystal-clear audio powered by Twilio's enterprise infrastructure
            </p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-6 hover:bg-zinc-800/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquareQuote className="w-6 h-6 text-[#F22F46]" />
              <h3 className="text-lg font-semibold text-white">Global Reach</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Reliable voice service across multiple regions and countries
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default TelephonySection; 