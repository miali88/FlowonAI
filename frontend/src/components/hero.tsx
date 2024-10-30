'use client';

import { ArrowRight } from "lucide-react";
import ChatBotMini from "@/app/dashboard/AgentHub/ChatBotMini";
import { useState } from "react";

import { TextShimmer } from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/magicui/particles";
import { BentoDemo } from "@/components/AgentDemo";
import WordRotate from "@/components/ui/word-rotate";

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
    <section className="relative mx-auto px-4 sm:px-6 text-center md:px-8 max-w-[80rem]">
      {/* Top content group - This should take up the full viewport */}
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="inline-flex h-7 items-center justify-between rounded-full border bg-secondary text-secondary-foreground px-3 text-xs transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-1rem] animate-fade-in">
          <TextShimmer className="inline-flex items-center justify-center">
            <span className="text-xs text-secondary-foreground/60">
              ✨ Forms, a new way to collect info from callers
            </span>
          </TextShimmer>
        </div>
        <h1 className="bg-gradient-to-br from-foreground from-30% to-foreground/40 bg-clip-text py-8 text-center text-6xl font-medium font-heading leading-none tracking-tighter text-transparent text-balance sm:text-7xl md:text-8xl lg:text-9xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] caret-foreground">
          <span className="whitespace-nowrap">Give Your Website a Voice That</span>{" "}
          <WordRotate
            words={[
              "Converts",
              "Answers  Questions",
              "Engages  With  Visitors",
              "Books  Appointments"
            ]}
          />
        </h1>
        <p className="mb-16 text-xl tracking-tight text-muted-foreground md:text-2xl text-balance translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms] max-w-2xl mx-auto">
          Easily deploy AI agents to your website to assist with prospecting, appointment booking,
          customer service, and more
          <br />
        </p>
        <Button 
          className="translate-y-[-1rem] animate-fade-in gap-1 rounded-lg opacity-0 ease-in-out [--animation-delay:600ms] text-lg px-6 py-6"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_API_BASE_URL}/dashboard` || '/dashboard'}
        >
          <span>Build Your AI Agent</span>
          <ArrowRight
            size={20}
            className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
          />
        </Button>
      </div>

      {/* Demo section - Adjusted to be more visible when scrolling */}
      <div className="min-h-[80vh] pt-14 animate-fade-up opacity-0 [--animation-delay:400ms]">
        <div className="flex flex-row items-stretch justify-center">
          {/* Enhanced glow effects */}
          <div className="absolute inset-[-500px] -z-10">
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
          
          {/* Glass container with enhanced inner glow */}
          <div className="flex rounded-3xl border border-white/10 bg-black/20 relative overflow-hidden backdrop-blur-md">
            {/* Inner glow effect */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
              <div className="absolute inset-0 bg-gradient-radial from-white/[0.08] via-transparent to-transparent" />
            </div>
            
            {/* Content containers */}
            <div className="w-[500px] p-5 relative">
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
            <div className="w-[400px] p-5 relative">
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
