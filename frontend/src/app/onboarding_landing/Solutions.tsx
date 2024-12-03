'use client'

import React from 'react';
import { 
    Laptop, 
    Banknote, 
    HeartPulse, 
    Users, 
    ShoppingCart, 
    GraduationCap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Solutions: React.FC = () => {
  return (
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
  )
}

export default Solutions;