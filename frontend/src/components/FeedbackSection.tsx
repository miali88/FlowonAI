'use client'

import React from 'react';
import { MessageSquare, BarChart2, Settings, ThumbsUp, ThumbsDown, Star, User, Bot } from 'lucide-react';

export default function FeedbackSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Effortless Feedback Collection
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Leverage Flowon to seamlessly gather and analyze feedback, transforming customer interactions into actionable insights.
          </p>
        </div>
      
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 p-8 bg-zinc-900/30">
            <MessageSquare className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">Automated Collection</h3>
            <p className="mt-4 text-gray-400">
              Gather feedback effortlessly during conversations, eliminating the need for separate surveys or forms.
            </p>
          </div>
          
          <div className="rounded-2xl border border-zinc-800 p-8 bg-zinc-900/30">
            <BarChart2 className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">Smart Summaries</h3>
            <p className="mt-4 text-gray-400">
              Access detailed analytics and actionable summaries of feedback to make informed decisions.
            </p>
          </div>
          
          <div className="rounded-2xl border border-zinc-800 p-8 bg-zinc-900/30">
            <Settings className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">Versatile Platform</h3>
            <p className="mt-4 text-gray-400">
              Adaptable for onboarding, customer service, and more, Flowon is your go-to for valuable insights.
            </p>
          </div>
        </div>

        {/* Feedback Example */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            See Flowon in Action
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Input */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Customer Feedback</h4>
              </div>
              <p className="text-gray-300">
                "Had dinner at Bella Italia last night. The pasta was amazing and cooked perfectly al dente. Our server, Sarah, was very attentive and made great wine recommendations. Only downside was the 25-minute wait for our table despite having a reservation. The host seemed a bit overwhelmed with the weekend crowd."
              </p>
            </div>

            {/* AI Analysis */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-semibold text-white">Flowon Analysis</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">High food quality and service excellence</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">Reservation system and host staffing issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Action needed: Review weekend staffing levels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 