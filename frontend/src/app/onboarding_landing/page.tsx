'use client'

import { Button } from '@/components/ui/button'
import WordPullUp from '@/components/ui/word-pull-up'
import SparklesText from '@/components/ui/sparkles-text'
import ChatWidget from '@/app/dashboard/agenthub/workspace/ChatWidget'
import { Header } from "@/components/header"
import { Footer } from '@/components/footer'
import { Particles } from "@/components/magicui/particles"
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
  Lightbulb 
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function OnboardingLanding() {
  return (
    <div className="overflow-x-hidden relative">
      <Header />
      <main className="w-full relative">
        <Particles
          ease={70}
          size={0.10}
          color="#ffffff"
          quantity={235}
          staticity={40}
          className="absolute inset-0 -z-10 h-full"
        />
        
        {/* Hero Section - Updated with clearer value prop */}
        <div className="mx-auto max-w-7xl">
          <section className="relative py-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <WordPullUp
                words="Say Goodbye to Boring Forms"
                className="text-5xl font-bold tracking-tight text-white sm:text-6xl"
              />
              <SparklesText
                text="Hello Natural Conversations"
                className="text-6xl sm:text-7xl font-bold text-white"
              />
              <p className="mt-6 text-xl text-gray-300">
                Complete your user onboarding in under 3 minutes with AI-powered conversations
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </div>
          </section>

          {/* New Data Collection Tools Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Supercharge Your Customer Intelligence</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Transform traditional forms into engaging conversations that capture deeper insights
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Forms Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800 hover:border-purple-500/50 transition-all">
                    <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <ClipboardList className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Smart Forms</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-400" />
                        <span>Dynamic form fields that adapt in real-time</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-400" />
                        <span>Conditional logic for personalized flows</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-purple-400" />
                        <span>3x higher completion rates</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Surveys Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800 hover:border-blue-500/50 transition-all">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <BarChart2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">AI Surveys</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-400" />
                        <span>Natural conversation flow</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-400" />
                        <span>Rich data visualization</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-400" />
                        <span>Sentiment analysis included</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Quizzes Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800 hover:border-cyan-500/50 transition-all">
                    <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <BrainCircuit className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Interactive Quizzes</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-cyan-400" />
                        <span>Gamified data collection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-cyan-400" />
                        <span>Detailed response analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-cyan-400" />
                        <span>Customer preference insights</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Insights Banner */}
              <div className="mt-12 bg-gradient-to-r from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-2">Turn Responses into Revenue</h3>
                    <p className="text-gray-300">
                      Get actionable insights from every interaction. Understand your customers better than ever before.
                    </p>
                  </div>
                  <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold whitespace-nowrap">
                    Start Collecting Data
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features Section - New */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-12">Key Features</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-6 h-6 text-white/80" />
                    <h3 className="text-xl font-semibold text-white">AI-Powered Chat</h3>
                  </div>
                  <p className="text-gray-300">
                    Natural conversations that understand context and user intent
                  </p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-6 h-6 text-white/80" />
                    <h3 className="text-xl font-semibold text-white">Fast Setup</h3>
                  </div>
                  <p className="text-gray-300">
                    Complete onboarding in minutes instead of hours
                  </p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-6 h-6 text-white/80" />
                    <h3 className="text-xl font-semibold text-white">Customizable</h3>
                  </div>
                  <p className="text-gray-300">
                    Fully adaptable to your brand and workflow
                  </p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-6 hover:border hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCircle className="w-6 h-6 text-white/80" />
                    <h3 className="text-xl font-semibold text-white">Smart Data Collection</h3>
                  </div>
                  <p className="text-gray-300">
                    Intelligently gather user information without repetitive questions
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats/Metrics Section - Removed outer box background */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                  <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                    <div className="text-purple-400 text-sm font-medium mb-2">Average Time</div>
                    <div className="text-4xl font-bold text-white mb-1">2.5min</div>
                    <div className="text-white/60 text-sm">Onboarding Completion</div>
                    <div className="absolute top-4 right-4">
                      <span className="text-green-400 text-sm font-medium">↑ 95%</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                  <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                    <div className="text-blue-400 text-sm font-medium mb-2">Total Users</div>
                    <div className="text-4xl font-bold text-white mb-1">10k+</div>
                    <div className="text-white/60 text-sm">Successful Onboardings</div>
                    <div className="absolute top-4 right-4">
                      <span className="text-green-400 text-sm font-medium">↑ 80%</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                  <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                    <div className="text-cyan-400 text-sm font-medium mb-2">Satisfaction</div>
                    <div className="text-4xl font-bold text-white mb-1">4.9/5</div>
                    <div className="text-white/60 text-sm">User Rating</div>
                    <div className="absolute top-4 right-4">
                      <span className="text-green-400 text-sm font-medium">↑ 98%</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                  <div className="relative bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                    <div className="text-teal-400 text-sm font-medium mb-2">Analytics</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Completion</span>
                        <span className="text-white font-medium">85%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Engagement</span>
                        <span className="text-white font-medium">92%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section - New */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Why Choose FlowonAI?</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Transform your user onboarding experience with our cutting-edge AI solution
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast Setup</h3>
                  <p className="text-gray-400">
                    Get up and running in minutes, not days. Our no-code solution makes integration seamless.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Intelligence</h3>
                  <p className="text-gray-400">
                    Advanced natural language processing ensures smooth, context-aware conversations.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Fingerprint className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Personalized Experience</h3>
                  <p className="text-gray-400">
                    Each interaction is tailored to your users' needs and preferences.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
                  <div className="bg-gradient-to-br from-teal-500/10 to-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <LineChart className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Detailed Analytics</h3>
                  <p className="text-gray-400">
                    Track completion rates, user engagement, and optimize your onboarding flow.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Enterprise-Ready</h3>
                  <p className="text-gray-400">
                    Built with security and scalability in mind to handle any size operation.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-8 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
                  <div className="bg-gradient-to-br from-emerald-500/10 to-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Full Customization</h3>
                  <p className="text-gray-400">
                    Adapt the onboarding flow to match your brand and specific requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chat Widget Demo Section - Updated with new header */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Onboarding Agent</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Experience our AI-powered onboarding assistant in action. Try it out below!
              </p>
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8">
                <ChatWidget agentId="your-default-agent-id" />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="rounded-lg bg-zinc-900/50 backdrop-blur-xl p-6 mb-4 border border-zinc-800 flex items-center justify-center">
                    <MessageSquare className="w-12 h-12 text-white/80" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Natural Conversations</h3>
                  <p className="text-gray-300">
                    No more rigid forms. Our AI understands context and responds naturally.
                  </p>
                </div>
                <div className="text-center">
                  <div className="rounded-lg bg-zinc-900/50 backdrop-blur-xl p-6 mb-4 border border-zinc-800 flex items-center justify-center">
                    <UserCircle className="w-12 h-12 text-white/80" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Personalized Experience</h3>
                  <p className="text-gray-300">
                    Every interaction is tailored to your unique needs and preferences.
                  </p>
                </div>
                <div className="text-center">
                  <div className="rounded-lg bg-zinc-900/50 backdrop-blur-xl p-6 mb-4 border border-zinc-800 flex items-center justify-center">
                    <BarChart className="w-12 h-12 text-white/80" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Instant Insights</h3>
                  <p className="text-gray-300">
                    Get meaningful data and analytics from every conversation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section - Updated */}
          <section className="py-20">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border-zinc-800">
                  <AccordionTrigger className="text-white">How long does implementation take?</AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Our platform can be integrated within hours, with most customers going live within a day.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-zinc-800">
                  <AccordionTrigger className="text-white">Can I customize the conversation flow?</AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    Absolutely! Our platform is fully customizable to match your brand and requirements.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-zinc-800">
                  <AccordionTrigger className="text-white">What kind of support do you offer?</AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    We provide 24/7 technical support and dedicated customer success managers for enterprise plans.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-zinc-900/50 backdrop-blur-xl border-y border-zinc-800 py-20">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold text-white mb-8">
                Ready to Transform Your Onboarding?
              </h2>
              <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
                Get Started Now
              </Button>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Onboarding Solutions For Every Need</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Discover how FlowonAI transforms various onboarding scenarios into engaging experiences
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* SaaS User Onboarding */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <Laptop className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">SaaS User Onboarding</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li>• Product feature preferences</li>
                      <li>• Team size and structure</li>
                      <li>• Integration requirements</li>
                      <li>• Usage goals and metrics</li>
                    </ul>
                  </div>
                </div>

                {/* Financial Services */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <Banknote className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Financial Services</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li>• KYC verification</li>
                      <li>• Risk assessment</li>
                      <li>• Investment preferences</li>
                      <li>• Financial goals</li>
                    </ul>
                  </div>
                </div>

                {/* Healthcare Intake */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <HeartPulse className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Healthcare Intake</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li>• Medical history</li>
                      <li>• Symptom assessment</li>
                      <li>• Insurance verification</li>
                      <li>• Appointment scheduling</li>
                    </ul>
                  </div>
                </div>

                {/* Employee Onboarding */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="bg-teal-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <Users className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Employee Onboarding</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li>• Document collection</li>
                      <li>• Benefits enrollment</li>
                      <li>• Equipment requests</li>
                      <li>• Training preferences</li>
                    </ul>
                  </div>
                </div>

                {/* E-commerce Registration */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="bg-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <ShoppingCart className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">E-commerce Registration</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li>• Shopping preferences</li>
                      <li>• Size profiling</li>
                      <li>• Style assessment</li>
                      <li>• Loyalty program enrollment</li>
                    </ul>
                  </div>
                </div>

                {/* Educational Enrollment */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="bg-yellow-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <GraduationCap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Educational Enrollment</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li>• Course selection</li>
                      <li>• Learning style assessment</li>
                      <li>• Prerequisites verification</li>
                      <li>• Resource requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Use Case CTA */}
              <div className="mt-12 text-center">
                <p className="text-gray-400 mb-6">Don't see your use case? Our AI can be customized for any onboarding scenario.</p>
                <Button size="lg" variant="outline" className="hover:bg-white hover:text-black transition-all">
                  Contact Sales for Custom Solutions
                </Button>
              </div>
            </div>
          </section>

          {/* AI Customization & Data Collection Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Tailor Your AI for Smarter Data Collection</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Train FlowonAI to gather exactly the data your industry needs, in the way your customers prefer
              </p>

              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Interactive Preview */}
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Customizable AI Behaviors</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Conversation Style</span>
                        <Switch />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Professional</Badge>
                        <Badge variant="secondary">Casual</Badge>
                        <Badge variant="secondary">Friendly</Badge>
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Data Validation Rules</span>
                        <Switch />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Required Fields</Badge>
                        <Badge variant="secondary">Format Check</Badge>
                        <Badge variant="secondary">Custom Logic</Badge>
                      </div>
                    </div>

                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Response Handling</span>
                        <Switch />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Auto-Correct</Badge>
                        <Badge variant="secondary">Suggestions</Badge>
                        <Badge variant="secondary">Clarification</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry Templates */}
                <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Library className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Pre-built Industry Templates</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer">
                      <h4 className="text-white font-medium mb-2">E-commerce</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Purchase history analysis</li>
                        <li>• Style preferences</li>
                        <li>• Size profiling</li>
                      </ul>
                    </div>

                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer">
                      <h4 className="text-white font-medium mb-2">Healthcare</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Medical history</li>
                        <li>• Symptom tracking</li>
                        <li>• Treatment preferences</li>
                      </ul>
                    </div>

                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer">
                      <h4 className="text-white font-medium mb-2">Financial</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Risk assessment</li>
                        <li>• Investment goals</li>
                        <li>• Portfolio tracking</li>
                      </ul>
                    </div>

                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer">
                      <h4 className="text-white font-medium mb-2">Education</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Learning style</li>
                        <li>• Course preferences</li>
                        <li>• Skill assessment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Collection Features */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Smart Data Storage</h3>
                  </div>
                  <p className="text-gray-300">
                    Automatically organize and categorize collected data for easy analysis and reporting
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Conditional Logic</h3>
                  </div>
                  <p className="text-gray-300">
                    Create dynamic conversations that adapt based on previous responses
                  </p>
                </div>

                <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Webhook className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">API Integration</h3>
                  </div>
                  <p className="text-gray-300">
                    Connect with your existing tools to automate data flow and analysis
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Journey Section */}
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
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                    <h3 className="text-xl font-semibold text-white mb-6">Traditional Forms</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Setup Time</span>
                          <span className="text-red-400">2-3 Weeks</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-red-400/50 h-1.5 rounded-full" style={{ width: '30%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Data Quality</span>
                          <span className="text-red-400">Basic</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-red-400/50 h-1.5 rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Completion Rate</span>
                          <span className="text-red-400">~35%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-red-400/50 h-1.5 rounded-full" style={{ width: '35%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                    <h3 className="text-xl font-semibold text-white mb-6">FlowonAI Forms</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Setup Time</span>
                          <span className="text-green-400">5 Minutes</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-green-400/50 h-1.5 rounded-full" style={{ width: '95%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Data Quality</span>
                          <span className="text-green-400">Rich Insights</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-green-400/50 h-1.5 rounded-full" style={{ width: '90%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Completion Rate</span>
                          <span className="text-green-400">~85%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-green-400/50 h-1.5 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
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

          {/* ROI Calculator Section */}
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
                          // Add your state management here
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
                          // Add your state management here
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
                          // Add your state management here
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
                        <div className="text-3xl font-bold text-white">+2,400</div>
                        <div className="text-green-400 text-sm">↑ 150% increase</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Revenue Impact</div>
                        <div className="text-3xl font-bold text-white">$480,000</div>
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

          {/* Data Quality & Engagement Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Beyond Basic Forms: Deep Customer Understanding</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Transform tedious form-filling into engaging conversations that users actually enjoy completing
              </p>

              {/* Comparison Cards */}
              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                {/* Traditional Forms */}
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-xl" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-red-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                        <FileX className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white">Traditional Forms</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/40 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Completion Rate</span>
                          <span className="text-red-400">35%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-red-400/50 h-2 rounded-full" style={{ width: '35%' }} />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Users abandon due to form fatigue</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-400">
                          <X className="w-5 h-5 text-red-400" />
                          <span>Generic, one-size-fits-all questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <X className="w-5 h-5 text-red-400" />
                          <span>Limited context gathering</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <X className="w-5 h-5 text-red-400" />
                          <span>Static, rigid response options</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <X className="w-5 h-5 text-red-400" />
                          <span>No personalization or adaptation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FlowonAI Forms */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white">FlowonAI Conversations</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/40 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Completion Rate</span>
                          <span className="text-blue-400">85%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-blue-400/50 h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Users engage in natural conversation flow</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Check className="w-5 h-5 text-blue-400" />
                          <span>Dynamic, contextual conversations</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Check className="w-5 h-5 text-blue-400" />
                          <span>Rich, qualitative data collection</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Check className="w-5 h-5 text-blue-400" />
                          <span>Adaptive follow-up questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Check className="w-5 h-5 text-blue-400" />
                          <span>Personalized user experience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Insights Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Behavioral Insights</h3>
                  </div>
                  <p className="text-gray-300">
                    Understand user preferences and decision-making patterns through natural conversation flow
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <LineChart className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Market Intelligence</h3>
                  </div>
                  <p className="text-gray-300">
                    Aggregate insights reveal market trends and opportunities for business growth
                  </p>
                </div>

                <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">Predictive Analysis</h3>
                  </div>
                  <p className="text-gray-300">
                    AI-powered insights help forecast customer needs and market evolution
                  </p>
                </div>
              </div>

              {/* Data Quality Metrics */}
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800/50 rounded-xl p-8">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">3x</div>
                    <div className="text-gray-400">More Data Points</div>
                    <div className="text-blue-400 text-sm">per user session</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">85%</div>
                    <div className="text-gray-400">Completion Rate</div>
                    <div className="text-blue-400 text-sm">vs 35% industry average</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">92%</div>
                    <div className="text-gray-400">Data Accuracy</div>
                    <div className="text-blue-400 text-sm">through AI validation</div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">4.8/5</div>
                    <div className="text-gray-400">User Satisfaction</div>
                    <div className="text-blue-400 text-sm">engagement score</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Future of Customer Understanding Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">The Future of Customer Understanding</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Move beyond static forms into an era of dynamic, AI-powered conversations that truly understand your customers
              </p>

              {/* Evolution Timeline */}
              <div className="grid lg:grid-cols-3 gap-8 mb-16">
                <div className="relative group">
                  <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-xl" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="text-red-400 text-sm font-medium mb-4">PAST</div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Static Forms</h3>
                    <div className="space-y-4">
                      <p className="text-gray-300">One-way data collection with no context</p>
                      <div className="bg-black/40 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileX className="w-5 h-5 text-red-400" />
                          <span className="text-gray-400">Generic Questions</span>
                        </div>
                        <div className="pl-7 text-sm text-gray-500">
                          "What is your budget?"
                          <br />
                          "How many employees?"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="text-blue-400 text-sm font-medium mb-4">PRESENT</div>
                    <h3 className="text-2xl font-semibold text-white mb-4">AI Conversations</h3>
                    <div className="space-y-4">
                      <p className="text-gray-300">Interactive dialogue with contextual understanding</p>
                      <div className="bg-black/40 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                          <span className="text-gray-400">Natural Dialogue</span>
                        </div>
                        <div className="pl-7 text-sm text-gray-500">
                          "Tell me about your current challenges..."
                          <br />
                          "How would that impact your team?"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-500/5 rounded-2xl blur-xl" />
                  <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800">
                    <div className="text-purple-400 text-sm font-medium mb-4">FUTURE</div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Predictive Intelligence</h3>
                    <div className="space-y-4">
                      <p className="text-gray-300">Anticipating needs through deep understanding</p>
                      <div className="bg-black/40 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-400">Proactive Insights</span>
                        </div>
                        <div className="pl-7 text-sm text-gray-500">
                          "Based on your growth, you might need..."
                          <br />
                          "We've noticed a trend in your industry..."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white">Why Conversations Matter</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Target className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Natural Information Flow</h4>
                        <p className="text-gray-400">Users share more when they&apos;re engaged in a conversation rather than filling out fields</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <BrainCircuit className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Contextual Understanding</h4>
                        <p className="text-gray-400">AI remembers previous responses and asks relevant follow-up questions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <LineChart className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Deeper Insights</h4>
                        <p className="text-gray-400">Uncover hidden opportunities and patterns in customer responses</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Showcase */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-zinc-800">
                  <h3 className="text-2xl font-semibold text-white mb-6">The Impact</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-4xl font-bold text-white mb-2">87%</div>
                      <div className="text-gray-400">Users prefer conversational interfaces</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-white mb-2">3.5x</div>
                      <div className="text-gray-400">More detailed responses</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-white mb-2">92%</div>
                      <div className="text-gray-400">Higher completion rate</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-white mb-2">2x</div>
                      <div className="text-gray-400">Faster market insights</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
                  Join the Future of Customer Understanding
                </Button>
              </div>
            </div>
          </section>

          {/* Beyond Simple Questions Section */}
          <section className="py-20 bg-gradient-to-b from-transparent to-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Beyond Simple Questions</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Our AI doesn't just ask questions - it builds genuine understanding through natural conversation, uncovering deeper insights with each interaction
              </p>

              {/* Depth of Understanding Cards */}
              <div className="grid lg:grid-cols-3 gap-8 mb-16">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Adaptive Dialogue</h3>
                  <p className="text-gray-400 mb-6">
                    Each response shapes the conversation, creating a unique journey of discovery for every user
                  </p>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="text-gray-500">Initial: "What are your goals?"</div>
                      <div className="text-blue-400">→ "How do those goals align with your current challenges?"</div>
                      <div className="text-blue-400">→ "What's holding you back from achieving them?"</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Emotional Intelligence</h3>
                  <p className="text-gray-400 mb-6">
                    Recognizes subtle cues and adjusts conversation tone to create comfortable, open dialogue
                  </p>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="text-gray-500">User: "It's been challenging lately..."</div>
                      <div className="text-purple-400">→ Recognizes uncertainty</div>
                      <div className="text-purple-400">→ Offers supportive follow-up</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <div className="bg-cyan-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Pattern Recognition</h3>
                  <p className="text-gray-400 mb-6">
                    Identifies underlying patterns and motivations that even users might not be consciously aware of
                  </p>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="text-gray-500">Analyzes response patterns</div>
                      <div className="text-cyan-400">→ Uncovers hidden preferences</div>
                      <div className="text-cyan-400">→ Predicts future needs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deep Understanding Showcase */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-zinc-800 mb-16">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-6">Understanding at Scale</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <Brain className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Behavioral Analysis</h4>
                          <p className="text-gray-400">Understands decision-making patterns and underlying motivations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                          <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Predictive Insights</h4>
                          <p className="text-gray-400">Anticipates needs and concerns before they're expressed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-cyan-500/10 p-2 rounded-lg">
                          <LineChart className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Trend Analysis</h4>
                          <p className="text-gray-400">Identifies emerging patterns across conversations</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-black/40 rounded-lg p-6">
                      <h4 className="text-white font-medium mb-4">Depth of Understanding</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Surface Level</span>
                            <span className="text-blue-400">100%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-blue-400/50 h-1.5 rounded-full" style={{ width: '100%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Behavioral Patterns</span>
                            <span className="text-purple-400">95%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-purple-400/50 h-1.5 rounded-full" style={{ width: '95%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-gray-400 mb-6">Ready to understand your customers at a deeper level?</p>
                <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
                  Start Meaningful Conversations
                </Button>
              </div>
            </div>
          </section>

          {/* Data That Tells a Story Section */}
          <section className="py-20 bg-gradient-to-b from-zinc-900/50 to-transparent">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-white mb-4">Data That Tells a Story</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Transform fragmented responses into coherent narratives that reveal the complete picture of your customers&apos; journey
              </p>

              {/* Story Building Visualization */}
              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-8 border border-zinc-800">
                  <h3 className="text-2xl font-semibold text-white mb-6">From Conversations to Insights</h3>
                  <div className="space-y-6">
                    <div className="relative pl-8 border-l-2 border-blue-500/30">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-400"></div>
                      <h4 className="text-blue-400 font-medium mb-2">Initial Interaction</h4>
                      <p className="text-gray-400">Gathering context and understanding primary needs</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-purple-500/30">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500/20 border-2 border-purple-400"></div>
                      <h4 className="text-purple-400 font-medium mb-2">Deep Discovery</h4>
                      <p className="text-gray-400">Uncovering underlying motivations and challenges</p>
                    </div>
                    <div className="relative pl-8 border-l-2 border-cyan-500/30">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-500/20 border-2 border-cyan-400"></div>
                      <h4 className="text-cyan-400 font-medium mb-2">Pattern Recognition</h4>
                      <p className="text-gray-400">Connecting dots across multiple interactions</p>
                    </div>
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500/20 border-2 border-green-400"></div>
                      <h4 className="text-green-400 font-medium mb-2">Actionable Narrative</h4>
                      <p className="text-gray-400">Complete understanding that drives decision-making</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="text-white font-medium">Narrative Intelligence</h4>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Our AI doesn&apos;t just collect data points - it weaves them into meaningful stories that reveal the full context of customer needs
                    </p>
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Traditional Data:</div>
                      <div className="text-blue-400 text-sm">&quot;Budget: $50k, Team: 20 people&quot;</div>
                      <div className="text-sm text-gray-500 mt-3">Story-Driven Insight:</div>
                      <div className="text-blue-400 text-sm">&quot;Growing startup prioritizing efficiency, looking to scale operations while maintaining team agility&quot;</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 rounded-xl p-6 border border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-500/10 p-2 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-purple-400" />
                      </div>
                      <h4 className="text-white font-medium">Contextual Understanding</h4>
                    </div>
                    <p className="text-gray-400">
                      Every response adds depth to the narrative, creating a comprehensive view of your customer&apos;s world
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-semibold">
                  Start Building Your Customer Story
                </Button>
              </div>
            </div>
          </section>
          <Footer />
        </div>
      </main>
    </div>
  )
}