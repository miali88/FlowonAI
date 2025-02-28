'use client';

import { useState, memo } from "react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import Image from 'next/image';

// Shared button component
const CallToActionButton = () => (
  <div className="flex flex-col items-center relative z-20 animate-fade-in [--animation-delay:600ms]">
    <Link 
      href="#free-trial" 
      className="inline-block"
    >
      <Button size="lg" className="text-lg sm:px-8 sm:py-6 px-6 py-4 sm:text-lg text-base group bg-black hover:bg-black/90 text-white shadow-lg">
        Sign up today for 20 minutes free
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Link>
    <p className="text-sm text-gray-500 mt-2">No credit card required</p>
  </div>
);

// Mobile Hero component
const MobileHero = memo(() => (
  <section className="relative mx-auto px-4 text-center max-w-[100rem] sm:hidden 
    before:content-[''] before:absolute before:w-[30rem] before:h-[30rem] before:rounded-full before:bg-[#ff69b450] before:blur-[80px] before:-z-10 before:animate-blob before:top-[10%] before:left-[5%]
    after:content-[''] after:absolute after:w-[30rem] after:h-[30rem] after:rounded-full after:bg-[#4ea8de50] after:blur-[80px] after:-z-10 after:animate-blob after:animation-delay-2000 after:top-[20%] after:right-[5%]">
    <div className="min-h-[50dvh] flex flex-col items-center justify-start pt-8 pb-32 relative overflow-hidden">
      <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-1 text-4xl font-medium font-heading leading-[1.1] tracking-tighter text-transparent animate-fade-in [--animation-delay:200ms] caret-foreground w-full mx-auto">
        <div className="whitespace-nowrap">Excellent AI Phone</div>
        <div className="relative whitespace-nowrap mt-2">Answering Service</div>
      </h1>

      <p className="mb-2 text-sm tracking-tight text-muted-foreground text-balance animate-fade-in [--animation-delay:400ms] max-w-[90vw] mx-auto px-2">
        Flowon answers calls when you cannot. Ready to qualify new leads, provide answers, take messages, set appointments, and notifies you all the while.
      </p>

      <div className="scale-100 mt-8">
        <CallToActionButton />
      </div> 
    </div>
  </section>
));
MobileHero.displayName = 'MobileHero';

// Desktop Hero component
const DesktopHero = memo(() => (
  <section className="relative mx-auto px-4 sm:px-6 text-center md:px-8 max-w-[100rem] hidden sm:block
    before:content-[''] before:absolute before:w-[60rem] before:h-[60rem] before:rounded-full before:bg-[#ff69b450] before:blur-[100px] before:-z-10 before:animate-blob before:top-[-15%] before:left-[5%]
    after:content-[''] after:absolute after:w-[60rem] after:h-[60rem] after:rounded-full after:bg-[#4ea8de50] after:blur-[100px] after:-z-10 after:animate-blob after:animation-delay-2000 after:top-[20%] after:right-[5%]">
    <div className="min-h-[65vh] flex flex-col items-center justify-center py-16 relative overflow-hidden">
      <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-8 text-center text-5xl font-medium font-heading leading-tight tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in [--animation-delay:200ms] caret-foreground w-full mx-auto">
        <div className="whitespace-nowrap">Excellent AI Phone</div>
        <div className="relative whitespace-nowrap mt-2">Answering Service</div>
      </h1>

      <p className="mb-16 text-lg tracking-tight text-muted-foreground md:text-xl lg:text-2xl text-balance animate-fade-in [--animation-delay:400ms] max-w-3xl mx-auto">
        Flowon answers calls when you cannot. Ready to qualify new leads, provide answers, take messages, set appointments, and notifies you all the while.
      </p>

      <div className="scale-100 mt-8">
        <CallToActionButton />
      </div>
    </div>

    <div className="mt-12 flex flex-wrap justify-center gap-8 animate-fade-in [--animation-delay:800ms]">
      <div className="w-full lg:w-[45%] max-w-xl p-6 bg-black/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-sm text-white/70">Business Owner's Phone</div>
        </div>
        <div className="bg-black/30 p-4 rounded-md">
          <div className="text-xl text-center text-white font-medium">
            Never miss another call or opportunity.
          </div>
          <div className="mt-4 text-center text-white/80 text-sm">
            Flowon is there anytime you're not available. You'll never miss another opportunity just because you can't answer the phone.
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] max-w-xl p-6 bg-black/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-sm text-white/70">AI Voice Conversation</div>
        </div>
        <div className="bg-black/30 p-4 rounded-md">
          <div className="mb-3 flex items-start">
            <div className="bg-blue-500/20 p-2 rounded-md mr-2">
              <span className="text-sm text-blue-300">AI Assistant</span>
              <p className="text-xs text-white/90">Thanks for calling! How can I help you today?</p>
            </div>
          </div>
          <div className="mb-3 flex items-start justify-end">
            <div className="bg-green-500/20 p-2 rounded-md ml-2">
              <span className="text-sm text-green-300">Customer</span>
              <p className="text-xs text-white/90">I'd like to schedule a consultation.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-500/20 p-2 rounded-md mr-2">
              <span className="text-sm text-blue-300">AI Assistant</span>
              <p className="text-xs text-white/90">I'd be happy to help with that. May I have your name?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));
DesktopHero.displayName = 'DesktopHero';

export function VoiceHero() {
  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
} 