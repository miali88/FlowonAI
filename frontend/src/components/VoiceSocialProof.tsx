'use client';

import React from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";

export function VoiceSocialProof() {
  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Trusted by Local Businesses Like Yours
          </h2>
        </div>

        <div className="mx-auto max-w-4xl mb-12">
          <CardSpotlight className="p-8 bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="flex flex-col items-center space-y-4">
    
              
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-lg md:text-xl italic text-center">
                "I was missing 40% of my potential customers by not answering after-hours calls. Since implementing this AI assistant, we've increased monthly bookings by 32% and added approximately $8,400 in additional revenue."
              </blockquote>
              
              <div className="text-center">
                <p className="font-semibold">Maria Rodriguez</p>
                <p className="text-sm text-muted-foreground">Rodriguez Plumbing Services</p>
              </div>
            </div>
          </CardSpotlight>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">92%</div>
            <p className="text-muted-foreground">of callers complete the entire conversation with our AI</p>
          </div>
          
          <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">4.8/5</div>
            <p className="text-muted-foreground">average caller satisfaction rating</p>
          </div>
          
          <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">$4,200</div>
            <p className="text-muted-foreground">average additional monthly revenue reported by users</p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { name: "John's Auto Repair", industry: "Automotive" },
            { name: "Sunset Dental", industry: "Healthcare" },
            { name: "Bright Home Realty", industry: "Real Estate" },
            { name: "Metro IT Solutions", industry: "Technology" }
          ].map((business, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <span className="text-xl font-bold">{business.name.charAt(0)}</span>
              </div>
              <h3 className="font-medium">{business.name}</h3>
              <p className="text-sm text-muted-foreground">{business.industry}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 