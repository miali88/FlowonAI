'use client'

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Brain,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LeadGenSection = () => {
  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-blue-400" />,
      title: "Smart Calendar Management",
      description: "Automatically schedules appointments while respecting your availability and preferences",
      benefits: ["Eliminates double bookings", "Manages time zones", "Sends confirmations"]
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: "Conversational Lead Qualification",
      description: "Engages potential clients in natural conversation to qualify leads effectively",
      benefits: ["Asks relevant questions", "Captures key information", "Personalizes interactions"]
    },
    {
      icon: <Target className="w-6 h-6 text-red-400" />,
      title: "Automated Lead Capture",
      description: "Never miss an opportunity with 24/7 lead capture and instant follow-up",
      benefits: ["Immediate response", "Consistent follow-up", "Quality scoring"]
    },
    {
      icon: <BarChart className="w-6 h-6 text-green-400" />,
      title: "Growth Analytics",
      description: "Track your business growth with detailed insights and analytics",
      benefits: ["Conversion tracking", "Performance metrics", "Growth insights"]
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Transform Lead Generation & Appointment Booking
          </h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Focus on growing your business while Flowon handles the scheduling and lead generation
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-8 border border-zinc-800 hover:border-zinc-600 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-300 mb-6">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 rounded-xl p-8 border border-zinc-700">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">3x</div>
              <div className="text-gray-400">More Leads Captured</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">75%</div>
              <div className="text-gray-400">Time Saved on Scheduling</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Lead Generation</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-white mb-6">
            Ready to Automate Your Lead Generation?
          </h3>
          <Button 
            size="lg"
            className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-6 text-lg group"
          >
            Start Booking More Appointments
            <ArrowRight className="ml-2 w-5 h-5 inline-block transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LeadGenSection; 