'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import WordPullUp from '@/components/ui/word-pull-up'
import SparklesText from '@/components/ui/sparkles-text'
import ChatWidget from '@/app/dashboard/agenthub/workspace/ChatWidget'
import { Header } from "@/components/header"

export default function OnboardingLanding() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <WordPullUp
              words="Experience AI Conversations That Feel"
              className="text-5xl font-bold tracking-tight text-gray-600 sm:text-6xl"
            />
            <SparklesText
              text="Human"
              //className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent text-6xl sm:text-7xl font-bold"
            />
            <p className="mt-6 text-xl text-gray-500">
              Engage with our intelligent AI assistant to create your perfect onboarding experience.
              No forms, just natural conversation.
            </p>
            <div className="mt-10">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500">
                Start Your Journey
              </Button>
            </div>
            
            {/* Added ChatWidget */}
            <div className="mt-12 max-w-3xl mx-auto">
              <ChatWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="rounded-lg bg-purple-100 p-6 mb-4">
                {/* Icon */}
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Conversations</h3>
              <p className="text-gray-600">
                No more rigid forms. Our AI understands context and responds naturally.
              </p>
            </div>
            <div className="text-center">
              <div className="rounded-lg bg-blue-100 p-6 mb-4">
                {/* Icon */}
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Experience</h3>
              <p className="text-gray-600">
                Every interaction is tailored to your unique needs and preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="rounded-lg bg-purple-100 p-6 mb-4">
                {/* Icon */}
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Insights</h3>
              <p className="text-gray-600">
                Get meaningful data and analytics from every conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-500 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Transform Your Onboarding?
          </h2>
          <Button size="lg" variant="secondary" className="bg-white text-purple-600">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  )
}
