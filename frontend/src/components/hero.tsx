'use client';

import { ArrowRight } from "lucide-react";
import ChatBotMini from "@/app/dashboard/AgentHub/ChatBotMini";
import { useState } from "react";
import Link from "next/link";

import { TextShimmer } from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/magicui/particles";
import { BentoDemo } from "@/components/AgentDemo";
import WordRotate from "@/components/ui/word-rotate";
import { OnboardingButton } from './OnboardingButton';

export function Hero() {
  // Add state management for ChatBotMini
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLiveKitActive, setIsLiveKitActive] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatTitle, setChatTitle] = useState("Flowon");

  const handleGridClick = (title: string) => {
    setChatTitle(title);
    // Reset streaming states when switching agents
    if (isStreaming) {
      setIsStreaming(false);
      setIsLiveKitActive(false);
      setToken(null);
      setUrl(null);
    }
  };

  const handleStreamEnd = () => {
    setIsStreaming(false);
    setIsLiveKitActive(false);
    setToken(null);
    setUrl(null);
  };

  const handleStreamStart = () => {
    // Add any stream start logic if needed
  };

  return (
    <section className="relative mx-auto px-4 sm:px-6 text-center md:px-8 max-w-[100rem]">
      {/* Top content group - increased spacing and sizing */}
      <div className="min-h-[100dvh] flex flex-col items-center justify-center py-16 sm:py-20">
        <div className="inline-flex h-10 items-center justify-between rounded-full border bg-secondary text-secondary-foreground px-4 text-sm transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in mb-8">
          <TextShimmer className="inline-flex items-center justify-center">
            <span className="text-sm text-secondary-foreground/60">
              ✨ Forms, a new way to collect info from callers
            </span>
          </TextShimmer>
        </div>
        
        {/* Increased heading size */}
        <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-6 sm:py-10 text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-medium font-heading leading-tight tracking-tighter text-transparent translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground max-w-[90vw] sm:max-w-[95vw]">
          <span className="whitespace-normal sm:whitespace-nowrap">Give Your Website a Voice That</span>{" "}
          <WordRotate
            words={[
              "Converts",
              "Answers Questions",
              "Engages With Visitors",
              "Books Appointments"
            ]}
          />
        </h1>

        {/* Increased paragraph size and spacing */}
        <p className="mb-12 sm:mb-20 text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight text-muted-foreground text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-4xl mx-auto px-4">
          Easily deploy AI agents to your website to assist with prospecting, appointment booking,
          customer service, and more
        </p>

        {/* Made button larger */}
        <div className="scale-110 sm:scale-125">
          <OnboardingButton />
        </div>
      </div>

      {/* Demo section - increased height */}
      <div className="min-h-[90vh] pt-10 sm:pt-16 animate-fade-up opacity-0 [--animation-delay:400ms] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch justify-center">
          {/* Adjusted glow effects */}
          <div className="absolute inset-0 -z-10">
            {/* Primary glow */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-radial from-purple-500/50 via-purple-500/20 to-transparent blur-[120px] animate-glow" />
              <div className="absolute inset-0 bg-gradient-radial from-blue-500/50 via-blue-500/20 to-transparent blur-[120px] animate-pulse-slow delay-150" />
            </div>
            
            {/* Secondary subtle glows */}
            <div className="absolute inset-0 opacity-60">
              <div className="absolute inset-0 bg-gradient-radial from-indigo-500/30 via-transparent to-transparent blur-[100px] animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-radial from-cyan-500/30 via-transparent to-transparent blur-[100px] animate-glow delay-300" />
            </div>
          </div>
          
          {/* Adjusted glass container for mobile */}
          <div className="flex flex-col sm:flex-row rounded-3xl border border-white/10 bg-black/20 relative overflow-hidden backdrop-blur-md">
            {/* Inner glow effect */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
              <div className="absolute inset-0 bg-gradient-radial from-white/[0.08] via-transparent to-transparent" />
            </div>
            
            {/* Adjusted content containers for mobile */}
            <div className="w-full sm:w-[500px] p-3 sm:p-5 relative">
              <ChatBotMini
                title={chatTitle}
                agentId="e8b64819-7c2c-432f-9f80-05a72bd49787"
                isStreaming={isStreaming}
                setIsStreaming={setIsStreaming}
                isLiveKitActive={isLiveKitActive}
                setIsLiveKitActive={setIsLiveKitActive}
                token={token}
                setToken={setToken}
                url={url}
                setUrl={setUrl}
                isConnecting={isConnecting}
                setIsConnecting={setIsConnecting}
                onStreamEnd={handleStreamEnd}
                onStreamStart={handleStreamStart}
                bypassShowChatInputCondition={false}
              />
            </div>
            <div className="w-full sm:w-[400px] p-3 sm:p-5 relative">
              <BentoDemo onAgentSelect={handleGridClick} />
            </div>
          </div>
        </div>
      </div>

      <Particles
        ease={70}
        size={0.05}
        color="#ffffff"
        quantity={250}
        staticity={40}
        className="absolute inset-0 -z-10 h-full"
      />
    </section>
  );
}
