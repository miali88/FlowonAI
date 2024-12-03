'use client'

import React from 'react';
import { 
    MessageSquare, 
    UserCircle, 
    BarChart, 
    Clock,
    Shield, 
    Settings, 
    Zap, 
    Brain, 
    Fingerprint, 
    LineChart, 
    Wrench, 
    ClipboardList, 
    Check, 
    BarChart2, 
    BrainCircuit, 
    Laptop, 
    Banknote, 
    HeartPulse, 
    Users, 
    ShoppingCart, 
    GraduationCap, 
    Code2, 
    Library, 
    Database, 
    GitBranch, 
    Webhook, 
    InfoIcon, 
    TrendingUp, 
    FileX, 
    X, 
    Sparkles, 
    Target, 
    BookOpen, 
    Lightbulb, 
    Rocket 
} from 'lucide-react';
import ChatWidget from '@/app/dashboard/agenthub/workspace/ChatWidget'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

// Add type for Badge variants if needed

// Log outside component
console.log('Other.tsx - Module loaded');

const Other: React.FC = () => {
  // Add logging in useEffect
  React.useEffect(() => {
    console.log('Other - Component mounted');
  }, []);

  // Add logging before return
  console.log('Other - Rendering');

  return (
    <div className="relative">
          {/* The Psychology of Engagement Section */}
          <section className="py-20 bg-gradient-to-b from-zinc-900/50 to-transparent">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">The Psychology of Engagement</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Discover why conversations create deeper connections and yield more authentic insights than traditional forms
              </p>

              {/* Psychology Cards */}
              <div className="grid lg:grid-cols-3 gap-8 mb-16">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Natural Flow</h3>
                  <p className="text-gray-400 mb-6">
                    Humans are wired for conversation. Our AI adapts to natural speech patterns, making sharing feel effortless.
                  </p>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="text-purple-400">→ 73% prefer conversation to forms</div>
                      <div className="text-purple-400">→ 2.8x more detailed responses</div>
                      <div className="text-purple-400">→ 91% completion rate</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <HeartPulse className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Emotional Safety</h3>
                  <p className="text-gray-400 mb-6">
                    Non-judgmental AI creates a safe space for honest sharing, leading to more authentic responses.
                  </p>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="text-blue-400">→ 65% more honest feedback</div>
                      <div className="text-blue-400">→ 88% feel more comfortable</div>
                      <div className="text-blue-400">→ 3.2x deeper insights</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Human Connection</h3>
                  <p className="text-gray-400 mb-6">
                    Our AI maintains the perfect balance between professional and personable, creating engaging interactions.
                  </p>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="text-cyan-400">→ 94% positive experience</div>
                      <div className="text-cyan-400">→ 4.8/5 satisfaction rate</div>
                      <div className="text-cyan-400">→ 82% prefer AI chat</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Psychology Deep Dive */}
              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <h3 className="text-2xl font-semibold text-white mb-6">The Science of Conversation</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500/10 p-2 rounded-lg">
                        <Brain className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Cognitive Load</h4>
                        <p className="text-gray-400">Natural conversation requires 30% less mental effort than form-filling</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <HeartPulse className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Trust Building</h4>
                        <p className="text-gray-400">Adaptive responses create psychological safety for sharing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-cyan-500/10 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Social Dynamics</h4>
                        <p className="text-gray-400">Mimics natural human interaction patterns for better engagement</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-500/10 p-2 rounded-lg">
                        <Target className="w-5 h-5 text-green-400" />
                      </div>
                      <h4 className="text-white font-medium">Engagement Metrics</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">User Attention Span</span>
                          <span className="text-green-400">↑ 312%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-green-400/50 h-1.5 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Response Quality</span>
                          <span className="text-green-400">↑ 280%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-green-400/50 h-1.5 rounded-full" style={{ width: '75%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Information Retention</span>
                          <span className="text-green-400">↑ 245%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-green-400/50 h-1.5 rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-gray-400 mb-6">Experience the power of conversation-driven engagement</p>
                <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
                  Start Meaningful Conversations
                </Button>
              </div>
            </div>
          </section>

          {/* Market Intelligence Evolution Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">The Evolution of Market Intelligence</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Transform traditional market research into real-time, adaptive insights
              </p>

              

              {/* Interactive Comparison Slider */}
              <div className="relative mb-8 bg-gradient-to-r from-zinc-900/50 via-zinc-800/30 to-zinc-900/50 rounded-2xl p-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl">
                  <div className="grid lg:grid-cols-2">
                    {/* Traditional Methods */}
                    <div className="p-8 border-b lg:border-b-0 lg:border-r border-zinc-800">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-red-500/10 p-3 rounded-xl">
                          <FileX className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Traditional Methods</h3>
                          <p className="text-gray-400">Static & Time-Consuming</p>
                        </div>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-gray-400">
                          <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <span>Quarterly surveys with 3-month lag in insights</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-400">
                          <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <span>Limited to predefined questions and responses</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-400">
                          <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <span>Manual data analysis and interpretation</span>
                        </li>
                      </ul>
                    </div>

                    {/* AI-Powered Intelligence */}
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-500/10 p-3 rounded-xl">
                          <Sparkles className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">AI-Powered Intelligence</h3>
                          <p className="text-gray-400">Dynamic & Real-time</p>
                        </div>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-gray-400">
                          <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <span>Real-time insights with 5-minute data freshness</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-400">
                          <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <span>Adaptive questioning based on context</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-400">
                          <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <span>Automated pattern recognition and analysis</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* Live Market Pulse */}
              <div className="bg-black/20 rounded-2xl p-8 mb-8">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Key Metrics */}
                  <div className="col-span-2">
                    <h3 className="text-2xl font-semibold text-white mb-6">Live Market Pulse</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Customer Sentiment */}
                      <div className="bg-black/40 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Customer Sentiment</span>
                          <span className="text-green-400 font-semibold">↑ 92%</span>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Positive Feedback</span>
                            <span className="text-green-400">89%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-green-400/50 h-1.5 rounded-full" style={{ width: '89%' }} />
                          </div>
                        </div>
                      </div>

                      {/* Market Trends */}
                      <div className="bg-black/40 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Market Trends</span>
                          <span className="text-blue-400 font-semibold">Active</span>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Growth Rate</span>
                            <span className="text-blue-400">76%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-blue-400/50 h-1.5 rounded-full" style={{ width: '76%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-black/40 rounded-xl p-6">
                    <h4 className="text-white font-semibold mb-6">Real-time Metrics</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Data Freshness</span>
                          <span className="text-white">5 min</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-purple-400/50 h-1.5 rounded-full" style={{ width: '95%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Active Users</span>
                          <span className="text-white">2,847</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-blue-400/50 h-1.5 rounded-full" style={{ width: '75%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Insights Generated</span>
                          <span className="text-white">12,458</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-cyan-400/50 h-1.5 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Insights Dashboard */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-2xl p-8 mb-2">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
                      <BookOpen className="w-6 h-6 text-purple-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Learn More</h3>
                      <p className="text-gray-400 text-sm">
                        Discover how AI transforms market research
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-blue-500/50 transition-all duration-300">
                      <Lightbulb className="w-6 h-6 text-blue-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">See Demo</h3>
                      <p className="text-gray-400 text-sm">
                        Watch AI intelligence in action
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300">
                      <Rocket className="w-6 h-6 text-cyan-400 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Get Started</h3>
                      <p className="text-gray-400 text-sm">
                        Begin collecting real-time insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
    );
};

// Log the component
console.log('Other component definition:', Other);

export default Other;