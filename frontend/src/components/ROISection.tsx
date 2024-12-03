'use client'

import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  CreditCard
} from 'lucide-react';

const ROISection = () => {
  const conversionMetrics = {
    before: {
      rate: "1.64%",
      funnel: {
        added: "154 sessions",
        checkout: "58 sessions",
        converted: "38 sessions"
      }
    },
    after: {
      rate: "6.61%",
      funnel: {
        added: "708 sessions",
        checkout: "472 sessions",
        converted: "327 sessions"
      }
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Transform Your Conversion Rates
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            See the dramatic improvement in business performance with Flowon AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20">
          {/* Before Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent rounded-xl -z-10" />
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-zinc-800">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-medium text-red-400 tracking-wider uppercase">Without Flowon</span>
                <span className="text-5xl font-bold text-red-500">{conversionMetrics.before.rate}</span>
              </div>

              <div className="space-y-8">
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Added to Cart</span>
                    <span className="text-gray-400 text-sm">{conversionMetrics.before.funnel.added}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-gradient-to-r from-red-500/40 to-red-500/60 rounded-full"></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Reached Checkout</span>
                    <span className="text-gray-400 text-sm">{conversionMetrics.before.funnel.checkout}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[40%] bg-gradient-to-r from-red-500/40 to-red-500/60 rounded-full"></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Converted</span>
                    <span className="text-gray-400 text-sm">{conversionMetrics.before.funnel.converted}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[20%] bg-gradient-to-r from-red-500/40 to-red-500/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* After Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent rounded-xl -z-10" />
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-zinc-800">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-medium text-green-400 tracking-wider uppercase">With Flowon</span>
                <span className="text-5xl font-bold text-green-500">{conversionMetrics.after.rate}</span>
              </div>

              <div className="space-y-8">
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Added to Cart</span>
                    <span className="text-gray-400 text-sm">{conversionMetrics.after.funnel.added}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-gradient-to-r from-green-500/40 to-green-500/60 rounded-full"></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Reached Checkout</span>
                    <span className="text-gray-400 text-sm">{conversionMetrics.after.funnel.checkout}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-gradient-to-r from-green-500/40 to-green-500/60 rounded-full"></div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">Converted</span>
                    <span className="text-gray-400 text-sm">{conversionMetrics.after.funnel.converted}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-gradient-to-r from-green-500/40 to-green-500/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Improvements */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">4.6x</div>
                <div className="text-gray-400 text-sm">More Cart Additions</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Increased product interest through intelligent engagement
            </p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">8.1x</div>
                <div className="text-gray-400 text-sm">More Checkouts</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Better conversion through streamlined customer journey
            </p>
          </div>

          <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">8.6x</div>
                <div className="text-gray-400 text-sm">More Sales</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Dramatically improved overall conversion rates
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROISection; 