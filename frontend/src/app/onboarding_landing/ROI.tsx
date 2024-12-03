'use client'

import React, { useState } from 'react';
import { InfoIcon, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROI: React.FC = () => {
  const [visitors, setVisitors] = useState(100);
  const [completionRate, setCompletionRate] = useState(0);
  const [customerValue, setCustomerValue] = useState(10);

  // Calculate projected returns
  const calculateReturns = () => {
    const additionalConversions = Math.round(visitors * (completionRate / 100) * 1.5); // 150% increase
    const revenueImpact = additionalConversions * customerValue;
    return { additionalConversions, revenueImpact };
  };

  const { additionalConversions, revenueImpact } = calculateReturns();

  return (
    <section className="py-20">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-white mb-4">Calculate Your Return on Intelligence</h2>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        See how FlowonAI's smart data collection transforms into measurable business growth and customer insights
      </p>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Calculator Inputs */}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
          <h3 className="text-2xl font-semibold text-white mb-6">Your Business Metrics</h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-gray-300 mb-2 block">Monthly Website Visitors</label>
              <div className="relative">
                <input 
                  type="range" 
                  min="100" 
                  max="100000" 
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  value={visitors}
                  onChange={(e) => setVisitors(Number(e.target.value))}
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>100</span>
                  <span>50,000</span>
                  <span>100,000</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-gray-300 mb-2 block">Current Form Completion Rate (%)</label>
              <div className="relative">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  value={completionRate}
                  onChange={(e) => setCompletionRate(Number(e.target.value))}
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-gray-300 mb-2 block">Average Customer Value ($)</label>
              <div className="relative">
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  value={customerValue}
                  onChange={(e) => setCustomerValue(Number(e.target.value))}
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>$10</span>
                  <span>$500</span>
                  <span>$1,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400">
              <InfoIcon className="w-5 h-5" />
              <span className="text-sm">FlowonAI typically increases form completion by 150% and data quality by 300%</span>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="space-y-8">
          {/* Projected Returns Card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-8 border border-zinc-800">
            <h3 className="text-2xl font-semibold text-white mb-6">Projected Annual Returns</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Additional Conversions</div>
                <div className="text-3xl font-bold text-white">+{additionalConversions}</div>
                <div className="text-green-400 text-sm">↑ 150% increase</div>
              </div>
              
              <div>
                <div className="text-gray-400 text-sm mb-1">Revenue Impact</div>
                <div className="text-3xl font-bold text-white">${revenueImpact}</div>
                <div className="text-green-400 text-sm">Based on your metrics</div>
              </div>
            </div>
          </div>

          {/* Data Insights Value */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-8 border border-zinc-800">
            <h3 className="text-2xl font-semibold text-white mb-6">Long-term Intelligence Value</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Customer Preference Insights</span>
                  <span className="text-cyan-400">300% More Data</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-cyan-400/50 h-1.5 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Market Trend Analysis</span>
                  <span className="text-cyan-400">Real-time Updates</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-cyan-400/50 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Customer Satisfaction</span>
                  <span className="text-cyan-400">90% Improvement</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-cyan-400/50 h-1.5 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Competitive Advantage Card */}
          <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Your Competitive Edge</span>
            </div>
            <p className="text-gray-400 mt-2">
              Companies using AI-powered data collection are 3x more likely to outperform competitors in customer retention and market share.
            </p>
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      <div className="mt-12 bg-gradient-to-r from-zinc-900 to-zinc-800/50 rounded-xl p-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-gray-400 mb-2">Monthly Investment</div>
            <div className="text-3xl font-bold text-white">$299</div>
            <div className="text-green-400 text-sm">Fixed pricing</div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400 mb-2">ROI Timeline</div>
            <div className="text-3xl font-bold text-white">3-6</div>
            <div className="text-green-400 text-sm">Months to positive ROI</div>
          </div>
          
          <div className="text-center">
            <div className="text-gray-400 mb-2">Data Value Growth</div>
            <div className="text-3xl font-bold text-white">↑ 10x</div>
            <div className="text-green-400 text-sm">Year over year</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
          Start Your Investment in Intelligence
        </Button>
      </div>
    </div>
  </section>
  );
};

export default ROI;
