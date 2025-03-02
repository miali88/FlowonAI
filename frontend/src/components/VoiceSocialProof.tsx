'use client';

import React from "react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
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
                "I was missing 40% of my potential customers by not answering after-hours calls. Since implementing Flowon, we've increased monthly bookings by 28% and added approximately $6,400 in additional revenue."
              </blockquote>
              
              <div className="text-center">
                <p className="font-semibold">Maria Rodriguez</p>
                <p className="text-sm text-muted-foreground">Rodriguez Plumbing Services</p>
              </div>
            </div>
          </CardSpotlight>
        </div>

      </div>
    </section>
  );
} 