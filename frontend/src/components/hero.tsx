'use client';

import { useState, memo } from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from "lucide-react";

// Memoize the rotating words since they never change
const ROTATING_WORDS = memo(() => (
  <FlipWords
    words={[
      "Know Your Business",
      "Automate Grunt Work",
      "Help Scale Your Business",
    ]}
    className="inline-block"
    duration={2}
  />
));
ROTATING_WORDS.displayName = 'RotatingWords';

// Shared button component
const CallToActionButton = () => (
  <Link 
    href="https://calendly.com/michael-flowon/30min" 
    className="inline-block relative z-20 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Button size="lg" className="text-lg sm:px-8 sm:py-6 px-6 py-4 sm:text-lg text-base group">
      Book a free strategy call
      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
    </Button>
  </Link>
);

// First, let's add a keyframe animation at the top of the file
const MobileHero = memo(() => (
  <section className="relative mx-auto px-4 text-center max-w-[100rem] sm:hidden 
    before:content-[''] before:absolute before:w-[30rem] before:h-[10rem] before:rounded-full before:bg-[#ff69b440] before:blur-3xl before:-z-10 before:animate-blob before:top-[20%] before:left-[10%]
    after:content-[''] after:absolute after:w-[30rem] after:h-[10rem] after:rounded-full after:bg-[#4ea8de40] after:blur-3xl after:-z-10 after:animate-blob after:animation-delay-2000 after:top-[30%] after:right-[10%]">
    <div className="min-h-[50dvh] flex flex-col items-center justify-start pt-8 pb-32">
      <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-1 text-4xl font-medium font-heading leading-[1.1] tracking-tighter text-transparent translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground max-w-[95vw]">
        <div className="whitespace-nowrap">Purpose Built AI Agents That</div>
        <div className="relative whitespace-nowrap mt-2">
          <ROTATING_WORDS />
        </div>
      </h1>

      <p className="mb-2 text-sm tracking-tight text-muted-foreground text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-[90vw] mx-auto px-2">
        Easily deploy AI agents to assist with your business workflows, including prospecting, customer service,
        appointment booking, and more
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
  <section className="relative mx-auto p  x-4 sm:px-6 text-center md:px-8 max-w-[100rem] hidden sm:block
    before:content-[''] before:absolute before:w-[40rem] before:h-[40rem] before:rounded-full before:bg-[#ff69b440] before:blur-3xl before:-z-10 before:animate-blob before:top-[-15%] before:left-[10%]
    after:content-[''] after:absolute after:w-[40rem] after:h-[40rem] after:rounded-full after:bg-[#4ea8de40] after:blur-3xl after:-z-10 after:animate-blob after:animation-delay-2000 after:top-[20%] after:right-[10%]">
    <div className="min-h-[65vh] flex flex-col items-center justify-center py-16">
      <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-8 text-center text-5xl font-medium font-heading leading-tight tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground">
        <div className="whitespace-nowrap">Purpose Built AI Agents That</div>
        <div className="relative whitespace-nowrap mt-2">
          <ROTATING_WORDS />
        </div>
      </h1>

      <p className="mb-16 text-lg tracking-tight text-muted-foreground md:text-xl lg:text-2xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-3xl mx-auto">
      Easily deploy AI agents to assist with your business workflows, including prospecting, customer service,
      appointment booking, and more
      </p>

      <div className="scale-100 mt-8">
        <CallToActionButton />
      </div>
    </div>
  </section>
));
DesktopHero.displayName = 'DesktopHero';

export function Hero() {
  // State is only used for streaming control
  const [isStreaming, setIsStreaming] = useState(false);

  const handleGridClick = () => {
    if (isStreaming) {
      setIsStreaming(false);
    }
  };

  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
}