'use client';

import { useState } from "react";
import { TextShimmer } from "@/components/magicui/text-shimmer";
import { BentoDemo } from "@/components/AgentDemo";
import WordRotate from "@/components/ui/word-rotate";
import { OnboardingButton } from './OnboardingButton';

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
      {/* <div className="min-h-[100dvh] flex flex-col items-center justify-center py-8">
        <div className="inline-flex h-10 items-center justify-between rounded-full border bg-secondary text-secondary-foreground px-4 text-sm transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in mb-6">
          <TextShimmer className="inline-flex items-center justify-center">
            <span className="text-sm text-secondary-foreground/60">
              ✨ Forms, a new way to collect info from callers
            </span>
          </TextShimmer>
        </div>
        
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
          <OnboardingButton />
        </div>
      </div> */}

      {/* <div className="min-h-[70vh] pt-6 animate-fade-up opacity-0 [--animation-delay:400ms] relative overflow-hidden">
        <div className="flex flex-col items-stretch justify-center">
          <div className="flex flex-col rounded-3xl border border-white/10 bg-black/20 relative overflow-hidden backdrop-blur-md min-h-[700px]">
            <div className="w-full p-3 relative">
            </div>
            <div className="w-full p-3 relative">
              <BentoDemo onAgentSelect={handleGridClick} />
            </div>
          </div>
        </div>
      </div> */}
    </section>
  );

  // Desktop Component (your current working version)
  const DesktopHero = () => (
    <section className="relative mx-auto px-4 sm:px-6 text-center md:px-8 max-w-[100rem] hidden sm:block">
      <div className="h-screen flex flex-col items-center justify-center">
        {/* <div className="inline-flex h-7 items-center justify-between rounded-full border bg-secondary text-secondary-foreground px-3 text-xs transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in">
          <TextShimmer className="inline-flex items-center justify-center">
            <span className="text-xs text-secondary-foreground/60">
              ✨ Forms, a new way to collect info from callers
            </span>
          </TextShimmer>
        </div> */}
        
        <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-8 text-center text-5xl font-medium font-heading leading-tight tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground">
          <span className="whitespace-nowrap">Give Your Website A Voice That</span>{" "}
          <WordRotate
            words={[
              "Drives Conversion",
              "Answers Questions",
              "Engages With Visitors",
              "Books Appointments",
              "Onboards Users"
            ]}
          />
        </h1>

        <p className="mb-16 text-lg tracking-tight text-muted-foreground md:text-xl lg:text-2xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-3xl mx-auto">
          Easily deploy AI agents to your website to assist with prospecting, appointment booking,
          customer service, and more
        </p>

        <OnboardingButton />
      </div>

      {/* <div className="min-h-[80vh] pt-14 animate-fade-up opacity-0 [--animation-delay:400ms] relative overflow-hidden">
        <div className="flex flex-row items-stretch justify-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-radial from-purple-500/50 via-purple-500/20 to-transparent blur-[120px] animate-glow" />
              <div className="absolute inset-0 bg-gradient-radial from-blue-500/50 via-blue-500/20 to-transparent blur-[120px] animate-pulse-slow delay-150" />
            </div>
            
            <div className="absolute inset-0 opacity-60">
              <div className="absolute inset-0 bg-gradient-radial from-indigo-500/30 via-transparent to-transparent blur-[100px] animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-radial from-cyan-500/30 via-transparent to-transparent blur-[100px] animate-glow delay-300" />
            </div>
          </div>
          
          <div className="flex rounded-3xl border border-white/10 bg-black/20 relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
              <div className="absolute inset-0 bg-gradient-radial from-white/[0.08] via-transparent to-transparent" />
            </div>
            
            <div className="w-[600px] p-5 relative">
            </div>
            <div className="w-[500px] p-5 relative">
              <BentoDemo onAgentSelect={handleGridClick} />
            </div>
          </div>
        </div>
      </div> */}
    </section>
  );

  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
}