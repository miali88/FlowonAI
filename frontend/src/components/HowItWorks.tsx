'use client';

import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { Settings, PhoneCall, CheckSquare, MessageSquare } from "lucide-react";
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Define the timeline data structure
interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export function HowItWorks() {
  const t = useTranslations('howItWorks');
  
  // Create timeline data
  const timelineData: TimelineEntry[] = [
    {
      title: t('step1.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <Settings className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 1: {t('step1.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step1.description')}
          </p>
        </div>
      ),
    },
    {
      title: t('step2.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <PhoneCall className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 2: {t('step2.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step2.description')}
          </p>
        </div>
      ),
    },
    {
      title: t('step3.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <CheckSquare className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 3: {t('step3.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step3.description')}
          </p>
        </div>
      ),
    },
    {
      title: t('step4.title'),
      content: (
        <div className="bg-black/10 backdrop-filter backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-10">
          <div className="flex items-center mb-2">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold">Step 4: {t('step4.title')}</h3>
          </div>
          <p className="text-muted-foreground">
            {t('step4.description')}
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background/50 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            {t('sectionTitle')}
          </h2>
          <p className="max-w-[85%] md:max-w-[65%] text-muted-foreground text-lg md:text-xl">
            Powerful, yet super easy to set up and get started in minutes.
          </p>
        </div>

        {/* Timeline section - now full-width and centered */}
        <div className="w-full max-w-5xl mx-auto">
          <Timeline data={timelineData} />
        </div>

      </div>
    </section>
  );
} 