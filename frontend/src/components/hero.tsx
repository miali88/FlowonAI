'use client';

import { useState, memo } from "react";
import WordRotate from "@/components/ui/word-rotate";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Memoize the rotating words since they never change
const ROTATING_WORDS = memo(() => (
  <WordRotate
    words={[
      "Know Your Business",
      "Know Your Industry",
      "Draft Documents",
      "Answer Questions",
      "Automate Tasks",
      "Drive Conversion",
      "Handle Enquiries",
      "Book Appointments",
    ]}
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
    <Button size="lg" className="text-lg px-8 py-6">Join the future of work</Button>
  </Link>
);

// First, let's add a keyframe animation at the top of the file
const MobileHero = memo(() => (
  <section className="relative mx-auto px-4 text-center max-w-[100rem] sm:hidden 
    before:content-[''] before:absolute before:w-[30rem] before:h-[30rem] before:rounded-full before:bg-[#ff69b440] before:blur-3xl before:-z-10 before:animate-blob before:top-[-10%] before:left-[-10%]
    after:content-[''] after:absolute after:w-[30rem] after:h-[30rem] after:rounded-full after:bg-[#4ea8de40] after:blur-3xl after:-z-10 after:animate-blob after:animation-delay-2000 after:bottom-[-10%] after:right-[-10%]">
    <div className="min-h-[100dvh] pt-20 flex flex-col items-center justify-center">
      <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-4 text-4xl font-medium font-heading leading-[1.1] tracking-tighter text-transparent translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground max-w-[95vw]">
        <span className="whitespace-normal">Purpose Built AI Agents That</span>{" "}
        <ROTATING_WORDS />
      </h1>

      <p className="mb-8 text-sm tracking-tight text-muted-foreground text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-[90vw] mx-auto px-2">
        Easily deploy AI agents to assist with your business workflows, including prospecting, customer service,
        appointment booking, and more
      </p>

      <div className="scale-100">
        <CallToActionButton />
      </div> 

      <div className="mt-12 w-full max-w-[600px] mx-auto rounded-xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm p-4 sm:hidden">
        <Image 
          src="/images/textwidget_wecreate.png"
          alt="Text Widget Demo"
          width={600}
          height={400}
          className="w-full h-auto rounded-lg"
          priority
        />
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
        <span className="whitespace-nowrap">Purpose Built AI Agents That</span>{" "}
        <ROTATING_WORDS />
      </h1>

      <p className="mb-16 text-lg tracking-tight text-muted-foreground md:text-xl lg:text-2xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-3xl mx-auto">
      Easily deploy AI agents to assist with your business workflows, including prospecting, customer service,
      appointment booking, and more
      </p>

      <div className="scale-100">
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