'use client';

import { useState } from "react";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { BentoDemo } from "@/components/AgentDemo";
import WordRotate from "@/components/ui/word-rotate";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  // Simplified state management - removed unused state
  const [isStreaming, setIsStreaming] = useState(false);

  const handleGridClick = () => {
    // Only handle streaming state reset
    if (isStreaming) {
      setIsStreaming(false);
    }
  };
  
  // Mobile Component (only shows below sm breakpoint)
  const MobileHero = () => (
    <section className="relative mx-auto px-4 text-center max-w-[100rem] sm:hidden">
      <div className="min-h-[100dvh] flex flex-col items-center justify-center">
        {/* <div className="inline-flex h-10 items-center justify-between rounded-full border bg-secondary text-secondary-foreground px-4 text-sm transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in mb-6">
          <TextShimmer className="inline-flex items-center justify-center">
            <span className="text-sm text-secondary-foreground/60">
              ✨ Forms, a new way to collect info from callers
            </span>
          </TextShimmer>
        </div> */}
        
        <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-4 text-4xl font-medium font-heading leading-[1.1] tracking-tighter text-transparent translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground max-w-[95vw]">
          <span className="whitespace-normal">Give Your Website A Voice That</span>{" "}
          <WordRotate words={["Drives Conversion", 
                              "Answers Questions", 
                              "Engages With Visitors", 
                              "Books Appointments",
                              "Onboards Users"]} />
        </h1>

        <p className="mb-8 text-sm tracking-tight text-muted-foreground text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-[90vw] mx-auto px-2">
          Easily deploy AI agents to your website to assist with prospecting, appointment booking,
          customer service, and more
        </p>

        <div className="scale-100">
          <Link 
            href="https://calendly.com/michael-flowon/30min" 
            className="inline-block relative z-20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              className="translate-y-[-1rem] animate-fade-in gap-1 rounded-lg opacity-0 ease-in-out [--animation-delay:600ms] text-lg px-6 py-6 hover:bg-primary/90 cursor-pointer"
              type="button"
            >
              <span>Transform your website into a 24/7 sales team</span>
              <ArrowRight
                size={20}
                className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
              />
            </Button>
          </Link>
        </div>

        <div className="mt-12 w-full max-w-[600px] mx-auto rounded-xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm p-4">
          <img 
            src="/images/textwidget_wecreate.png"
            alt="Text Widget Demo"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </section>
  );

  // Desktop Component (your current working version)
  // MOBILE TO BE SAME AS DESKTOP
  const DesktopHero = () => (
    <section className="relative mx-auto px-4 sm:px-6 text-center md:px-8 max-w-[100rem] hidden sm:block">
      <div className="min-h-[65vh] flex flex-col items-center justify-center py-16">
        {/* <div className="inline-flex h-7 items-center justify-between rounded-full border bg-secondary text-secondary-foreground px-3 text-xs transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in">
          <TextShimmer className="inline-flex items-center justify-center">
            <span className="text-xs text-secondary-foreground/60">
              ✨ Forms, a new way to collect info from callers
            </span>
          </TextShimmer>
        </div> */}
        
        <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-8 text-center text-5xl font-medium font-heading leading-tight tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground">
          <span className="whitespace-nowrap">Purpose Built AI Agents To</span>{" "}
          <WordRotate
            words={[
              "Drive Conversion",
              "Answer Questions",
              "Engage With Visitors",
              "Book Appointments",
              "Get User Feedback"
            ]}
          />
        </h1>

        <p className="mb-16 text-lg tracking-tight text-muted-foreground md:text-xl lg:text-2xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-3xl mx-auto">
          Easily deploy AI agents to assist with prospecting, appointment booking,
          customer service, and more
        </p>

        <Link 
          href="https://calendly.com/michael-flowon/30min" 
          className="inline-block relative z-20"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>Start handling customer calls automatically</Button>
        </Link>
      </div>
    </section>
  );

  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
}