'use client'

import React from 'react';
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ThreeStep: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Get Started in Minutes, Not Months</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Traditional forms take weeks to implement and collect basic data. FlowonAI deploys instantly and gathers rich customer insights from day one.
        </p>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-cyan-500/50 hidden md:block" />

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div className="md:text-right">
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                  <span className="text-purple-400 text-sm font-medium mb-2 block">STEP 1 • 2 MINUTES</span>
                  <h3 className="text-2xl font-semibold text-white mb-4">Connect Your Platform</h3>
                  <p className="text-gray-300 mb-4">
                    Simple copy-paste integration. No complex coding required.
                  </p>
                  <div className="flex md:justify-end gap-2">
                    <Badge variant="secondary">One-Click Install</Badge>
                    <Badge variant="secondary">API Ready</Badge>
                  </div>
                </div>
              </div>
              <div className="hidden md:block" />
            </div>

            {/* Step 2 */}
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div className="hidden md:block" />
              <div>
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                  <span className="text-blue-400 text-sm font-medium mb-2 block">STEP 2 • 3 MINUTES</span>
                  <h3 className="text-2xl font-semibold text-white mb-4">Choose Your Template</h3>
                  <p className="text-gray-300 mb-4">
                    Select from industry-specific templates or customize your own flow.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">20+ Templates</Badge>
                    <Badge variant="secondary">Drag & Drop</Badge>
                    <Badge variant="secondary">AI Optimized</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div className="md:text-right">
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                  <span className="text-cyan-400 text-sm font-medium mb-2 block">STEP 3 • INSTANT</span>
                  <h3 className="text-2xl font-semibold text-white mb-4">Start Collecting Data</h3>
                  <p className="text-gray-300 mb-4">
                    AI immediately begins engaging users and gathering insights.
                  </p>
                  <div className="flex md:justify-end gap-2">
                    <Badge variant="secondary">Real-time Analytics</Badge>
                    <Badge variant="secondary">Smart Insights</Badge>
                  </div>
                </div>
              </div>
              <div className="hidden md:block" />
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="mt-24 grid md:grid-cols-2 gap-8">
            {/* ... rest of the comparison metrics and CTA ... */}
          </div>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6">Ready to revolutionize your data collection?</p>
            <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
              Start Your 5-Minute Setup
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeStep;
